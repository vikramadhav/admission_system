# TASK: Generate the DAHC Angular Workspace, Component Library and Playground

You are a lead Angular engineer. Generate the workspace structure and foundational code for the DAHC web front end.

The front end consumes the DAHC .NET Web API described in the companion API prompt. It is the first client channel; other channels will be added later, so all business rules and authorization stay on the server.

---

## 1. Workspace

An Angular workspace in `/frontend`, using Angular, TypeScript, HTML and SCSS only.

| Project | Type | Responsibility |
|---|---|---|
| `projects/dahc-ui` | Library | The reusable component library, design tokens, theme engine, layout system and utilities. |
| `projects/dahc-playground` | Application | Interactive documentation: preview, configure, test and copy every component. |
| `projects/dahc-portal` | Application | The DAHC web application, built only from `dahc-ui` components. |
| `tests/playwright` | Tests | Playwright configuration, page objects and specs for the playground and the portal. |

- Pin one Angular major version for the whole workspace and upgrade all projects together.
- TypeScript `strict` mode and Angular strict templates on. No `any`, no non-null assertions without a comment explaining why.
- Standalone components only (no NgModules), `OnPush` change detection, signals for component state and inputs, typed reactive forms.
- One prefix: `dahc-` for component selectors, `Dahc` for class names.

## 2. Prohibited

- Third-party UI libraries or CSS frameworks: Bootstrap, Angular Material, NG-ZORRO, PrimeNG, Tailwind CSS or any utility-class or component framework.
- Third-party runtime packages of any kind, unless listed in Section 9.
- Business rules or authorization decisions in the client. Route guards and hidden elements are a usability aid only; the API decides.
- Tokens or personal data in `localStorage`, `sessionStorage`, cookies or URLs.
- `innerHTML` with unsanitized content, and any `bypassSecurityTrust*` call.
- Placeholder files, empty folders or comments that restate the code.

## UI visual reference policy (approved project decision)

The supplied UI screenshots/mockups are **visual references only**, not functional specifications or complete form definitions.

- The BRD and approved business decisions determine **what must be implemented**: all fields (including required/optional status), sections, actions, validations, roles, permissions, workflow steps and acceptance criteria.
- The visual references guide **how it should look**: design language, colors, typography, spacing, hierarchy, layout and reusable component styling.
- Do **not** infer that a field, button, section or action is unnecessary because it is absent from a screenshot. Likewise, do not add unsupported functionality merely because it appears in a screenshot.
- Before implementing a form or screen, build a BRD-backed inventory of fields, validation rules, actions and permission/state conditions, with source requirement IDs.
- Adapt and extend the visual pattern to fit the complete BRD requirements. A pixel-perfect reproduction is not required when it would omit mandatory functionality.
- Reuse the existing approved Angular components and design tokens wherever practical. Preserve responsive behavior, Arabic RTL, English LTR and WCAG accessibility.
- Where UI references conflict with BRD functionality, preserve BRD requirements and record material conflicts for review; do not silently resolve business ambiguities.
- Test screen completeness against the **BRD inventory**, not against the screenshots. Visual regression tests can separately assess styling consistency.

**Priority: BRD for functionality; approved UI references for visual language; engineering guidelines for implementation.**

---

## 3. Design tokens and theme engine

- **Tokens** are defined once as SCSS maps in `dahc-ui`: color, typography scale, spacing, radius, elevation, motion, breakpoints and z-index.
- **Runtime themes:** tokens are emitted as CSS custom properties. Components use only the custom properties, never raw values.
- **Light and dark themes** ship with the library. A custom theme is a set of token overrides applied under `[data-theme="<name>"]`, with no component changes.
- **Theme selection:** a `ThemeService` sets `data-theme` on the root element. It follows `prefers-color-scheme` until the user chooses, and remembers the choice in `localStorage` (a display preference, not personal data).
- **Contrast:** every shipped theme meets WCAG 2.2 AA contrast for text, icons and focus indicators. A custom theme is checked the same way before release.
- **Reduced motion:** motion tokens respect `prefers-reduced-motion`.

## 4. Layout system and utilities

- A responsive grid and flex layout system, and spacing, display and visually-hidden utilities, written in SCSS on the tokens.
- **Right-to-left first:** Arabic is a supported language, so all spacing, alignment and positioning use CSS logical properties (`margin-inline-start`, `inset-inline-end`, and so on), never left or right. Every component works in `dir="rtl"` and `dir="ltr"`.
- Layouts work from 320 px wide and at 200% zoom without horizontal scrolling of the page.

## 5. Component library

### Component rules

