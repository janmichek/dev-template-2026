import { vi } from 'vitest';
import { countries, currencies, transactions } from '@fixtures/data';

const routes: Record<string, unknown> = {
  '/api/transactions': transactions,
  '/api/currencies': currencies,
  '/api/countries': countries,
};

// fetch stub serving the server fixtures; unknown URLs 404 so a typo fails the test.
// Restored after each test by `unstubGlobals` in vite.config.ts
export function stubApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: unknown) => {
      const body = routes[String(url)];
      return body === undefined ? new Response(null, { status: 404 }) : Response.json(body);
    })
  );
}
