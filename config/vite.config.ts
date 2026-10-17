import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  // Config lives in config/, so the app root stays the repository root.
  root,
  // React Compiler: auto-memoizes components and hooks, so no manual useMemo/useCallback/memo.
  // Native Rust port, needs the oxc-transform-react dev dependency
  plugins: [react({ compiler: true })],
  server: {
    port: 3000,
    proxy: { '/api': 'http://localhost:3001' },
  },
  // server/index.ts serves the production bundle from ./build
  build: { outDir: 'build' },
  // Vite's tsconfigPaths does not apply TypeScript 7 path mappings, so these mirror tsconfig.json.
  resolve: {
    alias: {
      '@server': fileURLToPath(new URL('../server', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
      '@test': fileURLToPath(new URL('../test', import.meta.url)),
    },
  },
  test: {
    // *.spec.ts next to a page belongs to Playwright
    include: ['src/**/*.test.{ts,tsx}'],
    unstubGlobals: true,
    // Vitest uses virtual browser so React component tests can render and query the page
    environment: 'happy-dom',
  },
});
