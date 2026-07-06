import { expect, test } from '@playwright/test';

const uniqueEmail = () => `reset-${Date.now()}@example.com`;

test('password reset request and confirm', async ({ page, request }) => {
  const email = uniqueEmail();
  const password = 'TestPass123!';
  const newPassword = 'NewPass123!';

  await page.goto('/create-account?type=type1');
  await page.getByPlaceholder('Taylor Morgan').fill('Reset Parent');
  await page.locator('select').selectOption('parent');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByPlaceholder(/Mila Support Circle|Ночной Круг/i).fill('Reset Circle');
  await page.getByPlaceholder(/^Mila$|Мила/).fill('Mila');
  await page.getByPlaceholder(/8-12/).fill('8-12');
  await page.getByPlaceholder(/Anna Rivera|Анна/i).fill('Anna');
  await page.getByPlaceholder(/Jordan Lee|Джордан/i).fill('Jordan');
  await page.getByPlaceholder(/10:00 PM|22:00/).fill('10:00 PM - 7:00 AM');
  await page.getByRole('button', { name: /create account & family|создать аккаунт и семью/i }).click();
  await expect(page).toHaveURL(/\/workspace/, { timeout: 15000 });

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

  await page.goto('/access');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(newPassword);
  await page.getByRole('button', { name: /sign in|войти/i }).click();
  await expect(page).toHaveURL(/\/workspace/, { timeout: 15000 });
});
