namespace NovaCloud.BackendCore.DTOs.Auth;

public sealed class LogoutRequest
{
    public string AccessToken { get; init; } = string.Empty;
}
