import { describe, expect, test } from 'vitest';
import type { Car } from '@shared/schemas';
import { byMake, countByStatus, stockValue } from './stock';

function car(status: Car['status'], priceUsd: number, make = 'TOY'): Car {
  return {
    id: 0,
    make,
    model: 'Corolla',
    year: 2020,
    mileageKm: 0,
    priceUsd,
    status,
    listedAt: '2025-01-06T09:14:00Z',
  };
}

const lot = [
  car('available', 10000),
  car('reserved', 20000),
  car('sold', 30000),
  car('available', 5000, 'BMW'),
];

describe('byMake', () => {
  test('keeps every car when no make is picked', () => {
    expect(byMake(lot, undefined)).toBe(lot);
  });

  test('keeps only cars of the picked make', () => {
    expect(byMake(lot, 'BMW')).toEqual([lot[3]]);
  });
});

describe('countByStatus', () => {
  test('counts every status, including ones with no cars', () => {
    expect(countByStatus(lot)).toEqual({ available: 2, reserved: 1, sold: 1 });
    expect(countByStatus([])).toEqual({ available: 0, reserved: 0, sold: 0 });
  });
});

describe('stockValue', () => {
  test('sums the price of available cars only', () => {
    expect(stockValue(lot)).toBe(15000);
  });
});
