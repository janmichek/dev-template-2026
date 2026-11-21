import { describe, expect, test } from 'vitest';
import { carSchema, makeSchema } from '../shared/schemas';
import { app } from './app';

describe('GET /api/cars', () => {
  test('returns the lot, parsed through the shared schema', async () => {
    const response = await app.request('/api/cars');
    const body = carSchema.array().parse(JSON.parse(await response.text()));

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.some((car) => car.status === 'available')).toBe(true);
  });
});

describe('GET /api/makes', () => {
  test('returns every make, parsed through the shared schema', async () => {
    const response = await app.request('/api/makes');
    const body = makeSchema.array().parse(JSON.parse(await response.text()));

    expect(response.status).toBe(200);
    expect(body.map((make) => make.code)).toContain('TOY');
  });
});
