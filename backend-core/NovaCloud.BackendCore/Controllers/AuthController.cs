using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaCloud.BackendCore.DTOs.Auth;
using NovaCloud.BackendCore.Services;
using ChangePasswordRequestDto = NovaCloud.BackendCore.DTOs.Auth.ChangePasswordRequest;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (NotAuthorizedException)
        {
            return Unauthorized();
        }
        catch (UserNotConfirmedException)
        {
            return Unauthorized("User not confirmed.");
        }
        catch (AmazonCognitoIdentityProviderException)
        {
            return Unauthorized();
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        try
        {
            var response = await _authService.ChangePasswordAsync(request);
            return Ok(response);
        }
        catch (NotAuthorizedException)
        {
            return Unauthorized();
        }
        catch (AmazonCognitoIdentityProviderException)
        {
            return Unauthorized();
        }
        catch (InvalidOperationException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Password change failed.");
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request);
            return Ok(response);
        }
        catch (NotAuthorizedException)
        {
            return Unauthorized();
        }
        catch (AmazonCognitoIdentityProviderException)
        {
            return Unauthorized();
        }
        catch (InvalidOperationException)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, "Token refresh failed.");
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.AccessToken))
        {
            return BadRequest("Missing access token.");
        }

        await _authService.LogoutAsync(request.AccessToken);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<MeResponse> Me()
    {
        var response = _authService.GetMe(User);
        return Ok(response);
    }

}
