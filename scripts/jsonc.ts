type JsoncMode = 'code' | 'line' | 'block' | 'string';

type JsoncStep = {
  readonly mode: JsoncMode;
  readonly index: number;
  readonly emit: readonly string[];
};

// Oxlint and tsconfig are JSON with comments. Callers parse the stripped text with Zod.
export function stripJsonComments(text: string): string {
  const out: string[] = [];
  let mode: JsoncMode = 'code';

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === undefined) continue;
    const step = advanceJsonc(mode, char, text[index + 1], index);
    mode = step.mode;
    index = step.index;

    for (const piece of step.emit) out.push(piece);
  }

  return out.join('').replace(/,\s*([}\]])/g, '$1');
}

function advanceJsonc(
  mode: JsoncMode,
  char: string,
  next: string | undefined,
  index: number
): JsoncStep {
  if (mode === 'line') return stepLine(char, index);

  if (mode === 'block') return stepBlock(char, next, index);

  if (mode === 'string') return stepString(char, next, index);

  return stepCode(char, next, index);
}

function stepLine(char: string, index: number): JsoncStep {
  if (char === '\n') return { mode: 'code', index, emit: ['\n'] };

  return { mode: 'line', index, emit: [] };
}

function stepBlock(char: string, next: string | undefined, index: number): JsoncStep {
  if (char === '*' && next === '/') return { mode: 'code', index: index + 1, emit: [] };

  return { mode: 'block', index, emit: [] };
}

function stepString(char: string, next: string | undefined, index: number): JsoncStep {
  if (char === '\\' && next !== undefined) {
    return { mode: 'string', index: index + 1, emit: [char, next] };
  }

  if (char === '"') return { mode: 'code', index, emit: [char] };

  return { mode: 'string', index, emit: [char] };
}

function stepCode(char: string, next: string | undefined, index: number): JsoncStep {
  if (char === '"') return { mode: 'string', index, emit: [char] };

  if (char === '/' && next === '/') return { mode: 'line', index: index + 1, emit: [] };

  if (char === '/' && next === '*') return { mode: 'block', index: index + 1, emit: [] };

  return { mode: 'code', index, emit: [char] };
}
