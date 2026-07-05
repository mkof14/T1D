# T1D Production Implementation Plan

Goal: family response and coordination system around CGM events — incremental refactor, no visual redesign.

## Current baseline (2026-07-05)

| Area | State |
|------|-------|
| Frontend | Working SPA, WorkspaceView ~1180 LOC, App.tsx ~514 LOC |
| Backend | Monolithic `server/index.mjs` ~1990 LOC |
| Storage | Postgres KV adapter + JSON fallback |
| Dexcom cron | Daily (Vercel Hobby limit); background worker 15s locally |
| Alert engine | In `server/alert-engine.mjs`, not versioned |
| Tests | 46 unit/integration tests passing |

## Phase execution order

| Phase | Status | Key deliverables |
|-------|--------|------------------|
| 1 Cleanup | **In progress** | `.gitignore`, `scan-secrets`, `SECURITY_NOTES.md` |
| 2 Backend structure | **Started** | `server/app/`, `server/domain/`, route modules |
| 3 Database model | **Started** | `migrations/001_core_schema.sql`, migration plan doc |
| 4 Dexcom ingestion | **Started** | Watchdog fields, reading-freshness module |
| 5 Alert hardening | **Started** | `alert-rules`, versioning, replay, simulation |
| 6 Responder ownership | **Started** | `responder-ownership.mjs` |
| 7 Notifications | **Started** | `notification-service.mjs` skeleton |
| 8 Timeline API | **Started** | `/api/timeline`, `/api/alerts/*` |
| 9 Frontend refactor | **Deferred** | Split App/Workspace after API stable |
| 10 Public site | **Deferred** | Copy audit only; no new pages |
| 11 Security | **Partial** | CSRF done; email verify/MFA later |
| 12 Admin console | **Deferred** | After relational model |
| 13 Observability | **Started** | `logger.mjs`, correlation IDs exist |
| 14 Testing | **Ongoing** | Per-module tests with each phase |
| 15 Commercial | **Deferred** | Structure only when requested |

## Files created in this pass

```
server/domain/alerts/alert-rules.mjs
server/domain/alerts/alert-types.mjs
server/domain/alerts/alert-engine.mjs
server/domain/alerts/alert-replay.mjs
server/domain/safety/responder-ownership.mjs
server/domain/safety/escalation-policy.mjs
server/domain/glucose/reading-freshness.mjs
server/domain/glucose/glucose-normalizer.mjs
server/domain/timeline/timeline-service.mjs
server/services/notification-service.mjs
server/services/audit-service.mjs
server/app/config.mjs
server/app/routes/health.routes.mjs
server/app/routes/alert-timeline.routes.mjs
server/infrastructure/db.mjs
server/infrastructure/logger.mjs
server/infrastructure/migrations/001_core_schema.sql
scripts/scan-secrets.mjs
docs/DATABASE_MIGRATION_PLAN.md
docs/SECURITY_NOTES.md
tests/unit/alert-replay.test.mjs
tests/unit/responder-ownership.test.mjs
tests/unit/timeline-service.test.mjs
tests/integration/alert-timeline.test.mjs
```

## Next increments (after this pass)

1. Extract auth/household/dexcom routes from `index.mjs` into `server/app/routes/`
2. Run migration 001 against Neon staging
3. Repository adapters: household → SQL, readings → SQL
4. Wire notification orchestrator to alert transitions
5. Frontend: `EventTimeline.tsx` consuming `/api/timeline/:id`
6. Admin console read-only views
