# DH Design System REF — Navigation, Content, Data-display & Feedback components

Source: Figma file `FozlGvhO1ZjI2GbklegqFf` ("DH Design System REF", Dubai Health Standard UI). Extracted read-only, 2026-11-12.
Pages covered: `50:7958` Page indicators, `50:9703` Breadcrumbs, `50:9895` Tabs, `50:10048` Burger Menu, `50:10464` Navigation, `50:13532` Cards, `50:13705` Content Components, `50:22402` Navigation Components (Map navigation).

Conventions used below
- Font family everywhere is **Dubai** (Regular 400 / Medium 500 / Bold 700). Named text styles are quoted as `Style name` (size/line-height).
- Colour variables are quoted as `Collection/Name` with hex.
- "Symbol" = Figma component (variant) — the only things that are real reusable components. Everything listed as "pattern" is a page example built from frames/instances and has **no** component set.
- Desktop canvas = 1440 px (some 1512 px); mobile canvas = 393 px and 375 px.

## 0. Shared tokens seen across these pages

| Token | Hex | Where used |
|---|---|---|
| `Primary/Navy Blue` | #002F70 | primary text, active pagination dot, tab text, nav underline, footer bg |
| `Primary/Navy Blue/800` | #335C85 | tab-bar bg, subtitle text |
| `Primary/Navy Blue/600` | #6685A3 | doc labels |
| `Primary/Navy Blue/500` | #8099B2 | breadcrumb current page (dark version) |
| `Primary/Navy Blue/300` | #B2C2D1 | doc labels |
| `Primary/Navy Blue/200` | #CCD6E0 | dividers (pagination top border), breadcrumb current page (light) |
| `Primary/Navy Blue/100` | #E5EBF0 | list dividers, tab borders, header bottom border |
| `Secondary/1. Blue` | #32AFFC | expanded menu-item text/underline, breadcrumb links on dark bg, footer links/icons |
| `Secondary/9. Blue Black` | #0A233C | carousel-indicator demo background |
| `Secondary/10. White` / `Greyscale/White` / `Base/White` | #FFFFFF | |
| `Secondary Tints/3. Green/300` | #DBFFE4 | "Donate" pill |
| `Secondary Tints/1. Blue/200` | #D6EFFE | "Book appointment" pill |
| `Brand/Primary` | #177DB7 | (referenced by pagination) |
| `Shadow 2` | 0 25px 26px -22px #00336614 | mobile header bottom shadow |
| ghost pill bg | rgba(0,47,112,0.04) (no variable) | header icon buttons / language / login pills |

Text styles seen: `Web/Button text 1` (Bold 18/20), `Web/Button text 2` (Bold 16/20 or 16/23 — **inconsistent line-height**), `Web/Body Default` (Regular 16/22 and 16/20 — **inconsistent**), `Functional/16/Bold` (16/20), `Functional/16/Regular` (16/20), `Functional/16/Bold Uppercase` (16/20 uppercase), `Functional/14/Medium` (14/18), `Functional/14/Regular` (14/18), `English/Label/Large` (Medium 14/20, +0.5 tracking), `Mobile/Heading 3` (Bold 14/20), `Mobile/Subheading 1` (Regular 14/18).

---

## 1. Pagination — `50:8044` (instance; main component `50:8045` "Pagination") — page *Page indicators*

Purpose: numbered page navigation for long lists/search results.

**Variants:** none exposed (single instance, no component-set properties). Only one state composition is shown: page 1 active, Previous disabled.

| Part | Spec |
|---|---|
| Container | width 856 (fluid), `border-top: 1px #CCD6E0` (`Primary/Navy Blue/200`), `padding-top: 24px`, flex `justify-content: space-between; align-items:center` |
| Prev / Next buttons (`Buttons` instances) | flex, gap 8, 24px arrow icon (arrow left / arrow right, chevron-style); label `Web/Button text 1` Bold 18/20 #002F70, capitalize. **Disabled Previous = opacity 0.5** |
| Page list | flex gap 16, centered |
| Page item (`cta`) | padding 12, radius 35 (pill/circle), width 44 (inactive) / 48 (active); text 16px |
| Active page | bg #002F70, text white, `Web/Button text 2` Bold 16/23 → renders 48×48 circle |
| Inactive page | transparent bg, text #002F70 `Web/Body Default` Regular 16/22 |
| Ellipsis | "..." rendered as same inactive item (non-interactive implied) |

