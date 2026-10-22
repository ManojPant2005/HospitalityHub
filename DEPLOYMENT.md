# Free deployment guide

This guide deploys the **SQL Server Web API** to Azure App Service and Azure SQL Database, and the Angular client to Netlify. The SQLite API is for local practice and testing; it is not part of this deployment.

The target is a portfolio/demo environment. Azure free quotas and eligibility can change and may require an Azure account with a payment method. Before creating resources, confirm the portal shows the free offer/price and configure a cost alert. Do not use real guest or payment data.

## Deployment architecture

```text
Browser -> Netlify (Angular client)
        -> Azure App Service (HospitalityHub.Api, .NET 10)
        -> Azure SQL Database (free offer, SQL Server compatible)
```

Azure SQL is a managed SQL Server database service, not SQLite. Do **not** deploy `HospitalityHub.Api.Sqlite` for this workflow.

## 1. Prepare the repository

1. Push the repository to GitHub.
2. Use Node.js 22 LTS for local Angular builds; the version is recorded in `hospitality-client/.nvmrc`.
3. Keep the client API URL pointed at local `https://localhost:7094/api` until the API is deployed.
4. The SQL Server API exposes `/health` for a manual availability check.

## 2. Create the free Azure SQL Database

1. Sign in to the [Azure portal](https://portal.azure.com) and open the [Azure SQL hub](https://aka.ms/azuresqlhub).
2. Choose **Create a database → Start free**. Use an Azure subscription and region available to you.
3. In the cost summary, verify the database is using the free offer and shows the expected free cost before creating it. Select the free-limit behavior that **pauses the database when the free monthly allowance is exhausted** (`AutoPause`), not the option that continues and bills for overage.
4. Create or select a logical SQL server. Save its server name, database name, and administrator login somewhere private.
5. In the SQL server's **Networking** settings, leave public network access enabled for the demo, but do not add a rule that allows every IP address.

The free offer has monthly limits. At those limits the database can pause until the allowance renews. Check the current Azure SQL free offer details before deployment; quotas, eligibility, and portal labels can change.

## 3. Create the Azure App Service for the API

1. In Azure, create a **Web App** in the same region as the database.
2. Select **Code** deployment, **Windows**, and the **.NET 10** runtime stack.
3. Create or select an App Service plan and choose **Free F1**. Verify the pricing tier says Free before creating it.
4. In **Deployment Center**, connect the GitHub repository and select the branch to deploy.
5. Configure the workflow to build/publish the SQL Server API project:
   - Project: `HospitalityHub.Api/HospitalityHub.Api.csproj`
   - Publish output: the project publish output (do not deploy the repository root or the SQLite API).
6. Commit and push the generated GitHub Actions workflow. Check the workflow and App Service deployment logs until the deployment succeeds.

Free F1 is shared, quota-limited compute for a demo; it is not appropriate for a production workload.

## 4. Configure the API's Azure settings

In the Web App, open **Settings → Environment variables** (or **Configuration → Application settings**, depending on the portal view) and add:

| Name | Value |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | Azure SQL connection string for the database |
| `Cors__AllowedOrigins` | `http://localhost:4200` temporarily; replace with the Netlify origin after deployment |
| `Jwt__Issuer` | `HospitalityHub` |
| `Jwt__Audience` | `HospitalityHubClient` |
| `Jwt__AccessTokenMinutes` | `60` |
| `Jwt__SigningKey` | A random secret of at least 32 UTF-8 bytes |

Use the SQL server name, database name, and SQL authentication credentials from Azure. Require encryption; the connection string should include `Encrypt=True` and `TrustServerCertificate=False`. Store the connection string and signing key only in App Service environment settings, never in source control or `appsettings.json`.

Generate a signing key locally in PowerShell, then put its output directly into the App Service setting:

```powershell
$bytes = New-Object byte[] 64
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### Allow the App Service to reach SQL Server

1. In the Web App's **Properties**, find **Outbound IP addresses** and **Additional outbound IP addresses**.
2. Add a firewall rule on the Azure SQL logical server for each listed address (single-IP start and end).
3. If you later change the App Service plan or region, check these lists again and update the SQL firewall rules.

Avoid selecting **Allow Azure services and resources to access this server** for a public demo unless you consciously accept that broader network rule.

## 5. Apply database migrations

The SQL Server API does not run schema migrations automatically at startup. Apply EF Core migrations to the Azure database before testing the endpoints.

1. Temporarily add your current public IP as a single-IP firewall rule on the Azure SQL server.
2. Configure the Azure SQL connection string as a local .NET user secret for the SQL Server API project; do not put it in a tracked settings file. The connection string must target the Azure database and use encryption. Because EF tooling starts the API host, make sure the local user secrets also include a valid JWT signing key and the JWT issuer/audience settings described in the root README.
3. From the repository root, use an EF CLI version matching the project's EF Core 10 packages and run:

   ```powershell
   dotnet ef database update --project HospitalityHub.Api\HospitalityHub.Api.csproj
   ```

4. Confirm the command completes successfully, then remove the temporary local-IP firewall rule.
5. If you later add migrations, repeat this migration step before deploying code that requires the new schema.

For the first setup, make sure the API's `Users`, `Rooms`, and `Bookings` tables exist in the Azure database before proceeding.

## 6. Verify the SQL Server API

1. Open `https://<your-app-name>.azurewebsites.net/health`. It should return `{"status":"healthy"}`.
2. Verify the Azure App Service environment settings include the correct SQL connection string and JWT configuration.
3. Test the API from the Angular app after the client is configured below. Registration and login should persist data in Azure SQL; the data is not stored in an app-local SQLite file.

## 7. Point Angular to the Azure API

Open [api-base-url.ts](./hospitality-client/src/app/core/config/api-base-url.ts) and set the URL to the deployed Web App:

```ts
factory: () => 'https://<your-app-name>.azurewebsites.net/api',
```

Replace the example hostname, save, commit, and push this change. The Netlify build must use this deployed API URL, not the local development URL.

## 8. Deploy Angular to Netlify

1. In [Netlify](https://www.netlify.com), choose **Add new site → Import an existing project** and connect the GitHub repository.
2. Configure the build:

   | Setting | Value |
   | --- | --- |
   | Base directory | `hospitality-client` |
   | Build command | `npm run build` |
   | Publish directory | `dist/hospitality-client/browser` |

3. Deploy and copy the HTTPS site origin, for example `https://your-site-name.netlify.app`.
4. In the Azure Web App's environment settings, change `Cors__AllowedOrigins` to exactly that origin (scheme and host only, no trailing slash). Save and allow the app to restart.
5. Open the Netlify site, register a demo account, sign in, add a room, and create a booking. Refresh a nested route such as `/bookings` to verify Angular routing.

The `hospitality-client/public/_redirects` file provides the Netlify SPA fallback for direct navigation and refreshes.

## 9. Add your live URLs to the README

Replace the pending live links near the top of the root [README](./README.md):

```md
**Live demo:** https://your-site-name.netlify.app
**API health:** https://your-app-name.azurewebsites.net/health
```

Never publish a demo account password, SQL credentials, JWT signing key, or full database connection string.

## Troubleshooting

- **CORS error in the browser:** `Cors__AllowedOrigins` must exactly match the Netlify origin. Save the setting and restart/redeploy the Web App.
- **SQL connection timeout:** Check that every current App Service outbound IP is allowed by the SQL server firewall and the database is not paused at its free limit.
- **Login returns 500:** Check App Service logs and verify the connection string plus all `Jwt__*` settings.
- **No tables or “invalid object name”:** Apply EF Core migrations to Azure SQL before testing.
- **Changes are not deploying:** Check the GitHub Actions run generated by Deployment Center and confirm it publishes `HospitalityHub.Api`, not `HospitalityHub.Api.Sqlite`.
- **Charges or quota concerns:** Confirm the database remains on the free offer with `AutoPause`, the Web App remains on F1 Free, and review Azure Cost Management. Free quotas are not an unconditional guarantee of zero charges.

## Reference links

- [Azure SQL Database free offer](https://learn.microsoft.com/azure/azure-sql/database/free-tier)
- [Azure App Service plans and free tier](https://learn.microsoft.com/azure/app-service/overview-hosting-plans)
- [Configure Azure SQL firewall rules](https://learn.microsoft.com/azure/azure-sql/database/firewall-configure)
- [Deploy ASP.NET Core to Azure App Service](https://learn.microsoft.com/azure/app-service/quickstart-dotnetcore)
- [Netlify Angular deployment guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/angular/)
- [Angular deployment guide](https://angular.dev/tools/cli/deployment)
