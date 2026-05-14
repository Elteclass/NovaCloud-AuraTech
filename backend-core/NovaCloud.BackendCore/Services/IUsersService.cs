using NovaCloud.BackendCore.DTOs.Admin;

namespace NovaCloud.BackendCore.Services;

public interface IUsersService
{
    Task<List<UserResponse>> ListUsersAsync();
    Task<UserResponse> CreateUserAsync(CreateUserRequest request);
    Task<UserResponse> UpdateUserAsync(string userId, UpdateUserRequest request);
    Task DeleteUserAsync(string userId);
    Task<UserStatsResponse> GetStatsAsync();
}
