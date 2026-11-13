# Payment Gateway Adapter Agreement

**Status:** Proposed integration baseline; provider onboarding details require approval  
**Providers in scope:** E-Pay and Network International  
**Stable contract:** `PaymentSession` and `PaymentGatewayEvent` in `openapi/components/schemas.yaml`

## Objective

Allow the platform to use E-Pay or Network International without changing candidate, finance, or application-submission APIs. Provider-specific behavior belongs in replaceable adapters. The admissions payment service owns the canonical payment session, status, fee reconciliation, and submission eligibility.

## Component boundary

```text
Candidate / Finance API
          |
          v
Payment Service ---- Routing Policy (active provider for new sessions)
          |
          +---- Payment Gateway Port
                    |
                    +---- E-Pay Adapter -------- E-Pay
                    |
                    +---- Network International Adapter
                                                   |
                                                   +---- Network International

Provider callback --> Provider Adapter (verify + normalize)
                  --> Payment Service event API (integration client, payments.events-write)
```

The payment gateway port exposes only canonical operations to the payment service:

1. Create a hosted checkout session from `PaymentGatewayCreateRequest` and return `PaymentGatewayCheckoutResult`.
2. Query/reconcile the status of an existing provider transaction.
3. Verify and normalize provider callbacks into `PaymentGatewayEvent`.

Provider SDKs, request/response payloads, callback signatures, credentials, merchant identifiers, and provider error codes stay inside that provider's adapter and deployment configuration. Do not pass provider-specific DTOs into candidate or admissions modules. Keep credentials in the approved secret store; never commit them or return them in API responses/logs.

Persist `PaymentProviderBinding` when the checkout is created. It is an internal record, not part of `PaymentSession` returned to a candidate. `PaymentRoutingConfiguration` is deployment-controlled and contains no credentials.

## Routing and safe provider switch

- Provider selection is server-side configuration, scoped at the institution/program/cycle only if that routing granularity is approved. Candidate requests cannot supply or override a provider.
- A new payment session binds internally to one provider and its configuration version. Retries with the same idempotency key return the same session and provider binding.
- A switch changes the provider used for **new** sessions only. Existing pending sessions remain pinned to their original provider for status queries, callbacks, reconciliation, and refunds where supported.
- Keep both adapters and callback verification configured during cutover. Retain the old provider until its pending sessions are terminal or explicitly reconciled; do not remove its credentials, callback route, or reconciliation capability prematurely.
- Never silently fail over an in-flight or uncertain payment attempt to the other gateway. First reconcile the original transaction. Starting a second provider session while the first may have charged risks duplicate payment.
- If the selected provider is unavailable before a session is created, return the documented dependency error. An explicitly approved routing policy may choose another provider for a **new** session, but must record that decision and return the same provider-neutral response.
- Candidate clients consume only the platform payment-session ID, status, opaque hosted `checkoutUrl`, and optional expiry. They must not branch on provider name, provider SDK, callback payload, or gateway-specific error text.

## Normalized event and reconciliation rules

The provider adapter verifies the callback using provider-specific authentication and maps it to `PaymentGatewayEvent`. Only the authenticated adapter calls `POST /api/v1/integrations/payment-events`; its service identity is authorized only for its configured provider. Raw provider callbacks must not be sent directly to that endpoint.

- Deduplicate by `(provider, providerEventId)` and validate that the event maps to the provider bound to the payment session.
- Compare amount and currency against the authoritative platform session before confirming payment. Reject mismatches for reconciliation; never mark an application submitted.
- Treat provider notifications as at-least-once and potentially out of order. Use the provider's authoritative status query to resolve ambiguous or conflicting events.
- A timeout or unknown result remains `UNKNOWN` until reconciled. Do not interpret it as failure and do not initiate an alternate-gateway charge automatically.
- Payment state is independent of application state. Only the application submission workflow may finalize submission after it confirms a paid session and all other submission requirements.
- Persist safe provider transaction references for reconciliation. Do not store card numbers, security codes, or other payment credentials.
- Provider-specific cancellation/refund behavior is not implied by this contract and requires its own approved operation and accounting rules before implementation.

## Adapter acceptance criteria

Each adapter must pass the same contract tests for:

- Hosted checkout creation and idempotent retry.
- Success, decline/failure, cancellation, timeout, malformed callback, duplicate callback, and out-of-order callback.
- Provider-to-platform session binding, amount/currency mismatch, and status reconciliation.
- Secret rotation, callback-authentication failure, dependency outage, and safe redaction of provider payloads.
- Provider-neutral candidate responses and no changes to application submission or finance API schemas when switching the active provider.

Provider-specific sandbox credentials, endpoint URLs, signing algorithms, supported currencies, refund behavior, and production certification remain deployment/onboarding decisions, not assumptions in the shared API contract.
