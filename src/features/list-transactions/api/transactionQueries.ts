import { queryOptions } from '@tanstack/react-query';
import { fetchTransactions } from '../../../shared/api';

export const transactionQueries = {
  list() {
    return queryOptions({
      queryKey: ['transactions', 'list'],
      queryFn: fetchTransactions,
    });
  },
};
