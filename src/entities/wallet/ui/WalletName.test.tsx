import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { WalletName } from './WalletName';

test('shows the wallet name', () => {
  renderInTheme(<WalletName name="Coinbase" />);
  expect(screen.getByText('Coinbase').textContent).toBe('Coinbase');
});
