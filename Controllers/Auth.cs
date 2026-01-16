using DevoteesAnusanga.Helper;
using DevoteesAnusanga.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace DevoteesAnusanga.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DBUtils _db;

        public AuthController(IConfiguration config, DBUtils db)
        {
            _config = config;
            _db = db;
        }

        // -------------------------------
        // ENCRYPT TEXT (GENERIC DATA ONLY)
        // -------------------------------
        [HttpPost("encrypt")]
        public IActionResult EncryptText([FromBody] EncryptRequest request)
        {
            if (!IsAuthorized())
                return Unauthorized("Unauthorized access");

            string aesKey = _config["AesKey"];
            string encrypted = TextEncryptDecrypt.EncryptString(aesKey, request.DecryptedText);

            return Ok(new DecryptResponse
            {
                StatusCode = 200,
                Message = encrypted
            });
        }

        // -------------------------------
        // DECRYPT TEXT (GENERIC DATA ONLY)
        // -------------------------------
        [HttpPost("decrypt")]
        public IActionResult DecryptText([FromBody] DecryptRequests request)
        {
            if (!IsAuthorized())
                return Unauthorized("Unauthorized access");

            string aesKey = _config["AesKey"];
            string decrypted = TextEncryptDecrypt.DecryptString(aesKey, request.EncryptedText);

            return Ok(new DecryptResponse
            {
                StatusCode = 200,
                Message = decrypted
            });
        }

        // -------------------------------
        // UPDATE PASSWORD (HASHING ONLY)
        // -------------------------------
        [HttpPost("update-password")]
        public IActionResult UpdatePassword(string userEmail, string newPassword)
        {
            if (!IsAuthorized())
                return Unauthorized("Unauthorized access");

            string hashedPassword = HashPassword(newPassword);
            _db.UpdatePassword(userEmail, hashedPassword);

            return Ok("Updated");
        }

        // -------------------------------
        // HELPERS
        // -------------------------------
        private bool IsAuthorized()
        {
            string authHeader = Request.Headers["X-API-KEY"];
            string validKey = _config["ApiKey"];
            return authHeader == validKey;
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}
