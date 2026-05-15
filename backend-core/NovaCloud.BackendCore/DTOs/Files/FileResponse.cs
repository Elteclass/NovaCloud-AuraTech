namespace NovaCloud.BackendCore.DTOs.Files;

public sealed class FileResponse
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Size { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public List<string> Tags { get; init; } = new();
    public bool IsStarred { get; init; }
    public string Status { get; init; } = string.Empty;
    public string UploadedAt { get; init; } = string.Empty;
    public string? TrashedAt { get; init; }
}
