import { Flex } from '@radix-ui/themes';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { CountryLabel } from '../../../entities/country';
import { CountrySelect, useCountries } from '../../../features/filter-country';
import { PageHeading } from '../../../shared/ui';
import { Activity } from '../../../widgets/activity';
import { Portfolio } from '../../../widgets/portfolio';
import { Summary } from '../../../widgets/summary';
import { Wallets } from '../../../widgets/wallets';

export function DashboardPage() {
  const [currency, setCurrency] = useState<string>();
  const [country, setCountry] = useState<string>();
  const { data: countries = [] } = useCountries();
  const selected = countries.find((item) => item.code === country);
  const navigate = useNavigate();

  function openTransaction(id: number) {
    void navigate({
      to: '/transactions/{-$txId}',
      params: { txId: String(id) },
    });
  }

  return (
    <>
      <PageHeading>Dashboard</PageHeading>
      <Summary currency={currency} />
      <Wallets currency={currency} />
      <Portfolio currency={currency} onCurrencyChange={setCurrency} />
      <Activity currency={currency} limit={3} expandedId={undefined} onToggle={openTransaction} />
      <Flex align="end" gap="3" mt="4">
        <CountrySelect value={country} onChange={setCountry} />
      </Flex>
      {selected !== undefined && <CountryLabel flag={selected.flag} name={selected.name} />}
    </>
  );
}
