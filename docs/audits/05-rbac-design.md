# 05 — Configurable RBAC and Active-Role Switching: Design Baseline

**Status: APPROVED ARCHITECTURE (AP-10, AP-11; final corrections 2026-11-12).**
- **Approved for implementation:** plan step 15 (RBAC foundation) and step 11 (Angular role switching), subject to their dependencies.
- **Not approved:** step 16 and slice S-ADM (Administration), which remain a separate slice and are not part of the foundation.

This document is the single design reference for permission-based authorization. Decisions are in [03-decisions-register.md](03-decisions-register.md), sequencing is in [02-remediation-plan.md](02-remediation-plan.md), and rules are in `docs/dotnet-engineering-standards.md` §19 and `.claude/rules/authorization.md`.

It extends the existing foundation. It does not change authentication (AP-01 to AP-08), Candidate-only auto-provisioning, or issuer + subject matching.

---

## 1. Current implementation (reviewed 2026-11-12)

### 1.1 Reusable components (retain)

| Component | Location | Role in RBAC |
|---|---|---|
| Per-request local user reload | `Http/AccessContextMiddleware.cs`, `Identity.Data/CurrentUserLoader.cs`, `IdentityUsers.cs` | Extend to load the active role's effective permissions in the same pass; revocation then takes effect on the next request |
| `CurrentAccess` / `CurrentUser` | `DAHC.Service/Access/` | Add `Permissions` (set of codes) and the active role's id and name |
| Single authorization handler | `Authorization/AccessAuthorizationHandler.cs` | Add one `PermissionRequirement` branch; keep the account-status refusals |
| Fallback and default policy ("active local user") | `Authorization/Policies.cs` | Keep. It becomes the **authentication-only** baseline |
| ProblemDetails refusal writer | `Authorization/AccessResultHandler.cs` | Keep: 401, 403 with code, 503 |
| Active-role rules and persistence | `ActiveRoleRules.cs`, `StaffUser.ActiveRoleCode`, `AuthSessionService.SwitchActiveRoleAsync` | Keep the service and endpoint; change the role identifier and the revoked-role behaviour (§5) |
| Role assignment with validity dates | `idn.StaffRoleAssignment` (`ValidFrom`/`ValidTo`) | Keep; replace the free-text `RoleCode` with an FK to `idn.Role` |
| Staff pre-registration, never created by sign-in | `StaffUser`, `AuthSessionService.SignInOnceAsync` (staff matched first) | Keep; extend with pending binding (§6) |
| Row-change audit and the planned audit writer | `AuditSaveChangesInterceptor`, `ops.AuditEvent`, DEC-07 (step 8) | All administrative and security events go through the step 8 audit writer |
| IDAM role claim ignored | `AccessAuthorizationHandler` comment and code | Unchanged |

### 1.2 Gaps against AP-10 and AP-11

| # | Gap | Evidence |
|---|---|---|
| G-01 | Roles are code constants; there is no role table (`idn.AccessRole` is referenced in a comment but does not exist) | `DAHC.Service/Access/RoleCodes.cs:4-6` |
| G-02 | No permission, role-permission or catalog tables | `DahcDbContext.cs:24-56` |
| G-03 | Policies check role names, not permissions | `Policies.cs:42-49`, `AccessRequirements.cs:9` |
| G-04 | `StaffRoleAssignment.RoleCode` is free text with no FK; the role order comes from configuration (`Access:StaffRoleOrder`) | `StaffRoleAssignmentConfiguration.cs:22`, `appsettings.json` |
| G-05 | The active-role request accepts a hard-coded `AllowedValues` list of role codes | `Contracts/SwitchActiveRoleRequest.cs:12-21` |
| G-06 | A revoked or ended active role silently falls back to the first held role, instead of requiring a new selection | `ActiveRoleRules.ResolveActiveRole` |
| G-07 | `AuthSession` returns role codes only: no ids, display names or permissions | `Identity.Service/AuthSession.cs:20-22` |
| G-08 | Staff can be pre-registered only with the IDAM subject; there is no pending binding by login identifier | `StaffUser.IdamUserId`, `SignInOnceAsync` |
| G-09 | No administration endpoints, bootstrap, last-administrator or escalation protection | — |
| G-10 | No check that every endpoint declares its authorization | — |
| G-11 | Angular: no role switcher; the guard checks `userType`; no permission model | `candidate.guard.ts:44`, `auth.models.ts:14-24`, FE-03 |

## 2. Endpoint inventory and minimum migration

Every existing action, its current mechanism and its proposed declaration. Permission codes are proposals, confirmed in step 15's review.

