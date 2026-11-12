> Appendix A of the 2026-11-12 foundation audit (see README.md). Read-only review of `src/frontend` against `docs/angular-structure-and-guidelines.md`. Key findings FE-01, FE-03, FE-04 and FE-05 were re-verified against the code by the lead auditor.

# DAHC Frontend Audit (read-only)

Scope: `C:\Dev\Admissions\src\frontend` (excluding node_modules, which does not exist). Standard: `docs/angular-structure-and-guidelines.md` (161 lines, read fully). Every source file under the scope was read (portal, dahc-ui, playground, Playwright, root config). Nothing in the repo was modified; no install or build was run.

Paths below are relative to `src/frontend/` unless otherwise stated. "G§n" = guideline section n.

## 0. Headline

The TypeScript/SCSS code quality is high and largely compliant: standalone + OnPush + signals everywhere, typed reactive forms, ControlValueAccessor with aria-describedby, zero `any`, zero non-null assertions, zero raw colours, zero physical (left/right) properties, @angular/localize used correctly, tokens kept in memory, bearer token restricted to the API base URL, approved OIDC library used with no hand-written protocol code.

The workspace is **not buildable**: `angular.json` and `package-lock.json` are missing, so nothing (serve, build, lint, i18n, fileReplacements, global styles, playground source assets, Playwright webServer) is wired. Functional gaps: no development SFA UI, no role switcher / active-role client, a confirmed contract mismatch on `GET /programs` (missing required `cycleId`), client-side business rules in the draft form, and Playwright portal tests run fully against mocks with no visual regression.

Recommendation: **keep and complete**. Nothing qualifies as REBUILD CANDIDATE.

## 1. Build and package status

| Item | Finding |
|---|---|
| `angular.json` | **Missing** (`ls angular.json`: no such file). `ng serve/build/lint/extract-i18n` cannot run. |
| `package-lock.json` | **Missing**; README line 11 says `npm ci`, which needs a lockfile. |
| node_modules | Not present (not installed; not installed by this audit). |
| Angular | `@angular/*` 22.2.5 pinned exactly; `@angular/build`/`cli` 22.2.6 (same major). One major. COMPLIANT. |
| `@angular/localize` | 22.2.5. Approved. |
| OIDC library | `angular-auth-oidc-client` 22.0.2: one library, OpenID-certified. COMPLIANT (the guideline says "to be named", so record it in the decisions table). |
| Playwright / axe | `@playwright/test` 1.65.0, `@axe-core/playwright` 4.14.0. Approved. |
| Angular CDK | Not present. COMPLIANT. |
| Other | `rxjs`, `tslib` (Angular framework deps, acceptable); devDeps `eslint`, `typescript-eslint`, `angular-eslint`, `ng-packagr`, `typescript`. eslint/typescript-eslint/angular-eslint are not strictly "Angular's own tooling", so they need an explicit approval entry (FE-19). |
| `.npmrc` | `save-exact=true`, `audit-level=moderate`. Good. |
| tsconfig | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `strictTemplates`, extendedDiagnostics as errors (tsconfig.json:4-29). COMPLIANT. |

## 2. Findings

### FE-01 — Workspace config missing; cannot build
- **Severity:** Critical. **Classification:** INCOMPLETE
- **Evidence:**
  - No `angular.json`.
  - `package.json:8-16` scripts call `ng serve dahc-portal`, `ng build dahc-ui`, `ng lint`, `ng extract-i18n`.
  - `environments/environment.ts:3-5`: "Each environment replaces this file through its own build configuration (fileReplacements)".
  - `dahc-playground/.../source-viewer.component.ts:13-14`: "The build copies projects/dahc-ui/src/lib into the playground output as assets (angular.json)".
  - No SCSS file `@use`s `dahc-ui.scss`, so the global tokens and theme must come from an angular.json `styles` entry that does not exist.
  - `tests/playwright/playwright.config.ts:31-45` webServer runs `npx ng serve`.
  - No `package-lock.json`.
- **Guideline:** G§1 (workspace), G§7 locale ("one build per locale"), G§5 (source served at build time).
- **Risk:** Nothing compiles, runs or tests. The i18n locales, `fileReplacements` (dev vs deployed config), `ngCspNonce` build behaviour, the playground source assets and the global token CSS are all unverified. Today `app.config.ts:10` imports `environment.ts` (`.invalid` hosts, `production: true`), which fails closed (good) but makes local development impossible.
- **Remediation (non-destructive, additive):**
  - Add `angular.json` with three projects:
    - `dahc-ui`: `@angular/build:ng-packagr`, `tsconfig.lib.prod.json`.
    - `dahc-playground`: `@angular/build:application`, port 4300, styles `projects/dahc-ui/src/styles/dahc-ui.scss` + local styles, assets glob `{input: projects/dahc-ui/src/lib, output: source/lib, glob: **/*.{ts,html,scss}}`.
    - `dahc-portal`: `i18n.sourceLocale` `en-AE` (subPath `en`), `locales.ar-AE` → `src/locale/messages.ar-AE.json` (subPath `ar`), `localize: true` for production, `development` and `development-ar` configurations with `fileReplacements` environment.ts → environment.development.ts, and a `lint` target (`@angular-eslint/builder:lint`).
  - Generate and commit `package-lock.json`.
