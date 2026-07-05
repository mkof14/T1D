import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

let cachedKey = null;

const encryptionKey = () => {
  if (cachedKey) return cachedKey;
  const secret = String(process.env.T1D_SECRETS_KEY || process.env.T1D_CRON_SECRET || '').trim();
  if (!secret) return null;
  cachedKey = scryptSync(secret, 't1d-secrets-v1', 32);
  return cachedKey;
};

export const canEncryptSecrets = () => Boolean(encryptionKey());

export const encryptSecret = (plaintext) => {
  const key = encryptionKey();
  const value = String(plaintext || '');
  if (!key || !value) return '';
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${encrypted.toString('base64url')}.${tag.toString('base64url')}`;
};

export const decryptSecret = (payload) => {
  const key = encryptionKey();
  const value = String(payload || '');
  if (!key || !value) return '';
  const [ivPart, dataPart, tagPart] = value.split('.');
  if (!ivPart || !dataPart || !tagPart) return '';
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
};
