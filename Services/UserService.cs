using DevoteesAnusanga.Helper;
using BCrypt.Net;

namespace DevoteesAnusanga.Services
{
    public class UserService
    {
        private readonly DBUtils _db;

        public UserService(DBUtils db)
        {
            _db = db;
        }

        public async Task ChangePasswordAsync(
            Guid userId,
            string currentPassword,
            string newPassword
        )
        {
            // 1️⃣ Get existing password hash
            var storedHash = await _db.GetPasswordHashAsync(userId);

            if (string.IsNullOrEmpty(storedHash))
                throw new Exception("User not found");

            // 2️⃣ Verify current password
            if (!BCrypt.Net.BCrypt.Verify(currentPassword, storedHash))
                throw new Exception("Current password is incorrect");

            // 3️⃣ Hash new password
            var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

            // 4️⃣ Update password
            await _db.UpdatePasswordAsync(userId, newHash);
        }
    }
}
