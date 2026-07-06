import React from 'react';
import type { DailyHistoryEntry } from '../../lib/api';
import { WORKSPACE_NOW_COPY } from '../../content/workspace-now-copy';
import { WORKSPACE_VISUAL_COPY } from '../../content/workspace-visual-copy';
import type { DiabetesType, Language } from '../../types';
import type { GlucoseUnit } from '../../lib/glucose-units';
import { DailyHistoryChart } from './DailyHistoryChart';
import { WorkspaceSectionHeader } from './WorkspaceSectionHeader';

interface WorkspaceHistoryCopy {
  responders: string;
  noHistory: string;
  viewDetail: string;
  alerts: string;
  actions: string;
  escalations: string;
}

interface WorkspaceHistorySectionProps {
  lang: Language;
  theme: 'light' | 'dark';
  isRTL: boolean;
  diabetesType: DiabetesType;
  glucoseUnit: GlucoseUnit;
  primaryPanelClass: string;
  workspaceSectionShell: string;
  compactCardClass: string;
  softLabelClass: string;
  sectionTitle: string;
  sectionSubtitle: string;
  copy: WorkspaceHistoryCopy;
  morningSummary: {
    headline: string;
    outcome: string;
    responders: string[];
  };
  dailyHistory: DailyHistoryEntry[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
}

export const WorkspaceHistorySection: React.FC<WorkspaceHistorySectionProps> = ({
  lang,
  theme,
  isRTL,
  diabetesType,
  glucoseUnit,
  primaryPanelClass,
  workspaceSectionShell,
  compactCardClass,
  softLabelClass,
  sectionTitle,
  sectionSubtitle,
  copy,
  morningSummary,
  dailyHistory,
  selectedSessionId,
  onSelectSession,
}) => {
  const nowCopy = WORKSPACE_NOW_COPY[lang];
  const visualCopy = WORKSPACE_VISUAL_COPY[lang];

  return (
    <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'} pb-6`}>
      <WorkspaceSectionHeader title={sectionTitle} subtitle={sectionSubtitle} theme={theme} isRTL={isRTL} />
      <div className={`mt-5 ${compactCardClass}`}>
        <p className={softLabelClass}>{nowCopy.yesterdayGlance}</p>
        <p className="mt-2 text-base font-bold leading-relaxed">{morningSummary.headline}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{morningSummary.outcome}</p>
        <p className="mt-3 text-xs font-semibold opacity-75">{copy.responders}: {morningSummary.responders.join(', ')}</p>
      </div>
      {dailyHistory.length === 0 ? (
        <div className={`mt-5 rounded-[1.2rem] border p-4 md:rounded-[1.35rem] ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-slate-50/90 text-slate-600'}`}>
          <p className="text-sm leading-relaxed">{copy.noHistory}</p>
        </div>
      ) : (
        <div className="mt-5 grid max-w-3xl gap-3">
          {dailyHistory.map((entry) => {
            const expanded = selectedSessionId === entry.id;
            return (
              <div
                key={entry.id}
                className={`rounded-[1.2rem] border transition md:rounded-[1.35rem] ${
                  expanded
                    ? theme === 'dark'
                      ? 'border-amber-400/60 bg-amber-400/5'
                      : 'border-orange-300 bg-orange-50/80'
                    : theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/70'
                      : 'border-slate-200 bg-slate-50/90'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(expanded ? null : entry.id)}
                  className={`w-full p-4 ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={softLabelClass}>{entry.dateLabel}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-slate-950 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                      {expanded ? visualCopy.collapse : copy.viewDetail}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] font-black tracking-tight md:text-base">{entry.headline}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{entry.outcome}</p>
                </button>
                {expanded ? (
                  <div className={`border-t px-4 pb-4 pt-3 ${theme === 'dark' ? 'border-slate-800' : 'border-orange-100'}`}>
                    <DailyHistoryChart
                      lang={lang}
                      theme={theme}
                      isRTL={isRTL}
                      diabetesType={diabetesType}
                      glucoseUnit={glucoseUnit}
                      entry={entry}
                    />
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <span><span className={softLabelClass}>{copy.alerts}</span> <strong>{entry.alertsCount}</strong></span>
                      <span><span className={softLabelClass}>{copy.actions}</span> <strong>{entry.actionsCount}</strong></span>
                      <span><span className={softLabelClass}>{copy.escalations}</span> <strong>{entry.escalationCount}</strong></span>
                    </div>
                    <p className="mt-3 text-sm opacity-80">{copy.responders}: {entry.responders.join(', ')}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
