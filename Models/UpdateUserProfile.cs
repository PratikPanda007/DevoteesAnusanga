namespace DevoteesAnusanga.Models
{
    public class UpdateUserProfileDto
    {
        public string Country { get; set; }
        public string? City { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? MissionDescription { get; set; }
        public object? SocialLinks { get; set; }
    }
}
