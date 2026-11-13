# GME Candidate screens: field-level specification

- **Figma file:** `49e9Tehx9N8XupCFJC98cW` ("GME"), page `0:1` "Candidate". Read-only.
- **Companion doc (inventory, layout, tokens, components):** `frontend/docs/design-system/figma-extracts/gme-candidate-screens.md`. This file adds the content: labels, controls, placeholders, options, conditions and copy.
- **Extraction date:** 2026-11-12.

## Sources and confidence

The Figma MCP View-seat limit was already used up when this extraction started. `create_session` worked, but the first `get_metadata` call was rate-limited. So no live Figma calls were made for this file. Sources used instead:

| Tag | Source | What it gives |
|---|---|---|
| **M** | Full page metadata for `0:1`, saved during the earlier analysis session (`get_metadata`, same file, same day) | Every node id, layer name, size, position and `hidden` flag. For text nodes the layer name is usually the text. |
| **S** | Figma screenshots from the earlier session (13 frames: both dashboards, Program, Application info, Identity, Contact, Identification attachments, University grades, Internship, Board and license, Portfolio, Pay and submit, success dialog) | Confirms the rendered text, selected states, which controls are selects (chevron), and which inputs are empty. |
| **PNG** | `Design_System/UIUX/*.png` | **PNG (older iteration).** Used only where no Figma screenshot exists (English proficiency, Residency). |

Rules used when reading the metadata:

- A text layer named `Text` with width 0 is an **empty input** (no value, no placeholder). Screenshots confirm this.
- `Select` inside an input with a 16 px chevron icon is a **select placeholder**.
- Layer names can be stale. Where the screenshot shows different text, the screenshot wins, and this is noted. Examples: the first-time dashboard tile layer "MBRU" renders as "GME - Internships", and "Admission heading" renders as "Admission Cycle".
- `[hidden]` means the node, or one of its ancestors, has `hidden="true"` in Figma. Hidden blocks are listed because they are probably alternate states or planned content. They are not part of the visible design.
- Typos are copied verbatim and flagged with **(typo)** or **(sic)**.

Legend for the layout column: **L** = left column, **R** = right column (2-column grid, 379 px each, gap 20), **Full** = spans both columns (778 px).

---

## 0. Shared shell

### 0.1 Header (all 16 frames, Header instance, for example `1:2218`)

The Header instance's children aren't in the metadata (its main component `1:9` is unreachable). Content below is from screenshots (S).

| Element | Content |
|---|---|
| Logo tile | Dubai Health / MBRU lock-up, 113×111, overhangs the banner (`MBRU logo`, for example `1:2502`) |
| Nav links | **Home** (only link) |
| Icon buttons | Search; Notifications (bell) with red badge **"3"** |
| Language pill | **العربية** |
| Profile pill | Person icon + user name: **"Mohamed Hazim"** (wizard and returning dashboard), **"Mohamed"** (first-time dashboard) |

Hidden detached header (on every wizard screen, for example `1:2190`) [hidden], older iteration: nav **About Us / Programs / Contact Us**, 3 icon buttons (search, accessibility, bell with "3"), pill **العربية**, pill **Profile**.

### 0.2 Wizard banner (all wizard screens, for example `1:2219`)

| Element | Copy |
|---|---|
| Breadcrumb | home icon › **My Applications** › **New Application** (current, bold) |
| H1 | **Medical Application** |
| Meta row (label regular, value bold) | **Application ID - 2026-G1234567**  ·  **Admission Cycle - 2026-2027**  ·  **Created On - 22/10/2026** |
| Status tag (right) | **DRAFT** (orange, dot icon) (`Informational tags`, for example `1:2237`) |
| Banner action [hidden] | Button **New Application** + helper "You already have an active application in this cycle." |

Note: the meta label and value are separated by " - " (space-hyphen-space). In the screenshots, "Admission Cycle" and "Created On" have an extra space before the hyphen.

Hidden duplicate banner (older copy) [hidden]: H1 **New Application**, subtitle **"Residency · Draft GME-2026-000123"** (screens 3a–5), **"Fellowship · Draft GME-2026-000123"** (Internship, Residency, Board).

**Inconsistency:** the application ID format is "2026-G1234567" in the banner but "GME-2026-000123" on the dashboard, Pay and submit, and the success dialog. The created date is "22/10/2026" in the banner but "04 Sep 2026" on Pay and submit.

### 0.3 Step header (form card top)

- Eyebrow: **STEP n OF m** (uppercase, 12 Medium)
- H2: the step title (22 Bold)
- Sub-steps of Personal Information add a sky-blue (`#32affc`) sub-heading inside the card (for example "Identity Details").

### 0.4 Stepper variants (left card, 300 px)

Only **Portfolio** (`1:4900`) and the two **Pay and submit** frames (`1:5351`, `1:5621`) hold two stepper cards, one visible and one hidden. Every other wizard screen holds just one stepper. *(This corrects the companion doc, which says every wizard screen has two.)*

**A. 9-step variant** (visible on screens 1–5 and the Personal Information sub-steps; hidden on Portfolio `1:5025` and Pay `1:5427`):

