import { expect, test } from '@playwright/test';

const uniqueEmail = () => `e2e-${Date.now()}@example.com`;

async function completeSignupFlow(page, email, password) {
  await page.addInitScript(() => {
    window.localStorage.setItem('t1d_workspace_onboarded_v1', '1');
  });
  await page.goto('/create-account?type=type1');
  await expect(page.getByRole('button', { name: /create account & family|создать аккаунт и семью/i })).toBeVisible({ timeout: 30000 });

  await page.getByPlaceholder('Taylor Morgan').fill('E2E Parent');
  await page.locator('select').selectOption('parent');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  await page.getByPlaceholder(/Mila Support Circle|Ночной Круг/i).fill('E2E Support Circle');
  await page.getByPlaceholder(/^Mila$|Мила/).fill('Mila');
  await page.getByPlaceholder(/8-12/).fill('8-12');
  await page.getByPlaceholder(/Anna Rivera|Анна/i).fill('Anna');
  await page.getByPlaceholder(/Jordan Lee|Джордан/i).fill('Jordan');
  await page.getByPlaceholder(/10:00 PM|22:00/).fill('10:00 PM - 7:00 AM');

  await page.getByRole('button', { name: /create account & family|создать аккаунт и семью/i }).click();

  await expect(page).toHaveURL(/\/workspace(\?type=type1)?$/, { timeout: 15000 });
  const onboardingSkip = page.getByRole('button', { name: /skip|пропустить|got it|понятно/i });
  if (await onboardingSkip.isVisible().catch(() => false)) {
    await onboardingSkip.click();
  }
}

test('signup, household setup, and workspace load', async ({ page }) => {
  await completeSignupFlow(page, uniqueEmail(), 'TestPass123!');
  await expect(page.getByText(/monitoring|current safety|daily safety|dexcom/i).first()).toBeVisible();
});

test('dexcom mock connect exposes workspace controls', async ({ page }) => {
  await completeSignupFlow(page, uniqueEmail(), 'TestPass123!');
  await page.getByRole('button', { name: /connection|связь|conexión|verbindung|接続/i }).click();
  await expect(page.getByRole('button', { name: /Dexcom G7/i })).toBeVisible();
  await expect(
    page.getByRole('button', { name: /connect sensor|подключить датчик|refresh data|disconnect/i }).first(),
  ).toBeVisible();
});

test('meals section loads food analysis UI', async ({ page }) => {
  await completeSignupFlow(page, uniqueEmail(), 'TestPass123!');
  await page.getByRole('button', { name: /meals|еда|comidas|repas|mahlzeiten|饮食|食事/i }).click();
  await expect(page.getByRole('button', { name: /open camera|открыть камеру/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /analyze meal|анализировать/i })).toBeVisible();
  await page.getByPlaceholder(/pizza|пицц|salad/i).fill('salad bowl');
  await page.getByRole('button', { name: /analyze meal|анализировать/i }).click();
  await expect(page.getByText(/salad|салат|green/i).first()).toBeVisible({ timeout: 10000 });
});
