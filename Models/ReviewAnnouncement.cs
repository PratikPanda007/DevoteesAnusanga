namespace DevoteesAnusanga.Models
{
    public class ReviewAnnouncement
    {
        public Guid AnnouncementId { get; set; }
        public Guid AdminId { get; set; }
        public int Status { get; set; } // 1=Approved, 2=Rejected
    }
}
