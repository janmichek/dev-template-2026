import type { Car } from '@shared/schemas';

// Cumulative inventory value over time for the area chart.
export function totalValueSeries(cars: Car[]): [number, number][] {
  let total = 0;
  return cars.map((car) => {
    total += { acquired: car.valueUsd, sold: -car.valueUsd, moved: 0 }[car.type];
    return [Date.parse(car.date), total];
  });
}
