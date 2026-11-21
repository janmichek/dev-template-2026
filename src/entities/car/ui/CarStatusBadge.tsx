import type { Car } from '@shared/schemas';

export function CarStatusBadge({ status }: { status: Car['status'] }) {
  return <span className={`badge badge--${status}`}>{status}</span>;
}
