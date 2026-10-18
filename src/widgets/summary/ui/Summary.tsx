import { Flex } from '@radix-ui/themes';
import { useCars } from '../../../features/list-cars';
import { LoadingState, Stat } from '../../../shared/ui';

export function Summary({ make }: { make: string | undefined }) {
  const query = useCars();
  if (query.isPending) return <LoadingState label="Counting..." />;
  if (query.error !== null) return query.error.message;

  const rows = query.data.filter((car) => make === undefined || car.make === make);
  const acquired = rows.filter((car) => car.type === 'acquired').length;
  const sold = rows.filter((car) => car.type === 'sold').length;

  return (
    <Flex gap="4" mb="4">
      <Stat label="Cars" value={String(rows.length)} />
      <Stat label="Acquired" value={String(acquired)} />
      <Stat label="Sold" value={String(sold)} />
    </Flex>
  );
}
