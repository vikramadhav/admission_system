# Large Stories

These items are still intended to deliver usable increments. Break them into smaller child stories if the work cannot be completed, reviewed, and safely released without a long-lived branch. Prefer feature flags and backward-compatible data changes where appropriate.

## Candidate application submission

### US-1.3.2 — Complete application information (L)
**Outcome:** A candidate completes the program-specific application details and required supporting files.
**Acceptance**
- Show application identifiers, selected program/preferences, candidate-status-specific fields, sponsor questions, and terms/consent from approved configuration.
- Require the applicable acceptance before continuing; conditionally show/require/hide questions and evidence by approved program/candidate rules.
- Generate one personal-statement upload slot per selected specialty/site combination; reconcile slots when preferences/sites change without silently losing evidence.
- Support multi-tab navigation without forcing sequential completion; validate required fields when the candidate attempts a gated action.
- Enforce file type/size limits, safe preview/delete, storage failure reporting, and access controls.

**Dependencies:** US-1.3.1; approved forms, terms, document rules, and candidate eligibility matrix.
**Source:** BRD US-1.3.2 and application-information rules.

### US-1.3.10 — Submit a one-time portfolio (L)
**Outcome:** A candidate provides program-specific portfolio answers and evidence for referee scoring.
**Acceptance**
- Display only the configured question set and point guidance for the selected program.
- If Yes, collect required details/evidence; if No, do not require those details.
- Validate every applicable answer and attachment before submission.
- Show an irreversible-submission confirmation with a question/answer/evidence summary.
- After submission, make the portfolio immutable even if other application sections are returned for correction; retain submission evidence and timestamp.

**Dependencies:** Program-specific approved rubric/question bank; document service; application draft.
**Source:** BRD US-1.3.10 and Appendix 3.14-3.15.

### US-1.3.12 — Pay and submit an application (L)
**Outcome:** A candidate submits a complete application after successful payment.
**Acceptance**
- Show summary and configured AED fee; validate the full application and identify missing fields before payment.
- Require candidate confirmation and process payment through the approved gateway.
- On confirmed payment, persist receipt/payment independently from application state, submit once, set submission timestamp/status, initialize verification and portfolio states, notify candidate, and lock submitted fields.
- On declined, cancelled, timeout, or ambiguous gateway response, retain a safe draft state and provide a reconciliation/retry path without duplicate charges or submissions.
- Store submitted attachments in the approved repository using the required naming convention; report storage errors and avoid success-shaped responses if persistence fails.

**Dependencies:** Completed form; payment gateway; FileNet/document storage; idempotency and reconciliation contract.
**Source:** BRD US-1.3.12.

## Admission operations

### US-2.1.3 — View supervisor dashboard (L)
**Outcome:** An admission supervisor monitors the GME intake pipeline and can open authorized operational views.
**Acceptance**
- Show configured cycle/program/pool metrics and supervisor-only actions.
- Drill down to appropriate application lists and status counts without overstating or double-counting multi-site applications.
- Enforce role/scope on dashboard data and every drill-down API.
- Surface data freshness and empty/error states; do not hide failed data loads as zero counts.

**Dependencies:** Application lifecycle and role model; approved dashboard definitions.
**Source:** BRD US-2.1.3.

### US-2.2.1 — Retrieve applications from a pool (L)
**Outcome:** An officer receives a fair, bounded workload from their authorized pool.
**Acceptance**
- Route submitted cases to program + first-specialty pools.
- Retrieve eligible work in the approved oldest-to-newest/randomized approach, enforce configurable cap (BRD default 10), and prevent the prior officer retrieving a returned case.
- Record assignment, retrieval time, due date, status, and verification state atomically.
- Return genuinely overdue untouched work to the pool using working days; do not requeue items where an action is pending.
- Notify officers at configured pool backlog threshold; show clear empty/cap states.

**Dependencies:** Pool/role configuration; working-day calendar; US-1.3.12.
**Source:** BRD US-2.2.1.

### US-2.4.3 — Approve or reject a screen-out recommendation (L)
**Outcome:** A supervisor makes the authorized final decision on an officer's recommendation.
**Acceptance**
- Show officer reason, note, and case context.
- On endorsement, allow reason correction if policy permits, make screen-out final, update application/verification/announcement states consistently, and notify candidate.
- On rejection, require feedback, set re-evaluating state, return to the same officer, and notify them.
- Audit both outcomes, actors, reason/note, timestamp, and status changes.
- Protect against duplicate decision submissions and concurrent state changes.

**Dependencies:** US-2.4.1; status transition service; approved reason and candidate communication.
**Source:** BRD US-2.4.3.

## Referee workflow

### US-3.1.3 — View senior referee dashboard (L)
**Outcome:** A senior referee oversees scoped scoring pools and workload without taking over admissions decisions.
**Acceptance**
- Show pool and referee-workload insights filterable by cycle/program/specialty within authorized scope.
- Show portfolio round status, discrepancy summary, and permitted referee assignment information.
- Preserve candidate anonymization and audit privileged access.
- Do not expose score announcement actions; these belong to admission supervisors.

**Dependencies:** Portfolio states and assignment model; role scope.
**Source:** BRD US-3.1.3.

