# TASK: Generate the DAHC .NET Web API Solution Structure and Code Contracts

You are a lead .NET engineer. Generate the solution structure and foundational code for a headless ASP.NET Core Web API.

The attached **C# / .NET Engineering Standards** document is mandatory. Where this prompt and the standard differ, the standard wins, except for the deviations approved in Section 19 at the end of this prompt.

---

## 1. Solution scope

- A headless ASP.NET Core Web API on .NET 10 (LTS), with SQL Server through EF Core (code-first).
- No user interface in this solution. The first client is an Angular web application in the same repository (`/frontend`); other channels (for example mobile apps) will be added later.
- The API is channel-neutral: no endpoint, response shape or message is specific to Angular. Every client uses the same contract (Section 4).
- Prefix for every solution, project, assembly and namespace: `DAHC`.

## 2. Projects and dependency direction

```text
DAHC.Core  <-  DAHC.Service  <-  DAHC.Data, DAHC.Logging  <-  DAHC.API
```

| Project | Layer | Responsibility |
|---|---|---|
| `DAHC.Core` | Domain | Entities, value objects, enums and domain constants. References nothing: no EF Core, no ASP.NET Core, no data annotations. |
| `DAHC.Service` | Application | Use-case service interfaces and their logic that needs no I/O, immutable request/response/result records, the `Result` types, the authentication rules (mapping a verified identity to a local user) and the time-zone and locale conversion rules. References `DAHC.Core` only. |
| `DAHC.Data` | Infrastructure | `DahcDbContext`, one `IEntityTypeConfiguration<T>` class per entity, migrations, save interceptors, and the EF Core-backed implementations of the `DAHC.Service` interfaces, using `DahcDbContext` directly. Registration through one `AddDahcData()` extension method. |
| `DAHC.Logging` | Infrastructure | Serilog configuration only. Registration through one `AddDahcLogging()` / `UseDahcLogging()` extension pair. |
| `DAHC.API` | Host | `Program.cs` composition root, controllers, the response envelope, the exception handler, authentication and authorization setup, request localization, options validation, security headers and rate limiting. |
| `DAHC.Test.Service` | Tests | Unit tests of business rules in `DAHC.Service`. |
| `DAHC.Test.Data` | Tests | Tests of `DAHC.Data` services using the EF Core in-memory provider. |
| `DAHC.Test.API` | Tests | `WebApplicationFactory<Program>` tests of endpoints, the envelope and the security boundaries. |

Dependency rules:

- `DAHC.API` references `DAHC.Data` and `DAHC.Logging` only to call their registration methods in `Program.cs`. Controllers depend only on `DAHC.Service` interfaces and records, never on `DahcDbContext` or entities.
- Interfaces exist only at real boundaries: a `DAHC.Service` interface implemented in `DAHC.Data` because it needs the database, or an external system. No interface for a class that has a single in-process implementation.
- Test projects exist where they protect real behaviour. They do not mirror production projects 1:1. `DAHC.Core` and `DAHC.Logging` get no test project unless they gain logic worth testing.

## 3. Prohibited

Do not generate, reference or suggest any of the following:

- Unit of Work or repository implementations or interfaces, generic or specific. Services use `DahcDbContext` directly.
- Command/query workflows, command or query handlers, orchestrators, pipelines, buses or CQRS structure.
- MediatR or any other mediator library.
- FluentValidation or any validation framework. Use data annotations on request records at the API boundary and explicit business-rule checks in services.
- AutoMapper or any object mapper. Map by hand.
- Domain events, state-machine frameworks, base controllers, base services or generic abstractions without a current requirement.
- ASP.NET Core Identity, local password stores or any local sign-in outside the Development environment.
- The EF Core in-memory provider (or SQLite) referenced by any production project. It is allowed in test projects only.
- `DateTime.Now`, `DateTime.UtcNow`, `DateTimeKind.Local` or server-local time anywhere.
- Placeholder files, empty folders or comments that restate the code.

