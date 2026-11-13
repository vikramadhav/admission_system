# DAHC Engineering Standards: .NET API and Angular

Applies to all code in the DAHC solution: the .NET Web API (`/backend`) and the Angular workspace (`/frontend`). It is the only standards document. Decisions specific to this implementation are collected in section 30; anything not listed there follows the rules below.

Rules that a tool can enforce are enforced by the build and code-style settings in the appendices. Where the .NET rules deliberately differ from Microsoft's defaults, section 17 says so.

---

# Part 1: .NET API

## 1. Project setup

- Shared build settings are defined once for the whole solution (Appendix A): one target framework, nullable reference types, implicit usings, analyzers and warnings as errors. Upgrade all projects together.
- Package versions are defined once for the whole solution (central package management, with transitive pinning on). Projects reference packages without versions. If a transitive dependency is vulnerable, pin the patched version centrally with a comment naming the advisory. NuGet audit warnings fail the build.
- No new package without review. A package that adds a new capability or framework needs an approved entry in section 30.
- Every project, assembly and namespace starts with `DAHC` (`DAHC.<Layer>`). Namespaces follow the assembly and folder.
- The build has zero warnings. Nullable and analyzer warnings are defects, not noise.

## 2. Solution structure and dependencies

```text
DAHC.Core  <-  DAHC.Service  <-  DAHC.Data, DAHC.Logging  <-  DAHC.API
```

| Project | Layer | Responsibility |
|---|---|---|
| `DAHC.Core` | Domain | Entities, value objects, enums and domain constants. References nothing: no EF Core, no ASP.NET Core, no data annotations. |
| `DAHC.Service` | Application | Use-case service interfaces and their logic that needs no I/O, immutable request/response/result records, the `Result` types, the local authorization rules, and time-zone and locale conversion. References `DAHC.Core` only. |
| `DAHC.Data` | Infrastructure | `DahcDbContext`, one `IEntityTypeConfiguration<T>` per entity, migrations, save interceptors, and the EF Core implementations of the `DAHC.Service` interfaces, using `DahcDbContext` directly. Registered through one `AddDahcData()` extension. |
| `DAHC.Logging` | Infrastructure | Serilog configuration only. Registered through one `AddDahcLogging()` / `UseDahcLogging()` pair. |
| `DAHC.API` | Host | `Program.cs` composition root, controllers, the response envelope, the exception handler, authentication and authorization setup, request localization, options validation, security headers and rate limiting. |
| `DAHC.Test.Service` | Tests | Unit tests of business rules. |
| `DAHC.Test.Data` | Tests | Tests of data services with the EF Core in-memory provider. |
| `DAHC.Test.API` | Tests | `WebApplicationFactory<Program>` tests of endpoints, the response contract and security boundaries. |

- `DAHC.API` references `DAHC.Data` and `DAHC.Logging` only to call their registration methods. Controllers depend only on `DAHC.Service` interfaces and records, never on `DahcDbContext` or entities.
- Interfaces exist only at real boundaries: a `DAHC.Service` interface implemented in `DAHC.Data` because it needs the database, an external system, or a genuine second implementation. No interface for a class with a single in-process implementation.
- Vendor SDK code stays behind one interface, in one folder of one project. Vendor types never cross that boundary; map them to DAHC records first, and turn SDK exceptions into safe results inside that folder.
- No circular references. No project reference, package, folder or placeholder file added because a later feature *might* need it.
- No catch-all `Shared` or `Common` project. Each type lives in the project that owns it.
- Test projects exist where they protect real behaviour; they do not mirror production projects 1:1.

## 3. Formatting and layout

- File-scoped namespaces (`namespace DAHC.Service.Requests;`).
- One public type per file, named after the type. Several small related records may share one file (for example `RequestModels.cs`).
- Allman braces on every block, including one-line `if`, `else`, `for`, `foreach` and `using` blocks.
- Four-space indentation, no tabs. A blank line between members, and before a `return` that follows other statements.
- `using` directives at the top, outside the namespace, `System.*` first. No unused usings.
- When a call or signature doesn't fit on one line, put **each** parameter or argument on its own line:

  ```csharp
  public async Task<AccessResult> CheckReadAccessAsync(
      int userId,
      Guid requestId,
      CancellationToken cancellationToken)
  ```

- In a multi-condition `if`, put each condition on its own line, starting the continuation line with the operator. Use parentheses whenever `&&` and `||` are mixed.
- No `#region`. Run `dotnet format` before committing; the build reports formatting violations.

## 4. Naming

| Element | Style | Example |
|---|---|---|
| Namespace, type, method, property, event, constant, enum member | PascalCase | `RequestAccessService`, `MaxPageSize` |
| Interface | `I` + PascalCase | `IRequestService` |
| Parameter, local variable | camelCase | `requestId` |
| Private field | camelCase, no underscore, always referenced with `this.` | `this.dbContext = dbContext;` |
| Async method | `Async` suffix (not on test methods) | `ListAvailableAsync` |
| Boolean | reads as a question | `IsActive`, `HasAccepted` |
| Test method | `Scenario_ExpectedOutcome` | `SecondClaimOnLastSlot_IsRejected` |

