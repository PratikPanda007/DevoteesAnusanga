namespace DevoteesAnusanga.Models
{
    public class ResetUserPassword
    {
        public string ResetToken { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
