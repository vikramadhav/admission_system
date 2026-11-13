# 1. Figma analysis: Dubai Health Standard UI

File: `FozlGvhO1ZjI2GbklegqFf` ("DH Design System REF"). The exact values and node ids are in [figma-extracts/dh-foundations.md](figma-extracts/dh-foundations.md), [dh-components-actions-forms.md](figma-extracts/dh-components-actions-forms.md) and [dh-components-navigation-content.md](figma-extracts/dh-components-navigation-content.md).

## 1.1 File structure (25 pages)

| Group | Pages | Status |
|---|---|---|
| Foundations | Colors `0:1` (legacy copy), **Colors `50:2565` (canonical, bound to variables)**, Typography `15:2046` and `50:2065` (identical), Shadows & Elevations `50:4153`, Microinteractions `50:1453`, Logo `50:2064`, Icons `50:4272`, Images `50:6675` | Well defined for colour, type, shadows and icons. Nothing on spacing, radius, grid, breakpoints or motion. |
| Actions and forms | Buttons `50:6773`, Chips and Tags `50:7413`, Input fields `50:7751`, Controls `50:7872`, **Datepicker `50:7957` (empty)**, Search `50:8200`, Dropdown `50:12859` (frames only), Form Components `50:21128` (3 screens) | Partial |
| Navigation | Page indicators `50:7958`, Breadcrumbs `50:9703`, Tabs `50:9895`, Burger Menu `50:10048`, Navigation `50:10464`, Navigation Components `50:22402` | Good coverage of website navigation (header, mega menu, footer). Nothing for application navigation such as a stepper or side nav. |
| Content | Cards `50:13532`, Content Components `50:13705` | 6 card component sets. Content Components holds about 587 frames, with only one real component (Accordion). |

The file isn't published as a library: `search_design_system` returns no published variables or styles. All variables are local to the file, and the file has one mode (light).

The content is aimed at a **public Dubai Health website**: hero banners, a doctor directory, a map of facilities, articles and a mega menu. Application and data-entry patterns (wizards, tables, validation and dialogs) are thin.

## 1.2 Design principles and guidelines

The file has no written principles page. The guidance is in short intro lines (quoted in the foundations extract, section 9), for example "Use only following text styles for typography" and "Use the following shadows to elevate surfaces…". The principles implied by the designs are:

- A calm, institutional look: navy text and controls on a light blue-grey page with white surfaces.
- Pill-shaped interactive elements, such as buttons and chips. Cards are rounded rectangles.
- Elevation is shown with **surface colour first**: Base #ECF2F5, then Surface #FFF, then Elevation 1 #EBF7FF and Elevation 2 #F1FCFF. Soft navy-tinted shadows are used mainly on hover.
- Secondary pastel hues are for **categorisation** (tags, tiles), never for primary actions.

## 1.3 Colour

- **Primary:** `Primary/Navy Blue` #002F70, with tints 900 (#1A4775) to 100 (#E5EBF0). `Primary/Page background` is #ECF2F5. The documented usages are useful and map well to semantic roles:
  - 900 and 800 for subtext.
  - 500 for placeholders and input borders.
  - 400 for disabled elements.
  - 200 and 100 for dividers and outlines.
- **Secondary:** Blue #32AFFC, Light Blue #77DEFC, Green #A5FFBC, Orange #FABC4C, Red #FF8F8A, Purple #AC9DFF, Pink #EFBFE2, Blue Black #0A233C and White. Each hue except White has 5 lighter tints (500 to 100). There are no darker shades, and the variable numbering skips "4." (a hue was probably removed).
- **Semantic colours are implied, not defined:**
  - Green means "Success message background".
  - Red means "Error message" and "Delete button".
  - Orange means "Notification banners".

  The file has no aliases for text, surface, border or focus.
