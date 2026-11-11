# End-to-End API and Data Contract Agreement

**Status:** Proposed team baseline for refinement and agreement  
**Source of truth:** [`openapi/openapi.yaml`](openapi/openapi.yaml) and its referenced modules  
**Requirements source:** [`Stories_Addmission_System_BRD.md`](../Stories_Addmission_System_BRD.md), GME Release 5  
**Audience:** Product owner, business analyst, architects, developers, QA, security/IDAM, integration, and operations teams

## 1. Agreement objective and scope

This file defines how the team agrees, implements, tests, and evolves reusable API and data contracts. The OpenAPI entry point maps every one of the BRD's 60 user stories to an operation or explicit external-system boundary. It is an API contract baseline, not a claim that every policy question in the BRD is resolved or that the endpoints are already implemented.

The supplied BRD is the **GME Release 5** scope. It includes candidate intake, verification, portfolio scoring, and initial/revised score announcements. It does not provide code-ready requirements for undergraduate MBBS, interviews, shortlisting/ranking, offers, or enrollment. Those remain out of contract pending approved requirements.

## 2. Developer agreement before implementation

For each story, the story owner and implementing developer review the operation and data schemas before coding. Work may start when:

1. The operation has an agreed method/path, request/response schema, HTTP status codes, and success/empty/error behavior.
2. The actor, active role, resource ownership, and server-side authorization rules are agreed.
3. The state transition, duplicate/retry behavior, audit event, and notification responsibility are agreed.
4. Required business rules and configuration are approved, or any unresolved decision is explicitly listed as a blocker.
5. QA can derive positive, empty, unauthorized, invalid, conflict, dependency-failure, and retry test cases from the contract.
6. The team has agreed whether the behavior belongs to this API, IDAM, payment gateway, ICP, FileNet, notification provider, or a scheduled/internal worker.

Contract changes are part of the story's focused PR. Reviewers check the OpenAPI contract and tests together. A developer must not create an undocumented private endpoint, payload, status transition, role bypass, or social-login path to keep moving. If the agreed contract cannot support a story, update the contract first with the accountable domain owner.

### Team ownership and merge-conflict rules

- One accountable owner per story and one named owner for each domain module.
- Domain ownership: candidate/application (`candidate-lifecycle.yaml` and `applications.yaml`), admissions (`admission-operations.yaml`), portfolio (`portfolio-scoring.yaml`), screening (`screening.yaml`), shared schemas (`components/schemas.yaml`), and root contract/shared errors (`openapi.yaml`, `components/responses.yaml`).
- Story owners may work in separate domain files concurrently once request/response schemas and shared transitions are agreed.
- Changes to shared schemas, roles, status enums, root references, payment callbacks, and migration-affecting data are coordinated by the contract coordinator; do not make competing edits to these files.
- Keep contract branches short. Prefer additive changes, run reference/schema validation, and merge focused PRs frequently. Do not copy entire shared schema definitions into domain modules.
- Generated clients/types are derived outputs. Do not manually edit generated code to diverge from OpenAPI.

## 3. Shared API rules

The detailed rules are in [`decisions.md`](decisions.md). Required invariants:

