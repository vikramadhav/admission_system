# C# / .NET Engineering Standards

Applies to: all C# solutions on modern .NET, whatever the host type (MVC or Razor Pages web app, Web API, worker service, desktop app, console tool or class library).

This document combines the coding standard, coding practices and architecture principles into one source. It covers how code is structured, written, secured, logged and tested. It is the only standards document. Facts specific to a project (the solution prefix, the module list, the identity provider, the database engine, sensitive data classes and any approved deviation) are recorded in section 19.

Rules that a tool can enforce are enforced by the build settings in Appendix A and the code-style settings in Appendix B. Where this standard deliberately differs from Microsoft's defaults, section 15 says so.

---

## 1. Project setup

- Shared build settings are defined once, for the whole solution (Appendix A). Every project gets the same target framework, nullable reference types, implicit usings, analyzers and warnings-as-errors. Upgrade all projects together.
- Package versions are defined once, for the whole solution (central package management, with transitive pinning on). Projects reference packages without versions. If a transitive dependency is vulnerable, pin the patched version centrally with a comment naming the advisory. NuGet audit warnings fail the build like any other warning.
- No new package without review and, where it introduces a new capability or framework, an approved entry in section 19.
- One short technical prefix for solutions, projects, assemblies and namespaces (`<Prefix>.<Module>.<Layer>`, or `<Prefix>.<Layer>` for a single-module solution), recorded in section 19. Namespaces follow the assembly and folder.
- The build has zero warnings. Nullable and analyzer warnings are defects, not noise.

## 2. Architecture: structure and dependencies

### Layers

Layer by responsibility, and allow dependencies in one direction only:

```text
Domain  <-  Application  <-  Infrastructure  <-  Host (MVC, API, worker, desktop, CLI)
```

- **Domain:** entities, value objects, enums and domain constants. References nothing: no ORM, no web framework, no Infrastructure.
- **Application:** use cases, interfaces at real boundaries, immutable request/response/result records, security abstractions, and business rules that need no I/O. References Domain only.
- **Infrastructure:** database context and migrations, file system, external services and integration adapters. Implements the Application interfaces.
- **Host:** composition root, configuration and transport (controllers, endpoints, views, pages, message handlers, UI). Kept thin: validate input, identify the caller, call a use case, translate the result. A host may reference Domain types it needs at its transport boundary, but business rules never live in the host.
- **Contracts** (only when two separately deployed components talk to each other): one small project of transport records and interfaces. No entities, no data access. Each side references the contracts project, never the other side.
- **Tests:** business, security and integration tests (section 17).

### Dependency rules

- In a modular solution, modules talk to each other only through the other module's public application interface, never through its entities, database context or tables.
- Third-party or vendor SDK code stays behind one interface, in one folder of one project. It is the only code that calls the SDK. Vendor types never cross that boundary; map them to your own records first, and turn SDK exceptions into your own safe results or status codes inside that folder.
- No circular references. No project reference, package, folder or placeholder file added because a later feature *might* need it.
- No catch-all `Shared` or `Common` project. Put each type in the project that owns it. Code genuinely used by several modules gets a named owner, approved and recorded in section 19.

## 3. Formatting and layout

- File-scoped namespaces (`namespace Prefix.Application.Orders;`).
- One public type per file, named after the type. Several small related records may share one file (for example `OrderModels.cs`).
- Allman braces on every block, including one-line `if`, `else`, `for`, `foreach` and `using` blocks.
- Four-space indentation, no tabs. A blank line between members, and before a `return` that follows other statements.
- `using` directives at the top, outside the namespace, `System.*` first. No unused usings.
- When a call or signature doesn't fit on one line, put **each** parameter or argument on its own line:

  ```csharp
  public async Task<AccessResult> CheckReadAccessAsync(
      int userId,
      Guid orderId,
      CancellationToken cancellationToken)
  ```

- In a multi-condition `if`, put each condition on its own line, starting the continuation line with the operator. Use parentheses whenever `&&` and `||` are mixed.
- No `#region`. Run `dotnet format` before committing; the build reports formatting violations (IDE0055).

## 4. Naming

| Element | Style | Example |
|---|---|---|
| Namespace, type, method, property, event, constant, enum member | PascalCase | `OrderAccessService`, `MaxPageSize` |
| Interface | `I` + PascalCase | `IOrderAccessService` |
| Parameter, local variable | camelCase | `orderId` |
| Private field | camelCase, no underscore, always referenced with `this.` | `this.dbContext = dbContext;` |
| Async method | `Async` suffix (not on test methods) | `ListAvailableAsync` |
| Boolean | reads as a question | `IsActive`, `HasAccepted`, `allowCompleted` |
| Test method | `Scenario_ExpectedOutcome` | `SecondClaimOnLastSlot_IsRejected` |

