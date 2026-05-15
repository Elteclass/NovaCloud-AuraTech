using NovaCloud.BackendCore.DTOs.Files;
using System.Security.Claims;

namespace NovaCloud.BackendCore.Services;

public interface IFileService
{
    Task<IEnumerable<FileResponse>> ListAsync(string? filter = null, string? tag = null, ClaimsPrincipal? user = null, CancellationToken cancellationToken = default);
    Task<FileMetadataResponse> GetAsync(string id, CancellationToken cancellationToken = default);
    Task<string> GetDownloadUrlAsync(string id, TimeSpan? ttl = null, CancellationToken cancellationToken = default);
    Task RenameAsync(string id, string newName, CancellationToken cancellationToken = default);
    Task StarAsync(string id, bool starred, CancellationToken cancellationToken = default);
    Task MoveToTrashAsync(string id, CancellationToken cancellationToken = default);
    Task RestoreAsync(string id, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task TagAsync(string id, IDictionary<string, string> tags, CancellationToken cancellationToken = default);
}
