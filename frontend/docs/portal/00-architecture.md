# DAHC portal: multi-role architecture

Status: **Phases 1–5 approved; Phase 6 (hardening) done** (2026-11-13). Overview, route map and personas: [README.md](README.md). Branch: `feature/dahc-portal-multi-role`.

Owner decisions of 2026-11-13:
- **Role switch:** put it in the header now. It is temporary: once IDAM integration lands, each user will have one role and the switch goes away. It shows only for users with 2+ roles, so it disappears without code changes.
- **Changes allowed:** `projects/dahc-portal` may now be changed. DAHC-UI porting is on hold, and `frontend/CLAUDE.md` is updated to match.
- **Admin area:** `/admin` is in scope (PQ-06 resolved).

Companion documents:
- [open-questions.md](open-questions.md): open questions and assumptions (PQ-xx)
- [dahc-ui-gaps.md](dahc-ui-gaps.md): what DAHC-UI is missing (GAP-xx)
- [PROMPT-multi-role-portal.md](PROMPT-multi-role-portal.md): the brief

Sources read:
- `BRD/Stories_Addmission_System_BRD.md`: BRO-01 to BRO-09, EPIC-01 to EPIC-04, 60 stories
- `User_Stories/DEPENDENCY-MAP.md`
- `Contracts/openapi/openapi.yaml` v0.10.0 and every path module (97 operations)
- `Contracts/decisions.md`, the END-TO-END and PAYMENT agreements, `Open-Questions.md`
- `projects/dahc-portal`, `projects/dahc-ui` (public API and ported barrels), `docs/candidate-portal/`
- `dahc-engineering-standards (2).md` Part 2

---

## 0. Priority

Resolved on 2026-11-13: the multi-role portal now has priority. `frontend/CLAUDE.md` is updated, and DAHC-UI is still not changed by this work.

---

## 1. Key findings that shape the design

1. **The active role is stored on the server. No request header carries it.**
   - The contract defines no `X-Active-Role` header and no claim. `PUT /auth/active-role {roleCode}` switches it and returns `AuthSession`.
   - The switch applies on every tab and device, so the portal re-reads `GET /auth/me` when a tab regains focus and after any `403`, and moves to the new role's home if the role changed elsewhere.
   - The prompt's `X-Active-Role` header is therefore **not** added (PQ-01).
2. **Only the candidate dashboard returns `allowedActions`.** No staff resource does.
   - Staff buttons are derived from active role + status in one place per workflow (`shared/workflow/*-actions.ts`). Each rule cites its BRD story.
   - The UI hides an action when a rule says it can't happen. The API still decides, and its `409` / `422` Problem is shown as returned (PQ-02).
3. **Officers and referees can't find their own pools.**
   - Retrieval needs a `poolId`. Officer inbox items carry `poolId`, but the session and the referee dashboard don't. An officer with an empty inbox, or any referee, has no `poolId` to retrieve with.
   - **This blocks US-2.2.1 and US-3.2.1 against the real API.** The mock adds a proposed `pools[]` to both dashboards, marked as a proposal (PQ-03).
4. **Candidates can't read correction flags.**
   - `saveApplicationCorrectionFlags` is officer-only, and neither `Application` nor `ApplicationSection` returns flags or notes.
   - That blocks US-2.3.4 (the candidate edits flagged items) and also blocks the officer from reloading saved flags (US-2.3.2 "edit or remove own notes"). This is PQ-04, continuing OQ-C6 / A-15.
5. **ICP refresh can't be reached.** Its endpoints take `candidateId`, and no staff read model returns one (PQ-05).
6. **ADMINISTRATOR gets an `/admin` area** (owner decision; PQ-06 resolved). It covers the contract's 9 Administration operations: staff users and integration clients. The BRD has no stories for it. `/no-area` remains for any unknown role.
7. **The site-monitoring endpoints also allow ADMISSION_SUPERVISOR.** So `/monitoring` is available to Central Monitor **and** Supervisor (PQ-07).
8. **Pagination is cursor-based with no totals.** Lists show "Load more" or "Next page". DAHC-UI only has page-number pagination, so a cursor control is composed in the portal (GAP-02).
9. **Downloads are Bearer-authenticated blobs:** attachments, evidence and the finance `.xlsx`. They are fetched through `HttpClient` and saved with an object URL, never a plain link. The finance export is a server file, so **no Excel npm package is needed** (D-08 does not apply).
10. **DAHC-UI has no chart component.** The monitoring charts (US-2.1.4) are composed in the portal as accessible SVG, each with a data-table alternative (GAP-03).

---

## 2. Role matrix

Role codes are the contract's `StaffRoleCode` and `CANDIDATE`. Each operation's roles come from its `x-dahc-roles`.

