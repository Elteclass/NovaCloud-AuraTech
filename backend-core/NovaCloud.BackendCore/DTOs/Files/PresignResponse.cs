namespace NovaCloud.BackendCore.DTOs.Files;

public sealed class PresignResponse
{
    public string FileId { get; init; } = string.Empty;
    public string UploadUrl { get; init; } = string.Empty;
    public string S3Key { get; init; } = string.Empty;
}
