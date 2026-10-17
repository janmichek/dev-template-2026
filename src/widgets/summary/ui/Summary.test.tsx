import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { Summary } from './Summary';

test('counts the loaded transactions', async () => {
  renderInTheme(<Summary currency={undefined} />);
  expect((await screen.findByText('Transactions: 32')).textContent).toBe('Transactions: 32');
  expect(screen.getByText('Deposits: 14').textContent).toBe('Deposits: 14');
  expect(screen.getByText('Withdrawals: 15').textContent).toBe('Withdrawals: 15');
});
