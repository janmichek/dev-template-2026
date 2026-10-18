import { Flex } from '@radix-ui/themes';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { CountryLabel } from '../../../entities/country';
import { CountrySelect, useCountries } from '../../../features/filter-country';
import { PageHeading } from '../../../shared/ui';
import { Activity } from '../../../widgets/activity';
import { Dealers } from '../../../widgets/dealers';
import { Portfolio } from '../../../widgets/portfolio';
import { Summary } from '../../../widgets/summary';

export function DashboardPage() {
  const [make, setMake] = useState<string>();
  const [country, setCountry] = useState<string>();
  const { data: countries = [] } = useCountries();
  const selected = countries.find((item) => item.code === country);
  const navigate = useNavigate();

  function openCar(id: number) {
    void navigate({
      to: '/cars/{-$carId}',
      params: { carId: String(id) },
    });
  }

  return (
    <>
      <PageHeading>Dashboard</PageHeading>
      <Summary make={make} />
      <Dealers make={make} />
      <Portfolio make={make} onMakeChange={setMake} />
      <Activity make={make} limit={3} expandedId={undefined} onToggle={openCar} />
      <Flex align="end" gap="3" mt="4">
        <CountrySelect value={country} onChange={setCountry} />
      </Flex>
      {selected !== undefined && <CountryLabel flag={selected.flag} name={selected.name} />}
    </>
  );
}
