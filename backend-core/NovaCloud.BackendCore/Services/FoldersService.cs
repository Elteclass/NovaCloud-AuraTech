using System.Globalization;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using NovaCloud.BackendCore.DTOs.Folders;

namespace NovaCloud.BackendCore.Services;

public sealed class FoldersService : IFoldersService
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _tableName;

    public FoldersService(IAmazonDynamoDB dynamoDb, IConfiguration configuration)
    {
        _dynamoDb = dynamoDb;
        _tableName = configuration["AWS:FolderTableName"]
            ?? throw new InvalidOperationException("Missing AWS:FolderTableName configuration.");
    }

    public async Task<List<FolderResponse>> ListFoldersAsync(string userId)
    {
        var results = new List<FolderResponse>();
        Dictionary<string, AttributeValue>? lastEvaluatedKey = null;

        do
        {
            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = _tableName,
                FilterExpression = "#userId = :userId",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#userId"] = "userId"
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":userId"] = new AttributeValue { S = userId }
                },
                ExclusiveStartKey = lastEvaluatedKey
            });

            foreach (var item in response.Items)
            {
                results.Add(MapToResponse(item));
            }

            lastEvaluatedKey = response.LastEvaluatedKey;
        } while (lastEvaluatedKey is { Count: > 0 });

        return results
            .OrderBy(folder => ParseCreatedAt(folder.CreatedAt))
            .ToList();
    }

    public async Task<FolderResponse> CreateFolderAsync(string userId, CreateFolderRequest request)
    {
        var id = Guid.NewGuid().ToString();
        var createdAt = DateTime.UtcNow.ToString("O", CultureInfo.InvariantCulture);

        var item = new Dictionary<string, AttributeValue>
        {
            ["id"] = new AttributeValue { S = id },
            ["userId"] = new AttributeValue { S = userId },
            ["name"] = new AttributeValue { S = request.Name },
            ["createdAt"] = new AttributeValue { S = createdAt }
        };

        await _dynamoDb.PutItemAsync(new PutItemRequest
        {
            TableName = _tableName,
            Item = item
        });

        return new FolderResponse
        {
            Id = id,
            Name = request.Name,
            CreatedAt = createdAt
        };
    }

    public async Task<FolderResponse> RenameFolderAsync(string userId, string id, string newName)
    {
        var existing = await GetItemAsync(id);
        if (existing is null || !IsOwnedByUser(existing, userId))
        {
            throw new ResourceNotFoundException("Folder not found.");
        }

        try
        {
            var response = await _dynamoDb.UpdateItemAsync(new UpdateItemRequest
            {
                TableName = _tableName,
                Key = new Dictionary<string, AttributeValue>
                {
                    ["id"] = new AttributeValue { S = id }
                },
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

            return MapToResponse(response.Attributes);
        }
        catch (ConditionalCheckFailedException)
        {
            throw new ResourceNotFoundException("Folder not found.");
        }
    }

    private async Task<Dictionary<string, AttributeValue>?> GetItemAsync(string id)
    {
        var response = await _dynamoDb.GetItemAsync(new GetItemRequest
        {
            TableName = _tableName,
            Key = new Dictionary<string, AttributeValue>
            {
                ["id"] = new AttributeValue { S = id }
            }
        });

        return response.Item.Count == 0 ? null : response.Item;
    }

    private static bool IsOwnedByUser(Dictionary<string, AttributeValue> item, string userId)
    {
        return string.Equals(GetString(item, "userId"), userId, StringComparison.Ordinal);
    }

    private static FolderResponse MapToResponse(Dictionary<string, AttributeValue> item)
    {
        return new FolderResponse
        {
            Id = GetString(item, "id"),
            Name = GetString(item, "name"),
            CreatedAt = GetString(item, "createdAt")
        };
    }

    private static string GetString(Dictionary<string, AttributeValue> item, string key)
    {
        return item.TryGetValue(key, out var value) ? value.S ?? string.Empty : string.Empty;
    }

    private static DateTime ParseCreatedAt(string value)
    {
        return DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var parsed)
            ? parsed
            : DateTime.MinValue;
    }
}
