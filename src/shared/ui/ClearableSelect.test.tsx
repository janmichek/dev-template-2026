import { fireEvent, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderWithProviders } from '@test/renderWithProviders';
import { ClearableSelect } from './ClearableSelect';

test('reports the placeholder as no selection', () => {
  const onChange = vi.fn();
  renderWithProviders(
    <ClearableSelect label="Make" placeholder="Select make" value="TOY" onChange={onChange}>
      <option value="TOY">Toyota</option>
    </ClearableSelect>
  );

  fireEvent.change(screen.getByRole('combobox', { name: 'Make' }), { target: { value: '' } });
  expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
});

test('leaves out the clear action until a value is picked', () => {
  renderWithProviders(
    <ClearableSelect label="Make" placeholder="Select make" value={undefined} onChange={vi.fn()}>
      <option value="TOY">Toyota</option>
    </ClearableSelect>
  );

  expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
});

test('disables the select and the clear action', () => {
  renderWithProviders(
    <ClearableSelect label="Make" placeholder="Select make" value="TOY" onChange={vi.fn()} disabled>
      <option value="TOY">Toyota</option>
    </ClearableSelect>
  );

  expect(screen.getByRole('combobox', { name: 'Make' }).hasAttribute('disabled')).toBe(true);
  expect(screen.getByRole('button', { name: 'Clear' }).hasAttribute('disabled')).toBe(true);
});
