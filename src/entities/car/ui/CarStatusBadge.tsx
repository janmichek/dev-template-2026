import { Badge } from '@radix-ui/themes';
import type { Car } from '@shared/schemas';

const colors = { available: 'green', reserved: 'amber', sold: 'gray' } as const;

export function CarStatusBadge({ status }: { status: Car['status'] }) {
  return <Badge color={colors[status]}>{status}</Badge>;
}
