# 01 — Foundation Audit Report

Audit date: 2026-11-12. Scope: `backend`, `frontend`, `docs/*`. This was a read-only audit: no application code was changed, no migrations were applied and no packages were installed in the repository. The backend was built and tested in a **scratch copy** outside the repository, because the pinned SDK (10.0.404) is not installed on the audit machine and 10.0.403 was used instead.

Inputs and how much they govern:

| Input | Path | Authority |
|---|---|---|
| BRD v2.1 (Release 5) | `BRD/Addmission_System_BRD.md` | Business function, fields, rules, roles, workflows |
| .NET standards | `docs/dotnet-engineering-standards.md` | Backend implementation (§1–19, Appendices A/B) |
| Angular guidelines | `docs/angular-structure-and-guidelines.md` | Frontend implementation |
| Approved auth/provisioning decisions | `claude-code-foundation-audit-prompt.md`, standards §19 | Not re-opened |
| UI references | `Design_System/UIUX/*.png` (9 screens) | Visual language only |
| Project rules | `CLAUDE.md` (**empty**), `.claude/rules/` (**empty**) | — |

Classifications: `COMPLIANT`, `MINOR REFACTOR`, `INCOMPLETE`, `CONFLICT`, `SECURITY RISK`, `REBUILD CANDIDATE`. Severity: Critical / High / Medium / Low.

---

## 1. Executive summary

- **The backend is a strong foundation.** It has clean layering and central package management. `dotnet build` produces **0 warnings / 0 errors**, `dotnet format --verify-no-changes` passes and all **54/54 tests pass**. It uses explicit services and does not use a mediator, generic repositories or a workflow engine. The rest of the foundation is in place: the ProblemDetails/envelope contract, IDAM introspection, fail-closed configuration, dev SFA that is unreachable outside Development, ETag/If-Match, idempotent create, invariants enforced by the database, and an audit write in the same transaction.
- **The frontend code is good, but the workspace cannot build.** There is no `angular.json` and no lockfile. The portal and the API also disagree on one contract (`GET /programs` without `cycleId`).
- **Three issues conflict with the approved decisions and must be fixed before parallel delivery:**
  1. Identity is keyed on `sub` only, not validated `iss` + `sub`.
  2. The development SFA signs in *any* subject with one shared password. It should accept only seeded test users.
  3. Security and provisioning events (refusals, duplicates, deactivated users) are not audited.
- **Some foundation pieces are incomplete:**
  - No EF migrations exist.
  - The Appendix B `.editorconfig` is missing, so the code-style rules are not enforced.
  - Data tests use the EF InMemory provider, not SQL Server.
  - There are no concurrency tests.
  - The code cites decision and contract documents that are **not in the repository**: `Open-Questions.md` (D-01..D-25, OQ-xx), `Contracts/openapi/openapi.editor.yaml`, and an older standards numbering (`s.15`, `s.30`).
- **No component is a rebuild candidate.**

---

## 2. Backend findings

Paths are relative to `backend/`.

### BE-01 — External identity keyed on subject only (`sub`), not issuer + subject
- **Severity / class:** High · `CONFLICT` (approved decision) / `SECURITY RISK`
- **Evidence:**
  - `src/Core/DAHC.Identity.Core/Candidate.cs:18` and `StaffUser.cs:13` have an `IdamUserId` column and no issuer column.
  - `src/Data/DAHC.Data/Configurations/Identity/CandidateConfiguration.cs:45` puts the unique index on `IdamUserId` alone.
  - `src/Data/DAHC.Identity.Data/AuthSessionService.cs:145-155` and `CurrentUserLoader.cs:31-42` match on `IdamUserId == sub`.
  - `src/API/DAHC.API/Http/AccessContextMiddleware.cs:79` passes only `claims.Subject`.
- **Violated:** the approved decision "Identify external users using validated issuer and subject"; standards §19 "Match a returning user using the validated issuer + subject combination".
- **Risk:**
  - In Development, a dev-issued JWT (issuer `dahc-development`) with a subject equal to a real IDAM `sub` resolves to the same local account. The issuers are not separated.
  - If IDAM issuers change (tenant or definition migration, UAE PASS federation), accounts could collide or be orphaned.
  - This is a latent cross-issuer impersonation path whenever more than one issuer is trusted.
- **Safe remediation:**
  1. Add a non-null `IdamIssuer` column to `idn.Candidate` and `idn.StaffUser`.
  2. Make the unique index `(IdamIssuer, IdamUserId)`, filtered where needed.
  3. Pass `TokenClaims.Issuer` through `ICurrentUserLoader.LoadAsync` and `IAuthSessionService.SignInAsync`.
  4. Backfill: there is no migration yet (BE-05), so fold this into the initial migration.
  5. Dev tokens carry issuer `dahc-development` and so get their own namespace automatically.
- **Dependencies:** BE-05 (initial migration).
- **Verify:** a new test shows the same `sub` from two issuers gives two separate identities; the existing sign-in tests still pass.

### BE-02 — Development SFA authenticates any subject with one shared password
- **Severity / class:** Medium · `CONFLICT` / `SECURITY RISK` (Development only)
- **Evidence:**
  - `src/API/DAHC.API/Authentication/Development/DevelopmentSignIn.cs:126-147` accepts any `Subject`/`ClientId` when `Password` matches the single configured password.
  - `DevelopmentSignInRequest.cs:8-25` lets the caller supply display name, email, EID and passport claims, which `DevelopmentUserInfoClient.cs:36-46` then trusts.