- OpenAPI 3.1, JSON, `/api/v1` paths, UUIDs in URLs and payloads (candidate and application numbers are display fields), and ISO 8601 timestamps with an offset, returned in UTC.
- Interactive login is Authorization Code + PKCE through approved IDAM/OIDC. UAE Pass and any permitted Google, Facebook, or Apple login are brokered by IDAM. The platform does not implement provider password collection or trust raw social-provider tokens.
- Opaque IDAM access tokens validated by introspection. Authorization uses the internal active role listed per operation (`x-dahc-roles`); middleware acting as itself needs an internal integration permission. A machine token is never a candidate or staff identity.
- Single-factor authentication is an IDAM policy decision, not an API authorization bypass. Staff assurance/MFA requirements must be approved by institutional security.
- `401` = absent/invalid authentication; `403` = authenticated but not permitted; `404` = absent or not visible to caller; `409` = state/idempotency conflict; `412` = stale `If-Match`; `422` = business validation; `429` = rate limit; `500/503` = server/dependency failure.
- Success responses use the `ApiResponse` envelope (`data`, plus `pagination` for lists). Errors are top-level RFC 7807 Problem documents with a dotted `code` and `traceId`; never return success-shaped data on failure.
- Empty collection = `200` with `data: []`, pagination and a `messageCode`. Resource missing/not visible = `404`. Documented create/update/actions use a typed success result; an empty collection is not `204`.
- Lists use `limit` (default 25, max 100), opaque cursor, allow-listed `sort`, stable server-side tie-breaker, and no caller-constructed cursor. Sorting/pagination are omitted only for singleton operations.
- Create/action retries use `Idempotency-Key`. Updates use `ETag`/`If-Match` where concurrent edits could lose data.
- Every operation checks authorization at the service boundary and records an audit event for sensitive reads/writes/actions as approved. Do not log applicant payloads, documents, credentials, or tokens.
- Candidate APIs scope by authenticated identity, never a caller-supplied candidate ID. Referee APIs remove identity server-side. Finance APIs expose payment data only.
- Synthetic data only in examples, tests, and LLM prompts.

## 4. End-to-end workflow contract

### 4.1 Candidate identity and application draft

1. Candidate authenticates/registers through IDAM; UAE Pass is reached through the IDAM federation. The platform does not own registration screens or primary credential/OTP verification.
2. The platform resolves the trusted identity to one candidate record and prevents duplicate candidate linkage. The candidate then reads their own profile and dashboard.
3. Candidate selects an open cycle/program, then active specialties and sites from the catalog.
4. `POST /api/v1/applications` creates a draft after server-side eligibility, duplicate-active-application, cycle, preference, and site validation.
5. Candidate reads and updates configured sections and portfolio content. Field visibility, editability, mandatory evidence, and score calculations follow versioned approved program configuration. Portfolio submission is one-time and immutable.
6. Draft saves are persisted with optimistic concurrency. Scheduled reminder/archive work is idempotent and produces auditable notification events.

### 4.2 Payment and submission

1. Candidate requests a payment session; the API calculates the configured fee, chooses the active provider through server-side routing policy, and returns provider-neutral hosted checkout information. The candidate cannot choose E-Pay or Network International.
2. The payment service binds the session to the selected provider and configuration version. Retries return that same session; a provider switch affects new sessions only.
3. The selected provider callback is verified and normalized by its adapter. The adapter sends a canonical `PaymentGatewayEvent` to the platform using its service identity; raw E-Pay or Network International payloads never enter the candidate/application API.
4. Unknown/timeout payment state remains `UNKNOWN`/pending reconciliation; it must not be converted to failure or success by guesswork. Do not fail over an uncertain attempt to another gateway until the original transaction is reconciled.
5. Candidate requests submission only after confirmed paid status and complete application validation.
6. The platform persists the submitted record, required document references, submitted timestamp, initial verification/portfolio status, audit event, and notification/outbox record as one reliable workflow. If a required durable step fails, do not report submitted.
7. Finance can query/export the allowed payment projection but cannot open application details.

Provider adapter boundaries, cutover behavior, and shared acceptance tests are specified in [`PAYMENT-GATEWAY-ADAPTER-AGREEMENT.md`](PAYMENT-GATEWAY-ADAPTER-AGREEMENT.md).

### 4.3 Parallel verification and portfolio scoring

After submission, verification and portfolio workstreams progress independently and converge only at overall review completion.

**Verification:** authorized officer retrieves an eligible pool case; assignment, due date, and state are updated atomically. Officer views non-portfolio application data, flags items, and may return for correction, complete verification, recommend screen-out, or escalate for clarification. Candidate correction is limited to flagged items and returns to the same officer. Supervisor decisions/guidance are separate, auditable transitions. Overdue requeue is a service job using the approved working-day calendar.

