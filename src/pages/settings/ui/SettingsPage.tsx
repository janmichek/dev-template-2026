import { Box } from '@radix-ui/themes';
import { useState } from 'react';
import { TaxFacts } from '../../../entities/country';
import { CountrySelect, useCountries } from '../../../features/filter-country';
import { PageHeading } from '../../../shared/ui';

export function SettingsPage() {
  const [country, setCountry] = useState<string>();
  const { data: countries = [] } = useCountries();
  const selected = countries.find((item) => item.code === country);

  return (
    <>
      <PageHeading>Settings</PageHeading>
      <Box>
        <CountrySelect value={country} onChange={setCountry} />
      </Box>
      {selected !== undefined && (
        <Box mt="4">
          <TaxFacts country={selected} />
        </Box>
      )}
    </>
  );
}
