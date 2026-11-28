export const LINE_LIMIT = 500;
export const LAYER_LIMIT = 3;

const EXCLUDED = new Set(['src/shared/api/schema.d.ts', 'shared/openapi.json', 'bun.lock']);

const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] as const;

export type Blast = {
  readonly lines: number;
  readonly layers: readonly string[];
};

export function blastFromDiff(diff: string): Blast {
  let lines = 0;
  let file = '';
  const seen = new Set<string>();

  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/') || line.startsWith('--- a/')) {
      const path = line.slice(6);

      if (line.startsWith('+++')) file = path;
      const layer = layerOf(path);

      if (layer !== undefined && !EXCLUDED.has(path)) seen.add(layer);
      continue;
    }

    if (EXCLUDED.has(file)) continue;

    if (isChange(line)) lines += 1;
  }

  return { lines, layers: LAYERS.filter((layer) => seen.has(layer)) };
}

export function blastWarning(blast: Blast): string | undefined {
  const wide = blast.lines > LINE_LIMIT;
  const deep = blast.layers.length > LAYER_LIMIT;

  if (!wide && !deep) return undefined;

  const parts: string[] = [];

  if (wide) parts.push(`${blast.lines} changed lines`);

  if (deep) parts.push(`${blast.layers.length} Feature-Sliced layers (${blast.layers.join(', ')})`);

  return `Blast radius: ${parts.join('; ')}.`;
}

function layerOf(path: string): string | undefined {
  return /^src\/(app|pages|widgets|features|entities|shared)\//.exec(path)?.[1];
}

function isChange(line: string): boolean {
  if (line.startsWith('+') && !line.startsWith('+++')) return true;

  return line.startsWith('-') && !line.startsWith('---');
}
