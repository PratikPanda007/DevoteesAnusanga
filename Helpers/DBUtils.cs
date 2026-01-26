using DevoteesAnusanga.Models;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Security.Cryptography;
using System.Text;

namespace DevoteesAnusanga.Helper
{
    public class DBUtils
    {
        private readonly string _connectionString;

        public DBUtils(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(_connectionString);
        }

        // 🔹 For SELECT (returns DataTable)
        public DataTable ExecuteDataTable(string spName, SqlParameter[] parameters = null)
        {
            using var conn = GetConnection();
            using var cmd = new SqlCommand(spName, conn);
            cmd.CommandType = CommandType.StoredProcedure;

            if (parameters != null)
                cmd.Parameters.AddRange(parameters);

            using var da = new SqlDataAdapter(cmd);
            var dt = new DataTable();
            da.Fill(dt);
            return dt;
        }

        // 🔹 For INSERT / UPDATE / DELETE
        public int ExecuteNonQuery(string spName, SqlParameter[] parameters = null)
        {
            using var conn = GetConnection();
            using var cmd = new SqlCommand(spName, conn);
            cmd.CommandType = CommandType.StoredProcedure;

            if (parameters != null)
                cmd.Parameters.AddRange(parameters);

            conn.Open();
            return cmd.ExecuteNonQuery();
        }

        // 🔹 For single value (scalar)
        public object ExecuteScalar(string spName, SqlParameter[] parameters = null)
        {
            using var conn = GetConnection();
            using var cmd = new SqlCommand(spName, conn);
            cmd.CommandType = CommandType.StoredProcedure;

            if (parameters != null)
                cmd.Parameters.AddRange(parameters);

            conn.Open();
            return cmd.ExecuteScalar();
        }

        // =========================================================================================== [ User Creds Starts Here ]

        public UserModel AuthenticateUser(string email, string passwordHash)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("AuthenticateUser", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Email", email);
            cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);

            conn.Open();
            using var reader = cmd.ExecuteReader();

            if (!reader.Read()) return null;

            return new UserModel
            {
                Id = reader.GetGuid(reader.GetOrdinal("id")),
                Email = reader.GetString(reader.GetOrdinal("email")),
                Name = reader.GetString(reader.GetOrdinal("name")),
                UserRoleID = reader.GetInt32(reader.GetOrdinal("UserRoleId")),
                RoleName = reader.GetString(reader.GetOrdinal("RoleName")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive"))
            };
        }

        // Fetch All Users
        public List<UserModel> GetUsers()
        {
            var users = new List<UserModel>();

            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("GetAllUsers", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            conn.Open();
            using var reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                users.Add(new UserModel
                {
                    Id = reader.GetGuid(reader.GetOrdinal("id")),
                    Email = reader.GetString(reader.GetOrdinal("email")),
                    //Password_Hash = reader.GetString(reader.GetOrdinal("password_hash")),
                    Name = reader.GetString(reader.GetOrdinal("name")),
                    Email_Verified = reader.GetBoolean(reader.GetOrdinal("email_verified")),
                    UserRoleID = reader.GetInt32(reader.GetOrdinal("UserRoleId")),
                    RoleName = reader.GetString(reader.GetOrdinal("RoleName")),
                    IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                    Created_At = reader.GetDateTime(reader.GetOrdinal("created_at")),
                    Updated_At = reader.GetDateTime(reader.GetOrdinal("updated_at")),
                });
            }

            return users;
        }

        public void UpdatePassword(string userEmail, string newPassword)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("UpdatePassword", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Email", userEmail);
            cmd.Parameters.AddWithValue("@PasswordHash", newPassword);

            conn.Open();
            cmd.ExecuteNonQuery();
        }

        public UserModel GetUserDetailsByEmail(string UserEmail)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("GetUserDetailsByEmail", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Email", UserEmail);

            conn.Open();
            using var reader = cmd.ExecuteReader();

            if (!reader.Read()) return null;

            return new UserModel
            {
                Id = reader.GetGuid(reader.GetOrdinal("id")),
                Email = reader.GetString(reader.GetOrdinal("email")),
                //Password_Hash = reader.GetString(reader.GetOrdinal("password_hash")),
                Name = reader.GetString(reader.GetOrdinal("name")),
                Email_Verified = reader.GetBoolean(reader.GetOrdinal("email_verified")),
                UserRoleID = reader.GetInt32(reader.GetOrdinal("UserRoleId")),
                RoleName = reader.GetString(reader.GetOrdinal("RoleName")),
                HasProfile = reader.GetInt32(reader.GetOrdinal("hasProfile")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                Created_At = reader.GetDateTime(reader.GetOrdinal("created_at")),
                Updated_At = reader.GetDateTime(reader.GetOrdinal("updated_at")),
            };
        }

        public UserProfile GetUserProfileByUserId(Guid profileId)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("GetUserProfileByUserId", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Id", profileId);

            conn.Open();
            using var reader = cmd.ExecuteReader();

            if (!reader.Read()) return null;

            return new UserProfile
            {
                Id = reader.GetGuid(reader.GetOrdinal("id")),
                UserId = reader.GetGuid(reader.GetOrdinal("user_id")),
                Name = reader.GetString(reader.GetOrdinal("name")),
                Email = reader.GetString(reader.GetOrdinal("email")),
                Phone = reader.GetString(reader.GetOrdinal("phone")),
                Country = reader.GetString(reader.GetOrdinal("country")),
                City = reader.GetString(reader.GetOrdinal("city")),
                MissionDescription = reader.GetString(reader.GetOrdinal("mission_description")),
                AvatarUrl = reader.IsDBNull("avatar_url") ? null : reader.GetString(reader.GetOrdinal("avatar_url")),
                SocialLinks = reader.IsDBNull("social_links") ? null : reader.GetString(reader.GetOrdinal("social_links")),
                IsPublic = reader.GetBoolean(reader.GetOrdinal("is_public")),
                RoleId = reader.GetInt32(reader.GetOrdinal("role_id")),
                AgreedToTermsAt = reader.IsDBNull("agreed_to_terms_at") ? null : reader.GetDateTime(reader.GetOrdinal("agreed_to_terms_at")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.GetDateTime(reader.GetOrdinal("updated_at"))
            };
        }

        // Chekck if UserProfiles exists or not


        // =========================================================================================== [ User Creds Ends Here ]

        public List<Countries> GetAllCountries()
        {
            List<Countries> countries = new List<Countries>();
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("GetAllCountries", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            conn.Open();
            using var reader = cmd.ExecuteReader();

            //if (!reader.Read()) return null;

            while (reader.Read())
            {
                countries.Add(new Countries
                {
                    CountryId = reader.GetInt32(reader.GetOrdinal("CountryId")),
                    CountryCode = reader.GetString(reader.GetOrdinal("CountryCode")),
                    CountryName = reader.GetString(reader.GetOrdinal("CountryName")),
                });
            }

            return countries;
        }
    }
}
