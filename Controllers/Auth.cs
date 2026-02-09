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
using System.Net.Mail;

namespace DevoteesAnusanga.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly DBUtils _db;
        private readonly UserService _userService;
        private readonly EmailService _emailServices;
        private readonly JwtService _jwt;

        public AuthController(IConfiguration config, DBUtils db, UserService userService, EmailService emailServices, JwtService jwt)
        {
            _config = config;
            _db = db;
            _userService = userService;
            _emailServices = emailServices;
            _jwt = jwt;
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

        private static string GenerateOtp()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            return (BitConverter.ToUInt32(bytes, 0) % 1_000_000).ToString("D6");
        }

        /* ============================
       REQUEST OTP
    ============================ */
        [HttpPost("forgot-password-request")]
        [AllowAnonymous]
        public async Task<IActionResult> RequestOtp([FromBody] ForgotPasswordRequest dto)
        {
            var user = await _db.GetUserDetailsByEmailAsync(dto.Email);

            // prevent email enumeration
            if (user == null || !user.IsActive)
                return Ok();

            var otp = RandomNumberGenerator
                .GetInt32(100000, 999999)
                .ToString();

            var otpHash = BCrypt.Net.BCrypt.HashPassword(otp);

            await _db.CreatePasswordOtpAsync(
                user.Id,
                otpHash,
                DateTime.UtcNow.AddMinutes(10)
            );

            await _emailServices.SendOtpEmailAsync(user.Email, otp);

            return Ok();
        }

        /* ============================
           VERIFY OTP
        ============================ */
        [HttpPost("forgot-password/verify")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtp dto)
        {
            var user = await _db.GetUserDetailsByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized();

            var otpRow = await _db.GetValidPasswordOtpAsync(user.Id);
            if (otpRow == null)
                return Unauthorized("OTP expired");

            bool hashedOTP = BCrypt.Net.BCrypt.Verify(dto.Otp, otpRow.OtpHash);

            if (!BCrypt.Net.BCrypt.Verify(dto.Otp, otpRow.OtpHash))
                return Unauthorized("Invalid OTP");

            await _db.MarkPasswordOtpUsedAsync(otpRow.Id);

            //var resetToken = _jwt.GeneratePasswordResetToken(user.Id);

            //return Ok(new { resetToken });
            // 🔐 Generate temp password
            var tempPassword = GenerateTemporaryPassword();
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);

            await _db.UpdateUserPasswordAsync(user.Id, passwordHash);

            await _emailServices.SendTemporaryPasswordEmailAsync(
                user.Email,
                tempPassword
            );

            return Ok(new
            {
                message = "Temporary password sent to your email"
            });
        }

        private string GenerateTemporaryPassword(int length = 12)
        {
            const string chars =
                "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
            var rng = RandomNumberGenerator.Create();
            var bytes = new byte[length];
            rng.GetBytes(bytes);

            var result = new char[length];
            for (int i = 0; i < length; i++)
                result[i] = chars[bytes[i] % chars.Length];

            return new string(result);
        }

        /* ============================
           RESET PASSWORD
        ============================ */
        [HttpPost("forgot-password/reset")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword(
            [FromBody] ResetUserPassword dto
        )
        {
            var userId = _jwt.ValidatePasswordResetToken(dto.ResetToken);
            if (userId == null)
                return Unauthorized();

            var newHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _db.UpdatePasswordAsync(userId.Value, newHash);

            return Ok();
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Invalid data");
            }

            // Use EXISTING hashing logic (same as login uses)
            var passwordHash = HashPassword(request.Password);

            var userId = _db.UserRegistrationAsync(
                request.Name,
                request.Email,
                passwordHash
            );

            if (userId == Guid.Empty)
                return BadRequest("User already exists");

            return Ok("User registered successfully");
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
