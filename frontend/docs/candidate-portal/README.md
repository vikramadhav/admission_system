# GME Candidate Portal

The candidate-facing part of the GME admission application, built in `projects/dahc-portal` on top of DAHC-UI (`projects/dahc-ui`, consumed unchanged). Other roles (admission officer, supervisor, referee, finance, administrator) are out of scope, but the routing keeps each role in its own lazy-loaded area.

Sources:

- Figma GME `49e9Tehx9N8XupCFJC98cW`, page Candidate: [extracts/figma-screen-fields.md](extracts/figma-screen-fields.md) (field level) and [../design-system/figma-extracts/gme-candidate-screens.md](../design-system/figma-extracts/gme-candidate-screens.md) (layout).
- BRD, user stories, contract and backend: [extracts/requirements-and-api.md](extracts/requirements-and-api.md).

Other documents in this folder:

| File | Content |
|---|---|
| [01-dahc-ui-mapping.md](01-dahc-ui-mapping.md) | Which DAHC-UI component each GME need uses, and the portal-level compositions |
| [02-open-questions-and-assumptions.md](02-open-questions-and-assumptions.md) | Decisions taken to unblock the build, and what the business must confirm |
| [03-test-and-visual-report.md](03-test-and-visual-report.md) | Playwright results, Figma comparison, outstanding issues |
| [04-dahc-ui-recommendations.md](04-dahc-ui-recommendations.md) | DAHC-UI gaps found while building (not implemented) |

## 1. Screen inventory

`F` = designed in Figma (node), `B` = specified only in the BRD or contract (built with DAHC-UI patterns, design pending), `D` = derived (needed for a working app, no source).

| # | Screen / state | Route | Source |
|---|---|---|---|
| 1 | Sign-in (IDAM / UAE Pass hand-off; in mock mode a persona chooser) | `/auth/sign-in` | B (CJ-02) |
| 2 | Sign-in callback, signed out, not allowed, duplicate account, not found | `/auth/callback`, `/signed-out`, `/not-allowed`, `/duplicate-account`, `**` | existing |
| 3 | Dashboard, first-time candidate (hero, admission cycle, before you begin) | `/candidate/dashboard` | F `1:5928` |
| 4 | Dashboard, returning candidate (application card, preferences, scores, actions, key dates) | `/candidate/dashboard` | F `1:1938` |
| 5 | Dashboard loading / error states | — | D |
| 6 | My applications (all applications of the candidate) | `/candidate/applications` | B (breadcrumb target, US-1.2.1) |
| 7 | New application, step 1 Program & preferences | `/candidate/applications/new` | F `1:2189` |
| 8 | Wizard step: Program & preferences (existing draft) | `/candidate/applications/:id/steps/program` | F `1:2189` |
| 9 | Wizard step: Application information (sponsorship, employment, declarations, documents, terms) | `…/steps/application-information` | F `1:2505` |
| 10 | Wizard step: Personal information › Identity | `…/steps/personal-identity` | F `1:2781` |
| 11 | Wizard step: Personal information › Contact (with OTP verification of changed contacts) | `…/steps/personal-contact` | F `1:3208`, B (CJ-19) |
| 12 | Wizard step: Personal information › Next of kin | `…/steps/personal-next-of-kin` | F `1:3396` |
| 13 | Wizard step: Personal information › Identification attachments | `…/steps/personal-attachments` | F `1:3604` |
| 14 | Wizard step: University grades (GPA conversion, shortlisting score) | `…/steps/academic-information` | F `1:3827` |
| 15 | Wizard step: English proficiency (IELTS / TOEFL / OET / EmSAT rules) | `…/steps/english-proficiency` | F `1:4064` |
| 16 | Wizard step: Internship information | `…/steps/internship-information` | F `1:4255` |
| 17 | Wizard step: Residency information (Fellowship) | `…/steps/residency-information` | F `1:4456` |
| 18 | Wizard step: Board & license (Fellowship, repeatable boards) | `…/steps/board-license-information` | F `1:4647` |
| 19 | Wizard step: Entrance exam (Residency) | `…/steps/residency-entrance-exam` | B (US-1.3.9; no Figma screen) |
| 20 | Wizard step: Portfolio (question cards, evidence, one-time submission confirmation) | `…/steps/portfolio` | F `1:4900` |
| 21 | Wizard step: Review, pay & submit (summary, section checklist) | `…/steps/pay-and-submit` | F `1:5351` |
| 22 | Payment gateway hand-off (mock gateway page in mock mode) | external / `/mock-payment-gateway` | B (US-1.3.12) |
| 23 | Payment return: confirming, failed/cancelled with retry, submitted dialog | `/candidate/applications/:id/payment-return` | F `1:5621` (success), B (failure) |
| 24 | View application (read-only wizard, any status) | `/candidate/applications/:id` → `…/steps/…` in view mode | B (US-1.2.2) |
| 25 | Portfolio result and score appeal | `/candidate/applications/:id/portfolio-result` | B (US-1.2.7, US-4.3.2) |
| 26 | Dialogs: discard draft, withdraw (reason → OTP), request reinstatement, edit preferences (drawer), exclude training sites, change-program data-loss warning, portfolio submission confirmation, pay & submit confirmation, contact OTP, session time-out warning | — | B / D |
| 27 | My account (profile summary from the session) | `/candidate/account` | D (header profile pill; the BRD has no profile page, CJ-21) |

