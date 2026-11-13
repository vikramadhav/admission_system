# GME Candidate app: Figma analysis for DAHC-UI

- **App file:** `49e9Tehx9N8XupCFJC98cW` ("GME"), page `0:1` "Candidate"
- **Design system:** `FozlGvhO1ZjI2GbklegqFf` ("DH Design System REF")
- **Method:** read-only. I used the saved page metadata (parsed with Python), `get_libraries`, 13 screenshots, `get_design_context` on `1:3827` (University grades, full screen) and `1:1956` (Dashboard main area), and `get_variable_defs` on `1:3827`.
- **Rate limit:** the Figma MCP View-seat limit ran out partway through. Three planned `get_design_context` calls failed: the portfolio question card `1:5071`, the success dialog `1:5892` and the toast `1:4977`. Values for those three come from screenshots only and are marked *(visual est.)*.
- **Screenshots:** not committed (taken during the analysis session; re-create with Figma get_screenshot from the node ids below)

---

## 1. Screen inventory

The page holds 16 top-level frames plus one text label (`1:2188` "Prepare and submit application"). Every frame is **1280 px wide (desktop)**. There are **no tablet or mobile frames**.

### Flow A: Dashboard

| Node | Name | Size | Purpose |
|---|---|---|---|
| `1:5928` | Dashboard · First-time candidate | 1280×1227 | Empty or first-run state. Shows a "Welcome, Mohammed" banner, a dismissible info toast about 30-minute inactivity sign-out, a hero card ("GME JOURNEY" tag, "Your next chapter starts here"), an Admission Cycle card (3 icon tiles plus a **Start New Application** button), and a "Before you begin" checklist card. Hidden blocks: "How to apply", "Get started", "Application submission deadline". This frame also holds the local **Footer** component `1:6065`. |
| `1:1938` | Dashboard · Web | 1280×1407 | Returning candidate with a submitted application. Shows the application card (ID, programme, SUBMITTED tag, Created/Submitted/Announcement dates), two **Preference cards** (specialty plus training sites), 4 coloured **score tiles** (values "—"), and an action row: Withdraw (red), Appeal Score (disabled), Exclude Training Site, View Application. A side column has a **Key dates** card and an "Appeal window open" note. "New Application" in the banner looks disabled. |

### Flow B: Application wizard ("Medical Application")

All wizard screens share one shell: Header, then a banner (breadcrumb, H1, meta row, DRAFT tag), then a 2-column body (stepper card 300 px plus form card 828 px), then a full-width action bar, then the footer.

