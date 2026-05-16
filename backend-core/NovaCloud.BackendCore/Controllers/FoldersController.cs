using System.Security.Claims;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaCloud.BackendCore.DTOs.Folders;
using NovaCloud.BackendCore.Services;

namespace NovaCloud.BackendCore.Controllers;

[ApiController]
[Authorize]
[Route("api/folders")]
public sealed class FoldersController : ControllerBase
{
    private readonly IFoldersService _foldersService;

    public FoldersController(IFoldersService foldersService)
    {
        _foldersService = foldersService;
    }

    [HttpGet]
    public async Task<IActionResult> ListFolders()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        try
        {
            var folders = await _foldersService.ListFoldersAsync(userId);
            return Ok(folders);
        }
        catch (ResourceNotFoundException)
        {
            return NotFound();
        }
        catch (AmazonDynamoDBException ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateFolder([FromBody] CreateFolderRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        try
        {
            var folder = await _foldersService.CreateFolderAsync(userId, request);
            return Created(string.Empty, folder);
        }
        catch (ResourceNotFoundException)
        {
            return NotFound();
        }
        catch (AmazonDynamoDBException ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
        }
    }

    [HttpPatch("{id}/rename")]
    public async Task<IActionResult> RenameFolder(string id, [FromBody] RenameFolderRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        try
        {
            var folder = await _foldersService.RenameFolderAsync(userId, id, request.NewName);
            return Ok(folder);
        }
        catch (ResourceNotFoundException)
        {
            return NotFound();
        }
        catch (AmazonDynamoDBException ex)
        {
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
