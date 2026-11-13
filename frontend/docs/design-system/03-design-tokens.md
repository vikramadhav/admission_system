# 3. Proposed DAHC-UI design tokens

Every value comes from the DH standard (node ids are in [figma-extracts/dh-foundations.md](figma-extracts/dh-foundations.md)) unless it is marked one of these ways:

- **DAHC proposal:** Figma doesn't specify the value, so it is proposed here for consistency and needs UX sign-off.
- **A11y fix:** the Figma value fails WCAG 2.2 AA, so a compliant value is proposed and needs UX sign-off.

## 3.1 Token model

There are three layers. **Components use only the semantic layer.**

| Layer | Example | Defined where | Who uses it |
|---|---|---|---|
| Primitive | `--dahc-navy-800: #335c85` | `styles/tokens/_primitives.scss`, a one-to-one copy of the Figma variables | Semantic tokens only |
| Semantic | `--dahc-color-text-secondary: var(--dahc-navy-800)` | `styles/themes/_light.scss` (and other themes) | Components, apps |
| Component (private) | `--_button-bg` inside `button.component.css` | The component's own stylesheet | That component only |

- A theme is a set of semantic-token overrides under `[data-theme="<name>"]` (standard s.21). Changing a theme never requires a component change.
- Naming: `--dahc-<category>-<role>[-<variant>][-<state>]`, all in kebab-case. Primitive names follow the Figma names with their numbering removed (`Secondary Tints/1. Blue/200` becomes `--dahc-blue-200`).

## 3.2 Primitive colours (from Figma `Colors 50:2565`)

| Primitive | 900 | 800 | 700 | 600 | 500 | 400 | 300 | 200 | 100 | Base |
|---|---|---|---|---|---|---|---|---|---|---|
| navy | #1A4775 | #335C85 | #4D7094 | #6685A3 | #8099B2 | #99ADC2 | #B2C2D1 | #CCD6E0 | #E5EBF0 | #002F70 |
| blue | | | | | #5BBFFD | #84CFFD | #ADDFFE | #D6EFFE | #EBF7FF | #32AFFC |
| light-blue | | | | | #92E4FD | #ADEBFD | #C9F2FE | #E4F8FE | #F1FCFF | #77DEFC |
| green | | | | | #B7FFC9 | #C9FFD7 | #DBFFE4 | #EDFFF1 | #F6FFF8 | #A5FFBC |
| orange | | | | | #FBC970 | #FCD794 | #FDE4B7 | #FEF1DB | #FEF8ED | #FABC4C |
| red | | | | | #FFA5A1 | #FFBCB9 | #FFD2D0 | #FFE9E8 | #FFF4F3 | #FF8F8A |
| purple | | | | | #BDB1FF | #CDC4FF | #DED8FF | #EEEBFF | #F7F5FF | #AC9DFF |
| pink | | | | | #F2CCE8 | #F5D8EE | #F9E5F4 | #FCF2F9 | #FDF9FC | #EFBFE2 |
| blue-black | | | | | #3B4F63 | #6C7B8A | #9DA7B1 | #CED3D8 | #E6E9EB | #0A233C |

Also: `white` #FFFFFF and `page` #ECF2F5 (`Primary/Page background`).

The following aren't in Figma but are required by the a11y fixes in 3.3. They are proposed additions to the palette:

| Token | Value | Status |
|---|---|---|
| `blue-link` | **#037BC5** | Already selected by the Figma annotation `50:7083` (4.52:1 against white) |
| `red-strong` | #B42318 | **A11y fix** |
| `green-strong` | #0B5A2A | **A11y fix** |
| `orange-strong` | #6B4100 | **A11y fix** |

The three "strong" values are the current `dahc-ui` values, so the portal's look doesn't change for these roles.

## 3.3 Semantic colours, light theme

The contrast ratio is shown against the surface the token is normally used on.

