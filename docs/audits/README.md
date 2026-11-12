# Foundation Audit — 2026-11-12

This was a read-only audit of the existing DAHC Admissions foundation (`src/backend`, `src/frontend`) against the BRD, `docs/dotnet-engineering-standards.md`, `docs/angular-structure-and-guidelines.md` and the approved authentication and provisioning decisions. No application code was modified.

| # | Document | Covers (prompt §7 output) |
|---|---|---|
| 1 | [01-foundation-audit-report.md](01-foundation-audit-report.md) | Audit report with evidence and compliance matrix (1); security, architecture and integration findings (2); retain/refactor/rebuild (3) |
| 2 | [02-remediation-plan.md](02-remediation-plan.md) | Prioritised non-destructive remediation with risks and verification (4); four-developer plan (7); first slice and entry/exit gates (8) |
| 3 | [03-decisions-register.md](03-decisions-register.md) | Confirmed baseline, proposed decisions, BLOCKER/ASSUMPTION/DEFERRED register (6) |
| 4 | [04-feature-spec-template.md](04-feature-spec-template.md) | Lightweight feature-spec template (7) |
| A | [appendix-a-frontend-audit.md](appendix-a-frontend-audit.md) | Detailed frontend findings FE-01..FE-20 and the client-side API contract |
| B | [appendix-b-brd-inventory.md](appendix-b-brd-inventory.md) | BRD inventory (5): 15 modules, 9 roles, permission matrix, 5 status profiles, 32 workflows, field inventory, 59 rules, NFRs, 45 questions, all with line citations |

## How the audit was done

- Every backend source file in the auth, HTTP, data, identity and applications paths was read.
- The backend was built and tested in a scratch copy outside the repository, using SDK 10.0.403 because the pinned 10.0.404 is not installed. Results: build 0 warnings, `dotnet format --verify-no-changes` clean, **54/54 tests passed**.
- The frontend was read file by file; it could not be built because `angular.json` is missing.
- The full BRD was inventoried with line citations.

## BRD traceability approach

1. Requirement ids are the BRD's own: `US-x.y.z` with `AC-n`, plus the inventory ids `BR-nn`, `WF-nn`, `ROLE-nn`, `MOD-nn` and `RPT-nn`, each anchored to BRD line numbers (Appendix B).
2. Each feature spec lists the ids it implements (template §1, §9).
3. Each test carries the ids: `[Trait("Requirement", "US-1.2.1/AC-4")]` and `test.describe('US-1.2.1 …')`.
4. Each PR description lists the ids. A traceability report can then be produced by grepping the traits and describes, with no tool needed.
5. Facts, approved decisions, assumptions and omissions are kept separate in Appendix B and the register.

## Verdict

**Usable as is (retain):**
- The backend architecture: layering, CPM, build settings, results and ProblemDetails, envelope, logging and correlation, options validation, hardening, introspection auth, active-role authorization, the provisioning logic, the data model with DB-enforced invariants, ETag/idempotency, localization and the meaningful unit tests.
- The frontend library, tokens and components; the portal's auth, interceptor, locale, date pipe and API adapters; the playground source viewer; the Playwright structure.
- **There are no rebuild candidates.**

**Must be corrected before parallel delivery:**
- **FE-01:** there is no `angular.json` or lockfile, so the frontend cannot build.
- **BE-01:** identity is not bound to the issuer, which conflicts with an approved decision.
- **BE-05:** there are no migrations or dev bootstrap.
- **BE-02 / FE-02:** dev SFA is not restricted to seeded users, and there is no dev sign-in UI.
- **BE-06:** reclassified by AP-09 (xUnit + EF Core InMemory approved). SQL Server behaviour is verified through the release-validation checklist (plan §2.3), not as an entry-gate fixture.
- **BE-07:** code-style rules are not enforced.
- **BE-08 / INT-01:** the decision log and OpenAPI contract referenced by the code are missing.
- **FE-04 / INT-02:** the `/programs` contract mismatch.
- **BE-03:** no audit of security events.
- **BE-14:** gaps against the approved IDAM token architecture (AP-08): no scope check, and the introspection path (cache expiry, fail-closed) is untested. The implementation is retained and extended (step 14).
- **Repository controls:** git, CLAUDE.md, rules and CODEOWNERS.

**Can be deferred:**
- Accessibility primitives and the remaining components.
- Visual regression and RTL suites (needed before UAT).
- CSP hosting (needs the deployment ADR).
- The module-boundary ADR.
- Comment renumbering.
- Back-office foundations: pool assignment, the workflow history pattern (DEC-12), until their slices.

**Genuine decisions needing approval:**
- Business blockers B-01 to B-05:
  - B-01: staff provisioning and the admin role.
  - B-02: the duplicate-account outcome.
  - B-03: the application-id format.
  - B-04: the one-active-application scope.
  - B-05: the cycle model.
- Assumptions A-01 to A-06 (A-06: the contents of IDAM's introspection response).
- Technical proposals DEC-01 to DEC-14, including the new packages: EF Design, the SQL Server test fixture, ASP.NET Core OpenApi, and the eslint tooling. DEC-14 adds no package; the IDAM resilience package is deferred (DF-10).

**Approved and recorded:** AP-08, IDAM opaque access tokens validated by introspection. It is recorded in `docs/dotnet-engineering-standards.md` §19 and §13, `docs/angular-structure-and-guidelines.md` §7 and the decisions table, and register §1.1, which rates conformance requirement by requirement.
- Slice S1 as the first slice.

**Stopped for human review.** The remediation plan in [02-remediation-plan.md §5](02-remediation-plan.md#5-request-for-approval) needs approval before any change is made.
