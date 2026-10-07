import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { countrySchema } from '@shared/schemas';
import { fetchJson } from '../../../shared/api';

export const countryQueries = {
  list() {
    return queryOptions({
      queryKey: ['countries', 'list'],
      queryFn: () => fetchJson('/api/countries', z.array(countrySchema)),
    });
  },
};
