# DAHC frontend

Angular workspace for the GME admission platform, built to `dahc-engineering-standards (2).md` Part 2. Angular 22 (one pinned major), standalone components, OnPush, signals, typed reactive forms, `dahc-` / `Dahc` prefixes.

## Commands

Run from `frontend/` with Node 26 and npm 11.

| Command | What it does |
|---|---|
| `npm ci` | Install the pinned packages |
| `npm start` | Portal on http://localhost:4200 (English, development environment: real API on localhost:5001 and IDAM) |
| `npm run start:mock` | Portal with the in-browser mock API and persona sign-in (no backend or IDAM needed); one-time codes are `123456` |
| `npx ng serve dahc-portal -c development-ar` | Portal in Arabic |
| `npm run start:playground` | Component playground on http://localhost:4300 |
| `npm run build` | Builds `dahc-ui`, the playground and the portal (both locales, under `dist/dahc-portal/browser/en` and `/ar`) |
| `npm run lint` | Angular ESLint for all projects and the Playwright tests, zero warnings allowed |
| `npm run audit` | npm vulnerability audit (moderate and above fail) |
| `npm run extract-i18n` | Extracts portal messages to `projects/dahc-portal/src/locale/messages.json` |
| `npx playwright install chromium` then `npm run e2e` | Playwright: playground specs (keyboard, ARIA, both themes, both directions, axe WCAG 2.2 AA, 320 px reflow), portal specs on the development build with IDAM and API mocks, and candidate workflow specs on the mock build (port 4201) |

## Projects

| Path | Contents |
|---|---|
| `projects/dahc-ui` | DAHC-UI, the design system library, built from the Dubai Health Standard UI in Figma (spec: `docs/design-system/`). `src/styles`: `tokens/` (Figma primitive palette and scales as SCSS maps), `themes/` (semantic colour roles for the light theme and the proposed dark theme), `base/` (Dubai font, base rules, `.dahc-text-<role>` type roles, layout utilities); compiled to `--dahc-*` custom properties. `src/assets/fonts`: self-hosted Dubai WOFF2. `src/lib`: `core/` (theme service, accessibility primitives) and the components grouped as `actions/`, `forms/`, `data-display/`, `navigation/`, `feedback/`; component stylesheets are native CSS that use semantic tokens only. |
| `projects/dahc-playground` | Development-only documentation app (never deployed with the portal). Foundations pages (colour with live WCAG contrast checks, typography, layout and elevation) read from the loaded tokens, then one page per component: live preview, property inspector for every input and output, theme and direction switchers, states, accessibility notes, and the component's real source (copied from `dahc-ui` into the build as assets). |
| `projects/dahc-portal` | The GME candidate portal, built only from `dahc-ui` (docs: `docs/candidate-portal/`). `api/`: typed clients for the candidate operations of the contract. `core/`: configuration, IDAM sign-in, role guard, interceptors, locale, inactivity sign-out. `layouts/`: public and candidate layouts. `shared/`: program variant rules, reference lists, portfolio questions, form helpers. `features/candidate/`: dashboard, my applications, the application wizard, payment, portfolio result and appeal, account, action dialogs. `mock/`: the in-browser API used only by the mock build. |
| `tests/playwright` | Configuration, page objects, playground specs, portal specs with IDAM and API mocks, candidate workflow specs on the mock build. |

Components: `actions/button`, `actions/theme-switch`, `forms/select`, `forms/ranked-selection`, `data-display/badge`, `data-display/card`, `data-display/detail-list`, `navigation/app-header`, `navigation/page-header`, `feedback/alert`, `feedback/empty-state`. They still have their D1 look apart from the new tokens; each is realigned to Figma in its DAHC-UI phase (`docs/design-system/07-implementation-roadmap.md`).

## What the portal covers

The complete candidate experience in the GME Figma file plus the BRD candidate stories: sign-in, dashboard (first-time and returning), my applications, the application wizard for every program variant (program and preferences, application information, personal information with ICP pre-fill and contact OTP, university grades, English, internship, residency, board and license, entrance exam, portfolio with one-time submission, review, pay and submit), payment return with retry and the submitted dialog, read-only view, discard, withdraw with OTP, reinstatement, edit preferences, exclude training sites, portfolio result and appeal, account, and inactivity sign-out. See `docs/candidate-portal/README.md` for the screen inventory and routes, and `02-open-questions-and-assumptions.md` for what the business and API teams still need to confirm. Most candidate operations exist only in the contract so far, so the full workflows run on the mock build.

