# Components ported from dubai-health-ui

Every element of `dubai-health-ui` (the Lit framework built from the same Dubai Health Figma; read-only reference in `Development/dubai-health-ui`) now has a DAHC-UI counterpart. Code was rewritten in Angular to DAHC-UI's conventions (standalone, OnPush, signals, semantic tokens only, RTL, WAI-ARIA APG keyboard patterns, `$localize` strings), not wrapped. The 2026-11-12 port added about 50 components in five groups. Each group is exported through `projects/dahc-ui/src/lib/ported/<group>.ts`, has its own playground navigation group, and has a Playwright spec `tests/playwright/specs/playground/port-<group>.spec.ts` (keyboard and ARIA, axe WCAG 2.2 AA in light/dark × LTR/RTL, 320 px reflow).

Elements that already existed under another name were not duplicated: `dh-collapse` → `dahc-accordion`, `dh-descriptions` → `dahc-detail-list`, `dh-card` → `dahc-card`, `dh-list` → `dahc-list`, `dh-empty` → `dahc-empty-state`, `dh-upload` → `dahc-file-upload`, the action mode of `dh-menu` → `dahc-menu`, and `dh-steps`, `dh-tabs`, `dh-calendar`, `dh-date-picker`, `dh-modal`, `dh-drawer`, `dh-tooltip`, `dh-tag`, `dh-switch`, `dh-table`, `dh-pagination`, `dh-breadcrumb`, `dh-select`, `dh-checkbox`, `dh-radio-group`, `dh-input` / `dh-textarea` (form field), `dh-button`, `dh-badge`, `dh-alert`, `dh-icon`.

## Open items and decisions

