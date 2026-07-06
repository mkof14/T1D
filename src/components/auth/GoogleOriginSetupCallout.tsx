import React, { useMemo } from 'react';
import { getGoogleAuthStatus, type GoogleAuthStatus } from '../../lib/api';

const CONSOLE_URL = 'https://console.cloud.google.com/apis/credentials';

interface GoogleOriginSetupCalloutProps {
  lang: 'en' | 'ru';
  theme: 'light' | 'dark';
  info: GoogleAuthStatus | null;
}

const copy = {
  en: {
    title: 'Google Console setup',
    origin: 'Add this JavaScript origin (exact match):',
    notRedirect: 'Use Authorized JavaScript origins — not redirect URIs.',
    client: 'OAuth client ID',
    openConsole: 'Open Google Cloud Console',
    copyOrigin: 'Copy origin',
    copied: 'Copied',
    testUser: 'If app is Testing, add your Gmail under OAuth consent screen → Test users.',
  },
  ru: {
    title: 'Настройка Google Console',
    origin: 'Добавьте этот JavaScript origin (точное совпадение):',
    notRedirect: 'Поле Authorized JavaScript origins — не redirect URIs.',
    client: 'OAuth client ID',
    openConsole: 'Открыть Google Cloud Console',
    copyOrigin: 'Скопировать origin',
    copied: 'Скопировано',
    testUser: 'Если app в Testing — добавьте Gmail в OAuth consent screen → Test users.',
  },
} as const;

export const GoogleOriginSetupCallout: React.FC<GoogleOriginSetupCalloutProps> = ({ lang, theme, info }) => {
  const [copied, setCopied] = React.useState(false);
  const text = copy[lang] ?? copy.en;
  const browserOrigin = useMemo(
    () => (typeof window !== 'undefined' ? window.location.origin : ''),
    [],
  );

  if (!info?.enabled || !browserOrigin) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(browserOrigin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const panelClass = theme === 'dark'
    ? 'border-amber-900/60 bg-amber-950/30 text-amber-100'
    : 'border-amber-200 bg-amber-50 text-amber-950';

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${panelClass}`}>
      <p className="font-semibold">{text.title}</p>
      <p className="mt-2 opacity-90">{text.origin}</p>
      <code className="mt-2 block overflow-x-auto rounded-xl bg-black/10 px-3 py-2 text-xs font-bold dark:bg-black/30">
        {browserOrigin}
      </code>
      <p className="mt-2 text-xs opacity-80">{text.notRedirect}</p>
      {info.clientId ? (
        <p className="mt-2 text-xs opacity-80">
          {text.client}: <code className="font-semibold">{info.clientId}</code>
        </p>
      ) : null}
      <p className="mt-2 text-xs opacity-80">{text.testUser}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={handleCopy} className="rounded-xl border border-current px-3 py-1.5 text-xs font-semibold">
          {copied ? text.copied : text.copyOrigin}
        </button>
        <a href={CONSOLE_URL} target="_blank" rel="noreferrer" className="rounded-xl border border-current px-3 py-1.5 text-xs font-semibold">
          {text.openConsole}
        </a>
      </div>
    </div>
  );
};
