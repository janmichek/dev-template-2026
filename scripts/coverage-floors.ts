import { z } from 'zod';

const metricSchema = z.object({ pct: z.number() });

export const summarySchema = z.object({
  total: z.object({
    lines: metricSchema,
    statements: metricSchema,
    functions: metricSchema,
    branches: metricSchema,
  }),
});

export const floorsSchema = z.object({
  lines: z.number(),
  statements: z.number(),
  functions: z.number(),
  branches: z.number(),
});

export type Floors = z.infer<typeof floorsSchema>;

export const metrics: ReadonlyArray<keyof Floors> = [
  'lines',
  'statements',
  'functions',
  'branches',
];

/** Two decimals, rounded down, so a floor never claims more than was measured. */
export function measuredFloors(summary: z.infer<typeof summarySchema>): Floors {
  const floors: Floors = { lines: 0, statements: 0, functions: 0, branches: 0 };

  for (const metric of metrics) {
    floors[metric] = Math.floor(summary.total[metric].pct * 100) / 100;
  }

  return floors;
}

/** Metrics where the branch floor sits below the base branch, so a weaker gate would ship. */
export function droppedFloors(current: Floors, base: Floors): (keyof Floors)[] {
  return metrics.filter((metric) => current[metric] < base[metric]);
}

/** Highest floor wins, so a concurrent ratchet cannot lose a floor another run raised. */
export function raiseFloors(current: Floors, measured: Floors): Floors {
  const next: Floors = { ...current };

  for (const metric of metrics) {
    if (measured[metric] > next[metric]) next[metric] = measured[metric];
  }

  return next;
}
