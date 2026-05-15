using NovaCloud.BackendCore.DTOs.Files;

namespace NovaCloud.BackendCore.Services;

public interface IFilesService
{
    Task<List<FileResponse>> ListFilesAsync(string userId, string? filter, string? tag);
    Task<FileResponse?> GetFileByIdAsync(string userId, string id);
    Task<string> GetDownloadUrlAsync(string userId, string id);
    Task<FileResponse> RenameFileAsync(string userId, string id, string newName);
    Task<FileResponse> StarFileAsync(string userId, string id);
    Task<FileResponse> TrashFileAsync(string userId, string id);
    Task<FileResponse> RestoreFileAsync(string userId, string id);
    Task DeleteFileAsync(string userId, string id);
    Task<StorageUsageResponse> GetStorageUsageAsync(string userId);
}
