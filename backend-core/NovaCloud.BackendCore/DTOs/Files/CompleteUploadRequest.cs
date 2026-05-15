namespace NovaCloud.BackendCore.DTOs.Files;

public sealed class CompleteUploadRequest
{
    public string FileId { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string S3Key { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long SizeBytes { get; init; }
    public List<string>? Tags { get; init; }
}
