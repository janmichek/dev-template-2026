import { expect, test } from '@playwright/test';

test('opens and closes transaction details through the URL', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Transactions' }).click();
  await page.getByRole('button', { name: 'Show detail 1', exact: true }).click();

  await expect(page.getByText('ID', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/transactions\/1$/);

  await page.getByRole('button', { name: 'Hide 1', exact: true }).click();
  await expect(page.getByText('ID', { exact: true })).toBeHidden();
  await expect(page).toHaveURL(/\/transactions$/);
});
