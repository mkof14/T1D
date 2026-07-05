import { randomBytes } from 'node:crypto';
import { dualWriteAuditEvent } from './infrastructure/repositories/dual-write-service.mjs';

const AUDIT_FILE = (dataDir) => `${dataDir}/audit-log.json`;

export const appendAuditEvent = async (readJson, writeJson, dataDir, event) => {
  const file = AUDIT_FILE(dataDir);
  const data = await readJson(file, { events: [] });
  const events = Array.isArray(data.events) ? data.events : [];
  const record = {
    id: randomBytes(8).toString('hex'),
    time: new Date().toISOString(),
    ...event,
  };
  events.unshift(record);
  await writeJson(file, { events: events.slice(0, 500) });
  void dualWriteAuditEvent(record).then((result) => {
    if (!result.ok && !result.skipped) {
      console.warn('[t1d-api] audit dual-write failed', result.error);
    }
  });
  return record;
};

export const readAuditEvents = async (readJson, dataDir, limit = 50) => {
  const file = AUDIT_FILE(dataDir);
  const data = await readJson(file, { events: [] });
  return (Array.isArray(data.events) ? data.events : []).slice(0, limit);
};
