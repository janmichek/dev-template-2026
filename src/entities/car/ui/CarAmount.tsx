import { Text } from '@radix-ui/themes';

export function CarAmount({ amount, make }: { amount: number; make: string }) {
  return (
    <Text as="span">
      {amount} {make}
    </Text>
  );
}