- **Dependencies:** Blocks FE-02, FE-10, FE-13, FE-17 and all verification.
- **Verification:** `npm ci && npm run build && npm run lint && npm run e2e` succeed. Then check that `dist/dahc-portal/browser/en` and `/ar` exist, `dist/dahc-playground/browser/source/lib/button/button.component.ts` exists, and the prod bundle contains no `localhost`.

### FE-02 — Development-only SFA sign-in UI absent
- **Severity:** High. **Classification:** INCOMPLETE
- **Evidence:**
  - No dev sign-in code in the portal (grep for `development|username|password` finds only environment comments).
  - README.md:59: "Development-only sign-in | The API's development sign-in is not in the contract yet".
  - The backend now exposes it: `src/backend/src/API/DAHC.API/Authentication/Development/DevelopmentSignIn.cs:19` `Route = "/api/v1/development/sign-in"`, and backend README.md:20 shows body `{ "subject", "password", "displayName", ... }`.
- **Guideline:** G§7 "Local development SFA"; approved decision (local = dev-only username/password through the API).
- **Risk:** Local development and e2e currently need IDAM (or mocks). The approved local flow cannot be exercised. Without a structural design, dev code could later leak into deployed builds.
- **Remediation:**
  - Introduce a `DahcTokenSource` abstraction used by `apiAuthorizationInterceptor` and `AuthService`, with two implementations:
    - `OidcTokenSource` (current).
    - `DevSfaTokenSource`: in-memory token from `POST /api/v1/development/sign-in`; sign-out clears memory and calls a dev logout/revoke if the API offers one; never calls IDAM.
  - Provide them via `auth.providers.ts` vs `auth.providers.development.ts`, swapped with `fileReplacements` only in the `development` configurations. This keeps dev code out of production bundles, unlike a runtime flag.
  - Add a dev-only lazy route `/dev-sign-in` registered only in the dev providers file.
  - No credentials in source.
- **Dependencies:** FE-01. Backend must confirm the dev endpoint's request/response contract and whether a dev logout exists.
- **Verification:** Run a production build, then `grep -r "development/sign-in" dist/dahc-portal` returns nothing. A dev build shows the dev sign-in page, and the e2e signs in as each seeded role.

### FE-03 — Role switcher and active role not implemented; guard keyed on userType
- **Severity:** Medium (High before any staff slice). **Classification:** INCOMPLETE
- **Evidence:**
  - No `PUT /auth/active-role` client in `api/auth-api.service.ts` (only `signIn`, `getCurrentSession`).
  - `dahc-ui/src/lib/app-header/app-header.component.html` has no role switcher.
  - `core/auth/candidate.guard.ts:44` decides with `session.userType === 'CANDIDATE'` rather than `activeRole`/`roles`.
  - README.md:56 defers it.
  - Backend has it: `AuthController.cs:99-102` `[HttpPut("active-role")]` with `SwitchActiveRoleRequest.RoleCode`, policy `Staff`.
- **Guideline:** G§7 Role switcher; approved decision (active role from API, never stored).
- **Risk:** Multi-role staff cannot switch roles; every staff user lands on not-allowed. The guard semantics will need rework.
- **Remediation:**
  - Add `switchActiveRole(roleCode)` → `PUT {api}/auth/active-role` body `{ roleCode }`. Update `SessionService.currentSession` from the response, then navigate to the role home.
  - Add an optional `roles`/`activeRole` input and `activeRoleChange` output to `dahc-app-header`, rendered only when `roles.length > 1`.
  - Replace `candidateGuard` with a generic `activeRoleGuard(role)` reading `session.activeRole`.
  - Never persist the role (it already is not persisted).
- **Dependencies:** FE-01. Confirm the backend's role-code strings.
- **Verification:** e2e with a two-role dev user: the switcher is visible, the PUT is sent, the menu changes, and after reload `GET /auth/me` restores the role. A candidate never sees the switcher. sessionStorage/localStorage hold no role.

### FE-04 — Contract mismatch: `GET /programs` omits the required `cycleId`
- **Severity:** High. **Classification:** CONFLICT
- **Evidence:**
  - `api/catalog-api.service.ts:18-25`: "The contract requires cycleId but offers no operation that returns the open cycle, so the portal omits it". It sends only `limit`.
  - Backend `CatalogController.cs:33-35`: `[HttpGet("programs")] ... [FromQuery, Required] Guid? cycleId`.
  - The mock hides this: `tests/playwright/support/api-mock.ts:107` matches `GET /programs` and ignores the query.
