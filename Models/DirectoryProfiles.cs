namespace DevoteesAnusanga.Models
{
    public class DirectoryProfiles
    {
        public Guid ProfileId { get; set; }
        public Guid UserId { get; set; }

        public string Name { get; set; } = "";
        public string? Email { get; set; }
        public string? Phone { get; set; }

        public string Country { get; set; } = "";
        public string? City { get; set; }

        public string? MissionDescription { get; set; }
        public string? AvatarUrl { get; set; }

        public string? SocialLinks { get; set; } // JSON string
        public int RoleId { get; set; }
    }
}
