import { Flex, Select } from '@radix-ui/themes';
import { ClearableSelect } from '../../../shared/ui';
import { useCountries } from '../api/useCountries';

type CountrySelectProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
};

export function CountrySelect({ value, onChange, disabled = false }: CountrySelectProps) {
  const { data: countries = [] } = useCountries();

  return (
    <ClearableSelect
      label="Tax Residence"
      placeholder="Select tax residence"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {countries.map(({ code, name, flag }) => (
        <Select.Item key={code} value={code}>
          <Flex align="center" gap="2">
            <span aria-hidden>{flag}</span>
            {name}
          </Flex>
        </Select.Item>
      ))}
    </ClearableSelect>
  );
}
