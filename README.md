# HospitalityHub - Angular + .NET Project

I built this to learn Angular practically. I am from .NET background, so I started with .NET API first and then consumed it in Angular.

**Live Links:**
- **Frontend (Angular):** https://hospitality-client.netlify.app/
- **Backend API (SQLite):** https://hospitalityhub-j5yl.onrender.com/swagger

> Note: Backend is on Render free plan. It goes to sleep if no one uses it. First time you open it, wait for 30 seconds.

---

### What I built?

A simple Hotel Management System.

**Rooms:**
- Add new rooms (room number, type, price)
- See all rooms
- Delete rooms

**Bookings:**
- Book a room for a guest
- Select check-in / check-out dates
- It auto-calculates total amount (nights x price)
- See all bookings with room details

### What I used?

**Backend:**
- .NET 8 Web API
- Entity Framework Core
- SQL Server (for local development)
- SQLite (for live deployment on Render - because it needs no extra database server)

**Frontend:**
- Angular 17 (Standalone components, no modules)
- TypeScript
- Reactive Forms
- HttpClient to call API

### Project folders

HospitalityHub.Api -> .NET API with SQL Server (my local setup)
HospitalityHub.Api.Sqlite -> Same API but with SQLite (this one is live on Render)
hospitality-client -> Angular app (this one is live on Netlify)


Both APIs have same code, only database is different. I did this to show I can work with both.
### How to run locally?
**1. Run API (SQL Server version)**

cd HospitalityHub.Api
dotnet ef database update
dotnet run

It will run at https://localhost:7094 - open /swagger to test
**2. Run API (SQLite version) - easier, no SQL Server needed**


cd HospitalityHub.Api.Sqlite
dotnet ef database update
dotnet run


This will create a file HospitalityHub.db - that is your full database.
**3. Run Angular app**
cd hospitality-client
npm install
ng serve



Open http://localhost:4200

If you want to switch between local API and live API, change this file:
`src/app/core/services/api.ts` -> change baseUrl

### What I learned?

- How to create .NET Web API with EF Core
- How to use same business logic with 2 different databases (SQL Server vs SQLite)
- How to handle CORS issue between Angular and .NET
- Angular standalone components, services, routing
- Reactive Forms with validation
- Calculating total amount based on dates
- Deploying backend to Render and frontend to Netlify without credit card

### What's next?

- Add login with JWT
- Add edit room feature
- Add search and pagination
- Make UI better with Angular Material

### My deployment

I deployed without any paid plan or credit card:
- Frontend: Netlify (free)
- Backend: Render (free)

This was the main challenge but now both are live.


Built by a .NET dev learning Angular. This repo is my practical learning diary.