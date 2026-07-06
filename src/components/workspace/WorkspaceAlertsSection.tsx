import React from 'react';
import type { HouseholdProfile, NotificationDeliveryItem, NotificationSummaryPayload, SafetyPreferencesInput } from '../../lib/api';
import { DELIVERY_COPY, NOTIFICATION_COPY, PREFERENCE_COPY } from '../../content/workspace-panel-copy';
import { t1dBtnPrimary, t1dSoftLabel } from '../../lib/t1d-ui';
import type { DiabetesType, Language } from '../../types';
import { AlertFlowDiagram } from './AlertFlowDiagram';
import { WorkspaceSectionHeader } from './WorkspaceSectionHeader';

interface WorkspaceAlertsSectionProps {
  lang: Language;
  theme: 'light' | 'dark';
  isRTL: boolean;
  diabetesType: DiabetesType;
  household: HouseholdProfile;
  primaryPanelClass: string;
  workspaceSectionShell: string;
  subtlePanelClass: string;
  softLabelClass: string;
  sectionTitle: string;
  sectionSubtitle: string;
  preferences: SafetyPreferencesInput;
  setPreferences: React.Dispatch<React.SetStateAction<SafetyPreferencesInput | null>>;
  notificationSummary: NotificationSummaryPayload;
  notificationFeed: NotificationDeliveryItem[];
  deliveryStatusLabel: string | null;
  roleLabels: Record<'parent' | 'adult' | 'caregiver', string>;
  savingPreferences: boolean;
  onSave: () => void;
}

export const WorkspaceAlertsSection: React.FC<WorkspaceAlertsSectionProps> = ({
  lang,
  theme,
  isRTL,
  diabetesType,
  household,
  primaryPanelClass,
  workspaceSectionShell,
  subtlePanelClass,
  softLabelClass,
  sectionTitle,
  sectionSubtitle,
  preferences,
  setPreferences,
  notificationSummary,
  notificationFeed,
  deliveryStatusLabel,
  roleLabels,
  savingPreferences,
  onSave,
}) => {
  const notificationCopy = NOTIFICATION_COPY[lang];
  const preferenceCopy = PREFERENCE_COPY[lang];
  const deliveryCopy = DELIVERY_COPY[lang];
  const selectClass = `w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`;

  return (
    <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
      <WorkspaceSectionHeader title={sectionTitle} subtitle={sectionSubtitle} theme={theme} isRTL={isRTL} />
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.explainer}</p>
      {deliveryStatusLabel ? (
        <AlertFlowDiagram
          lang={lang}
          theme={theme}
          isRTL={isRTL}
          diabetesType={diabetesType}
          notificationSummary={notificationSummary}
          roleLabels={roleLabels}
          deliveryStatusLabel={deliveryStatusLabel}
          sensitivityLabels={notificationCopy.settings}
        />
      ) : null}
      <div className="mt-5 grid max-w-2xl gap-4">
        <div className={`${subtlePanelClass} px-4 py-4`}>
          <p className={softLabelClass}>{notificationCopy.dayFlow}</p>
          <p className="mt-2 text-sm font-semibold">{roleLabels[notificationSummary.dayPrimaryContact]}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.descriptions.day[notificationSummary.daySensitivity]}</p>
        </div>
        <div className={`${subtlePanelClass} px-4 py-4`}>
          <p className={softLabelClass}>{notificationCopy.nightFlow}</p>
          <p className="mt-2 text-sm font-semibold">{roleLabels[notificationSummary.nightPrimaryContact]}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.descriptions.night[notificationSummary.nightSensitivity]}</p>
        </div>
        <div className={`${subtlePanelClass} px-4 py-4`}>
          <p className={softLabelClass}>{notificationCopy.backup}</p>
          <p className="mt-2 text-sm font-semibold">
            {notificationSummary.caregiverEnabled
              ? `${household.caregiverName || roleLabels.caregiver} · ${notificationCopy.enabled}`
              : notificationCopy.disabled}
          </p>
        </div>
        <label className="space-y-2">
          <span className={softLabelClass}>{preferenceCopy.fields.dayContact}</span>
          <select
            value={preferences.dayPrimaryContact}
            onChange={(event) =>
              setPreferences((current) =>
                current ? { ...current, dayPrimaryContact: event.target.value as SafetyPreferencesInput['dayPrimaryContact'] } : current,
              )
            }
            className={selectClass}
          >
            <option value="parent">{roleLabels.parent}</option>
            <option value="adult">{roleLabels.adult}</option>
            {household.caregiverName ? <option value="caregiver">{roleLabels.caregiver}</option> : null}
          </select>
        </label>
        <label className="space-y-2">
          <span className={softLabelClass}>{preferenceCopy.fields.nightContact}</span>
          <select
            value={preferences.nightPrimaryContact}
            onChange={(event) =>
              setPreferences((current) =>
                current ? { ...current, nightPrimaryContact: event.target.value as SafetyPreferencesInput['nightPrimaryContact'] } : current,
              )
            }
            className={selectClass}
          >
            <option value="parent">{roleLabels.parent}</option>
            <option value="adult">{roleLabels.adult}</option>
            {household.caregiverName ? <option value="caregiver">{roleLabels.caregiver}</option> : null}
          </select>
        </label>
        <button type="button" onClick={onSave} disabled={savingPreferences} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${t1dBtnPrimary(theme)} disabled:opacity-50`}>
          {savingPreferences ? preferenceCopy.saving : preferenceCopy.save}
        </button>
      </div>
      {notificationFeed.length > 0 ? (
        <div className="mt-6 max-w-2xl">
          <p className={softLabelClass}>{deliveryCopy.feed}</p>
          <div className="mt-3 space-y-2">
            {notificationFeed.slice(0, 5).map((item) => (
              <div key={item.id} className={`rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                <p className="text-sm font-semibold">{roleLabels[item.recipientRole]} · {item.timeLabel}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};
