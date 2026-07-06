import React from 'react';
import type { SafetyPreferencesInput } from '../../lib/api';
import { glucoseUnitOptionLabel, GLUCOSE_DISPLAY_COPY } from '../../content/glucose-display-copy';
import { ACCOUNT_DELETE_COPY, PREFERENCE_COPY } from '../../content/workspace-panel-copy';
import { normalizeGlucoseUnit } from '../../lib/glucose-units';
import { normalizeContactPhones } from '../../lib/workspace-view-utils';
import { t1dBtnPrimary, t1dBtnSecondary, t1dSoftLabel } from '../../lib/t1d-ui';
import type { Language } from '../../types';
import { PushNotificationsPanel } from './PushNotificationsPanel';
import { WorkspaceSectionHeader } from './WorkspaceSectionHeader';

interface WorkspaceSettingsSectionProps {
  lang: Language;
  theme: 'light' | 'dark';
  isRTL: boolean;
  primaryPanelClass: string;
  workspaceSectionShell: string;
  softLabelClass: string;
  sectionTitle: string;
  sectionSubtitle: string;
  preferenceExplainer: string;
  preferences: SafetyPreferencesInput;
  setPreferences: React.Dispatch<React.SetStateAction<SafetyPreferencesInput | null>>;
  savingPreferences: boolean;
  onSave: () => void;
  deletePassword: string;
  setDeletePassword: (value: string) => void;
  deleteAccountError: string;
  deletingAccount: boolean;
  onDeleteAccount: () => void;
}

export const WorkspaceSettingsSection: React.FC<WorkspaceSettingsSectionProps> = ({
  lang,
  theme,
  isRTL,
  primaryPanelClass,
  workspaceSectionShell,
  softLabelClass,
  sectionTitle,
  sectionSubtitle,
  preferenceExplainer,
  preferences,
  setPreferences,
  savingPreferences,
  onSave,
  deletePassword,
  setDeletePassword,
  deleteAccountError,
  deletingAccount,
  onDeleteAccount,
}) => {
  const preferenceCopy = PREFERENCE_COPY[lang];
  const accountDeleteCopy = ACCOUNT_DELETE_COPY[lang];
  const glucoseCopy = GLUCOSE_DISPLAY_COPY[lang];
  const selectClass = `w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`;

  return (
    <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
      <WorkspaceSectionHeader title={sectionTitle} subtitle={sectionSubtitle} theme={theme} isRTL={isRTL} />
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{preferenceExplainer}</p>
      <div className="mt-5 grid max-w-lg gap-4">
        <label className="space-y-2">
          <span className={softLabelClass}>{glucoseCopy.unitField}</span>
          <select
            value={preferences.glucoseUnit}
            onChange={(event) =>
              setPreferences((current) =>
                current ? { ...current, glucoseUnit: normalizeGlucoseUnit(event.target.value) } : current,
              )
            }
            className={selectClass}
          >
            <option value="mmol/L">{glucoseUnitOptionLabel(lang, 'mmol/L')}</option>
            <option value="mg/dL">{glucoseUnitOptionLabel(lang, 'mg/dL')}</option>
          </select>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{glucoseCopy.unitHint}</p>
        </label>
        <label className="space-y-2">
          <span className={softLabelClass}>{preferenceCopy.fields.day}</span>
          <select
            value={preferences.daySensitivity}
            onChange={(event) =>
              setPreferences((current) =>
                current ? { ...current, daySensitivity: event.target.value as SafetyPreferencesInput['daySensitivity'] } : current,
              )
            }
            className={selectClass}
          >
            <option value="gentle">{preferenceCopy.options.gentle}</option>
            <option value="balanced">{preferenceCopy.options.balanced}</option>
            <option value="watchful">{preferenceCopy.options.watchful}</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className={softLabelClass}>{preferenceCopy.fields.night}</span>
          <select
            value={preferences.nightSensitivity}
            onChange={(event) =>
              setPreferences((current) =>
                current ? { ...current, nightSensitivity: event.target.value as SafetyPreferencesInput['nightSensitivity'] } : current,
              )
            }
            className={selectClass}
          >
            <option value="balanced">{preferenceCopy.options.balanced}</option>
            <option value="protective">{preferenceCopy.options.protective}</option>
            <option value="urgent">{preferenceCopy.options.urgent}</option>
          </select>
        </label>
      </div>
      <div className="mt-6 max-w-3xl">
        <PushNotificationsPanel
          lang={lang}
          theme={theme}
          contactPhones={normalizeContactPhones(preferences.contactPhones)}
          onContactPhonesChange={(contactPhones) =>
            setPreferences((current) => (current ? { ...current, contactPhones } : current))
          }
        />
      </div>
      <div className="mt-5 grid max-w-lg gap-4">
        <button type="button" onClick={onSave} disabled={savingPreferences} className={`mt-2 rounded-2xl px-4 py-3 text-sm font-semibold ${t1dBtnPrimary(theme)} disabled:opacity-50`}>
          {savingPreferences ? preferenceCopy.saving : preferenceCopy.save}
        </button>
      </div>
      <div className={`mt-8 max-w-lg rounded-[1.75rem] border px-4 py-4 ${theme === 'dark' ? 'border-rose-500/20 bg-rose-500/5' : 'border-rose-200 bg-rose-50/70'}`}>
        <p className="text-sm font-bold text-rose-900 dark:text-rose-200">{accountDeleteCopy.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-rose-950/80 dark:text-rose-100/80">{accountDeleteCopy.body}</p>
        <input
          type="password"
          value={deletePassword}
          onChange={(event) => setDeletePassword(event.target.value)}
          placeholder={accountDeleteCopy.passwordPlaceholder}
          className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-rose-500/20 bg-slate-950/70 text-slate-100' : 'border-rose-200 bg-white text-slate-900'}`}
        />
        {deleteAccountError ? <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{deleteAccountError}</p> : null}
        <button
          type="button"
          onClick={onDeleteAccount}
          disabled={deletingAccount}
          className={`mt-3 rounded-2xl px-4 py-3 text-sm font-semibold ${t1dBtnSecondary(theme)} disabled:opacity-50`}
        >
          {deletingAccount ? accountDeleteCopy.deleting : accountDeleteCopy.button}
        </button>
      </div>
    </section>
  );
};