## 4. Response contract

### Success and empty responses

Every successful endpoint returns an immutable `ApiResponse<T>` envelope, defined in `DAHC.API`:

- **Success** (`200 OK` or `201 Created`): typed data, plus pagination metadata for lists.
- **Empty** (`200 OK`): only for collections with no items. Carries an empty collection and a stable message code (for example `applications.none_active`). The message text is resolved for the request's locale (Section 7).

### Error responses

- Errors are **not** wrapped in the envelope. They are RFC 7807 `ProblemDetails` at the top level, `application/problem+json`, with a stable business error code, a localized safe message and the trace id.
- A single resource that does not exist, or that the caller may not see, returns the same `404` response, so a refusal never reveals whether a record exists.
- Services return results (success, empty, validation failure, not found, conflict) and never throw for expected outcomes. Controllers translate each result with one shared translation method.
- The global exception handler handles unexpected failures only: it logs once and returns a `500` ProblemDetails with the trace id and a safe message.

## 5. Authentication and authorization

### Identity provider: IDAM is the single source of truth

- **IDAM** (the DAHC IBM Security Verify Access OpenID Connect provider) is the single source of truth for **identity and authentication**. Its login offers single-factor authentication (username and password) and UAE PASS; both end in the same IDAM tokens. The API never talks to UAE PASS directly and never runs a sign-in flow of its own.
- **Identity attributes** (name, email, mobile and the other profile claims the application needs) come only from IDAM. At every `POST /api/auth/sign-in` the API itself calls the IDAM UserInfo endpoint with the caller's access token and refreshes its stored copy from that response (checking that its `sub` matches the token's subject); it never takes attributes from the client, and the application never lets users edit them locally; changes are made in IDAM.
- **Roles are internal only.** The IDAM `role` claim (and any other group or entitlement claim) has no meaning in the DAHC API: it is never read, stored, mapped or used for any decision. Authorization comes only from the roles held in the DAHC database (Local authorization below).

### Channels and clients

- **IDAM issues every token.** All channels sign the user in with IDAM and call the API with the IDAM access token in `Authorization: Bearer <token>`. The API is a **resource server** only: it keeps no sessions, sets no authentication cookies and runs no sign-in flow. Tokens in query strings, form fields or cookies are rejected.
- **Web (Angular):** an IDAM public client using authorization code with PKCE `S256` in the browser.
- **Mobile app:** an IDAM public (native) client using authorization code with PKCE through the system browser (RFC 8252), redirecting to a registered app link or custom scheme. The app redeems the code at the IDAM token endpoint itself and calls the API with the resulting access token, exactly like the web app. The authorization code is never sent to the API, and the app embeds no client secret.
- **Third-party middleware:** IDAM confidential clients (Third-party integrations below).
- **IDAM setup for DAHC:** DAHC gets its **own** OIDC definition with its own clients: the web client, the mobile client, one confidential client for the API's introspection and UserInfo calls, and one confidential client per middleware. No client or definition is shared with another application.
- **Confirmed:** IDAM access tokens are **opaque**. IDAM accepts authorization code with PKCE `S256` from public clients (no client secret) and returns the RFC 9207 `iss` parameter. Its metadata is published per OIDC definition at `{Authority}mga/sps/oauth/oauth20/metadata/{Definition}` (not `/.well-known/openid-configuration`), with introspection (RFC 7662), revocation (RFC 7009) and UserInfo endpoints, RS256 ID tokens, and no `end_session_endpoint` (sign-out uses the IDAM single sign-out page).
- **Still to confirm with the IDAM team:** an immutable user identifier claim (`sub` is the username); how clients renew tokens (`prompt=none` or rotating refresh tokens); `response_mode=query` for the web client; the client credentials grant for middleware and its client authentication method; and WebSEAL junction behaviour for bearer-only calls.

### Token validation

