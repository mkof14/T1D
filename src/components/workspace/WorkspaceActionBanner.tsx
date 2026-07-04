import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { T1DTheme } from '../../lib/t1d-ui';

export type WorkspaceActionBannerProps = {
  title: string;
  body: string;
  nextHint: string;
  theme: T1DTheme;
  isRTL?: boolean;
  onDismiss: () => void;
  onOpenTimeline?: () => void;
  openTimelineLabel?: string;
};

export const WorkspaceActionBanner: React.FC<WorkspaceActionBannerProps> = ({
  title,
  body,
  nextHint,
  theme,
  isRTL = false,
  onDismiss,
  onOpenTimeline,
  openTimelineLabel,
}) => (
  <div
    className={`t1d-workspace-action-banner ${theme === 'dark' ? 't1d-workspace-action-banner--dark' : 't1d-workspace-action-banner--light'} ${isRTL ? 'text-right' : 'text-left'}`}
    role="status"
    aria-live="polite"
  >
    <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <span className="t1d-workspace-action-banner__icon" aria-hidden="true">
        <CheckCircle2 size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-extrabold tracking-tight">{title}</p>
        <p className="mt-1 text-sm leading-relaxed opacity-90">{body}</p>
        <p className="mt-2 text-xs font-semibold opacity-75">{nextHint}</p>
        {onOpenTimeline && openTimelineLabel ? (
          <button type="button" onClick={onOpenTimeline} className="t1d-workspace-action-banner__link mt-3">
            {openTimelineLabel}
          </button>
        ) : null}
      </div>
      <button type="button" onClick={onDismiss} className="t1d-workspace-action-banner__close" aria-label="Dismiss">
        <X size={18} />
      </button>
    </div>
  </div>
);
