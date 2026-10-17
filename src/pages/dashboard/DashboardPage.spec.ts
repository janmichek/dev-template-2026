import { expect, test } from '@playwright/test';

test('dashboard shows the portfolio chart', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Total value in time' })).toBeVisible();
  await expect(page.getByText('1 ETH')).toBeVisible();
  await expect(page.getByText(/Portfolio total:/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show detail 32', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show detail 1', exact: true })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Tax Residence' })).toBeVisible();
});
