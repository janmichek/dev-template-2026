import { execFileSync } from 'node:child_process';
import { blastFromDiff, blastWarning } from './blast-radius';

const baseRef = process.argv[2];

if (baseRef === undefined) {
  console.error('Usage: bun scripts/pr-blast-radius.ts <base-ref>');
  process.exit(1);
}

const diff = execFileSync('git', ['diff', '--unified=0', baseRef, 'HEAD'], {
  encoding: 'utf8',
});

const blast = blastFromDiff(diff);
const layers = blast.layers.length === 0 ? 'none' : blast.layers.join(', ');

console.log(`Changed lines: ${blast.lines}`);

console.log(`Layers: ${layers}`);

const warning = blastWarning(blast);

if (warning !== undefined) console.log(`::warning::${warning}`);