**Portfolio:** authenticated referee retrieves an anonymized portfolio eligible for their role/round. Referee may declare COI; assignments enforce reviewer separation and do not return a COI case to that referee. Referee saves and submits scores against a versioned rubric. The system compares the required rounds, records discrepancies, routes Third Referee or eligible appeal evaluation, and computes final weighted score using approved formulas. Senior referee can manage assignment exceptions and see permitted discrepancy details, but cannot announce scores.

When verification and portfolio status are both complete, the application reaches review-completed readiness. Neither workstream's completion alone is sufficient.

### 4.4 Screening, announcements, and appeal

1. Supervisor reads screening dashboard and may process CASPER import separately. CASPER attendance/results update their own fields and score calculations; per the BRD they do **not** gate initial score announcement.
2. Supervisor announces only selected records ready under verification and portfolio state rules. Announcement is a manual, idempotent action; it publishes approved final score fields, records timestamp/type, opens the configured appeal window, and queues candidate notifications.
3. Candidate score fields remain absent until announcement; candidate sees final values only, never individual referee-round scores.
4. An eligible candidate may appeal once within the approved window. Only eligible appealed questions go to second evaluation; no new candidate evidence is added during appeal.
5. Once reevaluation completes, the second-evaluation result replaces the final score even if unchanged. Supervisor reannounces, records prior/current result internally, closes further appeal, and notifies the candidate.
6. Bulk screen-out is a separate supervisor operation, requires a reason, does not open an appeal window, and reports per-record outcomes.

## 5. Story-to-operation coverage matrix

Paths are relative to the API host. `IDAM` means behavior is owned by the approved identity provider, not an application endpoint. Background jobs are service-only contracts and may be implemented by the platform scheduler/worker rather than exposed publicly.