- Every name is meaningful, including lambda parameters: `.Where(assignment => assignment.UserId == userId)`, not `x => x.UserId`.
- No abbreviations unless they are better known than the full word (`Id`, `Url`, `Http`).
- No Hungarian notation and no type names inside variable names (`userList` → `users`).
- Use the business's own terms for domain names, consistently, in code and in tests.

## 5. Readability: explicit over clever

- Prefer explicit types to `var`. Use `var` only where the type can't reasonably be written (anonymous types).
- Prefer named local variables to long chained or nested expressions. A value worth computing is worth naming.
- Prefer `if`/`else` to nested ternaries. A single ternary is fine when both branches are simple.
- Prefer a short sequence of statements to one compressed pattern-matching expression:

  ```csharp
  User? user = await this.userDirectory.FindByUsernameAsync(username, cancellationToken);

  if (user is null)
  {
      return LoginResult.Failed();
  }

  LoginResult result = CreateLoginResult(user);

  return result;
  ```

- Keep methods small and focused on one job. Extract a block into a well-named private method instead of commenting it.
- Return early to avoid deep nesting.
- Use modern syntax where it reads more clearly: collection expressions (`List<int> ids = [];`), `switch` expressions for mapping a value, raw string literals for embedded text, target-typed `new()` when the type is on the left.

## 6. Types and modelling

- `sealed` by default for classes and records. Unseal only when inheritance is intended and designed for.
- `record` for immutable data: request, response and view models, results, transport contracts, snapshots of query results.
- Normal `class` for entities and for objects with behaviour or mutable state.
- `static class` for stateless helpers (validation, normalization, formatting), each focused on one concern.
- Public collection properties and return values use read-only interfaces (`IReadOnlyList<T>`, `IReadOnlyCollection<T>`). Never return a mutable internal list.
- Use `required` and `init` for objects that must be complete when created.
- Use enums for fixed sets of values defined in code; never magic strings or integers. Values the business must be able to change come from versioned configuration or reference data, not enums.
- `decimal` for money and other exact quantities; never `float` or `double`.
- `DateOnly` / `TimeOnly` for calendar dates and times of day. `DateTimeOffset` in UTC for timestamps, taken from `TimeProvider.GetUtcNow()`.
- Identifiers exposed outside the server (URLs, API payloads, client state) are public GUIDs, never integer database keys. Resolve them at the host boundary, then check access (section 13).

## 7. Nullability

- Nullable reference types stay enabled. Never `#nullable disable`, and no blanket `!`.
- Mark optional values with `?` and handle the null case where it arises.
- Null checks use `is null` / `is not null`, never `== null` (an overloaded `==` can change its meaning). No analyzer enforces this; review does.
- The null-forgiving operator `!` is allowed only where you can prove the value isn't null and the compiler can't, with a comment saying why.
- Check arguments at public boundaries (`ArgumentNullException.ThrowIfNull`, `ArgumentException.ThrowIfNullOrWhiteSpace`).

## 8. Async and time

- All I/O is async: database, file system, network, external processes. Never block on async code (`.Result`, `.Wait()`, `GetAwaiter().GetResult()`).
- Pass a `CancellationToken` through every application and infrastructure method that does I/O, as the last parameter.
- Cancellation stops work before it commits. Work that records something that has already happened (audit written after the fact, compensating actions, bookkeeping after a commit) must not be cancelled: pass `CancellationToken.None` on purpose, with a comment. Prefer writing business audit inside the same transaction as the operation, so it needs no separate token.
- No `async void`, except framework-required event handlers. No fire-and-forget (`_ = DoWorkAsync()`) in request code: background work goes through a durable mechanism (for example a scheduled-work table) processed by a hosted `BackgroundService`.
- `ConfigureAwait(false)` is not needed in application code on modern .NET hosts. Use it only in general-purpose libraries.
- Get the time from an injected `TimeProvider`, never from `DateTime.Now` / `DateTime.UtcNow`, so time-dependent logic can be tested deterministically.

## 9. Dependency injection and services

- Constructor injection with `private readonly` fields. Everything is registered in the composition root, explicitly: no assembly scanning or reflection-based registration.
- Create an interface only at a real boundary: an external system, a genuine second implementation (for example strategies or policies registered as keyed services), or a real testing need. Not for a single implementation.
- Choose lifetimes deliberately. Never inject a scoped service into a singleton; a `BackgroundService` creates a scope per unit of work.

## 10. Simplicity: things not to add

Don't add these unless a concrete, current requirement can't be met without them, and the exception is approved and recorded in section 19:

- Mediator libraries, CQRS infrastructure, command/query handler pipelines or buses.
- Generic repositories or unit-of-work wrappers over an ORM that already provides them.
- Object mappers (map by hand), or validation frameworks that duplicate built-in validation.
- Base-class hierarchies for controllers, endpoints, pages or handlers.
- Custom authentication, authorization, testing, logging or cryptography frameworks.
- Dynamic rule, form or workflow engines; scripting or expression evaluators.
- Message brokers or background job frameworks. A built-in `BackgroundService` is the tool.
- A client-side SPA framework where server rendering or a thin client meets the need.
- Abstractions or extension points for features that don't exist yet.