| # | Node | Name | Size | Step label | Content |
|---|---|---|---|---|---|
| 1 | `1:2189` | Program and preferences | 1280×1593 | STEP 1 OF 9 | Admission cycle (read-only), Program select. "Specialities and Training Sites" has 2 **Preference cards** (drag handle, Specialty select, **multi-select Training sites with search and checkbox list**, selected sites as **numbered, reorderable chips** with ×). Info note at the end. |
| 2 | `1:2505` | Application information | 1280×2376 | STEP 2 OF 9 | Candidate status select with helper text, ID number. Yes/No radio questions. Conditional upload (Employment letter). "Declarations" section (4 Yes/No questions in 2 columns). "Documents" section (CV, personal statement and recommendation letter per preference). **Terms and conditions scroll box** plus an accept checkbox. |
| 3a | `1:2781` | Personal information | 1280×2505 | STEP 3 OF 9 | Sub-step **Identity**: info note ("pre-filled from ICP through UAE Pass"), about 20 **read-only, verified** fields with "Verified via ICP" helper text, Yes/No radios, masked Emirates ID, selects, empty inputs. |
| 3b | `1:3208` | Personal information | 1280×1451 | STEP 3 OF 9 | Sub-step **Contact Information**: registered and contact email and mobile (4 inputs). |
| 3c | `1:3396` | Personal information | 1280×1451 | STEP 3 OF 9 | Sub-step **Next of Kin Information** (8 inputs: first name, surname, relationship, phone). |
| 3d | `1:3604` | Personal information | 1280×1790 | STEP 3 OF 9 | Sub-step **Identification Attachments**: 8 upload slots (photo, passport, family book, Emirates ID, Marsoom, mother's family book, birth certificate, residency visa). |
| 4 | `1:3827` | University grades | 1280×1562 | STEP 4 OF 9 | 5 selects, GPA inputs, GPA-type radio, **computed read-only field** ("26.25 / 35 — Calculated from your GPA"), 2 uploads. |
| 5 | `1:4064` | English proficiency | 1280×1347 | STEP 5 OF 9 | Exam title, **date input with calendar icon**, result, 1 upload, warning toast (alert-triangle plus close). |
| 6 | `1:4255` | Internship information | 1280×1413 | STEP 6 OF 10 | Organisation, "Other organisation" (conditional), location, from/to dates, 1 upload. |
| 7 | `1:4456` | Residency information | 1280×1341 | STEP 7 OF 10 | Specialty, training hospital, hidden "Other training hospital" (conditional), dates. |
| 8 | `1:4647` | Board and license | 1280×1652 | STEP 8 OF 10 | Board select, Yes/No radios, DD/MM/YYYY date inputs, attempt-number selects, authority, license number, job title, 3 uploads. |
| 9 | `1:4900` | Portfolio | 1280×2466 | STEP 9 OF 10 | Warning toast ("Check your answers carefully…", one-time submission). 6 **question cards** (Q1–Q6, each with a "N points" pill and Yes/No radio). Conditional fields appear on Yes: DOI link input with leading icon, journal, article title, date, role select, **uploaded-file row** (UPLOADED badge, file meta, Preview, delete), and an empty upload slot. |
| 10 | `1:5351` | Pay and submit | 1280×1442 | STEP 9 OF 9 | Warning toast (redirect to payment gateway). "Review, Pay & Submit": key/value grid (application no., created, status, bill amount, bill status, payment date), then a **section checklist** with a "Complete" tag per step. Primary action "Pay & Submit". |
| 11 | `1:5621` | Pay and submit | 1280×1442 | STEP 9 OF 9 | Same screen with a **scrim and success Dialog** `1:5892` (520 px wide): featured check icon, "Your application has been submitted", 2-column details (application number, programme, submitted on, receipt no., amount, payment status), "Go to dashboard". A "Download receipt" button is hidden. |

**Two programme variants are mixed together.** Every wizard screen contains two stepper cards, one visible and one hidden (for example on Portfolio, `1:4983` is visible and `1:5025` hidden):

- **9-step variant (Internship-type programmes):** … Internship → **Entrance Exam** → Portfolio → Pay & Submit.
- **10-step variant (Residency/Fellowship):** … Internship → **Residency Information** → **Board & License** → Portfolio → Pay & Submit.

Screens 1–5 show the 9-step stepper. Screens 6–9 show the 10-step stepper. Pay & Submit shows 10 steps in its stepper but its label says "STEP 9 OF 9". **There is no Entrance Exam screen.**

---

## 2. Library linkage

- `get_libraries` on the GME file returns **`libraries_added_to_file: []`**. GME does **not** subscribe to DH Design System REF or any other library. The DS file is not offered as an available organisation library either, and `search_design_system` against the DS file returns nothing for all 10 queries. The DS file is not published as a library.
- Only **63 instances** exist on the whole page, against 2,155 frames and 1,462 text nodes. Almost everything is drawn as **plain frames**.

### Where the instances come from

| Instance | Count | Main component |
|---|---|---|
| Header | 16 | **Remote or orphaned.** Its main component `1:9` lives on a non-visible canvas, and `get_metadata` rejects it as "invalid node selection". |
| Informational tags | 15 | **Remote.** Its sub-node ids `147:1342` and `150:657` are **not** present in DS REF (`get_metadata` returned "not found"). It was copied from another library or version and is not linked to DS REF. |
| Placeholder | 12 | Icon placeholder slots inside the tags. |
| Button close X | 6 | Icon. |
| alert-triangle | 5 | Icon. |
| Information | 3 | Icon. |
| calendar | 2 | Icon. |
| Footer | 1 | **Local** symbol `1:6065`. It is used only on `1:1938`. The other 14 footers are **detached frames**. |
| Search, Featured icon outline, Tag | 1 each | Remote. |

### Duplicated and detached copies

- Every wizard screen also keeps a **hidden detached Header frame** (for example `1:2190`, `1:2506`, `1:4901`) next to the Header instance.
- Every wizard screen keeps a **hidden duplicate Banner**. 12 hidden banners carry older copy: "New Application / Residency · Draft GME-2026-000123" (9) and "Fellowship · Draft …" (3).

### Local components defined in GME

Only **Footer** (`1:6065`).

### Variables

The variables used are named in the DS style (Primary/Navy …, Secondary/…, Blue/200, Orange/200, Red/200). They resolve to the same hex values as the DS Colors page. They come in through copied components or local copies, not through a library subscription.

### Conclusion

GME is effectively **unlinked**. To consume DAHC-UI, the DS file must be published and GME's screens rebuilt from DS instances. Until then, the app should map frame names to DAHC-UI components by convention.

---

## 3. Component usage

Counts are frame or instance names found in the metadata, across all 16 screens. In the DS column, "Yes" means the DS file has a matching page or component (seen in the DS page list and the Content/Form Components metadata). "Partial" means the DS has something similar but GME's version differs.

| Component / pattern | GME evidence (count) | Variants or states seen | In DS? | Notes |
|---|---|---|---|---|
| **App header** (logo tile, nav link, icon buttons, notification badge, language pill, profile pill) | Header ×16 inst; Icon button ×42; Pill ×28; Badge ×14 | Logged-in only | Partial (DS Navigation / Navigation Components / Burger Menu) | Logo tile 113×111 hangs below the 80 px bar. Icon buttons 40 px round on navy-100. Badge 16 px red. |
| **Page banner / hero** (breadcrumb, H1, subtitle or meta row, status tag, optional action) | Banner ×30 (16 visible); Breadcrumb ×28; Title row ×28 | Dashboard (with action), wizard (meta row plus DRAFT tag), first-time welcome | Partial (DS "half-banner", "Banner Content", Breadcrumbs) | Blue/200 background. Meta row shows "Label - **Value**" pairs. |
| **Breadcrumb** | ×28 | home icon › link › current (bold) | Yes (Breadcrumbs page `50:9703`) | 13 px. |
| **Vertical step wizard / stepper** | Steps ×17; step items ×19 each | done (filled navy), current (blue/200 background, outlined), upcoming (grey outline); **nested sub-steps** for Personal Information (current sub-step in sky `#32affc`) | **No** (DS has "Service Steps", "Step Name" and Page indicators, which are process infographics and paginators) | Highest-value new component. Steps are listed but do not show their state (complete, error). |
| **Step header** ("STEP n OF m" eyebrow plus H2) | Stack ×89 (generic) | — | No | Eyebrow 12 Medium, uppercase, tracking 0.72. |
| **Card / panel** | Card ×35 | Form card, stepper card, side info card, Key dates card | Yes (Cards `50:13532`) but different | GME: white, 1 px navy-200 border, radius 16, padding 24, **no shadow**. |
| **Text input** | Input ×97 (all types) | default, filled, placeholder, **read-only/verified** (navy-100 background), **computed**, masked, with leading icon (link), with trailing calendar | Yes (Input fields `50:7751`, Form "Input field") | h48, radius 10. No error, focus or disabled-with-reason states. |
| **Select / dropdown** | (subset of Input) | closed; one **open multi-select with search** (`1:2394` option list, Search inst, "List Item / Single / Default" ×4) | Yes (Dropdown `50:12859`, Search `50:8200`) | Chevron 16 px. |
| **Multi-select with ordered chips** | "Preference # training sites", trainingsite ×8 | Chips with drag handle, rank number badge, × remove | No | GME-specific. Ranked preference picker. |
| **Phone input** | "Phone number input", "Country selector chevron" ×1 | Country selector | Unclear | |
| **Date input** | calendar ×2 inst; DD/MM/YYYY placeholders | — | Yes (Datepicker `50:7957`) | No open calendar state in GME. |
| **Radio group (Yes/No)** | Radio ×40 | selected / unselected, horizontal | Yes (Controls `50:7872`) | 20 px radio, row h44, gap 20. |
| **Checkbox** | Terms accept; checkboxes in the dropdown list | checked / unchecked | Yes (Controls, Checkboxes) | |
| **File upload slot** | Button / Choose file ×21 | Empty ("No file chosen") only | Partial (DS "Upload" ×6 in Content Components) | Dashed 2 px navy-600 box, radius 10, "Choose file" outline pill. |
| **Uploaded file row** | File row ×2 | Uploaded (badge, type/size limit, filename · size, Preview, delete) | Unclear (DS Upload may cover it) | No progress, error or too-large states. |
| **Buttons** | "Button / Back" ×56 (misnamed, used for every outline button); Save Draft ×14; Save & Continue ×12 (mostly hidden); Start New Application ×16; Choose file ×21; btn-next ×14; Discard Draft, Appeal Score, Exclude Training Site, View Application, Pay & Submit, Go to dashboard, Download receipt | Solid navy, outline navy, outline red (Discard), solid red (Withdraw), disabled (opacity 0.2) | Yes (Buttons `50:6773`) | Sizes differ from DS (see §4). |
| **Sticky action bar** (Save As Draft, Discard ‖ Back, Next: \<step\>) | actions ×14 | — | No | Full-width white bar above the footer. |
| **Status tag (large)** | Informational tags ×15 inst | DRAFT (orange), SUBMITTED (cyan) | Yes (DS Informational tags) | h36, radius 8, border 2, 18 or 14 Bold uppercase. |
| **Small tag / chip** | Tag ×28 frames, 1 inst | Complete (green) ×16, In Complete, Required, OPTIONAL, REFERENCE ×3, Review Completed, Submitted, Uploaded, "N points" pill, "GME JOURNEY" | Yes (Chips and Tags `50:7413`) | Many are hidden. Colour semantics are not tokenised. |
| **Inline note / callout** | Note ×10 | Info (blue/200) | Unclear | Radius 12, padding 16/14, 13 px. |
| **Toast / alert banner** | ToastBanner ×4; Banner (inner) ×2; Info banner ×1 | Warning (pale yellow, alert-triangle, close), info (pale cyan, info icon, close) | Unclear (no alert page in DS) | Placed at the top of the content area. Dismissible. |
| **Modal / dialog** | Dialog `1:5892` plus Scrim `1:5891` | Success | Yes (DS Modal ×2 in Content Components) | 520 px wide, featured icon, details grid, single CTA. |
| **Key/value display** | Created/Submitted/Announcement, Key dates, Pay grid (Status ×2, Bill amount, …) | — | No | Label 12 navy-900 over value 15 navy-600/700. |
| **Stat / score tile** | 4 per dashboard | Portfolio (orange/200), Entrance (blue/200), GPA (purple 20%), Shortlisting (red/200) | Partial (DS "Stats" frame) | Radius 12, padding 14, 24 Bold value. |
| **Preference summary card** | Pref1 ×2 (dashboard), Preference # ×6 | Read-only (dashboard), editable (Program step) | No | The dashboard version uses absolute positioning (sloppy layout). |
| **Section completion checklist** | Checklist ×2 | Row with step name and Complete tag | No | Review screen. |
| **Question card (portfolio)** | Q rows ×6 | Collapsed (No) / expanded with conditional fields (Yes); points pill | No | Repeatable conditional form group. |
| **Terms scroll box** | "Terms" ×1 | Scrollable rich text with checkbox | No | |
| **Icon tile + label** (admission cycle) | "MBRU icon tile", "… icon tile" ×2 | Blue / red / green tints | No | 40 px rounded tiles. |
| **Bullet checklist card** ("Before you begin") | Document bullet ×4 | — | No | |
| **Footer** | Footer ×14 frames plus 1 inst | Two content variants (see §7) | Partial (DS footer in Navigation Components) | Navy background, 3 columns, copyright band. |

---

## 4. Variations GME introduces beyond the DS

### Tokens referenced (from `get_variable_defs` on `1:3827`)

| Variable | Value |
|---|---|
| Primary/Navy Blue | `#002F70` |
| Primary/Navy 100 / 200 / 500 / 600 / 700 / 800 / 900 | `#e5ebf0` / `#ccd6e0` / `#8099b2` / `#6685a3` / `#4d7094` / `#335c85` / `#1a4775` |
| Primary/Page background | `#ecf2f5` |
| Blue/200 | `#d6eefe` |
| Orange/200 | `#fef1db` |
| Red/200 | `#ffe9e8` |
| Secondary/Red | `#ff8f8a` |
| Secondary/Blue Black | `#0a233c` |
| Secondary/White | `#ffffff` |
| Secondary/5. Orange | `#FABC4C` |
| Text style | Functional/18/Bold Uppercase (Dubai Bold 18/22) |

### Hard-coded values, not tokens

- `#32affc`: sky link/accent, used for programme text, specialty and the active sub-step.
- `#77defc` plus `rgba(119,222,252,.24)`: SUBMITTED tag.
- `rgba(250,188,76,.36)`: DRAFT tag background.
- `rgba(172,157,255,.2)`: purple GPA tile.
- Green "Verified via ICP" helper text.
- Green "Complete" and "Uploaded" tag fills.
- Pale-yellow warning toast.
- Action-bar shadow `0 12 32 rgba(0,47,112,.02)`.
- `font-family: Mulish` leaks into two text runs (footer "Reach us on", dashboard note).

### Buttons: DS vs GME

| Aspect | DS (Buttons page, Primary Navy) | GME |
|---|---|---|
| Large height | 48, px32, radius 30 | Action bar: h48, px20, **radius 999**. btn-next: px32 py12, **radius 25** |
| Medium | px24 py12, radius 35 | Dashboard: **h44**, px30, radius 999 |
| Small | — | Choose file: **h40**, px20, radius 999 |
| Label | Dubai Bold **18**/20, capitalised | Dubai Bold **16**/24 (action bar), **14** (dashboard, choose file, Back) |
| Hover / active | `#335c85` / `#1a4775` | Not designed |
| New variants | — | **Outline red** (Discard), **solid red** (Withdraw), **disabled = opacity 0.2** |

### Inputs

GME inputs are h48, radius 10, 1 px border `#6685a3` (navy-600), px14, value 15 Medium (`#002f70`), placeholder navy-500. The label is 13 Medium navy with a 6 px gap. Helper text is 12 Regular navy-900.

New variants:
- **read-only/verified:** navy-100 background, navy-200 border, value in navy-900.
- **verified helper text** in green.
- **computed field** with a caption.

### Cards and radii

| Element | Radius |
|---|---|
| Cards | 16 |
| Stepper items, notes, score tiles | 12 |
| Inputs, upload box | 10 |
| Status tag | 8 |
| Pills, buttons | 999 |

Cards have **no elevation**: border only.

### New patterns

- Vertical step wizard with nested sub-steps
- Sticky wizard action bar
- Ranked multi-select with reorderable chips
- Repeatable or conditional question cards with point values
- Upload slot plus uploaded-file row
- Read-only verified field
- Computed field
- Section-completion checklist
- Score tiles
- Key/value grid
- Terms scroll-and-accept box
- Success dialog with receipt details

### Typography

Font family is **Dubai** (Regular, Medium, Bold) throughout.

| Role | Size and weight |
|---|---|
| H1 | 36 Bold |
| Card/step title | 22 Bold |
| Side-card title | 16 Bold |
| Input value | 15 Medium |
| Body / step label | 14 Medium |
| Label / breadcrumb | 13 |
| Eyebrow, helper, meta label | 12 |
| Badge | 10 Bold |

---

## 5. Visual direction

### Page structure (top to bottom)

1. White header, h80.
2. Blue/200 banner, about 232 high, padding 44/24.
3. Page background `#ecf2f5` content area, padding 32 top, 48 bottom.
4. White action bar, padding 24/40.
5. Navy footer: 40/32 band plus 16 px copyright band.

### Grid and widths

- Centred **1200 px container with 24 px side padding**, giving 1152 px usable width. There is no column grid; spacing comes from auto-layout gaps.
- **Wizard:** stepper card **300** plus gap **24** plus form card **828** (778 inner).
- **Dashboard:** main **788** plus side **340**, gap 24.
- **Form fields:** 2-column rows, gap 20, row gap 20. Uploads and long questions span both columns.

### Density and colour

- Density is medium: 48 px controls, generous card padding, single-column scroll.
- Navy dominates (text, primary buttons, filled step circles). Light blue is used for the banner, the active step and info notes.
- Pastel tints are used for score tiles and tags. Red is reserved for Discard/Withdraw and the notification badge. Orange is used for the DRAFT status.
- The overall feel is a calm government/health portal with flat cards and rounded pills.

---

## 6. Repo PNGs (`Design_System/UIUX/`) vs Figma

The file names on disk literally contain mojibake (`┬╖` instead of `·`), for example `Dashboard ┬╖ Web.png`. All are 1280 px wide. I visually compared Dashboard, Program and preferences, and Personal information. I compared the other six by size only.

| PNG | PNG height | Figma frame | Figma height |
|---|---|---|---|
| Dashboard | 1130 | `1:1938` | 1407 |
| Program and preferences | 1173 | `1:2189` | 1593 |
| Personal information | 1818 | `1:2781` | 2505 |
| University grades | 1459 | `1:3827` | 1562 |
| Application information | 2006 | `1:2505` | 2376 |
| Board and license | 1645 | `1:4647` | 1652 |
| English proficiency | 1163 | `1:4064` | 1347 |
| Internship information | 1245 | `1:4255` | 1413 |
| Residency information | 1221 | `1:4456` | 1341 |

**The PNGs are an earlier iteration, not the current Figma.** Remnants of that version still sit hidden in the Figma file (old banners, "Save & Continue" rows). Differences:

- **Header:** PNG has About Us / Programs / Contact Us links plus an **accessibility icon button**, with "Profile" or the user name. Figma has only "Home" and no accessibility button.
- **Wizard banner:** PNG has H1 "New Application" with "Residency · Draft GME-2026-000123" and no status tag. Figma has "Medical Application", a meta row (Application ID / Admission Cycle / Created On) and a **DRAFT** tag.
- **Actions:** PNG has Save Draft / Back / Next or Save & Continue **inside the form card**, divided by a rule. Figma uses a **full-width action bar** with Save As Draft, **Discard**, Back and "Next: \<step\>".
- **Program & Preferences:** PNG has a flat 2×2 grid of selects (Preference 1/2 plus training sites). Figma has **Preference cards with a searchable multi-select and ranked chips**.
- **Personal information:** PNG is one page (identity, contact, emergency contact, 2 uploads). Figma splits it into **4 sub-steps** with nested stepper items and many more ICP fields.
- **Dashboard:** PNG shows populated scores (84/78/3.7/81.2), a "Review Completed" green tag, an enabled "Start New Application" with the hint "You already have an active application in this cycle", a Program/Preference/Training-sites row, and a session-security card. Figma shows a SUBMITTED tag, preference cards, "—" scores, a disabled Appeal Score, a reordered button row (Withdraw first), and no security card.
- **Steppers and visual language:** stepper and card visual language (radii, colours, Dubai font) are the same in both.

---

## 7. Gaps and inconsistencies

### Missing designs

- **No tablet or mobile** frames at all, and no responsive behaviour for the 300+828 wizard or the header (DS has a Burger Menu).
- **No RTL/Arabic** screens, even though the header has an "العربية" toggle.
- **No Entrance Exam step** screen (step 7 of the 9-step variant).
- No **"My Applications"** list, even though the breadcrumb links to it.
- No read-only **View Application** screen.
- No notifications panel, profile menu or search overlay.

### Missing states

- **Error and validation:** none. No invalid input, required-field errors, step-level error markers, or upload errors (too large, wrong type).
- **Loading:** none. No skeletons, spinners, upload progress, save-draft feedback, or payment processing/redirect.
- **Empty:** only the first-time dashboard. Scores show "—" with no explanation.
- **Interaction:** no focus, hover, pressed or disabled specs (disabled appears only as opacity 0.2). Only one open dropdown and no open date picker.
- **Dialogs:** only a success dialog. Missing: confirmations for Discard / Withdraw / Exclude Training Site / Appeal, session-timeout warning, payment failure, and "Portfolio is one-time" confirmation.
- **Status coverage:** only Draft and Submitted on the banner tag. Missing: Under review, Shortlisted, Rejected, Withdrawn and others. "Review Completed" exists only as a hidden or legacy tag.

### Inconsistencies

- **Step counting:** 9- and 10-step steppers coexist. Pay & Submit says "STEP 9 OF 9" while its stepper shows 10 steps.
- **Next-button copy:** "Next Step", "Next: Universal Grades" (typo), "Next : Portfolio" (spacing), "Next: Application Information".
- **Typos:** "Intranal Medicine", "Martial Status", "In Complete".
- **Layer naming:** every outline button is named "Button / Back". The step-circle frame is named "Row".
- **Footer content differs:**
  - First-time dashboard: Terms and Conditions / Privacy policy / Contact us, "800 MBRU (6278)", info@mbru.ac.ae.
  - All other screens: About Dubai Health / Media Center / Careers / Contact Us / Privacy Policy / Sitemap, "800 60".
- **Notification badge** is red with dark text. Accessibility contrast needs checking.
- **Dashboard preference cards** use absolute positioning and uneven widths (351 vs 360).
- **Detached copies everywhere:** hidden duplicate headers and banners, 14 detached footers, hard-coded colours and button sizes that differ from DS Buttons.
- **No library link:** see §2.

---

## 8. Shared components DAHC-UI needs for GME (priority order)

1. **Form field family:** input (default, read-only/verified, computed, masked, leading/trailing icon), select, searchable multi-select, phone input, date input, radio group, checkbox, with label, helper and error slots.
2. **File upload:** empty slot, uploaded row (preview, delete), plus progress and error states.
3. **Button set:** solid/outline × navy/red, sizes 40/44/48, disabled. Reconcile with DS sizes.
4. **Vertical stepper / wizard nav:** states done, current, upcoming, error, with nested sub-steps. Also the step header and the **wizard action bar**.
5. **Status tag and small tag/chip:** semantic colour set (draft, submitted, complete, incomplete, required, optional, uploaded, points).
6. **Card / panel** (radius 16, bordered) plus key/value list, stat tile, section checklist.
7. **Page banner** (breadcrumb, title, meta, status, action) plus **breadcrumb**.
8. **App header** (logo tile, icon buttons with badge, language and profile pills) plus **footer**.
9. **Inline note / callout** and **dismissible toast/alert** (info, warning, plus the missing success and error).
10. **Dialog** (success; confirm/destructive still to be designed).
11. **GME-specific (app-level, built from the shared pieces):** ranked preference picker, conditional question card with points, terms accept box, score tiles, admission-cycle icon tiles.
