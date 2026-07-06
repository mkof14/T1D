import React from 'react';
import type { AccessUser } from './AccessView';
import type { CurrentStatePayload, SafetyPreferencesInput, WorkspacePayload } from '../lib/api';
import { deleteAccount } from '../lib/api';
import { RTL_LANGUAGES, type DiabetesType, type Language } from '../types';
import { MEMBER_CHROME_COPY } from '../content/member-chrome-copy';
import { readSignupDiabetesType } from '../lib/signup-diabetes-type';
import { getRoleLabels } from '../lib/role-labels';
import {
  resolveFailStateHints,
  resolvePreferenceExplainer,
  resolveRoleFocus,
  resolveWorkspaceCopy,
  resolveWorkspaceInviteCopy,
  resolveWorkspaceSectionHeaders,
} from '../lib/workspace-content';
import { ACTION_LABELS } from '../content/action-labels';
import type { ActionId } from '../lib/api';
import { t1dBtnPrimary, t1dBtnSecondary, t1dEyebrow, t1dMemberLayout, t1dPanelCompact, t1dPanelCompactSurface, t1dPanelPrimary, t1dPanelSubtle, t1dPanelSurface, t1dSoftLabel } from '../lib/t1d-ui';
import { MemberPageHero } from './layout/MemberPageHero';
import { MemberZoneShell } from './layout/MemberZoneShell';
import { ConnectionPanel } from './workspace/ConnectionPanel';
import { FoodAnalysisPanel } from './workspace/FoodAnalysisPanel';
import { WorkspaceActionBanner } from './workspace/WorkspaceActionBanner';
import { WorkspaceOnboarding } from './workspace/WorkspaceOnboarding';
import { WorkspaceSectionHeader } from './workspace/WorkspaceSectionHeader';
import { WorkspaceSidebar } from './workspace/WorkspaceSidebar';
import { resolveActionFeedback } from '../content/workspace-ux-copy';
import { NUTRITION_COPY } from '../content/nutrition-copy';
import { createEmptyNutritionPayload } from '../lib/nutrition-defaults';
import { memberLayoutTypeClass } from '../lib/hero-path';
import { glucoseDashboardTypeClass, workspaceShellTypeClass } from '../lib/diabetes-type-theme';
import { GlucoseNowDashboard } from './workspace/GlucoseNowDashboard';
import { WorkspaceNowPanel } from './workspace/WorkspaceNowPanel';
import { WorkspaceBetaBanner } from './workspace/WorkspaceBetaBanner';
import { EventTimeline } from './workspace/EventTimeline';
import { WORKSPACE_NOW_COPY } from '../content/workspace-now-copy';
import { normalizeGlucoseUnit } from '../lib/glucose-units';
import type { WorkspaceSectionId } from '../content/workspace-nav-copy';

import {
  ACCOUNT_DELETE_COPY,
  DELIVERY_COPY,
  DEXCOM_COPY,
  DEXCOM_OPS_COPY,
  GUIDANCE_COPY,
  HOUSEHOLD_COPY,
  LAYOUT_COPY,
  NOTIFICATION_COPY,
  PREFERENCE_COPY,
  PRODUCT_LABELS,
  READINESS_COPY,
  REVIEW_COPY,
  SUMMARY_COPY,
} from '../content/workspace-panel-copy';
import { deviceTone, normalizeContactPhones, STATE_TONE, statusTone } from '../lib/workspace-view-utils';
import { WorkspaceSettingsSection } from './workspace/WorkspaceSettingsSection';
import { WorkspaceAlertsSection } from './workspace/WorkspaceAlertsSection';
import { WorkspaceFamilySection } from './workspace/WorkspaceFamilySection';
import { WorkspaceHistorySection } from './workspace/WorkspaceHistorySection';


