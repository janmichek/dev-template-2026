import { Flex, Text } from '@radix-ui/themes';
import { TransactionAmount } from '../../../entities/transaction';
import { CurrencySelect } from '../../../features/filter-currency';
import { useTransactions } from '../../../features/list-transactions';
import { totalValueSeries, ValueChart } from '../../../features/plot-value';
import { LoadingState } from '../../../shared/ui';

type PortfolioProps = {
  currency: string | undefined;
  onCurrencyChange: (value: string | undefined) => void;
};

export function Portfolio({ currency, onCurrencyChange }: PortfolioProps) {
  const { data, isPending, error } = useTransactions();

  if (isPending) return <LoadingState />;
  if (error) return error.message;

  const visible = currency === undefined ? data : data.filter((tx) => tx.currency === currency);
  const latest = visible[visible.length - 1];

  return (
    <Flex direction="column" gap="2" mb="4">
      <CurrencySelect value={currency} onChange={onCurrencyChange} />
      <ValueChart points={totalValueSeries(visible)} />
      {latest !== undefined && (
        <Text size="2">
          Latest movement: <TransactionAmount amount={latest.amount} currency={latest.currency} />
        </Text>
      )}
    </Flex>
  );
}
