# Candidate Portal: Requirements and API Extract

Scope: the **Candidate** role (BRO-01) of the GME Release 5 admission platform. Staff, referee and finance features are included only where they change what the candidate sees.
Extracted 2026-11-12 from the files listed below. This is a read-only digest. Where it and a source disagree, the source wins.

## Citation keys

| Key | File |
|---|---|
| `SBRD` | `BRD/Stories_Addmission_System_BRD.md`. `BRD/Addmission_System_BRD.md` has the same functional text about 316 lines further down (for example SBRD:3 = BRD:297), plus the intro, assumptions and change trackers (BRD:2322-2515). |
| `OQ` | `Open-Questions.md` (D-xx decisions, OQ-xx open items) |
| `DEC` | `Contracts/decisions.md` |
| `E2E` | `Contracts/END-TO-END-CONTRACT-AGREEMENT.md` |
| `PAY` | `Contracts/PAYMENT-GATEWAY-ADAPTER-AGREEMENT.md` |
| `CL` | `Contracts/openapi/paths/candidate-lifecycle.yaml` |
| `APP` | `Contracts/openapi/paths/applications.yaml` |
| `CAT` | `Contracts/openapi/paths/catalog.yaml` |
| `IDN` | `Contracts/openapi/paths/identity.yaml` |
| `ADM` | `Contracts/openapi/paths/admission-operations.yaml` |
| `SCH` | `Contracts/openapi/components/schemas.yaml` |
| `PRM` | `Contracts/openapi/components/parameters.yaml` |
| `US-S/M/L/XL` | `User_Stories/{S,M,L,XL}/README.md`; `DEP` = `User_Stories/DEPENDENCY-MAP.md` |
| `BE` | `backend/src/API/DAHC.API/...` and `backend/src/Services|Core/...` |
| `FE` | `frontend/projects/dahc-portal/src/app/...` |

---

## 1. Candidate journeys and screens

ID convention: `CJ-nn` is a candidate journey or screen in this extract. The story IDs come from the BRD.

| ID | Journey / screen | BRD story | What the UI must do (key points) | Source |
|---|---|---|---|---|
| CJ-01 | Register | US-1.1.1 | IDAM owns all registration screens and fields. UAE Pass is reached only through IDAM. On return the platform runs a duplicate check on mobile, EID and passport. If a duplicate is found, tell the candidate to use their original account (`409 account.duplicate`). If the account is unique, the platform creates a 9-digit candidate ID. | SBRD:186-197; DEC:23-24; IDN:1-48; OQ D-05, D-13, D-25 |
| CJ-02 | Sign in (IDAM credentials or UAE Pass, both through IDAM) | US-1.1.2 | Use OIDC Authorization Code + PKCE. After a session timeout, send the candidate back to IDAM. A successful sign-in lands on the Dashboard. Forgot password, lockout and similar flows belong to IDAM. Google, Facebook or Apple sign-in is allowed only if IDAM brokers it and it is approved (E2E:41). | SBRD:199-205; E2E:41, 57; DEC:15-19; US-S:19-30 |
| CJ-03 | Sign out | US-1.2.1 AC7 | Logout ends the session. The client revokes its tokens and goes to the IDAM single sign-out page (OQ-27: POST vs GET is still open). | SBRD:228; OQ:69; FE core/auth/auth.service.ts |
| CJ-04 | Duplicate-account page | US-1.1.1 AC5 | Shown on `409 account.duplicate`. Later sign-ins stay blocked until a supervisor resolves the pair (OQ-20). | IDN:12-18; OQ:62 |
| CJ-05 | Dashboard | US-1.2.1, US-4.3.2 | Welcome message, an empty state, and the **Start New Application** button (enabled or disabled, with the reason and the next cycle opening date). Lists applications in an inbox with an action list per application and a note about the inactivity time-out. Scores appear only after announcement. Fields are listed in §1.1. | SBRD:223-257; SBRD:1636-1642; CL:1-53; SCH:1691-1777 |
| CJ-06 | View application (read-only) | US-1.2.2 | Uses the same form as the wizard with every input disabled. Works in any status. Shows the dashboard actions as shortcuts. | SBRD:259-265 |
| CJ-07 | Start application: program, specialties and sites (wizard step 1) | US-1.3.1 | Program → Preference 1 (+ sites) → Preference 2 (+ sites) where the program allows two. Leave out programs that have no active specialty and specialties that have no active site. The candidate orders sites within each specialty. No site may be selected twice under the same specialty, and the two preferences must be different specialties. The draft is created only after a valid selection. | SBRD:374-391; APP:59-126; CAT:1-168 |
| CJ-08 | Application wizard (steps 2-9) | US-1.3.2-US-1.3.10 | A multi-tab form. The candidate can move between tabs without completing them. Tooltips and highlighting of invalid fields apply on every screen. Sections and conditions are in §3. | SBRD:346-372 |
| CJ-09 | Save draft / auto-save | US-1.3.11 | Save is available on every tab and runs **without validation**, then shows a confirmation. Auto-save runs silently at a configurable interval (for example every 3 minutes). | SBRD:758-764 |
| CJ-10 | Resume / discard draft | US-1.2.3 | Resume restores the draft. Discard asks for confirmation; cancelling keeps the draft. After a discard the status becomes **Archived** and Start New is enabled again. | SBRD:267-273; CL:1289-1327 |
| CJ-11 | Pay & Submit (summary, payment, receipt) | US-1.3.12 | Shows the application summary and payment details. Missing information blocks Pay & Submit and highlights the tab and field. Then a confirmation, a redirect to the gateway, the receipt, the submission, and a notification. If payment fails, the application stays a draft and the candidate gets a Retry option. Details in §4. | SBRD:766-785 |
| CJ-12 | Withdraw application (reason + OTP) | US-1.2.4 | Reason pop-up → OTP sent to the registered email **and** mobile → code entry with Resend (after a cooldown) → status Withdrawn. The confirmation text says the fee is non-refundable. | SBRD:275-289; CL:669-837, 1329-1379 |
| CJ-13 | Request reinstatement | US-1.2.5 | Available only for Withdrawn. Mandatory justification. The request goes to a supervisor and is blocked if another application in the cycle is active. Approval or rejection is emailed to the candidate (US-2.5.2). | SBRD:291-304; SBRD:1222-1228; CL:838-898 |
| CJ-14 | Edit preferences panel | US-1.2.6 | Shows the current preferences and sites. The candidate can reorder, remove or replace both specialties and sites. Validated like CJ-07. The status does not change. | SBRD:306-312; CL:530-596 |
| CJ-15 | Exclude training site panel | US-1.2.8 | Sites grouped by specialty; select one or more to exclude. The last site under a specialty cannot be excluded. Nothing can be added or reordered. One reason covers the whole action. The status does not change and the admission team is notified. | SBRD:329-342; CL:598-667 |
| CJ-16 | View announced scores / portfolio result | US-4.3.2, US-1.2.7 | Before the announcement scores stay hidden. After it, show the final portfolio score, the shortlisting score and the components. Never show round scores. After a reannouncement the values are replaced. | SBRD:1600-1642; CL:1572-1616; SCH:1212-1250, 1779-1885 |
| CJ-17 | Appeal portfolio score | US-1.2.7 | Read-only portfolio with questions, answers, awarded points and comments. The candidate flags eligible questions and gives a response for each (mandatory, at most 200 characters). Confirm, then submit. One appeal, inside the window, with no new attachments. | SBRD:314-327; CL:900-975 |
| CJ-18 | Correct a returned application | US-2.3.4 (US-2.3.3) | Only flagged items can be edited, and the officer's note is shown on each. They are validated like the first submission. Re-submit → status Correction Submitted, back to the same officer. Reminders run, and the application is archived if the grace period passes. | SBRD:1077-1091; ADM:559-610 |
| CJ-19 | Contact email/mobile change OTP | US-1.3.3 AC11 | Inside the Personal Information section. A changed contact email or mobile must be verified by OTP before the section saves. | SBRD:448; CL:1381-1570 |
| CJ-20 | Documents (attachment slots) | US-1.3.2 AC11-19 and all sections | Each section has its own attachment sub-section. The server generates the slots. Upload, Preview (viewer), and Delete with confirmation. Size and type are rejected with a message. | SBRD:398-399; CL:209-430; SCH:1252-1353 |
| CJ-21 | Profile | (none) | The BRD has no profile page. Personal data belongs to the candidate, not the application (D-10). It is edited through the personal-information section of an application and snapshotted at submission (D-15). There is no `/me/profile` endpoint; `GET /auth/me` returns the name, email, candidate number and preferences (culture, time zone). | OQ:20, 37; CL:110-113; SCH:3080-3143 |
| CJ-22 | Notifications | various | **Email and SMS only.** The BRD and the contract define no in-portal notification inbox. Events are listed in §6.3. | BRD:269; SBRD:1895-1900 |
| CJ-23 | Not-allowed / error pages | (none) | `403 account.deactivated`, `account.not_registered`, staff users reaching the candidate portal, `503` when IDAM is unavailable. | IDN:7-19, 56-60; FE core/auth/candidate.guard.ts |

