using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public sealed class NotificationsController : ControllerBase
{
    [HttpGet("count")]
    public IActionResult GetCount()
    {
        return Ok(new { count = 0 });
    }
}