- **Guideline:** G§7 (API is the source of truth); G§8 (e2e against the real dev API).
- **Risk:** Against the real API the New application screen gets 400 and is unusable.
- **Remediation:** Contract decision (do not guess in the client). Either:
  - the API exposes the open cycle (e.g. `GET /cycles/current`, or cycle info on the dashboard), or
  - `cycleId` becomes optional and means "open cycle".
  Then update the client and make the mock enforce required query parameters.
- **Dependencies:** Backend/contract owner (OQ-08 area).
- **Verification:** e2e against the dev API creates a draft. The mock returns 400 when `cycleId` is missing.

### FE-05 — Client-side business rules in the draft form
- **Severity:** Medium. **Classification:** CONFLICT
- **Evidence:**
  - `features/application-draft/application-draft.component.ts:44-49`: `const TWO_PREFERENCE_CATEGORIES = ['RESIDENCY', 'FELLOWSHIP']` decides whether preference 2 exists (lines 169-173). The comment admits "the contract does not yet return the allowed count per program".
  - Lines 175-179: `isEditable` = `status === 'DRAFT'`, rather than the API's allowed actions.
  - Line 268: `if (!program.cycleId)` blocks submission.
  - `preference-form.ts:16-32`: `sitesRequiredForSpecialty`, `distinctPreferences` (UX validation duplicating server rules).
- **Guideline:** G§2 "Business rules or authorization decisions in the client" prohibited; G intro "all business rules ... stay on the server".
- **Risk:** Rule drift between client and API (e.g. a new category that allows two preferences). Other channels would have to re-implement the rule.
- **Remediation:**
  - Extend the contract: `Program.maxPreferences` (or `allowsSecondPreference`) and `Application.allowedActions` (as already done for dashboard items).
  - Render from those fields.
  - Keep `distinctPreferences`/`sitesRequired` only as advisory UX validation, with the API's 422 `errors[]` mapped onto fields by `pointer`.
- **Dependencies:** Backend contract change.
- **Verification:** Unit/e2e: a program with `maxPreferences: 2` from the mock shows preference 2 regardless of category. A server 422 with pointer `/preferences/1/specialtyId` highlights the field.

### FE-06 — 401 handling can loop and fires multiple sign-ins
- **Severity:** Medium. **Classification:** MINOR REFACTOR
- **Evidence:** `core/api/api-response.interceptor.ts:55-56`: `if (problem.status === 401) { auth.signIn(router.url); }`. This applies to every request, including `/auth/sign-in` and `/auth/me` and requests flagged `DAHC_CALLER_HANDLES_PROBLEMS`. `auth.service.ts:50-60` calls `oidc.authorize()` each time.
- **Guideline:** G§7 Error handling (401 → new sign-in).
- **Risk:** If the API keeps rejecting valid IDAM tokens (audience/issuer misconfiguration), there is an endless silent IDAM ↔ portal redirect loop. Concurrent 401s each call `authorize()`.
- **Remediation:**
  - Make `signIn` idempotent within the page (an in-flight flag).
  - Add a one-shot "re-auth attempted" marker in `AuthRedirectStorage`, a flag only (not personal data). On a second 401 directly after a fresh sign-in, show the sign-in failure page instead.
- **Dependencies:** None.
- **Verification:** Playwright: the API mock always returns 401. Expect exactly one IDAM authorize request and a "We could not sign you in" page.

### FE-07 — `403 account.not_registered` path does not refresh the session
- **Severity:** Low. **Classification:** MINOR REFACTOR
- **Evidence:** `api-response.interceptor.ts:45-47` calls `authApi.signIn()` directly and retries. `SessionService.currentSession` (`session.service.ts:23`) is not updated, and concurrent 403s each call sign-in.
- **Guideline:** G§7 Error handling.
- **Risk:** The shell can show stale profile/role data. The extra sign-in calls are harmless only because the backend sign-in is idempotent.
- **Remediation:** Route the call through `SessionService.reestablish()`, which shares one in-flight promise and updates the signal.
- **Verification:** e2e: `/me/dashboard` returns `403 account.not_registered` once. Expect one `POST /auth/sign-in`, a successful retry, and the header name updated.

