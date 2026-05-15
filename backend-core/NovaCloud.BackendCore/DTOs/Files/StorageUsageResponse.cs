namespace NovaCloud.BackendCore.DTOs.Files;

public sealed class StorageUsageResponse
{
    public long UsedBytes { get; init; }
    public string UsedReadable { get; init; } = string.Empty;
    public long TotalBytes { get; init; }
    public string TotalReadable { get; init; } = string.Empty;
    public double Percentage { get; init; }
}
