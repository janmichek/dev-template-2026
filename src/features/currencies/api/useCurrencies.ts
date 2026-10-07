import { useQuery } from '@tanstack/react-query';
import { currencyQueries } from './currencyQueries';

// Stable feature hook around currencyQueries.list() - keeps UI decoupled
// from query options so params/select/enabled can be added later.
export function useCurrencies() {
  return useQuery(currencyQueries.list());
}
