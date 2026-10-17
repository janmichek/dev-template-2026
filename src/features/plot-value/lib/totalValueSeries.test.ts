import { describe, expect, test } from 'vitest';
import type { Transaction } from '@shared/schemas';
import { totalValueSeries } from './totalValueSeries';

function tx(
  partial: Partial<Transaction> & { date: string; type: Transaction['type']; valueUsd: number }
): Transaction {
  return { id: 0, from: '', to: '', amount: 0, currency: 'USD', ...partial };
}

// pure logic unit test
describe('totalValueSeries', () => {
  test('accumulates deposits, withdrawals, ignores transfers', () => {
    const input = [
      tx({ date: '2025-01-06T09:14:00Z', type: 'deposit', valueUsd: 8000 }),
      tx({ date: '2025-02-18T08:30:00Z', type: 'transfer', valueUsd: 2000 }),
      tx({ date: '2025-02-25T10:12:00Z', type: 'withdrawal', valueUsd: 3500 }),
    ];

    expect(totalValueSeries(input)).toEqual([
      [Date.parse('2025-01-06T09:14:00Z'), 8000],
      [Date.parse('2025-02-18T08:30:00Z'), 8000],
      [Date.parse('2025-02-25T10:12:00Z'), 4500],
    ]);
  });
});