- Every name is meaningful, including lambda parameters: `.Where(assignment => assignment.UserId == userId)`, not `x => x.UserId`.
- No abbreviations unless better known than the full word (`Id`, `Url`, `Http`).
- No Hungarian notation and no type names inside variable names (`userList` → `users`).
- Use the business's own terms for domain names, consistently, in code and in tests.

## 5. Readability: explicit over clever

- Prefer explicit types to `var`. Use `var` only where the type can't reasonably be written (anonymous types).
- Prefer named local variables to long chained or nested expressions. A value worth computing is worth naming.
- Prefer `if`/`else` to nested ternaries. A single ternary is fine when both branches are simple.
- Prefer a short sequence of statements to one compressed pattern-matching expression:

  ```csharp
  User? user = await this.userDirectory.FindByIdentifierAsync(identifier, cancellationToken);

  if (user is null)
  {
      return SignInResult.NotRegistered();
  }

  SignInResult result = CreateSignInResult(user);

  return result;
  ```

- Keep methods small and focused on one job. Extract a block into a well-named private method instead of commenting it.
- Return early to avoid deep nesting.
- Use modern syntax where it reads more clearly: collection expressions, `switch` expressions for mapping a value, raw string literals, target-typed `new()` when the type is on the left.

## 6. Types and modelling

- `sealed` by default for classes and records. Unseal only when inheritance is designed for.
- `record` for immutable data: request, response and result models, snapshots of query results.
- Normal `class` for entities and objects with behaviour or mutable state.
- `static class` for stateless helpers (validation, normalization, formatting), each focused on one concern.
- Public collection properties and return values use read-only interfaces (`IReadOnlyList<T>`, `IReadOnlyCollection<T>`). Never return a mutable internal list.
- Use `required` and `init` for objects that must be complete when created.
- Enums for fixed sets of values defined in code; never magic strings or integers. Values the business must be able to change come from configuration or reference data, not enums.
- `decimal` for money and exact quantities; never `float` or `double`.
- Identifiers exposed outside the server (URLs, payloads, client state) are public GUIDs, never integer database keys. Resolve them at the API boundary, then check access (section 15).

## 7. Nullability

- Nullable reference types stay enabled. Never `#nullable disable`, and no blanket `!`.
- Mark optional values with `?` and handle the null case where it arises.
- Null checks use `is null` / `is not null`, never `== null`. Review enforces this.
- The null-forgiving operator `!` is allowed only where you can prove the value isn't null and the compiler can't, with a comment saying why.
- Check arguments at public boundaries (`ArgumentNullException.ThrowIfNull`, `ArgumentException.ThrowIfNullOrWhiteSpace`).

## 8. Async

- All I/O is async: database, file system, network, external processes. Never block on async code (`.Result`, `.Wait()`, `GetAwaiter().GetResult()`).
- Pass a `CancellationToken` through every application and infrastructure method that does I/O, as the last parameter.
- Cancellation stops work before it commits. Business audit is written inside the same transaction as the operation. Work that records something that already happened (bookkeeping after a commit, compensating actions) passes `CancellationToken.None` on purpose, with a comment.
- No `async void`, except framework-required event handlers. No fire-and-forget in request code: background work goes through a durable mechanism (for example a scheduled-work table) processed by a hosted `BackgroundService`.
- `ConfigureAwait(false)` is not used in application code.

## 9. Dependency injection

- Constructor injection with `private readonly` fields. Everything is registered explicitly in the composition root: no assembly scanning or reflection-based registration.
- Choose lifetimes deliberately. Never inject a scoped service into a singleton; a `BackgroundService` creates a scope per unit of work.

## 10. Things we do not add

Not used anywhere in the solution:

- Unit of Work or repository implementations or interfaces, generic or specific. Services use `DahcDbContext` directly.
- Command/query workflows, command or query handlers, orchestrators, pipelines, buses or CQRS structure.
- MediatR or any other mediator library.
- FluentValidation or any validation framework. Data annotations on request records at the API boundary, explicit business-rule checks in services.
- AutoMapper or any object mapper. Map by hand.
- Domain events, state-machine frameworks, base controllers or base services.
- Custom authentication, authorization, testing, logging or cryptography frameworks.
- Dynamic rule, form or workflow engines; scripting or expression evaluators.
- Message brokers or background job frameworks. A built-in `BackgroundService` is the tool.
- Abstractions or extension points for features that don't exist yet.

An exception needs a concrete, current requirement that can't be met otherwise, and an approved entry in section 30.

## 11. Data access

