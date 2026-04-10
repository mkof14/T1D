import type { UserRole } from '../types';

export interface SessionUser {
  email: string;
  fullName: string;
  role: UserRole;
  organization?: string;
}

export interface HouseholdMember {
  id: string;
  fullName: string;
  email: string;
  role: Exclude<UserRole, 'child'>;
  status: 'active' | 'invited';
}

export interface HouseholdProfile {
  householdName: string;
  childName: string;
  childAgeBand: string;
  primaryParent: string;
  caregiverName: string;
  nightWindow: string;
  inviteCode: string;
  members: HouseholdMember[];
  safetyPreferences: SafetyPreferences;
}

export interface SafetyPreferences {
  daySensitivity: 'gentle' | 'balanced' | 'watchful';
  nightSensitivity: 'balanced' | 'protective' | 'urgent';
  caregiverDelaySeconds: 20 | 40 | 60;
  dayPrimaryContact: 'parent' | 'adult' | 'caregiver';
  nightPrimaryContact: 'parent' | 'adult' | 'caregiver';
}

export interface NotificationSummaryPayload {
  mode: 'day' | 'night';
  daySensitivity: SafetyPreferences['daySensitivity'];
  nightSensitivity: SafetyPreferences['nightSensitivity'];
  caregiverDelaySeconds: SafetyPreferences['caregiverDelaySeconds'];
  dayPrimaryContact: SafetyPreferences['dayPrimaryContact'];
  nightPrimaryContact: SafetyPreferences['nightPrimaryContact'];
  caregiverEnabled: boolean;
  channel: 'push';
  deliveryStatus: 'quiet' | 'delivered' | 'retrying' | 'escalated';
  activeRecipient: 'parent' | 'adult' | 'caregiver';
  totalAttempts: number;
}

export interface NotificationDeliveryItem {
  id: string;
  recipientRole: 'parent' | 'adult' | 'caregiver';
  recipientName: string;
  channel: 'push';
  status: 'sent' | 'delivered' | 'retrying' | 'escalated' | 'resolved';
  timeLabel: string;
  detail: string;
}

export interface DexcomConnectionPayload {
  provider: 'Dexcom';
  status: 'disconnected' | 'connected' | 'error';
  authMode: 'mock' | 'oauth_ready';
  configStatus: 'missing' | 'ready';
  missingConfig: string[];
  authorizePath: string;
  oauthRedirectPath: string;
  accountName: string;
  lastSync: string;
  lastPollAt: string;
  tokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  tokenIssuedAt: string;
  lastTokenRefreshAt: string;
  tokenStatus: 'missing' | 'active' | 'expiring_soon' | 'expired';
  tokenType: string;
  scope: string;
  accessTokenPreview: string;
  refreshTokenPreview: string;
  hasRefreshToken: boolean;
  requestHealth: 'healthy' | 'retrying' | 'rate_limited' | 'failed';
  retryCount: number;
  rateLimitResetAt: string;
  lastError: string;
  deviceLabel: string;
  deviceRuntime: 'connected' | 'offline' | 'unknown';
  autoRefreshState: 'idle' | 'not_needed' | 'refreshed' | 'failed';
  pollIntervalSeconds: number;
  nextPollDueAt: string;
  dataFreshness: 'live' | 'delayed' | 'stale' | 'offline';
  latestGlucose: number | null;
  latestTrend: 'up' | 'down' | 'flat' | 'unknown';
  latestTimestamp: string;
  message: string;
}

export interface DexcomAuditEvent {
  id: string;
  kind: 'connect' | 'oauth_start' | 'oauth_callback' | 'token_refresh' | 'poll' | 'disconnect' | 'error';
  status: 'ok' | 'warning' | 'error';
  time: string;
  headline: string;
  detail: string;
}