| BRO | Role code | Area | Home route | Stories | Main screens | Contract operations | Permissions (client, usability only) |
|---|---|---|---|---|---|---|---|
| BRO-01 | `CANDIDATE` | `/candidate` (exists) | `/candidate/dashboard` | US-1.1.1–1.1.2, 1.2.1–1.2.8, 1.3.1–1.3.12, 2.3.4, 4.3.2 | dashboard, applications, wizard, payment, portfolio result, account, **corrections (new)** | Applications (13), Candidate Lifecycle (14), Payments (3 candidate), Catalog (4), Identity (2) | `candidate.*` |
| BRO-02 | `ADMISSION_OFFICER` | `/admission` | `/admission/officer` | US-2.1.1, 2.1.2, 2.2.1, 2.3.1–2.3.3, 2.3.5, 2.3.6, 2.4.1, 2.4.2, 2.4.5 | officer dashboard, application review | getAdmissionOfficerDashboard, retrieveApplicationsFromPool, getApplicationForVerification, listApplicationAttachmentsForStaff, downloadApplicationAttachmentForStaff, saveApplicationCorrectionFlags, returnApplicationForCorrection, completeApplicationVerification, handleVerificationActionAfterSupervisorFeedback, replaceApplicationAttachment, recommendApplicationScreenOut, escalateApplicationForClarification | `admission.officer.*`, `admission.application.read` |
| BRO-03 | `ADMISSION_SUPERVISOR` | `/admission` (+ `/monitoring`, PQ-07) | `/admission/supervisor` | US-2.1.3, 2.2.2, 2.2.3, 2.4.3, 2.4.4, 2.5.1–2.5.3, 4.1.1, 4.2.1, 4.3.1, 4.4.1, 4.5.1; duplicate report (US-1.1.1) | supervisor dashboard, officer workload, application review (decisions), reinstatement queue and detail, duplicate accounts, screening dashboard | getAdmissionSupervisorDashboard, getOfficerWorkload, listPoolOfficers, reassignApplicationToOfficer, reassignApplications, decideApplicationScreenOut, returnApplicationWithClarification, listReinstatementRequests, getReinstatementRequest, decideReinstatementRequest, reinstateScreenedOutApplication, preview/refreshCandidateIcp, listDuplicateAccountPairs, the 5 screening operations, site monitoring (2), replacePortfolioEvidence (PQ-08) | `admission.supervisor.*`, `admission.screening.*`, `admission.application.read`, `monitoring.*` |
| BRO-04 | `REFEREE` | `/scoring` | `/scoring/referee` | US-3.1.1, 3.1.2, 3.2.1, 3.3.1–3.3.4 | referee dashboard, portfolio scoring | getRefereeDashboard, retrievePortfoliosFromPool, getAssignedAnonymizedPortfolio, downloadPortfolioEvidence, declarePortfolioConflictOfInterest, savePortfolioQuestionScores, submitPortfolioScoringRound | `scoring.referee.*` |
| BRO-05 | `THIRD_REFEREE` | `/scoring` | `/scoring/referee` | same as BRO-04, Round 3 only | same, discrepancy pool | same | `scoring.referee.*` |
| BRO-06 | `SECOND_EVALUATION_REFEREE` | `/scoring` | `/scoring/referee` | same as BRO-04, appealed questions only | same, appeal pool | same | `scoring.referee.*` |
| BRO-07 | `SENIOR_REFEREE` | `/scoring` | `/scoring/senior` | US-3.1.1, 3.1.3, 3.2.2, 3.2.3 | senior dashboard, referee inbox, portfolio oversight | getSeniorRefereeDashboard, listRefereePortfoliosForSeniorReferee, getPortfolioForSeniorReferee, listEligibleReferees, reassignPortfolio, overridePortfolioRoundScore, replacePortfolioEvidence, downloadPortfolioEvidenceForSeniorReferee | `scoring.senior.*` |
| BRO-08 | `FINANCE_OFFICER` | `/finance` | `/finance/payments` | US-1.3.13 | payments search and export | listFinancePaymentRecords, exportFinancePaymentRecords | `finance.payments.*` |
| BRO-09 | `CENTRAL_MONITOR` | `/monitoring` | `/monitoring` | US-2.1.4 | monitoring dashboard, drill-down list, read-only application | getCentralSiteMonitoringDashboard, listSiteMonitoringApplications, getApplicationForVerification, staff attachment list and download | `monitoring.*` |
| – | `ADMINISTRATOR` | `/admin` | `/admin/staff-users` | none in the BRD (contract only) | staff users (list, pre-register, roles and pools, deactivate/reactivate), integration clients | listStaffUsers, preRegisterStaffUser, getStaffUser, setStaffUserRoles (If-Match = body `version`, 409 when stale), deactivateStaffUser, reactivateStaffUser, listIntegrationClients, registerIntegrationClient, updateIntegrationClient | `admin.staffUsers.manage`, `admin.integrationClients.manage` |

**Separation rules:**
- `roles[]` is either `CANDIDATE` alone or staff roles only (D-04). The candidate area's `canMatch` requires `activeRole === 'CANDIDATE'`, and every staff area requires a staff active role.
- Candidates never see the role switch. Staff can never reach `/candidate` (D-14).
- The BRD role table says BRO-02 "announces results". EPIC-04 gives announcing only to the Supervisor, and the contract allows only `ADMISSION_SUPERVISOR`. The portal follows the contract (PQ-09).

### 2.1 Permission catalogue

`core/permissions/permissions.ts` defines a `DahcPermission` string union and a `ROLE_PERMISSIONS: Record<RoleCode, readonly DahcPermission[]>` map. The map copies the contract's `x-dahc-roles` and adds nothing.

`PermissionService.has(p)` is a `computed` over `SessionService.session().activeRole`. A header comment says it is **only a usability aid**: the API authorises every request.

