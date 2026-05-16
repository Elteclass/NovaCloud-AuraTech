namespace NovaCloud.BackendCore.DTOs.Folders;

public sealed class RenameFolderRequest
{
    public string NewName { get; init; } = string.Empty;
}