## 11. Data access

- One database context per database. Entity configurations in their own classes. Migrations are checked in and applied explicitly during deployment, never automatically at application startup.
- Migrations seed reference and configuration data only. A development bootstrap may create local authorization records, but never credentials or real personal data.
- Read-only queries use `AsNoTracking()`. Lists, reports and exports project to records (`Select(... => new Model(...))`) instead of loading whole entities.
- Never build SQL by joining strings. Use the ORM or parameterized queries only.
- Check that the caller may access a record **before** reading or changing it (section 13). Never trust an id the client sent.
- Keep transactions small. Use optimistic concurrency (a row version) where two writers can really collide. Optimistic concurrency alone never protects an invariant that spans several rows: use an atomic conditional update, a unique constraint or an explicit lock, and name in a comment which one protects each invariant.
- After a handled concurrency or constraint conflict, clear the change tracker before any retry, so the rejected change is not saved again.
- The application never hard-deletes records that must stay auditable. Mark them `IsDeleted` and hide them with a global query filter. Tables that grow without bound are purged by scheduled database jobs outside the application, with safe criteria agreed for each table.
- Query input supplied by users (search text, filters, page sizes) is bounded before it reaches the ORM.

## 12. Errors, logging and configuration

### Exceptions and results

- Expected outcomes (validation failure, not found, not allowed, conflict) are **results**, not exceptions. The host translates each result into one transport response: a ProblemDetails status and code for an API, a model-state error, status page or redirect for MVC/Razor, an exit code for a CLI.
- Concurrency conflicts and constraint violations that protect an invariant are caught where the operation ends and returned as conflict results.
- Catch only what the block can handle. `catch (Exception)` belongs only at boundaries: startup, the outermost request, message or worker handler, a background loop that must survive, and calls into third-party SDKs.
- Narrow catches with exception filters: `catch (Exception exception) when (IsTransientDatabaseFailure(exception))`.
- When you wrap an exception, pass the original as `innerException`. The message names the operation that failed (`"Reading the signing key file named by 'X' failed"`), never a guessed cause.
- Rethrow with `throw;`, never `throw ex;`. No empty catch blocks, except around a logging call whose failure must not break the response, with a comment saying so.
- Errors shown to users never include stack traces, connection strings, SQL, secrets or SDK internals: a safe message and a reference id only.

### Logging a failure once

A failure is logged **once, where the operation ends**, so one failure is one complete entry.

