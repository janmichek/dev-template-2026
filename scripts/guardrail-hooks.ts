import { z } from 'zod';
import { stripJsonComments } from './jsonc';
import type { TextPair } from './guardrail-types';

const hookCommandSchema = z.object({
  command: z.string().optional(),
  failClosed: z.boolean().optional(),
});

const hookGroupSchema = z.object({
  hooks: z.array(hookCommandSchema).optional(),
});

const claudeSchema = z.object({
  permissions: z.object({ deny: z.array(z.string()).optional() }).optional(),
  hooks: z.record(z.string(), z.array(hookGroupSchema)).optional(),
});

const cursorHooksSchema = z.object({
  hooks: z.record(z.string(), z.array(hookCommandSchema)),
});

const PRE_COMMIT_MARKERS = ['gitleaks', 'bun run validate'] as const;
const COMMIT_MSG_MARKERS = ['commitlint'] as const;

type HookFact = {
  readonly event: string;
  readonly command: string;
  readonly failClosed: boolean;
};

type HookGroups = Readonly<Record<string, readonly z.infer<typeof hookGroupSchema>[]>>;

export function relaxedClaude(pair: TextPair): readonly string[] {
  if (pair.before === undefined) return [];

  if (pair.after === undefined) return ['claude settings removed'];
  const previous = claudeFacts(pair.before);
  const next = claudeFacts(pair.after);

  return [
    ...removedDenies(previous.denies, next.denies),
    ...removedHooks(previous.hooks, next.hooks),
  ];
}

export function relaxedCursorHooks(pair: TextPair): readonly string[] {
  if (pair.before === undefined) return [];

  if (pair.after === undefined) return ['cursor hooks removed'];

  return removedHooks(cursorFacts(pair.before), cursorFacts(pair.after));
}

export function missingCommitMarkers(preCommit: TextPair, commitMsg: TextPair): readonly string[] {
  return [
    ...missingMarkers(preCommit, PRE_COMMIT_MARKERS, '.githooks/pre-commit'),
    ...missingMarkers(commitMsg, COMMIT_MSG_MARKERS, '.githooks/commit-msg'),
  ];
}

type ClaudeFacts = {
  readonly denies: readonly string[];
  readonly hooks: readonly HookFact[];
};

function claudeFacts(text: string): ClaudeFacts {
  const parsed = claudeSchema.parse(JSON.parse(stripJsonComments(text)));

  return {
    denies: parsed.permissions?.deny ?? [],
    hooks: hookFacts(parsed.hooks ?? {}),
  };
}

function cursorFacts(text: string): readonly HookFact[] {
  const parsed = cursorHooksSchema.parse(JSON.parse(stripJsonComments(text)));
  const facts: HookFact[] = [];

  for (const [event, hooks] of Object.entries(parsed.hooks)) {
    for (const fact of factsFromHooks(event, hooks)) facts.push(fact);
  }

  return facts;
}

function hookFacts(groups: HookGroups): HookFact[] {
  const facts: HookFact[] = [];

  for (const [event, hooks] of Object.entries(groups)) {
    for (const group of hooks) {
      for (const fact of factsFromHooks(event, group.hooks ?? [])) facts.push(fact);
    }
  }

  return facts;
}

type HookCommand = z.infer<typeof hookCommandSchema>;

function factsFromHooks(event: string, hooks: readonly HookCommand[]): HookFact[] {
  const facts: HookFact[] = [];

  for (const hook of hooks) {
    if (hook.command === undefined) continue;
    facts.push({ event, command: hook.command, failClosed: hook.failClosed === true });
  }

  return facts;
}

function removedDenies(before: readonly string[], after: readonly string[]): string[] {
  const next = new Set(after);
  const found: string[] = [];

  for (const entry of before) {
    if (!next.has(entry)) found.push(`permission deny removed: ${entry}`);
  }

  return found;
}

function removedHooks(before: readonly HookFact[], after: readonly HookFact[]): string[] {
  const found: string[] = [];

  for (const hook of before) {
    const match = after.find((item) => item.event === hook.event && item.command === hook.command);

    if (match === undefined) {
      found.push(`${hook.event} hook removed: ${hook.command}`);
      continue;
    }

    if (hook.failClosed && !match.failClosed) {
      found.push(`${hook.event} hook no longer fail-closed: ${hook.command}`);
    }
  }

  return found;
}

function missingMarkers(pair: TextPair, markers: readonly string[], label: string): string[] {
  const before = pair.before;

  if (before === undefined) return [];
  const after = pair.after ?? '';
  const found: string[] = [];

  for (const marker of markers) {
    if (before.includes(marker) && !after.includes(marker))
      found.push(`${label} no longer runs ${marker}`);
  }

  return found;
}
