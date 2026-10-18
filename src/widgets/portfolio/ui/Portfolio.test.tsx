import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderInTheme } from '@test/renderInTheme';
import { Portfolio } from './Portfolio';

test('shows the latest car from the loaded lot', async () => {
  renderInTheme(<Portfolio make={undefined} onMakeChange={() => {}} />);
  expect(await screen.findByText('1 BMW')).toBeTruthy();
  expect(screen.getByText(/Latest car:/).textContent).toContain('Latest car:');
});
