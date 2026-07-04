# T1D Incident Runbook

## Severity levels

| Level | Example | Response target |
|-------|---------|-----------------|
| S1 | API down, auth broken, alerts not firing | 15 minutes |
| S2 | Dexcom sync degraded, password reset broken | 1 hour |
| S3 | Copy/i18n issue, non-critical UI defect | next business day |

## First response

1. Check `GET /api/health` and `GET /api/health?verbose=1` if available.
2. Confirm Vercel deploy status and recent commits.
3. Check Sentry for new errors.
4. Verify `DATABASE_URL`, `T1D_CRON_SECRET`, Dexcom env vars.

## Common failures

### Users disappear after deploy
- Cause: missing `DATABASE_URL`, ephemeral `/tmp` storage in use.
- Fix: provision Postgres and redeploy with `DATABASE_URL`.

### Dexcom OAuth fails
- Verify `DEXCOM_REDIRECT_URI` matches Vercel domain callback.
- Confirm OAuth state tokens are persisted (`oauth-states.json` or Postgres).

### Background polling not running
- Verify Vercel Cron and `T1D_CRON_SECRET`.
- Hit `GET /api/cron/dexcom-sync` with `Authorization: Bearer <secret>`.

### Rate limit too aggressive
- Check Upstash env vars.
- Review auth brute-force attempts in audit log.

## Escalation

1. Release owner
2. On-call engineer
3. Product / legal contact for medical copy incidents

## Post-incident

1. Record timeline in `docs/RELEASE_READY_REPORT.md` or incident doc.
2. Add regression test if applicable.
3. Run `npm run release:ready` before redeploy.
