import { queryOptions } from '@tanstack/react-query';
import { fetchCars } from '../../../shared/api';

export const carQueries = {
  list() {
    return queryOptions({
      queryKey: ['cars', 'list'],
      queryFn: fetchCars,
    });
  },
};
