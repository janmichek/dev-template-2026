import { Hono } from 'hono';
import { z } from 'zod';
import { carSchema, makeSchema } from '../shared/schemas';
import { cars, makes } from './data';

export const app = new Hono();

// Fixtures are parsed through the shared schemas before leaving the server
app.get('/api/cars', (c) => c.json(z.array(carSchema).parse(cars)));

app.get('/api/makes', (c) => c.json(z.array(makeSchema).parse(makes)));
