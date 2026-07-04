import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const distAssets = join(process.cwd(), 'dist/assets');
const budgets = {
  'index-': 120_000,
  'vendor-': 70_000,
  'content-': 130_000,
  'WorkspaceView-': 35_000,
};

let failed = 0;

for (const file of readdirSync(distAssets)) {
  for (const [prefix, maxGzipBytes] of Object.entries(budgets)) {
    if (!file.startsWith(prefix) || !file.endsWith('.js')) continue;
    const path = join(distAssets, file);
    const gzipBytes = gzipSync(readFileSync(path)).length;
    if (gzipBytes > maxGzipBytes) {
      console.error(`[perf] ${file}: gzip ${gzipBytes} > budget ${maxGzipBytes}`);
      failed += 1;
    } else {
      console.log(`[perf] ${file}: gzip ${gzipBytes} OK`);
    }
  }
}

if (failed > 0) process.exit(1);
console.log('[perf] Bundle budget passed');
