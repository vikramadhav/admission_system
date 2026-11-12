---
paths:
  - "src/backend/**"
  - "src/frontend/**"
---

# Authorization: permission-based RBAC and active role (AP-10, AP-11; approved, do not reopen)

The full design, including the endpoint inventory, catalog, provisioning and Angular sections, is in `docs/audits/05-rbac-design.md`; the rules are in `docs/dotnet-engineering-standards.md` §19.
- **Approved for implementation:** step 15 (RBAC foundation) and step 11 (Angular role switching), once their dependencies and Phase 0 are met.
- **Not approved:** step 16 and slice S-ADM (Administration). They are a separate slice, so do not build administration endpoints or screens inside the foundation.

## Backend

- **Never check role names** to authorize. Declare permissions:
  - `[RequirePermission(Permissions.X)]` on the controller or action;
  - `[AuthenticatedOnly("reason")]` only for documented exceptions (sign-in, `me`, `active-role`);
  - `[AllowAnonymous]` only on the reviewed list (health, Development sign-in).

  Every endpoint has exactly one of these, and the endpoint-declaration test enforces it.
- **Permission codes** are stable business operations in `DAHC.Service/Access/Permissions.cs`, for example `applications.own.read`. They are never URLs or controller or action names, and several actions may share one.
  - To add a permission: add the code to the catalog, plus the migration from the migrations owner. It is denied until an administrator grants it.
  - Never delete a permission; retire it.
- **Active-role selection (DEC-19):**
  - At initial sign-in with exactly one valid role, select it automatically; with several, require the user to select.
  - When the active role is revoked or deactivated, **clear** the selection and require a new one. Never switch automatically, even when only one role remains.
  - `Role.SortOrder` orders lists; it never picks a role.
- **Only the active role's permissions apply.** Never merge permissions from several roles. Load them once per request in the existing `CurrentUserLoader` pass. No per-check queries, no caching that delays revocation, and no IDAM role or token permission claims.
- **Permissions never replace resource checks.** Ownership, pool or assignment scope, workflow status and business rules are checked in the service on every read and write. Another user's record → 404.
- **Responses:**
  - missing permission → 403 `access.permission_denied`;
  - no valid active role → 403 `access.active_role_required`;
  - unassignable role → 403 `access.role_not_assignable`;
  - last administrator → 409 `admin.last_administrator`.
- **Administration:**
  - **Protected** system-administration permissions (`roles.manage`, `role-permissions.manage`) belong to `ADMINISTRATOR` only and are never delegated.
  - **Delegable** administrative permissions may be granted to configurable Staff roles, but only by an active `ADMINISTRATOR`.
  - Only an active `ADMINISTRATOR` grants or revokes permissions, assigns `ADMINISTRATOR`, or modifies an account with protected capabilities.
  - A delegated actor may assign only roles whose permissions are a subset of their own active role's.
  - No actor changes their own assignments, status, or the grants of a role they hold (no self-elevation).
  - Candidate-audience and Staff-audience permissions never cross.
  - Protect the last administrator.
  - The bootstrap never creates a second protected administrator, pending or bound.
  - Audit every role, permission, assignment, provisioning and activation change.
- **Staff provisioning:**
  - Staff are never created by sign-in.
  - Pending accounts bind to issuer + subject only through the verified IDAM attribute decided in B-06. **B-06 is open: do not assume or implement a binding attribute.**
  - Never merge a Candidate and a Staff account automatically. **B-07 is open**: until it is answered, that case fails closed. Neither B-06 nor B-07 blocks other work.
- Do not add an authorization framework, policy-provider library, rules engine, distributed cache or new package.

## Angular

- Use `SessionService.can(code)` and route `data.permission` for menus, routes and buttons. These are UI aids only; never decide whether a business operation is allowed.
- The role switcher appears only with more than one role and shows friendly names. On switch:
  1. Call `PUT /api/v1/auth/active-role` with the role id, then `GET /api/v1/auth/me`.
  2. Bump `roleEpoch` and reset role-dependent caches.
  3. Drop stale responses.
  4. Navigate to the landing page.
- Restore the active role from `GET /api/v1/auth/me` after a refresh; never store it in the browser.
- `activeRole: null` → role-selection page.

## Tests (AP-09)

- **xUnit + InMemory:** grant and revoke; switching and effective permissions; revoked, inactive or unassigned roles; permission-denied versus ownership 404; escalation and last-administrator rules; binding; audit rows; the endpoint-declaration test.
- **Playwright:** switcher visibility, menu and route updates, no stale data after a switch, restore after refresh, RTL/LTR, axe.
- **Release checklist** (never claimed by InMemory): concurrency and constraint behaviour (V-12 to V-14).
