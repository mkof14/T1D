const required = [
  'T1D_ALLOWED_ORIGINS',
  'T1D_SITE_URL',
  'T1D_CRON_SECRET',
];

const recommended = [
  'DATABASE_URL',
  'VITE_SITE_URL',
  'DEXCOM_CLIENT_ID',
  'DEXCOM_CLIENT_SECRET',
  'DEXCOM_REDIRECT_URI',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'VITE_SENTRY_DSN',
];

let warnings = 0;

for (const key of required) {
  if (!String(process.env[key] || '').trim()) {
    console.error(`[verify:prod] Missing required env: ${key}`);
    warnings += 1;
  }
}

for (const key of recommended) {
  if (!String(process.env[key] || '').trim()) {
    console.warn(`[verify:prod] Recommended env missing: ${key}`);
  }
}

if (warnings > 0) {
  process.exit(1);
}

console.log('[verify:prod] Required production env looks configured');
