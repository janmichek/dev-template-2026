import { expect, test } from '@playwright/test';

test('dashboard shows the lot summary and the newest cars', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Sold: 4')).toBeVisible();
  await expect(page.getByText(/Stock value:/)).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Make' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show detail 12', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show detail 1', exact: true })).toHaveCount(0);
});
