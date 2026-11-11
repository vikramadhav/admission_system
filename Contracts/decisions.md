# API Contract Decisions and Standards

## Current scope

The contract covers the GME Release 5 user stories; the first demoable slice is sign-in, catalog discovery, draft creation, draft read/list and draft save. The source BRD is GME-specific; it does not define undergraduate MBBS admission or interview operations. Add those APIs only from approved requirements.

API operations are business outcomes and must enforce their authorization in the service, not just hide UI controls. Use the story IDs in operation descriptions as traceability, not as the API's public resource identifiers.

## Authentication and authorization

These rules follow `dahc-engineering-standards (2).md` section 15 and decisions D-03, D-04, D-14 and D-21 in `Open-Questions.md`.

### Tokens and identity

- **IDAM is the single source of truth for identity and authentication.** Its login offers single-factor sign-in and UAE PASS; both end in the same IDAM tokens. The API never talks to UAE PASS and never runs a sign-in flow.
- **The API is a resource server.** Every call carries the IDAM access token in `Authorization: Bearer`. Tokens are opaque and are validated at the IDAM introspection endpoint (RFC 7662) by the approved introspection handler. A token is accepted only if it is active, the issuer matches exactly, it has not expired and its `client_id` is a registered DAHC client. ID tokens are never accepted. IDAM errors fail closed: `401` for an inactive or rejected token, `503` when IDAM is unreachable.
- **Identity comes only from introspection and UserInfo**, both called by the API. Identity, profile or role data in a request body or custom header is ignored.
- The match key is the IDAM immutable user identifier, unique in the database. Names, emails, mobile numbers and the Emirates ID are never the match key (pending IDAM confirmation that `sub` never changes, OQ-15).
- Single-factor authentication is an IDAM policy, not an authorization bypass. Staff assurance and MFA follow the institution's policy.

### Users, roles and the active role

- **Candidates and staff are separate records** (D-04). `POST /api/v1/auth/sign-in` creates a Candidate for an unknown identity (Candidate role only), or matches a staff user an Administrator pre-registered. Every other endpoint needs an existing, active user: an unknown identity gets `403 account.not_registered`, a deactivated one `403 account.deactivated`.
- The BRD duplicate-account check (US-1.1.1) runs at sign-in: a match on Emirates ID, passport or mobile records the pair for supervisors and returns `409 account.duplicate`.
- **Roles are internal.** IDAM `role`, group or entitlement claims are never read. Staff users can hold several roles with program/specialty pool scopes, granted only by Administrators through audited endpoints that refuse self-elevation.
- **Active role:** a staff user with several roles has one active role, stored on the user and switched with `PUT /api/v1/auth/active-role` (the BRD role switcher). Authorization uses the active role only; every audit record carries it.
- **Own records:** a staff user linked to a candidate record (`linkedCandidateId`, D-14) can never view or act on that candidate's applications.
- Each operation lists its allowed active roles in `x-dahc-roles` and at the end of its description. `ANY_ACTIVE_USER` means any active signed-in user; `VALID_TOKEN` (sign-in and `me` only) means any valid IDAM token. The OpenAPI document has one security scheme, `IdamBearer`, and no OAuth scopes, because scopes never grant permissions here.
- Record-level rules (candidate ownership, staff pool scope, referee anonymity, finance isolation) are enforced in one access service per resource, on every request.

### Integrations

- Each third-party middleware is an IDAM confidential client and has an internal **integration client** record (IDAM client id, name, active flag, permissions) managed by Administrators (`/api/v1/admin/integration-clients`). IDAM scopes or claims never grant a permission.
- A middleware acting as itself (client credentials) can call only operations that declare its permission in `x-dahc-integration-permission`. Today that is `receivePaymentGatewayEvent` (`payments.events-write`).
- A middleware acting for a signed-in user is not supported until a middleware needs it (D-21). A user identity asserted in a header or body by a middleware is never accepted.
- ICP is reached through third-party middleware as an outbound REST call from the backend. It is not an inbound API of this platform.

## HTTP and resource conventions

- Base path is `/api/v1` (D-12); JSON uses `application/json`.
- **Success envelope (D-02):** every JSON success response is an `ApiResponse` envelope with `data`. Collections use `ApiListResponse`: `data` is the array and `pagination` carries `limit` and `nextCursor`. An empty collection is `200` with `data: []` and a `messageCode` such as `applications.none_active`, plus `message` resolved for the request culture. File downloads are the exception: they return the file itself.
- **Errors are never wrapped.** They are top-level RFC 7807 Problem documents (`application/problem+json`) with a stable dotted `code` (for example `account.not_registered`, `request.invalid_sort`, `icp.preview_invalid`), a localized safe `detail` and the `traceId`. A resource that does not exist and one the caller may not see return the same `404`.
- Timestamps are ISO 8601 with an explicit offset; the API returns UTC and rejects input without an offset. Calendar dates use ISO dates. Deadlines the business defines locally (cycle windows, appeal window) also carry their IANA `timeZoneId` (D-07). The request culture comes from the user's preference, then `Accept-Language`, then `en-AE`; supported cultures are `en-AE` and `ar-AE`.
- **Identifiers:** resources are addressed by UUID in URLs and payloads; integer database keys never leave the server. The candidate number (9 digits from `000000001`, always text, D-05/D-13) and the application number (`<cycle start year><7-digit counter>`, e.g. `20270000001`, D-19) are display and search fields. The application number is the CASPER matching key.
- Use standard HTTP semantics: `200` read/update, `201` creation, `400` malformed request/query, `401` missing/invalid authentication, `403` authenticated but not permitted, `404` missing or not visible resource, `409` current-state/business conflict, `412` failed `If-Match`, `422` syntactically valid but invalid business data, `429` rate limit, `500` unexpected server failure, and `503` unavailable required dependency.
- Return request correlation as `X-Request-ID`. Accept optional `X-Correlation-ID` for end-to-end tracing; validate length/character set and do not treat it as identity.
- Create operations accept `Idempotency-Key`. Replaying the same key and request returns the original outcome; reusing the key with a different request returns `409 request.idempotency_key_reused`.
- Draft updates use `If-Match` with an `ETag` from the last read/write to prevent lost updates. Missing required precondition returns `428 request.precondition_required`; stale version returns `412 request.precondition_failed`.
- Do not return `204` for operations whose result needs to be shown or audited by the caller. Never use `404` for an empty collection.
- **Scheduled work** (draft reminders and archiving, verification and portfolio due-date returns, pool reminders, `document-orphan-cleanup`) runs inside the API as a `BackgroundService` driven by a scheduled-work table (D-18). There are no HTTP job triggers.

