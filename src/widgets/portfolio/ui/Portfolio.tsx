import { Flex, Text } from '@radix-ui/themes';
import { CarAmount } from '../../../entities/car';
import { MakeSelect } from '../../../features/filter-make';
import { useCars } from '../../../features/list-cars';
import { totalValueSeries, ValueChart } from '../../../features/plot-value';
import { LoadingState } from '../../../shared/ui';

type PortfolioProps = {
  make: string | undefined;
  onMakeChange: (value: string | undefined) => void;
};

export function Portfolio({ make, onMakeChange }: PortfolioProps) {
  const { data, isPending, error } = useCars();

  if (isPending) return <LoadingState />;
  if (error) return error.message;

  const visible = make === undefined ? data : data.filter((car) => car.make === make);
  const latest = visible[visible.length - 1];

  return (
    <Flex direction="column" gap="2" mb="4">
      <MakeSelect value={make} onChange={onMakeChange} />
      <ValueChart points={totalValueSeries(visible)} />
      {latest !== undefined && (
        <Text size="2">
          Latest car: <CarAmount amount={latest.amount} make={latest.make} />
        </Text>
      )}
    </Flex>
  );
}
