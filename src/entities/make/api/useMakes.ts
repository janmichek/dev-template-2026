import { useQuery } from '@tanstack/react-query';
import { makeQueries } from './makeQueries';

// Stable entity hook around makeQueries.list() - keeps UI decoupled
// from query options so params/select/enabled can be added later.
export function useMakes() {
  return useQuery(makeQueries.list());
}
