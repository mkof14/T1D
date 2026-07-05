import React from 'react';
import { X } from 'lucide-react';
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
        <p className="min-w-0 flex-1 text-sm leading-relaxed">
          <span className="font-semibold">{copy.title}</span>
          {' '}
          {copy.body}
        </p>
        <button
          type="button"
          className="shrink-0 rounded-full p-1 opacity-80 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          aria-label={copy.dismiss}
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, '1');
            setDismissed(true);
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
