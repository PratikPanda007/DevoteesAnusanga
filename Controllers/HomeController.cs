using Microsoft.AspNetCore.Mvc;
using DevoteesAnusanga.Models;
using DevoteesAnusanga.Helper;

namespace DevoteesAnusanga.Controllers
{
    [ApiController]
    [Route("api/")]
    public class HomeController : Controller
    {
        private readonly DBUtils _db;

        public HomeController(DBUtils db)
        {
            _db = db;
        }

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

        [HttpPost("Countries")]
        public IActionResult GetAllCountries()
        {
            var countries = _db.GetAllCountries();
            return Ok(countries);
        }
    }

}