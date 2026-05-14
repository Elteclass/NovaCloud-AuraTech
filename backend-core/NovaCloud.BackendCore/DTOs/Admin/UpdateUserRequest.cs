namespace NovaCloud.BackendCore.DTOs.Admin;

public sealed class UpdateUserRequest
{
    public string? Name { get; init; }
    public string? Role { get; init; }
    public string? Status { get; init; }
}
