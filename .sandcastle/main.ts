// Sandcastle loop: plan -> implement + review (parallel) -> open PRs -> merge.
//
// State lives in GitHub labels, not a project board:
//   Sandcastle            a person queued the issue
//   sandcastle-wip        the loop picked it up (stays on failure: remove to retry)
//   sandcastle-in-review  a PR is open, waiting for a person
//   ready-for-agent       on the PR: a person approved, the loop merges it
//
// The loop never exits on its own. With nothing to do it sleeps IDLE_POLL_MS
// and rescans with cheap `gh` calls before waking any agent. In CI
// (SANDCASTLE_SELF_RESTART=1) it hands off to a fresh workflow run before the
// 6 hour job cap, because Actions kills the job and loses unpushed work.
//
// Local: bun run sandcastle        CI: .github/workflows/sandcastle.yml

import { execFileSync } from 'node:child_process';
import * as sandcastle from '@ai-hero/sandcastle';
import { docker } from '@ai-hero/sandcastle/sandboxes/docker';
import { z } from 'zod';
import { agent } from './agent.ts';

const planSchema = z.object({
  issues: z.array(z.object({ id: z.string(), title: z.string(), branch: z.string() })),
});

type PlannedIssue = z.infer<typeof planSchema>['issues'][number];

type ReadyToMergePr = {
  number: number;
  title: string;
  headRefName: string;
  url: string;
};

const QUEUE_LABEL = 'Sandcastle';
const WIP_LABEL = 'sandcastle-wip';
const REVIEW_LABEL = 'sandcastle-in-review';
const MERGE_READY_LABEL = 'ready-for-agent';
const BASE_BRANCH = 'main';

// Open issues a person queued that the loop has not touched yet.
const QUEUE_SEARCH = `-label:${WIP_LABEL} -label:${REVIEW_LABEL}`;

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

// The "continuous 1 minute": how long the loop sleeps between idle scans.
const IDLE_POLL_MS = 60_000;

const SELF_RESTART = process.env.SANDCASTLE_SELF_RESTART === '1';

// Hand off after this much wall-clock. The job timeout is 340 minutes, so
// 285 leaves ~55 minutes for the final phase to wrap up.
const RUN_BUDGET_MS = Number(process.env.SANDCASTLE_RUN_BUDGET_MINUTES ?? '285') * 60_000;

// Do not start issue pipelines this close to the budget; the next run picks
// the planned issues up instead of losing a sandbox to the hard timeout.
const MIN_EXECUTION_BUDGET_MS = 60 * 60_000;

const startedAt = Date.now();
const remainingBudgetMs = () => RUN_BUDGET_MS - (Date.now() - startedAt);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Runs inside the sandbox before each agent starts. Dependencies are copied
// from the host first, so this only fixes platform binaries and new packages.
const hooks = {
  sandbox: { onSandboxReady: [{ command: 'bun install --frozen-lockfile' }] },
};

const copyToWorktree = ['node_modules'];

// ---------------------------------------------------------------------------
// gh / git helpers (run on the host with the host's credentials)
// ---------------------------------------------------------------------------

function gh(args: string[]): string {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim();
}

function warn(context: string, cause: unknown): void {
  const message = cause instanceof Error ? cause.message : String(cause);
  console.error(`  ✗ ${context}: ${message}`);
}

function setLabels(issueId: string, add: string[], remove: string[]): void {
  try {
    const args = ['issue', 'edit', issueId];

    for (const label of add) args.push('--add-label', label);

    for (const label of remove) args.push('--remove-label', label);
    gh(args);
  } catch (error) {
    warn(`Could not relabel #${issueId}`, error);
  }
}

function commentOnIssue(issueId: string, body: string): void {
  try {
    gh(['issue', 'comment', issueId, '--body', body]);
  } catch (error) {
    warn(`Could not comment on #${issueId}`, error);
  }
}

// Queue a fresh workflow run before this one exits. The job-level
// `concurrency: sandcastle` group makes it start only once this run is gone,
// so the two never overlap. Prefer GITHUB_TOKEN: it carries `actions: write`,
// the PAT in GH_TOKEN may not.
function dispatchNextRun(): void {
  try {
    const env = { ...process.env };

    if (env.GITHUB_TOKEN) env.GH_TOKEN = env.GITHUB_TOKEN;
    execFileSync('gh', ['workflow', 'run', 'sandcastle.yml'], {
      env,
      stdio: 'inherit',
    });
    console.log('  → queued the next Sandcastle run');
  } catch (error) {
    warn('Could not queue the next Sandcastle run', error);
  }
}

