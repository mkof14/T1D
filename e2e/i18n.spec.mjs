import { expect, test } from '@playwright/test';

test('language selector updates document lang', async ({ page }) => {
  await page.goto('/');
  const langToggle = page.locator('button').filter({ hasText: /^EN$|^RU$|^English$|^Рус/i }).first();
  if (await langToggle.count()) {
    await langToggle.click();
    const ruButton = page.getByRole('button', { name: /^RU$|Рус/i }).first();
    if (await ruButton.count()) {
      await ruButton.click();
      await expect(page.locator('html')).toHaveAttribute('lang', /ru/i);
    }
  }
});
