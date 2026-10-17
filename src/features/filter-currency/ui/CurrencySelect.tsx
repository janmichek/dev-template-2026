import { Flex, Select } from '@radix-ui/themes';
import { CurrencyMark } from '../../../entities/currency';
import { ClearableSelect } from '../../../shared/ui';
import { useCurrencies } from '../api/useCurrencies';

type CurrencySelectProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
};

export function CurrencySelect({ value, onChange, disabled = false }: CurrencySelectProps) {
  const { data: currencies = [] } = useCurrencies();

  return (
    <ClearableSelect
      label="Currency"
      placeholder="Select currency"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {currencies.map(({ code, name, symbol, color }) => (
        <Select.Item key={code} value={code}>
          <Flex align="center" gap="2">
            <CurrencyMark symbol={symbol} color={color} />
            {`${name} (${code})`}
          </Flex>
        </Select.Item>
      ))}
    </ClearableSelect>
  );
}