| Item | Detail | Status |
|---|---|---|
| Link colour on the page background | `blue-link` (#037BC5) is 4.52:1 on white but 4.0:1 on the page background `#ECF2F5`. | **Done (owner approved):** new primitive `blue-link-strong` #026DAE for `text-link` (5.5:1 white, 4.9:1 page, 4.6:1 Blue/200 banner). The focus ring keeps #037BC5. |
| Features the existing components lack | `dahc-detail-list`: bordered variant, heading, projected items. `dahc-list`: bordered frame, avatar and action slots. `dahc-card`: static elevated shadow. | **Approved:** being added (see "Alignment: data display"). |
| Theme-independent colours | QR code and carousel need "always light / always dark" roles. | **Done (owner approved):** semantic roles `static-dark` (navy) and `static-light` (white), same in both themes; QR code and carousel use them. |
| xxl breakpoint | `dahc-col` supports xxl (90rem). | **Done (owner approved):** `xxl: 90rem` added to the breakpoint scale and the playground's breakpoint list. |
| Design sign-off | Every ported component follows the dubai-health-ui look; none has its own DH Figma frame. | **Approved** by the owner (2026-11-12). |
| Disabled and muted opacity | dubai-health-ui fades disabled controls to 50%; button, carousel and table used raw opacity values. | **Done:** scale `--dahc-opacity-disabled` (0.5) and `--dahc-opacity-muted` (0.4); no raw opacities remain. |
| Popup border | dubai-health-ui popups use navy-700; DAHC used navy-200. | **Done:** semantic role `border-popup` (navy-700 light, navy-dark-600 dark) on the global `.dahc-popup`. |

## Feedback

| dubai-health-ui | DAHC-UI | Notes |
|---|---|---|
| dh-progress | `dahc-progress` (`feedback/progress`) | Line as in the original; circle type, `size` and `status` (success / error colours) are DAHC additions. role="progressbar". |
| dh-spinner | `dahc-spinner` (`feedback/spinner`) | Same sizes (20 / 32 / 48px) and reduced-motion slow-down; role="status" with a visually hidden label. |
| dh-skeleton | `dahc-skeleton` (`feedback/skeleton`) | Same shapes and shimmer; adds a visually hidden role="status" label and aria-busy on the host. |
| dh-result | `dahc-result` (`feedback/result`) | Same icons and layout; `headingLevel` (1 to 3) added so a result can be the page h1. Actions are projected content. |
| dh-message + `message()` | `DahcMessageService` + `dahc-message-region` (`feedback/message`) | Top-centre pills; adds pause on hover and focus and a dismiss button when duration is 0. |
| dh-notification + `notify()` | `DahcNotificationService` + `dahc-notification-region` (`feedback/notification`) | White card; a status icon replaces the 4px status edge (owner decision: no thick start edge). Placed below the 80px header like the toast region; pause on hover and focus. |
| dh-popover | `dahc-popover` + `[dahcPopoverTrigger]` (`feedback/popover`) | Popover API and `dahcPositionFloating`; shared `DahcPopupBase`. |
| dh-popconfirm | `dahc-popconfirm` (`feedback/popover`) | role="alertdialog" named by the question and described by the content; confirm button focused; uses `dahc-button`. |
| dh-config-provider | `dahc-config-provider` + `provideDahcConfig()` / `DAHC_CONFIG` (`core-ported/config`) | Subtree lang / dir / zero motion tokens, plus app-wide defaults applied to `<html>`. |

dh-toast compared with the existing `dahc-toast-region` (unchanged): dubai-health-ui has no separate toast element; `notify()` creates dh-notification cards (white, 4px status edge, tinted round close, 16px from the top, region role="region" named "Notifications"). `dahc-toast-region` is the GME ToastBanner variant: status-tinted surface with a status icon, below the app header, a permanent polite list, error toasts as role="alert", and timers that pause on hover and focus.

## Data display

Ported 2026-11-12 from `packages/components/src/display/dh-data-display.ts`, `display/dh-tree.ts`, `avatar/dh-avatar.ts` and `utility/dh-config.ts` (watermark, QR code). Playground group "Data display"; spec `tests/playwright/specs/playground/port-display.spec.ts`.

| dubai-health-ui | DAHC-UI | Notes |
|---|---|---|
| dh-avatar | `dahc-avatar` | sm 32 / md 40 / lg 48 (space tokens); `dahcInitials()` exported; photo falls back to initials. DERIVED. |
| dh-image | `dahc-image` + `dahc-image-preview` | Preview is a native modal dialog on `DahcDialogBase` (Escape, backdrop, close button, focus return). Radius `lg`/`md`/`none` instead of `16`/`8`/`0`. |
| dh-carousel | `dahc-carousel` + `dahc-carousel-slide` | APG carousel: adds a pause / play button when it rotates (dubai-health-ui only paused on hover / focus); no rotation for reduced motion. Uses the footer colour roles for the always-dark frame. |
| dh-comment | `dahc-comment` | Slots `[dahcCommentActions]`, `[dahcCommentReplies]`; adds `datetimeValue` for a machine-readable time and `avatarSrc`. |
| dh-timeline, dh-timeline-item | `dahc-timeline`, `dahc-timeline-item` | Adds a spoken status per item and `aria-current="step"` on the current event. |
| dh-tree | `dahc-tree` | APG tree view; `value` and `expanded` are two-way models, `nodeSelected` output; key and click handling on the host. |
| dh-qr-code (internal/qr.ts) | `dahc-qr-code`, `[dahcQrIcon]`, `dahcEncodeQr()` | Centre logo marked with the `dahcQrIcon` directive (replaces the `icon` slot). Encoder ported unchanged (Nayuki structure, MIT). Uses the primitives `--dahc-navy` / `--dahc-white` so the code stays dark-on-light in every theme. |
| dh-watermark | `dahc-watermark` | Colour is primary text at 12% and repaints on theme change; not drawn in forced colours. |
| dh-statistic | `dahc-statistic` | DH Stats style; `value` accepts a number or text. The coloured GME score tile stays `dahc-stat-tile`. |

Already in DAHC-UI under another name (not changed): dh-descriptions → `dahc-detail-list`, dh-card → `dahc-card`, dh-list → `dahc-list`, dh-collapse → `dahc-accordion`. Features the Lit versions have that DAHC-UI lacks:

- dh-descriptions: a `bordered` variant (framed grid with row dividers), an optional `heading`, and projected items besides the `items` array.
- dh-list: a `bordered` frame, a leading `avatar` slot and an `actions` slot (dahc-list has an icon and one aside slot).
- dh-card: an `elevated` (static shadow) option; dahc-card only shadows the actionable variant on hover.
- dh-collapse: equivalent to dahc-accordion (`accordion` = single open, which is dahc-accordion's default).

Token needs: a theme-independent "always light" / "always dark" pair (QR code, carousel controls, image preview scrim) instead of primitives or footer roles.

## Layout

| dubai-health-ui | DAHC-UI | API | Differences |
|---|---|---|---|
| `dh-flex` | `dahc-flex` | `vertical`, `wrap`, `gap` (`none`/`sm`/`md`/`lg`), `justify`, `align`; `--dahc-flex-gap` | none |
| `dh-space` | `dahc-space` | as flex, defaults `gap="sm"`, `align="center"`; `block`; `--dahc-space-gap` | none |
| `dh-row` | `dahc-row` | `gutter` (default `lg`, 24px), `verticalGutter`, `justify`, `align`, `wrap` (default true) | gutter shared through `--dahc-row-gutter` |
| `dh-col` | `dahc-col` | `span`, `offset`, `xs`…`xxl`, `xsOffset`…`xxlOffset` (numbers of 24) | camelCase offsets (`mdOffset`, not `md-offset`); `span="0"` hides the column, but a responsive 0 only collapses its width |
| `dh-layout` | `dahc-layout` | content projection; becomes a row when it directly contains a `dahc-sider` | none |
| `dh-header` | `dahc-header` | `label` (names the landmark) | added `label`; padding 16 / 64 from md (container margin) |
| `dh-content` | `dahc-content` | `landmark` (default true: renders `main`) | added `landmark` so a layout can sit inside another main region |
| `dh-footer` | `dahc-layout-footer` | `label` | renamed (dahc-footer is the Dubai Health footer); links take the footer colour through the link tokens |
| `dh-sider` | `dahc-sider` | `collapsed` (model), `collapsible`, `breakpoint` (`sm`…`xxl`), `label`, `expandLabel`, `collapseLabel`; output `collapseChange` | labels localised; the chevron uses dahc-icon (mirrors in RTL) |
| `dh-divider` | `dahc-divider` | `vertical`, `label`, `decorative` | the text is an input; a labelled divider is not a separator (a separator would hide its text); `decorative` adds aria-hidden |
| `dh-splitter` | `dahc-splitter` | `layout` (`horizontal`/`vertical`); output `resized` (sizes in %) | none |
| `dh-splitter-panel` | `dahc-splitter-panel` | `size` (model, %), `min`, `max`, `resizable`, `label` | handle adds `aria-controls` to its pane; `resized` is emitted per step, not again at the end of a drag |
| `dh-affix` | `dahc-affix` | `offsetTop` (px); output `affixedChange` | pinned state adds shadow 1 (DERIVED) |

Tokens: DH space scale sm/md/lg = `--dahc-space-2/4/6`; header 96px = 2 × control-lg; sider 256px = 4 × space-16, collapsed 80px = control-lg + space-8; splitter handle = space-2. Media queries carry the breakpoint values (xxl 90rem is the dubai-health-ui extra breakpoint; DAHC-UI tokens stop at xl). Playground: Layout group (affix, divider, flex, grid, layout, space, splitter); spec `tests/playwright/specs/playground/port-layout.spec.ts`.

## Navigation

| dubai-health-ui | DAHC-UI | API |
|---|---|---|
| `dh-link` | `a[dahc-link]` (`DahcLinkComponent`) | `variant` blue / navy, `size` lg / md / sm, `iconStart`, `iconEnd`, `target`, `rel` (`_blank` adds `noopener noreferrer`) |
| `dh-anchor`, `dh-anchor-link` | `dahc-anchor`, `dahc-anchor-link` | anchor: `label`, `offsetTop`, `container` (selector), `[(current)]`; link: `href`, `heading`, nested links for sub-sections |
| `dh-dropdown` (+ `dh-menu actions`) | `dahc-dropdown` + `[dahcDropdownTrigger]` + `[dahcDropdownItem]` | `label`, `placement`, `(itemSelected)`; items: value (directive input), `disabled`, `danger` |
| `dh-menu`, `dh-menu-item`, `dh-sub-menu` (navigation) | `dahc-nav-menu`, `dahc-nav-menu-item`, `dahc-nav-sub-menu` | menu: `mode` horizontal / vertical, `label`; item: `route` or `href`, `selected`, `disabled`, `icon`; sub-menu: `heading`, `[(open)]` |
| `dh-float-button` | `dahc-float-button` | `label` (name and tip), `icon`, `href`, `variant` primary / default, `placement` end / start, `inline`; listen to `(click)` |
| `dh-back-top` | `dahc-back-top` | `label`, `visibilityHeight` (400), `target` (selector), `variant`, `placement`, `inline`, `(backToTop)` |

Differences from the Lit originals:

- **Action menus:** `dh-menu actions` is not ported as a mode of the navigation menu. DAHC-UI already has `dahc-menu` (button plus item list); `dahc-dropdown` covers a menu opened from your own trigger with your own button or link items.
- **Dropdown items are your elements:** the Lit dropdown slots a `dh-menu`; the Angular one uses directives on the trigger and on each item, so routing links and buttons keep their native behaviour. Its styles are not view-encapsulated (BEM-scoped) so projected items can be styled.
- **Navigation menu items:** routing through `route` (RouterLink) as well as `href`. The vertical current item uses a 2px start border (with matching padding) instead of an inset box-shadow, so it mirrors in RTL without a separate rule.
- **Anchor:** at the end of the scroll range the last section becomes active, because a short last section can never reach the offset line (the Lit original keeps the previous one). `dh-affix` lives in the same Lit file but belongs to the Layout group.
- **Float button:** the icon is a DAHC icon name (`icon` input) instead of slotted content; back to top uses `gov-arrow-up`.
- **Link contrast:** the blue link token (`blue-link` #037BC5) is 4.5:1 on white surfaces but about 4.2:1 on the page background (#ECF2F5). The playground shows links on a white surface; use navy links on the page background until the token is reviewed.

## Data entry

Sources: `form/dh-form-controls.ts`, `entry/dh-range.ts`, `entry/dh-picker.ts`, `entry/dh-transfer.ts`, `entry/dh-mention.ts`, `display/dh-data-display.ts` (segmented). All are Angular form controls (`DahcFormControl` + `provideDahcValueAccessor`), work with Reactive Forms, and use semantic tokens only. Playground group "Data entry"; spec `tests/playwright/specs/playground/port-entry.spec.ts` (all four display modes, axe, 320 px).

| dubai-health-ui | DAHC-UI | Form value | Notes |
|---|---|---|---|
| dh-input-number | `dahc-input-number` | `number \| null` | Native number input (spinbutton), clamped on commit; steppers out of the tab order |
| dh-slider | `dahc-slider` | `number` or `[low, high]` with `[range]` | WAI-ARIA slider thumbs, RTL-aware keys, marks, unit, value tooltip |
| dh-rate | `dahc-rate` | `number` (0 = none) | Radio group with roving tab stop; `[readonly]` renders an image with a text alternative |
| dh-segmented | `dahc-segmented` | `string` | Native radios on one track; differs from `dahc-button-group` (separate chips) |
| dh-time-picker | `dahc-time-picker` | `"HH:MM"` | Native time input in the DH field |
| dh-auto-complete | `dahc-auto-complete` | `string` | Combobox with list autocomplete; any text allowed |
| dh-cascader | `dahc-cascader` | `string[]` path | Columns of listboxes; focus stays on the field (aria-activedescendant) |
| dh-tree-select | `dahc-tree-select` | `string` | Own flat WAI-ARIA tree (aria-level) in the popup; does not depend on the separately ported tree |
| dh-color-picker | `dahc-color-picker` | `"#rrggbb"` | Presets are DAHC palette primitives read from `--dahc-<name>`, or hex values |
| dh-transfer | `dahc-transfer` | `string[]` (target) | Two multi-select listboxes, select-all, search, `(moved)` output; stacks below 33rem of its own width |
| dh-mention | `dahc-mention` | `string` | Textarea combobox; `(mentioned)` output |
| dh-form | `dahc-form-layout` | — | Layout only (1 or 2 columns from 48rem); dh-form's submit handling is left to Angular forms |
| dh-upload | — | — | Not ported: `dahc-file-upload` already covers it |

Deviations from dubai-health-ui:
- Built-in strings are `$localize` (`@@dahcUi.<component>.*`) and overridable inputs.
- Option popups share `forms/entry-popup/entry-options.css` and the global `.dahc-popup` panel.
- Checkbox boxes in the transfer use the GME checkbox look (slate border, navy with a white tick), not the DH blue tick.
- dh-mention reads `dh-option` children; `dahc-mention` takes an `[options]` array.

No token or core changes were needed. Pending UX sign-off: every design in this group is DERIVED except segmented (PARTIAL, Selection chip).

## Alignment: actions, feedback and navigation

Existing DAHC-UI components compared with their dubai-health-ui counterparts (Lit CSS) and aligned. Public APIs, selectors, roles and accessible names are unchanged.

| Component | Changed to match dubai-health-ui | Kept different, and why |
|---|---|---|
| Button | Disabled = the variant's own colours at 50% opacity (was grey disabled tokens). Outline navy: Active equals Default (was a darker fill). | Danger and danger-outline variants (GME needs them; dh has none). |
| Icon button | — | dh has no icon-only button; stays on the DH Figma icon button. |
| Button group | — | dh-segmented is ported separately as `dahc-segmented`; the button group stays on DH Figma. |
| Badge | 20px pill (was 16), Bold 12/16 (was 10), 6px sides, 2px surface ring. | Red uses the tag-error hue with on-hue text (as before). |
| Breadcrumbs | Separators take the link colour, as dh-breadcrumb. | Current page on light surfaces stays text-secondary (A11y fix). On navy (light tone) links and current page stay inverse text: dh's blue / pale navy pair fails 4.5:1 on the dark-theme inverse surface. |
| Empty state | Unboxed, 24px padding, 8px gap, dh tray drawing (64x48), Bold 16 title, Regular 14 hint (was a dashed box, CSS document and 22px heading). | Real h2/h3 heading (dh uses a paragraph); drawing line uses border-default (no navy-300 role). |
| Footer | Spacing of dh-footer / Figma 50:11046: 40px top and bottom on small screens; 64px top, 48px bottom and 40px between rows from 1024px. | Sides keep the shared 24px content edge (owner decision; dh uses 64px). |
| Toast | Card as dh notify(): white surface, 1px navy-100 border, radius 12, Shadow 4, status-coloured icon, secondary-colour message, 28px round close button in the status tint. | No 4px status edge (owner decision); placed top-end below the header (owner decision). |
| Alert | Already aligned (tint, 1px border, radius 8, 24px icon, Bold 16 / Regular 14); comment updated. | No 4px start edge (owner decision). |
| App header | Already matches dh-header (80px bar, subtle bottom border). | dh-header is a generic 96px shell (ported as `dahc-header`); the GME header keeps logo tile overhang, navigation and tools. |
| Page header | — | dh has no page banner. |
| Modal, drawer, tooltip, menu, tag, pagination, steps, tabs | Checked against dh (modal radius 20, padding 40, close 36, scrim 45%); they were ported from dubai-health-ui earlier and still match. | — |

## Alignment: data display

Existing DAHC-UI components brought in line with dubai-health-ui. Everything is additive: existing inputs, outputs, roles and accessible names are unchanged, so the portal needs no change.

| dubai-health-ui | DAHC-UI | Change |
|---|---|---|
| `dh-card elevated` | `dahc-card [elevated]` | New input: DH Shadow 3 instead of the border, on every variant. The default stays the GME panel (radius 16, 1 px border, no shadow). |
| `dh-descriptions heading` | `dahc-detail-list [heading]`, `[headingLevel]` (2–4, default 3) | New: optional heading above the list. |
| `dh-descriptions bordered` | `dahc-detail-list [bordered]` | New: navy-100 frame, radius 12, no gaps, each pair padded 12/16 with a navy-100 line, label 14/18, value Bold 16/20 (the dh-descriptions look). Without it the GME key/value grid (label 12, value Medium 16) is kept. |
| `dh-descriptions` slotted items | `<div dahc-detail-item label="…">value</div>` | New child component (`DahcDetailItemComponent`) for rich values, projected after any `items`. Its host is the `div` a description list allows around `dt`/`dd`. |
| `dh-list bordered` | `dahc-list [bordered]` | New: navy-100 frame, radius 12; implies dividers. |
| `dh-list-item` avatar / actions slots | `[dahcListAvatar]`, `[dahcListActions]` on `dahc-list-item` | New slots; `[dahcListAside]` and the `icon` input still work. |
| `dh-list-item` look | `dahc-list-item` | Restyled to the DH row: 16 px padding and gap, centred row, title Bold 16, description 14 hint. |
| `dh-collapse` | `dahc-accordion` | Already matched (62 px header, padding 16, gap 12, blue-100 icon disc, bold title): no change. |
| `dh-statistic` | `dahc-stat-tile` | Already uses the DH stat type role and tabular numbers; GME tile colours kept. `dahc-statistic` is the separate port of dh-statistic. |

Tests: `tests/playwright/specs/playground/align-display.spec.ts` (heading, bordered and projected pairs, bordered list with avatars and named actions, elevated card; axe in every display mode; 320 px reflow).

## Table: fixed columns and scrolling

`dahc-table` gains the fixed-column behaviour of NG-ZORRO's table (`nzScroll`, `nzLeft` / `nzRight`) and the look of dubai-health-ui `dh-table`. The API is backward compatible.

| NG-ZORRO | DAHC-UI |
|---|---|
| `[nzScroll]="{ x: '1300px' }"` | `scrollX="1300px"`: the table's minimum inline size; the labelled, focusable scroll region scrolls horizontally |
| `[nzScroll]="{ y: '320px' }"` | `scrollY="320px"`: maximum height of the scroll region; the header row sticks to its top |
| `nzLeft` / `nzRight` on `th`/`td` | column `fixed: 'start' \| 'end'` (logical, so it mirrors in RTL) |
| `nzWidth` | column `width` (CSS length); **required on fixed columns**, because sticky offsets are the sum of the widths before them |
| `nzEllipsis` | column `ellipsis: true` (one line, full text in the title) |

- When any column is fixed at the start, the selection column is fixed too.
- The shadow on the inner edge of the fixed block shows only while content is scrolled under it (scroll position tracked in LTR and RTL; `scrollLeft` is negative in RTL).
- Sticky cells use the current row background (hover, striped, selected) so content never shows through.
- Restyled to dh-table: radius 12, 12/16 cell padding instead of fixed 48 px rows, row dividers on cells, navy text, `border-collapse: separate` (needed for sticky cells).
- Playground: Table page, "Fixed columns and scroll" (12 columns, 30 rows). Spec: `tests/playwright/specs/playground/table-fixed.spec.ts`.

## Alignment: forms

Existing DAHC-UI form components compared with dubai-health-ui (`internal/styles/field.ts`, `popup.ts`, dh-input, dh-textarea, dh-select, dh-checkbox, dh-radio, dh-switch, dh-calendar, dh-date-picker, dh-upload). The two already share the Figma Input field values: label Regular 14/18, 6px gaps, radius 12, value Regular 16/20, hint Medium 12/16 navy-700, hover border navy-700, success and error tints, navy-100 disabled box. Public APIs, selectors, roles and accessible names are unchanged; the portal needed no change (portal and candidate specs pass).

| Component | Changed to match dubai-health-ui | Kept different, and why |
|---|---|---|
| `dahc-form-field` + `dahcInput` | 2px focus ring (offset 2) around the field box while the control has focus (dh `.field:focus-within`); new `showCount` input: "length / maxlength" counter at the end of the hint row, included in `aria-describedby` (dh-textarea `show-count`). | Height 48px (GME Figma and DAHC Figma reading; dh uses 52px for the same node, unverified while Figma is rate-limited). Default border navy-600 (`border-control`, GME Figma #6685A3) instead of dh navy-700. Error text red (`error-text`, decision D4, passes AA) instead of dh's provisional navy. Required marker and error icon kept (accessibility). |
| `dahc-select` | — | Native `<select>`: keeps the platform list, mobile pickers and the portal's tests; dh draws a custom listbox. Trigger look already matches. |
| `dahc-multi-select` | Options Regular 16/20 (was 14); search box gets the focus ring. | Popup border uses the global `.dahc-popup` (navy-200) — dh uses navy-700; the global popup style is shared with other components (out of scope here). |
| `dahc-checkbox` | Label turns bold while checked (dh-checkbox). | Box 20px, 2px slate border, navy with a white tick (owner decision; dh: 18px box). |
| `dahc-radio-group` | — | 20px ring, slate border, 10px navy dot, bold labels (owner decision; dh: 12px dot, regular labels). |
| `dahc-switch` | — (geometry 44×24, thumb 18, navy/navy-700 track already match) | Disabled uses navy-100 / navy-400 colours; dh fades the whole switch to 0.5 opacity, and DAHC has no opacity token. |
| `dahc-calendar`, `dahc-date-picker` | — (ported from dh earlier; identical) | — |
| `dahc-file-upload` | Hover now darkens the border and tints the zone like dragging (dh-upload `.zone:hover`). | GME Figma slot: 2px dashed navy-600, "Choose file" pill, uploaded row with Preview (dh: 1px dashed drop zone with a file list). |
| `dahc-search`, `dahc-phone-input`, `dahc-ranked-selection` | — | No dh counterpart (dh only uses search inside its select and transfer). |

Token or global-style needs: an opacity token for disabled controls (dh `--dh-button-disabled-opacity: 0.5`); the global `.dahc-popup` border colour (navy-700 in dh).
