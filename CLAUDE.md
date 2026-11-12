# DAHC Admissions — Claude Code project rules

The Dubai Health GME admissions platform. Candidates apply to internship, residency and fellowship programs; staff review, score and announce.
- Backend: ASP.NET Core 10 Web API, a modular monolith, in `src/backend`.
- Frontend: an Angular workspace (`dahc-ui`, `dahc-playground`, `dahc-portal`) in `src/frontend`.
- Database: SQL Server.

## Sources of truth (in this order)

1. `docs/brd/Addmission_System_BRD.md`: business function, fields, validations, permissions and workflows.
2. Approved decisions: `docs/audits/03-decisions-register.md` (AP-nn, and DEC-nn marked APPROVED), with the RBAC design in `docs/audits/05-rbac-design.md`. Never reopen them.
3. Engineering standards: `docs/dotnet-engineering-standards.md` (backend, including §19 project decisions) and `docs/angular-structure-and-guidelines.md` (frontend).
4. `docs/UIUX/`: visual look and feel only. It is never evidence that a field, rule or screen is complete or out of scope.

## Before you change anything

- Read the slice's feature spec (`docs/specs/`, template in `docs/audits/04-feature-spec-template.md`), the decisions register, and the standards section for the area you touch.
- Check `docs/audits/02-remediation-plan.md` §1. A step marked **GATED** must not be started until its decision is approved.
- When a requirement or permission is ambiguous: stop, and add an entry to the register (§4) instead of assuming. Never invent permissions, statuses or transitions.
- Business decisions B-02 to B-07 are open (B-01 is resolved by AP-10). Keep the current provisional behaviour and never finalise or change it silently.

## Always

- Run the exit-gate commands for your area before proposing a PR, and report failures verbatim:
  - backend: `dotnet build` (0 warnings), `dotnet format --verify-no-changes`, `dotnet test`;
  - frontend: lint, build for both locales, and the Playwright specs.
- Cite requirement ids (`US-x.y.z/AC-n`, `BR-nn`) in tests, and in comments that explain business rules.
- Update the standards or the register in the same change when a rule changes.

## Never

- Add packages, frameworks or new abstractions (mediator, generic repository, workflow engine, custom caching or auth infrastructure) without an approved decision.
- Change shared paths (CODEOWNERS), the auth/authorization pipeline, the DbContext/migrations or `dahc-ui` tokens unless the task explicitly says so.
- Run destructive git commands, rewrite shared history, force-push, apply migrations to shared databases or hand-edit generated migrations.
- Commit secrets, user-secret files, local databases, logs or build output.

Area-specific rules are in `.claude/rules/`: `authentication.md`, `authorization.md` (permission-based RBAC and active role), `backend.md`, `frontend.md` and `workflow.md`.
