import { Button, Table } from '@radix-ui/themes';
import { Fragment } from 'react';
import { CarFacts } from '../../../entities/car';
import { DealerName } from '../../../entities/dealer';
import type { Car } from '@shared/schemas';

const headers = ['Date', 'Status', 'From', 'To', 'Qty', 'Make', 'Price (USD)'];

type CarsTableProps = {
  data: Car[];
  expandedId: number | undefined;
  onToggle: (id: number) => void;
};

export function CarsTable({ data, expandedId, onToggle }: CarsTableProps) {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          {headers.map((header) => (
            <Table.ColumnHeaderCell key={header}>{header}</Table.ColumnHeaderCell>
          ))}
          <Table.ColumnHeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((car) => (
          <Fragment key={car.id}>
            <Table.Row>
              <Table.Cell>{new Date(car.date).toLocaleDateString()}</Table.Cell>
              <Table.Cell>{car.type}</Table.Cell>
              <Table.Cell>
                <DealerName name={car.from} />
              </Table.Cell>
              <Table.Cell>
                <DealerName name={car.to} />
              </Table.Cell>
              <Table.Cell>{car.amount}</Table.Cell>
              <Table.Cell>{car.make}</Table.Cell>
              <Table.Cell>{car.valueUsd}</Table.Cell>
              <Table.Cell>
                <Button
                  variant="soft"
                  aria-expanded={car.id === expandedId}
                  onClick={() => onToggle(car.id)}
                >
                  {car.id === expandedId ? `Hide ${car.id}` : `Show detail ${car.id}`}
                </Button>
              </Table.Cell>
            </Table.Row>
            {car.id === expandedId && (
              <Table.Row>
                <Table.Cell colSpan={headers.length + 1}>
                  <CarFacts car={car} />
                </Table.Cell>
              </Table.Row>
            )}
          </Fragment>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