- **Introspection only.** Every access token is validated at the IDAM introspection endpoint (RFC 7662) by an established OAuth 2.0 introspection authentication handler package (approved in Section 19), authenticating as the API's own confidential client with credentials from the secret store. No hand-written token validation code.
- A token is accepted only if the introspection response is `active`, the issuer matches exactly, the expiry has not passed, and its `client_id` is one of the configured DAHC clients (web, mobile or a registered middleware). Tokens issued to any other client are refused. ID tokens are never accepted as API credentials.
- Results are cached, keyed by a hash of the token, for no longer than the token's remaining lifetime and a short configured maximum. A timeout or error from IDAM fails closed: `503` when IDAM is unreachable, `401` for an inactive or rejected token, never open.
- **Identity comes only from the introspection response and UserInfo**, both called by the API. The API never accepts identity, profile or role data in a request body or custom header, and never accepts a custom static key as a credential.
- **Failures:** an invalid, expired or missing token returns `401` with `WWW-Authenticate: Bearer` (RFC 6750) and a ProblemDetails body. A valid token without permission returns `403`. Never a redirect. Log the failure reason code and trace id only, never the token.

### Local authorization

- **Every request:** after introspection, the API loads the local user by the IDAM user identifier and requires the user to be active. Roles come only from that local record, loaded per request, so a deactivation or role change takes effect on the next request, on every channel.
- **Matching:** the IDAM immutable user identifier, stored with a unique constraint. Names, emails, mobile numbers and the Emirates ID are never the match key. IDAM currently puts the username in `sub`; DAHC uses it only if the IDAM team confirms usernames never change or get reused.
- **First sign-in:** after obtaining a token, the client (web or mobile) calls `POST /api/auth/sign-in`. If no local user matches, the API creates one with the **Candidate** role only. No other role is ever granted at sign-in, whatever IDAM sends. Creation stores only the identity attributes the application needs, and is audited (actor, outcome, new user id, never claim values). Every other endpoint requires an existing, active local user; a valid token for an unknown user gets `403` with the code `account.not_registered`.
- **Concurrent first sign-ins:** if two first sign-ins for the same user race, the unique constraint rejects the second insert, and the API reads and uses the user the first one created.
- **Existing users:** a deactivated user is refused and is never re-created or reactivated by signing in again.
- **Roles:** internal only, managed inside the application. Only users with the Administrator role can grant or revoke roles, through API endpoints that check the role on the server, refuse self-elevation and audit every change (who, whom, which role, when).
- **Staff users:** Administrators add and configure users for every role other than Candidate. A staff user is pre-registered by an Administrator with their IDAM user identifier and staff roles before their first sign-in; at first sign-in the API matches the identity to that record, so no Candidate is created, and fills the profile attributes from IDAM. Pre-registration is audited.
- **Candidate is exclusive:** a user holds either the Candidate role alone or one or more staff roles (Administrator, Reviewer and others), never both. Staff roles can be combined with each other.
- **Converting a Candidate to staff:** an Administrator assigns staff roles to an existing Candidate through an explicit, confirmed action. The Candidate role is removed in the same transaction, and the change is audited. Open applications never block the conversion: the confirmation shows the Administrator any applications not yet in a final state, they stay as they are and continue to be processed by other staff, and the conversion audit lists them. All the user's Candidate records are kept but are no longer reachable through a Candidate role.
- **Reverting to Candidate:** removing a user's last staff role never leaves them without a role silently. The Administrator either deactivates the user or explicitly reverts them to Candidate, which removes all staff roles; both are audited.
- **Active role:** a user with more than one role has one **active role**, stored on the user record and always one of the roles they hold. It applies to all their tabs and devices. `GET /api/auth/me` and sign-in return the roles and the active role. `PUT /api/auth/active-role` switches it: the API refuses a role the user does not hold (`403`), saves the switch and audits it. A user with one role always acts in that role.
- **Authorization uses the active role only**, never the union of the user's roles. Every audit record carries the active role ("user X acting as Reviewer"). If an Administrator removes the user's active role, the next request falls back to the user's default role (first held role in a configured order), or `403` when no role is left.
- **Own records:** a staff user can never view, review or change records in which they are the candidate (from before a conversion). The access services enforce this on every request.
- **First administrator:** created by a one-time, audited deployment step that names an existing user, never through sign-in or configuration read at startup.

