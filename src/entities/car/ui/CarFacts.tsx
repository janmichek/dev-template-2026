import { DataList } from '@radix-ui/themes';
import type { Car } from '@shared/schemas';

export function CarFacts({ car }: { car: Car }) {
  return (
    <DataList.Root>
      <DataList.Item>
        <DataList.Label>ID</DataList.Label>
        <DataList.Value>{car.id}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Date</DataList.Label>
        <DataList.Value>{new Date(car.date).toLocaleString()}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Status</DataList.Label>
        <DataList.Value>{car.type}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>From</DataList.Label>
        <DataList.Value>{car.from}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>To</DataList.Label>
        <DataList.Value>{car.to}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Qty</DataList.Label>
        <DataList.Value>
          {car.amount} {car.make}
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Price (USD)</DataList.Label>
        <DataList.Value>{car.valueUsd}</DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
}
