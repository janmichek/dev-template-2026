const SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/;

const POLICY_FILES = new Set([
  'scripts/guardrail-suppressions.ts',
  'scripts/guardrail-diff.test.ts',
]);

// The pattern names the suppressions it searches for. This file is excluded from the scan.
const SUPPRESSION =
  /oxlint-disable|eslint-disable|@ts-expect-error|@ts-ignore|@ts-nocheck|\b(?:test|it|describe)\.(?:skip|only)\b|\b(?:xit|xdescribe)\s*\(/;

export function addedSuppressions(diff: string): readonly string[] {
  const found: string[] = [];
  let file = '';

  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      file = line.slice('+++ b/'.length);
      continue;
    }

    if (!line.startsWith('+') || line.startsWith('+++')) continue;

    if (!SOURCE_FILE.test(file) || POLICY_FILES.has(file)) continue;

    if (!SUPPRESSION.test(line)) continue;
    found.push(`${file}: ${line.slice(1).trim()}`);
  }

  return found;
}
