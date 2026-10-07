import { DataList } from '@radix-ui/themes';
import type { Transaction } from '@shared/schemas';

export function TransactionDetails({ tx }: { tx: Transaction }) {
  return (
    <DataList.Root>
      <DataList.Item>
        <DataList.Label>ID</DataList.Label>
        <DataList.Value>{tx.id}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Date</DataList.Label>
        <DataList.Value>{new Date(tx.date).toLocaleString()}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Type</DataList.Label>
        <DataList.Value>{tx.type}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>From</DataList.Label>
        <DataList.Value>{tx.from}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>To</DataList.Label>
        <DataList.Value>{tx.to}</DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Amount</DataList.Label>
        <DataList.Value>
          {tx.amount} {tx.currency}
        </DataList.Value>
      </DataList.Item>
      <DataList.Item>
        <DataList.Label>Value (USD)</DataList.Label>
        <DataList.Value>{tx.valueUsd}</DataList.Value>
      </DataList.Item>
    </DataList.Root>
  );
}