| Permission | Roles |
|---|---|
| `candidate.portal` | CANDIDATE |
| `admission.officer.dashboard`, `admission.pool.retrieve`, `admission.application.flag`, `admission.application.returnForCorrection`, `admission.application.completeVerification`, `admission.application.replaceAttachment`, `admission.application.recommendScreenOut`, `admission.application.escalate`, `admission.application.continueAfterFeedback` | ADMISSION_OFFICER |
| `admission.application.read`, `admission.attachment.download` | ADMISSION_OFFICER, ADMISSION_SUPERVISOR, CENTRAL_MONITOR |
| `admission.supervisor.dashboard`, `admission.workload.read`, `admission.application.reassign`, `admission.screenOut.decide`, `admission.clarification.respond`, `admission.reinstatement.read`, `admission.reinstatement.decide`, `admission.application.reinstate`, `admission.icp.refresh`, `admission.duplicates.read` | ADMISSION_SUPERVISOR |
| `admission.screening.read`, `admission.screening.casperImport`, `admission.screening.announce`, `admission.screening.bulkScreenOut`, `admission.screening.reannounce` | ADMISSION_SUPERVISOR |
| `scoring.referee.dashboard`, `scoring.pool.retrieve`, `scoring.portfolio.read`, `scoring.portfolio.score`, `scoring.portfolio.declareConflict` | REFEREE, THIRD_REFEREE, SECOND_EVALUATION_REFEREE |
| `scoring.senior.dashboard`, `scoring.portfolio.reassign`, `scoring.portfolio.override`, `scoring.portfolio.readAll` | SENIOR_REFEREE |
| `scoring.evidence.replace` | SENIOR_REFEREE, ADMISSION_SUPERVISOR (PQ-08) |
| `finance.payments.read`, `finance.payments.export` | FINANCE_OFFICER |
| `monitoring.dashboard.read`, `monitoring.applications.read` | CENTRAL_MONITOR, ADMISSION_SUPERVISOR |

Status rules are separate from role permissions. They live in pure functions, for example `verificationActions(item, role): readonly VerificationAction[]` in `shared/workflow/verification-actions.ts`, each with its BRD rule. Examples:
- Complete Verification is available from In Progress, Correction Submitted, Clarification Submitted and Re-evaluating (EPIC-02 status table).
- Return for Correction needs at least one saved flag (US-2.3.3).

---

## 3. Active-role switch and session

- `SessionService` gains:
  - `replaceSession(session)`
  - `refresh()`, which re-reads `GET /auth/me`
  - `switchRole(roleCode)`, which calls `AuthApiService.switchActiveRole` (`PUT /auth/active-role`, no idempotency key per the contract)
- After a switch:
  1. Replace the session signal. Permissions and navigation are `computed`, so they update.
  2. Navigate to `roleHome(activeRole)`.
  3. Announce "Now working as <role>" through `DahcLiveAnnouncer`.
- `roleHome()` lives in `core/auth/role-home.ts` and replaces every hard-coded `/candidate/dashboard`: the root redirect, `AuthService.signIn()` default and `consumeReturnPath()`.
- **Cross-tab:** on `visibilitychange` (visible) and on any `403`, the portal calls `refresh()`. If `activeRole` changed, it shows a toast and navigates to the new home. No role is stored in browser storage.
- **Switch UI (temporary, owner decision 2026-11-13):**
  - `dahc-app-header` has no slot (GAP-01), so `RoleSwitchComponent` is attached to the bottom edge of the header. It reads "Working as <role>" and has a `dahc-menu` "Switch role" listing the user's other roles.
  - It renders only for staff with 2+ roles, so it disappears without code changes once each user has a single role. Delete `layouts/shared/role-switch.component.ts` and its tag in the staff layout when IDAM integration is done.
  - If DAHC-UI later adds a header slot, the same component moves inside the header.
- **Inactivity:** `InactivityService` and its warning modal move from `CandidateLayoutComponent` into one `PortalSessionChromeComponent`, used by every signed-in layout.

---

## 4. Routing

### 4.1 Top level (`app.routes.ts`)

```
''                         -> roleHomeRedirect (functional redirect: signed out -> /auth/sign-in; else roleHome(activeRole))
dashboard, applications/*  -> legacy redirects to /candidate/... (kept)
candidate   canMatch [authGuard, roleGuard('CANDIDATE')]                              loadChildren CANDIDATE_ROUTES
admission   canMatch [authGuard, roleGuard('ADMISSION_OFFICER','ADMISSION_SUPERVISOR')] loadChildren ADMISSION_ROUTES
scoring     canMatch [authGuard, roleGuard('REFEREE','THIRD_REFEREE','SECOND_EVALUATION_REFEREE','SENIOR_REFEREE')] loadChildren SCORING_ROUTES
finance     canMatch [authGuard, roleGuard('FINANCE_OFFICER')]                         loadChildren FINANCE_ROUTES
monitoring  canMatch [authGuard, roleGuard('CENTRAL_MONITOR','ADMISSION_SUPERVISOR')]  loadChildren MONITORING_ROUTES
admin       canMatch [authGuard, roleGuard('ADMINISTRATOR')]                           loadChildren ADMIN_ROUTES
'' (PublicLayout): auth/sign-in, auth/callback, signed-out, unauthorised, no-area, duplicate-account, ** not-found
```

- `canMatch` means a role that isn't allowed never downloads the area's chunk.
- When `roleGuard` fails it returns a `UrlTree` to `/unauthorised`. It does not fall through to `**`, so an unauthorised page is never mistaken for a missing one.
- `authGuard` keeps the existing `candidateGuard` steps: failure → callback; signed out → `signIn(returnUrl)`; then `ensureSession`. `candidateGuard` becomes `roleGuard('CANDIDATE')`.
- `not-allowed` stays as an alias of `unauthorised` so existing links keep working.

