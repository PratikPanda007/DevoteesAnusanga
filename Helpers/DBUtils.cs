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

        // ==================================================================================== [ User Registration Starts Here ]
        public Guid UserRegistrationAsync(string name, string email, string passwordHash)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("CreateUser", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Name", name);
            cmd.Parameters.AddWithValue("@Email", email);
            cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);

            conn.Open();

            var result = cmd.ExecuteScalar();
            return result == null ? Guid.Empty : (Guid)result;
        }

        // ==================================================================================== [ User Registration Ends Here ]
        // =========================================================================================== [ User Creds Starts Here ]

        public UserModel AuthenticateUser(string email)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("AuthenticateUser", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Email", email);

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
                Name = reader.IsDBNull(reader.GetOrdinal("name"))
            ? null
            : reader.GetString(reader.GetOrdinal("name")),

                Email = reader.IsDBNull(reader.GetOrdinal("email"))
            ? null
            : reader.GetString(reader.GetOrdinal("email")),

                Phone = reader.IsDBNull(reader.GetOrdinal("phone"))
            ? null
            : reader.GetString(reader.GetOrdinal("phone")),

                Country = reader.IsDBNull(reader.GetOrdinal("country"))
            ? null
            : reader.GetString(reader.GetOrdinal("country")),

                City = reader.IsDBNull(reader.GetOrdinal("city"))
            ? null
            : reader.GetString(reader.GetOrdinal("city")),

                MissionDescription = reader.IsDBNull(reader.GetOrdinal("mission_description"))
            ? null
            : reader.GetString(reader.GetOrdinal("mission_description")),

                AvatarUrl = reader.IsDBNull(reader.GetOrdinal("avatar_url"))
            ? null
            : reader.GetString(reader.GetOrdinal("avatar_url")),

                SocialLinks = reader.IsDBNull(reader.GetOrdinal("social_links"))
            ? null
            : reader.GetString(reader.GetOrdinal("social_links")),

                IsPublic = reader.GetBoolean(reader.GetOrdinal("is_public")),
                RoleId = reader.GetInt32(reader.GetOrdinal("role_id")),

                AgreedToTermsAt = reader.IsDBNull(reader.GetOrdinal("agreed_to_terms_at"))
            ? null
            : reader.GetDateTime(reader.GetOrdinal("agreed_to_terms_at")),

                CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
                UpdatedAt = reader.GetDateTime(reader.GetOrdinal("updated_at"))
            };
        }

        public string? GetHashPasswordByEmail(string userEmail)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("GetHashPasswordByEmail", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Email", userEmail);

            conn.Open();
            using var reader = cmd.ExecuteReader();

            if (!reader.Read())
                return null;

            return reader.GetString(0); // PasswordHash
        }

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

        // ==================================================================== [ Profile Creation Starts Here]
        public async Task CreateUserProfileAsync(Guid userId, CreateUserProfile dto)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("CreateUserProfile", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@Name", (object?)dto.Name ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Email", (object?)dto.Email ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Phone", (object?)dto.Phone ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Country", (object?)dto.Country ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@City", (object?)dto.City ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@MissionDescription", (object?)dto.MissionDescription ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@AvatarUrl", (object?)dto.AvatarUrl ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@SocialLinks", (object?)dto.SocialLinks ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@IsPublic", dto.IsPublic);
            cmd.Parameters.AddWithValue("@RoleId", dto.RoleId);

            conn.Open();
            await cmd.ExecuteNonQueryAsync();
        }

        // ==================================================================== [ Profile Creation Ends Here]

        // ==================================================================== [ Profile Photo Update Starts Here]
        public async Task UpdateProfilePicAsync(Guid userId, string avatarUrl)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("UpdateProfilePic", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@AvatarUrl", avatarUrl);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }
        // ==================================================================== [ Profile Photo Update Ends Here]

        // ==================================================================== [ Profile Data Update Starts Here]
        public async Task UpdateUserProfileAsync(Guid userId, string country, string? city, string? email, string? phone,
            string? missionDescription, string? socialLinksJson)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("UpdateUserProfile", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@Country", country);
            cmd.Parameters.AddWithValue("@City", (object?)city ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Email", (object?)email ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Phone", (object?)phone ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@MissionDescription", (object?)missionDescription ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@SocialLinks", (object?)socialLinksJson ?? DBNull.Value);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }
        // ==================================================================== [ Profile Data Update Ends Here]

        // ==================================================================== [ Profile Password Update Starts Here]
        public async Task<string> GetPasswordHashAsync(Guid userId)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("GetPasswordHash", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserId", userId);

            conn.Open();
            return (string?)await cmd.ExecuteScalarAsync();
        }

        public async Task UpdatePasswordAsync(Guid userId, string passwordHash)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("UpdatePasswordHash", conn);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@PasswordHash", passwordHash);

            conn.Open();
            await cmd.ExecuteNonQueryAsync();
        }
        // ==================================================================== [ Profile Password Update Ends Here]

        // ==================================================================== [ Toggling Profile Visibility Starts Here]
        public async Task ToggleUserProfileAsync(Guid userId, int toggleProfile)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("DisableUserProfile", conn);

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@ToggleProfile", toggleProfile);

            conn.Open();
            await cmd.ExecuteNonQueryAsync();
        }

        // ==================================================================== [ Toggling Profile Visibility Ends Here]

        // ==================================================================== [ Public Profiles Starts Here]
        public async Task<List<DirectoryProfiles>> GetActivePublicProfilesAsync()
        {
            var result = new List<DirectoryProfiles>();

            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand("GetPublicDirectoryProfiles", conn);

            cmd.CommandType = CommandType.StoredProcedure;

            await conn.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                result.Add(new DirectoryProfiles
                {
                    ProfileId = reader.GetGuid(reader.GetOrdinal("ProfileId")),
                    UserId = reader.GetGuid(reader.GetOrdinal("UserId")),

                    Name = reader["name"].ToString()!,
                    Email = reader["email"] as string,
                    Phone = reader["phone"] as string,

                    Country = reader["country"].ToString()!,
                    City = reader["city"] as string,

                    MissionDescription = reader["mission_description"] as string,
                    AvatarUrl = reader["avatar_url"] as string,

                    SocialLinks = reader["social_links"] as string,
                    RoleId = Convert.ToInt32(reader["role_id"])
                });
            }

            return result;
        }

        // ==================================================================== [ Public Profiles Ends Here]
    }
}
