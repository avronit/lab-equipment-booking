# Lab Equipment Booking System

React/Vite client plus ASP.NET Core 8 API for laboratory equipment reservations.

## Local setup

Install Node.js 20+, npm, and the .NET 8 SDK. A local PostgreSQL instance is required for the current API configuration.

1. Create a database named `lab_equipment_booking`.
2. Run `database/001-initial-schema.sql` and `database/002-seed-stations.sql`.
3. Set `ConnectionStrings:DefaultConnection` in `server/appsettings.json`.
4. Start the API with `cd server; dotnet restore; dotnet run`.
5. Start the client with `cd client; npm install; npm run dev`.
6. Set `VITE_API_URL` if the API is not at `http://localhost:5000/api`.

The API rejects overlapping reservations on the same instrument. The React client supports equipment search/status, weekly/monthly calendar views, booking details, delete, and user/equipment Excel/PDF reports.

## GitHub and hosting later

Recommended topology: Vercel for `client`, Render/Railway/Azure App Service for the .NET API, and Supabase PostgreSQL for the database. The API stays behind an environment variable so local and hosted deployments use the same client code. Add Entra authentication and Graph calendar sync after the core workflow is accepted locally.

## GitHub Pages preview

The `master` branch automatically builds and deploys the Vite client through `.github/workflows/deploy-pages.yml`. In the repository settings, open **Pages**, choose **GitHub Actions** as the source, and then use `https://avronit.github.io/lab-equipment-booking/`. Until the API is hosted, the page is a frontend preview and booking data remains local-only.
