using DevoteesAnusanga.Helper;
using DevoteesAnusanga.Models;
using DevoteesAnusanga.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DevoteesAnusanga.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly DBUtils _db;
        private readonly AzureBlobService _blobservice;

        public AnnouncementsController(DBUtils db, AzureBlobService blobService)
        {
            _db = db;
            _blobservice = blobService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncement dto)
        {
            //var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var UserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var email = User.FindFirstValue(ClaimTypes.Email);

            await _db.CreateAnnouncementAsync(
                UserId,
                dto.Title,
                dto.Content,
                dto.Category,
                dto.ImageUrl   // Now we store URL
            );

            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetApproved()
        {
            var result = await _db.GetApprovedAnnouncementsAsync();
            return Ok(result);
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var imageUrl = await _blobservice.UploadAnnouncementImageAsync(file);

            return Ok(new { imageUrl });
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingAnnouncements()
        {
            var result = await _db.GetPendingAnnouncements();
            return Ok(result);
        }

        [HttpPut("review")]
        public async Task<IActionResult> Review([FromBody] ReviewAnnouncement dto)
        {
            var UserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var email = User.FindFirstValue(ClaimTypes.Email);

            await _db.ReviewAnnouncementAsync(
                dto.AnnouncementId,
                UserId,
                dto.Status
            );

            return Ok();
        }
    }

}
