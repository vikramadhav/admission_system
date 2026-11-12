---
paths:
  - "src/backend/**"
  - "src/frontend/**"
---

# Authentication and provisioning (AP-01 to AP-08; approved, do not reopen)

The full text is in `docs/dotnet-engineering-standards.md` §19, "DAHC IDAM access-token validation" and "DAHC authentication and Candidate provisioning constraints".

## Tokens

- IDAM issues **opaque** access tokens. The API validates them through the IDAM introspection endpoint. Never add JWT validation for IDAM tokens.
- Angular uses OIDC code + PKCE through `angular-auth-oidc-client` and sends the **access token** as `Authorization: Bearer`, only to the configured API base URL. The ID token is never sent to the API; its only use is `id_token_hint` at sign-out.
- Never log, persist or decode a raw access token. The introspection credentials (`Idam:ApiClientSecret`) exist only on the backend: user secrets locally, the secret store when deployed.
- Extend the existing code in `src/backend/src/API/DAHC.API/Authentication/Idam/*` and `TokenValidation.cs`; never replace it.
- Use the introspection library's own options. Its verified capabilities are in register §1.2.
- Do not add `Microsoft.Extensions.Http.Resilience`, circuit breakers, or custom caching or authentication infrastructure (DF-10).

## HTTP outcomes

| Situation | Response |
|---|---|
| Invalid, inactive or expired token | 401 |
| Insufficient scope on an otherwise authenticated token | 403 |
| Rate limited | 429 |
| IDAM unavailable | 503 |

An introspection failure is never a valid token.

## Identity and roles

- Resolve local users by the validated issuer + subject.
- Only eligible Candidates are auto-provisioned. Staff are always provisioned explicitly.
- Provisioning is idempotent and concurrency-safe. A disabled account is never reactivated.
- The API enforces all authorization: account active, the active role's permissions (never the union of roles), and resource ownership. Angular guards are UI aids only. The IDAM `role` claim is ignored. The permission conventions are in `authorization.md`.
- Development-only SFA exists only in the Development environment. Never make it reachable or trusted in Test, UAT or Production.
