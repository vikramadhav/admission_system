# Test results and visual comparison

Run on 2026-11-12, Chromium (Playwright 1.65), from `frontend/`.

## Commands and results

| Check | Command | Result |
|---|---|---|
| Lint (all projects and Playwright) | `npm run lint` | all files pass |
| Production build (dahc-ui, playground kit, playground, portal en + ar) | `npm run build` | passes; the Arabic build has every message translated (`i18nMissingTranslation: error`) |
| Mock build | `npx ng build dahc-portal -c mock` | passes |
| Playwright, whole suite | `npm run e2e` | **480 passed**, 0 failed |
| — candidate workflows on the mock build | project `candidate` (19 tests) | passed |
| — portal on the development build with IDAM and API mocks | project `portal` (9 tests) | passed |
| — DAHC-UI playground (unchanged) | project `playground` | passed |
| Scope | `git status` outside `frontend/`; files in `projects/dahc-ui`, playground and playground kit changed during this work | none; none |

## What the candidate specs cover

`tests/playwright/specs/candidate/`:

- **Dashboard:** sign-in redirect and return, first-time dashboard (welcome, time-out note, hero, admission cycle, before you begin), returning dashboard with announced scores, key dates, appeal note and only the API's allowed actions, My applications table, My account, staff refused, sign-out, dark theme axe, 320 px reflow.
- **Actions:** discard draft, withdraw with reason validation, a wrong code, then the right one, reinstatement, edit preferences (reorder), exclude a training site, portfolio result and appeal.
- **Wizard:** program step validation (required, sites, distinct specialties); a full Medical Internship application from a new candidate through all 7 steps (ICP read-only identity, next-of-kin e-mail mismatch shown on the stepper and fixed, eleven uploads, GPA score 3.00 → 37.50 / 50, IELTS, portfolio one-time submission with the confirmation table, a failed payment, retry, payment, the submitted dialog, dashboard shows Submitted); contact e-mail OTP; read-only view of a submitted application; 320 px reflow of six steps.
- **axe WCAG 2.2 AA** runs on every main screen and dialog in these specs.

`tests/playwright/specs/portal/` (development build, real OIDC code + PKCE against IDAM mocks): sign-in and token handling, session restore, start-new disabled reason, duplicate account, IDAM unavailable, old-address redirects, draft creation payload with `Idempotency-Key`, save with `If-Match`, 412 recovery, IDAM single sign-out, dark theme and 320 px.

## Fixed during testing

- Sign-in page: the router binds `undefined` for a missing `returnUrl` query parameter, which broke persona sign-in; the return path now falls back to the dashboard and accepts in-portal paths only.
- Conditional document slots (for example the English certificate, the employment letter) appeared only after an explicit save. Sections now auto-save 1.5 s after the last change (US-1.3.11), with saves queued so an auto-save and Next never race on the ETag; typing during a save stays unsaved-and-dirty.
- A link inside an info alert failed colour contrast (My account); portal style fixed, DAHC-UI recommendation logged.
- Action dialogs could not opt out of the page message area: the action API methods now take an optional `HttpContext`.
- Lint: dynamic delete in the mock, i18n rule on the mock-only gateway page.

## Visual comparison with Figma (1280 px)

Screenshots were taken of the dashboard (both states), the program, application information, identity, contact, university grades, entrance exam, portfolio, pay and submit steps, the board and license step (view mode), My applications, the portfolio result and My account, and compared with the Figma frames listed in [README.md](README.md).

| Area | Matches Figma | Differences (and why) |
|---|---|---|
| Page structure | White 80 px header, Blue/200 banner with breadcrumb, H1, meta row and status tag, page background, 1200 container, navy footer | Header shows Home, My applications, My account (Figma: Home only; the extra links are the breadcrumb target and the profile pill's destination). No notification bell (A-14). |
| Wizard | 300 px stepper card + form card, STEP n OF m, sub-steps under Personal Information, sticky action bar with Save As Draft, Discard, Back, "Next: <step>" | "Next" labels are generated (Figma has inconsistent copy and typos). Step totals follow the program (7 to 10, Figma mixes 9 and 10). The logo tile does not overhang the banner (DAHC-UI header, noted in the design-system docs). |
| Dashboard | First-time hero, admission cycle tiles, before you begin; returning application card, preference cards, score tiles, action row, key dates, appeal note | Application ID uses the contract format (A-12). The admission-cycle tile shows the number of open programs (no "academic entity" in the contract). Previous applications are listed under the active one (Figma shows one application). |
| Forms | 2-column grid, 48 px inputs, read-only verified fields with "Verified via ICP", computed GPA field, upload slots and uploaded rows, Yes/No radios | Required fields carry an asterisk everywhere (Figma marks only Portfolio). Option lists are samples (A-04). |
| Pay and submit | Warning, key/value grid, section checklist with Complete tags, success dialog with receipt details | Incomplete sections get an "Incomplete" tag and a "Complete this step" link (Figma shows only the all-complete state). |
| Typography and colour | Dubai font, navy text, DAHC-UI tokens | Figma's one-off colours (#32AFFC sky text, purple tile, pale toasts) map to the nearest semantic tokens. |

## Outstanding

- **Not tested in a browser by a person:** RTL Arabic screens (the build and translations exist; the specs run in English). Arabic strings are machine-translated and need review (A-16).
- **No Figma for:** entrance exam, payment failure and pending states, every dialog except the success dialog, error and loading states, mobile layouts. These use DAHC-UI patterns and need UX sign-off.
- **Mobile:** layouts reflow to 320 px (tested), but there are no mobile designs to compare with.
- **Real API:** every screen is wired to the contract operations; only sign-in, dashboard, catalog, create, read and preference save exist in the backend today (A-01).