| Semantic token | Value | Figma basis | Contrast |
|---|---|---|---|
| **Surfaces** | | | |
| `color-background` | page #ECF2F5 | "Screen background only", Elevation Base | n/a |
| `color-surface` | white | Surface | n/a |
| `color-surface-raised-1` | blue-100 #EBF7FF | Elevation 1 | n/a |
| `color-surface-raised-2` | light-blue-100 #F1FCFF | Elevation 2 | n/a |
| `color-surface-highlight` | blue-200 #D6EFFE | "Highlight section background", GME banner | n/a |
| `color-surface-muted` | navy-100 #E5EBF0 | Chip background, read-only input (GME) | n/a |
| `color-surface-inverse` | navy #002F70 | Footer, primary button | n/a |
| **Text** | | | |
| `color-text-primary` | navy #002F70 | Headings, labels | 12.8 on white, 11.3 on background |
| `color-text-secondary` | navy-900 #1A4775 | "Subtexts" | 9.5 |
| `color-text-tertiary` | navy-700 #4D7094 | Card subheading | 5.2 on white, 4.6 on background |
| `color-text-placeholder` | navy-700 #4D7094 | **A11y fix:** Figma uses navy-500 #8099B2 (2.95:1) | 5.2 |
| `color-text-disabled` | navy-400 #99ADC2 | "Disabled elements" (exempt from contrast) | 2.3 (exempt) |
| `color-text-inverse` | white | "On dark background" | 12.8 on navy |
| `color-text-link` | blue-link #037BC5 | Annotation `50:7083` | 4.52 on white. **4.0 on background and 3.8 on highlight, which fail AA,** so links on tinted surfaces use `color-text-primary` with an underline. |
| **Borders** | | | |
| `color-border-subtle` | navy-100 #E5EBF0 | Dividers, surface outlines | Decorative |
| `color-border-default` | navy-200 #CCD6E0 | Card outline, chip outline | Decorative |
| `color-border-control` | navy-600 #6685A3 | GME input border. **A11y fix:** the DH 0.5 px #8099B2 is 2.95:1. | 3.85 on white (≥ 3 for non-text) |
| `color-border-strong` | navy #002F70 | Outline button | 12.8 |
| **Actions** | | | |
| `color-action-primary` / `-hover` / `-active` | navy / navy-800 / navy-900 | Button Default / Hover / Active | White text: 12.8 / 7.0 / 9.5 |
| `color-action-danger` / `-hover` | red-strong / (DAHC proposal) | **A11y fix:** the Figma red #FF8F8A with white text is 2.2:1 | 6.6 |
| `color-action-disabled-bg` / `-fg` | navy-100 / navy-400 | Replaces "opacity 0.5" so the result stays predictable on any surface | Exempt |
| **Focus** | | | |
| `color-focus-ring` | blue-link #037BC5 | **DAHC proposal:** Figma has no focus state | 4.5 on white, 4.0 on background (≥ 3) |
| **Feedback** (surface / border / text / icon) | | | |
| `color-info-*` | blue-200 / blue / navy / navy | Info note (GME) | Text 10.8 |
| `color-success-*` | green-100 / green / green-strong / green-strong | "Success message background" | Text 8.2 |
| `color-warning-*` | orange-200 / orange / orange-strong / orange-strong | "Notification banners" | Text 7.9 |
| `color-error-*` | red-200 / red-strong / red-strong / red-strong | "Error message". **A11y fix:** the Figma red as text is 2.2:1. | 5.7 |
| **Categorical** (tags, tiles) | | | |
| `color-category-{blue, light-blue, green, orange, red, purple, pink}-{surface, border}` | 200 tint / base hue | Informational tags, GME score tiles | Text is always navy (≥ 5.8) |

<a id="contrast"></a>Contrast was computed with the WCAG 2.x relative-luminance formula. Every A11y fix above is needed to meet the standard's WCAG 2.2 AA requirement (s.21, s.22).

## 3.4 Dark theme

**Figma defines no dark mode.** Standard s.21 requires the library to ship light and dark themes. The options are in decision D2 (doc 06):

- **(a) Recommended:** ship the light theme exactly as Figma defines it. Also ship a DAHC-derived dark theme built only by remapping the semantic tokens. It is marked "not designed" in the playground until UX approves it.
- **(b)** Ship light only, and record a standards exception.