- Infrastructure methods catch data-access failures and rethrow them wrapped in one project-specific exception type that keeps the original as the inner exception, names the failed operation (`"<Service>.<Method>"`) and carries only facts that are safe to log: provider error numbers, the entity types and states being saved, and the failed SQL with parameter names only. Lower layers wrap and rethrow; they don't log.
- One boundary component (an exception filter, middleware or the outermost worker handler) writes the entry: what the caller was doing, the request or work item, the reference shown to the user (the trace id), and the exception chain **without messages**: type, HResult and stack trace of each exception, plus the meaning of well-known provider error numbers (timeout, deadlock and so on). Messages are included only for exception types that cannot quote stored values.
- Database and identity-provider exception messages can quote stored values, so they are never logged where that is a risk.
- Startup, configuration, cryptography and file failures are logged with the full exception; they name settings and paths, not data. Check each required key, certificate and file step by step at startup so the failure names the step.
- A failure caused by the client disconnecting is logged at `Information`, not `Error`.
- Raise the minimum level of framework log categories that repeat the same failure with the provider message (for example EF Core's command, query and save error categories), so the failure isn't logged twice or with sensitive text.

### Logging in general

- Structured logging with constant message templates: `logger.LogInformation("Order {OrderId} released by {ActorId}.", orderId, actorId)`. Never interpolate strings into log messages.
- Every request, message and worker cycle logs inside a scope that carries the correlation (trace) id. Enrich entries with request id, trace id, user id and server name.
- Log refusals at `Warning` with the reason code. Business writes are recorded in the audit trail, not repeated as `Information` logs; log `Information` at operation boundaries the design names (startup, worker cycles, external calls).
- Never log sensitive data (section 14): credentials, tokens, personal identifiers, health or financial data, full request bodies, or raw payloads from devices, SDKs and external systems. Log ids and correlation ids instead.
- Clean values that come from a request before logging them, to prevent log injection.
- Operational logs stay separate from business and security audit events. The application never deletes from either store.

### Audit

- Audit important authentication, authorization and business events with actor, action, outcome, time and non-sensitive references.
- Audit records never contain request bodies, credentials, tokens, personal data payloads or exported row data.

### Configuration

- Strongly typed options, validated at startup (`ValidateDataAnnotations()`, `ValidateOnStart()`, or a custom validator), so a bad value stops the application with a message naming the setting.
- No secrets in configuration files or source control: user secrets locally, environment variables or a secret store when deployed.
- Production startup fails closed when a required secure setting is missing or unsafe (connection string, host allow-list, trusted origins, signing keys, identity-provider settings, persisted Data Protection keys, trusted certificates). It never falls back to a development fake or default.
- Resolve file paths from a known base (the application or executable folder), never from the current working directory.

## 13. Security architecture

### Authentication

- Use an external identity provider through the platform's standard middleware (OpenID Connect authorization code flow with PKCE for interactive users). An API validates access tokens with the mechanism matching the provider's token format: JWT bearer validation for self-contained JWT access tokens, or token introspection for opaque access tokens. Never write a sign-in form or protocol code for a provider that offers a standard flow. DAHC uses introspection; see section 19, "DAHC IDAM access-token validation".
- Validate everything the protocol requires: state, nonce, signature against the provider's published keys, issuer, audience and lifetime.
- **The provider authenticates; the application authorizes.** A signed-in identity must map to an active local user with a permitted role. Users are not automatically provisioned at sign-in unless an explicit, narrowly scoped project-specific exception is approved in section 19. Provider roles or groups are ignored unless the design explicitly says otherwise.
- Any refusal, provider error, failed validation or failure during the check ends unauthenticated: a safe unauthorized response, with no application session or cookie issued.
- Sessions are checked on every request against server-side state, so deactivation, a role change, sign-out and the absolute session lifetime end access on the next request, even for a copied cookie or token. Store session ids hashed. For stateless bearer tokens, keep lifetimes short and recheck the local user's active state.
- On sign-in, discard pre-login cookies and issue a fresh session identifier (prevents session fixation). Sign-out ends the local session first, then the provider session.
- Development-only sign-in, where explicitly approved in section 19, must be registered and reachable only in Development, never enabled through a runtime flag in deployed environments. Use ASP.NET Core authentication infrastructure and test credentials stored outside source control; reject development-issued tokens in all non-development environments.

### Authorization

- Every protected operation checks authorization on the server, before reading or changing data. Hiding something in a client is never authorization; role-aware navigation is a usability aid only.
- A fallback policy requires authentication everywhere. Anonymous access is opt-in, per action or endpoint, and limited to sign-in, health and error paths.
- Role or permission policies protect specific areas; a project that approves permission-based RBAC (DAHC: section 19) declares permissions on actions instead of checking role names. Resource-level access (does this user have access to this record now?) goes through one shared access service per resource boundary, with separate checks for read and write where they differ (for example a closed record stays readable but not writable).
- Decide access from server-side data only. Never trust ids, roles, flags or channel values sent by the client.
- Services revalidate entity state and ownership on every write; they never assume the host already did.
- Refusals never reveal whether an account or record exists (return the same response as "not found").

### Input, files and output

- Validate every input model at the boundary, and again in the service for business rules. Data from files, devices and external systems is untrusted and validated again on the server.
- Stored free text rejects control and bidirectional-format characters.
- Restrict file names supplied for file access to a known folder and allowed extensions; resolve the full path and confirm it is still inside that folder. Files served by the application live outside the web root and are reachable only through an authorized action.
- Protect generated spreadsheets and CSV files against formula injection (force user strings that could be formulas to text), reduce export file names to safe characters, and generate each export format from one method so columns stay consistent.

### Cryptography and tokens

- No custom cryptography or protocol code. Use the platform and well-known libraries. Never disable TLS certificate validation.
- Single-use tokens are random, short-lived, stored hashed, bound to their owner and purpose, and consumed once; expired, failed or consumed tokens cannot be replayed.
- Signing keys and certificates live outside the application folder and come from the secret store. Data Protection keys are persisted and protected in every non-development environment.

### Web host hardening

For every HTTP host:

- HTTPS redirection and HSTS outside development. A non-wildcard host allow-list in production.
- Suppress the `Server` header. Bound request body size, header sizes, form counts and lengths, and JSON depth.
- Rate limiting: a global limit partitioned by authenticated user or client address, with tighter policies for sign-in, expensive operations and exports.
- Unexpected failures go to a safe error response carrying the reference (trace) id.

For browser-facing hosts (MVC, Razor Pages, server-rendered UI):

- Authentication cookies are `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax` only where a documented cross-site flow requires it), with bounded sliding and absolute expiration. The antiforgery cookie follows the same rules.
- Global antiforgery validation for unsafe methods. State-changing actions are never `GET`.
- Content Security Policy (with Trusted Types where possible), and frame, MIME-sniffing, referrer, permissions, opener, embedder and resource-isolation headers. `no-store` caching for authenticated content.
- Unauthenticated page requests are redirected to sign-in; script requests receive 401.

For API hosts:

- Bearer authentication with full token validation. No cookie authentication unless the API is same-site with its UI, in which case the browser rules above apply.
- CORS only for exact configured origins, never a wildcard with credentials.
- Errors use ProblemDetails with stable codes, without internal detail.

