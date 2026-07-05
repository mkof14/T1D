import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Language } from '../../types';
import { WORKSPACE_BETA_COPY } from '../../content/workspace-beta-copy';
import type { T1DTheme } from '../../lib/t1d-ui';

const STORAGE_KEY = 'steady_beta_banner_dismissed';

type WorkspaceBetaBannerProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL: boolean;
};

export const WorkspaceBetaBanner: React.FC<WorkspaceBetaBannerProps> = ({ lang, theme, isRTL }) => {
  const copy = WORKSPACE_BETA_COPY[lang];
  const [dismissed, setDismissed] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  });

  if (dismissed) return null;

  return (
    <div
      className={`mb-4 rounded-2xl border px-4 py-3 sm:px-5 sm:py-4 ${
        theme === 'dark'
          ? 'border-amber-400/25 bg-amber-500/10 text-amber-50'
          : 'border-amber-300 bg-amber-50 text-amber-950'
      } ${isRTL ? 'text-right' : 'text-left'}`}
      role="status"
    >
      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
              {copy.badge}
            </span>
            <p className="text-sm font-semibold">{copy.title}</p>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-amber-100/85' : 'text-amber-900/85'}`}>{copy.body}</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full p-1 opacity-80 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          aria-label={copy.dismiss}
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, '1');
            setDismissed(true);
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
