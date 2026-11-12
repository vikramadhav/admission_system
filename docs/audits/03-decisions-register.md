# 03 — Architecture Baseline and Decisions Register

This register is the single list of decisions for the audit. Once approved, accepted entries move into `docs/dotnet-engineering-standards.md` §19 and a `docs/decisions/ADR-NNN-*.md` file, and this file then becomes a pointer to them. Do not keep two sources of truth.

Status legend:
- **APPROVED** (§1, AP-nn): given by the project owner; do not re-open.
- **BASELINE**: existing implementation confirmed as compliant; proposed for ratification.
- **APPROVED / PENDING / CANCELLED** (§3, DEC-nn): status of each technical decision.
- **BLOCKER / ASSUMPTION / DEFERRED**: open business questions, as defined in the audit prompt §4.

BRD question ids (OQ-nn) refer to [appendix-b-brd-inventory.md](appendix-b-brd-inventory.md) §10. The team's `Open-Questions.md` (team branch `Feature-Foundation-New`) has its own decisions D-01 to D-27 and questions with the same `OQ-nn` form. In this register they are written **TQ-nn** to avoid the clash; §6 maps them.

---

## 1. Approved decisions (not re-opened)

| Id | Decision | Implementation status |
|---|---|---|
| AP-01 | Local Development uses development-only single-factor username/password authentication. Test, UAT and Production use IDAM OIDC (code + PKCE) | Backend: confined correctly, but accepts any subject (BE-02). Frontend: no dev UI (FE-02) |
| AP-02 | The API validates authentication and enforces all authorization; Angular guards are UI aids | Compliant; FE-05 has a minor leak of business rules into the client |
| AP-03 | Only an eligible Candidate is auto-provisioned; all other roles are provisioned explicitly | Compliant (`AuthSessionService.cs:144-162`); eligibility interpretation is A-01 |
| AP-04 | Users are identified by validated issuer + subject; provisioning is idempotent and concurrency-safe; disabled accounts are never reactivated | Issuer is **missing** (BE-01); idempotency and no-reactivation are compliant; concurrency safety is verified on SQL Server through release-validation item V-04 (AP-09), not by automated tests |
| AP-05 | Roles and resource permissions are managed by the application | Compliant (`idn.StaffRoleAssignment`; IDAM role claim ignored) |
| AP-06 | Local dev auth is unavailable outside Development | Compliant (`DevelopmentSignIn.EnsureAllowed`, `EnsureApprovedHandlersAsync`, `Program.cs:65-69`) |
| AP-07 | UI screenshots are visual references only; the BRD decides functionality | Applies to all slices |
| AP-08 | **IDAM opaque access tokens, validated by introspection** (approved 2026-11-12; full text in `docs/dotnet-engineering-standards.md` §19, "DAHC IDAM access-token validation"). Angular uses code + PKCE and sends the access token, never the ID token. The API introspects; there is no JWT validation of IDAM tokens. It checks activity, expiry, issuer, client/audience binding and scopes, and resolves users by issuer + subject. Introspection credentials stay on the backend. Raw tokens are never logged or persisted. Introspection is cached, time-limited, rate-limited and fails closed. The existing implementation is reused | Mostly compliant; gaps BE-01, BE-10 and BE-14. See §1.1 |
| AP-09 | **Automated backend testing uses xUnit with EF Core InMemory** (approved 2026-11-12) for application service and API integration tests. The existing 54 tests are retained and extended only where meaningful: business rules, validation, authorization, workflow transitions and error handling. There are no coverage targets and no redundant tests. Testcontainers, Docker-based SQL Server and LocalDB are **not** test dependencies. SQL-only operations use focused test doubles at existing boundaries (`ICandidateNumberAllocator`, `IApplicationNumberAllocator`, NSubstitute); production persistence is never weakened for InMemory. **Limitation:** InMemory does not reproduce relational constraints, transactions, concurrency tokens, sequences or provider-specific SQL, and no test may claim them. They are verified by the SQL Server release-validation checklist (plan §2.3, V-01 to V-09). Playwright remains the frontend E2E tool | Matches the existing suite (`TestDatabase.cs`, `DahcApiFactory.cs`). Supersedes DEC-03. BE-06 is reclassified from a defect to a documented limitation |
| AP-10 | **Configurable permission-based RBAC** (approved 2026-11-12), using ASP.NET Core policy-based authorization:<br>• **Permissions and roles.** Access is granted by permissions, never by hard-coded role names. Roles live in SQL Server and hold one or more permissions. A user may hold several roles, but only the **active role's** permissions apply; they are never combined.<br>• **Declaration.** Permissions use stable business codes, are defined in code, and are declared on controller actions. Several actions may share one code; URLs and controller or action names are never identifiers. Every protected endpoint declares a permission or a documented authentication-only exception, and anonymous endpoints are explicit and reviewed.<br>• **Catalog.** A system catalog in SQL Server is synchronised by a controlled, idempotent deployment process. New permissions are denied until granted. Administrators grant and revoke existing permissions but cannot create executable ones. Retired permissions keep their audit history.<br>• **Administrators** manage roles, grants and Staff role assignments. Delegable administrative permissions may be granted to configurable Staff roles; protected system-administration capabilities stay with `ADMINISTRATOR`, with escalation safeguards and no self-elevation (DEC-17). The API enforces everything; Angular uses permissions for UI only.<br>• **Business checks** (ownership, assignment scope, workflow state and business rules) are checked independently.<br>• **Constraints:** no custom authorization framework, rules engine, distributed cache or extra packages. | Design and gap analysis: [05-rbac-design.md](05-rbac-design.md). Today roles are code constants and policies check role names (G-01 to G-10). Plan step 15 |
| AP-11 | **Multi-role switching without re-authentication** (approved 2026-11-12):<br>• **API.** `/auth/me` returns the assigned active roles (stable ids and friendly names), the selected active role and its effective permissions. `PUT /api/v1/auth/active-role` (existing) verifies that the role exists, is active and is assigned. The selection is persisted server-side and restored after refresh.<br>• **Angular.** A header switcher appears only with more than one role. After a switch, Angular refreshes `/auth/me`; updates menus, routes and actions; clears role-dependent caches and pending requests; and navigates to the role's landing page, so no stale data is shown.<br>• **Revocation.** A revoked or deactivated active role is denied immediately: the selection is cleared and another role must be selected, with no automatic switch; if none remains, access is denied. At initial sign-in, a single valid role is auto-selected; with several, the user selects (corrections 2026-11-12, DEC-19).<br>• **Preserved:** RTL/LTR, accessibility and the design system. The frontend never decides business authorization. | Endpoint exists; changes are in [05-rbac-design.md §5](05-rbac-design.md#5-active-role-and-auth-contract-changes) (G-05 to G-07, G-11). Plan steps 15 and 11 |

