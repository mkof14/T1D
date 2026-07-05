# Database Migration Plan

## Current state

- Production uses Postgres **`t1d_kv`** JSONB key-value table via `server/storage.mjs`
- Household, users, sessions stored as JSON documents
- Dexcom tokens encrypted at rest (`accessTokenEnc`)

## Target state

Relational schema in `server/infrastructure/migrations/001_core_schema.sql`:

| Table | Purpose |
|-------|---------|
| `users`, `identities`, `sessions` | Auth |
| `households`, `household_members`, `invitations` | Family model |
| `patients`, `care_profiles` | Patient-centric data |
| `device_connections`, `oauth_credentials` | Dexcom |
| `glucose_readings` | Immutable readings |
| `glucose_events`, `alerts`, `alert_transitions` | Event pipeline |
| `acknowledgements`, `escalations` | Responder flow |
| `notification_deliveries` | Delivery audit |
| `audit_events` | Append-only audit |

## Migration strategy

1. **Phase A** — Apply `001_core_schema.sql` to staging Neon (`npm run db:migrate`)
2. **Phase B** — Dual-write adapters: JSON KV + SQL repositories
3. **Phase C** — Backfill script: export KV → SQL
4. **Phase D** — Read from SQL, write dual
   - Auth session/user: `T1D_SQL_READ=true` (opt-in), shadow via `T1D_SQL_READ_SHADOW=true`
   - Household metadata (name, invite, members): merged from SQL when primary read enabled; safety/dexcom/sessions remain KV-backed
5. **Phase E** — Read/write SQL only; KV read-only fallback
6. **Phase F** — Remove KV for core entities

## Rules

- `glucose_readings` rows are **immutable** (insert only)
- Every `alerts` row stores `rule_version` and input snapshot
- `audit_events` append-only
- `notification_deliveries.state` follows orchestrator enum

## Rollback

Keep `t1d_kv` until Phase E completes. Do not drop KV table until backfill verified.
