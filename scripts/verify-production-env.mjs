const isProduction = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');

const required = [
  'T1D_ALLOWED_ORIGINS',
  'T1D_SITE_URL',
  'T1D_CRON_SECRET',
];

const productionRequired = [
  'DATABASE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

const recommended = [
  'VITE_SITE_URL',
  'DEXCOM_CLIENT_ID',
  'DEXCOM_CLIENT_SECRET',
  'DEXCOM_REDIRECT_URI',
  'VITE_SENTRY_DSN',
  'T1D_GOOGLE_CLIENT_ID',
  'T1D_GOOGLE_CLIENT_SECRET',
];

let failures = 0;

for (const key of required) {
  if (!String(process.env[key] || '').trim()) {
    console.error(`[verify:prod] Missing required env: ${key}`);
    failures += 1;
  }
}

if (isProduction) {
  for (const key of productionRequired) {
    if (!String(process.env[key] || '').trim()) {
      console.error(`[verify:prod] Missing production-required env: ${key}`);
      failures += 1;
    }
  }
  if (process.env.T1D_EXPOSE_RESET_TOKEN === 'true') {
    console.error('[verify:prod] T1D_EXPOSE_RESET_TOKEN must not be enabled in production');
    failures += 1;
  }
}

for (const key of recommended) {
  if (!String(process.env[key] || '').trim()) {
    console.warn(`[verify:prod] Recommended env missing: ${key}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('[verify:prod] Production env validation passed');
