export const loadConfig = () => ({
  port: Number(process.env.T1D_API_PORT || 8790),
  siteUrl: String(process.env.T1D_SITE_URL || 'http://localhost:3002').trim(),
  isProduction: Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production'),
  backgroundSyncIntervalMs: Number(process.env.T1D_BACKGROUND_SYNC_INTERVAL_MS || 15000),
  dexcomSyncCronNote: 'Vercel Hobby allows daily cron only; use background worker locally and workspace-triggered polls in prod.',
});
