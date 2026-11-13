# Multi-role portal: open questions and assumptions

Status: Phase 1, 2026-11-13. Ids are `PQ-xx` (portal question). Each entry gives the conservative behaviour the portal follows until the question is answered.

Related existing questions:
- `Open-Questions.md` (OQ-xx)
- `docs/candidate-portal/02-open-questions-and-assumptions.md` (A-xx, OQ-Cxx, OQ-P0x)

## Contract gaps (owner: API / contract team)

| Id | Question | Affects | Conservative behaviour until answered |
|---|---|---|---|
| PQ-01 | The brief asks for an `X-Active-Role` header. The contract stores the active role on the server and switches it with `PUT /auth/active-role`, with no header (standards s.23). Confirm the header is **not** wanted. | all staff calls | No header. Switch through the endpoint, then re-read `/auth/me` when the tab regains focus or after a 403. |
| PQ-02 | Staff resources return no `allowedActions`, so button visibility has to be worked out from status and role. Can the API add `allowedActions` to `Application` (staff view), `VerificationInboxItem`, `PortfolioReview` and `ScreeningApplicationRow`? | admission, scoring, screening | The derivation is kept in one file per workflow (`shared/workflow/*-actions.ts`), each rule citing the BRD. The API's 409/422 is always shown. |
| PQ-03 | Neither the session nor the dashboards tell an officer or referee which pools they have. Retrieval needs `poolId`, and only officer inbox items carry it (an empty inbox has none). Can the API add `pools[] {poolId, programName, specialtyName, round?}` to `OfficerDashboard` and `RefereeDashboard`? | US-2.2.1, US-3.2.1 | The mock returns a proposed `pools[]`, marked PROPOSAL. Against the real API, Retrieve shows an "unavailable" notice when there's no pool id. |
| PQ-04 | Candidates can't read correction flags or notes: neither `Application` nor `ApplicationSection` carries them. Officers can save flags but can't read them back to edit or remove their own notes. Can the API add a `GET .../correction-flags` for both the officer and the candidate (the candidate only after the application is returned)? | US-2.3.2, US-2.3.4 | Mock only. The candidate corrections page shows the flags returned by the mock, and with the real API it shows a "not available yet" notice. |
| PQ-05 | ICP refresh endpoints take `candidateId`, but no staff read model returns it. Can `candidateId` be added to the staff `Application` view, or the endpoint be keyed by `applicationId`? | US-2.5.3 | Mock only. The button is hidden when the candidate id is unknown. |
| PQ-25 | `getApplicationForVerification` returns only the plain `Application` (summary + sections). The review page also needs: verification and portfolio status, the assigned officer, the due date, GPA/exam scores, ICP-sourced fields, saved flags, staff notes, the pending screen-out recommendation and the candidate id. Can a `review` block be added (proposal shape in `api/admission.models.ts`, `VerificationReview`)? This would also cover PQ-04 (officer side) and PQ-05. | US-2.3.1–2.5.3 | The mock returns the proposed `review` block. Against the real API, the page shows the summary and sections only, and any action that needs the missing data is hidden. |
| PQ-36 | The referee's portfolio read (`PortfolioReview`) is missing several things scoring needs. The proposal shape is in `api/scoring.models.ts`. | US-3.3.1–3.3.4, US-3.2.2 | The mock returns the proposal. Without it the page cannot restore a draft or show question limits. |
|  | **Referee page needs:** the key information (application number, submission date, graduation or residency facts), each question's scoring type and maximum points, the referee's saved draft scores (no read exists), an ETag for the first save (PUT scores needs If-Match), and the appealed questions and appeal responses for the 2nd evaluation. | | |
|  | **Senior page needs:** referee names and a portfolio status, final score and current-referee block. | | |
| PQ-37 | Does the scores endpoint accept a partial draft (only some questions scored)? It returns 422 for invalid rubric values. | US-3.3.3 | Save draft sends only fully scored questions and says how many were left out. |
| PQ-38 | Can Round 2 be retrieved while another referee still holds Round 1 of the same portfolio? | US-3.2.1 | The mock allows it. The BRD is silent. |
| PQ-39 | The senior referee's view of a referee's portfolios has no referee name or role. Discrepancies return only question ids, and the override response has no updated round summary. | US-3.1.3, US-3.2.2 | The name comes from the dashboard, discrepancy rows show "Question N", and the page reloads after an override. |
| PQ-40 | **Fixed in Phase 6:** `LookupItem` now has `points` and `candidateComment`, as in the contract. | US-3.3.3 | – |
| PQ-41 | Admin role assignments are sent without program, specialty or pool scopes or validity dates, because no operation lists pools or programs for the administrator (related to PQ-03). | admin staff users | Roles only. Scopes are left out until a list exists. |
| PQ-42 | No operation lists admission cycles (OQ-24 / PQ-12), and `GET /programs` needs a `cycleId`. | finance, monitoring filters | "Current cycle" (from config) or "All cycles". Programs come from the current cycle. |
| PQ-43 | **Fixed in Phase 6:** every donut legend entry is a drill-down button of at least 24 px, so thin slices have a full-size target. | US-2.1.4 | – |
| PQ-35 | **Fixed in Phase 6:** the corrections page now asks before leaving with unsent changes, and board add/remove buttons show only when the board list is editable. | US-2.3.4 | – |
| PQ-26 | Staff cannot read the form schema, so the review page uses hand-mapped field labels, with a readable fallback for unknown codes. Can the staff application read include field labels, or the schema? | US-2.3.1 | Labels are mapped in `shared/staff-application/staff-application-labels.ts`. |
| PQ-27 | The format of `CorrectionFlag.fieldPointer` is not defined, in particular for attachments. The portal uses `/sections/{key}/values/{code}`, `/sections/{key}` and `/attachments/{documentTypeCode}`. | US-2.3.2, US-2.3.4 | Use these pointers until confirmed. |
| PQ-28 | The candidate dashboard's `allowedActions` has no correction value, so the "Correct your application" link is derived from status CORRECTION_REQUIRED. Should the contract add a `CORRECT` action? | US-2.3.4 | The link is derived from the status. |
| PQ-29 | Does a flag on a whole section make every field in that section editable for the candidate? | US-2.3.4 | Yes, the whole section becomes editable. |
| PQ-30 | `BulkActionRequest.reasonCode` is required even for announce and reannounce. Which values should be sent? | US-4.3.1, US-4.5.1 | The portal sends `INITIAL_ANNOUNCEMENT` and `REANNOUNCEMENT` (an assumption). |
| PQ-31 | `ScreeningApplicationRow` has no previous or updated final portfolio score or shortlisting score, and `CasperImportResult` has no attended or absent counts. Both are in the BRD panels. | US-4.2.1, US-4.5.1 | These fields are not shown. |
| PQ-32 | No API field returns the configured appeal window. | US-4.3.1 | The BRD default of 48 hours is shown, labelled as configured on the server. |
| PQ-33 | The supervisor dashboard has no insight filter, only `queue`. | US-2.1.3 | A request-type select is used instead of clickable insight tiles. |
| PQ-34 | A decided reinstatement request returns the rejection `reasonCode` without a label. | US-2.5.1 | The code is shown as received. |
| PQ-11 | `correctionDeadline` is a required body field on return-for-correction, yet the BRD says the grace period is configured. Does the officer choose a date, or does the client send the configured one, and from where? | US-2.3.3 | Show a date field that defaults to the BRD period (configurable, see OQ-C8). Ask before treating it as fixed. |
| PQ-12 | There is no operation to read the open cycle (OQ-24), yet CASPER import needs `cycleId` and every dashboard filter uses it. | US-4.2.1, all filters | The mock serves a cycle list. Against the real API, filters omit `cycleId` (the server default) and CASPER upload is disabled. |
| PQ-13 | `PaymentRecord` includes candidate name and email. OQ-03 lists a finance view without them, while the BRD (US-1.3.13) shows both columns. | US-1.3.13 | Show what the API returns (BRD columns). |
| PQ-14 | Finance list has no sort allow-list (default `-paymentDate` only). | US-1.3.13 | No sortable columns; default order only. |

