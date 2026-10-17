import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

// Strict FSD: app → pages → widgets → features → entities → shared.
// `recommended` already sets every stable rule to error, including insignificant-slice.
// `no-wildcard-exports` is the extra public-API rule Steiger ships but leaves off.
// `import-locality` stays off: slices import each other by relative path so the
// architecture diagram can see the edges. Absolute aliases would hide them.
// `no-cross-imports` and `no-higher-level-imports` are the two halves of
// `forbidden-imports`, which recommended already enables. Turning them on
// only reports the same edge twice.
export default defineConfig([
  // oxlint-disable-next-line typescript/no-unsafe-assignment -- plugin tuple; oxlint marks this spread as an error type
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/no-wildcard-exports': 'error',
    },
  },
]);
