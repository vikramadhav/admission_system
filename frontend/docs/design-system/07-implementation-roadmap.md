# 7. DAHC-UI implementation roadmap

Each phase ends with:

1. Build, lint and Playwright all green.
2. The playground updated.
3. A list of derived states that need UX sign-off.
4. A **stop for your approval**.

All work stays in `frontend/`. GME screens start only after Phase 9.

| Phase | Scope | Deliverables | Depends on |
|---|---|---|---|
| **1 (this)** | Figma analysis and architecture | `frontend/docs/design-system/*` | done |
| **2. Foundations** | Restore the build (`angular.json`, lockfile, `npm install`, D7). Tokens (primitives, semantic light theme, dark theme per D2), Dubai font, base styles, typography roles and utilities. Restructure `dahc-ui` into `core/` and groups. Migrate the existing 11 components and the portal to the new token names. | Token SCSS, `dahc-ui.css` output, playground Foundations pages (colour with contrast, type, spacing, radius, elevation, motion, breakpoints), Playwright foundations spec | D1, D2, D4, D6, D7 |
| **3. Core primitives and actions** (done) | `dahc-icon` with 35 Figma Functional icons (CSS-mask rendering, no SVG injection, RTL mirroring); shared `DahcFormControl` base (select refactored onto it); Button reworked to Figma (7 variants, 36/44/48, icons, loading); icon button; button group on native radios. Focus trap/restore, roving tabindex and overlay positioning moved to the first phase that uses them (overlay: Phase 4 select/combobox; focus trap: Phase 8 dialog), per the no-speculative-abstraction rule. | Components, playground pages (Icons, Button, Icon button, Button group), specs | 2 |
| **4. Form controls A** (done) | `dahc-form-field` (label, 48px box, hint, error with icon, required marker, success status, start/end adornments) with native `input`/`textarea`/`select` marked `dahcInput`, including read-only verified and computed fields; checkbox (with indeterminate); radio group; select rebuilt on the form field (native list kept); search (48/64px, clear button, `searchSubmitted`). Not built (no Figma design): character counter, password reveal, select option-row styling (custom list comes with the Phase 5 combobox). | Components, playground pages, specs | 3 |
| **5. Form controls B** (done) | `dahc-multi-select` (Figma multi-select with in-list search, ported from dubai-health-ui; array value in option order), `dahc-phone-input` (country code + number, international string value, `dahcPhone` validator), `dahc-file-upload` (GME slot and uploaded row: choose or drop, type and size checks, preview, remove, progress). Date input and calendar were delivered with the dubai-health-ui port. | Components, playground pages, specs | 4 |
| **6. Data display** (done) | Card reworked (GME panel default: radius 16, no shadow; new DH actionable variant with hover lift); `dahc-badge` is now the count / dot badge (portal status labels moved to `dahc-tag`); detail list restyled as the GME key/value grid; new `dahc-stat-tile` (GME score tiles), `dahc-accordion` (Figma 50:17721, ported), `dahc-list` (ported). Icon library extended from the owner's SVG exports to 193 icons in five sets (see below). | Components, playground pages, specs | 3 |
| **7. Navigation** (done) | `dahc-logo` (Figma DH logo 50:2078, horizontal and icon, navy and white SVGs); `dahc-breadcrumbs` (50:9802, dark and light tones); app header reworked to the GME header (logo tile, main nav with current-page underline, notifications button with count badge, language, theme, user, sign out, burger + drawer below 1024px; old API kept); page header gains breadcrumbs, a label-value meta row and a status slot; `dahc-footer` (Web Footer 50:11046 / Mobile Footer 50:11129, new footer tokens); GME wizard: `dahc-wizard-steps` (vertical stepper with sub-steps and error state), `dahc-step-header`, `dahc-wizard-action-bar`. Tabs came with the port. A11y fixes: breadcrumb current page and page-header description use text-secondary; footer copyright navy-300. DERIVED, pending UX sign-off: stepper error state, notifications icon (`gov-chat`, there is no bell), header drawer layout, logo tile not overhanging the bar. Not shipped: logo vertical orientation. | Components, playground pages (Breadcrumbs and logo, Footer, Wizard, App header, Page header), `phase7-navigation.spec.ts` (all display modes, axe, drawer below 1024px, 320px reflow) | 3, 6 |
| **8. Feedback and overlays** | Dialog, confirmation dialog, alert (rework), toast, tooltip, spinner, empty and error state (rework) | Same as Phase 3, plus focus-trap and Escape tests | 3 |
| **9. Validation and v1 freeze** | Complete the playground (navigation, search, responsive toolbar, copy tabs, Figma compare panel). Full Playwright run (themes × directions × viewports, axe). Figma comparison report per component. Architecture and scope audit (`git diff` shows only `frontend/`, no third-party UI, no raw values). | `docs/design-system/validation-report.md`, a DAHC-UI v1 tag proposal | 2–8 |
| 10+. GME application | Screens composed from DAHC-UI, as in the earlier roadmap | n/a | 9 |

