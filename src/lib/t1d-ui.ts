export type T1DTheme = 'light' | 'dark';

export const t1dShell = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-page-shell t1d-page-shell--dark text-slate-100' : 't1d-page-shell text-stone-900';

export const t1dContainer = () => 't1d-container';

export const t1dMemberLayout = () => 't1d-member-layout';

export const t1dEyebrow = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-eyebrow t1d-eyebrow--dark' : 't1d-eyebrow';

export const t1dSoftLabel = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-soft-label t1d-soft-label--dark' : 't1d-soft-label t1d-soft-label--light';

export const t1dDisplayTitle = () => 't1d-display text-3xl font-extrabold tracking-tight md:text-4xl';

export const t1dIconWell = (theme: T1DTheme) =>
  theme === 'dark'
    ? 'inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/12 text-amber-200'
    : 'inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-800';

export const t1dCard = (theme: T1DTheme, accent: 'sky' | 'mint' | 'amber' | 'rose' | 'neutral' = 'neutral') => {
  const base = theme === 'dark' ? 't1d-home-card t1d-home-card--dark' : 't1d-home-card t1d-home-card--light';
  const accentClass =
    accent === 'sky' || accent === 'amber' ? (theme === 'dark' ? 't1d-home-card--accent-dark' : 't1d-home-card--accent-light') :
    accent === 'mint' ? (theme === 'dark' ? 't1d-home-card--mint-dark' : 't1d-home-card--mint-light') :
    accent === 'rose' ? '' :
    '';
  return `${base} ${accentClass}`.trim();
};

export const t1dSubcard = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-subcard t1d-subcard--dark' : 't1d-subcard';

export const t1dInput = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-input t1d-input--dark' : 't1d-input';

export const t1dBtnPrimary = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-btn-warm-primary t1d-btn-warm-primary--dark' : 't1d-btn-warm-primary t1d-btn-warm-primary--light';

export const t1dBtnSecondary = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-btn-warm-secondary t1d-btn-warm-secondary--dark' : 't1d-btn-warm-secondary t1d-btn-warm-secondary--light';

export const t1dBtnGhost = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-btn t1d-btn-ghost t1d-btn-ghost--dark' : 't1d-btn t1d-btn-ghost';

export const t1dBtnNav = (theme: T1DTheme) =>
  theme === 'dark' ? 't1d-btn-nav t1d-btn-nav--dark' : 't1d-btn-nav t1d-btn-nav--light';

export const t1dPanelPrimary = (theme: T1DTheme) =>
  `${t1dCard(theme, 'amber')} rounded-[1.8rem] p-5 md:rounded-[2rem] md:p-7`;

export const t1dPanelSubtle = (theme: T1DTheme) =>
  `${t1dSubcard(theme)} rounded-[1.35rem]`;

export const t1dPanelSurface = (theme: T1DTheme) =>
  `${t1dCard(theme, 'neutral')} rounded-[1.35rem]`;

export const t1dPanelCompact = (theme: T1DTheme) =>
  `${t1dSubcard(theme)} rounded-[1.2rem] p-3 md:rounded-[1.35rem] md:p-4`;

export const t1dPanelCompactSurface = (theme: T1DTheme) =>
  `${t1dCard(theme, 'neutral')} rounded-[1.2rem] p-3 md:rounded-[1.35rem] md:p-4`;

export const t1dBtnPill = (theme: T1DTheme, active: boolean) =>
  active ? t1dBtnPrimary(theme) : t1dBtnGhost(theme);

export const t1dFilterPill = (theme: T1DTheme, active: boolean) =>
  active
    ? theme === 'dark'
      ? 'rounded-full px-4 py-2 text-sm font-semibold bg-amber-300 text-stone-950'
      : 'rounded-full px-4 py-2 text-sm font-semibold bg-orange-600 text-white'
    : theme === 'dark'
      ? 'rounded-full px-4 py-2 text-sm font-semibold border border-white/10 bg-white/[0.06] text-slate-200'
      : 'rounded-full px-4 py-2 text-sm font-semibold border border-orange-200 bg-white/90 text-stone-700';

export const t1dMuted = (theme: T1DTheme) =>
  theme === 'dark' ? 'text-slate-300' : 'text-stone-700';

export const t1dSoft = (theme: T1DTheme) =>
  theme === 'dark' ? 'text-slate-400' : 'text-stone-600';

export const t1dWarmNote = (theme: T1DTheme) =>
  theme === 'dark'
    ? 'rounded-[1.6rem] border border-amber-400/20 bg-amber-400/10 px-5 py-5 md:px-6 md:py-6'
    : 'rounded-[1.6rem] border border-orange-200 bg-orange-50/80 px-5 py-5 md:px-6 md:py-6';