| Method and route | Controller.Action | Current | Proposed |
|---|---|---|---|
| `POST /api/v1/auth/sign-in` | `AuthController.SignInAsync` | `Policies.SignIn` (valid user token; no local user yet) | **Authentication-only exception** (documented: it provisions or matches the user) |
| `GET /api/v1/auth/me` | `AuthController.GetCurrentSession` | default policy (active user) | **Authentication-only exception** (own session). It must also work when an active role must be chosen (§5) |
| `PUT /api/v1/auth/active-role` | `AuthController.SwitchActiveRoleAsync` | `Policies.Staff` (active role is a staff role) | **Authentication-only exception**; the service validates the target role (§5) |
| `GET /api/v1/applications` | `ApplicationsController` (list) | `Policies.Candidate` | `applications.own.read` |
| `POST /api/v1/applications` | `ApplicationsController` (create) | `Policies.Candidate` | `applications.own.create` |
| `GET /api/v1/applications/{id}` | `ApplicationsController` (get) | `Policies.Candidate` | `applications.own.read` |
| `PATCH /api/v1/applications/{id}` | `ApplicationsController` (update) | `Policies.Candidate` | `applications.own.update` |
| `GET /api/v1/me/dashboard` | `CandidateDashboardController` | `Policies.Candidate` | `applications.own.read` (shared permission) |
| `GET /api/v1/programs` | `CatalogController` | `[Authorize]` (any active user) | `catalog.read` |
| `GET /api/v1/programs/{id}/specialties` | `CatalogController` | `[Authorize]` | `catalog.read` |
| `GET /api/v1/specialties/{id}/sites` | `CatalogController` | `[Authorize]` | `catalog.read` |
| `GET /health` | `MapHealthChecks` | `AllowAnonymous` | **Anonymous, reviewed** |
| Development sign-in | `MapDevelopmentSignIn` (Development only) | anonymous | **Anonymous, reviewed**; Development only (AP-06) |

Ownership checks stay in the services: `ApplicationReader` scopes reads by candidate, and another candidate's record returns 404. Permissions never replace them.

**Minimum code migration (step 15):**
1. Add a `PermissionRequirement(string Code)` and handle it in the existing `AccessAuthorizationHandler`.
2. Add `[RequirePermission(Permissions.X)]`, an `AuthorizeAttribute` that implements the built-in `IAuthorizationRequirementData` (ASP.NET Core 8+). Requirements then come from metadata, with no custom policy provider or registry.
3. Add `[AuthenticatedOnly("reason")]`, a metadata-only attribute marking the documented exceptions.
4. Replace `Policies.Candidate` and `Policies.Staff` on the four controllers.
5. Remove the two policies and the role list on `ActiveUserRequirement`. Keep `Policies.SignIn` and the fallback policy.
6. `RoleCodes` keeps only the two **system** role codes (`CANDIDATE`, `ADMINISTRATOR`), which provisioning and bootstrap need. Every other role becomes data.

There are no new packages, no policy-provider framework and no rules engine.

## 3. Data model (extends `idn`; included in the initial migration)

Because no migration exists yet (BE-05), these tables go into the step 4 `Initial` migration. No data migration is needed.

| Table | Key columns | Invariants (DB-enforced where possible) |
|---|---|---|
| `idn.Role` (new) | `RoleId`, `PublicId` (stable API id), `Code` (immutable, unique), `NameEn`, `NameAr`, `Audience` (`CANDIDATE`/`STAFF`), `IsSystem`, `IsActive`, `SortOrder`, `RowVersion` | Unique `Code`. System roles (`CANDIDATE`, `ADMINISTRATOR`) cannot be deactivated. Renaming changes the names only, never the `Code` |
| `idn.Permission` (new) | `PermissionId`, `Code` (unique), `Module`, `DescriptionEn`, `DescriptionAr`, `Audience`, `IsAdministrative`, `IsRetired`, `RetiredAt` | Rows are never deleted. Seeded from the code catalog (§4) |
| `idn.RolePermission` (new) | `RoleId`, `PermissionId`, `GrantedAt`, `GrantedByStaffUserId` | Unique `(RoleId, PermissionId)`. Revocation deletes the row and records an audit event. The service enforces matching audience and administrative-only rules (§7) |
| `idn.StaffRoleAssignment` (change) | `RoleCode` → `RoleId` FK; keep `ValidFrom`/`ValidTo` | FK to `idn.Role`. A filtered unique index allows one open assignment per user and role. The Candidate role is never assigned here |
| `idn.StaffUser` (change) | `ActiveRoleCode` → `ActiveRoleId` FK (nullable; null means no selection); `ActiveRoleSelectionRequired` (bit, set when a revocation clears the selection); plus `IdamIssuer` (DEC-01), `LoginIdentifier` (normalised, for pending binding), `BindingStatus` (`PENDING`/`BOUND`), `BoundAt`, `ProvisionedByStaffUserId` | Unique `(IdamIssuer, IdamUserId)` where bound. Unique `LoginIdentifier` where not null (all staff accounts, so neither the bootstrap nor the admin API can create a duplicate) |
| `ops.AuditEvent` (existing) | — | Administrative events from the step 8 writer. Permission codes are stored as text, so audit history survives retirement |

