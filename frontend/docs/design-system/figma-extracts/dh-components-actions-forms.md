# DH Design System REF: Actions & Form Controls spec extract

Source: Figma file `FozlGvhO1ZjI2GbklegqFf` ("DH Design System REF", Dubai Health Standard UI). Extracted read-only (2026-11-12) with get_metadata, get_design_context, get_variable_defs and get_screenshot.
Pages covered: Buttons `50:6773`, Chips and Tags `50:7413`, Input fields `50:7751`, Controls `50:7872`, Datepicker `50:7957`, Search `50:8200`, Dropdown `50:12859`, Form Components `50:21128`.

Typeface is **Dubai** throughout (Regular 400, Medium 500, Bold 700). The one exception is noted under Buttons. Colours below are given as `hex (Figma variable name)`.

## 0. Summary of findings

| Component | Figma node (set) | Page | Variants | Key gaps |
|---|---|---|---|---|
| Button (Solid / Outline / Links / Icon only) | `50:6786` "Buttons" | Buttons | 69 | No focus state. Colour/size matrix is sparse. Outline Navy uses Source Sans Pro. Icon-only default is misnamed. No loading state. |
| Icon button | inside `50:6786` (Type=4. Icon only) | Buttons | 4 | Only Large 48px Navy outline. No focus state. No aria label guidance. |
| Button group | none | none | 0 | **Missing** |
| Informational tag | `50:7426` "Informational tags" | Chips and Tags | 22 | Medium size has no outline style. News outline uses a red tint fill (bug). Labels on the canvas don't match the rows. |
| Functional chip (Selection / Filter) | `50:7519` "Functional chips" | Chips and Tags | 12 | No hover, focus or disabled state. Filter chip has no unselected state. Small selected chip uses an 18px label, larger than Medium's 16px (bug). |
| Text input | `50:7763` "Input field" | Input fields | 6 | **No focus state.** No required marker, no character counter, no size variants. Error colour fails contrast. |
| Textarea | none | none | 0 | **Missing** |
| Select / Dropdown | none (detached frames only) | Dropdown | 0 (5 frame examples) | Not a component. Closed field has no background fill. No error or disabled field state. Single-select check icon hidden. |
| Multi-select dropdown | none (frames) | Dropdown | 0 (2 examples) | Not a component. Built from Controls and Search instances. |
| Search | `50:8605` "Search" | Search | 22 | Built for specific pages (Map/Hero/Header/Facility/Phase 1) rather than as a generic component. No focus ring (only a blinking caret). Mobile variants only for Facility and Phase 1. |
| Search dropdown panel | `50:9125` "Dropdown subcomponent" | Search | 3 | No hover or keyboard-active row state. |
| Checkbox / Radio | `50:7880` "Controls" | Controls | 8 | Only checked/unchecked. No disabled, error, hover, focus or indeterminate. Tick and dot colour #32AFFC is 2.42:1 against white. |
| Switch / Toggle | none | none | 0 | **Missing** |
| Datepicker / Time picker | none | Datepicker (page is **empty**) | 0 | **Missing.** The page canvas `50:7957` has no children. |
| Form label / hint / error | baked into Input field | Input fields | n/a | No standalone component. Error text #FF8F8A is 2.2:1. |
| Form Components page | no components; 3 "Phase 2" screens | Form Components | 0 | Uses instances of an **external** "Input field" (`147:1869…`, select style), plus Buttons, Functional chips and Tooltip. |

Accessibility gaps that apply across the system:
- **No component anywhere has a focus or focus-visible variant.**
- Several key colours fail WCAG contrast against white:

| Colour | Contrast vs white | Used for |
|---|---|---|
| #32AFFC | 2.42:1 | Secondary Blue links, checkbox tick, radio dot, selected option text |
| #5BBFFD | 2.04:1 | Link hover |
| #FF8F8A | 2.2:1 | Error text and border, red outline button |
| #FFA5A1 | 1.88:1 | Red outline button, active and disabled |
| #8099B2 | 2.95:1 | Placeholder text, default input border |
| #99ADC2 | 2.3:1 | Dropdown section titles |
| #B2C2D1 | 1.82:1 | Disabled label |

- White on #32AFFC (Secondary Blue solid button) is also 2.42:1.
- A May 8 2025 annotation (`50:7083`) picks **#037BC5 (4.52:1)** as the replacement link colour, but the component set still uses #32AFFC.
- **RTL / Arabic:** none of these components has an RTL variant. The only Arabic in scope is the "العربية" language pill in the Header search variant (`50:8794`). Some list text nodes carry `dir="auto"`.

---

## 1. Button

- Component set: **`50:6786` "Buttons"** on page Buttons (`50:6773`), frame `50:6774`. Page description: "Use the following buttons to as call to actions in the design."
- Component properties (from code generation):
  - `buttonText` (default "Button Label")
  - `leadingIcon` and `trailingIcon` (booleans, default true)
  - icon instance swaps `iconInstance` and `iconInstance2`
  - `State` = 1. Default | 2. Hover | 3. Active | 4. Disabled
  - `Type` = 1. Solid | 2. Outline | 3. Links | 4. Icon only
  - `Size` = Large | Medium | Small
  - `Colour` = 1. Primary Navy | 2. Secondary Blue | 3. Navy + Secondary Blue | 4. Green | 5. Red
