import { queryOptions } from '@tanstack/react-query';
import { fetchCars } from '../../../shared/api';

export const carQueries = {
  all: () => ['cars'] as const,
  list() {
    return queryOptions({
      queryKey: [...carQueries.all(), 'list'],
      queryFn: fetchCars,
    });
  },
};
