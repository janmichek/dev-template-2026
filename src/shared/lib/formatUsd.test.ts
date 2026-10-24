import { expect, test } from 'vitest';
import { formatUsd } from './formatUsd';

test('formats whole dollars with grouping', () => {
  expect(formatUsd(26900)).toBe('$26,900');
});
