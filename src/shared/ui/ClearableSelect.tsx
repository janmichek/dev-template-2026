import { Button, Flex, Select } from '@radix-ui/themes';
import type { ReactNode } from 'react';

type ClearableSelectProps = {
  label: string;
  placeholder: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  children: ReactNode;
};

export function ClearableSelect({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  children,
}: ClearableSelectProps) {
  return (
    <Flex align="center" gap="3">
      <Select.Root value={value ?? ''} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger aria-label={label} placeholder={placeholder} />
        <Select.Content>{children}</Select.Content>
      </Select.Root>
      {value !== undefined && (
        <Button variant="soft" color="gray" disabled={disabled} onClick={() => onChange(undefined)}>
          Clear
        </Button>
      )}
    </Flex>
  );
}