| BRD story | Operation/data contract | Owner/boundary |
|---|---|---|
| US-1.1.1 Register account | IDAM registration; `POST /api/v1/auth/sign-in` provisions the candidate and runs the duplicate check (`409 account.duplicate`); supervisor report `GET /api/v1/staff/duplicate-accounts` | IDAM + Identity |
| US-1.1.2 Candidate login | IDAM/OIDC Authorization Code + PKCE; `POST /api/v1/auth/sign-in`, `GET /api/v1/auth/me` | IDAM + Identity |
| US-1.2.1 Candidate dashboard | `GET /api/v1/me/dashboard` (start-new state and allowed actions per application) | Candidate Lifecycle |
| US-1.2.2 View application | `GET /api/v1/applications`, `GET /api/v1/applications/{applicationId}` | Applications |
| US-1.2.3 Manage/discard draft | `GET /api/v1/applications`, `GET /api/v1/applications/{applicationId}`, `DELETE /api/v1/applications/{applicationId}/draft` | Candidate Lifecycle |
| US-1.2.4 Withdraw application | `POST /api/v1/applications/{applicationId}/withdrawal-requests`; `POST .../{requestId}/confirmation`; `POST .../{requestId}/otp-resend`; reasons: `GET /api/v1/lookups/WITHDRAWAL_REASON` | Candidate Lifecycle + OTP provider |
| US-1.2.5 Request reinstatement | `POST /api/v1/applications/{applicationId}/reinstatement-requests` | Candidate Lifecycle |
| US-1.2.6 Edit preferences | `PUT /api/v1/applications/{applicationId}/preferences` | Candidate Lifecycle + Catalog |
| US-1.2.7 Appeal decision | `POST /api/v1/applications/{applicationId}/appeals`; appeal view: `GET .../portfolio-result` | Candidate Lifecycle + Portfolio |
| US-1.2.8 Exclude training site | `POST /api/v1/applications/{applicationId}/site-exclusions` | Candidate Lifecycle |
| US-1.3.1 Select program/specialty/sites | `GET /api/v1/programs`, `GET /api/v1/programs/{programId}/specialties`, `GET /api/v1/specialties/{specialtyId}/sites`, `POST /api/v1/applications` | Catalog + Applications |
| US-1.3.2 Complete application info | `GET /api/v1/applications/{applicationId}/form-schema`; `GET/PUT /api/v1/applications/{applicationId}/sections/application-information`; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Versioned Form Schema + Application Sections + Documents (Rhapsody/FileNet) |
| US-1.3.3 Personal info | `GET /api/v1/applications/{applicationId}/form-schema`; `GET/PUT .../sections/personal-information`; contact OTP: `POST .../contact-verifications`, `POST .../contact-verifications/{verificationId}/confirmation`, `POST .../contact-verifications/{verificationId}/otp-resend`; ICP read boundary; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Versioned Form Schema + Application Sections + ICP + Documents (Rhapsody/FileNet) |
| US-1.3.4 University grades/GPA | `GET /api/v1/applications/{applicationId}/form-schema`; `GET/PUT .../sections/academic-information`; configured score calculation; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Versioned Form Schema + Application Sections + Documents (Rhapsody/FileNet) |
| US-1.3.5 English proficiency | `GET /api/v1/applications/{applicationId}/form-schema`; `GET/PUT .../sections/english-proficiency`; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Versioned Form Schema + Application Sections + Documents (Rhapsody/FileNet) |
| US-1.3.6 Internship info | `GET /api/v1/applications/{applicationId}/form-schema`; `GET/PUT .../sections/internship-information`; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Versioned Form Schema + Application Sections + Documents (Rhapsody/FileNet) |
| US-1.3.7 Residency info | `GET /api/v1/applications/{applicationId}/form-schema`; `GET/PUT .../sections/residency-information`; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Versioned Form Schema + Application Sections + Documents (Rhapsody/FileNet) |
| US-1.3.8 Board/license info | `GET /api/v1/applications/{applicationId}/form-schema`; `GET/PUT .../sections/board-license-information`; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Versioned Form Schema + Application Sections + Documents (Rhapsody/FileNet) |
| US-1.3.9 Residency entrance exam | `GET /api/v1/applications/{applicationId}/form-schema`; `GET/PUT .../sections/residency-entrance-exam`; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Versioned Form Schema + Application Sections + Documents (Rhapsody/FileNet) |
| US-1.3.10 Portfolio info | `GET /api/v1/applications/{applicationId}/portfolio`; `POST .../portfolio-submission`; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Candidate Lifecycle + Documents (Rhapsody/FileNet) |
| US-1.3.11 Save draft | `PATCH /api/v1/applications/{applicationId}`; draft reminders and archiving run as an in-process background job | Applications + Background jobs/Notifications |
| US-1.3.12 Pay/submit | `POST .../payment-sessions`; `GET .../payment-sessions/{paymentSessionId}`; payment callback; `POST .../submission` | Payments + Gateway + FileNet |
| US-1.3.13 Finance payments | `GET /api/v1/finance/payments`; `GET /api/v1/finance/payments/export` (Excel) | Finance |
| US-2.1.1 Officer login | IDAM/OIDC; `POST /api/v1/auth/sign-in`, `PUT /api/v1/auth/active-role` (role switcher); `GET /api/v1/staff/admission/dashboard` authorization | IDAM + Admission |
| US-2.1.2 Officer dashboard | `GET /api/v1/staff/admission/dashboard` | Admission |
| US-2.1.3 Supervisor dashboard | `GET /api/v1/staff/supervisor/dashboard` | Admission |
| US-2.1.4 Central monitor dashboard | `GET /api/v1/staff/site-monitoring/dashboard`; drill-down `GET /api/v1/staff/site-monitoring/applications` | Admission |
| US-2.2.1 Retrieve applications | `POST /api/v1/staff/pools/{poolId}/application-retrievals`; due-date returns and pool reminders run as an in-process background job | Admission + Background jobs |
| US-2.2.2 Monitor officer workload | `GET /api/v1/staff/officers/{officerId}/workload` | Admission |
| US-2.2.3 Reassign applications | `PUT /api/v1/staff/applications/{applicationId}/assignment`; bulk reassign/return `POST /api/v1/staff/application-reassignments`; target list `GET /api/v1/staff/pools/{poolId}/officers` | Admission |
| US-2.3.1 View application details | `GET /api/v1/staff/applications/{applicationId}`; `GET .../attachments`; `GET .../attachments/{attachmentId}/content` | Admission |
| US-2.3.2 Flag/add notes | `PUT /api/v1/staff/applications/{applicationId}/correction-flags` | Admission |
| US-2.3.3 Return for correction | `POST /api/v1/staff/applications/{applicationId}/correction-requests` | Admission |
| US-2.3.4 Candidate correct/resubmit | `POST /api/v1/applications/{applicationId}/corrections` and section updates restricted to flagged fields; attachments: `GET .../attachments`, `PUT/DELETE .../attachments/{slotId}`, `GET .../attachments/{slotId}/content` | Candidate + Admission + Documents (Rhapsody/FileNet) |
| US-2.3.5 Complete verification | `POST /api/v1/staff/applications/{applicationId}/verification-completion` | Admission |
| US-2.3.6 Replace application attachment | `PUT /api/v1/staff/applications/{applicationId}/attachments/{attachmentId}/replacement` | Admission + FileNet |
| US-2.4.1 Recommend screen-out | `POST /api/v1/staff/applications/{applicationId}/screen-out-recommendations`; reasons: `GET /api/v1/lookups/SCREEN_OUT_REASON` | Admission |
| US-2.4.2 Escalate for clarification | `POST /api/v1/staff/applications/{applicationId}/clarification-requests` | Admission |
| US-2.4.3 Supervisor decides screen-out | `POST /api/v1/staff/applications/{applicationId}/screen-out-decisions` | Admission |
| US-2.4.4 Return guidance | `POST /api/v1/staff/applications/{applicationId}/clarification-responses` | Admission |
| US-2.4.5 Officer handles rejection feedback | `POST /api/v1/staff/applications/{applicationId}/verification-actions` | Admission |
| US-2.5.1 View reinstatement requests | `GET /api/v1/staff/reinstatement-requests`; `GET /api/v1/staff/reinstatement-requests/{requestId}` | Admission |
| US-2.5.2 Decide reinstatement | `POST /api/v1/staff/reinstatement-requests/{requestId}/decision`; direct reinstatement of screened-out: `POST /api/v1/staff/applications/{applicationId}/reinstatement` | Admission |
| US-2.5.3 Refresh ICP data | `POST /api/v1/staff/candidates/{candidateId}/icp-refresh-preview`; `POST .../icp-refresh` | Admission + ICP |
| US-3.1.1 Referee login | IDAM/OIDC; `POST /api/v1/auth/sign-in`, `PUT /api/v1/auth/active-role`; `GET /api/v1/referee/dashboard` | IDAM + Portfolio |
| US-3.1.2 Referee dashboard | `GET /api/v1/referee/dashboard` | Portfolio |
| US-3.1.3 Senior referee dashboard/details | `GET /api/v1/senior-referee/dashboard`; `GET /api/v1/senior-referee/portfolios/{portfolioId}`; `GET /api/v1/senior-referee/referees/{refereeId}/portfolios`; `GET .../evidence/{evidenceId}/content` | Portfolio |
| US-3.2.1 Retrieve portfolios | `POST /api/v1/referee/pools/{poolId}/portfolio-retrievals` | Portfolio |
| US-3.2.2 Reassign/override portfolio | `PUT /api/v1/senior-referee/portfolios/{portfolioId}/assignment`; `GET .../eligible-referees`; `POST .../score-overrides` | Portfolio |
| US-3.2.3 Replace portfolio evidence | `PUT /api/v1/senior-referee/portfolios/{portfolioId}/evidence/{evidenceId}/replacement` | Portfolio + FileNet |
| US-3.3.1 View portfolio details | `GET /api/v1/referee/portfolios/{portfolioId}`; `GET .../evidence/{evidenceId}/content` | Portfolio |
| US-3.3.2 Return for COI | `POST /api/v1/referee/portfolios/{portfolioId}/conflict-of-interest` | Portfolio |
| US-3.3.3 Score questions | `PUT /api/v1/referee/portfolios/{portfolioId}/scores`; reasons/classifications: `GET /api/v1/lookups/PORTFOLIO_REJECTION_REASON`, `GET /api/v1/lookups/PORTFOLIO_CLASSIFICATION` | Portfolio |
| US-3.3.4 Submit scoring | `POST /api/v1/referee/portfolios/{portfolioId}/score-submission` | Portfolio |
| US-4.1.1 Screening dashboard | `GET /api/v1/staff/screening/dashboard` | Screening |
| US-4.2.1 Upload/process CASPER | `POST /api/v1/staff/screening/casper-imports` | Screening |
| US-4.3.1 Announce initial scores | `POST /api/v1/staff/screening/announcements` | Screening + Notifications |
| US-4.3.2 Candidate views announced scores | `GET /api/v1/applications/{applicationId}`; `announcedScores` is absent before announcement | Candidate + Screening |
| US-4.4.1 Bulk screen-out | `POST /api/v1/staff/screening/bulk-screen-outs` | Screening |
| US-4.5.1 Reannounce after appeal | `POST /api/v1/staff/screening/reannouncements` | Screening + Portfolio |

