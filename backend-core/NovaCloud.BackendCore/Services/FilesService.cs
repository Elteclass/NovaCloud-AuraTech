using System.Globalization;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.S3;
using Amazon.S3.Model;
using NovaCloud.BackendCore.DTOs.Files;

namespace NovaCloud.BackendCore.Services;

public sealed class FilesService : IFilesService
{
    private const string TableName = "FileMetadata";
    private const long TotalBytesPerUser = 10_737_418_240;
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;

    public FilesService(IAmazonDynamoDB dynamoDb, IAmazonS3 s3, IConfiguration configuration)
    {
        _dynamoDb = dynamoDb;
        _s3 = s3;
        _bucketName = configuration["AWS:BucketName"]
            ?? throw new InvalidOperationException("Missing AWS configuration. Ensure AWS__BucketName is set.");
    }

    public async Task<List<FileResponse>> ListFilesAsync(string userId, string? filter, string? tag)
    {
        var normalizedFilter = filter?.Trim().ToLowerInvariant();
        var normalizedTag = NormalizeTag(tag);
        var status = normalizedFilter == "trash" ? "TRASHED" : "ACTIVE";

        var expressionParts = new List<string>
        {
            "#userId = :userId",
            "#status = :status"
        };
        var expressionNames = new Dictionary<string, string>
        {
            ["#userId"] = "userId",
            ["#status"] = "status"
        };
        var expressionValues = new Dictionary<string, AttributeValue>
        {
            [":userId"] = new AttributeValue { S = userId },
            [":status"] = new AttributeValue { S = status }
        };

        if (normalizedFilter == "starred")
        {
            expressionNames["#isStarred"] = "isStarred";
            expressionValues[":isStarred"] = new AttributeValue { BOOL = true };
            expressionParts.Add("#isStarred = :isStarred");
        }

        if (!string.IsNullOrWhiteSpace(normalizedTag))
        {
            expressionNames["#tags"] = "tags";
            expressionValues[":tag"] = new AttributeValue { S = normalizedTag };
            expressionParts.Add("contains(#tags, :tag)");
        }

        var scanRequest = new ScanRequest
        {
            TableName = TableName,
            FilterExpression = string.Join(" AND ", expressionParts),
            ExpressionAttributeNames = expressionNames,
            ExpressionAttributeValues = expressionValues
        };

        var items = await ScanAllAsync(scanRequest);
        var files = items.Select(MapToResponse).ToList();
        var ordered = files
            .OrderByDescending(file => ParseUploadedAt(file.UploadedAt))
            .ToList();

        return normalizedFilter == "recent"
            ? ordered.Take(20).ToList()
            : ordered;
    }

    public async Task<FileResponse?> GetFileByIdAsync(string userId, string id)
    {
        var item = await GetItemAsync(id);
        if (item is null || !IsOwnedByUser(item, userId))
        {
            return null;
        }

        return MapToResponse(item);
    }

    public async Task<string> GetDownloadUrlAsync(string userId, string id)
    {
        var item = await GetItemOrThrowAsync(userId, id);
        var status = GetString(item, "status");

        if (string.Equals(status, "DELETED", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("File is deleted.");
        }

        var s3Key = GetString(item, "s3Key");
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = BuildS3Key(userId, s3Key),
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddMinutes(15)
        };

        return _s3.GetPreSignedURL(request);
    }

