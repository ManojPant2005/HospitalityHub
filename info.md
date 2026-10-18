# 18th October - "Day 1 - .NET API with Rooms & Bookings - SQL Server"

Step 1: Create .NET API with SQL Server
Open terminal where you want your project.

# Create solution folder
mkdir HospitalityHub && cd HospitalityHub
dotnet new sln -n HospitalityHub

# Create API project
dotnet new webapi -n HospitalityHub.Api
dotnet sln add HospitalityHub.Api/HospitalityHub.Api.csproj

cd HospitalityHub.Api

# Add packages for SQL Server + EF Core
dotnet add package 【entity-Microsoft¦canonical_name=Microsoft】.EntityFrameworkCore.SqlServer
dotnet add package 【entity-Microsoft¦canonical_name=Microsoft】.EntityFrameworkCore.Design
dotnet add package 【entity-Microsoft¦canonical_name=Microsoft】.EntityFrameworkCore.Tools

Now edit appsettings.json - add your SQL Server connection:

JSON
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=HospitalityHubDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
If you use SSMS with SA login, use: Server=localhost;Database=HospitalityHubDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True;

# Create Entities | Data Context | Controllers | Update Program.cs | Implement Migrations

## -------------------------------------------------------------------------------------------------##

Day 2 - Angular Frontend with Rooms & Bookings - SQL Server	