### FE-08 — AuthRedirectStorage (sessionStorage) — careful review
- **Severity:** Low. **Classification:** COMPLIANT with notes (MINOR REFACTOR)
- **Evidence:** `core/auth/auth-redirect-storage.ts`:
  - Lines 9-15: only `codeVerifier`, `authStateControl`, `authNonce`, `storageCodeFlowInProgress`, `storageCustomParamsAuthRequest` are copied to sessionStorage (lines 94-113), and the record is deleted as soon as `authzData` exists (line 106).
  - `authnResult` (ID/access tokens), `authzData`, `userData` and `jwtKeys` stay in the in-memory `Map` (line 32).
  - Extra keys: `dahc.auth.returnPath` (route, lines 65-67, validated same-app on read, lines 74-76), `dahc.auth.sessionStarted` (`'true'` flag).
  - ESLint exempts only this file and ThemeService from the storage ban (eslint.config.mjs:54-62).
  - The e2e asserts the access token is not in sessionStorage (candidate-draft.spec.ts:34).
- **Guideline:** G§2, G§7 Tokens.
- **Assessment:** No token or personal data is persisted.
- **Residual risks:**
  1. The PKCE verifier, state and nonce sit in sessionStorage during the redirect window. This is the standard pattern for a static SPA, and an XSS in that window could pair the verifier with a stolen code. Record it as an accepted design decision.
  2. Correctness depends on the library's internal storage key names, so a library upgrade can silently change behaviour.
  3. The return path may include query strings. Today's routes carry only an application GUID, not personal data.
  4. `clear()` (line 60-63) removes only keys present in memory, so a stale redirect record can survive a reload. It is low impact because the library removes it on completion.
- **Remediation:** Add an e2e assertion that neither the access token nor the id_token (nor any `authnResult`) appears in sessionStorage/localStorage after sign-in, after reload and after sign-out. Pin the library version and add an upgrade note. Strip the query from the return path.
- **Verification:** Extend the spec at candidate-draft.spec.ts:34 to cover the id_token and localStorage.

### FE-09 — Sign-out: partial compliance
- **Severity:** Low. **Classification:** MINOR REFACTOR
- **Evidence:** `core/auth/auth.service.ts:75-93`:
  - Revokes the access token via the library (line 79, best effort).
  - `logoffLocal()`.
  - Hand-builds the IDAM single sign-out URL with `id_token_hint`, `post_logout_redirect_uri` and a random `state` (lines 88-92).
  - `state` is not stored or checked on `/signed-out`. `id_token_hint` may be `''` (line 76).
  - There is no local-SFA sign-out branch (FE-02).
- **Guideline:** G§7 Sign-out.
- **Assessment:** Building the URL by hand is justified because IDAM publishes no end_session endpoint (config documents this, portal-config.ts:17-18).
- **Remediation:** Validate `state` on return (in-memory is lost, so store a one-shot value via AuthRedirectStorage or accept the risk and document it). Omit `id_token_hint` when empty. Add the SFA branch with FE-02.
- **Verification:** e2e sign-out asserts revocation, the end-session parameters and the signed-out page (already partly covered, spec lines 174-179).

### FE-10 — CSP / Trusted Types depend on hosting and are unverified
- **Severity:** Medium. **Classification:** INCOMPLETE
- **Evidence:**
  - `dahc-portal/src/index.html:13` `<dahc-root ngCspNonce="DAHC_CSP_NONCE">` (COMPLIANT for `CSP_NONCE`).
  - The policy exists only as README text (README.md:46, including `require-trusted-types-for 'script'; trusted-types angular angular#bundler`).
  - No server/hosting config or test enforces it.
  - `<meta name="referrer" content="no-referrer">` (index.html:8) is good.
  - The playground has no nonce (internal tool; acceptable).
- **Guideline:** G§7 Content Security Policy.
- **Risk:** If hosting omits the header, in-memory tokens are exposed to any XSS.
- **Remediation:** Add the hosting config (e.g. a static-server/nginx template) that injects the nonce and header. Add a Playwright check that the response carries a CSP with `require-trusted-types-for` and that the app runs with no CSP violations (listen for `securitypolicyviolation`).
- **Dependencies:** FE-01, the hosting decision.
- **Verification:** The Playwright CSP test passes against a production build served by the reference host.

### FE-11 — Shared a11y primitives and first-slice components missing
- **Severity:** Medium. **Classification:** INCOMPLETE
- **Evidence:**
  - `dahc-ui/src/lib/a11y/` contains only `live-announcer.service.ts` and `unique-id.ts`. There is no focus trap or focus restore.
  - Components (public-api.ts:1-15) are alert, app-header, badge, button, card, detail-list, empty-state, page-header, ranked-selection, select, theme-switch. There is no form field / text input, checkbox or dialog (G§9 first slice).
  - `ranked-selection.component.ts:165-169` hand-rolls focus restoration with `setTimeout` + `querySelector` instead of a shared primitive.
- **Guideline:** G§5 "Shared accessibility primitives (focus trap, focus restore, live announcer, unique id)"; G§9 Section 3 items 3-4.
- **Remediation:** Add `DahcFocusTrap` (directive), `DahcFocusRestore` (service/directive), `dahc-form-field` + `dahc-text-input` (CVA), `dahc-checkbox` (CVA) and `dahc-dialog` (native `<dialog>` + focus trap/restore + Escape), each with a playground page and spec. Refactor ranked-selection to use focus restore.
- **Verification:** Playwright dialog spec: Tab cycles inside, Escape closes, focus returns to the trigger, axe is clean in four modes.

