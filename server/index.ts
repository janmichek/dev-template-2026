import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { z } from 'zod';
import { countrySchema, currencySchema, transactionSchema } from '@shared/schemas';
import { countries, currencies, transactions } from '@fixtures/data';

const app = new Hono();

// Fixtures are parsed through the shared schemas before leaving the server
app.get('/api/transactions', (c) => c.json(z.array(transactionSchema).parse(transactions)));
app.get('/api/currencies', (c) => c.json(z.array(currencySchema).parse(currencies)));
app.get('/api/countries', (c) => c.json(z.array(countrySchema).parse(countries)));

// Serve the production React build from this same server so
// one Docker container handles both API and UI on :3001.
app.use('*', serveStatic({ root: './build' }));
app.get('*', serveStatic({ path: './build/index.html' }));

export default { port: 3001, fetch: app.fetch };
