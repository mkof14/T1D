import React from 'react';
import type { DiabetesType, Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dSoftLabel } from '../../lib/t1d-ui';
import type {
  ContextualSummary,
  CurrentStatePayload,
  DailyGuidanceSummary,
  HouseholdReadinessSummary,
} from '../../lib/api';

type WorkspaceNowPanelProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL?: boolean;
  diabetesType: DiabetesType;
  currentState: CurrentStatePayload;
  contextualSummary: ContextualSummary | null;
  dailyGuidance: DailyGuidanceSummary | null;
  householdReadiness: HouseholdReadinessSummary | null;
  guidanceLabels: { watch: string; fallback: string };
  readinessLabels: {
    connection: string;
    backup: string;
    responder: string;
    recovery: string;
  };
};

const toneClass = (tone: ContextualSummary['tone'] | HouseholdReadinessSummary['state']) => {
  if (tone === 'calm' || tone === 'ready') return 't1d-insight-card--calm';
  if (tone === 'watch') return 't1d-insight-card--watch';
  return 't1d-insight-card--attention';
};

export const WorkspaceNowPanel: React.FC<WorkspaceNowPanelProps> = ({
  theme,
  isRTL = false,
  contextualSummary,
  dailyGuidance,
  householdReadiness,
  guidanceLabels,
  readinessLabels,
}) => {
  const fieldLabelClass = t1dSoftLabel(theme);
  const readinessItems = householdReadiness
    ? [
        { label: readinessLabels.connection, value: householdReadiness.connection },
        { label: readinessLabels.backup, value: householdReadiness.backup },
        { label: readinessLabels.responder, value: householdReadiness.responder },
        { label: readinessLabels.recovery, value: householdReadiness.recovery },
      ]
    : [];

  return (
    <div className={`mt-5 space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      {contextualSummary ? (
        <div className={`t1d-insight-card ${toneClass(contextualSummary.tone)} ${theme === 'dark' ? 't1d-insight-card--dark' : 't1d-insight-card--light'}`}>
          <p className="text-xl font-black tracking-tight">{contextualSummary.headline}</p>
          <p className="mt-3 text-base leading-relaxed">{contextualSummary.detail}</p>
        </div>
      ) : null}

      {householdReadiness ? (
        <div className={`t1d-insight-card ${toneClass(householdReadiness.state)} ${theme === 'dark' ? 't1d-insight-card--dark' : 't1d-insight-card--light'}`}>
          <p className="text-lg font-black tracking-tight">{householdReadiness.headline}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {readinessItems.map((item) => (
              <div
                key={item.label}
                className={`rounded-[1.1rem] border px-4 py-3 ${theme === 'dark' ? 'border-white/10 bg-white/[0.06]' : 'border-slate-200 bg-white/90'}`}
              >
                <p className={fieldLabelClass}>{item.label}</p>
                <p className="mt-1 text-base font-bold leading-snug">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {dailyGuidance ? (
        <div className={`t1d-insight-card ${theme === 'dark' ? 't1d-insight-card--dark t1d-insight-card--neutral' : 't1d-insight-card--light t1d-insight-card--neutral'}`}>
          <p className="text-lg font-black tracking-tight">{dailyGuidance.now}</p>
          <ul className={`mt-4 space-y-2 text-base leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
            {dailyGuidance.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {dailyGuidance.watch ? (
            <p className="mt-4 text-base leading-relaxed">
              <span className="font-bold">{guidanceLabels.watch}</span> {dailyGuidance.watch}
            </p>
          ) : null}
          {dailyGuidance.fallback ? (
            <p className="mt-3 text-base leading-relaxed">
              <span className="font-bold">{guidanceLabels.fallback}</span> {dailyGuidance.fallback}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
