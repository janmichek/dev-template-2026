import { Button } from '@radix-ui/themes';
import type { Car } from '@shared/schemas';
import { useReserveCar } from '../api/useReserveCar';

export function ReserveButton({ car }: { car: Car }) {
  const { mutate, isPending } = useReserveCar();

  return (
    <Button
      variant="soft"
      color="green"
      aria-label={`Reserve ${car.id}`}
      disabled={car.status !== 'available' || isPending}
      onClick={() => mutate(car.id)}
    >
      Reserve
    </Button>
  );
}
