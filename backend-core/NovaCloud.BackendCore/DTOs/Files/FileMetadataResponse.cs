namespace NovaCloud.BackendCore.DTOs.Files;

public class FileMetadataResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime UploadDate { get; set; }
    public DateTime? LastModified { get; set; }
    public bool Starred { get; set; }
    public bool InTrash { get; set; }
    public string? Owner { get; set; }
    public List<string>? Tags { get; set; }
    public string? ContentType { get; set; }
}
