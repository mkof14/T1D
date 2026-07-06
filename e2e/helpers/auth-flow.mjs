import { expect } from '@playwright/test';

export const uniqueEmail = (prefix = 'e2e') => `${prefix}-${Date.now()}@example.com`;

export async function completeSignupFlow(page, {
  email,
  password = 'TestPass123!',
  type = 'type1',
} = {}) {
  await page.addInitScript(() => {
    window.localStorage.setItem('t1d_workspace_onboarded_v1', '1');
  });

  await page.goto(`/create-account?type=${type}`);
  await expect(page.getByRole('button', { name: /create account|создать аккаунт/i })).toBeVisible({ timeout: 30000 });

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /create account|создать аккаунт/i }).click();

  await expect(page).toHaveURL(new RegExp(`/workspace(\\?type=${type})?$`), { timeout: 15000 });

  const onboardingSkip = page.getByRole('button', { name: /skip|пропустить|got it|понятно/i });
  if (await onboardingSkip.isVisible().catch(() => false)) {
    await onboardingSkip.click();
  }
}

export async function signIn(page, { email, password }) {
  await page.goto('/access');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /sign in|войти/i }).click();
  await expect(page).toHaveURL(/\/workspace/, { timeout: 15000 });
}