## 3.5 Typography

**Family:** `--dahc-font-family-base: 'Dubai', 'Noto Sans Arabic', system-ui, sans-serif`. The fonts are self-hosted WOFF2 files (Regular 400, Medium 500, Bold 700) in `dahc-ui/src/assets/fonts`, because the CSP rules out font CDNs. Licence and files are tracked as decision D6. Numerals use `font-variant-numeric: lining-nums proportional-nums`.

**Type roles.** Each role is a token group (`--dahc-type-<role>-size | -line-height | -weight | -transform`) and a utility class `.dahc-text-<role>`. Mobile values apply below the `md` breakpoint.

| Role | Desktop (Web/*) | Mobile (Mobile/*) | Figma style |
|---|---|---|---|
| `display` | 60/64 Bold | 32/40 Bold | Display 1 |
| `stat` | 60/80 Bold, uppercase | 36/36 Bold, uppercase | Stats |
| `heading-1` | 36/40 Bold | 18/22 Bold | Heading 1 |
| `heading-2` | 26/32 Bold | 16/20 Bold | Heading 2 |
| `heading-3` | 24/28 Bold | 14/20 Bold | Heading 3 |
| `heading-4` | 20/24 Bold | 14/20 Bold (DAHC proposal) | Heading 4 |
| `subheading-1` | 22/28 Medium | 14/18 Regular | Subheading 1 |
| `subheading-2` | 20/26 Bold, uppercase | 14/18 Bold (DAHC proposal) | Subheading 2 |
| `body-lg` | 20/24 Regular | 16/20 (DAHC proposal) | Body Large |
| `body` | 16/20 Regular | 14/18 Regular | Body Default |
| `body-sm` | 14/18 Regular | 12/16 Regular | Body Small |
| `overline` | 12/16 Regular | 12/16 | Overhead text |
| `input` | 16/20 Regular | 16/20, kept so iOS doesn't zoom | Input field |
| `label` | 16/20 Medium | 14/18 Medium | Functional/16/Medium (DAHC choice). GME uses 13 Medium. |
| `button-lg` / `button-md` / `button-sm` | 18/20, 16/20, 14/20 Medium uppercase | 14/18 Bold | Button text 1 / 2 / uppercase |
| `chip` / `chip-sm` | 16/23 Bold uppercase, 12/16 Bold | 12/14 Bold uppercase | Chip text 1 / 2 |

The 36 Functional styles (sizes 12–24 × three weights) become primitives: `--dahc-font-size-{12,14,16,18,20,22,24,26,32,36,60}` and `--dahc-font-weight-{regular,medium,bold}`. Semantic roles reference them. GME's 13, 15 and 10 px sizes are **not** in the DH scale; see decision D3.

**Line heights** stay at Figma's absolute values (converted to rem), including the off-grid ones (23, 26, 22). This keeps visual fidelity, and the reason is recorded.

## 3.6 Spacing and sizing (DAHC proposal, derived from observed values)

| Token | Value | Observed in Figma |
|---|---|---|
| `space-0` … `space-20` | 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px (as rem), named `space-{0,0-5,1,2,3,4,5,6,8,10,12,16,20}` | Gaps 4/8/12/16/20/24/40/80; GME paddings 24/32/44/48 |
| `space-30`, `space-36` | 30, 36 px | Off-grid gaps used by DH. Kept only if a component needs them. |
| `size-control-sm` / `md` / `lg` | 36 / 44 / 48 px | Button sizes Small / Medium / Large; GME 40 px is decision D3 |
| `size-touch-target` | 44 px | WCAG 2.5.8 is 24 px minimum; 44 px is used for primary controls |
| `size-icon-{xs,sm,md,lg}` | 12 / 16 / 20 / 24 px | Icon sizes used in components |
| `size-border` / `size-border-strong` | 1 / 2 px | 1 px everywhere. 2 px on status tags and the GME upload box. The DH 0.5 px input border isn't used. |
| `size-focus-ring` / `size-focus-offset` | 2 px / 2 px | DAHC proposal |
| `size-container-max` | 1200 px with `space-6` inline padding | GME container. DH uses a 1140 content column; see D3. |

## 3.7 Radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8 px | Tags, usage chips |
| `radius-md` | 12 px | DH cards, tabs, notes, GME tiles and stepper items |
| `radius-lg` | 16 px | GME cards and panels (D3) |
| `radius-control` | 10 px | GME inputs and upload box. DH gives no input radius (D3). |
| `radius-pill` | 999 px | Buttons, chips, icon buttons. DH 30, 35 and 48 all render as pills at their heights. |

## 3.8 Elevation

| Token | Value |
|---|---|
| `shadow-1` | `0 25px 36px 0 rgb(0 51 102 / 8%)` |
| `shadow-2` | `0 25px 26px -22px rgb(0 51 102 / 8%)` |
| `shadow-3` | `0 8px 12px -6px rgb(0 51 102 / 8%)` |
| `shadow-4` | `0 12px 24px -8px rgb(0 51 102 / 12%)` |
| `shadow-overlay` | DAHC proposal for dialogs and menus: `shadow-1` plus a 1 px `color-border-subtle` outline |

The surface levels are the colour tokens in 3.3 (`background`, `surface`, `surface-raised-1`, `surface-raised-2`).

## 3.9 Motion (DAHC proposal: Figma timing can't be read)

| Token | Value |
|---|---|
| `motion-duration-fast` | 120 ms (hover, colour) |
| `motion-duration-normal` | 200 ms (expand, toast) |
| `motion-duration-slow` | 300 ms (dialog, drawer) |
| `motion-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `motion-easing-exit` | `cubic-bezier(0.3, 0, 1, 1)` |

All durations become 0 under `prefers-reduced-motion: reduce`. The Figma hover *effects* are reproduced: colour swaps, the chip fill and the card shadow.

## 3.10 Breakpoints and layout (DAHC proposal: Figma has only 1440 and 375/393 frames)

| Name | Min width | Basis |
|---|---|---|
| `sm` | 576 px | Large phones |
| `md` | 768 px | Tablet: the mobile type scale switches to web |
| `lg` | 1024 px | Header switches from hamburger to full navigation |
| `xl` | 1280 px | GME desktop frame |

- Media queries can't read custom properties, so breakpoints live in SCSS and are exposed through one mixin.
- Components prefer **container queries**, so they adapt to their slot rather than the viewport.
- The minimum supported width is 320 px, and 200% zoom must cause no horizontal scrolling (s.21).

## 3.11 Z-index

| Token | Value |
|---|---|
| `z-base` | 0 |
| `z-sticky` | 100 (header, wizard action bar) |
| `z-dropdown` | 200 |
| `z-overlay` | 1000 (dialog, drawer) |
| `z-toast` | 1100 |
| `z-tooltip` | 1200 |

## 3.12 Utility classes (small and deliberate)

| Utility | Classes |
|---|---|
| Text roles | `.dahc-text-{role}` |
| Visually hidden | `.dahc-visually-hidden` |
| Layout primitives | `.dahc-stack` (vertical gap), `.dahc-cluster` (wrapping row), `.dahc-container` (max width and padding), `.dahc-grid` (auto-fit columns). Gaps come from a `--dahc-gap` custom property. |
| Focus | `.dahc-focus-ring` for custom focus targets |

There are no colour or spacing utility classes in the style of Tailwind. Components and app styles use tokens directly.

## 3.13 Mapping to current `dahc-ui` tokens

The existing `_tokens.scss` was sampled from the PNGs. Phase 2 replaces it with the token set above.

| Current `dahc-ui` token | Proposed token | Impact |
|---|---|---|
| `--dahc-color-primary` | `--dahc-color-action-primary` | Rename |
| `--dahc-color-text` | `--dahc-color-text-primary` | Rename |
| `--dahc-color-text-muted` (#335C85) | `--dahc-color-text-secondary` (#1A4775) | Visual change |
| `--dahc-font-family-base` (Segoe UI) | Dubai | Visual change |
| Elevation shadows (navy rgba) | Figma shadows | Visual change |

The portal D1 screens are updated in the same phase so they keep building.
