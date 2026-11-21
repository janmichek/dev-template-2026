import type { Make } from '@shared/schemas';

export function MakeMark({ symbol, color }: { symbol: string; color: Make['color'] }) {
  return (
    <span aria-hidden="true" className={`make-mark make-mark--${color}`}>
      {symbol}
    </span>
  );
}