### 1.1 Dashboard inbox fields (US-1.2.1 data dictionary, SBRD:231-257)

Application ID, creation date, submission date (empty until submitted), submission deadline (program-level), announcement date (shown only after an announcement; the initial or the latest reannouncement), program, training site(s), preference(s), status, Portfolio Final Score, GPA Score (applicable programs), Entrance Exam Score (applicable programs), Shortlisting Score, the action buttons in §2.2, and Appeal Deadline (shown only during the window).
Contract equivalents: `CandidateDashboardItem` = `ApplicationSummary` + `submissionDeadline`, `announcementDate`, `appealDeadline`, `allowedActions[]` (SCH:1705-1735). Scores are in `announcedScores` (SCH:396-400, 1212-1250).
Gap: the read models carry only specialty and site **ids**, so names cannot be shown (OQ-26, OQ:68).

---

## 2. Lifecycle statuses, allowed actions and cycle rules

### 2.1 Application status (candidate-visible), exact enum

`ApplicationStatus` (SCH:74-89; backend `ApplicationStatus.cs:6-18`, serialized as SNAKE_CASE_UPPER, BE Http/ApiRegistration.cs:45):

| Enum | BRD meaning | Entered when | Next | Source |
|---|---|---|---|---|
| `DRAFT` | Created, editable, not submitted | Start, or save of an incomplete application | SUBMITTED; ARCHIVED (grace period passed or discarded) | SBRD:26 |
| `SUBMITTED` | Paid and officially submitted | Payment confirmed and submission done; verification and portfolio statuses start at Pending | UNDER_REVIEW | SBRD:28 |
| `UNDER_REVIEW` | In verification and/or portfolio scoring | Officer or referee retrieves it | CORRECTION_REQUIRED, SCREENED_OUT, REVIEW_COMPLETED | SBRD:29 |
| `CORRECTION_REQUIRED` | Returned to the candidate with flagged items | Officer returns it for correction | CORRECTION_SUBMITTED; ARCHIVED (grace period passed) | SBRD:30 |
| `CORRECTION_SUBMITTED` | Corrections resubmitted | Candidate re-submits | REVIEW_COMPLETED, SCREENED_OUT, or another correction cycle | SBRD:31 |
| `SCREENED_OUT` | Final screen-out (verification, endorsed by a supervisor, or bulk) | Supervisor decision or bulk screen-out | Terminal; a supervisor may reinstate it (returns to the previous status). **No appeal.** | SBRD:32, 57, 1644-1655 |
| `REVIEW_COMPLETED` | Verification and portfolio both complete | Both workstreams complete | APPEAL_UNDER_REVIEW if an eligible appeal is submitted; it may still be screened out later (capacity, CASPER) | SBRD:33 |
| `APPEAL_UNDER_REVIEW` | Second evaluation of the appealed questions | Eligible appeal submitted | REVIEW_COMPLETED | SBRD:34 |
| `WITHDRAWN` | Withdrawn by the candidate | OTP-confirmed withdrawal | Reinstated (previous status) or end | SBRD:35 |
| `ARCHIVED` | Inactive, read-only | Discarded, or draft/correction grace period passed | Terminal | SBRD:27 |

The BRD rule: only statuses marked with * are shown to the candidate. If a status is not visible, the previous one is kept (SBRD:37).
The BRD also marks some **Verification** statuses (Pending, In Progress, Correction Required, Correction Submitted, Complete, Screened Out, On Hold; SBRD:48-58) and **Portfolio** statuses (Pending, In Progress, Complete, 2nd Evaluation In Progress, On Hold; SBRD:68-75) as candidate-visible. The contract exposes only `ApplicationStatus` to candidates, and the dashboard "never returns internal statuses" (CL:8-13). See OQ-C14.
Other enums the candidate UI meets: `PaymentStatus` = `PENDING | PAID | FAILED | CANCELLED | UNKNOWN` (SCH:142-149). `WorkflowStatus` is returned in `WorkflowActionResult.status` (SCH:289-324, 547-569). `CandidatePortfolioResult.appeal.status` = `OPEN | SUBMITTED | CLOSED | NOT_AVAILABLE` (SCH:1811-1817). `StartNewApplication.disabledReason` = `ACTIVE_APPLICATION_EXISTS | NO_OPEN_PROGRAM | null` (SCH:1753-1761). OQ-03 (OQ:45) lists DB statuses missing from the contract (`ON_HOLD`, `REINSTATED`, ...).

### 2.2 Actions by status

The contract enum `CandidateApplicationAction` = `VIEW | RESUME | DISCARD | WITHDRAW | REINSTATE | EDIT_PREFERENCES | EXCLUDE_TRAINING_SITE | APPEAL` (SCH:1691-1703). The server evaluates them and the portal shows only what `allowedActions` contains (FE api/dashboard.models.ts).

| Action | Shown/enabled when (BRD) | Source |
|---|---|---|
| Start New Application | Disabled for any status other than Withdrawn or Archived while a submission window is open. With no open program: disabled, with a message giving the opening dates. | SBRD:228 AC4-6, 236 |
| VIEW | Always, including Archived | SBRD:214, 265, 273 |
| RESUME | Draft only | SBRD:250 |
| DISCARD | Draft only | SBRD:251 |
| WITHDRAW | Any status except Withdrawn, Draft and Archived (so Screened Out is technically included, see OQ-C10). The contract returns 409 for Draft, Withdrawn and Archived. | SBRD:252; CL:679-683 |
| REINSTATE | Withdrawn only, while still in the same cycle (a per-cycle cut-off comes later). Blocked if another application in the cycle is active. | SBRD:253, 296-297 |
| EDIT_PREFERENCES | Any status except Withdrawn, Draft and Archived, **and** before the grace-period deadline, **and** the program has multiple specialty preferences (Residency and Fellowship only) | SBRD:254, 312 |
| EXCLUDE_TRAINING_SITE | Any status except Withdrawn, Draft and Archived, **and** Edit Preferences no longer enabled, **and** some specialty has more than one site, **and** before the academic-year start date | SBRD:255, 335 |
| APPEAL | Portfolio scores announced, inside the appeal window (48 h by default, configurable), and no earlier appeal. Not available after a reannouncement or a screen-out. | SBRD:221, 256, 1655, 1684 |
| Correct & re-submit | CORRECTION_REQUIRED. **There is no action enum value for it** (OQ-C6). | SBRD:1090 |
| Pay & Submit | Part of the draft wizard (not a dashboard action) | SBRD:771 |

**Backend today:** `DashboardRules.AllowedActions` returns `[VIEW, RESUME]` for DRAFT and `[VIEW]` otherwise. The backend enum has only View and Resume (BE Services/DAHC.Applications.Service/DashboardRules.cs:56-64, CandidateApplicationAction.cs).

### 2.3 Cycle and timing rules

