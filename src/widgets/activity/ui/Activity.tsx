import { Flex, Text } from '@radix-ui/themes';
import { CurrencyMark } from '../../../entities/currency';
import { useCurrencies } from '../../../features/filter-currency';
import { TransactionsTable, useTransactions } from '../../../features/list-transactions';
import { totalValueSeries } from '../../../features/plot-value';
import { LoadingState } from '../../../shared/ui';

type ActivityProps = {
  currency: string | undefined;
  limit: number | undefined;
  expandedId: number | undefined;
  onToggle: (id: number) => void;
};

export function Activity({ currency, limit, expandedId, onToggle }: ActivityProps) {
  const { data, isPending, error } = useTransactions();
  const { data: currencies = [] } = useCurrencies();

  if (isPending) return <LoadingState label="Loading..." />;
  if (error) return error.message;

  const visible = currency === undefined ? data : data.filter((tx) => tx.currency === currency);
  const rows = limit === undefined ? visible : visible.slice(-limit);
  const series = totalValueSeries(visible);
  const last = series[series.length - 1];
  const total = last === undefined ? 0 : last[1];
  const marked = currencies.find((item) => item.code === currency);

  return (
    <Flex direction="column" gap="3">
      <Flex align="center" gap="2">
        {marked !== undefined && <CurrencyMark symbol={marked.symbol} color={marked.color} />}
        <Text size="2">Portfolio total: {total} USD</Text>
      </Flex>
      <TransactionsTable data={rows} expandedId={expandedId} onToggle={onToggle} />
    </Flex>
  );
}
