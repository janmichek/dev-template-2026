import { Avatar } from '@radix-ui/themes';
import type { Currency } from '@shared/schemas';

export function CurrencyMark({ symbol, color }: { symbol: string; color: Currency['color'] }) {
  return (
    <span aria-hidden>
      <Avatar size="1" radius="full" variant="solid" color={color} fallback={symbol} />
    </span>
  );
}