## Pagination and sorting

- Collections accept `limit` (default 25, maximum 100) and opaque `cursor`. A response includes `page.limit` and `page.nextCursor` (null when there is no next page).
- Cursors are opaque, validated, and bound to the query/filter/sort context. Clients must not parse or construct them.
- `sort` is an allow-listed comma-separated list; `-field` means descending. Add a unique stable tie-breaker server-side. Unsupported sort keys return `400 INVALID_SORT`.
- Use cursor pagination for changing/large operational datasets; avoid unbounded responses and do not promise exact totals unless the operation explicitly supports them.
- Catalog endpoints may be small, but use the same bounded collection envelope for consistency.

## Data and privacy

- Minimize returned applicant fields by role and purpose. Candidate endpoints return only the authenticated candidate's own records. Referee endpoints, when added, must not reveal candidate identity.
- Never log request/response bodies containing academic credentials, identity information, documents, tokens, or other sensitive values. Log operation, outcome, actor/service, resource ID where safe, and correlation ID under approved audit policy.
- All state-changing operations require authorization, validation, audit, and explicit handling for downstream failures. Do not report success until the required state is durably committed.
- Use synthetic fixtures and examples only. File upload/download APIs require a separate approved document-access contract with malware scanning, size/type controls, access checks, and audit.
- **Document flow (agreed 2026-11-11, pending security approval of the controls above):** browser → this API (multipart) → Rhapsody → FileNet. Clients never call Rhapsody or FileNet, and no FileNet URL is exposed. The API validates ownership, slot editability, media type, size, and malware before forwarding. It returns success only after storage is confirmed and keeps replaced or removed files for audit. Downloads are streamed through the API with `Cache-Control: private, no-store`. Candidate operations: `listApplicationAttachmentSlots`, `uploadApplicationAttachment`, `deleteApplicationAttachment`, `downloadApplicationAttachment`.
- **Orphan document cleanup (placeholder, agreed 2026-11-11):** a scheduled worker job, `document-orphan-cleanup`, removes FileNet documents that no live record needs. Examples are files from discarded or archived drafts, files a candidate replaced or deleted before submission, and files stored in FileNet whose database commit then failed. The selection rule, retention period, schedule, and whether removal is a FileNet delete through Rhapsody or only a mark are **to be defined** (open question Q-185). Until then the job runs and records a run in `ops.ScheduledJobRun`, but selects nothing and deletes nothing. It has no API endpoint.

## Payment gateway modularity

- Candidate and finance APIs use a provider-neutral payment-session contract. The payment service selects E-Pay or Network International through server-side routing configuration; clients cannot choose the provider or depend on provider-specific payloads.
- Implement each gateway behind the same internal adapter port. Provider credentials, SDKs, callback verification, and payload/error translation remain isolated in that adapter.
- Bind a payment session to the provider/configuration version that created it. A routing switch applies to new sessions; existing sessions remain queryable and reconcilable through their original provider.
- Do not automatically retry an uncertain charge on another provider. Reconcile the original transaction first to prevent duplicate charges.
- Verify provider callbacks in the provider-specific adapter, then send only the normalized `PaymentGatewayEvent` to the platform as an integration client holding `payments.events-write`. Keep both adapters available during a migration until old sessions are resolved.
- The routing policy, provider onboarding/certification, reconciliation ownership, and refund/accounting rules require approval by finance, security, and integration owners.

## Decisions required before extending contracts

1. Production IDAM definition, clients, introspection and UserInfo endpoints, and the immutable user identifier (OQ-15).
2. Whether user-facing access is solely via Dubai Health IDAM/UAE Pass or whether any other identity provider is approved and brokered.
3. Allowed identity assurance and MFA policy by candidate, admissions staff, finance, referee, and privileged administrator roles.
4. Final program/cycle reference data, candidate eligibility checks, and site/preference rules.
5. Applicant API retention/deletion policy, audit-event requirements, and data classification per field.
6. Document storage behavior; E-Pay and Network International onboarding, callback authentication, idempotency, timeout reconciliation, provider cutover, refunds, and notification delivery guarantees.
7. OpenAPI lint/bundle/code-generation toolchain and compatibility policy.