    public async Task<FileResponse> RenameFileAsync(string userId, string id, string newName)
    {
        return await UpdateFileAsync(userId, id, new UpdateItemRequest
        {
            TableName = TableName,
            Key = new Dictionary<string, AttributeValue> { ["id"] = new AttributeValue { S = id } },
            UpdateExpression = "SET #name = :name",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#name"] = "name",
                ["#userId"] = "userId"
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":name"] = new AttributeValue { S = newName },
                [":userId"] = new AttributeValue { S = userId }
            },
            ConditionExpression = "#userId = :userId",
            ReturnValues = "ALL_NEW"
        });
    }

    public async Task<FileResponse> StarFileAsync(string userId, string id)
    {
        var item = await GetItemOrThrowAsync(userId, id);
        var current = GetBool(item, "isStarred");
        var next = !current;

        return await UpdateFileAsync(userId, id, new UpdateItemRequest
        {
            TableName = TableName,
            Key = new Dictionary<string, AttributeValue> { ["id"] = new AttributeValue { S = id } },
            UpdateExpression = "SET #isStarred = :isStarred",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#isStarred"] = "isStarred",
                ["#userId"] = "userId"
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":isStarred"] = new AttributeValue { BOOL = next },
                [":userId"] = new AttributeValue { S = userId }
            },
            ConditionExpression = "#userId = :userId",
            ReturnValues = "ALL_NEW"
        });
    }

    public async Task<FileResponse> TrashFileAsync(string userId, string id)
    {
        var trashedAt = DateTime.UtcNow.ToString("O", CultureInfo.InvariantCulture);

        return await UpdateFileAsync(userId, id, new UpdateItemRequest
        {
            TableName = TableName,
            Key = new Dictionary<string, AttributeValue> { ["id"] = new AttributeValue { S = id } },
            UpdateExpression = "SET #status = :status, #trashedAt = :trashedAt",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#status"] = "status",
                ["#trashedAt"] = "trashedAt",
                ["#userId"] = "userId"
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":status"] = new AttributeValue { S = "TRASHED" },
                [":trashedAt"] = new AttributeValue { S = trashedAt },
                [":userId"] = new AttributeValue { S = userId }
            },
            ConditionExpression = "#userId = :userId",
            ReturnValues = "ALL_NEW"
        });
    }

    public async Task<FileResponse> RestoreFileAsync(string userId, string id)
    {
        return await UpdateFileAsync(userId, id, new UpdateItemRequest
        {
            TableName = TableName,
            Key = new Dictionary<string, AttributeValue> { ["id"] = new AttributeValue { S = id } },
            UpdateExpression = "SET #status = :status REMOVE #trashedAt",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#status"] = "status",
                ["#trashedAt"] = "trashedAt",
                ["#userId"] = "userId"
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":status"] = new AttributeValue { S = "ACTIVE" },
                [":userId"] = new AttributeValue { S = userId }
            },
            ConditionExpression = "#userId = :userId",
            ReturnValues = "ALL_NEW"
        });
    }

    public async Task DeleteFileAsync(string userId, string id)
    {
        var item = await GetItemOrThrowAsync(userId, id);
        var s3Key = GetString(item, "s3Key");

        await _s3.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = BuildS3Key(userId, s3Key)
        });

        await _dynamoDb.DeleteItemAsync(new DeleteItemRequest
        {
            TableName = TableName,
            Key = new Dictionary<string, AttributeValue> { ["id"] = new AttributeValue { S = id } },
            ConditionExpression = "#userId = :userId",
            ExpressionAttributeNames = new Dictionary<string, string> { ["#userId"] = "userId" },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":userId"] = new AttributeValue { S = userId }
            }
        });
    }

    public async Task<StorageUsageResponse> GetStorageUsageAsync(string userId)
    {
        var scanRequest = new ScanRequest
        {
            TableName = TableName,
            FilterExpression = "#userId = :userId AND #status <> :deleted",
            ExpressionAttributeNames = new Dictionary<string, string>
            {
                ["#userId"] = "userId",
                ["#status"] = "status"
            },
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":userId"] = new AttributeValue { S = userId },
                [":deleted"] = new AttributeValue { S = "DELETED" }
            }
        };

        var items = await ScanAllAsync(scanRequest);
        var usedBytes = items.Sum(item => GetLong(item, "sizeBytes"));
        var percentage = TotalBytesPerUser == 0
            ? 0
            : Math.Round(usedBytes / (double)TotalBytesPerUser * 100, 2);

        return new StorageUsageResponse
        {
            UsedBytes = usedBytes,
            UsedReadable = FormatBytes(usedBytes),
            TotalBytes = TotalBytesPerUser,
            TotalReadable = FormatBytes(TotalBytesPerUser),
            Percentage = percentage
        };
    }

    private async Task<Dictionary<string, AttributeValue>?> GetItemAsync(string id)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = TableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["id"] = new AttributeValue { S = id }
            }
        });

        return response.Item.Count == 0 ? null : response.Item;
    }

    private async Task<Dictionary<string, AttributeValue>> GetItemOrThrowAsync(string userId, string id)
    {
        var item = await GetItemAsync(id);
        if (item is null || !IsOwnedByUser(item, userId))
        {
            throw new KeyNotFoundException("File not found.");
        }

        return item;
    }

    private async Task<FileResponse> UpdateFileAsync(string userId, string id, UpdateItemRequest request)
    {
        try
        {
            var response = await _dynamoDb.UpdateItemAsync(request);
            return MapToResponse(response.Attributes);
        }
        catch (ConditionalCheckFailedException)
        {
            throw new KeyNotFoundException("File not found.");
        }
    }

    private static bool IsOwnedByUser(Dictionary<string, AttributeValue> item, string userId)
    {
        return string.Equals(GetString(item, "userId"), userId, StringComparison.Ordinal);
    }

    private static string NormalizeTag(string? tag)
    {
        if (string.IsNullOrWhiteSpace(tag))
        {
            return string.Empty;
        }

        return tag.Trim().TrimStart('#');
    }

    private static DateTime ParseUploadedAt(string value)
    {
        return DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var parsed)
            ? parsed
            : DateTime.MinValue;
    }

    private static string BuildS3Key(string userId, string s3Key)
    {
        return string.IsNullOrWhiteSpace(s3Key) ? userId : $"{userId}/{s3Key}";
    }

    private static FileResponse MapToResponse(Dictionary<string, AttributeValue> item)
    {
        var name = GetString(item, "name");
        var sizeBytes = GetLong(item, "sizeBytes");

        return new FileResponse
        {
            Id = GetString(item, "id"),
            Name = name,
            Size = FormatBytes(sizeBytes),
            Type = GetFileType(name),
            ContentType = GetString(item, "contentType"),
            Tags = GetStringList(item, "tags"),
            IsStarred = GetBool(item, "isStarred"),
            Status = GetString(item, "status"),
            UploadedAt = GetString(item, "uploadedAt"),
            TrashedAt = GetNullableString(item, "trashedAt")
        };
    }

    private static string GetFileType(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        return string.IsNullOrWhiteSpace(extension)
            ? "unknown"
            : extension.TrimStart('.').ToLowerInvariant();
    }

    private static string FormatBytes(long bytes)
    {
        string[] units = ["B", "KB", "MB", "GB", "TB"];
        double size = bytes;
        var unitIndex = 0;

        while (size >= 1024 && unitIndex < units.Length - 1)
        {
            size /= 1024;
            unitIndex++;
        }

        return string.Format(CultureInfo.InvariantCulture, "{0:0.0} {1}", size, units[unitIndex]);
    }

    private static string GetString(Dictionary<string, AttributeValue> item, string key)
    {
        return item.TryGetValue(key, out var value) ? value.S ?? string.Empty : string.Empty;
    }

    private static string? GetNullableString(Dictionary<string, AttributeValue> item, string key)
    {
        return item.TryGetValue(key, out var value) ? value.S : null;
    }

    private static long GetLong(Dictionary<string, AttributeValue> item, string key)
    {
        return item.TryGetValue(key, out var value) && long.TryParse(value.N, out var parsed)
            ? parsed
            : 0;
    }

    private static bool GetBool(Dictionary<string, AttributeValue> item, string key)
    {
        return item.TryGetValue(key, out var value) && value.BOOL == true;
    }

    private static List<string> GetStringList(Dictionary<string, AttributeValue> item, string key)
    {
        if (!item.TryGetValue(key, out var value))
        {
            return new List<string>();
        }

        if (value.L is { Count: > 0 })
        {
            return value.L.Select(entry => entry.S ?? string.Empty).Where(entry => !string.IsNullOrWhiteSpace(entry)).ToList();
        }

        if (value.SS is { Count: > 0 })
        {
            return value.SS.ToList();
        }

        return new List<string>();
    }

    private async Task<List<Dictionary<string, AttributeValue>>> ScanAllAsync(ScanRequest request)
    {
        var items = new List<Dictionary<string, AttributeValue>>();
        Dictionary<string, AttributeValue>? lastKey = null;

        do
        {
            request.ExclusiveStartKey = lastKey;
            var response = await _dynamoDb.ScanAsync(request);
            items.AddRange(response.Items);
            lastKey = response.LastEvaluatedKey;
        } while (lastKey is { Count: > 0 });

        return items;
    }
}
