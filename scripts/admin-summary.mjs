import '../server/load-env.mjs';

const baseUrl = String(process.env.ADMIN_BASE_URL || process.env.T1D_SITE_URL || 'http://127.0.0.1:8790').replace(/\/$/, '');
const secret = String(process.env.T1D_ADMIN_SECRET || process.env.T1D_CRON_SECRET || process.env.CRON_SECRET || '').trim();

if (!secret) {
  console.error('[admin:summary] Set T1D_CRON_SECRET or T1D_ADMIN_SECRET in .env.local');
  process.exit(1);
}

const paths = ['/api/admin/summary', '/api/admin/households?limit=5'];

for (const path of paths) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const body = await response.json();
  console.log(`\n[admin:summary] ${path}`);
  console.log(JSON.stringify(body, null, 2));
  if (!response.ok) {
    process.exit(1);
  }
}
