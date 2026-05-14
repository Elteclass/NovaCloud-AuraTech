namespace NovaCloud.BackendCore.DTOs.Auth;

public sealed class ChangePasswordRequest
{
    public string Email { get; init; } = string.Empty;
    public string Session { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
}
