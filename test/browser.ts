import { AxeBuilder } from '@axe-core/playwright';
import { expect, test as base, type Page } from '@playwright/test';

type BrowserOptions = {
  allowBrowserErrors: boolean;
};

export const test = base.extend<BrowserOptions>({
  allowBrowserErrors: [false, { option: true }],
  page: async ({ page, allowBrowserErrors }, visit) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await visit(page);

    if (!allowBrowserErrors) expect(errors).toEqual([]);
  },
});

export async function expectAccessible(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  const summary = results.violations.map((violation) => `${violation.id}: ${violation.help}`);
  expect(summary).toEqual([]);
}

export { expect };
