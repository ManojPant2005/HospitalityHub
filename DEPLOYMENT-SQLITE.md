# Deploy the SQLite API and Angular app for free

This is a separate demo deployment path for people who cannot use Azure SQL or paid hosting. It deploys the **SQLite practice API** to a Render Free web service and the Angular app to Netlify. It does not deploy the SQL Server API.

## Important limitations before starting

- Render Free web services sleep after 15 minutes without inbound traffic. A cold start can take about a minute.
- Render's free filesystem is ephemeral. The SQLite database file can be lost when the service spins down, restarts, or redeploys. Registered users, rooms, and bookings are demo data and may need to be recreated.
- Render Free web services are for learning and demos, not production workloads.
- Render currently offers Free services, but account verification or signup requirements can change. Confirm you can create a Free service without adding a payment method before spending time on the deployment. This guide cannot guarantee every account will be eligible.
- Do not enter real guest or payment information.

## Architecture

```text
Browser -> Netlify (Angular)
        -> Render Free web service (HospitalityHub.Api.Sqlite, .NET 10)
        -> SQLite file in the service's ephemeral filesystem
```

The API applies EF Core migrations automatically at startup and reads its listen port from Render's `PORT` environment variable.

## 1. Deploy the API to Render

1. Push the repository to GitHub.
2. Sign in to [Render](https://render.com) and choose **New + → Web Service**.
3. Connect the repository.
4. Set **Root Directory** to `HospitalityHub.Api.Sqlite`. This makes that directory the Docker build context; Render will find its `Dockerfile`.
5. Select **Docker** for the runtime and select the **Free** instance type.
6. Create the service. Choose the service name `hospitalityhub-api` if Render says it is available; otherwise use another name and update the Angular runtime config in step 3.
7. In service settings, set the health check path to `/health`.
8. Add these environment variables under **Environment**:

   | Name | Value |
   | --- | --- |
   | `ASPNETCORE_ENVIRONMENT` | `Production` |
   | `ConnectionStrings__DefaultConnection` | `Data Source=/tmp/HospitalityHub.db` |
   | `Cors__AllowedOrigins` | `https://<your-netlify-site>.netlify.app` after creating the client; temporarily use `http://localhost:4200` |
   | `Jwt__Issuer` | `HospitalityHub` |
   | `Jwt__Audience` | `HospitalityHubClient` |
   | `Jwt__AccessTokenMinutes` | `60` |
   | `Jwt__SigningKey` | A generated secret with at least 32 UTF-8 bytes |

   Generate a secret locally in PowerShell and enter its output directly into Render's environment settings. Do not commit it:

   ```powershell
   $bytes = New-Object byte[] 64
   [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```

9. Save the environment and wait for the deployment to finish.
10. Verify `https://<your-render-service>.onrender.com/health` returns `{"status":"healthy"}`. Save the exact service hostname.

The API does not expose Swagger UI in Production. Use `/health` to verify it is responding.

## 2. Configure Angular for local SQL Server and deployed SQLite

The app now selects its API URL based on build mode:

- `ng serve` / development build: `https://localhost:7094/api` (the existing local SQL Server API).
- Production build: the API URL from `hospitality-client/public/runtime-config.js` (the deployed SQLite API).

After creating the Render service, edit `hospitality-client/public/runtime-config.js` and replace the example URL with your exact Render URL:

```js
window.hospitalityConfig = {
  apiBaseUrl: 'https://<your-render-service>.onrender.com/api',
};
```

Keep `/api` at the end. Commit and push the config change so Netlify builds the frontend with the right URL.

## 3. Deploy Angular to Netlify

1. Sign in to [Netlify](https://www.netlify.com) and choose **Add new site → Import an existing project**.
2. Connect the GitHub repository.
3. Set the build options:

   | Setting | Value |
   | --- | --- |
   | Base directory | `hospitality-client` |
   | Build command | `npm run build` |
   | Publish directory | `dist/hospitality-client/browser` |

4. Deploy and copy the exact HTTPS origin, e.g. `https://your-site-name.netlify.app`.
5. In Render, set `Cors__AllowedOrigins` to exactly the Netlify origin (scheme and hostname only; no trailing slash), then save and wait for the API to restart.
6. Test the Netlify URL: register a demo account, sign in, create a room, and make a booking. Refresh `/bookings` to check Angular's SPA route fallback.

The file `hospitality-client/public/_redirects` provides the SPA fallback for Netlify routes.

## 4. Update the project README with live links

Replace the pending live links near the top of the root `README.md` once you have deployed:

```md
**Live demo:** https://your-site-name.netlify.app
**API health:** https://your-render-service.onrender.com/health
```

Never publish a password, JWT signing key, or other secret. Be clear in your portfolio that this uses Render's free tier and that demo data may reset.

## Troubleshooting

- **Render deploy fails:** Check the Render build and runtime logs. Confirm the service root directory is exactly `HospitalityHub.Api.Sqlite` and the Dockerfile is in that folder.
- **API fails to start:** Verify all `Jwt__*` settings are present and the signing key contains at least 32 bytes. Check Render logs for the startup exception.
- **`/health` returns 404:** Confirm the correct .NET API was deployed and the health-check path is `/health`, not `/api/health`.
- **Browser reports CORS:** `Cors__AllowedOrigins` must exactly equal the Netlify origin. Wait for Render to restart after changing it.
- **Rooms/bookings vanish:** The SQLite file is on Render's ephemeral filesystem and is not durable. This is expected on the Free plan.
- **First API request is slow:** A Free service sleeps when idle and may take about a minute to start on the next request.

## Official platform documentation

- [Render Free instance limitations](https://render.com/docs/free)
- [Render Docker deploys](https://render.com/docs/docker)
- [Render filesystem behavior](https://render.com/docs/deploys#ephemeral-filesystem)
- [Netlify Angular deployment](https://docs.netlify.com/build/frameworks/framework-setup-guides/angular/)
- [Angular deployment](https://angular.dev/tools/cli/deployment)