### 1.1 AP-08 conformance of the current implementation

| # | Requirement | Status | Evidence / gap |
|---|---|---|---|
| 1 | Code + PKCE through the approved library | COMPLIANT | `dahc-portal/.../auth/auth.providers.ts:35-53` (`responseType: 'code'`, `angular-auth-oidc-client`); explicit `response_mode=query` is Phase 1 step 10 |
| 2 | Access token as bearer; ID token never substituted | COMPLIANT | `api-authorization.interceptor.ts:24-30` uses `getAccessToken()` (`auth.service.ts:67`); the ID token is read only for `id_token_hint` at sign-out (`auth.service.ts:76-89`) |
| 3 | Production validation via IDAM introspection | COMPLIANT | `Idam/IdamIntrospectionRegistration.cs:34-61` (Duende 7.0.2); endpoint from metadata (`IdamDiscoveryPolicy.cs`) |
| 4 | No JWT validation of IDAM tokens | COMPLIANT (code). The standards §13 text contradicted it and is **amended in this change** | `JwtBearer` registered only for development tokens in Development (`AuthenticationRegistration.cs:33-36`); a deployed host refuses non-introspection handlers (`:59-74`) |
| 5 | Activity, expiry, issuer, client/audience binding, scopes | PARTIAL | Activity is checked by the handler. Exact issuer and expiry: `TokenValidation.cs:38-47`. Client binding: `TokenClaims.cs:40-51`. **No scope check, and no audience check beyond `client_id`** (BE-14a, A-06) |
| 6 | Identity by validated issuer + subject | CONFLICT | BE-01 (subject only) |
| 7 | Server enforces activation, active role and resource access | COMPLIANT | `CurrentUserLoader.cs`, `Policies.cs`, `AccessAuthorizationHandler.cs`, candidate-scoped reads |
| 8–9 | Candidate-only auto-provisioning; staff explicit | COMPLIANT (pending A-01, B-01) | `AuthSessionService.cs:144-162` |
| 10 | Dev SFA separate, local tokens, never deployed | COMPLIANT confinement; CONFLICT on seeded users | `DevelopmentSignIn.EnsureAllowed`, `Program.cs:64-70`; BE-02 |
| 11 | Introspection credentials backend-only | COMPLIANT | `IdamOptions.ApiClientSecret` is required outside Development (`OptionsRegistration.cs:31`) and absent from committed config; the portal is a public client (`portal-config.ts:21`) |
| 12 | Raw tokens never logged or persisted | PARTIAL (**corrected 2026-11-12**) | Request log uses the route template (`DahcLoggingRegistration.cs:66-76`). No header logging. The cache key is a SHA-256 hash of the token (§1.2). **But `SaveToken` is not set, and the library default is `true`**, so the raw token is kept in the request's authentication properties. It is not logged or written to storage today, but this contradicts item 12. 14A sets it to `false` |
| 13 | Caching, timeouts, rate limiting, failure handling | PARTIAL | Cache max 60 s (`appsettings.json`). 10 s timeout. 5xx or unreachable fails closed as 503 (`IdamBackchannelHandler.cs`, `IdamAvailability.cs`). **Gaps:** introspection runs before the rate limiter (BE-10); outbound concurrency is unbounded (BE-14b, add only if needed); cache activation, cap at `exp` and validation on cache hits are unverified (BE-14c). Circuit breaking is deferred (DF-10) |
| 14 | Reuse; do not rebuild | APPLIED | Retained in 01 §6; plan steps 14A and 14B extend it only |

