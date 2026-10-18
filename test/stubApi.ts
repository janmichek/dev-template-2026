import { vi } from 'vitest';
import { cars, countries, makes } from '../server/data';

const routes: Record<string, unknown> = {
  '/api/cars': cars,
  '/api/makes': makes,
  '/api/countries': countries,
};

function requestPath(input: unknown): string {
  if (input instanceof Request) return new URL(input.url).pathname;
  return new URL(String(input), 'http://localhost').pathname;
}

// fetch stub serving the server fixtures; unknown URLs 404 so a typo fails the test.
// Restored after each test by `unstubGlobals` in config/vite.config.ts.
// openapi-fetch calls fetch with a Request, so the path is read off that.
export function stubApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: unknown) => {
      const body = routes[requestPath(input)];
      return body === undefined ? new Response(null, { status: 404 }) : Response.json(body);
    })
  );
}
