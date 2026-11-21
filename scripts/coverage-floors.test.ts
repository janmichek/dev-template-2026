import { describe, expect, test } from 'vitest';
import {
  droppedFloors,
  floorsSchema,
  measuredFloors,
  raiseFloors,
  summarySchema,
  type Floors,
} from './coverage-floors';

function floors(values: Partial<Floors>): Floors {
  return floorsSchema.parse({
    lines: 0,
    statements: 0,
    functions: 0,
    branches: 0,
    ...values,
  });
}

describe('measuredFloors', () => {
  test('rounds down to two decimals so a floor never overstates coverage', () => {
    const summary = summarySchema.parse({
      total: {
        lines: { pct: 70.2299 },
        statements: { pct: 74.9123 },
        functions: { pct: 75.5599 },
        branches: { pct: 56.97 },
      },
    });

    expect(measuredFloors(summary)).toEqual({
      lines: 70.22,
      statements: 74.91,
      functions: 75.55,
      branches: 56.97,
    });
  });
});

describe('droppedFloors', () => {
  test('reports every metric a branch lowered below the base', () => {
    const base = floors({ lines: 70.22, statements: 74.91, functions: 75.55, branches: 56.97 });
    const current = floors({ lines: 70.22, statements: 74.9, functions: 75.0, branches: 56.97 });

    expect(droppedFloors(current, base)).toEqual(['statements', 'functions']);
  });

  test('accepts equal or raised floors', () => {
    const base = floors({ lines: 70.22, statements: 74.91, functions: 75.55, branches: 56.97 });
    const current = floors({ lines: 71, statements: 74.91, functions: 80, branches: 56.97 });

    expect(droppedFloors(current, base)).toEqual([]);
  });

  test('treats a repository without floors on the base as nothing dropped', () => {
    expect(droppedFloors(floors({ lines: 70 }), floors({}))).toEqual([]);
  });
});

describe('raiseFloors', () => {
  test('raises only the metrics that measured higher', () => {
    const current = floors({ lines: 70.22, statements: 74.91, functions: 75.55, branches: 56.97 });
    const measured = floors({ lines: 72.5, statements: 74.91, functions: 75.55, branches: 60 });

    expect(raiseFloors(current, measured)).toEqual({
      lines: 72.5,
      statements: 74.91,
      functions: 75.55,
      branches: 60,
    });
  });

  test('never lowers a floor, even when coverage regressed', () => {
    const current = floors({ lines: 70.22, statements: 74.91, functions: 75.55, branches: 56.97 });
    const measured = floors({ lines: 60, statements: 60, functions: 60, branches: 50 });

    expect(raiseFloors(current, measured)).toEqual(current);
  });

  test('keeps a floor another run raised before this one writes', () => {
    const latest = floors({ lines: 75, statements: 74.91, functions: 75.55, branches: 56.97 });
    const measured = floors({ lines: 72, statements: 74.91, functions: 75.55, branches: 60 });

    expect(raiseFloors(latest, measured)).toEqual({
      lines: 75,
      statements: 74.91,
      functions: 75.55,
      branches: 60,
    });
  });
});
