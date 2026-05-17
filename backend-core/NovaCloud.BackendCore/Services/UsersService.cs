using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using NovaCloud.BackendCore.DTOs.Admin;

namespace NovaCloud.BackendCore.Services;

public sealed class UsersService : IUsersService
{
    private const string DefaultRole = "user";
    private const string ActiveStatus = "active";
    private const string InactiveStatus = "inactive";

    private readonly IAmazonCognitoIdentityProvider _cognito;
    private readonly string _userPoolId;

    public UsersService(IAmazonCognitoIdentityProvider cognito, IConfiguration configuration)
    {
        _cognito = cognito;
        _userPoolId = configuration["AWS:UserPoolId"]
            ?? throw new InvalidOperationException("Missing AWS:UserPoolId configuration.");
    }

    public async Task<List<UserResponse>> ListUsersAsync()
    {
        var response = await _cognito.ListUsersAsync(new ListUsersRequest
        {
            UserPoolId = _userPoolId
        });

        var users = new List<UserResponse>(response.Users.Count);
        foreach (var user in response.Users)
        {
            var role = await GetUserRoleAsync(user.Username);
            users.Add(MapUser(user.Username, user.Attributes, user.Enabled, user.UserCreateDate, role));
        }

        return users;
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ArgumentException("Password is required.", nameof(request.Password));
        }

        var tempPassword = $"{Guid.NewGuid():N}"[..12] + "Aa1!";
        var createResponse = await _cognito.AdminCreateUserAsync(new AdminCreateUserRequest
        {
            UserPoolId = _userPoolId,
            Username = request.Email,
            TemporaryPassword = tempPassword,
            MessageAction = "SUPPRESS",
            UserAttributes = new List<AttributeType>
            {
                new() { Name = "email", Value = request.Email },
                new() { Name = "name", Value = request.Name },
                new() { Name = "email_verified", Value = "true" }
            }
        });

        await _cognito.AdminAddUserToGroupAsync(new AdminAddUserToGroupRequest
        {
            UserPoolId = _userPoolId,
            Username = request.Email,
            GroupName = request.Role
        });

        await _cognito.AdminSetUserPasswordAsync(new AdminSetUserPasswordRequest
        {
            UserPoolId = _userPoolId,
            Username = request.Email,
            Password = request.Password,
            Permanent = true
        });

        var createdUser = createResponse.User;
        if (createdUser is null)
        {
            throw new InvalidOperationException("User creation succeeded but no user payload was returned.");
        }

        return MapUser(
            createdUser.Username,
            createdUser.Attributes,
            createdUser.Enabled,
            createdUser.UserCreateDate,
            request.Role,
            request.Email,
            request.Name);
    }

    public async Task<UserResponse> UpdateUserAsync(string userId, UpdateUserRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            await _cognito.AdminUpdateUserAttributesAsync(new AdminUpdateUserAttributesRequest
            {
                UserPoolId = _userPoolId,
                Username = userId,
                UserAttributes = new List<AttributeType>
                {
                    new() { Name = "name", Value = request.Name }
                }
            });
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (string.Equals(request.Status, ActiveStatus, StringComparison.OrdinalIgnoreCase))
            {
                await _cognito.AdminEnableUserAsync(new AdminEnableUserRequest
                {
                    UserPoolId = _userPoolId,
                    Username = userId
                });
            }
            else if (string.Equals(request.Status, InactiveStatus, StringComparison.OrdinalIgnoreCase))
            {
                await _cognito.AdminDisableUserAsync(new AdminDisableUserRequest
                {
                    UserPoolId = _userPoolId,
                    Username = userId
                });
            }
            else
            {
                throw new ArgumentException("Status must be active or inactive.", nameof(request));
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var groupsResponse = await _cognito.AdminListGroupsForUserAsync(new AdminListGroupsForUserRequest
            {
                UserPoolId = _userPoolId,
                Username = userId
            });

            var currentGroup = groupsResponse.Groups.FirstOrDefault()?.GroupName;
            if (!string.IsNullOrWhiteSpace(currentGroup) &&
                !string.Equals(currentGroup, request.Role, StringComparison.OrdinalIgnoreCase))
            {
                await _cognito.AdminRemoveUserFromGroupAsync(new AdminRemoveUserFromGroupRequest
                {
                    UserPoolId = _userPoolId,
                    Username = userId,
                    GroupName = currentGroup
                });
            }

            if (!string.Equals(currentGroup, request.Role, StringComparison.OrdinalIgnoreCase))
            {
                await _cognito.AdminAddUserToGroupAsync(new AdminAddUserToGroupRequest
                {
                    UserPoolId = _userPoolId,
                    Username = userId,
                    GroupName = request.Role
                });
            }
        }

        var updatedUser = await _cognito.AdminGetUserAsync(new AdminGetUserRequest
        {
            UserPoolId = _userPoolId,
            Username = userId
        });

        var role = await GetUserRoleAsync(userId);
        return MapUser(updatedUser.Username,
            updatedUser.UserAttributes,
            updatedUser.Enabled,
            updatedUser.UserCreateDate,
            role);
    }

    public async Task DeleteUserAsync(string userId)
    {
        await _cognito.AdminDeleteUserAsync(new AdminDeleteUserRequest
        {
            UserPoolId = _userPoolId,
            Username = userId
        });
    }

    public async Task<UserStatsResponse> GetStatsAsync()
    {
        var response = await _cognito.ListUsersAsync(new ListUsersRequest
        {
            UserPoolId = _userPoolId
        });

        var total = response.Users.Count;
        var active = response.Users.Count(user => user.Enabled == true);
        var inactive = total - active;

        return new UserStatsResponse
        {
            Total = total,
            Active = active,
            Inactive = inactive
        };
    }

    private async Task<string> GetUserRoleAsync(string username)
    {
        var response = await _cognito.AdminListGroupsForUserAsync(new AdminListGroupsForUserRequest
        {
            UserPoolId = _userPoolId,
            Username = username
        });

        var role = response.Groups.FirstOrDefault()?.GroupName;
        return string.IsNullOrWhiteSpace(role) ? DefaultRole : role;
    }

    private static UserResponse MapUser(
        string username,
        IEnumerable<AttributeType>? attributes,
        bool? enabled,
        DateTime? createdAt,
        string role,
        string? fallbackEmail = null,
        string? fallbackName = null)
    {
        return new UserResponse
        {
            Id = username,
            Email = GetAttributeValue(attributes, "email") ?? fallbackEmail ?? string.Empty,
            Name = GetAttributeValue(attributes, "name") ?? fallbackName ?? string.Empty,
            Role = string.IsNullOrWhiteSpace(role) ? DefaultRole : role,
            Status = enabled == true ? ActiveStatus : InactiveStatus,
            CreatedAt = createdAt ?? DateTime.UtcNow
        };
    }

    private static string? GetAttributeValue(IEnumerable<AttributeType>? attributes, string name)
    {
        if (attributes is null)
        {
            return null;
        }

        return attributes.FirstOrDefault(attribute =>
            string.Equals(attribute.Name, name, StringComparison.OrdinalIgnoreCase))?.Value;
    }
}