- **Violated:** Angular guidelines §7 "development bearer tokens for **seeded local test users and roles**"; standards §19 "use deliberately seeded non-production users"; Angular §9.7 "do not simulate OIDC by trusting user-supplied identity claims" (this applies to tests, but the same principle holds).
- **Risk:**
  - A developer can impersonate any pre-registered staff subject.
  - Synthetic EID/passport values make duplicate detection behave differently from IDAM.
  - The flow cannot represent "seeded users per role" for the E2E tests the guidelines require.
- **Already in place:**
  - Mapped only in Development (`Program.cs:65-69`).
  - Startup refuses if the feature is configured outside Development (`DevelopmentSignIn.cs:40-49`).
  - Constant-time password comparison.
  - Rate limited.
  - The JWT scheme is accepted only in Development (`AuthenticationRegistration.cs:59-75`).
- **Safe remediation:**
  - Replace the free-form subject with a username that is looked up in a development-only seeded user list, loaded from user secrets or a dev bootstrap, never committed.
  - Each seeded user has a fixed subject and profile.
  - Keep the issuer separate (see BE-01).
  - Add a development bootstrap that creates one staff user per role (README: "Development bootstrap … Not included").
- **Dependencies:** BE-05; FE-02 (dev sign-in UI).
- **Verify:** API tests show an unknown username gets 401 and profile fields in the body are ignored. A Testing/Production startup with the feature configured is refused (already covered).

### BE-03 — Security and provisioning events are not audited
- **Severity / class:** Medium · `INCOMPLETE`
- **Evidence:**
  - `src/Data/DAHC.Data/Interceptors/AuditSaveChangesInterceptor.cs:83-121` writes a row-change event only (`Outcome = "SUCCESS"`) and only when an entity with a `PublicId` is saved.
  - Refusals that save nothing write no audit event: deactivated sign-in (`AuthSessionService.cs:170-173, 202-210`), not-registered access, role-not-held and authorization 403s (`AccessResultHandler.cs:54`, which logs only). The `DENIED`/`FAILED` outcomes allowed by `AuditEventConfiguration.cs:24` are therefore never written.
  - The duplicate-account path is audited only as a generic `candidate.created` plus a `duplicate_account_pair.created` row.
- **Violated:** standards §12 Audit ("authentication, authorization and business events with … outcome"); §19 "Audit successful/denied provisioning"; BRD L590 n3 (all application actions and status changes in the audit log).
- **Risk:**
  - Denied provisioning cannot be traced.
  - Business status transitions (submit, return, screen-out) will be recorded only as an anonymous "updated" row, which cannot answer "who changed the status from X to Y and why".
- **Safe remediation:**
  - Keep the interceptor for row-level change capture.
  - Add one small explicit audit writer in `DAHC.Data` with an action code, outcome, reason code and resource reference. Call it from sign-in or provisioning and from future business process services, in the same transaction as the change.
  - Write denied outcomes in their own short save, without request data.
  - Do not add a framework.
- **Dependencies:** ADR-07 (audit model).
- **Verify:** tests on SQL Server show sign-in by a deactivated user writes `DENIED`, a duplicate writes `account.duplicate_detected`, and a successful provisioning writes `SUCCESS` with the trace id.

### BE-04 — Every unknown identity is auto-provisioned as Candidate; eligibility rule not recorded
- **Severity / class:** Medium · `INCOMPLETE` (decision not documented, not a code defect)
- **Evidence:** `AuthSessionService.cs:144-162`. Staff are matched first; otherwise any web-client user token creates a Candidate. Duplicates (`:232-263`) are stored as inactive and refused with `409 account.duplicate`.
- **Analysis:**
  - BRD L491/L497/L508 make the conditions for becoming a Candidate: completed IDAM registration, signing in through the DAHC web client, and passing the platform duplicate check. That is what the code does.
  - Per-program applicant eligibility (Candidate Status, Appendix 3.3 L2105-2114) applies when applying, not when the account is created.
  - Staff are never auto-created (`StaffUser.cs:3-6`; BRD L1153 n2, L1594 n2 "provisioned in the platform").
  - Approved behaviour holds: disabled accounts are never reactivated (`AuthSessionService.cs:170-173, 202-210`), and concurrent first sign-in is resolved by the unique index and a retry (`:49-54`).
- **Remediation:** record this interpretation in the decisions register as **ASSUMPTION A-01**, for business confirmation. No code change unless it is rejected.
- **Verify:** a concurrent first-sign-in test on SQL Server (see BE-06).

### BE-05 — No EF Core migrations; database cannot be created
- **Severity / class:** High · `INCOMPLETE`
- **Evidence:** no `Migrations` folder anywhere. `README.md` ("Not included") says "EF Core design-time tools are not an approved package (standard s.30)". The model uses raw SQL objects that only a migration can create: `idn.CandidateNumberSeq` (`DahcDbContext.cs:63-68`) and `app.ApplicationNumberCounter` MERGE (`SqlApplicationNumberAllocator.cs:485-493`).
- **Violated:** standards §11 "Migrations are checked in and applied explicitly during deployment".
- **Risk:**
  - No developer can run the API against a database, so the E2E tests in Angular §8 cannot be written.
  - Four developers would each create divergent schemas.