## 6. Cross-cutting event/data contracts

These are platform-internal or provider boundaries. They must be durable, versioned, idempotent, and auditable even when implemented without public HTTP endpoints.

| Event/record | Producer → consumer | Required contract data | Required invariant |
|---|---|---|---|
| `CandidateIdentityLinked.v1` | IDAM trust boundary → identity service | issuer, stable subject, verified attributes reference, event time, correlation ID | No identity link based solely on unverified email; dedupe by approved match policy. |
| `ApplicationDraftCreated.v1` | Candidate API → application lifecycle | application ID, candidate ID, cycle/program, selected preferences, actor, event time | One active application/draft rule is enforced atomically. |
| `ApplicationSubmitted.v1` | Application/payment workflow → verification pool and portfolio pool | application ID, cycle/program/first specialty, submitted time, form/rubric config versions, document references | Emit only after durable paid submission; no raw document or payment credential in event. |
| `PaymentStatusChanged.v1` | Verified provider adapter → payment record/submission eligibility | provider code, provider event ID, platform session ID, safe provider transaction reference, status, amount/currency, occurred time, receipt reference | Deduplicate by provider + event ID; verify provider/session binding and amount/currency; payment data independent from application status. |
| `ApplicationCorrectionRequested.v1` | Officer workflow → candidate notification | application ID, flagged JSON Pointers, candidate note codes/text, deadline, officer assignment ID | Candidate can edit only flagged fields; portfolio stays immutable; note is candidate-safe. |
| `ApplicationCorrectionSubmitted.v1` | Candidate API → assigned officer queue | application ID, correction version, prior assignment ID, submitted time | Reassign to same officer unless an authorized supervisor explicitly changes ownership. |
| `VerificationDecisionRecorded.v1` | Officer/supervisor workflow → application state/audit | application ID, prior/new state, actor, reason code, note reference, event time | Valid transition, two-party endorsement where required, immutable audit. |
| `PortfolioAssigned.v1` | Portfolio assignment service → referee queue | portfolio ID, round, referee ID, due time, rubric version | No identity disclosure; honor role/pool/COI and distinct-reviewer constraints. |
| `PortfolioRoundSubmitted.v1` | Referee scoring API → discrepancy processor | portfolio ID, round, referee ID, rubric version, item score codes, total, submission time | Submitted scores immutable; Third Referee sees no earlier scores. |
| `PortfolioFinalScoreChanged.v1` | Scoring processor → screening read model | portfolio ID, final points, weighted score, score source/round, formula version, event time | Recompute only with approved effective-dated rubric and weights; retain prior values. |
| `ScoresAnnounced.v1` | Supervisor API → candidate read model/notification outbox | application IDs, announcement type/time, current score references, appeal deadline | Only ready records; individual round scores hidden; notification idempotent. |
| `DraftMaintenanceDue.v1` | Scheduler → reminder/archive worker | application ID, cycle, due action, configured template/version, scheduled time | No duplicate reminder/archive; candidate receives no internal-only status. |
| `VerificationAssignmentOverdue.v1` | Scheduler → pool assignment service | application ID, assignment ID, due time, calendar version | Requeue only untouched eligible work; previous officer cannot retrieve returned work. |

