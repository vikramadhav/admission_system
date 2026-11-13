# DAHC-UI reuse in the candidate portal

DAHC-UI (`projects/dahc-ui`, consumed as `dahc-ui`) is used unchanged. The portal adds only layout and composition styles that use DAHC-UI's semantic tokens (`var(--dahc-*)`); no colour, spacing or size values are hard-coded. No third-party UI library is used.

## How DAHC-UI is consumed

- `angular.json` → `dahc-portal` loads `projects/dahc-ui/src/styles/dahc-ui.scss` (tokens, light and dark themes, Dubai font, base styles) and copies DAHC-UI's icons (`dahc-ui/icons`) and logos (`dahc-ui/logo`).
- Components are imported from `dahc-ui` (TypeScript path to the library source) into each standalone component's `imports`.
- Breakpoints follow DAHC-UI's (`48rem` md, `64rem` lg). Media queries cannot read custom properties, so the values are written in the portal's SCSS.

## Mapping

| GME need (Figma / BRD) | DAHC-UI | Where in the portal |
|---|---|---|
| Header: logo tile, product name, navigation, language, user, sign out, mobile menu | `dahc-app-header` (nav items, burger, drawer) | `layouts/candidate-layout`, `layouts/public-layout` |
| Footer | `dahc-footer` | `layouts/shared/portal-footer.component.ts` |
| Banner: breadcrumb, H1, meta row "Label - Value", status tag, actions | `dahc-page-header` with `breadcrumbs`, `meta`, `[page-header-status]`, `[page-header-actions]` | every page; wizard banner |
| Breadcrumb | `dahc-breadcrumbs` (inside page header) | every page |
| Status tags (DRAFT, SUBMITTED, …) and small tags (Complete, Incomplete, points) | `dahc-tag` (purposes) | `shared/application-status.ts`, dashboard, pay & submit, portfolio |
| Notification count (header) | `dahc-badge` (inside the header) | not used: there is no notification inbox (doc 02) |
| Cards / panels | `dahc-card` (GME bordered default) | dashboard, wizard stepper and form cards, dialogs |
| Vertical stepper with sub-steps, complete / current / upcoming / error | `dahc-wizard-steps` | wizard |
| "STEP n OF m" header | `dahc-step-header` | wizard |
| Sticky action bar (Save As Draft, Discard ‖ Back, Next) | `dahc-wizard-action-bar` | wizard |
| Buttons: primary navy, outline, danger (Withdraw), danger outline (Discard), link | `button[dahc-button]` variants and sizes | everywhere |
| Text, e-mail, number inputs; read-only "Verified via ICP" and computed fields | `dahc-form-field` + `input[dahcInput]` (read-only and success hint styles) | all steps |
| Select | `dahc-select` | all steps |
| Searchable multi-select with ranked chips (training sites) | `dahc-ranked-selection` | program step, edit preferences drawer |
| Yes/No and other radio questions | `dahc-radio-group` | all steps, portfolio |
| Checkbox (terms, exclusion, appeal) | `dahc-checkbox` | application information, dialogs, portfolio result |
| Date input DD/MM/YYYY with calendar | `dahc-date-picker` | personal, academic, english, internship, residency, board, exam, portfolio |
| Phone with country code | `dahc-phone-input` | contact, next of kin |
| Upload slot and uploaded-file row (Preview, remove, type and size limits) | `dahc-file-upload` | `section-attachments.component.ts` |
| Info / warning notes and toast banners | `dahc-alert` (info, success, warning, error; dismissible) | everywhere |
| Success toast after save, submit, withdraw | `dahc-toast-region` + `DahcToastService` | candidate layout |
| Success dialog with details; confirmations; OTP | `dahc-modal` | payment return, discard, withdraw, reinstate, exclude, pay, portfolio, appeal, contact OTP, session time-out |
| Edit preferences panel | `dahc-drawer` | dashboard actions |
| Key/value grids (Created, Submitted, Key dates, pay summary) | `dahc-detail-list` | dashboard, pay & submit, payment return, account |
| Score tiles (portfolio, entrance exam, GPA, shortlisting) | `dahc-stat-tile` (orange, blue, purple, red) | dashboard |
| My applications list | `dahc-table` with cell templates | applications page |
| Empty states | `dahc-empty-state` | applications, portfolio result |
| Icons | `dahc-icon` (193 icons) | everywhere |
| Logo | `dahc-logo` (inside header and footer) | layouts |
| Theme (light / dark) | `DahcThemeService`, tokens | header switch; all pages work in both themes |

## Portal-level compositions (not new base components)

| Composition | Built from | Why it is in the portal |
|---|---|---|
| `dahc-preference-card` (program step) | `dahc-select` + `dahc-ranked-selection` | GME-specific: specialty with ordered training sites |
| `dahc-section-attachments` | `dahc-file-upload` per server slot | GME-specific: slots come from the attachment API |
| Portfolio question card | `dahc-radio-group`, `dahc-tag`, form fields, attachments | GME-specific question set with points |
| Terms box | scrollable region + `dahc-checkbox` | GME-specific copy |
| Section checklist (pay & submit) | list rows + `dahc-tag` | GME-specific |
| Admission cycle icon tiles, hero card, "Before you begin" | `dahc-card`, `dahc-icon`, category tokens | GME-specific dashboard content |
| OTP entry (withdraw, contact verification) | `dahc-modal`, `dahc-form-field`, link button | recurring pattern, see doc 04 |

Genuine DAHC-UI gaps found while composing these are listed in [04-dahc-ui-recommendations.md](04-dahc-ui-recommendations.md).
