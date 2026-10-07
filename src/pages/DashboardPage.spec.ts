import { expect, test } from '@playwright/test';

test('dashboard shows the portfolio chart', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.locator('.highcharts-container')).toBeVisible();
});
