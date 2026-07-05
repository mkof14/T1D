import React from 'react';
import type { DiabetesType, Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import type { NotificationSummaryPayload } from '../../lib/api';
import { WORKSPACE_VISUAL_COPY } from '../../content/workspace-visual-copy';

type AlertFlowDiagramProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL?: boolean;
  diabetesType: DiabetesType;
  notificationSummary: NotificationSummaryPayload;
  roleLabels: Record<'parent' | 'adult' | 'caregiver', string>;
  deliveryStatusLabel: string;
  sensitivityLabels: Record<string, string>;
};

export const AlertFlowDiagram: React.FC<AlertFlowDiagramProps> = ({
  lang,
  theme,
  isRTL = false,
  diabetesType,
  notificationSummary,
  roleLabels,
  deliveryStatusLabel,
  sensitivityLabels,
}) => {
  const copy = WORKSPACE_VISUAL_COPY[lang];
  const shellClass = `t1d-alert-flow t1d-alert-flow--${diabetesType} ${theme === 'dark' ? 't1d-alert-flow--dark' : 't1d-alert-flow--light'} ${isRTL ? 't1d-alert-flow--rtl' : ''}`;

  const dayPrimary = roleLabels[notificationSummary.dayPrimaryContact];
  const nightPrimary = roleLabels[notificationSummary.nightPrimaryContact];
  const backupLabel = notificationSummary.caregiverEnabled
    ? roleLabels.caregiver
    : roleLabels[notificationSummary.activeRecipient];

  const steps = [
    {
      label: copy.primaryContact,
      value: `${copy.dayPath}: ${dayPrimary}`,
      sub: sensitivityLabels[notificationSummary.daySensitivity],
    },
    {
      label: copy.delay,
      value: `${notificationSummary.caregiverDelaySeconds}s`,
      sub: notificationSummary.caregiverEnabled ? copy.backupContact : copy.deliveryStatus,
    },
    {
      label: copy.nightPath,
      value: nightPrimary,
      sub: sensitivityLabels[notificationSummary.nightSensitivity],
    },
    {
      label: copy.pushChannel,
      value: backupLabel,
      sub: deliveryStatusLabel,
    },
  ];

  return (
    <div className={shellClass}>
      <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {steps.map((step) => (
          <div key={step.label} className="t1d-alert-flow__step">
            <p className="text-sm font-semibold">{step.label}</p>
            <p className="mt-1 text-base font-black tracking-tight">{step.value}</p>
            <p className="mt-1 text-sm opacity-80">{step.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