### 1.2 Introspection library capabilities (verified, not assumed)

Verified on 2026-11-12 against `Duende.AspNetCore.Authentication.OAuth2Introspection` 7.0.2, the version pinned in `Directory.Packages.props`. The check read the package's XML documentation and ran a throwaway probe outside the repository that printed the effective default options.

| Capability | Library behaviour | DAHC use |
|---|---|---|
| Result cache | `HybridCache` (`Microsoft.Extensions.Caching.Hybrid`, a package dependency). `AddOAuth2Introspection` registers `DefaultHybridCache` itself. `SetCacheEntryFlags` default `None` (local and distributed) | Use as is. No custom cache. In-process only unless a distributed cache is registered |
| Cache duration | `CacheDuration`, default 5 min | Already overridden by `Idam:IntrospectionCacheMaxSeconds` (60 s, max 300). A test must show that a cached result is not accepted past the token's `exp` (14A) |
| Cache key | `CacheKeyGenerator`, default SHA-256 of the token, Base64 (probe: `"abc"` → `ungWv48B…`), with `CacheKeyPrefix` default empty | Keep the default; the raw token is never a key. Optionally set a prefix |
| Token retention | `SaveToken`, **default `true`** | Set to `false` (14A) |
| JWT-shaped tokens | `SkipTokensWithDots`, default `false`, so such tokens are sent to IDAM, which rejects them | Keep. A deployed host has no JWT handler, so the result is 401 |
| Validation hook | `Events.OnTokenValidated` | Existing issuer, expiry and client checks. 14B adds scope and audience as an authorization requirement (403) |
| Backchannel | Named `HttpClientFactory` client `OAuth2IntrospectionDefaults.BackChannelHttpClientName` | Existing 10 s timeout and `IdamBackchannelHandler` (marks 503). A concurrency bound, if ever needed, goes in this handler |

## 2. Confirmed architectural baseline (ratify)

