namespace DevoteesAnusanga.Models
{
    public class Announcement
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int ApprovalStatus { get; set; }
        public Guid? ApprovedBy { get; set; }
        public DateTime? ApprovedOn { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
