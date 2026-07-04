# T1D Project

Standalone Type 1 Diabetes daily-support app for families.

## What this app includes

- React + Vite frontend with 11-language public site and safety workspace
- Node API for auth, household setup, safety state, Dexcom integration, and alert engine
- Durable storage via Postgres when `DATABASE_URL` is set, JSON fallback for local dev
- Vercel-ready SPA routing, serverless API adapter, and cron-based Dexcom sync

## Local development

From `/Users/mk/Desktop/T1D`:

```bash
npm install
cp .env.example .env.local
npm run dev:full
```

Frontend: `http://localhost:3002`  
API: `http://localhost:8790`

Or run separately:

```bash
npm run api
npm run dev
```

## Quality gates

```bash
npm run lint
npm run test:unit
npm run test:smoke
npm run build
npm run perf:budget
npm run test:e2e
npm run release:ready
npm run smoke:deploy
npm run verify:prod
```

See also `docs/INCIDENT_RUNBOOK.md`.

## Environment variables

Start from `.env.example`.

Core:

- `T1D_API_PORT`
- `T1D_ALLOWED_ORIGINS`
- `T1D_COOKIE_SECURE`
- `T1D_DATA_DIR`
- `T1D_SITE_URL`
- `DATABASE_URL` (recommended for production)
- `T1D_CRON_SECRET`
- `T1D_EXPOSE_RESET_TOKEN` (dev only)

Dexcom:

- `DEXCOM_USE_LIVE`
- `DEXCOM_CLIENT_ID`
- `DEXCOM_CLIENT_SECRET`
- `DEXCOM_REDIRECT_URI`
- OAuth/API URLs and polling tuning vars

Optional monitoring:

- `VITE_SENTRY_DSN`

## Vercel setup

1. Import `https://github.com/mkof14/T1D` into Vercel.
2. Root directory: repository root.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env vars from `.env.example`.
6. Set `DEXCOM_REDIRECT_URI=https://your-domain.vercel.app/api/dexcom/oauth/callback`
7. Set `T1D_CRON_SECRET` and configure Vercel Cron (see `vercel.json`).

## Production notes

- Without `DATABASE_URL`, serverless storage is ephemeral on Vercel.
- Dexcom OAuth uses persisted state tokens and supports browser GET callback.
- Background Dexcom polling runs through `/api/cron/dexcom-sync`.
- Alert engine evaluates CGM readings and opens safety alerts from `monitoring` state.

## GitHub

Repository: `https://github.com/mkof14/T1D`