- **Safe remediation:**
  1. Approve `Microsoft.EntityFrameworkCore.Design` (dev-time only, `PrivateAssets=all`) in standards §19 (DEC-02).
  2. Generate a single reviewed `Initial` migration that includes BE-01, the reference data seed, the role codes and the dev bootstrap outside migrations.
  3. Apply it with an idempotent script (`dotnet ef migrations script --idempotent`) at deployment.
  4. Make one person the owner of migrations, merged in sequence.
- **Dependencies:** DEC-02, BE-01.
- **Verify:** the script applies to an empty SQL Server; a second run is a no-op; a schema-diff check runs in CI.

### BE-06 — Data and concurrency tests use the EF InMemory provider
- **Severity / class:** Medium · `INCOMPLETE`
- **Evidence:** `tests/DAHC.Test.Data/TestDatabase.cs:9-12` ("Constraints, row versions, transactions and SQL translation are not exercised here") and `tests/DAHC.Test.API/DahcApiFactory.cs`. The sequence and MERGE allocators are substituted.
- **Violated:** standards §17 "Test data access against the same database engine as production".
- **Risk:** the main invariants are untested:
  - one live application per candidate per cycle (`CandidateApplicationConfiguration.cs:114-117`);
  - idempotency-key uniqueness, row-version conflicts and filtered unique indexes on soft-deleted preferences;
  - concurrent first sign-in;
  - application-number allocation under concurrency.
  
  Angular guidelines §9.7 explicitly require tests for duplicate sign-ins and concurrent creation.
- **Safe remediation:**
  - Add a SQL Server test fixture: Testcontainers or a shared LocalDB with one database per test class, built from the BE-05 migration.
  - Move the invariant tests onto it.
  - Keep pure-rule tests in `DAHC.Test.Service`.
  - Testcontainers is a new package, so it needs DEC-03.
- **Verify:** parallel create attempts give exactly one 201 and one 409; parallel first sign-ins give one Candidate row.

### BE-07 — Appendix B code-style settings not present; style rules not enforced
- **Severity / class:** Medium · `INCOMPLETE`
- **Evidence:** the only `.editorconfig` is `tests/.editorconfig` (test overrides). There is no root `.editorconfig`, so the naming rules, the `this.` field rule, braces, IDE0005 and CA1310 are not build-enforced, even though `EnforceCodeStyleInBuild` is set (`Directory.Build.props`). The format check passes only because no rules are configured.
- **Violated:** standards §1, Appendix B.
- **Risk:** with four developers and agents, the style will drift. Today's consistency depends on discipline alone.
- **Safe remediation:**
  1. Add the Appendix B `.editorconfig` at `backend/` in a dedicated PR.
  2. Run `dotnet build`, fix any violations in that PR only, and change no behaviour.
- **Verify:** `dotnet build` with 0 warnings and `dotnet format --verify-no-changes` both pass with the new file.

### BE-08 — Referenced design documents are missing from the repository
- **Severity / class:** High · `INCOMPLETE` (traceability)
- **Evidence:**
  - `README.md:3` cites `dahc-engineering-standards.md`, `Open-Questions.md` (D-01..D-23) and `Contracts/openapi/openapi.editor.yaml`. None of them exist.
  - The code cites D-02, D-04, D-05, D-07, D-13, D-14, D-16, D-19, D-21, D-22 and D-25, OQ-02 and OQ-15, and "standard s.8/12/13/14/15/30". The section numbers do not match the current standard, which has §1–19.
  - Controller comments reference OpenAPI operation ids (`listCandidateApplications` and others) and `x-dahc-roles` (`Policies.cs:7`).
- **Risk:**
  - The OpenAPI contract is the planned coordination point between Angular and the API, and it is absent.
  - Decisions in the code cannot be reviewed.
  - Agents will re-decide settled questions or invent new ones.
- **Safe remediation:**
  1. Recover `Open-Questions.md` and `openapi.editor.yaml` from their author or source branch.
  2. Commit them to `docs/decisions/` and `src/contracts/openapi/`.
  3. Merge the decisions into `03-decisions-register.md`.
  4. Replace "standard s.NN" comments with the current section numbers in a mechanical, comment-only PR.
  5. If the files cannot be recovered, regenerate OpenAPI from the running API (built-in `Microsoft.AspNetCore.OpenApi`, which needs DEC-04) and review it.
- **Verify:** every D-/OQ- id cited in the code resolves to a register entry, and CI compares the OpenAPI file with the generated document.

### BE-09 — Cross-module data access through the shared DbContext
- **Severity / class:** Low · `CONFLICT` (needs an ADR, not a rewrite)
- **Evidence:**
  - `src/Data/DAHC.Data/DahcDbContext.cs:24-56` holds all module entities.
  - `src/Data/DAHC.Data/Querying/CatalogAvailability.cs` is used by both Catalog and Applications.
  - `src/Data/DAHC.Applications.Data/ProgramOffering.cs` reads Catalog tables directly.
  - `DAHC.Service` and `DAHC.Data` act as shared projects; standards §19 "Modules" is empty.
