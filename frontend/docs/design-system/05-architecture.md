# 5. Proposed Angular architecture, folder structure and playground

## 5.1 Principles

1. **Build on the existing workspace.** `frontend/` already has an Angular 22 workspace that follows the DAHC engineering standard (Part 2):
   - `dahc-ui`: an ng-packagr library.
   - `dahc-playground`: an app.
   - `dahc-portal`: an app.
   - Playwright and axe-core.

   No rewrite and no new framework.
2. **DAHC-UI depends only on Angular** (`@angular/core`, `common`, `forms`, `localize`). It doesn't use Angular CDK, a UI kit or a CSS framework (s.22).
3. **One-way dependencies:** portal → dahc-ui and playground → dahc-ui. The library never imports from an app.
4. **Every component can be copied on its own** (s.22): its folder holds the `.ts`, `.html` and stylesheet, and it depends only on tokens and `core/`.
5. **Consistent API vocabulary** across components (s.22):
   - `variant`, `size`, `disabled`, `invalid`, `label`, `readonly`, `loading`.
   - Outputs are past-tense or `xChange` events.
   - Signal `input()`, `output()` and `model()` throughout.
6. **No speculative abstraction.** A shared primitive is extracted only when a second component needs it.

## 5.2 Component conventions

| Concern | Convention |
|---|---|
| Declaration | Standalone and `ChangeDetectionStrategy.OnPush`. Selector `dahc-*` (element) or an attribute selector on native elements (`button[dahc-button]`, `input[dahc-input]`) so native semantics are kept. Class `Dahc*Component`. |
| Inputs and state | `input()`, `input.required()`, `model()` for two-way bindings, `computed()` for derived state. No `@Input` decorators. |
| Forms | Form controls implement `ControlValueAccessor` through a shared base in `core/forms`, so they work with typed reactive forms. `invalid` is read from `NgControl` automatically. Errors and hints are linked with `aria-describedby`. |
| Content | Content projection with named slots (`[dahcCardHeader]`) instead of configuration objects for markup. |
| Overlays | Native `<dialog>` for modal dialogs. The `popover` attribute plus a small positioning helper for menus, selects and tooltips. Focus trap and restore come from `core/a11y`. |
| Styling | `:host` plus BEM-style internal classes (`dahc-button__icon`). Only `var(--dahc-*)` semantic tokens; private `--_*` properties for per-variant values. Logical properties only. No `::ng-deep` and no `ViewEncapsulation.None`, except for the global base stylesheet. |
| i18n | Built-in text (for example "Remove", "Please wait") uses `$localize` with `@@dahcUi.<component>.<key>` ids. Everything else comes from the consumer. |
| Docs | A JSDoc block on every public input and output. A header comment with the Figma node id(s). |

## 5.3 Native CSS and SCSS (decision D1)

The engineering standard (s.21) requires the tokens to be defined as SCSS maps. You asked for native CSS. The recommendation satisfies both:

- **SCSS only as the token source.** `styles/tokens/*.scss` maps compile to plain `--dahc-*` custom properties in `dahc-ui.css`. This gives one source of truth and the standard is met.
- **Component stylesheets are native CSS** (`*.component.css`): custom properties, logical properties, native nesting, `:has()`, `:focus-visible`, container queries, `@media (prefers-reduced-motion)`. No Sass features in components.
  - The one exception is viewport breakpoints. Media queries can't read custom properties, so components use container queries (preferred) or literal `rem` values commented with the token name.

This needs either a small wording change to s.22 ("`.scss`" → "stylesheet"), or you can choose to keep `.scss` component files written in plain CSS syntax. Either option produces the same CSS.

## 5.4 Folder structure

```text
frontend/
├── angular.json                 # restored; currently ignored by the root .gitignore (D7)
├── docs/design-system/          # this analysis, then component specs
├── projects/
│   ├── dahc-ui/                 # the design system library (ng-packagr)
│   │   ├── ng-package.json
│   │   └── src/
│   │       ├── public-api.ts    # single entry point; standalone components tree-shake
│   │       ├── assets/
│   │       │   ├── fonts/       # Dubai WOFF2 (D6)
│   │       │   └── icons/       # SVGs exported from Figma, one file per icon
│   │       ├── styles/
│   │       │   ├── tokens/      # _primitives, _typography, _spacing, _radius, _elevation, _motion, _breakpoints, _z-index
│   │       │   ├── themes/      # _light.scss (Figma), _dark.scss (D2)
│   │       │   ├── base/        # _reset, _fonts, _typography (.dahc-text-*), _utilities, _focus
│   │       │   └── dahc-ui.scss # entry: emits :root tokens, themes, base
│   │       └── lib/
│   │           ├── core/
│   │           │   ├── a11y/    # unique-id, live-announcer, focus-trap, focus-restore, roving-tabindex
│   │           │   ├── forms/   # control-value-accessor base, form-field context
│   │           │   ├── overlay/ # popover positioning
│   │           │   ├── icon/    # dahc-icon + registry
│   │           │   └── theme/   # DahcThemeService
│   │           ├── actions/     # button, icon-button, button-group
│   │           ├── forms/       # form-field, input, textarea, select, multi-select, search, checkbox,
│   │           │                # radio-group, date-input, phone-input, file-upload
│   │           ├── data-display/# card, tag, chip, badge, key-value-list, stat-tile, accordion, list,
│   │           │                # stepper, pagination
│   │           ├── navigation/  # app-header, mobile-menu, footer, breadcrumbs, tabs, page-banner,
│   │           │                # wizard-action-bar
│   │           └── feedback/    # dialog, confirm-dialog, alert, toast, tooltip, spinner, empty-state
│   ├── dahc-playground/         # documentation and preview app (dev only, never deployed with the portal)
│   └── dahc-portal/             # GME candidate portal (consumer; not changed in DS phases except to keep it building)
└── tests/playwright/
    ├── playwright.config.ts
    ├── support/                 # axe helper, theme and direction helpers, viewport matrix
    └── specs/
        ├── playground/          # one spec per component + foundations
        └── portal/
```

