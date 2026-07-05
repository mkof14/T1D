import React from 'react';
import { CheckCircle2, Moon, Sun, UtensilsCrossed, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import type { DiabetesType, Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dSoftLabel } from '../../lib/t1d-ui';
import type {
  ContextualSummary,
  CurrentStatePayload,
  DailyGuidanceSummary,
  HouseholdReadinessSummary,
  NutritionPayload,
  SafetyPreferences,
} from '../../lib/api';
import { WORKSPACE_VISUAL_COPY } from '../../content/workspace-visual-copy';
import { formatGlucoseValue, glucoseTargetRange, type GlucoseUnit } from '../../lib/glucose-units';

type WorkspaceNowPanelProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL?: boolean;
  diabetesType: DiabetesType;
  glucoseUnit: GlucoseUnit;
  currentState: CurrentStatePayload;
  contextualSummary: ContextualSummary | null;
  dailyGuidance: DailyGuidanceSummary | null;
  householdReadiness: HouseholdReadinessSummary | null;
  nutrition: NutritionPayload | null;
  preferences: SafetyPreferences | null;
  guidanceLabels: { title: string; now: string; watch: string; fallback: string; checklist: string };
  readinessLabels: {
    title: string;
    connection: string;
    backup: string;
    responder: string;
    recovery: string;
    ready: string;
    watch: string;
    needsAttention: string;
  };
  summaryLabels: { calm: string; watch: string; attention: string };
  modeLabels: { day: string; night: string };
  currentStateLabel: string;
};

const toneClass = (tone: ContextualSummary['tone'] | HouseholdReadinessSummary['state']) => {
  if (tone === 'calm' || tone === 'ready') return 't1d-insight-card--calm';
  if (tone === 'watch') return 't1d-insight-card--watch';
  return 't1d-insight-card--attention';
};