- **Violated:** standards §2 "modules talk to each other only through the other module's public application interface"; "no catch-all Shared project … named owner recorded in section 19".
- **Assessment:** one context (D-22) is a reasonable, deliberate trade-off for one database and one transaction scope. It is not a rebuild candidate. The rule simply needs to be written down so that new modules (Verification, Scoring, Screening) do not reach into each other's tables without control.
- **Remediation:**
  - ADR-03: record the "single DbContext, module-owned configurations and schemas" rule.
  - Allow cross-module **reads** only through named query classes in `DAHC.Data/Querying` with a named owner.
  - Cross-module **writes** go only through the owning module's service.
  - Fill in standards §19 Modules and the shared-project owners.
- **Verify:** reviewers apply the rule; optionally add an architecture test (reflection over project references) without a new package.

### BE-10 — Rate limiting and client IP behind a reverse proxy
- **Severity / class:** Medium · `SECURITY RISK` (deployment-dependent)
- **Evidence:**
  - `src/API/DAHC.API/Http/RateLimiting.cs:57-68` partitions anonymous callers by `RemoteIpAddress`.
  - `Program.cs` has no `UseForwardedHeaders` and no known-proxy configuration.
  - `UseRateLimiter` runs after `UseAuthentication` and `AccessContextMiddleware` (`Program.cs:52-56`), so invalid or random bearer tokens reach IDAM introspection and the database before any limit applies.
- **Violated:** standards §13 Web host hardening (global limit partitioned by client address); sub-path/proxy guidance.
- **Risk:**
  - Behind a gateway, all anonymous traffic shares one partition, so 20 sign-in requests per minute would be allowed globally.
  - Introspection can be flooded. The cache is keyed by token hash, so unique junk tokens bypass it.
- **Safe remediation:**
  - Configure `ForwardedHeadersOptions` with explicit known proxies or networks from configuration, validated at startup.
  - Add a cheap pre-authentication limiter partitioned by client address.
  - Confirm the gateway topology with infrastructure (DEC-08).
- **Verify:** an integration test with `X-Forwarded-For` from a trusted proxy partitions per client, and one from an untrusted source is ignored.

### BE-11 — Application number format diverges from one BRD example
- **Severity / class:** Medium · `CONFLICT` (BRD internal conflict)
- **Evidence:**
  - `src/Services/DAHC.Applications.Service/ApplicationNumberFormat.cs` and `CandidateApplication.cs:541-544` use `<cycle start year><7 digits>` (D-19), matching BRD L1096 (`20260000014`).
  - BRD L723 defines Application ID as `CandidateID-G<cycle>` (e.g. `123456789-G27`), assigned when the form is opened.
- **Remediation:** a business decision (BLOCKER B-03 in the register). The code is consistent with one BRD statement, so do not change it until the decision is made.

### BE-12 — `ADMINISTRATOR` role and integration clients exist without BRD backing
- **Severity / class:** Low · `CONFLICT` (scope)
- **Evidence:**
  - `src/Services/DAHC.Service/Access/RoleCodes.cs:11` and `appsettings.json` `Access:StaffRoleOrder`.
  - `IntegrationClient` entity and token classification for integrations (`TokenClassifier.cs`, `IntegrationClient.cs`).
  - BRD roles BRO-01..09 have no Administrator. "the admin" (L1383) and "Management Portal" (L2437) are mentioned without definition.
- **Risk:** these elements were added beyond the BRD, against the guideline not to add unsupported functionality. However, *someone* must provision staff (B-01), so an administrative role is probably needed.
- **Remediation:** keep the code, which is inert today because no endpoint uses either. Record ADMINISTRATOR and integration clients in the register as pending decisions (B-01, D-INT). Do not build on them until approved.
- **Update 2026-11-12:** the `ADMINISTRATOR` part is **resolved**. AP-10 approves it as a system role, and B-01 is resolved. Roles become configurable data (`idn.Role`), and `RoleCodes` keeps only the system codes. Design: [05-rbac-design.md](05-rbac-design.md). Integration clients remain pending (DF-08).

### BE-13 — Minor items
| Id | Finding | Evidence | Class |
|---|---|---|---|
| BE-13a | `ClientOrigins` accepts `http://` outside Development | `Configuration/ClientOriginOptions.cs:23` | MINOR REFACTOR: require https when not Development |
| BE-13b | SDK pin 10.0.404 is not installed on the audit machine; `rollForward: latestPatch` does not roll back to 403 | `global.json` | Environment: install SDK 10.0.404 on all dev machines and CI |
| BE-13c | Not a git repository; README assumes "commit/tag current foundation" | repo root | INCOMPLETE: initialise git and tag the baseline before any remediation |
| BE-13d | `CLAUDE.md` is empty and `.claude/rules/` is empty | repo root | INCOMPLETE: see remediation R-0 |
| BE-13e | Endpoint paths are `/api/v1/auth/...`; the guidelines say `/api/auth/...` | `Controllers/AuthController.cs:20` | MINOR: amend the guideline text to `/api/v1` (versioning is preferable) |
| BE-13f | Draft editable only in `Draft` status; BRD allows edits of flagged sub-sections in `Correction Required` (L1399 AC6) | `CandidateApplication.cs:570` | INCOMPLETE: future slice, not a foundation defect |
| BE-13g | No `Microsoft.AspNetCore.OpenApi` document generation | — | INCOMPLETE: see BE-08 |

