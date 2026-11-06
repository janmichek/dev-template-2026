// The git-hosted sandcastle fork ships no dist/ (its prepare script only runs
// husky), and installs pack git dependencies from `files` (dist only), so
// node_modules/@ai-hero/sandcastle has no source to build. Fetch the exact
// commit locked in bun.lock, build it, and copy dist/ into node_modules.
//
// Run after every `bun install`: bun run sandcastle:build

import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REPO = 'janmichek/sandcastle';
const target = 'node_modules/@ai-hero/sandcastle';

const lock = await Bun.file('bun.lock').text();
const sha = lock.match(/@ai-hero\/sandcastle@github:[^#"]+#([0-9a-f]{7,40})/)?.[1];

if (!sha) {
  throw new Error(
    'No @ai-hero/sandcastle git dependency in bun.lock. Run: bun add -d github:janmichek/sandcastle'
  );
}

if (await Bun.file(`${target}/dist/main.js`).exists()) {
  const built = await Bun.file(`${target}/dist/.built-sha`)
    .text()
    .catch(() => '');

  if (built.trim() === sha) {
    console.log(`sandcastle ${sha.slice(0, 7)} already built`);
    process.exit(0);
  }
}

async function run(cmd: string[], cwd?: string): Promise<void> {
  const proc = Bun.spawn(
    cmd,
    cwd === undefined
      ? { stdout: 'inherit', stderr: 'inherit' }
      : { cwd, stdout: 'inherit', stderr: 'inherit' }
  );

  if ((await proc.exited) !== 0) throw new Error(`failed: ${cmd.join(' ')}`);
}

const work = await mkdtemp(join(tmpdir(), 'sandcastle-'));

try {
  console.log(`fetching ${REPO}@${sha.slice(0, 7)}`);
  const res = await fetch(`https://codeload.github.com/${REPO}/tar.gz/${sha}`);

  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  await Bun.write(join(work, 'src.tar.gz'), res);

  const src = join(work, 'src');
  await run(['mkdir', src]);
  await run(['tar', '-xzf', join(work, 'src.tar.gz'), '-C', src, '--strip-components=1']);
  await run(['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'], src);
  await run(['npm', 'run', 'build'], src);

  await rm(`${target}/dist`, { recursive: true, force: true });
  await cp(join(src, 'dist'), `${target}/dist`, { recursive: true });
  await Bun.write(`${target}/dist/.built-sha`, sha);
  console.log(`sandcastle ${sha.slice(0, 7)} built into ${target}/dist`);
} finally {
  await rm(work, { recursive: true, force: true });
}
