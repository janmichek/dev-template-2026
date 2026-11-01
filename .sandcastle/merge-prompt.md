# TASK

Merge Sandcastle pull requests labelled `{{MERGE_READY_LABEL}}` into `{{BASE_BRANCH}}`.

Only merge PRs in the list below (they already carry that label). Do not merge anything still waiting for human review.

Ready-to-merge PRs:

{{PRS}}

# FOR EACH PR

1. Prefer a clean GitHub merge when the PR is mergeable:
   `gh pr merge <NUMBER> --merge --delete-branch`
2. If `gh pr merge` fails on conflicts:
   - Check out `{{BASE_BRANCH}}` and update it from origin
   - `gh pr checkout <NUMBER>`
   - Merge `{{BASE_BRANCH}}` into the PR branch and resolve conflicts carefully
   - Run `bun run typecheck` and `bun run test:unit`; fix failures
   - Push the PR branch, then `gh pr merge <NUMBER> --merge --delete-branch`
3. After a successful merge, close the linked issue if it is still open and drop its label:
   `gh issue close <ID> --comment "Merged in #<NUMBER>"` and
   `gh issue edit <ID> --remove-label {{REVIEW_LABEL}}`
   The issue ID is the number in the head branch `sandcastle/issue-<ID>`, or from `Fixes #<ID>` in the PR body.

# RULES

- Never merge a PR that is not in the list above.
- Never run `git reset --hard`, `git checkout -- .`, or anything else that discards commits or uncommitted work.
- Never leave a `git stash` unpopped.
- If a PR cannot be merged cleanly, leave it open, comment on the PR with what blocked you, and continue with the others.
- Do not open new PRs or start new issue work in this phase.

Once you have merged everything you can, output <promise>COMPLETE</promise>.
