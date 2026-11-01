# TASK

Implement issue {{TASK_ID}}: {{ISSUE_TITLE}}

Work on branch {{BRANCH}}. Only this issue.

# SKILL

Call the Skill tool with `implement` and follow it for this issue.

AFK overrides (no human in the loop):

- Fetch the issue with `gh issue view {{TASK_ID}} --json number,title,body,labels,comments`, and any linked parent or spec it names. Do not ask clarifying questions: decide from the issue text.
- Choose test seams yourself; do not wait for confirmation.
- After the work is committed, **stop**. Do **not** call `code-review`: the reviewer agent owns that.
- Follow `AGENTS.md`, `GLOSSARY.md`, and `docs/adr/`. Imports go down the Feature-Sliced layers only.
- Verify with `bun run typecheck`, `bun run lint`, `bun run fsd`, and `bun run test:unit` before you stop.

# CONTEXT

<recent-commits>

!`git log -n 10 --format="%H%n%ad%n%B---" --date=short`

</recent-commits>

# DONE

Ship a working slice that matches the issue. The reviewer validates, simplifies, security-audits, and raises coverage next; do not pre-empt that.

If the issue is only partly done, leave a `gh` comment with what landed. Do not close the issue and do not touch its labels: the host manages `sandcastle-wip` and `sandcastle-in-review`.

Once complete, output <promise>COMPLETE</promise>.
