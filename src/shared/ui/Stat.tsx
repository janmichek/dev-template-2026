import { Text } from '@radix-ui/themes';

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Text size="2">
      {label}: {value}
    </Text>
  );
}
