import { spawnSync } from 'node:child_process';

const run = (label, command, args) => {
  console.log(`\n[pre:joint] ${label}`);
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if ((result.status ?? 1) !== 0) {
    console.error(`[pre:joint] FAILED: ${label}`);
    process.exit(result.status ?? 1);
  }
};

console.log('[pre:joint] Checking Neon parity before joint session (see docs/JOINT_SESSION.md)');
run('sql read status', 'npm', ['run', 'sql:status']);
run('verify neon counts', 'npm', ['run', 'verify:neon']);
run('compare kv vs sql', 'npm', ['run', 'compare:sql']);
console.log('\n[pre:joint] Local SQL checks passed. Next: rotate Neon password + Google redirect, then node scripts/sync-vercel-env.mjs');
