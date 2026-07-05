# Data Retention Policy (Steady / T1D)

Last updated: 2026-07-05

## Overview

Steady stores account, household, safety-state, Dexcom connection metadata, and optional feedback data to operate the family support workspace.

## Storage locations

| Data | Production | Local dev |
|------|------------|-----------|
| Users, sessions, households | Postgres (`t1d_kv`) when `DATABASE_URL` is set | JSON under `server/data/` |
| Dexcom OAuth tokens | Encrypted fields (`accessTokenEnc`, `refreshTokenEnc`) in household records | Same |
| Feedback entries | Postgres / JSON (max 200 entries) | Same |
| Audit events | Embedded in household records | Same |

## Retention periods

| Category | Retention | Notes |
|----------|-----------|-------|
| Active sessions | 14 days TTL | Expired sessions pruned on read |
| Password reset tokens | 1 hour | Removed after use or expiry |
| OAuth state tokens | 15 minutes | One-time use |
| Feedback | Latest 200 entries | Older entries dropped on write |
| Dexcom readings in workspace | Latest 12 points | Display cache only |
| Meal analysis history | Latest 30 meals per household | In nutrition service |

## Deletion

- **Sign out** clears the session cookie; server session row remains until TTL unless manually purged.
- **Account deletion** is not yet self-service — contact support / operator for GDPR-style erasure requests.
- **Household data** persists until operator deletion or database purge.

## Backups

- **Neon Postgres:** follow Neon project backup settings in the Neon Console.
- **Vercel `/tmp` JSON:** not used for primary storage when Postgres is active.

## Operator actions

1. Rotate compromised credentials (`DATABASE_URL`, Google, Dexcom, `T1D_CRON_SECRET`).
2. Purge a household: delete namespace rows from `t1d_kv` or remove household JSON.
3. Invalidate sessions: delete rows in `t1d_sessions` namespace or `sessions.json`.

## Not stored

- Full Dexcom tokens in API responses (previews only)
- Raw meal photos after analysis (notes/metadata only in mock flow)
