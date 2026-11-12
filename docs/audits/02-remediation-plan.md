# 02 — Remediation Plan, Collaboration Process and First Slice

**Status: APPROVED FOR IMPLEMENTATION (2026-11-12), step by step as shown in the "Approval" column.** Phase 0 and the independent technical remediation are approved. Database work and work that depends on a business decision stay gated by the decision named. Approved architecture (AP-01 to AP-09) is not reopened.

Every step is non-destructive: it adds or corrects code and deletes or regenerates nothing approved. Each step is a separate, reviewable PR.

---

## 1. Prioritised remediation plan

### Phase 0 — Repository controls (½–1 day; tech lead; before any source-code remediation) — APPROVED

| Step | Action | Closes | Verification |
|---|---|---|---|
| R-0.1 | `git init`; add root ignore rules for build output, IDE state, user secrets and local databases; commit the current tree unchanged; tag `foundation-baseline-2026-11-12`; push to the protected remote once it exists | BE-13c | Tag exists; `git status` is clean; no build output or secrets are tracked |
| R-0.2 | Branch protection: PR-only into `main` and `develop`, 1 approving review (2 for shared patterns), required CI checks | — | A direct push is rejected (needs the hosted remote) |
| R-0.3 | Fill `CLAUDE.md` and `.claude/rules/` (see §3.2) | BE-13d | Agents load the rules |
| R-0.4 | Install .NET SDK 10.0.404 on all machines and CI; generate and commit `package-lock.json` with the pinned versions | BE-13b, part of FE-01 | `dotnet --version`; `npm ci` succeeds |
| R-0.5 | Recover `Open-Questions.md` and `openapi.editor.yaml` from their author; commit them under `docs/decisions/` and `src/contracts/openapi/` | BE-08 (partial) | Every D-/OQ- id cited in the code resolves |

### Phase 1 — Correct before parallel delivery (≈ 2 weeks; owners in brackets)

Order matters where a dependency is shown. **Approval** values:
- **APPROVED**: may start now.
- **GATED**: starts when the named decision is approved or answered.