### 4.2 Typed route data

```ts
interface DahcRouteData {
  readonly permission?: DahcPermission;            // checked by permissionGuard
  readonly breadcrumb?: string;                     // $localize text
  readonly story?: readonly string[];               // e.g. ['US-2.3.1'] (traceability, also shown in docs)
}
```

- `title` uses `$localize` with `@@portal.title.<area>.<page>`.
- `permissionGuard(p)` applies inside an area: for example, only a Supervisor can open `/admission/screening`.
- `unsavedChangesGuard` is a `CanDeactivate<DahcHasUnsavedChanges>`. It covers the scoring form, the flag notes panel, the corrections form and the existing wizard.

### 4.3 Route map per area

Every page is `loadComponent`. Ids in URLs are UUIDs (D-19); the application number is shown on screen.

**`/candidate`** (exists; new parts in bold)

| Route | Component | Stories |
|---|---|---|
| `dashboard` | DashboardPageComponent | US-1.2.1, 1.2.3–1.2.8, 4.3.2 |
| `applications` | ApplicationsPageComponent | US-1.2.1, 1.2.2 |
| `applications/new`, `applications/:applicationId/steps/:stepId` | WizardPageComponent | US-1.3.1–1.3.12 |
| `applications/:applicationId/payment-return` | PaymentReturnPageComponent | US-1.3.12 |
| `applications/:applicationId/portfolio-result` | PortfolioResultPageComponent | US-1.2.7, 4.3.2 |
| **`applications/:applicationId/corrections`** | **CorrectionsPageComponent** | **US-2.3.4** (blocked on PQ-04; mock only) |
| `account` | AccountPageComponent | derived |

**`/admission`** (`AdmissionLayoutComponent`: header, role bar, side navigation filtered by permission)

| Route | Component | Permission | Stories |
|---|---|---|---|
| `''` | redirect to `officer` or `supervisor` by active role | – | – |
| `officer` | OfficerDashboardPageComponent | admission.officer.dashboard | US-2.1.2, 2.2.1 |
| `applications/:applicationId` | StaffApplicationPageComponent (actions vary by role) | admission.application.read | US-2.3.1–2.3.3, 2.3.5, 2.3.6, 2.4.1–2.4.5, 2.5.3 |
| `supervisor` | SupervisorDashboardPageComponent (inbox filtered by queue: escalation, screen-out, reinstatement) | admission.supervisor.dashboard | US-2.1.3, 2.2.2 (level 1), 3.1.3 (referees workload panel) |
| `supervisor/officers/:officerId` | OfficerWorkloadPageComponent (+ reassign dialog) | admission.workload.read | US-2.2.2 (level 2), 2.2.3 |
| `supervisor/reinstatements` | ReinstatementQueuePageComponent | admission.reinstatement.read | US-2.5.1 |
| `supervisor/reinstatements/:requestId` | ReinstatementRequestPageComponent | admission.reinstatement.read | US-2.5.1, 2.5.2 |
| `supervisor/duplicate-accounts` | DuplicateAccountsPageComponent (read-only) | admission.duplicates.read | US-1.1.1 (report) |
| `screening` | ScreeningDashboardPageComponent (+ CASPER, announce, bulk screen-out, reannounce panels) | admission.screening.read | US-4.1.1, 4.2.1, 4.3.1, 4.4.1, 4.5.1 |

**`/scoring`** (`ScoringLayoutComponent`)

| Route | Component | Permission | Stories |
|---|---|---|---|
| `''` | redirect by role: referee roles to `referee`, Senior Referee to `senior` | – | – |
| `referee` | RefereeDashboardPageComponent | scoring.referee.dashboard | US-3.1.2, 3.2.1 |
| `referee/portfolios/:portfolioId` | PortfolioScoringPageComponent | scoring.portfolio.read | US-3.3.1–3.3.4 |
| `senior` | SeniorRefereeDashboardPageComponent | scoring.senior.dashboard | US-3.1.3 |
| `senior/referees/:refereeId` | RefereeInboxPageComponent | scoring.senior.dashboard | US-3.1.3, 3.2.2 |
| `senior/portfolios/:portfolioId` | SeniorPortfolioPageComponent (+ reassign/override dialog, replace evidence) | scoring.portfolio.readAll | US-3.1.3, 3.2.2, 3.2.3 |

**`/finance`** (`FinanceLayoutComponent`, no side navigation: one screen)

| Route | Component | Permission | Stories |
|---|---|---|---|
| `''` | redirect to `payments` | – | – |
| `payments` | PaymentsPageComponent | finance.payments.read | US-1.3.13 |

**`/admin`** (staff layout)

| Route | Component | Permission | Source |
|---|---|---|---|
| `''` | redirect to `staff-users` | – | – |
| `staff-users` | StaffUsersPageComponent (+ pre-register, roles, deactivate dialogs) | admin.staffUsers.manage | contract Administration |
| `staff-users/:staffUserId` | StaffUserPageComponent | admin.staffUsers.manage | contract Administration |
| `integration-clients` | IntegrationClientsPageComponent (+ register/update dialog) | admin.integrationClients.manage | contract Administration |

**`/monitoring`** (staff layout)

