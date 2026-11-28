import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { relaxedOxlint, relaxedStryker, relaxedTsconfig } from './guardrail-config';
import { missingCommitMarkers, relaxedClaude, relaxedCursorHooks } from './guardrail-hooks';
import { guardrailFindings } from './guardrail-rules';
import { addedSuppressions } from './guardrail-suppressions';
import type { TextPair } from './guardrail-types';

const empty: TextPair = { before: undefined, after: undefined };

function pair(before: string, after: string): TextPair {
  return { before, after };
}

describe('addedSuppressions', () => {
  test('flags a new lint disable and a skipped test in source', () => {
    const diff = [
      '+++ b/src/app/App.tsx',
      '+// oxlint-disable-next-line typescript/no-explicit-any',
      '+test.skip("later", () => {});',
      '+++ b/scripts/guardrail-suppressions.ts',
      '+const pattern = /oxlint-disable/;',
    ].join('\n');

    expect(addedSuppressions(diff)).toEqual([
      'src/app/App.tsx: // oxlint-disable-next-line typescript/no-explicit-any',
      'src/app/App.tsx: test.skip("later", () => {});',
    ]);
  });

  test('ignores context lines and markdown', () => {
    const diff = [
      '+++ b/README.md',
      '+oxlint-disable',
      '+++ b/src/app/App.tsx',
      ' test.skip("kept")',
    ].join('\n');

    expect(addedSuppressions(diff)).toEqual([]);
  });
});

describe('config relaxation', () => {
  test('flags a lower mutation threshold and a dropped strict flag', () => {
    expect(
      relaxedStryker(pair('{"thresholds":{"break":80}}', '{"thresholds":{"break":70}}'))
    ).toEqual(['thresholds.break 80 -> 70']);

    expect(
      relaxedTsconfig(
        pair('{"compilerOptions":{"strict":true}}', '{"compilerOptions":{"strict":false}}')
      )
    ).toEqual(['strict no longer true']);
  });

  test('flags a rule turned off and a new override that turns a rule off', () => {
    const before = '{"rules":{"complexity":"error"},"overrides":[]}';

    const after =
      '{"rules":{"complexity":"off"},"overrides":[{"files":["src/**"],"rules":{"no-console":"warn"}}]}';

    expect(relaxedOxlint(pair(before, after))).toEqual([
      'rule complexity error -> off',
      'override src/** :: no-console set to warn',
    ]);
  });

  test('parses the checked-in configs without reporting a self-relaxation', () => {
    const stryker = readFileSync(join(process.cwd(), 'config/stryker.config.json'), 'utf8');
    const tsconfig = readFileSync(join(process.cwd(), 'config/tsconfig.base.json'), 'utf8');
    const oxlint = readFileSync(join(process.cwd(), 'config/oxlintrc.json'), 'utf8');

    expect(relaxedStryker(pair(stryker, stryker))).toEqual([]);
    expect(relaxedTsconfig(pair(tsconfig, tsconfig))).toEqual([]);
    expect(relaxedOxlint(pair(oxlint, oxlint))).toEqual([]);
  });
});

describe('hook relaxation', () => {
  test('flags a removed deny, a removed hook, and a pre-commit that drops gitleaks', () => {
    const before =
      '{"permissions":{"deny":["Bash(git push:*)"]},"hooks":{"PreToolUse":[{"hooks":[{"command":"bun scripts/agent-guard.ts claude-shell"}]}]}}';

    const after = '{"permissions":{"deny":[]},"hooks":{"PreToolUse":[{"hooks":[]}]}}';

    expect(relaxedClaude(pair(before, after))).toEqual([
      'permission deny removed: Bash(git push:*)',
      'PreToolUse hook removed: bun scripts/agent-guard.ts claude-shell',
    ]);

    expect(
      relaxedCursorHooks(
        pair(
          '{"hooks":{"beforeShellExecution":[{"command":".cursor/hooks/before-shell.sh","failClosed":true}]}}',
          '{"hooks":{"beforeShellExecution":[{"command":".cursor/hooks/before-shell.sh"}]}}'
        )
      )
    ).toEqual(['beforeShellExecution hook no longer fail-closed: .cursor/hooks/before-shell.sh']);

    expect(
      missingCommitMarkers(pair('gitleaks\nbun run validate\n', 'bun run validate\n'), empty)
    ).toEqual(['.githooks/pre-commit no longer runs gitleaks']);
  });
});

describe('guardrailFindings', () => {
  test('combines a suppression with a lowered threshold', () => {
    const findings = guardrailFindings({
      diff: '+++ b/src/app/App.tsx\n+it.only("focus")',
      stryker: pair('{"thresholds":{"break":80}}', '{"thresholds":{"break":10}}'),
      tsconfig: empty,
      oxlint: empty,
      claude: empty,
      cursorHooks: empty,
      preCommit: empty,
      commitMsg: empty,
    });

    expect(findings).toEqual(['src/app/App.tsx: it.only("focus")', 'thresholds.break 80 -> 10']);
  });
});