### FE-12 — Layout system, custom theme and playground features incomplete
- **Severity:** Low/Medium. **Classification:** INCOMPLETE
- **Evidence:**
  - `dahc-ui/src/styles/dahc-ui.scss` has light/dark only (lines 6-23), with no sample custom theme. The only utility is `.dahc-visually-hidden` (lines 62-72); there is no grid, spacing or display utility.
  - The playground theme switch is light/dark only (`app.component.html:4`).
  - There is no "copy usage example" button (source-viewer copies files only, `source-viewer.component.html:17`).
  - Hover/focus states are not shown explicitly.
- **Guideline:** G§3 (custom theme), G§4 (grid/utilities), G§6 (theme switcher light/dark/custom; copy usage example).
- **Remediation:** Add the `[data-theme='custom']` sample override, the grid/spacing/display utility SCSS (logical properties), a 3-way theme control in the playground, and a usage-example block generated from the inspector state.
- **Verification:** Playground specs extended to the custom theme with axe.

### FE-13 — Playwright: mocks instead of the dev API, no visual regression, missing negative paths
- **Severity:** Medium. **Classification:** INCOMPLETE
- **Evidence:**
  - `specs/portal/candidate-draft.spec.ts:9-10`: "Until the API's development-only sign-in exists, the portal runs against in-test IDAM and API mocks".
  - `support/api-mock.ts` (in-memory API) and `support/idam-mock.ts` (IDAM fully mocked, RS256 ID token, never calls real IDAM: compliant with "tests never call IDAM").
  - No `toHaveScreenshot` anywhere (README.md:60 defers it).
  - No test for 401/expired token, `403 account.not_registered`, other 403 → not-allowed, or role-based screens.
  - Portal tests run in English LTR only; there is no Arabic/RTL portal test.
- **Compliant parts:**
  - POMs exist (`pages/dashboard.page.ts`, `pages/application-draft.page.ts`).
  - Role/name locators are used throughout; `getByTestId` only for value readouts (select.spec.ts:26, ranked-selection.spec.ts:24).
  - axe WCAG 2.2 AA in all 11 playground specs and in the portal spec (light and dark).
  - The 4 theme×direction modes in playground specs (`support/playground.ts:12-17`).
  - 320 px reflow checks.
  - One spec per component.
- **Guideline:** G§8.
- **Remediation:**
  - Keep the IDAM mock for the OIDC-flow test. Add a `portal-dev-api` Playwright project that signs in through dev SFA (FE-02) against the real dev API, one user per role.
  - Add 401, 403 and not_registered specs, plus an Arabic-build smoke test.
  - Add visual regression in a pinned container image.
  - Make the API mock enforce contract-required parameters (see FE-04).
- **Dependencies:** FE-01, FE-02, FE-04.
- **Verification:** CI runs the three Playwright projects green. Snapshots are committed per component/state/theme/direction.

### FE-14 — `response_mode=query` not set explicitly
- **Severity:** Low. **Classification:** MINOR REFACTOR
- **Evidence:** `core/auth/auth.providers.ts:35-53`: the config has no `customParamsAuthRequest`, so the library sends no `response_mode` and relies on IDAM's default.
- **Guideline:** G§7 Sign-in (`response_mode=query`).
- **Remediation:** `customParamsAuthRequest: { response_mode: 'query' }`.
- **Verification:** The IDAM mock asserts `response_mode=query` on `/authorize`.

### FE-15 — Problem Details parsing: non-DAHC problems lose code and traceId
- **Severity:** Low. **Classification:** MINOR REFACTOR
- **Evidence:** `api-response.interceptor.ts:113-120` accepts a body only if it has a string `code` and a numeric `status`. Otherwise it becomes `server.unexpected_response` with `traceId: null` (lines 110, 123-129).
- **Backend spot-check:** `ProblemFactory.cs:49-50` adds `code` and `traceId` extensions, which match. Framework-generated 401/403 with empty bodies, or ASP.NET automatic 400 validation problems, may not include `code` (*not verified*, speculative).
- **Remediation:** Fall back to the `traceId` from a problem body without `code`, and to a response header (e.g. `traceparent`/`x-request-id`) when the body is empty.
- **Verification:** Call the dev API with no token and with a malformed body; confirm a trace id is shown.

