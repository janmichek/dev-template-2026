import { Flex } from '@radix-ui/themes';
import { useTransactions } from '../../../features/list-transactions';
import { LoadingState, Stat } from '../../../shared/ui';

export function Summary({ currency }: { currency: string | undefined }) {
  const query = useTransactions();
  if (query.isPending) return <LoadingState label="Counting..." />;
  if (query.error !== null) return query.error.message;

  const rows = query.data.filter((tx) => currency === undefined || tx.currency === currency);
  const deposits = rows.filter((tx) => tx.type === 'deposit').length;
  const withdrawals = rows.filter((tx) => tx.type === 'withdrawal').length;

  return (
    <Flex gap="4" mb="4">
      <Stat label="Transactions" value={String(rows.length)} />
      <Stat label="Deposits" value={String(deposits)} />
      <Stat label="Withdrawals" value={String(withdrawals)} />
    </Flex>
  );
}