export const WorkspaceNowPanel: React.FC<WorkspaceNowPanelProps> = ({
  lang,
  theme,
  isRTL = false,
  diabetesType,
  glucoseUnit,
  currentState,
  contextualSummary,
  dailyGuidance,
  householdReadiness,
  nutrition,
  preferences,
  guidanceLabels,
  readinessLabels,
  summaryLabels,
  modeLabels,
  currentStateLabel,
}) => {
  const copy = WORKSPACE_VISUAL_COPY[lang];
  const softLabelClass = t1dSoftLabel(theme);
  const target = glucoseTargetRange(diabetesType);
  const glucose = currentState.glucose;
  const lowLine = formatGlucoseValue(target.low, glucoseUnit);
  const highLine = formatGlucoseValue(target.high, glucoseUnit);
  const carbsToday = nutrition?.dailyTotals?.carbs ?? nutrition?.insight?.carbs ?? 0;
  const lastMeal = nutrition?.lastMeal;

  const readinessItems = householdReadiness
    ? [
        { label: readinessLabels.connection, value: householdReadiness.connection },
        { label: readinessLabels.backup, value: householdReadiness.backup },
        { label: readinessLabels.responder, value: householdReadiness.responder },
        { label: readinessLabels.recovery, value: householdReadiness.recovery },
      ]
    : [];

  const readinessStateLabel =
    householdReadiness?.state === 'ready'
      ? readinessLabels.ready
      : householdReadiness?.state === 'watch'
        ? readinessLabels.watch
        : readinessLabels.needsAttention;

  const summaryToneLabel = contextualSummary
    ? contextualSummary.tone === 'calm'
      ? summaryLabels.calm
      : contextualSummary.tone === 'watch'
        ? summaryLabels.watch
        : summaryLabels.attention
    : null;

  return (
    <div className={`mt-5 space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      {contextualSummary ? (
        <div className={`t1d-insight-card ${toneClass(contextualSummary.tone)} ${theme === 'dark' ? 't1d-insight-card--dark' : 't1d-insight-card--light'}`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p className={softLabelClass}>{copy.quickRead}</p>
            {summaryToneLabel ? <span className="t1d-insight-card__badge">{summaryToneLabel}</span> : null}
          </div>
          <p className="mt-2 text-lg font-black tracking-tight">{contextualSummary.headline}</p>
          <p className="mt-2 text-sm leading-relaxed opacity-85">{contextualSummary.detail}</p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        {householdReadiness ? (
          <div className={`t1d-insight-card ${toneClass(householdReadiness.state)} ${theme === 'dark' ? 't1d-insight-card--dark' : 't1d-insight-card--light'}`}>
            <div className={`flex flex-wrap items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className={softLabelClass}>{readinessLabels.title}</p>
              <span className="t1d-insight-card__badge">{readinessStateLabel}</span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{householdReadiness.headline}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {readinessItems.map((item) => (
                <div key={item.label} className="t1d-readiness-metric">
                  <p className={softLabelClass}>{item.label}</p>
                  <p className="mt-1 text-sm font-bold leading-snug">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {dailyGuidance ? (
          <div className={`t1d-insight-card ${theme === 'dark' ? 't1d-insight-card--dark t1d-insight-card--neutral' : 't1d-insight-card--light t1d-insight-card--neutral'}`}>
            <p className={softLabelClass}>{guidanceLabels.checklist}</p>
            <p className="mt-2 text-sm font-semibold">{dailyGuidance.now}</p>
            <ul className={`mt-4 space-y-2 ${isRTL ? 'pr-0' : 'pl-0'}`}>
              {dailyGuidance.checklist.map((item) => (
                <li key={item} className={`flex items-start gap-2 text-sm font-semibold ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 opacity-80" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2 text-sm">
              <p><span className={softLabelClass}>{guidanceLabels.watch}</span> {dailyGuidance.watch}</p>
              <p><span className={softLabelClass}>{guidanceLabels.fallback}</span> {dailyGuidance.fallback}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`grid gap-3 ${diabetesType === 'type2' ? 'md:grid-cols-3' : 'md:grid-cols-3'}`}>
        <div className={`t1d-type-widget t1d-type-widget--mode ${theme === 'dark' ? 't1d-type-widget--dark' : 't1d-type-widget--light'}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {currentState.mode === 'night' ? <Moon size={18} /> : <Sun size={18} />}
            <p className={softLabelClass}>{currentState.mode === 'night' ? copy.nightMode : copy.dayMode}</p>
          </div>
          <p className="t1d-type-widget__value">{currentState.mode === 'night' ? modeLabels.night : modeLabels.day}</p>
          {preferences ? (
            <p className="mt-2 text-sm font-semibold opacity-85">
              {currentState.mode === 'night' ? preferences.nightSensitivity : preferences.daySensitivity}
            </p>
          ) : null}
        </div>

        {diabetesType === 'type1' ? (
          <>
            <div className={`t1d-type-widget t1d-type-widget--t1-low ${theme === 'dark' ? 't1d-type-widget--dark' : 't1d-type-widget--light'}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <TrendingDown size={18} />
                <p className={softLabelClass}>{copy.lowThreshold}</p>
              </div>
              <p className="t1d-type-widget__value">{lowLine}</p>
              <p className="mt-2 text-sm font-semibold opacity-85">{glucoseUnit}</p>
            </div>
            <div className={`t1d-type-widget t1d-type-widget--watch ${theme === 'dark' ? 't1d-type-widget--dark' : 't1d-type-widget--light'}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <AlertTriangle size={18} />
                <p className={softLabelClass}>{copy.watchState}</p>
              </div>
              <p className="t1d-type-widget__value">{currentStateLabel}</p>
              <p className="mt-2 text-sm font-semibold opacity-85">
                {Number.isFinite(glucose) && (glucose as number) < target.low ? `< ${lowLine} ${glucoseUnit}` : copy.watchFocus}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className={`t1d-type-widget t1d-type-widget--t2-carbs ${theme === 'dark' ? 't1d-type-widget--dark' : 't1d-type-widget--light'}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <UtensilsCrossed size={18} />
                <p className={softLabelClass}>{copy.carbsToday}</p>
              </div>
              <p className="t1d-type-widget__value">{carbsToday} g</p>
              <p className="mt-2 text-sm font-semibold opacity-85">{copy.postMealWindow}</p>
            </div>
            <div className={`t1d-type-widget t1d-type-widget--t2-high ${theme === 'dark' ? 't1d-type-widget--dark' : 't1d-type-widget--light'}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <TrendingUp size={18} />
                <p className={softLabelClass}>{copy.highThreshold}</p>
              </div>
              <p className="t1d-type-widget__value">{highLine}</p>
              <p className="mt-2 text-sm font-semibold opacity-85">
                {lastMeal ? `${copy.lastMeal}: ${lastMeal.timeLabel}` : glucoseUnit}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