## Role and business rules (owner: business / product)

| Id | Question | Affects | Conservative behaviour until answered |
|---|---|---|---|
| PQ-06 | **Resolved 2026-11-13 (owner): build `/admin`.** It covers staff users and integration clients from the contract's Administration operations. | ADMINISTRATOR | `/admin` area. Placeholder pages ship in Phase 2, screens in Phase 5. |
| PQ-23 | **Owner, 2026-11-13:** the role switch is temporary. Each user will have one role once IDAM integration lands. Confirm the target date, and whether the server-side `activeRole` and `PUT /auth/active-role` stay in the contract after that. | all staff | The switch shows only for 2+ roles, so it disappears without code changes. Deletion steps are in 00-architecture.md §3. |
| PQ-24 | **Resolved 2026-11-13 (owner): the role is held at application level.** Cross-tab sync of the active role is not required. | testing | The mock's per-tab behaviour is accepted. The re-read of the session on tab focus stays as a harmless safety check and can be removed together with the switch. |
| PQ-07 | The site-monitoring endpoints allow ADMISSION_SUPERVISOR as well as CENTRAL_MONITOR. Should the supervisor see `/monitoring` in their navigation? | US-2.1.4 | Yes, following the contract: a "Site monitoring" link in the supervisor navigation. |
| PQ-08 | `replacePortfolioEvidence` allows ADMISSION_SUPERVISOR (US-3.2.3), but the supervisor can't read the portfolio (`getPortfolioForSeniorReferee` is SENIOR_REFEREE only), and STP-2.1 says admission staff never see the portfolio. Where does the supervisor start this action? | US-3.2.3 | Senior Referee only in the UI. The supervisor gets no entry point. |
| PQ-09 | The BRD role table says BRO-02 Admission Officer "announces results", but EPIC-04 and the contract give announcing only to the Supervisor. | EPIC-04 | Supervisor only, following the contract. |
| PQ-10 | Officers never see training sites (STP-2.1). Can the Supervisor and Central Monitor see them in the read-only application view? | US-2.1.4, 2.3.1 | Shown only when the API returns them. The UI never derives them. |
| PQ-15 | The referee retrieval cap: STP-3.2 blocks retrieving more until the batch is complete, while US-3.2.1 only states a cap of 10. | US-3.2.1 | The client doesn't enforce the cap. The Retrieve button is always offered and the API's 409/422 is shown. |
| PQ-16 | The discrepancy rule: US-3.3.4 AC8 compares totals only, while the business rules also compare decisions. | US-3.3.4 | Display only. The server decides and the UI shows `discrepancy` as returned. |
| PQ-17 | The reassign pop-up is titled "Reassign / Return", but no acceptance criterion describes "return to pool". The contract's `BulkReassignmentRequest` supports both. | US-2.2.3 | Offer both actions, since the contract allows them, with Reassign selected by default. |
| PQ-18 | US-3.2.2 says Reassign and Override are "hidden when not needed" without defining it. | US-3.2.2 | Reassign is shown when the portfolio is in a referee's inbox. Override is shown when the round is Complete. |
| PQ-19 | Reinstatement approve note and reject reason/note have no data dictionary (type, required, length). OQ-04 asks whether the reason is a list or free text. | US-2.5.2 | Free text, required for rejection, optional for approval, max 500 characters (contract limits apply if stricter). |
| PQ-20 | No resolve action exists for duplicate accounts (list only). | US-1.1.1 report | Read-only report page. |
| PQ-21 | Status name variants in the BRD ("Screen Out Pending Approval" vs "Pending Screen Out Approval", "Review Complete" vs "Review Completed"). | labels | Labels are built from the contract enums, with one English label each. |
| PQ-22 | The Senior Referee "Re-scoring Appealed Questions" tile note mentions Round 3 but counts Round 4. | US-3.1.3 | Use the contract field. |

## Assumptions

- **A-M01:** staff UI copy is written from the BRD. There are no Figma frames for staff screens, so the layouts need UX sign-off (as in candidate report 03).
- **A-M02:** the referee due date is "2 working days". The client shows `dueAt` from the API and never computes it.
- **A-M03:** officer inbox overdue highlighting uses the API's `overdue` flag.
- **A-M04:** note templates, screen-out reasons, rejection reasons and classifications come from `listLookupValues`. The lookup type codes must be confirmed; the mock uses the BRD sample lists.
- **A-M05:** the role labels shown in the role bar are the BRD role names, in English and Arabic.
