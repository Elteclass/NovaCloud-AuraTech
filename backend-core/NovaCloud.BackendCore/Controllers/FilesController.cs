using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaCloud.BackendCore.DTOs.Files;
using NovaCloud.BackendCore.Services;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFileService _fileService;

    public FilesController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FileResponse>>> ListFiles(
        [FromQuery] string? filter = null,
        [FromQuery] string? tag = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var files = await _fileService.ListAsync(filter, tag, User, cancellationToken);
            return Ok(files);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FileMetadataResponse>> GetFile(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var metadata = await _fileService.GetAsync(id, cancellationToken);
            return Ok(metadata);
        }
        catch (Amazon.S3.AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound("File not found.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}/download")]
    public async Task<ActionResult<object>> GetDownloadUrl(
        string id,
        [FromQuery] int? expirationMinutes = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var ttl = expirationMinutes.HasValue
                ? TimeSpan.FromMinutes(expirationMinutes.Value)
                : null;
            var downloadUrl = await _fileService.GetDownloadUrlAsync(id, ttl, cancellationToken);
            return Ok(new { downloadUrl });
        }
        catch (Amazon.S3.AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound("File not found.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("{id}/rename")]
    public async Task<IActionResult> RenameFile(
        string id,
        [FromBody] RenameRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.NewName))
        {
            return BadRequest("NewName cannot be empty.");
        }

        try
        {
            await _fileService.RenameAsync(id, request.NewName, cancellationToken);
            return NoContent();
        }
        catch (Amazon.S3.AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound("File not found.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/star")]
    public async Task<IActionResult> StarFile(
        string id,
        [FromQuery] bool starred = true,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileService.StarAsync(id, starred, cancellationToken);
            return NoContent();
        }
        catch (Amazon.S3.AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound("File not found.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/trash")]
    public async Task<IActionResult> MoveToTrash(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileService.MoveToTrashAsync(id, cancellationToken);
            return NoContent();
        }
        catch (Amazon.S3.AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound("File not found.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> RestoreFile(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileService.RestoreAsync(id, cancellationToken);
            return NoContent();
        }
        catch (Amazon.S3.AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound("File not found.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFile(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _fileService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}