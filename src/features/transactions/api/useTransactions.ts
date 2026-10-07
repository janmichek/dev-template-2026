import { useQuery } from '@tanstack/react-query';
import { transactionQueries } from './transactionQueries';

// Stable feature hook around transactionQueries.list() - keeps UI decoupled
// from query options so params/select/enabled can be added later.
export function useTransactions() {
  return useQuery(transactionQueries.list());
}
