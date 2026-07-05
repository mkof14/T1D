import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const target = Buffer.from(hash, 'hex');
  return candidate.length === target.length && timingSafeEqual(candidate, target);
};

export const isValidPassword = (password, minLength = 8) => String(password || '').length >= minLength;
