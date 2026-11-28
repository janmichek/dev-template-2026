import { relaxedOxlint, relaxedStryker, relaxedTsconfig } from './guardrail-config';
import { missingCommitMarkers, relaxedClaude, relaxedCursorHooks } from './guardrail-hooks';
import { addedSuppressions } from './guardrail-suppressions';
import type { GuardrailSnapshot } from './guardrail-types';

export type { GuardrailSnapshot, TextPair } from './guardrail-types';

export function guardrailFindings(snapshot: GuardrailSnapshot): readonly string[] {
  return [
    ...addedSuppressions(snapshot.diff),
    ...safely('stryker', () => relaxedStryker(snapshot.stryker)),
    ...safely('tsconfig', () => relaxedTsconfig(snapshot.tsconfig)),
    ...safely('oxlint', () => relaxedOxlint(snapshot.oxlint)),
    ...safely('claude', () => relaxedClaude(snapshot.claude)),
    ...safely('cursor hooks', () => relaxedCursorHooks(snapshot.cursorHooks)),
    ...missingCommitMarkers(snapshot.preCommit, snapshot.commitMsg),
  ];
}

function safely(label: string, run: () => readonly string[]): readonly string[] {
  try {
    return run();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'parse failed';

    return [`${label}: ${message}`];
  }
}
