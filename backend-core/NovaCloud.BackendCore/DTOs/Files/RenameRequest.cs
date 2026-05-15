namespace NovaCloud.BackendCore.DTOs.Files;

public sealed class RenameRequest
{
    public string NewName { get; init; } = string.Empty;
}
