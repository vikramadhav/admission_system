# Shared API and Data Contracts

This folder is the team's source of truth for API operation and data contracts. Contracts are modular OpenAPI 3.1 documents; implementation, generated clients, and tests should align with these contracts rather than maintaining competing endpoint definitions.

## Contract contents

- [`openapi/openapi.yaml`](openapi/openapi.yaml) is the API entry point.
- `openapi/paths/` contains domain operation contracts.
- `openapi/components/` contains shared data schemas and response definitions.
- [`decisions.md`](decisions.md) records security boundaries, standard API behavior, and decisions still needing institutional approval.
- [`END-TO-END-CONTRACT-AGREEMENT.md`](END-TO-END-CONTRACT-AGREEMENT.md) is the developer-facing end-to-end agreement and complete BRD story-to-operation traceability matrix.
- [`PAYMENT-GATEWAY-ADAPTER-AGREEMENT.md`](PAYMENT-GATEWAY-ADAPTER-AGREEMENT.md) defines the provider-neutral payment boundary and safe E-Pay/Network International switch behavior.

The OpenAPI contract covers all 60 user stories in `Stories_Addmission_System_BRD.md` at operation/contract level. Some infrastructure behavior is delegated to approved external systems (not reimplemented as platform endpoints); this distinction and all unresolved product decisions are documented in the end-to-end agreement. Interviews, undergraduate MBBS, shortlisting/ranking, offers, and enrollment are not specified as Release 5 stories in this BRD and are not represented as implemented platform operations.

## OpenAPI modularity and ownership

- Make additive changes through small, reviewable OpenAPI changes. Keep path operations in their domain module and shared schemas/errors in `components`.
- Use relative `$ref`s from the root document. Treat `openapi/openapi.yaml` as the entry point when linting, bundling, generating types, or producing API documentation.
- A story owner proposes contract changes in the same short-lived branch as the story. The owning domain lead reviews changes to shared schemas; a designated contract coordinator reviews cross-domain changes.
- Before implementation starts, developers agree on the operation, data schema, authorization, state transition, and test examples in the contract PR. An unresolved comment or a proposed incompatible behavior is a refinement blocker, not permission to invent a private endpoint.
- Agree on operation and data contracts before parallel UI/service work. Generate client/server types from the OpenAPI contract where supported; do not hand-maintain duplicate DTO definitions.
- Breaking changes require an explicit API version/release decision and a migration/deprecation plan. Prefer additive fields and endpoints; clients must ignore unknown response fields.
- Never put real applicant information, tokens, credentials, or confidential production payloads in examples, fixtures, or prompts. Use synthetic examples only.

## State contract convention

Each operation documents:

1. **Success state** — HTTP status and response shape.
2. **Empty state** — for collections, successful `200` with `data: []`, `pagination` and a `messageCode` in the `ApiResponse` envelope; for a requested resource that does not exist or is not visible to the caller, `404` with a Problem response. Empty is not an error.
3. **Error state** — applicable HTTP status codes and the shared `Problem` schema. Never return an empty success-shaped payload for an error.

Collection endpoints support bounded cursor pagination and allow-listed sorting where meaningful. See `decisions.md` for common semantics.

## Validate locally

The repository does not currently define an OpenAPI linter, generator, or build command. Select and pin the team's standard OpenAPI 3.1 linter/bundler as an explicit tooling decision before adding it to CI. CI should validate and bundle the root document, check all `$ref`s, and detect breaking changes against the last released contract. Do not silently add an unpinned global tool.
