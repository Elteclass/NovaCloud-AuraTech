using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaCloud.BackendCore.DTOs.Files;
using NovaCloud.BackendCore.Services;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Authorize]
[Route("api/files")]
public class FilesController : ControllerBase
{
    private readonly IFilesService _filesService;

    public FilesController(IFilesService filesService)
    {
        _filesService = filesService;
    }

    [HttpGet]
    public async Task<IActionResult> ListFiles([FromQuery] string? filter, [FromQuery] string? tag)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var files = await _filesService.ListFilesAsync(userId, filter, tag);
        return Ok(files);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFileById(string id)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var file = await _filesService.GetFileByIdAsync(userId, id);
        return file is null ? NotFound() : Ok(file);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> GetDownloadUrl(string id)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var url = await _filesService.GetDownloadUrlAsync(userId, id);
            return Ok(new { url });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("{id}/rename")]
    public async Task<IActionResult> RenameFile(string id, [FromBody] RenameRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var file = await _filesService.RenameFileAsync(userId, id, request.NewName);
            return Ok(file);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/star")]
    public async Task<IActionResult> ToggleStar(string id)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var file = await _filesService.StarFileAsync(userId, id);
            return Ok(file);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/trash")]
    public async Task<IActionResult> TrashFile(string id)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var file = await _filesService.TrashFileAsync(userId, id);
            return Ok(file);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> RestoreFile(string id)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var file = await _filesService.RestoreFileAsync(userId, id);
            return Ok(file);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFile(string id)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            await _filesService.DeleteFileAsync(userId, id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("/api/storage/usage")]
    public async Task<IActionResult> GetStorageUsage()
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var usage = await _filesService.GetStorageUsageAsync(userId);
        return Ok(usage);
    }

    private string? GetUserId()
    {
        return User.FindFirstValue("sub")
            ?? User.FindFirstValue("username")
            ?? User.FindFirstValue("cognito:username")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
