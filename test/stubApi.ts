import { vi } from 'vitest';
import { cars, makes } from '../server/data';

const routes: Record<string, unknown> = {
  'GET /api/cars': cars,
  'GET /api/makes': makes,
};

// Mirrors the server: reserving an available car returns it as reserved.
function reserve(path: string): Response {
  const id = Number(/^\/api\/cars\/(\d+)\/reserve$/.exec(path)?.[1]);
  const car = cars.find((item) => item.id === id);
  if (car === undefined) return new Response(null, { status: 404 });
  return Response.json({ ...car, status: 'reserved' });
}

// fetch stub serving the server fixtures; unknown URLs 404 so a typo fails the test.
// Restored after each test by `unstubGlobals` in config/vite.config.ts.
// openapi-fetch calls fetch with a Request, so method and path are read off that.
export function stubApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      const path = new URL(request.url).pathname;
      if (request.method === 'POST') return reserve(path);
      const body = routes[`${request.method} ${path}`];
      return body === undefined ? new Response(null, { status: 404 }) : Response.json(body);
    })
  );
}
