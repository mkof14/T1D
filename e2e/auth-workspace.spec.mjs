import { expect, test } from '@playwright/test';
import { completeSignupFlow, uniqueEmail } from './helpers/auth-flow.mjs';

test('signup reaches workspace', async ({ page }) => {
  await completeSignupFlow(page, { email: uniqueEmail() });
  await expect(page.getByText(/monitoring|current safety|daily safety|dexcom/i).first()).toBeVisible();
});

test('dexcom mock connect exposes workspace controls', async ({ page }) => {
  await completeSignupFlow(page, { email: uniqueEmail() });
  await page.getByRole('button', { name: /connection|связь|conexión|verbindung|接続/i }).click();
  await expect(page.getByRole('button', { name: /Dexcom G7/i })).toBeVisible();
  await expect(
    page.getByRole('button', { name: /connect sensor|подключить датчик|refresh data|disconnect/i }).first(),
  ).toBeVisible();
});

test('meals section loads food analysis UI', async ({ page }) => {
  await completeSignupFlow(page, { email: uniqueEmail() });
  await page.getByRole('button', { name: /meals|еда|comidas|repas|mahlzeiten|饮食|食事/i }).click();
  await expect(page.getByRole('button', { name: /open camera|открыть камеру/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /analyze meal|анализировать/i })).toBeVisible();
  await page.getByPlaceholder(/pizza|пицц|salad/i).fill('salad bowl');
  await page.getByRole('button', { name: /analyze meal|анализировать/i }).click();
  await expect(page.getByText(/salad|салат|green/i).first()).toBeVisible({ timeout: 10000 });
});
