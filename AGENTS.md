## Finish line

Before calling a task complete, run `bun run validate`. It must pass. Fix the cause of a failure instead of weakening a gate: do not lower `config/coverage-floors.json`, add lint-disable directives, or skip tests. Raise coverage floors with `bun run coverage:ratchet` after adding tests. For UI changes also run `bun run test:e2e`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `janmichek/dev-template-2026`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.

### Skill scope

Global skills (`~/.agents/skills`) are personal and invisible to the repo; project skills live in `.agents/skills/` and ship with it. `template-workflow` is the example.

To add a published skill at project scope, run `npx skills add <owner/repo> --skill <name> -y` (no `-g`), then link it into `.claude/skills/` and `.cursor/skills/`.

## Commands

Finish line: `bun run validate`. Day-to-day: `bun run test:unit`, `bun run test:e2e`, `bun run typecheck`, `bun run lint`, `bun run fsd`, `bun run api:check`. Full list in `README.md`.