| Id | Baseline | Evidence |
|---|---|---|
| BL-01 | Modular monolith: `DAHC.<Module>.Core / .Service / .Data`, with shared `DAHC.Service` (results, paging, access, time) and `DAHC.Data` (DbContext, interceptors) | `DAHC.slnx` |
| BL-02 | One `DahcDbContext`, one SQL Server database, a schema per area (`idn`, `cfg`, `app`, `ops`) | `DahcDbContext.cs` |
| BL-03 | Explicit business process services with persisted status. No mediator, CQRS bus, generic repository or workflow engine | standards §10; code |
| BL-04 | Expected outcomes are `Result<T>`. The host translates them to the `ApiResponse<T>` envelope or a top-level ProblemDetails `{code, traceId, errors[]}` | `ApiResults.cs`, `ProblemFactory.cs` |
| BL-05 | Public GUID ids (v7) in the API; integer keys stay internal | entities `PublicId` |
| BL-06 | Optimistic concurrency via `VersionNo` ETag + If-Match (428/412) and `RowVersion`. Multi-row invariants use unique or filtered indexes or HOLDLOCK, named in comments | `CandidateApplicationConfiguration.cs:100-117` |
| BL-07 | `Idempotency-Key` on create operations, scoped per actor and operation | `CandidateApplicationService.cs` |
| BL-08 | Soft delete via shadow `IsDeleted` and a query filter; audit row in the same save | interceptors |
| BL-09 | Bearer-only API, IDAM opaque tokens via introspection (now approved as AP-08), per-request local user and role reload, active-role (not union) authorization | `Authentication/*`, `Authorization/*` |
| BL-10 | Angular workspace with `dahc-ui` (library), `dahc-playground`, `dahc-portal`, Playwright; no third-party UI or CDK; `angular-auth-oidc-client` as the certified OIDC library | `src/frontend/package.json` |
| BL-11 | i18n via `@angular/localize`, one build per locale (en, ar); API cultures en-AE / ar-AE | locale files, `appsettings.json` |
| BL-12 | API versioning in the path: `/api/v1/...` (the guideline text says `/api/...` and needs amending) | controllers |

## 3. Technical decisions

Status, as of 2026-11-12:
- **APPROVED**: may be implemented.
- **PENDING**: awaiting approval; it gates the steps named in the plan.
- **CANCELLED**: withdrawn; kept for history.

