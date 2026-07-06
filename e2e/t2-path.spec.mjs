import { expect, test } from '@playwright/test';

const uniqueEmail = () => `t2-${Date.now()}@example.com`;

test('type2 signup path reaches workspace with T2 context', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('t1d_workspace_onboarded_v1', '1');
  });

  await page.goto('/create-account?type=type2');
  await expect(page.getByRole('button', { name: /create account|создать аккаунт/i })).toBeVisible({ timeout: 30000 });

  await page.getByPlaceholder('Taylor Morgan').fill('T2 Adult');
  await page.locator('select').selectOption('adult');
  await page.locator('input[type="email"]').fill(uniqueEmail());
  await page.locator('input[type="password"]').fill('TestPass123!');
  await page.getByPlaceholder(/Support Circle|Круг/i).fill('Adult Support');
  await page.getByPlaceholder(/^Mila$|Мила|Alex|Алекс/i).first().fill('Alex');
  await page.getByPlaceholder(/8-12|13-17|18\+|возраст/i).first().fill('18+');
  await page.getByPlaceholder(/Anna Rivera|Анна|Sam|Сэм/i).first().fill('Sam');
  await page.getByPlaceholder(/Jordan Lee|Джордан/i).fill('Jordan');
  await page.getByPlaceholder(/10:00 PM|22:00/).fill('10:00 PM - 7:00 AM');
  await page.getByRole('button', { name: /create account|создать аккаунт/i }).click();

  await expect(page).toHaveURL(/\/workspace(\?type=type2)?$/, { timeout: 15000 });
  await expect(page.locator('.t1d-member-type-badge--type2, [class*="type2"]').first()).toBeVisible({ timeout: 10000 });
});
