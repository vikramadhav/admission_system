# 4. Shared component inventory, with variants and states

Every component has a **tier**:

| Tier | Meaning | Action |
|---|---|---|
| **A** | Defined in the DH standard and needed by GME | Build to Figma |
| **B** | Needed by GME or by other components, but the DH design is incomplete (states missing, or only a GME frame or page example exists) | Build from the closest Figma source. Missing states are derived from the tokens and **listed for UX sign-off**. |
| **C** | Requested, but present in neither Figma file | **Not built** until it is designed (your instruction: don't invent components). A placeholder entry lists what design is needed. |
| **W** | Defined in DH but only for the public website, not needed by any current consumer | Deferred. Built when a consumer needs it. |

**Every** interactive component gets these states, even where Figma omits them:

- Default, hover, **focus-visible**, active, disabled.
- Error, for form controls.
- Loading, where it applies.

Behaviour follows the WAI-ARIA Authoring Practices for the listed pattern.

The column "Existing" refers to the current `frontend/projects/dahc-ui` code:

- **Rework:** the component exists but must be realigned to Figma.
- **New:** the component doesn't exist yet.
- **Merge:** the component exists but is absorbed into another component.

## 4.1 Foundations and core (not visual components)

| Item | Purpose | Tier | Existing |
|---|---|---|---|
| Tokens, themes, base styles, utilities | Section 3 | A | Rework |
| `DahcThemeService` | Sets `data-theme`, follows the system preference, remembers the choice | A | Keep |
| `dahc-icon` plus icon registry | Inline SVG icons from the DH set, sized by token, `aria-hidden` by default with an optional label | A | New |
| A11y primitives | Unique id, live announcer, **focus trap**, **focus restore**, roving tabindex, keyboard helpers | A | Partial (id and announcer exist) |
| Overlay primitive | Positioning for dropdowns, menus, tooltips and popovers (native `popover` and anchor positioning where available, with a small fallback). Dialogs use native `<dialog>`. | A | New |
| Form-control base | Shared `ControlValueAccessor` plumbing, ids, `aria-describedby` wiring, invalid state from `NgControl` | A | New |

## 4.2 Actions

| Component | Figma source | Variants | States | Pattern | Tier | Existing |
|---|---|---|---|---|---|---|
| **Button** `button[dahc-button]`, `a[dahc-button]` | Buttons `50:6786` | `variant`: primary (navy solid), secondary (navy outline), link, danger (red; solid **and** outline from GME), special-blue and special-green (DH "Special"). `size`: sm 36, md 44, lg 48. Leading and trailing icon. `block`. | default, hover, active, focus-visible, disabled, **loading** (new) | Native button or link | A | Rework |
| **Icon button** | `Type=4. Icon only` in `50:6786`; GME header icon buttons | `variant`: outline (DH), ghost (GME header, navy-100 fill). Sizes 40 and 48. Optional badge. | As for Button. **A required accessible label.** | Native button | A | New |
| **Button group / segmented control** | Chip toggle on Form Components (All / Individual / Corporate) | Single select | default, hover, selected, focus-visible, disabled | Radio group, styled as chips | B | New |
| Action menu (menu button) | None | n/a | n/a | Menu button | C | n/a |

## 4.3 Form components

| Component | Figma source | Variants | States | Pattern | Tier | Existing |
|---|---|---|---|---|---|---|
| **Form field** (label, hint, error, required marker, counter) | Built into Input field `50:7763`; GME label 13 Medium and helper 12 | Inline or stacked; optional and required | Error message linked through `aria-describedby` | n/a | B | New |
| **Text input** `input[dahc-input]` | Input field `50:7763`; GME inputs | `type`: text, email, tel, number, password. Leading and trailing icon. **Read-only verified** and **computed** (GME). | default, hover, **focus**, filled, disabled, read-only, success, error | Native input | A | New |
| **Textarea** | None. Derived from the Input field. | Auto-grow, counter | As for Input | Native textarea | B | New |
| **Select** (single) | Dropdown frames `50:12859` (not components) | With placeholder, with search | closed, open, hover, focus, selected option, disabled, error | Select-only combobox | B | Rework (`select` exists) |
| **Multi-select / combobox with search** | Dropdown frames; GME searchable multi-select `1:2394` | Chips or count summary; option checkboxes | closed, open, typing, no results, disabled, error | Combobox with listbox | B | New |
| **Search field** | Search `50:8605` (22 screen-specific variants) and suggestion panel `50:9125` | sm 48 and lg 64 heights, with and without suggestions | default, focus, typing, suggestions, no results | Combobox (when suggesting) or search input | A | New |
| **Checkbox** | Controls `50:7880` | With label and description; **indeterminate** (derived) | unchecked, checked, hover, focus, disabled, error | Native checkbox | A | New |
| **Radio group** | Controls `50:7880`; GME Yes/No ×40 | Horizontal or vertical | As for Checkbox | Radio group | A | New |
| **Date input** (typed DD/MM/YYYY with a calendar popup) | **Datepicker page `50:7957` is empty.** GME shows only the closed field with a calendar icon. | n/a | n/a | Date picker dialog | B for the typed field with a calendar icon; **C for the calendar popup** | New |
| Time picker | None | n/a | n/a | n/a | C | n/a |
| Switch / toggle | None | n/a | n/a | Switch | C | n/a |
| **Phone input** | GME "Phone number input" with a country selector | Country code select plus number | As for Input | n/a | B | New |
| **File upload** | DH "Upload" examples (Content Components); GME slot ×21 and file row | Dropzone slot; uploaded file row (name, size, preview, remove) | empty, drag-over, uploading (**derived**), uploaded, error: type or size (**derived**), disabled | Native file input with a button | B | New |
| Ranked selection | GME training-site chips | n/a | n/a | n/a | n/a | Review whether this belongs in the GME app (doc 02 §2.4) |

## 4.4 Data display

| Component | Figma source | Variants | States | Tier | Existing |
|---|---|---|---|---|---|
| **Card** | Cards `50:13532` (6 sets); GME panel | `variant`: panel (border, radius 16, GME), actionable (border, radius 12, hover `shadow-4`, DH), highlight (raised surface). Header, body and footer slots. | default, hover (actionable only), focus-visible (when it's a link) | A | Rework |
| **Tag** (informational / status) | Informational tag `50:7426` | `color`: the 8 DH purposes, mapped to semantic status (draft, submitted, success, warning, error, info, neutral). `size` L and M. Solid or outline. | Static | A | Rework (`badge` becomes `tag`) |
| **Chip** (selection / filter) | Functional chip `50:7519` | Selection or filter, removable, with icon. sm and md. | default, hover, selected, focus-visible, disabled (derived) | A | New |
| **Badge** (count / dot) | GME header notification badge | Count or dot | Static | B | Merge into the existing `badge` |
| **Key/value list** | GME Created/Submitted/Pay grid | Stacked, inline, or grid with N columns | Static | B | Rework (`detail-list`) |
| **Stat tile** | DH "Stats" band; GME score tiles | `color`: category colours | Static, or empty ("—") | B | New |
| **Accordion** | Accordion `50:17721` | Single or multiple expand | collapsed, expanded, hover, focus | A | New |
| **List** (simple and divided) | FAQ and list examples | With icon and with action | n/a | B | New |
| **Vertical stepper** | GME wizard stepper (the DH has nothing) | Linear; nested sub-steps; with or without numbers | upcoming, current, complete, **error** (derived), disabled | B | New |
| **Pagination** | Pagination `50:8044`; mobile "Page 1 of 10" | Full or compact | default, hover, current, focus, disabled | A | New |
| Table / data grid | Only a yes/no eligibility table example | n/a | n/a | **C.** Needs design for header, sorting, row states, empty and loading. | n/a |
| Avatar | None. The GME profile pill shows initials only. | n/a | n/a | C | n/a |
| Status indicator (dot plus label) | None separate. Status is shown with tags. | n/a | n/a | Covered by Tag | n/a |
| Carousel indicator | `50:8076` | n/a | n/a | W | n/a |

## 4.5 Navigation

| Component | Figma source | Variants | States | Tier | Existing |
|---|---|---|---|---|---|
| **App header** | Top navigation `50:10831` (9 variants); GME header | Signed in (GME) or public (DH); web, or mobile with hamburger. Slots for logo, nav, actions, language and profile. | Menu item hover and selected (4 px underline), focus | A | Rework |
| **Hamburger menu (mobile navigation)** | `50:10087` and Menu Item `50:10172` | Web or mobile; sub-menu expand | collapsed, expanded, selected | A | New |
| **Footer** | Bottom navigation `50:11045` (6 variants); GME footer | Web or mobile; link columns plus copyright band | Link hover and focus | A | New |
| **Breadcrumbs** | `50:9802` (Dark or Light background) | Optional home icon; truncation (derived) | link hover and focus, current page | A | New |
| **Tabs** | `50:9910` and `50:9930` | With or without icon; scrollable on mobile (derived) | active, inactive, hover (derived), focus, disabled (derived) | A | New |
| **Page banner** (header region) | DH banner examples; GME banner | Breadcrumb, title, subtitle or meta row, status tag, actions | Static | B | Rework (`page-header`) |
| **Wizard action bar** | GME sticky actions | Start-aligned and end-aligned action groups; sticky | Static | B | New |
| Sidebar navigation | None. The GME stepper covers wizard navigation. | n/a | n/a | C (staff screens may need it later) | n/a |
| Dropdown menu | Hamburger sub-menu only | n/a | n/a | C (see Action menu) | n/a |
| Mega menu, map navigation panel | `50:11262`, `50:22424` | n/a | n/a | W | n/a |

## 4.6 Feedback and overlays

| Component | Figma source | Variants | States | Pattern | Tier | Existing |
|---|---|---|---|---|---|---|
| **Dialog / modal** | DH Modal examples (success, leave-site warning; web and mobile); GME success dialog `1:5892` | Featured icon, title, body, details, action row. Sizes sm (400) and md (520). | open, closing | Native `<dialog>` with focus trap and restore | B | New |
| **Confirmation dialog** | DH leave-site warning | `tone`: neutral or danger | n/a | Alertdialog | B | New |
| **Alert / inline note** | GME Note ×10 (info) | info, success, warning, error; title, dismissible | Static | Status or alert role | B | Rework (`alert`) |
| **Toast** | GME ToastBanner (info and warning, dismissible) | info, success, warning, error; auto-dismiss | enter, exit | Live region | B | New |
| **Tooltip** | DH dark tooltip example | Top, bottom, start or end | shown on hover and focus, dismissed with Escape | Tooltip | B | New |
| **Loading indicator** | None. Spinner only inside buttons. | Spinner sm, md, lg | n/a | `role="status"` | B (minimal, derived) | Extract from the button |
| **Empty state** | GME first-time dashboard | Icon, title, text, action | Static | n/a | B | Rework (`empty-state`) |
| **Error state** | None | Same layout as the empty state, error tone | n/a | n/a | B (variant of the empty state) | New variant |
| Drawer | None | n/a | n/a | n/a | C | n/a |
| Skeleton, progress bar | None | n/a | n/a | n/a | C | n/a |

## 4.7 Counts

| Tier | Count | Components |
|---|---|---|
| A (build to Figma) | 16 | Button, icon button, input, search, checkbox, radio group, card, tag, chip, accordion, pagination, app header, hamburger menu, footer, breadcrumbs, tabs |
| B (build, with derived states for sign-off) | 24 | Button group, form field, textarea, select, multi-select, date input, phone input, file upload, badge, key/value list, stat tile, list, stepper, page banner, wizard action bar, dialog, confirmation dialog, alert, toast, tooltip, spinner, empty state, error state, plus the icon component |
| C (need design, not built) | 10 | Action/dropdown menu, time picker, switch, calendar popup, table, avatar, sidebar, drawer, skeleton, progress |
| W (website only, deferred) | 3 | Carousel indicator, mega menu, map navigation |

The existing `theme-switch` stays as a playground and development tool until dark mode is approved (D2). Visual specs for every Tier A and B item, with node ids, are in the [figma-extracts](figma-extracts/) files.