### FE-16 — ApiResult typing relies on interceptor transformation
- **Severity:** Low. **Classification:** MINOR REFACTOR
- **Evidence:** `api/*-api.service.ts` declare `http.get<ApiResult<T>>`. `toTypedEvent` (`api-response.interceptor.ts:72-91`) passes non-envelope bodies (e.g. 204) through unchanged, while the static type still claims `ApiResult<T>`.
- **Remediation:** Return `Observable<ApiResult<T>>` through a small `DahcApiClient` wrapper that validates the shape, or type 204 operations as `void`.
- **Verification:** Unit test with a 204 response.

### FE-17 — i18n approach
- **Severity:** Low. **Classification:** COMPLIANT (wiring blocked by FE-01)
- **Evidence:**
  - All UI text uses `$localize` / `i18n` attributes with custom ids. ESLint `@angular-eslint/template/i18n` is enforced for portal templates (eslint.config.mjs:79-87).
  - `src/locale/messages.json` and `messages.ar-AE.json` are Angular localize **JSON translation files** (`{"locale", "translations"}`) consumed at build time, not runtime JSON, so there is **no conflict**.
  - Both files have 117 ids. All 102 portal ids and 15 `dahcUi.*` ids are present in both, with no extras. (Checked with a node script, read-only.)
  - `LocaleService.applyDocumentLanguage` sets `lang`/`dir` (locale.service.ts:26-30).
  - No ngx-translate or runtime JSON loader.
- **Note:** The `extract-i18n` script (package.json:14) writes `messages.json`. It needs the angular.json `i18n` block to run.

### FE-18 — Library component independence (copy-paste rule)
- **Severity:** Low. **Classification:** MINOR REFACTOR
- **Evidence:**
  - `ranked-selection.component.ts:15` imports `../select/select-option`.
  - `app-header.component.ts:3-4` imports button and theme-switch.
  - The playground ranked-selection page's `sourceFiles` (ranked-selection-page.component.ts:23-29) omits `select/select-option.ts`, so the copied folder will not compile.
  - Portal SCSS reaches into library internals by relative path (`application-draft.component.scss:1` `@use '../../../../../dahc-ui/src/styles/breakpoints'`).
- **Guideline:** G§5 Copy-and-paste source.
- **Remediation:** Move `DahcSelectOption` to a shared `lib/core/option.ts` (or duplicate it in ranked-selection). List every dependency file on playground pages. Expose breakpoints via an `includePaths`/`stylePreprocessorOptions` entry.

### FE-19 — Dev tooling packages not in the approved list
- **Severity:** Low. **Classification:** CONFLICT (process)
- **Evidence:** `package.json:37-41`: `angular-eslint`, `eslint`, `typescript-eslint`.
- **Guideline:** G§10 "Every package used must be listed in the decisions table".
- **Remediation:** Add them to the decisions table, or replace them. Also record `angular-auth-oidc-client` as the named OIDC library.

### FE-20 — Minor raw value
- **Severity:** Low. **Classification:** MINOR REFACTOR
- **Evidence:** `dahc-ui/src/lib/alert/alert.component.scss:48,107` `line-height: 1;`
- **Remediation:** Add a `line-height-none` token.

## 3. What is solid and reusable (COMPLIANT)

