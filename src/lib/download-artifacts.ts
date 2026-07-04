export const DOWNLOAD_ARTIFACTS = {
  desktopWindows: '/downloads/steady-desktop.url',
  desktopMac: '/downloads/steady-desktop.webloc',
  mobileHtml: '/downloads/steady-mobile.html',
  pwaManifest: '/downloads/steady-app.webmanifest',
} as const;

export const resolveDesktopDownloadHref = () => {
  if (typeof navigator === 'undefined') return DOWNLOAD_ARTIFACTS.desktopWindows;
  const ua = navigator.userAgent;
  if (/Mac|Macintosh/.test(ua) && !/iPhone|iPad|iPod/.test(ua)) return DOWNLOAD_ARTIFACTS.desktopMac;
  return DOWNLOAD_ARTIFACTS.desktopWindows;
};

export const resolveDesktopDownloadName = (href: string) =>
  href.endsWith('.webloc') ? 'Steady Desktop.webloc' : 'Steady Desktop.url';

export const triggerFileDownload = (href: string, filename: string) => {
  if (typeof document === 'undefined') return;
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};
