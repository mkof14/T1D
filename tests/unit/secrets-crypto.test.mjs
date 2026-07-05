import { describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret } from '../../server/secrets-crypto.mjs';
import { sealDexcomTokens, unsealDexcomConnection } from '../../server/dexcom-service.mjs';

describe('secrets crypto', () => {
  it('encrypts and decrypts dexcom tokens for storage', () => {
    process.env.T1D_SECRETS_KEY = 'test-secrets-key-for-unit-tests-only';
    const sealed = sealDexcomTokens({
      provider: 'Dexcom',
      status: 'connected',
      accessToken: 'dexcom_access_secret_token_value',
      refreshToken: 'dexcom_refresh_secret_token_value',
      accessTokenPreview: 'dexc...alue',
      refreshTokenPreview: 'dexc...alue',
      hasRefreshToken: true,
    });

    expect(sealed.accessToken).toBeUndefined();
    expect(sealed.refreshToken).toBeUndefined();
    expect(sealed.accessTokenEnc).toBeTruthy();
    expect(sealed.refreshTokenEnc).toBeTruthy();

    const unsealed = unsealDexcomConnection(sealed);
    expect(unsealed.accessToken).toBe('dexcom_access_secret_token_value');
    expect(unsealed.refreshToken).toBe('dexcom_refresh_secret_token_value');
    expect(decryptSecret(sealed.accessTokenEnc)).toBe('dexcom_access_secret_token_value');
  });
});
