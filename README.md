# 🏨 HospitalityHub - Full Stack Learning Project
### Angular 21 + .NET 10 Web API + SQL Server & SQLite

> Practical, hands-on learning project to master Angular by building and consuming real .NET APIs. No theory, only implementation.

![.NET]
![Angular]
![SQL Server]
![SQLite]

---

### 🎯 Why This Project?

I am from a .NET background. The goal of this repo is to:
- Build production-ready .NET APIs with both **SQL Server** (Enterprise) and **SQLite** (Lightweight)
- Learn modern standalone Angular architecture practically by consuming those APIs
- Document the entire journey for 【entity-GitHub¦canonical_name=GitHub】 portfolio

- **Live demo:** Not deployed yet. Follow the [free deployment guide](./DEPLOYMENT.md) to deploy it.
- **API health:** Not deployed yet.

### 🏗️ Architecture
HospitalityHub/
├── HospitalityHub.Api/ # .NET 10 API + SQL Server + EF Core
├── HospitalityHub.Api.Sqlite/ # .NET 10 API + SQLite (Same Code, Different Provider)
├── hospitality-client/ # Angular 21 Standalone Client
└── README.md



**Tech Stack:**
- **Backend:** .NET 10 Web API, Entity Framework Core, SQL Server, SQLite
- **Frontend:** Angular 21 Standalone, TypeScript, RxJS, HttpClient, Reactive Forms, Angular Material
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
- [x] Standalone Angular components and application routes
- [x] Shared API service with `HttpClient`, dependency injection, and Observables
- [x] Room management: create, list, and delete rooms
- [x] Booking form with reactive validation, live stay total, success, and API error feedback
- [x] Booking management: create and list reservations
- [x] Responsive room and booking views with a shared Poppins / Inter font stack
- [x] Signals for local UI state and computed booking summaries
- [x] Global HTTP interceptor for request loading state and API error notifications
- [x] JWT registration/login with password hashing, protected room/booking APIs, and browser token storage
- [x] Room search by number/type and six-room client-side pagination
- [x] Angular Material theme, Material cards, and booking table
- [x] Route guard redirects signed-out users to the login screen
- [ ] Booking update and cancellation (remaining Level 1 CRUD scope)
- [ ] Lazy-loaded feature routes

#### Learning progress
- **Level 1 — CRUD foundations:** Substantially complete. Room create/list/delete and booking create/list are implemented. Booking update/delete are not yet implemented, so full CRUD is still a future task.
- **Level 2 — Enterprise features:** JWT registration/login, protected APIs, a global HTTP interceptor, room search, and pagination are implemented.
- **Level 3 — Angular signals:** Already used for room and booking state, search/pagination, loading, errors, and computed summaries.
- **Level 3 — Angular Material:** Material 3 theming, room and summary cards, and a Material booking table are in place.
- **Deployment:** Follow the [free deployment guide](./DEPLOYMENT.md) to deploy the SQL Server API to Azure App Service/Azure SQL and Angular to Netlify. The separate SQLite API remains for local practice.
- **Learning notebook:** [Level 1, Level 2, and Level 3 notes](./hospitality-client/LEVEL-1-AND-LEVEL-2-NOTES.ipynb).

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
The API base URL is configured in `hospitality-client/src/app/core/config/api-base-url.ts`:

TypeScript
factory: () => 'https://localhost:7094/api', // SQL Server
// factory: () => 'https://localhost:7208/api', // SQLite

Reservations are saved with `POST /bookings` and displayed from `GET /bookings`.
The API validates the selected room and dates, then calculates and stores the stay total.

#### JWT signing key and database migration

Each API project requires a private JWT signing key. Configure it with .NET user-secrets; do not put the key in `appsettings.json` or commit it:

```powershell
dotnet user-secrets init --project HospitalityHub.Api\HospitalityHub.Api.csproj
$key = New-Object byte[] 64
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($key)
dotnet user-secrets set "Jwt:SigningKey" ([Convert]::ToBase64String($key)) --project HospitalityHub.Api\HospitalityHub.Api.csproj
dotnet ef database update --project HospitalityHub.Api\HospitalityHub.Api.csproj
```

For SQLite, run the same commands with `HospitalityHub.Api.Sqlite\HospitalityHub.Api.Sqlite.csproj`. Each API needs its own secret and database migration. The projects already have a user-secrets ID configured in this checkout.

Open `/register` to create an account, then sign in at `/login`. Passwords are hashed by the API; only the signed JWT and its expiry are stored in browser `localStorage`. The token interceptor sends it only to the configured API origin, and room/booking endpoints reject requests without a valid token. Browser storage is convenient for this learning app but is exposed to scripts running on the same origin; production authentication should also consider an HttpOnly, Secure, SameSite cookie and appropriate XSS protections.

 
 Learning Roadmap - My Progress
