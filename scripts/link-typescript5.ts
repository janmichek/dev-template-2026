import { lstatSync, mkdirSync, readlinkSync, rmSync, symlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// openapi-typescript and Stryker import the TypeScript 5 compiler API.
// This app uses TypeScript 7, whose package export is not that API.
const typescript5 = fileURLToPath(new URL('../node_modules/typescript5', import.meta.url));

const parents = [
  '../node_modules/openapi-typescript/node_modules',
  '../node_modules/@stryker-mutator/core/node_modules',
];

for (const parent of parents) {
  const directory = fileURLToPath(new URL(parent, import.meta.url));
  const link = fileURLToPath(new URL(`${parent}/typescript`, import.meta.url));
  mkdirSync(directory, { recursive: true });

  try {
    if (lstatSync(link).isSymbolicLink() && readlinkSync(link) === typescript5) continue;
    rmSync(link, { recursive: true, force: true });
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
  }

  symlinkSync(typescript5, link, 'dir');
}
