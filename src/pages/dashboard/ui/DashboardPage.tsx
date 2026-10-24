import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { MakeSelect } from '../../../features/filter-make';
import { ReserveButton } from '../../../features/reserve-car';
import { PageHeading } from '../../../shared/ui';
import { Inventory } from '../../../widgets/inventory';
import { Summary } from '../../../widgets/summary';

// The page owns the make filter because two widgets read it.
export function DashboardPage() {
  const [make, setMake] = useState<string>();
  const navigate = useNavigate();

  function openCar(id: number) {
    void navigate({ to: '/cars/{-$carId}', params: { carId: String(id) } });
  }

  return (
    <>
      <PageHeading>Dashboard</PageHeading>
      <MakeSelect value={make} onChange={setMake} />
      <Summary make={make} />
      <Inventory
        make={make}
        limit={3}
        expandedId={undefined}
        onToggle={openCar}
        action={ReserveButton}
      />
    </>
  );
}
