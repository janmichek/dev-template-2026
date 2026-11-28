import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  agentDocuments,
  contextFindings,
  exportedNames,
  missingFetchers,
  missingPaths,
  repoPathExists,
} from './agent-context';

const repoRoot = process.cwd();

describe('contextFindings', () => {
  test('reports a missing path and a fetcher the client does not export', () => {
    const documents = [
      {
        path: 'AGENTS.md',
        text: 'See `src/missing/file.ts` and call fetchCountries from `src/shared/api/client.ts`.',
      },
    ];

    expect(
      contextFindings(documents, 'export { fetchCars, fetchMakes } from "./client";', () => false)
    ).toEqual([
      'AGENTS.md points at missing src/missing/file.ts',
      'AGENTS.md points at missing src/shared/api/client.ts',
      'AGENTS.md names fetchCountries, which src/shared/api/index.ts does not export',
    ]);
    expect(missingPaths(['src/**/model'], () => false)).toEqual([]);
    expect(
      missingFetchers(['fetchCars'], exportedNames('export { fetchCars } from "./client";'))
    ).toEqual([]);
  });

  test('the checked-in agent docs match this repo', () => {
    const indexSource = readFileSync(join(repoRoot, 'src/shared/api/index.ts'), 'utf8');
    expect(contextFindings(agentDocuments(), indexSource, repoPathExists)).toEqual([]);
  });
});
