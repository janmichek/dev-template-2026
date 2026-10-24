import type { Car } from '@shared/schemas';

// Business rules for the lot, kept out of the UI so they can be unit and mutation tested.
export function byMake(cars: Car[], make: string | undefined): Car[] {
  return make === undefined ? cars : cars.filter((car) => car.make === make);
}

export function countByStatus(cars: Car[]): Record<Car['status'], number> {
  const counts = { available: 0, reserved: 0, sold: 0 };
  for (const car of cars) counts[car.status] += 1;
  return counts;
}

// Only cars still for sale count toward the value standing on the lot.
export function stockValue(cars: Car[]): number {
  return cars.reduce((sum, car) => (car.status === 'available' ? sum + car.priceUsd : sum), 0);
}
