import createClient from 'openapi-fetch';
import { z } from 'zod';
import { countrySchema, currencySchema, transactionSchema } from '@shared/schemas';
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

export async function fetchTransactions() {
  const { data, response } = await client.GET('/api/transactions');
  return parseBody(z.array(transactionSchema), data, response);
}

export async function fetchCurrencies() {
  const { data, response } = await client.GET('/api/currencies');
  return parseBody(z.array(currencySchema), data, response);
}

export async function fetchCountries() {
  const { data, response } = await client.GET('/api/countries');
  return parseBody(z.array(countrySchema), data, response);
}
