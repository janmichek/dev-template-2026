import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();

const DOC_ROOTS = ['AGENTS.md', '.cursor/rules', '.agents/skills', 'docs/agents'] as const;

const PREFIXES = [
  'src/',
  'server/',
  'shared/',
  'config/',
  'docs/',
  'scripts/',
  '.cursor/',
  '.agents/',
  '.claude/',
  '.githooks/',
  '.github/',
] as const;

export type AgentDocument = {
  readonly path: string;
  readonly text: string;
};

export function agentDocuments(): AgentDocument[] {
  const documents: AgentDocument[] = [];

  for (const root of DOC_ROOTS) collectDocs(join(repoRoot, root), root, documents);

  return documents;
}

export function repoPathExists(path: string): boolean {
  return existsSync(join(repoRoot, path));
}

export function contextFindings(
  documents: readonly AgentDocument[],
  indexSource: string,
  exists: (path: string) => boolean
): string[] {
  const exported = exportedNames(indexSource);
  const found: string[] = [];

  for (const document of documents) {
    for (const path of missingPaths(backtickTokens(document.text), exists)) {
      found.push(`${document.path} points at missing ${path}`);
    }

    for (const name of missingFetchers(fetchTokens(document.text), exported)) {
      found.push(`${document.path} names ${name}, which src/shared/api/index.ts does not export`);
    }
  }

  return found;
}

export function backtickTokens(text: string): string[] {
  const tokens: string[] = [];

  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const token = match[1];

    if (token !== undefined) tokens.push(token);
  }

  return tokens;
}

export function repoPathToken(token: string): string | undefined {
  const relative = token.trim().replace(/^\.\//, '');

  if (/[*?<>\s]/.test(relative)) return undefined;
  const known = PREFIXES.some((prefix) => relative.startsWith(prefix));

  if (!known) return undefined;

  return relative;
}

export function missingPaths(
  tokens: readonly string[],
  exists: (path: string) => boolean
): string[] {
  const missing: string[] = [];

  for (const token of tokens) {
    const path = repoPathToken(token);

    if (path !== undefined && !exists(path)) missing.push(path);
  }

  return missing;
}

export function fetchTokens(text: string): string[] {
  const tokens: string[] = [];

  for (const match of text.matchAll(/\bfetch[A-Z][A-Za-z0-9]*/g)) {
    tokens.push(match[0]);
  }

  return tokens;
}

export function missingFetchers(
  tokens: readonly string[],
  exported: ReadonlySet<string>
): string[] {
  const missing: string[] = [];

  for (const token of tokens) {
    if (!exported.has(token)) missing.push(token);
  }

  return missing;
}

export function exportedNames(source: string): ReadonlySet<string> {
  const names = new Set<string>();

  for (const group of source.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
    const body = group[1];

    if (body === undefined) continue;

    for (const part of body.split(',')) {
      const pieces = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/);

      const name = pieces[pieces.length - 1]?.trim();

      if (name !== undefined && name !== '') names.add(name);
    }
  }

  for (const group of source.matchAll(
    /export\s+(?:async\s+)?(?:function|const|class|type|interface)\s+([A-Za-z0-9_]+)/g
  )) {
    const name = group[1];

    if (name !== undefined) names.add(name);
  }

  return names;
}

function collectDocs(absolute: string, relative: string, documents: AgentDocument[]): void {
  if (!existsSync(absolute)) return;
  const stat = statSync(absolute);

  if (stat.isFile()) {
    if (isDoc(relative)) documents.push({ path: relative, text: readFileSync(absolute, 'utf8') });

    return;
  }

  if (!stat.isDirectory()) return;

  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    collectDocs(join(absolute, entry.name), join(relative, entry.name), documents);
  }
}

function isDoc(path: string): boolean {
  return path.endsWith('.md') || path.endsWith('.mdc');
}
