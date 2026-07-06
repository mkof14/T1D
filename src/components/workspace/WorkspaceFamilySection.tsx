import React from 'react';
import type { HouseholdProfile } from '../../lib/api';
import { DIABETES_TYPE_COPY, diabetesTypeKey } from '../../content/diabetes-type-copy';
import { HOUSEHOLD_COPY } from '../../content/workspace-panel-copy';
import { typeCardClass } from '../../lib/diabetes-type-theme';
import { t1dBtnSecondary, t1dSoftLabel } from '../../lib/t1d-ui';
import type { Language } from '../../types';
import { WorkspaceSectionHeader } from './WorkspaceSectionHeader';

interface WorkspaceFamilyCopy {
  childCard: string;
  primaryParent: string;
  caregiver: string;
}

interface WorkspaceFamilySectionProps {
  lang: Language;
  theme: 'light' | 'dark';
  isRTL: boolean;
  household: HouseholdProfile;
  primaryPanelClass: string;
  workspaceSectionShell: string;
  subtlePanelClass: string;
  softLabelClass: string;
  sectionTitle: string;
  sectionSubtitle: string;
  copy: WorkspaceFamilyCopy;
  inviteCopy: {
    title: string;
    body: string;
    copyLabel: string;
    copied: string;
  };
  roleLabels: Record<'parent' | 'adult' | 'caregiver', string>;
  inviteCopied: boolean;
  onCopyInviteCode: () => void;
}

export const WorkspaceFamilySection: React.FC<WorkspaceFamilySectionProps> = ({
  lang,
  theme,
  isRTL,
  household,
  primaryPanelClass,
  workspaceSectionShell,
  subtlePanelClass,
  softLabelClass,
  sectionTitle,
  sectionSubtitle,
  copy,
  inviteCopy,
  roleLabels,
  inviteCopied,
  onCopyInviteCode,
}) => {
  const householdCopy = HOUSEHOLD_COPY[lang];
  const diabetesTypeLabel = DIABETES_TYPE_COPY[lang][diabetesTypeKey(household.diabetesType)];

  return (
    <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
      <WorkspaceSectionHeader title={sectionTitle} subtitle={sectionSubtitle} theme={theme} isRTL={isRTL} />
      <div className="mt-5 max-w-2xl space-y-4">
        <div className={`${typeCardClass(household.diabetesType, theme)} p-5 md:p-6`}>
          <p className={softLabelClass}>{DIABETES_TYPE_COPY[lang].field}</p>
          <p className="mt-2 text-lg font-extrabold tracking-tight">{diabetesTypeLabel.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{diabetesTypeLabel.description}</p>
        </div>
        <div className={`${subtlePanelClass} p-5 md:p-6`}>
          <p className={softLabelClass}>{copy.childCard}</p>
          <p className="mt-2 text-lg font-extrabold tracking-tight">{household.childName} · {household.childAgeBand}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{copy.primaryParent}: {household.primaryParent}</p>
          {household.caregiverName ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.caregiver}: {household.caregiverName}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:gap-6">
        <div className={`${subtlePanelClass} p-5 md:p-6`}>
          <p className="text-base font-extrabold tracking-tight">{inviteCopy.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{inviteCopy.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <code className="t1d-invite-code">{household.inviteCode || '------'}</code>
            <button type="button" onClick={onCopyInviteCode} className={`${t1dBtnSecondary(theme)} text-sm`}>
              {inviteCopied ? inviteCopy.copied : inviteCopy.copyLabel}
            </button>
          </div>
        </div>
        <div className={`${subtlePanelClass} p-4`}>
          <p className={softLabelClass}>{householdCopy.members}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {household.members.map((member) => (
              <div
                key={member.id}
                className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black tracking-tight">{member.fullName}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    member.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                  }`}>
                    {member.status === 'active' ? householdCopy.active : householdCopy.invited}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{roleLabels[member.role]}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{member.email || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
