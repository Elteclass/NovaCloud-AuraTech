using System.Globalization;
using System.Text.Json;
using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/metrics")]
public sealed class AdminMetricsController : ControllerBase
{
    private const string TableName = "FileMetadata";
    private readonly IAmazonCognitoIdentityProvider _cognito;
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly string _userPoolId;

    public AdminMetricsController(
        IAmazonCognitoIdentityProvider cognito,
        IAmazonDynamoDB dynamoDb,
        IConfiguration configuration)
    {
        _cognito = cognito;
        _dynamoDb = dynamoDb;
        _userPoolId = configuration["AWS:UserPoolId"]
            ?? throw new InvalidOperationException("Missing AWS:UserPoolId configuration.");
    }

    [HttpGet]
    public async Task<IActionResult> GetMetrics()
    {
        if (!IsAdmin())
        {
            return Forbid();
        }

        var totalUsers = await CountUsersAsync();
        var (totalFiles, storageUsedBytes) = await GetFileStatsAsync();
        var storageUsedReadable = FormatBytes(storageUsedBytes);

        return Ok(new
        {
            totalUsers,
            totalFiles,
            storageUsedBytes,
            storageUsedReadable
        });
    }

    private async Task<int> CountUsersAsync()
    {
        var total = 0;
        string? paginationToken = null;

        do
        {
            var response = await _cognito.ListUsersAsync(new ListUsersRequest
            {
                UserPoolId = _userPoolId,
                PaginationToken = paginationToken
            });

            total += response.Users.Count;
            paginationToken = response.PaginationToken;
        } while (!string.IsNullOrWhiteSpace(paginationToken));

        return total;
    }

    private async Task<(int totalFiles, long storageUsedBytes)> GetFileStatsAsync()
    {
        var totalFiles = 0;
        long storageUsedBytes = 0;
        Dictionary<string, AttributeValue>? lastEvaluatedKey = null;

        do
        {
            var response = await _dynamoDb.ScanAsync(new ScanRequest
            {
                TableName = TableName,
                FilterExpression = "#status <> :deleted",
                ExpressionAttributeNames = new Dictionary<string, string>
                {
                    ["#status"] = "status",
                    ["#sizeBytes"] = "sizeBytes"
                },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":deleted"] = new AttributeValue { S = "DELETED" }
                },
                ProjectionExpression = "#status, #sizeBytes",
                ExclusiveStartKey = lastEvaluatedKey
            });

            foreach (var item in response.Items)
            {
                totalFiles++;
                storageUsedBytes += GetLong(item, "sizeBytes");
            }

            lastEvaluatedKey = response.LastEvaluatedKey;
        } while (lastEvaluatedKey is { Count: > 0 });

        return (totalFiles, storageUsedBytes);
    }

    private bool IsAdmin()
    {
        foreach (var claim in User.Claims.Where(c => c.Type == "cognito:groups"))
        {
            if (ContainsAdminGroup(claim.Value))
            {
                return true;
            }
        }

        return false;
    }

    private static bool ContainsAdminGroup(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var trimmed = value.Trim();
        if (!trimmed.StartsWith("[", StringComparison.Ordinal))
        {
            return string.Equals(trimmed, "admin", StringComparison.OrdinalIgnoreCase);
        }

        try
        {
            using var doc = JsonDocument.Parse(trimmed);
            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                return false;
            }

            foreach (var element in doc.RootElement.EnumerateArray())
            {
                if (element.ValueKind == JsonValueKind.String &&
                    string.Equals(element.GetString(), "admin", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
        }
        catch (JsonException)
        {
            return false;
        }

        return false;
    }

    private static long GetLong(Dictionary<string, AttributeValue> item, string key)
    {
        return item.TryGetValue(key, out var value) && long.TryParse(value.N, out var parsed)
            ? parsed
            : 0;
    }

    private static string FormatBytes(long bytes)
    {
        const double oneKb = 1024;
        const double oneMb = oneKb * 1024;
        const double oneGb = oneMb * 1024;

        if (bytes >= oneGb)
        {
            return string.Format(CultureInfo.InvariantCulture, "{0:F1} GB", bytes / oneGb);
        }

        if (bytes >= oneMb)
        {
            return string.Format(CultureInfo.InvariantCulture, "{0:F1} MB", bytes / oneMb);
        }

        if (bytes >= oneKb)
        {
            return string.Format(CultureInfo.InvariantCulture, "{0:F1} KB", bytes / oneKb);
        }

        return string.Format(CultureInfo.InvariantCulture, "{0} B", bytes);
    }
}
