import { describe, expect, it } from 'vitest';
import {
  googleAuthConfig,
  googleJavascriptOrigins,
  isGoogleAuthEnabled,
  resolveGoogleRedirectUri,
} from '../../server/google-auth.mjs';

describe('google identity services auth', () => {
  it('lists javascript origins for Google Console', () => {
    expect(googleJavascriptOrigins()).toContain('http://localhost:3002');
    expect(googleJavascriptOrigins()).toContain('https://t1-d.vercel.app');
  });

  it('reports disabled when client id is missing', () => {
    const previous = process.env.T1D_GOOGLE_CLIENT_ID;
    process.env.T1D_GOOGLE_CLIENT_ID = '';
    expect(isGoogleAuthEnabled()).toBe(false);
    process.env.T1D_GOOGLE_CLIENT_ID = previous;
  });

  it('reads client id from env', () => {
    expect(googleAuthConfig().clientId.length).toBeGreaterThan(0);
  });

  it('resolves redirect callback for local and prod origins', () => {
    expect(resolveGoogleRedirectUri({}, 'http://localhost:3002')).toBe('http://localhost:3002/api/access/google/callback');
    expect(resolveGoogleRedirectUri({}, 'https://t1-d.vercel.app')).toBe('https://t1-d.vercel.app/api/access/google/callback');
  });
});
