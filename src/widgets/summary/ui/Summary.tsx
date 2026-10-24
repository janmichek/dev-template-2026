import { Flex } from '@radix-ui/themes';
import { byMake, countByStatus, stockValue, useCars } from '../../../entities/car';
import { formatUsd } from '../../../shared/lib';
import { LoadingState, Stat } from '../../../shared/ui';

export function Summary({ make }: { make: string | undefined }) {
  const query = useCars();
  if (query.isPending) return <LoadingState label="Counting..." />;
  if (query.error !== null) return query.error.message;

  const rows = byMake(query.data, make);
  const counts = countByStatus(rows);

  return (
    <Flex gap="4" my="4" wrap="wrap">
      <Stat label="Available" value={String(counts.available)} />
      <Stat label="Reserved" value={String(counts.reserved)} />
      <Stat label="Sold" value={String(counts.sold)} />
      <Stat label="Stock value" value={formatUsd(stockValue(rows))} />
    </Flex>
  );
}
