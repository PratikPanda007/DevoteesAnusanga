using DevoteesAnusanga.Helper;
using DevoteesAnusanga.Models;
using DevoteesAnusanga.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Security.Claims;

namespace DevoteesAnusanga.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly DBUtils _db;
        private readonly AzureBlobService _blobService;
        private readonly ProfileService _profileService;

        public UserController(DBUtils db, AzureBlobService blobService, ProfileService profileService)
        {
            _db = db;
            _blobService = blobService;
            _profileService = profileService;
        }

        [HttpGet("list")]
        public IActionResult List()
        {
            var users = _db.GetUsers();
            return Ok(users);
        }

        [HttpPost("add")]
        public IActionResult AddUser(string name)
        {
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@Name", name)
            };

            var rows = _db.ExecuteNonQuery("sp_AddUser", parameters);
            return Ok(rows);
        }

        [HttpGet("UserDetails_old")]
        public IActionResult GetUserDetailsByEmail(string UserEmail)
        {
            var userDetails = _db.GetUserDetailsByEmail(UserEmail);
            var userProfile = _db.GetUserProfileByUserId(userDetails.Id);
            if (userDetails == null)
                return NotFound("Profile not found");

            return Ok(new { userDetails, userProfile });
        }

        [Authorize]
        [HttpGet("UserDetails")]
        public IActionResult GetUserDetails()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
                return Unauthorized();

            var user = _db.GetUserDetailsByEmail(email);
            if (user == null)
                return NotFound();

            var profile = _db.GetUserProfileByUserId(Guid.Parse(userId));

            return Ok(new
            {
                userDetails = user,
                userProfile = profile
            });
        }

        [Authorize]
        [HttpPost("profile")]
        public async Task<IActionResult> CreateProfile([FromBody] CreateUserProfile dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var email = User.FindFirstValue(ClaimTypes.Email);

            var existing = _db.GetUserProfileByUserId(userId);
            if (existing != null)
                return BadRequest("Profile already exists");

            // 🔑 DEFAULT FALLBACKS
            dto.Name ??= email;                // safe placeholder
            dto.Email ??= email;
            dto.IsPublic ??= true;
            dto.RoleId ??= 4;                  // Devotee

            await _db.CreateUserProfileAsync(userId, dto);

            return Ok(new { message = "Profile created successfully" });
        }

        [HttpGet("Profile")]
        public IActionResult GetMyProfile(Guid userId)
        {
            var profile = _db.GetUserProfileByUserId(userId);

            if (profile == null)
                return NotFound("Profile not found");

            return Ok(profile);
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            await _profileService.UpdateProfileAsync(userId, dto);

            return Ok(new { message = "Profile updated successfully" });
        }

        [Authorize]
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            if (!file.ContentType.StartsWith("image/"))
                return BadRequest("Only image files allowed");

            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var imageUrl = await _blobService.UploadProfileImageAsync(file, userId);
            await _db.UpdateProfilePicAsync(userId, imageUrl);

            return Ok(new { avatarUrl = imageUrl });
        }

        [Authorize]
        [HttpPost("toggle-profile")]
        public async Task<IActionResult> ToggleProfile([FromBody] ToggleProfileRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (request.ToggleProfile != 0 && request.ToggleProfile != 1)
                return BadRequest("Invalid toggle value");

            await _db.ToggleUserProfileAsync(userId, request.ToggleProfile);

            return Ok(new
            {
                isPublic = request.ToggleProfile
            });
        }

    }
}
