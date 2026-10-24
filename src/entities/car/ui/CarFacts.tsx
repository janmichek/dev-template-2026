import { DataList } from '@radix-ui/themes';
import type { Car } from '@shared/schemas';
import { formatUsd } from '../../../shared/lib';
import { CarStatusBadge } from './CarStatusBadge';

export function CarFacts({ car }: { car: Car }) {
  return (
    <DataList.Root>
      <DataList.Item>
        <DataList.Label>ID</DataList.Label>
        <DataList.Value>{car.id}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Year</DataList.Label>
        <DataList.Value>{car.year}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Mileage</DataList.Label>
        <DataList.Value>{car.mileageKm.toLocaleString('en-US')} km</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Price</DataList.Label>
        <DataList.Value>{formatUsd(car.priceUsd)}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Status</DataList.Label>
        <DataList.Value>
          <CarStatusBadge status={car.status} />
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Listed</DataList.Label>
        <DataList.Value>{new Date(car.listedAt).toLocaleDateString()}</DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
}
