import { Avatar, Button, Flex, Select } from '@radix-ui/themes';
import { useCurrencies } from '../api/useCurrencies';

type CurrencySelectProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
};

export function CurrencySelect({ value, onChange, disabled = false }: CurrencySelectProps) {
  const { data: currencies = [] } = useCurrencies();

  return (
    <Flex align="center" gap="3">
      <Select.Root value={value ?? ''} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger aria-label="Currency" placeholder="Select currency" />
        <Select.Content>
          {currencies.map(({ code, name, symbol, color }) => {
            return (
              <Select.Item key={code} value={code}>
                <Flex align="center" gap="2">
                  <span aria-hidden>
                    <Avatar
                      size="1"
                      radius="full"
                      variant="solid"
                      color={color}
                      fallback={symbol}
                    />
                  </span>
                  {`${name} (${code})`}
                </Flex>
              </Select.Item>
            );
          })}
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
