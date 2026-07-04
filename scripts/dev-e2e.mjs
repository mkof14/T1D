import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

mkdirSync('.tmp-e2e-data', { recursive: true });

const env = {
  ...process.env,
  T1D_DATA_DIR: '.tmp-e2e-data',
  T1D_API_PORT: '8791',
  T1D_EXPOSE_RESET_TOKEN: 'true',
  T1D_ALLOWED_ORIGINS: 'http://127.0.0.1:3003,http://localhost:3003',
};

const api = spawn('node', ['server/index.mjs'], { env, stdio: 'inherit' });
const web = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '3003', '--strictPort'], {
  env,
  stdio: 'inherit',
});

const shutdown = () => {
  api.kill('SIGTERM');
  web.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

api.on('exit', (code) => {
  web.kill('SIGTERM');
  process.exit(code ?? 1);
});

web.on('exit', (code) => {
  api.kill('SIGTERM');
  process.exit(code ?? 1);
});