| Id | Decision | Reason | Owner | Status |
|---|---|---|---|---|
| DEC-01 | Add `IdamIssuer` to the identity tables; unique `(IdamIssuer, IdamUserId)` | AP-04, BE-01 | Tech lead | APPROVED (implements AP-04; plan step 3). The database script comes with DEC-02 |
| DEC-02 | Approve `Microsoft.EntityFrameworkCore.Design` (dev-time, `PrivateAssets=all`) and `dotnet-ef` local tool; one migrations owner; idempotent scripts at deployment | BE-05 | Tech lead + DBA | PENDING (new package; database work) |
| DEC-03 | ~~SQL Server test fixture: Testcontainers or a shared LocalDB~~ | BE-06 | Tech lead | **CANCELLED** 2026-11-12, superseded by AP-09. Engine behaviour is verified by the release-validation checklist (plan §2.3) |
| DEC-04 | Approve `Microsoft.AspNetCore.OpenApi` (first-party) to generate the contract; commit `openapi.yaml`; CI drift check | BE-08, INT-01 | API owner | PENDING (new package) |
| DEC-05 | Approve the frontend dev tooling already in use (eslint, typescript-eslint, angular-eslint) in the Angular decisions table | FE-19 | FE lead | PENDING (formal record; the tooling is already in `package.json`) |
| DEC-06 | Dev SFA = username lookup against seeded dev users held in user secrets; a dev bootstrap seeds one staff user per role plus candidates | BE-02, AP-01 | Tech lead | PENDING (depends on the step 4 database) |
| DEC-07 | Explicit audit writer for security and business events (action, outcome, reason code, resource, trace id) alongside the row-change interceptor | BE-03, BRD L590 n3 | Tech lead | APPROVED (plan step 8; any new table goes through the migrations owner) |
| DEC-08 | Deployment ADR covering: reverse proxy and forwarded headers (known proxies), static hosting with CSP/Trusted Types/nonce injection, environment matrix, IDAM end-session/revocation endpoints, SQL Server version, AP-08 deployment rules (never `Development`, no `DevelopmentSignIn`, secret from the store, required scopes per environment) | BE-10, BE-14, FE-10, INT-07 | Infra + tech lead | PENDING. The proxy part must be decided and validated with 14A before UAT |
| DEC-09 | Module boundary rule: cross-module reads only via named query classes in `DAHC.Data/Querying` with owners; writes only via the owning module's service. Fill in §19 "Modules" | BE-09 | Architect | PENDING |
| DEC-10 | Contract change for the open cycle: `GET /api/v1/cycles?status=open` (preferred) or optional `cycleId` on `/programs` | INT-02 | API owner + BA | PENDING (on B-05) |
| DEC-11 | Expose `maxPreferences` on `ProgramItem`; remove the client category rule | INT-04, FE-05 | API owner | PENDING |
| DEC-12 | Workflow persistence pattern for later modules: one status column per BRD status profile (Application, Verification, Portfolio, Round, Announcement), an append-only `StatusHistory` table per aggregate (from, to, actor, role, reason, time) and explicit assignment tables (pool, assignee, retrieved, due). Transition rules live in `static` rule classes in `.Service` and are unit-tested. No generic engine | Audit prompt §3; BRD §5 status profiles | Architect | PENDING (needed by later slices) |
| DEC-13 | Requirement traceability: tests tagged `[Trait("Requirement", "US-x.y.z/AC-n")]`, Playwright `test.describe('US-x.y.z …')`, PR template lists requirement ids | standards §17 | Tech lead | APPROVED |
| DEC-14 | **Introspection protection: the smallest secure solution.** No new packages and no new abstractions. Keep the existing introspection handler, the `HttpClientFactory` backchannel, its bounded timeout and the library cache. | AP-08, BE-10, BE-14 | Tech lead | **APPROVED** 2026-11-12, with adjustments |

DEC-14 is split into two plan steps:

**14A: approved now.**
1. A pre-authentication rate limit that runs before introspection, coordinated with the trusted-proxy configuration (step 13, DEC-08). Both are validated before UAT.
2. Verification of cache expiry and fail-closed behaviour, using the library's own options (§1.2). There is no custom cache or authentication infrastructure.
3. Integration tests for active, inactive, expired, invalid and unavailable IDAM responses.
4. A bound on outbound concurrency, only where needed, using built-in .NET primitives.

**14B: gated on A-06.** Scope and audience checks per the confirmed IDAM contract.

Required HTTP outcomes:

| Case | Outcome |
|---|---|
| Invalid, inactive or expired token | 401 |
| Insufficient scope on an otherwise authenticated token | 403 (enforced as an authorization requirement, not an authentication failure) |
| Rejected by a rate limit | 429 |
| IDAM unavailable | 503 |

`Microsoft.Extensions.Http.Resilience` and circuit breakers are not introduced (DF-10).

**RBAC implementation choices (within AP-10/AP-11; final corrections 2026-11-12).** The decisions used by plan steps 15 and 11 are APPROVED with those steps. The ones for Administration (step 16, slice S-ADM) stay PENDING. Details are in [05-rbac-design.md](05-rbac-design.md).

