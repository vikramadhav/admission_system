# 2. Figma analysis: GME admission application

File: `49e9Tehx9N8XupCFJC98cW`, one page "Candidate" (`0:1`). Inspected only to find shared component requirements; **no screens are implemented in this phase.** The full notes, with node ids and instance counts, are in [figma-extracts/gme-candidate-screens.md](figma-extracts/gme-candidate-screens.md).

## 2.1 Screens

There are 16 screens, all desktop at 1280 px. There are no tablet, mobile or Arabic (RTL) frames.

| Flow | Screens (node id) |
|---|---|
| Dashboard | First-time / empty `1:5928`, submitted application `1:1938` |
| Application wizard | Program & Preferences `1:2189`, Application information `1:2505`, Personal information sub-steps `1:2781`, `1:3208`, `1:3396`, `1:3604`, University grades `1:3827`, English proficiency `1:4064`, Internship `1:4255`, Residency `1:4456`, Board & License `1:4647`, Portfolio `1:4900`, Pay & Submit `1:5351`, Pay & Submit with success dialog `1:5621` |

Each wizard screen contains two steppers, one visible and one hidden: a 9-step version (with Entrance Exam) and a 10-step version (with Residency and Board & License). These look like two programme variants. The Entrance Exam screen doesn't exist.

The repo PNGs in `Design_System/UIUX/` are an **older iteration**. The differences:

| Aspect | Repo PNGs | Current Figma |
|---|---|---|
| Header | Different links | Updated |
| Personal information | One page | Split into sub-steps |
| Buttons | Inside the card | In the action bar |

**The Figma file is the reference.**

## 2.2 Visual direction

- Same family as the DH standard: Dubai font, navy #002F70, page background #ECF2F5, white cards and Blue/200 (#D6EFFE) banners.
- Page structure, top to bottom:
  1. White header, 80 px.
  2. Light-blue banner with breadcrumb, title, meta row and status tag.
  3. Content on the page background.
  4. Sticky white action bar.
  5. Navy footer.
- Centred **1200 px container** with 24 px padding, giving 1152 px usable width.
  - The wizard has a 300 px stepper card and an 828 px form card.
  - The dashboard has a 788 px main column and a 340 px side column.
- Forms are 2-column grids with 20 px gaps. Uploads and long questions span both columns.
- Medium density, with flat cards that use a border and no shadow.

## 2.3 Library linkage

- **The GME file isn't linked to the DH Design System REF library.** `get_libraries` shows no subscribed libraries.
- Of 2,155 frames, only 63 are component instances. The header and the informational tags come from remote components whose source nodes don't exist in DH REF; they were probably copied from another file.
- Most UI is detached frames with hard-coded values: #32AFFC, #77DEFC, purple and green tints, and stray Mulish text. Nothing will stop GME and DH from drifting apart. DAHC-UI becomes the only place where they're reconciled.

## 2.4 Shared component requirements (what DAHC-UI must provide)

| Priority | Component | GME usage | DH source |
|---|---|---|---|
| 1 | Form field family: input (default, read-only "Verified via ICP", computed, leading or trailing icon), select, searchable multi-select, date input, phone input, radio group, checkbox, with label, helper and error | 97 inputs, 40 radios | Input field, Controls, Dropdown frames. Datepicker is missing. |
| 2 | Button and icon button: solid or outline × navy or red, sizes 40/44/48 | About 120 instances | Buttons (the sizes and label sizes differ) |
| 3 | File upload: empty slot, uploaded file row with preview and delete | 21 slots | Partial ("Upload" examples in Content Components) |
| 4 | Vertical stepper with nested sub-steps and done/current/upcoming states, plus the step header ("STEP n OF m") | Every wizard screen | **None.** The DH file has only a static infographic stepper. |
| 5 | Status tag (Draft, Submitted) and small tag (Complete, Required, Optional, Uploaded, points) | 15 + 28 | Informational tag, Functional chip |
| 6 | Card / panel, key/value list, stat (score) tile, section checklist | 35 cards | Cards (radius and shadow differ) |
| 7 | Page banner with breadcrumb, title, meta row, status and action | Every screen | Banner examples, Breadcrumbs |
| 8 | App header (logo tile, icon buttons with badge, language and profile pills) and footer | Every screen | Top navigation, Bottom navigation |
| 9 | Inline note / callout, dismissible toast or alert banner (info, warning) | 10 notes, 4 toasts | **None** |
| 10 | Dialog (success with details) | 1 | Modal examples (success, warning) |
| 11 | Wizard action bar (sticky: Save draft, Discard ‖ Back, Next) | Every wizard screen | **None** |

These stay **inside the GME app** and are composed from DAHC-UI parts:

- Ranked training-site picker. The existing `dahc-ui` ranked-selection will be reviewed against the DAHC-UI scope.
- Portfolio question card with points and conditional fields.
- Terms box with an accept checkbox.
- Admission-cycle icon tiles.

## 2.5 Variations GME introduces beyond DH

| Aspect | DH standard | GME |
|---|---|---|
| Button sizes | 48 / 44 / 36, label Bold 18 (large) | 48 / 44 / 40, labels Bold 14–16, radius 999 |
| Button variants | Navy solid/outline, Blue and Green "special", Red outline | Adds **solid red** (Withdraw). Disabled is opacity 0.2 (DH uses 0.5). |
| Input | h48, 0.5 px border #8099B2, no radius spec | h48, **radius 10**, 1 px border #6685A3, value 15 Medium, label 13 Medium |
| Card | radius 12, hover shadow | **radius 16**, 1 px Navy/200 border, no shadow |
| Tag | Informational tag, radius 8 | Same shape, plus status colours with alpha fills not in the palette |
| Type sizes | 12/14/16/18/20/22/24/26/36… | Adds **13 and 15 px**. Badge 10 px. |
| Container | 1140 content column | 1200 container (1152 usable) |

The recommendation is in doc 06, decision D3: the **DH standard wins for tokens**. A GME variation is either approved as a DAHC-UI variant (for example the solid red button, read-only input and 40 px button) or aligned to the standard (for example the 13 and 15 px type and radius 10 vs 12).

## 2.6 Gaps in GME relevant to the design system

- No error, validation, loading, upload-progress, focus or hover states.
- Only a success dialog. Discard, withdraw, appeal, session-timeout and payment-failure confirmations are missing.
- Only the Draft and Submitted statuses have tag designs.
- No responsive or RTL designs, even though there's an Arabic language toggle.
- Content issues for the GME phase, not the design system: typos ("Intranal", "Martial Status"), inconsistent "Next" button wording, and two different footer contents.
