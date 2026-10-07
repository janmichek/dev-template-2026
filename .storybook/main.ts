import type { StorybookConfig } from '@storybook/react-vite';

// reuses vite.config.ts, so stories build with the same plugins as the app
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  framework: {
    name: '@storybook/react-vite',
    options: { builder: { viteConfigPath: 'vite.config.ts' } },
  },
};

export default config;
