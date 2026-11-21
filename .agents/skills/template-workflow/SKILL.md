---
name: template-workflow
description: Use when changing behavior, fixing a bug, or adding a feature in dev-template-2026. Runs the repo's context, test-first, API-contract, typecheck, lint, and docs loop.
---

# Template workflow

This repo is a React + Hono template with Feature-Sliced Design and generated OpenAPI types.

## 1. Load context

- Read `AGENTS.md`, `GLOSSARY.md`, and any ADR in `docs/adr/` that touches the area.
- Use the vocabulary from `GLOSSARY.md` in issue titles, tests, and code.

## 2. Start with a failing test

- Unit behavior: add a Vitest case next to the code under test and run `bun run test:unit`.
- Browser behavior: add a Playwright spec under `src/pages/` and run `bun run test:e2e`.

## 3. Implement the smallest change

- Keep `src/` compliant with Feature-Sliced Design; verify with `bun run fsd`.
- API shapes come from `shared/schemas.ts` and the generated client. Never invent response fields or hand-edit `src/shared/api/schema.d.ts`.
- If the API schema changes, run `bun run api:generate`.

## 4. Verify

Quick loop:

```bash
bun run typecheck
bun run lint
```

Before calling the task complete, run the repo gate:

```bash
bun run validate
```

It runs the static gate, `api:check`, build, and coverage. For UI changes also run `bun run test:e2e`. Never weaken a gate: do not lower `config/coverage-floors.json`, add lint-disable directives, or skip tests.

## 5. Leave the trail

- Add an ADR in `docs/adr/` when a decision is hard to reverse.
- Update `docs/agents/*` when conventions change.
