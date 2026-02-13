using DevoteesAnusanga.Helper;
using DevoteesAnusanga.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevoteesAnusanga.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly DBUtils _db;

        public AnnouncementsController(DBUtils db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncement dto)
        {
            await _db.CreateAnnouncementAsync(
                dto.UserId,
                dto.Title,
                dto.Content,
                dto.Category
            );

            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetApproved()
        {
            var result = await _db.GetApprovedAnnouncementsAsync();
            return Ok(result);
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
            await _db.ReviewAnnouncementAsync(
                dto.AnnouncementId,
                dto.AdminId,
                dto.Status
            );

            return Ok();
        }
    }

}
