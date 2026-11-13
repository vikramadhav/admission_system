# Prompt: build the complete multi-role DAHC portal

Paste the prompt below into Claude Code (CLI), started from the repository root, on the branch `feature/dahc-portal-multi-role`. It builds on the candidate portal and DAHC-UI from `feature/angular-frontend-design-system`.

---

# Task: build the complete DAHC portal structure (all roles) in Angular

Act as a senior Angular architect. Extend the existing Angular workspace in `frontend/` into the complete multi-role DAHC admission portal, as defined by the BRD and user stories. The candidate area already exists and works; extend the architecture around it instead of rebuilding it.

## Hard boundaries
- Work only inside `frontend/`. Treat `BRD/`, `User_Stories/`, `Contracts/`, `Open-Questions.md`, `backend/`, `Design_System/` and the root standards files as read-only references. If a change outside `frontend/` seems necessary, stop and ask.
- Follow `frontend/CLAUDE.md`, `frontend/README.md` and `dahc-engineering-standards (2).md` Part 2.
- Build the UI only with DAHC-UI (`projects/dahc-ui`, imported as `dahc-ui`). No Angular Material, CDK, Bootstrap, Tailwind, PrimeNG, NG-ZORRO or other UI libraries. Use semantic tokens (`var(--dahc-*)`) only.
- Do not modify DAHC-UI. If a component is missing, compose it inside the portal and log the gap in `frontend/docs/portal/dahc-ui-gaps.md`.
- Add no npm packages without asking. Never commit or push.
- Don't invent business rules. Where the BRD or contract is unclear, record the assumption in `frontend/docs/portal/open-questions.md` and continue with the most conservative behaviour.

## Read first (discovery, no code)
1. `BRD/Stories_Addmission_System_BRD.md`:
   - the role table BRO-01 to BRO-09
   - the epics EPIC-01 Application Submission, EPIC-02 Application Verification, EPIC-03 Portfolio Scoring and EPIC-04 Screening and Score Announcement
   - all 60 user stories US-x.y.z with their data dictionaries
2. `User_Stories/` (S, M, L, XL READMEs and `DEPENDENCY-MAP.md`).
3. `Contracts/openapi/openapi.yaml` and every file in `Contracts/openapi/paths/`: `identity`, `catalog`, `applications`, `candidate-lifecycle`, `admission-operations`, `portfolio-scoring`, `screening`, `integrations`. Also `Contracts/decisions.md`, the END-TO-END and PAYMENT agreements, and `Open-Questions.md`.
4. The existing portal: `frontend/projects/dahc-portal`. Note:
   - the core pieces: api, auth, config, locale and session
   - the `features/candidate` area, the `mock/` backend and the environments
   - and the docs in `frontend/docs/candidate-portal/`
5. The DAHC-UI public API: `frontend/projects/dahc-ui/src/public-api.ts`, and the docs site at `npm run start:playground`.

Then write `frontend/docs/portal/00-architecture.md` with:
- **Role matrix:** role → area → stories → screens → contract operations → permissions.
- **Route map** for every area, and a **screen inventory** per story (story id → route → component → API operations → status).
- **Folder structure.**
- **Implementation plan.**

Stop and wait for my approval before writing any code.

## Roles → areas (one lazy-loaded area per role family)
| Area (route prefix) | Roles | Epics / stories |
|---|---|---|
| `/candidate` (exists) | BRO-01 Candidate | EPIC-01 (US-1.1.x, 1.2.x, 1.3.1–1.3.12), US-2.3.4, US-4.3.2 |
| `/admission` | BRO-02 Admission Officer, BRO-03 Admission Supervisor | EPIC-02 (US-2.1.x–2.5.x), EPIC-04 (US-4.1.1–4.5.1) |
| `/scoring` | BRO-04 Referee (R1/R2), BRO-05 Third Referee, BRO-06 2nd Evaluation Referee, BRO-07 Senior Referee | EPIC-03 (US-3.1.x–3.3.x) |
| `/finance` | BRO-08 Finance Officer | US-1.3.13 |
| `/monitoring` | BRO-09 Central Monitor | US-2.1.4 |

Staff users can hold several roles. Implement an **active-role switch**: the session returns `roles[]` and `activeRole`, and the switch is in the header. Routing, navigation and permissions follow the active role. Candidates never see staff areas, and staff never see the candidate area.

## Architecture requirements (Angular 22, current best practices)
- **Components and state:**
  - Standalone components only. No NgModules except where Angular still requires them.
  - `ChangeDetectionStrategy.OnPush` everywhere.
  - Signals (`signal`, `computed`, `input()`, `model()`, `output()`), `rxResource`/`resource` for loads, and `inject()` for dependencies.
  - Strict TypeScript with `exactOptionalPropertyTypes`, no `any`, and typed Reactive Forms.