- One `DahcDbContext`. Fluent API mapping only, one configuration class per entity; no data annotations in `DAHC.Core`. Migrations are checked in and applied explicitly during deployment, never at startup.
- Migrations seed reference and configuration data only. The Development bootstrap may create local users and roles for testing, never credentials or real personal data.
- Read-only queries use `AsNoTracking()`. Lists, reports and exports project to records instead of loading whole entities.
- Never build SQL by joining strings. Use EF Core or parameterized queries only.
- Check that the caller may access a record **before** reading or changing it. Never trust an id the client sent.
- Keep transactions small. Row-version concurrency where writers can collide. Optimistic concurrency never protects an invariant that spans rows: use an atomic conditional update, a unique constraint or an explicit lock, and name in a comment which one protects each invariant.
- After a handled concurrency or constraint conflict, clear the change tracker before any retry.
- Records that must stay auditable are never hard-deleted: they are marked `IsDeleted` by a save interceptor and hidden by a global query filter. Tables that grow without bound are purged by scheduled database jobs outside the application.
- An audit interceptor records actor, action, outcome, time (UTC) and entity id, never entity values.
- User-supplied query input (search text, filters, page sizes) is bounded before it reaches EF Core.
- Unique indexes on the user's IDAM identifier and on the integration client's IDAM client id.

## 12. API response contract

### Success and empty

- Every successful endpoint returns an immutable `ApiResponse<T>` envelope, defined in `DAHC.API`:
  - **Success** (`200 OK` or `201 Created`): typed data, plus pagination metadata for lists.
  - **Empty** (`200 OK`): only for collections with no items. An empty collection and a stable message code (for example `requests.none_active`), resolved for the request's culture.

### Errors

- Errors are **not** wrapped in the envelope. They are RFC 7807 `ProblemDetails` at the top level (`application/problem+json`) with a stable business error code, a localized safe message and the trace id.
- A single resource that does not exist, or that the caller may not see, returns the same `404`, so a refusal never reveals whether a record exists.
- Services return results (success, empty, validation failure, not found, conflict) and never throw for expected outcomes. Controllers translate each result with one shared method.
- The global exception handler handles unexpected failures only: it logs once and returns a `500` ProblemDetails with the trace id and a safe message.
- The API is channel-neutral: no endpoint, response shape or message is specific to one client.

## 13. Errors, logging, audit and configuration

### Exceptions

- Catch only what the block can handle. `catch (Exception)` belongs only at boundaries: startup, the outermost request or worker handler, a background loop that must survive, and calls into third-party SDKs.
- Narrow catches with exception filters: `catch (Exception exception) when (IsTransientDatabaseFailure(exception))`.
- When you wrap an exception, pass the original as `innerException`. The message names the operation that failed, never a guessed cause.
- Rethrow with `throw;`, never `throw ex;`. No empty catch blocks.

### Logging a failure once

- Data services catch database failures and rethrow them wrapped in one DAHC exception type that keeps the original as the inner exception, names the operation (`"<Service>.<Method>"`) and carries only safe facts (SQL error numbers, entity types, SQL with parameter names only). Lower layers wrap and rethrow; they don't log.
- One boundary component writes the entry: what the caller was doing, the request, the trace id shown to the user, and the exception chain **without messages** (type, HResult and stack trace of each exception). Database and identity-provider messages can quote stored values, so they are never logged.
- A failure caused by the client disconnecting is logged at `Information`.
- Framework log categories that repeat the same failure with the provider message are raised so the failure isn't logged twice.

### Logging in general

- Serilog, configured only in `DAHC.Logging`: a rolling file sink in Development (resolved from the application folder, not the working directory) and the Elasticsearch sink everywhere else. Timestamps are UTC.
- Constant message templates: `logger.LogInformation("Request {RequestId} submitted by {UserId}.", requestId, userId)`. Never interpolate strings into log messages.
- Every entry carries the trace id (W3C trace context), request id, user id and machine name.
- Refusals are logged at `Warning` with the reason code. Business writes go to the audit trail, not to `Information` logs.
- Never log credentials, tokens, IDAM claims, Emirates ID or other personal data, request bodies or raw external payloads. Log ids and trace ids.
- Values from a request are cleaned before logging, to prevent log injection.

### Audit

- Authentication, authorization and business events are audited with actor, action, outcome, time and non-sensitive references. For a middleware acting for a user, both identities are recorded.
- Audit records never contain request bodies, credentials, tokens, personal data payloads or exported row data. Audit stays separate from operational logs, and the application never deletes from either.

### Configuration

- Strongly typed options validated at startup (`ValidateDataAnnotations()`, `ValidateOnStart()`), so a bad value stops the application with a message naming the setting, never its value.
- Secrets come from user secrets locally and the secret store when deployed, never from configuration files or source control.
- Production startup fails closed when a required secure setting is missing or unsafe. There are no development fallbacks.

## 14. Time, time zones and locale

