import { Fragment } from 'react';
import { byMake, CarFacts, CarStatusBadge, useCars } from '../../../entities/car';
import { MakeMark, useMakes } from '../../../entities/make';
import { formatUsd } from '../../../shared/lib';
import { LoadingState } from '../../../shared/ui';

const headers = ['Make', 'Model', 'Year', 'Price', 'Status'];

type InventoryProps = {
  make: string | undefined;
  limit: number | undefined;
  expandedId: number | undefined;
  onToggle: (id: number) => void;
};

export function Inventory({ make, limit, expandedId, onToggle }: InventoryProps) {
  const { data, isPending, error } = useCars();
  const { data: makes = [] } = useMakes();

  if (isPending) return <LoadingState label="Loading..." />;

  if (error) {
    return (
      <p className="notice notice--error" role="alert">
        {error.message}
      </p>
    );
  }

  const newestFirst = byMake(data, make).toReversed();
  const rows = limit === undefined ? newestFirst : newestFirst.slice(0, limit);

  if (rows.length === 0) return <p className="notice">No cars match this make.</p>;

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
            <th scope="col">
              <span className="visually-hidden">Detail</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((car) => {
            const carMake = makes.find((item) => item.code === car.make);
            const expanded = car.id === expandedId;

            return (
              <Fragment key={car.id}>
                <tr>
                  <td>
                    <span className="make-cell">
                      {carMake !== undefined && (
                        <MakeMark symbol={carMake.symbol} color={carMake.color} />
                      )}
                      {carMake?.name ?? car.make}
                    </span>
                  </td>
                  <td>{car.model}</td>
                  <td>{car.year}</td>
                  <td>{formatUsd(car.priceUsd)}</td>
                  <td>
                    <CarStatusBadge status={car.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button"
                      aria-expanded={expanded}
                      onClick={() => onToggle(car.id)}
                    >
                      {expanded ? `Hide ${car.id}` : `Show detail ${car.id}`}
                    </button>
                  </td>
                </tr>
                {expanded && (
                  <tr>
                    <td colSpan={headers.length + 1}>
                      <CarFacts car={car} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
