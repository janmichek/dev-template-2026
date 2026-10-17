import { Card, Text } from '@radix-ui/themes';
import type { Country } from '@shared/schemas';

export function TaxFacts({ country }: { country: Country }) {
  return (
    <Card>
      <Text as="p" size="3" weight="bold">
        {country.flag} {country.name} - crypto tax
      </Text>
      <Text as="p" size="2" mt="2">
        Capital gains tax: {country.tax.capitalGainsTax}%
      </Text>
      <Text as="p" size="2">
        Holding period for relief: {country.tax.holdingPeriodMonths ?? 0} months
      </Text>
    </Card>
  );
}
