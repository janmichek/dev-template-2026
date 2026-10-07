import { useQuery } from '@tanstack/react-query';
import { countryQueries } from './countryQueries';

export function useCountries() {
  return useQuery(countryQueries.list());
}
