# Sandcastle agent loop

Issues labelled `Sandcastle` are worked by a long-running loop (`.sandcastle/main.ts`) that plans, implements, reviews, opens a pull request, and merges it once a person labels it `ready-for-agent`. Each agent runs in a Docker sandbox. The agent is Claude Code pointed at DeepSeek's Anthropic-compatible endpoint (`.sandcastle/agent.ts`).

State lives in GitHub labels, not a project board: `Sandcastle` (queued), `sandcastle-wip` (claimed), `sandcastle-in-review` (PR open), `ready-for-agent` (on the PR, approved). The fork's template used a hardcoded project board; labels need no IDs and work in any repo. A failed issue keeps `sandcastle-wip` so it is not retried forever; removing the label retries it.

The loop sleeps 60 seconds between idle scans and uses `gh` queries, not agents, to decide whether to wake. In Actions a job dies at 360 minutes, so at 285 the loop queues a successor run (`gh workflow run sandcastle.yml`) between phases. `concurrency: sandcastle` keeps two loops from overlapping.

The dependency is a git fork (`github:janmichek/sandcastle`) that ships no `dist/`. `bun run sandcastle:build` builds the commit locked in `bun.lock` into `node_modules`. The agent pushes with a personal access token (`SANDCASTLE_GH_TOKEN`), because pushes made with the built-in `GITHUB_TOKEN` do not trigger CI.

Trade-off: the agent can only be as trusted as the sandbox and the PAT. The PAT is scoped to this repository, and a person always approves the merge.
