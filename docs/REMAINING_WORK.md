# Remaining Work — After Autonomous Pass #3

Updated: 2026-07-05

## Completed without you (this pass)

- **Bug fix:** alert timeline mutations now receive `persistHouseholdUpdate` via shared route context (was broken at runtime)
- **Backfill** — also syncs historical `audit-log.json` events and alert entries from household `eventLog`
- **Integration test** — acknowledge endpoint returns 409 when no active alert (guards route wiring)

## Completed without you (prior pass)

- **Audit SQL dual-write** — safety/nutrition audit events mirrored to `audit_events` table
- **compare:sql** — reports audit parity as informational note (historical KV events may differ)
- **JOINT_SESSION.md** — backfill + shadow mode steps after Neon rotation

## Completed without you (prior pass)

- **Alert SQL dual-write** — new alerts on Dexcom poll + responder actions mirrored to relational tables
- **`persistHouseholdRecord`** — household setup/join/preferences use centralized SQL mirror
- **`npm run compare:sql`** — KV vs SQL row count parity check for households/members/users

## Completed without you (prior pass)

- **Dexcom SQL dual-write** — `device_connections` + `oauth_credentials` synced on household updates and Dexcom poll
- **`persistHouseholdUpdate`** — central helper mirrors household + Dexcom to SQL from dexcom/workspace/timeline routes
- **Backfill** — includes Dexcom connection rows; verify script counts `device_connections` / `oauth_credentials`
- **Vercel env sync** — defaults `T1D_SQL_READ_SHADOW=true` on production (override in `.env.local`)

## Completed without you (prior pass)

- **Phase D (partial): SQL read path** for auth — session + user lookup from Postgres when `T1D_SQL_READ=true`, KV fallback
- **Shadow mode** — `T1D_SQL_READ_SHADOW=true` logs KV/SQL mismatches without switching reads
- **Sign-in/sign-up** can resolve users by email from SQL when primary read is enabled
- **Health** exposes `sqlRead: off|shadow|primary`
- **Preferences** now mirrors household snapshot to SQL

## Completed without you (prior pass)

- **Household members SQL sync** — `syncHouseholdMembers` on every `ensureHouseholdRow` (setup/join, backfill, Dexcom poll)
- **Session SQL dual-write** — create/revoke sessions mirrored to `sessions` table
- **Verify script** — `npm run verify:neon` now includes `household_members` + active `sessions` counts

## Completed without you (prior pass)

- **Household SQL dual-write** on setup/join (`dualWriteHouseholdSnapshot`)
- **`npm run verify:neon`** + `docs/JOINT_SESSION.md`
- **Frontend timeline** wired to `GET /api/timeline/me` via `EventTimeline.tsx`
- **Alert actions** in timeline UI: acknowledge, take ownership, resolve
- **Dual-write skeleton** for `glucose_readings` in `server/infrastructure/repositories/glucose-reading-repository.mjs`
- **Dual-write on Dexcom poll** via `dual-write-service.mjs` (household upsert + new readings)
- **Backfill script:** `npm run db:backfill` (`scripts/backfill-kv-to-sql.mjs`)
- **Route extraction:** auth, household, dexcom, workspace, feedback, system → `server/app/routes/`
- **Workspace payload** moved to `server/services/workspace-payload-service.mjs`
- **Auth storage** extracted to `server/services/auth-storage.mjs` with user SQL dual-write
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
| **D** | Enable `T1D_SQL_READ_SHADOW=true` on prod, then `T1D_SQL_READ=true` after parity clean |
| **D+** | Household document still KV-only (dexcom/safety); relational read for workspace payload later |

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

**15-minute session:** follow `docs/JOINT_SESSION.md` — Neon password rotation + Google OAuth redirect URI.

Then Dexcom live when you have developer credentials.
