# ISSUES

Open issues labelled `{{QUEUE_LABEL}}` that the loop has not claimed yet (no `sandcastle-wip`, no `sandcastle-in-review`):

<issues-json>

!`gh issue list --state open --label "{{QUEUE_LABEL}}" --search "{{QUEUE_SEARCH}}" --limit 100 --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`

</issues-json>

# TASK

Analyze the issues and build a dependency graph. For each issue, decide whether it **blocks** or **is blocked by** any other open issue (claimed ones included: check `gh issue list --state open --label sandcastle-wip` and `--label sandcastle-in-review` too).

Issue B is **blocked by** issue A if:

- B needs code or infrastructure that A introduces
- B and A change overlapping files or modules, so concurrent work would conflict
- B depends on a decision or API shape that A will establish

An issue is **unblocked** if it has no blocking dependency on another open issue.

For each unblocked issue, use the exact branch name `sandcastle/issue-{id}` (no slug, no suffix). It must be deterministic so re-planning the same issue keeps its progress.

# OUTPUT

Wrap the plan in `<plan>` tags:

<plan>
{"issues": [{"id": "42", "title": "Fix auth bug", "branch": "sandcastle/issue-42"}]}
</plan>

Include only unblocked issues. If every issue is blocked, include the single highest-priority one.

Always emit the `<plan>` tags. With nothing to do, output `<plan>{"issues": []}</plan>` so the host idles and rescans later.
