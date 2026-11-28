import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { formattablePath, shellDecision, writeDecision, type Decision } from './agent-policy';

const commandPayloadSchema = z.object({
  command: z.string().optional(),
  tool_input: z.object({ command: z.string().optional() }).optional(),
});

const pathPayloadSchema = z.object({
  path: z.string().optional(),
  file_path: z.string().optional(),
  uri: z.string().optional(),
  tool_input: z
    .object({
      path: z.string().optional(),
      file_path: z.string().optional(),
      target_file: z.string().optional(),
    })
    .optional(),
});

const mode = process.argv[2];
const raw = readFileSync(0, 'utf8');

dispatch(mode, raw);

function dispatch(kind: string | undefined, payload: string): void {
  if (kind === 'cursor-shell') {
    writeCursor(shellDecision(commandFrom(payload)));

    return;
  }

  if (kind === 'cursor-write') {
    writeCursor(writeDecision(pathFrom(payload)));

    return;
  }

  if (kind === 'cursor-format') {
    formatFile(pathFrom(payload));
    process.stdout.write('{}\n');

    return;
  }

  if (kind === 'claude-shell') {
    denyClaude(shellDecision(commandFrom(payload)));

    return;
  }

  if (kind === 'claude-write') {
    denyClaude(writeDecision(pathFrom(payload)));

    return;
  }

  if (kind === 'claude-format') {
    formatFile(pathFrom(payload));

    return;
  }

  process.stderr.write(
    'Usage: bun scripts/agent-guard.ts <cursor-shell|cursor-write|cursor-format|claude-shell|claude-write|claude-format>\n'
  );
  process.exit(1);
}

function commandFrom(payload: string): string {
  const parsed = commandPayloadSchema.parse(JSON.parse(payload.trim() === '' ? '{}' : payload));

  return parsed.command ?? parsed.tool_input?.command ?? '';
}

function pathFrom(payload: string): string {
  const parsed = pathPayloadSchema.parse(JSON.parse(payload.trim() === '' ? '{}' : payload));
  const nested = parsed.tool_input;

  return firstDefined([
    parsed.path,
    parsed.file_path,
    parsed.uri,
    nested?.path,
    nested?.file_path,
    nested?.target_file,
  ]);
}

function firstDefined(values: readonly (string | undefined)[]): string {
  for (const value of values) {
    if (value !== undefined) return value;
  }

  return '';
}

function writeCursor(decision: Decision): void {
  if (decision.allow) {
    process.stdout.write(`${JSON.stringify({ permission: 'allow' })}\n`);

    return;
  }

  process.stdout.write(
    `${JSON.stringify({
      permission: 'deny',
      user_message: decision.reason,
      agent_message: decision.reason,
    })}\n`
  );
}

function denyClaude(decision: Decision): void {
  if (decision.allow) return;
  process.stderr.write(`${decision.reason}\n`);
  process.exit(2);
}

function formatFile(path: string): void {
  const target = formattablePath(path);

  if (target === undefined) return;
  const bin = fileURLToPath(new URL('../node_modules/.bin/oxfmt', import.meta.url));

  try {
    execFileSync(bin, [target], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'oxfmt failed';
    process.stderr.write(`${message}\n`);
  }
}
