# TASK

Harden the work on branch `{{BRANCH}}` against `{{TARGET_BRANCH}}` and GitHub issue {{TASK_ID}}.

You are the strict second opinion. Be pedantic. Prefer deleting and simplifying over adding.

Do not touch issue labels: the host opens the PR next and manages them.

# CONTEXT

## Issue (assignment)

!`gh issue view {{TASK_ID}} --json title,body,labels,comments --jq '{title,body,labels: [.labels[].name], comments: [.comments[]? | {author: .author.login, body}]}'`

## Branch diff

!`git diff {{TARGET_BRANCH}}...{{BRANCH}}`

## Commits on this branch

!`git log {{TARGET_BRANCH}}..{{BRANCH}} --oneline`

# LOOP (repeat until clean)

Run **Validate → Code review → Security** as a loop. After each pass, if you changed code, commit and run all three again. Stop when a pass finds **no material findings**.

## 1. Validate against the assignment

- Every requirement in issue {{TASK_ID}} (and any parent or spec it names) is met, or the gap is left as a `gh` issue comment. Do not close the issue.
- No scope creep the issue did not ask for.
- Run `bun run typecheck`, `bun run lint`, `bun run fmt:check`, `bun run fsd`, `bun run dead-code`, `bun run duplicates`, and `bun run test:unit`. Fix failures before continuing.

## 2. Code review and desloppify

Call the Skill tool with `code-review`. Fixed point: `{{TARGET_BRANCH}}`. Spec source: issue {{TASK_ID}}. Standards: `.sandcastle/CODING_STANDARDS.md` plus the in-repo standards the skill finds.

Then a stricter pass yourself:

- Over-engineering, unused abstractions, dead code, abandoned attempts, duplicate files: remove or collapse them.
- Prefer the smallest design that still passes Validate.
- Fix what you agree with; commit.

## 3. Security audit

Audit the diff and any new dependencies for:

- Injection, command or path abuse, unsafe deserialization
- Secret leaks, logged tokens or PII
- AuthZ gaps, trust-boundary mistakes
- `as` casts or `any` that hide untrusted input

Fix real issues, commit, return to Validate.

# AFTER THE LOOP IS CLEAN

## 4. Coverage

Raise test coverage on the feature this branch adds or changes: edge cases the issue implies, **≥ 90%** line coverage on the touched modules. Tests live next to the code. Commit.

## 5. UI check (only if the branch changes the UI)

Run the app and exercise the changed flow with Playwright (`bun run test:e2e`). Keep changes subtle and easy to remove. Skip this step for non-UI branches.

# RULES

- Stay on `{{BRANCH}}`. Never discard work (`reset --hard`, wiping the tree, unpopped stashes).
- Preserve behaviour unless Validate says it is wrong.
- Do not close the issue.
- When Validate, review, security, and coverage are clean, output <promise>COMPLETE</promise>.
