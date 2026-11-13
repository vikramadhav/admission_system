# Small Stories

These are narrow candidate or staff outcomes. Implement them end to end, including role checks and tests. The estimates are initial T-shirt sizing only.

## US-1.1.1 — Register a candidate account (S)

**Outcome:** A new candidate can enter through Dubai Health IDAM/UAE Pass and receive a platform candidate record without creating a duplicate identity.

**Acceptance**
- Registration is delegated to IDAM; UAE Pass is reached through IDAM.
- On the return flow, the platform checks the IDAM identity attributes against existing candidate records.
- A duplicate is not silently linked or duplicated: show the agreed guidance and record the potential duplicate for authorized supervisor review.
- A unique candidate receives the BRD-required 9-digit candidate ID and can use it across cycles.
- Handle IDAM failure, cancellation, and retry without creating a partial/duplicate candidate.

**Dependencies:** IDAM integration contract; approved identity-match rules and candidate-ID allocation.
**Source:** BRD US-1.1.1.

## US-1.1.2 — Sign in as a candidate (S)

**Outcome:** An authenticated candidate reaches their own dashboard.

**Acceptance**
- IDAM-authenticated users are admitted; unauthenticated users are redirected to IDAM.
- A timed-out session requires re-authentication.
- Successful login lands on the candidate dashboard and does not expose another candidate's data.
- Sign-out ends the platform session.

**Dependencies:** US-1.1.1; IDAM session and identity contract.
**Source:** BRD US-1.1.2.

## US-1.2.1 — View candidate dashboard (S)

**Outcome:** A candidate can see their own current/history applications and the valid next action.

**Acceptance**
- Show an empty state and start action when there is no application.
- Show application identifiers, program, status, relevant dates, and permitted actions for existing applications.
- Disable starting another application when an active application exists or there is no open program/cycle; show the applicable opening information.
- Show no other candidate's information; logout is available.

**Dependencies:** Candidate identity; application/cycle configuration.
**Source:** BRD US-1.2.1.

## US-1.2.2 — View application details (S)

**Outcome:** A candidate can open an application and inspect details without changing its state.

**Acceptance**
- Display only applications belonging to the signed-in candidate.
- Submitted applications are read-only; drafts expose only actions permitted by their current status.
- Show the correct application information and attachments according to role and status.

**Dependencies:** US-1.2.1; application record and access-control rules.
**Source:** BRD US-1.2.2.

## US-1.3.5 — Record English proficiency (S)

**Outcome:** A candidate can record applicable English exam results and supporting evidence.

**Acceptance**
- Offer only configured exams and validate exam-specific fields and score ranges.
- Enforce required/optional behavior by program, nationality, and university-country rules in the approved configuration.
- Require the exam certificate when applicable; validate file type and configured size.
- Fellowship and exempt-candidate rules do not accidentally make optional data mandatory.

**Dependencies:** Application form shell; approved exemption matrix and exam thresholds.
**Source:** BRD US-1.3.5.

## US-1.3.13 — Reconcile application payments (S)

**Outcome:** A finance officer can search and export payment records without accessing application content.

**Acceptance**
- Restrict the screen and APIs to the finance role.
- Filter by cycle, program, application ID, and payment date range.
- Show read-only payment fields and the latest gateway payment status.
- Export the filtered result; opening a row does not reveal application details.
- Deny access to other application workflows even if a finance user knows an application URL.

**Dependencies:** Payment record and finance role; US-1.3.12 is the producer of submitted payments.
**Source:** BRD US-1.3.13.

## US-2.1.1 — Sign in as an admission officer (S)

**Outcome:** A provisioned admission officer reaches the correct role-specific workspace.

**Acceptance**
- Require authenticated identity and the admission-officer role.
- Deny access to users without that role.
- Handle session timeout through IDAM re-authentication.
- Route to the officer dashboard; provide a role switcher only when multiple roles are provisioned.

**Dependencies:** IDAM and role-provisioning contract.
**Source:** BRD US-2.1.1.

## US-2.1.4 — View central site-monitoring dashboard (S)

**Outcome:** An authorized central monitor can view aggregate application insights across sites.

**Acceptance**
- Only the central-monitor role can access the dashboard.
- Show the configured aggregate site/application measures and permit read-only drill-down only to the level approved by the business.
- Do not expose candidate details or actions unless explicitly authorized.

**Dependencies:** Site/program reference data; approved dashboard measures.
**Source:** BRD US-2.1.4.

## US-2.3.6 — Replace an application attachment during review (S)

**Outcome:** An admission officer can replace a document when the review rules allow it, without editing candidate-entered fields.

**Acceptance**
- Enforce officer authorization and attachment/document-type constraints.
- Keep the prior file/version available to authorized audit review; do not silently overwrite evidence.
- Validate file size/type, store it in the configured document repository, and show a clear failure if storage fails.
- Record who replaced the file and when.

**Dependencies:** Application detail access; document-storage integration and retention policy.
**Source:** BRD US-2.3.6.

## US-3.1.1 — Sign in as a referee (S)

**Outcome:** A provisioned referee reaches only the scoring workspace appropriate to their role.

**Acceptance**
- Require authenticated identity and a provisioned referee role; deny unassigned users.
- Support role-specific routing and role switching for users holding multiple approved roles.
- On timeout, re-authenticate; sign-out ends the session.

**Dependencies:** IDAM and referee role provisioning.
**Source:** BRD US-3.1.1.

