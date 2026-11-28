import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import './link-typescript5.ts';
import { isMutationTarget } from './mutation-targets';

const baseRef = process.argv[2];

if (baseRef === undefined) {
  console.error('Usage: bun scripts/mutate-since.ts <base-ref>');
  process.exit(1);
}

const patterns = z
  .object({ mutate: z.array(z.string()) })
  .parse(
    JSON.parse(readFileSync(new URL('../config/stryker.config.json', import.meta.url), 'utf8'))
  ).mutate;

const changed = execFileSync(
  'git',
  ['diff', '--name-only', '--diff-filter=ACMR', `${baseRef}...HEAD`],
  { encoding: 'utf8' }
)
  .split('\n')
  .filter((path) => path !== '' && isMutationTarget(path, patterns));

if (changed.length === 0) {
  console.log(`No mutation targets changed since ${baseRef}.`);
  process.exit(0);
}

console.log(`Mutating:\n${changed.join('\n')}`);

const stryker = fileURLToPath(new URL('../node_modules/.bin/stryker', import.meta.url));

execFileSync(
  stryker,
  ['run', 'config/stryker.config.json', '--mutate', changed.join(','), '--allowEmpty'],
  { stdio: 'inherit' }
);