| # | Label |
|---|---|
| 1 | Program & Preferences |
| 2 | Application Information |
| 3 | Personal Information |
| 3.a | Identity *(sub-step, only shown while step 3 is active)* |
| 3.b | Contact Information |
| 3.c | Next of Kin Information |
| 3.d | Identification Attachments |
| 4 | University Grades |
| 5 | English Proficiency |
| 6 | Internship Information |
| 7 | Entrance Exam |
| 8 | Portfolio |
| 9 | Pay & Submit |

The hidden 9-step stepper on Pay and submit (`1:5453`) has an **Information icon** (`1:5457`) next to "Entrance Exam". This may be a planned "attention" or "not applicable" marker. Its meaning is not specified.

**B. 10-step variant** (visible on Internship `1:4327`, Residency `1:4528`, Board `1:4719`, Portfolio `1:4984`, Pay `1:5467`):

| # | Label |
|---|---|
| 1 | Program & Preferences |
| 2 | Application Information |
| 3 | Personal Information |
| 4 | University Grades |
| 5 | English Proficiency |
| 6 | Internship Information |
| 7 | Residency Information |
| 8 | Board & License |
| 9 | Portfolio |
| 10 | Pay & Submit |

On Portfolio and Pay, the layer names for steps 8 to 10 are shuffled (for example frame "Portfolio" holds the text "Board & License"). The rendered order is the one in the table.

**Step states (S):**

- **done:** filled navy circle with a white number.
- **current:** Blue/200 row background with an outlined circle.
- **upcoming:** grey outlined circle with grey text.
- **sub-steps:** the current sub-step is sky blue, the others grey. Sub-steps have no number or icon.

**Inconsistencies:**

- On Portfolio (S), step 8 "Board & License" renders as *upcoming* even though step 7 is done and step 9 is current.
- On the Program step, step 1 is current, and Application Information shows step 1 as done. So the stepper reflects visited or completed steps.

### 0.5 Wizard action bar (`actions`, full width, for example `1:2466`)

| Side | Buttons (verbatim) |
|---|---|
| Left | **Save As Draft** (outline navy) · **Discard** (outline red) |
| Right | **Back** (outline navy) · primary "next" button (solid navy), with per-screen copy: |

| Screen | Next-button label |
|---|---|
| Program & Preferences | Next: Application Information |
| Application Information | Next: Personal Information |
| Identity / Contact / Next of Kin | Next Step |
| Identification Attachments | **Next: Universal Grades** (typo, should be "University Grades") |
| University Grades | Next: English Proficiency |
| English Proficiency | Next: Internship Information |
| Internship Information | Next: Residency Information |
| Residency Information | Next: Board & License |
| Board & License | **Next : Portfolio** (sic, space before colon) |
| Portfolio | **Next : Pay & Submit** (sic, space before colon) |
| Pay & Submit `1:5351` | Pay & Submit |
| Pay & Submit with dialog `1:5621` | Next Step *(inconsistent with `1:5351`)* |

Hidden in-card action row on every wizard screen (older iteration) [hidden]: **Save Draft** · **Back** · **Next** or **Save & Continue** (Pay: **Pay & Submit**).

### 0.6 Footer

**Variant 1: all wizard screens and the returning dashboard** (detached frames, for example `1:2478`; instance `1:2184`):

- Logo (Dubai Health / MBRU)
- Links in 2 columns × 3 rows: **About Dubai Health** · **Media Center** / **Careers** · **Contact Us** / **Privacy Policy** · **Sitemap**
- **Reach us on 800 60** ("800 60" bold)
- Copyright band: **© 2026 Dubai Health. All rights reserved.**

**Variant 2: first-time dashboard only** (local Footer symbol `1:6065`, S):

- Logo
- Links in one row: **Terms and Conditions** · **Privacy policy** · **Contact us**
- **Reach us on** / **800 MBRU (6278)** (sky link) / **info@mbru.ac.ae** (sky link)
- Copyright band: **© 2026 Dubai Health. All rights reserved.**

---

## 1. Dashboard · First-time candidate (`1:5928`)

**Banner**

- Breadcrumb: home › **Dashboard**
- H1: **Welcome, Mohammed** (the header pill says "Mohamed", so the spelling is inconsistent)
- Subtitle: **Take the first step towards your GME journey.**
- Banner action [hidden]: button **Start Application**

**Info toast** (`1:6053`, pale cyan, info icon, close ×, full width)

- **"For your security, you'll be signed out after 30 minutes of inactivity."** (S. The layer is named "Text".)
- Hidden sibling warning toast `1:6058` [hidden]: alert-triangle and close. Its text is not available (layer named "Text").
- Hidden note `1:6063` [hidden]: "For your security, you’ll be signed out after [N] minutes of inactivity. Your draft is saved automatically."

**Main column (788 px)**

1. **Hero card "No applications yet"** (`1:5947`)
   - Tag: **GME JOURNEY** (S. The layer says "YOUR GME JOURNEY".)
   - H2: **Your next chapter starts here**
   - Body: **"You haven’t started an application yet. Explore your options and get ready to apply for a graduate medical education program."** (S. The layer name is truncated.)
   - Hidden "Get started" row `1:5952` [hidden]: button **Start Application** + text "Your application will appear here once you start."
