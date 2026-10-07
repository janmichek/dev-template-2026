import { Button, Table } from '@radix-ui/themes';
import { Fragment } from 'react';
import { TransactionDetails } from './TransactionDetails';
import type { Transaction } from '@shared/schemas';

const headers = ['Date', 'Type', 'From', 'To', 'Amount', 'Currency', 'Value (USD)'];

type TransactionsTableProps = {
  data: Transaction[];
  expandedId: number | undefined;
  onToggle: (id: number) => void;
};

export function TransactionsTable({ data, expandedId, onToggle }: TransactionsTableProps) {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          {headers.map((header) => (
            <Table.ColumnHeaderCell key={header}>{header}</Table.ColumnHeaderCell>
          ))}
          <Table.ColumnHeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((tx) => (
          <Fragment key={tx.id}>
            <Table.Row>
              <Table.Cell>{new Date(tx.date).toLocaleDateString()}</Table.Cell>
              <Table.Cell>{tx.type}</Table.Cell>
              <Table.Cell>{tx.from}</Table.Cell>
              <Table.Cell>{tx.to}</Table.Cell>
              <Table.Cell>{tx.amount}</Table.Cell>
              <Table.Cell>{tx.currency}</Table.Cell>
              <Table.Cell>{tx.valueUsd}</Table.Cell>
              <Table.Cell>
                <Button
                  variant="soft"
                  aria-expanded={tx.id === expandedId}
                  onClick={() => onToggle(tx.id)}
                >
                  {tx.id === expandedId ? `Hide ${tx.id}` : `Show detail ${tx.id}`}
                </Button>
              </Table.Cell>
            </Table.Row>
            {tx.id === expandedId && (
              <Table.Row>
                <Table.Cell colSpan={headers.length + 1}>
                  <TransactionDetails tx={tx} />
                </Table.Cell>
              </Table.Row>
            )}
          </Fragment>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