- Every component is standalone, configurable through typed signal inputs and outputs, and has one consistent API style across the library: the same input names for the same ideas (`size`, `variant`, `disabled`, `invalid`, `label`).
- Every component meets WCAG 2.2 AA and follows the WAI-ARIA Authoring Practices for its pattern: roles, states, keyboard interaction, visible focus and screen-reader names.
- Form components implement `ControlValueAccessor` and work with typed reactive forms, including error and description text linked by `aria-describedby`.
- Every component is responsive and themeable through tokens only.
- Shared accessibility primitives (focus trap, focus restore, live announcer, unique id generator) are built in `dahc-ui` and reused, not repeated per component.

### Copy-and-paste source

- Each component lives in its own folder (`.ts`, `.html`, `.scss`) and depends only on the tokens and the shared accessibility primitives, so a developer can copy the folder into another project.
- The playground shows the **actual** source files of each component, read from `dahc-ui` at build time and served as assets. Snippets are never written or maintained by hand, so they cannot drift from the code.

## 6. Playground

- One page per component: a live preview, a property inspector that sets every input and shows every output, a theme switcher (light, dark, custom), a direction switcher (LTR, RTL), the component's states (default, hover, focus, disabled, invalid, loading where relevant), accessibility notes (keyboard keys, ARIA), and copy buttons for the usage example and each source file.
- Each playground page also serves as the Playwright test harness for that component, with stable `data-testid` hooks only where roles and labels are not enough.

## 7. Portal application