- Every point in time is a `DateTimeOffset` in UTC, from the injected `TimeProvider.GetUtcNow()`, stored with a zero offset. Never `DateTime.Now`, `DateTime.UtcNow`, `DateTimeKind.Local` or server-local time.
- A time the business defines locally (for example an appointment at 10:00 in Abu Dhabi) is stored as its UTC instant **plus** the IANA time zone id it was entered in.
- Calendar dates without a time of day use `DateOnly` and are not converted. Times of day use `TimeOnly`.
- Each user has a preferred IANA time zone and culture; defaults come from configuration (section 30). Request localization sets the culture from the user's preference, then `Accept-Language`, then the default; only supported cultures are accepted. Invariant globalization mode is off.
- The API accepts and returns ISO 8601 strings with an explicit offset; input without an offset is a validation error. Responses return UTC and, where a client needs it, the local value with its offset and the time zone id, produced by one conversion service in `DAHC.Service`.
- Text the server formats (messages, exports, notifications) uses the request culture and the user's time zone. Computation, comparison, sorting and filtering always use UTC.

## 15. Security

### Authentication: IDAM

- **IDAM** (the DAHC IBM Security Verify Access OpenID Connect provider) is the single source of truth for identity and authentication. Its login offers single-factor authentication and UAE PASS; both end in the same IDAM tokens. The API never talks to UAE PASS and never runs a sign-in flow.
- Every client signs the user in with IDAM and calls the API with the IDAM access token in `Authorization: Bearer <token>`. The API is a **resource server**: no sessions, no authentication cookies, no antiforgery. Tokens in query strings, form fields or cookies are rejected.
- IDAM access tokens are **opaque**. Every token is validated at the IDAM introspection endpoint by the approved introspection handler (section 30), authenticating as the API's own confidential client. No hand-written token validation code.
- A token is accepted only if the introspection response is `active`, the issuer matches exactly, it has not expired, and its `client_id` is a DAHC client (the web client or a registered integration client). ID tokens are never accepted.
- Introspection results are cached, keyed by a hash of the token, for no longer than the token's remaining lifetime and a short configured maximum. IDAM errors fail closed: `503` when IDAM is unreachable, `401` for an inactive or rejected token.
- **Identity comes only from introspection and UserInfo**, both called by the API. The API never accepts identity, profile or role data in a request body or custom header, and never accepts API keys or static secrets.
- An invalid, expired or missing token returns `401` with `WWW-Authenticate: Bearer` and a ProblemDetails body; a valid token without permission returns `403`. Never a redirect. Tokens are never logged.
- IDAM settings are per-environment configuration: the authority, the per-definition metadata address, the exact issuer (including any trailing slash or port), the API client id and secret (secret store), the web client id, the introspection cache maximum and the end-session page. Endpoints are read from the metadata address, never hard-coded.

### Local authorization

- After introspection, the API loads the local user by the IDAM user identifier and requires the user to be active. Roles come only from the DAHC database, loaded per request, so deactivation or a role change takes effect on the next request.
- **Roles are internal only.** The IDAM `role` claim and any group or entitlement claim are never read, stored or used.
- The match key is the IDAM immutable user identifier, unique in the database. Names, emails, mobile numbers and the Emirates ID are never the match key.
- **First sign-in:** the client calls `POST /api/auth/sign-in`. If no local user matches, the API creates one with the **Candidate** role only and audits it. The API calls IDAM UserInfo itself, checks that its `sub` matches the token, and refreshes the stored profile attributes from it at every sign-in; users never edit those attributes in DAHC. Every other endpoint requires an existing, active user; an unknown user gets `403 account.not_registered`.
- Concurrent first sign-ins are resolved by the unique index: the second insert fails and the API uses the user the first one created.
- A deactivated user is refused and never re-created or reactivated by signing in.
- Only Administrators grant or revoke roles, through endpoints that check the role on the server, refuse self-elevation and audit every change. The first Administrator is created by a one-time, audited deployment step, never through sign-in.
- **Staff users:** Administrators add and configure users for every role other than Candidate. A staff user is pre-registered by an Administrator with their IDAM user identifier and staff roles before their first sign-in; at first sign-in the API matches the identity to that record, so no Candidate is created, and fills the profile attributes from IDAM. Pre-registration is audited.
- **Candidate is exclusive:** a user holds either the Candidate role alone or one or more staff roles (Administrator, Reviewer and others), never both. Staff roles can be combined with each other.
- **Converting a Candidate to staff:** an Administrator assigns staff roles to an existing Candidate through an explicit, confirmed action. The Candidate role is removed in the same transaction, and the change is audited. Open applications never block the conversion: the confirmation shows the Administrator any applications not yet in a final state, they stay as they are and continue to be processed by other staff, and the conversion audit lists them. All the user's Candidate records are kept but are no longer reachable through a Candidate role.
- **Reverting to Candidate:** removing a user's last staff role never leaves them without a role silently. The Administrator either deactivates the user or explicitly reverts them to Candidate, which removes all staff roles; both are audited.
- **Active role:** a user with more than one role has one **active role**, stored on the user record and always one of the roles they hold. It applies to all their tabs and devices. `GET /api/auth/me` and sign-in return the roles and the active role. `PUT /api/auth/active-role` switches it: the API refuses a role the user does not hold (`403`), saves the switch and audits it. A user with one role always acts in that role.
- **Authorization uses the active role only**, never the union of the user's roles. Every audit record carries the active role ("user X acting as Reviewer"). If an Administrator removes the user's active role, the next request falls back to the user's default role (first held role in a configured order), or `403` when no role is left.
- **Own records:** a staff user can never view, review or change records in which they are the candidate (from before a conversion). The access services enforce this on every request.
- A fallback policy requires a valid token and an active user on every endpoint; only health checks are anonymous. Role policies protect role-specific endpoints, and record-level access goes through one access service per resource.

