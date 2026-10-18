import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { Summary } from './Summary';

test('counts the loaded cars', async () => {
  renderInTheme(<Summary make={undefined} />);
  expect((await screen.findByText('Cars: 32')).textContent).toBe('Cars: 32');
  expect(screen.getByText('Acquired: 14').textContent).toBe('Acquired: 14');
  expect(screen.getByText('Sold: 15').textContent).toBe('Sold: 15');
});
