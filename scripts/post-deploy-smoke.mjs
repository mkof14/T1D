const baseUrl = String(process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3002').replace(/\/$/, '');

const checks = [
  { name: 'home', url: `${baseUrl}/`, expectStatus: 200 },
  { name: 'health', url: `${baseUrl}/api/health`, expectStatus: 200, expectJson: (body) => body.ok === true },
  { name: 'session', url: `${baseUrl}/api/session`, expectStatus: 200, expectJson: (body) => body.authenticated === false },
];

let failed = 0;

for (const check of checks) {
  try {
    const response = await fetch(check.url);
    if (response.status !== check.expectStatus) {
      console.error(`[post-deploy] ${check.name}: expected ${check.expectStatus}, got ${response.status}`);
      failed += 1;
      continue;
    }
    if (check.expectJson) {
      const body = await response.json();
      if (!check.expectJson(body)) {
        console.error(`[post-deploy] ${check.name}: JSON check failed`, body);
        failed += 1;
        continue;
      }
    }
    console.log(`[post-deploy] ${check.name}: PASS`);
  } catch (error) {
    console.error(`[post-deploy] ${check.name}:`, error instanceof Error ? error.message : error);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`[post-deploy] ${failed} check(s) failed`);
  process.exit(1);
}

console.log('[post-deploy] All checks passed');
