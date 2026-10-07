import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // React Compiler: auto-memoizes components and hooks, so no manual useMemo/useCallback/memo.
  // Native Rust port, needs the oxc-transform-react dev dependency
  plugins: [react({ compiler: true })],
  server: {
    port: 3000,
    proxy: { '/api': 'http://localhost:3001' },
  },
  // server/index.ts serves the production bundle from ./build
  build: { outDir: 'build' },
  // aliases come from tsconfig.json paths, declared once
  resolve: { tsconfigPaths: true },
  test: {
    // *.spec.ts next to a page belongs to Playwright
    include: ['src/**/*.test.{ts,tsx}'],
    unstubGlobals: true,
    // Vitest uses virtual browser so React component tests can render and query the page
    environment: 'happy-dom',
  },
});
