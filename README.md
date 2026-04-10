# T1D Project

Standalone T1D daily-support app inside the Luna repository.

## What this app includes

- React + Vite frontend
- Node API for auth, household setup, safety state, and Dexcom foundation
- Local file-backed data store for development and demos
- Vercel-ready SPA routing and serverless API adapter

## Local development

From `/Users/mk/Desktop/Luna/apps/t1d`:

```bash
npm install
npm run api
```

In a second terminal:

```bash
npm run dev
```

Or run both together:

```bash
npm run dev:full
```

Frontend:

- `http://localhost:3002`

API:

- `http://localhost:8790`

## Environment variables

Start from `.env.example`.

Core variables:

- `T1D_API_PORT`
- `T1D_ALLOWED_ORIGINS`
- `T1D_COOKIE_SECURE`
- `T1D_DATA_DIR`

Dexcom variables:

- `DEXCOM_USE_LIVE`
- `DEXCOM_CLIENT_ID`
- `DEXCOM_CLIENT_SECRET`
- `DEXCOM_REDIRECT_URI`
- `DEXCOM_AUTHORIZE_URL`
- `DEXCOM_TOKEN_URL`
- `DEXCOM_API_BASE_URL`
- `DEXCOM_EGV_PATH`
- `DEXCOM_DEVICE_PATH`
- `DEXCOM_HTTP_TIMEOUT_MS`
- `DEXCOM_HTTP_MAX_RETRIES`
- `DEXCOM_HTTP_RETRY_DELAY_MS`
- `DEXCOM_POLL_INTERVAL_SECONDS`
- `DEXCOM_DEGRADED_POLL_INTERVAL_SECONDS`
- `DEXCOM_RATE_LIMIT_POLL_INTERVAL_SECONDS`
- `T1D_BACKGROUND_SYNC_INTERVAL_MS`

## GitHub setup

Recommended repo setup:

1. Push the repository to GitHub.
2. Keep `apps/t1d/.env.example` committed.
3. Do not commit real secrets.
4. Use GitHub pull requests to review all changes to `apps/t1d`.

## Vercel setup

Recommended project settings:

1. Import the GitHub repository into Vercel.
2. Set the Root Directory to:

```text
apps/t1d
```

3. Vercel will use:

- `npm run build`
- `dist` as output
- `apps/t1d/vercel.json` for SPA + API routing

4. Add environment variables in Vercel:

```text
T1D_ALLOWED_ORIGINS=https://your-domain.vercel.app
T1D_COOKIE_SECURE=true
DEXCOM_USE_LIVE=false
```

Add live Dexcom secrets only when you are ready:

```text
DEXCOM_CLIENT_ID
DEXCOM_CLIENT_SECRET
DEXCOM_REDIRECT_URI=https://your-domain.vercel.app/api/dexcom/oauth/callback
DEXCOM_AUTHORIZE_URL
DEXCOM_TOKEN_URL
DEXCOM_API_BASE_URL
DEXCOM_EGV_PATH
DEXCOM_DEVICE_PATH
```

## Important deployment note

The current data store is file-based and intended for development, demos, and preview environments.

On Vercel:

- API functions are serverless
- filesystem writes are temporary
- data can reset between cold starts or deployments

That means production should eventually move to durable storage such as Postgres, Redis, Supabase, Neon, or another persistent backend.

## Build check

```bash
npm run build
```