| Route | Component | Permission | Stories |
|---|---|---|---|
| `''` | MonitoringDashboardPageComponent | monitoring.dashboard.read | US-2.1.4 |
| `applications` | MonitoringApplicationsPageComponent (filters in query params from the chart segment) | monitoring.applications.read | US-2.1.4 |
| `applications/:applicationId` | StaffApplicationPageComponent in read-only mode, imported from `features/admission` through a shared view component | monitoring.applications.read | US-2.1.4 |

The read-only application view is a `shared/staff-application/` component, not a cross-area import. Both `/admission` and `/monitoring` use it.

---

## 5. Screen inventory (all 60 stories)

Status key:
- **E**: exists in the candidate portal
- **P2**–**P5**: built in that phase (✔ = done)
- **B**: built against the mock but blocked on the real API (see the PQ id)
- **–**: no screen (IDAM-owned or background)

Operation names are contract `operationId`s.

### EPIC-01 Application Submission (23)

| Story | Route | Component | API operations | Status |
|---|---|---|---|---|
| US-1.1.1 Register | `/auth/sign-in` → IDAM; duplicate → `/duplicate-account` | SignInPage, StatusPage | signIn | E |
| US-1.1.2 Log in | `/auth/sign-in`, `/auth/callback` | SignInPage, SignInStatus | signIn, getCurrentSession | E (role-home redirect P2) |
| US-1.2.1 Dashboard | `/candidate/dashboard` | DashboardPage | getCandidateDashboard | E |
| US-1.2.2 Application details | `/candidate/applications`, wizard read-only | ApplicationsPage, WizardPage | listCandidateApplications, getCandidateApplication, getApplicationSection | E |
| US-1.2.3 Manage draft | dashboard | DiscardDraftDialog | discardCandidateDraft | E |
| US-1.2.4 Withdraw | dashboard | WithdrawDialog | create/confirm/resendWithdrawal | E |
| US-1.2.5 Reinstate request | dashboard | ReinstateDialog | requestApplicationReinstatement | E |
| US-1.2.6 Edit preferences | dashboard | EditPreferencesDrawer | updateCandidatePreferences | E |
| US-1.2.7 Appeal | `/candidate/applications/:id/portfolio-result` | PortfolioResultPage | getCandidatePortfolioResult, submitPortfolioAppeal | E |
| US-1.2.8 Exclude site | dashboard | ExcludeSitesDialog | excludeCandidateTrainingSites | E |
| US-1.3.1–1.3.11 Form steps, draft | `/candidate/applications/:id/steps/:stepId` | WizardPage + steps | create/update draft, sections, attachments, portfolio | E |
| US-1.3.12 Pay and submit | wizard, payment-return | PayAndSubmit, PaymentReturnPage | payment sessions, submitPaidApplication | E |
| US-1.3.13 Finance payments | `/finance/payments` | PaymentsPage | listFinancePaymentRecords, exportFinancePaymentRecords | ✔ P5 |

### EPIC-02 Application Verification (21)

| Story | Route | Component | API operations | Status |
|---|---|---|---|---|
| US-2.1.1 Officer logs in | sign-in → role home | role-home redirect, role bar | signIn, getCurrentSession, switchActiveRole | P2 |
| US-2.1.2 Officer dashboard | `/admission/officer` | OfficerDashboardPage | getAdmissionOfficerDashboard | ✔ P3 |
| US-2.1.3 Supervisor dashboard | `/admission/supervisor` | SupervisorDashboardPage | getAdmissionSupervisorDashboard | ✔ P3 |
| US-2.1.4 Site monitoring | `/monitoring`, `/monitoring/applications[/:id]` | MonitoringDashboardPage, MonitoringApplicationsPage, read-only StaffApplicationView | getCentralSiteMonitoringDashboard, listSiteMonitoringApplications, getApplicationForVerification, staff attachments | ✔ P5 |
| US-2.2.1 Retrieve from pool | `/admission/officer` | OfficerDashboardPage (retrieve) | retrieveApplicationsFromPool | ✔ P3 (mock) / B (PQ-03) |
| US-2.2.2 Officer workload | `/admission/supervisor`, `/admission/supervisor/officers/:officerId` | SupervisorDashboardPage, OfficerWorkloadPage | getAdmissionSupervisorDashboard (officersWorkload), getOfficerWorkload | ✔ P3 |
| US-2.2.3 Reassign | `/admission/supervisor/officers/:officerId` | ReassignDialog | listPoolOfficers, reassignApplications (bulk), reassignApplicationToOfficer | ✔ P3 |
| US-2.3.1 Application details | `/admission/applications/:id` | StaffApplicationPage | getApplicationForVerification, listApplicationAttachmentsForStaff, downloadApplicationAttachmentForStaff | ✔ P3 |
| US-2.3.2 Flags and notes | same | FlagNotesPanel | saveApplicationCorrectionFlags, listLookupValues (note templates) | ✔ P3 (mock) / B (PQ-04, PQ-25) |
| US-2.3.3 Return for correction | same | ReturnForCorrectionDialog | returnApplicationForCorrection | ✔ P3 |
| US-2.3.4 Candidate corrects | `/candidate/applications/:id/corrections` | CorrectionsPage | submitApplicationCorrections (+ a read for flags, missing) | ✔ P3 (mock) / B (PQ-04) |
| US-2.3.5 Complete verification | `/admission/applications/:id` | CompleteVerificationDialog | completeApplicationVerification | ✔ P3 |
| US-2.3.6 Replace attachment | same | ReplaceAttachmentDialog | replaceApplicationAttachment | ✔ P3 |
| US-2.4.1 Recommend screen-out | same | RecommendScreenOutDialog | recommendApplicationScreenOut, listLookupValues | ✔ P3 |
| US-2.4.2 Escalate | same | EscalateDialog | escalateApplicationForClarification | ✔ P3 |
| US-2.4.3 Decide screen-out | same (supervisor) | ScreenOutDecisionDialog | decideApplicationScreenOut | ✔ P3 |
| US-2.4.4 Return with guidance | same (supervisor) | ReturnGuidanceDialog | returnApplicationWithClarification | ✔ P3 |
| US-2.4.5 Handle feedback | same (officer) | supervisor note banner + standard actions | handleVerificationActionAfterSupervisorFeedback | ✔ P3 |
| US-2.5.1 Reinstatement queue | `/admission/supervisor/reinstatements[/:requestId]` | ReinstatementQueuePage, ReinstatementRequestPage | listReinstatementRequests, getReinstatementRequest | ✔ P3 |
| US-2.5.2 Decide reinstatement | same; direct reinstate on the application page | ReinstatementDecisionDialog, DirectReinstateDialog | decideReinstatementRequest, reinstateScreenedOutApplication | ✔ P3 |
| US-2.5.3 ICP refresh | `/admission/applications/:id` | IcpRefreshDialog | previewCandidateIcpRefresh, refreshCandidateInformationFromIcp | ✔ P3 (mock) / B (PQ-05, PQ-25) |