Phases 6, 7 and 8 depend only on Phase 3, so they could run in parallel if you want to speed up after Phase 5.

**Tier C components** (doc 04) enter a phase only once a design exists or D5 allows a DAHC proposal.

## Phase 2 prompt (for when you approve)

```text
Phase 2: DAHC-UI foundations. Follow frontend/CLAUDE.md guardrails (write only in frontend/, no commits, no new packages without asking).
Inputs: frontend/docs/design-system/03-design-tokens.md, 05-architecture.md, and decisions D1–D8 as answered.
1. Restore the workspace build: add `!angular.json` and `!package-lock.json` to frontend/.gitignore, create frontend/angular.json for dahc-ui, dahc-playground and dahc-portal, then run npm install, and record the baseline build, lint and e2e results.
2. Replace dahc-ui/src/styles with tokens/ (primitives), themes/ (light, and dark per D2) and base/ (reset, fonts, typography roles, utilities, focus) as specified. Every value cites its Figma node or is marked "DAHC proposal" or "A11y fix".
3. Add the Dubai font (if provided per D6) with @font-face, self-hosted.
4. Move the existing components into the core/ and group folders without changing public exports; migrate their styles and the portal styles to the new token names.
5. Playground: add Foundations pages rendered from the live custom properties, with contrast ratios for semantic colour pairs.
6. Playwright: foundations spec (tokens present in both themes, axe on foundations pages); all existing specs green.
Report changed files, command results, derived values needing UX sign-off, then stop.
```

## Port from dubai-health-ui (2026-11-12)

On request, components of the separate Lit framework `dubai-health-ui` (same DH Figma source) were ported to Angular DAHC-UI. Code was rewritten, not wrapped: DAHC-UI stays Angular-only with one token system. Each ported file says "Ported from dubai-health-ui".

| Area | Built | Design status |
|---|---|---|
| Playground | `projects/dahc-playground-kit`: reusable shell, navigation, inspector, source viewer, token-driven Foundations pages; `dahc-playground` is now a thin configuration (see the kit README) | n/a |
| Overlay core | `core/overlay/position.ts`, global `.dahc-popup`; native `<dialog>` and the Popover API replace a hand-written focus trap | n/a |
| Date | `dahc-calendar`, `dahc-date-picker` (CVA + validator) | Field from Figma; calendar DERIVED |
| Overlays | `dahc-modal`, `dahc-drawer`, `dahcTooltip`, `dahc-menu` (action menu) | Modal from Figma 50:17179; others DERIVED |
| Feedback | `dahc-tag`, `dahc-switch`, `DahcToastService` + `dahc-toast-region`; `dahc-alert` restyled (API unchanged) | Tag from Figma 50:7426; others DERIVED |
| Data | `dahc-table`, `dahc-pagination`, `dahc-tabs` / `dahc-tab-panel`, `dahc-steps` | Pagination from Figma 50:8033; inverse tabs from 50:9930; others DERIVED |

This moves several Tier C items (switch, calendar popup, table, drawer, action menu) to built-with-derived-design; all remain pending UX sign-off. Still open from the original phases: spinner, empty and error states (Phase 8).

## Icon library (2026-11-12)

The owner's SVG exports (`frontend/docs/*SVG Icons.zip`) were added to `dahc-ui/src/assets/icons`: Government 20 (`gov-*`), Services 37 (`service-*`), View 59 (`view-*`), Social media 42 (`social-*`, plus `social-*-brand` in brand colours), next to the 35 Functional icons: 193 in total. Names are typed from the files by `npm run icons:registry` (tools/generate-icon-registry.mjs); brand logos render in their own colours, every other icon in the current text colour. Left out: a duplicate Endocrinology, two stray Facebook files in the Services and View zips, and the Social Hover and White styles (colour variations, done with CSS). Open question for the UX owner: the unnamed Government icon "04" ships as `gov-04`.
