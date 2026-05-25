import { test, expect } from '@playwright/test';

test('creator flow placeholder', async ({ page }) => {
  // We mock a visit to login
  await page.goto('/login');
  await expect(page).toHaveTitle(/Solscribe/);
});