Events must include an event ID, schema version, occurred/recorded timestamps, correlation ID, and producer. Avoid putting candidate names, identity documents, portfolio content, academic values, or tokens in event headers or general-purpose logs. Use secure resource references and fetch only under authorized consumer identity.

## 7. Contract gaps and business approval gates

“Coverage” means each BRD story has a contract operation or explicit boundary. The following decisions still block production implementation where applicable:

- Production IDAM definition, registered clients, introspection, the immutable user identifier, session expiry, and approved UAE Pass federation (OQ-15).
- Staff assurance/MFA policy. Roles per operation are listed in `x-dahc-roles`; data scopes (program/specialty pools) are set by Administrators.
- Cycle, program, specialty, site, capacity, eligibility, and active-application constraints. The source notes site capacity is TBC.
- Form field schema, conditional requiredness, terms wording, file size/type, document naming/storage, retention, versioning, and FileNet failure behavior.
- GPA, entrance-exam, CASPER and portfolio formulas, weight versions, validation thresholds, rubric effective dates, and approved rounding. Do not implement invented formulas.
- Working calendar, officer/referee retrieval caps, due dates, reminder cadence, archive deadline, and automation retry rules. BRD has conflicting due-date references.
- OTP provider protocol, delivery status, expiration/rate limits, and safe withdrawal confirmation UX.
- E-Pay and Network International onboarding/certification, callback verification, amount reconciliation, callback retry, safe provider-switch timing, refund/duplicate-charge handling, and authoritative fee values.
- ICP preview/apply payload and attribute overwrite/consent policy.
- Screen-out reasons, notification templates/channels, bulk operation atomicity/partial success policy, and announcement batching.
- Exact endpoint payloads/headers for complex file transfer, notification delivery receipts, and any deployment-specific gateway/API gateway behavior.
- Interview, undergraduate MBBS, shortlisting/ranking, offers, and enrollment requirements are outside this GME Release 5 source and require a separately approved BRD.

