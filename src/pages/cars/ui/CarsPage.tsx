import { useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeading } from '../../../shared/ui';
import { Activity } from '../../../widgets/activity';
import { Dealers } from '../../../widgets/dealers';
import { Portfolio } from '../../../widgets/portfolio';
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
      <Summary make={make} />
      <Dealers make={make} />
      <Portfolio make={make} onMakeChange={setMake} />
      <Activity make={make} limit={undefined} expandedId={expandedId} onToggle={toggle} />
    </>
  );
}
