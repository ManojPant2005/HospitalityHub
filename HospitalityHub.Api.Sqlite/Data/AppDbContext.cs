using Microsoft.EntityFrameworkCore;

namespace HospitalityHub.Api.Sqlite.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Entities.Room> Rooms { get; set; } = null!;
        public DbSet<Entities.Booking> Bookings { get; set; } = null!;
    }
}
