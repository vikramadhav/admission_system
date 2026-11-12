---
paths:
  - "src/backend/**"
---

# Backend rules

Follow `docs/dotnet-engineering-standards.md`. Project decisions are in its §19; architecture baselines BL-01 to BL-12 are in the register.

## Structure

- Modular monolith: `DAHC.<Module>.Core / .Service / .Data`, with dependencies pointing Core ← Service ← Data ← API.
- One `DahcDbContext`, with schemas `idn`, `cfg`, `app` and `ops`.
- Explicit business process services with persisted status. No mediator, CQRS bus, generic repository or workflow engine.
- Expected outcomes are `Result<T>`. The host maps them to the `ApiResponse<T>` envelope or a ProblemDetails `{code, traceId, errors[]}`.

## Data

- Public GUID (v7) ids go in the API; integer keys stay internal.
- Concurrency uses `VersionNo` ETag + If-Match (428/412) and `RowVersion`.
- Multi-row invariants use unique or filtered indexes or HOLDLOCK, and are named in a comment.
- Creates honour `Idempotency-Key`.
- Only the migrations owner creates or merges migrations, one at a time.

## Testing (AP-09)

- Use xUnit with EF Core InMemory, building on the existing projects:
  - `DAHC.Test.Service`;
  - `DAHC.Test.Data` (`TestDatabase`);
  - `DAHC.Test.API` (`DahcApiFactory`).
- Test business rules, validation, authorization (wrong role → 403, another user's record → 404), workflow transitions and error mapping. Use the injected fake `TimeProvider`.
- No coverage targets and no redundant tests. Each test must protect a named rule.
- Do not add Testcontainers, Docker-based SQL Server or LocalDB as test dependencies.
- InMemory does **not** validate any of these:
  - unique or filtered indexes;
  - foreign keys;
  - transactions or rollback;
  - `RowVersion` or concurrency tokens;
  - sequences or number allocation;
  - concurrent provisioning or creation;
  - migrations or SQL-specific queries.

  Never claim them in a test. Add them to the release-validation checklist (`docs/audits/02-remediation-plan.md` §2.3).
- SQL-only operations are substituted at existing interfaces (`ICandidateNumberAllocator`, `IApplicationNumberAllocator`, NSubstitute). Never change production persistence logic to suit InMemory.
- Tag tests `[Trait("Requirement", "US-x.y.z/AC-n")]`.

## Build

- `dotnet build` must have 0 warnings (`TreatWarningsAsErrors`).
- `dotnet format --verify-no-changes` must be clean.
- The SDK is pinned in `global.json` (10.0.404).
