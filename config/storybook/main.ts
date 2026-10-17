import type { StorybookConfig } from '@storybook/react-vite';

// reuses config/vite.config.ts, so stories build with the same plugins as the app
const config: StorybookConfig = {
  stories: ['../../stories/**/*.stories.tsx'],
  framework: {
    name: '@storybook/react-vite',
    options: { builder: { viteConfigPath: 'config/vite.config.ts' } },
  },
};

export default config;
