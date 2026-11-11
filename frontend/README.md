# DAHC frontend

Angular workspace for the GME admission platform, built to `dahc-engineering-standards (2).md` Part 2. Angular 22 (one pinned major), standalone components, OnPush, signals, typed reactive forms, `dahc-` / `Dahc` prefixes.

## Commands

Run from `frontend/` with Node 26 and npm 11.

| Command | What it does |
|---|---|
| `npm ci` | Install the pinned packages |
| `npm start` | Portal on http://localhost:4200 (English, development environment) |
| `npx ng serve dahc-portal -c development-ar` | Portal in Arabic |
| `npm run start:playground` | Component playground on http://localhost:4300 |
| `npm run build` | Builds `dahc-ui`, the playground and the portal (both locales, under `dist/dahc-portal/browser/en` and `/ar`) |
| `npm run lint` | Angular ESLint for all projects and the Playwright tests, zero warnings allowed |
| `npm run audit` | npm vulnerability audit (moderate and above fail) |
| `npm run extract-i18n` | Extracts portal messages to `projects/dahc-portal/src/locale/messages.json` |
| `npx playwright install chromium` then `npm run e2e` | Playwright: one spec per playground component (keyboard, ARIA, both themes, both directions, axe WCAG 2.2 AA, 320 px reflow) and the portal D1 journey |

## Projects

| Path | Contents |
|---|---|
| `projects/dahc-ui` | Component library. `src/styles`: design tokens as SCSS maps (colour, typography, spacing, radius, elevation, motion, sizes, z-index, breakpoints) generating `--dahc-*` custom properties for the light and dark themes. `src/lib`: `DahcThemeService`, accessibility primitives (`DahcLiveAnnouncer`, `dahcUniqueId`) and the components below. |
| `projects/dahc-playground` | One page per component: live preview, property inspector for every input and output, theme and direction switchers, states, accessibility notes, and the component's real source (copied from `dahc-ui` into the build as assets). |
| `projects/dahc-portal` | The candidate web app, built only from `dahc-ui`. `api/`: typed clients for the D1 operations. `core/`: configuration, IDAM sign-in, interceptors, locale and date formatting. `features/`: screens. |
| `tests/playwright` | Configuration, portal page objects, playground specs, portal specs with IDAM and API mocks. |

Components: `alert`, `app-header`, `badge`, `button`, `card`, `detail-list`, `empty-state`, `page-header`, `ranked-selection`, `select`, `theme-switch`.

## What D1 covers

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
| Application form sections, the step navigation shown in the designs, form schema | OQ-02 (form schema vs dynamic form engine) is open; US-1.3.2 and later slices |
| View application (US-1.2.2), discard (US-1.2.3), withdraw, reinstate, edit preferences, exclude site, appeal | Later slices; the dashboard shows only the actions D1 implements |
| Auto-save, reminders, archiving (rest of US-1.3.11) | Later slice of US-1.3.11 |
| Staff screens and the role switcher | No staff screen exists in D1 to switch to (D3 onwards); staff users see the not-allowed page |
| Payments, documents, admin | Later slices (D2 onwards) |
| Token renewal | IDAM renewal method not confirmed (standard s.30, OQ-15); an expired token leads to a new sign-in |
| Development-only sign-in | The API's development sign-in is not in the contract yet; portal specs use IDAM and API mocks meanwhile |
| Visual regression screenshots | Need the pinned container image (standard s.25) |
