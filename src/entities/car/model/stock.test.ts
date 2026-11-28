import { array, assert, constant, constantFrom, integer, property, record } from 'fast-check';
import { describe, expect, test } from 'vitest';
import type { Car } from '@shared/schemas';
import { byMake, countByStatus, stockValue } from './stock';

const statuses: Car['status'][] = ['available', 'reserved', 'sold'];
const makes = ['TOY', 'BMW', 'AUDI'];

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

const carArbitrary = record({
  id: integer({ min: 0, max: 10_000 }),
  make: constantFrom(...makes),
  model: constant('Corolla'),
  year: integer({ min: 1990, max: 2026 }),
  mileageKm: integer({ min: 0, max: 600_000 }),
  priceUsd: integer({ min: 0, max: 500_000 }),
  status: constantFrom(...statuses),
  listedAt: constant('2025-01-06T09:14:00Z'),
});

const lotArbitrary = array(carArbitrary, { maxLength: 25 });
const priceArbitrary = integer({ min: 0, max: 500_000 });

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

  test('returns the very same lot when no make is picked', () => {
    assert(
      property(lotArbitrary, (cars) => {
        expect(byMake(cars, undefined) === cars).toBe(true);
      })
    );
  });

  test('keeps only matching cars, in their original order', () => {
    assert(
      property(lotArbitrary, constantFrom(...makes), (cars, make) => {
        const original: Car[] = cars;
        const kept = byMake(original, make);
        const matching = original.filter((entry) => entry.make === make);

        expect(kept).toHaveLength(matching.length);
        expect(kept.every((entry) => entry.make === make)).toBe(true);

        let cursor = -1;

        for (const entry of kept) {
          const position = original.indexOf(entry, cursor + 1);
          expect(position).toBeGreaterThan(-1);
          cursor = position;
        }
      })
    );
  });

  test('keeps nothing for a make that is not on the lot', () => {
    assert(
      property(lotArbitrary, (cars) => {
        expect(byMake(cars, 'KIA')).toEqual([]);
      })
    );
  });
});

describe('countByStatus', () => {
  test('counts every status, including ones with no cars', () => {
    expect(countByStatus(lot)).toEqual({ available: 2, reserved: 1, sold: 1 });
    expect(countByStatus([])).toEqual({ available: 0, reserved: 0, sold: 0 });
  });

  test('accounts for every car exactly once across the buckets', () => {
    assert(
      property(lotArbitrary, (cars) => {
        const counts = countByStatus(cars);
        expect(counts.available + counts.reserved + counts.sold).toBe(cars.length);
        expect(Object.values(counts).every((count) => Number.isInteger(count) && count >= 0)).toBe(
          true
        );
      })
    );
  });

  test('matches an independent count per status', () => {
    assert(
      property(lotArbitrary, (cars) => {
        const counts = countByStatus(cars);

        for (const status of statuses) {
          const expected = cars.reduce(
            (total, entry) => (entry.status === status ? total + 1 : total),
            0
          );

          expect(counts[status]).toBe(expected);
        }
      })
    );
  });

  test('does not depend on the order cars arrive in', () => {
    assert(
      property(lotArbitrary, (cars) => {
        expect(countByStatus(cars.toReversed())).toEqual(countByStatus(cars));
      })
    );
  });
});

describe('stockValue', () => {
  test('sums the price of available cars only', () => {
    expect(stockValue(lot)).toBe(15000);
  });

  test('ignores the price of cars that are not available', () => {
    assert(
      property(lotArbitrary, (cars) => {
        const repriced = cars.map((entry) =>
          entry.status === 'available' ? entry : { ...entry, priceUsd: entry.priceUsd + 1_000 }
        );

        expect(stockValue(repriced)).toBe(stockValue(cars));
      })
    );
  });

  test('adds each available car at its full price', () => {
    assert(
      property(lotArbitrary, priceArbitrary, (cars, price) => {
        expect(stockValue([...cars, car('available', price)])).toBe(stockValue(cars) + price);
      })
    );
  });

  test('ignores added cars that are reserved or sold', () => {
    assert(
      property(lotArbitrary, priceArbitrary, (cars, price) => {
        expect(stockValue([...cars, car('reserved', price)])).toBe(stockValue(cars));
        expect(stockValue([...cars, car('sold', price)])).toBe(stockValue(cars));
      })
    );
  });

  test('never goes negative for non-negative prices', () => {
    assert(
      property(lotArbitrary, (cars) => {
        expect(stockValue(cars)).toBeGreaterThanOrEqual(0);
      })
    );
  });
});