### EPIC-03 Portfolio Scoring (10)

| Story | Route | Component | API operations | Status |
|---|---|---|---|---|
| US-3.1.1 Referee logs in | sign-in → role home | role-home redirect, role bar | signIn, switchActiveRole | P2 |
| US-3.1.2 Referee dashboard | `/scoring/referee` | RefereeDashboardPage | getRefereeDashboard | ✔ P4 |
| US-3.1.3 Senior dashboard | `/scoring/senior`, `/scoring/senior/referees/:id`, `/scoring/senior/portfolios/:id` | SeniorRefereeDashboardPage, RefereeInboxPage, SeniorPortfolioPage | getSeniorRefereeDashboard, listRefereePortfoliosForSeniorReferee, getPortfolioForSeniorReferee | ✔ P4 |
| US-3.2.1 Retrieve portfolios | `/scoring/referee` | RefereeDashboardPage (retrieve) | retrievePortfoliosFromPool | ✔ P4 (mock) / B (PQ-03) |
| US-3.2.2 Reassign / override | `/scoring/senior/portfolios/:id` | ReassignOrOverrideDialog | listEligibleReferees, reassignPortfolio, overridePortfolioRoundScore | ✔ P4 |
| US-3.2.3 Replace evidence | same | ReplaceEvidenceDialog | replacePortfolioEvidence, downloadPortfolioEvidenceForSeniorReferee | ✔ P4 (supervisor entry point: PQ-08) |
| US-3.3.1 Portfolio details | `/scoring/referee/portfolios/:id` | PortfolioScoringPage | getAssignedAnonymizedPortfolio, downloadPortfolioEvidence | ✔ P4 |
| US-3.3.2 Return for COI | same | ConflictOfInterestDialog | declarePortfolioConflictOfInterest | ✔ P4 |
| US-3.3.3 Score questions | same | QuestionScoreCard | savePortfolioQuestionScores (If-Match), listLookupValues (reasons, classifications) | ✔ P4 |
| US-3.3.4 Submit scoring | same | SubmitScoringDialog | submitPortfolioScoringRound | ✔ P4 |

### EPIC-04 Screening and Score Announcement (6)

| Story | Route | Component | API operations | Status |
|---|---|---|---|---|
| US-4.1.1 Screening dashboard | `/admission/screening` | ScreeningDashboardPage | getScreeningDashboard | ✔ P3 |
| US-4.2.1 CASPER upload | same | CasperImportPanel (drawer) | uploadAndProcessCasperResults | ✔ P3 (mock) / B (cycle id: PQ-12) |
| US-4.3.1 Announce | same | AnnouncePanel | announceInitialScores | ✔ P3 |
| US-4.3.2 Candidate scores | `/candidate/dashboard` | DashboardPage | getCandidateDashboard | E |
| US-4.4.1 Bulk screen-out | `/admission/screening` | BulkScreenOutPanel | bulkScreenOutApplications, listLookupValues | ✔ P3 |
| US-4.5.1 Reannounce | same | ReannouncePanel | reannounceAppealScores | ✔ P3 |

**Coverage:** 60 of 60 stories mapped.
- 23 exist: 22 EPIC-01 stories and US-4.3.2.
- 37 are planned. 6 of them (US-2.2.1, 2.3.2, 2.3.4, 2.5.3, 3.2.1, 4.2.1) are blocked against the real API by contract gaps and will work on the mock only.

---

## 6. Folder structure

The existing layers stay in place; new parts are marked `+`.

