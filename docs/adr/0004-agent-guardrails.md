# Agent guardrails

The static gate already ran at commit time. An agent could still land a green pull request by adding a used lint disable, turning a rule off, or following a stale instruction such as a fetcher that does not exist. Prose in `AGENTS.md` does not stop that.

Four checks now fail closed:

- `scripts/guardrail-diff.ts` compares a pull request with its base. A new suppression, a lowered Stryker break threshold, a TypeScript strict flag turned off, an Oxlint rule or category relaxed, a removed Claude deny, or a hook that stops failing closed all fail the job. The `guardrail-change` label is the only bypass. Ordinary edits to `config/` stay allowed: the check looks for a relaxation, not for a touch.
- `.cursor/hooks.json` and the hooks in `.claude/settings.json` call `scripts/agent-guard.ts`. The agent cannot `git push`, `git reset --hard`, `git clean`, `git branch -D`, or commit with `--no-verify` or `--no-gpg-sign`, and cannot write `shared/openapi.json` or `src/shared/api/schema.d.ts`. A TypeScript edit is formatted with the local oxfmt binary.
- `bun run agent:context` fails when a backtick path in the agent docs does not exist, or a `fetch*` name in those docs is not exported from `src/shared/api/index.ts`.
- Playwright specs import `test/browser.ts`. A page error, a console error, or an axe-core violation fails the spec.

Stryker 10 has no `--since`. Pull requests run `scripts/mutate-since.ts`, which passes changed mutation targets to `--mutate`. Pushes to `main` still mutate the whole set in `config/stryker.config.json`: model, lib, the API client, the server handlers, and the shared contract.

`scripts/pr-blast-radius.ts` prints a warning above 500 non-generated lines or three Feature-Sliced layers. It does not fail the job. `.github/CODEOWNERS` asks for review on the gate directories.
