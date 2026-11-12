# Workflow, branching and reviews

## Branches

- `main` is protected and holds released state; it is tagged `foundation-baseline-2026-11-12` at the baseline.
- `develop` is the protected integration branch.
- Feature work goes on `feature/<req-id>-<short-name>`, taken from `develop` and merged by PR with squash.
- Shared-pattern changes go on `arch/<adr-id>-<name>` and merge before the feature branches that depend on them.
- Rebase on `develop` daily. Agents work in a separate worktree per branch.

## Pull requests

- One reviewable PR per remediation step or slice.
- The PR description lists:
  - requirement ids;
  - decision ids (AP/DEC/B/A);
  - the exit-gate command output.
- Changes to shared paths (CODEOWNERS) need two reviewers; anything else needs one.

## Commits and history

- Commit only intended changes; review every file in `git diff` first.
- Never force-push, rewrite shared history, run `git reset --hard` or `git clean`, or skip hooks.

## Approvals

- Follow the Approval column in `docs/audits/02-remediation-plan.md` §1. A GATED step waits for its decision.
- A new package, framework or cross-cutting pattern needs a DEC entry approved in the register first.
- Before UAT and before any release that changes schema or invariants, complete the SQL Server release-validation checklist (plan §2.3) and record the result.