| Rule | Detail | Source |
|---|---|---|
| One active application per **cycle**, across all programs | Withdrawn and Archived do not block a new one. Enforced by a filtered unique index. Create returns `409 application.active_exists`. | OQ D-26 (OQ:35); SBRD:213, 352; BE CandidateApplication.cs (IsActiveStatus) |
| Conflicting wording | US-1.3.11 note 6 says "one active draft per program per cycle"; D-26 settles on per cycle. | SBRD:764 |
| Submission window | From the program opening date to the deadline, configured per program: `Program.applicationOpensAt/applicationClosesAt/timeZoneId` | SBRD:236; SCH:27-40 |
| Grace period deadline | Edit Preferences, draft reminders and auto-archive all depend on it, but the contract `Program` has **no grace-period field** (OQ-C8) | SBRD:215, 366-369 |
| Draft reminders | Every N days of inactivity (configured per program), 3 days before the grace deadline, 1 day before, then auto-archive with an email. Same pattern for Correction Required. | SBRD:366-369, 763-764, 1090 |
| Create/save needs an open window? | OQ-21 (open; recommended yes) | OQ:63 |
| Appeal window | Starts at the initial announcement timestamp. Duration is configurable (default 48 h). One appeal. Closed after a reannouncement. Deadlines carry an IANA `timeZoneId`. | SBRD:221, 1610, 1684; SCH:1805-1832; OQ D-07 |
| Reinstatement | Same cycle only; a cut-off (date or status) is planned for later | SBRD:297 |
| Site exclusion | Allowed until the start of the academic year (no such date in the contract) | SBRD:335 |
| Scores | GPA and exam shortlisting scores are shown to the candidate **only after the announcement** (D-11). This conflicts with the BRD's live display in the form (OQ-C13). | OQ:22 |

---

## 3. Wizard steps: fields, validation and program variants

### 3.1 Program variants

The BRD program list is Certificate, Internship, Medical Residency, Dental Residency, Pharmacy Residency, Fellowship (SBRD:387). The contract `Program.category` has only `CERTIFICATE | INTERNSHIP | RESIDENCY | FELLOWSHIP` (SCH:17-23), so it **cannot tell Medical, Dental and Pharmacy residency apart** (OQ-25). Certificate (Medical Laboratory) follows Internship (Dental) in every rule, validation and weight (SBRD:380 note 1).

| Variant | Prefs | Internship info | Residency info | Board & License | Entrance exam | English | Recommendation letters | Portfolio set | Fee (AED) | Weights GPA / Exam / Portfolio / Shortlisting (CASPER) |
|---|---|---|---|---|---|---|---|---|---|---|
| Certificate (Medical Lab) | 1 | no | no | no | no | required* | no | Intern (Dental) Q1-Q8 | not stated (OQ-C12) | 50 / – / 20 / 70 (–) |
| Internship – Medical | 1 | no | no | no | no | required* | no | Intern Medical Q1-Q8 | 230 | 50 / – / 30 / 80 (20) |
| Internship – Dental | 1 | no | no | no | no | required* | no | Intern Dental Q1-Q8 | 230 | 50 / – / 20 / 70 (–) |
| Medical Residency | 2 | yes | no | no | EMREE or SMLE | required* | yes | Residency Q1-Q10 | 650 | 35 / 35 / 30 / 100 (20) |
| Dental Residency | 2 | yes | no | no | EDREE or SDLE | required* | yes | Residency Q1-Q10 | 650 | 35 / 35 / 30 / 100 (–) |
| Pharmacy Residency (Clinical Pharmacy) | 1 | **no** | no | no | EPREE | required* | yes | Residency Q1-Q10 | 650 | **not in appendix** (OQ-C12) |
| Fellowship | 2 | yes | yes | yes (≥1 board) | no | **optional** | yes | Fellowship Q1-Q6 | 650 | – / – / 30 / 30 (–) |

\* English is optional when the nationality or the university country is the USA, UK, Canada, Australia, New Zealand or Ireland (SBRD:572).
Sources: SBRD:355-361 (section applicability), 380 notes 3-4 (preference counts), 440-441 (recommendation letters), 572, 601-602, 629, 650, 696, 772 note 3 (fees), 1833-1843 (weights), 735-756 (portfolio). Change tracker: no internship section for Pharmacy (BRD:2494, 2498).
Dental interns' 5,000 AED seat reservation is deferred to the next release (SBRD:772 note 4).

### 3.2 Contract section keys

`sectionKey` ∈ `application-information | personal-information | academic-information | english-proficiency | internship-information | residency-information | board-license-information | residency-entrance-exam` (PRM:104-118; SCH:586-596). The portfolio uses its own endpoints. Preferences go through `PATCH /applications/{id}` or `PUT .../preferences`.
The server supplies field definitions through `FormFieldDefinition` (`fieldCode, label, dataType ∈ STRING|TEXT|INTEGER|DECIMAL|BOOLEAN|DATE|DATE_TIME|SINGLE_SELECT|MULTI_SELECT|FILE_REFERENCE|URL, visible, required, readOnly, constraints{minLength,maxLength,minimum,maximum,multipleOf,pattern,format,allowedFileTypes,maxFileSizeBytes}, options[], dependsOn[], visibleWhen[], requiredWhen[]`), with conditions `EQ|NE|IN|NOT_IN|GT|GTE|LT|LTE|NOT_EMPTY|EMPTY` (SCH:645-761). **Whether this stays a dynamic schema or becomes typed sections in code is OQ-02, still open** (OQ:44). Field codes are not defined anywhere.

Figma has a 9- or 10-step wizard: Program & preferences, Application info, Personal info (Identity, Contact, Next of kin, Attachments), University grades, English, Internship, Residency, Board & License, Portfolio, Pay & Submit. The step counter is inconsistent ("STEP n OF 9" on some frames, "OF 10" on others) (`frontend/docs/design-system/figma-extracts/gme-candidate-screens.md:23-40`). Hide steps that do not apply to the variant.

### 3.3 Step 1: Program, preferences and sites (US-1.3.1, SBRD:374-391)

| Field | Rule |
|---|---|
| Program | DDL, required. Leave out programs with no active specialty (AC2). |
| Preference 1 | Specialty DDL, required. It is the reference specialty: it decides the verification and portfolio pool. |
| Preference 1 sites | At least one. Multi-select. Ordered (`siteOrder` ≥1). No duplicate site within one specialty (AC10). Leave out specialties with no active site. |
| Preference 2 | Optional. Shown only when the program allows two (Medical/Dental Residency, Fellowship). Must differ from Preference 1 (AC11). |
| Preference 2 sites | At least one when Preference 2 is set. The same site may be chosen again under a **different** specialty (SBRD:312 note 4). |
| Site count | No limit per specialty (BRD:2495). **The backend caps it at 20** (`PreferenceRequest.MaxTrainingSites`, BE Contracts/ApplicationRequests.cs:56). See OQ-C11. |
| Changing program or specialty when data exists | Warn that data may be lost (SBRD:398 AC20) |

Contract: `CreateApplicationRequest{programId, preferences[1..2]}` and `PreferenceInput{specialtyId, preferenceOrder 1..2, trainingSites[≥1]{siteId, siteOrder≥1}}` (SCH:326-359, 414-429). Invalid preferences on a draft save → `422`, and nothing is saved (D-27, OQ:36). Backend codes: `preferences.count_invalid | duplicate_site | duplicate_specialty | order_invalid | site_order_invalid | site_unavailable | sites_required | specialty_unavailable`, `application.program_not_open`, `application.invalid_preferences`.

### 3.4 Step 2: Application Information (US-1.3.2, SBRD:393-441)