- Canvas row labels: "Solid button", "Outline button", "Links", "Special buttons", "Icon Button". Size labels: "Large (48px)", "Medium (44px)", "Small (36px)".

### 1.1 Variant matrix (69 variants)

| Type | Colour | Sizes | States | Count |
|---|---|---|---|---|
| Solid | Primary Navy | Large, Medium | Default, Hover, Active, Disabled | 8 |
| Solid ("Special") | Secondary Blue | Small | D/H/A/Dis | 4 |
| Solid ("Special") | Green | Small | D/H/A/Dis | 4 |
| Outline | Primary Navy | Small | D/H/A/Dis | 4 |
| Outline ("Special") | Red | Small | D/H/A/Dis | 4 |
| Links | Primary Navy, Secondary Blue, Navy + Secondary Blue | Large, Medium, Small | D/H/A/Dis | 36 |
| Icon only | Primary Navy | Large | D/H/A/Dis | 4 (see naming bug) |

Combinations that are **missing**:
- Solid Navy Small
- Solid Blue and Green in Large and Medium
- Outline Navy in Large and Medium
- Outline Red in Large and Medium
- Icon only in Medium and Small
- Every type in a Focus or Loading state

### 1.2 Solid: Primary Navy

| Property | Large (`50:6787`) | Medium (`50:6791`) |
|---|---|---|
| Height | 48 (fixed `h-48`) | 44 (hug: 12 + 20 + 12) |
| Padding | 12 / 32 | 12 / 24 |
| Gap | 12 | 8 (Default), 12 (Hover/Active/Disabled: inconsistent) |
| Radius | 30 | 35 (Default), 30 (other states: inconsistent) |
| Label | Dubai Bold 18/20, capitalize, white `#FFFFFF` (Secondary/10. White); style "Web/Button text 1" | same; Default text-align right (others centre) |
| Icons | 20×20 leading and trailing | 20×20 |

| State | Fill | Node L / M |
|---|---|---|
| Default | `#002F70` (Primary/Navy Blue) | `50:6787` / `50:6791` |
| Hover | `#335C85` (Primary/Navy Blue/800) | `50:6795` / `50:6799` |
| Active | `#1A4775` (Primary/Navy Blue/900) | `50:6803` / `50:6807` |
| Disabled | `#1A4775`, layer opacity 50% | `50:6811` / `50:6815` |

### 1.3 Solid "Special": Small 36px (Secondary Blue, Green)

- Height 36 (fixed), padding 8 / 24, gap 8, radius 30.
- Label: Dubai Medium 14/18, UPPERCASE (style "Functional/14/Medium Uppercase").
- Icons: 16×16.

| Colour / State | Fill | Label | Node |
|---|---|---|---|
| Blue Default | `#32AFFC` (Secondary/1. Blue) | white (2.42:1, fails) | `50:6932` |
| Blue Hover | `#ADDFFE` (Secondary Tints/1. Blue/300) | `#002F70` | `50:6952` |
| Blue Active | `#32AFFC` | white | `50:6956` |
| Blue Disabled | `#32AFFC` @ 50% | white | `50:6960` |
| Green Default | `#A5FFBC` (Secondary/3. Green) | `#002F70` | `50:6923` |
| Green Hover | `#DBFFE4` (Secondary Tints/3. Green/300) | `#002F70` | `50:6964` |
| Green Active | `#A5FFBC` (identical to Default) | `#002F70` | `50:6973` |
| Green Disabled | `#A5FFBC` @ 50% | `#002F70` | `50:6982` |

Note: hover makes these buttons **lighter**, while Navy hover makes the button lighter too. Active looks identical to Default for both Blue and Green.

### 1.4 Outline

**Navy, Small** (`50:6819`, `50:6823`, `50:6827`, `50:6831`):
- Padding 8 / 24, gap 8, radius 30, border 1px `#002F70`.
- No fixed height: 20 + 16 = 36.
- Label: **Source Sans Pro SemiBold 14/20**. This is a detached, non-Dubai font with no text style.
- Icons: **12×12**, compared with 16×16 on the other Small buttons.

| State | Fill | Border | Label |
|---|---|---|---|
| Default | none | `#002F70` | `#002F70` |
| Hover | `#002F70` (filled) | `#002F70` | white |
| Active | none | `#002F70` | `#002F70` (identical to Default) |
| Disabled | none, opacity 50% | `#002F70` | `#002F70` |

**Red "Special", Small** (`50:6936`, `50:6940`, `50:6944`, `50:6948`):
- h 36, padding 8 / 24, gap 8, radius 30, border 1px.
- Label: Dubai Medium 14/18, sentence case. This differs from Blue and Green, which are uppercase.
- Icons: 16.

| State | Fill | Border | Label |
|---|---|---|---|
| Default | none | `#FF8F8A` (Secondary/6. Red) | `#FF8F8A` |
| Hover | `#FF8F8A` | `#FF8F8A` | white |
| Active | none | `#FFA5A1` (Secondary Tints/6. Red/500) | `#FFA5A1` |
| Disabled | none, opacity 50% | `#FFA5A1` | `#FFA5A1` |

