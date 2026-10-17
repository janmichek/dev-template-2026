import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { Portfolio } from './Portfolio';

test('shows the latest movement from the loaded transactions', async () => {
  renderInTheme(<Portfolio currency={undefined} onCurrencyChange={() => {}} />);
  expect(await screen.findByText('1 ETH')).toBeTruthy();
  expect(screen.getByText(/Latest movement:/).textContent).toContain('Latest movement:');
});
