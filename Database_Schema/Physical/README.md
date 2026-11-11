# Physical Schema — SQL Server 2025

Implements the [logical model](../Logical/README.md). Column-level documentation is in the [data dictionary](../Data%20Dictionary/DATA-DICTIONARY.md). 11 schema scripts plus a seed script, 109 tables across nine schemas.

> **Schema of record (D-01, 2026-11-11).** EF Core migrations are the schema of record. These scripts are the **reference design**: they record the agreed tables, keys, constraints and seed values, and the migrations must reproduce them. When the API contract and this design disagree, the contract decides what an operation does and the database follows (D-21). Decisions D-01 to D-21 are in [Open-Questions.md](../../Open-Questions.md).

## Deploy

Run in SQLCMD mode from this folder (the order is fixed by `Deploy.sql`):

```powershell
sqlcmd -S <server> -E -I -b -i Deploy.sql -v DatabaseName=MbruAdmission
```

| Script | Content |
|---|---|
| `00_Database.sql` | Create database, compatibility level 170, RCSI, ADR, optimized locking, Query Store |
| `01_Schemas.sql` | `cfg`, `idn`, `ops`, `app`, `doc`, `pay`, `ver`, `pfo`, `scr` |
| `02_Reference.sql` | Status lookups, catalog, academic reference, reasons, document types, pools, calendar, scoring configuration |
| `03_Identity.sql` | Candidate, personal profile, duplicate-account pairs, staff, roles, pool membership, integration clients, ICP refresh, candidate change history |
| `04_Operations.sql` | Audit, idempotency, outbox, notifications, job runs |
| `05_Application.sql` | Form schema, application number counter, application, personal snapshot, preferences, sections, lifecycle requests, contact verification |
| `06_Documents.sql` | Attachment metadata, versions and FileNet storage status |
| `07_Payments.sql` | Fees, routing, sessions, bindings, gateway events, reconciliation |
| `08_Verification.sql` | Verification case, assignment, corrections, clarification, screen-out |
| `09_Portfolio.sql` | Rubric, portfolio, status history, rounds, scoring, overrides, discrepancy, appeal |
| `10_Screening.sql` | Score components, CASPER, announcements, bulk screen-out |
| `11_Views.sql` | Finance, referee (anonymised) and candidate-score views |
| `90_Seed_Reference.sql` | Status lookups, payment providers, program categories, staff roles, reason categories, withdrawal and screen-out reasons (idempotent) |

## Physical conventions

| Topic | Convention |
|---|---|
| Keys | Internal `bigint`/`int` `IDENTITY` surrogate keys. API-facing tables add a `PublicId uniqueidentifier DEFAULT NEWSEQUENTIALID()` with a unique constraint, so the API id is opaque and internal keys never leak. Records in different contexts that belong to the same person are linked by UUID (D-14). |
| Business numbers | Candidate number: `char(9)` text from `000000001`, from `idn.CandidateNumberSeq` (D-05, D-13). Application number: `char(11)` = cycle start year + 7-digit counter, e.g. `20270000001`, issued by `app.ApplicationNumberCounter` (D-19). |
| Lookups | Natural `varchar` codes equal to the API enum values; `CHECK` constraints where a full lookup table would be overkill. |
| Times | `datetimeoffset(3)` holding UTC (offset `+00:00`) (D-07). Defaults use `SYSUTCDATETIME()`; its `datetime2` result converts implicitly to `datetimeoffset` with a zero offset, so the defaults stay as they are. Dates without a time use `date`. Deadlines defined in local terms also store the IANA zone in a `TimeZoneId` column (default `Asia/Dubai`): `cfg.ProgramCycle` (application window and grace period), `ver.CorrectionRequest` (correction due date) and `scr.ScoreAnnouncement` (appeal window). |
| Money | `decimal(12,2)`, currency `char(3)` constrained to `AED`. |
| Text | `nvarchar` for anything a person types; `varchar` for codes. Collation `Latin1_General_100_CI_AS_SC`. |
| JSON | Native `json` type (compatibility level 170) for section values, snapshots, rubric schemas, event payloads and raw CASPER rows. The relational form schema validates the values; the engine does not. |
| Concurrency | `rowversion` on hot aggregates; `app.Application.VersionNo` backs the API `ETag`/`If-Match`. RCSI and optimized locking are on. |
| Integrity | Composite foreign keys keep a chosen site inside the chosen specialty. Filtered unique indexes enforce one live application, one open reinstatement request, one current assignment, one paid and one open payment per fee. |
| Immutability | Triggers block change to `ops.AuditEvent`, `pay.PaymentProviderBinding` and a submitted portfolio's answers. |
| Naming | `PK_`, `FK_`, `UQ_`, `CK_`, `DF_`, `UX_` (unique filtered), `IX_`, `TR_` prefixes. |

## Identity

