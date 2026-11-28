export type Decision =
  | { readonly allow: true }
  | { readonly allow: false; readonly reason: string };

const GENERATED = ['shared/openapi.json', 'src/shared/api/schema.d.ts'] as const;

const FORMATTABLE = /\.(?:tsx?|jsx?|mjs|cjs|json|md|css)$/;

export function shellDecision(command: string): Decision {
  for (const segment of shellSegments(command)) {
    const reason = blockedGit(segment);

    if (reason !== undefined) return { allow: false, reason };
  }

  return { allow: true };
}

export function writeDecision(path: string): Decision {
  const normalized = normalizePath(path);

  for (const file of GENERATED) {
    if (normalized === file || normalized.endsWith(`/${file}`)) {
      return {
        allow: false,
        reason: `${file} is generated. Edit shared/schemas.ts and run bun run api:generate.`,
      };
    }
  }

  return { allow: true };
}

export function formattablePath(path: string): string | undefined {
  const normalized = normalizePath(path);

  if (!FORMATTABLE.test(normalized) || !writeDecision(normalized).allow) return undefined;

  return normalized;
}

export function shellSegments(command: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | undefined;

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index];

    if (char === undefined) continue;

    const quoted = consumeQuote(quote, char);

    if (quoted.consumed) {
      quote = quoted.quote;
      current += char;
      continue;
    }

    const operator = quote === undefined ? operatorLength(command, index) : 0;

    if (operator > 0) {
      parts.push(current);
      current = '';
      index += operator - 1;
      continue;
    }

    current += char;
  }

  parts.push(current);

  return trimmedParts(parts);
}

type QuoteStep = {
  readonly quote: '"' | "'" | undefined;
  readonly consumed: boolean;
};

function consumeQuote(quote: '"' | "'" | undefined, char: string): QuoteStep {
  if (quote === undefined && char === '"') return { quote: '"', consumed: true };

  if (quote === undefined && char === "'") return { quote: "'", consumed: true };

  if (quote !== undefined && char === quote) return { quote: undefined, consumed: true };

  return { quote, consumed: false };
}

function trimmedParts(parts: readonly string[]): string[] {
  const segments: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();

    if (trimmed !== '') segments.push(trimmed);
  }

  return segments;
}

const BLOCKED_GIT: readonly {
  readonly subcommand: string;
  readonly pattern: RegExp | null;
  readonly reason: string;
}[] = [
  { subcommand: 'push', pattern: null, reason: 'git push is not allowed for the agent' },
  { subcommand: 'clean', pattern: null, reason: 'git clean is not allowed for the agent' },
  {
    subcommand: 'reset',
    pattern: /\s--hard\b/,
    reason: 'git reset --hard is not allowed for the agent',
  },
  { subcommand: 'branch', pattern: /\s-D\b/, reason: 'git branch -D is not allowed for the agent' },
  {
    subcommand: 'commit',
    pattern: /--no-verify\b/,
    reason: 'git commit --no-verify is not allowed for the agent',
  },
  {
    subcommand: 'commit',
    pattern: /--no-gpg-sign\b/,
    reason: 'git commit --no-gpg-sign is not allowed for the agent',
  },
];

function blockedGit(segment: string): string | undefined {
  const subcommand = gitSubcommand(segment);

  for (const rule of BLOCKED_GIT) {
    if (subcommand !== rule.subcommand) continue;

    if (rule.pattern !== null && !rule.pattern.test(segment)) continue;

    return rule.reason;
  }

  return undefined;
}

const GIT_SUBCOMMAND = /(?:^|\s)git(?:\s+-[Cc]\s+\S+)*\s+(\S+)/;

function gitSubcommand(segment: string): string | undefined {
  return GIT_SUBCOMMAND.exec(segment.trim())?.[1];
}

function operatorLength(command: string, index: number): number {
  const slice = command.slice(index, index + 2);

  if (slice === '&&' || slice === '||') return 2;
  const char = command[index];

  if (char === ';' || char === '|' || char === '\n') return 1;

  return 0;
}

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/').replace(/^\.\//, '');
}
