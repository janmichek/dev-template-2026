import type { ClassIR, Doc, EdgeIR } from './model';

// Rank 0 is the top layer. `levels` in the diagram file wins; anything it does not
// list falls back to longest-path depth over its own imports.
function listedRanks(doc: Doc): Map<string, number> {
  const result = new Map<string, number>();
  doc.levels.forEach((group, index) => {
    group.forEach((segment) => result.set(segment, index));
  });

  return result;
}

function topoRanks(classes: ClassIR[], edges: EdgeIR[]): Map<string, number> {
  const ids = new Set(classes.flatMap((item) => (item.foreign ? [] : [item.id])));
  const outgoing = new Map<string, Set<string>>();
  edges.forEach((edge) => {
    if (!ids.has(edge.from) || !ids.has(edge.to)) return;
    const deps = outgoing.get(edge.from) ?? new Set<string>();
    deps.add(edge.to);
    outgoing.set(edge.from, deps);
  });

  const rank = (id: string, seen: Set<string>): number => {
    if (seen.has(id)) return 0;
    const deps = outgoing.get(id);

    if (!deps || deps.size === 0) return 0;
    const next = new Set(seen).add(id);

    return 1 + Math.max(...[...deps].map((dep) => rank(dep, next)));
  };

  return new Map([...ids].map((id) => [id, rank(id, new Set())]));
}

export function ranks(levelDoc: Doc, classes: ClassIR[], edges: EdgeIR[]): Map<string, number> {
  const listed = listedRanks(levelDoc);
  const topo = topoRanks(classes, edges);
  const result = new Map<string, number>();
  classes
    .filter((item) => !item.foreign)
    .forEach((item) => {
      const segment = item.id.split('.')[0] ?? item.id;
      result.set(item.id, listed.get(segment) ?? topo.get(item.id) ?? 0);
    });

  return result;
}