| P | Step | Closes | Depends on | Approval | Verification |
|---|---|---|---|---|---|
| 1 | **Angular workspace config** [FE lead]: add `angular.json` for `dahc-ui`, `dahc-playground` and `dahc-portal`. Include per-locale builds (en, ar), `fileReplacements` for environments, global styles, playground source assets, lint and extract-i18n targets, and Playwright web servers | FE-01 | R-0.4 | APPROVED | `ng build` (all projects, both locales), `ng lint`, `ng extract-i18n` with no catalogue diff; playground serves real sources |
| 2 | **Backend code-style enforcement** [BE lead]: add the Appendix B `.editorconfig`; fix violations only | BE-07 | — | APPROVED | `dotnet build` 0 warnings; `dotnet format --verify-no-changes` |
| 3 | **Issuer binding** [BE lead]: `IdamIssuer` + composite unique index in the EF model; thread the issuer through loader and sign-in. This implements approved AP-04. The schema reaches a database through step 4 | BE-01 | DEC-01 | APPROVED (code and model); the database script waits for step 4 | InMemory tests: the same `sub` from two issuers gives distinct users; a returning user is matched on issuer + subject; existing tests green. The unique index itself goes on the release-validation checklist (§2.3) |
| 4 | **Initial migration + dev bootstrap** [BE lead, migrations owner]: one reviewed `Initial` migration (schemas, sequence, counters, reference data); a separate dev-only bootstrap seeding one staff user per role and test candidates | BE-05 | DEC-02 (new package), step 3 | GATED: DEC-02 | Idempotent script applies to an empty SQL Server database; a re-run is a no-op (§2.3) |
| 5 | **Dev SFA seeded users** [BE]: username lookup against seeded users from user secrets; profile from the seed, not the request | BE-02 | DEC-06, step 4 | GATED: DEC-06, step 4 | InMemory API tests: 401 for an unknown username; body profile ignored |
| 6 | **Dev SFA UI** [FE]: development-only provider and screen via `fileReplacements`; production bundle check | FE-02 | steps 1, 5 | GATED: step 5 | `grep development/sign-in` over the prod bundle is empty |
| 7 | **Extend the InMemory test suite where meaningful** [BE]. Keep the existing 54 tests. Add tests only for rules not yet covered: provisioning outcomes (duplicate, deactivated, staff not auto-provisioned), draft rules, authorization negative paths and error mapping. Engine-dependent behaviour is **not** claimed here; it goes to the release-validation checklist (§2.3). Use existing boundaries for SQL-only operations (`ICandidateNumberAllocator`, `IApplicationNumberAllocator`, substituted with NSubstitute as today) | BE-06 (reclassified, AP-09) | AP-09 | APPROVED | New tests each protect a named rule; no coverage target; suite stays green |
| 8 | **Security and provisioning audit events** [BE]: explicit audit writer for sign-in outcomes and refusals | BE-03 | DEC-07 | APPROVED (code; any new table goes through the step 4 migration owner) | InMemory tests: DENIED/SUCCESS rows with trace id for each sign-in outcome |
| 9 | **Contract source of truth** [API owner]: generate and commit `openapi.yaml`; CI drift check; resolve the open-cycle contract and `maxPreferences` | BE-08, INT-01/02/04, FE-04 | DEC-04 (new package), DEC-10/11, B-05 | GATED: DEC-04; the cycle contract is GATED on B-05 | The portal draft flow works against the real dev API |
| 10 | **Client auth robustness** [FE]: no sign-in loop on 401 from `/auth/sign-in`; session refresh after not-registered; explicit `response_mode=query`; sign-out state check | FE-06/07/09/14/15 | step 1 | APPROVED | Playwright negative-path specs |
| 11 | **Role switcher + active-role guard** [FE] | FE-03, INT-03 | step 1 | APPROVED | Playwright: a staff user with 2 roles switches; a candidate sees no switcher |
| 12 | **Real-API E2E** [FE + BE]: portal Playwright specs run against a running dev API with dev SFA, one per role. Keep the mocks for component specs | FE-13, INT-06 | steps 4–6 | GATED: steps 4–6 | Run against a dev environment with a SQL Server database. This is a pre-UAT check, not a mandatory per-PR CI dependency (AP-09) |
| 13 | **Trusted reverse-proxy configuration** [BE]: forwarded headers with known proxies or networks from configuration, validated at startup, so the pre-auth limit from 14A partitions per real client behind the gateway | BE-10 (proxy part), BE-13a | DEC-08 (gateway topology), 14A | GATED: DEC-08. **Must be validated together with 14A before UAT** (§2.3) | API tests: a trusted proxy's `X-Forwarded-For` partitions per client; an untrusted source's header is ignored |
| 14A | **Introspection hardening and tests** [BE lead] (DEC-14, approved). Extend `Http/RateLimiting.cs`, `Authentication/Idam/*` and `TokenValidation.cs`; do not rebuild. No new packages and no new abstractions. See the detail below | BE-10 (pre-auth part), BE-14b, BE-14c, AP-08 | DEC-14 | APPROVED | See below |
| 14B | **Scope and audience validation** [BE lead]: required scopes (`Idam:RequiredScopes`) and `aud` checks, per the confirmed IDAM introspection contract | BE-14a, AP-08 item 5 | A-06 (the confirmed IDAM contract), 14A | GATED: A-06. Does not block other foundation work | Missing scope on an otherwise valid token → **403** `token.insufficient_scope`; wrong audience → 401 |