- Built only from `dahc-ui` components and utilities.
- **Sign-in:** the app runs the OpenID Connect authorization code flow with PKCE against IDAM (the DAHC identity provider, which offers single-factor login and UAE PASS) as a public client, reading its endpoints from the configured per-definition metadata address (IDAM does not serve `/.well-known/openid-configuration`), requesting `openid profile email api` (plus `offline_access` only if IDAM confirms refresh-token rotation), with `response_mode=query` (IDAM's metadata advertises `fragment` and `form_post`; `form_post` needs a server and cannot be used by a static app, and `query` is confirmed working in an existing integration), sending the registered redirect URI exactly as configured, using one OpenID-certified Angular OIDC client library (Section 10). No hand-written protocol code. The library validates `state`, `nonce` and the ID token.
- **After sign-in:** the app calls `POST /api/auth/sign-in` once, which looks up the active local account and may automatically provision a **Candidate-only** account for a first-time eligible OIDC identity; other roles must be provisioned administratively. An existing disabled/blocked user is denied and is never reactivated. The API enforces idempotency and identity uniqueness using validated `iss` + `sub` (never email alone), and returns the user's profile, locally assigned roles and preferences. The app shows screens from that response, never from decoding tokens itself, and never sends profile, role or other identity data to the API: the API takes identity only from the token. Role-based screens follow the DAHC roles in the API response; the IDAM `role` claim is never used.
- **Role switcher:** users with more than one role see a role switcher in the shell, listing the roles from the API. Choosing a role calls `PUT /api/auth/active-role`, then reloads menus and route guards and navigates to that role's home page. After a page refresh the active role comes back from `GET /api/auth/me`; the browser never stores it. Users with one role, including every Candidate, never see the switcher.
- **Tokens:** held in memory only, never in `localStorage`, `sessionStorage`, cookies or URLs. When the access token expires or the page reloads, the app gets a new token through the library (a new sign-in, which the IDAM session usually makes silent, or a rotating refresh token if IDAM issues one).
- **HTTP:** one interceptor adds `Authorization: Bearer <access token>` only to requests for the configured API base URL, never to any other host. The token is IDAM's opaque access token, which the API introspects. The app never sends the ID token to the API and never tries to decode or validate the access token.
- **Error handling:** one HTTP interceptor translates the API's `ApiResponse<T>` and `ProblemDetails` into typed results and shows the localized message and the trace id. A `401` starts a new sign-in; `403` with `account.not_registered` calls the sign-in endpoint; any other `403` shows a not-allowed page.
- **Sign-out:** for OIDC, the app revokes its tokens at the IDAM revocation endpoint, clears them from memory and navigates to the IDAM end-session page (configured, because IDAM's metadata does not publish one) with `id_token_hint`, a registered post-logout redirect URI and `state`. For local SFA, the app clears development tokens and calls a development-only logout/revocation operation if supported by the API; it never calls IDAM.
- **Configuration:** the IDAM metadata address, client id, redirect URI, post-logout redirect URI, end-session page and scopes come from per-environment configuration. The client id of a browser app is public by nature; it is still never hard-coded.
- **Local development SFA:** the app exposes a development-only username/password sign-in UI backed by the API's ASP.NET Core development authentication implementation, issuing development bearer tokens for seeded local test users and roles. The endpoint and token trust are available **only** in the Development environment; the UI is compiled only into local development builds. Never deploy local SFA to Test/UAT/Production or commit test credentials. Local SFA does not auto-provision privileged roles.

### Locale and time

- **Languages:** Arabic and English, using Angular's built-in i18n (`@angular/localize`), one build per locale, with `dir` and `lang` set on the root element.
- **Times:** the API returns UTC times with the user's time zone. The app formats dates and times with its own pipe built on `Intl.DateTimeFormat`, using the active locale and the user's IANA time zone. Angular's `DatePipe` is not used for zoned times, because it accepts only fixed offsets.
- **Sending times:** the app always sends ISO 8601 strings with an explicit offset.

### Content Security Policy

Because the app holds access tokens in memory, cross-site scripting would expose them: the app must run under a strict Content Security Policy with Trusted Types, and `connect-src` lists only the API and the IDAM token, UserInfo and revocation endpoints. Angular's runtime component styles get a per-request nonce through `CSP_NONCE`, which the hosting server injects.

## 8. Testing with Playwright

- **Component behaviour:** keyboard interaction, focus management, ARIA states, form integration and output events, tested through each component's playground page, in light and dark themes and in LTR and RTL.
- **Accessibility:** automated checks on every playground page and on the main portal screens.
- **Visual regression:** screenshots per component, state, theme and direction, generated in one pinned container image so fonts render identically everywhere.
- **End-to-end:** portal flows against the API in Development, signing in through the API's development-only sign-in as a development user of each role, so every role's screens and refusals are covered. Tests never call IDAM or UAE PASS.
- Page Object Models for the portal; one spec file per component for the playground.
- Locate elements by role and accessible name first, `data-testid` only as a fallback.

## 9. Required output

### Section 1: Overview

A Mermaid diagram of the workspace projects, the Playwright suite and their relationship to the API.

### Section 2: Workspace tree

The tree for the first slice only: tokens, theme engine, layout system, the shared accessibility primitives, five components (button, form field with text input, checkbox, alert, dialog), their playground pages, the portal shell with sign-in and a list page, and the Playwright suite for them. Include only files the slice needs. Give each file one line explaining its role.

### Section 3: Code

Complete, working code for:

1. The SCSS token maps, the CSS custom property output for light, dark and a sample custom theme, and `ThemeService`.
2. The grid and spacing utilities using logical properties.
3. The button and dialog components, including the dialog's focus trap, focus restore, `Escape` handling and ARIA.
4. The form field and text input with `ControlValueAccessor`, error and description text.
5. A playground page with the property inspector, theme and direction switchers, and copy buttons that serve the real source files.
6. The portal HTTP interceptor and the zoned date pipe.
7. Playwright specs: dialog keyboard and focus behaviour, a visual regression test in both themes and directions, and the portal sign-in flow through development SFA, including the local-account lookup, active-role behavior and a `401` on an expired token. Add API integration tests for Candidate-only OIDC provisioning, rejected staff auto-provisioning, disabled accounts, duplicate sign-ins and concurrent creation; do not simulate OIDC by trusting user-supplied identity claims.

## 10. Execution rules

- Follow the engineering standard's general rules where they apply to TypeScript: meaningful names (including lambda parameters), small focused functions, early returns, no commented-out code, comments only for the why.
- Every package used must be listed in the decisions table below. Do not add any other package.
- Do not invent requirements beyond this prompt. If something essential is missing, list it as an open question after the code rather than guessing.

---

## Front-end decisions

| Decision | Value |
|---|---|
| Framework | Angular, one pinned major version |
| Deployed authentication | IDAM OIDC authorization code + PKCE; the IDAM opaque **access token** (never the ID token) is sent as the bearer token and validated by the API through IDAM introspection (backend standards §19, "DAHC IDAM access-token validation") |
| Local authentication | Development-only username/password SFA through API, no IDAM dependency; never enabled in Test/UAT/Production |
| Account provisioning | Backend-only, OIDC Candidate-only, idempotent; privileged roles never auto-provisioned |
| Component prefix | `dahc-` / `Dahc` |
| Accessibility target | WCAG 2.2 AA, WAI-ARIA Authoring Practices |
| Languages and direction | Arabic (RTL) and English (LTR); one build per locale |
| Themes | Light, dark, and custom token overrides |
| Approved packages | Angular framework packages, including `@angular/localize`; one OpenID-certified Angular OIDC client library (to be named); Angular's own build and test tooling; Playwright; `@axe-core/playwright` (accessibility checks, test only) |
| Not approved | Angular CDK and any other component or behaviour library (all primitives are built in `dahc-ui`) |
