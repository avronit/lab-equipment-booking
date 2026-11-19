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

The API rejects overlapping reservations on the same instrument. The React client supports equipment search/status, weekly/monthly calendar views, editing and deleting bookings, and user/equipment Excel/PDF reports. Select a calendar event to edit its details and save the changes.

## Desktop bookings and Excel

The desktop build uses `Documents\Bookit\bookit-local.json` and updates the existing `Documents\Bookit\booking-data\LAB_EQUIPMENT_ALL_2026.xlsx` workbook. It adds new bookings to the `All bookings` sheet and updates the matching row for an edited booking; it preserves existing rows, the Client and Material columns, and the other sheets. The existing workbook columns record the date and duration, while the calendar keeps the full start and end times. Deleting a calendar booking does not erase its historical Excel row. A backup of the workbook is kept beside it before each update. Close the workbook in Excel before saving; if the workbook is missing, locked, or its matching row differs from the calendar, the save reports an error instead of replacing existing data.

Automatic workbook updates apply to the desktop build, not the GitHub Pages website or the API. Build it on Windows with `npm run desktop:package` in `client` after installing the dependencies. Set `BOOKIT_DATA_DIR` before starting the desktop app to use another directory containing the same JSON and `booking-data` layout. The website retains its existing browser-local or API storage and report exports.

## QNAP deployment

Copy `qnap.env.example` to `qnap.env` on the NAS and set `BOOKIT_DB_PASSWORD` to the password configured for the `booking_app` PostgreSQL user. Start the stack with `docker compose --env-file qnap.env -f docker-compose.qnap-absolute.yml up -d --build`.

For the GitHub Pages client to save bookings, create a repository variable named `VITE_API_URL` containing an HTTPS API URL such as `https://bookit.example.com/api`. The API must be exposed through an HTTPS reverse proxy on the NAS; a raw HTTP NAS address will be blocked by browsers when the client is loaded from GitHub Pages.

## GitHub and hosting later

Recommended topology: Vercel for `client`, Render/Railway/Azure App Service for the .NET API, and Supabase PostgreSQL for the database. The API stays behind an environment variable so local and hosted deployments use the same client code. Add Entra authentication and Graph calendar sync after the core workflow is accepted locally.

## GitHub Pages preview

The `master` branch automatically builds and deploys the Vite client through `.github/workflows/deploy-pages.yml`. In the repository settings, open **Pages**, choose **GitHub Actions** as the source, and then use `https://avronit.github.io/lab-equipment-booking/`. Until the API is hosted, the page is a frontend preview and booking data remains local-only.
