namespace NovaCloud.BackendCore.DTOs.Auth;

public sealed class MeResponse
{
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}
