# T1D Production Implementation Plan

Goal: family response and coordination system around CGM events — incremental refactor, no visual redesign.

## Current baseline (2026-07-05, pass #6)

| Area | State |
|------|-------|
| Frontend | SPA with member/public zones; `WorkspaceView` ~786 LOC; `App.tsx` ~10 LOC + router/hook |
| Backend | `create-app.mjs` + route modules; `index.mjs` ~42 LOC |
| Storage | Postgres + JSON fallback; KV/SQL parity tooling |
| Dexcom | Mock + OAuth skeleton; cron + background worker |
| Alert engine | Versioned rules (`ALERT_RULE_VERSION`), replay tests |
| Notifications | Orchestrator + escalation + SQL dual-write; push/SMS adapters (config-gated) |
| Timeline | `/api/timeline`, `/api/alerts/*`, UI timeline |
| Admin | Read-only `/api/admin/*` + `npm run admin:summary` |
| Tests | 94+ unit/integration; E2E auth/T2/password-reset |

## Phase execution order

| Phase | Status | Key deliverables |
|-------|--------|------------------|
| 1 Cleanup | **Done** | `.gitignore`, `scan-secrets`, `SECURITY_NOTES.md` |
| 2 Backend structure | **Done** | `server/app/routes/*`, services extracted |
| 3 Database model | **In progress** | Migration 001, dual-write, backfill, parity scripts |
| 4 Dexcom ingestion | **In progress** | Watchdog, freshness; live creds pending |
| 5 Alert hardening | **Done** | Rules, versioning, replay, calibration tests |
| 6 Responder ownership | **Done** | Ack/ownership/resolve + escalation service |
| 7 Notifications | **In progress** | Orchestrator done; real push/SMS pending keys |
| 8 Timeline API | **Done** | Timeline + alert mutations + UI |
| 9 Frontend refactor | **Done** | App router/hook, workspace copy + settings/alerts sections |
| 10 Public site | **Deferred** | Copy audit only |
| 11 Security | **In progress** | CSRF, encryption, account delete; MFA later |
| 12 Admin console | **Done** | Read-only API + CLI + `/admin` UI shell |
| 13 Observability | **In progress** | Request IDs, optional Sentry server + client |
| 14 Testing | **Ongoing** | 94+ tests, E2E expanding |
| 15 Commercial | **Deferred** | When requested |

## Ops commands

```bash
npm run sql:status      # SQL read mode + next steps
npm run compare:sql     # KV vs SQL parity
npm run db:backfill     # Sync KV → SQL
npm run admin:summary   # Admin API snapshot (needs CRON secret)
npm run pre:joint       # Full pre-deploy SQL checks
```

## Next increments

1. Joint session: Neon rotation + Google OAuth redirect + `sync-vercel-env.mjs`
2. Enable `T1D_SQL_READ_SHADOW` on prod → monitor → `T1D_SQL_READ=true`
3. Dexcom live credentials on Vercel
4. Web Push subscriptions + VAPID keys
5. Twilio SMS routing
6. Admin UI shell (optional internal page)
