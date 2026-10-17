import { useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeading } from '../../../shared/ui';
import { Activity } from '../../../widgets/activity';
import { Portfolio } from '../../../widgets/portfolio';
import { Summary } from '../../../widgets/summary';

export function TransactionsPage() {
  // URL owns which row is expanded, so '/transactions/6' opens that detail on load
  const { txId } = useParams({ from: '/transactions/{-$txId}' });
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<string>();
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
      <Summary currency={currency} />
      <Portfolio currency={currency} onCurrencyChange={setCurrency} />
      <Activity currency={currency} limit={undefined} expandedId={expandedId} onToggle={toggle} />
    </>
  );
}
