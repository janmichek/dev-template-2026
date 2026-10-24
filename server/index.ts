import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { z } from 'zod';
import { carSchema, makeSchema } from '@shared/schemas';
import { cars, makes } from './data';

const app = new Hono();

// Fixtures are parsed through the shared schemas before leaving the server
app.get('/api/cars', (c) => c.json(z.array(carSchema).parse(cars)));
app.get('/api/makes', (c) => c.json(z.array(makeSchema).parse(makes)));

// Reserving holds an available car. State lives in memory, so a restart resets the lot.
app.post('/api/cars/:id/reserve', (c) => {
  const car = cars.find((item) => item.id === Number(c.req.param('id')));
  if (car === undefined) return c.body(null, 404);
  if (car.status !== 'available') return c.body(null, 409);
  car.status = 'reserved';
  return c.json(carSchema.parse(car));
});

// Serve the production React build from this same server so
// one Docker container handles both API and UI on :3001.
app.use('*', serveStatic({ root: './build' }));
app.get('*', serveStatic({ path: './build/index.html' }));

export default { port: 3001, fetch: app.fetch };
