import React from 'react';
import type { Language } from '../../types';
import { disableBrowserPushNotifications, enableBrowserPushNotifications, getPushStatus } from '../../lib/push-notifications';
import { t1dBtnPrimary, t1dBtnSecondary, t1dCardHeading, t1dHelpText, t1dInput, t1dPanelCompactSurface, type T1DTheme } from '../../lib/t1d-ui';

const BASE_COPY = {
  title: 'Alert delivery',
  explainer: 'Enable push on this device and add SMS numbers for each role. Numbers must use E.164 format, for example +14155550123.',
  push: 'Browser push',
  sms: 'SMS backup numbers',
  parentPhone: 'Parent SMS',
  adultPhone: 'Adult SMS',
  caregiverPhone: 'Caregiver SMS',
  phoneHint: '+14155550123',
  enablePush: 'Enable push on this device',
  disablePush: 'Disable push on this device',
  enabling: 'Enabling…',
  pushEnabled: 'Push is enabled on this device.',
  pushDisabled: 'Push is off on this device.',
  pushUnavailable: 'Push is not supported in this browser.',
  pushConfiguredOff: 'Push is not configured on the server yet.',
};

const COPY: Partial<Record<Language, typeof BASE_COPY>> = {
  ru: {
    ...BASE_COPY,
    title: 'Доставка оповещений',
    explainer: 'Включите push на этом устройстве и добавьте SMS-номера для каждой роли. Формат E.164, например +14155550123.',
    push: 'Push в браузере',
    sms: 'SMS-номера',
    parentPhone: 'SMS родителя',
    adultPhone: 'SMS взрослого',
    caregiverPhone: 'SMS опекуна',
    enablePush: 'Включить push на этом устройстве',
    disablePush: 'Выключить push на этом устройстве',
    enabling: 'Включаем…',
    pushEnabled: 'Push включён на этом устройстве.',
    pushDisabled: 'Push выключен на этом устройстве.',
    pushUnavailable: 'Push не поддерживается в этом браузере.',
    pushConfiguredOff: 'Push ещё не настроен на сервере.',
  },
  uk: {
    ...BASE_COPY,
    title: 'Доставка сповіщень',
    push: 'Push у браузері',
    enablePush: 'Увімкнути push на цьому пристрої',
    disablePush: 'Вимкнути push на цьому пристрої',
  },
};

export interface ContactPhonesInput {
  parent: string;
  adult: string;
  caregiver: string;
}

interface PushNotificationsPanelProps {
  lang: Language;
  theme: T1DTheme;
  contactPhones: ContactPhonesInput;
  onContactPhonesChange: (phones: ContactPhonesInput) => void;
}

export const PushNotificationsPanel: React.FC<PushNotificationsPanelProps> = ({
  lang,
  theme,
  contactPhones,
  onContactPhonesChange,
}) => {
  const copy = COPY[lang] || BASE_COPY;
  const [pushSupported] = React.useState(() =>
    typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window,
  );
  const [pushConfigured, setPushConfigured] = React.useState<boolean | null>(null);
  const [pushSubscribed, setPushSubscribed] = React.useState(false);
  const [pushBusy, setPushBusy] = React.useState(false);
  const [pushError, setPushError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!pushSupported) return;
    getPushStatus()
      .then((status) => {
        setPushConfigured(status.enabled);
        setPushSubscribed(status.subscribed);
      })
      .catch(() => setPushConfigured(false));
  }, [pushSupported]);

  const handleEnablePush = async () => {
    setPushBusy(true);
    setPushError(null);
    try {
      await enableBrowserPushNotifications();
      setPushSubscribed(true);
    } catch (error) {
      setPushError(error instanceof Error ? error.message : 'push_failed');
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    setPushBusy(true);
    setPushError(null);
    try {
      await disableBrowserPushNotifications();
      setPushSubscribed(false);
    } catch (error) {
      setPushError(error instanceof Error ? error.message : 'push_failed');
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <div className={`${t1dPanelCompactSurface(theme)} space-y-5 p-4 md:p-5`}>
      <div>
        <h3 className={t1dCardHeading()}>{copy.title}</h3>
        <p className={`mt-2 ${t1dHelpText(theme)}`}>{copy.explainer}</p>
      </div>

      <div className="space-y-3">
        <p className={t1dHelpText(theme)}>{copy.push}</p>
        {!pushSupported ? (
          <p className={t1dHelpText(theme)}>{copy.pushUnavailable}</p>
        ) : pushConfigured === false ? (
          <p className={t1dHelpText(theme)}>{copy.pushConfiguredOff}</p>
        ) : (
          <>
            <p className={t1dHelpText(theme)}>{pushSubscribed ? copy.pushEnabled : copy.pushDisabled}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={t1dBtnPrimary(theme)} disabled={pushBusy || pushSubscribed} onClick={() => void handleEnablePush()}>
                {pushBusy ? copy.enabling : copy.enablePush}
              </button>
              <button type="button" className={t1dBtnSecondary(theme)} disabled={pushBusy || !pushSubscribed} onClick={() => void handleDisablePush()}>
                {copy.disablePush}
              </button>
            </div>
          </>
        )}
        {pushError ? <p className="text-sm text-rose-600 dark:text-rose-300">{pushError}</p> : null}
      </div>

      <div className="space-y-3">
        <p className={t1dHelpText(theme)}>{copy.sms}</p>
        <div className="grid gap-3 md:grid-cols-3">
          {(['parent', 'adult', 'caregiver'] as const).map((role) => (
            <label key={role} className="block space-y-2">
              <span className={t1dHelpText(theme)}>
                {role === 'parent' ? copy.parentPhone : role === 'adult' ? copy.adultPhone : copy.caregiverPhone}
              </span>
              <input
                type="tel"
                autoComplete="tel"
                className={`${t1dInput(theme)} w-full`}
                placeholder={copy.phoneHint}
                value={contactPhones[role]}
                onChange={(event) => onContactPhonesChange({ ...contactPhones, [role]: event.target.value })}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
