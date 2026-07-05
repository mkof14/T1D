import { describe, expect, it } from 'vitest';
import { hashPassword, isValidPassword, verifyPassword } from '../../server/lib/password.mjs';

describe('password helpers', () => {
  it('hashes and verifies a password', () => {
    const stored = hashPassword('secret-pass');
    expect(stored.includes(':')).toBe(true);
    expect(verifyPassword('secret-pass', stored)).toBe(true);
    expect(verifyPassword('wrong-pass', stored)).toBe(false);
  });

  it('validates minimum password length', () => {
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
  });
});