2. **Admission Cycle card** (`1:5957`)
   - Heading: **Admission Cycle** (S. The layer is named "Admission heading".)
   - Primary button (right): **Start New Application** (S. The layer is named "Label".)
   - 3 icon tiles (value bold over caption):

     | Tile | Value | Caption | Tint |
     |---|---|---|---|
     | Award icon | **GME - Internships** (S. The layer says "MBRU".) | Academic Entity | blue |
     | Calendar icon | **December 31, 2026** | Application Creation Deadline | red |
     | Bookmark icon | **2026** | Academic Year | green |

   - Hidden duplicate tile group [hidden] and hidden tags `1:5982`/`1:5983` [hidden] (label text unknown).
3. **"How to apply" card** `1:6009` [hidden]
   - Heading: **Your application, step by step**
   - Numbered steps (34 px circles):
     1. **Choose your program**: "Review available programs and check the eligibility criteria"
     2. **Complete your application**: "Add your details, preferences and supporting documents."
     3. **Review and submit**: "Check your information and submit before the deadline."

**Side column (340 px)**

1. **Before you begin** card (`1:6030`)
   - Heading: **Before you begin**
   - Lead: **Have these documents handy:**
   - Bullets: **Identification documents** · **Academic qualifications & transcripts** · **Exam results, if required** · **Updated CV**
   - Divider, then footnote: **"Requirements vary by program. Check eligibility before you start."** (S)
2. **Application submission deadline** card `1:6047` [hidden]
   - Heading: **Application submission**
   - Key/value: **Last date of submission** → **30 Sep 2026**

---

## 2. Dashboard · Web, returning candidate (`1:1938`)

**Banner**

- Breadcrumb: home › **Dashboard**
- H1: **Dashboard**
- Subtitle: **Welcome back, Aisha. Track your GME application and next steps.** (the header pill says "Mohamed Hazim", so the name is inconsistent)
- Banner action: **New Application** (shown disabled, opacity 0.2)
- Hidden helper text [hidden]: "You already have an active application in this cycle."

**Application card** (visible `1:2013`)

| Element | Content |
|---|---|
| Eyebrow | **APPLICATION ID** |
| ID | **GME-2026-000123** |
| Program line (sky) | **Residency · Family Medicine** |
| Status tag | **SUBMITTED** (cyan, `Informational tags` `1:2021`). A small "Submitted" tag `1:2019` is hidden. |
| Key/values (3 columns) | **Created** → 24 Oct 2026 · **Submitted** → 25 Oct 2026 · **Announcement** → 05 Nov 2026 |
| Hidden row `1:2023` [hidden] | **Program** → Residency; **Preference 1** → Emergency Medicine; **Training sites** → Rashid Hospital, Dubai Hospital |

**Preference summary cards** (2, read-only):

| Card | Speciality label | Speciality value (sky) | Training Site label | Sites |
|---|---|---|---|---|
| **Preference 1** | Speciality | **Intranal Medicine** (typo, should be "Internal Medicine") | Training Site | Rashid Hospital · Latifa Hospital |
| **Preference 2** | Speciality | Family Medicine | Training Site | Dubai Hospital · Latifa Hospital |

