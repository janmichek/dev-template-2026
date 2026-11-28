import { expect, test } from 'vitest';
import { blastFromDiff, blastWarning } from './blast-radius';

const diff = [
  '+++ b/src/shared/api/schema.d.ts',
  '+generated',
  '+++ b/src/pages/cars/ui/CarsPage.tsx',
  '+page',
  '-old',
  '+++ b/src/entities/car/ui/CarFacts.tsx',
  '+fact',
  '+++ b/bun.lock',
  '+lock',
].join('\n');

test('counts changed lines and layers, skipping generated files', () => {
  const blast = blastFromDiff(diff);
  expect(blast.lines).toBe(3);
  expect(blast.layers).toEqual(['pages', 'entities']);
  expect(blastWarning({ lines: 501, layers: ['app', 'pages', 'widgets', 'features'] })).toBe(
    'Blast radius: 501 changed lines; 4 Feature-Sliced layers (app, pages, widgets, features).'
  );
  expect(blastWarning(blast)).toBeUndefined();
});