### Third-party integrations

- Each middleware is a confidential client of the DAHC definition in IDAM. Its credentials are used only at the IDAM token endpoint, never sent to the API. `private_key_jwt` or mutual TLS is preferred over a client secret.
- The API keeps an internal **integration client** record per middleware (unique IDAM client id, name, active flag, integration permissions). Administrators manage these records through audited endpoints; they are never created automatically, and IDAM scopes or claims never grant permissions.
- **Acting as itself** (client credentials grant): the integration client is the actor. It can call only endpoints that declare one of its permissions, never user-only or Administrator endpoints.
- **Acting for a user** (the user signs in to IDAM through the middleware): the request needs **both** the user's roles and the client's permission. Delegated tokens never create users. Audit records "user X via client Y".
- A user identity asserted in a header or body by a middleware is never accepted.
- One shared component classifies each token (user, integration only, user via integration) from the introspection response. Endpoints never inspect raw claims.
- Rate limits are partitioned per integration client, with an optional IP allow-list per client.

### Development-only sign-in

- A local single-factor sign-in exists **only** in Development, mapped only when `app.Environment.IsDevelopment()` is true. It issues short-lived tokens from a separate development issuer (key from user secrets) for any development user or integration client. A Development-only JWT scheme validates them, and they then follow the same authorization path.
- Startup outside Development fails if the development sign-in or its issuer is enabled.

### Input, output and runtime hardening

- Validate every input model at the boundary and again in the service for business rules. Stored free text rejects control and bidirectional-format characters.
- File names supplied for file access are restricted to a known folder and allowed extensions; resolve the full path and confirm it is still inside that folder.
- Generated spreadsheets and CSV files force user strings that could be formulas to text; export file names are reduced to safe characters.
- No custom cryptography. Never disable TLS certificate validation. Single-use tokens are random, short-lived, stored hashed and consumed once.
- HTTPS redirection and HSTS; a non-wildcard `AllowedHosts`; CORS only for exact configured client origins, without credentials, allowing the `Authorization` header; no `Server` header; bounded request bodies, headers, form values and JSON depth.
- Rate limiting partitioned by user, integration client or client address, with tighter policies on authentication and export endpoints.

## 16. Comments and documentation

- `/// <summary>` on public types and on members whose purpose isn't obvious from the name.
- Comment only non-obvious business rules, security decisions and technical constraints: the **why**, not the what.
- No comments about implementation history, no commented-out code, no comments that restate the code.

## 17. Differences from Microsoft defaults

| Topic | Microsoft default | This standard | Note |
|---|---|---|---|
| Private fields | `_camelCase` | `camelCase`, referenced with `this.` | Appendix B enforces this one. Never mix the two. |
| `var` | allowed when the type is obvious | explicit types preferred | Favours reading code in reviews and diffs. |
| Primary constructors | allowed for classes | records only; classes use explicit constructors | Keeps injected fields `readonly`. |
| Async suffix | on all async methods | not on test methods | Test names describe the scenario. |

## 18. .NET testing

> Write only tests that protect meaningful business, security, validation, concurrency or integration behaviour. Never add a test just to raise coverage.

- xUnit with its built-in asserts, and NSubstitute for substitutes.
- Write tests first (red, green, refactor) for business rules, authorization decisions, security-sensitive negative paths, time-zone and locale conversion, and the response contract.
- Cover at least: first sign-in creating a Candidate only; a pre-registered staff user matched without creating a Candidate; a user never holding Candidate and a staff role together; conversion to staff removing the Candidate role in the same transaction and never blocked by an open application; removing the last staff role requiring deactivation or an explicit revert; switching to a role not held refused; authorization using the active role only; a removed active role falling back; staff never acting on their own Candidate records; deactivated users refused; self-elevation refused; the IDAM `role` claim ignored; identity data in a request body ignored; tokens for non-DAHC clients refused; introspection inactive or unreachable failing closed; integration-only tokens refused on endpoints without an integration permission; user-via-integration requests requiring both permissions; delegated tokens never creating users.
- `DAHC.Test.Data` uses the EF Core in-memory provider, with a new database name per test. Use it for filters, ownership checks, projections, soft-delete filters and time conversion. Do not write tests that rely on constraints, row versions, transactions or SQL translation; those are checked in review and on staging against SQL Server (section 30).
- `DAHC.Test.API` replaces IDAM with a test authentication handler; production startup refuses to load it.
- A fake `TimeProvider` for anything time-dependent, including a daylight-saving change in a zone that has one.
- Arrange / act / assert, separated by blank lines. One behaviour per test. `[Theory]` for variations of the same rule.
- **Don't test:** property assignments, constructors without logic, constants, pass-through methods, framework or ORM behaviour, DI wiring, or near-duplicates.

