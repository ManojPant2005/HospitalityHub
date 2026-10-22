# Free deployment guide

This guide deploys the Angular client to Netlify and the .NET 10 SQLite API to Render using their free plans. It does not require a paid subscription, but it is a learning/demo setup, not production hosting.

## Important: free SQLite storage is temporary on Render

Render's free web services use an ephemeral filesystem and can restart or spin down when idle. The SQLite file used by this deployment can be lost on a restart or redeploy, which also removes registered users, rooms, and bookings. The API runs EF Core migrations automatically at startup so it can recreate its tables, but migrations cannot restore deleted data.

Render persistent disks require a paid web service. Treat the free deployment as a public demo with disposable data. Visitors can register a fresh account and add sample data. Do not enter real guest or payment information. If you later need durable production data, move to a persistent database and hosting plan before collecting real data.

## 1. Prepare the repository

1. Push the project to a GitHub repository.
2. Use the Node.js 22 LTS version recorded in `hospitality-client/.nvmrc` for Angular builds. Angular currently warns about odd-numbered Node.js versions.
3. The root `Dockerfile` builds the SQLite API. Render uses it to publish the API container.
4. The API's `/health` endpoint is available for Render's health check.

## 2. Deploy the API to Render

1. Sign in to [Render](https://render.com) and create a **New + → Web Service**.
2. Connect the GitHub repository containing HospitalityHub.
3. Select **Docker** as the runtime and use the repository root as the Docker build context. Render will use the root `Dockerfile`.
4. Select the **Free** instance type, then create the service.
5. In the service's **Settings**, set the health check path to `/health`.
6. In **Environment**, add these variables:

   | Key | Value |
   | --- | --- |
   | `ASPNETCORE_ENVIRONMENT` | `Production` |
   | `ConnectionStrings__DefaultConnection` | `Data Source=/tmp/HospitalityHub.db` |
   | `Cors__AllowedOrigins` | `http://localhost:4200` (replace after deploying the client) |
   | `Jwt__Issuer` | `HospitalityHub` |
   | `Jwt__Audience` | `HospitalityHubClient` |
   | `Jwt__AccessTokenMinutes` | `60` |
   | `Jwt__SigningKey` | Generate a new secret of at least 32 UTF-8 bytes; see below |

   Generate a suitable key locally in PowerShell and copy its output into Render's secret value field:

   ```powershell
   $bytes = New-Object byte[] 64
   [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```

   Do not commit the generated value or put it in this guide.

7. Save the environment variables and wait for the first deployment to finish.
8. Open `https://<your-render-service>.onrender.com/health`. It should return a small JSON response with `"status":"healthy"`. Save the Render service URL; the API base URL will end in `/api`.

The free service can take a little time to respond after it has been idle. This is expected for a free-tier demo.

## 3. Point Angular at the deployed API

Open [api-base-url.ts](./hospitality-client/src/app/core/config/api-base-url.ts) and change the default URL from the local API address to your Render URL:

```ts
factory: () => 'https://<your-render-service>.onrender.com/api',
```

Replace the example host with the actual Render hostname. Commit and push this change so Netlify builds the client with the correct API address.

## 4. Deploy Angular to Netlify

1. Sign in to [Netlify](https://www.netlify.com) and choose **Add new site → Import an existing project**.
2. Connect the GitHub repository.
3. Configure the build:

   | Setting | Value |
   | --- | --- |
   | Base directory | `hospitality-client` |
   | Build command | `npm run build` |
   | Publish directory | `dist/hospitality-client/browser` |

4. Deploy the site and copy its public HTTPS URL, for example `https://your-site-name.netlify.app`.
5. Return to Render and set `Cors__AllowedOrigins` to exactly the Netlify origin (scheme and host only, with no trailing slash), for example `https://your-site-name.netlify.app`. Save the setting and wait for Render to restart.
6. Open the Netlify URL. Register a demo account, sign in, add a room, and create a booking. Refresh a nested route such as `/bookings` to confirm SPA route fallback works.

The `hospitality-client/public/_redirects` file supplies Netlify's SPA fallback so Angular routes load on direct navigation and refresh.

## 5. Add live links to the project README

Once both sites are live, replace the placeholders near the top of the root [README](./README.md):

```md
**Live Demo:** https://your-site-name.netlify.app
**API Health:** https://your-render-service.onrender.com/health
```

Do not publish demo credentials in the README. The free API's SQLite data may be cleared at any time, so a new visitor may need to register a new account.

## Troubleshooting

- **Browser CORS error:** `Cors__AllowedOrigins` must exactly match the Netlify origin, such as `https://your-site.netlify.app`; save the Render setting and wait for a restart.
- **API cannot be reached:** Check the Render deployment logs and `/health`. A sleeping free instance can need time to wake up.
- **Login or room data disappears:** This is the known consequence of SQLite on Render's ephemeral free filesystem. The app will create the database again, but old records are not recoverable.
- **A route works through navigation but not refresh:** Confirm `public/_redirects` exists and Netlify's publish directory is `dist/hospitality-client/browser`.
- **Login returns 500:** Verify all `Jwt__*` environment variables are set, especially that the signing key is at least 32 bytes.

## Reference links

- [Render free service limitations](https://render.com/docs/free)
- [Render Docker services](https://render.com/docs/docker)
- [Render filesystem and persistent disk behavior](https://render.com/docs/disks)
- [Netlify Angular deployment guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/angular/)
- [Angular deployment guide](https://angular.dev/tools/cli/deployment)
