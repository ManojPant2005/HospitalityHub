namespace HospitalityHub.Api.Sqlite.Data.Entities
{
    public class Booking
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public Room? Room { get; set; }
        public string GuestName { get; set; } = "";
        public string GuestEmail { get; set; } = "";
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public string Status { get; set; } = "Confirmed"; // Confirmed, CheckedIn, CheckedOut, Cancelled
        public decimal TotalAmount { get; set; }
    }
}
