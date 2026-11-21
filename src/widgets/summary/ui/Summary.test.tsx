import { screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderWithProviders } from '@test/renderWithProviders';
import { Summary } from './Summary';

test('counts the lot by status and values the stock', async () => {
  renderWithProviders(<Summary make={undefined} />);
  expect((await screen.findByText('Available: 6')).textContent).toBe('Available: 6');
  expect(screen.getByText('Reserved: 2').textContent).toBe('Reserved: 2');
  expect(screen.getByText('Sold: 4').textContent).toBe('Sold: 4');
  expect(screen.getByText('Stock value: $147,600').textContent).toBe('Stock value: $147,600');
});

test('narrows the counts to the picked make', async () => {
  renderWithProviders(<Summary make="TES" />);
  expect((await screen.findByText('Available: 1')).textContent).toBe('Available: 1');
  expect(screen.getByText('Reserved: 1').textContent).toBe('Reserved: 1');
});

test('shows the server error when cars fail to load', async () => {
  renderWithProviders(<Summary make={undefined} />, 'GET /api/cars');
  await waitFor(() => screen.getByText('Request failed: 500'));
});
