# DAHC backend

ASP.NET Core Web API (.NET 10) for the DAHC GME admission platform. Built to `dahc-engineering-standards (2).md`; decisions D-01 to D-23 are in `Open-Questions.md`; the API shape is `Contracts/openapi/openapi.editor.yaml`.

## Build, test, run

`dotnet` is pinned by `global.json` (SDK 10.0.404). From `backend/`:

```sh
dotnet build DAHC.slnx                      # zero warnings; warnings and style violations fail the build
dotnet format DAHC.slnx --verify-no-changes
dotnet test --solution DAHC.slnx            # Microsoft Testing Platform (see global.json)
dotnet run --project src/DAHC.API --launch-profile https
```

Development starts without IDAM or SQL Server: `GET /health` answers, a request without a token gets `401`, and a request with an opaque token gets `503` because the placeholder IDAM (`idam.invalid`) is unreachable. Database-backed endpoints need SQL Server and a schema (see "Not included").

Settings come from `appsettings*.json`, user secrets locally (`UserSecretsId` `dahc-api-development`) and the secret store when deployed. The IDAM UserInfo field names for the profile attributes are configured in `Idam:UserInfoClaims`. Outside Development the app refuses to start without `Idam:*` (including `Idam:ApiClientSecret`), `ConnectionStrings:Dahc`, `DahcLogging:ElasticsearchEndpoint` and an exact `AllowedHosts`.

Development-only sign-in: set `DevelopmentSignIn:Enabled`, `DevelopmentSignIn:SigningKey` (32+ characters) and `DevelopmentSignIn:Password` in user secrets, then `POST /api/v1/development/sign-in` with `{ "subject", "password", "displayName", ... }` (or `clientId` for an integration token). It is mapped only in Development; startup elsewhere fails if it is enabled or configured.

## Projects

| Project | Role |
|---|---|
| `src/DAHC.Service` | Shared application layer: `Result`/`Result<T>`, paging and cursors, access context (`CurrentUser`, roles, token classification), time-zone conversion. References nothing. |
| `src/DAHC.Data` | The one `DahcDbContext`, entity configurations per module, audit and soft-delete interceptors, `ops` entities, `AddDahcData()`. |
| `src/DAHC.Logging` | Serilog: rolling file in Development, Elasticsearch elsewhere. |
| `src/DAHC.Identity.Core` / `.Service` / `.Data` | Candidates, staff users, roles, duplicate accounts; sign-in, active role, per-request user loading. |
| `src/DAHC.Catalog.Core` / `.Service` / `.Data` | Cycles, programs, specialties, training sites; catalog discovery. |
| `src/DAHC.Applications.Core` / `.Service` / `.Data` | Applications and preferences; draft create/read/list/save, dashboard. |
| `src/DAHC.API` | Composition root, controllers, envelope and ProblemDetails, authentication and authorization, localization, options, hardening. |
| `tests/DAHC.Test.Service` | Business rules without I/O. |
| `tests/DAHC.Test.Data` | Data services on the EF Core in-memory provider, a new database per test. |
| `tests/DAHC.Test.API` | `WebApplicationFactory<Program>`: response contract and security boundaries. |

## What this slice covers (F0 + D1)

- `POST /api/v1/auth/sign-in`, `GET /api/v1/auth/me`, `PUT /api/v1/auth/active-role` (US-1.1.1, US-1.1.2): introspection, token classification, per-request user and roles, Candidate provisioning, pre-registered staff matching, duplicate-account check (`409 account.duplicate`), 9-digit candidate number.
- `GET /api/v1/programs`, `/programs/{programId}/specialties`, `/specialties/{specialtyId}/sites` (US-1.3.1).
- `GET`/`POST /api/v1/applications`, `GET`/`PATCH /api/v1/applications/{applicationId}`, `GET /api/v1/me/dashboard` (US-1.3.1, US-1.3.11 core save, US-1.2.1): one active application per cycle, `Idempotency-Key`, `ETag`/`If-Match` (428/412), application number `<year><7 digits>`.
- Cross-cutting: envelope and ProblemDetails, `X-Request-ID`, `en-AE`/`ar-AE`, audit and soft delete, security headers, HSTS, CORS, rate limits, bounded requests, `GET /health`.

## Not included, and why

| Not included | Blocked by / comes with |
|---|---|
| Application sections and form schema (`/sections`, `/form-schema`, `sections` in PATCH) | OQ-02 (form-schema design) |
| EF Core migrations | EF Core design-time tools are not an approved package (standard s.30); the model is ready for an initial migration once they are approved |
| Development bootstrap of one user per role | Needs a database; with the slice's migrations |
| Attachments, payments, submission, withdrawal, reinstatement, appeals | Later D2 slices; OQ-07 (FileNet timing) |
| Staff, referee, admin endpoints, lookups, integration permissions | Later slices (D3-D5); no endpoint in this slice declares an integration permission, so integration tokens get `403` |
| Middleware acting for a user | D-21 |
| Auto-save, reminders, archiving (`BackgroundService`) | Later US-1.3.11 slices (D-18) |
