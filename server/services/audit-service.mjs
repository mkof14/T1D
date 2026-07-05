import { appendAuditEvent, readAuditEvents } from '../audit-log.mjs';

export const recordAuditEvent = appendAuditEvent;
export const fetchAuditEvents = readAuditEvents;
