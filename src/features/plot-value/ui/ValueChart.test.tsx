import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { ValueChart } from './ValueChart';

test('draws the portfolio series', () => {
  renderInTheme(
    <ValueChart
      points={[
        [Date.parse('2025-01-06T09:14:00Z'), 8000],
        [Date.parse('2025-02-25T10:12:00Z'), 4500],
      ]}
    />
  );

  const chart = screen.getByRole('img', { name: 'Total value in time' });
  expect(chart.querySelector('path')).not.toBeNull();
});

test('shows an empty state when there is no series', () => {
  renderInTheme(<ValueChart points={[]} />);
  expect(screen.getByText('No transactions')).toBeTruthy();
});
