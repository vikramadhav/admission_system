# Open questions and assumptions

The candidate portal was built without pausing on these: each has a documented default that is easy to change. Items marked **Business** need an answer before go-live; **Contract** items need the API team. OQ-xx and OQ-Cxx refer to `Open-Questions.md` and [extracts/requirements-and-api.md](extracts/requirements-and-api.md) §7.

## Assumptions the portal makes (A-xx)

| Id | Assumption | Where | Change it by |
|---|---|---|---|
| A-01 | Only 10 of 34 candidate operations exist in the backend (OQ-C1), so the portal runs on a **mock API** that follows the contract shapes (envelopes, ETags, idempotency, Problem Details). | `src/app/mock/`, `environment.mock.ts` | Use `environment.development.ts` (real API) once the operations exist. |
| A-02 | The program variant (Medical / Dental / Pharmacy residency, Internship, Certificate, Fellowship) is read from `Program.code` (`DEN`, `PHA`), because `Program.category` cannot tell them apart and has no preference count or fee (OQ-25, OQ-C3). | `shared/program-rules.ts` | Add variant, `maxPreferences` and fee to `Program` (Contract). |
| A-03 | The wizard uses **typed sections** with portal field codes (`shared/section-values.ts`) saved through `PUT …/sections/{sectionKey}`. The dynamic form-schema option (OQ-02) is not used. | `features/candidate/application-wizard` | Decide OQ-02 (Contract); map the codes if they differ. |
| A-04 | Option lists (countries, universities, hospitals, boards, statuses, exams) come from the BRD appendix and are samples where the BRD says "extract from current system". English labels only. | `shared/reference-data.ts` | Serve localized options through the form schema or lookups (Contract). |
| A-05 | ICP pre-filled identity fields are flagged by `ApplicationSection.fields[].readOnly` with `source: 'ICP'` (an addition to `FormFieldDefinition`). | personal information | Confirm how the API marks pre-filled fields (Contract). |
| A-06 | Certificate fee is 230 AED (it "follows Dental Internship"); Pharmacy Residency uses the residency weights (35/35). | `shared/program-rules.ts` | Business. |
| A-07 | Portfolio question sets, wording and points are held in the portal (no read operation returns the questions of a draft). | `shared/portfolio-questions.ts` | Add questions to `GET …/portfolio` (Contract). |
| A-08 | After the gateway, the portal finds the payment session from the `paymentSessionId` query parameter or from `sessionStorage['gme-pending-payment']`, then calls `POST …/submission` (OQ-C7). | `features/candidate/payment` | Agree the return URL and who submits (Contract, Business). |
| A-09 | The program cannot be changed after the draft is created (the contract only creates with a program); the BRD's "change with a data-loss warning" is replaced by "discard and start again". | program step | Business, Contract. |
| A-10 | Sections save silently 1.5 s after the last change (auto-save, US-1.3.11), and explicitly on Save As Draft, Next, Back and stepper clicks. The BRD's example interval is 3 minutes. | `wizard-state.service.ts` (`AUTO_SAVE_DELAY_MS`) | Business. |
| A-11 | The inactivity sign-out is 30 minutes (Figma) until the API returns `sessionTimeoutMinutes`; a warning shows 2 minutes before. "Stay signed in" restarts only the browser timer (no token renewal until OQ-15). | `core/session/inactivity.service.ts` | Business, IDAM. |
| A-12 | The application ID is shown in the contract format (`20260000123`, D-19), not Figma's `GME-2026-000123`; the admission cycle is shown as the opening year and the next (no cycle name in the contract, OQ-24). | wizard banner, dashboard | Contract. |
| A-13 | Upcoming wizard steps cannot be opened from the stepper before they are visited (the DAHC-UI stepper only links visited steps); Next and Back move freely without blocking validation. | wizard | Business (BRD says tabs can be visited in any order). |
| A-14 | Notifications are e-mail/SMS only (CJ-22): the header has no notification bell and there is no inbox page. | layouts | Business. |
| A-15 | A CORRECTION_REQUIRED application shows its status only: the contract has no candidate read of correction flags or a re-submit action (OQ-C6). | dashboard | Contract. |
| A-16 | Arabic strings of the new screens were machine-translated and need review by a native speaker; option lists and mock data stay in English. | `src/locale/messages.ar-AE.json` | Business (translation review). |

## Questions for the business and the API team (new, OQ-P)

| Id | Question | Blocks |
|---|---|---|
| OQ-P01 | Footer link destinations (About, Media Center, Careers, Contact, Privacy). They point to dubaihealth.ae for now. | go-live |
| OQ-P02 | Should a candidate be able to open any step from the stepper before visiting it (A-13)? | UX sign-off |
| OQ-P03 | Payment return contract (A-08) and PENDING time-out: how long may reconciliation take before the candidate is told to contact support? | payment |
| OQ-P04 | Portfolio: which evidence is mandatory per question when there are several (Q2 lists 3)? | portfolio |
| OQ-P05 | English warning text on the English Proficiency step (Figma 1:4137 not captured). | copy |

## From the dashboard and actions work

