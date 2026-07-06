import { expect, test } from '@playwright/test';

test('access page exposes google auth status endpoint', async ({ page, request }) => {
  await page.goto('/access');
  await expect(page.getByRole('button', { name: /sign in|войти/i }).first()).toBeVisible();

  const response = await request.get('http://127.0.0.1:8791/api/access/google/status');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.flow).toBe('google-identity-services');
  expect(typeof body.enabled).toBe('boolean');
});