function handOffAndExit(): void {
  console.log('Run budget reached; handing off before the Actions timeout.');
  dispatchNextRun();
}

function publishBranch(branch: string): void {
  try {
    execFileSync('git', ['push', '--set-upstream', 'origin', branch], {
      stdio: 'inherit',
    });
    console.log(`  ↑ pushed ${branch}`);
  } catch (error) {
    warn(`Could not push ${branch}`, error);
  }
}

function openIssuePr(issue: PlannedIssue): void {
  const { branch, id, title } = issue;

  try {
    const existing = gh([
      ...['pr', 'list', '--head', branch, '--state', 'open'],
      ...['--json', 'url', '--jq', '.[0].url'],
    ]);

    if (existing === '' || existing === 'null') {
      gh([
        ...['pr', 'create', '--base', BASE_BRANCH, '--head', branch],
        ...['--title', title],
        ...[
          '--body',
          `Fixes #${id}\n\nOpened by Sandcastle after implement + agent review. When you are happy, label this PR \`${MERGE_READY_LABEL}\`; the loop will merge it.`,
        ],
      ]);
      console.log(`  ✓ opened PR for ${branch} (Fixes #${id})`);
    } else {
      console.log(`  PR already open for ${branch}: ${existing}`);
    }

    setLabels(id, [REVIEW_LABEL], [WIP_LABEL]);
  } catch (error) {
    warn(`Could not open a pull request for ${branch}`, error);
  }
}

function listReadyToMergePrs(): ReadyToMergePr[] {
  try {
    const raw = gh([
      ...['pr', 'list', '--state', 'open', '--base', BASE_BRANCH],
      ...['--label', MERGE_READY_LABEL],
      ...['--json', 'number,title,headRefName,url'],
    ]);

    // SAFETY: `gh pr list --json number,title,headRefName,url` fixes the shape of `raw`.
    const prs = JSON.parse(raw) as ReadyToMergePr[];

    return prs.filter((pr) => pr.headRefName.startsWith('sandcastle/issue-'));
  } catch (error) {
    warn(`Could not list ${MERGE_READY_LABEL} PRs`, error);

    return [];
  }
}

// Fail open: a flaky gh call should wake the planner, not hide work.
function hasPlanTriggers(): boolean {
  try {
    const raw = gh([
      ...['issue', 'list', '--state', 'open', '--label', QUEUE_LABEL],
      ...['--search', QUEUE_SEARCH, '--limit', '1', '--json', 'number'],
    ]);

    // SAFETY: `gh issue list --json number` always returns a JSON array.
    return (JSON.parse(raw) as unknown[]).length > 0;
  } catch (error) {
    warn('Could not scan for plan triggers', error);

    return true;
  }
}

async function waitForTriggers(): Promise<void> {
  for (;;) {
    if (SELF_RESTART && remainingBudgetMs() <= 0) {
      console.log('Run budget exhausted while idle.');

      return;
    }

    console.log(`Idle: scanning again in ${IDLE_POLL_MS / 1000}s...`);
    await sleep(IDLE_POLL_MS);

    if (listReadyToMergePrs().length > 0 || hasPlanTriggers()) {
      console.log('Trigger found; resuming.');

      return;
    }

    console.log('No triggers yet.');
  }
}

async function mergeReadyPrs(): Promise<number> {
  const ready = listReadyToMergePrs();

  if (ready.length === 0) {
    console.log(`No Sandcastle PRs labelled ${MERGE_READY_LABEL} to merge.`);

    return 0;
  }

  console.log(`Merging ${ready.length} ${MERGE_READY_LABEL} PR(s):`);

  for (const pr of ready) {
    console.log(`  #${pr.number}: ${pr.title} (${pr.headRefName}) → ${pr.url}`);
  }

  await sandcastle.run({
    hooks,
    sandbox: docker(),
    name: 'merger',
    maxIterations: 1,
    agent: agent(),
    promptFile: './.sandcastle/merge-prompt.md',
    promptArgs: {
      BASE_BRANCH,
      MERGE_READY_LABEL,
      REVIEW_LABEL,
      PRS: ready
        .map((pr) => `- PR #${pr.number}: ${pr.title} (head \`${pr.headRefName}\`) — ${pr.url}`)
        .join('\n'),
    },
  });

  return ready.length;
}