### Hosting under a sub-path

Every generated link, form action, script URL, cookie path and redirect carries the request path base. Supply the path base from configuration when a reverse proxy forwards the prefix unchanged.

## 14. Sensitive data and integrations

### Sensitive-data boundary

- Each project lists its sensitive data classes in section 19 (typically personal identifiers, contact details, health or financial data, credentials, tokens, and raw device or SDK payloads).
- Sensitive data never appears in logs, exception text, audit records or URLs.
- Raw handling of the most sensitive values is isolated in one service, so field-level protection can be added without changing the workflow.
- Database encryption, access control, backup protection and field-level protection are deployment responsibilities.

### Integrations and local companion services

- Each external system or device sits behind one interface in Infrastructure (or in the companion service), per section 2. Map its types, translate its errors into safe status codes and keep its payloads out of logs.
- A placeholder implementation (used until a real SDK or service is available) logs a warning on every use and is rejected by production startup validation.
- A local companion service (for example a workstation device reader) accepts only loopback traffic and exact configured origins, carries no long-lived server secret, and acts only on a short-lived, single-use token signed by the server and verified with a public key in its own configuration. Endpoints it calls are rendered by the server, so no response can redirect the client to another address.
- A companion service is one self-contained folder: every path is resolved relative to its executable and confirmed to stay inside that folder; its secrets are protected at rest.
- Client and service timeouts are explicit and bounded; polling never overlaps and stops at the server-side expiry.

## 15. Differences from Microsoft defaults

Deliberate choices that differ from Microsoft's published defaults. Keep them consistent across the codebase; where a vendor guide or generated code suggests the default, this table wins.

| Topic | Microsoft default | This standard | Note |
|---|---|---|---|
| Private fields | `_camelCase` | `camelCase`, referenced with `this.` | Both are accepted by the analyzers; Appendix B enforces this one. Never mix the two. |
| `var` | allowed when the type is obvious | explicit types preferred | Favours reading code in reviews and diffs, outside an IDE. |
| Primary constructors | allowed for classes | records only; classes use explicit constructors | Explicit constructors keep injected fields `readonly`. |
| Async suffix | on all async methods | not on test methods | Test names describe the scenario. |

## 16. Comments and documentation

- `/// <summary>` on public types and on members whose purpose or rule isn't obvious from the name.
- Comment only non-obvious business rules (with the requirement or rule id, where the project tracks them), security decisions and technical constraints: the **why**, not the what.
- No comments about implementation history (`Phase 1`, `TODO later`, `changed from X`), no commented-out code, no comments that restate the code.
- Keep this document up to date in the same change as the code when a rule or a section 19 decision changes.

## 17. Testing

> Write only tests that protect meaningful business, security, validation, concurrency or integration behaviour. Never add a test just to raise coverage.

- There is no coverage target. Keep the suite fast and readable, and make sure it catches real regressions.
- **Test:** authentication and authorization decisions, resource access rules, important validation and business rules, invariants under concurrency, security-sensitive negative paths (expired or replayed tokens, injection, refusals, existence leaks), and integration points.
- Choose the database used by automated tests deliberately and record it in section 19. Where a project approves an in-memory provider, never claim that its tests validate database-dependent behaviour (relational constraints, transactions, concurrency tokens, sequences, provider-specific SQL or query translation). Verify that behaviour separately against the production engine before release, using a recorded checklist. Never change production persistence logic to suit the test provider. Use focused test doubles at existing boundaries for operations the provider cannot run.
- **Don't test:** property assignments, constructors without logic, constants or enums, pass-through methods, framework or ORM behaviour, DI wiring, or near-duplicates of a rule already covered.
- Arrange / act / assert, with a blank line between each part. One behaviour per test. `[Theory]` with inline data for variations of the same rule.
- Where the project tracks requirements, tag each test with the requirement it protects: `[Trait("Requirement", "REQ-XXX-NNN")]`.
- Use an injected fake `TimeProvider` for anything time-dependent.
- Before merging, review each new test: what regression does it catch, is it already covered, and would deleting it lower confidence? If it doesn't earn its place, delete it.

## 18. Workflow and definition of done

1. Review the existing code before changing it. Work on a feature branch, never directly on `main`.
2. Keep the change within its scope.
3. `dotnet build` the whole solution with no warnings; `dotnet format --verify-no-changes` passes.
4. `dotnet test`, all green.
5. Run the application and try the changed flow, including its negative and error cases.
6. Read the logs for unexpected exceptions or leaked sensitive data.
7. Review every changed file in `git diff`. Remove debug output, dead code, temporary code, obsolete comments and unused packages.
8. Update this document in the same change if a rule or a section 19 decision changed.
9. Commit only the intended changes. Never commit secrets, local databases, user-secret files, certificates, IDE state, build output or logs.
10. Never rewrite shared history or force-push.

## 19. Project-specific decisions

