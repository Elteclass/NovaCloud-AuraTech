namespace NovaCloud.BackendCore.DTOs.Auth;

public sealed class LoginResponse
{
    public string? Token { get; init; }
    public string? RefreshToken { get; init; }
    public string? Role { get; init; }
    public string? Email { get; init; }
    public string? Session { get; init; }
}
