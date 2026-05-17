namespace NovaCloud.BackendCore.DTOs.Admin;

public sealed class CreateUserRequest
{
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