Each component folder looks like this:

```text
lib/actions/button/
├── button.component.ts      # API + behaviour, Figma node ids in the header comment
├── button.component.html
├── button.component.css     # (or .scss, D1)
└── button.types.ts          # exported union types (DahcButtonVariant, …) when shared
```

Today's flat `lib/<name>` folders move into the groups. `public-api.ts` keeps the same export names, so the portal's imports from `'dahc-ui'` don't change.

## 5.5 Theming and extensibility

- `:root` carries the primitives and the light semantic tokens.
- `[data-theme="dark"]` (and any future brand theme) overrides **only semantic tokens**.
- A consuming app can add a theme in its own stylesheet without touching the library.
- `DahcThemeService` (it already exists):
  1. Sets `data-theme`.
  2. Follows `prefers-color-scheme` until the user chooses.
  3. Stores the choice in `localStorage`, which may hold display preferences only (s.24).
- RTL: `dir` on `<html>` is set by the app's locale. Components use logical properties, and directional icons (chevrons, arrows) are mirrored with `:dir(rtl)`.

## 5.6 Icons

- Icons are exported once from Figma as SVG into `assets/icons/` (outline, 1.5 px stroke, `currentColor`). They're rendered by `<dahc-icon name="chevron-down" />`.
- The registry is a typed map of names to SVG files, loaded on first use with `HttpClient` and cached. The name type comes from the registry, so a wrong name fails at compile time.
- Rendering never uses `innerHTML` on untrusted content (s.24). SVG files are library assets, and they're parsed with `DOMParser` and attached as nodes. This is reviewed against the Trusted Types CSP in Phase 2. The alternative is to inline the SVGs as Angular templates through a build script.
- Only the icons that components and consumers actually use are exported, not all 200.

## 5.7 Playground architecture

The `dahc-playground` app already exists. It has:

- One page per component.
- A property inspector, event log and theme and direction switchers.
- A source viewer that serves the component's real files, copied as build assets (s.22: snippets are never maintained by hand).

It is extended rather than replaced.

| Need | Design |
|---|---|
| Browse all components | Side navigation grouped as Foundations, Actions, Forms, Data display, Navigation and Feedback, with a filter box. Generated from one typed `PLAYGROUND_ENTRIES` registry, which also drives the routes. |
| Variants and states | Every page has a **state matrix**: all variants × sizes × states, rendered at once. Hover, active and focus are forced through a `data-force-state` attribute that is compiled only into the playground stylesheet. Each page also has a live, interactive preview driven by the inspector. |
| Tokens | Foundations pages for colour (primitives and semantic, with live contrast ratios), typography, spacing, radius, elevation, motion, breakpoints and icons (with search and copy name). All are rendered from the live custom properties, so they can't drift from the code. |
| Responsive preview | A viewport toolbar (320, 375, 768, 1024, 1280, full) resizes the preview frame. Container queries make components respond to the frame. |
| Copy examples | Tabs for **Usage HTML**, **TypeScript** and **CSS**, with a copy button. Usage examples are real files (`*.example.html` and `*.example.ts`) that are also rendered on the page, so an example that compiles is an example that works. The component's own source is shown as well. |
| Figma reference | Each page links the Figma node(s). An optional "compare" panel shows the Figma screenshot exported for that node next to the live render. |
| Accessibility notes | Keyboard map, ARIA pattern link and known limitations, per component. |
| Dev only, never in production | The playground is a **separate application** with its own build target. It isn't part of the portal bundle and has no route in the portal, so no development tooling can reach the portal's production build. It's served locally (`npm run start:playground`, port 4300) and can optionally be deployed as an internal documentation site behind access control. That deployment would be a separate decision. |

Why a separate app instead of a dev-only route in the portal: a route excluded with build file replacements still lives in the portal's source tree and risks leaking into production through a configuration mistake. A separate app makes that impossible. It also matches the existing workspace and standard s.19.

## 5.8 Quality gates per component (Definition of Done)

1. The API is documented, types are strict, there's no `any`, and lint passes with no warnings.
2. Figma node ids are cited. Derived states are listed in the component's "UX sign-off" note.
3. Tokens only. A lint check rejects raw hex, `rgb()` and `px` values in component stylesheets, except `0` and `1px` hairlines that use the border token.
4. It works in light and dark themes, LTR and RTL, at 320 px and at 200% zoom, in forced-colours mode, and with reduced motion.
5. There's a playground page with an inspector, a state matrix, copyable examples and accessibility notes.
6. There's a Playwright spec covering keyboard behaviour, ARIA states, form integration (for controls), axe WCAG 2.2 AA in both themes and directions, and 320 px reflow.
7. It's exported from `public-api.ts`, and the portal still builds.
