# T1D Go-Live Checklist

Use this list before the first production release. It complements `npm run release:ready`.

## Quality gates

- [ ] `npm run lint` passes
- [ ] `npm run test:unit` passes (unit + integration)
- [ ] `npm run test:smoke` passes
- [ ] `npm run build` passes
- [ ] `npm run perf:budget` passes
- [ ] `npm run test:e2e` passes

## Environment

- [ ] `DATABASE_URL` verified on staging (Postgres cold start + read/write)
- [ ] `VITE_SITE_URL` and `T1D_SITE_URL` match the production domain
- [ ] `T1D_CRON_SECRET` / `CRON_SECRET` set for `/api/cron/dexcom-sync`
- [ ] Dexcom OAuth redirect URLs match production domain
- [ ] `VITE_SENTRY_DSN` set if error monitoring is enabled
- [ ] Upstash rate limit credentials verified (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- [ ] `npm run verify:prod` passes against staging env

## SEO and performance

- [ ] `public/robots.txt` and `public/sitemap.xml` generated for production URL (`npm run build`)
- [ ] Lighthouse SEO score ≥ 0.92 on production build (`npm run test:lighthouse`)
- [ ] Canonical URL, OG image, and favicon resolve on production
- [ ] App routes (`/access`, `/workspace`, etc.) return `noindex,nofollow`
- [ ] Bundle budget passes (`npm run perf:budget`)

## Security

- [ ] Vercel security headers active (CSP, HSTS, frame denial)
- [ ] Cron endpoint rejects requests without configured secret
- [ ] API security headers verified on `/api/health`

## Safety product review

- [ ] Alert thresholds reviewed with product/medical advisor
- [ ] Quick actions and escalation paths tested on staging
- [ ] Password reset flow tested end-to-end
- [ ] Backend workspace copy reviewed in EN + RU at minimum
- [ ] Incident runbook (`docs/INCIDENT_RUNBOOK.md`) shared with on-call owner

## Trust and compliance

- [ ] Legal copy reviewed for target markets
- [ ] Privacy/data retention policy documented
- [ ] Audit log retention expectations documented
- [ ] Beta feedback channel monitored (`POST /api/feedback`)

## Post-deploy

- [ ] `npm run smoke:deploy -- <production-url>` passes
- [ ] Uptime workflow green for `/api/health`
- [ ] Dexcom OAuth callback succeeds on production
- [ ] First cron sync completes without auth errors

## Rollback

- [ ] Previous deployment artifact identified
- [ ] Rollback owner assigned
- [ ] Communication template ready for affected families
