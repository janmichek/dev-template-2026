import { queryOptions } from '@tanstack/react-query';
import { fetchMakes } from '../../../shared/api';

export const makeQueries = {
  list() {
    return queryOptions({
      queryKey: ['makes', 'list'],
      queryFn: fetchMakes,
    });
  },
};
