import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { Car } from '@shared/schemas';
import { renderInTheme } from '@test/renderInTheme';
import { Inventory } from './Inventory';

function NoAction() {
  return null;
}

function Echo({ car }: { car: Car }) {
  return <span>action {car.id}</span>;
}

test('lists the newest cars first, up to the limit', async () => {
  renderInTheme(
    <Inventory
      make={undefined}
      limit={2}
      expandedId={undefined}
      onToggle={() => {}}
      action={NoAction}
    />
  );
  const rows = await screen.findAllByRole('button', { name: /^Show detail/ });
  expect(rows.map((row) => row.textContent)).toEqual(['Show detail 12', 'Show detail 11']);
});

test('renders the action slot and the expanded facts', async () => {
  renderInTheme(
    <Inventory make="TES" limit={undefined} expandedId={3} onToggle={() => {}} action={Echo} />
  );
  expect((await screen.findByText('action 8')).textContent).toBe('action 8');
  expect(screen.getByText('Model 3').textContent).toBe('Model 3');
  expect(screen.getByText('41,000 km').textContent).toBe('41,000 km');
});
