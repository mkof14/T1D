import { expect, test } from '@playwright/test';
import { completeSignupFlow, uniqueEmail } from './helpers/auth-flow.mjs';

test('type2 signup path reaches workspace with T2 context', async ({ page }) => {
  await completeSignupFlow(page, {
    email: uniqueEmail('t2'),
    type: 'type2',
  });

  await expect(page.locator('.t1d-member-type-badge--type2, [class*="type2"]').first()).toBeVisible({ timeout: 10000 });
});