All of the Red text values fail contrast (2.2:1 or lower).

### 1.5 Links (text buttons)

Layout: no padding, items centred.

| Size | Gap | Icon | Font |
|---|---|---|---|
| Large | 8 | 24 | Dubai Bold 18, capitalize; line-height 20 (Default) vs 24 (Hover/Active/Disabled). Exception: **Navy Large uses Dubai Medium 18/22** (Functional/18/Medium) |
| Medium | 4 | 16 | Dubai Bold 16/20 capitalize ("Web/Button text 2"); line-height drops to 18 on Hover |
| Small | 4 | 18 (larger than the Medium icon) | Dubai Regular 14/18 ("Web/Body Small") |

| Colour | Default | Hover (underlined) | Active | Disabled |
|---|---|---|---|---|
| Primary Navy | `#002F70`. **Small Default uses `#1A4775`** (inconsistent) | `#335C85` (L), `#1A4775` (M, S) | `#002F70` | Default colour @ 50% |
| Secondary Blue | `#32AFFC` | `#5BBFFD` (Secondary Tints/1. Blue/500) | `#32AFFC` | @ 50% |
| Navy + Secondary Blue | text `#32AFFC`, icons navy | `#5BBFFD` | `#32AFFC` | @ 50% |

- Hover is the only state with an underline.
- Active is visually identical to Default.
- Node ids, Large: Navy `50:6855`, `50:6870`, `50:6860`, `50:6865`. Blue `50:6839`, `50:6995`, `50:7015`, `50:7047`. Navy+Blue `50:6835`, `50:6991`, `50:7011`, `50:7043`.
- Medium and Small: `50:6875` to `50:6919`, `50:6843` to `50:6851`, `50:6999` to `50:7039`.
- Variant `50:6835` has hardcoded text "Button Label" instead of the bound `buttonText` property.

**Annotation frame "Updated | May 8, 2025" (`50:7083`)** compares link blues on white:
- #32AFFC (current)
- #005C95
- **#037BC5, underlined, boxed in green and marked "Selected"**
- #0066CC
- #25809A

#037BC5 passes AA at 4.52:1. It is **not applied** to the component set, which still uses #32AFFC and #5BBFFD.

### 1.6 Icon only (icon button)

| Property | Value |
|---|---|
| Size | 48 × 48 (`w-48`, padding 14 / 12) |
| Radius | 35 (circle) |
| Border | 1px |
| Icon | 20×20 |
| Default | border `#002F70`. **Named "State=1. Default, Type=2. Outline, Size=Large"** (`50:7051`): a naming bug, since it is not Type=4 |
| Hover | border `#4D7094` (Primary/Navy Blue/700) (`50:7054`) |
| Active | border `#002F70` (`50:7057`) |
| Disabled | opacity 50% (`50:7060`) |

- There is no fill in any state.
- There is no accessible-name or tooltip guidance.

### 1.7 Gaps and inconsistencies (Buttons)

- No **Focus** state on any type. This is required for keyboard users.
- No **Loading** state.
- No full-width or block variant. The mobile Phase 1 search does use a full-width Medium solid button (`50:8873`).
- No **Button group** or segmented control. The "All / Individual / Corporate" toggle on Form Components is built from Functional chips.
- Radius varies between 30 and 35, and gap between 8 and 12, inside the same size.
- Text style differs by colour: Navy is Bold 18, Special is Medium 14 uppercase, Red is Medium 14 sentence case, and Outline Navy is Source Sans Pro.
- Active state is indistinguishable from Default for Blue, Green, Outline Navy and Links.
- The Disabled treatment is a layer opacity of 50%, not dedicated tokens.

---

## 2. Informational tag

- Component set **`50:7426` "Informational tags"** on page Chips and Tags (`50:7413`).
- Page text: "Use only following tags to represent states or categories. **Tags are non-clickable.**"
- Properties:
  - `label` (default "Tag Label")
  - `leadingIcon` and `trailingIcon` (booleans) with icon swaps
  - `Purpose` = 1. Information | 2. In progress (double space in the name) | 3. Warning | 4. Error | 5. Success | 6. News | 7. Informative Blue | 8. Informative Purple
  - `Style` = Solid | Outline
  - `Size` = Large | Medium

### 2.1 Variant matrix (22 variants)

| Purpose | Solid L | Solid M | Outline L |
|---|---|---|---|
| Information | `50:7427` | `50:7431` | `50:7483` |
| In progress | `50:7451` | `50:7455` | `50:7487` |
| Warning | `50:7459` | `50:7463` | `50:7491` |
| Error | `50:7467` | `50:7471` | `50:7495` |
| Success | `50:7475` | `50:7479` | `50:7503` |
| News | `50:7507` | `50:7511` | `50:7499` |
| Informative Blue | `50:7435` | `50:7439` | none |
| Informative Purple | `50:7443` | `50:7447` | none |

No Outline Medium variants exist.

### 2.2 Anatomy

