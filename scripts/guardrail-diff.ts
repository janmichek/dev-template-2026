import { execFileSync } from 'node:child_process';
import { guardrailFindings, type GuardrailSnapshot, type TextPair } from './guardrail-rules';

const baseRef = process.argv[2];

if (process.env['GUARDRAIL_CHANGE'] === 'true') {
  console.log('guardrail-change label set; skipping the tamper diff.');
  process.exit(0);
}

if (baseRef === undefined) {
  console.error('Usage: bun scripts/guardrail-diff.ts <base-ref>');
  process.exit(1);
}

try {
  execFileSync('git', ['rev-parse', '--verify', '--quiet', baseRef], { stdio: 'ignore' });
} catch {
  console.error(`Cannot resolve ${baseRef}. Fetch it before running the tamper diff.`);
  process.exit(1);
}

const findings = guardrailFindings(snapshot(baseRef));

if (findings.length === 0) {
  console.log(`Gates were not weakened against ${baseRef}.`);
  process.exit(0);
}

for (const finding of findings) console.error(finding);

process.exit(1);

function snapshot(ref: string): GuardrailSnapshot {
  return {
    diff: git(['diff', '--unified=0', `${ref}...HEAD`]),
    stryker: pair(ref, 'config/stryker.config.json'),
    tsconfig: pair(ref, 'config/tsconfig.base.json'),
    oxlint: pair(ref, 'config/oxlintrc.json'),
    claude: pair(ref, '.claude/settings.json'),
    cursorHooks: pair(ref, '.cursor/hooks.json'),
    preCommit: pair(ref, '.githooks/pre-commit'),
    commitMsg: pair(ref, '.githooks/commit-msg'),
  };
}

function pair(ref: string, path: string): TextPair {
  return { before: show(ref, path), after: show('HEAD', path) };
}

function show(ref: string, path: string): string | undefined {
  try {
    return execFileSync('git', ['show', `${ref}:${path}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return undefined;
  }
}

function git(args: readonly string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' });
}
