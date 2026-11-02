import createClient from 'openapi-fetch';
import { z } from 'zod';
import { carSchema, makeSchema } from '@shared/schemas';
import type { paths } from './schema';

// Paths come from the generated OpenAPI types. Response bodies are still parsed
// with the shared Zod schemas, so a payload that doesn't match the contract throws.
// fetch is read at call time so Vitest's stubGlobal replaces it after import.
const client = createClient<paths>({
  baseUrl: '',
  fetch: (input: Request) => globalThis.fetch(input),
});

function requestFailed(response: Response): Error {
  return new Error(`Request failed: ${response.status}`);
}

export async function fetchCars() {
  const { data, response } = await client.GET('/api/cars');

  if (!response.ok) throw requestFailed(response);

  return z.array(carSchema).parse(data);
}

export async function fetchMakes() {
  const { data, response } = await client.GET('/api/makes');

  if (!response.ok) throw requestFailed(response);

  return z.array(makeSchema).parse(data);
}

export async function reserveCar(id: number) {
  const { data, response } = await client.POST('/api/cars/{id}/reserve', {
    params: { path: { id } },
  });

  if (!response.ok) throw requestFailed(response);

  return carSchema.parse(data);
}