| Id | Decision | Reason | Owner | Status |
|---|---|---|---|---|
| DEC-15 | Permission declaration: `[RequirePermission(code)]` (an `AuthorizeAttribute` implementing the built-in `IAuthorizationRequirementData`), handled by the existing `AccessAuthorizationHandler`. `[AuthenticatedOnly("reason")]` marks documented exceptions; `[AllowAnonymous]` is used only on the reviewed list. A startup guard and an InMemory endpoint-enumeration test fail if any endpoint lacks a declaration or references an unknown or retired code | AP-10 §2; G-03, G-10 | Tech lead | **APPROVED** (step 15) |
| DEC-16 | Permission catalog: constants and metadata in `DAHC.Service/Access/Permissions.cs` as the source of truth. `idn.Permission` is seeded with EF Core `HasData`, so each change is a reviewed migration applied by the idempotent deployment script. Retirement is a flag, and rows are never deleted. Startup reports drift. Catalog entries carry `IsAdministrative` and `IsProtected` (05 §7) | AP-10; G-02 | Tech lead + migrations owner | **APPROVED** (step 15: catalog, model and `HasData`). The database script waits for DEC-02 (step 4) |
| DEC-17 | **Controlled delegation and escalation safeguards (revised 2026-11-12, 05 §7):**<br>• **Tiers.** Administrative permissions have two tiers. *Protected* (`roles.manage`, `role-permissions.manage`) belong to `ADMINISTRATOR` only and cannot be delegated or revoked from it. *Delegable* (`roles.read`, `staff.read`, `staff.manage`, `staff-roles.manage`, `audit.security.read`) may be granted to configurable Staff roles by an Administrator.<br>• **Administrator-only actions.** Only an active `ADMINISTRATOR` grants or revokes permissions, assigns `ADMINISTRATOR`, or modifies an account holding protected capabilities.<br>• **Ceiling for delegated actors.** They may assign only roles whose permissions are a subset of their own active role's.<br>• **No self-elevation.** No actor changes their own assignments, status, or the grants of a role they hold.<br>• **Audience separation** between Candidate and Staff permissions.<br>• **Last administrator.** Protected in the same transaction with `UPDLOCK, HOLDLOCK` (409 `admin.last_administrator`) | AP-10 §3 | Tech lead | PENDING (step 16, S-ADM) |
| DEC-18 | First-administrator bootstrap: a reviewed, idempotent DBA script in the deployment runbook. It creates a `PENDING` administrator and writes an audit row. **It refuses if any staff account (pending, bound or deactivated) already holds `ADMINISTRATOR`, or if the login identifier already exists**, so a duplicate protected administrator, including a pending one, can never be created. This is backed by a unique `LoginIdentifier` across all staff accounts. Binding follows B-06. Development uses the step 4 dev bootstrap | AP-10 §3 | Tech lead + DBA | PENDING (step 16; binding gated by B-06) |
| DEC-19 | **Active-role selection (revised 2026-11-12):**<br>• **Initial sign-in.** Exactly one valid role → auto-selected; several → the user must select.<br>• **Revoked or deactivated active role.** The selection is **cleared** (`ActiveRoleId = null`, `ActiveRoleSelectionRequired = 1`, or detected on read for date expiry), and the user must select another valid role. There is **no automatic switch**, even when one role remains. `activeRole: null`, and 403 `access.active_role_required` outside `me`, `active-role` and `sign-in`.<br>• **No valid role.** 403 `account.no_role`.<br>• **Ordering.** `SortOrder` only orders lists | AP-11 items 9-10; G-06 | Tech lead | **APPROVED** (steps 15 and 11) |
| DEC-20 | `AuthSession` contract: `roles[{id, code, name}]`, `activeRole \| null`, `permissions[]`. The `active-role` body becomes `{ roleId }` (the hard-coded `AllowedValues` is removed). Role names are bilingual (`NameEn`, `NameAr`). Breaking, but there is no client yet (FE-03) | AP-11; G-05, G-07 | API owner | **APPROVED** (steps 15 and 11). The draft team contract (`Contracts/openapi`) has the old role-based session; correct it to 05 §5 contract-first in step 15 (01 §7, C-01 to C-04). The approved design, not the draft, decides |

## 4. Open business decisions

Questions are grouped by the slice they affect. **BLOCKER** means correct work on that slice cannot continue without an answer. B-01 to B-05 remain **open business decisions**. Remediation keeps the current provisional behaviour (plan §1, "Business decisions that stay visible") and never finalises it silently.

### 4.1 BLOCKERS for the foundation and the first slice

