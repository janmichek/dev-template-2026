import { useQuery } from '@tanstack/react-query';
import { carQueries } from './carQueries';

// Stable entity hook around carQueries.list() - keeps UI decoupled
// from query options so params/select/enabled can be added later.
export function useCars() {
  return useQuery(carQueries.list());
}