interface WorkspaceViewProps {
  user: AccessUser;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onLogout: () => void;
  onBackToPublic: () => void;
  onSignUp: (type: DiabetesType) => void;
  workspace: WorkspacePayload | null;
  onAction: (action: ActionId) => Promise<void>;
  onPreferencesSave: (preferences: SafetyPreferencesInput) => Promise<void>;
  onDexcomConnect: () => Promise<void>;
  onDexcomOAuthStart: () => Promise<void>;
  onDexcomOAuthFinish: (code: string) => Promise<void>;
  onDexcomTokenRefresh: () => Promise<void>;
  onDexcomDisconnect: () => Promise<void>;
  onDexcomPoll: () => Promise<void>;
  onNutritionAnalyze: (payload: { imageBase64?: string; note?: string }) => Promise<void>;
  onWorkspaceRefresh?: () => Promise<void>;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  user,
  lang,
  setLang,
  theme,
  setTheme,
  onLogout,
  onBackToPublic,
  onSignUp,
  workspace,
  onAction, onPreferencesSave, onDexcomConnect, onDexcomOAuthStart, onDexcomOAuthFinish, onDexcomTokenRefresh, onDexcomDisconnect, onDexcomPoll, onNutritionAnalyze, onWorkspaceRefresh }) => {
  const diabetesType = workspace?.household?.diabetesType ?? readSignupDiabetesType() ?? 'type1';
  const memberCopy = MEMBER_CHROME_COPY[lang];
  const copy = resolveWorkspaceCopy(lang, diabetesType);
  const preferenceCopy = PREFERENCE_COPY[lang];
  const accountDeleteCopy = ACCOUNT_DELETE_COPY[lang];
  const notificationCopy = NOTIFICATION_COPY[lang];
  const deliveryCopy = DELIVERY_COPY[lang];
  const householdCopy = HOUSEHOLD_COPY[lang];
  const reviewCopy = REVIEW_COPY[lang];
  const dexcomOpsCopy = DEXCOM_OPS_COPY[lang];
  const guidanceCopy = GUIDANCE_COPY[lang];
  const readinessCopy = READINESS_COPY[lang];
  const summaryCopy = SUMMARY_COPY[lang];
  const layoutCopy = LAYOUT_COPY[lang];
  const dexcomCopy = DEXCOM_COPY[lang];
  const labels = PRODUCT_LABELS[lang];
  const isRTL = RTL_LANGUAGES.includes(lang);
  const roleLabels = getRoleLabels(lang, workspace?.household?.diabetesType ?? 'type1');
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(workspace?.selectedSession?.id || null);
  const [preferences, setPreferences] = React.useState(() => {
    const prefs = workspace?.household?.safetyPreferences;
    return prefs
      ? {
          ...prefs,
          glucoseUnit: normalizeGlucoseUnit(prefs.glucoseUnit),
          contactPhones: normalizeContactPhones(prefs.contactPhones),
        }
      : null;
  });
  const [savingPreferences, setSavingPreferences] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState('');
  const [deletingAccount, setDeletingAccount] = React.useState(false);
  const [deleteAccountError, setDeleteAccountError] = React.useState('');
  const [activeSection, setActiveSection] = React.useState<WorkspaceSectionId>('now');
  const [actionFeedback, setActionFeedback] = React.useState<{ title: string; body: string; next: string } | null>(null);
  const [actionBusy, setActionBusy] = React.useState(false);
  const [connectionBusy, setConnectionBusy] = React.useState(false);
  const [nutritionBusy, setNutritionBusy] = React.useState(false);
  const [inviteCopied, setInviteCopied] = React.useState(false);

  React.useEffect(() => {
    setSelectedSessionId(workspace?.selectedSession?.id || workspace?.dailyHistory[0]?.id || null);
  }, [workspace?.selectedSession?.id, workspace?.dailyHistory]);
  React.useEffect(() => {
    const prefs = workspace?.household?.safetyPreferences;
    setPreferences(
      prefs
        ? {
            ...prefs,
            glucoseUnit: normalizeGlucoseUnit(prefs.glucoseUnit),
            contactPhones: normalizeContactPhones(prefs.contactPhones),
          }
        : null,
    );
  }, [workspace?.household?.safetyPreferences]);

  if (!workspace || workspace.needsSetup || !workspace.household || !workspace.currentState || !workspace.morningSummary) {
    return (
      <MemberZoneShell
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        isRTL={isRTL}
        diabetesType={diabetesType}
        activePageLabel={memberCopy.activeWorkspace}
        accountLabel={memberCopy.signOut}
        onAccountAction={onLogout}
        onBackToPublic={onBackToPublic}
        onSignUp={onSignUp}
        hero={(
          <MemberPageHero
            variant="setup"
            theme={theme}
            isRTL={isRTL}
            diabetesType={diabetesType}
            eyebrow={copy.eyebrow}
            title={copy.currentState}
            subtitle={copy.householdName}
          />
        )}
      >
        <div className={`${t1dMemberLayout()} relative`}>
          <div className={`${t1dPanelPrimary(theme)} ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className={`${t1dEyebrow(theme)} mb-3`}>{copy.eyebrow}</p>
            <p className="text-lg font-black tracking-tight">{copy.currentState}</p>
          </div>
        </div>
      </MemberZoneShell>
    );
  }

  const household = workspace.household;
  const currentState = workspace.currentState;
  const deviceStatus = workspace.deviceStatus;
  const dexcom = workspace.dexcomConnection;
  const morningSummary = workspace.morningSummary;
  const focus = resolveRoleFocus(lang, household.diabetesType, user.role);
  const preferenceExplainer = resolvePreferenceExplainer(lang, household.diabetesType, preferenceCopy.explainer);
  const trendLabel = labels[currentState.trend];
  const confidenceLabel = labels[currentState.confidence];
  const dataLabel = labels[currentState.dataStatus];
  const deviceStatusLabel = deviceStatus ? labels[deviceStatus.status] : labels.waiting;
  const modeLabel = labels[currentState.mode];
  const failCopy = {
    ...copy.failStates,
    ...resolveFailStateHints(lang, household.diabetesType, {
      dayHint: copy.failStates.dayHint,
      nightHint: copy.failStates.nightHint,
    }),
  };
  const roleKey = (user.role === 'caregiver' ? 'caregiver' : user.role === 'adult' ? 'adult' : 'parent');
  const hasOfflineData = currentState.dataStatus === 'offline' || deviceStatus?.status === 'offline';
  const hasDelayedData = currentState.dataStatus === 'delayed' || deviceStatus?.status === 'delayed';
  const hasWaitingData = currentState.dataStatus === 'waiting';
  const displayHeadline =
    hasOfflineData ? failCopy.offlineTitle :
    hasWaitingData ? failCopy.waitingTitle :
    hasDelayedData ? failCopy.delayedTitle :
    currentState.headline;
  const displayRecommendation =
    hasOfflineData ? failCopy.offlineBody[roleKey] :
    hasWaitingData ? failCopy.waitingBody[roleKey] :
    hasDelayedData ? failCopy.delayedBody[roleKey] :
    currentState.recommendation;
  const modeHint = currentState.mode === 'night' ? failCopy.nightHint : failCopy.dayHint;
  const dataHealthSummary = deviceStatus
    ? `${dataLabel} · ${deviceStatus.signalAgeMinutes === null ? '--' : `${deviceStatus.signalAgeMinutes}m`} · ${confidenceLabel}`
    : `${dataLabel} · ${confidenceLabel}`;
  const preferencesSummary = preferences
    ? `${preferenceCopy.fields.day}: ${preferenceCopy.options[preferences.daySensitivity]} · ${preferenceCopy.fields.night}: ${preferenceCopy.options[preferences.nightSensitivity]} · ${preferenceCopy.fields.dayContact}: ${roleLabels[preferences.dayPrimaryContact]} · ${preferenceCopy.fields.nightContact}: ${roleLabels[preferences.nightPrimaryContact]} · ${preferences.caregiverDelaySeconds}${preferenceCopy.options.seconds}`
    : null;
  const notificationSummary = workspace.notificationSummary;
  const notificationFeed = workspace.notificationFeed || [];
  const deliveryStatusLabel = notificationSummary
    ? ({
        quiet: deliveryCopy.quiet,
        delivered: deliveryCopy.delivered,
        retrying: deliveryCopy.retrying,
        escalated: deliveryCopy.escalated,
      }[notificationSummary.deliveryStatus])
    : null;
  const notificationSummaryLine = notificationSummary
    ? `${notificationCopy.dayFlow}: ${notificationCopy.settings[notificationSummary.daySensitivity]} · ${roleLabels[notificationSummary.dayPrimaryContact]} · ${notificationCopy.nightFlow}: ${notificationCopy.settings[notificationSummary.nightSensitivity]} · ${roleLabels[notificationSummary.nightPrimaryContact]} · ${notificationCopy.backup}: ${notificationSummary.caregiverEnabled ? `${notificationSummary.caregiverDelaySeconds}${preferenceCopy.options.seconds}` : notificationCopy.disabled}`
    : null;
  const notificationMetaLine = notificationSummary
    ? `${deliveryCopy.channel}: ${deliveryCopy.push} · ${deliveryCopy.target}: ${roleLabels[notificationSummary.activeRecipient]} · ${deliveryCopy.attempts}: ${notificationSummary.totalAttempts} · ${deliveryStatusLabel}`
    : null;
  const reviewSummary = workspace.reviewSummary;
  const dailyGuidance = workspace.dailyGuidance;
  const householdReadiness = workspace.householdReadiness;
  const contextualSummary = workspace.contextualSummary;
  const reviewLabel = (value: 'strong' | 'watch' | 'fragile') => value === 'strong' ? reviewCopy.strong : value === 'watch' ? reviewCopy.watch : reviewCopy.fragile;
  const patternLabel = (value: 'steady' | 'repeat-risk' | 'escalation-heavy') => value === 'steady' ? reviewCopy.steady : value === 'repeat-risk' ? reviewCopy.repeatRisk : reviewCopy.escalationHeavy;
  const [oauthCode, setOauthCode] = React.useState('');
  const dexcomModeLabel = dexcom ? (dexcom.authMode === 'oauth_ready' ? dexcomCopy.oauth : dexcomCopy.mock) : '';
  const dexcomConfigLabel = dexcom ? (dexcom.configStatus === 'ready' ? dexcomCopy.ready : dexcomCopy.missing) : '';
  const dexcomTokenStatusLabel = dexcom ? ({
    active: dexcomCopy.active,
    expiring_soon: dexcomCopy.expiringSoon,
    expired: dexcomCopy.expired,
    missing: dexcomCopy.missingToken,
  }[dexcom.tokenStatus]) : '';
  const dexcomAutoRefreshLabel = dexcom ? ({
    idle: dexcomCopy.idleState,
    not_needed: dexcomCopy.noRefreshNeeded,
    refreshed: dexcomCopy.refreshedNow,
    failed: dexcomCopy.refreshFailed,
  }[dexcom.autoRefreshState]) : '';
  const canStartOAuth = Boolean(dexcom?.configStatus === 'ready' && dexcom?.authorizePath);

  const dexcomStatusLabel = dexcom
    ? ({
        disconnected: dexcomCopy.disconnected,
        connected: dexcomCopy.connected,
        error: dexcomCopy.error,
      }[dexcom.status])
    : null;
  const dexcomFreshnessLabel = dexcom
    ? ({
        live: dexcomCopy.live,
        delayed: dexcomCopy.delayed,
        stale: dexcomCopy.stale,
        offline: dexcomCopy.offline,
      }[dexcom.dataFreshness])
    : null;
  const dexcomHealth = workspace.dexcomHealth;
  const dexcomScheduler = workspace.dexcomScheduler;
  const dexcomAuditTrail = workspace.dexcomAuditTrail || [];
  const dexcomHealthLabel = dexcomHealth
    ? ({
        healthy: dexcomOpsCopy.healthy,
        watch: dexcomOpsCopy.watch,
        broken: dexcomOpsCopy.broken,
      }[dexcomHealth.state])
    : null;
  const dexcomSchedulerLabel = dexcomScheduler
    ? ({
        idle: dexcomOpsCopy.idle,
        scheduled: dexcomOpsCopy.scheduled,
        paused: dexcomOpsCopy.paused,
        running: dexcomOpsCopy.running,
      }[dexcomScheduler.state])
    : null;
  const dexcomDeviceRuntimeLabel = dexcom
    ? ({
        connected: labels.connected,
        offline: labels.offline,
        unknown: labels.unknown,
      }[dexcom.deviceRuntime])
    : null;
  const supportDetails =
    user.role === 'adult'
      ? [
          [copy.householdName, household.householdName],
          [copy.childCard, household.childName || user.fullName || user.email],
          [copy.responder, currentState.responder],
          [copy.nightWindow, household.nightWindow],
        ]
      : user.role === 'caregiver'
        ? [
            [copy.householdName, household.householdName],
            [copy.primaryParent, household.primaryParent],
            [copy.caregiver, household.caregiverName],
            [copy.responder, currentState.responder],
          ]
        : [
            [copy.householdName, household.householdName],
            [copy.primaryParent, household.primaryParent],
            [copy.caregiver, household.caregiverName],
            [copy.nightWindow, household.nightWindow],
        ];

  const handlePreferenceSave = async () => {
    if (!preferences) return;
    setSavingPreferences(true);
    try {
      await onPreferencesSave(preferences);
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteAccountError('');
    try {
      await deleteAccount(deletePassword ? { password: deletePassword } : { confirm: true });
      onLogout();
    } catch (error) {
      setDeleteAccountError(error instanceof Error && /401|password/i.test(error.message)
        ? accountDeleteCopy.errorPassword
        : (error instanceof Error ? error.message : accountDeleteCopy.errorPassword));
    } finally {
      setDeletingAccount(false);
    }
  };

  const primaryPanelClass = t1dPanelPrimary(theme);
  const subtlePanelClass = t1dPanelSubtle(theme);
  const surfacePanelClass = `${t1dPanelSurface(theme)} ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`;
  const compactCardClass = t1dPanelCompact(theme);
  const compactSurfaceCardClass = t1dPanelCompactSurface(theme);
  const secondaryHeadingClass = 'mt-4 text-lg font-extrabold tracking-tight md:text-xl';
  const softLabelClass = t1dSoftLabel(theme);
  const nowCopy = WORKSPACE_NOW_COPY[lang];
  const glucoseUnit = normalizeGlucoseUnit(preferences?.glucoseUnit);
  const sectionHeaders = resolveWorkspaceSectionHeaders(lang, household.diabetesType);
  const inviteCopy = resolveWorkspaceInviteCopy(lang, household.diabetesType);
  const nutrition = workspace.nutrition ?? createEmptyNutritionPayload(NUTRITION_COPY[lang].cameraHint);

  const handleActionClick = async (action: ActionId) => {
    setActionBusy(true);
    try {
      await onAction(action);
      setActionFeedback(resolveActionFeedback(lang, action));
      setActiveSection('timeline');
    } catch {
      setActionFeedback({
        title: lang === 'ru' ? 'Не удалось сохранить действие' : 'Could not save action',
        body: lang === 'ru' ? 'Проверьте соединение и попробуйте ещё раз.' : 'Check your connection and try again.',
        next: '',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleNutritionSubmit = async (payload: { imageBase64?: string; note?: string }) => {
    setNutritionBusy(true);
    try {
      await onNutritionAnalyze(payload);
      setActionFeedback({
        title: lang === 'ru' ? 'Еда сохранена' : 'Meal saved',
        body: lang === 'ru' ? 'Отчёт добавлен в хронологию и учтён вместе с глюкозой.' : 'Report added to your timeline and linked with glucose.',
        next: lang === 'ru' ? 'Смотрите отчёт в разделе «Еда».' : 'See the full report in Meals.',
      });
    } finally {
      setNutritionBusy(false);
    }
  };

  const wrapConnection = (fn: () => Promise<void>) => async () => {
    setConnectionBusy(true);
    try {
      await fn();
    } finally {
      setConnectionBusy(false);
    }
  };

  const copyInviteCode = async () => {
    if (!household.inviteCode || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setInviteCopied(true);
      window.setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      setInviteCopied(false);
    }
  };

  const sectionEyebrowClass = t1dEyebrow(theme);
  const workspaceSectionShell = theme === 'dark' ? 't1d-workspace-section t1d-workspace-section--dark' : 't1d-workspace-section t1d-workspace-section--light';
  const workspaceStat = theme === 'dark' ? 't1d-workspace-stat t1d-workspace-stat--dark' : 't1d-workspace-stat t1d-workspace-stat--light';

  return (
    <>
      <MemberZoneShell
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        isRTL={isRTL}
        diabetesType={household.diabetesType}
        activePageLabel={memberCopy.activeWorkspace}
        accountLabel={memberCopy.signOut}
        onAccountAction={onLogout}
        onBackToPublic={onBackToPublic}
        onSignUp={onSignUp}
        hero={(
          <MemberPageHero
            variant="workspace"
            theme={theme}
            isRTL={isRTL}
            diabetesType={household.diabetesType}
            eyebrow={copy.eyebrow}
            title={`${copy.welcome}, ${user.fullName || user.email}`}
            subtitle={focus.body}
          />
        )}
      >
        <div className={`${t1dMemberLayout()} ${memberLayoutTypeClass(household.diabetesType)} relative`}>
        <WorkspaceBetaBanner lang={lang} theme={theme} isRTL={isRTL} />

        <div className={`t1d-workspace-shell ${workspaceShellTypeClass(household.diabetesType)} ${isRTL ? 't1d-workspace-shell--rtl' : ''}`}>
          <WorkspaceSidebar active={activeSection} onSelect={setActiveSection} theme={theme} lang={lang} isRTL={isRTL} diabetesType={household.diabetesType} />
          <div className="t1d-workspace-main">
            {actionFeedback ? (
              <WorkspaceActionBanner
                title={actionFeedback.title}
                body={actionFeedback.body}
                nextHint={actionFeedback.next}
                theme={theme}
                isRTL={isRTL}
                onDismiss={() => setActionFeedback(null)}
                onOpenTimeline={() => setActiveSection('timeline')}
                openTimelineLabel={nowCopy.openTimeline}
              />
            ) : null}
            {activeSection === 'now' ? (
          <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
            <WorkspaceSectionHeader title={sectionHeaders.now.title} subtitle={sectionHeaders.now.subtitle} theme={theme} isRTL={isRTL} />
            <GlucoseNowDashboard
              lang={lang}
              theme={theme}
              isRTL={isRTL}
              diabetesType={household.diabetesType}
              glucoseUnit={glucoseUnit}
              currentState={currentState}
              dexcom={dexcom}
              recentMeals={nutrition?.recentMeals ?? []}
              trendLabel={trendLabel}
              dataFieldLabel={labels.data}
              dataStatusLabel={dataLabel}
              responderLabel={copy.responder}
              stateLabel={copy.stateLabels[currentState.level]}
              modeLabels={{ day: labels.day, night: labels.night }}
              headline={displayHeadline}
              recommendation={displayRecommendation}
            />
            <WorkspaceNowPanel
              lang={lang}
              theme={theme}
              isRTL={isRTL}
              diabetesType={household.diabetesType}
              glucoseUnit={glucoseUnit}
              currentState={currentState}
              contextualSummary={contextualSummary}
              dailyGuidance={dailyGuidance}
              householdReadiness={householdReadiness}
              nutrition={nutrition}
              preferences={preferences}
              guidanceLabels={guidanceCopy}
              readinessLabels={readinessCopy}
              summaryLabels={summaryCopy}
              modeLabels={{ day: labels.day, night: labels.night }}
              currentStateLabel={copy.stateLabels[currentState.level]}
            />
            {nutrition?.insight ? (
              <button
                type="button"
                onClick={() => setActiveSection('nutrition')}
                className={`mt-5 w-full rounded-2xl border p-4 text-left transition ${theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400/50' : 'border-emerald-200 bg-emerald-50/90 hover:border-emerald-300'}`}
              >
                <p className={softLabelClass}>{nowCopy.latestMeal}</p>
                <p className="mt-2 text-sm font-bold">{nutrition.insight.headline}</p>
                <p className="mt-1 text-sm leading-relaxed opacity-80">{nutrition.insight.detail}</p>
              </button>
            ) : null}
            <div className={`mt-5 border-t pt-5 ${theme === 'dark' ? 'border-slate-800' : 'border-orange-100'}`}>
              <p className={sectionEyebrowClass}>{copy.quickActions}</p>
              {(currentState.level === 'watch' || currentState.level === 'risk') ? (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => handleActionClick('all_ok')}
                  className={`mb-3 w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}
                >
                  {nowCopy.allClear}
                </button>
              ) : null}
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {workspace.quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={actionBusy}
                    onClick={() => handleActionClick(action.id)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                      theme === 'dark'
                        ? 'border-amber-400/30 bg-stone-950/40 text-amber-50 hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/10'
                        : 'border-orange-200 bg-white text-stone-900 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10'
                    }`}
                  >
                    {ACTION_LABELS[lang][action.id]}
                  </button>
                ))}
                {workspace.quickActions.length > 0 ? (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => handleActionClick('DONE')}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold sm:col-span-2 ${t1dBtnPrimary(theme)}`}
                  >
                    {copy.doneAction}
                  </button>
                ) : null}
              </div>
            </div>
          </section>
            ) : null}

            {activeSection === 'nutrition' ? (
          <div className={`${primaryPanelClass} ${workspaceSectionShell}`}>
          <FoodAnalysisPanel
            lang={lang}
            theme={theme}
            isRTL={isRTL}
            sectionTitle={sectionHeaders.nutrition.title}
            sectionSubtitle={sectionHeaders.nutrition.subtitle}
            nutrition={nutrition}
            onAnalyze={handleNutritionSubmit}
            busy={nutritionBusy}
          />
          </div>
            ) : null}

            {activeSection === 'system' ? (
          <ConnectionPanel
            lang={lang}
            theme={theme}
            isRTL={isRTL}
            sectionTitle={sectionHeaders.system.title}
            sectionSubtitle={sectionHeaders.system.subtitle}
            deviceStatus={deviceStatus}
            dexcom={dexcom}
            glucoseUnit={glucoseUnit}
            glucoseLabel={labels.glucose}
            trendLabel={dexcom?.latestTrend ? labels[dexcom.latestTrend] : labels.flat}
            onConnect={wrapConnection(onDexcomConnect)}
            onDisconnect={wrapConnection(onDexcomDisconnect)}
            onPoll={wrapConnection(onDexcomPoll)}
            busy={connectionBusy}
          />
            ) : null}

            {activeSection === 'timeline' ? (
          <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
            <WorkspaceSectionHeader title={sectionHeaders.timeline.title} subtitle={sectionHeaders.timeline.subtitle} theme={theme} isRTL={isRTL} />
            <div className="mt-5">
              <EventTimeline
                lang={lang}
                theme={theme}
                isRTL={isRTL}
                user={user}
                compactCardClass={compactCardClass}
                onWorkspaceRefresh={onWorkspaceRefresh}
              />
            </div>
          </section>
            ) : null}

            {activeSection === 'settings' && preferences ? (
              <WorkspaceSettingsSection
                lang={lang}
                theme={theme}
                isRTL={isRTL}
                primaryPanelClass={primaryPanelClass}
                workspaceSectionShell={workspaceSectionShell}
                softLabelClass={softLabelClass}
                sectionTitle={sectionHeaders.settings.title}
                sectionSubtitle={sectionHeaders.settings.subtitle}
                preferenceExplainer={preferenceExplainer}
                preferences={preferences}
                setPreferences={setPreferences as React.Dispatch<React.SetStateAction<SafetyPreferencesInput | null>>}
                savingPreferences={savingPreferences}
                onSave={handlePreferenceSave}
                deletePassword={deletePassword}
                setDeletePassword={setDeletePassword}
                deleteAccountError={deleteAccountError}
                deletingAccount={deletingAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            ) : null}

            {activeSection === 'alerts' && notificationSummary && preferences ? (
              <WorkspaceAlertsSection
                lang={lang}
                theme={theme}
                isRTL={isRTL}
                diabetesType={household.diabetesType}
                household={household}
                primaryPanelClass={primaryPanelClass}
                workspaceSectionShell={workspaceSectionShell}
                subtlePanelClass={subtlePanelClass}
                softLabelClass={softLabelClass}
                sectionTitle={sectionHeaders.alerts.title}
                sectionSubtitle={sectionHeaders.alerts.subtitle}
                preferences={preferences}
                setPreferences={setPreferences as React.Dispatch<React.SetStateAction<SafetyPreferencesInput | null>>}
                notificationSummary={notificationSummary}
                notificationFeed={notificationFeed}
                deliveryStatusLabel={deliveryStatusLabel}
                roleLabels={roleLabels}
                savingPreferences={savingPreferences}
                onSave={handlePreferenceSave}
              />
            ) : null}

            {activeSection === 'history' ? (
              <WorkspaceHistorySection
                lang={lang}
                theme={theme}
                isRTL={isRTL}
                diabetesType={household.diabetesType}
                glucoseUnit={glucoseUnit}
                primaryPanelClass={primaryPanelClass}
                workspaceSectionShell={workspaceSectionShell}
                compactCardClass={compactCardClass}
                softLabelClass={softLabelClass}
                sectionTitle={sectionHeaders.history.title}
                sectionSubtitle={sectionHeaders.history.subtitle}
                copy={{
                  responders: copy.responders,
                  noHistory: copy.noHistory,
                  viewDetail: copy.viewDetail,
                  alerts: copy.alerts,
                  actions: copy.actions,
                  escalations: copy.escalations,
                }}
                morningSummary={morningSummary}
                dailyHistory={workspace.dailyHistory}
                selectedSessionId={selectedSessionId}
                onSelectSession={setSelectedSessionId}
              />
            ) : null}

            {activeSection === 'family' ? (
              <WorkspaceFamilySection
                lang={lang}
                theme={theme}
                isRTL={isRTL}
                household={household}
                primaryPanelClass={primaryPanelClass}
                workspaceSectionShell={workspaceSectionShell}
                subtlePanelClass={subtlePanelClass}
                softLabelClass={softLabelClass}
                sectionTitle={sectionHeaders.family.title}
                sectionSubtitle={sectionHeaders.family.subtitle}
                copy={{
                  childCard: copy.childCard,
                  primaryParent: copy.primaryParent,
                  caregiver: copy.caregiver,
                }}
                inviteCopy={inviteCopy}
                roleLabels={roleLabels}
                inviteCopied={inviteCopied}
                onCopyInviteCode={copyInviteCode}
              />
            ) : null}

          </div>
        </div>
        </div>
      </MemberZoneShell>
      <WorkspaceOnboarding lang={lang} theme={theme} diabetesType={household.diabetesType} onGoToNutrition={() => setActiveSection('nutrition')} />
    </>
  );
};

export default WorkspaceView;
