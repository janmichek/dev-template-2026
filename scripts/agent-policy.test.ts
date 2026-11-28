import { describe, expect, test } from 'vitest';
import { formattablePath, shellDecision, shellSegments, writeDecision } from './agent-policy';

describe('shellDecision', () => {
  test('blocks hook bypasses and destructive git, and allows an ordinary commit', () => {
    expect(shellDecision('git commit --no-verify -m "x"').allow).toBe(false);
    expect(shellDecision('git commit --no-gpg-sign -m "x"').allow).toBe(false);
    expect(shellDecision('git push --force origin main').allow).toBe(false);
    expect(shellDecision('git reset --hard HEAD').allow).toBe(false);
    expect(shellDecision('git clean -fd').allow).toBe(false);
    expect(shellDecision('git branch -D stale').allow).toBe(false);
    expect(shellDecision('git commit -m "feat: add a gate"').allow).toBe(true);
    expect(shellDecision('git status').allow).toBe(true);
  });

  test('keeps a quoted operator inside one segment', () => {
    expect(shellSegments('git commit -m "a && b"')).toEqual(['git commit -m "a && b"']);
    expect(shellDecision('git status && git push').allow).toBe(false);
  });
});

describe('writeDecision', () => {
  test('blocks generated contract files and still formats handwritten sources', () => {
    expect(writeDecision('/repo/shared/openapi.json').allow).toBe(false);
    expect(writeDecision('src/shared/api/schema.d.ts').allow).toBe(false);
    expect(writeDecision('src/shared/api/client.ts').allow).toBe(true);
    expect(formattablePath('src/app/App.tsx')).toBe('src/app/App.tsx');
    expect(formattablePath('src/shared/api/schema.d.ts')).toBeUndefined();
    expect(formattablePath('.cursor/hooks/before-shell.sh')).toBeUndefined();
  });
});
