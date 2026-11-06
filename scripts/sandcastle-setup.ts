// One-time GitHub setup for the Sandcastle workflow: labels and Actions secrets.
// Secret values come from .sandcastle/.env and go straight to `gh`; they are
// never printed.
//
//   bun run sandcastle:setup            labels + secrets
//   bun run sandcastle:setup -- labels  labels only
//   bun run sandcastle:setup -- secrets secrets only

import process from 'node:process';

const LABELS: [name: string, description: string, color: string][] = [
  ['Sandcastle', 'Queue this issue for the Sandcastle agent loop', '1d76db'],
  ['sandcastle-wip', 'Sandcastle picked this up', 'fbca04'],
  ['sandcastle-in-review', 'Sandcastle opened a PR for this', '0e8a16'],
  ['ready-for-agent', 'Approved: let the agent merge', '0e8a16'],
];

// .sandcastle/.env key -> Actions secret name
const SECRETS = {
  DEEPSEEK_API_KEY: 'DEEPSEEK_API_KEY',
  GH_TOKEN: 'SANDCASTLE_GH_TOKEN',
} satisfies Record<string, string>;

async function gh(args: string[], stdin?: string): Promise<boolean> {
  const proc = Bun.spawn(['gh', ...args], {
    stdin: stdin === undefined ? 'inherit' : new Blob([stdin]),
    stdout: 'ignore',
    stderr: 'inherit',
  });

  return (await proc.exited) === 0;
}

function parseEnv(text: string): Map<string, string> {
  const out = new Map<string, string>();

  for (const line of text.split('\n')) {
    const [, key, rawValue] = line.match(/^([A-Z0-9_]+)=(.*)$/) ?? [];

    if (key === undefined || rawValue === undefined) continue;
    out.set(key, rawValue.trim().replace(/^(['"])(.*)\1$/, '$2'));
  }

  return out;
}

async function labels(): Promise<void> {
  for (const [name, description, color] of LABELS) {
    const ok = await gh([
      'label',
      'create',
      name,
      '--description',
      description,
      '--color',
      color,
      '--force',
    ]);

    console.log(`${ok ? '✓' : '✗'} label ${name}`);
  }
}

async function secrets(): Promise<void> {
  const file = Bun.file('.sandcastle/.env');

  if (!(await file.exists())) {
    throw new Error('Missing .sandcastle/.env. Fill DEEPSEEK_API_KEY and GH_TOKEN first.');
  }

  const env = parseEnv(await file.text());

  for (const [key, secret] of Object.entries(SECRETS)) {
    const value = env.get(key);

    if (!value) {
      console.log(`- skipped ${secret}: ${key} is blank in .sandcastle/.env`);
      continue;
    }

    const ok = await gh(['secret', 'set', secret], value);
    console.log(`${ok ? '✓' : '✗'} secret ${secret}`);
  }
}

const what = process.argv[2];

if (what !== 'secrets') await labels();

if (what !== 'labels') await secrets();
