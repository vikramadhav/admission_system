# Medium Stories

These are bounded workflow slices. Confirm policies, state transitions, and interface contracts before implementation; avoid combining adjacent stories just because they touch the same application.

## Candidate lifecycle and form

### US-1.2.3 — Manage a draft application (M)
**Outcome:** A candidate can safely continue or discard a draft.
**Acceptance:** List the candidate's drafts; allow continuation; allow discard only after confirmation; never delete or affect another candidate's application; follow the agreed archival/audit policy.
**Depends on:** US-1.2.1; draft state model. **Source:** BRD US-1.2.3.

### US-1.2.4 — Withdraw an application (M)
**Outcome:** A candidate can withdraw the whole application with explicit confirmation.
**Acceptance:** Offer only when allowed by cycle/status; require OTP confirmation to registered contact channels; collect reason if configured; update application and dependent workstream states atomically; notify candidate and responsible staff; record audit history; handle expired/invalid OTP and retry safely.
**Depends on:** Candidate dashboard; OTP service; approved withdrawal transitions. **Source:** BRD US-1.2.4.

### US-1.2.5 — Request reinstatement (M)
**Outcome:** A candidate can request review of a withdrawn application.
**Acceptance:** Show action only when timeline/status permits; collect justification; block request when another active application exists in the same cycle; acknowledge request without restoring the application before supervisor approval.
**Depends on:** US-1.2.4; cycle rules. **Source:** BRD US-1.2.5.

### US-1.2.6 — Edit application preferences (M)
**Outcome:** A candidate can adjust eligible preferences before the configured submission deadline.
**Acceptance:** Enforce deadline and status; show only valid configured specialties/sites; enforce distinct preference and site rules; confirm changes and update the application consistently; preserve history and notify staff if required.
**Depends on:** US-1.3.1; configured program/site matrix. **Source:** BRD US-1.2.6.

### US-1.2.7 — Appeal an announced portfolio outcome (M)
**Outcome:** A candidate can lodge one eligible appeal during the configured appeal window.
**Acceptance:** Show the appeal action only after the applicable announcement and while the window is open; enforce one appeal; capture the required reason/question selection; acknowledge receipt and route only eligible portfolio questions for second evaluation; reject late/duplicate submissions clearly.
**Depends on:** Portfolio completion and score announcement; approved appeal policy. **Source:** BRD US-1.2.7.

### US-1.2.8 — Exclude a selected training site (M)
**Outcome:** A candidate can withdraw from a site without changing specialties or preference order.
**Acceptance:** Require a reason; allow only existing selected sites; prevent removal of the final site under any specialty; do not allow adding/replacing/reordering; keep application status unchanged and notify the admission team.
**Depends on:** US-1.3.1; configured site selections. **Source:** BRD US-1.2.8.

### US-1.3.1 — Select program, specialties, and sites (M)
**Outcome:** A candidate creates a draft for an eligible program with valid preferences.
**Acceptance:** List only active configured programs/specialties/sites; apply program-specific preference counts; require at least one site per selected specialty; prevent duplicate specialty/site selections; permit site ordering where allowed; create the application and open the correct form only after valid selection.
**Depends on:** Cycle/program/specialty/site configuration; candidate eligibility matrix. **Source:** BRD US-1.3.1.

### US-1.3.3 — Enter personal information (M)
**Outcome:** A candidate completes personal details used by the application.
**Acceptance:** Prefill applicable ICP fields when available; mark protected/prepopulated fields read-only; allow exception correction only under the approved process; validate conditional fields and attachments; persist draft changes; do not expose identity data to referee views.
**Depends on:** ICP/IDAM contract; form and document services. **Source:** BRD US-1.3.3.

### US-1.3.4 — Enter academic qualifications and GPA (M)
**Outcome:** A candidate submits qualifying education data and receives a computed GPA result/score.
**Acceptance:** Filter universities by country and degrees by program; support “Other” university; enforce UAE vs non-UAE GPA fields; require ECE GPA/evidence where applicable; calculate only using approved, versioned conversion and weighting rules; show the result read-only; validate range and required transcript/certificate evidence.
**Depends on:** US-1.3.1; approved GPA rubric and program weights. **Source:** BRD US-1.3.4.

### US-1.3.6 — Enter internship history (M)
**Outcome:** Eligible Residency/Fellowship applicants provide required internship information.
**Acceptance:** Hide/skip for Internship and Pharmacy Residency where specified; require for applicable Medical/Dental Residency and Fellowship; validate organization, dates, status, and conditional documents against approved rules.
**Depends on:** Program selection; organization list and eligibility policy. **Source:** BRD US-1.3.6.

### US-1.3.7 — Enter residency history for Fellowship (M)
**Outcome:** Fellowship applicants provide prior residency and specialty evidence.
**Acceptance:** Show only for Fellowship; collect required residency/program/specialty details and evidence; validate prerequisite specialty against configured fellowship requirements; hide for other programs.
**Depends on:** US-1.3.1; approved fellowship prerequisite matrix. **Source:** BRD US-1.3.7.

