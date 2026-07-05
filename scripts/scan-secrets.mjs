import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git', '.vercel', 'playwright-report', 'test-results', '.lighthouseci']);
const IGNORE_FILES = new Set(['.env.example', 'package-lock.json']);

const PATTERNS = [
  { name: 'env_local', re: /^\.env\.local$/ },
  { name: 'private_key', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'neon_url', re: /postgresql:\/\/[^\s'"]+@ep-/ },
  { name: 'google_secret', re: /GOCSPX-[A-Za-z0-9_-]+/ },
  { name: 'generic_api_key', re: /(?:api[_-]?key|client[_-]?secret)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/i },
  { name: 'dexcom_token', re: /dexcom_(access|refresh)_[A-Za-z0-9_]+/ },
];

const walk = (dir, files = []) => {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (IGNORE_FILES.has(entry)) continue;
    files.push(full);
  }
  return files;
};

let findings = 0;

for (const file of walk(ROOT)) {
  const rel = file.slice(ROOT.length + 1);
  if (rel.startsWith('server/data/') && rel.endsWith('.json')) {
    console.warn(`[scan:secrets] runtime data present (keep gitignored): ${rel}`);
    continue;
  }
  const text = readFileSync(file, 'utf8');
  for (const pattern of PATTERNS) {
    if (pattern.re.test(text)) {
      console.error(`[scan:secrets] ${pattern.name} matched in ${rel}`);
      findings += 1;
    }
  }
}

if (findings > 0) {
  console.error(`[scan:secrets] ${findings} finding(s). See docs/SECURITY_NOTES.md`);
  process.exit(1);
}

console.log('[scan:secrets] No obvious secrets or runtime PII files detected in tracked scan paths');
