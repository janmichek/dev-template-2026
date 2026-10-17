import { queryOptions } from '@tanstack/react-query';
import { fetchCurrencies } from '../../../shared/api';

export const currencyQueries = {
  list() {
    return queryOptions({
      queryKey: ['currencies', 'list'],
      queryFn: fetchCurrencies,
    });
  },
};