```
projects/dahc-portal/src/app/
├── app.routes.ts                      + canMatch areas, roleHomeRedirect, unauthorised, no-area
├── api/                               one client per contract tag, hand-written models (OQ-08)
│   ├── auth-api.service.ts            + switchActiveRole
│   ├── … existing candidate clients
│   ├── + admission-api.service.ts     Admission Operations (28)
│   ├── + admission.models.ts
│   ├── + scoring-api.service.ts       Portfolio Scoring (15)
│   ├── + scoring.models.ts
│   ├── + screening-api.service.ts     Screening and Announcements (5)
│   ├── + screening.models.ts
│   ├── + finance-api.service.ts       finance payments (2)
│   ├── + finance.models.ts
│   ├── + lookups-api.service.ts       listLookupValues
│   └── + workflow.models.ts           WorkflowActionResult, BulkWorkflowResult, status enums
├── core/
│   ├── api/                           existing interceptors
│   │   ├── + idempotency.ts           one key per user intent, reused on retry (HttpContext token)
│   │   ├── + concurrency.ts           If-Match from ApiResult.etag; 412/428 → "reload" problem
│   │   ├── + cursor-page.ts           CursorPageState<T> signal helper (items, nextCursor, loadMore)
│   │   └── + file-download.ts         blob fetch + object URL save (attachments, evidence, xlsx)
│   ├── auth/
│   │   ├── + auth.guard.ts            signed in + session
│   │   ├── + role.guard.ts            roleGuard(...roles): CanMatchFn & CanActivateFn
│   │   ├── + permission.guard.ts
│   │   ├── + unsaved-changes.guard.ts
│   │   ├── + role-home.ts
│   │   └── candidate.guard.ts         → removed (replaced by roleGuard('CANDIDATE'))
│   ├── permissions/
│   │   ├── + permissions.ts           DahcPermission, ROLE_PERMISSIONS
│   │   ├── + permission.service.ts
│   │   └── + if-permitted.directive.ts  *dahcIfPermitted
│   ├── routing/ + route-data.ts       DahcRouteData, breadcrumbs resolver
│   ├── session/                       inactivity.service.ts, + role-sync.service.ts (focus/403 refresh)
│   ├── config/ locale/                unchanged
├── layouts/
│   ├── candidate-layout/              uses PortalSessionChrome
│   ├── public-layout/
│   ├── + staff-layout/                one shell for all staff areas: header nav filtered by permission, role switch,
│   │                                   content, footer, toasts, session chrome (staff-nav.ts holds the menu)
│   └── shared/                        + portal-session-chrome, + role-bar, + area-nav
├── shared/
│   ├── existing helpers
│   ├── + workflow/                    verification-actions.ts, portfolio-actions.ts, screening-actions.ts, status labels
│   ├── + staff-application/           read-only application view (sections, attachments, ICP highlight, flags overlay)
│   ├── + cursor-table/                dahc-table + "load more" + server sort (GAP-02)
│   ├── + charts/                      bar-chart, pie-chart (SVG + table alternative) (GAP-03)
│   └── + attachment-viewer/           preview with rotate/zoom (US-2.3.1, 3.3.1)
├── features/
│   ├── auth/, status/                 + unauthorised, no-area kinds
│   ├── candidate/                     + corrections/ (US-2.3.4)
│   ├── + admission/  admission.routes.ts, officer-dashboard/, supervisor-dashboard/, officer-workload/,
│   │                 application-review/ (page + dialogs + review.facade.ts), reinstatements/,
│   │                 duplicate-accounts/, screening/ (page + panels + screening.facade.ts)
│   ├── + scoring/    scoring.routes.ts, referee-dashboard/, portfolio-scoring/ (page + score-card + facade),
│   │                 senior-dashboard/, referee-inbox/, senior-portfolio/
│   ├── + finance/    finance.routes.ts, payments/
│   ├── + monitoring/ monitoring.routes.ts, dashboard/, applications/
│   ├── + admin/      admin.routes.ts, staff-users/, integration-clients/
│   └── + staff/      staff-routes.ts (area helper), area-placeholder-page (until each phase lands)
└── mock/
    ├── mock-backend.service.ts        split into routers: + mock-admission.ts, + mock-scoring.ts,
    │                                   + mock-screening.ts, + mock-finance.ts, + mock-monitoring.ts
    ├── mock-store.ts                  + staff users, applications in review, portfolios, rounds, requests, payments
    └── mock-personas.ts               + one persona per staff role + one multi-role persona
```

Each feature folder follows the candidate pattern:
- pages and components
- a `*.facade.ts`: signal state, `rxResource` loads, and actions that return `Observable<WorkflowActionResult>`
- the area's `*.routes.ts`

Pages never inject `HttpClient`.

---

## 7. Cross-cutting rules

- **HTTP:** existing interceptors unchanged (token only for `apiBaseUrl`, envelope → `ApiResult`, Problem → `ApiProblemError`, 401/403/409). Additions:
  - **Idempotency:** facades create a key once per user intent (for example when a dialog opens) and pass it through an `HttpContext` token. A retry after an error reuses the key, and the key is cleared on success. It is sent only on the 26 operations that declare it.
  - **Concurrency:** clients send `If-Match` with the stored ETag on the 4 ETag operations. On `412` / `428` the page shows "This record changed, reload" and offers a reload. Scoring needs this for `savePortfolioQuestionScores`.
  - **No active-role header** (finding 1).