- **Structure:** feature-based folders. Keep the existing layers and extend them:
  - `core/`: auth, session, api, config, locale, session time-out, permissions.
  - `api/`: one typed client per contract tag, plus models hand-written from the schemas (OQ-08).
  - `layouts/`: one layout per area: header with role-specific navigation and role switch, footer, toast region.
  - `shared/`: pure helpers, pipes, validators, composed components.
  - `features/<area>/<feature>/`: pages, components, facade or state service, and routes.
  - `mock/`: extend the in-browser mock API so every area runs without the backend (`npm run start:mock`), with personas for every role.
- **Routing:**
  - Top level: public pages, `auth/*`, and one `loadChildren` per area (`candidate.routes.ts`, `admission.routes.ts`, `scoring.routes.ts`, `finance.routes.ts`, `monitoring.routes.ts`).
  - Inside each area, `loadComponent` per page.
  - Typed route data (titles via `$localize`, required permissions, breadcrumbs), `withComponentInputBinding`, a not-found page and an unauthorised page.
- **Auth:** keep the existing IDAM OIDC (authorization code + PKCE) flow. Add:
  - `authGuard` (signed in, else sign-in with return URL)
  - `roleGuard(...roles)` / `canMatch` per area, so unauthorised areas are never even loaded
  - `permissionGuard(permission)` for actions inside an area
  - `unsavedChangesGuard` (`CanDeactivate`) for forms
  - A `PermissionService` derived from the active role, plus a `*dahcIfPermitted` structural directive for buttons and links

  Guards are only a usability aid: the API authorises every request. Make that explicit in comments and docs.
- **HTTP:** keep the existing interceptors (token only for the API base URL, envelope to `ApiResult`, Problem Details to `ApiProblemError`, 401 / 403 / 409 handling). Then:
  - Add `X-Active-Role` (or whatever the contract specifies) for staff calls.
  - Use idempotency keys on creates and actions, and `If-Match`/ETag on updates, as the contract requires.
- **Data access:** pages never call `HttpClient`; they use facades and API clients. Use cursor pagination as in the contract (`limit` / `cursor`, allow-listed `sort`).
- **Accessibility, i18n and RTL:** WCAG 2.2 AA, every string through `$localize` with `@@portal.<area>.<key>` ids, English and Arabic builds, dates via the existing `dahcDateTime` pipe in the user's time zone.
- **Security:** no tokens or personal data in browser storage, no `innerHTML`, CSP nonce kept, and inactivity sign-out shared by all areas.

## Delivery in phases (stop for my approval after each)
1. **Discovery and architecture document** (above). No code.
2. **Core:**
   - roles, permissions, active-role switch
   - guards, `canMatch` area loading
   - per-area layouts and navigation
   - unauthorised and not-found pages
   - mock personas for all 9 roles
   - Playwright specs proving each role reaches only its own areas
3. **Admission area (EPIC-02 + EPIC-04):**
   - officer and supervisor dashboards, pool retrieval, workload and reassignment
   - application review: flags, notes, return for correction, complete verification, re-upload
   - screen-out recommendation and decision, escalation, reinstatement queue, ICP refresh
   - screening dashboard, CASPER upload, announce, bulk screen-out, re-announce
   - and the candidate side of corrections (US-2.3.4) in the candidate area
4. **Scoring area (EPIC-03):**
   - referee and senior-referee dashboards, portfolio pool
   - portfolio details, conflict-of-interest return, scoring per question and sub-question
   - submission for Round 1, 2 and 3 and 2nd evaluation
   - senior-referee reassignment and override with justification, evidence re-upload
5. **Finance and monitoring:**
   - payments search and filter with Excel export (US-1.3.13)
   - the central monitoring dashboard with drill-down to read-only application lists and details (US-2.1.4)
6. **Hardening:**
   - lint, `npm run build` (en and ar), Arabic strings
   - full Playwright suite: every story's main flow, axe in light/dark and LTR/RTL, 320 px reflow
   - docs: route map, story coverage table, open questions

For every page, cite its story id in a doc comment and in the screen inventory. Use the BRD data dictionaries for fields, validation and status rules. Show only the actions the API allows (for example `allowedActions`) and never compute permissions the backend owns.

## Finish each phase with
- Files changed, grouped by area, and the commands run with their results (lint, build, Playwright counts).
- New open questions and assumptions, and DAHC-UI gaps found.
- Then stop and wait for my approval.