Each project fills in this table and keeps it current. Anything not listed here follows the rules above.

| Decision | Value |
|---|---|
| Solution prefix | DAHC (confirm exact solution/assembly prefix before implementation) |
| Host type(s) | ASP.NET Core 10 Web API; Angular SPA client |
| Modules | |
| Target framework | net10.0 |
| Database engine | SQL Server |
| Identity provider and flow | Deployed environments: IDAM OpenID Connect authorization code + PKCE for Angular; IDAM issues **opaque** access tokens, which the API validates through the IDAM token introspection endpoint (no JWT validation of IDAM tokens). Local Development: development-only single-factor username/password sign-in issuing development bearer tokens. SFA is a factor model, not an alternative authorization scheme. |
| Automated test approach | xUnit with EF Core InMemory for application service and API integration tests (`DAHC.Test.Service`, `DAHC.Test.Data`, `DAHC.Test.API`). SQL-only operations are substituted at existing interfaces (`ICandidateNumberAllocator`, `IApplicationNumberAllocator`). There is no SQL Server, Testcontainers, Docker or LocalDB test dependency. SQL Server behaviour (indexes, foreign keys, concurrent provisioning and application creation, number allocation, `RowVersion`, transactions, migrations, SQL-specific queries) is verified before UAT and before each release that changes schema or invariants, using the release-validation checklist in `docs/audits/02-remediation-plan.md` §2.3. Playwright covers frontend end-to-end tests. Approved 2026-11-12 (AP-09) |
| Sensitive data classes | |
| Approved packages and frameworks beyond the defaults | |
| Approved deviations from this standard (with reason) | **Candidate-only automatic provisioning:** after successful validated OIDC sign-in, the API may create a local account with only the Candidate role when the authenticated identity is eligible for Candidate onboarding. All other roles require explicit administrator-controlled provisioning (configurable RBAC, AP-10; see "DAHC authorization" below). Development-only SFA is permitted for local testing and is disabled outside Development. |

### DAHC authentication and Candidate provisioning constraints

- Only the backend decides Candidate onboarding eligibility; never infer it from an untrusted browser flag or an IDAM role claim. If eligibility is not established by the BRD/approved onboarding policy, stop provisioning and record the decision as a blocker.
- Match a returning user using the validated issuer + subject combination (`iss`, `sub`), not email alone. Enforce uniqueness for the external identity and perform first-time Candidate creation atomically/idempotently so concurrent sign-ins cannot create duplicate users.
- New provisioned users receive **Candidate only**. Existing users retain their locally administered roles; login cannot grant additional privileged roles. No automatic creation of staff, approver, or administrator accounts.
- Never automatically reactivate a disabled, blocked, or deleted user; a prior blocked identity must not bypass restriction by re-provisioning.
- Audit successful/denied provisioning using non-sensitive identity references, action, outcome and trace id; do not log tokens or identity payloads.
- Restrict the development username/password endpoint and token issuer to Development. Store test credentials outside committed configuration and use deliberately seeded non-production users. No development SFA entry points or development token trust in Test/UAT/Production.
- `POST /api/auth/sign-in` performs the authorized local-account lookup/provisioning after token validation; the Angular client never supplies trusted roles or identity claims.

### DAHC IDAM access-token validation (approved architecture, not to be reopened)

Approved 2026-11-12. Recorded as AP-08 in `docs/audits/03-decisions-register.md`. It applies to the backend, Angular, tests and deployment configuration.