The first slice (D1) set up the parts below, which the portal still uses:

- **US-1.1.1 / US-1.1.2 sign-in:** authorization code with PKCE against IDAM through `angular-auth-oidc-client`, endpoints from the IDAM per-definition metadata address, scopes `openid profile email api`. Tokens are held in memory; only the single-use authorization-request values (PKCE verifier, state, nonce), the return route and a "session started" flag survive the redirect in `sessionStorage`. The first sign-in in a tab calls `POST /api/v1/auth/sign-in`; a reload restores the session with `GET /api/v1/auth/me`. Cancelled or failed sign-in, IDAM unavailable and `409 account.duplicate` each have their own page. Sign-out revokes the access token, clears memory and goes to the IDAM single sign-out page with `id_token_hint`, `post_logout_redirect_uri` and `state`.
- **HTTP:** one interceptor adds the bearer token (and `Accept-Language`) only for the configured API base URL; one interceptor turns `ApiResponse<T>` into a typed `ApiResult<T>` (with the ETag) and Problem Details into `ApiProblemError`, shows the localized message with its trace id, starts a new sign-in on 401, calls sign-in on `403 account.not_registered`, and shows the not-allowed page for any other 403.
- **US-1.2.1 dashboard:** welcome, empty state, Start new application enabled or disabled with the API's reason and next opening date, the application inbox (Application ID, program, status, dates, announced scores) with the Resume action when the API allows it, the session time-out note.
- **US-1.3.1 new application:** program, preference 1, preference 2 where the program allows it, training sites per specialty chosen and ordered, validation with highlighted fields, draft created with an `Idempotency-Key`.
- **US-1.3.11 core:** resume a draft and save preference changes with `PATCH` (JSON Merge Patch) and `If-Match`; a stale version (`412`) offers to load the latest version.
- **Locale and security:** English and Arabic via `@angular/localize` (one build per locale, `lang` and `dir` set on `<html>`), dates through the DAHC `Intl.DateTimeFormat` pipe in the user's IANA time zone (default `Asia/Dubai`), `CSP_NONCE` through `ngCspNonce`, no `innerHTML`, no tokens or personal data in browser storage (`localStorage` holds the theme only). Lint rules enforce the last three.

The typed API clients are written by hand from `Contracts/openapi/openapi.editor.yaml`, because OpenAPI code generation is not approved yet (OQ-08).

## Deployment notes

- `src/environments/environment.ts` is a template with `.invalid` hosts; each environment supplies its own file through a build configuration. No secrets: the web client is a public client.
- The web server must send a Content-Security-Policy header with a per-request nonce and replace every `DAHC_CSP_NONCE` in `index.html` with it (the build copies the placeholder from `ngCspNonce` onto the script and stylesheet tags), for example: `default-src 'self'; script-src 'nonce-{nonce}' 'strict-dynamic'; style-src 'self' 'nonce-{nonce}'; connect-src 'self' {API base URL} {IDAM metadata, JWKS, token and revocation endpoints}; img-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; require-trusted-types-for 'script'; trusted-types angular angular#bundler`.
- The API must allow the portal origin in CORS with `Authorization`, `Content-Type`, `Accept-Language`, `If-Match` and `Idempotency-Key`, and expose `ETag`.

## Not included, and why

| Not included | Reason |
|---|---|
| Other role portals (officer, supervisor, referee, finance, admin) | Out of scope for now; the routing keeps each role in its own lazy area |
| Notifications inbox | E-mail and SMS only in the BRD and contract (CJ-22) |
| Correct a returned application (US-2.3.4) | No candidate read of correction flags in the contract (OQ-C6) |
| Token renewal | IDAM renewal method not confirmed (standard s.30, OQ-15); an expired token leads to a new sign-in |
| Development-only sign-in | The API's development sign-in is not in the contract yet; portal specs use IDAM and API mocks meanwhile |
| Visual regression screenshots | Need the pinned container image (standard s.25) |
