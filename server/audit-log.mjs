import { randomBytes } from 'node:crypto';

const AUDIT_FILE = (dataDir) => `${dataDir}/audit-log.json`;

export const appendAuditEvent = async (readJson, writeJson, dataDir, event) => {
  const file = AUDIT_FILE(dataDir);
  const data = await readJson(file, { events: [] });
  const events = Array.isArray(data.events) ? data.events : [];
  events.unshift({
    id: randomBytes(8).toString('hex'),
    time: new Date().toISOString(),
    ...event,
  });
  await writeJson(file, { events: events.slice(0, 500) });
};

export const readAuditEvents = async (readJson, dataDir, limit = 50) => {
  const file = AUDIT_FILE(dataDir);
  const data = await readJson(file, { events: [] });
  return (Array.isArray(data.events) ? data.events : []).slice(0, limit);
};