1. Angular uses the OIDC authorization code flow with PKCE through the approved OIDC client library.
2. Angular sends the IDAM **access token** as `Authorization: Bearer` to the DAHC API only. The ID token and the access token are different artifacts. The ID token is never sent to the API in place of the access token; its only use is `id_token_hint` at sign-out.
3. IDAM issues opaque access tokens. The API validates them through the IDAM token introspection endpoint configured from the IDAM metadata.
4. No JWT validation of IDAM access tokens. JWT bearer validation exists only for development-issued tokens, in Development (item 10).
5. A token is accepted only when introspection reports it active and the API's own checks pass: unexpired (`exp`), exact issuer (`iss`), bound to a registered DAHC client (`client_id`, plus audience where IDAM returns it), and carrying the required scope(s). Each check uses what IDAM's introspection response supports.
6. Local identities are resolved by the validated issuer + subject (`iss`, `sub`).
7. The server enforces local account activation, the active role and resource-level authorization on every request.
8. Only eligible Candidate accounts are provisioned automatically.
9. Staff accounts require explicit provisioning.
10. Local Development uses a separate development-only SFA mechanism that issues local bearer tokens. It is registered only in Development and is never enabled in a deployed environment. A deployed host refuses to start if any handler other than introspection is registered.
11. Introspection credentials (the API's confidential client id and secret) exist only in the backend: user secrets locally, the secret store when deployed. The Angular client is a public client with no secret.
12. Raw access tokens are never logged or persisted: no request-header logging, no `SaveToken`, and the introspection cache is keyed by a token hash.
13. Introspection calls are protected by:
    - a bounded result cache that never outlives the token's `exp`;
    - a bounded timeout on the `HttpClientFactory` backchannel client;
    - a pre-authentication rate limit, so unauthenticated floods never reach IDAM;
    - a bound on concurrent outbound introspection calls, added only where needed to protect IDAM and the API, using built-in .NET primitives (for example `System.Threading.RateLimiting.ConcurrencyLimiter`).
    
    No resilience package and no custom circuit breaker is added without evidence of need (load testing or observed IDAM instability).
    
    Any introspection failure (error, timeout, malformed or inactive response) ends unauthenticated. An unreachable IDAM returns 503 and is never treated as a valid token.
14. The existing introspection implementation (`DAHC.API/Authentication/Idam/*`, `TokenValidation.cs`) is retained and extended where a gap exists. It is not rebuilt.

### DAHC authorization: configurable permission-based RBAC and active-role switching (approved, not to be reopened)

Approved 2026-11-12 as AP-10 and AP-11 in `docs/audits/03-decisions-register.md`. The design and the endpoint inventory are in `docs/audits/05-rbac-design.md`.

**Roles and permissions**
- Access is granted by **permissions**, never by role names in code. Roles are data in SQL Server and hold permissions. A user may hold several roles, but only the **active role's** permissions apply; they are never combined.
- Permissions are stable business codes (`applications.own.read`, `staff.manage`) defined in `DAHC.Service/Access/Permissions.cs`. They are never URLs or controller or action names, and several actions may share one code.

**Declaring authorization on endpoints**
- Every endpoint declares exactly one of:
  - `[RequirePermission(Permissions.X)]` (ASP.NET Core `IAuthorizationRequirementData`, handled by the existing `AccessAuthorizationHandler`);
  - `[AuthenticatedOnly("reason")]`, a documented exception such as sign-in, `me` or `active-role`;
  - `[AllowAnonymous]`, only on the reviewed list.
- A startup guard and an endpoint-enumeration test enforce this.

**The permission catalog**
- `idn.Permission` is synchronised from the code catalog through reviewed EF Core migrations (`HasData`), applied by the idempotent deployment script.
- New permissions are denied until granted.
- Administrators grant and revoke existing codes only.
- Retired codes are flagged, never deleted, so audit history is kept.

**Loading permissions**
- Effective permissions are loaded once per request with the local user (no per-check query, no IDAM role or token permission claims).
- Deny by default when the role, permission or account state is missing or invalid.
- Any cache must make revocation take effect on the next request (DF-11).

**Checks independent of permissions**
- Ownership, assignment scope, workflow state and business rules are always checked in the service, whatever the permission. Another user's record still returns 404.

**Administration**
- `ADMINISTRATOR` and `CANDIDATE` are system roles.
- **Protected system-administration** permissions (role management and permission grants) belong to `ADMINISTRATOR` only.
- **Delegable administrative** permissions (Staff management, role assignment, read and audit views) may be granted to configurable Staff roles by an `ADMINISTRATOR` (controlled delegation).
- Delegated actors may assign only roles within their own active role's permissions, and can never assign `ADMINISTRATOR`.
- No actor changes their own roles, status or the grants of a role they hold (no self-elevation).
- The last authorized administrator cannot be removed or deactivated.
- The first administrator comes from a controlled bootstrap that never creates a duplicate protected administrator, whether pending or bound.
- Staff are provisioned explicitly, before or after first IDAM login, and bound only through a verified IDAM attribute (B-06, open). There is no automatic Candidate/Staff merge (B-07, open).
- Every administrative and permission change is audited.

**Active-role switching**
- `PUT /api/v1/auth/active-role` validates that the role exists, is active and is assigned.
- `GET /api/v1/auth/me` returns the roles (id, name), the active role and its permissions.
- At initial sign-in, a single valid role is selected automatically; with several, the user selects.
- A revoked or deactivated active role is denied immediately: the selection is cleared and another role must be selected. There is never an automatic switch.


---

## Appendix A: Shared build settings

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <AnalysisLevel>latest</AnalysisLevel>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <NoWarn>$(NoWarn);CS1591</NoWarn>
  </PropertyGroup>
</Project>
```

- `EnforceCodeStyleInBuild` makes the Appendix B code-style rules fail the build, not just show in an IDE.
- `GenerateDocumentationFile` is needed for the build to report unused usings (IDE0005). CS1591 is suppressed because section 16 asks for XML docs only where they add something.
- Set `TargetFramework` to the solution's chosen framework; projects that need another (for example a Windows desktop host) override it locally.

## Appendix B: Code-style settings

This appendix is the source for the solution's code-style settings. Any change is made here first and then applied to the solution.

```ini
root = true

[*]
charset = utf-8
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space

[*.{json,yml,yaml,ts,html,scss,css,csproj,props,targets,xml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.cs]
indent_size = 4

# Layout and formatting
csharp_style_namespace_declarations = file_scoped
csharp_new_line_before_open_brace = all
csharp_new_line_before_else = true
csharp_new_line_before_catch = true
csharp_new_line_before_finally = true
csharp_prefer_braces = true
csharp_using_directive_placement = outside_namespace
dotnet_sort_system_directives_first = true
dotnet_diagnostic.IDE0161.severity = warning   # file-scoped namespaces
dotnet_diagnostic.IDE0011.severity = warning   # braces on every block
dotnet_diagnostic.IDE0065.severity = warning   # usings outside the namespace
dotnet_diagnostic.IDE0005.severity = warning   # unused usings
dotnet_diagnostic.IDE0055.severity = warning   # formatting (fix with dotnet format)

# Explicit types (reviewed, not build-breaking)
csharp_style_var_for_built_in_types = false
csharp_style_var_when_type_is_apparent = false
csharp_style_var_elsewhere = false
dotnet_diagnostic.IDE0008.severity = suggestion

# Modern syntax and fields
dotnet_style_prefer_collection_expression = true
csharp_style_prefer_primary_constructors = false
dotnet_style_readonly_field = true
dotnet_diagnostic.IDE0044.severity = warning   # make fields readonly

# Naming styles
dotnet_naming_style.pascal.capitalization = pascal_case
dotnet_naming_style.camel.capitalization = camel_case
dotnet_naming_style.begins_with_i.required_prefix = I
dotnet_naming_style.begins_with_i.capitalization = pascal_case
dotnet_naming_style.ends_with_async.required_suffix = Async
dotnet_naming_style.ends_with_async.capitalization = pascal_case

# Symbol groups
dotnet_naming_symbols.interfaces.applicable_kinds = interface
dotnet_naming_symbols.async_methods.applicable_kinds = method
dotnet_naming_symbols.async_methods.required_modifiers = async
dotnet_naming_symbols.constants.applicable_kinds = field, local
dotnet_naming_symbols.constants.required_modifiers = const
dotnet_naming_symbols.private_fields.applicable_kinds = field
dotnet_naming_symbols.private_fields.applicable_accessibilities = private
dotnet_naming_symbols.types_and_members.applicable_kinds = namespace, class, struct, enum, delegate, method, property, event
dotnet_naming_symbols.parameters_and_locals.applicable_kinds = parameter, local

# Naming rules (more specific symbol groups win, whatever their order)
dotnet_naming_rule.interfaces_begin_with_i.symbols = interfaces
dotnet_naming_rule.interfaces_begin_with_i.style = begins_with_i
dotnet_naming_rule.interfaces_begin_with_i.severity = warning
dotnet_naming_rule.async_methods_end_in_async.symbols = async_methods
dotnet_naming_rule.async_methods_end_in_async.style = ends_with_async
dotnet_naming_rule.async_methods_end_in_async.severity = warning
dotnet_naming_rule.constants_pascal.symbols = constants
dotnet_naming_rule.constants_pascal.style = pascal
dotnet_naming_rule.constants_pascal.severity = warning
dotnet_naming_rule.private_fields_camel.symbols = private_fields
dotnet_naming_rule.private_fields_camel.style = camel
dotnet_naming_rule.private_fields_camel.severity = warning
dotnet_naming_rule.types_and_members_pascal.symbols = types_and_members
dotnet_naming_rule.types_and_members_pascal.style = pascal
dotnet_naming_rule.types_and_members_pascal.severity = warning
dotnet_naming_rule.parameters_and_locals_camel.symbols = parameters_and_locals
dotnet_naming_rule.parameters_and_locals_camel.style = camel
dotnet_naming_rule.parameters_and_locals_camel.severity = warning
dotnet_diagnostic.IDE1006.severity = warning   # naming rules fail the build

# Reliability
dotnet_diagnostic.CA2016.severity = warning    # forward the CancellationToken
dotnet_diagnostic.CA1849.severity = warning    # no blocking calls in async code
dotnet_diagnostic.CA2200.severity = error      # rethrow keeps the stack trace
dotnet_diagnostic.CA2254.severity = warning    # constant logging templates
dotnet_diagnostic.CA1848.severity = suggestion # LoggerMessage for hot paths
dotnet_diagnostic.CA1310.severity = warning    # explicit StringComparison
dotnet_diagnostic.CA2007.severity = none       # no ConfigureAwait in app code
```

General-purpose class libraries shipped outside the solution override the last rule in their own folder (`dotnet_diagnostic.CA2007.severity = warning`).

Test projects add these overrides, scoped to the test projects only, for the test naming exceptions:

```ini
[*.cs]
dotnet_naming_rule.async_methods_end_in_async.severity = none     # test names describe the scenario
dotnet_naming_rule.types_and_members_pascal.severity = suggestion # allows Scenario_ExpectedOutcome
dotnet_diagnostic.CA1707.severity = none                          # underscores in test names
```