- **Pagination:** `CursorPageState<T>` keeps the `cursor` bound to filter and sort. Changing either resets the list. Sort keys come from each operation's allow-list (a typed union per operation). Dashboard inboxes read `data.page`; lists read `pagination`.
- **Bulk actions** (reassign, announce, screen-out, reannounce) show the `BulkWorkflowResult` per item: succeeded, and failed with a reason. Nothing is retried silently.
- **Anonymity:** referee screens never render candidate fields, and the models (`PortfolioReview`) have none. A Playwright check confirms no candidate name appears on referee pages.
- **Officer screens never render training sites** (STP-2.1 rule). The staff application view hides the sites block for every role except Supervisor and Central Monitor (PQ-10).
- **Accessibility:** WCAG 2.2 AA.
  - Each page has one `h1` through `dahc-page-header`, and focus moves to it on navigation.
  - Tables have captions. Dialogs return focus to the control that opened them.
  - Charts have a table alternative. Live announcements cover bulk results and role switches.
- **i18n:**
  - Ids are `@@portal.<area>.<key>`, with areas `admission`, `scoring`, `finance`, `monitoring`, `staff` (shared shell) and `workflow` (status labels).
  - Every id gets an Arabic entry in `messages.ar-AE.json`. These are machine-translated and flagged for native review (A-16).
- **Dates:** `dahcDateTime` with `session.preferences.timeZoneId`. Calendar dates such as the finance `from` / `to` are sent as ISO dates, and timestamps with an offset.
- **Security:**
  - No tokens, roles or personal data in storage. Mock data stays in sessionStorage under the existing mock key, in mock builds only.
  - No `innerHTML`. The CSP nonce is unchanged. Downloads use `Blob` object URLs, which are revoked straight after the download starts.

---

## 8. Mock personas (Phase 2)

`npm run start:mock` keeps its persona picker. Planned personas, with the data seeded for each:

| Persona | Roles (active first) | Seeded data |
|---|---|---|
| Existing 5 candidates | CANDIDATE | unchanged; + one with Correction Required and flags (US-2.3.4) |
| Admission officer | ADMISSION_OFFICER | 2 pools, 4 inbox items in various verification statuses |
| Admission supervisor | ADMISSION_SUPERVISOR | escalation, screen-out and reinstatement queues; 3 officers; screening list |
| Referee | REFEREE | standard pool, 2 portfolios (Round 1 and Round 2) |
| Third referee | THIRD_REFEREE | discrepancy pool, 1 portfolio |
| 2nd evaluation referee | SECOND_EVALUATION_REFEREE | appeal pool, 1 portfolio with appealed questions |
| Senior referee | SENIOR_REFEREE | pool insights, 3 referees' workload |
| Finance officer | FINANCE_OFFICER | 30 payment records over 2 cycles |
| Central monitor | CENTRAL_MONITOR | chart data for 6 sites, 5 programs |
| Demo staff (all roles) | all 9 staff roles | for the temporary role switch |
| Administrator | ADMINISTRATOR | staff users and integration clients (Phase 5) |

Contract shapes are followed exactly. The one exception is the proposed `pools[]` on officer and referee dashboards (PQ-03), which is marked `// PROPOSAL (PQ-03)` in the mock and the model.

---

## 9. Implementation plan

Each phase ends with: files changed by area, commands run with results (lint, build en/ar, Playwright counts), new open questions and DAHC-UI gaps. Then I stop for approval.

| Phase | Scope | Exit criteria |
|---|---|---|
| **1. Discovery** (this document) | architecture, open questions, gaps | owner approval; CLAUDE.md priority confirmed |
| **2. Core** | permissions and directive; auth/role/permission/unsaved guards; `canMatch` areas with placeholder area home pages; role-home redirect; active-role switch + cross-tab sync; staff shell and role bar; session chrome lifted out of the candidate layout; unauthorised / no-area / not-found pages using `dahc-result`; mock personas for all roles + `/auth/active-role`; Playwright `staff` project | each persona lands on its home; each role can't load other areas (chunk not requested); switch works and survives reload; candidate suite still green; axe clean light/dark, LTR/RTL |
| **3. Admission** | officer dashboard + retrieve; application review with all officer and supervisor actions and dialogs; supervisor dashboard, workload, reassign; reinstatement queue and decisions; duplicate accounts; ICP refresh; screening dashboard with CASPER, announce, bulk screen-out, reannounce; candidate corrections (US-2.3.4) | main flow per story in Playwright (mock); blocked stories marked in the UI docs, not hidden |
| **4. Scoring** | referee dashboard + retrieve; portfolio scoring (save draft with If-Match, submit, COI); senior dashboard, referee inbox, portfolio oversight, reassign/override, replace evidence | main flow per story; anonymity check; unsaved-changes guard tested |
| **5. Finance, monitoring and admin** | payments search and xlsx download; monitoring dashboard with SVG charts + tables, drill-down, read-only detail; admin staff users (pre-register, roles and pools, deactivate/reactivate) and integration clients | export downloads a file in Playwright; chart segment drill-down works by keyboard; role grant with a stale `version` shows the 409 |
| **6. Hardening** | lint; `npm run build` (en + ar); Arabic strings; full Playwright incl. axe (light/dark × LTR/RTL) and 320 px reflow on every new page; docs: route map, story coverage, open questions | all green; coverage table matches section 5 |

Estimated new files: about 150 (pages, dialogs, facades, models, mock routers, specs).

**Risks:**
1. The blocked contract gaps (PQ-03/04/05) mean some flows work only on the mock until the contract changes.
2. The bundle budget (initial 600 kB warning) is safe because every area is lazy. Phase 6 checks it.
3. The volume of Arabic strings is large, and all of them need native review.
