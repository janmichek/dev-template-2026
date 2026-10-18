import { Flex, Text } from '@radix-ui/themes';
import { MakeMark } from '../../../entities/make';
import { useMakes } from '../../../features/filter-make';
import { CarsTable, useCars } from '../../../features/list-cars';
import { totalValueSeries } from '../../../features/plot-value';
import { LoadingState } from '../../../shared/ui';

type ActivityProps = {
  make: string | undefined;
  limit: number | undefined;
  expandedId: number | undefined;
  onToggle: (id: number) => void;
};

export function Activity({ make, limit, expandedId, onToggle }: ActivityProps) {
  const { data, isPending, error } = useCars();
  const { data: makes = [] } = useMakes();

  if (isPending) return <LoadingState label="Loading..." />;
  if (error) return error.message;

  const visible = make === undefined ? data : data.filter((car) => car.make === make);
  const rows = limit === undefined ? visible : visible.slice(-limit);
  const series = totalValueSeries(visible);
  const last = series[series.length - 1];
  const total = last === undefined ? 0 : last[1];
  const marked = makes.find((item) => item.code === make);

  return (
    <Flex direction="column" gap="3">
      <Flex align="center" gap="2">
        {marked !== undefined && <MakeMark symbol={marked.symbol} color={marked.color} />}
        <Text size="2">Inventory total: {total} USD</Text>
      </Flex>
      <CarsTable data={rows} expandedId={expandedId} onToggle={onToggle} />
    </Flex>
  );
}
