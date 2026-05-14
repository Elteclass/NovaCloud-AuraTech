namespace NovaCloud.BackendCore.DTOs.Auth;

public sealed class LoginRequest
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