| Id | Question | BRD source | Why it blocks |
|---|---|---|---|
| B-01 | ~~Who provisions staff users and their roles? Does an `ADMINISTRATOR` role exist?~~ **APPROVED and RESOLVED 2026-11-12 (AP-10).** An `ADMINISTRATOR` system role exists. Administrators manage roles, grants, Staff provisioning (before and after first IDAM login), multiple role assignments, account activation and audit history. The first administrator comes from a controlled bootstrap (DEC-18). This also resolves BE-12 for `ADMINISTRATOR` | OQ-01 (resolved) | — (resolved). Follow-on blockers B-06, B-07 |
| B-06 | **Security-critical.** **OPEN.** Which verified IDAM-asserted attribute binds a pre-provisioned Staff account to issuer + subject at first sign-in? Which claim carries it, and in introspection or UserInfo? Is any further confirmation required? No answer is assumed. Until it is decided, pending accounts do not bind in UAT or Production | AP-10 §3 "identity ownership and account binding must be verified"; ties to A-06 | Blocks pre-provisioned binding (05 §6) and therefore the first-administrator bootstrap in UAT/Production. It does **not** block the RBAC model, enforcement or Development (dev bootstrap seeds bound users) |
| B-07 | **OPEN.** Identity-linking policy. No answer is assumed. A person who already holds a **Candidate** account (same issuer + subject) is given Staff access. May one identity hold both, and how are they kept apart (the current loader lets a staff record win and hides the candidate records)? Or must staff use a separate identity (A-02)? | AP-10 §3 "do not automatically merge … without an approved identity-linking policy" | Until it is answered, provisioning Staff access for an identity with a Candidate account fails closed (`account.link_required`, no merge). This is the interim requirement, not a solution. Only that scenario is blocked; the RBAC foundation and other work are not |
| B-02 | Duplicate account outcome. The code stores the duplicate inactive and refuses with 409 `account.duplicate`. Is "block and direct to original account" correct? Do matching keys (any one of EID/passport/mobile, normalised) match the BRD intent? Where is the supervisor report? | OQ-03; L508 AC4-6 | Affects every first sign-in |
| B-03 | Application identifier: `CandidateID-G<cycle>` (L723) or `<year><7 digits>` (L1096, implemented) or both? | OQ-05 | Affects the stored unique identifier, numbering and CASPER import |
| B-04 | One active application per **cycle** (L530, L669; implemented as a unique index) or one active draft per **program per cycle** (L1081 n6)? | OQ-07 | Core constraint in the first slice |
| B-05 | Admission cycle model: global vs per program; opening, deadline and grace-period fields and values | OQ-06 | Dashboard "Start New" and `/programs` cycle discovery (INT-02) |

### 4.2 Assumptions (proceed, but confirm)

| Id | Assumption | Basis |
|---|---|---|
| A-01 | A Candidate is eligible for auto-provisioning when they have completed IDAM registration, sign in through the DAHC web client, are not a pre-registered staff identity and pass the duplicate check. Per-program applicant eligibility (Candidate Status, Appendix 3.3) is checked when applying, not at provisioning | L491, L497, L508; L2105-2114 |
| A-02 | A person with staff roles who also needs to apply uses a separate candidate identity, linked via `LinkedCandidatePublicId` (D-14). The role switcher lists staff roles only. **Superseded when B-07 is answered** | `StaffUser.cs:24-27`; L1152 AC5 |
| A-03 | Platform-level deactivation exists (an `IsActive` flag) even though the BRD only mentions IDAM lockout; a deactivated user is refused with 403 and never reactivated by signing in | AP-04; L1408 "no longer active" |
| A-04 | Arabic RTL UI and WCAG 2.2 AA are required by the approved engineering guidelines, although the BRD is silent | Angular guidelines §3–4; BRD NFR gap |
| A-05 | Session inactivity timeout follows IDAM; the value shown to candidates (L546 n3) is configuration | L521 AC3 |
| A-06 | **Dependency for IDAM-specific validation only (plan 14B and V-11); not a blocker for other foundation work.** IDAM's introspection response includes `active`, `iss`, `sub`, `exp`, `client_id` and `scope`. The API requires scope `api` (the scope the portal requests). Audience binding is enforced through `client_id` against the registered DAHC web and API clients, plus `aud` if IDAM returns it. **Confirm with the IDAM team** using a sample introspection response for each environment | AP-08 item 5; `environment.ts` scopes |

### 4.3 Deferred (needed by later slices; does not block the foundation)

