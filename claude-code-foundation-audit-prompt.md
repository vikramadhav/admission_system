# Claude Code — Foundation Audit and Controlled AI-Native SDLC


## UI visual reference policy (approved project decision)

The supplied UI screenshots/mockups are **visual references only**, not functional specifications or complete form definitions.

- The BRD and approved business decisions determine **what must be implemented**: all fields (including required/optional status), sections, actions, validations, roles, permissions, workflow steps and acceptance criteria.
- The visual references guide **how it should look**: design language, colors, typography, spacing, hierarchy, layout and reusable component styling.
- Do **not** infer that a field, button, section or action is unnecessary because it is absent from a screenshot. Likewise, do not add unsupported functionality merely because it appears in a screenshot.
- Before implementing a form or screen, build a BRD-backed inventory of fields, validation rules, actions and permission/state conditions, with source requirement IDs.
- Adapt and extend the visual pattern to fit the complete BRD requirements. A pixel-perfect reproduction is not required when it would omit mandatory functionality.
- Reuse the existing approved Angular components and design tokens wherever practical. Preserve responsive behavior, Arabic RTL, English LTR and WCAG accessibility.
- Where UI references conflict with BRD functionality, preserve BRD requirements and record material conflicts for review; do not silently resolve business ambiguities.
- Test screen completeness against the **BRD inventory**, not against the screenshots. Visual regression tests can separately assess styling consistency.

**Priority: BRD for functionality; approved UI references for visual language; engineering guidelines for implementation.**

## Role and scope
Act as a senior enterprise architect, business analyst, technical lead and code reviewer. Review the existing ASP.NET Core 10 Web API, Angular and SQL Server foundation for a complex application based on an approximately 80-page BRD, with four developers using Claude Code.

**Audit and plan only. Do not modify application code, delete files, regenerate the solution, reset Git, apply migrations, or create new foundational frameworks.** Preserve previously approved work.

## Authoritative inputs
Read the complete BRD, `dotnet-engineering-standards-updated.md`, `dahc-angular-structure-prompt-updated.md`, existing architecture decisions, specifications, `CLAUDE.md`, project rules, backend/frontend code, migrations, tests and relevant configuration. The BRD controls business requirements; engineering documents control implementation conventions in their respective areas; explicitly approved project exceptions take precedence over general defaults. Record genuine conflicts rather than silently picking an interpretation.

## Approved authentication and provisioning decisions — do not re-open
- Local development uses development-only single-factor username/password authentication; production and UAT use IDAM OIDC.
- The .NET API validates authentication and enforces all authorization; Angular navigation/guards are only UI aids.
- On successful OIDC authentication, an **eligible Candidate only** may be provisioned automatically. Privileged roles and other non-Candidate accounts require explicit provisioning.
- Identify external users using validated issuer and subject, not email alone. Ensure provisioning is idempotent and concurrency-safe. Never reactivate disabled accounts automatically.
- Roles and resource permissions are application-managed. Local development authentication must be entirely unavailable outside Development.

## 1. Foundation audit
Inspect and cite concrete repository paths for findings:

**Backend:** solution and project architecture, dependency direction, domain/application boundaries, EF Core and migration practices, service registration, API conventions and contracts, validation, exception mapping/ProblemDetails, security and authorization, logging, correlation and audits, transactions/concurrency, configuration, meaningful tests.

**Angular:** workspace/library/playground/portal structure, shared components, tokens, accessibility, RTL/i18n, routing, guards, auth and token handling, API adapters and interceptors, state handling, Playwright tests, security and environment settings.

**Integration:** API DTO/OpenAPI agreement, active-role flow, authentication, ProblemDetails conventions, release configuration, deployment assumptions, database compatibility.

For every issue record severity, evidence (file and relevant lines), violated requirement/standard, risks, safe remediation, dependencies, and verification steps. Classify as `COMPLIANT`, `MINOR REFACTOR`, `INCOMPLETE`, `CONFLICT`, `SECURITY RISK`, or `REBUILD CANDIDATE`. A rebuild candidate requires demonstrable architectural incompatibility; preference alone is insufficient.

## 2. BRD inventory and traceability
Without producing every feature specification, inventory modules, actors/roles, role-resource permissions, business processes, workflows/state transitions, assignments/approvals, cross-module dependencies, reports, integrations and nonfunctional requirements. Give requirements stable IDs and BRD page/section links; distinguish facts, approved decisions, assumptions, and true omissions. Do not invent permissions, transitions or business rules.

## 3. Shared architecture and workflow decisions
Validate the existing foundation against the approved standards, rather than redesigning it. Prefer explicit business process services and straightforward persisted workflow state/history/assignments where justified by the BRD. Avoid adding generic workflow engines, mediator/CQRS infrastructure, generic repositories, third-party packages, or custom security frameworks absent approved requirements. Check transactional integrity, concurrency protection and queryable reporting structures.

## 4. Clarification policy
Before asking, search the BRD, standards, code, approved decisions and existing issues. Mark each ambiguity `BLOCKER`, `ASSUMPTION` or `DEFERRED`. Ask only consolidated, prioritized BLOCKER questions that prevent correct work on the current slice; document the remainder in an open-decision register and continue unaffected analysis. Never interpret an unstated critical authorization rule as an approved assumption.

## 5. Four-developer execution process
Plan a controlled foundation remediation phase followed by independent feature branches. Establish shared `CLAUDE.md`/rules, architecture ownership and ADR approval, feature/module ownership, API-contract-first coordination for Angular and backend, mandatory code review, automated tests and protected integration branches. No independent agent may change shared patterns without review.

## 6. Just-in-time specifications
Provide one concise feature-specification template covering requirement IDs, BRD citations, actors, permissions, rules, state transitions, data/API/frontend contracts, dependencies, acceptance criteria, meaningful tests, and unresolved blockers. Only detail the next approved implementation slice. Do not generate a complete collection of implementation specs upfront.

## 7. Outputs
Reuse existing docs where possible and avoid competing sources of truth. Produce:
1. Foundation audit report with evidence and compliance matrix.
2. Security, architecture and cross-component integration findings.
3. Retain/refactor/rebuild assessment with rationale.
4. Prioritized, non-destructive remediation plan and risk/verification steps.
5. BRD module/role/workflow inventory and traceability approach.
6. Confirmed shared architectural baseline and decisions register.
7. Lightweight feature-spec template and four-developer collaboration plan.
8. Recommended first end-to-end implementation slice and entry/exit quality gates.

Finish with a concise verdict: what is usable, what must be corrected before parallel delivery, what can be deferred, and which genuine decisions require approval. **Stop before making changes and request approval for the remediation plan.**
