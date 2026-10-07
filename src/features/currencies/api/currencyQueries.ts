import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { currencySchema } from '@shared/schemas';
import { fetchJson } from '../../../shared/api';

export const currencyQueries = {
  list() {
    return queryOptions({
      queryKey: ['currencies', 'list'],
      queryFn: () => fetchJson('/api/currencies', z.array(currencySchema)),
    });
  },
};
