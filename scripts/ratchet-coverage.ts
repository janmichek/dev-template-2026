import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  droppedFloors,
  floorsSchema,
  measuredFloors,
  metrics,
  raiseFloors,
  summarySchema,
  type Floors,
} from './coverage-floors';

// Coverage floors only move up. `bun run coverage:ratchet` raises them to the
// measured values; CI passes the base branch so a pull request cannot lower a
// floor to get green.
const floorsUrl = new URL('../config/coverage-floors.json', import.meta.url);
const summaryUrl = new URL('../coverage/coverage-summary.json', import.meta.url);

const readFloors = (text: string): Floors => floorsSchema.parse(JSON.parse(text));
const baseRef = process.argv[2];

if (baseRef !== undefined) {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', baseRef]);
  } catch {
    console.error(
      `Cannot resolve ${baseRef}. Fetch it first, e.g. ` +
        `git fetch origin "${baseRef.replace(/^origin\//, '')}:refs/remotes/${baseRef}".`
    );
    process.exit(1);
  }

  const baseFile = `${baseRef}:config/coverage-floors.json`;

  try {
    execFileSync('git', ['cat-file', '-e', baseFile]);
  } catch {
    console.log(`No coverage floors on ${baseRef}; nothing to compare.`);
    process.exit(0);
  }

  const base = readFloors(execFileSync('git', ['show', baseFile], { encoding: 'utf8' }));
  const current = readFloors(readFileSync(floorsUrl, 'utf8'));
  const dropped = droppedFloors(current, base);

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
const measured = measuredFloors(summary);

// Read the floors only now: another ratchet run may have raised one meanwhile,
// and the highest value has to survive.
const latest = readFloors(readFileSync(floorsUrl, 'utf8'));
const next = raiseFloors(latest, measured);
let raised = false;

for (const metric of metrics) {
  if (next[metric] > latest[metric]) {
    console.log(`${metric}: ${latest[metric]}% -> ${next[metric]}%`);
    raised = true;
  } else {
    console.log(`${metric}: measured ${measured[metric]}%, floor ${latest[metric]}%`);
  }
}

if (!raised) {
  console.log('Floors already at or above measured coverage.');
  process.exit(0);
}

writeFileSync(floorsUrl, `${JSON.stringify(next, null, 2)}\n`);

console.log('Floors raised. Commit config/coverage-floors.json.');