| Field | Type | Required / conditional |
|---|---|---|
| Application ID | system | Format follows D-19: `<cycle start year><7-digit counter>`, for example `20270000001`; pattern `^[1-9][0-9]{10}$` (SCH:3006-3014). This replaces the BRD's `123456789-G27` (SBRD:406, OQ-09 closed). |
| Creation date / Submission date | system, DD/MM/YYYY | Submission date stays empty until submitted |
| Admission cycle | system, YYYY/YYYY | read-only |
| Program, Pref 1/2 + sites | as in step 1 | editable (data-loss warning) |
| Candidate Status | DDL, required | The list depends on the program (SBRD:1786-1797). Dental Res: MBRU GME Intern*, MBRU GME Resident*, Active Dubai Health Employee*, External. Medical Res: + MBRU MD Student/Alumni*. Pharmacy Res: Active DH Employee*, External. Internship: External only. Fellowship: MBRU MD Student/Alumni*, MBRU GME Resident*, Active DH Employee*, External. |
| ID Number | text | Required for every status except External Candidate (a * in the appendix means an ID is required) |
| Sponsorship? | radio Yes/No, required | |
| Sponsor Type | DDL Governmental/Non-Governmental | required if Sponsorship = Yes |
| Sponsor Name | text | required if Sponsorship = Yes |
| Q1 Currently employed? | radio, required | Residency and Fellowship only. Yes → **Employment Letter** (PDF) required. |
| Q2 Registered in MBRU Residency? | radio, required | Residency and Fellowship only. Yes → **No Objection Letter** (PDF) required. |
| 4 declarations (license denied/revoked; academic probation; dismissed; misconduct) | radio, default **No**, required | all programs |
| Terms & Conditions text + "I, <Full Name>, hereby confirm..." | label | Full text at SBRD:1799-1804 |
| Acceptance checkbox | required | Must be checked before the candidate can continue filling the form or submit (SBRD:353) |

Attachments: Personal Statement **one slot per selected site** for Pref 1 (required) and Pref 2 (required when Pref 2 exists). The server generates the slots and adjusts them when preferences change (SBRD:399 note 6; SCH:1280-1286). Also CV (required) and a Recommendation Letter for each preference (Residency and Fellowship).

### 3.5 Step 3: Personal Information (US-1.3.3, SBRD:443-526)

One continuous form with sub-sections in this order: Identity, Contact, Next of Kin, Attachments. **ICP pre-fill applies only to UAE Pass sign-ins.** Pre-filled fields are disabled and highlighted ("Verified via ICP" in Figma). They become editable if the EID has expired (then nothing is fetched), the passport has expired (passport fields only), duplicate ICP profiles exist (nothing fetched), a field is blank, or ICP is down. ICP failure must never block submission (SBRD:449).

Identity:

| Field | Req | Conditional / validation |
|---|---|---|
| English First / Last Name | Y | ICP-disabled. English-only. Capitalize each name part. Symbols allowed in Last Name. |
| English Middle Name | N | ICP puts names 2-4 here, separated by spaces |
| Arabic First / Middle / Last | N | Always editable. Arabic-only. |
| Date of Birth | Y | DD/MM/YYYY, must be in the past |
| Gender | Y | Male / Female |
| Marital Status | Y | Single / Married / Divorced / Widowed (always editable) |
| Nationality | Y | List mapped to the ICP standard list |
| Child of a UAE National mother with a Family Book? | Y if nationality ≠ UAE | Yes → Birth Certificate + Mother Family Book required |
| Do you have Marsoom? | Y if nationality ≠ UAE | default No. Yes → Marsoom copy required. |
| Country of Residence | Y | ICP: UAE |
| UAE City of Residence | Y if residence = UAE | emirates DDL |
| Do you have an Emirates ID? | Y | shown if residence = UAE |
| Emirates ID Number / Expiry | Y if has EID | EID format; DD/MM/YYYY |
| Visa Unified Number | Y if has EID and nationality not UAE/GCC | |
| Visa File Number / Place of Issue / Expiry | "Y if residence UAE" but shown if has EID and not UAE/GCC (inconsistent in the BRD) | |
| Passport Number / Country of Issue / Date of Issue | Y | |
| Passport Date of Expiry | Y | must be later than today |
| UAE Passport City of Issue | Y if passport country = UAE | |
| Other Passport City of Issue | Y if passport country ≠ UAE | |
| Family Book City Number, Family ID (khulasitQaidNo), Passport Unified Number | Y if nationality = UAE | |
| Country of Birth | Y | |

Contact: Registered Email and Mobile (from IDAM, disabled). Contact Email and Contact Mobile are copied from the registered values and editable. **A change requires an OTP** (`startContactVerification` → `confirmContactVerification`, valid until `validUntil`). Saving an unverified change returns `422 contact.not_verified` (CL:1381-1570; SCH:1637-1689). Phone fields show the country code with a flag (E.164).
Next of Kin: First Name (Y), Middle (N), Surname (Y), Relationship (DDL, Y), Primary Telephone (Y, selectable country code), Primary Email (Y) + Confirm Email (must match), Area of Residence (Y).
Attachments: Personal Photo (Y), Passport (Y), Family Book (UAE nationals), EID both sides (if has EID), Marsoom (if Yes), Mother Family Book and Birth Certificate (if child of UAE mother), Residency Visa (has EID and not UAE/GCC). OQ-17: should identity documents be stored per candidate instead of per application? (open)
The personal-information section reads and writes the **candidate profile** shared by all of the candidate's applications (CL:110-113; D-10). Each submission keeps a snapshot (D-15).

### 3.6 Step 4: University Grades (US-1.3.4, SBRD:528-564)

| Field | Rule |
|---|---|
| Country | required |
| University | required; filtered by country; includes "Other" → Other University text required |
| Degree | required; filtered by program (SBRD:1823-1831: Dental: HBMCDM dental degrees; Medical: MD or MBBS; Pharmacy: BSc/MSc Pharmacy; Med Lab: BSc Med Lab Sci or Biomedical Sci) |
| Graduation Year / Month | required; year ≤ current year; month 1-12 |
| GPA Type | UAE only: Percentage (default) or Scale of 4 |
| UAE GPA Scale of 4 | 0.00-4.00 if type = Scale of 4 |
| UAE GPA Percentage | 0-100 if type = Percentage |
| ECE GPA | required if country ≠ UAE; 0.00-4.00 |
| Original GPA | required if country ≠ UAE; free text (4.0 scale, % or Pass/Fail) |
| GPA Result | read-only %, for example "97.50%" |
| GPA Shortlisting Score | read-only, `X.XX / Y` where Y is the program's GPA weight |

Out-of-range values show a **warning** and do not block (AC9).
Conversion: `% = GPA ÷ 4.00 × 100` (= GPA × 25), "with no rounding" (SBRD:1847). Shortlisting score (inferred) = `% × weight / 100`. Example: GPA 3.00 → 75% → **26.25 / 35** (Figma `1:3827`). The BRD example `34.13 / 35` (97.5% × 35 = 34.125) needs a rounding rule (OQ-C12).
Attachments: Graduation Certificate (Y), Transcript (Y), ECE report (if country ≠ UAE).

### 3.7 Step 5: English Proficiency (US-1.3.5, SBRD:566-594)

| Field | Rule |
|---|---|
| Title of Exam | Academic IELTS, TOEFL iBT, OET, EmSAT-English. Required except for Fellowship and exempt countries (§3.1). |
| Date Taken | DD/MM/YYYY, required with the exam |
| Result | IELTS 6.0-9.0; TOEFL iBT 80-120; EmSAT ≥1252 |
| OET Reading / Writing / Listening / Speaking | required if OET; each ≥300 (grade C+) |
| Certificate attachment | required when the entry is required |

### 3.8 Step 6: Internship Information (US-1.3.6, SBRD:596-622)

Applies to Medical/Dental Residency and Fellowship. Hidden for Internship, Certificate and Pharmacy Residency.
Organization DDL (MBRU, DHA, EHS, DoH AD, Gulf Medical University, Ajman University, Other) → Other Organization Name (if Other). Location is auto-set to UAE and read-only for MBRU, DHA, EHS, DoH, GMU and Ajman; for Other it is a country DDL. From Date (in the past), To Date (after From; may be in the future if ongoing). Attachment: Internship Certificate or Enrollment Letter.

