## Finish line

Before calling a task complete, run `bun run validate`. It must pass. Fix the cause of a failure instead of weakening a gate: do not lower `config/coverage-floors.json`, add lint-disable directives, skip tests, or drop a deny from `.claude/settings.json` or `.cursor/hooks.json`. A pull request that does that fails `scripts/guardrail-diff.ts` unless it carries the `guardrail-change` label. Raise coverage floors with `bun run coverage:ratchet` after adding tests. For UI changes also run `bun run test:e2e`. Browser specs import `test/browser.ts`, which fails on a page error, a console error, or an axe violation.

## Architecture

Feature-Sliced Design, strict: `shared → entities → features → widgets → pages → app`. Imports go downward only. Import a slice only through its `index.ts`; cross-slice imports stay relative because the PR diagram parses them. `bun run fsd` fails on warnings.

Placement: reads live with the entity, user actions are features, a page owns state two widgets share and passes features in through slots (a widget never imports a feature). Layers and segments are mapped in `README.md`; the policy is `examples/app.policy.edn`; see `docs/adr/0001-strict-feature-sliced-design.md`.

## API contract

`shared/schemas.ts` is the contract. Change the Zod schema, run `bun run api:generate`, then call the API through `fetchCars` or `fetchMakes`. Never hand-edit `shared/openapi.json` or `src/shared/api/schema.d.ts`; `api:check` fails on drift.

## Tests and stories

Tests are colocated with the code (`*.test.ts(x)` next to the module). Stories live in `stories/` so they stay out of the architecture diagram. Mutation testing covers `model` and `lib`. UI changes need `bun run test:e2e`.

## UI experience

Every surface follows `docs/experience-patterns.md`: four states (empty, loading, partial, error), acknowledged actions, safe retries, actionable errors, undo for reversible actions, confirmation only for irreversible ones. Cite the pattern IDs in PR evidence.

## Commits and pull requests

Conventional Commits only; `.githooks/commit-msg` runs commitlint. Pre-commit runs gitleaks on staged content plus `bun run validate`. Fill every PR template field: diagram of the change, before/after evidence, merge danger and blast radius.

## Agent skills

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.

### Skill scope

Global skills (`~/.agents/skills`) are personal and invisible to the repo; project skills live in `.agents/skills/` and ship with it. `template-workflow` is the example.

Published skills install globally with `npx skills add <owner/repo> --skill <name> -g -y`, so they stay out of the repo; the CLI records them in `~/.agents/.skill-lock.json`. Use project scope only for a skill this repo must ship with — those are pinned in `skills-lock.json` and restored with `npx skills experimental_install`.

## Commands

Finish line: `bun run validate`. Day-to-day: `bun run test:unit`, `bun run test:e2e`, `bun run typecheck`, `bun run lint`, `bun run fsd`, `bun run api:check`. Full list in `README.md`.
