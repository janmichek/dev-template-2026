import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../src/pages',
  outputDir: '../test-results',
  testMatch: '**/*.spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'bun server/index.ts',
      cwd: '..',
      url: 'http://127.0.0.1:3001/api/cars',
      reuseExistingServer: true,
    },
    {
      command: 'bun run start --host 127.0.0.1',
      cwd: '..',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
    },
  ],
});