**14A in detail:**
1. **Pre-authentication rate limiting.** Add a limiter partitioned by client address that runs **before** `UseAuthentication`, so a rejected request never causes an introspection call. Use the built-in `System.Threading.RateLimiting` / ASP.NET Core rate limiter. Keep the existing per-user limiter after authentication. The client address comes from step 13 once DEC-08 is approved.
2. **Cache and fail-closed verification.** Use the library's own options. These defaults were confirmed against Duende 7.0.2 on 2026-11-12 (register §1.2):
   - Set `SaveToken = false` explicitly. **The library default is `true`.**
   - Keep the library's SHA-256 cache-key generator and its own `HybridCache` registration.
   - Keep `CacheDuration` from `Idam:IntrospectionCacheMaxSeconds`.
   - Verify by test that a cached result is not accepted after the token's `exp`. The existing `OnTokenValidated` expiry check must hold on cache hits. Only if a test shows it does not, run the same expiry check on each request in the existing validation path. Do not build a custom cache.
   - Verify that every introspection failure ends unauthenticated.
3. **Introspection integration tests** in `DAHC.Test.API`. Use a stub IDAM backchannel `HttpMessageHandler` behind the existing `HttpClientFactory` client: the real handler, with no test authentication handler.
4. **Outbound concurrency bound:** only if the tests or load testing show a need. If needed, use the built-in `ConcurrencyLimiter` inside the existing `IdamBackchannelHandler`, and refuse with 503.

**14A verification (required HTTP outcomes):**

| Case | Outcome |
|---|---|
| Active token, correct issuer and client | 200 |
| Inactive (`active=false`) | 401 |
| Expired, including a cached result past `exp` | 401 |
| Invalid: malformed response, wrong issuer, unregistered client, a JWT-shaped token on a non-Development host | 401 |
| Request rejected by the pre-auth or per-user limit | 429 with `Retry-After`, and no IDAM call for pre-auth rejections |
| IDAM unavailable: 5xx, timeout or unreachable | 503, never 200 or 401 |
| The raw token in captured logs | Absent |

### Phase 2 — Can run in parallel with feature work (not gating)

| Step | Closes | Approval |
|---|---|---|
| A11y primitives (focus trap and restore), dialog, text input, checkbox, with playground pages and specs | FE-11 | APPROVED |
| Grid and spacing utilities, sample custom theme, copy-usage button | FE-12 | APPROVED |
| Visual regression in a pinned container; RTL portal specs | FE-13 | APPROVED |
| CSP / Trusted Types hosting configuration | FE-10 | GATED: DEC-08 |
| Module boundary ADR and §19 Modules | BE-09 | GATED: DEC-09 |
| Replace "standard s.NN" comments with current section ids (comment-only) | BE-08 | APPROVED (after R-0.5) |
| Requirement traits on existing tests | DEC-13 | APPROVED |

### Deferred (until a business decision or a later slice)

- `ADMINISTRATOR` role usage and integration clients (B-01, DF-08).
- Application id format change (B-03).
- Correction-editing of flagged sections (BE-13f).
- IDAM backchannel resilience package and circuit breaker (DF-10).

### Business decisions that stay visible (not finalised by remediation)

No remediation step changes the current behaviour behind these. Code keeps its present behaviour, labelled as provisional, until each is answered.

| Id | Decision | Current behaviour (provisional) |
|---|---|---|
| B-02 | Duplicate-account outcome and matching keys | Duplicate stored inactive; 409 `account.duplicate` |
| B-03 | Application identifier format | `<cycle start year><7 digits>` (BRD L1096) |
| B-04 | One active application per cycle, or one draft per program per cycle | One active application per cycle (unique filtered index) |
| B-05 | Admission cycle model | `/programs` requires `cycleId`; there is no open-cycle discovery |

### Risks of remediation and how to contain them

| Risk | Mitigation |
|---|---|
| The style PR (step 2) touches many files and conflicts with feature branches | Merge it first, before any feature branch exists |
| The initial migration is created in parallel by several people | One migrations owner; later migrations are rebased and regenerated, never hand-merged |
| Adding the issuer changes the identity tables | No production data exists yet; fold it into the initial migration |
| Agents "improve" shared code while doing feature work | `.claude/rules` and CODEOWNERS for shared paths (§3) |
| InMemory tests pass while a SQL Server constraint or concurrency rule is broken | Never claim engine behaviour from InMemory tests. The §2.3 checklist is mandatory before UAT and before any release that changes schema or invariants |

