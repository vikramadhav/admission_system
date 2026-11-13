# DH Design System REF: Foundations extraction

Source: Figma file `FozlGvhO1ZjI2GbklegqFf` ("DH Design System REF", Dubai Health Standard UI). Extracted read-only on 2026-11-12.
Pages covered: Colors (0:1 and 50:2565), Typography (15:2046 and 50:2065), Shadows & Elevations (50:4153), Microinteractions (50:1453), Logo (50:2064), Icons (50:4272), Images (50:6675).

Sources used: `get_variable_defs` (variable, text-style and effect-style names with values), `get_design_context` (exact CSS), `get_metadata`, screenshots. Values in this document come from Figma's bound variables and styles. Where the label text drawn on the canvas disagrees with the bound value, both are given and the disagreement is listed in section 10.

---

## 0. Summary

| Item | Finding |
|---|---|
| Font | **Dubai** (the "Dubai Font" family). Weights used by styles: Regular 400, Medium 500, Bold 700. Light (300) appears in the specimen only. No style uses a separate Arabic font, and there is no Arabic specimen, but Dubai covers Arabic script, as the bilingual logo shows. |
| Primary colour | `Primary/Navy Blue` = **#002F70**, with 9 tints from 900 (#1A4775) to 100 (#E5EBF0) |
| Page background | `Primary/Page background` = **#ECF2F5** |
| Secondary | 9 hues: Blue #32AFFC, Light Blue #77DEFC, Green #A5FFBC, Orange #FABC4C, Red #FF8F8A, Purple #AC9DFF, Pink #EFBFE2, Blue Black #0A233C, White #FFFFFF. Each hue except White has 5 tints (500 to 100). |
| Semantic tokens | **None defined.** There is no success, warning, error or info layer, and no text, surface or border alias layer. Semantic intent appears only as "Usage" chips (see 1.4). |
| Modes | **Single mode only (light).** No dark-mode values exist. White is documented only as "Usage [On dark background]". |
| Shadows | **4 effect styles**, `Shadow 1` to `Shadow 4`, all drop shadows tinted #003366. There are also 4 colour-based "elevation" surfaces. |
| Radius / spacing / grid | No dedicated foundation pages. Values observed in components: radius 8, 12, 30, 35, 48; 1440 canvas with 150 margins and a 1140 content width. |
| Motion | Hover states only, built as prototype "smart animate" interactions. Durations and easings are **not readable through the API** and are not written anywhere. |
| Icons | 24x24 components. Mostly outline, 1.5px stroke, round caps and joins, #002F70. Path geometry and names (`x-close`, `globe-02`, `copy-06`, ...) match **Untitled UI icons**, mixed with custom healthcare icons. There are 5 groups: Functional (46), View only (59), Services (38), Gov. unification (20), Social (20 platforms x 3 styles x 2 states). |
| Duplicate pages | `Colors 0:1` is **legacy**, and `Colors 50:2565` is the current version with variable bindings (see 1.6). The two Typography pages are **identical** (see 2.5). |

---

## 1. Colour

### 1.1 Variable collections (as named in Figma)

`search_design_system` returned **no published library variables or styles**, so everything below is local to the file. The variable groups seen in bindings are:

