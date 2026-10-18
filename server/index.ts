import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { z } from 'zod';
import { carSchema, countrySchema, makeSchema } from '@shared/schemas';
import { cars, countries, makes } from './data';

const app = new Hono();

// Fixtures are parsed through the shared schemas before leaving the server
app.get('/api/cars', (c) => c.json(z.array(carSchema).parse(cars)));
app.get('/api/makes', (c) => c.json(z.array(makeSchema).parse(makes)));
app.get('/api/countries', (c) => c.json(z.array(countrySchema).parse(countries)));

// Serve the production React build from this same server so
// one Docker container handles both API and UI on :3001.
app.use('*', serveStatic({ root: './build' }));
app.get('*', serveStatic({ path: './build/index.html' }));

export default { port: 3001, fetch: app.fetch };
