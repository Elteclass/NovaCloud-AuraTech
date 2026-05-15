using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using NovaCloud.BackendCore.DTOs.Files;
using System.Security.Claims;

namespace NovaCloud.BackendCore.Services;

public sealed class FileService : IFileService
{
    private readonly string? _bucketName;
    private readonly RegionEndpoint? _region;
    private const int PresignedUrlExpirationMinutes = 60;

    public FileService(IConfiguration configuration)
    {
        _bucketName = configuration["AWS:BucketName"];
        var regionName = configuration["AWS:Region"];
        _region = string.IsNullOrWhiteSpace(regionName)
            ? null
            : RegionEndpoint.GetBySystemName(regionName);
    }

    public async Task<IEnumerable<FileResponse>> ListAsync(
        string? filter = null,
        string? tag = null,
        ClaimsPrincipal? user = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);
        var request = new ListObjectsV2Request { BucketName = _bucketName };
        var files = new List<FileResponse>();

        ListObjectsV2Response? response;
        do
        {
            response = await s3.ListObjectsV2Async(request, cancellationToken);

            foreach (var obj in response.S3Objects)
            {
                // Get object tagging
                var tagsResponse = await s3.GetObjectTaggingAsync(
                    new GetObjectTaggingRequest { BucketName = _bucketName, Key = obj.Key },
                    cancellationToken);

                var tags = tagsResponse.Tagging.ToDictionary(t => t.Key, t => t.Value);

                // Filter by owner (if user provided)
                if (user != null)
                {
                    var ownerClaim = user.FindFirst("sub")?.Value;
                    if (!string.IsNullOrWhiteSpace(ownerClaim) && tags.TryGetValue("owner", out var owner))
                    {
                        if (owner != ownerClaim)
                            continue;
                    }
                }

                // Filter by trash status
                var inTrash = tags.ContainsKey("status") && tags["status"] == "trash";
                if (filter == "trash" && !inTrash)
                    continue;
                if (filter != "trash" && inTrash)
                    continue;

                // Filter by starred status
                var starred = tags.ContainsKey("starred") && tags["starred"] == "true";
                if (filter == "starred" && !starred)
                    continue;

                // Filter by tag
                if (!string.IsNullOrWhiteSpace(tag))
                {
                    if (!tags.ContainsKey("tags") || !tags["tags"].Split(',').Contains(tag, StringComparer.OrdinalIgnoreCase))
                        continue;
                }

                var fileType = GetFileType(obj.Key);
                var customTags = tags.ContainsKey("tags")
                    ? tags["tags"].Split(',').ToList()
                    : new List<string>();

                files.Add(new FileResponse
                {
                    Id = obj.Key,
                    Name = Path.GetFileName(obj.Key),
                    SizeBytes = obj.Size,
                    Type = fileType,
                    UploadDate = obj.LastModified.ToUniversalTime(),
                    Starred = starred,
                    InTrash = inTrash,
                    Owner = tags.ContainsKey("owner") ? tags["owner"] : null,
                    Tags = customTags
                });
            }

            request.ContinuationToken = response.ContinuationToken;
        } while (response.IsTruncated);

