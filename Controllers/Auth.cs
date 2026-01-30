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
using DevoteesAnusanga.Services;

namespace DevoteesAnusanga.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DBUtils _db;
        private readonly UserService _userService;

        public AuthController(IConfiguration config, DBUtils db, UserService userService)
        {
            _config = config;
            _db = db;
            _userService = userService;
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

        private static string HashPassword_old(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginRequest request)
        {
            // 1️⃣ Get stored hash from DB
            var storedHash = _db.GetHashPasswordByEmail(request.Email);

            if (string.IsNullOrEmpty(storedHash))
                return Unauthorized("Invalid credentials");

            // 2️⃣ Verify password using BCrypt
            var isValidPassword = BCrypt.Net.BCrypt.Verify(
                request.Password,
                storedHash
            );

            var newHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            if (!isValidPassword)
                return Unauthorized("Invalid credentials");

            // 3️⃣ Fetch user (NO password check here)
            var user = _db.AuthenticateUser(request.Email);

            if (user == null)
                return Unauthorized("Invalid credentials");

            // 4️⃣ Generate JWT
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


        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            // 1️⃣ Get stored hash from DB
            var storedHash = await _db.GetPasswordHashAsync(userId);

            if (string.IsNullOrEmpty(storedHash))
                return BadRequest("User not found");

            // 2️⃣ Verify current password
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, storedHash))
                return BadRequest("Current password is incorrect");

            // 3️⃣ Hash new password
            var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            // 4️⃣ Update password in DB (existing method)
            await _db.UpdatePasswordAsync(userId, newHash);

            return Ok("Password updated successfully");
        }

    }
}
