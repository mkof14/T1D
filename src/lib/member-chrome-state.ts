const MENU_KEY = 't1d_member_menu_open_v1';
const FOOTER_KEY = 't1d_member_footer_open_v1';

export const readMemberMenuOpen = () => {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(MENU_KEY);
  return stored === null ? true : stored === '1';
};

export const readMemberFooterOpen = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(FOOTER_KEY) === '1';
};

export const persistMemberMenuOpen = (open: boolean) => {
  window.localStorage.setItem(MENU_KEY, open ? '1' : '0');
};

export const persistMemberFooterOpen = (open: boolean) => {
  window.localStorage.setItem(FOOTER_KEY, open ? '1' : '0');
};