### BE-14 — IDAM introspection gaps against the approved token architecture (AP-08)
- **Severity / class:** Medium · `SECURITY RISK` / `INCOMPLETE`
- **Context:** AP-08, approved 2026-11-12, confirms opaque IDAM access tokens validated by introspection. The existing implementation is the right shape and is **retained**. The register §1.1 rates every AP-08 requirement; these are the gaps not already covered by BE-01 and BE-10.
- **BE-14a: scopes not validated.**
  - Evidence: `TokenValidation.cs:34-56` checks issuer, expiry and client only. Nothing reads `scope`, although the portal requests `api` (`environment.ts:13`).
  - Risk: any active IDAM token issued to the DAHC web client is accepted, whatever its scope.
  - Fix: require the configured scope set (`Idam:RequiredScopes`, default `api`) in `TokenValidation` for IDAM tokens. Refuse with `token.insufficient_scope` and 401.
  - Audience: there is no `aud` check beyond `client_id`. Add one if IDAM returns `aud` (assumption A-06).
- **BE-14b: unbounded outbound concurrency to IDAM (Low; act only if needed).**
  - Evidence: `IdamIntrospectionRegistration.cs:14,24-27` has a 10 s timeout and nothing else.
  - Risk: a slow IDAM holds a request thread for up to 10 s per request. Under load this exhausts the API rather than failing fast.
  - Fix (DEC-14, revised): no new package and no custom circuit breaker. The pre-authentication rate limit (BE-10) removes the main flood path, and the cache absorbs repeats.
  - Retain the `HttpClientFactory` client and its bounded timeout. Review whether 10 s is right for the expected IDAM latency; changing it is configuration only.
  - Add a bound on concurrent introspection calls only if testing shows it is needed. Use a built-in primitive (`System.Threading.RateLimiting.ConcurrencyLimiter` in the existing `IdamBackchannelHandler`). A rejected call fails closed with 503.
  - Circuit breaking and the resilience package are a future enhancement (DF-10), reconsidered after load testing or observed IDAM instability.
- **BE-14c: cache and token-hygiene behaviour relies on library defaults that no test pins.**
  - Evidence: no `HybridCache`/`IDistributedCache` registration in DAHC code. Caching, the hashed cache key (`CacheKeyGenerator`) and `SaveToken = false` all come from Duende 7.0.2 defaults.
  - Evidence: `DAHC.Test.API` replaces the introspection handler with `TestAuthenticationHandler` (`DahcApiFactory.cs:20`), so no test exercises introspection.
  - Unverified: whether the cache is active; whether a cached result is capped at the token's `exp`; whether `OnTokenValidated` (issuer, expiry, client) also runs on cache hits.
  - Fix: set `SaveToken = false` and the cache-key generator explicitly. Register the cache explicitly. Cap cache duration at `min(Idam:IntrospectionCacheMaxSeconds, exp - now)`.
  - Add introspection-path integration tests against a stub IDAM. Each must reject:
    - `active=false`;
    - wrong `iss`;
    - expired `exp`;
    - an unregistered `client_id`;
    - a missing scope;
    - an IDAM 5xx or timeout (must return 503);
    - a malformed response;
    - a JWT-shaped token in a non-Development host.
  - Further tests:
    - a cache hit still enforces expiry;
    - the raw token never appears in captured logs.
- **Docs (fixed in this change):** standards §13 said "JWT bearer validation for APIs" and §19 said only "validates bearer tokens". Both now state introspection of opaque tokens. The decision is recorded in standards §19 and the Angular guidelines §7 and decisions table.
- **Deployment configuration:** none exists in the repository yet (no UAT/Production `appsettings`, no portal `fileReplacements`). DEC-08 must include the AP-08 deployment rules:
  - `ASPNETCORE_ENVIRONMENT` is never `Development`;
  - no `DevelopmentSignIn` section;
  - `Idam:ApiClientSecret` comes from the secret store;
  - required scopes are set per environment;
  - outbound access to the IDAM introspection endpoint only.
- **Verify:** the introspection test suite above runs in CI; `dotnet build` 0 warnings.

### Backend compliance matrix

