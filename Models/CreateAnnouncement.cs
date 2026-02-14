namespace DevoteesAnusanga.Models
{
    public class CreateAnnouncement
    {
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ImageUrl { get; set; } = string.Empty;
    }
}