Effective permissions for a request are the non-retired permissions of the **active role only**, and only when:
- the role is active;
- the assignment is valid today (staff) or the user is an active Candidate;
- the user account is active.

Load them in the existing per-request pass, with at most one extra indexed query. No cache (see §8).

## 4. Permission catalog: discovery and synchronisation

1. **Code is the source of truth.** `DAHC.Service/Access/Permissions.cs` holds constants and metadata for each permission:
   - stable dotted codes, such as `applications.own.read` or `staff.manage`;
   - module, audience and the administrative flag;
   - English and Arabic descriptions;
   - a retired flag.

   Codes are business operations, never URLs or controller or action names. Several actions may share one code.
2. **Declaration on actions.** `[RequirePermission(...)]` on the controller or action, `[AuthenticatedOnly("reason")]` for documented exceptions, and `[AllowAnonymous]` only on the reviewed list in §2.
3. **Discovery.** At runtime, `EndpointDataSource` lists every endpoint with:
   - controller and action (`ControllerActionDescriptor`);
   - HTTP method (`HttpMethodMetadata`);
   - route template (`RouteEndpoint.RoutePattern`);
   - its permission metadata.

   This is used for three things:
   - **Startup guard.** The host refuses to start if an endpoint references a code that is not in the catalog or is retired, or if an endpoint has no declaration.
   - **CI test.** An InMemory API test enumerates the endpoints and asserts that each has exactly one of permission, authentication-only or reviewed anonymous. The anonymous allow-list lives in the test, so any addition is reviewed.
   - **Admin read model.** `GET /api/v1/admin/permissions` lists the catalog with the endpoints that use each code. It is informational and never stored as an identifier.
4. **Synchronisation to SQL Server.** `idn.Permission` is seeded from the code catalog through EF Core `HasData`. A new, changed or retired permission therefore shows up as a reviewed migration diff, owned by the migrations owner and applied with the idempotent deployment script (DEC-02). This needs no extra sync tool.
5. **Deny by default.** A new permission has no `RolePermission` rows, so it is denied until an administrator grants it. The only exception is the reviewed default grants for system roles, seeded in the same migration.
6. **Administrators cannot create permissions.** The admin API can only grant or revoke catalog codes that exist and are not retired.
7. **Retirement.** Mark the code retired in the catalog. The next migration sets `IsRetired`, existing grants stop taking effect, and the admin UI hides the code. Rows and audit history are kept.
8. **Drift.** At startup, the API compares the code catalog with `idn.Permission`. A missing row logs an error and marks the health check degraded; the permission is denied anyway.

## 5. Active role and `/auth` contract changes

| Item | Change |
|---|---|
| `AuthSession` (`GET /auth/me`, `POST /auth/sign-in`, `PUT /auth/active-role`) | `roles: [{ id, code, name }]`, active, assigned and valid roles only, with `name` localised by `Accept-Language`. `activeRole: { id, code, name } \| null`. `permissions: string[]` (effective permissions of the active role). Other fields unchanged |
| `PUT /api/v1/auth/active-role` | Path and endpoint kept. Body becomes `{ roleId: guid }`, replacing the hard-coded `AllowedValues` `roleCode`. Policy: authentication-only. The service checks that the role exists and is active, and that the user holds a valid assignment today and is active. Otherwise 403 `access.role_not_assignable`. It persists `StaffUser.ActiveRoleId` and returns the new session |
| Active-role resolution (each request; `ActiveRoleRules`, a pure function with unit tests) | Rules, in order:<br>1. The stored `ActiveRoleId` is valid (role active, assignment valid today, user active): it is the active role.<br>2. **Revoked:** the stored role is set but no longer valid, or `ActiveRoleSelectionRequired = 1`. The selection is treated as **cleared**: `activeRole: null`, status `ActiveRoleRequired`. There is **never an automatic switch**, even when only one valid role remains.<br>3. **Initial**, meaning no selection was ever made (`ActiveRoleId` null, flag 0): exactly one valid role → auto-selected and persisted at sign-in; several → `ActiveRoleRequired`.<br>4. No valid role at all → 403 `account.no_role` (existing).<br>While `ActiveRoleRequired`, every endpoint except `me`, `active-role` and `sign-in` returns 403 `access.active_role_required`. `Role.SortOrder` (replacing `Access:StaffRoleOrder`) orders lists only; it never picks a role |
| Clearing on revocation | Operations that remove an assignment or deactivate a role set `ActiveRoleId = null` and `ActiveRoleSelectionRequired = 1` for the affected users, in the same transaction (a set-based update for role deactivation). Date-based expiry (`ValidTo`) has no write and is caught by rule 2. A successful `PUT active-role` sets the id and resets the flag |
| Candidates | One system role (`CANDIDATE`), so there is no switcher. `PUT active-role` → 403 (unchanged behaviour) |
| Combining roles | Never. Only the active role's permissions are loaded |

