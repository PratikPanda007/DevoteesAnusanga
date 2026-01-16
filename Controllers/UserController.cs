using DevoteesAnusanga.Helper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DevoteesAnusanga.Controllers
{
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
    }
}
