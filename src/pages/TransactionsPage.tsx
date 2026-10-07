import { Flex, Spinner, Text } from '@radix-ui/themes';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { CurrencySelect } from '../features/currencies';
import { TransactionsTable, useTransactions } from '../features/transactions';
import { PageHeading } from '../shared/ui';

export function TransactionsPage() {
  // URL owns which row is expanded, so '/transactions/6' opens that detail on load
  const { txId } = useParams({ from: '/transactions/{-$txId}' });
  const navigate = useNavigate();
  const { data, isPending, error } = useTransactions();
  const [currency, setCurrency] = useState<string>();

  if (isPending)
    return (
      <Flex align="center" gap="2" role="status">
        <Spinner />
        <Text>Loading...</Text>
      </Flex>
    );
  if (error) return error.message;

  const visible = currency === undefined ? data : data.filter((tx) => tx.currency === currency);
  const expandedId = txId === undefined ? undefined : Number(txId);

  function toggle(id: number) {
    void navigate({
      to: '/transactions/{-$txId}',
      params: { txId: id === expandedId ? undefined : String(id) },
    });
  }

  return (
    <>
      <PageHeading>Transactions</PageHeading>
      <Flex align="end" gap="3" mb="4">
        <CurrencySelect value={currency} onChange={setCurrency} />
      </Flex>
      <TransactionsTable data={visible} expandedId={expandedId} onToggle={toggle} />
    </>
  );
}