export interface DexcomHealthSummary {
  state: 'healthy' | 'watch' | 'broken';
  reason: 'ok' | 'broken_auth' | 'rate_limited' | 'repeated_failures' | 'degraded_data' | 'request_failed';
  headline: string;
  detail: string;
  nextStep: string;
  lastSuccessAt: string;
  lastFailureAt: string;
  consecutiveFailures: number;
}

export interface DexcomSchedulerSummary {
  state: 'idle' | 'scheduled' | 'paused' | 'running';
  headline: string;
  nextRunAt: string;
  lastRunAt: string;
  pausedUntil: string;
}

export interface DailyGuidanceSummary {
  title: string;
  now: string;
  watch: string;
  fallback: string;
  checklist: string[];
}

export interface HouseholdReadinessSummary {
  state: 'ready' | 'watch' | 'needs_attention';
  headline: string;
  connection: string;
  backup: string;
  responder: string;
  recovery: string;
}

export interface ContextualSummary {
  tone: 'calm' | 'watch' | 'attention';
  headline: string;
  detail: string;
}

export interface CurrentStatePayload {
  mode: 'day' | 'night';
  level: 'ok' | 'watch' | 'risk' | 'critical' | 'recovery';
  glucose: number | null;
  trend: 'up' | 'down' | 'flat' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  dataStatus: 'live' | 'delayed' | 'offline' | 'waiting';
  headline: string;
  message: string;
  recommendation: string;
  responder: string;
  acknowledgedAt: string;
}

export interface DeviceStatusPayload {
  name: string;
  status: 'connected' | 'delayed' | 'offline';
  lastSync: string;
  signalAgeMinutes: number | null;
  lastGoodReading: string;
  confidenceNote: string;
  message: string;
}

export interface TimelineEvent {
  id: string;
  step: string;
  status: 'done' | 'active' | 'waiting';
  actor: string;
  time: string;
  detail: string;
}

export interface MorningSummary {
  headline: string;
  alertsCount: number;
  escalationCount: number;
  actionsCount: number;
  responders: string[];
  outcome: string;
}

export interface ReviewSummary {
  headline: string;
  stabilityScore: number;
  deliveryReliability: 'strong' | 'watch' | 'fragile';
  responseConsistency: 'strong' | 'watch' | 'fragile';
  pattern: 'steady' | 'repeat-risk' | 'escalation-heavy';
  notes: string[];
  nextFocus: string;
}

export interface DailyHistoryEntry {
  id: string;
  headline: string;
  dateLabel: string;
  outcome: string;
  alertsCount: number;
  actionsCount: number;
  escalationCount: number;
  responders: string[];
  timeline: TimelineEvent[];
  review: ReviewSummary;
}

export interface SessionDetail {
  id: string;
  headline: string;
  dateLabel: string;
  outcome: string;
  alertsCount: number;
  actionsCount: number;
  escalationCount: number;
  responders: string[];
  timeline: TimelineEvent[];
  review: ReviewSummary;
}

export type SupportActionId =
  | 'parent_handling'
  | 'parent_escalate'
  | 'parent_mark_with_adult'
  | 'caregiver_take_over'
  | 'caregiver_called_parent'
  | 'caregiver_on_way'
  | 'adult_self_monitor'
  | 'adult_treated_low'
  | 'adult_need_help';

export type ActionId = 'DONE';

export interface WorkspacePayload {
  user: SessionUser;
  needsSetup: boolean;
  household: HouseholdProfile | null;
  currentState: CurrentStatePayload | null;
  deviceStatus: DeviceStatusPayload | null;
  dexcomConnection: DexcomConnectionPayload | null;
  dexcomHealth: DexcomHealthSummary | null;
  dexcomScheduler: DexcomSchedulerSummary | null;
  dexcomAuditTrail: DexcomAuditEvent[];
  dailyGuidance: DailyGuidanceSummary | null;
  householdReadiness: HouseholdReadinessSummary | null;
  contextualSummary: ContextualSummary | null;
  notificationSummary: NotificationSummaryPayload | null;
  notificationFeed: NotificationDeliveryItem[];
  timeline: TimelineEvent[];
  recentEvents: TimelineEvent[];
  morningSummary: MorningSummary | null;
  reviewSummary: ReviewSummary | null;
  dailyHistory: DailyHistoryEntry[];
  selectedSession: SessionDetail | null;
  quickActions: Array<{ id: SupportActionId }>;
}

