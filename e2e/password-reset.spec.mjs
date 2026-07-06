import { expect, test } from '@playwright/test';
import { completeSignupFlow, signIn, uniqueEmail } from './helpers/auth-flow.mjs';

test('password reset request and confirm', async ({ page, request }) => {
  const email = uniqueEmail('reset');
  const password = 'TestPass123!';
  const newPassword = 'NewPass123!';

  await completeSignupFlow(page, { email, password });

  const resetResponse = await request.post('http://127.0.0.1:8791/api/access/password-reset/request', {
    data: { email },
    headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:3003' },
  });
  const resetBody = await resetResponse.json();
  expect(resetBody.ok).toBe(true);
  expect(resetBody.resetToken).toBeTruthy();

  const confirmResponse = await request.post('http://127.0.0.1:8791/api/access/password-reset/confirm', {
    data: { token: resetBody.resetToken, password: newPassword },
    headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:3003' },
  });
  expect(confirmResponse.ok()).toBeTruthy();

  await signIn(page, { email, password: newPassword });
});
