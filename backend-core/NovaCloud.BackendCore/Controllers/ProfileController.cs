using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaCloud.BackendCore.DTOs.Auth;
using NovaCloud.BackendCore.Services;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public sealed class ProfileController : ControllerBase
{
    private readonly IAuthService _authService;

    public ProfileController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet]
    public ActionResult<MeResponse> GetProfile()
    {
        var userId = User.FindFirstValue("sub")
            ?? User.FindFirstValue("username")
            ?? User.FindFirstValue("cognito:username")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue("email") ?? User.FindFirstValue(ClaimTypes.Email);

        var response = _authService.GetMe(User);
        return Ok(response);
    }
}
