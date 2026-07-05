# Remaining Work — After Autonomous Pass #3

Updated: 2026-07-05

## Completed without you (this pass)

- **Migration 001** applied locally to Neon (`npm run db:migrate`)
- **Frontend timeline** wired to `GET /api/timeline/me` via `EventTimeline.tsx`
- **Alert actions** in timeline UI: acknowledge, take ownership, resolve
- **Dual-write skeleton** for `glucose_readings` in `server/infrastructure/repositories/glucose-reading-repository.mjs`
- **Tests:** timeline API integration + repository unit tests (run `npm run test:unit`)

## Completed without you (prior passes)

- **Git:** all hardening + UX changes committed
- **Beta/medical banner** in workspace (11 languages, dismissible)
- **Production architecture:** domain modules, timeline API, migrations (`91b6190`)
- **Production:** deployed with `storage: postgres`

---

## Requires your accounts (cannot automate)

### 1. Neon password rotation ⚠️
Password was exposed in chat. Rotate in Neon Console → update `DATABASE_URL` in `.env.local` → `node scripts/sync-vercel-env.mjs`

### 2. Google OAuth redirect
[Google Cloud Console](https://console.cloud.google.com/) → OAuth client → add:
```
https://t1-d.vercel.app/api/access/google/callback
```

### 3. Dexcom live CGM
- Production app credentials from Dexcom developer portal
- Vercel env: `DEXCOM_CLIENT_ID`, `DEXCOM_CLIENT_SECRET`, `DEXCOM_USE_LIVE=true`
- Redirect: `https://t1-d.vercel.app/api/dexcom/oauth/callback`

### 4. Upstash (verify)
Health shows `rateLimit: upstash` — likely OK. Confirm dashboard if rate limits look wrong.

---

## Next engineering (no account needed)

| Phase | Task |
|-------|------|
| **B** | Wire `insertGlucoseReadings` into Dexcom poll path (dual-write on each new reading) |
| **C** | Backfill script: KV households → SQL tables |
| **2** | Extract auth/household/dexcom routes from `server/index.mjs` |

---

## Joint sessions (content / product)

| Area | Tasks |
|------|-------|
| **Medical** | Alert thresholds review with advisor; escalation testing with real families |
| **Legal i18n** | Translate privacy/terms/medical bodies (labels done, bodies EN-only) |
| **Knowledge** | Complete articles for ru, uk, zh, ja, pt, he, ar |
| **Branding** | App route titles still say "T1D Access" — unify to Steady if desired |
| **Monitoring** | Optional `@sentry/react` package; server-side Sentry for API |
| **Features** | Push/SMS alerts, real nutrition API, branded PWA icons |
| **Compliance** | Legal review for target markets; account self-deletion flow |
| **E2E** | Password reset, Google OAuth, Dexcom OAuth, T2 flows |

---

## Recommended next step together

**15-minute session:** Neon password + Google redirect URI — unblocks production sign-in.

Then Dexcom live when you have developer credentials.
