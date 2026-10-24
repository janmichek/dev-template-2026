import { useMutation, useQueryClient } from '@tanstack/react-query';
import { carQueries } from '../../../entities/car';
import { reserveCar } from '../../../shared/api';

// Refetch every car query after a reservation so counts and tables agree.
export function useReserveCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reserveCar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: carQueries.all() }),
  });
}
