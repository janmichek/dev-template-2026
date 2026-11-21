## Finish line

Before calling a task complete, run `bun run validate`. It must pass. Fix the cause of a failure instead of weakening a gate: do not lower `config/coverage-floors.json`, add lint-disable directives, or skip tests. Raise coverage floors with `bun run coverage:ratchet` after adding tests. For UI changes also run `bun run test:e2e`.

## Architecture

Feature-Sliced Design, strict: `shared → entities → features → widgets → pages → app`. Imports go downward only. Import a slice only through its `index.ts`; cross-slice imports stay relative because the PR diagram parses them. `bun run fsd` fails on warnings.

Placement: reads live with the entity, user actions are features, a page owns state two widgets share and passes features in through slots (a widget never imports a feature). Layers and segments are mapped in `README.md`; the policy is `examples/app.policy.edn`; see `docs/adr/0001-strict-feature-sliced-design.md`.

## API contract

`shared/schemas.ts` is the contract. Change the Zod schema, run `bun run api:generate`, then call the API through `fetchCars` or `fetchMakes`. Never hand-edit `shared/openapi.json` or `src/shared/api/schema.d.ts`; `api:check` fails on drift.

## Tests and stories

Tests are colocated with the code (`*.test.ts(x)` next to the module). Stories live in `stories/` so they stay out of the architecture diagram. Mutation testing covers `model` and `lib`. UI changes need `bun run test:e2e`.

## Commits and pull requests

Conventional Commits only; `.githooks/commit-msg` runs commitlint. Pre-commit runs gitleaks on staged content plus `bun run validate`. Fill every PR template field: diagram of the change, before/after evidence, merge danger and blast radius.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `janmichek/dev-template-2026`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.

### Skill scope

Global skills (`~/.agents/skills`) are personal and invisible to the repo; project skills live in `.agents/skills/` and ship with it. `template-workflow` is the example.

To add a published skill at project scope, run `npx skills add <owner/repo> --skill <name> -y` (no `-g`), then link it into `.claude/skills/` and `.cursor/skills/`. The CLI pins the commit in `skills-lock.json`; restore with `npx skills experimental_install`.

## Commands

Finish line: `bun run validate`. Day-to-day: `bun run test:unit`, `bun run test:e2e`, `bun run typecheck`, `bun run lint`, `bun run fsd`, `bun run api:check`. Full list in `README.md`.
