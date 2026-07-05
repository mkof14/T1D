# Joint Session — 15 Minutes

Do these two steps together to unblock production sign-in.

## 1. Rotate Neon password (~5 min)

The database password was exposed in chat. Treat it as compromised.

1. Open [Neon Console](https://console.neon.tech/) → your project → **Connection details**
2. **Reset password** for the database role
3. Copy the new connection string
4. Update `/Users/mk/Desktop/T1D/.env.local`:
   ```
   DATABASE_URL=postgresql://...
   ```
5. Sync to Vercel:
   ```bash
   cd ~/Desktop/T1D && node scripts/sync-vercel-env.mjs
   ```
6. Redeploy (push to `main` or trigger redeploy in Vercel Dashboard)
7. Verify:
   ```bash
   npm run verify:neon
   curl -s https://t1-d.vercel.app/api/health | jq .
   ```
   Expect `"storage": "postgres"` and `"ok": true`.

## 2. Google OAuth redirect (~5 min)

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Select your OAuth 2.0 Client ID (the one matching `T1D_GOOGLE_CLIENT_ID` in `.env.local`)
3. Under **Authorized redirect URIs**, add:
   ```
   https://t1-d.vercel.app/api/access/google/callback
   ```
4. Save
5. Test: open https://t1-d.vercel.app/access → **Sign in with Google**

## 3. Optional verify (~5 min)

```bash
npm run verify:neon          # SQL row counts on Neon
npm run smoke:deploy         # production smoke (set SMOKE_BASE_URL)
```

## After this session

| Item | Status |
|------|--------|
| Email/password sign-in | Should work (Neon + existing auth) |
| Google sign-in | Works after redirect URI |
| Dexcom live CGM | Still needs Dexcom developer credentials |
| `glucose_readings` in SQL | Fills automatically on Dexcom poll |

See also: `docs/REMAINING_WORK.md`, `docs/GO_LIVE_CHECKLIST.md`
