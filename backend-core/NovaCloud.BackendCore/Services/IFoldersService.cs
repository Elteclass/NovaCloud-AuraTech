using NovaCloud.BackendCore.DTOs.Folders;

namespace NovaCloud.BackendCore.Services;

public interface IFoldersService
{
    Task<List<FolderResponse>> ListFoldersAsync(string userId);
    Task<FolderResponse> CreateFolderAsync(string userId, CreateFolderRequest request);
    Task<FolderResponse> RenameFolderAsync(string userId, string id, string newName);
}