---

# Part 2: Angular

## 19. Workspace

| Project | Responsibility |
|---|---|
| `projects/dahc-ui` | The component library, design tokens, theme engine, layout system and accessibility primitives. |
| `projects/dahc-playground` | Interactive documentation: preview, configure, test and copy every component. |
| `projects/dahc-portal` | The DAHC web application, built only from `dahc-ui`. |
| `tests/playwright` | Playwright configuration, page objects and specs. |

- One pinned Angular major version for the whole workspace, upgraded together.
- Angular, TypeScript, HTML and SCSS only. No third-party runtime package unless listed in section 30.

## 20. TypeScript and Angular code

- TypeScript `strict` mode and Angular strict templates on (Appendix C). No `any`. No non-null assertion (`!`) without a comment saying why.
- Standalone components only, no NgModules. `OnPush` change detection everywhere. Signals for component state, inputs and outputs. Typed reactive forms.
- Selector prefix `dahc-`, class prefix `Dahc` for library components.
- File names kebab-case with the Angular type suffix (`request-list.component.ts`, `auth.service.ts`). One component, service or directive per file.
- Classes and types PascalCase; functions, variables and properties camelCase; constants that never change UPPER_SNAKE_CASE only for true module-level constants.
- Meaningful names, including arrow-function parameters (`requests.filter(request => request.isActive)`).
- `inject()` for dependencies. Services hold no UI state that belongs to a component.
- Prefer small functions, early returns, explicit return types on public methods, and `readonly` where values don't change.
- No business rules or authorization decisions in the client. Route guards and hidden elements are a usability aid; the API decides.
- No commented-out code; comments only for the why.

## 21. Design tokens, themes and layout

- Tokens are defined once as SCSS maps in `dahc-ui`: color, typography scale, spacing, radius, elevation, motion, breakpoints and z-index. Components use only the CSS custom properties generated from them, never raw values.
- Light and dark themes ship with the library. A custom theme is a set of token overrides under `[data-theme="<name>"]`, with no component changes. A `ThemeService` sets `data-theme`, follows `prefers-color-scheme` until the user chooses, and remembers the choice in `localStorage`.
- Every theme meets WCAG 2.2 AA contrast. Motion tokens respect `prefers-reduced-motion`.
- Layout and spacing use CSS logical properties only (`margin-inline-start`, never `margin-left`). Every component works in both `dir="ltr"` and `dir="rtl"`.
- Layouts work from 320 px wide and at 200% zoom without horizontal page scrolling.

## 22. Component library

- No third-party UI libraries or CSS frameworks (Bootstrap, Angular Material, NG-ZORRO, PrimeNG, Tailwind CSS or similar). Angular CDK is not used; accessibility primitives (focus trap, focus restore, live announcer, id generator) are built in `dahc-ui` and shared.
- Every component is standalone, configurable through typed signal inputs and outputs, responsive, and themeable through tokens only. The same input names mean the same thing across the library (`size`, `variant`, `disabled`, `invalid`, `label`).
- Every component meets WCAG 2.2 AA and follows the WAI-ARIA Authoring Practices for its pattern: roles, states, keyboard interaction, visible focus and accessible names.
- Form components implement `ControlValueAccessor`, work with typed reactive forms and link error and description text with `aria-describedby`.
- Each component lives in its own folder (`.ts`, `.html`, `.scss`) and depends only on the tokens and the shared primitives, so it can be copied into another project.
- The playground has one page per component: live preview, a property inspector for every input and output, theme and direction switchers, every state, accessibility notes, and copy buttons that serve the component's real source files, read at build time. Snippets are never maintained by hand.

## 23. Portal: authentication and HTTP

- Sign-in uses the OpenID Connect authorization code flow with PKCE against IDAM as a public client, through the approved OIDC client library (section 30). Endpoints come from the configured IDAM metadata address; scopes are `openid profile email api`; the redirect URI is sent exactly as registered. No hand-written protocol code.
- Tokens are held in memory only, never in `localStorage`, `sessionStorage`, cookies or URLs. Token renewal follows IDAM's confirmed method (section 30).
- After sign-in the app calls `POST /api/auth/sign-in` and shows screens from the DAHC profile, roles and active role it returns. Users with more than one role get a role switcher; choosing a role calls `PUT /api/auth/active-role`, then reloads menus and route guards and navigates to that role's home page. After a page refresh the active role comes back from `GET /api/auth/me`; the browser never stores it. Candidates never see the switcher. It never decodes tokens for authorization, never uses the IDAM `role` claim and never sends identity data to the API.
- One interceptor adds `Authorization: Bearer <token>` only to requests for the configured API base URL. One interceptor translates `ApiResponse<T>` and ProblemDetails into typed results and shows the localized message with the trace id. `401` starts a new sign-in; `403 account.not_registered` calls the sign-in endpoint; any other `403` shows a not-allowed page.
- Sign-out revokes the tokens at the IDAM revocation endpoint, clears them from memory and navigates to the IDAM end-session page with `id_token_hint`, the registered post-logout redirect URI and `state`.
- The development build may use the API's development-only sign-in; that option is compiled only into the development build.
- IDAM addresses, client id, redirect URIs, API base URL and scopes come from per-environment configuration, never hard-coded.

