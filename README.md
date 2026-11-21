# Dev template 2026

Strict Feature-Sliced React template. The sample product is a small car lot so every layer and segment has real code to hold: a stock summary, a car table, a make filter, and a reserve action.

Start non-trivial changes with the `template-workflow` skill in `.agents/skills/`.

## Start

You need [Bun](https://bun.sh) and Docker.

```sh
bun install
bun run dev
```

Open http://localhost:3001. One container serves the API and the UI.

Without Docker, run the API and the Vite dev server yourself:

```sh
bun server/index.ts
bun run start
```

The UI is http://localhost:3000 and proxies `/api` to port 3001.

`cp .env.example .env` is only for a Sentry DSN or a Chromatic token. The app runs without them.

## The lot (placeholder CRUD example)

| Page      | Route                   | What it shows                                                           |
| --------- | ----------------------- | ----------------------------------------------------------------------- |
| Dashboard | `/`                     | Make filter, status counts, stock value, the three newest cars          |
| Cars      | `/cars` and `/cars/:id` | Same filter and summary, the full table. The id in the URL opens a row. |

The make filter drives both the summary and the table on that page. Reserve holds an available car; the server keeps that in memory until it restarts.

## Architecture

Imports only go downward. Steiger's recommended rules are all on, including `insignificant-slice`, so a slice has to be used from more than one place.

```text
app        router, providers, shell
pages      one screen each: dashboard, cars
widgets    summary (counts + stock value), inventory (car table)
features   filter-make (pick a make), reserve-car (POST + cache refresh)
entities   car, make
shared     api client, lib helpers, ui kit
```

A slice is imported through its `index.ts`. Cross-slice imports are relative on purpose: the pull-request diagram reads relative imports and draws those arrows. `bun run fsd` fails the build on a warning.

Each segment shows up at least once:

| Segment | Where                                                      | Holds                                                    |
| ------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| `api`   | `shared/api`, `entities/*/api`, `features/reserve-car/api` | fetchers, queries, the reserve mutation                  |
| `model` | `entities/car/model`                                       | business rules (by make, counts, value); Stryker example |
| `lib`   | `shared/lib`                                               | domain-free helpers (`formatUsd`); Stryker example       |
| `ui`    | every slice                                                | components                                               |

Reads live with the entity (`useCars`, `useMakes`). A feature is a user action (`filter-make`, `reserve-car`). The page owns the make filter because two widgets read it, and hands `ReserveButton` to `Inventory` through its `action` slot, so the widget never imports a feature.

```text
src/
├── app/
├── pages/
│   ├── dashboard/
│   └── cars/
├── widgets/
│   ├── summary/
│   └── inventory/
├── features/
│   ├── filter-make/
│   └── reserve-car/
├── entities/
│   ├── car/
│   └── make/
└── shared/
    ├── api/
    ├── lib/
    └── ui/
```

`shared/schemas.ts` is the API contract. Change the Zod schema, run `bun run api:generate`, and call the API through `fetchCars`, `fetchMakes`, or `reserveCar`. Do not hand-edit `shared/openapi.json` or `src/shared/api/schema.d.ts`.

`server/data.ts` holds the sample records. The API parses them with the Zod schemas before they leave the server. The UI never imports that file.

Stories live in `stories/` so they stay out of the architecture diagram. Tests live next to the code.

## Scripts

```sh
bun run validate       # the agent finish line: static gate + api:check + build + coverage
bun run check:static   # typecheck, lint, fmt:check, fsd, dead-code, duplicates
bun run typecheck     # tsc --noEmit
bun run lint          # oxlint
bun run fmt           # oxfmt
bun run fsd           # steiger, strict recommended rules
bun run dead-code     # fallow: unused files, exports, dependencies
bun run duplicates    # fallow dupes, strict, fail on any clone
bun run api:generate  # openapi.json + schema.d.ts from Zod
bun run test:unit     # vitest
bun run test:coverage # vitest with coverage floors
bun run coverage:ratchet # raise coverage floors to the measured values
bun run test:e2e      # playwright
bun run test:mutate   # stryker on model/lib (stock, formatUsd examples)
bun run storybook     # :6006
```

Coverage floors live in `config/coverage-floors.json` and only move up. `bun run coverage:ratchet` raises them to the measured values, and CI runs `scripts/ratchet-coverage.ts origin/<base>` on pull requests so a branch cannot lower a floor to get green. The gate instruments `src`, `server`, `api`, and `shared`, so backend changes have to bring tests too. Commits follow Conventional Commits (commitlint); pre-commit runs gitleaks plus `bun run validate`.

Because two pull requests can each pass the floor check against an older base, a floor raised by one PR is only rechecked by the next if `main` requires branches to be up to date before merging (or a merge queue is enabled). Keep that branch protection on: otherwise a merge can restore a lower floor.

Tool configs live in `config/`. Root `tsconfig.json` and `steiger.config.ts` only point there, because the editor and Steiger look at the project root. `.oxfmtrc.json` stays at the root too: oxfmt `ignorePatterns` are rooted at the config file, so a config inside `config/` cannot ignore the rest of the repo.

Oxlint also loads a vendored plugin from `tools/oxlint/anti-slop` (rules from `dmmulroy/anti-slop`; see its `UPSTREAM.md` and `docs/adr/0003-vendored-anti-slop-lint-rules.md`). Lint, oxfmt, and fallow ignore that directory; a generated `src/shared/api/schema.d.ts` is skipped by lint too.

## Agent skills

`.agents/skills/` is the canonical skill tree. `template-workflow` is the example: it encodes the test-first delivery loop (context, failing test, implementation, verification, docs). Claude and Cursor reach it through symlinks in `.claude/skills/` and `.cursor/skills/`; opencode reads `.agents/skills/` via `opencode.jsonc`.

The Playwright MCP server is declared per client: `.mcp.json` (Claude), `.cursor/mcp.json`, and `opencode.jsonc`.

Create a skill as `.agents/skills/<name>/SKILL.md` with `name` and `description` frontmatter, then link it for the vendors that need it:

```sh
ln -s ../../.agents/skills/<name> .claude/skills/<name>
ln -s ../../.agents/skills/<name> .cursor/skills/<name>
```

Published skills install with `npx skills add <owner/repo> --skill <name> -y` at project scope. `AGENTS.md` is the always-on context and points at `docs/agents/`; domain words live in `GLOSSARY.md`; decisions live in `docs/adr/`.

### GitHub board

Issues are the tracker. The board is a GitHub Project grouped by status, with the same five states as the triage labels.

Create the labels once:

```sh
gh label create needs-triage --description "Maintainer needs to evaluate" --color "ededed"
gh label create needs-info --description "Waiting on the reporter" --color "d4c5f9"
gh label create ready-for-agent --description "Specified and ready for an agent" --color "0e8a16"
gh label create ready-for-human --description "Needs a person" --color "fbca04"
gh label create wontfix --description "Will not be actioned" --color "b60205"
gh label create bug --description "Something is broken" --color "d73a4a"
gh label create enhancement --description "New feature or improvement" --color "a2eeef"
gh label create wayfinder:map --description "Wayfinder map" --color "5319e7"
gh label create wayfinder:research --description "Wayfinder research ticket" --color "0052cc"
gh label create wayfinder:prototype --description "Wayfinder prototype ticket" --color "0052cc"
gh label create wayfinder:grilling --description "Wayfinder grilling ticket" --color "0052cc"
gh label create wayfinder:task --description "Wayfinder task ticket" --color "0052cc"
```

Create the project and link this repo:

```sh
gh project create --owner janmichek --title "Dev template"
gh project link <number> --owner janmichek --repo dev-template-2026
```

Then in the project on GitHub:

1. Open the **Status** field and replace the options with **Needs triage**, **Needs info**, **Ready for agent**, **Ready for human**, **Won't fix**.
2. Set the layout to **Board**, grouped by **Status**.
3. Under workflows, turn on **Auto-add to project** for this repository, and set the default status to **Needs triage**.

The triage vocabulary lives in `docs/agents/triage-labels.md`; the board is the view of those states.

## Pull requests

Every pull request runs `.github/workflows/uml.yml`. The check regenerates `examples/app.edn` from `examples/app.policy.edn`, diffs it against the base branch, and comments a link to an interactive diagram. Click a module to isolate its arrows, hover to preview a neighbourhood, filter by name, switch between the changed imports and all imports, and toggle the light theme. Level 0 (`shared`) sits at the bottom. Added modules are green, removed ones are red. Outward dependencies are marked red.

The HTML page is rendered by `scripts/diagram-page.ts` with Bun from the two EDN files. To preview it locally:
