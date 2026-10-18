import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { PageHeading } from './PageHeading';

test('renders children as a level-one heading', () => {
  renderInTheme(<PageHeading>Cars</PageHeading>);
  const heading = screen.getByRole('heading', { level: 1, name: 'Cars' });
  expect(heading.textContent).toBe('Cars');
});