| Area | Status | Evidence |
|---|---|---|
| Solution/projects, prefix, CPM, transitive pinning, NuGet audit | COMPLIANT | `DAHC.slnx`, `Directory.Packages.props` (advisory pin with comment) |
| Appendix A build settings | COMPLIANT | `Directory.Build.props` is identical to Appendix A |
| Appendix B code style | INCOMPLETE | BE-07 |
| Dependency direction (Core ← Service ← Data ← API) | COMPLIANT | csproj references; Core references nothing |
| Module boundaries | CONFLICT (minor) | BE-09 |
| No mediator / generic repo / mapper / engine | COMPLIANT | no such packages or types |
| DI explicit, lifetimes | COMPLIANT | `*Registration.cs` |
| EF configs, AsNoTracking, projections, no string SQL | COMPLIANT | `Configurations/*`; interpolated `SqlQuery` is parameterised |
| Migrations | INCOMPLETE | BE-05 |
| Soft delete + audit in the same transaction | COMPLIANT (row level) | interceptors |
| Concurrency (row version, ETag, unique indexes, HOLDLOCK) | COMPLIANT design / untested on engine | BE-06 |
| Results vs exceptions, ProblemDetails, one logging boundary | COMPLIANT | `ApiResults.cs`, `ProblemFactory.cs`, `GlobalExceptionHandler.cs`, `DahcDataException.cs` |
| Logging (structured, scopes, no messages from DB/IdP, request template not path) | COMPLIANT | `DahcLoggingRegistration.cs`, `ExceptionChain.cs` |
| Correlation (`X-Request-ID`, validated `X-Correlation-ID`) | COMPLIANT | `RequestIdMiddleware.cs` |
| Options validated at startup, fail closed | COMPLIANT | `OptionsRegistration.cs`, logging and connection-string checks |
| Authentication (introspection, issuer/expiry/client checks, 503 on IdP outage) | COMPLIANT design; PARTIAL against AP-08 (scopes, pre-auth rate limit, untested introspection path) | `Idam/*`, `TokenValidation.cs`; BE-14; register §1.1 |
| Identity matching iss+sub | CONFLICT | BE-01 |
| Candidate-only provisioning, no staff auto-create, no reactivation, idempotent | COMPLIANT (pending A-01) | BE-04 |
| Dev SFA confined to Development | COMPLIANT | `DevelopmentSignIn.EnsureAllowed`, `EnsureApprovedHandlersAsync` |
| Dev SFA seeded users only | CONFLICT | BE-02 |
| Authorization: fallback policy, active-role policies, IDAM role claim ignored, existence not leaked (404) | COMPLIANT | `Policies.cs`, `AccessAuthorizationHandler.cs`, `ApplicationReader` scoped by candidate |
| Resource-level access service per boundary | INCOMPLETE | only candidate-own scoping exists; needed for officer/referee pools (B-05) |
| Audit of security/business events | INCOMPLETE | BE-03 |
| Hardening (HSTS, no Server header, limits, CORS exact, headers) | COMPLIANT / proxy gap | BE-10, BE-13a |
| Localization en-AE / ar-AE | COMPLIANT | `Messages*.resx` (36 keys each) |
| Tests (meaningful, scenario names, fake TimeProvider) | COMPLIANT style / INCOMPLETE engine and traits | BE-06; no `[Trait("Requirement", …)]` |

---

## 3. Frontend findings (summary)

The full evidence is in [appendix-a-frontend-audit.md](appendix-a-frontend-audit.md). The lead auditor re-checked FE-01, FE-03, FE-04 and FE-05 in the code.

| Id | Sev | Class | Finding |
|---|---|---|---|
| FE-01 | Critical | INCOMPLETE | No `angular.json` and no `package-lock.json`. Nothing can be built, served, linted, extracted or tested; per-locale builds and `fileReplacements` are not wired |
| FE-02 | High | INCOMPLETE | No development SFA sign-in UI, and no dev-only provider swap |
| FE-04 | High | CONFLICT (integration) | `GET /programs` omits the `cycleId` the API requires. Evidence: `catalog-api.service.ts:18-25` vs `CatalogController.cs:35` |
| FE-03 | Medium | INCOMPLETE | No role switcher and no `PUT /auth/active-role` client. The guard checks `userType` instead of the active role (`candidate.guard.ts:44`) |
| FE-05 | Medium | CONFLICT | Client business rules: second preference allowed only for the `RESIDENCY`/`FELLOWSHIP` categories (`application-draft.component.ts:49`); edit state derived from status |
| FE-06 | Medium | SECURITY RISK (availability) | Every 401 restarts sign-in, including on `/auth/sign-in`, which can loop through IDAM |
| FE-10 | Medium | INCOMPLETE | CSP and Trusted Types documented only; there is no hosting configuration |
| FE-11 | Medium | INCOMPLETE | Focus trap, focus restore, dialog, text input and checkbox are missing |
| FE-13 | Medium | INCOMPLETE | Portal E2E tests use API and IDAM mocks rather than the dev API. No visual regression, no 401 or not-registered tests, no RTL portal test |
| FE-12 | Low/Med | INCOMPLETE | Grid and spacing utilities, sample custom theme and playground copy-usage button are missing |
| FE-07/09/14/15/16 | Low | MINOR REFACTOR | Session refresh after not-registered, sign-out `state`, explicit `response_mode=query`, ProblemDetails without `code`, typing |
| FE-08 | — | COMPLIANT (notes) | sessionStorage holds only PKCE/state/nonce during the redirect and is cleared afterwards; tokens stay in memory |
| FE-19 | Low | CONFLICT | eslint, typescript-eslint and angular-eslint are not in the approved package table (DEC-05) |

**Reusable (COMPLIANT):**
- Code: standalone, OnPush, signals and typed forms; no `any`.
- Components: CVA select and ranked-selection with `aria-describedby`.
- Styling: token-only SCSS with logical properties.
- Services and pipes: ThemeService, LiveAnnouncer and the unique-id helper; the `Intl` zoned date pipe; the `@angular/localize` catalogues (117 ids each, en and ar).
- Auth and API: the certified OIDC library (`angular-auth-oidc-client` 22.0.2), no hand-written protocol code, and a bearer interceptor restricted to the API host. The ApiResponse/ProblemDetails interceptor shows the trace id; drafts use Idempotency-Key and If-Match.
- Tooling: the playground serves real source files; Playwright has page objects, role locators and axe checks.

---

## 4. Integration findings

