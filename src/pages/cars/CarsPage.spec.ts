import { expect, test } from '@playwright/test';

test('opens and closes car details through the URL', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Cars' }).click();
  await page.getByRole('button', { name: 'Show detail 1', exact: true }).click();

  await expect(page.getByText('ID', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/cars\/1$/);

  await page.getByRole('button', { name: 'Hide 1', exact: true }).click();
  await expect(page.getByText('ID', { exact: true })).toBeHidden();
  await expect(page).toHaveURL(/\/cars$/);
});