| Area | Evidence |
|---|---|
| Standalone / OnPush / signals | Every component declares `ChangeDetectionStrategy.OnPush`. There are no NgModules. Inputs use `input()`/`input.required()`, outputs `output()`, state `signal`/`computed`, data `rxResource`. Lint enforces this (eslint.config.mjs:40-42). |
| No `any` / no `!` | Grep found 0 occurrences in all `.ts`. Lint rules at eslint.config.mjs:45-46. Casts are limited to `event.target as HTMLInputElement` and validator group casts. |
| Typed reactive forms | `preference-form.ts:5-14` (`FormGroup<{specialtyId: FormControl<string>; siteIds: FormControl<string[]>}>`), `NonNullableFormBuilder` (application-draft.component.ts:79-96). |
| CVA + aria-describedby | `select.component.ts:16-22,40-52,58-72`; `ranked-selection.component.ts:29-35,54-66,81-95`; native `<select>`, `<fieldset>/<legend>`. |
| Tokens via CSS custom properties | `_tokens.scss` maps → `_theme.scss` mixins → `--dahc-*`. Components use `var(--dahc-*)` only. Grep found **0 raw colours** outside `_tokens.scss` and no raw px/rem in component SCSS. Dark theme, `prefers-color-scheme`, `prefers-reduced-motion` (dahc-ui.scss:11-30). |
| RTL logical properties | Grep for `left/right/top/bottom:`, `margin-left` etc. and `text-align: left|right` found **0 hits**. Only `inline`/`block` properties are used. `text-align: end` (dashboard.component.scss:16). |
| ThemeService | `theme.service.ts`: `data-theme` on root, follows OS until chosen, localStorage for the theme only, guarded with try/catch. |
| Live announcer / unique id | `live-announcer.service.ts`, `unique-id.ts`, reused by select, ranked-selection, card and the playground inspector. |
| OIDC via library, no protocol code | `auth.providers.ts` (code flow, PKCE by library, metadata address, `silentRenew:false`, `useRefreshToken:false`, `autoUserInfo:false`); `auth.service.ts` uses `checkAuth`, `authorize`, `revokeAccessToken`, `logoffLocal`. No token decoding anywhere. The library validates state, nonce and ID token (the IDAM mock signs RS256 with JWKS). |
| Tokens in memory | FE-08 analysis; `AuthRedirectStorage` memory `Map`. |
| Bearer token host restriction | `api-request.ts:10-14` (`url === base \|\| startsWith(base + '/') \|\| startsWith(base + '?')`) used by `api-authorization.interceptor.ts:17-19` and the response interceptor. Other origins are untouched. The e2e asserts the header on the API (spec:33). |
| ApiResponse/ProblemDetails interceptor | `api-response.interceptor.ts`: envelope → `ApiResult` with ETag. Problem → `ApiProblemError`. 403 `account.not_registered` → sign-in + retry. Other 403 → `/not-allowed`. 409 `account.duplicate` → `/duplicate-account`. Others → localized message + trace id (app.component.html:12-28). |
| Session from API, never from token | `session.service.ts` (POST sign-in first, GET me after reload; held in a signal). The portal never sends identity data. |
| Dashboard driven by API | `dashboard.component.ts:67-87,139`: start-new state, reason and `allowedActions.includes('RESUME')` come from the API. |
| Concurrency / idempotency | `Idempotency-Key` per attempt, reset on form change (application-draft.component.ts:208-210,274). `If-Match` + `application/merge-patch+json` (applications-api.service.ts:36-43). 412 → reload offer. |
| Zoned date pipe | `core/locale/date-time.pipe.ts`: `Intl.DateTimeFormat(locale, {timeZone})`, cached formatters, no `DatePipe` anywhere. |
| Config | `environment.ts` uses `.invalid` hosts (fail closed). Client id, redirect, post-logout, SSO URL and scopes are all configured (portal-config.ts). |
| Security hygiene | ESLint bans innerHTML/outerHTML/insertAdjacentHTML/bypassSecurityTrust* and storage outside the two allowed files (eslint.config.mjs:5-24,70-76). Grep confirms none are used. |
| Playground | Real source files fetched from `source/lib/...` (source-viewer.component.ts:29-33), never hand-written. Inspector for inputs and outputs, states, a11y notes, theme and direction switch, one page and one spec per component. |
| Playwright structure | POMs, role-first locators, axe WCAG 2.2 AA, four display modes, 320 px reflow, IDAM never called. |

## 4. API contract expected by the frontend

All URLs are relative to `apiBaseUrl`, which **includes** `/api/v1` (portal-config.ts:24-25; dev `https://localhost:5001/api/v1`). Headers on every API request are `Accept-Language: en-AE|ar-AE` and `Authorization: Bearer <access token>`, the latter only when a token exists (api-authorization.interceptor.ts:27-31).

| Operation | Method / path | Request | Response `data` | Source |
|---|---|---|---|---|
| signIn | `POST /auth/sign-in` | body `null` | `AuthSession` | api/auth-api.service.ts:16-18 |
| getCurrentSession | `GET /auth/me` | — | `AuthSession` | auth-api.service.ts:21-23 |
| (missing) | `PUT /auth/active-role` | — | — | not implemented (FE-03); backend expects `{ roleCode }` |
| getCandidateDashboard | `GET /me/dashboard` | — | `CandidateDashboard` | dashboard-api.service.ts:16-18 |
| listPrograms | `GET /programs?limit=100` | **no cycleId** (FE-04) | `Program[]` | catalog-api.service.ts:22-26 |
| listProgramSpecialties | `GET /programs/{programId}/specialties?limit=100` | — | `Specialty[]` | catalog-api.service.ts:29-34 |
| listSpecialtyTrainingSites | `GET /specialties/{specialtyId}/sites?limit=100` | — | `TrainingSite[]` | catalog-api.service.ts:37-42 |
| createDraft | `POST /applications?cycleId={cycleId}` | header `Idempotency-Key: <uuid v4>`; body `CreateApplicationRequest` | `Application` (expects 201 + `ETag`) | applications-api.service.ts:19-28 |
| getApplication | `GET /applications/{id}` | — | `Application` + `ETag` header | applications-api.service.ts:31-33 |
| updateDraft | `PATCH /applications/{id}` | `Content-Type: application/merge-patch+json`, `If-Match: <etag>`; body `UpdateDraftRequest` | `Application` + new `ETag` | applications-api.service.ts:36-43 |

Notes on the table:
- The backend sign-in is `POST /api/v1/auth/sign-in`. The guideline text says `/api/auth/sign-in`, so the version segment is the only difference.
- The frontend sends `Idempotency-Key` as a 36-character `crypto.randomUUID()`. Backend validation is `StringLength(128, MinimumLength=16)` (ApplicationsController.cs:66), which is OK.

