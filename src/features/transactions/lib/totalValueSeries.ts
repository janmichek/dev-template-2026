import type { Transaction } from '@shared/schemas';

// Cumulative portfolio value over time for the area chart.
export function totalValueSeries(transactions: Transaction[]): [number, number][] {
  let total = 0;
  return transactions.map((tx) => {
    total += { deposit: tx.valueUsd, withdrawal: -tx.valueUsd, transfer: 0 }[tx.type];
    return [Date.parse(tx.date), total];
  });
}
