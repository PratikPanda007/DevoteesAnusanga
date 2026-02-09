namespace DevoteesAnusanga.Models
{
    public class UserModel
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string Password_Hash { get; set; }
        public string Name { get; set; }
        public bool Email_Verified { get; set; }
        public int UserRoleID { get; set; }
        public string RoleName { get; set; }
        public int HasProfile { get; set; }
        public bool IsActive { get; set; }
        public int IsTempPassword { get; set; }
        public DateTime Created_At { get; set; }
        public DateTime? Updated_At { get; set; }
    }
}