| Size | Height | Padding | Gap | Radius | Icons | Label |
|---|---|---|---|---|---|---|
| Large (purposes 1–6) | 36 | 6 / 12 | 8 | 8 | 20 | Dubai **Bold 18/22 UPPERCASE** `#002F70` ("Functional/18/Bold Uppercase") |
| Large (Informative Blue, Purple) | 36 | 6 / 12 | 8 | 8 | 20 | Dubai **Regular 16/20**, sentence case ("Functional/16/Regular") |
| Medium | 30 | 6 / 12 | 8 | 8 | 20 (same as Large) | Dubai Regular 14/18 ("Functional/14/Regular") |

### 2.3 Colours

| Purpose | Solid fill | Outline fill | Outline border (2px) |
|---|---|---|---|
| Information | `#77DEFC` (Secondary/2. Light Blue) | rgba(119,222,252,.24) | `#77DEFC` |
| In progress | `#FFFF6A` (Secondary/4. Yellow) | rgba(255,255,106,.36) | `#FFFF6A` |
| Warning | `#FABC4C` (Secondary/5. Orange) | rgba(250,188,76,.36) | `#FABC4C` |
| Error | `#FF8F8A` (Secondary/6. Red) | rgba(255,143,138,.24) | `#FF8F8A` |
| Success | `#A5FFBC` (Secondary/3. Green) | rgba(165,255,188,.36) | `#A5FFBC` |
| News | rgba(239,191,226,.24): pink `#EFBFE2` (Secondary/8. Pink) at 24% | **rgba(255,143,138,.12): a red tint (bug)** | rgba(239,191,226,.24) |
| Informative Blue | `#ADDFFE` (Secondary Tints/1. Blue/300) | none | none |
| Informative Purple | `#AC9DFF` (Secondary/7. Purple) | none | none |

- The text is always `#002F70`. Its contrast on the solid fills is between 5.5 and 12:1, which passes.
- The alpha fills are raw rgba values, not variables.

### 2.4 Issues

- Canvas labels don't match the rows. The labels read Informative, In progress, "Warning, Event (solid only)", Success, Error, News, "Informative Light Blue", "Content tag Purple". However, Warning does have an Outline variant, and the label positions are offset from the rows.
- The label style changes between purposes at the same size.
- Medium has no outline style.
- Showing a tag with both leading and trailing icons by default is unusual for a status tag.

---

## 3. Functional chip (Selection chip / Filter chip)

- Component set **`50:7519` "Functional chips"**.
- Page text: "Use only following chips to select and filter content. **Chips are not clickable.**" This contradicts their purpose of selecting and filtering, and should be confirmed with design.
- Properties:
  - `text` (default "Chip Label")
  - `leadingIcon` and `trailingIcon` with icon swaps
  - `Selected` = Yes | No
  - `Type` = 1. Selection chip | 2. Filter chip
  - `Background` = Light | Dark (the surface the chip sits on)
  - `Size` = Medium | Small

### 3.1 Variant matrix (12 variants)

| Type | Selected | Light M / S | Dark M / S |
|---|---|---|---|
| Selection | Yes | `50:7520` / `50:7524` | `50:7528` / `50:7532` |
| Selection | No | `50:7536` / `50:7540` | `50:7544` / `50:7548` |
| Filter | Yes | `50:7552` / `50:7556` | `50:7560` / `50:7564` |
| Filter | No | **missing** | **missing** |

### 3.2 Anatomy and colours

| Variant | Height | Padding | Gap | Radius | Fill | Border | Label | Icons |
|---|---|---|---|---|---|---|---|---|
| Selection, selected, M | 36 | 8 / 16 | 8 | 48 (pill) | `#002F70` | none | Dubai Bold 16/18 white, capitalize ("Web/Button text 2") | 20 |
| Selection, selected, S | 30 | 6 / 12 left / 16 right | 6 | 48 | `#002F70` | none | **Dubai Bold 18/20** white ("Web/Button text 1"). Larger than Medium: a bug | 16 |
| Selection, unselected, Light M | 36 | 8 / 16 | 8 | 48 | `#E5EBF0` (Primary/Navy Blue/100) | 1px `#CCD6E0` (Navy Blue/200) | Dubai Regular 16/18 `#002F70` | 20 |
| Selection, unselected, Light S | 30 | 6 / 12 / 16 | 6 | 48 | `#E5EBF0` | 1px `#CCD6E0` | Dubai Regular 14/18 `#002F70` | 16 |
| Selection, unselected, Dark M / S | 36 / 30 | as Light | as Light | 48 | white | none | as Light | 20 / 16 |
| Filter, selected, Light M | 36 | 6, left 16 / right 12 | 8 | **8** (rounded rectangle) | `#E5EBF0` | 1px `#CCD6E0` | Dubai Regular 16/24 `#002F70`, ellipsis | 20 |
| Filter, selected, Light S | 30 | 6 / 12 | 6 | 8 | `#E5EBF0` | 1px `#CCD6E0` | Regular 14/18 | 16 |
| Filter, selected, Dark M / S | 36 / 30 | as Light | as Light | 8 | white | none | as Light | 20 / 16 |

- Selected Selection chips look the same on Light and Dark backgrounds.
- Filter chip text is hardcoded "Chip Label" and not bound to the `text` property.
- On the Dark background, the chips use white with no border, so the selected filter chip and the unselected selection chip differ only in radius.

### 3.3 Gaps

- No Hover, Focus, Pressed or Disabled states.
- No unselected Filter chip.
- No dismiss affordance is defined. The trailing icon is a generic placeholder.
- The selected-chip font is inconsistent between sizes.

