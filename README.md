# Amazon Web Scraper

A full-stack Amazon product scraper with a Vite frontend, an Express backend, Supabase authentication, scrape history, and optional ScraperAPI proxy support.

The frontend gives users a private dashboard where they can sign in, run Amazon keyword scrapes, view product titles, ratings, review counts, images, proxy quota, and reopen recent scrape runs. The backend owns authentication, Supabase validation, database writes, scraping, API docs, and deployment-friendly health checks.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Docker Backend Deployment](#docker-backend-deployment)
- [Frontend Build](#frontend-build)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Features

- Email and password authentication through Supabase.
- Backend-owned auth sessions, token refresh, and protected route validation.
- User profile persistence in Supabase Postgres.
- Per-user scrape history with recent runs shown in the dashboard.
- Amazon keyword scraping with product title, rating, review count, and image extraction.
- Optional ScraperAPI proxy mode.
- Per-user proxy scrape quota tracking.
- Responsive frontend dashboard with light/dark theme support.
- Styled backend welcome page at `/`.
- Swagger UI at `/docs`.
- OpenAPI JSON at `/api/docs/openapi.json`.
- Dockerfile for backend-only VM deployment.
- Modular backend and frontend code organization.

## Tech Stack

Backend:

- Node.js
- Express 5
- Supabase JS
- Axios
- JSDOM
- Dotenv

Frontend:

- Vite
- Vanilla JavaScript modules
- CSS custom properties for theming

Database/Auth:

- Supabase Auth
- Supabase Postgres
- Row Level Security policies for user-owned reads

Deployment:

- Docker backend image
- Optional VM deployment through `backend/deploy-backend.ps1`

## Project Structure

```text
.
|-- backend/
|   |-- Dockerfile
|   |-- .dockerignore
|   |-- deploy-backend.ps1
|   |-- index.js
|   |-- package.json
|   `-- src/
|       |-- app.js
|       |-- config/
|       |-- database/
|       |-- docs/
|       |-- middleware/
|       |-- routes/
|       |-- services/
|       |-- utils/
|       `-- views/
|-- frontend/
|   |-- index.html
|   |-- package.json
|   `-- src/
|       |-- api/
|       |-- auth/
|       |-- config/
|       |-- dom/
|       |-- ui/
|       |-- main.js
|       |-- style.css
|       `-- utils.js
|-- supabase-schema.sql
`-- README.md
```

## Prerequisites

Install these before running the app:

- Node.js 22 or newer is recommended.
- npm.
- A Supabase project.
- Optional: a ScraperAPI account if you want proxy scraping.
- Optional: Docker if you want to deploy the backend container to a VM.

## Quick Start

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

3. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

4. Fill in `backend/.env` with your Supabase values.

5. Run the Supabase SQL from `supabase-schema.sql` in your Supabase SQL editor.

6. Start the backend:

```bash
cd backend
npm run dev
```

7. Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

8. Open the app:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:3000
```

## Supabase Setup

1. Create a Supabase project.
2. Open `Authentication` > `Providers`.
3. Enable the `Email` provider.
4. Open `Project Settings` > `Data API`.
5. Copy the project URL. It should look like:

```text
https://your-project-ref.supabase.co
```

6. Open `Project Settings` > `API Keys`.
7. Copy the anon public key.
8. Copy the service role secret key.
9. Open the Supabase SQL editor.
10. Run the SQL in `supabase-schema.sql`.

Important: keep the service role key on the backend only. Never put it in the frontend `.env`, browser code, or Vite variables.

The SQL creates:

- `public.user_profiles`
- `public.scrapes`
- An index for recent scrape lookups
- Row Level Security policies for user-owned reads

The backend uses the service role key for trusted writes, while the frontend only talks to the backend API.

## Environment Variables

### Backend

Create `backend/.env`:

```bash
PORT=3000
CORS_ORIGIN=http://localhost:5173
SCRAPER_API_KEY=your_scraperapi_key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Backend variables:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend API port. Defaults to `3000`. |
| `CORS_ORIGIN` | No | Allowed frontend origin. Use `http://localhost:5173` for local Vite dev. Multiple origins can be comma-separated. |
| `SCRAPER_API_KEY` | No | Enables ScraperAPI proxy mode. If missing, proxy mode is disabled in the dashboard. |
| `SUPABASE_URL` | Yes | Your Supabase project base URL. Do not include `/rest/v1`. |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key used for auth operations. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role secret key used for trusted backend database writes. |

### Frontend

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Frontend variables:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Backend API URL used by the browser app. |

Only variables prefixed with `VITE_` are exposed to the browser. Do not add Supabase secret keys to the frontend.

## Running Locally

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Local URLs:

| Service | URL |
| --- | --- |
| Frontend app | `http://localhost:5173` |
| Backend welcome page | `http://localhost:3000` |
| Swagger docs | `http://localhost:3000/docs` |
| Health check | `http://localhost:3000/api/health` |

## API Documentation

The backend ships with built-in API documentation.

Open Swagger UI:

```text
http://localhost:3000/docs
```

Open the raw OpenAPI spec:

```text
http://localhost:3000/api/docs/openapi.json
```

The backend root also has a styled welcome page:

```text
http://localhost:3000
```

## Docker Backend Deployment

The Docker setup is intentionally backend-only, so you can deploy the API to a VM without bundling the Vite frontend.

Build the backend image:

```bash
cd backend
docker build -t amazon-scraper-backend .
```

Run the container with your backend `.env` file:

```bash
docker run --env-file .env -p 3000:3000 amazon-scraper-backend
```

Then check:

```text
http://localhost:3000/api/health
```

The Dockerfile:

- Uses `node:22-bookworm-slim`.
- Installs production dependencies with `npm ci --omit=dev`.
- Runs as the non-root `node` user.
- Exposes port `3000`.
- Includes a health check against `/api/health`.

For a VM deployment, make sure:

- Your VM has Docker installed.
- Your backend environment variables are available to the container.
- Your reverse proxy forwards traffic to the container port.
- `CORS_ORIGIN` matches your deployed frontend domain.

## Frontend Build

Create a production frontend build:

```bash
cd frontend
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

When deploying the frontend separately, set:

```bash
VITE_API_BASE_URL=https://your-api-domain.example.com
```

Then rebuild the frontend so Vite embeds the correct API URL.

## Backend Architecture

The backend is organized by responsibility:

| Folder | Purpose |
| --- | --- |
| `backend/src/app.js` | Composes Express middleware and route modules. |
| `backend/src/config/` | Reads and normalizes environment configuration. |
| `backend/src/database/` | Creates Supabase clients. |
| `backend/src/docs/` | Owns OpenAPI and Swagger UI HTML. |
| `backend/src/middleware/` | Express middleware such as auth validation. |
| `backend/src/routes/` | HTTP route definitions grouped by domain. |
| `backend/src/services/` | Business logic for auth, scraping, proxy status, and persistence. |
| `backend/src/utils/` | Shared backend helpers. |
| `backend/src/views/` | HTML returned directly by the backend. |

Route modules are intentionally thin. They validate request input, call services, and return responses. Services own business rules and integrations. This keeps the API easier to test, deploy, and extend.

## Frontend Architecture

The frontend is also split by responsibility:

| Folder | Purpose |
| --- | --- |
| `frontend/src/api/` | Fetch wrappers and API request handling. |
| `frontend/src/auth/` | Session storage, token refresh, and authenticated requests. |
| `frontend/src/config/` | App constants and environment values. |
| `frontend/src/dom/` | Centralized DOM element lookup. |
| `frontend/src/ui/` | Theme handling, messages, and rendering helpers. |
| `frontend/src/main.js` | App controller that wires events and modules together. |
| `frontend/src/style.css` | Application styling and theme variables. |
| `frontend/src/utils.js` | Shared UI utilities such as timer and timestamp formatting. |

The frontend preserves the existing DOM IDs and CSS classes so styling and behavior remain stable while the JavaScript stays modular.

## API Reference

### System

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Styled backend welcome page. |
| `GET` | `/docs` | Swagger UI. |
| `GET` | `/api/docs/openapi.json` | OpenAPI JSON document. |
| `GET` | `/api/welcome` | JSON welcome response. |
| `GET` | `/api/health` | Health and configuration status. |
| `GET` | `/api/check-proxy` | Whether ScraperAPI proxy mode is configured. |

### Authentication

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/sign-in` | `{ "email": "...", "password": "..." }` | Signs in a user and returns a session. |
| `POST` | `/api/auth/sign-up` | `{ "email": "...", "password": "..." }` | Creates a user account. |
| `POST` | `/api/auth/refresh` | `{ "refreshToken": "..." }` | Refreshes an existing session. |

### Authenticated User

These routes require:

```text
Authorization: Bearer <supabase_access_token>
```

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/users/me` | Loads the user's profile, recent scrapes, and proxy quota. |
| `GET` | `/api/scrapes/:id` | Loads a saved scrape by ID. |
| `GET` | `/api/scrape?keyword=KEYWORD&useProxy=true|false` | Runs a new Amazon scrape and saves it. |
| `GET` | `/api/scraperapi/account` | Fetches ScraperAPI account details. |

## Common Workflows

### Add a New Backend Endpoint

1. Add route handling in `backend/src/routes/`.
2. Add business logic in `backend/src/services/`.
3. Add shared helpers in `backend/src/utils/` only if multiple modules need them.
4. Register the route in `backend/src/app.js` if it uses a new router.
5. Update `backend/src/docs/openApiSpec.js`.
6. Add the endpoint to this README if it is user-facing.

### Add a New Frontend API Call

1. Add or reuse a method in `frontend/src/api/`.
2. Use `sessionManager.authFetch()` for authenticated calls.
3. Keep rendering logic in `frontend/src/ui/`.
4. Keep DOM lookup in `frontend/src/dom/elements.js`.
5. Keep constants in `frontend/src/config/appConfig.js`.

## Troubleshooting

### `Supabase is not configured on the server`

Check `backend/.env` and make sure these values are set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Restart the backend after editing `.env`.

### `SUPABASE_URL must be your project base URL`

Use:

```text
https://your-project-ref.supabase.co
```

Do not use:

```text
https://your-project-ref.supabase.co/rest/v1
```

### `SUPABASE_SERVICE_ROLE_KEY must be the secret service_role key`

You probably used the anon key or publishable key in the service role field. Copy the service role secret key from Supabase project settings and restart the backend.

### Proxy Mode Is Disabled

Proxy mode is disabled when `SCRAPER_API_KEY` is missing. Add it to `backend/.env` and restart the backend.

### Frontend Cannot Reach Backend

Check:

- Backend is running on `http://localhost:3000`.
- Frontend `.env` has `VITE_API_BASE_URL=http://localhost:3000`.
- Backend `.env` has `CORS_ORIGIN=http://localhost:5173`.
- Both servers were restarted after environment changes.

### Docker Container Starts but API Is Not Reachable

Check:

- The container is running: `docker ps`.
- Port mapping is correct: `-p 3000:3000`.
- The container received environment variables: `--env-file .env`.
- Your VM firewall or reverse proxy allows traffic to the backend.

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.
- Keep `backend/.env` out of Git.
- Use HTTPS for production frontend and backend domains.
- Restrict `CORS_ORIGIN` to your real frontend URL in production.
- Rotate API keys if they were ever committed or shared accidentally.

## Useful Commands

Backend:

```bash
cd backend
npm install
npm run dev
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
```

Docker:

```bash
cd backend
docker build -t amazon-scraper-backend .
docker run --env-file .env -p 3000:3000 amazon-scraper-backend
```
