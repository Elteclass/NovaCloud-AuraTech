using Microsoft.AspNetCore.Mvc;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetFiles()
    {
        var files = new[]
        {
            new
            {
                name = "reporte-financiero.pdf",
                size = "2.4MB",
                type = "pdf",
                uploadDate = "2026-04-03T10:00:00Z"
            },
            new
            {
                name = "logo-auratech.png",
                size = "1.1MB",
                type = "image",
                uploadDate = "2026-04-03T11:30:00Z"
            }
        };

        return Ok(files);
    }
}