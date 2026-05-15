namespace NovaCloud.BackendCore.DTOs.Files;

public sealed class PresignRequest
{
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public List<string>? Tags { get; init; }
}
