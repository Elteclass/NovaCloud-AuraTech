using System.Globalization;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.S3;
using Amazon.S3.Model;
using NovaCloud.BackendCore.DTOs.Files;

namespace NovaCloud.BackendCore.Services;

public sealed class UploadsService : IUploadsService
{
    private const string TableName = "FileMetadata";
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;

    public UploadsService(IAmazonDynamoDB dynamoDb, IAmazonS3 s3, IConfiguration configuration)
    {
        _dynamoDb = dynamoDb;
        _s3 = s3;
        _bucketName = configuration["AWS:BucketName"]
            ?? throw new InvalidOperationException("Missing AWS configuration. Ensure AWS__BucketName is set.");
    }

    public Task<PresignResponse> GeneratePresignedUrlAsync(string userId, PresignRequest request)
    {
        var fileId = Guid.NewGuid().ToString();
        var safeFileName = request.FileName.Trim();
        var s3KeyWithoutUserId = $"{fileId}-{safeFileName}";
        var fullKey = $"{userId}/{s3KeyWithoutUserId}";

        var presignRequest = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = fullKey,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(15)
        };

        var uploadUrl = _s3.GetPreSignedURL(presignRequest);

        return Task.FromResult(new PresignResponse
        {
            FileId = fileId,
            UploadUrl = uploadUrl,
            S3Key = fullKey
        });
    }

    public async Task<FileResponse> CompleteUploadAsync(string userId, CompleteUploadRequest request)
    {
        var normalizedS3Key = NormalizeS3Key(userId, request.S3Key);
        var uploadedAt = DateTime.UtcNow.ToString("O", CultureInfo.InvariantCulture);
        var tags = request.Tags?.Select(NormalizeTag).Where(tag => !string.IsNullOrWhiteSpace(tag)).ToList()
            ?? new List<string>();

        var item = new Dictionary<string, AttributeValue>
        {
            ["id"] = new AttributeValue { S = request.FileId },
            ["userId"] = new AttributeValue { S = userId },
            ["s3Key"] = new AttributeValue { S = normalizedS3Key },
            ["name"] = new AttributeValue { S = request.FileName },
            ["sizeBytes"] = new AttributeValue { N = request.SizeBytes.ToString(CultureInfo.InvariantCulture) },
            ["contentType"] = new AttributeValue { S = request.ContentType },
            ["tags"] = new AttributeValue { L = tags.Select(tag => new AttributeValue { S = tag }).ToList() },
            ["isStarred"] = new AttributeValue { BOOL = false },
            ["status"] = new AttributeValue { S = "ACTIVE" },
            ["uploadedAt"] = new AttributeValue { S = uploadedAt },
            ["trashedAt"] = new AttributeValue { NULL = true }
        };

        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = TableName,
            Item = item
        });

        return MapToResponse(item);
    }

    private static string NormalizeS3Key(string userId, string s3Key)
    {
        if (s3Key.StartsWith($"{userId}/", StringComparison.Ordinal))
        {
            return s3Key[(userId.Length + 1)..];
        }

        return s3Key;
    }

    private static string NormalizeTag(string tag)
    {
        return tag.Trim().TrimStart('#');
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
}
