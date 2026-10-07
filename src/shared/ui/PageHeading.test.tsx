import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { PageHeading } from './PageHeading';

test('renders children as a level-one heading', () => {
  renderInTheme(<PageHeading>Transactions</PageHeading>);
  const heading = screen.getByRole('heading', { level: 1, name: 'Transactions' });
  expect(heading.textContent).toBe('Transactions');
});