---

## 4. Text input ("Input field")

- Component set **`50:7763` "Input field"** on page Input fields (`50:7751`).
- Page text: "Use the following input fields. Width can be changed according to the layout."
- Properties:
  - `title` (label, default "Title")
  - `inputFieldText` (default "Enter your text")
  - `hintText` (default "This is a hint text to help user.")
  - `leftIcon` and `rightIcon` (booleans) with icon swaps
  - `State` = 1. Default | 2. Hover | 3. Filled | 4. Disabled | 5. Success | 6. Error

### 4.1 Variants (6)

| State | Node | Field fill | Border | Value / placeholder text | Label | Hint |
|---|---|---|---|---|---|---|
| Default | `50:7764` | `#FFFFFF` | 0.5px `#8099B2` (Navy Blue/500) | placeholder `#8099B2` (2.95:1, fails) | `#002F70` | `#4D7094` |
| Hover | `50:7772` | `#FFFFFF` | **1px** `#4D7094` (Navy Blue/700) | `#4D7094` | `#002F70` | `#4D7094` |
| Filled | `50:7780` | `#FFFFFF` | 0.5px `#4D7094` | `#002F70` | `#002F70` | `#4D7094` |
| Disabled | `50:7788` | `#E5EBF0` (Navy Blue/100) | none | `#8099B2` | `#B2C2D1` (Navy Blue/300) | `#8099B2` |
| Success | `50:7796` | `#F6FFF8` (Secondary Tints/3. Green/100) | 0.5px `#A5FFBC` | `#002F70` | `#002F70` | `#4D7094` |
| Error | `50:7804` | `#FFF4F3` (Secondary Tints/6. Red/100) | 0.5px `#FF8F8A` | `#002F70` | `#002F70` | **`#FF8F8A`** (2.2:1, fails) |

### 4.2 Anatomy

| Element | Value |
|---|---|
| Wrapper | column, gap 6, width 353 (example; "width can be changed") |
| Label | Dubai Regular 14/18 ("Web/Body Small") |
| Field | padding 14 / 16, gap 8, radius 12. Height 48 without icons, 52 with 24px icons. Symbol height 98 = 18 + 6 + 52 + 6 + 16 |
| Value text | Dubai Regular 16/20 ("Web/Input field") |
| Icons | 24×24 left and right placeholders |
| Hint / error text | Dubai Medium 12/16 ("Functional/12/Medium"), full width |

### 4.3 Gaps and inconsistencies

- **No Focus or Active state.** The design has no visible focus ring, which is an accessibility gap.
- Border widths of 0.5px vs 1px won't render consistently in browsers. The 0.5px border at `#8099B2` is under 3:1 non-text contrast.
- Success border `#A5FFBC` on `#F6FFF8` is nearly invisible.
- There is no error icon, so state is conveyed by colour only (fails WCAG 1.4.1).
- Missing pieces:
  - required or optional indicator
  - character counter
  - prefix and suffix text
  - password reveal
  - read-only state
  - size variants
  - **textarea**
  - RTL variant
- The Success border, at 0.5px, is thinner than the Hover border at 1px.
- Canvas row labels don't line up with the symbols. The symbols are ordered Default, Filled, Hover, Disabled, Success, Error, while the label positions differ.
- The Form Components screens use a **different** "Input field" component with instance ids `I…;147:1869`. This is likely a remote library and has a select style with a `chevron-down`. It has no background fill and a 0.5px `#4D7094` border. It is not this component set.

---

## 5. Select / Dropdown (single and multi)

- Page Dropdown (`50:12859`), frame `50:13293`. **There are no component symbols on this page.** Everything is detached frames: a "Dropdown" heading and a "Multi select dropdown" heading.

### 5.1 Examples

| Example | Node | Description |
|---|---|---|
| Closed, with leading icon | `50:13303` | label "Label", field with 24px placeholder icon, value "Selected option", `chevron-down` 24 |
| Open, single, no icons | `50:13311` | field plus option panel (4 options) |
| Open, single, with leading icons | `50:13339` | option text indented to 46px |
| Multi, closed | `50:13367` | the hidden panel `50:13375` has 6 checkbox options |
| Multi, open, with search | `50:13417` | search field, plus 6 options with checkboxes |

### 5.2 Values