---

## 2. Quality gates

### 2.1 Entry gate for parallel feature delivery
All of the following must be true:
- Phase 0 is complete (R-0.2 once the remote exists).
- Phase 1 steps 1, 2, 3, 7, 8, 10 and 14A are merged.
- Steps 4, 5 and 9 are merged once their gates (DEC-02, DEC-06, DEC-04) clear. A slice that needs a database or the contract cannot start before them.
- B-02, B-04 and B-05 are answered or explicitly accepted as assumptions for the slices they affect.
- CI is green on:
  - backend: build (0 warnings), `dotnet format --verify-no-changes`, and the xUnit + EF Core InMemory tests;
  - frontend: lint, build of both locales, and playground and component Playwright specs with axe.

A SQL Server test fixture is **not** part of this gate (AP-09).

Not entry-gating:
- 14B waits on A-06.
- Steps 12 and 13 are pre-UAT gates (§2.3).

### 2.2 Exit gate for every slice (definition of done)
1. A feature spec exists using [04-feature-spec-template.md](04-feature-spec-template.md), approved, with no open BLOCKER.
2. The OpenAPI change was merged or reviewed **before** client and server implementation (contract first).
3. Backend:
   - 0 warnings, format clean, xUnit + InMemory tests green;
   - business rules, validation, authorization (another user's record → 404, wrong active role → 403), workflow transitions and error mapping are tested;
   - any new engine-dependent invariant is **added to the §2.3 checklist**, not claimed as tested.
4. Frontend: lint and build (en, ar) pass. Each screen is checked against the **BRD field inventory**, not the screenshot. Axe passes. LTR and RTL both work. Keyboard paths are tested with Playwright.
5. E2E: Playwright covers the happy path and one refusal per role involved, against the dev API once step 12 is available.
6. Tests are tagged with requirement ids.
7. Audit events exist for every status transition the slice introduces.
8. Two reviewers if shared paths changed (CODEOWNERS); one otherwise.
9. Standards and the register are updated in the same PR if a rule changed.

### 2.3 Release-validation checklist (SQL Server; before UAT and before any release that changes schema or invariants)

EF Core InMemory does not reproduce:
- relational constraints;
- transactions;
- concurrency tokens;
- sequences;
- provider-specific SQL.

These checks are therefore run separately, against a SQL Server database of the target version (the dev or UAT database), by the migrations owner with the tech lead. Record the result, the date and the build in the release notes. They may be scripted or manual. They are not a per-PR CI dependency.

| # | Verify on SQL Server | Expected |
|---|---|---|
| V-01 | EF migrations: the idempotent script applies to an empty database and re-runs as a no-op; the model has no pending changes | Clean apply; no diff |
| V-02 | Unique and filtered indexes: `(IdamIssuer, IdamUserId)`, one live application per cycle, idempotency key per scope | A duplicate insert is rejected |
| V-03 | Foreign-key constraints, including delete behaviour | An orphan insert is rejected; no unintended cascades |
| V-04 | Concurrent Candidate provisioning (parallel first sign-ins, same identity) | Exactly one Candidate; the others resolve to it |
| V-05 | Concurrent application creation (parallel create, same candidate and cycle) | Exactly one application; the others get 409 or an idempotent replay |
| V-06 | Application-number and candidate-number allocation (sequence, `MERGE … HOLDLOCK` counter) under parallel load | Unique, gap-tolerant, correct format |
| V-07 | `RowVersion` and optimistic concurrency, plus ETag/If-Match | Stale write → 412; missing If-Match → 428 |
| V-08 | Transactions and rollback: a failure mid-save leaves no partial rows and no audit row | All or nothing |
| V-09 | SQL-specific queries (`SqlQuery`, raw allocator SQL) execute and translate | Correct results |
| V-10 | Trusted reverse proxy plus pre-auth rate limiting, in the UAT topology (steps 13 and 14A) | Per-client partitioning behind the gateway; untrusted forwarded headers ignored; 429 before any introspection call |
| V-11 | IDAM contract checks after A-06 (14B), against the real UAT IDAM | Valid → 200; missing scope → 403; wrong audience, inactive or expired → 401; IDAM unavailable → 503 |

Production persistence logic is never changed to accommodate the InMemory provider.


## 3. Four-developer collaboration plan

### 3.1 Roles and ownership

| Person | Standing role | Owns (CODEOWNERS) |
|---|---|---|
| Dev A | **Tech lead / architect** (backend) | `src/backend/src/Services/DAHC.Service/**`, `src/backend/src/Data/DAHC.Data/**` (DbContext, interceptors, migrations), `src/backend/src/API/DAHC.API/{Authentication,Authorization,Http,Responses}/**`, `Directory.*.props`, `.editorconfig`, `docs/dotnet-engineering-standards.md`, `docs/decisions/**` |
| Dev B | **Frontend lead** | `src/frontend/projects/dahc-ui/**`, `src/frontend/projects/dahc-portal/src/app/core/**`, `angular.json`, `package.json`, `docs/angular-structure-and-guidelines.md`, Playwright `support/**` |
| Dev C | **Feature developer** (full stack, back-office-leaning) | Assigned module folders per slice |
| Dev D | **Feature developer** (full stack, candidate-leaning) + **API contract owner** | `src/contracts/openapi/**` (reviewed by A and B) |

- Every feature module (`DAHC.<Module>.*`, `dahc-portal/src/app/features/<module>`) has one named owner per slice.
- Shared paths always need the owner's review.
- Changes to shared patterns need an ADR merged first, approved by A and B.

### 3.2 Shared Claude Code rules (content for `CLAUDE.md` / `.claude/rules/`)

- Precedence: BRD for function; approved decisions; engineering standards; UI references for visuals only.
- Read the slice's feature spec, `03-decisions-register.md` and the relevant standards section before coding. Cite requirement ids in tests and comments that explain business rules.
- Do **not**:
  - add packages;
  - change files under CODEOWNERS shared paths;
  - change the auth/authorization pipeline, DbContext/migrations or `dahc-ui` tokens, unless the task explicitly says so;
  - add mediator, generic repository or workflow engine patterns;
  - invent permissions, statuses or transitions.
- When requirements are ambiguous: stop and add an entry to the open-decision register. Never assume an authorization rule.
- Authentication follows AP-08 (standards §19, "DAHC IDAM access-token validation"):
  - IDAM access tokens are opaque and the API validates them by introspection. Never add JWT validation for IDAM tokens.
  - Never send or accept the ID token as an API token.
  - Never log, persist or decode the raw access token.
  - Keep introspection credentials on the backend.
  - An introspection failure is never a valid token.
  - Extend the existing `Authentication/Idam/*` code; never replace it.
  - HTTP outcomes:
    - invalid, inactive or expired token → 401;
    - insufficient scope → 403;
    - rate limited → 429;
    - IDAM unavailable → 503.
  - Use the library's own options. Never build custom caching or authentication infrastructure. Add no resilience package or circuit breaker (DF-10).
- Testing follows AP-09:
  - Use xUnit with EF Core InMemory, building on the existing test projects and the existing substitutes at boundaries.
  - Test business rules, validation, authorization, workflow transitions and error handling.
  - No coverage targets and no redundant tests.
  - Do not add Testcontainers, Docker or LocalDB as test dependencies.
  - Never claim that an InMemory test proves a SQL Server constraint, transaction, concurrency token, sequence or query. Add such behaviour to the release-validation checklist (§2.3) instead.
  - Never change production persistence code to suit InMemory.
  - Playwright for frontend end-to-end tests.
- Business decisions B-01 to B-05 stay open. Keep the current provisional behaviour and do not finalise or change it without a recorded answer.
- Contract first: change `openapi.yaml`, get it reviewed, then implement.
- Never run destructive git, apply migrations to shared databases or edit generated migrations by hand.
- Run the slice's exit-gate commands before opening a PR, and report failures verbatim.

### 3.3 Branching and flow

- `main` is protected and holds released state.
- `develop` is the protected integration branch.
- Each slice uses `feature/<req-id>-<short-name>` off `develop`, merged by PR with squash.
- Shared-pattern changes use `arch/<adr-id>-<name>` and merge before the dependent feature branches.
- Daily rebase on `develop`. Only the migrations owner merges migrations, one at a time.
- Agents run in separate worktrees per branch.

### 3.4 Cadence

- Slice kickoff (30 min): BA plus the owner walk through the spec and contract.
- Contract PR within day 1–2. The Angular and backend owners then work in parallel against the contract; the frontend uses the Playwright API mock only until the endpoint lands.
- Twice-weekly 15-minute architecture sync for ADRs and register updates.
- Slice demo against the dev API, then the exit gate.

---

## 4. Recommended first end-to-end slice

**Slice S1: "Candidate signs in, sees the dashboard, starts and saves a draft with program, specialty and site preferences"**
(US-1.1.1, US-1.1.2, US-1.2.1, US-1.3.1, US-1.3.11 core save)

Why this slice:
- It is ~70 % implemented on both sides.
- It exercises every foundation concern end to end: auth, provisioning, active role, envelope, ProblemDetails, ETag, idempotency, i18n/RTL and E2E against the real API.
- It needs no unresolved external integration (no payment, ICP or FileNet).

| Item | Content |
|---|---|
| Entry criteria | Section 2.1 entry gate met, including steps 4, 5 and 9 (S1 needs the database and the contract); B-02, B-04 and B-05 answered or accepted as assumptions; DEC-10/11 contract merged; synthetic training-site seed accepted for dev (DF-01) |
| Scope in | IDAM sign-in (deployed) and dev SFA (local); Candidate auto-provisioning with duplicate refusal; dashboard empty state and start-new rules (AC1–AC7 of US-1.2.1); program/specialty/site selection per US-1.3.1 and the BRD field inventory (Appendix B §6.2); create and save draft with ETag; Arabic and English |
| Scope out | Other form sections (US-1.3.2+), auto-save, reminders, archive job, withdraw, reinstate, payment |
| Exit criteria | Section 2.2 exit gate. In addition, E2E (Playwright against the dev API) covers: first sign-in provisions a candidate; duplicate refused with message; deactivated user refused; second active application refused (409); stale save (412); other candidate's application not found (404); RTL screenshots. Before UAT, the §2.3 checklist items V-02, V-04 to V-07 are recorded for S1 |
| Follow-on slices | S2 Application information + Personal information (needs DF-05 decision for ICP; manual entry path first); S3 Save-draft automation (auto-save, reminders, archive via `BackgroundService`); S4 first back-office slice, only after B-01 and DF-02 |

---

## 5. Approval record

Approved on 2026-11-12:
- Phase 0, and the Phase 1 and Phase 2 steps marked APPROVED in §1.
- DEC-14, with its adjustments (14A / 14B split; HTTP outcomes 401 / 403 / 429 / 503; library options only; no resilience package or circuit breaker).
- AP-09: xUnit with EF Core InMemory as the automated backend test approach. DEC-03 is cancelled.

Still open:
1. Decisions that gate steps: DEC-02 (EF Design package), DEC-04 (OpenApi package), DEC-06, DEC-08 (deployment and proxy topology), DEC-09, DEC-10/11, DEC-12 and DEC-05 (formal approval of eslint tooling already in use). See register §3.
2. Business decisions B-01 to B-05, which stay visible (§1). A-01 to A-05 are to be confirmed.
3. A-06, the IDAM introspection contract. It gates only 14B and checklist item V-11.
4. Slice S1 as the first end-to-end slice.