### Endpoints

- **`AuthController`:** `POST /api/auth/sign-in` (provision a Candidate or match a pre-registered staff user, return the user's profile, roles, active role and preferences) and `GET /api/auth/me` (the same, without provisioning). Both require a valid token.
- **Fallback policy:** requires a valid token and an active local user on every endpoint. Only health checks are anonymous. Role policies protect role-specific endpoints, and resource access goes through one access service per resource boundary.
- **Integration access is opt-in per endpoint:** an endpoint accepts an integration-only token only if it declares a named integration permission policy (below). Without that declaration, an integration-only token gets `403`.
- **Sign-out** is the client's job: it revokes its tokens at the IDAM revocation endpoint, discards them, and navigates to the IDAM end-session page (`EndSessionEndpoint`, the single sign-out page) with `id_token_hint`, a registered `post_logout_redirect_uri` and `state`; IDAM ends its session and returns to the client. The API keeps no session to end. Access tokens stay short-lived, because a token copied before sign-out remains usable until introspection reports it inactive.
- **No antiforgery and no cookies:** bearer tokens in a header are not sent automatically by the browser, so cross-site request forgery does not apply. If a client is served from another origin, CORS allows only exact configured origins, without credentials, and allows the `Authorization` header.

### Third-party integrations

Third-party middleware can call the API in two ways. Both use IDAM-issued bearer tokens validated exactly like every other token; the middleware's secret is used only at the IDAM token endpoint, never sent to the DAHC API, and the API accepts no API keys, static secrets or custom credential headers.

- **Registration:** each middleware is registered as a confidential client of the DAHC definition in IDAM; pattern 1 requires the client credentials grant to be enabled for it. Prefer `private_key_jwt` or mutual TLS client authentication; a client secret is acceptable only if IDAM supports nothing stronger, kept in the middleware's secret store and rotated.
- **Integration client record:** the API keeps an internal **integration client** record per middleware, matched by IDAM client id (unique), holding a name, active flag and a set of internal integration permissions (for example `applications.read-status`). Administrators register, change and deactivate them through audited endpoints. Records are never created automatically, and IDAM scopes, roles or other claims never grant a permission.

**Pattern 1: middleware acting as itself (client credentials grant).**

- The token identifies only the integration client. The API loads the active integration client record on every request; a missing or inactive record gets `403`.
- The client can reach only endpoints that declare one of its integration permissions. It can never reach user-only endpoints (sign-in, `me`, role management, Administrator endpoints).
- The integration client is the actor in audit and in data such as "updated by". People the call concerns are data subjects, never actors.

**Pattern 2: middleware acting on behalf of a signed-in user.**

- The user signs in to IDAM through the middleware (authorization code flow with PKCE, the middleware as a confidential client of the DAHC definition). The resulting access token identifies both the user (subject) and the middleware (client id in the introspection response). Token exchange is not used.
- The API loads both the active local user and the active integration client. The request is allowed only if **both** allow it: the user's internal roles and resource access rules, **and** the client's integration permissions for that endpoint. A user's Administrator role never applies through an integration client unless that client holds the matching permission.
- Delegated tokens never provision users: an unknown user gets `403 account.not_registered`. Users are created only by their own sign-in through a DAHC channel.
- Audit records both identities: user X via integration client Y.

**Never allowed:** a middleware asserting a user's identity in a header or request body (for example `X-User-Id`) alongside its own credentials. A client-credentials token is always treated as pattern 1, whatever the request contains.

**Telling the two apart:** the API classifies each validated token from the introspection response: the web or mobile client id means a user on a DAHC channel; a middleware client id with a user subject means user via integration; a middleware client id from the client credentials grant means integration only (the exact fields are confirmed with the IDAM team). The classification is one shared component, tested for each case; endpoints never inspect raw claims.

**Limits:** a rate-limit partition per integration client, and an optional IP allow-list per integration client from configuration.

### IDAM configuration

All IDAM values are per-environment configuration, validated at startup, with no defaults that point at a real environment:

```json
"Idam": {
  "Authority": "https://<idam-host>/",
  "MetadataAddress": "https://<idam-host>/mga/sps/oauth/oauth20/metadata/<DahcDefinition>",
  "Issuer": "https://<idam-host>/",
  "ApiClientId": "<dahc-api-client-id>",
  "ApiClientSecret": "<from secret store>",
  "WebClientId": "<dahc-web-client-id>",
  "MobileClientId": "<dahc-mobile-client-id>",
  "IntrospectionCacheMaxSeconds": 60,
  "EndSessionEndpoint": "https://<idam-host>/sso_logout.html"
}
```

- The issuer is compared **exactly**, as published in that environment's metadata (including any trailing slash or port). It differs between environments.
- Endpoints are read from `MetadataAddress` over HTTPS, never hard-coded. `EndSessionEndpoint` is configured because IDAM's metadata does not publish one.
- Middleware client ids are not configuration: they come from the integration client records.

### Development-only sign-in

- A local single-factor sign-in (username and a development password from user secrets) exists **only** for testing in the Development environment. It is a separate endpoint, mapped in `Program.cs` only when `app.Environment.IsDevelopment()` is true.
- It issues a short-lived development access token, signed with a development key from user secrets, with its own issuer and the DAHC API audience. Only in Development, the API registers a development JWT bearer scheme and a selector that sends such tokens to it and every other token to IDAM introspection; the result goes through the same classification and local authorization path as an IDAM token. IDAM's own single-factor login is used in every other environment, including staging.
- It can sign in as any existing development user, in any role, including Administrator, and can also issue a development integration-only token or a user-via-integration token for a development integration client, so every operation and both integration patterns can be tested locally. The Development bootstrap creates one development user per role; it never creates users at sign-in, and credentials are never stored in the database or source control.
- Startup outside Development fails if the development sign-in or its issuer is enabled. No development user, key or fake identity is ever a fallback.

## 6. Data access

- Fluent API mapping only, one configuration class per entity. No data annotations in `DAHC.Core`.
- A unique index on the user's IDAM identifier, and on the integration client's IDAM client id.
- `AsNoTracking()` and projections to records for reads. Row-version concurrency where writers can collide; atomic conditional updates or unique constraints for invariants that span rows.
- Public GUID identifiers in URLs and payloads; integer keys stay internal.
- Soft delete (`IsDeleted` plus a global query filter) through a save interceptor. An audit interceptor records actor, action, outcome, time (UTC) and entity id only, never entity values.
- Migrations are applied explicitly during deployment, never at startup.

## 7. Time, time zones and locale

### Storage

- Every point in time (created, updated, signed-in, audit and similar timestamps) is a `DateTimeOffset` in UTC, taken from the injected `TimeProvider.GetUtcNow()`, stored in a `datetimeoffset` column with a zero offset.
- A time the business defines in local terms (for example an appointment at 10:00 in Abu Dhabi) is stored as its UTC instant **plus** the IANA time zone id it was entered in, so it can be shown and recalculated correctly.
- Calendar dates with no time of day (date of birth, a deadline date) use `DateOnly` and are not converted.

### Users and requests

- Each local user has a preferred IANA time zone id and a preferred culture. Defaults come from configuration (Section 19).
- Request localization in `DAHC.API` sets the culture per request from the user's preference, falling back to the `Accept-Language` header and then the default. Only the supported cultures are accepted.
- Invariant globalization mode is off, so time zones and cultures are available on every host operating system.

### API input and output

- The API accepts and returns times as ISO 8601 strings with an explicit offset. Input without an offset is rejected with a validation error.
- Responses return the UTC value. Where a client needs the local value, the response also includes the time zone id used, and the local value with its offset, produced by one shared conversion service in `DAHC.Service` using `TimeZoneInfo`.
- Text the server formats itself (messages, exports, notifications) formats dates, times and numbers with the request culture and the user's time zone. Computation, comparison, sorting and filtering always use UTC.

## 8. Logging

- `DAHC.Logging` configures Serilog by environment:
  - **Development:** rolling file sink `logs/dahc-local-.log`, resolved from the application folder, not the working directory.
  - **All other environments:** Elasticsearch sink (confirm the currently maintained package before choosing it).
- Timestamps in logs are UTC. Enrich every entry with trace id (W3C trace context), request id, user id and machine name. Use constant message templates.
- Log each failure once, where the request ends, without provider exception messages. Never log credentials, tokens, IDAM claims, Emirates ID or other personal data, or request bodies.
- Audit events stay separate from operational logs.

## 9. Configuration and runtime security

- Strongly typed options validated at startup, including the default time zone and supported cultures. Production fails closed when a required secure setting is missing; there are no development fallbacks.
- Secrets come from user secrets locally and a secret store when deployed.
- HTTPS redirection, HSTS, a non-wildcard `AllowedHosts`, CORS only for exact configured client origins, without credentials (Section 5), rate limiting (with a tighter policy on authentication endpoints and a partition per integration client), bounded request sizes and no `Server` header.
- A `CancellationToken` on every I/O method.

## 10. Testing

- xUnit with its built-in asserts, and NSubstitute for substitutes.
- `DAHC.Test.Data` uses the EF Core in-memory provider, with a new database name per test so tests never share state. Use it to test service behaviour over data: filters, ownership checks, projections, soft-delete query filters and time conversion. Do not write tests that rely on database constraints, row versions, transactions or SQL translation; the in-memory provider does not enforce them.
- Write tests first (red, green, refactor) for business rules, authorization decisions (including the IDAM `role` claim being ignored, identity data in a request body being ignored, first-sign-in provisioning with the Candidate role only, pre-registered staff matched without a Candidate, Candidate never held together with a staff role, conversion to staff removing the Candidate role and never blocked by an open application, removing the last staff role requiring deactivation or an explicit revert, active-role switching and fallback, authorization by the active role only, staff never acting on their own Candidate records, refusal of deactivated users, refusal of self-elevation, tokens issued to non-DAHC clients refused, introspection inactive or unreachable failing closed, web and mobile tokens following the same path, integration-only tokens refused on endpoints without an integration permission, user-via-integration requests requiring both the user's role and the client's permission, delegated tokens never provisioning users, and asserted user headers being ignored), security-sensitive negative paths, time-zone and locale conversion, and the response contract. No tests for mappings, framework behaviour, DI wiring or trivial code.
- Use a fake `TimeProvider` for anything time-dependent, including tests across a daylight-saving change in a zone that has one.
- Test names follow `Scenario_ExpectedOutcome`, with arrange / act / assert separated by blank lines.
- A test authentication handler replaces IDAM in `DAHC.Test.API` only; production startup refuses to load it.

---

## 11. Required output

### Section 1: Overview

A Mermaid diagram of the projects, their references and the test projects.

### Section 2: Solution tree

The directory tree for the first vertical slice only: the solution-level build and code-style settings, authentication (bearer token validation, provisioning and the development sign-in), time and locale handling, and one sample business feature (a `Request` entity a signed-in user can create and list). Include only files the slice needs. Give each file one line explaining its role.

### Section 3: Code

Complete, compiling code for:

1. `Result` / `Result<T>` in `DAHC.Service` and `ApiResponse<T>` in `DAHC.API`, plus the controller translation from result to HTTP response.
2. The `Request` entity in `DAHC.Core` and its `IEntityTypeConfiguration<Request>` in `DAHC.Data`, with UTC `DateTimeOffset` timestamps.
3. The `IRequestService` interface in `DAHC.Service` and its EF Core implementation in `DAHC.Data`, using `DahcDbContext` directly.
4. The time-zone and locale conversion service in `DAHC.Service`, and the request localization setup in `DAHC.API`.
5. The environment-dependent Serilog setup in `DAHC.Logging`.
6. The introspection authentication registration (and the Development-only JWT scheme and selector), the token classification component (user, integration only, user via integration), the per-request local user, role and integration client loading, the integration permission policies, `AuthController`, the development-only sign-in endpoint and its issuer, and the startup check that blocks them outside Development.
7. One test from each test project: a time-conversion rule in `DAHC.Test.Service`, an ownership filter with the in-memory provider in `DAHC.Test.Data`, and an envelope plus anonymous-versus-authenticated check in `DAHC.Test.API`.

## 12. Execution rules

- Follow the attached standard for formatting, naming, explicit types, `this.` for private fields, sealed types, nullability, async, exceptions and comments.
- Every package used must be listed in Section 19 below. Do not add any other package.
- Do not invent requirements beyond this prompt. If something essential is missing, list it as an open question after the code rather than guessing.

---

## Section 19 of the standard, for this project

| Decision | Value |
|---|---|
| Solution prefix | `DAHC` |
| Host type(s) | ASP.NET Core Web API (headless). Clients: Angular web app now; other channels later |
| Modules | Split by business area (`DAHC.<Module>.<Layer>`); approved deviation D-17, see the standard's section 30 |
| Target framework | .NET 10 (LTS) |
| Database engine | SQL Server |
| Identity provider and flow | IDAM (DAHC IBM Security Verify Access OpenID Connect provider) is the single source of truth for identity and authentication, offering single-factor login and UAE PASS. Web and mobile clients sign in with authorization code and PKCE; access tokens are opaque and validated by introspection; the API is a resource server. A local development-only sign-in exists for testing. |
| User provisioning and roles | Unknown IDAM identities become Candidates on first sign-in. Administrators pre-register staff users with their roles; staff roles can be combined; Candidate is exclusive: an Administrator converts a Candidate to staff by an explicit action that removes the Candidate role. One server-stored active role per user; authorization uses the active role only. Roles are internal only; the IDAM `role` claim is ignored. The first Administrator is created by a deployment step. |
| Third-party integrations | Middleware registered in IDAM as confidential clients. Acting as itself: client credentials grant, permissions from an internal integration client record. Acting for a user: user signs in through the middleware (or token exchange); the user's roles and the client's permissions must both allow the request. No API keys or asserted user headers. |
| Mobile app | An IDAM public (native) client using authorization code with PKCE through the system browser; calls the API with the IDAM access token, exactly like the web app. |
| Time and locale | UTC storage; default time zone `Asia/Dubai`; supported cultures `ar-AE` and `en-AE`, default `en-AE` |
| Sensitive data classes | Emirates ID, IDAM claims and personal data, credentials, client secrets and keys, and tokens |
| Approved packages and frameworks beyond the defaults | EF Core SQL Server provider; an OAuth 2.0 introspection authentication handler (licence checked before adoption); JWT bearer handler (Development scheme only); Serilog with the file and Elasticsearch sinks; xUnit; NSubstitute; `Microsoft.AspNetCore.Mvc.Testing`; EF Core in-memory provider (test projects only) |
| Approved deviations from this standard (with reason) | Data tests use the EF Core in-memory provider instead of the production database engine, to keep tests fast and free of infrastructure. Constraints, row versions, transactions and SQL translation are therefore not covered by automated tests and must be checked in review and in a staging environment on SQL Server. |
