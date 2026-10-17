import { queryOptions } from '@tanstack/react-query';
import { fetchCountries } from '../../../shared/api';

export const countryQueries = {
  list() {
    return queryOptions({
      queryKey: ['countries', 'list'],
      queryFn: fetchCountries,
    });
  },
};