Gaps: no hover / focus / pressed states for page items or prev/next; no mobile/compact variant; no "first/last" controls; ellipsis is just a text item; Next has no disabled example; not a variant set (can't toggle states).

## 2. Carousel indicator — component set `50:8076` — page *Page indicators*

Purpose: dot indicator for carousels/banners (shown on dark background `#0A233C`).

| Variant | Node | Size | Anatomy |
|---|---|---|---|
| `Controls=No` | `50:8077` | 42×6 | 4 dots only (flattened vector) — active dot white, others translucent |
| `Controls=Yes` | `50:8082` | 202×40 | flex gap 16, padding 8: `chevron_left` 24px · active dot (play/pause control, 10px, with circular progress ring `Circular Progress`, `motion_photos_pause` icon) · 4× `_dot_indicator` 8px · `chevron_right` 24px |

Sub-components: `_dot_indicator` (`Active=false/true, Platform=Web` — inactive 8px, active 10px with "Loading" animation variant `50:8005`, circular progress `Progress=0%` `50:7976`). Active dot doubles as autoplay pause/progress indicator.

Gaps: only an on-dark colourway; no light-background version; no hover/focus on chevrons/dots; no disabled chevrons at ends; no mobile variant; progress only at 0%.

## 3. Breadcrumbs — component set `50:9802` — page *Breadcrumbs*

Purpose: hierarchy trail. Annotation: *"Use only following breadcrumb styles to navigate the DH website. Use it based on the background color."*

| Variant | Node | Use on | Link colour | Current page colour |
|---|---|---|---|---|
| `Version=Dark` | `50:9803` | light backgrounds (dark text) | #002F70 `Primary/Navy Blue` | #8099B2 `Primary/Navy Blue/500` |
| `Version=Light` | `50:9814` | dark backgrounds/hero | #32AFFC `Secondary/1. Blue` | #CCD6E0 `Primary/Navy Blue/200` |

Anatomy (345×20): flex row gap 4, items center → home icon "Health centre 2" 20px → `chevron-right` 16px → `_Breadcrumb button base` (link, `Web/Button text 2` Bold 16/20 capitalize) → `arrow right` 16px separator → … → current page `Web/Body Default` Regular 16/20 (not capitalized).

Gaps: separator inconsistent (first separator is `chevron-right`, later ones `arrow right` icon); no hover/focus/visited on links; no truncation/overflow (collapsed "…") pattern; no mobile behaviour; no RTL example.

## 4. Tabs — instance `50:9910` (main `50:9914` "Tabs") + sub-component set `50:9930` — page *Tabs*

Purpose: switch multilayered sections. Annotation: *"Use only following tabs to navigate the multilayered section."*

Tab bar (`50:9914`): 872×80, bg #335C85 `Primary/Navy Blue/800`, top radius 12 (`border-top-left/right-radius:12px`), tabs share width equally (`flex:1`). Shown `position: sticky; top:0` in the page frame.

Tab item sub-component `Tab subcomponents` — props: `Active` (Yes/No), boolean `Leading icon`, `Trailing icon`, `Text label`, text `text`, instance-swap icons.

| Property | `Active=Yes` (`50:9931`) | `Active=No` (`50:9935`) |
|---|---|---|
| Size | 218×80 (h 80 fixed) | 218×80 |
| Padding | 12px 24px | 12px 24px |
| Background | #FFFFFF | transparent (inherits bar #335C85) |
| Border | 1px #E5EBF0 left/right/top, radius 12 12 0 0 | 1px #E5EBF0 bottom only |
| Label | `Web/Button text 1` Dubai Bold 18/20, #002F70, centered, capitalize | Dubai Regular 18/24, #FFFFFF |
| Icons | 24px placeholders leading/trailing, navy | 24px white |

Gaps: no hover, focus, disabled states; no mobile/scrollable variant (872 px bar on desktop only); no light-background tab style; label line-height differs between states (20 vs 24); active state relies on colour/shape only.

## 5. Hamburger (Burger) Menu / Overlay — component set `50:10087` — page *Burger Menu* (frame titled "Overlays")

Purpose: off-canvas navigation drawer. Annotation: *"Use only following overlays in the DH design."*

| Variant | Node | Size | Content |
|---|---|---|---|
| `Device=Web` | `50:10088` | 365×960 | Close "X" (top-right, ~24px, navy), 2 titled groups ("TITLE" + 5 items, first has sub-menu chevron-down), app-store badges pinned to bottom ("DUBAI HEALTH APP") |
| `Device=Mobile` | `50:10126` | 365×855 | No close button (opened from header burger). Primary items Care (chevron-right → drill-down) / Learning / Discovery / Giving, then 2 titled groups, then app badges |

Drawer container (mobile spec): bg #FFFFFF, `filter: drop-shadow(0 0 10px rgba(183,183,183,0.3))`, padding 42 32 16 32, flex column gap 24; inner list `overflow-y:auto`. Group title (`Menu Item Group / Underlined`): h 40, py 8, `Functional/16/Bold Uppercase` #002F70. App badges: App Store 135×45, Google Play 154×45, gap 12.

### 5a. Menu Item — component set `50:10172`

| Variant | Node | Height | Spec |
|---|---|---|---|
| `Sub-menu=No, Expand=No` | `50:10173` | 40 | label `Functional/14/Medium` (Medium 14/18) #002F70; bottom border 1px #E5EBF0 |
| `Sub-menu=Yes, Expand=No` | `50:10175` | 40 | + trailing `Arrows/Down` 24px |
| `Sub-menu=Yes, Expand=Yes` | `50:10177` | 160 | label + `Arrows/Up` turn #32AFFC `Secondary/1. Blue`; bottom border 2px #32AFFC; children indented `padding-left:24px`, each 40px row with 1px #E5EBF0 divider |

Width 301 (fills drawer). Mobile root items use `Arrows/Right` (drill-in) — not a defined variant of Menu Item (override).

Gaps: no hover/focus/pressed/current-page states; no backdrop/scrim spec for overlay; no animation spec; drill-in (Arrows/Right) behaviour undocumented; no close button on mobile variant.

## 6. Top navigation (Header) — component set `50:10831` — page *Navigation*

Annotation: *"Use only following navigations for the DH design."* Columns labelled "Web" and "Mobile".

| Variant | Node | Size |
|---|---|---|
| `Device=Web, Type=Default, Mega Menu=No` | `50:10832` | 1440×96 |
| `Device=Web, Type=Hover, Mega Menu=Yes` | `50:11042` | 1440×548 (header + open mega menu "Facilities") |
| `Device=Web, Type=Other services-, Mega Menu=No` | `50:10964` | 1512×64 |
| `Device=Web, Type=Login or register, Mega Menu=No` | `50:10995` | 1512×88 |
| `Device=Mobile, Type=Default, Mega Menu=No` | `50:10866` | 393×166 |
| `Device=Mobile, Type=Responsive - 375, Mega Menu=No` | `50:10894` | 375×126 |
| `Device=Mobile, Type=Responsive - 393, Mega Menu=No` | `50:10917` | 393×136 |
| `Device=Mobile, Type=Other services, Mega Menu=No` | `50:10989` | 393×110 |
| `Device=Mobile, Type=Login or register, Mega Menu=No` | `50:10937` | 393×166 |

(9 variants; note the trailing "-" typo in "Other services-" and inconsistent widths 1440 vs 1512.)

### 6a. Web / Default (`50:10832`)
- Bar: bg #FFFFFF, `border-bottom:1px #E5EBF0`, h 96, padding-left 212 (reserves space for logo block), padding-right 64; inner container h 80, `justify-content:space-between`, aligned to bottom.
- **Logo block**: absolute navy (#002F70) square at left 64px, ~136 px wide × ~133 px tall — overhangs the 96px bar by ~37px; white stacked "DH logo" inside.
- Left cluster: burger button 40px wide round (`border-radius:64px`, `drop-shadow(0 3px 9px rgba(0,0,0,.2))`, 24px icon) + primary menu items.
- **Menu items** sub-component set `50:11253`: `Selected=Yes` `50:11254` (64×80), `Selected=No` `50:11258` (62×80). h 80, px 16, text 16/20 #002F70 — selected = `Functional/16/Bold` + 4px underline bar #002F70 at bottom, inset 16px left/right, top radius 8; unselected = `Functional/16/Regular`.
- Right cluster (gap 16): Search (40×40 circle, 20px icon), Accessibility (40×40 circle, 20px icon), Language pill "العربية" (h40, px16, `English/Label/Large` Medium 14/20 +0.07px), **Donate** pill bg #DBFFE4, **Book appointment** pill bg #D6EFFE (both h40 px16, `Functional/14/Regular` 14/18 #002F70), Login pill (pl 8 pr 16, 24px account icon + "Login" 14/18). Ghost pills use bg rgba(0,47,112,0.04), radius 100.

### 6b. Web / Hover + Mega Menu (`50:11042`)
Header in the same layout but with shadow; dropdown panel below: left column (light grey-blue bg, ~350px) with 4 category cards (Facilities [selected: white card, radius ~8, chevron-right], Departments and Specialties, Patients and Visitors Support, Insurance — each 24px icon in rounded square + title Medium 14 + 2-line 12px description). Right: 3 link columns (Hospitals / Ambulatory Health Centers / Medical Fitness Centers) with headings Bold 16, links Regular 14, "View All >" link in #177DB7-ish blue. See §7.

### 6c. Web / Login or register (`50:10995`)
bg #FFFFFF, border-bottom 1px #E5EBF0, h 88, px 64, space-between. Left: horizontal DAHC logo (41×40 mark + 103×28 wordmark). Right gap 16: phone 20px + "800 DH" (Medium 14/20) | 20px vertical divider (#CCD6E0) | `eye-off` 20px (accessibility/visual mode) | divider | "عربي" Bold 14/20.

### 6d. Web / Other services (`50:10964`) — 1512×64
Logo (horizontal) left; right: `eye-off` icon, "عربي", "PROFILE" (user icon), "LOG OUT" separated by vertical dividers; uppercase Medium labels. White bar with bottom shadow.

### 6e. Mobile / Default (`50:10866`) — 393×166
- iOS status bar 54px on navy #002F70.
- Utility strip (navy, py 6 px 16, gap 16): phone 24px + "800 DH" `Mobile/Heading 3` Bold 14/20 #E5EBF0; right: "عربي" `Mobile/Subheading 1` Regular 14/18 #E5EBF0 + accessibility 24px.
- Main bar (white, ~68px, `Shadow 2` = 0 25px 26px -22px rgba(0,51,102,0.08)): horizontal DH logo (left 16) + burger "Menu" icon (right 16, 24px).

### 6f. Mobile Responsive 375 / 393 (`50:10894`, `50:10917`)
White status bar (time dark), navy square logo block (~56px) left, search 24px + burger 24px right; 393 variant has larger logo block. Used as scroll/compact variants.

### 6g. Mobile Other services (`50:10989`) / Login or register (`50:10937`)
Other services: white bar, centred logo mark, burger right, shadow. Login: navy utility strip (800 DH, عربي, accessibility) + centred horizontal logo on white.

Breakpoints implied: ≥1440 desktop header; mobile frames at 393 and 375. No tablet (768/1024) variant. Web header collapses to burger + logo on mobile (primary links move into Hamburger Menu §5 `Device=Mobile`).

Gaps: no hover/focus states for nav items (except "Hover" variant used to show mega menu), no keyboard focus ring anywhere, no tablet breakpoint, sticky/scroll behaviour not annotated, "Type=Hover" is used as a variant name for an open state, logo overhang is an absolute element (fragile in code).

## 7. Mega Menu — component set `50:11262` (page *Navigation*, frame "Mega menu" `50:11261`)

Purpose: desktop dropdown panel opened from a primary nav item (Care…).

| Variant | Node | Size |
|---|---|---|
| `Menu=Facilities` | `50:11372` | 1440×452 |
| `Menu=Departments` | `50:11263` | 1440×468 |

Layout (Facilities): flex row.
- **Left category rail** (`Menu Item Group / Mega Menu Groups`): width 509, bg #ECF2F5 `Primary/Page background`, padding 64 24 64 64, gap 12.
  - `Menu Item / Mega Menu Item` (category): px 16, py 8, gap 8; 40×40 white icon frame radius 12 with 24px icon at 8,8; title 16/24 + description `English/Label/Small` Medium 11/16 (+0.055–0.2 tracking).
  - **Active/selected category**: white card behind (`ActiveState`) radius 16, `Shadow 3` (0 8 12 -6 rgba(0,51,102,0.08)); title `English/Title/Medium` Bold 16/24 +0.1; trailing `Arrows/Right` 24px. Description #002F70.
  - Inactive category: no card; title Regular 16/24 #002F70; description #335C85.
- **Right link area**: bg #FFFFFF, flex:1, padding 64 64 64 24; 3 equal columns (gap 24, content width 843).
  - Column heading: Bold 20/24 #002F70 (row h 40, px 16).
  - Link rows: Regular 16/24 #002F70, row h 40, px 16, radius 8.
  - "View all" link: `Web/Button text 2` Bold 16/20 #32AFFC + 16px arrow-right, gap 4.

Gaps: no hover state for link rows/categories other than the selected card; no keyboard/focus; no close behaviour; no mobile equivalent (mobile uses drill-down Hamburger Menu); Departments variant not separately documented (same pattern).

## 8. Bottom navigation (Footer, Sticky bar, Login footer) — component set `50:11045` — page *Navigation*

| Variant | Node | Size |
|---|---|---|
| `Size=Web, Type=Footer` | `50:11046` | 1512×312 |
| `Size=Web, Type=Sticky Bar` | `50:11093` | 1512×64 |
| `Size=Web, Type=Login` | `50:11126` | 1512×44 |
| `Size=Mobile, Type=Footer 393` | `50:11129` | 393×550 |
| `Size=Mobile, Type=Footer 375` | `50:11190` | 375×550 |
| `Size=Mobile, Type=Login` | `50:11123` | 393×78 |

### 8a. Web Footer (`50:11046`)
- bg #002F70, padding 64 (content width 1384), two rows (row 1 h 56 at y64, row 2 at y160).
- Row 1: white DH logo 74×56 · 1px×40 vertical divider · nav items gap 36 ("About Dubai health", "Media center", "Contact us", "Careers", "Privacy policy") `Functional/16/Bold` 16/20 white (hidden caption + chevron slots exist in `nav-item`). Right: "Reach us on" `Functional/12/Regular` 12/16 + phone icon 24 + "800 60" `Web/Heading 4` Bold 20/24 #32AFFC.
- Divider line (#335C85 `Primary/Navy Blue/800`).
- Row 2: copyright `Functional/14/Regular` 14/18 #6685A3; 5 social icons 24px, gap 24, #32AFFC (X, LinkedIn, Facebook, Instagram, Threads).

### 8b. Mobile Footer 393/375 (`50:11129`, `50:11190`)
Centred stack on #002F70: logo, 5 links (Bold ~14, white, centred), "Reach us on" + phone + "800 60" (#32AFFC), divider, social icons row, copyright (2 lines, 12px, #6685A3), then a row of 5 white circular quick-action buttons (~40px: happiness, accessibility, apps | mail, location) — mobile counterpart of the sticky bar.

### 8c. Sticky Bar (`50:11093`)
bg #FFFFFF, `filter: drop-shadow(0 -4px 10px rgba(0,0,0,0.16))`, px 24, h 64. Left (gap 16): Happiness 32px | 1px divider 40h | "04" (accessibility) 32px | divider | Apps 32px + "Services" `Functional/16/Regular`. Right: text buttons (radius 100, pl 16 pr 24 py 14, 20px icon + label Regular 16/24 #002F70): "Locations", "Media Center", "Contact Us" separated by full-height 1px dividers (#E5EBF0) + Chat 32px icon.

### 8d. Login footer (Web `50:11126` / Mobile `50:11123`)
Top border 1px #E5EBF0; "Privacy policy" Bold 14 #002F70 + "© 2023 Dubai Health. All rights reserved." Regular 12–14 #6685A3. Mobile: centred, stacked.

Gaps: copyright text inconsistent ("Dubai Health" vs "Dubai Academic Health Corporation"); footer link hover/focus missing; sticky-bar button states missing; 1512 vs 1440 widths inconsistent with header.

## 9. Map navigation (location side-panel) — component set `50:22424` — page *Navigation Components*

Purpose: left panel overlay on a map page ("Where You Can Find Us") — search, filter chips, facility detail.

| Variant | Node | State shown |
|---|---|---|
| `Property 1=Default` | `50:22425` | Search empty; filter chips (Hospitals selected); "Questions?" help block |
| `Property 1=Variant4` | `50:22468` | Search typed ("Rash") with autocomplete dropdown (group label "Facilities", typed part bold-highlighted in "Rashid Hospital") |
| `Property 1=Variant3` | `50:22524` | Facility detail: "< Back" link, name, address, "Visit Facility Page >", phone, Emergency Timings (orange 24/7 badge), Visiting Patient Hours list, info note |

Panel: 440×750, white, radius ~24, `Shadow 1` (0 25 36 0 rgba(0,51,102,0.08)); padding 24; content width 392; 2×40 px scrollbar handle `Rectangle 1133` at right (custom scrollbar).
- Title: `Web/Heading 3` Bold 24/28 #002F70.
- Search input (`Input`, 392×48): radius 12, border #CCD6E0/#8099B2, 20px `search-md` icon at 16px, placeholder `Web/Input field` Regular 18/24 #8099B2. Typed state: dropdown in the same white card with shadow, divider, group label 14 #6685A3, option `Functional/18/Medium` with `Functional/18/Bold` match highlight.
- Filter chips (`cta`, h 34): pill, px 16 py 8, text 16/18; **selected** bg #002F70 white Bold (`Web/Button text 2`); **unselected** bg #E5EBF0 border #CCD6E0 text #002F70 Regular. Hidden 4th chip "More Filters >" with chevron.
- Divider 1px #CCD6E0. "Questions?" `Web/Subheading 1` Medium 22/28. Help rows: 24px icon (`help-circle`, `message-question-circle`) + title Bold 18/20 + description 14/18 #335C85; email link "Fill out our inquiry form >" #32AFFC with 12px arrow.
- Detail: phone row 24px icon + "800 DH" `Functional/18/Medium`; timing badge bg #FABC4C `Secondary/5. Orange` (radius 8, clock icon, `Web/Chip text 1` Bold 16/23); day pills bg #D6EFFE `Secondary Tints/1. Blue/200` (clock 24 + Medium 16/20); info note 14/18 #6685A3 with underlined "here" link.

Gaps: variant names "Variant3/Variant4" unnamed; no loading/"no results" state; no mobile (bottom-sheet) version; chip hover/focus missing.

## 10. Cards — page *Cards* (`50:13532`) — 6 component sets, each `Property 1=Default|Hover`

Hover is the only interaction state documented (no focus/pressed/disabled).

### 10a. Image Card - 1 — `50:13533` (`Default 50:13534`, `Hover 50:13540`) 420×408
bg #FFF, border 1px #CCD6E0, radius 16, overflow hidden. Image 420×280 (object-cover). Body (`half-banner`): px 24 py 16, gap 8, `backdrop-filter: blur(2px)`; title `Web/Heading 3` Bold 24/28 #002F70 capitalize; text `Web/Body Default` 16/20 #002F70.
**Hover**: image zooms (456×304 at -18,-12 ≈ scale 1.086); nothing else changes.

### 10b. Doctor Card — `50:13546` (`Default 50:13547`, `Hover 50:13562`) 264×428
bg #FFF, radius 12. Photo 264×264. Body p 16, gap 12, border l/r/b 1px #E5EBF0: specialty `Web/Body Small` 14/18 #32AFFC; name `Web/Heading 4` Bold 20/24 #002F70 single-line ellipsis; title `Web/Button text uppercase` Medium 14/20 uppercase #4D7094. CTA row (`cta`) p 16, gap 6, border l/r/b #E5EBF0, bottom radius 12: 24px calendar icon + "Request Appointment" Bold 16/18 #32AFFC.
**Hover**: overlay rgba(0,47,112,0.6) over photo + centred white pill "View Details" (px 24 py 12, radius 35, `Web/Button text 1` 18/20 #002F70) moves from +20px to centre, opacity 0→1.
Variants on *Content Components* (`_Doctor` frames): 206×284 leadership (no CTA), 250×318 and 175×327 mobile, 424×469 facility variant — plus "Help icon" and **Tooltip** (§17).

### 10c. Article card — `50:13577` (`Default 50:13578`, `Hover 50:13589`) 289×300
bg #FFF, border 1px #E5EBF0, radius 16. Image top ≈141px with top radius 16. Content inset ~16px: title `Web/Heading 4` Bold 20/24 #002F70; excerpt 16/20 #1A4775 `Primary/Navy Blue/900`, fixed h 48, ellipsis (2 lines). Footer row gap 16: date 16/20 #6685A3; **category tag** bg #EFBFE2 `Secondary/8. Pink`, px 12 py 4, radius 6, `Web/Chip text 2` Bold 12/16 #002F70.
**Hover**: `Shadow 1` 0 25px 36px rgba(0,51,102,0.08).

### 10d. Actionable card — `50:13600` (`Default 50:13601`, `Hover 50:13610`) 328×156
bg #FFF, border 1px #E5EBF0, radius 12, p 24, gap 16. Title `Web/Button text 1` Bold 18/20 #002F70; description `Web/Body Small` 14/18 #1A4775 (block h 72). Footer space-between: "Read more" `Functional/16/Regular` #002F70 · "Start Service" `Web/Button text 2` Bold 16/20 #32AFFC + 12px arrow.
**Hover**: drop-shadow 0 12px 12px rgba(0,51,102,0.12) (token `Shadow 4` = 0 12 24 -8 #0033661F — rendered value differs from token).

### 10e. Actionable card 2 (icon feature) — `50:13619` (`Default 50:13620` 322×268, `Hover 50:13625` 322×260)
Centred column, pt 24 pb 40 px 24, bg #FFF. Icon 48px (Hospitals, #32AFFC). Title Bold 26/32 #002F70 (h 64, 2 lines); text 16/20 #1A4775.
Default: radius 20, gap 24, no border. **Hover**: radius 12, gap 16, border 1px #E5EBF0, drop-shadow 0 12 12 rgba(0,51,102,.12). (Radius & gap change between states → layout shift.)

### 10f. Specialy card [sic] (specialty list card) — `50:13630` (`Default 50:13631`, `Hover 50:13636`) 334×68
bg #FFF, border 1px #E5EBF0, radius 16, h 68, p 16, gap 12. Leading icon chip: white circle p 6 radius 40 with 18px `activity` icon. Label `Web/Button text 2` Bold 16/18 #002F70 capitalize. Trailing 24px arrow-right. **Hover**: drop-shadow 0 8 6 rgba(0,51,102,0.08) (`Shadow 3`).

Card gaps: no focus-visible, pressed, disabled, skeleton/loading states; mobile versions exist only as examples; name typo "Specialy".

## 11. Content Components page (`50:13705`) — overview

**Important:** this page contains only **2 real component symbols** (Accordion `State=Collapsed/Expanded`). Everything else (587 instances, 9 top-level frames) is page-pattern examples assembled from frames.

| Frame | Node | What it shows |
|---|---|---|
| Stats | `50:14538` | Statistics band + stat tiles |
| Partners | `50:17248` | Insurance logo strip |
| Doctor details | `50:18173` | Doctor profile hero, tabs, timeline, chips (web + mobile) |
| Other services | `50:17281` | Service tile grid, compact service rows, mobile list + mobile pagination |
| Banner | `50:16802` | Hero carousel, specialty banner, page-header banners (web + mobile) |
| Cards | `50:14594` | ~20 card patterns (web left, mobile right at x≈1811) |
| Content | `50:15775` | Article/news/event detail, image+text, link lists, forms, related content |
| Modal | `50:17179` | Success / leave-site modals (web + mobile), map popovers |
| Content (2) | `50:17593` | Eligibility table, steps, FAQs, chips, specialty grid, Accordion component |

## 12. Accordion — component set `50:17721` "FDP - Specialy accordion" (the only real symbol on Content Components)

| Variant | Node | Size |
|---|---|---|
| `State=Collapsed` | `50:17722` | 872×62 |
| `State=Expanded` | `50:17727` | 872×607 |

Header row: p 16, gap 12, align center; icon chip bg #EBF7FF `Secondary Tints/1. Blue/100`, p 6, radius 40, 18px `activity` icon; title `Web/Button text 2` Bold 16/18 #002F70; trailing text toggle "More Information" / "Less Information" `Web/Body Small` 14/18 #32AFFC + 18px arrow down/up. Collapsed: border-bottom 1px #E5EBF0.
Expanded body (gap 24): 1px #E5EBF0 divider inset 16; sections (px 16, gap 8) with heading `Web/Heading 4` Bold 20/24 #002F70 + body `Web/Body Default` 16/20 #335C85; "Services/procedures available" list (gap 4); **Channels** / **Eligibility** groups of static tags (bg #E5EBF0, h 36, px 12 py 6, radius 6, Regular 16/24 #002F70, flex-wrap gap 8). Footer bar: bg #EBF7FF, border-bottom #E5EBF0, p 16, space-between: calendar 24 + "Book an Appointment" `Web/Button text 1` Bold 18/20 #32AFFC · "Learn more about …" Bold 16/18 #32AFFC.
Gaps: no hover/focus on header; toggle is a text link not the whole header; domain-specific (not a generic accordion).

### 12a. FAQ accordion (pattern) — `50:18085` (also in `50:15775`)
Heading `Web/Heading 2` Bold 26/32. Items: border-bottom 1px #E5EBF0, py 12, gap 16; question `Functional/16/Medium` 16/20 #1A4775; 20px chevron-down #002F70. "View more >" link #32AFFC 18/24 (**Gilroy Bold — font inconsistency**). Only the collapsed state is drawn; no expanded answer style.

## 13. Data table — "Service eligibility" matrix (pattern) — `50:17607`
Card: bg #FFF, radius 12, p 24, gap 24, `Shadow 3`. Title `Web/Heading 4` 20/24.
Header row: right-aligned column labels (Residents / Visitors / UAE Nationals) Regular 16/20 #6685A3, each column 64 wide, gap 8. Rows: label Regular 16/20 #002F70 (single-line ellipsis), gap 16; cells = 32px circle radius 16: **yes** bg #002F70 + white 16px check; **no** bg #E5EBF0 + 16px x (#002F70). Row dividers 1px #CCD6E0, vertical gap 16.
Gaps: the only tabular display in scope — no generic table component (no sortable header, zebra, row hover, pagination, responsive/stacked mobile version, empty state).

## 14. Stepper / process steps (pattern) — "Service Steps" `50:17679`
Vertical stepper: number badge 32×32 radius 16 bg #E5EBF0, Regular 14/18 #002F70; connector 1px×78 #E5EBF0; gap 4 (badge→line), 12 (badge→text). Step name `Web/Subheading 1` Medium 22/28 #335C85; sub-title 16/20 #4D7094; description 14/18 #99ADC2 `Primary/Navy Blue/400`. Section title `Web/Heading 2` 26/32.
Gaps: no active/completed/current states (all identical); no horizontal stepper; "Steps / Infographics" (`50:17800`) is only an image placeholder.

### 14a. Timeline (pattern) — Doctor details Experience / Education (`50:18180`, mobile `50:18361`)
Left year column (#8099B2) or hollow circle marker for current item, 1px vertical line; entry title Medium 18 #002F70, sub-text 14 #4D7094, date range 14 #8099B2 ("2011 - Present"). Not a component.

## 15. Tags / chips (patterns used across content)
| Type | Spec | Where |
|---|---|---|
| **Functional chip** (link; `Functional chips` instance) | bg #E5EBF0, border 1px #CCD6E0, h 36, px 16 py 8, radius 48, gap 8, Regular 16/18 #002F70 capitalize, 20px arrow-right | Facilities `50:17838`, doctor "Practices at" (white variant) |
| Filter chip (selectable) | selected: bg #002F70, white Bold 16/18; unselected = functional chip without arrow | Map nav, insurance search toggle |
| **Informational tag** (`Informational tags` instance) | h 30, pl 10 pr 12 py 6, radius 8, gap 4, 20px icon + Regular 14/18 #002F70; bg #AC9DFF `Secondary/7. Purple` (location / In-Person), #77DEFC `Secondary/2. Light Blue` (Full Time / Telemedicine), #FABC4C orange (24/7) | Job card, doctor consultation type, map detail |
| Static tag (rect) | bg #E5EBF0, h 36, px 12 py 6, radius 6, Regular 16/24 | Accordion channels/eligibility |
| Category label (article) | bg #EFBFE2 pink (yellow #FABC4C "EVENT" also seen), px 12 py 4, radius 6, Bold 12/16 | Article card, news list |
| Doctor-detail chips | light blue (#ADDFFE-ish), radius ~6, Regular 12–14 #002F70 | Languages, "What this doctor can help you with" (`50:18180`) |
Gaps: chips/tags are not component sets on these pages (instances of components from other pages); no hover/focus/disabled matrix; no removable chip.

## 16. Modal / Dialog (pattern) — frame "Modal" `50:17179`
| Example | Node | Size | Content |
|---|---|---|---|
| Success, web | `50:17186` | 648×298 | success icon (blue), title, supporting text, close |
| Success, mobile | `50:17194` | 372×298 | same, narrower |
| Leave-site warning w/ CTA, web | `50:17211` | 648×316 | warning icon (orange), title, text, "Continue" outline button |
| Leave-site warning, mobile | `50:17202` | 388×370 | |
Spec (`50:17211`): bg #FFF, border 1px #E5EBF0, radius 20, `Shadow 1` (0 25 36 rgba(0,51,102,0.08)); content centred, width 552 (48px side padding). **Featured icon outline** 52px with two concentric 2px rings (inner opacity 0.3 inset -14%, outer opacity 0.1 inset -32%) in #FABC4C `Secondary/5. Orange` (warning) or #32AFFC (success); top 64. Title `Web/Heading 2` Bold 26/32 #002F70 at y152; text `Web/Body Default` 16/20 #1A4775 at y206; CTA outline pill: border 1px #002F70, px 24 py 8, radius 30, label 14/20 #002F70 (**Source Sans Pro SemiBold — font inconsistency**). Close: 36px circle (bg #E5EBF0, x icon) top-right at 16/16.
Gaps: not a component; no backdrop/scrim spec, no focus-trap/Esc annotation; no error/destructive variant; no multi-action footer; success modal has no button.

### 16a. Map popover / info-window (pattern) — `50:17220`, `50:17227`, `50:17234`, `50:17241`
bg #FFF, border 1px #E5EBF0, radius 20, drop-shadow 0 25 18 rgba(0,51,102,0.08), px 32 py 16, gap 24; facility name `Web/Heading 4` Bold 20/24 centred; "GET DIRECTION" link (18px location icon + Bold 16/20 #32AFFC underlined). Large and small sizes; 1-line and 2-line names.

## 17. Tooltip (instance on *Content Components*, `50:15144` inside "Help icon" `50:15142`)
bg rgba(0,47,112,0.9), px 12 py 8, radius 8; text `Web/Overhead text` Regular 12/16 white, single line ("Doctor Available for Telemedicine"); arrow 28×6 at bottom, aligned to end (placement "top-end"). Trigger: "Help icon" 36×36 white circle radius 24 with 24px Telehealth icon (doctor card image corner). Second instance `50:15141` hidden.
Gaps: one placement only; no light variant; no max-width/multiline rule; no delay/trigger annotation.

## 18. Statistics (patterns) — frame "Stats" `50:14538`
### 18a. Insights band "Care in Numbers" `50:14545` (1440×358)
bg #002F70, padding 60 64 70, gap 40, centred. Title `Web/Heading 1` Bold 36/40 white. 4 `statistics-block` (flex:1, gap 24; inner gap 16): 48px white line icon; value Bold 60/60 #A5FFBC `Secondary/3. Green`; label Regular 20/24 white. Mobile: 2×2 grid (seen in `50:15775` mobile column).
### 18b. Stat tile (`_Feature text`) `50:14569` (row of 3, gap 16)
bg #002F70, radius 16, p 24; 32px icon + column gap 8: label Medium 20/24 #ECF2F5; value Bold 24/20 #A5FFBC; year Regular 16/20 #ECF2F5. Mobile: stacked full width.
Gaps: no count-up note; no light variant; value line-height (20) < font size (24).

## 19. Banners / Hero (patterns) — frame "Banner" `50:16802`
| Pattern | Web node | Mobile node | Spec |
|---|---|---|---|
| Hero carousel ("Connected for You") | `50:16809` (Hero Gradient instance 1440×960) + content `50:16810` | `50:16812` Overlay 375×712, `50:16813` | Full-bleed image + gradient; text centred w 600: title `English/Display/Small` Bold 36/40 (-0.36 tracking) white; subtitle `English/Headline/Small` 24/32 white; gap 32 to **search field** 832×64 white radius 8, px 11, placeholder `English/Body/Medium` 14/20 #8099B2; Carousel indicator with controls (§2); mouse "Scrolling Indicator" 16.5×24 |
| Specialty image banner | `50:16857` (1512×280) | `50:16860` | photo with dark overlay, "Specialty Name" Bold ~36 white bottom-left |
| Page header — service | `50:16877` (1512×261) | `50:16927` | bg #D6EFFE, padding 61/64 64, gap 48: Breadcrumbs (Dark) → title `Web/Heading 1` 36/40 #002F70 + sub `Web/Body Large` 20/24 #4D7094 + primary button "Start Service" (bg #002F70, h 48, px 32, radius 30, Bold 20/24 white). Mobile: centred, compact |
| Facility header w/ info card | `50:16985` (1512×755) | `50:17036` | image banner + overlapping white info card (Location, Contact Number, Visiting Patient Hours day pills, light-blue footer note bar) |
| Search header "Discover Health" | `50:17127` | `50:17053` | light blue bg, title + text + white search field with clear (x) icon and shadow |
| Career header | `50:17138` | `50:17164` | bg #D6EFFE, breadcrumbs, title, divider, informational tags (Dubai / Full Time) |

## 20. Lists (patterns)
- **Specialty grid list** (`50:18047`, 4 cols; mobile `50:17776`): Specialy cards (§10f).
- **Link list** ("Title 2", Link 1…6 with chevron-right in 3 columns with underline separators) in `50:15917`.
- **Bullet lists** ("Required Documents", "Specialty Pre-Requisites" `50:17835`): disc bullets 14–16px #335C85.
- **Insurance partner list** (`50:15295` web, `50:15514` mobile): search + segmented toggle (`Search facility + partner` `50:15297`: white, border 0.5px #8099B2, radius 12, px 16 py 14; placeholder 16/20 #8099B2 opacity .8; toggle pills unselected bg #E5EBF0 border #CCD6E0 Regular 16/18, selected bg #002F70 white Bold 16/18, radius 48, px 16 py 8, gap 12). Rows `50:15299`: bg #FFF, border #E5EBF0, radius 16, pt 24 pb 20 px 24, gap 16; logo tile 120×120 (border #E5EBF0, radius 12); name `Web/Heading 4`; desc 14/18 #1A4775; website + phone (24px icons, Bold 14/20). Followed by **Pagination** (§1) on web and **mobile pagination** (§21) on mobile.

## 21. Service tiles, compact service rows & mobile pagination (patterns) — frame "Other services" `50:17281`
- **Service tile** (`50:17374`…, grid 3×4, 424×158, gaps 24): p 24, radius 16, gap 12; 48px icon circle (#EBF7FF) + 32px icon; title `Web/Heading 3` Bold 24/28; text 16/20. **Highlighted** tile: bg #32AFFC, white text ("Patient Portal"); default tiles: transparent, title #002F70, text #335C85. (Whether highlight = selected or hover is not labelled.)
- **Compact service row** (`50:17290`, 360×80): bg #FFF, border 1px #E6E9EB `Secondary Tints/9. Blue Black/100`, radius 6, drop-shadow 0 1 2 rgba(0,0,0,.25), p 8, gap 16; title SemiBold 16/24 #002F70, desc 14 #335C85; small CTA bg #002F70 h 28 px 16 radius 6, 12px white "Start Service". **Source Sans Pro font; radius/shadow off-system.**
- **Mobile "Welcome back" list** (`50:17510`): centred title, highlighted Patient Portal row (#32AFFC), icon list rows.
- **Mobile pagination** `50:17585` (361×48): two 48px outline circle buttons (border 1px #002F70, radius 35, px 12 py 14, 20px arrow) + "Page 1 of 10" Regular 16/22 #6685A3, space-between. No disabled state for first page.
- **Mobile service cards** (`50:17326`): title in muted grey-blue (looks disabled), description, full-width primary button "Start Service" (bg #002F70, radius ~4).

## 22. Other card patterns on Content Components › Cards (`50:14594`) — not components
| Pattern | Web node | Mobile node | Key spec |
|---|---|---|---|
| Category image card (Care/Learning/Discovery/Giving) | `50:14602` etc. (648×364) | `50:14986` (361×200) | radius 20, image + gradient `linear(180deg, rgba(10,35,60,0) → rgba(10,35,60,.83) 48% → #0A233C)`; title `Web/Heading 1` 36/40 white at left 40; link Bold 18/20 #32AFFC + 16px arrow |
| Info/CTA card "Need an appointment?" | `50:14646` (445) | `50:15094` | bg #ADDFFE `Secondary Tints/1. Blue/300`, radius 12, p 20, gap 16, 36px icon; title `Web/Heading 4`; text 14/18; primary button bg #002F70 radius 35 px 24 py 12 Bold 18/20 white |
| Info card "Call us at 800 60" | `50:14655` | `50:15102` | bg #B7FFC9 `Secondary Tints/3. Green/500`, same layout, no button |
| Icon feature tiles (Find a Doctor…) | `50:14666` (4×322) | `50:15032` | = Actionable card 2 |
| Image card small (Blood Donation) | `50:14692` (3×421) | `50:15053` | = Image Card - 1 |
| News: featured + list | `50:14708` (2×644) | `50:15066` | large image card + 3 horizontal items (thumb, title, text, "Learn more >", date, coloured tag) |
| Actionable card (Health card renewal) | `50:15766` | `50:15108` | = §10d |
| Doctor cards | `50:14765` (4×264), `50:14827` (4×206 leadership) | `50:15117`, `50:15145` | = §10b + tooltip/help icon |
| Article mini cards | `50:14856` (2×310) | `50:15160` | |
| Feature text ("Innovative Environment"…) | `50:14888` (4×328) | `50:15190` (stacked in light-blue "Why Dubai Health?" panel) | title Bold 18, text 14 |
| Job card (Relationship Manager) | `50:14910` (445×261) | `50:15216` | bg #FFF, border #E5EBF0, radius 16, pt 24 pb 20 px 24, gap 16; title `Web/Heading 4`; text 14/18 #4D7094; informational tags; divider #CCD6E0; "more information >" Bold 16/20 #32AFFC |
| Facility card (Dubai Hospital) | `50:14931` (424×469) | `50:15226` (250×320) | border #D6EFFE, radius 16, image h 280, p 24, gap 24; name 24; phone & address rows (24px icons, 18/20 #8099B2); "View more information >" #32AFFC 18/24 — **all text in Gilroy, not Dubai** |
| Reason cards ("Our Approach") | `50:14963` | `50:15274` | light-blue tiles, title Bold 16 + text 14 |

## 23. Detail-page patterns (Content `50:15775`, Doctor details `50:18173`)
- **Doctor profile hero** (`50:18180` web 1512, `50:18361` mobile 456): bg #D6EFFE, breadcrumbs, photo ~200×200 radius 12, name Bold ~32, role, primary navy pill "Book Appointment" or "View Profile >" link; labelled chip groups (Languages, Consultation type, "What this doctor can help you with", "Practices at" functional chips).
- **Doctor tabs**: Tabs (§4) at ~872px over the hero; on mobile the 4-tab bar overflows the 393 container (horizontal scroll implied, not specified). Tab panel: white card, shadow; sections Overview / Experience (timeline) / Education (timeline) / Research & Publications (bullets + "See Article Here ↗" + "View All Articles >").
- **Article detail** (`50:15805` web 872, `50:16246` mobile 393): title Bold 32, meta row (date, read time, "Share"), category tags, hero image radius 12, subheads Bold 18–20, body 16/20.
- **Event detail** (`50:15837`, mobile `50:16283`): tags, image, "Add to Calendar" navy pill with calendar icon, "Share", meta grid (Start / End / Time), body.
- **Image + text split** (`50:15877`, `50:15897`): 797-wide text block (H1/H2, body, "Read more >", "Download") beside 563×320 image radius 16; alternating sides.
- **Insurance logo strip** (`50:15782`, Partners `50:17255`): centred title Bold 26, 6 logos separated by 1px vertical dividers, link "Explore Our Insurances And Coverages >" #32AFFC; disclaimer 14 #6685A3.
- **Forms** at the bottom of `50:15775` (name, email, phone w/ country code, dropdowns, CV upload, CTA buttons) — belongs to form-components extraction; noted as page usage only.
- **Facility summary card** (`50:17923`): light-blue bg, name Bold 24, type, address + phone rows.

## 24. Empty states, alerts, toasts, progress, avatars, badges, skeletons
**Not present** in any of the 8 pages: no inline alert/notification banner, toast/snackbar, progress bar/spinner (only the carousel's circular progress ring), avatar component (doctor photos are plain images), count badge, skeleton loader, empty-state illustration, "no results" state, error page. These must be designed/derived for DAHC-UI.

## 25. Cross-cutting gaps & inconsistencies
1. **Focus states absent everywhere** — no focus ring on nav items, tabs, breadcrumb links, pagination, cards, chips, accordion headers or modal controls. Needs a defined focus token (e.g. 2px #32AFFC outline, 2px offset).
2. **Hover is the only interaction state** for cards; nav/tabs/pagination/breadcrumbs have none; pressed/disabled missing except Pagination "Previous" (opacity .5).
3. **Content Components page = examples, not components** (only the Accordion is a symbol). Cards, chips/tags, modal, tooltip, stepper, table, stats, banners need formalising.
4. **Font drift**: Gilroy (facility card, FAQ "View more"), Source Sans Pro (modal CTA, compact service rows); SF Pro only in mock status bars. DAHC-UI should use Dubai only.
5. **Line-height drift** for the same named style (`Web/Button text 2` 16/18, 16/20, 16/23; `Web/Body Default` 16/20 vs 16/22).
6. **Width drift**: header/mega menu 1440 vs other header variants/footer/sticky bar 1512; mobile 393 and 375 both used; **no tablet breakpoint** (768/1024) anywhere.
7. **Shadow drift**: `Shadow 4` token (0 12 24 -8 #0033661F) vs rendered 0 12 12 rgba(0,51,102,.12); modal 0 25 36; popovers 0 25 18; sticky bar 0 -4 10 rgba(0,0,0,.16); compact service row 0 1 2 rgba(0,0,0,.25).
8. **Radius drift**: 6, 8, 12, 16, 20, 24, 30, 35, 48, 64, 100 used for similar roles (pills 30/35/48/100; cards 12/16/20).
9. **Naming**: "Specialy card", "Other services-", "Variant3/Variant4", "Property 1", "Type=Hover" (used for an open state).
10. **RTL**: Arabic labels appear (العربية/عربي) but no mirrored RTL layouts for nav/breadcrumbs/pagination.
11. **Breadcrumb separators** mix `chevron-right` and `arrow right` icons.
12. **Tabs**: no mobile/scrollable spec although doctor-detail mobile overflows.
13. Annotations are minimal: only one-line page descriptions ("Use only following … in the DH design.") and "Ignore background color. Added to represent CTA placement." (`50:17596`).