Not built, with reason:

- **Notifications inbox:** the BRD and the contract define e-mail/SMS notifications only (CJ-22). The header shows no bell. Recorded in doc 02.
- **Correct a returned application (US-2.3.4):** the contract offers no candidate read of correction flags and no action value (OQ-C6). A CORRECTION_REQUIRED application shows its status and a note to follow the e-mail instructions.
- **Programs browse page, documents library, assessments:** no requirement. Documents live inside each section (CJ-20).

## 2. Architecture

```
projects/dahc-portal/src/
├── environments/                   environment.ts (production template), .development.ts (real API on localhost), .mock.ts (in-memory API)
└── app/
    ├── app.routes.ts               public + auth routes, lazy role areas (/candidate today), legacy redirects, not-found
    ├── api/                        data access: one service per contract tag, models hand-written from the OpenAPI schemas
    ├── core/                       api (interceptors, problems), auth (IDAM, session, role guard), config, locale, session time-out
    ├── layouts/                    candidate-layout (header, footer, toasts, time-out), public-layout
    ├── shared/                     program rules (variants), status display, form helpers and validators, catalog names, small compositions
    ├── features/
    │   ├── auth/                   sign-in page
    │   ├── status/                 callback and status pages (existing)
    │   └── candidate/              candidate.routes.ts (lazy) + dashboard, applications, application-wizard, payment, portfolio-result, actions (dialogs), account
    └── mock/                       mock backend (interceptor + store + personas + mock auth); referenced only from environment.mock.ts
```

Principles:

- **Presentation never calls HttpClient.** Components use `api/*` services (contract shapes); feature services (`WizardStateService`, `DashboardFacade`) hold state as signals.
- **The mock backend sits behind the same HTTP contract.** `mockApiInterceptor` answers `/api/v1/**` from an in-memory store, with the contract's envelopes, ETags and Problem Details, so switching to the .NET API is a configuration change (`environment.development.ts`). Mock code is imported only by `environment.mock.ts`, so production bundles never contain it.
- **Role areas:** each role is a lazy route tree with its own layout and guard (`candidateGuard` checks the active role). The API stays authoritative; the guard is a usability aid.
- **Typed sections:** the wizard uses typed Reactive Forms per contract section (`sectionKey`), saved with `PUT /applications/{id}/sections/{sectionKey}`. The dynamic form-schema alternative (OQ-02) is still open; the field codes used are the portal's (doc 02, A-03).
- **Program variants** (Internship, Certificate, Medical / Dental / Pharmacy Residency, Fellowship) are resolved once in `shared/program-rules.ts`: steps, preference count, candidate statuses, exams, portfolio set, fee.

## 3. Routes

| Path | Guard | Component |
|---|---|---|
| `/` | — | redirect `/candidate/dashboard` |
| `/auth/sign-in` | — | sign-in page (public layout) |
| `/auth/callback`, `/signed-out`, `/not-allowed`, `/duplicate-account` | — | status pages (public layout) |
| `/candidate` | `candidateGuard` (signed in, active role CANDIDATE) | candidate layout, lazy children: |
| `  dashboard` | | dashboard |
| `  applications` | | my applications |
| `  applications/new` | | wizard (create mode, program step) |
| `  applications/:applicationId` | | redirect to the first step (view or edit by status) |
| `  applications/:applicationId/steps/:stepId` | | wizard |
| `  applications/:applicationId/payment-return` | | payment return |
| `  applications/:applicationId/portfolio-result` | | portfolio result / appeal |
| `  account` | | my account |
| `/mock-payment-gateway` | mock mode only (`canMatch`) | mock gateway |
| `/dashboard`, `/applications/**` | — | redirects to the `/candidate` paths (old links) |
| `**` | — | not found |

## 4. Running

- `npm run start:mock`: the portal with the mock API (http://localhost:4200). Choose a persona on the sign-in page.
- `npm start`: the portal against the API at `https://localhost:5001/api/v1` with IDAM (development values in `environment.development.ts`).
- `npm run e2e`: Playwright, including the candidate portal specs (mock mode).
