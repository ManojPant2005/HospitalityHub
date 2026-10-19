using HospitalityHub.Api.Sqlite.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Register services
builder.Services.AddOpenApi();
builder.Services.AddControllers();

// 2. Configure Entity Framework Core and SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Configure CORS for the Angular frontend
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAngular", policy =>
	{
		policy
			.WithOrigins("http://localhost:4200")
			.AllowAnyMethod()
			.AllowAnyHeader();
	});
});

// 4. Build the application
var app = builder.Build();

// 5. Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
}

app.UseHttpsRedirection();

// 6. Apply CORS middleware
app.UseCors("AllowAngular");
app.MapControllers();

// 7. Weather Forecast endpoint
var summaries = new[]
{
	"Freezing",
	"Bracing",
	"Chilly",
	"Cool",
	"Mild",
	"Warm",
	"Balmy",
	"Hot",
	"Sweltering",
	"Scorching"
};

app.MapGet("/weatherforecast", () =>
{
	var forecast = Enumerable.Range(1, 5)
		.Select(index =>
			new WeatherForecast(
				DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
				Random.Shared.Next(-20, 55),
				summaries[Random.Shared.Next(summaries.Length)]
			)
		)
		.ToArray();

	return forecast;
})
.WithName("GetWeatherForecast");

// 8. Run the application
app.Run();

// 9. Weather Forecast model
record WeatherForecast(
	DateOnly Date,
	int TemperatureC,
	string? Summary)
{
	public int TemperatureF =>
		32 + (int)(TemperatureC / 0.5556);
}
