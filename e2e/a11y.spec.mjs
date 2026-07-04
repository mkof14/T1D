import { test, expect } from '@playwright/test';

test('public home exposes skip link and main landmark', async ({ page }) => {
  await page.goto('/');
  const skipLink = page.getByRole('link', { name: /skip to main content|перейти к основному/i });
  await expect(skipLink).toBeAttached();
  await expect(page.locator('#main-content')).toBeAttached();
});

test('access form fields have associated labels', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /sign in|войти/i }).first().click();
  await expect(page).toHaveURL(/\/access$/);
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('label[for], input[aria-label], input[placeholder]').first()).toBeVisible();
});
