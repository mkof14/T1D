import type { DiabetesType, UserRole } from '../types';

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
  diabetesType: DiabetesType;
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
  glucoseUnit: 'mg/dL' | 'mmol/L';
  contactPhones?: {
    parent?: string;
    adult?: string;
    caregiver?: string;
  };
}

export interface DexcomReading {
  id?: string;
  timestamp: string;
  glucose: number;
  trend: 'up' | 'down' | 'flat' | 'unknown';
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
  readings: DexcomReading[];
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
  | 'adult_need_help'
  | 'adult_noting_high'
  | 'parent_noting_high';

export type ActionId = SupportActionId | 'DONE' | 'all_ok';

export interface MealMacros {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface MealAnalysisItem {
  name: string;
  portion: string;
}

export interface MealRecord {
  id: string;
  createdAt: string;
  timeLabel: string;
  label: string;
  note: string;
  items: MealAnalysisItem[];
  macros: MealMacros;
  confidence: number;
  glucoseImpact: { level: 'low' | 'moderate' | 'high'; headline: string; detail: string };
  combinedInsight: string;
  hasImage: boolean;
}

export interface NutritionDailyTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  mealsCount: number;
}

export interface NutritionPayload {
  lastMeal: MealRecord | null;
  recentMeals: MealRecord[];
  dailyTotals: NutritionDailyTotals | null;
  insight: { headline: string; detail: string; carbs: number; impactLevel: string } | null;
  scanHint: string;
}

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
  nutrition: NutritionPayload | null;
}

export interface HouseholdSetupInput {
  householdName: string;
  childName: string;
  childAgeBand: string;
  primaryParent: string;
  caregiverName: string;
  nightWindow: string;
  diabetesType: DiabetesType;
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
  glucoseUnit: SafetyPreferences['glucoseUnit'];
  contactPhones?: {
    parent?: string;
    adult?: string;
    caregiver?: string;
  };
}

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const langHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const lang = window.localStorage.getItem('t1d_project_lang') || 'en';
  return { 'X-T1D-Lang': lang };
};

const requestHeaders = () => ({
  ...jsonHeaders,
  ...langHeaders(),
});

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
    headers: langHeaders(),
  });
  return readJson<{ authenticated: boolean; user?: SessionUser }>(res);
}

export type GoogleAuthStatus = {
  enabled: boolean;
  flow: string;
  clientId?: string;
  javascriptOrigins?: string[];
  setupHint?: string;
};

export async function getGoogleAuthStatus() {
  const res = await fetch('/api/access/google/status', {
    credentials: 'include',
    headers: langHeaders(),
  });
  return readJson<GoogleAuthStatus>(res);
}

export async function signInWithGoogle(body: {
  credential: string;
  mode: 'signin' | 'signup';
  role?: UserRole;
  diabetesType?: DiabetesType;
}) {
  const res = await fetch('/api/access/google/signin', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ user: SessionUser; householdReady?: boolean }>(res);
}

export async function signIn(body: { email: string; password: string; diabetesType?: DiabetesType }) {
  const res = await fetch('/api/access/signin', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ user: SessionUser; householdReady?: boolean }>(res);
}

export async function signUp(body: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organization?: string;
  diabetesType?: DiabetesType;
}) {
  const res = await fetch('/api/access/signup', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ user: SessionUser; householdReady?: boolean }>(res);
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

export async function analyzeNutrition(body: { imageBase64?: string; note?: string }) {
  const res = await fetch('/api/nutrition/analyze', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<WorkspacePayload>(res);
}

export async function performAction(action: ActionId) {
  const res = await fetch('/api/action', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ action }),
  });
  return readJson<WorkspacePayload>(res);
}

export async function requestPasswordReset(email: string) {
  const res = await fetch('/api/access/password-reset/request', {
    method: 'POST',
    headers: requestHeaders(),
    body: JSON.stringify({ email }),
  });
  return readJson<{ ok: boolean; message: string; resetToken?: string }>(res);
}

export async function confirmPasswordReset(token: string, password: string) {
  const res = await fetch('/api/access/password-reset/confirm', {
    method: 'POST',
    headers: requestHeaders(),
    body: JSON.stringify({ token, password }),
  });
  return readJson<{ ok: boolean }>(res);
}