The contract changes are recorded in `openapi.yaml` before implementation (contract-first). They depend on recovering or regenerating the contract (R-0.5, DEC-04).

## 6. Staff provisioning and identity binding

| Scenario | Flow |
|---|---|
| **Before first IDAM login** | The administrator creates a `PENDING` StaffUser with a normalised `LoginIdentifier` (an IDAM username, or an email address) and assigns roles. At the first successful IDAM sign-in, `SignInOnceAsync` first looks up a bound staff user by issuer + subject. If none exists, it looks for a pending staff user matching the **verified IDAM binding attribute, which B-06 has not yet decided**. Only then does it bind issuer + subject once, atomically (row version plus the unique index), and audit `staff.bound`. Until B-06 is decided, no pending account binds in UAT or Production, and no binding attribute is assumed. Email or username alone never grants access |
| **After first IDAM login** | For an identity that is already a bound StaffUser, roles are added through the normal assignment flow and take effect on the next request. For an identity that already holds a **Candidate** account, there is no automatic merge and no second identity: the request is refused with `account.link_required` until an identity-linking policy is approved (B-07) |
| Conflicts | A pending identifier that matches an identity that already has a Candidate account → refuse binding, audit, and notify administrators (B-07). Never auto-convert |
| Self-registration | Public sign-in only ever provisions `CANDIDATE` (AP-03, unchanged). Staff and Administrator roles are assignable only through the admin API |
| Bootstrap of the first Administrator | A controlled, reviewed, idempotent SQL script run by the DBA as part of the deployment runbook. It creates a `PENDING` StaffUser with an `ADMINISTRATOR` assignment and writes an audit row. It **refuses, changing nothing, if any staff account (pending, bound or deactivated) already holds an `ADMINISTRATOR` assignment, or if the login identifier already exists on any staff account**. Re-running it is a no-op, so it can never create a second protected administrator, including a duplicate pending one. The DB backs this with a unique `LoginIdentifier` across all staff accounts and the unique `(IdamIssuer, IdamUserId)`. Binding happens at first sign-in under the B-06 rule. In Development, the dev bootstrap (step 4) seeds one bound administrator |

## 7. Administration and protection rules

Administration permissions are flagged `IsAdministrative`. They come in two tiers, recorded in the catalog as `IsProtected`.

| Tier | Codes (proposed) | Who may hold it |
|---|---|---|
| **Protected system administration** | `roles.manage` (create, rename, activate, deactivate roles); `role-permissions.manage` (grant and revoke) | The `ADMINISTRATOR` system role only. Never delegable. Cannot be revoked from `ADMINISTRATOR` |
| **Delegable administration** | `roles.read`; `staff.read`; `staff.manage` (provision, activate, deactivate Staff); `staff-roles.manage` (assign and remove roles); `audit.security.read` | `ADMINISTRATOR`, plus any configurable Staff role to which an Administrator grants it (**controlled delegation**) |

**Escalation prevention** (service rules, unit-tested):
1. **Protected capabilities stay protected.**
   - Protected permissions are granted only to `ADMINISTRATOR`.
   - Only an actor whose active role is `ADMINISTRATOR` may grant or revoke permissions.
   - Only such an actor may assign or remove the `ADMINISTRATOR` role.
   - Only such an actor may modify an account that holds `ADMINISTRATOR` or any role that has a protected permission.
2. **Ceiling for delegated administrators.** An actor using delegated `staff-roles.manage` may assign a role only if **every** permission of that role is also held by the actor's current active role. They can never assign `ADMINISTRATOR`, a role with a protected or administrative permission they do not hold, or anything above their own level. An `ADMINISTRATOR` is subject to rule 1 only.
3. **No self-elevation.** No actor (including an `ADMINISTRATOR`) may change their own role assignments, their own account status, or the permission grants of a role they currently hold.
4. Audience separation:
   - `CANDIDATE`-audience permissions go to the `CANDIDATE` role only.
   - Staff permissions never go to `CANDIDATE`.
   - The `CANDIDATE` role is never assigned through staff assignment.
