using Microsoft.AspNetCore.Mvc;
using DevoteesAnusanga.Models;

namespace DevoteesAnusanga.Controllers
{
    [ApiController]
    [Route("api/")]
    public class HomeController : Controller
    { 
        // GET: api/home
        [HttpGet] 
        public IActionResult Get() 
        { 
            return Ok(new 
            { 
                message = "Hello from HomeController (GET)", 
                serverTime = DateTime.UtcNow 
            }); 
        }

        // POST: api/home
        [HttpPost]
        public IActionResult Post([FromBody] HomeRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            return Ok(new
            {
                message = "Data received successfully (POST)",
                receivedData = request
            });
        }
    }

}