## 24. Portal: locale, time and security

- Arabic and English through `@angular/localize`, one build per locale, with `lang` and `dir` set on the root element.
- Dates and times are formatted by one DAHC pipe built on `Intl.DateTimeFormat`, using the active locale and the user's IANA time zone. Angular's `DatePipe` is not used for zoned times. The app always sends ISO 8601 strings with an explicit offset.
- The app runs under a strict Content Security Policy with Trusted Types; component styles get a per-request nonce through `CSP_NONCE`; `connect-src` lists only the API and the IDAM token, UserInfo and revocation endpoints.
- No `innerHTML` with unsanitized content, and no `bypassSecurityTrust*` calls.
- No tokens or personal data in `localStorage`, `sessionStorage`, cookies or URLs. `localStorage` holds display preferences only (theme).

## 25. Angular testing

- Playwright validates the UI. Component behaviour (keyboard, focus, ARIA states, form integration, outputs) is tested through each component's playground page, in light and dark themes and in both directions.
- Automated accessibility checks run on every playground page and the main portal screens.
- Visual regression screenshots per component, state, theme and direction are generated in one pinned container image.
- Portal end-to-end tests run against the API in Development through the development-only sign-in, for a user of each role. Tests never call IDAM or UAE PASS.
- Page Object Models for the portal; one spec file per component for the playground. Locate elements by role and accessible name first, `data-testid` only as a fallback.

---

# Part 3: Shared

## 26. Definition of done

1. Review the existing code before changing it. Work on a feature branch, never directly on `main`.
2. Keep the change within its scope.
3. `dotnet build` with no warnings and `dotnet format --verify-no-changes` passes; the Angular build and lint pass with no warnings.
4. `dotnet test` and the Playwright suite pass.
5. Run the application and try the changed flow, including its negative and error cases, in both languages where the UI changed.
6. Read the logs for unexpected exceptions or leaked sensitive data.
7. Review every changed file. Remove debug output, dead code, temporary code, obsolete comments and unused packages.
8. Update this document in the same change if a rule or a section 30 decision changed.
9. Commit only intended changes. Never commit secrets, local databases, user-secret files, certificates, IDE state, build output or logs.
10. Never rewrite shared history or force-push.

## 27. Sensitive data

- Sensitive data: Emirates ID, IDAM claims and personal data, credentials, client secrets and keys, and tokens.
- Sensitive data never appears in logs, exception text, audit records, URLs or browser storage.
- Database encryption, access control, backups and any field-level protection are deployment responsibilities.

## 28. Packages and versions

- Every package, .NET or npm, is listed in section 30 before use, pinned to an exact version and covered by the vulnerability audit in the build.

## 29. Changing this document

- Changes are made in the same pull request as the code that needs them, and reviewed like code.

## 30. DAHC decisions

| Decision | Value |
|---|---|
| Prefix | `DAHC` (.NET), `dahc-` / `Dahc` (Angular) |
| Backend | ASP.NET Core Web API (headless) on .NET 10 (LTS), SQL Server, EF Core code-first |
| Frontend | Angular, one pinned major version; standalone components |
| Identity provider | IDAM: single source of truth for identity and authentication, single-factor login and UAE PASS. Authorization code with PKCE for the web client; opaque access tokens validated by introspection; the API is a resource server |
| User provisioning and roles | First sign-in of an unknown identity creates a Candidate. Administrators pre-register staff users with their roles; staff roles can be combined; Candidate is exclusive: an Administrator converts a Candidate to staff by an explicit action that removes the Candidate role. One server-stored active role per user, switched by the user; authorization uses the active role only. Roles are internal only; the IDAM `role` claim is ignored. The first Administrator is created by a deployment step |
| Third-party integrations | IDAM confidential clients; client credentials for acting as themselves; user sign-in through the middleware for acting for a user; internal integration client records and permissions |
| Time and locale | UTC storage; default time zone `Asia/Dubai`; cultures `ar-AE` and `en-AE`, default `en-AE` |
| Accessibility | WCAG 2.2 AA, WAI-ARIA Authoring Practices |
| Approved .NET packages | EF Core SQL Server provider; EF Core in-memory provider (tests only); an OAuth 2.0 introspection authentication handler (licence checked before adoption); JWT bearer handler (Development scheme only); Serilog with the file and Elasticsearch sinks; xUnit; NSubstitute; `Microsoft.AspNetCore.Mvc.Testing` |
| Approved npm packages | Angular framework packages including `@angular/localize`; Angular build and test tooling; one OpenID-certified Angular OIDC client library (to be named); Playwright; `@axe-core/playwright` (tests only) |
| Not approved | Angular CDK and any UI, CSS or behaviour library; repository/Unit of Work, CQRS, MediatR, FluentValidation, AutoMapper |
| Deviation | Data tests use the EF Core in-memory provider instead of SQL Server. Constraints, row versions, transactions and SQL translation are checked in review and on staging |
| Deviation: modules (D-17) | The solution is split by business area (`DAHC.<Module>.<Layer>`, e.g. `DAHC.Applications.Core`, `DAHC.Portfolio.Data`) instead of the single `DAHC.Core/Service/Data` set in section 2. Reason: the admissions domain has nine areas with separate owners, schemas and delivery order (`docs/architecture/overview.md`). The dependency direction within each module is unchanged. There is still one `DahcDbContext` (section 11), in a shared data project; each module contributes its entity configurations (D-22) |
| Deviation: candidate and staff records (D-04, D-14) | Candidates and staff users are separate records rather than one user record with roles. A person who is both has a staff record linked to their candidate record by UUID; the own-records rule in section 15 uses that link. "Converting a Candidate to staff" therefore means an Administrator pre-registers a linked staff record; the candidate record and its applications are kept |
| API base path (D-12) | `/api/v1`; the authentication endpoints are `/api/v1/auth/sign-in`, `/api/v1/auth/me` and `/api/v1/auth/active-role` |
| Pending packages (D-08, OQ-08) | Open-source libraries for Excel export and CASPER Excel import, OpenAPI code generation, malware scanning and the Rhapsody client: each to be named, pinned and licence-checked here before use |
| Pending IDAM confirmation | Immutable user identifier (`sub` is currently the username); token renewal method; `response_mode=query`; client credentials grant and client authentication method; WebSEAL junction behaviour |

