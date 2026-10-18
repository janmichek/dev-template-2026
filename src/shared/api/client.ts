import createClient from 'openapi-fetch';
import { z } from 'zod';
import { carSchema, countrySchema, makeSchema } from '@shared/schemas';
import type { paths } from './schema';

// Paths come from the generated OpenAPI types. Response bodies are still parsed
// with the shared Zod schemas, so a payload that doesn't match the contract throws.
// fetch is read at call time so Vitest's stubGlobal replaces it after import.
const client = createClient<paths>({
  baseUrl: '',
  fetch: (input: Request) => globalThis.fetch(input),
});

function parseBody<T>(schema: z.ZodType<T>, body: unknown, response: Response): T {
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return schema.parse(body);
}

export async function fetchCars() {
  const { data, response } = await client.GET('/api/cars');
  return parseBody(z.array(carSchema), data, response);
}

export async function fetchMakes() {
  const { data, response } = await client.GET('/api/makes');
  return parseBody(z.array(makeSchema), data, response);
}

export async function fetchCountries() {
  const { data, response } = await client.GET('/api/countries');
  return parseBody(z.array(countrySchema), data, response);
}
