import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { MakeSelect } from './MakeSelect';
import { renderInTheme } from '@test/renderInTheme';

test('shows the selected make with its mark', async () => {
  renderInTheme(<MakeSelect value="TOY" onChange={vi.fn()} />);
  const trigger = screen.getByRole('combobox', { name: 'Make' });
  await waitFor(() => expect(trigger.textContent).toContain('Toyota'));
  await waitFor(() => expect(trigger.textContent).toContain('T'));
});

test('clears the selected make', async () => {
  const onChange = vi.fn();
  renderInTheme(<MakeSelect value="TOY" onChange={onChange} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Clear' }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
});
