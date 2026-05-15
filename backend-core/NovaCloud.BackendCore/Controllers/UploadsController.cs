using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaCloud.BackendCore.DTOs.Files;
using NovaCloud.BackendCore.Services;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Authorize]
[Route("api/uploads")]
public class UploadsController : ControllerBase
{
    private readonly IUploadsService _uploadsService;
    private readonly ILogger<UploadsController> _logger;

    public UploadsController(IUploadsService uploadsService, ILogger<UploadsController> logger)
    {
        _uploadsService = uploadsService;
        _logger = logger;
    }

    [HttpPost("presign")]
    public async Task<IActionResult> GeneratePresign([FromBody] PresignRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var response = await _uploadsService.GeneratePresignedUrlAsync(userId, request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate presigned URL for user {UserId}.", userId);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpPost("complete")]
    public async Task<IActionResult> CompleteUpload([FromBody] CompleteUploadRequest request)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var response = await _uploadsService.CompleteUploadAsync(userId, request);
            return Created(string.Empty, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to complete upload for user {UserId}.", userId);
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    private string? GetUserId()
    {
        return User.FindFirstValue("sub")
            ?? User.FindFirstValue("username")
            ?? User.FindFirstValue("cognito:username")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
