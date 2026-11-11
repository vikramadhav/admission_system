# XXL — Decomposition and Scope Decisions

An XXL item is not ready to be assigned as a single developer story. Use this folder for outcomes requiring multiple release increments, unresolved policy, or significant cross-team integration. Keep implementation work in the S/M/L folders after each slice has an owner, testable acceptance criteria, and agreed contracts.

## Scope boundary requiring a decision: MBBS vs GME

The supplied BRD is **GME Release 5**. It contains Certificate, Internship, Residency, and Fellowship admission stories. It states that MBRU undergraduate requirements are in a separate BRS. The BRD mentions MBBS MD students/alumni as candidate categories for some GME programs, but that does not define undergraduate MBBS admission.

Before creating MBBS-specific implementation stories, the business owner must confirm:

1. Is the target GME admission, undergraduate MBBS admission, or a unified experience covering both?
2. If undergraduate MBBS is in scope, where is its approved BRD and which authority owns its criteria and decisions?
3. Which program, cycle, eligibility, academic credential, interview, ranking, offer, and enrollment rules apply to that track?

Do not treat GME eligibility, scoring, or portfolio rules as MBBS rules.

## Interview workflow — not specified in this BRD

The background describes an existing GME specialty interview process, but the Release 5 scope ends after initial score announcement, bulk screen-out, or score reannouncement. The BRD explicitly defers shortlisting, interview invitation, and subsequent offering stage to Release 6. No interview user stories or acceptance criteria are provided.

Create no code-ready interview story until the admissions owner approves the process. The following are discovery prompts, not requirements:

- Who is eligible to invite, shortlist, schedule, reschedule, withdraw, and record interview outcomes?
- How are candidate booking windows, time zones, accessibility/accommodation, conflicts, cancellations, and no-shows handled?
- What are panel composition, role permissions, identity masking, rubric versioning, score aggregation, conflicts of interest, and audit rules?
- Are interviews virtual, in-person, or both; are meeting links or external scheduling services involved?
- What are decision authority, tie-breaks, appeals, candidate notifications, retention, and reporting requirements?
- Is automated ranking allowed, and what human oversight and fairness controls apply?

Once approved, split the interview epic into releasable slices, for example: configure interview slots/panels; invite eligible candidates; candidate booking/rescheduling; interviewer rubric and independent score submission; panel review and human decision; candidate notification and audit/reporting. Confirm dependencies and data sharing before parallel implementation.

## Cross-cutting XXL themes — split before delivery

These are release themes, not assignments:

1. **Candidate application journey:** configuration, eligibility, draft form, conditional evidence, payment, submission, and candidate-visible lifecycle. Use US-1.3.1, US-1.3.2, US-1.3.3–US-1.3.11, and US-1.3.12 as separately owned slices.
2. **Verification workflow:** pool assignment, review, correction, clarification, screen-out approval, and reinstatement. Use US-2.2.1, US-2.3.1–US-2.3.6, US-2.4.1–US-2.4.5, and US-2.5.1–US-2.5.3 as separately testable transitions.
3. **Portfolio scoring and appeal:** anonymized assignment, independent rounds, discrepancy resolution, final score, and appeal rescore. Use US-3.2.1–US-3.3.4 and US-1.2.7 as discrete increments; US-3.3.4 must be split further if the round/discrepancy/appeal state machine cannot be completed and tested in one increment.
4. **Screening and announcements:** CASPER import, supervisor screening, initial publication, candidate visibility, bulk screen-out, and reannouncement. Use US-4.1.1–US-4.5.1 as discrete increments.

## Source decisions to resolve before coding

- Confirm working-day calculation, holidays, retrieval caps, and due-date behavior. BRD text contains different referee due-date values (2 days in dashboard data dictionary vs 5 working days in retrieval rules).
- Approve exact GPA and entrance-exam conversions, weights, limits, and effective dates. Do not infer formulas where the appendix is incomplete or ambiguous.
- Confirm final preference/site rules and capacity data; the appendix says specialty-per-site capacity is TBC.
- Confirm status transition ownership, candidate-visible status mapping, restart/reinstatement semantics, and notifications for all exceptional paths.
- Confirm document storage, file limits/types, naming, retention, evidence versioning, and failure/reconciliation behavior.
- Confirm payment idempotency, gateway timeout reconciliation, and fee configuration; do not assume a payment timeout means either success or failure.
- Confirm privacy/security, audit, retention, accessibility, and applicable regulatory obligations with the institution's accountable stakeholders. The BRD's classification is confidential; use synthetic records in code, test data, and LLM prompts.