### US-1.3.8 — Enter board and license information (M)
**Outcome:** Fellowship applicants record applicable board/license exams and evidence.
**Acceptance:** Show only for Fellowship; validate exam-specific details, date, and attempt number (maximum four per BRD); require applicable license/board documents; keep submitted values read-only where required.
**Depends on:** Approved exam/board catalog and file rules. **Source:** BRD US-1.3.8.

### US-1.3.9 — Enter residency entrance-exam results (M)
**Outcome:** Residency candidates record the correct entrance exam and see the applicable computed score.
**Acceptance:** Show only for Residency; filter exam types by specialty category; validate attempt/date/score fields for the exam; compute the score only from approved versioned conversion/weight rules; require result evidence.
**Depends on:** US-1.3.1; approved exam conversion and weights. **Source:** BRD US-1.3.9.

### US-1.3.11 — Save and resume an application draft (M)
**Outcome:** A candidate can save incomplete work and return before the deadline.
**Acceptance:** Save from any tab without completeness validation; confirm explicit save; auto-save at configured intervals with visible failure recovery; send configured reminders; archive after deadline and notify; prevent duplicate active drafts for the same program/cycle.
**Depends on:** Draft persistence; notification scheduler; cycle deadline configuration. **Source:** BRD US-1.3.11.

## Admission operations

### US-2.1.2 — View admission officer dashboard (M)
**Outcome:** An officer sees their authorized pools, inbox, and workload.
**Acceptance:** Show assigned pools and current queue counts; list only applications assigned to the officer; support approved filters/sort/search; respect status and access restrictions; show a useful empty state.
**Depends on:** Role provisioning; application assignment model. **Source:** BRD US-2.1.2.

### US-2.2.2 — Monitor officer workload (M)
**Outcome:** A supervisor can inspect staff workload and overdue cases.
**Acceptance:** Show queue summaries and application list by officer; support officer/submission-date search; display retrieval and due dates; calculate overdue from approved working-day calendar and status; refresh from current data.
**Depends on:** US-2.2.1; holiday/calendar configuration. **Source:** BRD US-2.2.2.

### US-2.2.3 — Reassign an application (M)
**Outcome:** A supervisor can transfer an eligible case to another officer in the same pool.
**Acceptance:** Restrict eligible statuses; target only officers assigned to the same program/first-specialty pool; require justification (max 200 characters); update assignment and due-date behavior per policy; notify new owner and audit old/new assignment.
**Depends on:** US-2.2.1; officer pool configuration. **Source:** BRD US-2.2.3.

### US-2.3.1 — View application for verification (M)
**Outcome:** An assigned officer can inspect application data and evidence needed for verification.
**Acceptance:** Enforce assignment and role; present application and attachments read-only except explicitly permitted attachment replacement; hide the candidate portfolio; show computed GPA/exam outputs; audit access where policy requires.
**Depends on:** US-2.2.1; document repository; scoring inputs. **Source:** BRD US-2.3.1.

### US-2.3.2 — Flag items and provide correction notes (M)
**Outcome:** An officer can identify specific application items that need candidate correction.
**Acceptance:** Flag a field, attachment, section, or subsection; select/edit an approved candidate-facing note; require at least one flag before return; distinguish external note from internal audit note; preserve prior notes and flag history.
**Depends on:** US-2.3.1; approved note catalog. **Source:** BRD US-2.3.2.

### US-2.3.3 — Return an application for correction (M)
**Outcome:** An officer sends flagged items back for candidate action.
**Acceptance:** Require flagged items; update application and verification states; expose only flagged editable fields to the candidate; send configured message/deadline; keep assignment context so the resubmission returns to the same officer; audit transition.
**Depends on:** US-2.3.2; notification/deadline configuration. **Source:** BRD US-2.3.3.

### US-2.3.4 — Correct and resubmit a returned application (M)
**Outcome:** A candidate can correct only the items returned by the officer.
**Acceptance:** Display the officer's candidate-facing notes; permit editing/replacement only for flagged items; validate the correction set; keep portfolio content immutable; resubmit to the same officer and notify them; retain previous values for audit.
**Depends on:** US-2.3.3. **Source:** BRD US-2.3.4.

### US-2.3.5 — Complete application verification (M)
**Outcome:** An officer records successful completion of the verification workstream.
**Acceptance:** Allow only the assigned officer and valid in-progress state; confirm required checks are complete; set Verification Status to Complete; do not mark the overall application Review Completed until portfolio scoring is also complete; record actor/time.
**Depends on:** US-2.3.1; portfolio state model. **Source:** BRD US-2.3.5.

### US-2.4.1 — Recommend screen-out (M)
**Outcome:** An officer submits a screen-out recommendation for supervisor decision.
**Acceptance:** Require configured reason; capture note and evidence/context; set Screen Out Pending Approval; move to supervisor queue and notify; remove from officer active queue until supervisor response; do not make the decision final at this stage.
**Depends on:** US-2.3.1; approved reason list. **Source:** BRD US-2.4.1.

