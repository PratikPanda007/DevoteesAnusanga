namespace DevoteesAnusanga.Models
{
    public class AdminDashboard
    {
        public int TotalUsers { get; set; }
        public int PublicProfiles { get; set; }
        public int PrivateProfiles { get; set; }
        public int TotalAnnouncements { get; set; }
        public int PendingAnnouncements { get; set; }
        public int ApprovedAnnouncements { get; set; }
        public int RejectedAnnouncements { get; set; }
    }
}