5. The admin API accepts only existing, non-retired catalog codes. Role ids and user ids are resolved on the server.
6. Every change re-checks the actor's active-role permissions on the server.

**Last-administrator protection.** An "authorized administrator" is an active, bound StaffUser with a valid assignment to the active `ADMINISTRATOR` role. Removing that assignment, ending it, or deactivating that user is refused with 409 `admin.last_administrator` when it would leave none. The check runs in the same transaction as the change, under `UPDLOCK, HOLDLOCK` on the administrator assignments, as BL-06 requires for multi-row invariants. SQL Server verification: release checklist V-12.

**Audit.** Each of these events records actor, active role, target, before and after, outcome and trace id:
- staff provisioned, bound, activated or deactivated;
- role created, renamed, activated or deactivated;
- permission granted or revoked;
- role assigned or removed;
- active role switched;
- binding refused;
- last-administrator refusal;
- bootstrap, including a refused duplicate (pending or bound) administrator.

## 8. Performance

- Effective permissions are loaded once per request, in the existing `CurrentUserLoader` pass: the staff user, valid assignments joined to active roles, and the active role's permission codes. That is at most three indexed queries per request, and there is no per-check database call.
- **No cache** in the first implementation, so revocation always takes effect on the next request.
- If load testing shows a need (DF-11), add an in-process role→permissions cache that is invalidated by a single-row `idn.AuthorizationVersion` stamp, read each request and incremented by every role or permission change. Revocation still takes effect on the next request, with no distributed cache.
- Authorization never reads IDAM role claims or token permission claims (AP-05). It denies by default when permissions, roles or account state are missing or invalid.

## 9. Angular changes (all are UI aids; the API decides)

1. `AuthSession` model: `roles[] {id, code, name}`, `activeRole | null`, `permissions[]`. `SessionService` exposes `can(code)`, `activeRole` and `roleEpoch` signals, plus `refresh()` (`GET /auth/me`) and `switchRole(roleId)` (`PUT /auth/active-role`, then `GET /auth/me`).
2. A role switcher in the `dahc-ui` app header, shown only with more than one assigned active role. It uses friendly names, is keyboard and screen-reader accessible, and supports RTL and LTR and responsive layout.
3. When the role is switched:
   - increment `roleEpoch` and reset role-dependent service caches;
   - drop late responses tagged with an older epoch (an `HttpContext` token checked in the existing response interceptor);
   - navigate to the new role's landing page (the first navigation entry its permissions allow), which destroys feature components and their subscriptions;
   - rebuild menus, route visibility and actions from `permissions`.
4. Guards: replace `candidateGuard`'s `userType` check with a permission check from route data (`data.permission`).
   - A missing permission leads to the not-allowed page.
   - `activeRole === null` leads to the role-selection page.
   - A 403 `access.active_role_required` from any call triggers a refresh and role selection.
5. After a page refresh, the active role is restored from `GET /auth/me` and never from browser storage (existing rule).
6. The Administration UI (roles, permission grants, staff, assignments, audit view) is slice S-ADM, built from `dahc-ui` components only.

## 10. Testing (AP-09)

**xUnit + InMemory** (service and API):
- role create, rename, activate and deactivate;
- grant and revoke;
- multiple assignments;
- switching, and effective permissions after switching;
- active-role resolution: initial sign-in with one valid role → auto-selected, with several → `ActiveRoleRequired`; a revoked or inactive active role → selection cleared and `ActiveRoleRequired`, with no automatic switch even when one role remains;
- selecting a role that isn't assigned → 403;
- permission-denied → 403, with ownership still → 404;
- pending binding: a verified identifier binds, an unverified one is refused, and an existing Candidate is refused;
- the escalation rules: protected permissions only on `ADMINISTRATOR`; the delegated ceiling; no self-elevation; delegated actors cannot assign `ADMINISTRATOR`;
- the last-administrator rule (service logic);
- audit events;
- the endpoint-declaration test.

**Playwright:**
- the switcher is shown with several roles and hidden with one;
- menus and routes update after a switch;
- stale data is cleared after a switch;
- the active role is restored after a refresh;
- RTL and LTR, and axe.

**SQL Server release checklist** (not claimed by InMemory):
- V-12: last-administrator protection under concurrent changes;
- V-13: role and permission unique indexes and FKs;
- V-14: concurrent first sign-in binding of a pending staff user (exactly one binding).
