namespace NovaCloud.BackendCore.DTOs.Admin;

public sealed class UserStatsResponse
{
    public int Total { get; init; }
    public int Active { get; init; }
    public int Inactive { get; init; }
}
