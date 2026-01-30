using DevoteesAnusanga.Helper;
using DevoteesAnusanga.Models;
using System.Text.Json;

namespace DevoteesAnusanga.Services
{
    public class ProfileService
    {
        private readonly DBUtils _db;

        public ProfileService(DBUtils db)
        {
            _db = db;
        }

        public async Task UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto)
        {
            var socialLinksJson = dto.SocialLinks != null
                ? JsonSerializer.Serialize(dto.SocialLinks)
                : null;

            await _db.UpdateUserProfileAsync(
                userId,
                dto.Country,
                dto.City,
                dto.Email,
                dto.Phone,
                dto.MissionDescription,
                socialLinksJson
            );
        }
    }

}