| Id | Sev | Class | Finding | Remediation |
|---|---|---|---|---|
| INT-01 | High | INCOMPLETE | There is no shared contract artifact: the OpenAPI file is missing (BE-08). The frontend models in `projects/dahc-portal/src/app/api/*.models.ts` are hand-maintained | Restore or generate `openapi.yaml` as the contract source; CI diffs the generated document; frontend models are reviewed against it in the same PR |
| INT-02 | High | CONFLICT | `GET /programs` requires `cycleId`, but the client has no way to discover the open cycle. The contract offers no "current cycle" operation | Contract decision: add `GET /api/v1/cycles?status=open`, or make `cycleId` optional meaning "currently open". The API owner decides and records it in OpenAPI |
| INT-03 | Medium | INCOMPLETE | Active-role flow is server-complete (`PUT /auth/active-role`, `GET /auth/me`) but has no client | FE-03 |
| INT-04 | Medium | CONFLICT | The allowed preference count is decided in the client (FE-05). The server already holds `MaxPreferences` per program (`CatalogProgramConfiguration.cs:16`) | Expose `maxPreferences` in `ProgramItem`; the client renders from it |
| INT-05 | — | COMPLIANT | ProblemDetails `code`/`traceId`/`errors[]` shape, envelope `data`/`pagination`/`messageCode`, enum upper snake case, ETag/If-Match/Idempotency-Key, CORS exposed headers all agree | — |
| INT-06 | Medium | INCOMPLETE | E2E tests against the real API are impossible until FE-01, BE-05 and BE-02 are done | Sequence in remediation phase 1 |
| INT-07 | Medium | INCOMPLETE | Release configuration: IDAM end-session page, revocation endpoint, CSP hosting, proxy topology and environment matrix (Dev/Test/UAT/Prod) are undocumented | DEC-08 deployment ADR |
| INT-08 | Low | COMPLIANT | Database compatibility: SQL Server features used (sequences, MERGE HOLDLOCK, filtered unique indexes, rowversion) need SQL Server 2016+ | Confirm the target version with DBA |

---

## 5. Security findings (consolidated, ranked)

1. **BE-01**: identity not bound to the issuer (High).
2. **BE-10**: proxy and client-IP handling, plus introspection before rate limiting (Medium, depends on deployment).
3. **BE-14**: introspection accepts any scope; cache expiry, fail-closed and token-hygiene behaviour unpinned by tests (Medium).
4. **BE-02**: dev SFA impersonation of any subject (Medium, Development only, structurally confined).
5. **FE-06**: 401 sign-in loop (Medium, availability).
6. **FE-10**: CSP and Trusted Types not enforced by hosting (Medium); in-memory tokens depend on it.
7. **BE-03**: no audit of denials (Medium, accountability).
8. **BE-13a**: http origins allowed in production configuration (Low).

**Verified safe (positive findings):**
- No tokens in browser storage.
- IDAM `role` claim never read.
- Fallback policy requires an active local user.
- Health is the only anonymous endpoint.
- Other candidates' records return 404.
- Exception messages are never logged or returned.
- Unknown JSON members are rejected.
- Bounded body, header and JSON depth.
- Startup fails closed on missing IDAM, DB or logging settings and on a wildcard `AllowedHosts`.
- No development token trust outside Development.

---

## 6. Retain / refactor / rebuild assessment

| Component | Verdict | Rationale |
|---|---|---|
| Backend solution structure, layering, CPM, build settings | **Retain** | Matches standards §1–2 and Appendix A |
| Auth pipeline (introspection, token validation, access context, policies, result handler) | **Retain + refactor** | Sound design; add issuer binding (BE-01), pre-auth rate limit (BE-10), scope, audience and client checks and introspection-path tests (BE-14); no new packages. Approved as AP-08: do not rebuild |
| Sign-in / provisioning service | **Retain + refactor** | Correct behaviour; add issuer, audit of outcomes, engine-level tests |
| Dev SFA | **Refactor** | Seeded users only (BE-02); confinement already correct |
| DbContext, configurations, interceptors | **Retain** | Plus initial migration (BE-05) and an ADR on module access (BE-09) |
| Results, ProblemDetails, envelope, localization, logging, hardening | **Retain** | Compliant |
| Candidate applications/catalog services | **Retain** | Behaviour matches US-1.2.1/1.3.1/1.3.11 core; extend per slice |
| Backend tests | **Retain + extend** | Move invariant tests to SQL Server |
| `dahc-ui` library, tokens, theme, components | **Retain + complete** | Add a11y primitives and missing components |
| `dahc-playground` | **Retain** | Needs `angular.json` assets wiring |
| `dahc-portal` core (auth, interceptors, locale, API services) | **Retain + refactor** | FE-02/03/04/05/06 |
| Workspace configuration | **Create** (missing) | FE-01 |
| Playwright suite | **Retain + extend** | Real-API E2E, visual, RTL, negative paths |
| **Rebuild candidates** | **None** | No demonstrable architectural incompatibility found |

---

## 7. Re-check against the team repository (2026-11-12)

The audit was run on a local copy (`src/backend`, `src/frontend`). The team repository (`vikramadhav/admission_system`, branch `Feature-Foundation-New` @ `eed2bf6`) has **identical source code**: 385 files are byte-identical renames from `backend/` and `frontend/`. It also has 53 project files the local copy lacked. This section updates only the findings that the evidence changes.

Scope decisions applied:
- `Database_Schema/ExistingDatabase/` is legacy reference only, for future data-migration planning. The rest of `Database_Schema/` is disregarded.
- Everything under `Contracts/` is a **preliminary draft**, not authoritative.

