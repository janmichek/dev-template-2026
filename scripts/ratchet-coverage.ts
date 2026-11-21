import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

// Coverage floors only move up. `bun run coverage:ratchet` raises them to the
// measured values; CI runs --check-base on pull requests so a branch cannot
// lower a floor to get green.
const metricSchema = z.object({ pct: z.number() });

const summarySchema = z.object({
  total: z.object({
    lines: metricSchema,
    statements: metricSchema,
    functions: metricSchema,
    branches: metricSchema,
  }),
});

const floorsSchema = z.object({
  lines: z.number(),
  statements: z.number(),
  functions: z.number(),
  branches: z.number(),
});

type Floors = z.infer<typeof floorsSchema>;

const metrics: ReadonlyArray<keyof Floors> = ['lines', 'statements', 'functions', 'branches'];
const floorsUrl = new URL('../config/coverage-floors.json', import.meta.url);
const summaryUrl = new URL('../coverage/coverage-summary.json', import.meta.url);

const readFloors = (text: string): Floors => floorsSchema.parse(JSON.parse(text));
const baseRef = process.argv[2];

if (baseRef !== undefined) {
  const baseFile = `${baseRef}:config/coverage-floors.json`;

  try {
    execFileSync('git', ['cat-file', '-e', baseFile]);
  } catch {
    console.log(`No coverage floors on ${baseRef}; nothing to compare.`);
    process.exit(0);
  }

  const base = readFloors(execFileSync('git', ['show', baseFile], { encoding: 'utf8' }));
  const current = readFloors(readFileSync(floorsUrl, 'utf8'));
  const dropped = metrics.filter((metric) => current[metric] < base[metric]);

  if (dropped.length > 0) {
    for (const metric of dropped) {
      console.error(`${metric}: ${current[metric]}% is below ${base[metric]}% on ${baseRef}.`);
    }

    process.exit(1);
  }

  console.log(`Coverage floors are not below ${baseRef}.`);
  process.exit(0);
}

const summary = summarySchema.parse(JSON.parse(readFileSync(summaryUrl, 'utf8')));
const current = readFloors(readFileSync(floorsUrl, 'utf8'));
const next = { ...current };
let raised = false;

for (const metric of metrics) {
  const measured = Math.floor(summary.total[metric].pct * 100) / 100;

  if (measured > next[metric]) {
    console.log(`${metric}: ${next[metric]}% -> ${measured}%`);
    next[metric] = measured;
    raised = true;
  } else {
    console.log(`${metric}: measured ${measured}%, floor ${next[metric]}%`);
  }
}

if (!raised) {
  console.log('Floors already at or above measured coverage.');
  process.exit(0);
}

writeFileSync(floorsUrl, `${JSON.stringify(next, null, 2)}\n`);

console.log('Floors raised. Commit config/coverage-floors.json.');
