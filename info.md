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



# 🏨 HospitalityHub - Full Stack Learning Project
### Angular 17 + .NET 8 Web API + SQL Server & SQLite

> Practical, hands-on learning project to master Angular by building and consuming real .NET APIs. No theory, only implementation.

![.NET]
![Angular]
![SQL Server]
![SQLite]

---

### 🎯 Why This Project?

I am from a .NET background. The goal of this repo is to:
- Build production-ready .NET APIs with both **SQL Server** (Enterprise) and **SQLite** (Lightweight)
- Learn Angular 17+ Standalone architecture practically by consuming those APIs
- Document the entire journey for 【entity-GitHub¦canonical_name=GitHub】 portfolio

**Live Demo:** `http://localhost:4200` (Angular) consuming `https://localhost:7094/api` (.NET)

### 🏗️ Architecture
HospitalityHub/
├── HospitalityHub.Api/ # .NET 8 API + SQL Server + EF Core
├── HospitalityHub.Api.Sqlite/ # .NET 8 API + SQLite (Same Code, Different Provider)
├── hospitality-client/ # Angular 17 Standalone Client
└── README.md



**Tech Stack:**
- **Backend:** .NET 8 Web API, Entity Framework Core, SQL Server, SQLite
- **Frontend:** Angular 17 Standalone, TypeScript, RxJS, HttpClient, Reactive Forms
- **Tools:** Swagger, Angular CLI, Git

### ✨ Features Implemented

#### Domain: Mini Hotel Management System
- **Rooms Module:** CRUD, Room Types (Standard, Deluxe, Suite), Price Management, Availability Status
- **Bookings Module:** Guest Management, Check-in/Check-out, Status Tracking, Total Amount Calculation

#### Backend Highlights
- [x] Clean Models with Navigation Properties (Room -> Bookings)
- [x] EF Core Code-First Migrations
- [x] Dual Database Support - Same Business Logic, Two Providers
- [x] CORS Enabled for Angular Client
- [x] RESTful APIs with Swagger Documentation

#### Frontend Highlights
- [x] Standalone Components (No NgModules - Modern Angular)
- [x] Generic ApiService with Observables
- [x] Service Injection & Dependency Injection
- [ ] Reactive Forms for Booking (Next)
- [ ] Route Guards & Lazy Loading (Next)
- [ ] Signals for State Management (Next)

###  Getting Started - Run Locally

#### 1. Clone & Run SQL Server API

cd HospitalityHub.Api
dotnet restore
dotnet ef database update
dotnet run
# API will run at https://localhost:7094 - Check Swagger

Update appsettings.json with your SQL Server:

JSON
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=HospitalityHubDB;Trusted_Connection=True;TrustServerCertificate=True;"
2. Run SQLite API (Alternative)
Bash
cd HospitalityHub.Api.Sqlite
dotnet restore
dotnet ef database update
dotnet run
# Creates HospitalityHub.db file - No SQL Server needed!

1 line hidden
3. Run Angular Client



Bash
cd hospitality-client
npm install
ng serve
# App runs at http://localhost:4200
Change API URL in src/app/core/services/api.ts:

TypeScript
private baseUrl = 'https://localhost:7094/api'; // For SQL Server
// private baseUrl = 'https://localhost:7200/api'; // For SQLite

 
 Learning Roadmap - My Progress