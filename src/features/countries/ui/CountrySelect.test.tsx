import { fireEvent, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { CountrySelect } from './CountrySelect';
import { renderInTheme } from '@test/renderInTheme';

test('reports the code of the picked country', async () => {
  const onChange = vi.fn();
  renderInTheme(<CountrySelect value={undefined} onChange={onChange} />);
  fireEvent.click(screen.getByRole('combobox', { name: 'Tax Residence' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Germany' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith('DE');
});

test('clears the selected country', async () => {
  const onChange = vi.fn();
  renderInTheme(<CountrySelect value="CZ" onChange={onChange} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Clear' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
});
