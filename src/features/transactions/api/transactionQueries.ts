import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { transactionSchema } from '@shared/schemas';
import { fetchJson } from '../../../shared/api';

export const transactionQueries = {
  list() {
    return queryOptions({
      queryKey: ['transactions', 'list'],
      queryFn: () => fetchJson('/api/transactions', z.array(transactionSchema)),
    });
  },
};
