using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Mvc;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly string? _bucketName;
    private readonly RegionEndpoint? _region;

    public FilesController(IConfiguration configuration)
    {
        _bucketName = configuration["AWS:BucketName"];
        var regionName = configuration["AWS:Region"];
        _region = string.IsNullOrWhiteSpace(regionName)
            ? null
            : RegionEndpoint.GetBySystemName(regionName);
    }

    [HttpGet]
    public async Task<IActionResult> GetFiles(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
        {
            return BadRequest("Missing AWS configuration. Ensure AWS__BucketName and AWS__Region are set.");
        }

        using var s3 = new AmazonS3Client(_region);
        var request = new ListObjectsV2Request
        {
            BucketName = _bucketName
        };

        var response = await s3.ListObjectsV2Async(request, cancellationToken);
        var files = response.S3Objects.Select(obj => new
        {
            name = obj.Key,
            sizeBytes = obj.Size,
            type = GetFileType(obj.Key),
            uploadDate = obj.LastModified.HasValue
                ? obj.LastModified.Value.ToUniversalTime().ToString("O")
                : null
        });

        return Ok(files);
    }

    private static string GetFileType(string key)
    {
        var extension = Path.GetExtension(key);
        return string.IsNullOrWhiteSpace(extension)
            ? "unknown"
            : extension.TrimStart('.').ToLowerInvariant();
    }
}