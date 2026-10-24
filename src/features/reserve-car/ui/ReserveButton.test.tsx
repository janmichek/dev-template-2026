import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { cars } from '@server/data';
import { renderInTheme } from '@test/renderInTheme';
import { ReserveButton } from './ReserveButton';

const available = cars.find((car) => car.status === 'available');
const sold = cars.find((car) => car.status === 'sold');

test('reserves an available car through the API', async () => {
  if (available === undefined) throw new Error('fixture needs an available car');
  renderInTheme(<ReserveButton car={available} />);
  fireEvent.click(screen.getByRole('button', { name: `Reserve ${available.id}` }));

  await waitFor(() => {
    const [request] = vi.mocked(fetch).mock.lastCall ?? [];
    if (!(request instanceof Request)) throw new Error('expected a Request');
    expect(request.method).toBe('POST');
    expect(request.url).toContain(`/api/cars/${available.id}/reserve`);
  });
});

test('cannot reserve a car that is already sold', () => {
  if (sold === undefined) throw new Error('fixture needs a sold car');
  renderInTheme(<ReserveButton car={sold} />);
  expect(screen.getByRole('button', { name: `Reserve ${sold.id}` }).hasAttribute('disabled')).toBe(
    true
  );
});
