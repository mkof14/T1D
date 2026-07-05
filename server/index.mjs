import './load-env.mjs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app/create-app.mjs';
import { startDexcomSyncWorker } from './sync-worker.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDirectRun = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;

const PORT = Number(process.env.T1D_API_PORT || 8790);
const BACKGROUND_SYNC_INTERVAL_MS = Number(process.env.T1D_BACKGROUND_SYNC_INTERVAL_MS || 15000);

const {
  handleRequest,
  readHouseholds,
  writeHouseholds,
  shouldRunBackgroundDexcomPoll,
  applyDexcomPollToHousehold,
  appendDexcomAudit,
} = createApp({ serverDir: __dirname });

export { handleRequest };

const server = http.createServer(handleRequest);

if (isDirectRun) {
  server.listen(PORT, () => {
    console.log(`[t1d-api] listening on http://localhost:${PORT}`);
  });

  startDexcomSyncWorker({
    intervalMs: BACKGROUND_SYNC_INTERVAL_MS,
    readHouseholds,
    writeHouseholds,
    shouldRunBackgroundDexcomPoll,
    applyDexcomPollToHousehold,
    appendDexcomAudit,
    logger: console,
  });
}
