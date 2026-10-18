import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { DealerName } from './DealerName';

test('shows the dealer name', () => {
  renderInTheme(<DealerName name="City Motors" />);
  expect(screen.getByText('City Motors').textContent).toBe('City Motors');
});
