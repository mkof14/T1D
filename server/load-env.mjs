import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const loadLocalEnv = (root = process.cwd()) => {
  for (const name of ['.env.local', '.env']) {
    const filePath = join(root, name);
    if (!existsSync(filePath)) continue;

    for (const line of readFileSync(filePath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const index = trimmed.indexOf('=');
      if (index === -1) continue;

      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
};

loadLocalEnv();
