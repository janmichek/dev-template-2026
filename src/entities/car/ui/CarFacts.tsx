import type { Car } from '@shared/schemas';
import { formatUsd } from '../../../shared/lib';
import { CarStatusBadge } from './CarStatusBadge';

export function CarFacts({ car }: { car: Car }) {
  return (
    <dl className="facts">
      <dt>ID</dt>
      <dd>{car.id}</dd>
      <dt>Year</dt>
      <dd>{car.year}</dd>
      <dt>Mileage</dt>
      <dd>{car.mileageKm.toLocaleString('en-US')} km</dd>
      <dt>Price</dt>
      <dd>{formatUsd(car.priceUsd)}</dd>
      <dt>Status</dt>
      <dd>
        <CarStatusBadge status={car.status} />
      </dd>
      <dt>Listed</dt>
      <dd>{new Date(car.listedAt).toLocaleDateString()}</dd>
    </dl>
  );
}