- **Accessibility:** several documented usages fail WCAG 2.2 AA. Details are in [03-design-tokens.md](03-design-tokens.md#contrast).
  - Secondary Blue as link text: 2.42:1.
  - Red as error text: 2.2:1.
  - Navy 500 as placeholder: 2.95:1.

  A designer annotation dated May 8 2025 (`50:7083`) selects **#037BC5** as the new link colour, but the component sets weren't updated.

## 1.4 Typography

- **Family:** Dubai (Regular 400, Medium 500, Bold 700; Light 300 appears only in the specimen). Letter-spacing is 0 everywhere. Numerals are lining and proportional.
- **Web styles (18):** Stats 60/80, Display 1 60/64, Heading 1 36/40, Heading 2 26/32, Heading 3 24/28, Heading 4 20/24, Subheading 1 22/28 Medium, Subheading 2 20/26 Bold uppercase, Body Large 20/24, Body Default 16/20, Body Small 14/18, Input field 16/20, Overhead 12/16, Chip text 1 16/23, Chip text 2 12/16, Button text 1 18/20, Button text 2 16/20, Button uppercase 14/20 Medium.
- **Mobile styles (10):** H1 is 18/22 and body is 14/18. The rest are in the extract.
- **Functional styles (36):** a matrix of sizes 24/20/18/16/14/12 by weights Bold/Medium/Regular, in sentence case and uppercase.
- **Gaps:**
  - No Arabic or RTL typography guidance, although Dubai supports Arabic script.
  - Some off-grid line heights (23, 26, 22).
  - Stray fonts in component instances: Source Sans Pro (outline button, modal button), Gilroy (facility card), Inter (documentation labels).

## 1.5 Spacing, sizing, radius, layout

There are no foundation pages for these. The values observed in components are:

- **Spacing:** mostly a 4 px grid (4, 8, 12, 16, 20, 24, 40, 80), plus off-grid 30 and 36.
- **Radius:**
  - 8 for tags.
  - 12 for cards and tabs (top corners).
  - 30 or 35 for buttons; these are effectively pills.
  - 48 for chips.
- **Control heights:** 48, 44 and 36 for buttons; 48 for inputs; 36 for chips.
- **Layout:** a 1440 px canvas with 150 px side margins and a 1140 px content column. The header is 96–120 px. Mobile frames are 375 and 393 px. **There's no tablet breakpoint and no column grid.**
- **Borders:** 1 px, except the input field, which uses 0.5 px. A 0.5 px border doesn't render consistently in browsers.

## 1.6 Elevation and shadows

There are 4 effect styles, all tinted #003366 (a colour that isn't in the palette):

| Style | CSS |
|---|---|
| Shadow 1 | `0 25px 36px 0 rgb(0 51 102 / 8%)` |
| Shadow 2 | `0 25px 26px -22px rgb(0 51 102 / 8%)` |
| Shadow 3 | `0 8px 12px -6px rgb(0 51 102 / 8%)` |
| Shadow 4 | `0 12px 24px -8px rgb(0 51 102 / 12%)` |

The level numbers don't track visual depth. In practice, shadows appear on card hover (Shadow 4) and under the mobile header (Shadow 2).

## 1.7 Icons and visual assets

- About 200 icons at 24×24, mostly outline with a 1.5 px stroke, round caps and #002F70. They come in 5 groups: Functional 46, View-only 59, Services 38, Government unification 20, and Social (20 platforms × 3 styles × 2 states).
- The functional icons match the **Untitled UI Icons** set (same names and geometry, but a 1.5 px stroke instead of 2 px). The healthcare and specialty icons are custom.
- Only 24 px masters exist, but components use icons at 12, 16, 20 and 24 px.
- The style is mixed: some icons are filled (Account, carets, Mail), there are two chevron styles, and one icon is duplicated ("Endocrinology Services").
- **Logo:** `DH logo` has 6 variants (Navy or White × Vertical, Horizontal or Icon only). There's a separate `DAHC logo` (`1:3`). No clear-space or minimum-size rules exist.
- **Images:** hero 1140×484 with a #000F25 gradient overlay; banner 1140×225 with a #0A233C overlay at 15%.

## 1.8 Components

| Area | Real components (component sets) | Examples only, not components |
|---|---|---|
| Actions | Button `50:6786` (69 variants: Solid / Outline / Link / Icon-only × 5 colours × 3 sizes × 4 states), icon button (inside the button set) | Button group (a chip toggle shown on Form Components) |
| Forms | Input field `50:7763` (6 states), Controls checkbox/radio `50:7880` (8), Search `50:8605` (22, screen-specific), search suggestion panel `50:9125` | Select, multi-select (5 frame examples on the Dropdown page) |
| Tags | Informational tag `50:7426` (22), Functional chip `50:7519` (12) | Link chip, static tag, category label |
| Navigation | Top navigation `50:10831` (9), Menu items `50:11253`, Mega menu `50:11262`, Hamburger menu `50:10087`, Bottom navigation/footer `50:11045` (6), Breadcrumbs `50:9802`, Tabs `50:9910`/`50:9930`, Pagination `50:8044`, Carousel indicator `50:8076`, Map navigation panel `50:22424` | Vertical stepper (with no states), mobile "Page 1 of 10" pagination |
| Content | 6 card sets (Image, Doctor, Article, Actionable ×2, Specialty), Accordion `50:17721` | Modal (success and leave-site warning), tooltip (dark), FAQ list, yes/no table, stats band, banners, about 13 more card types |

**Interaction states across the file:**

| State | Where it's designed |
|---|---|
| Default, Hover, Active, Disabled | Buttons only. Disabled is opacity 50%, and Active often looks the same as Default. |
| Hover | Chips and cards |
| Focus | Nowhere |
| Error, Success | Input field only |
| Loading | Nowhere |

**Responsive behaviour:** web and mobile variants exist for the header, footer, search and modal. The header collapses into a hamburger menu at mobile width. Form controls have no mobile variants.

## 1.9 Assessment

The colour palette, typography, shadows, icons, buttons and the website-navigation components are mature enough to implement. Before an accessible application component library can be built from this file, it needs:

- Semantic tokens.
- Focus and error states.
- Contrast fixes.
- Designs for about 10 missing application components.

Doc 06 lists each of these.
