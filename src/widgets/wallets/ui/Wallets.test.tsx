import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { Wallets } from './Wallets';

test('lists wallet names from the loaded transactions', async () => {
  renderInTheme(<Wallets currency={undefined} />);
  expect(await screen.findByText('Wallets')).toBeTruthy();
  expect(screen.getByText('Coinbase').textContent).toBe('Coinbase');
  expect(screen.getByText('Bank (SEPA)').textContent).toBe('Bank (SEPA)');
});
