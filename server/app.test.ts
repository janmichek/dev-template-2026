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

describe('POST /api/cars/:id/reserve', () => {
  test('reserves an available car', async () => {
    const response = await app.request('/api/cars/3/reserve', { method: 'POST' });
    const body = carSchema.parse(JSON.parse(await response.text()));

    expect(response.status).toBe(200);
    expect(body.status).toBe('reserved');
  });

  test('refuses a car that is no longer available', async () => {
    const reserved = await app.request('/api/cars/3/reserve', { method: 'POST' });
    const sold = await app.request('/api/cars/1/reserve', { method: 'POST' });

    expect(reserved.status).toBe(409);
    expect(sold.status).toBe(409);
    expect(await reserved.text()).toBe('');
  });

  test('answers 404 for an unknown car', async () => {
    const response = await app.request('/api/cars/999/reserve', { method: 'POST' });

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('');
  });
});
