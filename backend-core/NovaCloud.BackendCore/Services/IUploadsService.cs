using NovaCloud.BackendCore.DTOs.Files;

namespace NovaCloud.BackendCore.Services;

public interface IUploadsService
{
    Task<PresignResponse> GeneratePresignedUrlAsync(string userId, PresignRequest request);
    Task<FileResponse> CompleteUploadAsync(string userId, CompleteUploadRequest request);
}
