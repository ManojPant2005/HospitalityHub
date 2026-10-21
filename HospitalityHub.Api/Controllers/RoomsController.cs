using HospitalityHub.Api.Data;
using HospitalityHub.Api.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace HospitalityHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public RoomsController(AppDbContext db) => _db = db;

        [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _db.Rooms.ToListAsync());
        [HttpGet("{id}")] public async Task<IActionResult> Get(int id) => Ok(await _db.Rooms.FindAsync(id));

        [HttpPost]
        public async Task<IActionResult> Create(Room room)
        {
            _db.Rooms.Add(room);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = room.Id }, room);
        }
        [HttpPut("{id}")] public async Task<IActionResult> Update(int id, Room room)
        {
            if (id != room.Id) return BadRequest();
            _db.Entry(room).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id)
        {
            var room = await _db.Rooms.FindAsync(id);
            if (room == null) return NotFound();
            _db.Rooms.Remove(room);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}