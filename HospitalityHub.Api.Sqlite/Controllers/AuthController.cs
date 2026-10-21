using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HospitalityHub.Api.Sqlite.Data;
using HospitalityHub.Api.Sqlite.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HospitalityHub.Api.Sqlite.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public sealed class AuthController(
    AppDbContext db,
    IPasswordHasher<User> passwordHasher,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        if (await db.Users.AnyAsync(user => user.NormalizedEmail == normalizedEmail))
        {
            return Conflict(new ProblemDetails { Title = "An account with this email already exists." });
        }

        var user = new User
        {
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Created("/api/auth/login", new { user.Id, user.Email });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await db.Users.SingleOrDefaultAsync(
            account => account.NormalizedEmail == normalizedEmail);

        if (user is null ||
            passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password)
                == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new ProblemDetails { Title = "Email or password is incorrect." });
        }

        var signingKey = Encoding.UTF8.GetBytes(configuration["Jwt:SigningKey"]!);
        var issuer = configuration["Jwt:Issuer"]!;
        var audience = configuration["Jwt:Audience"]!;
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(
            configuration.GetValue<int>("Jwt:AccessTokenMinutes"));
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(signingKey),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return Ok(new
        {
            accessToken = new JwtSecurityTokenHandler().WriteToken(token),
            expiresAtUtc,
            user = new { user.Id, user.Email },
        });
    }

    private static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();
}

public sealed class RegisterRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = "";

    [Required]
    [MinLength(8)]
    [MaxLength(128)]
    public string Password { get; init; } = "";
}

public sealed class LoginRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = "";

    [Required]
    [MaxLength(128)]
    public string Password { get; init; } = "";
}
