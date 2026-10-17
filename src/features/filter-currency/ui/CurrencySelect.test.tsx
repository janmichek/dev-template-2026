import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { CurrencySelect } from './CurrencySelect';
import { renderInTheme } from '@test/renderInTheme';

test('shows the selected currency with its coin symbol', async () => {
  renderInTheme(<CurrencySelect value="BTC" onChange={vi.fn()} />);
  const trigger = screen.getByRole('combobox', { name: 'Currency' });
  await waitFor(() => expect(trigger.textContent).toContain('Bitcoin'));
  await waitFor(() => expect(trigger.textContent).toContain('₿'));
});

test('clears the selected currency', async () => {
  const onChange = vi.fn();
  renderInTheme(<CurrencySelect value="BTC" onChange={onChange} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Clear' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
});
