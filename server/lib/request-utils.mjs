import { timingSafeEqual } from 'node:crypto';

export const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

export const safeText = (value, max = 160) => String(value || '').trim().slice(0, max);

export const safeRole = (value) => (['parent', 'adult', 'caregiver'].includes(value) ? value : 'parent');

export const parseCookies = (cookieHeader = '') =>
  Object.fromEntries(
    cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const index = entry.indexOf('=');
        if (index === -1) return [entry, ''];
        return [entry.slice(0, index), decodeURIComponent(entry.slice(index + 1))];
      })
  );

export const safeEqualString = (leftValue, rightValue) => {
  const left = Buffer.from(String(leftValue));
  const right = Buffer.from(String(rightValue));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
};

export const createCookieHelpers = ({ sessionCookie, sessionTtlMs }) => {
  const isSecureRequest = (req) =>
    process.env.T1D_COOKIE_SECURE === 'true' ||
    req.headers['x-forwarded-proto'] === 'https' ||
    String(req.headers.origin || '').startsWith('https://');

  const createSessionCookie = (token, req) =>
    `${sessionCookie}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(sessionTtlMs / 1000)}${isSecureRequest(req) ? '; Secure' : ''}`;

  const clearSessionCookie = () => `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

  return { createSessionCookie, clearSessionCookie };
};
