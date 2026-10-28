// Entry point for bare `vitest` / `bun vitest` runs from the repository root.
// Without this file Vitest falls back to its defaults: no path aliases, no happy-dom,
// and `*.spec.ts` files (Playwright) get picked up. The real config lives in config/.
// The explicit .ts extension keeps Vite's native config loader happy.
export { default } from './config/vite.config.ts';