**Envelope** (`core/api/api.models.ts`):
- `ApiResponseBody<T> { data: T; messageCode?: string|null; message?: string|null; pagination?: { limit: number; nextCursor: string|null } }`. This matches backend `ApiResponse.cs`.
- An envelope is detected by the presence of `data`.

**Problem** (`api.models.ts:38-47`):
- `{ type: string; title: string; status: number; code: string; traceId: string|null; detail?: string; instance?: string; errors?: { code: string; detail: string; pointer?: string }[] }`.
- Content type is not checked.
- Backend ProblemFactory emits `code`, `traceId` and `errors[{code, detail, pointer}]` as extensions; the casing is assumed to be camelCase JSON.

**Models:**
- `AuthSession { userType: 'CANDIDATE'|'STAFF'; userId: string; candidateNumber?: string|null; displayName: string; email?: string|null; roles: string[]; activeRole: string; preferences: { timeZoneId: string; culture: 'en-AE'|'ar-AE' } }`.
  - Backend `AuthSession.cs` has the same fields.
  - *To verify*: the `UserType` enum serializes as `"CANDIDATE"`/`"STAFF"` (upper-case strings).
- `Program { id; code; name; category: 'CERTIFICATE'|'INTERNSHIP'|'RESIDENCY'|'FELLOWSHIP'; cycleId?; applicationOpensAt?; applicationClosesAt?; timeZoneId? }`.
- `Specialty { id; code; name }`; `TrainingSite { id; code; name }`.
- `Preference { specialtyId; preferenceOrder: number; trainingSites: { siteId; siteOrder: number }[] }`.
- `CreateApplicationRequest { programId; preferences: Preference[] }`; `UpdateDraftRequest { preferences: Preference[] }`.
- `ApplicationSummary/Application { id; applicationNumber; program: Program; status: ApplicationStatus; createdAt; submittedAt?; version: number; preferences?; announcedScores? }`.
- `ApplicationStatus`: `DRAFT | SUBMITTED | UNDER_REVIEW | CORRECTION_REQUIRED | CORRECTION_SUBMITTED | SCREENED_OUT | REVIEW_COMPLETED | APPEAL_UNDER_REVIEW | WITHDRAWN | ARCHIVED`.
- `AnnouncedScores { announcedAt; finalPortfolioScore; shortlistingScore; gpaShortlistingScore?; examShortlistingScore?; casperScore?; appealDeadline?; reannouncedAt? }`.
- `CandidateDashboard { startNewApplication: { enabled: boolean; disabledReason?: 'ACTIVE_APPLICATION_EXISTS'|'NO_OPEN_PROGRAM'|null; nextCycleOpensAt?: string|null }; sessionTimeoutMinutes?: number; items: CandidateDashboardItem[]; page: { limit; nextCursor } }`.
- `CandidateDashboardItem` = `ApplicationSummary` + `{ submissionDeadline?; announcementDate?; appealDeadline?; allowedActions: ('VIEW'|'RESUME'|'DISCARD'|'WITHDRAW'|'REINSTATE'|'EDIT_PREFERENCES'|'EXCLUDE_TRAINING_SITE'|'APPEAL')[] }`.

**Error codes and statuses the frontend acts on:**
- `401` (any code) → new IDAM sign-in.
- `403` + `account.not_registered` → `POST /auth/sign-in`, then retry (interceptor:14,45).
- other `403` → `/not-allowed`.
- `409` + `account.duplicate` → `/duplicate-account` (interceptor:15,58; candidate.guard.ts:7,33). Both codes exist in the backend (`IdentityErrorCodes.cs:8,12`).
- `412` on PATCH → stale-draft banner (application-draft.component.ts:316).
- Client-local codes: `client.unexpected_error`, `network.unavailable`, `server.unexpected_response`.
- Message code seen in the mock: `applications.none_active` (backend ApiResponse.cs:20 documents the same).

**Times:** UTC ISO strings in. The user time zone comes from `preferences.timeZoneId`, defaulting to `Asia/Dubai`.

**CORS required:**
- Allow headers `Authorization`, `Content-Type`, `Accept-Language`, `If-Match`, `Idempotency-Key`.
- Expose `ETag` (README.md:47; tests/playwright/support/cors.ts).

## 5. Suggested order

1. FE-01 (workspace config and lockfile).
2. FE-04 (contract) and FE-02 (dev SFA).
3. FE-13 (e2e against the dev API).
4. FE-06 / FE-07 / FE-14.
5. FE-03 (roles).
6. FE-05 (contract fields).
7. FE-11 / FE-12 (primitives, components).
8. FE-10 (CSP hosting).
9. Remaining Low items.
