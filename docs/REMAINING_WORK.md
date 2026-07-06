# Remaining Work — After GPT Plan Pass #5

Updated: 2026-07-05

## Completed in this pass

- **WorkspaceView refactor (Phase 9 cont.)** — extracted `WorkspaceFamilySection` + `WorkspaceHistorySection`; `WorkspaceView` ~786 → ~680 LOC
- **OpenAPI** — documented `/push/config`, `/push/subscribe`, `/push/unsubscribe`
- **Vitest env** — `tests/setup-env.mjs` loads `.env.local` so Postgres integration tests run when `DATABASE_URL` is set
- **Push settings UI** — workspace settings panel + service worker (`/sw.js`)
- **Admin UI shell** — `/admin` read-only dashboard (summary + households table, Bearer token gate)
- **Admin console (read-only API)** — `GET /api/admin/summary`, `GET /api/admin/households` (Bearer `T1D_CRON_SECRET` or `T1D_ADMIN_SECRET`)
- **SQL read status script** — `npm run sql:status` reports shadow/primary mode + next steps
- **verify:neon** — counts `notification_deliveries` and `escalations`
- **Integration tests** — account delete + admin summary
- **E2E** — T2 signup path, Google auth status endpoint

## Completed in prior pass (#4)

- **Notification orchestrator** — alert creation + escalation + responder actions queue in-app + push/SMS placeholders; SQL dual-write to `notification_deliveries`
- **Escalation service** — timeout-based backup escalation wired into cron + background Dexcom worker
- **Alert engine** — `notifiedAt` timestamp for escalation timing
- **Account self-deletion** — `POST /api/account/delete` + settings UI (11 languages)
- **Server error reporting** — optional `@sentry/node` init via `SENTRY_DSN` / `T1D_SENTRY_DSN` / `VITE_SENTRY_DSN`
- **E2E** — password reset request/confirm flow
- **Unit tests** — escalation service + notification orchestrator

## Completed without you (prior passes)

See prior sections in git history and `docs/IMPLEMENTATION_PLAN.md` — domain modules, timeline API, SQL dual-write, security hardening, 86+ tests.

---

## Requires your accounts (cannot automate)

### 1. Neon password rotation ⚠️
Rotate in Neon Console → update `DATABASE_URL` → `node scripts/sync-vercel-env.mjs`

### 2. Google OAuth redirect
Add to Google Cloud Console:
```
https://t1-d.vercel.app/api/access/google/callback
```

### 3. Dexcom live CGM
Vercel env: `DEXCOM_CLIENT_ID`, `DEXCOM_CLIENT_SECRET`, `DEXCOM_USE_LIVE=true`

### 4. Push/SMS providers
Set VAPID keys + `T1D_VAPID_SUBJECT`, enable push in workspace settings. For SMS add E.164 numbers per role and Twilio env vars.

### 5. Sentry DSN (optional)
Set `SENTRY_DSN` or `T1D_SENTRY_DSN` on Vercel for server-side errors.

---

## Next engineering (no account needed)

| Phase | Task |
|-------|------|
| **D (local)** | Set `T1D_SQL_READ_SHADOW=true` in `.env.local` → exercise auth/session locally → prod only when ready (`npm run sql:status`) |
| ~~**7**~~ | ~~Wire real push/SMS provider adapters~~ — done; needs VAPID + Twilio on prod |
| ~~**9**~~ | ~~Split `WorkspaceView` / `App.tsx`~~ — done (copy + sections + `useT1DAppController`) |
| ~~**12**~~ | ~~Admin UI shell on top of `/api/admin/*`~~ — done at `/admin` |

---

## Joint sessions (content / product)

| Area | Tasks |
|------|-------|
| **Medical** | Alert thresholds review with advisor; escalation testing with real families |
| **Legal i18n** | Translate privacy/terms/medical bodies (labels done, bodies EN-only) |
| **Knowledge** | Complete articles for ru, uk, zh, ja, pt, he, ar |
| **E2E** | Google OAuth, Dexcom OAuth live, T2 full paths on staging |
| **Compliance** | Legal review for target markets |

---

## Recommended next step together

**15-minute session:** `docs/JOINT_SESSION.md` — Neon rotation + Google OAuth redirect.

Then enable SQL shadow on prod and watch logs for parity.
