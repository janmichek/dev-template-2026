import { Box, Card, Text } from '@radix-ui/themes';
import { useState } from 'react';
import { CountrySelect, useCountries } from '../features/countries';
import { PageHeading } from '../shared/ui';

export function SettingsPage() {
  const [country, setCountry] = useState<string>();
  const { data: countries = [] } = useCountries();
  const selected = countries.find((c) => c.code === country);

  return (
    <>
      <PageHeading>Settings</PageHeading>
      <Box>
        <CountrySelect value={country} onChange={setCountry} />
      </Box>
      {selected && (
        <Box mt="4">
          <Card>
            <Text as="p" size="3" weight="bold">
              {selected.flag} {selected.name} - crypto tax
            </Text>
            <Text as="p" size="2" mt="2">
              Capital gains tax: {selected.tax.capitalGainsTax}%
            </Text>
            <Text as="p" size="2">
              Holding period for relief: {selected.tax.holdingPeriodMonths ?? 0} months
            </Text>
          </Card>
        </Box>
      )}
    </>
  );
}
