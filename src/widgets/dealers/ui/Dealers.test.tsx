import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { Dealers } from './Dealers';

test('lists dealer names from the loaded cars', async () => {
  renderInTheme(<Dealers make={undefined} />);
  expect(await screen.findByText('Dealers')).toBeTruthy();
  expect(screen.getByText('City Motors').textContent).toBe('City Motors');
  expect(screen.getByText('Harbor Auto').textContent).toBe('Harbor Auto');
});
