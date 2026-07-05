# Remaining Work — After Autonomous Pass #2

Updated: 2026-07-05

## Completed without you (this pass)

- **Git:** all hardening + UX changes ready to commit
- **Beta/medical banner** in workspace (11 languages, dismissible)
- **Error boundary i18n** (11 languages)
- **Branding:** loading screen → "Steady"
- **SEO:** `og-image.png` 1200×630, `lastmod` in sitemap, hreflang alternate links
- **Sentry:** release tag `steady@1.1.0` on CDN init
- **PWA:** SW update detection + `applySwUpdate()` API
- **Docs:** `DATA_RETENTION.md`
- **Vercel sync:** preserves `T1D_CRON_SECRET` from `.env.local`; sets `T1D_SECRETS_KEY`
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