        return files;
    }

    public async Task<FileMetadataResponse> GetAsync(string id, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);

        // Get object metadata
        var headResponse = await s3.GetObjectMetadataAsync(
            new GetObjectMetadataRequest { BucketName = _bucketName, Key = id },
            cancellationToken);

        // Get object tagging
        var tagsResponse = await s3.GetObjectTaggingAsync(
            new GetObjectTaggingRequest { BucketName = _bucketName, Key = id },
            cancellationToken);

        var tags = tagsResponse.Tagging.ToDictionary(t => t.Key, t => t.Value);
        var inTrash = tags.ContainsKey("status") && tags["status"] == "trash";
        var starred = tags.ContainsKey("starred") && tags["starred"] == "true";
        var customTags = tags.ContainsKey("tags")
            ? tags["tags"].Split(',').ToList()
            : new List<string>();

        return new FileMetadataResponse
        {
            Id = id,
            Name = Path.GetFileName(id),
            SizeBytes = headResponse.ContentLength,
            Type = GetFileType(id),
            UploadDate = headResponse.LastModified.ToUniversalTime(),
            LastModified = headResponse.LastModified.ToUniversalTime(),
            Starred = starred,
            InTrash = inTrash,
            Owner = tags.ContainsKey("owner") ? tags["owner"] : null,
            Tags = customTags,
            ContentType = headResponse.Headers.ContentType
        };
    }

    public async Task<string> GetDownloadUrlAsync(
        string id,
        TimeSpan? ttl = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);

        var expiration = ttl ?? TimeSpan.FromMinutes(PresignedUrlExpirationMinutes);
        var preSignedUrl = s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = id,
            Expires = DateTime.UtcNow.Add(expiration),
            Protocol = Protocol.HTTPS
        });

        return preSignedUrl;
    }

    public async Task RenameAsync(string id, string newName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);

        // Build new key preserving directory structure
        var directory = Path.GetDirectoryName(id);
        var newKey = string.IsNullOrEmpty(directory) ? newName : Path.Combine(directory, newName).Replace("\\", "/");

        // Copy object to new key
        await s3.CopyObjectAsync(
            new CopyObjectRequest
            {
                SourceBucket = _bucketName,
                SourceKey = id,
                DestinationBucket = _bucketName,
                DestinationKey = newKey,
                TaggingDirective = TaggingDirective.COPY
            },
            cancellationToken);

        // Delete original object
        await s3.DeleteObjectAsync(
            new DeleteObjectRequest { BucketName = _bucketName, Key = id },
            cancellationToken);
    }

    public async Task StarAsync(string id, bool starred, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);

        // Get current tags
        var tagsResponse = await s3.GetObjectTaggingAsync(
            new GetObjectTaggingRequest { BucketName = _bucketName, Key = id },
            cancellationToken);

        var tags = new List<Tag>(tagsResponse.Tagging);

        // Update or add starred tag
        var starredTag = tags.FirstOrDefault(t => t.Key == "starred");
        if (starredTag != null)
        {
            starredTag.Value = starred ? "true" : "false";
        }
        else
        {
            tags.Add(new Tag { Key = "starred", Value = starred ? "true" : "false" });
        }

        // Put updated tags
        await s3.PutObjectTaggingAsync(
            new PutObjectTaggingRequest
            {
                BucketName = _bucketName,
                Key = id,
                Tagging = new Tagging { TagSet = tags }
            },
            cancellationToken);
    }

    public async Task MoveToTrashAsync(string id, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);

        // Get current tags
        var tagsResponse = await s3.GetObjectTaggingAsync(
            new GetObjectTaggingRequest { BucketName = _bucketName, Key = id },
            cancellationToken);

        var tags = new List<Tag>(tagsResponse.Tagging);

        // Update or add status tag
        var statusTag = tags.FirstOrDefault(t => t.Key == "status");
        if (statusTag != null)
        {
            statusTag.Value = "trash";
        }
        else
        {
            tags.Add(new Tag { Key = "status", Value = "trash" });
        }

        // Put updated tags
        await s3.PutObjectTaggingAsync(
            new PutObjectTaggingRequest
            {
                BucketName = _bucketName,
                Key = id,
                Tagging = new Tagging { TagSet = tags }
            },
            cancellationToken);
    }

    public async Task RestoreAsync(string id, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);

        // Get current tags
        var tagsResponse = await s3.GetObjectTaggingAsync(
            new GetObjectTaggingRequest { BucketName = _bucketName, Key = id },
            cancellationToken);

        var tags = new List<Tag>(tagsResponse.Tagging);

        // Update or remove status tag
        var statusTag = tags.FirstOrDefault(t => t.Key == "status");
        if (statusTag != null)
        {
            statusTag.Value = "active";
        }
        else
        {
            tags.Add(new Tag { Key = "status", Value = "active" });
        }

        // Put updated tags
        await s3.PutObjectTaggingAsync(
            new PutObjectTaggingRequest
            {
                BucketName = _bucketName,
                Key = id,
                Tagging = new Tagging { TagSet = tags }
            },
            cancellationToken);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);

        await s3.DeleteObjectAsync(
            new DeleteObjectRequest { BucketName = _bucketName, Key = id },
            cancellationToken);
    }

    public async Task TagAsync(string id, IDictionary<string, string> newTags, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_bucketName) || _region is null)
            throw new InvalidOperationException("Missing AWS configuration.");

        using var s3 = new AmazonS3Client(_region);

        // Get current tags
        var tagsResponse = await s3.GetObjectTaggingAsync(
            new GetObjectTaggingRequest { BucketName = _bucketName, Key = id },
            cancellationToken);

        var tags = new List<Tag>(tagsResponse.Tagging);

        // Merge new tags
        foreach (var newTag in newTags)
        {
            var existingTag = tags.FirstOrDefault(t => t.Key == newTag.Key);
            if (existingTag != null)
            {
                existingTag.Value = newTag.Value;
            }
            else
            {
                tags.Add(new Tag { Key = newTag.Key, Value = newTag.Value });
            }
        }

        // Put updated tags
        await s3.PutObjectTaggingAsync(
            new PutObjectTaggingRequest
            {
                BucketName = _bucketName,
                Key = id,
                Tagging = new Tagging { TagSet = tags }
            },
            cancellationToken);
    }

    private static string GetFileType(string key)
    {
        var extension = Path.GetExtension(key);
        return string.IsNullOrWhiteSpace(extension)
            ? "unknown"
            : extension.TrimStart('.').ToLowerInvariant();
    }
}