### US-2.4.2 — Escalate an application for clarification (M)
**Outcome:** An officer requests supervisor guidance on an ambiguous case.
**Acceptance:** Require a note; route to supervisor clarification queue; update status and notify; temporarily remove from officer action queue; preserve the question/response audit trail; supervisor guidance is not itself a final verification decision.
**Depends on:** US-2.3.1; supervisor clarification queue. **Source:** BRD US-2.4.2.

### US-2.4.4 — Return supervisor guidance to officer (M)
**Outcome:** A supervisor gives guidance on an escalated application and returns it to its officer.
**Acceptance:** Display officer's question; require guidance note; set Clarification Submitted; return to same officer; notify and retain both notes in audit history.
**Depends on:** US-2.4.2. **Source:** BRD US-2.4.4.

### US-2.4.5 — Re-evaluate after screen-out rejection (M)
**Outcome:** An officer resumes review after the supervisor rejects a screen-out recommendation.
**Acceptance:** Display supervisor's mandatory rejection feedback; re-enable only the standard verification actions; ensure action is recorded against the correct assignment and current state.
**Depends on:** US-2.4.3. **Source:** BRD US-2.4.5.

### US-2.5.1 — View reinstatement requests (M)
**Outcome:** A supervisor can review candidate reinstatement requests in a separate queue.
**Acceptance:** Supervisor-only access; show request, withdrawal reason, justification, and prior application; filter by cycle/status; do not expose requests in officer pools.
**Depends on:** US-1.2.5; supervisor role. **Source:** BRD US-2.5.1.

### US-2.5.2 — Decide a reinstatement request (M)
**Outcome:** A supervisor approves or rejects reinstatement with a recorded decision.
**Acceptance:** Enforce cycle timeline and no-other-active-application rule; require decision and reason/notes as specified; on approval restore the exact pre-withdrawal state; on rejection retain terminal withdrawn outcome; notify candidate and audit.
**Depends on:** US-2.5.1; approved timeline and state restoration rules. **Source:** BRD US-2.5.2.

### US-2.5.3 — Refresh candidate information from ICP (M)
**Outcome:** An authorized supervisor can refresh ICP information for an eligible candidate exception.
**Acceptance:** Permit refresh for an expiry or details-change request, not only reinstatement; show retrieved values and handle unavailable/partial response; require explicit confirmation before applying changes; retain old/new values and source/time in audit.
**Depends on:** ICP integration; approved field-overwrite and consent rules. **Source:** BRD US-2.5.3.

## Portfolio operations

### US-3.1.2 — View referee dashboard (M)
**Outcome:** A referee sees their own assigned portfolio work and the eligible pool count.
**Acceptance:** Filter by authorized pool/cycle; distinguish pool count from personal pending actions; list only referee-owned items ordered by due date; support approved search/filter/sort; never show candidate identity.
**Depends on:** US-3.1.1; anonymized portfolio record. **Source:** BRD US-3.1.2.

### US-3.2.3 — Replace portfolio evidence (M)
**Outcome:** An authorized senior referee can replace evidence under the controlled exception process.
**Acceptance:** Require appropriate role and reason; preserve previous evidence and version; validate file constraints; show failure if storage fails; audit user, time, reason, and changed evidence.
**Depends on:** Document repository; senior-referee scope. **Source:** BRD US-3.2.3.

### US-3.3.1 — View anonymized portfolio details (M)
**Outcome:** A referee can review the assigned portfolio without learning candidate identity.
**Acceptance:** Display only permitted portfolio answers/evidence and application key; prevent identity leakage in page data, exports, URLs, errors, and notifications; enforce assigned round/referee access.
**Depends on:** Portfolio assignment; privacy review. **Source:** BRD US-3.3.1.

### US-3.3.2 — Return portfolio for conflict of interest (M)
**Outcome:** A referee can declare a conflict and return the portfolio.
**Acceptance:** Require a COI declaration/reason per approved policy; remove portfolio from that referee's queue; exclude that referee from future assignment to the same portfolio; route to eligible pool and notify responsible staff; audit the event.
**Depends on:** US-3.2.1; conflict-of-interest policy. **Source:** BRD US-3.3.2.

## Screening and candidate-visible results

### US-4.3.2 — View announced review completion and scores (M)
**Outcome:** A candidate sees only results that have been officially announced.
**Acceptance:** Hide scores before announcement; display current final portfolio and shortlisting results after announcement; show appeal action/deadline only when eligible; after reannouncement replace candidate-visible values with the current final values.
**Depends on:** US-4.3.1; approved score visibility rules. **Source:** BRD US-4.3.2.

### US-4.4.1 — Screen out selected applications in bulk (M)
**Outcome:** A supervisor applies a common approved screen-out reason to a selected filtered group.
**Acceptance:** Support explicit selection and current-filter selection; require reason and confirmation; validate every record and report blocked items; set statuses and reason consistently; notify each affected candidate; prevent appeal opening for this action; ensure retries do not duplicate notifications or transitions.
**Depends on:** Screening dashboard; approved reason list and notification templates. **Source:** BRD US-4.4.1.

