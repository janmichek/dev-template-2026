import { assert, integer, property } from 'fast-check';
import { expect, test } from 'vitest';
import { formatUsd } from './formatUsd';

function grouped(plain: string): string {
  const negative = plain.startsWith('-');
  const body = negative ? plain.slice(1) : plain;
  const head = body.length % 3 || 3;
  const groups = [body.slice(0, head)];

  for (let index = head; index < body.length; index += 3) groups.push(body.slice(index, index + 3));

  return `${negative ? '-' : ''}${groups.join(',')}`;
}

function digits(formatted: string): string {
  return formatted.replaceAll('$', '').replaceAll(',', '');
}

const wholeDollars = integer({ min: -1_000_000_000, max: 1_000_000_000 });

test('formats whole dollars with grouping', () => {
  expect(formatUsd(26900)).toBe('$26,900');
});

test('always renders a dollar sign and whole dollars, never cents', () => {
  assert(
    property(wholeDollars, (value) => {
      const formatted = formatUsd(value);

      expect(formatted).toMatch(/^-?\$[\d,]+$/);
      expect(formatted).not.toContain('.');
    })
  );
});

test('groups the digits in threes without changing them', () => {
  assert(
    property(integer({ min: 0, max: 1_000_000_000 }), (value) => {
      expect(formatUsd(value)).toBe(`$${grouped(String(value))}`);
    })
  );
});

test('round-trips a whole dollar amount back to the same number', () => {
  assert(
    property(wholeDollars, (value) => {
      expect(Number(digits(formatUsd(value)))).toBe(value === 0 ? 0 : value);
    })
  );
});

test('renders negatives as the positive amount behind a minus sign', () => {
  assert(
    property(integer({ min: 1, max: 1_000_000_000 }), (value) => {
      expect(formatUsd(-value)).toBe(`-${formatUsd(value)}`);
    })
  );
});

test('never reorders amounts', () => {
  assert(
    property(wholeDollars, wholeDollars, (left, right) => {
      const low = Math.min(left, right);
      const high = Math.max(left, right);

      expect(Number(digits(formatUsd(low)))).toBeLessThanOrEqual(Number(digits(formatUsd(high))));
    })
  );
});