// The merger works on the same working tree this script runs on, and may reset
// the tree while resolving conflicts. A dirty tree would lose work silently.
function assertCleanTree(): void {
  if (process.env.SANDCASTLE_ALLOW_DIRTY === '1') return;

  const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
    encoding: 'utf8',
  }).trim();

  if (dirty !== '') {
    throw new Error(
      'Working tree has uncommitted tracked changes. Commit or stash them (or set SANDCASTLE_ALLOW_DIRTY=1 to override); the merger may reset the tree.'
    );
  }
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

assertCleanTree();

for (let iteration = 1; ; iteration++) {
  console.log(`\n=== Iteration ${iteration} ===\n`);

  // Checked between phases, when no sandbox is open, so a handoff never
  // kills an implementer or reviewer mid-run.
  if (SELF_RESTART && remainingBudgetMs() <= 0) {
    handOffAndExit();
    break;
  }

  // Merge first, so approved PRs from a prior cycle land before new planning.
  const mergedCount = await mergeReadyPrs();

  // Plan: one cheap agent turn picks the unblocked issues.
  const plan = await sandcastle.run({
    hooks,
    sandbox: docker(),
    name: 'planner',
    maxIterations: 1,
    agent: agent(),
    promptFile: './.sandcastle/plan-prompt.md',
    promptArgs: { QUEUE_LABEL, QUEUE_SEARCH },
    output: sandcastle.Output.object({ tag: 'plan', schema: planSchema }),
  });

  const issues = plan.output.issues;

  if (issues.length === 0) {
    if (mergedCount > 0) {
      console.log('No unblocked issues; merges landed. Planning again...');
      continue;
    }

    console.log(`No unblocked issues and no ${MERGE_READY_LABEL} PRs.`);
    await waitForTriggers();
    continue;
  }

  console.log(`Planning complete. ${issues.length} issue(s) in parallel:`);

  for (const issue of issues) {
    console.log(`  ${issue.id}: ${issue.title} → ${issue.branch}`);
  }

  if (SELF_RESTART && remainingBudgetMs() < MIN_EXECUTION_BUDGET_MS) {
    console.log('Not enough budget for implement + review; deferring.');
    handOffAndExit();
    break;
  }

  // Claim before the long run so the next scan (and the next planner) skip them.
  for (const issue of issues) setLabels(issue.id, [WIP_LABEL], []);

  // Implement, then review in the same sandbox. allSettled: one failing
  // pipeline must not cancel the others.
  const settled = await Promise.allSettled(
    issues.map(async (issue) => {
      const sandbox = await sandcastle.createSandbox({
        branch: issue.branch,
        sandbox: docker(),
        hooks,
        copyToWorktree,
      });

      try {
        const implement = await sandbox.run({
          name: 'implementer',
          maxIterations: 100,
          agent: agent(),
          promptFile: './.sandcastle/implement-prompt.md',
          promptArgs: {
            TASK_ID: issue.id,
            ISSUE_TITLE: issue.title,
            BRANCH: issue.branch,
          },
        });

        if (implement.commits.length === 0) return implement;

        const review = await sandbox.run({
          name: 'reviewer',
          maxIterations: 50,
          agent: agent(),
          promptFile: './.sandcastle/review-prompt.md',
          promptArgs: {
            TASK_ID: issue.id,
            BRANCH: issue.branch,
          },
        });

        // Each sandbox.run() only returns commits from its own run.
        return {
          ...review,
          commits: [...implement.commits, ...review.commits],
        };
      } finally {
        await sandbox.close();
      }
    })
  );

  const completed: PlannedIssue[] = [];

  for (const [i, outcome] of settled.entries()) {
    const issue = issues[i]!;

    if (outcome.status === 'rejected') {
      console.error(`  ✗ ${issue.id} (${issue.branch}) failed: ${outcome.reason}`);
      commentOnIssue(
        issue.id,
        `Sandcastle failed on this issue: ${String(outcome.reason).slice(0, 500)}\n\nRemove \`${WIP_LABEL}\` to retry.`
      );
    } else if (outcome.value.commits.length === 0) {
      commentOnIssue(
        issue.id,
        `Sandcastle produced no commits for this issue. Remove \`${WIP_LABEL}\` to retry.`
      );
    } else {
      completed.push(issue);
    }
  }

  if (completed.length === 0) {
    console.log('No commits produced. Nothing to open as a PR.');
    continue;
  }

  console.log(`\nPublishing ${completed.length} branch(es) and opening PRs...`);

  for (const issue of completed) {
    publishBranch(issue.branch);
    openIssuePr(issue);
  }
}