- Candidates (`idn.Candidate`) and staff (`idn.StaffUser`) are separate records (D-04). Both carry the IDAM immutable user identifier `IdamUserId`, which is the only match key at sign-in (standard s.15). It is required and unique for candidates; for staff it is null until a pre-registered user first signs in, and unique when present.
- `idn.IdentityLink` (issuer + subject) has been **removed**: with the identifier on the user record it duplicated the match key and allowed two sources of truth.
- A person who is both staff and candidate is linked by `StaffUser.LinkedCandidatePublicId` (D-14), so staff can be stopped from acting on their own applications.
- The role switcher writes `StaffUser.ActiveRoleCode`; the API checks it is one of the user's current `idn.StaffRoleAssignment` rows. Audit rows carry the active role and, for service calls, the `idn.IntegrationClient`.
- Duplicate accounts (US-1.1.1) are detected at sign-in with the normalised `EmiratesIdNumber`, `PassportNumber` and `MobileNumber` (not hashed, D-25). These are indexed but deliberately not unique, so the duplicate account can be stored and the pair reported in `idn.DuplicateAccountPair`.

## Security and privacy posture

- The database holds no credentials, OTP codes, card data or file binaries. Contact and withdrawal OTPs are held by the OTP provider; `app.ContactVerification` stores only a hash of the value being verified.
- Personal information is held once per candidate in `idn.CandidatePersonalProfile` (D-10); PII columns are marked `-- PII` in the script. Each submitted application keeps a snapshot in `app.ApplicationPersonalSnapshot` (D-15). Old and new values of personal-data changes go to `idn.CandidateChangeHistory` (D-06); `ops.AuditEvent` never holds values.
- Referees read through `pfo.vw_RefereePortfolio`, finance through `pay.vw_FinancePayment` (the US-1.3.13 list columns only), candidates through `scr.vw_CandidateAnnouncedScore`. **Grant database roles on these views, not on the base tables.**
- Recommended, not yet scripted: Always Encrypted or dynamic data masking on the PII columns of `idn.CandidatePersonalProfile`, `idn.Candidate.Email`/`MobileNumber`, `app.ApplicationPersonalSnapshot.SnapshotJson` and `idn.CandidateChangeHistory`; row-level security on staff pools; a retention/purge job once the retention policy is approved.

## Tables added on 2026-11-11

| Table | Purpose | Decision / story |
|---|---|---|
| `cfg.DocumentType` | Uploadable document types with allowed media types and maximum size | US-1.3.x, US-2.3.1 |
| `idn.CandidatePersonalProfile` | Personal information per candidate | D-10, US-1.3.3 |
| `idn.DuplicateAccountPair` | Duplicate accounts found at sign-in, for the supervisor report | D-04, US-1.1.1 |
| `idn.StaffWorkPool` | Staff membership of work pools (target lists, referee eligibility) | US-2.2.x, US-3.2.x |
| `idn.IntegrationClient`, `idn.IntegrationClientPermission` | Service-to-service callers and their permissions | Standard s.15 |
| `idn.CandidateChangeHistory` | Old/new values of personal-data changes | D-06, US-2.5.3 |
| `app.ApplicationNumberCounter` | Per-cycle application number counter | D-19 |
| `app.ApplicationPersonalSnapshot` | Personal information as submitted | D-15 |
| `app.ScreenOutReinstatement` | Supervisor's direct reinstatement of a screened-out application | STP-2.5 rules 5-6 |
| `app.ContactVerification` | OTP check of a changed contact e-mail or mobile | US-1.3.3 AC11 |
| `pfo.PortfolioStatusHistory` | Portfolio status changes, to restore the status after on-hold | BRD Portfolio Status, US-2.5.2 |
| `pfo.RoundScoreOverride` | Senior-referee override of a round total | US-3.2.2 (OQ-06 open) |

Removed: `idn.IdentityLink`. Removed column: `cfg.AdmissionCycle.ApplicationIdSuffix` (the `<CandidateNumber>-G27` format is replaced by D-19).

## Validation status

The previous version (97 tables, 145 foreign keys) was deployed end to end on SQL Server 2025 Express (17.0.1000.7) into a scratch database, the seed data loaded and the `ops.AuditEvent` append-only trigger exercised.

The 2026-11-11 revision (109 tables, 177 foreign keys, 3 views, 4 triggers) has **not** been deployed: no SQL Server was available. It was checked statically: every foreign key targets a primary or unique key of a table created earlier in deploy order with matching column types, every column named in a key, index, filter or `CHECK` exists, constraint, default and index names are unique, and no `datetime2` columns remain. Deploy it to a scratch database before generating the EF Core baseline migration.

## Known follow-ups

- Seed data for program, specialty and site catalog comes from the BRD appendix and is not loaded yet; neither are document types or correction-note templates.
- Rubric content (questions, classifications, rejection reasons) is per cycle and needs product-owner sign-off.
- Reinstatement rejection reasons have no BRD list (OQ-04); the category exists but has no codes.
- Personal identification documents (photo, passport, Emirates ID copies) are still attached to an application; with D-10 they may belong to the candidate instead.
- Refunds, interview, shortlisting and offer entities are intentionally absent.
