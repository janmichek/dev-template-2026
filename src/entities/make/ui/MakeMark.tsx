import { Avatar } from '@radix-ui/themes';
import type { Make } from '@shared/schemas';

export function MakeMark({ symbol, color }: { symbol: string; color: Make['color'] }) {
  return (
    <span aria-hidden>
      <Avatar size="1" radius="full" variant="solid" color={color} fallback={symbol} />
    </span>
  );
}
