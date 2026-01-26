using DevoteesAnusanga.Helper;
using DevoteesAnusanga.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Authorization;
using DevoteesAnusanga.Security;

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
        [ApiKeyNeeded]
        [HttpPost("encrypt")]
        public IActionResult EncryptText([FromBody] EncryptRequest request)
        {
            //if (!IsAuthorized())
            //    return Unauthorized("Unauthorized access");

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
        [Authorize]
        [HttpPost("update-password")]
        public IActionResult UpdatePassword(string userEmail, string newPassword)
        {
            //if (!IsAuthorized())
            //    return Unauthorized("Unauthorized access");

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

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginRequest request)
        {
            var hashedPassword = HashPassword(request.Password);

            var user = _db.AuthenticateUser(request.Email, hashedPassword);
            if (user == null)
                return Unauthorized("Invalid credentials");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.RoleName)
                }),
                Expires = DateTime.UtcNow.AddMinutes(
                    int.Parse(_config["Jwt:ExpiryMinutes"])
                ),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new
            {
                token = tokenHandler.WriteToken(token),
                expiresIn = 3600,
                user
            });
        }
    }
}
