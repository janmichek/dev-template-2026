import { describe, expect, test } from 'vitest';
import type { Car } from '@shared/schemas';
import { totalValueSeries } from './totalValueSeries';

function car(partial: Partial<Car> & { date: string; type: Car['type']; valueUsd: number }): Car {
  return { id: 0, from: '', to: '', amount: 0, make: 'TOY', ...partial };
}

// pure logic unit test
describe('totalValueSeries', () => {
  test('accumulates acquired cars, sold cars, ignores moves', () => {
    const input = [
      car({ date: '2025-01-06T09:14:00Z', type: 'acquired', valueUsd: 8000 }),
      car({ date: '2025-02-18T08:30:00Z', type: 'moved', valueUsd: 2000 }),
      car({ date: '2025-02-25T10:12:00Z', type: 'sold', valueUsd: 3500 }),
    ];

    expect(totalValueSeries(input)).toEqual([
      [Date.parse('2025-01-06T09:14:00Z'), 8000],
      [Date.parse('2025-02-18T08:30:00Z'), 8000],
      [Date.parse('2025-02-25T10:12:00Z'), 4500],
    ]);
  });
});
