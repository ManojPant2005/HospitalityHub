using System.ComponentModel.DataAnnotations;

namespace HospitalityHub.Api.Sqlite.Data.Entities;

public sealed class User
{
    public int Id { get; set; }

    [MaxLength(254)]
    public string Email { get; set; } = "";

    [MaxLength(254)]
    public string NormalizedEmail { get; set; } = "";

    [MaxLength(512)]
    public string PasswordHash { get; set; } = "";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