---

## Appendix A: Shared .NET build settings

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

`EnforceCodeStyleInBuild` makes the Appendix B rules fail the build. `GenerateDocumentationFile` lets the build report unused usings; CS1591 is suppressed because section 16 asks for XML docs only where they add something.

## Appendix B: Code-style settings

This appendix is the source for the solution's code-style settings; changes are made here first and then applied.

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

csharp_style_namespace_declarations = file_scoped
csharp_new_line_before_open_brace = all
csharp_new_line_before_else = true
csharp_new_line_before_catch = true
csharp_new_line_before_finally = true
csharp_prefer_braces = true
csharp_using_directive_placement = outside_namespace
dotnet_sort_system_directives_first = true
dotnet_diagnostic.IDE0161.severity = warning
dotnet_diagnostic.IDE0011.severity = warning
dotnet_diagnostic.IDE0065.severity = warning
dotnet_diagnostic.IDE0005.severity = warning
dotnet_diagnostic.IDE0055.severity = warning

csharp_style_var_for_built_in_types = false
csharp_style_var_when_type_is_apparent = false
csharp_style_var_elsewhere = false
dotnet_diagnostic.IDE0008.severity = suggestion

dotnet_style_prefer_collection_expression = true
csharp_style_prefer_primary_constructors = false
dotnet_style_readonly_field = true
dotnet_diagnostic.IDE0044.severity = warning

dotnet_naming_style.pascal.capitalization = pascal_case
dotnet_naming_style.camel.capitalization = camel_case
dotnet_naming_style.begins_with_i.required_prefix = I
dotnet_naming_style.begins_with_i.capitalization = pascal_case
dotnet_naming_style.ends_with_async.required_suffix = Async
dotnet_naming_style.ends_with_async.capitalization = pascal_case

dotnet_naming_symbols.interfaces.applicable_kinds = interface
dotnet_naming_symbols.async_methods.applicable_kinds = method
dotnet_naming_symbols.async_methods.required_modifiers = async
dotnet_naming_symbols.constants.applicable_kinds = field, local
dotnet_naming_symbols.constants.required_modifiers = const
dotnet_naming_symbols.private_fields.applicable_kinds = field
dotnet_naming_symbols.private_fields.applicable_accessibilities = private
dotnet_naming_symbols.types_and_members.applicable_kinds = namespace, class, struct, enum, delegate, method, property, event
dotnet_naming_symbols.parameters_and_locals.applicable_kinds = parameter, local

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
dotnet_diagnostic.IDE1006.severity = warning

dotnet_diagnostic.CA2016.severity = warning
dotnet_diagnostic.CA1849.severity = warning
dotnet_diagnostic.CA2200.severity = error
dotnet_diagnostic.CA2254.severity = warning
dotnet_diagnostic.CA1848.severity = suggestion
dotnet_diagnostic.CA1310.severity = warning
dotnet_diagnostic.CA2007.severity = none
```

Test projects add these overrides, scoped to the test projects only:

```ini
[*.cs]
dotnet_naming_rule.async_methods_end_in_async.severity = none
dotnet_naming_rule.types_and_members_pascal.severity = suggestion
dotnet_diagnostic.CA1707.severity = none
```

## Appendix C: TypeScript and Angular compiler settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true,
    "extendedDiagnostics": {
      "defaultCategory": "error"
    }
  }
}
```
