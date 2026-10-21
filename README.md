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
- [x] Standalone Angular components and application routes
- [x] Shared API service with `HttpClient`, dependency injection, and Observables
- [x] Room management: create, list, and delete rooms
- [x] Booking form with reactive validation, live stay total, success, and API error feedback
- [x] Booking management: create and list reservations
- [x] Responsive room and booking views with a shared Poppins / Inter font stack
- [x] Signals for local UI state and computed booking summaries
- [x] Global HTTP interceptor for request loading state and API error notifications
- [ ] Booking update and cancellation (remaining Level 1 CRUD scope)
- [ ] Route guards and lazy-loaded feature routes

#### Learning progress
- **Level 1 — CRUD foundations:** Substantially complete. Room create/list/delete and booking create/list are implemented. Booking update/delete are not yet implemented, so full CRUD is still a future task.
- **Level 2 — Enterprise features:** In progress. A functional HTTP interceptor now tracks active requests and surfaces API failures globally. See the beginner-friendly [Level 1 and Level 2 learning notebook](./hospitality-client/LEVEL-1-AND-LEVEL-2-NOTES.ipynb).

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
// private baseUrl = 'https://localhost:7208/api'; // For SQLite

Reservations are saved with `POST /bookings` and displayed from `GET /bookings`.
The API validates the selected room and dates, then calculates and stores the stay total.

 
 Learning Roadmap - My Progress
