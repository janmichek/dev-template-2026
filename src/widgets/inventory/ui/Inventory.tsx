import { Button, Flex, Table } from '@radix-ui/themes';
import { type ComponentType, Fragment } from 'react';
import { byMake, CarFacts, CarStatusBadge, useCars } from '../../../entities/car';
import { MakeMark, useMakes } from '../../../entities/make';
import type { Car } from '@shared/schemas';
import { formatUsd } from '../../../shared/lib';
import { LoadingState } from '../../../shared/ui';

const headers = ['Make', 'Model', 'Year', 'Price', 'Status'];

type InventoryProps = {
  make: string | undefined;
  limit: number | undefined;
  expandedId: number | undefined;
  onToggle: (id: number) => void;
  // Slot for a feature (e.g. reserving). The page decides which actions a row offers,
  // so this widget never imports a feature it might not need.
  action: ComponentType<{ car: Car }>;
};

export function Inventory({ make, limit, expandedId, onToggle, action: Action }: InventoryProps) {
  const { data, isPending, error } = useCars();
  const { data: makes = [] } = useMakes();

  if (isPending) return <LoadingState label="Loading..." />;
  if (error) return error.message;

  const newestFirst = byMake(data, make).toReversed();
  const rows = limit === undefined ? newestFirst : newestFirst.slice(0, limit);

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
        {rows.map((car) => {
          const carMake = makes.find((item) => item.code === car.make);
          const expanded = car.id === expandedId;
          return (
            <Fragment key={car.id}>
              <Table.Row align="center">
                <Table.Cell>
                  <Flex align="center" gap="2">
                    {carMake !== undefined && (
                      <MakeMark symbol={carMake.symbol} color={carMake.color} />
                    )}
                    {carMake?.name ?? car.make}
                  </Flex>
                </Table.Cell>
                <Table.Cell>{car.model}</Table.Cell>
                <Table.Cell>{car.year}</Table.Cell>
                <Table.Cell>{formatUsd(car.priceUsd)}</Table.Cell>
                <Table.Cell>
                  <CarStatusBadge status={car.status} />
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Action car={car} />
                    <Button
                      variant="soft"
                      aria-expanded={expanded}
                      onClick={() => onToggle(car.id)}
                    >
                      {expanded ? `Hide ${car.id}` : `Show detail ${car.id}`}
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
              {expanded && (
                <Table.Row>
                  <Table.Cell colSpan={headers.length + 1}>
                    <CarFacts car={car} />
                  </Table.Cell>
                </Table.Row>
              )}
            </Fragment>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}
