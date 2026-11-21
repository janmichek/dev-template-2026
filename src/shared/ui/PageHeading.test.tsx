import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderWithProviders } from '@test/renderWithProviders';
import { PageHeading } from './PageHeading';

test('renders children as a level-one heading', () => {
  renderWithProviders(<PageHeading>Cars</PageHeading>);
  const heading = screen.getByRole('heading', { level: 1, name: 'Cars' });
  expect(heading.textContent).toBe('Cars');
});