export async function deleteAccount(body: { password?: string; confirm?: boolean }) {
  const res = await fetch('/api/account/delete', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ ok: boolean }>(res);
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

export async function submitFeedback(body: { message: string; rating?: number }) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return readJson<{ ok: boolean }>(res);
}

export type ResponderState =
  | 'no_responder'
  | 'notified'
  | 'acknowledged'
  | 'active_responder'
  | 'escalated'
  | 'resolved'
  | 'expired';

export interface WatchdogSnapshot {
  lastSuccessfulSync: string;
  lastReadingTimestamp: string;
  readingAgeMinutes: number | null;
  tokenStatus: string;
  refreshFailureCount: number;
  deviceConnectionStatus: string;
  workerHeartbeat: string;
  staleDataFlag: boolean;
  workerState: string;
}

export interface PatientTimelineEntry {
  id: string;
  type: string;
  timestamp: string;
  title: string;
  detail: string;
  status?: string;
  actor?: string;
  alertId?: string;
  meta?: Record<string, unknown>;
}

export interface PatientTimelinePayload {
  patientId: string;
  householdId: string;
  childName: string;
  ruleVersion: string;
  responderState: ResponderState;
  watchdog: WatchdogSnapshot;
  entries: PatientTimelineEntry[];
}

export async function getPatientTimeline(patientId = 'me') {
  const res = await fetch(`/api/timeline/${encodeURIComponent(patientId)}`, {
    credentials: 'include',
    headers: langHeaders(),
  });
  return readJson<PatientTimelinePayload>(res);
}

async function postAlertAction(alertId: string, action: 'acknowledge' | 'take-ownership' | 'resolve') {
  const res = await fetch(`/api/alerts/${encodeURIComponent(alertId)}/${action}`, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ alertId }),
  });
  return readJson<{ ok: boolean; alertId: string; responderState?: string }>(res);
}

export async function acknowledgeAlert(alertId: string) {
  return postAlertAction(alertId, 'acknowledge');
}

export async function takeAlertOwnership(alertId: string) {
  return postAlertAction(alertId, 'take-ownership');
}

export async function resolveAlert(alertId: string) {
  return postAlertAction(alertId, 'resolve');
}

export interface AdminSummaryPayload {
  ok: boolean;
  service: string;
  timestamp: string;
  storage: string;
  sqlRead: string;
  rateLimit: string;
  dexcomLive: boolean;
  alertRuleVersion: string;
  kv: {
    households: number;
    users: number;
    activeAlerts: number;
    inMemoryNotifications: number;
  };
  sql: {
    households: number;
    users: number;
    active_alerts: number;
    notification_deliveries: number;
    escalations: number;
    glucose_readings: number;
    audit_events: number;
  } | null;
  recommendations: string[];
}

export interface AdminHouseholdItem {
  id: string;
  householdName: string;
  diabetesType: string;
  stage: string;
  responderState: string;
  alertsCount: number;
  dexcomStatus: string;
  updatedAt?: string;
}

export interface AdminHouseholdsPayload {
  ok: boolean;
  total: number;
  items: AdminHouseholdItem[];
}

const adminHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  ...langHeaders(),
});

async function readAdminJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data?.error || `Request failed: ${res.status}`) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return data as T;
}

export async function getAdminSummary(token: string) {
  const res = await fetch('/api/admin/summary', {
    headers: adminHeaders(token),
  });
  return readAdminJson<AdminSummaryPayload>(res);
}

export async function getAdminHouseholds(token: string, limit = 20) {
  const res = await fetch(`/api/admin/households?limit=${limit}`, {
    headers: adminHeaders(token),
  });
  return readAdminJson<AdminHouseholdsPayload>(res);
}

export interface PushConfigPayload {
  enabled: boolean;
  publicKey: string;
  subscribed: boolean;
  subscriptionCount: number;
}

export async function getPushConfig() {
  const res = await fetch('/api/push/config', {
    credentials: 'include',
    headers: langHeaders(),
  });
  return readJson<PushConfigPayload>(res);
}

export async function registerPushSubscription(subscription: PushSubscriptionJSON) {
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(subscription),
  });
  return readJson<{ ok: boolean; subscriptionId: string }>(res);
}

export async function unregisterPushSubscription(endpoint: string) {
  const res = await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify({ endpoint }),
  });
  return readJson<{ ok: boolean; removed: boolean }>(res);
}