The product owner and security/integration owners must resolve each relevant gate before its story enters implementation. A placeholder schema or enum in OpenAPI is not a substitute for their approval.

## 8. Required contract review and release checks

Every contract PR must verify:

- OpenAPI 3.1 parses and validates from `openapi/openapi.yaml`, including external `$ref`s.
- Every operation has `operationId`, story traceability, security, typed success response, documented empty behavior, and error responses.
- Collection operations have bounded pagination, stable sorting, and correct empty-list semantics.
- Candidate ownership, staff scope, referee anonymization, finance read-only access, and integration-only callback authorization are tested.
- Duplicate requests, stale versions, state conflicts, invalid/empty results, dependency failures, and retry behavior are tested.
- Sensitive fields are absent from unauthorized views, error responses, logs, event payloads, and generated examples.
- Breaking changes are explicitly approved and accompanied by compatibility/deprecation plans.
- Business rules and score calculations are tested against approved versioned examples supplied by the product owner; synthetic examples only.

## 9. Contract approval record

Use the following table in the contract PR or release record. Do not mark the contract “agreed” until named owners have reviewed their relevant areas.

| Area | Accountable reviewer | Decision/status |
|---|---|---|
| Admissions workflow and candidate-visible wording | GME admissions product owner | Pending |
| API/data model and modular OpenAPI | Solution architect / contract coordinator | Pending |
| Identity (IDAM introspection/OIDC), UAE Pass and federation | IDAM and information-security owners | Pending |
| Payment integration and reconciliation | Finance/payment integration owner | Pending |
| ICP and FileNet integrations | Integration/data owners | Pending |
| Portfolio rubric, score logic, privacy/anonymization | GME scoring owner and privacy/security reviewer | Pending |
| QA scenarios and API compatibility | QA lead | Pending |
| Operations, audit, monitoring, recovery | Platform operations owner | Pending |
