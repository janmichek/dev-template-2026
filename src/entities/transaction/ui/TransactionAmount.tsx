import { Text } from '@radix-ui/themes';

export function TransactionAmount({ amount, currency }: { amount: number; currency: string }) {
  return (
    <Text as="span">
      {amount} {currency}
    </Text>
  );
}
