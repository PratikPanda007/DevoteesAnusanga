using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using Microsoft.Data.SqlClient;
using DevoteesAnusanga.Helper;

namespace DevoteesAnusanga.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class RequireProfileAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;

            // 🔒 Not authenticated
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // 🔑 Get UserId from JWT
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var userId = Guid.Parse(userIdClaim);

            // ✅ Resolve DBUtils from DI
            var db = context.HttpContext
                .RequestServices
                .GetRequiredService<DBUtils>();

            var parameters = new[]
            {
                new SqlParameter("@UserId", userId)
            };

            var result = db.ExecuteScalar(
                "sp_UserProfile_Exists",
                parameters
            );

            var hasProfile = result != null && Convert.ToInt32(result) > 0;

            if (!hasProfile)
            {
                context.Result = new ObjectResult(new
                {
                    message = "Profile must be completed before accessing this resource."
                })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}
