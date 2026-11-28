// Mirrors `mutate` in config/stryker.config.json. Stryker 10 has no `--since`,
// so a pull request passes the changed files to `--mutate` instead.
export function isMutationTarget(path: string, patterns: readonly string[]): boolean {
  const included = patterns.some(
    (pattern) => !pattern.startsWith('!') && globToRegExp(pattern).test(path)
  );

  if (!included) return false;

  return !patterns.some(
    (pattern) => pattern.startsWith('!') && globToRegExp(pattern.slice(1)).test(path)
  );
}

function globToRegExp(pattern: string): RegExp {
  let source = '^';

  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];

    if (char === '*' && next === '*') {
      if (pattern[index + 2] === '/') {
        source += '(?:.*/)?';
        index += 2;
      } else {
        source += '.*';
        index += 1;
      }

      continue;
    }

    if (char === '*') {
      source += '[^/]*';
      continue;
    }

    if (char !== undefined && '.+^$()|[]{}\\'.includes(char)) {
      source += `\\${char}`;
      continue;
    }

    if (char !== undefined) source += char;
  }

  return new RegExp(`${source}$`);
}
