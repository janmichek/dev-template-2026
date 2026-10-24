import { Flex, Select } from '@radix-ui/themes';
import { MakeMark, useMakes } from '../../../entities/make';
import { ClearableSelect } from '../../../shared/ui';

type MakeSelectProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
};

export function MakeSelect({ value, onChange, disabled = false }: MakeSelectProps) {
  const { data: makes = [] } = useMakes();

  return (
    <ClearableSelect
      label="Make"
      placeholder="Select make"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {makes.map(({ code, name, symbol, color }) => (
        <Select.Item key={code} value={code}>
          <Flex align="center" gap="2">
            <MakeMark symbol={symbol} color={color} />
            {`${name} (${code})`}
          </Flex>
        </Select.Item>
      ))}
    </ClearableSelect>
  );
}
