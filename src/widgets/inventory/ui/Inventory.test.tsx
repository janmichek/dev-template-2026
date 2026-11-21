import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderWithProviders } from '@test/renderWithProviders';
import { Inventory } from './Inventory';

test('lists the newest cars first, up to the limit, without a reserve action', async () => {
  renderWithProviders(
    <Inventory make={undefined} limit={2} expandedId={undefined} onToggle={() => {}} />
  );
  const rows = await screen.findAllByRole('button', { name: /^Show detail/ });
  expect(rows.map((row) => row.textContent)).toEqual(['Show detail 12', 'Show detail 11']);
  expect(screen.queryByRole('button', { name: /^Reserve/ })).toBeNull();
});

test('opens a row through the toggle callback', async () => {
  const onToggle = vi.fn();
  renderWithProviders(
    <Inventory make={undefined} limit={1} expandedId={undefined} onToggle={onToggle} />
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Show detail 12' }));
  expect(onToggle).toHaveBeenCalledExactlyOnceWith(12);
});

test('explains an empty result instead of rendering an empty table', async () => {
  renderWithProviders(
    <Inventory make="NOPE" limit={undefined} expandedId={undefined} onToggle={() => {}} />
  );
  expect(await screen.findByText('No cars match this make.')).toBeDefined();
});

test('renders the expanded facts', async () => {
  renderWithProviders(
    <Inventory make="TES" limit={undefined} expandedId={3} onToggle={() => {}} />
  );
  expect((await screen.findByText('Model 3')).textContent).toBe('Model 3');
  expect(screen.getByText('41,000 km').textContent).toBe('41,000 km');
});

test('shows the server error when cars fail to load', async () => {
  renderWithProviders(
    <Inventory make={undefined} limit={undefined} expandedId={undefined} onToggle={() => {}} />,
    'GET /api/cars'
  );
  await waitFor(() => screen.getByText('Request failed: 500'));
});
