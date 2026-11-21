import { vi } from 'vitest';
import { cars, makes } from '../server/data';
import type { Car, Make } from '../shared/schemas';

const routes = new Map<string, Car[] | Make[]>([
  ['GET /api/cars', cars],
  ['GET /api/makes', makes],
]);

// fetch stub serving the server fixtures; unknown URLs 404 so a typo fails the test.
// Restored after each test by `unstubGlobals` in config/vite.config.ts.
// openapi-fetch calls fetch with a Request, so method and path are read off that.
export function stubApi(failedPath?: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      const path = new URL(request.url).pathname;
      const route = `${request.method} ${path}`;

      if (route === failedPath) return new Response(null, { status: 500 });

      const body = routes.get(route);

      return body === undefined ? new Response(null, { status: 404 }) : Response.json(body);
    })
  );
}
