namespace DevoteesAnusanga.Models
{
    public class CreateUserProfile
    {
        public string? Name { get; set; }
        public string? Email { get; set; }

        public string? Phone { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? MissionDescription { get; set; }
        public string? AvatarUrl { get; set; }
        public string? SocialLinks { get; set; } // JSON

        public bool? IsPublic { get; set; }
        public int? RoleId { get; set; }
    }
}
