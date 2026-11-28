import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { z } from 'zod';
import { isMutationTarget } from './mutation-targets';

const patterns = z
  .object({ mutate: z.array(z.string()) })
  .parse(
    JSON.parse(readFileSync(join(process.cwd(), 'config/stryker.config.json'), 'utf8'))
  ).mutate;

test('mutation targets follow the stryker config', () => {
  expect(isMutationTarget('src/entities/car/model/stock.ts', patterns)).toBe(true);
  expect(isMutationTarget('src/shared/lib/formatUsd.ts', patterns)).toBe(true);
  expect(isMutationTarget('src/shared/api/client.ts', patterns)).toBe(true);
  expect(isMutationTarget('server/app.ts', patterns)).toBe(true);
  expect(isMutationTarget('shared/schemas.ts', patterns)).toBe(true);
  expect(isMutationTarget('src/entities/car/model/stock.test.ts', patterns)).toBe(false);
  expect(isMutationTarget('src/shared/api/schema.d.ts', patterns)).toBe(false);
  expect(isMutationTarget('server/index.ts', patterns)).toBe(false);
  expect(isMutationTarget('server/data.ts', patterns)).toBe(false);
  expect(isMutationTarget('server/app.test.ts', patterns)).toBe(false);
  expect(isMutationTarget('src/pages/cars/ui/CarsPage.tsx', patterns)).toBe(false);
});