- `Primary/…`: navy scale and page background
- `Secondary/N. Name`: secondary base hues. Numbering is 1, 2, 3, 5, 6, 7, 8, 9, 10. **"4." is missing**, which suggests a hue (probably Yellow) was removed.
- `Secondary Tints/N. Name/500…100`: tints. Again there is no 4.
- Stray or duplicate groups that appear in bindings: `Secondary Tints/Secondary/1. Blue` (#32AFFC), `Secondary Tints/Secondary/10. White` (#FFFFFF), `Secondary Tints/Primary/Navy Blue` (#002F70), `Base/White` (#FFFFFF) and `Social Icons/Main/White` (#FFFFFF). These look like copies of the base variables created when components were copied in from another file.
- Legacy local **colour styles** (bound on page 0:1 only): `Primary Navy Blue` #002F70, `Primary Navy Blue 900` #1A4775, `Primary Navy Blue 800` #335C85, `Primary Navy Blue 700` #4D7094, `Secondary Blue` #32AFFC, and `Page backgound` #ECF2F5 (typo in the style name).

There is **one mode** only, with no light/dark or brand modes.

### 1.2 Primary palette

Frames: `01 - Color Usage Guidelines` "Primary colors" 50:2719 (legacy 1:280), and "Primary tints" 50:2566 (legacy 1:127).

| Token (Figma variable) | Hex | Swatch node | Documented usage (verbatim chips) |
|---|---|---|---|
| `Primary/Navy Blue` | #002F70 | 50:2719 (row "Primary Navy Blue") | "All headings (H1-H6)", "Titles of sections", "Controls & form element labels", "Primary buttons" |
| `Primary/Page background` | #ECF2F5 | 50:2719 | "Screen background only" |
| `Primary/Navy Blue/900` | #1A4775 | 50:2579 | "Subtexts" |
| `Primary/Navy Blue/800` | #335C85 | 50:2594 | "Subtexts", "Inactive but selectable elements in controls/form" |
| `Primary/Navy Blue/700` | #4D7094 | 50:2609 | (no chips visible) |
| `Primary/Navy Blue/600` | #6685A3 | 50:2624 | "Headings of sub sections", "Secondary titles or titles of sub sections", "Non-clickable icons" |
| `Primary/Navy Blue/500` | #8099B2 | 50:2641 | "Input field placeholders", "Input fields" |
| `Primary/Navy Blue/400` | #99ADC2 | 50:2658 | "Disabled elements", "Subheading" |
| `Primary/Navy Blue/300` | #B2C2D1 | 50:2673 | (no chips visible) |
| `Primary/Navy Blue/200` | #CCD6E0 | 50:2688 | "Dividers", "Functional chips outline" |
| `Primary/Navy Blue/100` | #E5EBF0 | 50:2703 | "Dividers", "Surface outlines", "Input fields", "Functional chips background" |

Header text on the tints frame: "Use the following colors for the defined components and elements." On the primary frame: "Use the following colors for the DH design primarily."

### 1.3 Secondary palette (base hues)

Frame: "Secondary colors" 50:2954 (legacy 1:515).

| Token | Hex | Documented usage |
|---|---|---|
| `Secondary/1. Blue` | #32AFFC | "Links", "Special button", "Highlight card outline", "Section title icons" |
| `Secondary/2. Light Blue` | #77DEFC | "Informational tags" |
| `Secondary/3. Green` | #A5FFBC | "Input fields", "Tags", "Special button" |
| `Secondary/5. Orange` | #FABC4C | "Input fields", "Informational tags", "Notification banners" |
| `Secondary/6. Red` | #FF8F8A | "Input fields", "Informational tags", "Notification banners", "Error message", "Delete button" |
| `Secondary/7. Purple` | #AC9DFF | "Informational tags" |
| `Secondary/8. Pink` | #EFBFE2 | "Informational tags" |
| `Secondary/9. Blue Black` | #0A233C | "Titles", "Notification banners" |
| `Secondary/10. White` | #FFFFFF | "Surface", "Input fields". **Usage [On dark background]:** "All headings (H1-H6)", "Titles of sections", "Controls & form element labels", "Primary Button labels" |

### 1.4 Secondary tints

Frame: "Secondary color tints" 50:3126 (legacy 1:687). Each row is a 100x100 swatch. Group frames: Blue 50:3140, Light Blue 50:3218, Green 50:3298, Orange 50:3378, Red 50:3458, Purple 50:3541, Pink 50:3621, Blue Black 50:3701.

| Variable | 500 | 400 | 300 | 200 | 100 |
|---|---|---|---|---|---|
| `Secondary Tints/1. Blue/*` | #5BBFFD | #84CFFD | #ADDFFE | #D6EFFE | #EBF7FF |
| `Secondary Tints/2. Light Blue/*` | #92E4FD | #ADEBFD | #C9F2FE | #E4F8FE | #F1FCFF |
| `Secondary Tints/3. Green/*` | #B7FFC9 | #C9FFD7 | #DBFFE4 | #EDFFF1 | #F6FFF8 |
| `Secondary Tints/5. Orange/*` | #FBC970 | #FCD794 | #FDE4B7 | #FEF1DB | #FEF8ED |
| `Secondary Tints/6. Red/*` | #FFA5A1 | #FFBCB9 | #FFD2D0 | #FFE9E8 | #FFF4F3 |
| `Secondary Tints/7. Purple/*` | #BDB1FF | #CDC4FF | #DED8FF | #EEEBFF | #F7F5FF |
| `Secondary Tints/8. Pink/*` | #F2CCE8 | #F5D8EE | #F9E5F4 | #FCF2F9 | #FDF9FC |
| `Secondary Tints/9. Blue Black/*` | #3B4F63 | #6C7B8A | #9DA7B1 | #CED3D8 | #E6E9EB |

Documented usage on the tints page. Every tint not listed here is marked **"Not yet defined"**.
- Blue 200 #D6EFFE: "Highlight section background"
- Blue 100 #EBF7FF: "Calendar"
- Light Blue 100 #F1FCFF: "Title background", "Inactive but selectable elements in controls/form"
- Green 100 #F6FFF8: "Input fields"
- Red 100 #FFF4F3: "Input fields"
- Blue Black 300 #9DA7B1: "Time slot chips"
- Blue Black 100 #E6E9EB: "Surface outlines"
- All Orange, Purple and Pink tints: "Not yet defined"

Note: the tints are lighter blends of each base hue, so the "500" step is lighter than the base hue. The secondary scales have no darker steps (600 to 900).

### 1.5 Usage examples (component mapping)

Frames: "Primary color and their tints usage" 50:2759 (legacy 1:320) and "Secondary color and their tints usage" 50:3777 (legacy 1:1338). The text on the canvas is reproduced here.

| Colour | Example usages shown |
|---|---|
| Navy Blue #002F70 | Heading, Primary CTA background, Secondary CTA outline, Interactive chips |
| Page background #ECF2F5 | Section background |
| Navy 900 #1A4775 | List, Content/ Text |
| Navy 800 #335C85 | Inactive tab background, Service step heading, Card content |
| Navy 700 #4D7094 | Filter dropdown outline, Page Subheading, Card Subheading |
| Navy 600 #6685A3 | Chip heading, Footer note, Card date |
| Navy 500 #8099B2 | Inactive breadcrumb, Inputbox Placeholder and outline |
| Navy 400 #99ADC2 | Description |
| "Navy 200" **labelled #B2C2D1** (this is the 300 value; see section 10) | Functional chip outline, Card outline, Sidebar divider |
| Navy 100 #E5EBF0 | Functional chip background, Section divider/ divider, Card outline |
| Blue #32AFFC | Icon, Link button, Active list menu, Card background |
| Green 300 #DBFFE4 | Top nav button background, Card background |
| Light Blue 100 #F1FCFF | Card background, Section background |
| Blue 200 #D6EFFE | Top nav button background, Page header background, Card background |
| Blue 300 #ADDFFE | Card background |
| Blue 100 #EBF7FF | Section background |
| Light Blue #77DEFC | Card footer background, Interactive chips |
| Green #A5FFBC | Insight, Success message background |
| Orange #FABC4C | Informative chip |
| Red #FF8F8A | Error message background |
| Purple #AC9DFF | Informative chip |
| Pink #EFBFE2 | Informative chip |

The example frames also bind `Secondary Tints/6. Red/500` #FFA5A1 and `Secondary Tints/6. Red/400` #FFBCB9, which are not labelled.

### 1.6 Colors page 0:1 compared with 50:2565

- The two pages have the **same six frames**, with the same names and dimensions. Comparing the layer trees (names, sizes, visibility) gives one difference: the `#FDE4B7` text layer is 71px wide on 0:1 and 72px on 50:2565.
- Page 50:2565 wraps the frames in `Section 1` (50:4152), with each frame shifted +100/+100.
- **Bindings differ.** On **0:1** several swatches use **legacy colour styles**: `Primary Navy Blue 900/800/700`, `Primary Navy Blue`, `Page backgound`, `Secondary Blue`. On **50:2565** the same swatches are bound to **variables**: `Primary/Navy Blue/900`, `/700`, `Primary/Page background`, `Secondary/1. Blue`. The hex values are identical.
- Conclusion: **0:1 is the legacy copy and 50:2565 is canonical.** Use the variable names from 50:2565.
- The text content of the chips on 0:1 was not compared one by one. The layer structure is identical.

---

## 2. Typography

### 2.1 Typeface

Frame `Typefaces` 50:2376 (legacy 15:2292):
- Heading: "Dubai Font" (50:2386).
- Specimen weights (50:2394 to 50:2397): **Dubai Bold, Dubai Medium, Dubai Regular, Dubai Light**, at 36px with a 62px line-height.
- The glyph labels "Glyph" and "Characters" are set in **Inter Bold** 20px, #99ADC2. This is a stray font in the documentation, not a token.
- All specimen text has `font-feature-settings: "lnum" 1, "pnum" 1` (lining, proportional numerals).
- **Arabic:** no Arabic specimen or Arabic text style exists, and no RTL guidance is given. Dubai Font supports Arabic, and the logo is bilingual.

### 2.2 Web text styles

Frame `Text styles` 50:2249 (legacy 15:2165). The intro reads "Use only following text styles for typography." Values come from the Figma text styles. Letter-spacing is **0 for every style**.

| Text style | Weight | Size / line-height (px) | Case | Sample node | Label shown on canvas |
|---|---|---|---|---|---|
| `Web/Stats` | Bold 700 | 60 / 80 | UPPERCASE | 50:2272 | 60/bold/80 uppercase |
| `Web/Display 1` | Bold 700 | 60 / 64 | – | 50:2275 | matches |
| `Web/Heading 1` | Bold 700 | 36 / 40 | capitalize | 50:2280 | matches |
| `Web/Heading 2` | Bold 700 | 26 / 32 | capitalize | 50:2283 | matches |
| `Web/Heading 3` | Bold 700 | 24 / 28 | capitalize | 50:2286 | matches |
| `Web/Heading 4` | Bold 700 | 20 / 24 | capitalize | 50:2289 | matches |
| `Web/Subheading 1` | **Medium 500** | 22 / 28 | – | 50:2292 | **label says "Weight: bold"** |
| `Web/Subheading 2` | Bold 700 | 20 / 26 | UPPERCASE | 50:2295 | matches |
| `Web/Body Large` ("Paragraph text large") | **Regular 400** | 20 / 24 | – | 50:2300 | **label says "Weight: medium"** |
| `Web/Body Default` ("Paragraph text default") | Regular 400 | 16 / 20 | – | 50:2303 | matches |
| `Web/Body Small` ("Paragraph text small") | Regular 400 | 14 / 18 | – | 50:2306 | matches |
| `Web/Input field` | Regular 400 | 16 / 20 | – | 50:2309 | matches |
| `Web/Overhead text` | Regular 400 | 12 / 16 | – | 50:2312 | matches |
| `Web/Chip text 1` | Bold 700 | 16 / 23 | UPPERCASE | 50:2317 | matches |
| `Web/Chip text 2` | Bold 700 | 12 / 16 | – | 50:2320 | the sample text wrongly reads "Chip text 1" |
| `Web/Button text 1` | Bold 700 | 18 / 20 | capitalize | 50:2325 | matches |
| `Web/Button text 2` | Bold 700 | 16 / 20 | capitalize | 50:2328 | matches. Inside chip and card instances this style resolves with **line-height 18** (50:1573, 50:1578). |
| `Web/Button text uppercase` ("Button text 3") | Medium 500 | 14 / 20 | UPPERCASE | 50:2331 | matches |

Note: the canvas labels give sizes in "pt", but they are pixel values.

### 2.3 Mobile text styles

The right column of 50:2266 (node 50:2333).

| Text style | Weight | Size / line-height | Case | Sample node | Label shown on canvas |
|---|---|---|---|---|---|
| `Mobile/Stats` | Bold 700 | 36 / 36 | UPPERCASE | 50:2338 | matches |
| `Mobile/Display 1` | Bold 700 | 32 / 40 | capitalize | 50:2341 | matches |
| `Mobile/Heading 1` | Bold 700 | 18 / 22 | capitalize | 50:2346 | matches |
| `Mobile/Heading 2` | Bold 700 | 16 / 20 | capitalize | 50:2349 | matches |
| `Mobile/Heading 3` | Bold 700 | 14 / 20 | – | 50:2352 | matches |
| `Mobile/Subheading 1` | Regular 400 | 14 / 18 | – | 50:2355 | matches |
| `Mobile/Body Default` | Regular 400 | 14 / 18 | – | 50:2360 | matches |
| `Mobile/Body small` | Regular 400 | 12 / 16 | – | 50:2363 | matches (lower-case "small" in the style name) |
| (Over head text, mobile) | Regular 400 | 12 / 16 | – | 50:2366 | no `Mobile/` style. It reuses the web overhead metrics. |
| `Mobile/Button text 1` | Bold 700 | 14 / 18 | capitalize | 50:2371 | matches |
| `Mobile/Chip text 1` | Bold 700 | **12** / 14 | UPPERCASE | 50:2374 | **label says "Size: 14pt"** |

Mobile has no equivalents for Heading 4, Subheading 2, Body Large, Input field, Chip text 2, Button text 2 or Button uppercase.

### 2.4 Functional text styles

Frame `Functional text` 50:2398 (legacy 15:2314). The intro reads "Use the following text styles in addition to the web and mobile text styles." It is a size-by-weight matrix. Every variant comes in sentence case and Uppercase, and both variants have identical metrics, so the "Uppercase" styles differ only in text case.

| Size | Line-height | Styles (each also as "… Uppercase") |
|---|---|---|
| 24 | 30 | `Functional/24/Bold` (700), `/24/Medium` (500), `/24/Regular` (400) |
| 20 | 24 | `Functional/20/Bold`, `/Medium`, `/Regular` |
| 18 | 22 | `Functional/18/Bold`, `/Medium`, `/Regular` |
| 16 | 20 | `Functional/16/Bold`, `/Medium`, `/Regular` |
| 14 | 18 | `Functional/14/Bold`, `/Medium`, `/Regular` |
| 12 | 16 | `Functional/12/Bold`, `/Medium`, `/Regular` |

That is 36 styles. Letter-spacing is 0 for all of them.

Implied type scale for tokens: sizes **12, 14, 16, 18, 20, 22, 24, 26, 32, 36, 60** and line-heights **14, 16, 18, 20, 22, 23, 24, 26, 28, 30, 32, 36, 40, 64, 80**. The values 22, 26 and 23 are off a 4px grid.

### 2.5 Typography page 15:2046 compared with 50:2065

The two pages are **identical**: the same three frames (Typefaces, Text styles, Functional text), the same layer trees and positions, and the same bound styles and variables. The only differences are the node-id prefixes (15:xxxx and 50:xxxx). Unlike Colors, neither page uses legacy styles, so either can be treated as canonical. The 50:xxxx ids are used here for consistency.

---

## 3. Elevation and shadows

Page 50:4153, frame `01 - Elevations and Shadows` 50:4159.

### 3.1 Surface elevation by colour

Intro: "Use the following colors as the colours to elevate surfaces in the design."

| Level | Fill | Token | Node |
|---|---|---|---|
| Base | #ECF2F5 | `Primary/Page background` (the canvas label wrongly reads **#1A4775**) | 50:4179 |
| Surface | #FFFFFF, shown with a 1px #0A233C border | `Secondary/10. White` | 50:4186 |
| Elevation 1 | #EBF7FF | `Secondary Tints/1. Blue/100` | 50:4193 |
| Elevation 2 | #F1FCFF | `Secondary Tints/2. Light Blue/100` | 50:4200 |

### 3.2 Shadow effect styles

Intro: "Use the following shadows to elevate surfaces in the design. Choose the outline color based on background."
The swatches are white boxes with a **1px #E5EBF0** outline (`Primary/Navy Blue/100`). The stacked demo uses a #EBF7FF outline.

| Effect style | Level label | x | y | blur | spread | colour | CSS (exact) | Node |
|---|---|---|---|---|---|---|---|---|
| `Shadow 1` | Surface level 1 | 0 | 25 | 36 | 0 | #003366 @ 8% (`#00336614`) | `0px 25px 36px 0px rgba(0, 51, 102, 0.08)` | 50:4217 |
| `Shadow 2` | Surface level 2 | 0 | 25 | 26 | -22 | #003366 @ 8% | `0px 25px 26px -22px rgba(0, 51, 102, 0.08)` | 50:4224 |
| `Shadow 3` | Surface level 3 | 0 | 8 | 12 | -6 | #003366 @ 8% | `0px 8px 12px -6px rgba(0, 51, 102, 0.08)` | 50:4231 |
| `Shadow 4` | Surface level 4 | 0 | 12 | 24 | -8 | #003366 @ 12% (`#0033661F`) | `0px 12px 24px -8px rgba(0, 51, 102, 0.12)` | 50:4238 |

All four are DROP_SHADOW effects. The shadow colour **#003366 is not a palette colour**; the nearest is Navy #002F70. The level numbers do not track visual depth: Shadow 1 has the largest blur and no negative spread, so it is the most diffuse.

---

## 4. Radius, spacing, layout

There are no foundation pages for these. The values below were observed in the documentation frames and the component instances on these pages:

- **Radius:** 8 (usage chips in the colour docs), 12 (cards: Actionable card, Doctor card), 30 (buttons), 35 (icon button and the "View Details" pill), 48 (functional chips, i.e. fully rounded). Swatches and hero images have radius 0.
- **Spacing seen:** gaps of 4, 8, 12, 16, 20, 24, 30, 36, 40, 80. Paddings: buttons 32x12 (large, 48px tall) and 24x8 (36px tall); chips 16x8 (36px tall) and 16/12x6; cards 24 (actionable) and 16 (doctor). Mostly a 4px grid, plus 30 and 36.
- **Layout:** documentation frames are 1440 wide with a 150px side margin and a 1140px content column. A 120px header bar.
- **Breakpoints and grid:** none documented. The only split is "Web" versus "Mobile" text styles.
- **Borders:** 1px everywhere.

---

## 5. Microinteractions (motion)

Page 50:1453. `01 - Microinteraction Guidelines` 50:1454 is the prototype and is captioned "Enter presentation mode to check animations." `02 - Microinteraction Guidelines` 50:1514 is captioned "For specs and assets extraction" and shows Default and Hover side by side.

**Durations and easings:** `get_motion_context` returned no keyframe data, and no duration or easing is written on the page. The transitions are Figma prototype interactions, which the API does not expose. **Treat timing as unspecified.**
Note instance 50:1513: "Figma has limitation on underline effect so you'll see glitch."

Section intros: "Use following effects for button and link hovers." / "Use following effects for hover." (chips) / "Use following effects for different types of clickable cards' hover."

### 5.1 Button hover (50:1526)

| Variant | Default | Hover |
|---|---|---|
| Solid / primary (50:1532 → 50:1534) | bg #002F70, white text `Web/Button text 1` (18/20 bold), h 48, px 32, radius 30, 20px icons, gap 12 | bg **#335C85** (`Primary/Navy Blue/800`) |
| Outline (50:1537 → 50:1539) | 1px border #002F70, text #002F70 14/20 **Source Sans Pro SemiBold**, px 24 py 8, radius 30, 12px icons | fills #002F70, white text |
| Link (50:1542 → 50:1544) | text #32AFFC, 18/20 Dubai Bold, 24px icons | text **#5BBFFD** (`Secondary Tints/1. Blue/500`) + underline (line-height becomes 24) |
| Special Blue (50:1547 → 50:1549) | bg #32AFFC, white 14/18 Medium UPPERCASE, h 36, radius 30, 16px icons | bg **#ADDFFE** (Blue/300), text #002F70 |
| Special Green (50:1552 → 50:1554) | bg #A5FFBC, text #002F70 | bg **#DBFFE4** (Green/300) |
| Special Red / delete (50:1557 → 50:1559) | 1px border #FF8F8A, text #FF8F8A, 14/18 Medium | bg #FF8F8A, white text |
| Icon button (50:1562 → 50:1564) | 48 wide, 1px border #002F70, radius 35, 20px icon | border and icon **#4D7094** (Navy/700) |

### 5.2 Actionable chip hover (50:1569)

Default (50:1571): bg #E5EBF0, 1px border #CCD6E0, text #002F70 16/18 Dubai Regular, h 36, px 16, radius 48, 20px icons.
Hover (50:1573): bg **#002F70**, no border, white text **Dubai Bold** 16/18.

### 5.3 Card hover (50:1578)

The card frames use the effect styles `Shadow 1`, `Shadow 3` and `Shadow 4`.
- Actionable card (50:1596 → 50:1598): white, 1px #E5EBF0, radius 12, padding 24, gap 16. Hover adds the `Shadow 4` effect.
- Doctor card (50:1586 → 50:1588): on hover the image gets an overlay of **rgba(0,47,112,0.6)** (#002F70 @ 60%) and a white "View Details" pill (px 24 py 12, radius 35, 18/20 bold #002F70). The pill is positioned at `left: calc(50% + 30px)`, so it is **off-centre by 30px**, which looks like a bug.
- Image/feature card, article card, homepage hero card and speciality card: hover adds an elevation shadow. The hero card goes from no surface to a white bordered card with a shadow. Exactly which Shadow N each card uses was not isolated per card.
- Focus, pressed/active and disabled states are **not documented** for any interaction.

---

## 6. Logo

Page 50:2064, frame `Logos` 50:2066. Intro: "Use the following logos for the DH design." Component set `DH logo` (50:2078) has the properties `Color` × `Orientation`:

| Variant | Node | Size |
|---|---|---|
| Color=Navy blue, Orientation=Vertical | 50:2109 | 660×500 |
| Color=Navy blue, Orientation=Horizontal | 50:2187 | 965×250 |
| Color=Navy blue, Orientation=Icon only | 50:2139 | 260×260 |
| Color=White, Orientation=Vertical | 50:2079 | 660×500 |
| Color=White, Orientation=Horizontal | 50:2155 | 965×250 |
| Color=White, Orientation=Icon only | 50:2147 | 260×260 |

The fills are `Primary/Navy Blue` #002F70 and `Secondary/10. White`. The White variants are displayed on a black panel (50:2074). The lockup is bilingual (Arabic "دبي الصحية" above or beside "DUBAI HEALTH").
A separate `DAHC logo` component (white, used in the page headers at 78×60; master node 1:3) also exists.
**No clear-space, minimum-size or misuse rules are documented.**

---

## 7. Icons

Page 50:4272, `Section 1` 50:6674. All icons are 24×24 components or instances. The SVG export of `eye` (50:4754) shows `stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="#002F70"` and `fill="none"`. The default icon colour is `Primary/Navy Blue` #002F70.

| Group | Frame | Count | Intro text | Notes |
|---|---|---|---|---|
| Functional icons | 50:4741 (icons in 50:4752) | 46 | "Use the following icons wherever actions and functions are required." | Untitled-UI-style names: eye, eye-off, phone, annotation-question, log-out-02, globe-02, x-close, credit-card-02, bank, copy-06, plus chevron small up/down/left/right, caret up/down/left/right (filled), arrow up/down/left/right, calendar, clock, operating hours, Check, visting hours [sic], location, External link, Trash, Print, Help, Information, Close, View, search, Menu, Recent, Upload, Arrows/Up/Down/Left/Right, Placeholder (filled circle). `Account` is filled. There are two chevron styles: "chevron small" and "Arrows/*". |
| View only icons | 50:4924 (50:4935) | 59 | "Use the following icons wherever the icons represent a topic or a section." | Custom healthcare line icons, e.g. wheelchair, healthcare professional, students, "Values - patient first/respect/excellence/teamwork/empathy/integrity", Telehealth, Stethoscope, Bed, Achievement status - *, Ambulance, Thermometer, Homecare, Health card, In-person appointment, Government, User, help-circle, message-question-circle, Quote open/close. A few are filled (e.g. "Today" calendar). |
| Services icons | 50:5358 (50:5369) | 38 | Same intro as View only | One icon per medical specialty: "Anaesthesiology Services" … "Vascular Surgery Services". "Endocrinology Services" appears **twice** (one copy with a trailing space). |
| Government websites unification icons | 50:4277 (50:4288) | 20 | "Use the following icons to standardize on the website as per the goverment standard." [sic] | Mixed filled and outline: Accessibility, Account, Apps, Arrows/Down/Left/Right/Up (master symbols 50:4332 to 50:4344), Chat, Close, Happiness, Location, Menu, Newspaper, Phone, Search, "04" (unnamed), Mail Filled, MailOutlined, Work, Parent. |
| Social media icons | 50:4430 (50:4441) | 20 platforms + X and Threads | "Use the following icons wherever social media platforms need to be represented. Colors can be changed based on the background." | Variant props `Platform` × `Style` (Brand / Gray / White) × `State` (Default / Hover). Platforms: Facebook, Twitter, Instagram, LinkedIn, Google, YouTube, Apple, Snapchat, Pinterest, Figma, Dribbble, Reddit, Discord, TikTok, Tumblr, Telegram, Clubhouse, Signal, GitHub, AngelList; X and Threads exist in White only. Bound colours: Navy 200 #CCD6E0, 300 #B2C2D1, 700 #4D7094, White. |

- **Library:** the line icons match **Untitled UI Icons** (names and path geometry) at **1.5px** stroke, whereas Untitled UI's default is 2px. The healthcare and service icons are custom.
- **Format:** icons are Figma components and instances. There are no size variants; only 24px is published. In components, icons appear at 12, 16, 20 and 24px (see the buttons).
- Naming is inconsistent: kebab-case (`eye-off`), sentence case (`External link`), slash paths (`Arrows/Down`), and typos (`visting hours`, `Specialy card`).

---

## 8. Images

Page 50:6675, frame `Overlays` 50:6676.

- **Hero images:** "Use the following image format for hero section on a page." Shown at **1140×484** (≈2.36:1), radius 0 (50:6687).
  - **Gradient overlay** on the bottom 363px (75%): colour **#000F25**. Exact stops: `rgba(0,15,37,0.8)` at 9.984%, `rgba(0,15,37,0.4)` at 66.713%, `rgba(0,15,37,0)` at the end. It is rotated 180°, so the dark end is at the bottom (50:6691, 50:6696).
  - The canvas legend says "#000F25 0% / 50% / 100%" at positions 0% / 63% / 100%, which **does not match** the actual stops (0.8 max opacity at 9.98% and 66.7%).
- **Banner / colour overlay:** image at **1140×225** (≈5.07:1) with a **#0A233C @ 15%** overlay, `rgba(10,35,60,0.15)` (50:6727, 50:6735).
- **Doctor card image overlay** (from Microinteractions): #002F70 @ 60%.
- No placeholder, aspect-ratio system or radius rules are documented beyond these examples. Card images in components use the card radius of 12 on the top corners only.

---

## 9. Guideline text (verbatim)

- "Use the following colors for the DH design primarily." (Primary and Secondary colours)
- "Use the following colors for the defined components and elements." (tints)
- "Use only following text styles for typography." (Text styles)
- "Use the following text styles in addition to the web and mobile text styles." (Functional text)
- "Use the following colors as the colours to elevate surfaces in the design." (Elevations)
- "Use the following shadows to elevate surfaces in the design. Choose the outline color based on background." (Shadows)
- "Enter presentation mode to check animations." / "Figma has limitation on underline effect so you'll see glitch." (Microinteractions)
- "Use the following logos for the DH design." (Logo)
- "Use the following icons wherever actions and functions are required." (Functional icons)
- "Use the following icons to standardize on the website as per the goverment standard." (Gov icons)
- "Use the following image format for hero section on a page." (Images)

---

## 10. Gaps, inconsistencies, off-grid values

**Missing**
1. There is no dark mode or any second mode, and no semantic alias tokens (text, surface, border, success, warning, error, info, focus). Success, error and warning are implied only by Green #A5FFBC, Red #FF8F8A and Orange #FABC4C. These are light pastels, and white or navy text on them needs a contrast check: white on #FF8F8A ≈ 2.2:1, which fails AA.
2. There is **no focus colour or focus ring**, and no pressed, active or disabled states in Microinteractions. Disabled is mentioned only as a usage of Navy 400 #99ADC2.
3. There are no radius, spacing, grid or breakpoint tokens, and no motion durations or easings.
4. There are no logo clear-space or minimum-size rules, and no Arabic or RTL typography guidance.
5. Many tints are "Not yet defined", including the whole Orange, Purple and Pink tint scales.
6. Secondary numbering skips "4." in both `Secondary/` and `Secondary Tints/`.

**Label versus bound value mismatches**
7. Colour usage example 50:2759 / 1:320: the row "Primary Navy Blue 200" shows **#B2C2D1** and the swatch is bound to `Navy Blue/300`. The real 200 is #CCD6E0.
8. Elevation "Base / Page background" label reads **#1A4775**, but the swatch is #ECF2F5 (50:4182).
9. `Web/Subheading 1`: the label says bold, but the style is Medium 500.
10. `Web/Body Large`: the label says medium, but the style is Regular 400.
11. `Mobile/Chip text 1`: the label says 14pt, but the style is 12px (line-height 14).
12. The `Web/Chip text 2` sample text reads "Chip text 1".
13. Image gradient legend (0/50/100% opacity) does not match the actual stops (0.8 / 0.4 / 0).
14. `Web/Button text 2` resolves to line-height 20 on the styles page but 18 inside chip and card instances (50:1573, 50:1578).

**Stray values outside the palette**
15. The shadow colour **#003366** (rgba 0,51,102) is not in the palette. The header bar on the 50:2566 "Primary color styles" frame is also **#003366** ("bg-[#036]"), whereas other headers use #002F70.
16. Font stragglers: the outline button uses **Source Sans Pro SemiBold** 14/20 (50:1537, 50:1539), and the specimen labels use **Inter Bold**. Both should be Dubai.
17. Duplicate variable groups: `Secondary Tints/Secondary/*`, `Secondary Tints/Primary/Navy Blue`, `Base/White`, `Social Icons/Main/White`. The legacy colour style `Page backgound` has a typo.

**Off-grid values**
18. Line-heights 23 (Chip text 1) and 26/22 are not on a 4px grid. Font sizes 22 and 26 are used. Gaps of 30 and 36 are used.
19. Shadow level numbering does not track depth (Shadow 1 is the most diffuse).

**Duplicate pages**
20. Colors 0:1 is legacy and binds local colour styles; 50:2565 binds variables, with identical values. Typography 15:2046 and 50:2065 are exact duplicates.

**Icons**
21. Icon sets are mixed: outline at 1.5px plus some filled glyphs (Account, carets, Mail Filled, Placeholder), two chevron styles, a duplicate "Endocrinology Services", an unnamed "04" icon, and typos in names.
22. The Doctor card "View Details" pill is offset 30px from centre (50:1588 / master 50:610).
