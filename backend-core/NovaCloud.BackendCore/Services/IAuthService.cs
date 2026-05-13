using System.Security.Claims;
using NovaCloud.BackendCore.DTOs.Auth;

namespace NovaCloud.BackendCore.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> ChangePasswordAsync(ChangePasswordRequest request);
    Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task LogoutAsync(string accessToken);
    MeResponse GetMe(ClaimsPrincipal user);
}
