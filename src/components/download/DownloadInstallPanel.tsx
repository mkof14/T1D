import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Monitor, Smartphone } from 'lucide-react';
import type { DownloadPlatformCopy } from '../../content/download-copy';
import {
  DOWNLOAD_ARTIFACTS,
  resolveDesktopDownloadHref,
  resolveDesktopDownloadName,
  triggerFileDownload,
} from '../../lib/download-artifacts';
import { canInstallPwa, isStandalonePwa, promptPwaInstall, subscribePwaInstall } from '../../lib/pwa-install';
import { t1dBtnPrimary, t1dBtnSecondary, type T1DTheme } from '../../lib/t1d-ui';

interface DownloadInstallPanelProps {
  theme: T1DTheme;
  isRTL: boolean;
  copy: DownloadPlatformCopy;
  platform: 'desktop' | 'mobile';
  otherPlatformHref: string;
  otherPlatformLabel: string;
  onOtherPlatform: () => void;
}

export const DownloadInstallPanel: React.FC<DownloadInstallPanelProps> = ({
  theme,
  isRTL,
  copy,
  platform,
  otherPlatformHref,
  otherPlatformLabel,
  onOtherPlatform,
}) => {
  const [installable, setInstallable] = useState(canInstallPwa());
  const [installed, setInstalled] = useState(isStandalonePwa());
  const cardClass = theme === 'dark' ? 't1d-download-card t1d-download-card--dark' : 't1d-download-card';
  const PlatformIcon = platform === 'desktop' ? Monitor : Smartphone;
  const fileHref = platform === 'desktop' ? resolveDesktopDownloadHref() : DOWNLOAD_ARTIFACTS.mobileHtml;
  const fileName = platform === 'desktop' ? resolveDesktopDownloadName(fileHref) : 'Steady Mobile.html';

  useEffect(() => {
    setInstallable(canInstallPwa());
    setInstalled(isStandalonePwa());
    return subscribePwaInstall(() => {
      setInstallable(canInstallPwa());
      setInstalled(isStandalonePwa());
    });
  }, []);

  const handleInstall = async () => {
    const accepted = await promptPwaInstall();
    if (accepted) setInstalled(true);
  };

  const handleFileDownload = () => {
    triggerFileDownload(fileHref, fileName);
  };

  return (
    <section className="space-y-6">
      <div className={`${cardClass} t1d-download-card--hero`}>
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
          <span className="t1d-download-icon">
            <PlatformIcon size={24} />
          </span>
          <div className="space-y-3">
            <h1 className="t1d-download-title">{copy.title}</h1>
            <p className={`text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {copy.subtitle}
            </p>
          </div>
        </div>

        <div className={`mt-6 flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button type="button" onClick={handleFileDownload} className={t1dBtnPrimary(theme)}>
            <Download size={16} className={`inline-block align-[-2px] ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {copy.downloadFileCta}
          </button>
          {!installed && installable ? (
            <button type="button" onClick={handleInstall} className={t1dBtnSecondary(theme)}>
              {copy.installCta}
            </button>
          ) : null}
          {installed ? (
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold t1d-download-installed ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CheckCircle2 size={16} />
              {copy.installedTitle}
            </div>
          ) : null}
          <a
            href={otherPlatformHref}
            onClick={(event) => {
              event.preventDefault();
              onOtherPlatform();
            }}
            className={t1dBtnSecondary(theme)}
          >
            {otherPlatformLabel}
          </a>
        </div>

        <p className={`mt-4 text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          {installed ? copy.installedBody : copy.downloadFileHint}
        </p>
      </div>

      <div className={cardClass}>
        <p className="t1d-download-section-title">{copy.stepsTitle}</p>
        <ol className={`mt-4 space-y-3 ${isRTL ? 'pr-5' : 'pl-5'} list-decimal`}>
          {copy.steps.map((step) => (
            <li key={step} className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              {step}
            </li>
          ))}
        </ol>
        <p className={`mt-5 text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{copy.note}</p>
      </div>
    </section>
  );
};
