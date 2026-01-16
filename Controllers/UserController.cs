using DevoteesAnusanga.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DevoteesAnusanga.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly DBUtils _db;

        public UserController(DBUtils db)
        {
            _db = db;
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

        [HttpGet("UserDetails")]
        public IActionResult GetUserDetailsByEmail(string UserEmail)
        {
            var userDetails = _db.GetUserDetailsByEmail(UserEmail);
            var userProfile = _db.GetUserProfileByUserId(userDetails.Id);
            if (userDetails == null)
                return NotFound("Profile not found");

            return Ok(new { userDetails, userProfile });
        }

        [HttpGet("Profile")]
        public IActionResult GetMyProfile(Guid userId)
        {
            var profile = _db.GetUserProfileByUserId(userId);

            if (profile == null)
                return NotFound("Profile not found");

            return Ok(profile);
        }
    }
}