| Finding | Re-check result | Evidence | Status |
|---|---|---|---|
| BE-05 | Still valid. No EF Core migration exists, and the new schema is EF Core Code First, designed from the BRD and approved architecture. SQL scripts are not used for design or validation | No `Migrations/` folder on any remote branch; Open-Questions D-01 (EF Core migrations are the schema of record) | **OPEN** (plan step 4) |
| BE-07 | Resolved on the team branch. The root `.editorconfig` matches Appendix B rule for rule; only comments differ. `backend/tests/.editorconfig` relaxes test naming (`CA1707`, async suffix). The remote tree builds with 0 warnings, `dotnet format --verify-no-changes` is clean, and tests pass 54/54 on SDK 10.0.404 | Scratch verification of `origin/Feature-Foundation-New` | **RESOLVED on team branch**; it was missing only from the local copy (carried by R-0.6) |
| BE-08 | Mostly resolved. `Open-Questions.md` exists, with decisions D-01 to D-27 and open questions OQ-01 to OQ-27, so the D-ids cited in code resolve. Relevance to the register (03 §6):<br>• **Consistent:** D-01, D-16 (= AP-09), D-22 (= BL-02).<br>• **Superseded:** D-03 (role-based authorization), by AP-10.<br>• **Matching business blockers** (still open for business confirmation): D-19 ↔ B-03, D-26 ↔ B-04, OQ-20 ↔ B-02, OQ-24 ↔ B-05.<br>• **Related to B-06 and BE-01:** OQ-15 (IDAM `sub` is currently the username; an immutable identifier is pending).<br>• **Id collision:** its `OQ-nn` ids clash with this audit's BRD `OQ-nn` (Appendix B §10) | `Open-Questions.md` on the team branch | **PARTLY RESOLVED**: map ids (register §6) |
| INT-01 | The contract exists but is a draft: completeness and alignment are not established. Details in the next table | `Contracts/openapi/**` | **OPEN** (reclassified: draft contract to align, not a missing file) |
| RBAC compatibility | The current code matches 05 §1; no change. The **draft contract** is role-based and conflicts with AP-10/AP-11 in several places (next table) | — | Alignment needed in the contract, not in the architecture |
| Git integration | The local history (`6269d59`…`99b82f0`, pushed as `foundation-audit`) is **unrelated** to the team history and cannot be merged. The team `.gitignore` ignores `angular.json`, `package-lock.json`, `src/environments/environment.*.ts`, `launch.json`, `settings.json`, `nuget.config`, `*.d.ts` and `.eslintrc*`. **This is the root cause of FE-01**, and it would also block plan step 1 and the R-0.4 lockfile. The layouts differ: `backend/` and `frontend/` versus `src/...`, and every audit path and `.claude/rules` glob uses `src/` | `git diff -M origin/Feature-Foundation-New foundation-baseline-2026-11-12`; team `.gitignore` | **Resolved by R-0.6** (integration branch off `eed2bf6`; `.gitignore` corrected) |

**Draft contract versus approved architecture.** The architecture wins; the contract is corrected, contract-first, in the step that implements each part.

| # | Draft contract | Conflicts with | Corrected in |
|---|---|---|---|
| C-01 | `x-dahc-roles` on about 100 operations; the description says authorization is by role | AP-10 (permissions declared per operation) | Step 15 for the 11 implemented operations; each later slice for its own operations |
| C-02 | `StaffRoleCode` is a closed enum; `StaffRoleAssignment.roleCode` uses it | AP-10 (configurable roles; stable role ids) | Step 15 (session and switch); S-ADM (assignments) |
| C-03 | `AuthSession.roles` is a string array; `activeRole` is a required string; there are no permissions | AP-11 and DEC-20 (`roles[{id, code, name}]`, `activeRole \| null`, `permissions[]`) | Step 15 |
| C-04 | `switchActiveRole` takes a `StaffRoleCode` | DEC-20 (`{ roleId }`) | Step 15 |
| C-05 | `setStaffUserRoles`: "removing the active role makes the next request fall back to the user's default role" | DEC-19 (clear the selection; the user must select; no automatic switch) | S-ADM |
| C-06 | `preRegisterStaffUser` requires `idamUserId`, "the only match key at sign-in" | AP-10 pre-provisioning before first login; binding through the verified attribute of B-06 (open) | S-ADM, once B-06 is decided |
| C-07 | Administration operations are `ADMINISTRATOR`-only; there are no role, permission-catalog or grant operations | AP-10 and DEC-17 (configurable roles, grants, controlled delegation) | S-ADM |
| C-08 | Two root documents: `openapi.yaml` (modular, 238 lines) and `openapi.editor.yaml` (8,641 lines). The code cites the editor file | "Avoid multiple competing authoritative contract files" | **Resolved in R-0.6:** `openapi.yaml` is the single root; the generated bundle (same 97 operations and 105 schemas) was removed and its three references repointed |
| C-09 | `StaffRoleAssignment` carries program, specialty and pool scopes | Pool and scope model not yet decided (DF-02) | Back-office slices; not invented in RBAC |

Unchanged by the re-check:
- The 11 implemented operations exist in the draft with matching routes and methods. `listPrograms` takes a cycle id, so FE-04 stands.
- BE-01, BE-02, BE-03, BE-06 (AP-09), BE-10 and BE-14 stand.
