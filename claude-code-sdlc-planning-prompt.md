# Claude Code: BRD-Driven SDLC Planning Prompt

You are acting as a Senior Enterprise Solution Architect, Business Analyst, and Technical Lead for an enterprise application.


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

## Context

We have an approximately 80-page BRD with complex workflows, multiple roles, interconnected modules and business rules. Four senior developers will implement the application using Claude Code, ASP.NET Core 10 Web APIs, Angular and SQL Server. Scalability, security, maintainability and testability matter.

## Authoritative project inputs

Read these existing project documents **before** creating or modifying plans:

1. The original BRD — authoritative for business requirements, workflows, roles and rules.
2. `dotnet-engineering-standards-updated.md` — authoritative for backend coding, architecture, security and test standards, including Section 19 project exceptions.
3. `dahc-angular-structure-prompt-updated.md` — the current Angular foundation requirements and architectural decisions. It contains an implementation task; do **not** interpret reading it as authorization to generate the entire frontend.
4. Any approved architecture decisions, plans, existing specifications, `CLAUDE.md`, project rules and repository code.

Use the actual file paths in the repository if the files are renamed. Reference rather than copy authoritative content. Do not infer BRD requirements from other files or invent missing workflows.

## Already approved decisions: do not reopen without an actual conflict

- Deployed Test/UAT/Production authentication uses IDAM OIDC authorization code + PKCE in Angular, with bearer-token validation by the API.
- Local Development uses development-only username/password **single-factor authentication (SFA)** through the API's standard ASP.NET Core authentication infrastructure. Development tokens, endpoints and UI must not be accepted or available outside Development.
- Only eligible, first-time **Candidate** identities can be automatically provisioned after successful validated OIDC sign-in. The API, not Angular, decides eligibility. Never automatically provision staff, approvers or administrators.
- Identify OIDC users by validated issuer + subject, not email alone. First sign-in is idempotent and concurrency-safe. Never reactivate blocked/disabled users through login.
- Roles and resource access are controlled in the application's database and enforced by the server. Do not treat identity-provider role claims or Angular route guards as authorization.
- Follow the existing .NET engineering standard: explicit application/business-process services, no unapproved generic workflow engine, mediator/CQRS infrastructure, or generic repositories.
- Keep future client channels in mind: business rules and authorization belong in APIs, not the Angular client.

If the BRD conflicts with an approved decision, report the exact source sections and the implementation impact, and seek one targeted human decision. Do not silently override either source.

## Objective

Replace the existing overly broad specification-generation process with a practical BRD-driven, incremental SDLC for four developers. Avoid endless clarification questions and enormous speculative specifications. Do not implement application code in this planning task.

## Step 1: Examine what exists

Read the documents and repository first. Identify what is already approved, what is duplicated, and what is truly missing. Preserve all working code, reviewed designs, standards and existing decisions. Do not create parallel standards documents.

## Step 2: Create a high-level BRD inventory

Produce or update concise catalogs of:

- Modules/features, each with a stable ID and BRD section/page reference.
- Roles and permission boundaries, marking uncertain permissions as unresolved.
- Business processes and workflow/state-transition summaries.
- Business rules and important validation constraints.
- Cross-module dependencies, external integrations and reporting requirements.
- Nonfunctional requirements and risks.

Keep traceability from each requirement to its original BRD section/page. Distinguish *BRD-confirmed*, *approved decision*, *proposed*, and *unresolved* information. Do not create detailed specs for every module yet.

## Step 3: Evaluate the existing architecture and standards

Use, rather than regenerate, the .NET and Angular documents. Identify only necessary project-specific decisions involving API contracts, modular boundaries, identity and authorization, SQL Server consistency, workflow state, auditing, error handling, logging, deployment and testing. For workflow-heavy features, prefer explicit business services with readable status transitions and queryable relational data. Flag exceptions for human approval.

The Angular document also contains a request to generate UI components, a playground and application foundation: treat this as a **separate future implementation task**, not as part of planning.

## Step 4: Apply a strict clarification policy

For each ambiguity, record its requirement ID, reference, impact, proposed handling and owner:

- **BLOCKER:** a missing decision that prevents correct or safe implementation of the *current* feature (e.g., authorization, eligibility, approval/transition semantics, irreversible data effects).
- **ASSUMPTION:** a noncritical proposed default that is explicitly marked unconfirmed; it must not grant permissions or invent critical business rules.
- **DEFERRED:** relevant to a later feature and not blocking current work.

Do not ask questions answered by the BRD or standards. Never produce only a question list. Continue on independent, well-specified work. Present critical blockers together in one concise, prioritized review, citing the precise conflicting or missing source text. Do not silently promote assumptions into approved requirements.

## Step 5: Define incremental feature delivery

Create one lightweight feature specification template containing:

- Requirement IDs and BRD references.
- User goal, actors and permission checks.
- Explicit business rules, status transitions and invariants.
- Inputs/outputs, API contracts and persistence impacts.
- Dependencies, error and concurrency scenarios.
- Acceptance criteria and focused business/security/integration tests.
- Blockers, assumptions and approval status.

Only produce a detailed specification for the **next approved implementation slice**, not all 80 pages. Require human review for critical rules before code is written.

## Step 6: Organize four developers

Recommend feature ownership with a shared technical lead/reviewer and an agreed API-first contract process. Define independent branches, review responsibilities, minimal shared-file contention, parallel API/Angular work against contracts, CI checks, integration verification and a visible dependency backlog. All Claude sessions must use the same committed standards, decisions and feature scope. No session may independently change shared architecture without review.

## Step 7: Define proportionate quality gates

Include BRD traceability, requirements readiness, approval of business-critical transitions/permissions, standards compliance, API contract agreement, meaningful automated tests, concurrency/security negatives, integration tests and a reviewed pull request. Follow the engineering standard's no-arbitrary-test-coverage rule.

## Deliverables (planning/documentation only)

1. Inventory of modules, workflows, roles, rules and dependencies, with BRD references.
2. Requirements traceability catalog.
3. Existing documentation assessment and duplicate/conflict report.
4. Compact project-specific architecture decision register (reference standards; do not clone them).
5. Lightweight feature-specification template.
6. Central open-decisions register.
7. Four-developer collaboration and CI/review workflow.
8. Prioritized implementation roadmap, including one vertical reference feature.
9. Short `CLAUDE.md` linking to authoritative source files, with optional small scoped project rules.

## Completion behavior

Do not start an endless Q&A cycle. Do not stop at unresolved questions. Deliver all nonblocked artifacts, explicitly identify BRD gaps, and summarize exact files created/updated and only the critical outstanding approvals. Do not modify the actual BRD or rewrite the existing standards unless requested. Do not write application code as part of this task.