### US-3.2.1 — Retrieve portfolios for scoring (L)
**Outcome:** A referee receives eligible anonymized portfolios for the appropriate round.
**Acceptance**
- Retrieve only from assigned role/pool and only when portfolio state/round is eligible.
- Enforce per-referee workload and due-date configuration; record assignment and status.
- Ensure two first-round referees are distinct and never receive the candidate identity.
- Exclude COI-returned referee/portfolio pairs; support Third Referee and second-evaluation pools with their own eligibility rules.
- Requeued/overdue work does not return to the same ineligible reviewer; audit every assignment.

**Dependencies:** Role/pool configuration; anonymized portfolio; US-3.3.2 COI.
**Source:** BRD US-3.2.1.

### US-3.2.2 — Reassign or override portfolio assignments (L)
**Outcome:** A senior referee resolves assignment exceptions while preserving reviewer independence.
**Acceptance**
- List eligible assignments and expose only permitted reassign/override actions.
- Validate target referee role, scope, workload, and COI exclusions.
- Require reason for override/reassignment; preserve previous assignment and scoring history.
- Notify affected referee(s), update due dates/status by approved policy, and audit the action.

**Dependencies:** US-3.2.1; senior referee role and assignment policy.
**Source:** BRD US-3.2.2.

### US-3.3.3 — Score assigned portfolio questions (L)
**Outcome:** An assigned referee independently records rubric-based scores for a portfolio round.
**Acceptance**
- Show only the assigned round's approved questions, rubric, evidence, and anonymized application key.
- Validate question-specific score choices and required rejection reasons/comments.
- Do not show first/second round scores to the Third Referee; second evaluator sees only appealed questions.
- Save progress safely and prevent unauthorized edits or scoring of another referee's assignment.
- Record rubric version and scoring actor/time.

**Dependencies:** US-3.3.1; approved versioned rubric and reason catalog.
**Source:** BRD US-3.3.3 and Appendix portfolio rules.

### US-3.3.4 — Submit a portfolio scoring round (L; split before implementation if needed)
**Outcome:** Submission completes one scoring round and drives the portfolio to its correct next state.
**Acceptance**
- Block submission if required questions are unscored and identify them.
- On confirmation, persist a round total and immutable submitted result.
- Complete Round 1/2 independently; after both are complete compare both total points and question-level results.
- If discrepant, record affected question-level differences and route to Third Referee; if agreed, complete portfolio using agreed result.
- A Third Referee score becomes final when invoked. An eligible appeal's second-evaluation score replaces the prior final score.
- Recompute weighted score using approved program weight; keep portfolio status separate from round statuses.
- Mark application Review Completed only when both portfolio and verification are complete; put scoring on hold for withdrawn/screened-out cases as specified.
- Make processing idempotent and audit each transition and prior score.

**Dependencies:** US-3.3.3; approved rubric, discrepancy logic, appeal policy, weights, and application state model.
**Source:** BRD US-3.3.4.

## Screening and announcements

### US-4.1.1 — Monitor screening dashboard (L)
**Outcome:** An authorized supervisor can inspect completed applications and their score-announcement readiness.
**Acceptance**
- Include only authorized records and the configured verification/portfolio/attendance/status measures.
- Filter, sort, search, and drill down without leaking candidate data beyond role scope.
- Order by shortlisting score descending without assigning a formal rank.
- Clearly distinguish ready, announced, appeal, and reannouncement states; do not expose scores before authorization/announcement.

**Dependencies:** Verification/portfolio completion; approved shortlisting formula and announcement state.
**Source:** BRD US-4.1.1.

### US-4.2.1 — Upload and process CASPER results (L)
**Outcome:** A supervisor imports CASPER results and associates them with eligible applications.
**Acceptance**
- Accept only the approved file structure and authorized uploader.
- Validate schema, cycle, candidate/application matching, duplicates, missing/invalid values, and rejected rows before applying.
- Show a preview and require confirmation; process atomically or report row-level partial outcomes according to an approved policy.
- Preserve original file, import summary, and audit history; do not overwrite a newer result without explicit resolution.

**Dependencies:** Approved CASPER format/matching rules; screening dashboard.
**Source:** BRD US-4.2.1.

### US-4.3.1 — Announce initial scores (L)
**Outcome:** A supervisor publishes eligible initial scores and starts the candidate appeal window.
**Acceptance**
- Validate selected applications are eligible and show ready/blocked counts with reasons before confirmation.
- Publish current final portfolio and shortlisting results only after authorized confirmation.
- Record announcement type, actor, date/time, affected applications, and appeal deadline.
- Notify affected candidates through configured channels; retries must not duplicate state transitions or notifications.
- Verification screen-outs follow their separately defined announcement path; this action must not accidentally include them.

**Dependencies:** US-4.1.1; approved weights, templates, score visibility, and appeal duration.
**Source:** BRD US-4.3.1.

### US-4.5.1 — Reannounce scores after appeal (L)
**Outcome:** A supervisor publishes updated final scores after second evaluation.
**Acceptance**
- Only Ready for Reannouncement applications are eligible.
- Replace current final portfolio score with second-evaluation result even when unchanged; recompute shortlisting score.
- Validate and confirm selected records; block non-ready rows with reasons.
- Record prior and new values internally, announce latest candidate-visible results, send notifications, close further appeal, and audit action.
- Handle repeated submissions safely.

**Dependencies:** US-3.3.4 appeal round; US-4.1.1; approved score/notification rules.
**Source:** BRD US-4.5.1.