Hidden inside each card [hidden]: drag-handle group, **REFERENCE** tag, and editable chips (Rashid Hospital #1, Latifa Hospital #2, with ×).

**Scores** (eyebrow **SCORES**, 4 tiles, value then caption):

| Tile | Value | Caption | Tint |
|---|---|---|---|
| 1 | — | Portfolio final score | orange |
| 2 | — | Entrance exam score | blue |
| 3 | — | GPA score | purple |
| 4 | — | Shortlisting score | red |

Hidden filled variant [hidden]: 84 / 78 / 3.7 / 81.2, with the third caption reading "GPA" instead of "GPA score".

**Action row** (after a divider): **Withdraw Application** (solid red) · **Appeal Score** (disabled) · **Exclude Training Site** (outline navy) · **View Application** (solid navy).

**Side column**

- **Key dates** card: **Submission deadline** → 30 Sep 2026 · **Score announcement** → 05 Nov 2026 · **Appeal deadline** → 07 Nov 2026
- Info note: **"Appeal window open.** You can appeal once, within 48 hours of the announcement. Only the final-round score is shown." ("Appeal window open." is bold.)
- Hidden note `1:2182` [hidden]: "For your security, your session ends after a period of inactivity. Save your work often."

**Hidden older card `1:1959`** [hidden]:

- **APPLICATION ID** / GME-2026-000123 / "Residency · Emergency Medicine", with tag **Review Completed**
- Fields: Program / Preference 1 / Training sites; Created 04 Sep 2026 / Submitted 12 Sep 2026 / Announcement 05 Nov 2026
- Filled scores, and the same 4 buttons

---

## 3. Step 1: Program & Preferences (`1:2189`), STEP 1 OF 9

Card H2: **Program & Preferences**

| # | Label | Control | Value / placeholder | Helper | Layout |
|---|---|---|---|---|---|
| 1 | Admission cycle | **Read-only** input (navy-100 background, no chevron) | 2026–2027 (en dash) | — | L |
| 2 | Program | Select | Residency | — | R |

Section heading: **Specialities and Training Sites**

Two **Preference cards** side by side (each about 374 px, so 2-column):

| Element | Preference 1 (`1:2301`) | Preference 2 (`1:2349`) |
|---|---|---|
| Header | Drag handle + **Preference 1** | Drag handle + **Preference 2** |
| Tag (hidden) | **REFERENCE** [hidden] | **OPTIONAL** [hidden] |
| **Speciality** (select) | Internal Medicine | Family Medicine |
| **Training sites** (multi-select, shows a comma list) | "Rashid Hospital, Latifa Hospital" | "Rashid Hospital," (open state) |
| Ranked chips (drag handle, number badge, site name, "X" remove) | 1 Rashid Hospital · 2 Latifa Hospital | [hidden] 1 Rashid Hospital · 2 Dubai Hospital |

**Open multi-select panel** (Preference 2, `1:2373`):

- Search input: placeholder **Search...**, leading search icon, trailing clear (⊗) icon
- Checkbox option list:
  - ☐ **Latifa Hospital**
  - ☐ **Dubai Hospital** (hover row)
  - ☑ **Rashid  Hospital** (selected, sky text; **(sic)** double space in the rendered text)
  - One more option row is hidden (`1:2394`, label unknown)

Visible option values seen in the design:

- Program: Residency
- Speciality: Internal Medicine, Family Medicine, Emergency Medicine (hidden older row)
- Training sites: Rashid Hospital, Latifa Hospital, Dubai Hospital

No full option lists are designed.

Hidden older rows [hidden]:

- **Preference 1** (select, Emergency Medicine) | **Preference 1 training sites** (select, "Rashid Hospital, Dubai Hospital")
- **Preference 2** (Family Medicine) | **Preference 2 training sites** (Latifa Hospital)

**Note** (full width, info blue): **"You can pick the same site for different specialties. Specialties and sites depend on the program."**

Spelling inconsistency: the labels say "Speciality" / "Specialities" while the note says "specialties". Residency uses "Specialty".

---

## 4. Step 2: Application Information (`1:2505`), STEP 2 OF 9

Card H2: **Application Information**

| # | Label | Control | Value / placeholder | Helper text | Layout |
|---|---|---|---|---|---|
| 1 | Candidate Status | Select | Active Dubai Health Employee | **Values depend on the selected program and speciality** | L |
| 2 | ID number | Text input | 231423543546 | **Required for every status except external candidate** | R |
| 3 | Will an external entity or your employer sponsor your training? | Radio Yes / No | No selected | — | L |
| 4 | Are you currently employed? | Radio Yes / No | Yes selected | — | R |
| 5 | Employment letter | Upload slot ("No file chosen" + **Choose file**) | — | none (no type or size text) | Full |
| 6 | Are you currently registered in the MBRU Residency Program? | Radio Yes / No | No selected | — | L (R is a spacer) |

**Conditionals (inferred, not annotated in Figma):**

- **ID number** is shown or required depending on Candidate Status (from its helper text).
- **Employment letter** sits directly under "Are you currently employed?", which is Yes in the design. It is probably shown only when that answer is Yes.

Section heading: **Declarations** (4 Yes/No radios, 2 columns, all "No" selected)

| # | Question (verbatim) | Layout |
|---|---|---|
| 7 | Have you ever been denied a medical license or had it revoked, limited, restricted or suspended? | L |
| 8 | Have you ever been placed on academic probation in a training program? | R |
| 9 | Have you ever been dismissed from a residency, fellowship or professional appointment? | L |
| 10 | Do you have any pending or previous professional misconduct? | R |

Section heading: **Documents** (upload slots, full width, each "No file chosen" + **Choose file**, with no type or size text)

| # | Slot label (verbatim) |
|---|---|
| 11 | CV |
| 12 | Personal statement · 1st preference · Rashid Hospital |
| 13 | Recommendation letter · 1st preference |

The labels suggest that a personal statement and a recommendation letter repeat per preference (and per site for the personal statement). Only the 1st preference is drawn.

Section heading: **Terms and conditions**

**Terms scroll box** (`1:2727`, bordered, about 237 px high, vertical scrollbar). Verbatim (layer text), with paragraph breaks per the screenshot:

> Dear **<Candidate Name>**,
> Greetings! Thank you for your interest in <Program Name> Program. Kindly read the following carefully before proceeding with your application.
> 1. Candidates are shortlisted solely based on academic merit as outlined on the website; However, in some cases priority will be given to UAE Nationals.
> 2. Candidates must complete the application form and ensure that all the information filled in is correct. Any changes in the form will be the responsibility of the candidate. Moreover, all required attachments should be clear and in PDF format with the exception of the photo. GME has the right to screen out any incomplete or inaccurate application after the submission deadline.
> 3. GME has the right to reject any application if it is found to have false or manipulated information or documentation.
> 4. The application fee is non-refundable. This amount is paid for processing & reviewing the application and is mandatory to consider the application complete.

Summary: the terms say shortlisting is merit-based with UAE National priority, that attachments must be PDF except the photo, and that GME may reject incomplete, inaccurate or false applications. The fee is non-refundable. The text uses the placeholders `<Candidate Name>` and `<Program Name>`. **(sic)** "; However" has a capital H after a semicolon.

| 14 | **I have read and accept the terms and conditions** | Checkbox (unchecked) | Full |
|---|---|---|---|

---

## 5. Step 3: Personal Information, sub-steps

All four frames: eyebrow **STEP 3 OF 9**, H2 **Personal Information**. The stepper expands step 3 to show the sub-steps (§0.4).

### 5a. Identity (`1:2781`), sub-heading **Identity Details**

**Note** (info blue, full width): **"Identity details were pre-filled from ICP through UAE Pass and can’t be edited."**

"Read-only verified" means: navy-100 background, no border emphasis, and the green helper text **Verified via ICP**.

| # | Label (verbatim) | Control | Value / placeholder | Helper | Layout |
|---|---|---|---|---|---|
| 1 | English first name | Read-only verified | Ayesha | Verified via ICP | L |
| 2 | English middle name | Read-only verified | Fatima | Verified via ICP | R |
| 3 | English last name | Read-only verified | Mohammed | Verified via ICP | L |
| 4 | Arabic first name | Read-only verified | عائشة | Verified via ICP | R |
| 5 | Arabic middle name | Read-only verified | فاطمة | Verified via ICP | L |
| 6 | Arabic last name | Read-only verified | محمد | Verified via ICP | R |
| 7 | Date of birth | Read-only verified (date) | 14 Mar 1998 | Verified via ICP | L |
| 8 | Gender | Read-only verified | Female | Verified via ICP | R |
| 9 | Nationality | Read-only verified | Jordan | Verified via ICP | L |
| 10 | **Martial Status** (typo, should be "Marital Status") | Read-only verified | No *(odd value for marital status)* | Verified via ICP | R |
| 11 | Are you a child of a UAE National mother who holds a Family Book? | Radio Yes / No | Yes selected | — | L |
| 12 | Do you have Marsoom? | Radio Yes / No | Yes selected | — | R |
| 13 | Country of Residence | Read-only verified | United Arab Emirates | Verified via ICP | L |
| 14 | UAE City of Residence | **Editable** text input *(no chevron, so not a select)* | empty | ("Verified via ICP" helper is hidden) | R |
| 15 | Do you have an Emirates ID? | Radio Yes / No | Yes selected | — | L |
| 16 | Emirates ID number | Read-only verified, **masked** | 784-••••-•••••••-• | Verified via ICP | R |
| 17 | Emirates ID Date of Expiry | Read-only verified (date) | 23/10/2028 | Verified via ICP | L |
| 18 | Visa Unified Number | Read-only verified | 1234353556376 | Verified via ICP | R |
| 19 | Visa File Number | Editable text input | empty | — | L |
| 20 | Visa Place of Issue | Select | placeholder **Select** | — | R |
| 21 | Visa Expiry Date | Editable text input *(no calendar icon, no DD/MM/YYYY)* | empty | — | L |
| 22 | Passport Number | Read-only verified | 1234353556376 | Verified via ICP | R |

**Conditionals (inferred):**

- **Emirates ID number** and **Emirates ID Date of Expiry** depend on "Do you have an Emirates ID?" = Yes.
- The Visa fields probably apply to non-UAE nationals (nationality is Jordan here).
- The answers to "child of a UAE National mother" and "Marsoom" drive the "Mother Family Book" and "Marsoom" upload slots in 5d.
- A second "Do you have Marsoom?" radio sits hidden next to "Do you have an Emirates ID?" [hidden].
- A hidden "Contact email" field [hidden] sits in row 6.

**Hidden older layout card `1:2894`** [hidden] (H2 "Identity Details"):

- English first name (Aisha), English last name (Khan), Date of birth, Nationality, Emirates ID number (masked), UAE city of residence (select)
- **Contact mobile number**: phone input with a country-code selector and chevron; hidden placeholder `+971 5X XXX XXXX`
- **Contact email** (placeholder `name@example.com`)
- "Emergency contact" section: First name, Surname, Relationship to candidate (select), Primary telephone contact

This hidden card is the only place in the file where the **phone input** pattern appears.

### 5b. Contact Information (`1:3208`), sub-heading **Contact Details**

| # | Label | Control | Value | Layout |
|---|---|---|---|---|
| 1 | Registered Email | Text input | empty | L |
| 2 | Registered Mobile Number | Text input (plain, no country selector) | empty | R |
| 3 | Contact Email | Text input | empty | L |
| 4 | Contact Mobile Number | Text input (plain) | empty | R |

No helper text, no placeholders. The ICP note is hidden on this screen [hidden]. It is not stated whether the "Registered" fields are read-only (from UAE Pass). In the design they are drawn as normal, editable inputs.

### 5c. Next of Kin Information (`1:3396`), sub-heading **Next to Kin** (typo, should be "Next of Kin")

There is no Figma screenshot of this frame. Content is from metadata (M) only.

| # | Label (verbatim) | Control | Value / placeholder | Layout |
|---|---|---|---|---|
| 1 | First name | Text input | Aisha (sample value) | L |
| 2 | Middle name | Text input | mohammed (sample value, lowercase) | R |
| 3 | Surname | Text input | Aisha (sample value) | L |
| 4 | Relationship to Candidate | Select | **Select** | R |
| 5 | Primary Telephone Contact | Text input | empty | L |
| 6 | Primary Email | Text input | empty | R |
| 7 | Confirm Primary Email | Text input | empty | L |
| 8 | Area of Residence | Text input | empty | R |

The ICP note is hidden [hidden]. No helper text.

### 5d. Identification Attachments (`1:3604`), sub-heading **Identification Attachments**

8 upload slots, each **full width**: dashed box, **"No file chosen"**, and a **Choose file** button. **No allowed-type or size text is shown on any slot.**

| # | Slot label (verbatim) | Likely condition (inferred) |
|---|---|---|
| 1 | Personal Photo | always |
| 2 | Colored Copy of the Passport | always |
| 3 | Colored copy of Family Book | UAE nationals? |
| 4 | Colored copy of the Emirates ID (Both Sides) | "Do you have an Emirates ID?" = Yes |
| 5 | Colored copy of a Marsoom | "Do you have Marsoom?" = Yes |
| 6 | Mother Family Book | "child of a UAE National mother…" = Yes |
| 7 | Birth Certificate | always? |
| 8 | Colored Residency Visa | non-UAE nationals with a visa? |

Capitalisation is inconsistent ("Colored Copy of the Passport" vs "Colored copy of …").

---

## 6. Step 4: University Grades (`1:3827`), STEP 4 OF 9

Card H2: **University Grades**

| # | Label (verbatim) | Control | Value / placeholder | Helper | Layout |
|---|---|---|---|---|---|
| 1 | Country | Select | **Select** | — | L |
| 2 | University | Select | **Select** | — | R |
| 3 | Degree | Select | **Select** | — | L |
| 4 | Graduation year | Select | **Select** | — | R |
| 5 | Graduation month | Select | **Select** | — | L |
| 6 | University GPA / Percentage | Text input | 3.1 | — | R |
| 7 | GPA Type | Radio | **Scale of 4** (selected). A second option **Percentage** is hidden [hidden]. | — | L |
| 8 | GPA (scale of 4) | Text input | 3.00 | — | R |
| 9 | GPA Result | Text input *(looks editable, but it is probably computed)* | 75.00 % | — | L |
| 10 | GPA shortlisting score | **Computed / read-only** (navy-100) | 26.25 / 35 | **Calculated from your GPA** | R |
| 11 | Colored copy of graduation certificate or letter of completion | Upload slot | No file chosen / Choose file | none | Full |
| 12 | Colored copy of official academic transcript (all pages) | Upload slot | No file chosen / Choose file | none | Full |

**Conditionals (inferred):**

- **GPA (scale of 4)** applies when GPA Type is "Scale of 4". "Percentage" is the alternative option, so the converted field would change.
- **GPA Result** and **GPA shortlisting score** are derived values.
- The example numbers don't reconcile: GPA 3.1 entered, 3.00 on the scale of 4, 75.00 %, and 26.25 / 35 = 75 %. So the result is derived from 3.00/4.

---

## 7. Step 5: English Proficiency (`1:4064`), STEP 5 OF 9

**Warning toast** (`1:4134`, pale yellow, alert-triangle, close ×, above the 2-column body): **text not captured**. The layer is named "Text" and there is no screenshot. The PNG (older iteration) has no toast. **OPEN: fetch `1:4137` when the rate limit resets.**

Card H2: **English Proficiency**

| # | Label | Control | Value / placeholder | Layout |
|---|---|---|---|---|
| 1 | Title of exam | Select (chevron, per PNG, older iteration) | IELTS | L |
| 2 | Date taken | Date input with a **calendar icon** | placeholder **DD/MM/YYYY** | R |
| 3 | Result | Text input | empty | L (R is a spacer) |
| 4 | Colored copy of the English proficiency exam certificate | Upload slot | No file chosen / Choose file (no type or size text) | Full |

Exam options: only "IELTS" is visible.

---

## 8. Step 6: Internship Information (`1:4255`), STEP 6 OF 10

Card H2: **Internship Information**

| # | Label | Control | Value / placeholder | Layout |
|---|---|---|---|---|
| 1 | Organization name | Select | **Select** | L |
| 2 | Other organization name | Text input | empty | R |
| 3 | Location | Select | **Select** | L |
| 4 | From date | Date input with a **calendar icon** | **DD/MM/YYYY** | R |
| 5 | To date | Date input (**no** calendar icon, which is inconsistent) | **DD/MM/YYYY** | L (R is a spacer) |
| 6 | Internship certificate or enrollment letter (if current intern) | Upload slot | No file chosen / Choose file | Full |

**Conditional (inferred):** **Other organization name** is shown when Organization name = "Other". It is visible in this frame. The upload label says it applies "if current intern" (so a missing To date may mean current).

---

## 9. Step 7: Residency Information (`1:4456`), STEP 7 OF 10

There is no Figma screenshot. Content is from M, with layout cross-checked against the PNG (older iteration).

Card H2: **Residency Information**

| # | Label | Control | Value / placeholder | Layout |
|---|---|---|---|---|
| 1 | Specialty | Select | **Select** | L |
| 2 | Training hospital | Select | **Select** | R |
| 3 | Other training hospital | Text input | empty | **[hidden]** in Figma (visible in the PNG, older iteration) |
| 4 | Training country | Select | **Select** | L (in Figma, because #3 is hidden) |
| 5 | Completion date | Date input (no calendar icon) | **DD/MM/YYYY** | R |

**Conditional:** **Other training hospital** is hidden in the current frame. It is probably shown when Training hospital = "Other". A hidden duplicate "Completion date" row [hidden] exists for the layout when #3 is visible.

---

## 10. Step 8: Board & License (`1:4647`), STEP 8 OF 10

Card H2: **Board & License**

| # | Label | Control | Value / placeholder | Layout |
|---|---|---|---|---|
| 1 | Board name | Select | **Select** | L |
| 2 | Did you sit the final written exam? | Radio Yes / No | Yes selected | R |
| 3 | Exam date | Date input (no icon) | **DD/MM/YYYY** | L |
| 4 | Exam result | Radio **Yes / No** *(probably meant to be Pass / Fail)* | Yes selected | R |
| 5 | Written exam attempt number | Select | **Select** | L |
| 6 | OSCE exam date | Date input (no icon) | **DD/MM/YYYY** | R |
| 7 | OSCE exam attempt number | Select | **Select** | L |
| 8 | Authority | Select | **Select** | R |
| 9 | License number | Text input | empty | L |
| 10 | Job title | Select | **Select** | R |
| 11 | Board certificate or letter of completion | Upload slot | No file chosen / Choose file | Full |
| 12 | Transcript from the training center or program director | Upload slot | No file chosen / Choose file | Full |
| 13 | Valid specialist or consultant license | Upload slot | No file chosen / Choose file | Full |

**Conditional (inferred):** Exam date, Exam result and Written exam attempt number depend on "Did you sit the final written exam?" = Yes. Nothing is annotated.

---

## 11. Step 9: Portfolio (`1:4900`), STEP 9 OF 10

**Warning toast** (`1:4977`, pale yellow, alert-triangle, close ×), from S:

> **Check your answers carefully**
> Your portfolio is a one-time submission. After you confirm it, you can't change it, even if your application is returned for correction. Points shown are indicative; your final portfolio score is set by the referees.

Hidden info banner `1:4970` [hidden]:

> "Your draft is saved automatically every 3 minutes. Unsubmitted applications are archived after the grace period deadline [DD/MM/YYYY]. You can move between sections in any order."

Card H2: **Portfolio**

Hidden note [hidden]: "The portfolio is a one-time submission. Once submitted, you can’t edit it."

Each question is a bordered **question card**: question text (bold), a **points pill** (right, cyan), and an **Answer** radio Yes / No. A hidden "Answer" label exists in each card [hidden]. Conditional fields appear below the radio when the answer is **Yes**.

| Q | Question (verbatim, S) | Points | Answer shown |
|---|---|---|---|
| Q1 | Q1. Were you able to publish a research article in a peer reviewed journal? | **5 points** | Yes |
| Q2 | Q2. Have you participated in research activity (writing proposal, collecting data, analyzing data and writing a manuscript) whether published or not? | **4 points** | Yes |
| Q3 | Q3. Did you actively participate in any health related voluntary/community activities since entry to medical/dental school? (e.g. Breast cancer campaign, smoking cessation program, disease awareness day, health education media programs, humanitarian missions, etc.) | **3 points** | Yes *(no conditional fields drawn)* |
| Q4 | Q4. Did you actively participate in another health related voluntary/community activity since entry to medical/dental school? | **2 points** | No |
| Q5 | Q5. Did you attend another skill enhancement course since entry to medical/dental school? | **2 points** | No |
| Q6 | Q6. Have you participated in another extracurricular activity since entering medical or dental school? | **2 points** | No |

Points come from S (the pill layers are named "Text"). Hidden: an older Q5 text "Q5. Have you presented in a scientific event (conference, symposium or workshop)?" [hidden] (also used as the frame name for Q3 to Q6), and a footer row **"7 more questions follow."** [hidden]. This implies the full set may have 13 questions.

**Q1 conditional fields (Yes)**

| # | Label | Control | Placeholder / value | Layout |
|---|---|---|---|---|
| 1a | Research Link * | Text input with a **leading link icon** | https://doi.org/[DOI] | Full |
| 1b | Name of the Journal * | Text input | placeholder "Name of the Journal" | ⅓ |
| 1c | Article Title * | Text input | placeholder "Article Title" | ⅓ |
| 1d | Date of Publication * | Date input with a **calendar icon** | placeholder "Date of Publication" | ⅓ |
| 1e | Role * | Select | Writing a Manuscript | ⅓ (2 empty spacers) |
| 1f | **Uploaded-file row**: title **Manuscript Document**, tag **UPLOADED** (green), meta **PDF · max 2 MB**; right side file icon + **Manuscript.pdf · 1.8 MB**, eye icon + **Preview**, red trash icon | file row | — | Full |

Hidden older Q1 fields [hidden]: **Research link (DOI or URL)** (input) and **Supporting evidence** (upload slot).

This card is the only **3-column** row in the wizard. The asterisk marks required fields; it is used only on Portfolio.

**Q2 conditional fields (Yes)**

| # | Label | Control | Value | Layout |
|---|---|---|---|---|
| 2a | Role * | Select | Collecting Data | ⅓ |
| 2b | Uploaded-file row: **Ethical Approval**, tag **UPLOADED**, **PDF · max 2 MB**, **Ethical_Approval.pdf · 350 KB**, **Preview**, delete | file row | — | Full |
| 2c | **Letter of Supervisor** | Upload slot (No file chosen / Choose file) | — | Full |

Hidden alternative uploader [hidden], a drag-and-drop pattern:

- Title **Letter of Supervisor**, tag **Required**, meta **PDF · max 2 MB**
- Dropzone text **"Drag and drop a file here, or"** + button **Browse files**

**Role options seen:** Writing a Manuscript, Collecting Data. The Q2 text implies the full list: writing proposal, collecting data, analyzing data, writing a manuscript.

**Allowed type and size:** **PDF · max 2 MB**. This is the only allowed-type/size text anywhere in the file.

---

## 12. Step 10: Review, Pay & Submit (`1:5351`), labelled STEP 9 OF 9

**Warning toast** (`1:5421`, pale yellow, alert-triangle, close ×), from S:

> You will be redirected to the Dubai Health payment gateway. The application fee is non-refundable if you withdraw.

(The same text is also in a hidden in-card note `1:5572` [hidden].)

Card H2: **Review, Pay & Submit**. The eyebrow says **STEP 9 OF 9**, but the visible stepper has 10 steps with Pay & Submit as step 10 (inconsistent).

**Key/value grid** (3 columns × 2 rows; label 12 over value 15, value in navy-600):

| Label | Value |
|---|---|
| Application number | GME-2026-000123 |
| Created | 04 Sep 2026 |
| Status | Draft |
| Bill amount | AED [application fee] |
| Bill status | Unpaid |
| Payment date | — |

**Section checklist** (row: step name on the left, status tag on the right, dividers between rows):

| Row | Tag |
|---|---|
| Program & Preferences | Complete |
| Application Information | Complete |
| Personal Information | Complete |
| University Grades | Complete |
| English Proficiency | Complete |
| Internship Information | Complete |
| Residency Information | Complete *(the layer frame is named "Entrance Exam")* |
| Portfolio | Complete |

- A hidden alternative tag **In Complete** [hidden] (typo, should be "Incomplete") exists on the Residency row.
- **Board & License is missing from the checklist**, even though it is in the 10-step stepper.

**Action bar:** Save As Draft · Discard ‖ Back · **Pay & Submit**

---

## 13. Pay & Submit with success dialog (`1:5621`, dialog `1:5892`)

The underlying screen is identical to §12, except the next button reads **Next Step**. A full-page scrim (`1:5891`) covers it.

**Dialog** (520 px wide, centred):

| Element | Content |
|---|---|
| Icon | Featured icon outline: check in a circle (sky). A hidden "Success" icon variant also exists [hidden]. |
| Title | **Your application has been submitted** |
| Body | **Payment received. The admission team will review your application and you can follow progress on your dashboard.** |
| Details (2 columns × 3 rows) | **Application number** → GME-2026-000123 · **Program** → Residency · Emergency Medicine / **Submitted on** → 12 Sep 2026 · **Receipt number** → RCP-2026-004517 / **Amount paid** → 2500 *(no currency, unlike "AED [application fee]")* · **Payment status** → Paid |
| Actions | **Go to dashboard** (solid navy, centred). **Download receipt** is hidden [hidden]. |

The dialog has no close (×) button.

---

## 14. Other text on the page

- `1:2188`, a free-standing page label: **"Prepare and submit application"**.

---

## 15. Typos and copy issues to flag (verbatim in Figma)

| Where | Text | Issue |
|---|---|---|
| Identity | Martial Status | should be "Marital Status" (its value "No" also looks wrong) |
| Next of Kin sub-heading | Next to Kin | should be "Next of Kin" |
| Attachments next button | Next: Universal Grades | should be "University Grades" |
| Board / Portfolio next buttons | Next : Portfolio, Next : Pay & Submit | space before the colon |
| Dashboard preference card | Intranal Medicine | should be "Internal Medicine" |
| Training-site option | Rashid  Hospital | double space |
| Pay checklist (hidden) | In Complete | should be "Incomplete" |
| Terms | "; However," | capital H after a semicolon |
| Q1 | peer reviewed | usually hyphenated ("peer-reviewed") |
| Program step | Speciality / Specialities vs Specialty (Residency) vs specialties (note) | inconsistent spelling |
| Attachments | Colored Copy of the Passport vs Colored copy of … | inconsistent capitalisation |
| Names | Welcome, Mohammed vs header pill Mohamed; "Welcome back, Aisha" vs header pill Mohamed Hazim; Identity shows Ayesha | inconsistent sample persona |
| IDs and dates | 2026-G1234567 vs GME-2026-000123; Created 22/10/2026 vs 04 Sep 2026; date formats DD/MM/YYYY vs "04 Sep 2026" | inconsistent formats |
| Pay | STEP 9 OF 9 with a 10-step stepper; Board & License missing from the checklist; "Next Step" vs "Pay & Submit" | inconsistent |
| Board | Exam result: Yes / No | probably meant to be Pass / Fail |

## 16. Missing or uncertain

- **English proficiency toast text** (`1:4137`): not captured (no screenshot, and the rate limit was hit).
- **Toast `1:6061` on the first-time dashboard** (hidden warning) and the hidden tag labels `1:5982`/`1:5984`: text not captured.
- **Next of Kin and Residency**: no Figma screenshot. Content is from metadata, and Residency was also checked against the PNG (older iteration).
- **Select option lists**: none are designed. Only the selected or sample values listed above are known (Training sites list: Latifa, Dubai, Rashid Hospital, plus one hidden option).
- **Allowed file types and sizes**: only Portfolio shows "PDF · max 2 MB". The terms say "PDF format with the exception of the photo". No other slot specifies a type or size.
- **Required markers**: only Portfolio uses "*". No other screen marks required fields.
- **Conditional logic**: nothing is annotated in Figma. Every "conditional (inferred)" entry above is deduced from labels and helper text, and needs confirming against the BRD and user stories.
- **No validation, error, empty-list or loading copy** exists anywhere in the file.
