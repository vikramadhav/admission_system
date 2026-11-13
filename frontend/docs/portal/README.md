# DAHC portal: all roles

The Angular portal in `projects/dahc-portal`, built from DAHC-UI only. Every role has its own lazy area. Until the .NET API implements the operations, the portal runs against an in-browser mock of the contract (`npm run start:mock`).

| Document | Contents |
|---|---|
| [00-architecture.md](00-architecture.md) | role matrix, permissions, routing, folder structure, the full screen inventory (60 stories), the plan |
| [open-questions.md](open-questions.md) | PQ-01 to PQ-43: contract gaps, business questions, assumptions |
| [dahc-ui-gaps.md](dahc-ui-gaps.md) | GAP-01 to GAP-19: what DAHC-UI is missing and how the portal composes it meanwhile |
| [PROMPT-multi-role-portal.md](PROMPT-multi-role-portal.md) | the brief |
| [../candidate-portal/](../candidate-portal/) | the candidate area (built first) |

## Run it

```
npm run start:mock       # http://localhost:4200, sample data, persona sign-in (one-time codes: 123456)
npm run start            # development build against the real API and IDAM (environment.development.ts)
npm run e2e              # Playwright: playground, portal, candidate and staff projects
```

The sign-in page of the mock build lists candidates and staff:

| Persona | Role | Lands on |
|---|---|---|
| Mohammed Al Mansoori, Aisha Khan, Mohamed Hazim, Fatima Al Suwaidi, Omar Haddad | Candidate (first visit, draft, submitted, scores announced, withdrawn) | `/candidate/dashboard` |
| Salma Darwish | Candidate with an application returned for correction | `/candidate/dashboard` |
| Noura Al Hashimi (also "Staff member") | Admission officer | `/admission/officer` |
| Khalid Rahman | Admission supervisor | `/admission/supervisor` |
| Dr. Layla Nasser | Referee (Round 1 and 2) | `/scoring/referee` |
| Dr. Ahmed Saleh | Third referee | `/scoring/referee` |
| Dr. Mariam Qasim | 2nd evaluation referee | `/scoring/referee` |
| Dr. Yousef Karim | Senior referee | `/scoring/senior` |
| Huda Mansour | Finance officer | `/finance/payments` |
| Salem Obaid | Central monitor | `/monitoring` |
| Reem Al Falasi | Administrator | `/admin/staff-users` |
| Demo staff (all roles) | every staff role, to try the role switch | `/admission/officer` |

Each Playwright test (and each browser tab) starts with fresh mock data. **Restore the sample data** on the sign-in page resets it manually.

## Roles and the temporary role switch

- **Security model:** the active role decides navigation, page guards (`canMatch` per area, a permission guard per page) and which actions show. All of this is a usability aid. The API authorizes every request with the server-stored active role.
- **The switch (owner decision 2026-11-13):** staff with more than one role get a "Working as … / Switch role" bar under the header. It calls `PUT /auth/active-role` and opens the new role's home.
- **Removing it later:** the bar disappears without code changes once each user has one role, after IDAM integration. To delete it, remove `layouts/shared/role-switch.component.ts`, its tag in `layouts/staff-layout/staff-layout.component.ts`, and `core/session/role-sync.service.ts`.

## Route map

| Area (guard) | Route | Page | Stories |
|---|---|---|---|
| public | `/auth/sign-in`, `/auth/callback`, `/signed-out`, `/unauthorised`, `/no-area`, `/duplicate-account`, `**` | sign-in, status pages | US-1.1.1, US-1.1.2 |
| — | `/` | redirects to the active role's home | — |
| `/candidate` (CANDIDATE) | `dashboard`, `applications`, `applications/new`, `applications/:id/steps/:step`, `…/payment-return`, `…/portfolio-result`, `…/corrections`, `account` | candidate portal | EPIC-01, US-2.3.4, US-4.3.2 |
| `/admission` (officer, supervisor) | `officer` | officer dashboard, retrieve | US-2.1.2, US-2.2.1 |
| | `applications/:applicationId` | application review (officer and supervisor actions) | US-2.3.1–2.3.6, US-2.4.1–2.4.5, US-2.5.2, US-2.5.3 |
| | `supervisor` | supervisor dashboard, queues, officer and referee workload | US-2.1.3, US-2.2.2, US-3.1.3 |
| | `supervisor/officers/:officerId` | officer workload, reassign / return | US-2.2.2, US-2.2.3 |
| | `supervisor/reinstatements`, `supervisor/reinstatements/:requestId` | reinstatement queue and decision | US-2.5.1, US-2.5.2 |
| | `supervisor/duplicate-accounts` | duplicate account report | US-1.1.1 |
| | `screening` | screening dashboard, CASPER, announce, screen-out, reannounce | US-4.1.1, US-4.2.1, US-4.3.1, US-4.4.1, US-4.5.1 |
| `/scoring` (referee roles, senior referee) | `referee` | referee dashboard, retrieve | US-3.1.2, US-3.2.1 |
| | `referee/portfolios/:portfolioId` | portfolio scoring, conflict of interest | US-3.3.1–3.3.4 |
| | `senior`, `senior/referees/:refereeId`, `senior/portfolios/:portfolioId` | oversight, reassign / override, replace evidence | US-3.1.3, US-3.2.2, US-3.2.3 |
| `/finance` (finance officer) | `payments` | payments search, Excel export | US-1.3.13 |
| `/monitoring` (central monitor, supervisor) | `''`, `applications`, `applications/:applicationId` | charts, drill-down, read-only application | US-2.1.4 |
| `/admin` (administrator) | `staff-users`, `staff-users/:staffUserId`, `integration-clients` | staff users, roles, integration clients | contract Administration |

## Story coverage

All 60 BRD stories have a screen. The full table, with operations, is in [00-architecture.md §5](00-architecture.md#5-screen-inventory-all-60-stories).

| Epic | Stories | Built | Works only on the mock until the contract changes |
|---|---|---|---|
| EPIC-01 Application submission | 23 | 23 | – |
| EPIC-02 Application verification | 21 | 21 | US-2.2.1 (PQ-03 pools), US-2.3.2 and US-2.3.4 (PQ-04 flags), US-2.5.3 (PQ-05 candidate id); the review page needs PQ-25 |
| EPIC-03 Portfolio scoring | 10 | 10 | US-3.2.1 (PQ-03 pools); scoring needs PQ-36 |
| EPIC-04 Screening and announcement | 6 | 6 | US-4.2.1 (PQ-12 cycle id) |

**Contract proposals the mock already returns.** Each is marked `PROPOSAL` in `api/*.models.ts`:
- `pools[]` on the officer and referee dashboards (PQ-03)
- the `review` block on the staff application read (PQ-25)
- the candidate's correction flags read (PQ-04)
- the scoring `context` and question metadata, plus the senior `oversight` block (PQ-36)

## Testing

- **Playwright projects:**
  - `staff`: the staff specs in `tests/playwright/specs/staff/` (role access, admission, scoring, finance, monitoring, admin, and an accessibility sweep of every staff page in light/dark × LTR/RTL at 320 px)
  - `candidate`: the mock build on port 4201
  - `portal`: the development build on port 4200, with IDAM and the API mocked in the test
  - `playground`: port 4300
- **Port 4200:** the `portal` project needs the development build there. Stop any `npm run start:mock` on port 4200 before running it, otherwise Playwright reuses that server and those tests fail.
- **Arabic:** all strings are in `src/locale/messages.ar-AE.json`. The Arabic for the staff areas is machine-translated and needs native review (A-16).