### 3.9 Step 7: Residency Information (US-1.3.7, SBRD:624-643), Fellowship only

Specialty (residency specialty mapped to the fellowship's required residency, SBRD:1721-1745), Training Hospital (accepted UAE hospitals per entity, SBRD:1813-1821, plus Other → Other Training Hospital), Training Country (auto UAE for MBRU/DHA/GMU/EHS/DoH hospitals), Completion Date. All required.

### 3.10 Step 8: Board & License (US-1.3.8, SBRD:645-689), Fellowship only

Repeatable board entries, **at least 1**, Tier 1 or 2 (AC4). Each entry: Board Name; Sat final written exam? → No: Scheduled Exam Date (future). Yes: Exam Date, Result (Pass/Fail), Written Attempt (1-4), OSCE Date, OSCE Attempt (1-4). Fail → Resit Date (future).
License (all optional): Authority (DHA, EHS, DoH, Other → text), License Number, Job Title (Resident, Specialist, Consultant, Other → text). AC9 says the license number and job title become required once an Authority is chosen; the data dictionary says they are optional.
Attachments: Board Certificate / Letter (required), Second written exam passing letter (required if passed), Training-centre transcript (optional), Specialist/Consultant License (optional).
Note: the BRD mentions a "Tier" selection (AC4) but the data dictionary has no Tier field.

### 3.11 Step 9 (Residency): Entrance Exam (US-1.3.9, SBRD:691-718)

| Field | Rule |
|---|---|
| Type | Medical: EMREE, SMLE. Dental: EDREE, SDLE. Pharmacy: EPREE. |
| Attempt | First, Second, or Third and Beyond. Required for EMREE, EDREE and EPREE. |
| Examination Date | required; in the past |
| Percentile Rank | 0-100; required for EMREE, EDREE and EPREE |
| Score | EMREE 60-100; EPREE 55-100; EDREE 65-100; SMLE and SDLE 560-800. Out of range → warning. |
| Entrance Exam Shortlisting Score | read-only `X.XX / Y` (for example 27.30 / 35) |
| Exam Statement of Result | required attachment |

Formulas: EMREE/EDREE = `score%×10% + percentile×10%` (first attempt), 8% (second), 6% (third and beyond). SMLE/SDLE = `((score−200)/2)/300×100`. **EPREE has no formula.** The EMREE formula gives at most 20 against a weight of 35, so the formulas need clarifying (SBRD:1878-1893; OQ-C12). The XL README says "do not infer formulas" (US-XL:44).

### 3.12 Portfolio (US-1.3.10, SBRD:720-756)

A one-time, **irreversible** submission with a warning when the section opens. It stays immutable even if the application is later returned for correction. Answer Yes → the details and evidence become required. Answer No → nothing more is required. Before submitting, a confirmation pop-up lists each question number, the answer, and whether attachments were provided. Points are "indicative only".

| Set | Questions and points |
|---|---|
| Fellowship | Q1-Q6, 5 points each: publication (link, journal, title, date + manuscript); second subspecialty publication; teaching (activity, role, from/to + certificate); leadership; system-based practice (provider, activity, role, date); additional qualifications (certificate) |
| Internship (Medical / Dental) and Residency | Q1 publication (7 / 4 / 6), with link, journal, title, date, role (DDL + Other) and manuscript. Q2 research activity (4 / 2 / 4): role + ethical approval, proposal, supervisor letter. Q3 scientific presentation: 4 points if oral, 3 for poster, workshop or other. Q4-Q5 volunteering (4 / 2 / 2): provider, campaign name, date; Q5 must differ from Q4. Q6-Q7 skills courses (4 / 2 / 2); Q7 must differ from Q6. Q8 awards: 6 for Dean's List or graduation honours (5 for Residency), 4 for others. Q9-Q10 extracurricular: Residency only, 2 points each (hidden for Internship). |

Contract: `GET /applications/{id}/portfolio` and `POST /applications/{id}/portfolio-submission` with `PortfolioSubmissionInput{answers[{questionId, answer YES|NO, details{}, evidenceIds[]}], confirmed:true}`. Evidence files go through the attachment slots (`sectionKey=portfolio`, `portfolioQuestionId`). Their `attachmentId` is the `evidenceId` (CL:271-272, 432-528; SCH:778-849, 1343-1348).
**Gap: there is no operation to save portfolio answers as a draft** (OQ-C5).
Scoring the candidate later sees: all-or-nothing per question except 2 point-system questions; a predefined candidate comment for each rejection reason (SBRD:1405-1425, 1918-2004). Portfolio Score = Total Points × program portfolio weight (SBRD:1423). The point sums are 37 (Medical Internship), 24 (Dental) and 31 (Residency) against weights of 30, 20 and 30, so the normalization is unclear (OQ-C12).

### 3.13 Attachments (all steps)

| Rule | Source |
|---|---|
| Max **2 MB** (configurable). Wrong format → rejected with a message. All attachments are **PDF except the photo**. | SBRD:398 AC15-16; SBRD:1804 (T&C item 2) |
| Constraints come per slot from the server: `allowedMediaTypes[]`, `maxFileSizeBytes` (example 2097152) | SCH:1280-1353 |
| Required / optional / hidden state follows the answers. Requiredness is enforced at payment and submission, not on delete. | SBRD:398 AC12-14; CL:343-347 |
| Upload: `PUT .../attachments/{slotId}` multipart `file` → `413` too large, `415` type not allowed, `422` empty or infected, `409` not editable, `503` storage down (slot unchanged) | CL:259-337 |
| Preview: `GET .../content` streams the file (`Cache-Control: private, no-store`); no FileNet URL is exposed | CL:383-430; DEC:66 |
| Slot `editable`: draft = all slots; Correction Required = flagged slots only; portfolio evidence until the portfolio is submitted | SCH:1314-1319 |
| Document flow: browser → API → Rhapsody → FileNet. Upload-time vs submission-time storage is OQ-07. | DEC:66-67; OQ:49 |

### 3.14 Save draft and validation

- Save = `PATCH /applications/{id}` (JSON Merge Patch, `If-Match` ETag; `428` if missing, `412` if stale) or the per-section `PUT .../sections/{key}` (also `If-Match`). The backend PATCH accepts only `preferences`; other members are refused (BE Contracts/ApplicationRequests.cs:33-46).
- A draft save does not validate completeness (SBRD:763 AC1). Exception: invalid preferences → 422 (D-27).
- Server validation errors: `Problem.errors[]{code, detail, pointer}`, where `pointer` is a JSON Pointer. Use it to highlight the tab and field (SCH:465-524).

---

## 4. Payment and submission (US-1.3.12)

Flow (SBRD:766-785; E2E:64-74; PAY:1-73; CL:977-1148):

1. **Summary screen:** Application Number, Create Date, Submit Date, Status, Bill Amount (AED, from fee configuration), Bill Status (`N/A | Pending | Paid` in the BRD), Payment Date. A section checklist with a "Complete" tag per step is in Figma.
2. Pay & Submit → client validation, then the confirmation prompt (AC3-5). The server re-validates: `POST .../payment-sessions` returns `422` if the application is invalid and `409` if it is not payable.
3. `POST /applications/{id}/payment-sessions` (`Idempotency-Key` required, no body) → `201 PaymentSession{id, applicationId, amount, currency:"AED", status, checkoutUrl, checkoutExpiresAt, receiptId, paymentDate}` (SCH:851-894). The server chooses the provider (E-Pay or Network International). **The client must not branch on the provider** and must treat `checkoutUrl` as opaque (PAY:49). A retry with the same key returns the same session.
4. Redirect the browser to `checkoutUrl`. The `returnUrl` is set on the server side (`PaymentGatewayCreateRequest.returnUrl`, SCH:179-204). It is not given to the candidate.
5. The provider callback → adapter → `POST /api/v1/integrations/payment-events` (integration client only; never the browser).
6. On return: `GET .../payment-sessions/{paymentSessionId}`. `PENDING` or `UNKNOWN` = still reconciling: do not show success or failure (CL:1040-1045; PAY:58). `FAILED` or `CANCELLED` = the application stays a draft; show a clear message and Retry (AC16-17).
7. `PAID` → show the receipt (`receiptId`, `paymentDate`) → `POST .../submission {paymentSessionId, confirmed:true}` (`Idempotency-Key`) → `200 Application` with status SUBMITTED; the form is read-only from then on. Errors: `409` not paid or already submitted, `422` incomplete, `503` dependency.
8. After submission the candidate gets a notification. Verification and portfolio statuses become Pending, and the attachments are stored in FileNet with the naming convention.

Fees: Internship 230 AED; Residency and Fellowship 650 AED (SBRD:772). The fee is **non-refundable**, including on withdrawal (SBRD:281, 1804).
Payment status is tracked separately from the application status (SBRD:772 note 6).
Open points: how the portal learns `paymentSessionId` after the redirect, auto-submit vs a client-triggered submission, and the different status vocabularies (OQ-C7).

---

## 5. Candidate-facing API endpoints

Common rules for every call:
- **Auth:** `Authorization: Bearer <opaque IDAM access token>` (`IdamBearer`), validated by introspection. `401` = token invalid → new sign-in. `503` = IDAM unreachable (fails closed). Candidate operations require the active role `CANDIDATE` and are scoped to the caller; no candidate id is ever sent (DEC:15-29; E2E:50).
- **Success:** `ApiResponse{data, messageCode?, message?}`. Lists use `ApiListResponse{data[], pagination{limit, nextCursor}}`. An empty list is `200`, `data: []`, with a `messageCode` such as `applications.none_active` (DEC:41; SCH:3024-3062).
- **Errors:** top-level RFC 7807 `application/problem+json` `Problem{type, title, status, detail, instance, code (^[a-z]+(\.[a-z_]+)+$), errors[]{code, detail, pointer}, traceId}`. **Branch on `code`, never on `detail`.** Show `traceId` for support (SCH:482-524; DEC:42).
- **Status codes:** 400, 401, 403, 404 (missing or not visible), 409 (state), 412 (stale If-Match), 413/415 (files), 422 (business), 428 (If-Match missing), 429 (rate limit or OTP cooldown, with `Retry-After`), 500, 503 (DEC:45).
- **Headers:** `Idempotency-Key` (16-128 characters) on creates and actions; reusing a key with a different body → `409 request.idempotency_key_reused`. `If-Match` on draft and section updates. `X-Request-ID` comes back on responses. `Accept-Language` / culture `en-AE | ar-AE` (DEC:43, 46-48).
- **Formats:** UUIDs in URLs. Timestamps ISO 8601 UTC with an offset. Locally defined deadlines carry `timeZoneId` (DEC:43-44).
- **Pagination:** `limit` (1-100, default 25), opaque `cursor`, allow-listed `sort` (unknown key → `400 request.invalid_sort`) (DEC:54-58; PRM:21-41).

| # | Method + path | operationId | Purpose | Request → Response | Story | Backend today |
|---|---|---|---|---|---|---|
| 1 | POST `/api/v1/auth/sign-in` | signIn | Provision or match after IDAM login; refresh profile from UserInfo | no body → `AuthSession{userType CANDIDATE|STAFF, userId, candidateNumber, displayName, email, roles[], activeRole, preferences{timeZoneId, culture}}`; 401, 403 `account.deactivated`, 409 `account.duplicate`, 503 | US-1.1.1/2 | **Implemented** (AuthController.cs:48) |
| 2 | GET `/api/v1/auth/me` | getCurrentSession | Current session without provisioning | → `AuthSession`; 403 `account.not_registered` / `account.deactivated` | US-1.1.2 | **Implemented** (AuthController.cs:87) |
| 3 | GET `/api/v1/me/dashboard` | getCandidateDashboard | Inbox + start-new state | `cycleId?, limit, cursor, sort(createdAt, submittedAt)` → `CandidateDashboard{startNewApplication{enabled, disabledReason, nextCycleOpensAt}, sessionTimeoutMinutes?, items[CandidateDashboardItem], page}` | US-1.2.1/2, US-4.3.2 | **Partial** (CandidateDashboardController.cs:40). Not returned: `sessionTimeoutMinutes`, `announcementDate`, `appealDeadline`, `announcedScores`. Actions: VIEW and RESUME only. |
| 4 | GET `/api/v1/programs` | listPrograms | Programs open for a cycle | **`cycleId` required**, limit, cursor, sort → `Program[]{id, code, name, category, cycleId, applicationOpensAt, applicationClosesAt, timeZoneId}`; empty `programs.none_available` | US-1.3.1 | **Implemented** (CatalogController.cs:33). cycleId is required. |
| 5 | GET `/api/v1/programs/{programId}/specialties` | listProgramSpecialties | Active specialties | → `Specialty[]{id, code, name}` | US-1.3.1 | **Implemented** (:53) |
| 6 | GET `/api/v1/specialties/{specialtyId}/sites` | listSpecialtyTrainingSites | Active sites (no program context, OQ-19) | → `TrainingSite[]{id, code, name}` | US-1.3.1 | **Implemented** (:72) |
| 7 | GET `/api/v1/lookups/WITHDRAWAL_REASON` | listLookupValues | Withdrawal reasons (candidates may read only this type) | → `LookupItem[]{code, label, parentCode, sortOrder, active}` | US-1.2.4 | Contract only (CAT:432-508) |
| 8 | GET `/api/v1/applications` | listCandidateApplications | Candidate's applications | `cycleId?, limit, cursor, sort` → `ApplicationSummary[]` | US-1.2.1/2 | **Implemented** (ApplicationsController.cs:43) |
| 9 | POST `/api/v1/applications?cycleId=` | createCandidateDraftApplication | Create a draft | `Idempotency-Key`; `CreateApplicationRequest` → `201 Application` + `ETag`; 409 active exists, 422 | US-1.3.1 | **Implemented** (:64) |
| 10 | GET `/api/v1/applications/{id}` | getCandidateApplication | Read one application (read-only after submit; `announcedScores` only after announcement) | → `Application` (= Summary + `sections{}`) + `ETag` | US-1.2.2, US-4.3.2 | **Implemented** (:90). No sections. |
| 11 | PATCH `/api/v1/applications/{id}` | updateCandidateDraftApplication | Save draft | `If-Match`; `application/merge-patch+json` `UpdateDraftRequest{preferences?, sections?}` → `Application` + new `ETag`; 409, 412, 422, 428 | US-1.3.11 | **Partial** (:105): preferences only |
| 12 | DELETE `/api/v1/applications/{id}/draft` | discardCandidateDraft | Discard (→ Archived) | → `WorkflowActionResult{resourceId, status, effectiveAt, auditEventId, messageCode}`; 409 if not DRAFT | US-1.2.3 | Contract only (CL:1289) |
| 13 | GET `/api/v1/applications/{id}/form-schema` | getApplicationFormSchema | Versioned field definitions | → `ApplicationFormSchema{applicationId, schemaVersion, sections[{sectionKey, fields[FormFieldDefinition]}]}` | US-1.3.2-10 | Contract only (CL:167); OQ-02 |
| 14 | GET / PUT `/api/v1/applications/{id}/sections/{sectionKey}` | getApplicationSection / saveApplicationSection | Read or save a section | PUT `If-Match`; `ApplicationSectionInput{schemaVersion, values{}}` → `ApplicationSection{applicationId, sectionKey, schemaVersion, values, fields[], editable, version}`; 404 if the section does not apply | US-1.3.2-9, US-2.3.4 | Contract only (CL:55-165) |
| 15 | POST `.../contact-verifications` | startContactVerification | OTP for a changed contact | `{channel EMAIL|SMS, value}` → `202 ContactVerification{verificationId, channel, destination{channel, maskedValue}, expiresAt, resendAvailableAt}`; 409, 422, 429, 503 | US-1.3.3 | Contract only |
| 16 | POST `.../contact-verifications/{vid}/confirmation` | confirmContactVerification | Confirm the code | `{otp 4-12}` → `ContactVerificationResult{verifiedAt, validUntil}`; 422 `otp.invalid` / `otp.expired`, 409, 429 | US-1.3.3 | Contract only |
| 17 | POST `.../contact-verifications/{vid}/otp-resend` | resendContactVerificationOtp | Resend | → 202 `ContactVerification`; 429 cooldown or limit | US-1.3.3 | Contract only |
| 18 | GET `.../attachments` | listApplicationAttachmentSlots | Applicable document slots | → `AttachmentSlot[]{slotId, sectionKey, documentTypeCode, label, required, editable, allowedMediaTypes[], maxFileSizeBytes, specialtyId?, trainingSiteId?, portfolioQuestionId?, attachment: AttachmentMetadata or null}` | US-1.3.2-10 | Contract only |
| 19 | PUT / DELETE `.../attachments/{slotId}` | uploadApplicationAttachment / deleteApplicationAttachment | Upload or replace / remove | multipart `file` → `AttachmentMetadata{attachmentId, version, fileName, mediaType, sizeBytes, uploadedAt}`; DELETE → `AttachmentSlot` | US-1.3.2 | Contract only |
| 20 | GET `.../attachments/{slotId}/content` | downloadApplicationAttachment | Preview or download | → binary + `Content-Disposition` | US-1.3.2 AC17 | Contract only |
| 21 | GET `.../portfolio` | getCandidatePortfolioDraft | Read portfolio | → `PortfolioSubmission{submittedAt, immutable, answers[]}`; 404 if not configured | US-1.3.10 | Contract only |
| 22 | POST `.../portfolio-submission` | submitCandidatePortfolio | One-time submit | `Idempotency-Key`; `PortfolioSubmissionInput` → `201`; 409 already submitted, 422 | US-1.3.10 | Contract only |
| 23 | POST `.../payment-sessions` | createApplicationPaymentSession | Start payment | `Idempotency-Key` → `201 PaymentSession`; 409, 422, 503 | US-1.3.12 | Contract only |
| 24 | GET `.../payment-sessions/{psid}` | getApplicationPaymentSession | Status and receipt | → `PaymentSession` | US-1.3.12 | Contract only |
| 25 | POST `.../submission` | submitPaidApplication | Submit after payment | `Idempotency-Key`; `{paymentSessionId, confirmed:true}` → `Application` | US-1.3.12 | Contract only |
| 26 | PUT `.../preferences` | updateCandidatePreferences | Edit preferences after submission | `If-Match`; `{preferences[1..2]}` → `Application`; 409 locked, 412, 422 | US-1.2.6 | Contract only |
| 27 | POST `.../site-exclusions` | excludeCandidateTrainingSites | Exclude sites | `Idempotency-Key`; `{siteIds[≥1, unique], reason 1-500}` → `Application`; 409 last site or locked | US-1.2.8 | Contract only |
| 28 | POST `.../withdrawal-requests` | createApplicationWithdrawalRequest | Start a withdrawal | `{reasonCode ≤50, otherReason 3-500 (required when OTHER)}` → `202 {requestId, expiresAt, resendAvailableAt, destinations[]}`; 409, 422, 503 | US-1.2.4 | Contract only |
| 29 | POST `.../withdrawal-requests/{rid}/confirmation` | confirmApplicationWithdrawal | Confirm with OTP | `{otp 4-12}` → `WorkflowActionResult`; 409 expired or consumed, 422 invalid | US-1.2.4 | Contract only |
| 30 | POST `.../withdrawal-requests/{rid}/otp-resend` | resendWithdrawalOtp | Resend | → 202 `OtpChallenge`; 429 + `Retry-After` | US-1.2.4 AC6 | Contract only |
| 31 | POST `.../reinstatement-requests` | requestApplicationReinstatement | Request reinstatement | `Idempotency-Key`; `{justification 1-1000}` → `202 WorkflowActionResult`; 409 another active application or timeline closed | US-1.2.5 | Contract only |
| 32 | GET `.../portfolio-result` | getCandidatePortfolioResult | Announced result and appeal view | → `CandidatePortfolioResult{applicationNumber, announcedAt, finalPortfolioPoints, portfolioScore, appeal{status, deadline, submittedAt, timeZoneId}, questions[{questionId, prompt, candidateAnswer, details, evidence[], maxPoints, awardedPoints, comments[], appealable, appealResponse}]}`; 404 `portfolio.scores_not_announced` | US-1.2.7, US-4.3.2 | Contract only |
| 33 | POST `.../appeals` | submitPortfolioAppeal | Submit an appeal | `Idempotency-Key`; `{responses[{questionId, response ≤200}], confirmed:true}` → `202 WorkflowActionResult`; 409 already appealed or window closed, 422 | US-1.2.7 | Contract only |
| 34 | POST `.../corrections` | submitApplicationCorrections | Re-submit flagged items | `Idempotency-Key`; `{sections{<flagged key>: ApplicationSectionInput}}` → `WorkflowActionResult`; 409, 422 | US-2.3.4 | Contract only (ADM:559) |

Not in the contract but in the backend: `POST /api/v1/development/sign-in` (development only, behind configuration; BE Program.cs:64-67; Authentication/Development/DevelopmentSignIn.cs:19).
Error codes the backend already emits (useful for i18n): `account.deactivated|duplicate|no_role|not_registered|role_not_held`, `application.active_exists|invalid_preferences|not_editable|program_not_open`, `applications.none_active`, `programs|specialties|sites.none_available`, the `preferences.*` codes listed in §3.3, `request.idempotency_key_reused|invalid_cursor|invalid_sort|precondition_failed|precondition_required|rate_limited|validation_failed`, `resource.not_found`, `auth.token_invalid|idam_unavailable|forbidden`, `token.*`, `server.unexpected_error`, `field.invalid`.

### 5.1 Existing frontend API layer compared with the contract and backend

| FE file | Covers | Notes |
|---|---|---|
| `api/auth-api.service.ts` | signIn, getCurrentSession | matches |
| `api/dashboard-api.service.ts:16` | getCandidateDashboard | sends no `cycleId`, paging or sort; models match the contract (`dashboard.models.ts`) |
| `api/catalog-api.service.ts:22` | listPrograms, specialties, sites | **`listPrograms()` sends no `cycleId`, but the backend has `[FromQuery, Required] Guid? cycleId` (CatalogController.cs:35) → `400` against the real API.** Root cause: OQ-24. |
| `api/applications-api.service.ts` | createDraft, getApplication, updateDraft | `createDraft` takes `cycleId` from `Program.cycleId`. `UpdateDraftRequest` = preferences only. There is no `list` call (the dashboard is used instead). |
| `core/api/api.models.ts` | ApiResult/Problem types | hand-written (OQ-08); `ApiResult` adds `etag` |
| `core/auth/*` | OIDC PKCE, session, candidate guard | no silent renew or refresh token (OQ-15); routes `409 account.duplicate` → `/duplicate-account`, `403` → `/not-allowed` |

Missing on the frontend: everything from endpoint 7 and 12-34 in the table above.

---

## 6. Session, language and notifications

### 6.1 Session

| Item | Rule | Source |
|---|---|---|
| Timeout behaviour | After a session timeout the candidate is sent to IDAM to re-authenticate | SBRD:204 AC3 |
| Inactivity note | The dashboard must show a note with the inactivity time-out period | SBRD:229 note 3 |
| Duration | **The BRD gives no value.** Figma shows a "30-minute inactivity sign-out" toast. The contract has an optional `CandidateDashboard.sessionTimeoutMinutes` that **the backend does not return yet**. | figma-extracts/gme-candidate-screens.md:19; SCH:1768-1771 |
| Token lifetime and renewal | Silent renew and refresh tokens are off until IDAM confirms its renewal method; an expired token means a new sign-in | OQ-15 (OQ:57); FE core/auth/auth.providers.ts |
| Warning dialog | No session-timeout warning dialog exists in Figma (gap noted in the design extract) | gme-candidate-screens.md:295 |
| Storage | Tokens are kept in memory only; no personal data in browser storage | frontend/README.md:35-39 |

### 6.2 Languages

The BRD does not specify UI languages. The contract supports the cultures `en-AE` and `ar-AE`. Culture comes from the user preference, then `Accept-Language`, then `en-AE`. The API resolves `message` and `detail` for that culture (DEC:43; SCH:3080-3095). The portal builds one bundle per locale with RTL `dir` (frontend/README.md:39).
Form-level language rules: English names must be in English characters and capitalized; Arabic names are optional and must be in Arabic characters (SBRD:458-463; BRD:2383).
Display dates as DD/MM/YYYY in the user's IANA time zone (default `Asia/Dubai`).

### 6.3 Notifications the candidate receives (email/SMS; templates "TBC by business team", SBRD:1895-1900)

| Event | Channel | Source |
|---|---|---|
| Account created | IDAM standard | SBRD:192 note 3 |
| Draft reminder (every N days), 3 days before the grace deadline, 1 day before, archived | email | SBRD:366-369, 763 |
| Application submitted | notification (channel not stated) | SBRD:771 AC10 |
| Withdrawal completed | email (the admission team is notified too) | SBRD:280 AC7-8 |
| Reinstatement approved or rejected (with reason) | email | SBRD:1227 AC4, AC8 |
| Returned for correction; correction reminders and archive | email | SBRD:1082 AC5; 1090 AC8-12 |
| Initial announcement; reannouncement | email + SMS | SBRD:1619 AC11; 1691 AC12 |
| Screened out (verification or bulk) | email + SMS (bulk); "candidate is notified" (verification) | SBRD:57, 1662 AC8 |
| Site exclusion | the admission team is notified (not the candidate) | SBRD:334 AC9 |

There is no in-portal notification list or bell in the requirements or the contract.

---

## 7. Open questions and contradictions for the candidate UI

Existing open items that block candidate work: OQ-02 (form schema), OQ-03 (lengths and statuses), OQ-07 (FileNet timing), OQ-14 (legacy features), OQ-15 (IDAM renewal), OQ-17 (identity docs per candidate), OQ-19 (sites without program), OQ-21 (window on create/save), OQ-24 (open cycle id), OQ-25 (preferences per program), OQ-26 (names in read models), OQ-27 (OIDC library and sign-out) (OQ:44-69).

New items found in this extract (`OQ-C*`, not yet in `Open-Questions.md`):

| ID | Issue | Impact on UI | Evidence |
|---|---|---|---|
| OQ-C1 | The whole wizard after step 1 has no backend: sections, form schema, attachments, portfolio, payment, submission and lifecycle actions are contract-only | Steps 2-10, documents, payment and all dashboard actions except Resume are blocked or need mocks | §5 table; frontend/README.md:43-52 |
| OQ-C2 | The portal calls `GET /programs` without `cycleId`, but the backend requires it | Step 1 fails against the real API (400) | FE catalog-api.service.ts:22; BE CatalogController.cs:35; OQ-24 |
| OQ-C3 | `Program.category` cannot tell Medical, Dental and Pharmacy residency apart, and has no `maxPreferences` or fee | Cannot decide the preference count, the internship section, the exam types, the fee or the weights on the client | SCH:17-23; OQ-25 |
| OQ-C4 | Dashboard and application return specialty and site ids only | Preference and site names cannot be shown | OQ-26 |
| OQ-C5 | No operation saves portfolio answers before the one-time submit; `sectionKey` has no `portfolio` value | The candidate cannot save portfolio work as a draft (conflicts with US-1.3.11 "Save from every tab") | CL:432-528; PRM:104-118 |
| OQ-C6 | There is no candidate read of correction flags or officer notes, and `CandidateApplicationAction` has no CORRECT/RESUBMIT value | US-2.3.4 AC1-2 (edit only flagged items, show the officer note) cannot be built | SCH:980-1006, 1691-1703; SBRD:1090 |
| OQ-C7 | Payment return: the BRD says a confirmed receipt makes the **platform** submit (AC8-9), but the contract requires the client to call `POST /submission`. How the browser learns `paymentSessionId` after the redirect, and the return route, are unspecified. Bill status vocabularies differ: BRD `N/A/Pending/Paid`, `PaymentStatus` `PENDING/PAID/FAILED/CANCELLED/UNKNOWN`, finance `NA/PENDING/PAID/FAILED`. | Risk of a paid but unsubmitted application if the tab closes | SBRD:771, 784; CL:1083-1148; SCH:142-149, 921-927 |
| OQ-C8 | There is no grace-period deadline in the contract (Program has only opens and closes) | Edit Preferences, reminders and archive timing cannot be shown | SBRD:215, 254; SCH:27-40 |
| OQ-C9 | The session timeout value is not in the BRD (Figma: 30 min). `sessionTimeoutMinutes` is optional and not implemented. There is no warning dialog design. | Inactivity note and auto sign-out | §6.1 |
| OQ-C10 | Withdraw is allowed for "any status other than Withdrawn, Draft, Archived", which includes SCREENED_OUT | Should Withdraw show on screened-out applications? | SBRD:252; CL:679-683 |
| OQ-C11 | Site count: BRD "no limit" vs backend max 20. Text lengths: reinstatement justification 1000 (contract) vs 500 (DB) and the BRD "min 3 letters, reject 'Reason'/'NA'" rule (not in the contract); appeal response 200 vs 1000; site-exclusion reason free text vs code | Client validation limits | BRD:2495; BE ApplicationRequests.cs:56; CL:869-872, 947, 638-641; SBRD:304; OQ-03 |
| OQ-C12 | Formulas are incomplete or inconsistent: EMREE/EDREE max 20 against weight 35; no EPREE formula; Pharmacy Residency and Certificate weights and fee missing; portfolio point totals (37 / 24 / 31) exceed the weights (30 / 20 / 30); GPA "no rounding" vs example 34.13. | Computed score labels in steps 4 and 9 and the score tiles | SBRD:1833-1893, 735-756, 555; US-XL:44 |
| OQ-C13 | D-11 says GPA and exam shortlisting scores are shown only **after the announcement**, but US-1.3.4 AC8 and US-1.3.9 AC9 show them live in the form, and the dashboard dictionary shows them "as per the application" | Whether steps 4 and 9 display the computed score | OQ:22; SBRD:533, 696, 247-248 |
| OQ-C14 | The BRD marks some verification and portfolio statuses as candidate-visible, but the contract exposes only `ApplicationStatus` | Whether to show sub-statuses | SBRD:37, 48-75; CL:8-13 |
| OQ-C15 | Discard: the BRD says "removes the draft" **and** "status Archived"; the contract says the retention policy applies | Whether a discarded draft stays visible in the inbox as Archived | SBRD:272; CL:1295-1306 |
| OQ-C16 | Exclusion is allowed "until academic year start", but no such date exists in the contract | Action availability | SBRD:335 |
| OQ-C17 | US-1.3.8 lists a Tier selection (AC4) with no field; license fields are optional but AC9 makes the number and title required once an Authority is chosen. In US-1.3.3 the visa fields' required and shown conditions disagree. | Field rules | SBRD:650-679, 475-478 |
| OQ-C18 | Fellowship has GPA weight N/A, but US-1.3.4 does not exclude Fellowship | Whether to show University Grades or the GPA score for Fellowship | SBRD:1842, 528-534 |
| OQ-C19 | Figma wizard step totals are inconsistent (9 vs 10) | The stepper must be computed per variant | gme-candidate-screens.md:23-40 |

Resolved conflicts (for reference): the Application ID format is D-19 (`20270000001`), not `123456789-G27` (SBRD:406; OQ:28). One active application is counted per cycle, not per program (D-26). The duplicate check runs at sign-in (D-04).
