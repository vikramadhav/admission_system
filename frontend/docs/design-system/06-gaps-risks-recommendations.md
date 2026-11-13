# 6. Gaps, risks, recommendations and decisions needed

## 6.1 Decisions needed before Phase 2

| # | Decision | Options | Recommendation |
|---|---|---|---|
| **D1** | Styling technology: native CSS vs the standard's SCSS | (a) SCSS maps only for the token source; component stylesheets in native CSS (`.css`). (b) SCSS everywhere, as the standard says. (c) Native CSS everywhere, with no token maps. That last option needs the standard's owner to change s.21. | **(a).** One token source as the standard wants, and native CSS everywhere else (doc 05 §5.3). |
| **D2** | Dark theme (Figma has none; standard s.21 requires one) | (a) Ship a derived dark theme, marked "not designed" until UX approves it. (b) Light only, with a standards exception. | **(a)** |
| **D3** | Conflicts between the DH standard and GME: button sizes and labels, card radius 12 vs 16, input radius 10, type sizes 13/15/10, container 1140 vs 1200 | (a) DH wins and GME aligns. (b) The GME values become approved DAHC-UI variants. (c) Decide per item. | **(c).** Adopt GME's additions that fill DH gaps: solid red button, read-only input, input radius, 1200 container, 40 px button. Align GME to DH where DH has a value: type sizes, button label sizes. Card radius needs a UX ruling. |
| **D4** | Accessibility fixes to Figma colours (doc 03 §3.3): link #037BC5, error #B42318, placeholder navy-700, control border navy-600, focus ring | (a) Accept as proposed. (b) UX supplies alternatives. | **(a).** #037BC5 is already the designer's own choice (`50:7083`). |
| **D5** | Tier C components with no design (time picker, switch, calendar popup, table, avatar, drawer, action menu, sidebar, skeleton, progress) | (a) Wait for UX designs. (b) Allow DAHC to propose designs from tokens for UX review. | **(a)** for anything GME doesn't need now. **(b)** only for the calendar popup and the table, if UX can't deliver before they're needed. |
| **D6** | Dubai font files and licence; Untitled UI icon licence | Someone needs to provide the WOFF2 files and confirm licences | Ask the UX owner to provide the font files and confirm the licences. The fallback is `system-ui` until then. |
| **D7** | `frontend/angular.json` and `package-lock.json` are ignored by the root `.gitignore`, so a fresh clone can't build | (a) Add negation rules in `frontend/.gitignore` (stays inside `frontend/`). (b) Change the root `.gitignore` (outside scope; needs approval). | **(a).** Do it at the start of Phase 2, together with `npm install`, which writes only under `frontend/`. |
| **D8** | Playground location | (a) Keep it as a separate app (current). (b) Make it a dev-only route in the portal. | **(a)** (doc 05 §5.7) |

## 6.2 Gaps in the design sources

**Accessibility (highest impact)**

1. No focus state on any component, in either file.
2. Several core colours fail WCAG 2.2 AA, including the link, error, placeholder, checkbox tick, input border and secondary-blue button text (doc 03).
3. Disabled is shown as opacity 50% (DH) or 20% (GME). That's unpredictable on tinted surfaces, so tokens replace it.
4. Error is shown by colour alone, and the label switches to bold when selected (Controls), which shifts the layout.
5. No RTL or Arabic designs, although both products are bilingual.

**Missing foundations**

6. No semantic tokens, no dark mode, and no spacing, radius, grid, breakpoint or motion specifications.
7. Motion timing exists only as prototype interactions; the API exposes no durations or easings.
8. No tablet layouts. Form controls have no mobile variants.

**Missing or incomplete components:** see doc 04, tiers B and C. The most important for GME are:

- The datepicker (its page is empty).
- Select (not a component).
- Error and validation states.
- File upload states.
- Confirmation dialogs.
- Toasts and alerts.
- The stepper.

**Inconsistencies (these need a UX ruling, not a code decision)**

9. Off-palette values: shadow colour #003366, GME alpha tints, Mulish, Source Sans Pro, Gilroy and Inter text.
10. Sparse button matrix. For example, there's no Solid Navy small and no Outline Navy large. Active looks the same as Default for several colours.
11. Duplicate and legacy pages and variables, and label mismatches on the canvas (foundations extract §10).
12. GME isn't linked to the DH library: 2,155 frames but only 63 instances, so the two files drift.

## 6.3 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Building tier-B components with derived states that UX later rejects | Rework | Mark every derived state in the playground ("Derived, pending UX"). Batch the sign-off per phase. Keep derived values in tokens, so a rejection is usually a token change. |
| Figma API rate limit: the View seat ran out of calls during this analysis | Slower extraction, especially icon export and per-variant measurements in Phase 3+ | A Dev or Full seat for the account used by Figma MCP. Otherwise extract per component and cache the results in `docs/design-system/figma-extracts/`. |
| Token rework changes the look of the existing portal D1 screens (font, colours, radius) | The portal Playwright specs may need updates | Phase 2 keeps the portal building and updates only token names. The visual changes are intended alignment with Figma. |
| No responsive or RTL designs | Layouts invented by developers | Container-query components, Arabic smoke tests in Playwright, and a list of screens needing RTL review |
| Font and icon licensing unresolved | Can't ship the Dubai font or Untitled UI icons | D6. A system-font fallback keeps development unblocked. |
| Scope creep from the DH website components (mega menu, doctor cards, map) | Effort spent with no consumer | Tier W: build only when a consumer needs it |
| A visual baseline that depends on the machine | Flaky screenshot tests | Report-only Figma comparison until the pinned container image exists (standard s.25) |

## 6.4 Recommendations

1. Ask the UX owner to **publish the DH file as a library**, link GME to it, and add the missing items: semantic variables, focus, error and disabled states, and the datepicker. Share this document as the gap list.
2. Approve D1–D8. Then implement DAHC-UI in the phase order in doc 07. **Don't build GME screens until DAHC-UI v1 has been validated.**
3. Treat the playground as the place where UX signs off: every derived state is visible there with its "pending" marker.
4. Keep the existing D1 portal working throughout. It's the first real consumer and a free integration test.
