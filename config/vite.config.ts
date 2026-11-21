import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import coverageFloors from './coverage-floors.json' with { type: 'json' };

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
    include: ['src/**/*.test.{ts,tsx}', '{scripts,server,api,shared}/**/*.test.ts'],
    unstubGlobals: true,
    // Vitest uses virtual browser so React component tests can render and query the page
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      // The gate covers the API and the shared contract, not just the React app.
      include: ['src/**/*.{ts,tsx}', 'server/**/*.ts', 'api/**/*.ts', 'shared/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.ts',
        '**/*.d.ts',
        'src/shared/api/schema.d.ts',
        // The Bun process entrypoint is exercised by Playwright, not Vitest.
        'server/index.ts',
      ],
      // Upward-only. Raise with `bun run coverage:ratchet`; never lower by hand.
      thresholds: coverageFloors,
    },
  },
});
