import { Button, Flex, Select } from '@radix-ui/themes';
import { useCountries } from '../api/useCountries';

type CountrySelectProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
};

export function CountrySelect({ value, onChange, disabled = false }: CountrySelectProps) {
  const { data: countries = [] } = useCountries();

  return (
    <Flex align="center" gap="3">
      <Select.Root value={value ?? ''} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger aria-label="Tax Residence" placeholder="Select tax residence" />
        <Select.Content>
          {countries.map(({ code, name, flag }) => (
            <Select.Item key={code} value={code}>
              <Flex align="center" gap="2">
                <span aria-hidden>{flag}</span>
                {name}
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      {value !== undefined && (
        <Button variant="soft" color="gray" disabled={disabled} onClick={() => onChange(undefined)}>
          Clear
        </Button>
      )}
    </Flex>
  );
}
