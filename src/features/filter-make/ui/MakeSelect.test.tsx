import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { MakeSelect } from './MakeSelect';
import { renderWithProviders } from '@test/renderWithProviders';

test('shows the selected make with its mark', async () => {
  renderWithProviders(<MakeSelect value="TOY" onChange={vi.fn()} />);
  const trigger = screen.getByRole('combobox', { name: 'Make' });
  await waitFor(() => expect(trigger.textContent).toContain('Toyota'));
  await waitFor(() => expect(trigger.textContent).toContain('T'));
});

test('clears the selected make', async () => {
  const onChange = vi.fn();
  renderWithProviders(<MakeSelect value="TOY" onChange={onChange} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Clear' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
});

test('picks a make from the list', async () => {
  const onChange = vi.fn();
  renderWithProviders(<MakeSelect value={undefined} onChange={onChange} />);
  const select = await screen.findByRole('combobox', { name: 'Make' });
  await screen.findByRole('option', { name: 'B BMW (BMW)' });
  fireEvent.change(select, { target: { value: 'BMW' } });
  expect(onChange).toHaveBeenCalledExactlyOnceWith('BMW');
});