- **Action calls and the global message area (resolved).** The action methods in `api/` now take an optional `HttpContext`; dialogs pass `callerHandlesProblems()` and show the problem inline only.
- **Site exclusion is not tied to a specialty.** `SiteExclusionInput{siteIds, reason}` has no specialty, so a site chosen under two specialties is excluded from both. The dialog keeps the two checkboxes in step and stops any specialty from losing its last site. Business to confirm whether exclusion is per site or per specialty-and-site.
- **Dashboard announcement date and score tiles.** The tiles shown follow `programRules`: Portfolio and Shortlisting always, Entrance exam for Residency, and GPA where a GPA weight exists, so Fellowship has no GPA tile (OQ-C18). Values stay "—" until `announcedScores` arrives (D-11).
- **Admission Cycle card.** No operation returns the open cycle (OQ-24). The card uses `GET /programs`, with no `cycleId`: it shows the number of open programs, the earliest `applicationClosesAt` as the creation deadline, and the year of the first `applicationOpensAt` as the academic year. Figma's "GME - Internships / Academic Entity" tile has no data source.
- **Portfolio result maximum points.** `PortfolioResultQuestion.maxPoints` is shown as returned. The mock returns 5 for every question.
- **Edit preferences grace period.** The drawer text says changes are allowed "until the grace period ends", but the contract has no grace-period date (OQ-C8), so no date is shown.
- **Withdraw "Other" reason.** The rule of at least 3 letters and not "Reason" or "NA" (US-1.2.4 data dictionary) is checked in the client. The contract only says 3 to 500 characters.
- **Reinstatement justification.** It is limited to 1000 characters (contract), but the database allows 500 (OQ-C11).

## From the portfolio and payment work

- **No portfolio draft (OQ-C5):** answers are kept in the browser for the session only and saved when the candidate submits the portfolio. Evidence files are saved straight away through the portfolio slots. A draft operation (or a `portfolio` sectionKey) is needed to stop answers being lost on sign-out or reload.
- **Portfolio validation is client-side:** a Yes needs every detail field plus every evidence slot of that question. The BRD asks for "details and evidence" but doesn't say which evidence is optional (for example, Q2 has 3 documents). Assumption: all are required.
- **Portfolio "Other" roles:** an "Other" choice shows a free-text field (`roleOther`, `presentationTypeOther` detail keys). The detail key names are the portal's, because the contract leaves `details{}` open.
- **Payment return (OQ-C7):** before redirecting, the portal stores `{applicationId, paymentSessionId}` in sessionStorage (`gme-pending-payment`), and the return page uses the `paymentSessionId` query parameter when the gateway sends it. Two things need confirming: the real return URL and its parameters, and whether the platform submits on its own (BRD) or the client calls `/submission` (contract, implemented).
- **Payment that stays PENDING/UNKNOWN:** the return page checks 5 times, 2 seconds apart, then shows "still being confirmed" with a Check again button, and doesn't offer a new payment. The real reconciliation time is not specified.
- **Bill amount:** before a payment session exists, the summary shows the fee from the program rules (Internship 230, Residency/Fellowship 650, Certificate assumed 230). The contract has no fee on `Program` (OQ-C3).
- **Receipt download:** hidden in Figma and not in the contract, so it isn't built.

## From the personal information work

- **Field codes:** the personal-information section uses nested groups `identity`, `contact` and `nextOfKin`, and the field codes in `shared/section-values.ts` (assumption A-03). ICP read-only fields are matched by `identity.<code>` in `ApplicationSection.fields`.
- **Contact OTP state:** verified contact values are remembered only for the browser session. After a reload the candidate may be asked to verify again, although the API already holds the verification (`validUntil`). The contract has no read operation for verified contacts.
- **Visa field rules:** the BRD is inconsistent here (OQ-C17). The visa fields are shown and required when the candidate has an Emirates ID and is not a GCC national.
- **Child of a UAE mother and Marsoom:** these questions show only for non-Emirati nationals. The BRD makes them required only in that case, but Figma shows them for a Jordanian candidate only, so the screen gives no further evidence either way.
- **Emirates ID format:** validated as `784-YYYY-NNNNNNN-N`. The BRD says "EID format" without a pattern.
- **Passport city:** one free-text field. The BRD has separate "UAE passport city" (a list) and "other passport city" fields, and neither list is defined.
- **Next of kin phone:** the BRD asks for a selectable country code; the DAHC-UI phone input provides it. Figma shows a plain text input.
- **Marital status:** shown as a select (Single, Married, Divorced, Widowed). Figma shows it as a read-only ICP field with the value "No" and the label typo "Martial Status".

## From the academic to entrance exam steps

- University Grades: out-of-range GPA values (above 4 or 100) show a warning hint and do not block (US-1.3.4 AC9); non-numeric values block. The GPA shortlisting score is shown as `percentage × program GPA weight / 100` with two decimals (matches Figma 26.25 / 35); the BRD's "no rounding" vs its 34.13 example needs a rounding rule (OQ-C12). Fellowship shows no GPA score (weight N/A, OQ-C18).
- University Grades: the country and university lists are samples (BRD: "extract from current system"); degree options per program come from the appendix, with BDS/DDS/DMD standing in for "HBMCDM accepted dental degrees" (list not given).
- English Proficiency: the Figma warning toast text (1:4137) was not captured; the portal uses "Upload the certificate of a valid exam…". The exemption (USA, UK, Canada, Australia, New Zealand, Ireland) uses the nationality and the university country as currently entered. EmSAT maximum 2000 and OET sub-score maximum 500 are portal assumptions; out-of-range scores only warn.
- Internship: "To date" is always required (it may be in the future for current interns); the BRD does not say whether it may be left empty while ongoing.
- Residency Information has no attachment slot in Figma or the BRD; the section renders whatever slots the server returns.
- Board & License: there is no Tier field although AC4 mentions Tier 1 or 2 (OQ-C17). License number and job title become required once an authority is chosen (AC9), against the data dictionary that says optional (OQ-C17). "Second written exam passing letter" requiredness follows the server slots.
- Entrance Exam: no Figma screen; built from US-1.3.9. The exam shortlisting score is not calculated in the portal (formulas unresolved, OQ-C12); a read-only field says it is calculated by the admission team.
