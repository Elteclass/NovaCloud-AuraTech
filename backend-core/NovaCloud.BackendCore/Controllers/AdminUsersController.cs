using System.Text.Json;
using Amazon.CognitoIdentityProvider.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaCloud.BackendCore.DTOs.Admin;
using NovaCloud.BackendCore.Services;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/users")]
public sealed class AdminUsersController : ControllerBase
{
    private readonly IUsersService _usersService;

    public AdminUsersController(IUsersService usersService)
    {
        _usersService = usersService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> ListUsers()
    {
        if (!IsAdmin())
        {
            return Forbid();
        }

        try
        {
            var users = await _usersService.ListUsersAsync();
            return Ok(users);
        }
        catch (NotAuthorizedException)
        {
            return Forbid();
        }
        catch (InvalidParameterException)
        {
            return BadRequest();
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> CreateUser([FromBody] CreateUserRequest request)
    {
        if (!IsAdmin())
        {
            return Forbid();
        }

        try
        {
            var user = await _usersService.CreateUserAsync(request);
            return Created(string.Empty, user);
        }
        catch (UsernameExistsException)
        {
            return Conflict();
        }
        catch (InvalidParameterException)
        {
            return BadRequest();
        }
        catch (NotAuthorizedException)
        {
            return Forbid();
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponse>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        if (!IsAdmin())
        {
            return Forbid();
        }

        try
        {
            var user = await _usersService.UpdateUserAsync(id, request);
            return Ok(user);
        }
        catch (UserNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException)
        {
            return BadRequest();
        }
        catch (InvalidParameterException)
        {
            return BadRequest();
        }
        catch (NotAuthorizedException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (!IsAdmin())
        {
            return Forbid();
        }

        try
        {
            await _usersService.DeleteUserAsync(id);
            return NoContent();
        }
        catch (UserNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidParameterException)
        {
            return BadRequest();
        }
        catch (NotAuthorizedException)
        {
            return Forbid();
        }
    }

    [HttpGet("stats")]
    public async Task<ActionResult<UserStatsResponse>> Stats()
    {
        if (!IsAdmin())
        {
            return Forbid();
        }

        try
        {
            var stats = await _usersService.GetStatsAsync();
            return Ok(stats);
        }
        catch (InvalidParameterException)
        {
            return BadRequest();
        }
        catch (NotAuthorizedException)
        {
            return Forbid();
        }
    }

    private bool IsAdmin()
    {
        foreach (var claim in User.Claims.Where(c => c.Type == "cognito:groups"))
        {
            if (ContainsAdminGroup(claim.Value))
            {
                return true;
            }
        }

        return false;
    }

    private static bool ContainsAdminGroup(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var trimmed = value.Trim();
        if (!trimmed.StartsWith("[", StringComparison.Ordinal))
        {
            return string.Equals(trimmed, "admin", StringComparison.OrdinalIgnoreCase);
        }

        try
        {
            using var doc = JsonDocument.Parse(trimmed);
            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                return false;
            }

            foreach (var element in doc.RootElement.EnumerateArray())
            {
                if (element.ValueKind == JsonValueKind.String &&
                    string.Equals(element.GetString(), "admin", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
        }
        catch (JsonException)
        {
            return false;
        }

        return false;
    }
}
