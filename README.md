# Dev template 2026

Strict Feature-Sliced React template. The sample product is a small car lot so every layer and segment has real code to hold: a stock summary, a car table, a make filter, and a reserve action.

Start every agent session with `/ask-matt`. It picks the skill. Do not skip it.

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

## The lot

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
bun run typecheck     # tsc --noEmit
bun run lint          # oxlint
bun run fmt           # oxfmt
bun run fsd           # steiger, strict recommended rules
bun run knip          # unused files, exports, dependencies
bun run duplicates    # jscpd, threshold 0
bun run api:generate  # openapi.json + schema.d.ts from Zod
bun run test:unit     # vitest
bun run test:e2e      # playwright
bun run test:mutate   # stryker on model/lib (stock, formatUsd examples)
bun run storybook     # :6006
```

Tool configs live in `config/`. Root `tsconfig.json` and `steiger.config.ts` only point there, because the editor and Steiger look at the project root. `.oxfmtrc.json` stays at the root too: oxfmt `ignorePatterns` are rooted at the config file, so a config inside `config/` cannot ignore the rest of the repo.

## Agent skills

The engineering skills are installed from `mattpocock/skills` into `.agents/skills`, and linked for Claude (`.claude/skills`) and Cursor (`.cursor/skills`). `skills-lock.json` records the versions.

```sh
npx skills@latest add mattpocock/skills --all
```

Issue tracker, triage labels, and domain docs are in `docs/agents/`. `AGENTS.md` points at them. Domain words live in `GLOSSARY.md`. Decisions live in `docs/adr/`.

### `/ask-matt` always

First message of a session, before any other skill. `/ask-matt` reads the situation and names the skill or flow that fits. The list below is the map. If you are unsure, ask Matt instead of guessing.

### Classic flow

The path most work travels. One idea, then ship it.

1. `/grill-with-docs` sharpens the idea and writes the result into `GLOSSARY.md` and `docs/adr/`.
2. If a question needs a running answer, `/handoff` out, `/prototype` in a fresh session, `/handoff` back.
3. If the build will take more than one session, `/to-spec` then `/to-tickets`. Work the tickets with `/implement` (fresh context each ticket) or `/implement-spec` (one integration branch).
4. If it fits in this session, `/implement` here.
5. Implementation drives `/tdd`. Close with `/code-review`, then `/pr` for the pull-request body.
6. `/retro` after the build, in the same session, and adjust the agent's environment rather than only the code.

Keep grilling, the spec, and the tickets in one context window. Start each `/implement` fresh.

On-ramps onto that flow:

- A pile of bugs or requests you did not write: `/triage`.
- Something broken that a first look cannot explain: `/diagnosing-bugs`, then `/retro`.
- A foggy effort that is too big for one session: `/wayfinder`, and when the map is clear, `/to-spec`. Do not jump from the map straight into `/implement`.

### `/wayfinder`

For a destination you cannot see the path to yet. It opens one GitHub issue labelled `wayfinder:map` and child issues for the decisions still open. Each session resolves one ticket, records the answer on the issue, and only then charts what that answer made visible.

Ticket labels are `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, and `wayfinder:task`. Research can run in the background. Prototype and grilling need a person in the loop. The map is done when nothing is left to decide, and someone else builds it through the classic flow.

Blocking is a GitHub issue dependency, so the project board shows what is takeable.

### `/prototype`

A throwaway program that answers one question.

- "Does this state model feel right?" becomes one HTML file you can click through.
- "What should this look like?" becomes a few UI variants on one route.

Put it next to the code it is about, mark it as a prototype, skip tests and polish, and keep the validated decision on main. The prototype itself stays on a `prototype/<name>` branch, linked from the implementation issue.

### GitHub board

Issues are the tracker. The board is a GitHub Project grouped by status, with the same five states `/triage` uses.

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

`/triage` reads `docs/agents/triage-labels.md` and applies the labels. The board is the view of those states. A ticket from `/to-tickets` is already agent-ready, so it does not go through triage.

## Pull requests

Every pull request runs `.github/workflows/uml.yml`. The check regenerates `examples/app.edn` from `examples/app.policy.edn`, diffs it against the base branch, and comments a link to an interactive diagram. Click a module to isolate its arrows, hover to preview a neighbourhood, filter by name, switch between the changed imports and all imports, and toggle the light theme. Level 0 (`shared`) sits at the bottom. Added modules are green, removed ones are red. Outward dependencies are marked red.

The HTML page is rendered by `scripts/diagram-page.ts` with Bun from the two EDN files. To preview it locally:

```sh
bun scripts/diagram-page.ts examples/app.edn /tmp/before.edn /tmp/diagram.html main 1234567 feature 89abcde
```

The comment is updated in place. The HTML is uploaded to x0.at, which is public and temporary. A later push replaces the link. Only the IR generator still runs on Clojure.

If the workflow says the diagram is stale, regenerate it and commit `examples/app.edn`:

```sh
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/bin:/usr/bin:/bin:$JAVA_HOME/bin"
clojure -Sdeps '{:deps {io.github.unclebob/uml-viewer {:git/url "https://github.com/unclebob/uml-viewer.git" :git/sha "f65dafe93b3cb1b4e6bb02dbe41503ed05bd9ebf"}}}' \
  -M -m uml-viewer.main.ir-generator examples/app.policy.edn examples/app.edn
```

The viewer is pinned to `f65dafe93b3cb1b4e6bb02dbe41503ed05bd9ebf`. Do not push to `unclebob/uml-viewer`.

Write the pull-request body with `/pr`: a small diagram of the change, before/after evidence, and whether the merge is a one-way or two-way door. The template in `.github/pull_request_template.md` is that shape.