export interface HouseholdSetupInput {
  householdName: string;
  childName: string;
  childAgeBand: string;
  primaryParent: string;
  caregiverName: string;
  nightWindow: string;
}

export interface HouseholdJoinInput {
  inviteCode: string;
}

export interface DexcomConnectInput {
  accountName?: string;
}

export interface SafetyPreferencesInput {
  daySensitivity: SafetyPreferences['daySensitivity'];
  nightSensitivity: SafetyPreferences['nightSensitivity'];
  caregiverDelaySeconds: SafetyPreferences['caregiverDelaySeconds'];
  dayPrimaryContact: SafetyPreferences['dayPrimaryContact'];
  nightPrimaryContact: SafetyPreferences['nightPrimaryContact'];
}

const jsonHeaders = {
  'Content-Type': 'application/json',
};

async function readJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

export async function getSession() {
  const res = await fetch('/api/session', {
    credentials: 'include',
  });
  return readJson<{ authenticated: boolean; user?: SessionUser }>(res);
}

export async function signIn(body: { email: string; password: string }) {
  const res = await fetch('/api/access/signin', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ user: SessionUser }>(res);
}

export async function signUp(body: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organization?: string;
}) {
  const res = await fetch('/api/access/signup', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ user: SessionUser }>(res);
}

export async function signOut() {
  const res = await fetch('/api/access/signout', {
    method: 'POST',
    credentials: 'include',
  });
  return readJson<{ ok: boolean }>(res);
}

export async function getWorkspace() {
  const res = await fetch('/api/workspace', {
    credentials: 'include',
  });
  return readJson<WorkspacePayload>(res);
}

export async function saveHousehold(body: HouseholdSetupInput) {
  const res = await fetch('/api/household/setup', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ household: HouseholdProfile }>(res);
}

export async function joinHousehold(body: HouseholdJoinInput) {
  const res = await fetch('/api/household/join', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ household: HouseholdProfile }>(res);
}

export async function connectDexcom(body: DexcomConnectInput) {
  const res = await fetch('/api/dexcom/connect', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<WorkspacePayload>(res);
}

export async function disconnectDexcom() {
  const res = await fetch('/api/dexcom/disconnect', {
    method: 'POST',
    credentials: 'include',
  });
  return readJson<WorkspacePayload>(res);
}

export async function pollDexcom() {
  const res = await fetch('/api/dexcom/poll', {
    method: 'POST',
    credentials: 'include',
  });
  return readJson<WorkspacePayload>(res);
}

export async function startDexcomOAuth() {
  const res = await fetch('/api/dexcom/oauth/start', {
    method: 'POST',
    credentials: 'include',
  });
  return readJson<{ workspace: WorkspacePayload; redirectUrl: string }>(res);
}

export async function finishDexcomOAuth(code: string) {
  const res = await fetch('/api/dexcom/oauth/callback', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify({ code }),
  });
  return readJson<WorkspacePayload>(res);
}

export async function refreshDexcomAuthToken() {
  const res = await fetch('/api/dexcom/refresh-token', {
    method: 'POST',
    credentials: 'include',
  });
  return readJson<WorkspacePayload>(res);
}

export async function performAction(action: ActionId) {
  const res = await fetch('/api/action', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify({ action }),
  });
  return readJson<WorkspacePayload>(res);
}

export async function saveSafetyPreferences(body: SafetyPreferencesInput) {
  const res = await fetch('/api/preferences', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<WorkspacePayload>(res);
}
