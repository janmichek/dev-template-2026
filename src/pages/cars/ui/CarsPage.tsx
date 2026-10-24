import { useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { MakeSelect } from '../../../features/filter-make';
import { ReserveButton } from '../../../features/reserve-car';
import { PageHeading } from '../../../shared/ui';
import { Inventory } from '../../../widgets/inventory';
import { Summary } from '../../../widgets/summary';

export function CarsPage() {
  // URL owns which row is expanded, so '/cars/6' opens that detail on load
  const { carId } = useParams({ from: '/cars/{-$carId}' });
  const navigate = useNavigate();
  const [make, setMake] = useState<string>();
  const expandedId = carId === undefined ? undefined : Number(carId);

  function toggle(id: number) {
    void navigate({
      to: '/cars/{-$carId}',
      params: { carId: id === expandedId ? undefined : String(id) },
    });
  }

  return (
    <>
      <PageHeading>Cars</PageHeading>
      <MakeSelect value={make} onChange={setMake} />
      <Summary make={make} />
      <Inventory
        make={make}
        limit={undefined}
        expandedId={expandedId}
        onToggle={toggle}
        action={ReserveButton}
      />
    </>
  );
}
