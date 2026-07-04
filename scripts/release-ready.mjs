import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  return result.status ?? 1;
};

const steps = [
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'test:unit']],
  ['npm', ['run', 'test:smoke']],
  ['npm', ['run', 'build']],
  ['npm', ['run', 'perf:budget']],
  ['npm', ['run', 'test:e2e']],
];

const results = [];
for (const [command, args] of steps) {
  const label = `${command} ${args.join(' ')}`;
  console.log(`\n[release:ready] ${label}`);
  const code = run(command, args);
  results.push({ label, code });
  if (code !== 0) {
    console.error(`[release:ready] FAILED: ${label}`);
    process.exit(code);
  }
}

mkdirSync('docs', { recursive: true });
writeFileSync(
  'docs/RELEASE_READY_REPORT.md',
  [
    '# T1D Release Ready Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Gate Results',
    ...results.map((entry) => `- ${entry.label}: PASS`),
    '',
  ].join('\n'),
  'utf8'
);

console.log('\n[release:ready] All gates passed.');
console.log('[release:ready] Report saved to docs/RELEASE_READY_REPORT.md');