| Id | Topic | Needed by slice |
|---|---|---|
| DF-01 | Training-site list and site-specialty mapping (Appendix 3.2 "TBC") | Program & preferences with real data (dev seed can be synthetic) |
| DF-02 | Officer and referee pool assignment model and supervisor "scope" | Verification, Scoring |
| DF-03 | Portfolio score formula (garbled operator; points vs weights) | Scoring |
| DF-04 | Payment gateway, fees, receipts; FileNet contract | Submission |
| DF-05 | ICP integration contract; UAE PASS-only prefill | Personal information |
| DF-06 | Email/SMS templates and OTP provider (templates "TBC") | Withdrawal, notifications |
| DF-07 | Conflicts listed in Appendix B §10: officer portfolio visibility, who announces, Senior Referee return-to-pool, pool threshold 35 vs 80, SDLE 560 vs 542, EPREE formula, Board "Tier", withdrawal window, status naming variants | Respective slices |
| DF-08 | Integration clients ("middleware acting for a user", D-21) | Not in the BRD; keep inert |
| DF-09 | NFRs missing from the BRD: performance, availability, retention, encryption, privacy | Before UAT |
| DF-10 | IDAM backchannel resilience (circuit breaker, `Microsoft.Extensions.Http.Resilience`, retry policy). This is a future enhancement. Reconsider only on evidence: load-test results, or observed IDAM latency or instability in UAT or Production. Until then, the bounded timeout, cache, pre-auth rate limit and fail-closed 503 apply (DEC-14) | After load testing (DF-09) or an observed incident |
| DF-11 | In-process role→permissions cache invalidated by an `idn.AuthorizationVersion` stamp read each request (05 §8). Add it only if load testing shows that the per-request permission load is a bottleneck. Revocation must still take effect on the next request | After load testing |

## 5. UI reference conflicts noted

- Four BRD sections have no visual reference: Residency Entrance Exam (US-1.3.9), Portfolio (US-1.3.10), Summary & Payment (US-1.3.12) and the Appeal panel. Extend the existing visual pattern to them; do not treat them as out of scope.
- "Residency information" is the Fellowship applicant's previous residency (US-1.3.7), not the entrance exam.
- Screen completeness must be tested against the field inventory in Appendix B §6, not against the screenshots.

## 6. Team `Open-Questions.md` mapping (re-check 2026-11-12)

The team decisions remain the record for their topics unless an approved decision below supersedes them. Team `OQ-nn` is written TQ-nn here. The files under `Contracts/` are **preliminary drafts**, not decisions (01 §7). In `Database_Schema/`, only `ExistingDatabase/` is consulted, and only for future legacy-data migration planning.

| Team id | Topic | Relation to this register |
|---|---|---|
| D-01 | EF Core migrations are the schema of record | Consistent; BE-05 and DEC-02 |
| D-03 | Role-based authorization (`x-dahc-roles`) | **Superseded by AP-10** (permission-based RBAC) |
| D-04, D-14 | Separate candidate and staff records, linked by UUID | Input to B-07 (still open) |
| D-16 | Data tests on EF Core InMemory | Consistent with AP-09 |
| D-19 | Application number `<cycle start year><7 digits>` | Technical decision matching B-03; **B-03 stays open until the business confirms** |
| D-22 | One `DahcDbContext` | Consistent with BL-02 |
| D-26 | One active application per candidate per cycle | Technical decision matching B-04; **B-04 stays open until the business confirms** |
| TQ-11 | Active role for multi-role staff | Answered by AP-11 and DEC-19 |
| TQ-15 | IDAM items: `sub` is currently the username; an immutable identifier is pending | Input to B-06 and BE-01 (issuer + subject requires a stable subject); stays with the IDAM team |
| TQ-20 | Duplicate-account handling | Same question as B-02 |
| TQ-23 | EF Core design-time tools | Same as DEC-02 |
| TQ-24 | Current cycle id for `listPrograms` | Same as B-05 and DEC-10 |
| TQ-25 | `maxPreferences` on `Program` | Same as DEC-11 |
| TQ-27 | OIDC library approval; single sign-out by POST | Library already baselined (BL-10); sign-out method stays with the IDAM team |
