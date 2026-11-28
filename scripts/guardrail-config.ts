import { z } from 'zod';
import { stripJsonComments } from './jsonc';
import type { TextPair } from './guardrail-types';

const severitySchema = z.enum(['error', 'warn', 'off']);

type Severity = z.infer<typeof severitySchema>;

const ruleSeveritySchema = z.preprocess((value) => {
  const direct = severitySchema.safeParse(value);

  if (direct.success) return direct.data;
  const listed = z.array(z.unknown()).safeParse(value);

  if (!listed.success) return value;
  const head = severitySchema.safeParse(listed.data[0]);

  if (head.success) return head.data;

  return value;
}, severitySchema);

const filesSchema = z.union([z.string(), z.array(z.string())]);

const overrideSchema = z.object({
  files: filesSchema.optional(),
  rules: z.record(z.string(), ruleSeveritySchema).optional(),
});

const oxlintSchema = z.object({
  rules: z.record(z.string(), ruleSeveritySchema).optional(),
  categories: z.record(z.string(), ruleSeveritySchema).optional(),
  overrides: z.array(overrideSchema).optional(),
});

const strykerSchema = z.object({
  thresholds: z.object({ break: z.number() }),
});

const tsconfigSchema = z.object({
  compilerOptions: z.object({
    strict: z.boolean().optional(),
    noUncheckedIndexedAccess: z.boolean().optional(),
    exactOptionalPropertyTypes: z.boolean().optional(),
    noImplicitOverride: z.boolean().optional(),
  }),
});

const REQUIRED_FLAGS = [
  'strict',
  'noUncheckedIndexedAccess',
  'exactOptionalPropertyTypes',
  'noImplicitOverride',
] as const;

type Flag = (typeof REQUIRED_FLAGS)[number];

type CompilerOptions = z.infer<typeof tsconfigSchema>['compilerOptions'];

type Override = z.infer<typeof overrideSchema>;

export function relaxedStryker(pair: TextPair): readonly string[] {
  if (pair.before === undefined) return [];

  if (pair.after === undefined) return ['stryker config removed'];
  const previous = strykerSchema.parse(JSON.parse(pair.before)).thresholds.break;
  const next = strykerSchema.parse(JSON.parse(pair.after)).thresholds.break;

  if (next < previous) return [`thresholds.break ${previous} -> ${next}`];

  return [];
}

export function relaxedTsconfig(pair: TextPair): readonly string[] {
  if (pair.before === undefined) return [];

  if (pair.after === undefined) return ['tsconfig removed'];
  const previous = tsconfigSchema.parse(JSON.parse(stripJsonComments(pair.before))).compilerOptions;
  const next = tsconfigSchema.parse(JSON.parse(stripJsonComments(pair.after))).compilerOptions;
  const found: string[] = [];

  for (const flag of REQUIRED_FLAGS) {
    if (flagEnabled(previous, flag) && !flagEnabled(next, flag))
      found.push(`${flag} no longer true`);
  }

  return found;
}

export function relaxedOxlint(pair: TextPair): readonly string[] {
  if (pair.before === undefined) return [];

  if (pair.after === undefined) return ['oxlint config removed'];
  const previous = oxlintSchema.parse(JSON.parse(stripJsonComments(pair.before)));
  const next = oxlintSchema.parse(JSON.parse(stripJsonComments(pair.after)));

  return [
    ...relaxedMap(ruleMap(previous.rules), ruleMap(next.rules), 'rule'),
    ...relaxedMap(ruleMap(previous.categories), ruleMap(next.categories), 'category'),
    ...relaxedOverrides(previous.overrides ?? [], next.overrides ?? []),
  ];
}

function flagEnabled(options: CompilerOptions, flag: Flag): boolean {
  switch (flag) {
    case 'strict':
      return options.strict === true;
    case 'noUncheckedIndexedAccess':
      return options.noUncheckedIndexedAccess === true;
    case 'exactOptionalPropertyTypes':
      return options.exactOptionalPropertyTypes === true;
    case 'noImplicitOverride':
      return options.noImplicitOverride === true;
    default: {
      const unexpected: never = flag;
      throw new Error(unexpected);
    }
  }
}

function rank(severity: Severity): number {
  if (severity === 'off') return 0;

  if (severity === 'warn') return 1;

  return 2;
}

function ruleMap(
  rules: Readonly<Record<string, Severity>> | undefined
): ReadonlyMap<string, Severity> {
  return new Map(Object.entries(rules ?? {}));
}

function relaxedMap(
  before: ReadonlyMap<string, Severity>,
  after: ReadonlyMap<string, Severity>,
  label: string
): string[] {
  const found: string[] = [];

  for (const [name, previous] of before) {
    const next = after.get(name);

    if (next === undefined) {
      found.push(`${label} ${name} removed`);
      continue;
    }

    if (rank(next) < rank(previous)) found.push(`${label} ${name} ${previous} -> ${next}`);
  }

  return found;
}

function relaxedOverrides(before: readonly Override[], after: readonly Override[]): string[] {
  const previous = overrideMap(before);
  const next = overrideMap(after);
  const found = relaxedMap(previous, next, 'override');

  for (const [key, severity] of next) {
    if (previous.has(key) || severity === 'error') continue;
    found.push(`override ${key} set to ${severity}`);
  }

  return found;
}

function overrideMap(overrides: readonly Override[]): ReadonlyMap<string, Severity> {
  const map = new Map<string, Severity>();

  for (const override of overrides) {
    const files = filesKey(override.files);

    for (const [name, severity] of ruleMap(override.rules)) {
      const key = `${files} :: ${name}`;
      const previous = map.get(key);

      if (previous === undefined || rank(severity) < rank(previous)) map.set(key, severity);
    }
  }

  return map;
}

function filesKey(files: z.infer<typeof filesSchema> | undefined): string {
  if (files === undefined) return '*';
  const many = z.array(z.string()).safeParse(files);

  if (many.success) return many.data.toSorted().join('|');

  return z.string().parse(files);
}
