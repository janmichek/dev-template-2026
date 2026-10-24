import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

// Builds the Vercel Build Output API tree directly. The API is one edge
// function; the Vite build is served as static files with an SPA fallback.
const output = '.vercel/output';
const fn = `${output}/functions/api.func`;

await rm(output, { recursive: true, force: true });
await mkdir(fn, { recursive: true });

await build({
  entryPoints: ['api/index.ts'],
  outfile: `${fn}/index.js`,
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  minify: true,
  logLevel: 'info',
});

await writeFile(
  `${fn}/.vc-config.json`,
  `${JSON.stringify({ runtime: 'edge', entrypoint: 'index.js' }, null, 2)}\n`
);

await cp('build', `${output}/static`, { recursive: true });

await writeFile(
  `${output}/config.json`,
  `${JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '/api/(.*)', dest: '/api' },
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2
  )}\n`
);
