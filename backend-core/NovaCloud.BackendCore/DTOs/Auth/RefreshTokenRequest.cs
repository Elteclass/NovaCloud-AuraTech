namespace NovaCloud.BackendCore.DTOs.Auth;

public sealed class RefreshTokenRequest
{
    public string Email { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
}
