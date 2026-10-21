using System.ComponentModel.DataAnnotations;
using HospitalityHub.Api.Data;
using HospitalityHub.Api.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalityHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var bookings = await db.Bookings
            .Include(booking => booking.Room)
            .OrderByDescending(booking => booking.CheckIn)
            .ToListAsync();

        return Ok(bookings.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var booking = await db.Bookings
            .Include(item => item.Room)
            .FirstOrDefaultAsync(item => item.Id == id);

        return booking is null ? NotFound() : Ok(ToResponse(booking));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBookingRequest request)
    {
        var checkIn = request.CheckIn.Date;
        var checkOut = request.CheckOut.Date;
        if (checkOut <= checkIn)
        {
            return BadRequest(new ProblemDetails { Title = "Check-out must be after check-in." });
        }
        if (checkIn < DateTime.Today)
        {
            return BadRequest(new ProblemDetails { Title = "Check-in cannot be in the past." });
        }

        var room = await db.Rooms.FindAsync(request.RoomId);
        if (room is null)
        {
            return BadRequest(new ProblemDetails { Title = "The selected room could not be found." });
        }
        if (!room.IsAvailable)
        {
            return Conflict(new ProblemDetails { Title = "The selected room is not available for booking." });
        }

        var hasConflict = await db.Bookings.AnyAsync(booking =>
            booking.RoomId == request.RoomId
            && booking.Status != "Cancelled"
            && booking.CheckIn < checkOut
            && checkIn < booking.CheckOut);
        if (hasConflict)
        {
            return Conflict(new ProblemDetails { Title = "The selected room is already booked for those dates." });
        }

        var booking = new Booking
        {
            RoomId = room.Id,
            Room = room,
            GuestName = request.GuestName.Trim(),
            GuestEmail = request.GuestEmail.Trim(),
            CheckIn = checkIn,
            CheckOut = checkOut,
            Status = "Confirmed",
            TotalAmount = room.PricePerNight * (checkOut - checkIn).Days,
        };

        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, ToResponse(booking));
    }

    private static object ToResponse(Booking booking) => new
    {
        booking.Id,
        booking.RoomId,
        booking.GuestName,
        booking.GuestEmail,
        booking.CheckIn,
        booking.CheckOut,
        booking.Status,
        booking.TotalAmount,
        Room = booking.Room is null
            ? null
            : new
            {
                booking.Room.Id,
                booking.Room.RoomNumber,
                booking.Room.Type,
                booking.Room.PricePerNight,
                booking.Room.IsAvailable,
            },
    };
}

public sealed class CreateBookingRequest
{
    [Range(1, int.MaxValue)]
    public int RoomId { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string GuestName { get; init; } = "";

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string GuestEmail { get; init; } = "";

    public DateTime CheckIn { get; init; }

    public DateTime CheckOut { get; init; }
}
