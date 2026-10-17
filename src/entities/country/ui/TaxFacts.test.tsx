import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { Country } from '@shared/schemas';
import { renderInTheme } from '@test/renderInTheme';
import { TaxFacts } from './TaxFacts';

const germany: Country = {
  code: 'DE',
  name: 'Germany',
  flag: '🇩🇪',
  tax: { capitalGainsTax: 45, holdingPeriodMonths: 12 },
};

test('shows the residence tax rates', () => {
  renderInTheme(<TaxFacts country={germany} />);
  expect(screen.getByText('Capital gains tax: 45%').textContent).toBe('Capital gains tax: 45%');
  expect(screen.getByText('Holding period for relief: 12 months').textContent).toBe(
    'Holding period for relief: 12 months'
  );
});
