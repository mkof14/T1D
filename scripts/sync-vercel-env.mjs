import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const PROD_URL = 'https://t1-d.vercel.app';
const envFile = readFileSync('.env.local', 'utf8');
const local = {};

for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const index = trimmed.indexOf('=');
  if (index === -1) continue;
  const key = trimmed.slice(0, index).trim();
  const value = trimmed.slice(index + 1).trim();
  if (!value || value === '...') continue;
  local[key] = value;
}

const cronSecret = randomBytes(32).toString('hex');

const productionEnv = {
  VITE_SITE_URL: PROD_URL,
  T1D_SITE_URL: PROD_URL,
  T1D_ALLOWED_ORIGINS: PROD_URL,
  T1D_COOKIE_SECURE: 'true',
  T1D_CRON_SECRET: cronSecret,
  CRON_SECRET: cronSecret,
  T1D_GOOGLE_CLIENT_ID: local.T1D_GOOGLE_CLIENT_ID,
  T1D_GOOGLE_CLIENT_SECRET: local.T1D_GOOGLE_CLIENT_SECRET,
  T1D_GOOGLE_REDIRECT_URI: `${PROD_URL}/api/access/google/callback`,
  VITE_SENTRY_DSN: local.VITE_SENTRY_DSN,
  DEXCOM_USE_LIVE: local.DEXCOM_USE_LIVE || 'false',
  DEXCOM_REDIRECT_URI: `${PROD_URL}/api/dexcom/oauth/callback`,
  DEXCOM_AUTHORIZE_URL: 'https://sandbox-api.dexcom.com/v2/oauth2/login',
  DEXCOM_TOKEN_URL: 'https://sandbox-api.dexcom.com/v2/oauth2/token',
  DEXCOM_API_BASE_URL: 'https://sandbox-api.dexcom.com',
};

if (local.DEXCOM_CLIENT_ID && local.DEXCOM_CLIENT_ID !== '...') {
  productionEnv.DEXCOM_CLIENT_ID = local.DEXCOM_CLIENT_ID;
}
if (local.DEXCOM_CLIENT_SECRET && local.DEXCOM_CLIENT_SECRET !== '...') {
  productionEnv.DEXCOM_CLIENT_SECRET = local.DEXCOM_CLIENT_SECRET;
}
if (local.UPSTASH_REDIS_REST_URL) {
  productionEnv.UPSTASH_REDIS_REST_URL = local.UPSTASH_REDIS_REST_URL;
}
if (local.UPSTASH_REDIS_REST_TOKEN) {
  productionEnv.UPSTASH_REDIS_REST_TOKEN = local.UPSTASH_REDIS_REST_TOKEN;
}
if (local.DATABASE_URL) {
  productionEnv.DATABASE_URL = local.DATABASE_URL;
}

const addEnv = (key, value) => {
  if (!value) {
    console.log(`[vercel-env] skip ${key} (empty)`);
    return;
  }
  const result = spawnSync(
    'npx',
    ['vercel', 'env', 'add', key, 'production', 'preview', '--force'],
    { input: value, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
  );
  if (result.status === 0) {
    console.log(`[vercel-env] set ${key}`);
    return;
  }
  console.error(`[vercel-env] failed ${key}: ${result.stderr || result.stdout}`);
  process.exitCode = 1;
};

for (const [key, value] of Object.entries(productionEnv)) {
  addEnv(key, value);
}

console.log('[vercel-env] Done. Redeploy production to apply build-time vars.');
