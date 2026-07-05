import React from 'react';
import { ArrowRight, BellRing, Clock3, Users } from 'lucide-react';
import type { DiabetesType, Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dSoftLabel } from '../../lib/t1d-ui';
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
  const softLabelClass = t1dSoftLabel(theme);
  const shellClass = `t1d-alert-flow t1d-alert-flow--${diabetesType} ${theme === 'dark' ? 't1d-alert-flow--dark' : 't1d-alert-flow--light'} ${isRTL ? 't1d-alert-flow--rtl' : ''}`;

  const dayPrimary = roleLabels[notificationSummary.dayPrimaryContact];
  const nightPrimary = roleLabels[notificationSummary.nightPrimaryContact];
  const backupLabel = notificationSummary.caregiverEnabled
    ? roleLabels.caregiver
    : roleLabels[notificationSummary.activeRecipient];

  const steps = [
    {
      icon: Users,
      label: copy.primaryContact,
      value: `${copy.dayPath}: ${dayPrimary}`,
      sub: sensitivityLabels[notificationSummary.daySensitivity],
    },
    {
      icon: Clock3,
      label: copy.delay,
      value: `${notificationSummary.caregiverDelaySeconds}s`,
      sub: notificationSummary.caregiverEnabled ? copy.backupContact : copy.deliveryStatus,
    },
    {
      icon: Users,
      label: copy.nightPath,
      value: nightPrimary,
      sub: sensitivityLabels[notificationSummary.nightSensitivity],
    },
    {
      icon: BellRing,
      label: copy.pushChannel,
      value: backupLabel,
      sub: deliveryStatusLabel,
    },
  ];

  return (
    <div className={shellClass}>
      <p className={softLabelClass}>{copy.alertsFlow}</p>
      <div className={`mt-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch ${isRTL ? 'text-right' : 'text-left'}`}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div className="t1d-alert-flow__step">
                <span className="t1d-alert-flow__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <p className={softLabelClass}>{step.label}</p>
                <p className="mt-1 text-base font-black tracking-tight">{step.value}</p>
                <p className="mt-1 text-sm font-semibold opacity-85">{step.sub}</p>
              </div>
              {index < steps.length - 1 ? (
                <div className="hidden lg:flex items-center justify-center px-1">
                  <ArrowRight size={18} className={`opacity-50 ${isRTL ? 'rotate-180' : ''}`} aria-hidden="true" />
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
