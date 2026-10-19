namespace HospitalityHub.Api.Sqlite.Data.Entities
{
	public class Room
    {
        public int Id { get; set; }
        public string RoomNumber { get; set; } = "";
        public string Type { get; set; } = "";
        public decimal PricePerNight { get; set; } 
        public bool IsAvailable { get; set; }
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
