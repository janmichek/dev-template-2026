import { Flex, Text } from '@radix-ui/themes';
import { DealerName } from '../../../entities/dealer';
import { useCars } from '../../../features/list-cars';
import { LoadingState } from '../../../shared/ui';

const shown = 4;

export function Dealers({ make }: { make: string | undefined }) {
  const { data = [], isPending, error } = useCars();
  if (isPending || error) return error ? error.message : <LoadingState label="Dealers..." />;

  const names = new Set<string>();
  for (const car of data) {
    if (make !== undefined && car.make !== make) continue;
    names.add(car.from);
    names.add(car.to);
    if (names.size >= shown) break;
  }

  return (
    <Flex direction="column" gap="1" mb="4">
      <Text size="2" color="gray">
        Dealers
      </Text>
      {[...names].map((name) => (
        <DealerName key={name} name={name} />
      ))}
    </Flex>
  );
}
