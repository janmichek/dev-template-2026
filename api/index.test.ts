import { expect, test } from 'vitest';
import handler, { config } from './index';

test('exports an edge handler for the Vercel function', () => {
  expect(config).toEqual({ runtime: 'edge' });
  expect(handler).toBeTypeOf('function');
});