| Element | Value |
|---|---|
| Label | Dubai Regular 14/18 `#002F70`, gap 6 to the field |
| Field (closed) | padding 14 / 16, gap 8, radius 12, border 0.5px `#4D7094`, **no fill declared (transparent)**. Value Dubai Regular 16/20 `#002F70`, ellipsis. Chevron 24 |
| Field (open) | border 0.5px `#1A4775` (Navy Blue/900). Chevron flipped (`-scale-y-100`) to point up |
| Panel | fill white, border 0.5px `#4D7094`, radius 12, shadow "Shadow 4" `0 12px 24px -8px rgba(0,51,102,.12)` (#0033661F). Width 334, sits 2px below the field (y 344 to 346) |
| Option row | height 48, padding 12 / 16, gap 6. Text Dubai 14/20, letter-spacing 0.07px |
| Option: default | Regular `#002F70` |
| Option: hover | fill `#EBF7FF` (Secondary Tints/1. Blue/100), Medium `#002F70` |
| Option: selected | **Bold `#32AFFC`** (2.42:1, fails). A trailing `check` icon (20px, `50:13334`) exists but is hidden |
| Option: disabled | Regular `#8099B2` |
| Multi option | 24px checkbox from Controls (unchecked: 2px `#002F70` border, radius 4. Checked: navy box with `#32AFFC` tick. Disabled: border `#8099B2`) |
| Multi value | comma-joined ("Selected option 1, Selected option 2, …"), single line with ellipsis |
| In-panel search | an instance of the Search component (Mobile facility style): 300 wide, padding 14 / 16, border 0.5px `#8099B2`, radius 12, 18px search icon, placeholder "Search..." `#8099B2` at 80% opacity, 16px clear icon |

### 5.3 Gaps

- Not componentised, so it needs to be built from scratch.
- Missing states:
  - Error
  - Disabled field
  - Hover field
  - Focus
  - empty, no-results and loading list states
- No "select all" in multi-select.
- No chips for multi-select values.
- No max height or scroll behaviour defined.
- The closed field fill (transparent) differs from the text input (white).
- Closed and open borders (`#4D7094` / `#1A4775`) differ from the Input field default (`#8099B2`).

---

## 6. Search

- Component set **`50:8605` "Search"** on page Search (`50:8200`), frame "Search fields" `50:8593`.
- The page description is copy-pasted from Input fields: "Use the following input fields…".
- Properties:
  - `State` = Default | Active | Active dropdown | Filled | Error | Expanded
  - `Type` = Map | Hero section | Header | Search facility / Insurance partner | Phase 1 | Phase 1 Mobile
  - `Size` = Web | Mobile

### 6.1 Variant matrix (22 variants)

| Type | Default | Active | Active dropdown | Filled | Error | Expanded |
|---|---|---|---|---|---|---|
| Map (Web, w 392) | `50:8606` | `50:8609` | `50:8626` | `50:8612` | `50:8641` | none |
| Hero section (Web, w 832) | `50:8651` | `50:8674` | none | `50:8682` | `50:8692` | none |
| Header (Web, 1440 × 133) | `50:8773` | none | `50:8704` | none | none | none |
| Facility / Insurance (Web, w 915) | `50:8737` | `50:8763` | `50:8806` | none | `50:8818` | none |
| Facility / Insurance (Mobile, w 361) | `50:8904` | `50:8895` | `50:8877` | none | `50:8886` | none |
| Phase 1 "Find a Doctor" (Web, 1200 × 330) | `50:8831` | none | none | none | none | `50:8846` |
| Phase 1 Mobile (361) | `50:8866` | none | none | none | none | none |

### 6.2 Key values

**Map, Default** (`50:8606`):
- h 48, padding 14 / 16, gap 8, radius 12, fill white, border 0.5px `#8099B2`.
- Search icon 20.
- Placeholder "Search by facility name or area", Dubai Regular 16/20 `#8099B2`.

**Map, Active** (`50:8609`):
- Identical box. The only change is a blinking caret (`50:8611`).
- **There is no border or focus-ring change.**

**Map, Filled and Active dropdown** (`50:8612`, `50:8626`):
- The box becomes a panel: column, gap 16, padding-bottom 20, padding 16, radius 12, border 0.5px `#8099B2`, shadow "Shadow 3" `0 8px 12px -6px rgba(0,51,102,.08)`.
- The input row has a 0.5px `#8099B2` bottom border and a clear "Close" icon 24.
- The results section title "Facilities" is Dubai Bold 14/18 `#99ADC2` (Navy Blue/400).
- The result row is Dubai 16/20 `#3B4F63` (Secondary Tints/9. Blue Black/500), with the matched part in Bold ("**Rashid** Hospital").

**Error** (Map `50:8641`, Hero `50:8692`, Facility `50:8818` / `50:8886`):
- Message: Dubai Medium 12/16 `#FF8F8A`, "Sorry, we can't find "Kjdhaoa". Please try other keyword or explore our options below."
- **The input border does not change.**

**Hero section** (`50:8651`, `50:8674`):
- 832 × 64, fill white, radius **8**, padding 5 / 11, gap 11. No border.
- Placeholder "Search Services". Icon 20. Clear icon 24.91 (a non-integer size).

**Hero Filled** (`50:8682`):
- Panel w 832, border 1px `#8099B2`, shadow "Shadow 2" `0 25px 26px -22px rgba(0,51,102,.08)`, radius 12.
- The 64px input row has a bottom border, and value colour `#1A4775`.
- Two "Dropdown subcomponent" columns: list and thumbnail.

**Facility / Insurance**:
- Web: 915 × 64, radius 12, border 0.5px `#8099B2`, padding 14 / 16, gap 8, icon 20, clear icon 24. Placeholder "Search by Network / Insurance Partner".
- Active dropdown: border **1px** `#8099B2`.
- Mobile: w 361, padding 14 / 16, icon **16 / 18**, clear icon 16.

**Header** (`50:8773`):
- Contains the whole site header: DAHC logo block, nav links ("Care" active with a 4px `#002F70` underline, radius 8 on top, Dubai Bold 16/24), search icon button, "العربية" pill, Donate pill `#DBFFE4`, Book appointment pill `#D6EFFE`, and Login.
- The Active dropdown variant (`50:8704`) replaces the nav with a 64px search field.
- This is a page header, not a search component.

**Phase 1 "Find a Doctor & Appointment"** (`50:8831`, `50:8846`):
- Card: white, border 1px `#E5EBF0`, radius 20, shadow "Shadow 1" `0 25px 36px 0 rgba(0,51,102,.08)`.
- Title: Dubai Bold 36/40 ("Web/Heading 1").
- Contains 48px input fields (an external "Input field" instance with a 24 search icon), "Select facility" selects with arrow-down, a 48px Navy Solid "Search" button, and links "More filters" (Navy Bold 16) and "See all doctors" / "Clear all filters" (`#32AFFC`).
- Expanded adds the selects Speciality, Language and Gender.
- Mobile (`50:8866`): radius 16, title Bold 24/28 ("Web/Heading 3"), full-width Medium button.

### 6.3 "Dropdown subcomponent" (search suggestion panel)

Component set `50:9125`. Property `Thumbnail` = Yes (`50:9126`) | No (`50:9157`) | Search result highlight (`50:9183`). Width 800, padding 24.

| Element | Value |
|---|---|
| Section title | Dubai Bold 14/18 `#99ADC2`, padding-y 8 |
| Row ("Menu Item / Underlined") | h 40, bottom border 1px `#E5EBF0`. Text Dubai Medium 14/20 `#002F70`, letter-spacing 0.07, `dir="auto"` |
| Thumbnail row | 32px image, radius 12, gap 8 |
| Highlight variant | the match in Bold, background `#D6EFFE` (Secondary Tints/1. Blue/200); the rest Regular 14/18 |
| Footer link | "Button label", Dubai Regular 14/18 `#32AFFC`, with a 16px arrow |

### 6.4 Gaps

- Variants are tied to specific screens, so Map, Hero, Facility and Header each have different radius, height, border width and icon size. A generic `dahc-search` needs consolidating:
  - heights 48 and 64
  - radius 8 and 12
  - border 0 / 0.5 / 1px
  - icons 16 / 18 / 20 / 24 / 24.91
- **No focus indicator.** The Active state is only a blinking caret.
- The error state doesn't change the border.
- No loading or "searching" state.
- No hover or keyboard-highlighted row in the suggestion list.
- No RTL variant, even though the header offers an Arabic toggle.
- Mobile variants exist only for Facility and Phase 1.

---

## 7. Checkbox and Radio ("Controls")

- Component set **`50:7880` "Controls"** on page Controls (`50:7872`).
- Page text: "Use the following controls in the design to select options in a group."
- Properties: `Active` = Yes | No, `Type` = 1. Checkbox | 2. Radio button, `Label` = Yes | No.

### 7.1 Variants (8)

| Type | Active | Label | Node |
|---|---|---|---|
| Checkbox | No / Yes | No | `50:7881` / `50:7884` |
| Checkbox | No / Yes | Yes | `50:7904` / `50:7895` |
| Radio | No / Yes | No | `50:7892` / `50:7888` |
| Radio | No / Yes | Yes | `50:7909` / `50:7901` |

### 7.2 Anatomy

| Element | Value |
|---|---|
| Hit area | 24 × 24 |
| Checkbox box | 18 × 18 outer (inset 3px), **2px** border `#002F70`, radius 4. **No fill when checked**: the box stays white |
| Checkbox tick | vector fill **`#32AFFC`** (Secondary/1. Blue), about 11 × 8.5 |
| Radio ring | 20px diameter, 2px `#002F70` |
| Radio dot | 12px `#32AFFC` |
| With label | width 150, gap 8. Label Dubai 16/20 `#002F70`, ellipsis. **Unchecked = Regular** ("Functional/16/Regular"), **checked = Bold** ("Functional/16/Bold") |

### 7.3 Gaps

- Only two states exist.
- Missing: Hover, Focus, Disabled, Error / invalid, Indeterminate (checkbox), Read-only. A disabled checkbox look does appear in the Dropdown page (border `#8099B2`), but it is not in the component.
- The tick and dot colour `#32AFFC` is 2.42:1 against white, below the 3:1 needed for non-text UI components.
- Switching the label weight from Regular to Bold on selection causes a layout shift.
- No group or fieldset wrapper, and no group label or error message.
- No size variants.
- No RTL.
- **No Switch or Toggle component exists anywhere** in these pages.

---

## 8. Datepicker / Time picker

- Page **Datepicker `50:7957` is empty**. get_metadata returns a canvas with no children, and a screenshot renders 0 × 0.
- No date or time component was found on any page.
- Form Components screens show dates only as text ("8 Aug 2023") and `calendar` and `clock` icons.
- This needs to be designed and built: input trigger, calendar grid, range, min/max, disabled days, Hijri/Gregorian if needed, and RTL.

---

## 9. Form labels, hints and errors

There is no standalone component. These parts are baked into Input field and the Dropdown frames.

| Part | Spec |
|---|---|
| Label | Dubai Regular 14/18 `#002F70`; disabled `#B2C2D1` |
| Hint | Dubai Medium 12/16 `#4D7094`; disabled `#8099B2` |
| Error message | Dubai Medium 12/16 `#FF8F8A`. It replaces the hint text, with no icon |
| Label-to-field and field-to-hint spacing | 6 |

Gaps:
- No required asterisk.
- No optional tag.
- No info tooltip slot. A "Tooltip" component instance is used on Form Components but is outside this scope.
- The error colour fails contrast.

---

## 10. Form Components page (`50:21128`)

- Labelled "**Phase 2**" (`50:21129`). It contains three 2880-wide screens:
  - "Sort and services" `50:21130`
  - "Search result" `50:21227`
  - "Facility details" `50:21758`
- The page has **no component symbols**. It shows the components in use, which helps with behaviour.

Instance usage counts:

| Instance | Count |
|---|---|
| "Buttons" | 32 |
| "Functional chips" | 12 |
| "Input field" (external key `147:1869…`) | 10 |
| "Tooltip" | 2 |
| icons (keyboard-input, activity, clock, calendar, search, Close, …) | various |

Patterns shown:
- **Sort / filter bar**: five select fields in a row (Sort by, Facility, Department / Specialty, Language, Gender). Gap 16; the fields use the external Input field in select style (border 0.5px `#4D7094`, radius 12, padding 14 / 16, chevron 24).
- **Mobile "Sort / Filters" sheet**: the same selects stacked, plus a full-width "Apply" Navy solid button, and a close (x) icon at top right.
- **Services segmented filter**: All / Individual / Corporate built from Selection chips with leading icons. This effectively acts as a button group or segmented control.
- A "Search by Services" field (`search-field` `50:21205`, 445 × 52).
- **Search result (mobile)**: the Hero search with a caret, a row of category chips (All selected, Doctors, Specialities, Facilities), "Showing 12 results for your search: Ne", and highlighted matches in result lists (light-blue highlight, as in the Dropdown subcomponent).

---

## 11. Token reference (variables seen in these components)

**Primary / Navy Blue scale:**

| Variable | Hex |
|---|---|
| Primary/Navy Blue | `#002F70` |
| /900 | `#1A4775` |
| /800 | `#335C85` |
| /700 | `#4D7094` |
| /500 | `#8099B2` |
| /400 | `#99ADC2` |
| /300 | `#B2C2D1` |
| /200 | `#CCD6E0` |
| /100 | `#E5EBF0` |

**Secondary:**

| Variable | Hex |
|---|---|
| 1. Blue | `#32AFFC` |
| 2. Light Blue | `#77DEFC` |
| 3. Green | `#A5FFBC` |
| 4. Yellow | `#FFFF6A` |
| 5. Orange | `#FABC4C` |
| 6. Red | `#FF8F8A` |
| 7. Purple | `#AC9DFF` |
| 8. Pink | `#EFBFE2` |
| 9. Blue Black | `#0A233C` |
| 10. White | `#FFFFFF` |

**Secondary Tints:**

| Variable | Hex |
|---|---|
| 1. Blue/100 | `#EBF7FF` |
| 1. Blue/200 | `#D6EFFE` |
| 1. Blue/300 | `#ADDFFE` |
| 1. Blue/500 | `#5BBFFD` |
| 3. Green/100 | `#F6FFF8` |
| 3. Green/300 | `#DBFFE4` |
| 6. Red/100 | `#FFF4F3` |
| 6. Red/500 | `#FFA5A1` |
| 9. Blue Black/500 | `#3B4F63` |

**Shadows** (all in colour `#003366`):

| Name | Offset | Blur | Spread | Alpha |
|---|---|---|---|---|
| Shadow 1 | 0 25 | 36 | 0 | 8% |
| Shadow 2 | 0 25 | 26 | -22 | 8% |
| Shadow 3 | 0 8 | 12 | -6 | 8% |
| Shadow 4 | 0 12 | 24 | -8 | 12% |

**Text styles** (Dubai; size/line-height):
- Web/Button text 1: Bold 18/20
- Web/Button text 2: Bold 16/20. A chip variant reports 16/18 under the same name, so the style value is inconsistent.
- Web/Body Small: Regular 14/18
- Web/Input field: Regular 16/20
- Web/Body Default: Regular 16/20
- Web/Heading 1: Bold 36/40
- Web/Heading 3: Bold 24/28
- Functional/12/Medium: Medium 12/16
- Functional/14: Regular / Medium / Bold / Medium Uppercase, all 14/18
- Functional/16: Regular / Bold 16/20
- Functional/18/Medium: 18/22
- Functional/18/Bold Uppercase: 18/22
- English/Label/Large: Medium 14/20, letter-spacing 0.5
- English/Title/Medium: Bold 16/24, letter-spacing 0.1
- English/Body/Medium: Regular 14/20, letter-spacing 0.5

**Detached or non-variable values:**
- Source Sans Pro SemiBold 14/20 (Outline Navy button)
- all rgba tag fills and borders
- radii 8 / 12 / 20 / 30 / 35 / 48 / 64 / 100
- 0.5px borders
- the 24.91px clear icon
- link annotation colours #037BC5, #005C95, #0066CC, #25809A

No spacing or radius variables appeared in get_variable_defs, so spacing and radius appear to be hard-coded.
