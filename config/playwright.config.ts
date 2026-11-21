import { defineConfig, devices } from '@playwright/test';

// Playwright records at 800x450 unless told otherwise, which makes the PR evidence unreadable.
const recording = process.env['PLAYWRIGHT_VIDEO'] === 'on';
const recordingViewport = { width: 1440, height: 900 };

const projectUse = recording
  ? {
      ...devices['Desktop Chrome'],
      viewport: recordingViewport,
      deviceScaleFactor: 2,
      launchOptions: { slowMo: 200 },
    }
  : devices['Desktop Chrome'];

export default defineConfig({
  testDir: '../src/pages',
  outputDir: '../test-results',
  testMatch: '**/*.spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    video: recording ? { mode: 'on', size: recordingViewport } : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: projectUse,
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
