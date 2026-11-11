# Data Dictionary - MBRU Unified Admission Platform (GME Release 5)

Complete dictionary of the SQL Server 2025 physical database: every table, column and constraint with a plain-language explanation. It covers 109 tables, 823 columns and 490 constraints and rules. Table and column facts are read from the SQL scripts in `Physical/` (the reference design; EF Core migrations are the schema of record); the explanations come from `Tools/descriptions.json`. For entity relationships and business context see the [logical model](../Logical/README.md); for deployment see the [physical README](../Physical/README.md).

| Schema | Domain | Tables | Columns |
|---|---|--:|--:|
| `cfg` | Reference and configuration | 30 | 144 |
| `idn` | Identity | 11 | 129 |
| `app` | Application | 18 | 147 |
| `doc` | Documents | 2 | 30 |
| `pay` | Payments | 6 | 53 |
| `ver` | Verification | 8 | 66 |
| `pfo` | Portfolio scoring | 19 | 116 |
| `scr` | Screening and announcement | 9 | 64 |
| `ops` | Operations (audit, outbox, jobs) | 6 | 74 |

## How to read this document

| Item | Meaning |
|---|---|
| **Null** | Y if the column may be empty, N if a value is required. |
| **Key** | PK is the primary key; FK shows the table the value must exist in. |
| **Default** | Value used when none is supplied. `sysutcdatetime()` is the current UTC time. |
| `PublicId` | Opaque identifier used by the API. Internal numeric keys are never exposed. |
| `...Code` columns | Natural codes that equal the API enum values (see `Contracts/openapi/openapi.yaml`). |
| `...Json` columns | Native `json` type. Structure is defined by the versioned form schema or rubric, not by the database. |
| **UNIQUE ... WHERE** | A filtered unique index: uniqueness applies only to rows matching the condition, which is how rules such as one live application per candidate and cycle are enforced. |
| **TRIGGER** | Code that runs on data change, used here for immutability and referee rules. |
| Times | All times are `datetimeoffset(3)` stored in UTC (offset +00:00); `TimeZoneId` columns hold the IANA zone of locally defined deadlines. Money is `decimal(12,2)` in AED. |

## Contents

- **`cfg`** - Reference and configuration
  - [cfg.AdmissionCycle](#cfgadmissioncycle)
  - [cfg.AnnouncementStatus](#cfgannouncementstatus)
  - [cfg.ApplicationStatus](#cfgapplicationstatus)
  - [cfg.Country](#cfgcountry)
  - [cfg.Degree](#cfgdegree)
  - [cfg.Discipline](#cfgdiscipline)
  - [cfg.DocumentType](#cfgdocumenttype)
  - [cfg.GpaConversionBand](#cfggpaconversionband)
  - [cfg.GpaConversionSet](#cfggpaconversionset)
  - [cfg.PaymentProvider](#cfgpaymentprovider)
  - [cfg.PaymentStatus](#cfgpaymentstatus)
  - [cfg.PortfolioRoundStatus](#cfgportfolioroundstatus)
  - [cfg.PortfolioStatus](#cfgportfoliostatus)
  - [cfg.Program](#cfgprogram)
  - [cfg.ProgramCategory](#cfgprogramcategory)
  - [cfg.ProgramCycle](#cfgprogramcycle)
  - [cfg.ProgramDegree](#cfgprogramdegree)
  - [cfg.ProgramSpecialty](#cfgprogramspecialty)
  - [cfg.ReasonCategory](#cfgreasoncategory)
  - [cfg.ReasonCode](#cfgreasoncode)
  - [cfg.ScoringWeightItem](#cfgscoringweightitem)
  - [cfg.ScoringWeightSet](#cfgscoringweightset)
  - [cfg.Specialty](#cfgspecialty)
  - [cfg.SpecialtySite](#cfgspecialtysite)
  - [cfg.SystemParameter](#cfgsystemparameter)
  - [cfg.TrainingSite](#cfgtrainingsite)
  - [cfg.University](#cfguniversity)
  - [cfg.VerificationStatus](#cfgverificationstatus)
  - [cfg.WorkingCalendarDay](#cfgworkingcalendarday)
  - [cfg.WorkPool](#cfgworkpool)
- **`idn`** - Identity
  - [idn.AccessRole](#idnaccessrole)
  - [idn.Candidate](#idncandidate)
  - [idn.CandidateChangeHistory](#idncandidatechangehistory)
  - [idn.CandidatePersonalProfile](#idncandidatepersonalprofile)
  - [idn.DuplicateAccountPair](#idnduplicateaccountpair)
  - [idn.IcpRefreshRequest](#idnicprefreshrequest)
  - [idn.IntegrationClient](#idnintegrationclient)
  - [idn.IntegrationClientPermission](#idnintegrationclientpermission)
  - [idn.StaffRoleAssignment](#idnstaffroleassignment)
  - [idn.StaffUser](#idnstaffuser)
  - [idn.StaffWorkPool](#idnstaffworkpool)
- **`app`** - Application
  - [app.Application](#appapplication)
  - [app.ApplicationNumberCounter](#appapplicationnumbercounter)
  - [app.ApplicationPersonalSnapshot](#appapplicationpersonalsnapshot)
  - [app.ApplicationPreference](#appapplicationpreference)
  - [app.ApplicationPreferenceSite](#appapplicationpreferencesite)
  - [app.ApplicationSection](#appapplicationsection)
  - [app.ApplicationSectionHistory](#appapplicationsectionhistory)
  - [app.ApplicationStatusHistory](#appapplicationstatushistory)
  - [app.ContactVerification](#appcontactverification)
  - [app.FormField](#appformfield)
  - [app.FormFieldCondition](#appformfieldcondition)
  - [app.FormFieldOption](#appformfieldoption)
  - [app.FormSchemaVersion](#appformschemaversion)
  - [app.FormSection](#appformsection)
  - [app.ReinstatementRequest](#appreinstatementrequest)
  - [app.ScreenOutReinstatement](#appscreenoutreinstatement)
  - [app.SiteExclusion](#appsiteexclusion)
  - [app.WithdrawalRequest](#appwithdrawalrequest)
- **`doc`** - Documents
  - [doc.Attachment](#docattachment)
  - [doc.AttachmentVersion](#docattachmentversion)
- **`pay`** - Payments
  - [pay.FeeSchedule](#payfeeschedule)
  - [pay.PaymentGatewayEvent](#paypaymentgatewayevent)
  - [pay.PaymentProviderBinding](#paypaymentproviderbinding)
  - [pay.PaymentReconciliation](#paypaymentreconciliation)
  - [pay.PaymentRoutingConfiguration](#paypaymentroutingconfiguration)
  - [pay.PaymentSession](#paypaymentsession)
  - [View pay.vw_FinancePayment](#view-payvw_financepayment)
- **`ver`** - Verification
  - [ver.ClarificationRequest](#verclarificationrequest)
  - [ver.CorrectionFlag](#vercorrectionflag)
  - [ver.CorrectionRequest](#vercorrectionrequest)
  - [ver.ScreenOutRecommendation](#verscreenoutrecommendation)
  - [ver.VerificationAssignment](#ververificationassignment)
  - [ver.VerificationCase](#ververificationcase)
  - [ver.VerificationEvent](#ververificationevent)
  - [ver.VerificationNote](#ververificationnote)
- **`pfo`** - Portfolio scoring
  - [pfo.Appeal](#pfoappeal)
  - [pfo.AppealQuestion](#pfoappealquestion)
  - [pfo.ConflictOfInterest](#pfoconflictofinterest)
  - [pfo.Portfolio](#pfoportfolio)
  - [pfo.PortfolioAnswer](#pfoportfolioanswer)
  - [pfo.PortfolioAnswerEvidence](#pfoportfolioanswerevidence)
  - [pfo.PortfolioDiscrepancy](#pfoportfoliodiscrepancy)
  - [pfo.PortfolioDiscrepancyDetail](#pfoportfoliodiscrepancydetail)
  - [pfo.PortfolioQuestion](#pfoportfolioquestion)
  - [pfo.PortfolioRound](#pfoportfolioround)
  - [pfo.PortfolioScoreHistory](#pfoportfolioscorehistory)
  - [pfo.PortfolioStatusHistory](#pfoportfoliostatushistory)
  - [pfo.QuestionClassification](#pfoquestionclassification)
  - [pfo.QuestionRejectionReason](#pfoquestionrejectionreason)
  - [pfo.RoundAssignment](#pforoundassignment)
  - [pfo.RoundScoreOverride](#pforoundscoreoverride)
  - [pfo.RubricVersion](#pforubricversion)
  - [pfo.ScoreItem](#pfoscoreitem)
  - [pfo.ScoreItemRejectionReason](#pfoscoreitemrejectionreason)
  - [View pfo.vw_RefereePortfolio](#view-pfovw_refereeportfolio)
- **`scr`** - Screening and announcement
  - [scr.ApplicationScoreComponent](#scrapplicationscorecomponent)
  - [scr.ApplicationScreening](#scrapplicationscreening)
  - [scr.BulkScreenOut](#scrbulkscreenout)
  - [scr.BulkScreenOutItem](#scrbulkscreenoutitem)
  - [scr.CasperImport](#scrcasperimport)
  - [scr.CasperImportRow](#scrcasperimportrow)
  - [scr.CasperResult](#scrcasperresult)
  - [scr.ScoreAnnouncement](#scrscoreannouncement)
  - [scr.ScoreAnnouncementItem](#scrscoreannouncementitem)
  - [View scr.vw_CandidateAnnouncedScore](#view-scrvw_candidateannouncedscore)
- **`ops`** - Operations (audit, outbox, jobs)
  - [ops.AuditEvent](#opsauditevent)
  - [ops.DomainEventOutbox](#opsdomaineventoutbox)
  - [ops.IdempotencyKey](#opsidempotencykey)
  - [ops.NotificationOutbox](#opsnotificationoutbox)
  - [ops.NotificationTemplate](#opsnotificationtemplate)
  - [ops.ScheduledJobRun](#opsscheduledjobrun)

## cfg - Reference and configuration

Reference and configuration data: status lookups, programme catalogue, academic reference lists, reason codes, work pools, calendar, parameters, and the approval-gated scoring configuration. Changes here are controlled and effective-dated.

### cfg.AdmissionCycle

An admission intake year (for example 2026/2027). The year of its start date prefixes every application number of the cycle (for example 20270000001).

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CycleId` | int | N | PK |  | Admission cycle. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `CycleCode` | varchar(20) | N |  |  | Cycle label such as 2026/2027. Unique. |
| 4 | `StartDate` | date | N |  |  | First day of the cycle. Its year is the first four digits of the cycle's application numbers. |
| 5 | `EndDate` | date | N |  |  | Last day of the cycle. |
| 6 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_AdmissionCycle` | `CycleId` | Uniquely identifies each row (CycleId). |
| UNIQUE | `UQ_AdmissionCycle_CycleCode` | `CycleCode` | Cycle codes are unique. |
| UNIQUE | `UQ_AdmissionCycle_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_AdmissionCycle_Dates` | `([EndDate]>=[StartDate])` | End date cannot be before the start date. |

### cfg.AnnouncementStatus

Lookup of score-announcement states. Values equal the API enum.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StatusCode` | varchar(40) | N | PK |  | Announcement status code, equal to the API enum value. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |
| 3 | `SortOrder` | smallint | N |  |  | Position used when listing values. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_AnnouncementStatus` | `StatusCode` | Uniquely identifies each row (StatusCode). |

### cfg.ApplicationStatus

Lookup of overall application lifecycle states. Values equal the API enum.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StatusCode` | varchar(40) | N | PK |  | Application status code, equal to the API enum value. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |
| 3 | `SortOrder` | smallint | N |  |  | Position used when listing values. |
| 4 | `IsTerminal` | bit | N |  | ((0)) | 1 when no further status change is allowed from this state. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationStatus` | `StatusCode` | Uniquely identifies each row (StatusCode). |

### cfg.Country

Countries used for academic history. The UAE flag drives the GPA input path.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CountryId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `Iso2Code` | char(2) | N |  |  | Two-letter ISO country code. |
| 3 | `CountryName` | nvarchar(150) | N |  |  | Country name. |
| 4 | `IsUae` | bit | N |  | ((0)) | 1 for the United Arab Emirates. Drives the GPA input path. |
| 5 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Country` | `CountryId` | Uniquely identifies each row (CountryId). |
| UNIQUE | `UQ_Country_Iso2` | `Iso2Code` | ISO codes are unique. |

### cfg.Degree

Catalogue of degree names a candidate can select.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `DegreeId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `DegreeName` | nvarchar(200) | N |  |  | Degree name. Unique. |
| 3 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Degree` | `DegreeId` | Uniquely identifies each row (DegreeId). |
| UNIQUE | `UQ_Degree_Name` | `DegreeName` | Degree names are unique. |

### cfg.Discipline

Professional discipline of a programme, for example medical, dental or pharmacy.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `DisciplineCode` | varchar(30) | N | PK |  | Discipline code. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Discipline` | `DisciplineCode` | Uniquely identifies each row (DisciplineCode). |

### cfg.DocumentType

Catalogue of document types that can be uploaded (personal photo, passport copy, CV, personal statement, recommendation letter and so on), with the allowed file types and maximum size.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `DocumentTypeId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `DocumentTypeCode` | varchar(60) | N |  |  | Unique code of the document type, such as CV or PASSPORT_COPY. |
| 3 | `Name` | nvarchar(200) | N |  |  | Name of the document type shown to users. |
| 4 | `AllowedMediaTypes` | varchar(400) | N |  |  | Comma-separated list of accepted file types, such as application/pdf,image/jpeg. |
| 5 | `MaxSizeBytes` | bigint | N |  |  | Largest accepted file size in bytes (2 MB unless stated otherwise). |
| 6 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |
| 7 | `SortOrder` | smallint | N |  | ((0)) | Position used when listing values. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_DocumentType` | `DocumentTypeId` | Uniquely identifies each row (DocumentTypeId). |
| UNIQUE | `UQ_DocumentType_Code` | `DocumentTypeCode` | The combination (DocumentTypeCode) can appear only once. |
| CHECK | `CK_DocumentType_MaxSize` | `([MaxSizeBytes]>(0))` | The maximum size is above zero. |

### cfg.GpaConversionBand

One band of a GPA conversion set that maps a scale-of-4 range to a percentage range.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `GpaConversionBandId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `GpaConversionSetId` | int | N | FK -> cfg.GpaConversionSet.GpaConversionSetId |  | Links to cfg.GpaConversionSet. |
| 3 | `ScaleMin` | decimal(4,2) | N |  |  | Lower bound of the scale-of-4 GPA range. |
| 4 | `ScaleMax` | decimal(4,2) | N |  |  | Upper bound of the scale-of-4 GPA range. |
| 5 | `PercentMin` | decimal(5,2) | N |  |  | Lower bound of the resulting percentage. |
| 6 | `PercentMax` | decimal(5,2) | N |  |  | Upper bound of the resulting percentage. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_GpaConversionBand` | `GpaConversionBandId` | Uniquely identifies each row (GpaConversionBandId). |
| FOREIGN KEY | `FK_GpaConversionBand_Set` | `GpaConversionSetId -> cfg.GpaConversionSet` | Every value must exist in cfg.GpaConversionSet, so no row can point to something that does not exist. |
| UNIQUE | `UQ_GpaConversionBand` | `GpaConversionSetId, ScaleMin` | A band starts at each GPA value once per set. |
| CHECK | `CK_GpaConversionBand_Percent` | `([PercentMin]>=(0) AND [PercentMax]<=(100) AND [PercentMax]>=[PercentMin])` | Percent range stays within 0-100 and the maximum is not below the minimum. |
| CHECK | `CK_GpaConversionBand_Scale` | `([ScaleMin]>=(0) AND [ScaleMax]<=(4) AND [ScaleMax]>=[ScaleMin])` | GPA range stays within 0-4 and the maximum is not below the minimum. |

### cfg.GpaConversionSet

A versioned, effective-dated GPA-to-percentage conversion table. Content requires business approval before use.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `GpaConversionSetId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `VersionLabel` | varchar(30) | N |  |  | Human-readable label of this approved version. |
| 3 | `EffectiveFrom` | date | N |  |  | First date this version applies. |
| 4 | `EffectiveTo` | date | Y |  |  | Last date this version applies. NULL means open ended. |
| 5 | `ApprovedBy` | nvarchar(200) | Y |  |  | Name of the person who approved this version. |
| 6 | `ApprovedAt` | datetimeoffset(3) | Y |  |  | UTC time of approval. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_GpaConversionSet` | `GpaConversionSetId` | Uniquely identifies each row (GpaConversionSetId). |
| UNIQUE | `UQ_GpaConversionSet_Version` | `VersionLabel` | Set labels are unique. |
| CHECK | `CK_GpaConversionSet_Dates` | `([EffectiveTo] IS NULL OR [EffectiveTo]>=[EffectiveFrom])` | End date cannot be before the start date. |

### cfg.PaymentProvider

Supported payment gateways (E-Pay and Network International). Never shown to candidates.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ProviderCode` | varchar(30) | N | PK |  | Provider code, such as E_PAY. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |
| 3 | `IsEnabled` | bit | N |  | ((1)) | 1 when the item is enabled for use. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PaymentProvider` | `ProviderCode` | Uniquely identifies each row (ProviderCode). |

### cfg.PaymentStatus

Lookup of payment session states. Values equal the API enum.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StatusCode` | varchar(40) | N | PK |  | Payment status code, equal to the API enum value. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |
| 3 | `SortOrder` | smallint | N |  |  | Position used when listing values. |
| 4 | `IsTerminal` | bit | N |  | ((0)) | 1 when no further status change is allowed from this state. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PaymentStatus` | `StatusCode` | Uniquely identifies each row (StatusCode). |

### cfg.PortfolioRoundStatus

Lookup of portfolio round states. Values equal the API enum.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StatusCode` | varchar(40) | N | PK |  | Portfolio round status code, equal to the API enum value. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |
| 3 | `SortOrder` | smallint | N |  |  | Position used when listing values. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioRoundStatus` | `StatusCode` | Uniquely identifies each row (StatusCode). |

### cfg.PortfolioStatus

Lookup of overall portfolio evaluation states. Values equal the API enum.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StatusCode` | varchar(40) | N | PK |  | Portfolio status code, equal to the API enum value. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |
| 3 | `SortOrder` | smallint | N |  |  | Position used when listing values. |
| 4 | `IsTerminal` | bit | N |  | ((0)) | 1 when no further status change is allowed from this state. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioStatus` | `StatusCode` | Uniquely identifies each row (StatusCode). |

### cfg.Program

A programme offered, such as Residency, Fellowship, Internship or Certificate. Controls how many preferences a candidate may rank.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ProgramId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ProgramCode` | varchar(30) | N |  |  | Short unique programme code. |
| 4 | `ProgramName` | nvarchar(200) | N |  |  | Programme name. |
| 5 | `CategoryCode` | varchar(30) | N | FK -> cfg.ProgramCategory.CategoryCode |  | Links to cfg.ProgramCategory. |
| 6 | `DisciplineCode` | varchar(30) | N | FK -> cfg.Discipline.DisciplineCode |  | Links to cfg.Discipline. |
| 7 | `MaxPreferences` | tinyint | N |  |  | How many ranked specialty preferences a candidate may choose (1 or 2). |
| 8 | `RulesInheritedFromProgramId` | int | Y | FK -> cfg.Program.ProgramId |  | Programme whose rules this programme inherits, if any. (Links to cfg.Program.) |
| 9 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Program` | `ProgramId` | Uniquely identifies each row (ProgramId). |
| FOREIGN KEY | `FK_Program_Category` | `CategoryCode -> cfg.ProgramCategory` | Every value must exist in cfg.ProgramCategory, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Program_Discipline` | `DisciplineCode -> cfg.Discipline` | Every value must exist in cfg.Discipline, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Program_RulesInheritedFrom` | `RulesInheritedFromProgramId -> cfg.Program` | Every value must exist in cfg.Program, so no row can point to something that does not exist. |
| UNIQUE | `UQ_Program_ProgramCode` | `ProgramCode` | Programme codes are unique. |
| UNIQUE | `UQ_Program_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_Program_MaxPreferences` | `([MaxPreferences]>=(1) AND [MaxPreferences]<=(2))` | A programme allows one or two preferences. |

### cfg.ProgramCategory

Category of programme (Certificate, Internship, Residency, Fellowship).

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CategoryCode` | varchar(30) | N | PK |  | Programme category code. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ProgramCategory` | `CategoryCode` | Uniquely identifies each row (CategoryCode). |

### cfg.ProgramCycle

A programme opened in a specific admission cycle, with its application window, grace-period deadline and the time zone those deadlines are defined in.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ProgramCycleId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ProgramId` | int | N | FK -> cfg.Program.ProgramId |  | Links to cfg.Program. |
| 4 | `CycleId` | int | N | FK -> cfg.AdmissionCycle.CycleId |  | Admission cycle. (Links to cfg.AdmissionCycle.) |
| 5 | `ApplicationOpensAt` | datetimeoffset(3) | Y |  |  | Time applications open. Configurable because BRD dates conflict. |
| 6 | `ApplicationClosesAt` | datetimeoffset(3) | Y |  |  | Time applications close (submission deadline). Must be after the opening time. |
| 7 | `GracePeriodEndsAt` | datetimeoffset(3) | Y |  |  | Grace-period deadline after the submission deadline: preference edits stop and unsubmitted drafts are archived after it. |
| 8 | `TimeZoneId` | varchar(64) | N |  | ('Asia/Dubai') | IANA time zone (default Asia/Dubai) in which the opening, closing and grace-period deadlines are defined. |
| 9 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ProgramCycle` | `ProgramCycleId` | Uniquely identifies each row (ProgramCycleId). |
| FOREIGN KEY | `FK_ProgramCycle_Cycle` | `CycleId -> cfg.AdmissionCycle` | Every value must exist in cfg.AdmissionCycle, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ProgramCycle_Program` | `ProgramId -> cfg.Program` | Every value must exist in cfg.Program, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ProgramCycle_ProgramCycle` | `ProgramId, CycleId` | A programme is opened once per cycle. |
| UNIQUE | `UQ_ProgramCycle_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_ProgramCycle_GracePeriod` | `([GracePeriodEndsAt] IS NULL OR [ApplicationClosesAt] IS NULL OR [GracePeriodEndsAt]>=[ApplicationClosesAt])` | The grace-period deadline cannot be before the closing time. |
| CHECK | `CK_ProgramCycle_Window` | `([ApplicationClosesAt] IS NULL OR [ApplicationOpensAt] IS NULL OR [ApplicationClosesAt]>[ApplicationOpensAt])` | The closing time must be after the opening time. |

### cfg.ProgramDegree

Links a programme to the degrees accepted for it.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ProgramId` | int | N | PK; FK -> cfg.Program.ProgramId |  | Links to cfg.Program. |
| 2 | `DegreeId` | int | N | PK; FK -> cfg.Degree.DegreeId |  | Links to cfg.Degree. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ProgramDegree` | `ProgramId, DegreeId` | Uniquely identifies each row (ProgramId, DegreeId). |
| FOREIGN KEY | `FK_ProgramDegree_Degree` | `DegreeId -> cfg.Degree` | Every value must exist in cfg.Degree, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ProgramDegree_Program` | `ProgramId -> cfg.Program` | Every value must exist in cfg.Program, so no row can point to something that does not exist. |

### cfg.ProgramSpecialty

Specialties offered under a programme.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ProgramSpecialtyId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ProgramId` | int | N | FK -> cfg.Program.ProgramId |  | Links to cfg.Program. |
| 3 | `SpecialtyId` | int | N | FK -> cfg.Specialty.SpecialtyId |  | Links to cfg.Specialty. |
| 4 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ProgramSpecialty` | `ProgramSpecialtyId` | Uniquely identifies each row (ProgramSpecialtyId). |
| FOREIGN KEY | `FK_ProgramSpecialty_Program` | `ProgramId -> cfg.Program` | Every value must exist in cfg.Program, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ProgramSpecialty_Specialty` | `SpecialtyId -> cfg.Specialty` | Every value must exist in cfg.Specialty, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ProgramSpecialty` | `ProgramId, SpecialtyId` | A specialty is mapped once to a programme. |

### cfg.ReasonCategory

Grouping of reason codes by the process that uses them: WITHDRAWAL_REASON, CORRECTION_NOTE_TEMPLATE, SCREEN_OUT_REASON and REINSTATEMENT_REJECTION_REASON (the lookup types of the API).

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CategoryCode` | varchar(40) | N | PK |  | Reason category code. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ReasonCategory` | `CategoryCode` | Uniquely identifies each row (CategoryCode). |

### cfg.ReasonCode

Controlled reasons used when staff or candidates give a reason for an action, with a candidate-safe message.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ReasonCodeId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `CategoryCode` | varchar(40) | N | FK -> cfg.ReasonCategory.CategoryCode |  | Links to cfg.ReasonCategory. |
| 3 | `ReasonCode` | varchar(60) | N |  |  | Reason code, unique within its category. |
| 4 | `DisplayName` | nvarchar(200) | N |  |  | Human-readable label shown in screens. |
| 5 | `CandidateMessage` | nvarchar(500) | Y |  |  | Message that may be shown to the candidate. Contains no internal detail. |
| 6 | `SortOrder` | smallint | N |  | ((0)) | Position of the reason in the drop-down list. |
| 7 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ReasonCode` | `ReasonCodeId` | Uniquely identifies each row (ReasonCodeId). |
| FOREIGN KEY | `FK_ReasonCode_Category` | `CategoryCode -> cfg.ReasonCategory` | Every value must exist in cfg.ReasonCategory, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ReasonCode` | `CategoryCode, ReasonCode` | Reason codes are unique within a category. |

### cfg.ScoringWeightItem

Maximum points for one scoring component within a weight set.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ScoringWeightSetId` | int | N | PK; FK -> cfg.ScoringWeightSet.ScoringWeightSetId |  | Links to cfg.ScoringWeightSet. |
| 2 | `ComponentCode` | varchar(30) | N | PK |  | Scoring component (GPA, exam, portfolio, CASPER). |
| 3 | `MaxPoints` | decimal(7,2) | N |  |  | Maximum points the component can contribute. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScoringWeightItem` | `ScoringWeightSetId, ComponentCode` | Uniquely identifies each row (ScoringWeightSetId, ComponentCode). |
| FOREIGN KEY | `FK_ScoringWeightItem_Set` | `ScoringWeightSetId -> cfg.ScoringWeightSet` | Every value must exist in cfg.ScoringWeightSet, so no row can point to something that does not exist. |
| CHECK | `CK_ScoringWeightItem_Points` | `([MaxPoints]>=(0))` | Maximum points cannot be negative. |

### cfg.ScoringWeightSet

A versioned, effective-dated set of scoring weights for a programme. Content requires business approval before use.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ScoringWeightSetId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ProgramId` | int | N | FK -> cfg.Program.ProgramId |  | Links to cfg.Program. |
| 3 | `VersionLabel` | varchar(30) | N |  |  | Human-readable label of this approved version. |
| 4 | `EffectiveFrom` | date | N |  |  | First date this version applies. |
| 5 | `EffectiveTo` | date | Y |  |  | Last date this version applies. NULL means open ended. |
| 6 | `GpaConversionSetId` | int | Y | FK -> cfg.GpaConversionSet.GpaConversionSetId |  | Links to cfg.GpaConversionSet. |
| 7 | `ApprovedBy` | nvarchar(200) | Y |  |  | Name of the person who approved this version. |
| 8 | `ApprovedAt` | datetimeoffset(3) | Y |  |  | UTC time of approval. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScoringWeightSet` | `ScoringWeightSetId` | Uniquely identifies each row (ScoringWeightSetId). |
| FOREIGN KEY | `FK_ScoringWeightSet_GpaSet` | `GpaConversionSetId -> cfg.GpaConversionSet` | Every value must exist in cfg.GpaConversionSet, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScoringWeightSet_Program` | `ProgramId -> cfg.Program` | Every value must exist in cfg.Program, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ScoringWeightSet` | `ProgramId, VersionLabel` | Set labels are unique per programme. |
| CHECK | `CK_ScoringWeightSet_Dates` | `([EffectiveTo] IS NULL OR [EffectiveTo]>=[EffectiveFrom])` | End date cannot be before the start date. |

### cfg.Specialty

Catalogue of specialties.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `SpecialtyId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `SpecialtyCode` | varchar(30) | N |  |  | Short unique specialty code. |
| 4 | `SpecialtyName` | nvarchar(200) | N |  |  | Specialty name. |
| 5 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Specialty` | `SpecialtyId` | Uniquely identifies each row (SpecialtyId). |
| UNIQUE | `UQ_Specialty_Code` | `SpecialtyCode` | Specialty codes are unique. |
| UNIQUE | `UQ_Specialty_PublicId` | `PublicId` | API identifiers are unique. |

### cfg.SpecialtySite

A training site that hosts a specialty under a programme, with its capacity.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `SpecialtySiteId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ProgramSpecialtyId` | int | N | FK -> cfg.ProgramSpecialty.ProgramSpecialtyId |  | Links to cfg.ProgramSpecialty. |
| 3 | `SiteId` | int | N | FK -> cfg.TrainingSite.SiteId |  | Links to cfg.TrainingSite. |
| 4 | `Capacity` | int | Y |  |  | Number of places at this site for the specialty. Nullable until the business confirms capacity. |
| 5 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_SpecialtySite` | `SpecialtySiteId` | Uniquely identifies each row (SpecialtySiteId). |
| FOREIGN KEY | `FK_SpecialtySite_ProgramSpecialty` | `ProgramSpecialtyId -> cfg.ProgramSpecialty` | Every value must exist in cfg.ProgramSpecialty, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_SpecialtySite_Site` | `SiteId -> cfg.TrainingSite` | Every value must exist in cfg.TrainingSite, so no row can point to something that does not exist. |
| UNIQUE | `UQ_SpecialtySite` | `ProgramSpecialtyId, SiteId` | A site is mapped once to a programme specialty. |
| UNIQUE | `UQ_SpecialtySite_WithSpecialty` | `SpecialtySiteId, ProgramSpecialtyId` | Supports the composite foreign key that keeps a chosen site inside its specialty. |
| CHECK | `CK_SpecialtySite_Capacity` | `([Capacity] IS NULL OR [Capacity]>=(0))` | Capacity is empty or zero or more. |

### cfg.SystemParameter

Tunable system settings (such as reminder or archive periods) stored as data instead of code.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ParameterCode` | varchar(80) | N | PK |  | Unique name of the setting. |
| 2 | `ParameterValue` | nvarchar(400) | N |  |  | Value of the setting as text, read according to ValueType. |
| 3 | `ValueType` | varchar(20) | N |  |  | How to interpret the value: INT, DECIMAL, BOOL, DATE or STRING. |
| 4 | `Description` | nvarchar(400) | Y |  |  | What the setting controls. |
| 5 | `UpdatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was last changed. |
| 6 | `UpdatedBy` | nvarchar(100) | Y |  |  | User or service that last changed the row. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_SystemParameter` | `ParameterCode` | Uniquely identifies each row (ParameterCode). |
| CHECK | `CK_SystemParameter_Type` | `([ValueType]='DATE' OR [ValueType]='BOOL' OR [ValueType]='STRING' OR [ValueType]='DECIMAL' OR [ValueType]='INT')` | Restricts ValueType to: BOOL, DATE, DECIMAL, INT, STRING. |

### cfg.TrainingSite

A hospital or training site where candidates can be placed.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `SiteId` | int | N | PK |  | Surrogate key of the training site. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `SiteCode` | varchar(30) | N |  |  | Short unique site code. |
| 4 | `SiteName` | nvarchar(200) | N |  |  | Site name. |
| 5 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_TrainingSite` | `SiteId` | Uniquely identifies each row (SiteId). |
| UNIQUE | `UQ_TrainingSite_Code` | `SiteCode` | Site codes are unique. |
| UNIQUE | `UQ_TrainingSite_PublicId` | `PublicId` | API identifiers are unique. |

### cfg.University

Universities a candidate can select, by country.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `UniversityId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `CountryId` | int | N | FK -> cfg.Country.CountryId |  | Links to cfg.Country. |
| 3 | `UniversityName` | nvarchar(300) | N |  |  | University name, unique within its country. |
| 4 | `IsOther` | bit | N |  | ((0)) | 1 for the catch-all Other entry, which lets the candidate type a name. |
| 5 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_University` | `UniversityId` | Uniquely identifies each row (UniversityId). |
| FOREIGN KEY | `FK_University_Country` | `CountryId -> cfg.Country` | Every value must exist in cfg.Country, so no row can point to something that does not exist. |
| UNIQUE | `UQ_University` | `CountryId, UniversityName` | A university name is unique within a country. |

### cfg.VerificationStatus

Lookup of verification case states. Values equal the API enum.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StatusCode` | varchar(40) | N | PK |  | Verification status code, equal to the API enum value. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |
| 3 | `SortOrder` | smallint | N |  |  | Position used when listing values. |
| 4 | `IsTerminal` | bit | N |  | ((0)) | 1 when no further status change is allowed from this state. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_VerificationStatus` | `StatusCode` | Uniquely identifies each row (StatusCode). |

### cfg.WorkingCalendarDay

Working-day calendar used for due dates and overdue calculations.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CalendarDate` | date | N | PK |  | The calendar date. |
| 2 | `IsWorkingDay` | bit | N |  |  | 1 when the date is a working day. |
| 3 | `Description` | nvarchar(200) | Y |  |  | Reason for a non-working day, such as a public holiday. |
| 4 | `CalendarVersion` | varchar(20) | N |  |  | Version of the calendar this day belongs to. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_WorkingCalendarDay` | `CalendarDate` | Uniquely identifies each row (CalendarDate). |

### cfg.WorkPool

A pool of work items (verification, portfolio rounds, third referee, second evaluation) with an optional retrieval cap.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `WorkPoolId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `PoolType` | varchar(30) | N |  |  | Type of pool, such as verification, portfolio round 1 or second evaluation. Allowed values: PORTFOLIO_ROUND_1, PORTFOLIO_ROUND_2, SECOND_EVALUATION, THIRD_REFEREE, VERIFICATION. |
| 4 | `ProgramCycleId` | int | N | FK -> cfg.ProgramCycle.ProgramCycleId |  | Links to cfg.ProgramCycle. |
| 5 | `ProgramSpecialtyId` | int | Y | FK -> cfg.ProgramSpecialty.ProgramSpecialtyId |  | Links to cfg.ProgramSpecialty. |
| 6 | `DisplayName` | nvarchar(200) | N |  |  | Human-readable label shown in screens. |
| 7 | `RetrievalCap` | int | Y |  |  | Maximum items one user may retrieve at a time. NULL means no cap. |
| 8 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_WorkPool` | `WorkPoolId` | Uniquely identifies each row (WorkPoolId). |
| FOREIGN KEY | `FK_WorkPool_ProgramCycle` | `ProgramCycleId -> cfg.ProgramCycle` | Every value must exist in cfg.ProgramCycle, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_WorkPool_ProgramSpecialty` | `ProgramSpecialtyId -> cfg.ProgramSpecialty` | Every value must exist in cfg.ProgramSpecialty, so no row can point to something that does not exist. |
| UNIQUE | `UQ_WorkPool_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_WorkPool_Cap` | `([RetrievalCap] IS NULL OR [RetrievalCap]>(0))` | A retrieval cap is empty or above zero. |
| CHECK | `CK_WorkPool_Type` | `([PoolType]='SECOND_EVALUATION' OR [PoolType]='THIRD_REFEREE' OR [PoolType]='PORTFOLIO_ROUND_2' OR [PoolType]='PORTFOLIO_ROUND_1' OR [PoolType]='VERIFICATION')` | Restricts PoolType to: PORTFOLIO_ROUND_1, PORTFOLIO_ROUND_2, SECOND_EVALUATION, THIRD_REFEREE, VERIFICATION. |

## idn - Identity

Identity: candidates and their personal profile, staff users, roles, pool membership, integration clients, duplicate-account pairs, ICP refresh requests and the candidate change history. Users are matched to IDAM by the IDAM immutable user identifier; no credentials are stored, the identity provider owns them.

### idn.AccessRole

Staff roles: administrator, admission officer, admission supervisor, central monitor, finance officer, referee, third referee, 2nd evaluation referee and senior referee.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `RoleCode` | varchar(40) | N | PK |  | Unique role code. |
| 2 | `DisplayName` | nvarchar(100) | N |  |  | Human-readable label shown in screens. |
| 3 | `IsStaffRole` | bit | N |  | ((1)) | 1 for roles given to staff. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_AccessRole` | `RoleCode` | Uniquely identifies each row (RoleCode). |

### idn.Candidate

A person applying to a programme, matched to IDAM by the IDAM user identifier. Holds the 9-digit candidate number, the IDAM-registered contact data and hashes used to detect duplicate accounts. Personal details are in idn.CandidatePersonalProfile.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CandidateId` | bigint | N | PK |  | Candidate this row belongs to. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `CandidateNumber` | char(9) | N |  | (right('000000000'+CONVERT([varchar](9),NEXT VALUE FOR [idn].[CandidateNumberSeq]),(9))) | Candidate ID: 9-digit text from 000000001, leading zeros kept, generated from a sequence. Unique. |
| 4 | `IdamUserId` | varchar(200) | N |  |  | IDAM immutable user identifier; the only key used to match a sign-in to this candidate. Unique. |
| 5 | `DisplayName` | nvarchar(200) | N |  |  | Name shown in screens, from the identity provider. Personal data. |
| 6 | `Email` | nvarchar(320) | Y |  |  | E-mail registered in IDAM (BRD 'Registered Email'), refreshed at sign-in. Personal data. |
| 7 | `MobileNumber` | varchar(25) | Y |  |  | Mobile number registered in IDAM (BRD 'Registered Mobile Number'), refreshed at sign-in. Personal data. Stored as +<digits>; also used to detect duplicate accounts. |
| 8 | `PreferredCulture` | varchar(10) | Y |  |  | Preferred language and region for screens and notifications: ar-AE or en-AE. |
| 9 | `PreferredTimeZoneId` | varchar(64) | Y |  |  | IANA time zone used to display times to the candidate. NULL means Asia/Dubai. |
| 10 | `EmiratesIdNumber` | varchar(20) | Y |  |  | Emirates ID number from IDAM, digits only, used to detect duplicate accounts. Not unique, so a duplicate can be recorded. Personal data: never logged or audited. |
| 11 | `PassportNumber` | varchar(20) | Y |  |  | Passport number from IDAM, letters and digits in upper case, used to detect duplicate accounts. Not unique. Personal data: never logged or audited. |
| 12 | `IcpPersonRef` | varchar(100) | Y |  |  | Reference to the person record in ICP. |
| 13 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |
| 14 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 15 | `UpdatedAt` | datetimeoffset(3) | Y |  |  | UTC time the row was last changed. |
| 16 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Candidate` | `CandidateId` | Uniquely identifies each row (CandidateId). |
| UNIQUE | `UQ_Candidate_IdamUserId` | `IdamUserId` | One candidate per IDAM user. |
| UNIQUE | `UQ_Candidate_Number` | `CandidateNumber` | Each candidate number is unique. |
| UNIQUE | `UQ_Candidate_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_Candidate_Culture` | `([PreferredCulture] IS NULL OR ([PreferredCulture]='en-AE' OR [PreferredCulture]='ar-AE'))` | Preferred culture is empty, ar-AE or en-AE. |
| CHECK | `CK_Candidate_Number` | `([CandidateNumber] like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')` | The candidate number is exactly 9 digits. |

### idn.CandidateChangeHistory

Old and new value of every change to a candidate's personal data, by ICP refresh, candidate edit or staff correction. Kept apart from the audit trail, which never holds values.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ChangeId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `CandidateId` | bigint | N | FK -> idn.Candidate.CandidateId |  | Candidate this row belongs to. (Links to idn.Candidate.) |
| 3 | `FieldCode` | varchar(80) | N |  |  | Personal-information field that changed. |
| 4 | `OldValue` | nvarchar(500) | Y |  |  | Value before the change. Personal data. |
| 5 | `NewValue` | nvarchar(500) | Y |  |  | Value after the change. Personal data. |
| 6 | `SourceCode` | varchar(20) | N |  |  | What made the change: ICP_REFRESH, CANDIDATE_EDIT or STAFF_CORRECTION. |
| 7 | `IcpRefreshRequestId` | bigint | Y | FK -> idn.IcpRefreshRequest.IcpRefreshRequestId |  | ICP refresh that made the change, for ICP_REFRESH changes. (Links to idn.IcpRefreshRequest.) |
| 8 | `ChangedByCandidateId` | bigint | Y | FK -> idn.Candidate.CandidateId |  | Candidate who made the change, for candidate edits. (Links to idn.Candidate.) |
| 9 | `ChangedByStaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Staff user who made or applied the change. (Links to idn.StaffUser.) |
| 10 | `ChangedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the change happened. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_CandidateChangeHistory` | `ChangeId` | Uniquely identifies each row (ChangeId). |
| FOREIGN KEY | `FK_CandidateChangeHistory_Candidate` | `CandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CandidateChangeHistory_ChangedByCandidate` | `ChangedByCandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CandidateChangeHistory_ChangedByStaff` | `ChangedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CandidateChangeHistory_IcpRefresh` | `IcpRefreshRequestId -> idn.IcpRefreshRequest` | Every value must exist in idn.IcpRefreshRequest, so no row can point to something that does not exist. |
| CHECK | `CK_CandidateChangeHistory_Actor` | `([ChangedByCandidateId] IS NULL OR [ChangedByStaffUserId] IS NULL)` | A change is made by a candidate or by staff, not both. |
| CHECK | `CK_CandidateChangeHistory_IcpRefresh` | `([SourceCode]<>'ICP_REFRESH' OR [IcpRefreshRequestId] IS NOT NULL)` | An ICP_REFRESH change must name the ICP refresh request. |
| CHECK | `CK_CandidateChangeHistory_Source` | `([SourceCode]='STAFF_CORRECTION' OR [SourceCode]='CANDIDATE_EDIT' OR [SourceCode]='ICP_REFRESH')` | Restricts SourceCode to: CANDIDATE_EDIT, ICP_REFRESH, STAFF_CORRECTION. |

### idn.CandidatePersonalProfile

The candidate's personal information (identity, documents, contact and next of kin) from the BRD personal-information section, held once per candidate (D-10). Each submitted application keeps its own snapshot.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CandidateId` | bigint | N | PK; FK -> idn.Candidate.CandidateId |  | Candidate the profile belongs to (one profile per candidate). (Links to idn.Candidate.) |
| 2 | `EnglishFirstName` | nvarchar(100) | Y |  |  | First name in English, as in the passport. Personal data. |
| 3 | `EnglishMiddleName` | nvarchar(200) | Y |  |  | Middle name(s) in English; from ICP, the second to fourth names separated by spaces. Personal data. |
| 4 | `EnglishLastName` | nvarchar(100) | Y |  |  | Last name in English. Personal data. |
| 5 | `ArabicFirstName` | nvarchar(100) | Y |  |  | First name in Arabic. Personal data. |
| 6 | `ArabicMiddleName` | nvarchar(200) | Y |  |  | Middle name(s) in Arabic. Personal data. |
| 7 | `ArabicLastName` | nvarchar(100) | Y |  |  | Last name in Arabic. Personal data. |
| 8 | `DateOfBirth` | date | Y |  |  | Date of birth; must be in the past. Personal data. |
| 9 | `GenderCode` | varchar(10) | Y |  |  | Gender: MALE or FEMALE. |
| 10 | `MaritalStatusCode` | varchar(10) | Y |  |  | Marital status: SINGLE, MARRIED, DIVORCED or WIDOWED. |
| 11 | `NationalityCountryId` | int | Y | FK -> cfg.Country.CountryId |  | Nationality. Personal data. (Links to cfg.Country.) |
| 12 | `IsChildOfUaeNationalMother` | bit | Y |  |  | Answer to 'Are you a child of a UAE National mother who holds a Family Book?' (non-UAE nationals). Yes makes the birth certificate and mother's family book required. |
| 13 | `HasMarsoom` | bit | Y |  |  | Answer to 'Do you have Marsoom?' (non-UAE nationals). |
| 14 | `ResidenceCountryId` | int | Y | FK -> cfg.Country.CountryId |  | Country of residence. Personal data. (Links to cfg.Country.) |
| 15 | `UaeResidenceCityCode` | varchar(20) | Y |  |  | Emirate of residence, when the country of residence is the UAE. |
| 16 | `BirthCountryId` | int | Y | FK -> cfg.Country.CountryId |  | Country of birth. Personal data. (Links to cfg.Country.) |
| 17 | `HasEmiratesId` | bit | Y |  |  | Answer to 'Do you have an Emirates ID?'. |
| 18 | `EmiratesIdNumber` | varchar(20) | Y |  |  | Emirates ID number. Personal data. |
| 19 | `EmiratesIdExpiryDate` | date | Y |  |  | Emirates ID expiry date. An expired ID means no ICP data is retrieved. Personal data. |
| 20 | `VisaUnifiedNumber` | varchar(20) | Y |  |  | Visa unified number (residents who are not UAE or GCC nationals). Personal data. |
| 21 | `VisaFileNumber` | varchar(30) | Y |  |  | Residence visa file number. Personal data. |
| 22 | `VisaPlaceOfIssueCode` | varchar(30) | Y |  |  | Place of issue of the residence visa. |
| 23 | `VisaExpiryDate` | date | Y |  |  | Residence visa expiry date. Personal data. |
| 24 | `PassportNumber` | varchar(20) | Y |  |  | Passport number. Personal data. |
| 25 | `PassportIssuingCountryId` | int | Y | FK -> cfg.Country.CountryId |  | Country that issued the passport. Personal data. (Links to cfg.Country.) |
| 26 | `PassportIssueCityCode` | varchar(20) | Y |  |  | Emirate of issue, when the passport was issued in the UAE. |
| 27 | `PassportIssueCityOther` | nvarchar(100) | Y |  |  | City of issue as free text, when the passport was issued outside the UAE. |
| 28 | `PassportIssueDate` | date | Y |  |  | Passport issue date. Personal data. |
| 29 | `PassportExpiryDate` | date | Y |  |  | Passport expiry date; must be later than today. Personal data. |
| 30 | `FamilyBookCityNumber` | varchar(20) | Y |  |  | Family book city number (UAE nationals). Personal data. |
| 31 | `FamilyId` | varchar(30) | Y |  |  | Family ID (UAE nationals; ICP field khulasitQaidNo). Personal data. |
| 32 | `PassportUnifiedNumber` | varchar(30) | Y |  |  | Passport unified number (UAE nationals). Personal data. |
| 33 | `ContactEmail` | nvarchar(320) | Y |  |  | Contact e-mail; starts as the registered e-mail and needs a one-time-code check when changed. Personal data. |
| 34 | `ContactMobileNumber` | varchar(25) | Y |  |  | Contact mobile number; starts as the registered mobile and needs a one-time-code check when changed. Personal data. |
| 35 | `NextOfKinFirstName` | nvarchar(100) | Y |  |  | Next of kin first name. Personal data. |
| 36 | `NextOfKinMiddleName` | nvarchar(200) | Y |  |  | Next of kin middle name(s). Personal data. |
| 37 | `NextOfKinSurname` | nvarchar(100) | Y |  |  | Next of kin surname. Personal data. |
| 38 | `NextOfKinRelationshipCode` | varchar(30) | Y |  |  | Relationship of the next of kin to the candidate. |
| 39 | `NextOfKinPhone` | varchar(25) | Y |  |  | Next of kin primary telephone number. Personal data. |
| 40 | `NextOfKinEmail` | nvarchar(320) | Y |  |  | Next of kin primary e-mail. Personal data. |
| 41 | `NextOfKinAreaOfResidence` | nvarchar(200) | Y |  |  | Next of kin area of residence. Personal data. |
| 42 | `IcpSourcedFieldsJson` | json | Y |  |  | List of the fields whose current value came from ICP; these are highlighted and read-only on the form. |
| 43 | `IcpRetrievedAt` | datetimeoffset(3) | Y |  |  | UTC time the ICP data was last retrieved. |
| 44 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 45 | `UpdatedAt` | datetimeoffset(3) | Y |  |  | UTC time the row was last changed. |
| 46 | `RowVersion` | timestamp | N |  |  | Concurrency token; copied into the submission snapshot and compared when an ICP preview is applied. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_CandidatePersonalProfile` | `CandidateId` | Uniquely identifies each row (CandidateId). |
| FOREIGN KEY | `FK_CandidatePersonalProfile_BirthCountry` | `BirthCountryId -> cfg.Country` | Every value must exist in cfg.Country, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CandidatePersonalProfile_Candidate` | `CandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CandidatePersonalProfile_Nationality` | `NationalityCountryId -> cfg.Country` | Every value must exist in cfg.Country, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CandidatePersonalProfile_PassportCountry` | `PassportIssuingCountryId -> cfg.Country` | Every value must exist in cfg.Country, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CandidatePersonalProfile_Residence` | `ResidenceCountryId -> cfg.Country` | Every value must exist in cfg.Country, so no row can point to something that does not exist. |
| CHECK | `CK_CandidatePersonalProfile_Gender` | `([GenderCode] IS NULL OR ([GenderCode]='FEMALE' OR [GenderCode]='MALE'))` | Gender is empty, MALE or FEMALE. |
| CHECK | `CK_CandidatePersonalProfile_MaritalStatus` | `([MaritalStatusCode] IS NULL OR ([MaritalStatusCode]='WIDOWED' OR [MaritalStatusCode]='DIVORCED' OR [MaritalStatusCode]='MARRIED' OR [MaritalStatusCode]='SINGLE'))` | Marital status is empty or one of SINGLE, MARRIED, DIVORCED, WIDOWED. |

### idn.DuplicateAccountPair

A pair of candidate accounts found to match on Emirates ID, passport or mobile at sign-in, kept for the supervisor's duplicate-account report. Matched values are not stored.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PairId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `OriginalCandidateId` | bigint | N | FK -> idn.Candidate.CandidateId |  | The existing (original) candidate account. (Links to idn.Candidate.) |
| 4 | `DuplicateCandidateId` | bigint | N | FK -> idn.Candidate.CandidateId |  | The new account found to duplicate the original. (Links to idn.Candidate.) |
| 5 | `MatchedOnEmiratesId` | bit | N |  | ((0)) | 1 when the Emirates ID matched. |
| 6 | `MatchedOnPassport` | bit | N |  | ((0)) | 1 when the passport (issuing country and number) matched. |
| 7 | `MatchedOnMobile` | bit | N |  | ((0)) | 1 when the mobile number matched. |
| 8 | `DetectedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the duplicate was detected at sign-in. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_DuplicateAccountPair` | `PairId` | Uniquely identifies each row (PairId). |
| FOREIGN KEY | `FK_DuplicateAccountPair_Duplicate` | `DuplicateCandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_DuplicateAccountPair_Original` | `OriginalCandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| UNIQUE | `UQ_DuplicateAccountPair` | `OriginalCandidateId, DuplicateCandidateId` | A pair of accounts is recorded once. |
| UNIQUE | `UQ_DuplicateAccountPair_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_DuplicateAccountPair_Distinct` | `([OriginalCandidateId]<>[DuplicateCandidateId])` | An account cannot duplicate itself. |
| CHECK | `CK_DuplicateAccountPair_Matched` | `([MatchedOnEmiratesId]=(1) OR [MatchedOnPassport]=(1) OR [MatchedOnMobile]=(1))` | At least one attribute (Emirates ID, passport or mobile) matched. |

### idn.IcpRefreshRequest

A supervisor's ICP refresh for a candidate: the preview of ICP values (with a single-use token) and which fields were then applied.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `IcpRefreshRequestId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `CandidateId` | bigint | N | FK -> idn.Candidate.CandidateId |  | Candidate this row belongs to. (Links to idn.Candidate.) |
| 3 | `RequestedByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user who made the request. (Links to idn.StaffUser.) |
| 4 | `RequestReasonCode` | varchar(20) | N |  |  | Why the refresh was requested: IDENTITY_EXPIRY or DETAILS_CHANGE. |
| 5 | `StatusCode` | varchar(20) | N |  | ('PREVIEWED') | Refresh state: PREVIEWED, APPLIED, CANCELLED or EXPIRED. |
| 6 | `PreviewJson` | json | Y |  |  | ICP values of the ICP-sourced fields as previewed; the apply step uses these, not a new ICP call. Personal data. |
| 7 | `PreviewTokenHash` | binary | Y |  |  | SHA-256 hash of the single-use preview token. NULL when nothing differed. |
| 8 | `SourceRowVersion` | binary | Y |  |  | Profile row version at preview time; if it changed before apply, the preview is stale and is refused. |
| 9 | `ExpiresAt` | datetimeoffset(3) | N |  |  | UTC time the preview token stops being accepted. |
| 10 | `AppliedFieldCodesJson` | json | Y |  |  | Field codes the supervisor applied. |
| 11 | `RequestedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the request was made. |
| 12 | `AppliedAt` | datetimeoffset(3) | Y |  |  | UTC time the refresh was applied. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_IcpRefreshRequest` | `IcpRefreshRequestId` | Uniquely identifies each row (IcpRefreshRequestId). |
| FOREIGN KEY | `FK_IcpRefreshRequest_Candidate` | `CandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_IcpRefreshRequest_Staff` | `RequestedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| UNIQUE | `UX_IcpRefreshRequest_Token` | `PreviewTokenHash WHERE ([PreviewTokenHash] IS NOT NULL)` | A preview token is unique. |
| CHECK | `CK_IcpRefreshRequest_Applied` | `([StatusCode]='APPLIED' AND [AppliedAt] IS NOT NULL OR [StatusCode]<>'APPLIED' AND [AppliedAt] IS NULL)` | Applied time is set only when the refresh was applied. |
| CHECK | `CK_IcpRefreshRequest_Reason` | `([RequestReasonCode]='DETAILS_CHANGE' OR [RequestReasonCode]='IDENTITY_EXPIRY')` | Restricts RequestReasonCode to: DETAILS_CHANGE, IDENTITY_EXPIRY. |
| CHECK | `CK_IcpRefreshRequest_Status` | `([StatusCode]='EXPIRED' OR [StatusCode]='CANCELLED' OR [StatusCode]='APPLIED' OR [StatusCode]='PREVIEWED')` | Restricts StatusCode to: APPLIED, CANCELLED, EXPIRED, PREVIEWED. |

### idn.IntegrationClient

A system that calls the API on its own behalf (for example the payment middleware), identified by its IDAM client id.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `IntegrationClientId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `IdamClientId` | varchar(200) | N |  |  | Client id issued by IDAM to the calling system. Unique. |
| 4 | `Name` | nvarchar(200) | N |  |  | Name of the calling system. |
| 5 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |
| 6 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 7 | `UpdatedAt` | datetimeoffset(3) | Y |  |  | UTC time the row was last changed. |
| 8 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_IntegrationClient` | `IntegrationClientId` | Uniquely identifies each row (IntegrationClientId). |
| UNIQUE | `UQ_IntegrationClient_IdamClientId` | `IdamClientId` | The combination (IdamClientId) can appear only once. |
| UNIQUE | `UQ_IntegrationClient_PublicId` | `PublicId` | API identifiers are unique. |

### idn.IntegrationClientPermission

Permissions granted to an integration client, such as payments.events-write.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `IntegrationClientId` | int | N | PK; FK -> idn.IntegrationClient.IntegrationClientId |  | Links to idn.IntegrationClient. |
| 2 | `PermissionCode` | varchar(60) | N | PK |  | Permission granted, such as payments.events-write. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_IntegrationClientPermission` | `IntegrationClientId, PermissionCode` | Uniquely identifies each row (IntegrationClientId, PermissionCode). |
| FOREIGN KEY | `FK_IntegrationClientPermission_Client` | `IntegrationClientId -> idn.IntegrationClient` | Every value must exist in idn.IntegrationClient, so no row can point to something that does not exist. |

### idn.StaffRoleAssignment

Grants a role to a staff user for a validity period, optionally scoped to a programme or specialty.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StaffRoleAssignmentId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `StaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user this row refers to. (Links to idn.StaffUser.) |
| 3 | `RoleCode` | varchar(40) | N | FK -> idn.AccessRole.RoleCode |  | Code of the role. (Links to idn.AccessRole.) |
| 4 | `ProgramId` | int | Y | FK -> cfg.Program.ProgramId |  | Links to cfg.Program. |
| 5 | `ProgramSpecialtyId` | int | Y | FK -> cfg.ProgramSpecialty.ProgramSpecialtyId |  | Links to cfg.ProgramSpecialty. |
| 6 | `ValidFrom` | date | N |  | (CONVERT([date],sysutcdatetime())) | First date the assignment is valid. |
| 7 | `ValidTo` | date | Y |  |  | Last date the assignment is valid. NULL means open ended. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_StaffRoleAssignment` | `StaffRoleAssignmentId` | Uniquely identifies each row (StaffRoleAssignmentId). |
| FOREIGN KEY | `FK_StaffRoleAssignment_AccessRole` | `RoleCode -> idn.AccessRole` | Every value must exist in idn.AccessRole, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_StaffRoleAssignment_Program` | `ProgramId -> cfg.Program` | Every value must exist in cfg.Program, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_StaffRoleAssignment_ProgramSpecialty` | `ProgramSpecialtyId -> cfg.ProgramSpecialty` | Every value must exist in cfg.ProgramSpecialty, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_StaffRoleAssignment_User` | `StaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| CHECK | `CK_StaffRoleAssignment_Dates` | `([ValidTo] IS NULL OR [ValidTo]>=[ValidFrom])` | Validity end cannot be before its start. |

### idn.StaffUser

A staff member who works in the system, matched to IDAM by the IDAM user identifier, with the role currently in use and an optional link to the same person's candidate record.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StaffUserId` | int | N | PK |  | Staff user this row refers to. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `IdamUserId` | varchar(200) | Y |  |  | IDAM immutable user identifier; the key used to match a sign-in. NULL until a pre-registered user first signs in. Unique when present. |
| 4 | `DisplayName` | nvarchar(200) | N |  |  | Human-readable label shown in screens. |
| 5 | `Email` | nvarchar(320) | N |  |  | Staff e-mail address. Unique. |
| 6 | `ActiveRoleCode` | varchar(40) | Y | FK -> idn.AccessRole.RoleCode |  | Role the user is currently acting in (role switcher). Must be one of the user's current role assignments. (Links to idn.AccessRole.) |
| 7 | `LinkedCandidatePublicId` | uniqueidentifier | Y | FK -> idn.Candidate.PublicId |  | PublicId of the same person's candidate record, if any; used to stop staff acting on their own applications. Unique when present. (Links to idn.Candidate.) |
| 8 | `PreferredCulture` | varchar(10) | Y |  |  | Preferred language and region: ar-AE or en-AE. |
| 9 | `PreferredTimeZoneId` | varchar(64) | Y |  |  | IANA time zone used to display times to the user. NULL means Asia/Dubai. |
| 10 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |
| 11 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 12 | `UpdatedAt` | datetimeoffset(3) | Y |  |  | UTC time the row was last changed. |
| 13 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_StaffUser` | `StaffUserId` | Uniquely identifies each row (StaffUserId). |
| FOREIGN KEY | `FK_StaffUser_ActiveRole` | `ActiveRoleCode -> idn.AccessRole` | Every value must exist in idn.AccessRole, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_StaffUser_LinkedCandidate` | `LinkedCandidatePublicId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| UNIQUE | `UQ_StaffUser_Email` | `Email` | Each staff e-mail is unique. |
| UNIQUE | `UQ_StaffUser_PublicId` | `PublicId` | API identifiers are unique. |
| UNIQUE | `UX_StaffUser_IdamUserId` | `IdamUserId WHERE ([IdamUserId] IS NOT NULL)` | One staff user per IDAM user. |
| UNIQUE | `UX_StaffUser_LinkedCandidate` | `LinkedCandidatePublicId WHERE ([LinkedCandidatePublicId] IS NOT NULL)` | A candidate record can be linked to only one staff user. |
| CHECK | `CK_StaffUser_Culture` | `([PreferredCulture] IS NULL OR ([PreferredCulture]='en-AE' OR [PreferredCulture]='ar-AE'))` | Preferred culture is empty, ar-AE or en-AE. |

### idn.StaffWorkPool

Which staff users work which work pools, and when. Source of the target officer and referee lists and of referee eligibility.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `StaffUserId` | int | N | PK; FK -> idn.StaffUser.StaffUserId |  | Staff user this row refers to. (Links to idn.StaffUser.) |
| 2 | `WorkPoolId` | int | N | PK; FK -> cfg.WorkPool.WorkPoolId |  | Links to cfg.WorkPool. |
| 3 | `ValidFrom` | date | N | PK | (CONVERT([date],sysutcdatetime())) | First day the user works the pool. |
| 4 | `ValidTo` | date | Y |  |  | Last day the user works the pool. NULL means open ended. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_StaffWorkPool` | `StaffUserId, WorkPoolId, ValidFrom` | Uniquely identifies each row (StaffUserId, WorkPoolId, ValidFrom). |
| FOREIGN KEY | `FK_StaffWorkPool_StaffUser` | `StaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_StaffWorkPool_WorkPool` | `WorkPoolId -> cfg.WorkPool` | Every value must exist in cfg.WorkPool, so no row can point to something that does not exist. |
| CHECK | `CK_StaffWorkPool_Dates` | `([ValidTo] IS NULL OR [ValidTo]>=[ValidFrom])` | Validity end cannot be before its start. |

## app - Application

Application: the application aggregate and its number counter, ranked programme/specialty/site preferences, versioned section data, the personal-information snapshot taken at submission, status history, withdrawal and reinstatement requests, direct screen-out reinstatements, contact verifications, plus the versioned form definition.

### app.Application

The application aggregate: one application of a candidate to a programme cycle. Holds the application number, the status, version for optimistic locking and key dates.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationId` | bigint | N | PK |  | Application this row belongs to. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationNumber` | char(11) | N |  |  | Application ID shown to people and used to match CASPER rows: cycle start year plus a 7-digit counter, for example 20270000001. 11 digits, never starts with 0. Unique. |
| 4 | `CandidateId` | bigint | N | FK -> idn.Candidate.CandidateId |  | Candidate this row belongs to. (Links to idn.Candidate.) |
| 5 | `ProgramCycleId` | int | N | FK -> cfg.ProgramCycle.ProgramCycleId |  | Links to cfg.ProgramCycle. |
| 6 | `FormSchemaVersionId` | int | N | FK -> app.FormSchemaVersion.FormSchemaVersionId |  | Links to app.FormSchemaVersion. |
| 7 | `StatusCode` | varchar(40) | N | FK -> cfg.ApplicationStatus.StatusCode | ('DRAFT') | Current application status. (Links to cfg.ApplicationStatus.) |
| 8 | `VersionNo` | int | N |  | ((1)) | Version counter used for ETag and If-Match optimistic locking. |
| 9 | `TermsVersion` | varchar(20) | Y |  |  | Version of the terms the candidate accepted. |
| 10 | `TermsAcceptedAt` | datetimeoffset(3) | Y |  |  | UTC time the candidate accepted the terms. |
| 11 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 12 | `LastSavedAt` | datetimeoffset(3) | Y |  |  | UTC time the draft was last saved. |
| 13 | `SubmittedAt` | datetimeoffset(3) | Y |  |  | UTC time the application was submitted. |
| 14 | `ArchivedAt` | datetimeoffset(3) | Y |  |  | UTC time the draft was archived by the maintenance job. |
| 15 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Application` | `ApplicationId` | Uniquely identifies each row (ApplicationId). |
| FOREIGN KEY | `FK_Application_Candidate` | `CandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Application_FormSchemaVersion` | `FormSchemaVersionId -> app.FormSchemaVersion` | Every value must exist in app.FormSchemaVersion, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Application_ProgramCycle` | `ProgramCycleId -> cfg.ProgramCycle` | Every value must exist in cfg.ProgramCycle, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Application_Status` | `StatusCode -> cfg.ApplicationStatus` | Every value must exist in cfg.ApplicationStatus, so no row can point to something that does not exist. |
| UNIQUE | `UQ_Application_Number` | `ApplicationNumber` | Each application number is unique. |
| UNIQUE | `UQ_Application_PublicId` | `PublicId` | API identifiers are unique. |
| UNIQUE | `UX_Application_LivePerCandidateProgramCycle` | `CandidateId, ProgramCycleId WHERE ([StatusCode]<>'WITHDRAWN' AND [StatusCode]<>'ARCHIVED')` | A candidate may have only one live (not withdrawn or archived) application per programme cycle. |
| CHECK | `CK_Application_Number` | `([ApplicationNumber] like '[1-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')` | The application number is 11 digits and does not start with 0. |
| CHECK | `CK_Application_Submitted` | `([StatusCode]='ARCHIVED' OR [StatusCode]='DRAFT' OR [SubmittedAt] IS NOT NULL)` | A submitted application must have a submission time; only drafts and archived applications may lack one. A draft cannot be withdrawn. |
| CHECK | `CK_Application_VersionNo` | `([VersionNo]>=(1))` | Version number starts at 1. |

### app.ApplicationNumberCounter

Per-cycle counter that issues application numbers <cycle start year><7-digit counter>. One atomic update per new application guarantees a number is never issued twice.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `AdmissionCycleId` | int | N | PK; FK -> cfg.AdmissionCycle.CycleId |  | Admission cycle the counter belongs to. (Links to cfg.AdmissionCycle.) |
| 2 | `CycleStartYear` | smallint | N |  |  | Year the cycle starts; the first four digits of its application numbers. Unique. |
| 3 | `LastValue` | int | N |  | ((0)) | Last counter value issued (0 to 9999999). |
| 4 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationNumberCounter` | `AdmissionCycleId` | Uniquely identifies each row (AdmissionCycleId). |
| FOREIGN KEY | `FK_ApplicationNumberCounter_Cycle` | `AdmissionCycleId -> cfg.AdmissionCycle` | Every value must exist in cfg.AdmissionCycle, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ApplicationNumberCounter_Year` | `CycleStartYear` | Two cycles cannot start in the same year, so application numbers cannot collide across cycles. |
| CHECK | `CK_ApplicationNumberCounter_Value` | `([LastValue]>=(0) AND [LastValue]<=(9999999))` | The counter stays within 7 digits. |
| CHECK | `CK_ApplicationNumberCounter_Year` | `([CycleStartYear]>=(1000) AND [CycleStartYear]<=(9999))` | The start year has four digits. |

### app.ApplicationPersonalSnapshot

The candidate's personal information exactly as it was when the application was submitted (D-15). Later profile edits or ICP refreshes do not change it.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationId` | bigint | N | PK; FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 2 | `SnapshotJson` | json | N |  |  | Personal-information fields as submitted. Personal data. |
| 3 | `ProfileRowVersion` | binary | N |  |  | Row version of the profile the snapshot was taken from. |
| 4 | `TakenAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the snapshot was taken (submission). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationPersonalSnapshot` | `ApplicationId` | Uniquely identifies each row (ApplicationId). |
| FOREIGN KEY | `FK_ApplicationPersonalSnapshot_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |

### app.ApplicationPreference

A ranked specialty choice within an application. At most two per application.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationPreferenceId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 3 | `PreferenceOrder` | tinyint | N |  |  | Rank of the preference: 1 or 2. Preference 1 is the reference choice. |
| 4 | `ProgramSpecialtyId` | int | N | FK -> cfg.ProgramSpecialty.ProgramSpecialtyId |  | Specialty chosen. (Links to cfg.ProgramSpecialty.) |
| 5 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationPreference` | `ApplicationPreferenceId` | Uniquely identifies each row (ApplicationPreferenceId). |
| FOREIGN KEY | `FK_ApplicationPreference_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationPreference_ProgramSpecialty` | `ProgramSpecialtyId -> cfg.ProgramSpecialty` | Every value must exist in cfg.ProgramSpecialty, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ApplicationPreference_Order` | `ApplicationId, PreferenceOrder` | Each rank is used once per application. |
| UNIQUE | `UQ_ApplicationPreference_Specialty` | `ApplicationId, ProgramSpecialtyId` | The same specialty cannot be chosen twice in one application. |
| UNIQUE | `UQ_ApplicationPreference_WithSpecialty` | `ApplicationPreferenceId, ProgramSpecialtyId` | Supports the composite foreign key that ties each site choice to the same specialty. |
| CHECK | `CK_ApplicationPreference_Order` | `([PreferenceOrder]>=(1) AND [PreferenceOrder]<=(2))` | A preference is rank 1 or 2, so at most two per application. |

### app.ApplicationPreferenceSite

An ordered training-site choice within a specialty preference. The site must offer the chosen specialty.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationPreferenceSiteId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ApplicationPreferenceId` | bigint | N | FK -> app.ApplicationPreference.ApplicationPreferenceId |  | Links to app.ApplicationPreference. |
| 3 | `ProgramSpecialtyId` | int | N | FK -> app.ApplicationPreference.ProgramSpecialtyId |  | Specialty of the parent preference. Repeated so the foreign key proves the site offers this specialty. (Links to app.ApplicationPreference.) |
| 4 | `SpecialtySiteId` | int | N | FK -> cfg.SpecialtySite.SpecialtySiteId |  | Links to cfg.SpecialtySite. |
| 5 | `SiteOrder` | tinyint | N |  |  | Order of the site within the preference, starting at 1. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationPreferenceSite` | `ApplicationPreferenceSiteId` | Uniquely identifies each row (ApplicationPreferenceSiteId). |
| FOREIGN KEY | `FK_ApplicationPreferenceSite_Preference` | `ApplicationPreferenceId, ProgramSpecialtyId -> app.ApplicationPreference` | Every value must exist in app.ApplicationPreference, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationPreferenceSite_SpecialtySite` | `SpecialtySiteId, ProgramSpecialtyId -> cfg.SpecialtySite` | Every value must exist in cfg.SpecialtySite, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ApplicationPreferenceSite_Order` | `ApplicationPreferenceId, SiteOrder` | Each site order is used once per preference. |
| UNIQUE | `UQ_ApplicationPreferenceSite_Site` | `ApplicationPreferenceId, SpecialtySiteId` | The same site cannot be chosen twice for one specialty. |
| CHECK | `CK_ApplicationPreferenceSite_Order` | `([SiteOrder]>=(1))` | Site order starts at 1. |

### app.ApplicationSection

The current values of one application form section, stored as JSON and versioned. Personal information is not stored here; it is in idn.CandidatePersonalProfile.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationSectionId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 3 | `SectionKey` | varchar(50) | N |  |  | Key of the application form section, from the fixed set of section keys. Allowed values: academic-information, application-information, board-license-information, english-proficiency, internship-information, personal-information, residency-entrance-exam, residency-information. |
| 4 | `FormSchemaVersionId` | int | N | FK -> app.FormSchemaVersion.FormSchemaVersionId |  | Links to app.FormSchemaVersion. |
| 5 | `ValuesJson` | json | N |  |  | Field values of the section as JSON, validated against the form schema. Personal-information fields are not stored here. |
| 6 | `VersionNo` | int | N |  | ((1)) | Version counter, starting at 1 and increasing with each change. |
| 7 | `IsComplete` | bit | N |  | ((0)) | 1 when the section passes validation. |
| 8 | `UpdatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was last changed. |
| 9 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationSection` | `ApplicationSectionId` | Uniquely identifies each row (ApplicationSectionId). |
| FOREIGN KEY | `FK_ApplicationSection_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationSection_FormSchemaVersion` | `FormSchemaVersionId -> app.FormSchemaVersion` | Every value must exist in app.FormSchemaVersion, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ApplicationSection` | `ApplicationId, SectionKey` | One current row per section per application. |
| CHECK | `CK_ApplicationSection_Key` | `([SectionKey]='residency-entrance-exam' OR [SectionKey]='board-license-information' OR [SectionKey]='residency-information' OR [SectionKey]='internship-information' OR [SectionKey]='english-proficiency' OR [SectionKey]='academic-information' OR [SectionKey]='personal-information' OR [SectionKey]='application-information')` | Restricts SectionKey to: academic-information, application-information, board-license-information, english-proficiency, internship-information, personal-information, residency-entrance-exam, residency-information. |

### app.ApplicationSectionHistory

Immutable history of every saved version of a form section.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationSectionId` | bigint | N | PK; FK -> app.ApplicationSection.ApplicationSectionId |  | Links to app.ApplicationSection. |
| 2 | `VersionNo` | int | N | PK |  | Version counter, starting at 1 and increasing with each change. |
| 3 | `ValuesJson` | json | N |  |  | Field values of the section as JSON, validated against the form schema. |
| 4 | `ChangeKind` | varchar(20) | N |  |  | Source of the change: DRAFT_SAVE, CORRECTION, ICP_REFRESH or SYSTEM. |
| 5 | `ChangedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the change happened. |
| 6 | `ChangedByCandidateId` | bigint | Y |  |  | Candidate who made the change, if any. |
| 7 | `ChangedByStaffUserId` | int | Y |  |  | Staff user who made the change, if any. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationSectionHistory` | `ApplicationSectionId, VersionNo` | Uniquely identifies each row (ApplicationSectionId, VersionNo). |
| FOREIGN KEY | `FK_ApplicationSectionHistory_Section` | `ApplicationSectionId -> app.ApplicationSection` | Every value must exist in app.ApplicationSection, so no row can point to something that does not exist. |
| CHECK | `CK_ApplicationSectionHistory_Kind` | `([ChangeKind]='SYSTEM' OR [ChangeKind]='ICP_REFRESH' OR [ChangeKind]='CORRECTION' OR [ChangeKind]='DRAFT_SAVE')` | Restricts ChangeKind to: CORRECTION, DRAFT_SAVE, ICP_REFRESH, SYSTEM. |

### app.ApplicationStatusHistory

Every status change of an application with who made it and why.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationStatusHistoryId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 3 | `FromStatusCode` | varchar(40) | Y | FK -> cfg.ApplicationStatus.StatusCode |  | Status before the change. (Links to cfg.ApplicationStatus.) |
| 4 | `ToStatusCode` | varchar(40) | N | FK -> cfg.ApplicationStatus.StatusCode |  | Status after the change. (Links to cfg.ApplicationStatus.) |
| 5 | `ReasonCodeId` | int | Y | FK -> cfg.ReasonCode.ReasonCodeId |  | Links to cfg.ReasonCode. |
| 6 | `Note` | nvarchar(500) | Y |  |  | Optional free-text note. |
| 7 | `ActorType` | varchar(20) | N |  |  | Kind of actor: candidate, staff, service or system. Allowed values: CANDIDATE, SERVICE, STAFF, SYSTEM. |
| 8 | `ActorCandidateId` | bigint | Y |  |  | Candidate who acted, when the actor is a candidate. |
| 9 | `ActorStaffUserId` | int | Y |  |  | Staff user who acted, when the actor is staff. |
| 10 | `ChangedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the change happened. |
| 11 | `AuditEventId` | bigint | Y |  |  | Audit event written for this change. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationStatusHistory` | `ApplicationStatusHistoryId` | Uniquely identifies each row (ApplicationStatusHistoryId). |
| FOREIGN KEY | `FK_ApplicationStatusHistory_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationStatusHistory_From` | `FromStatusCode -> cfg.ApplicationStatus` | Every value must exist in cfg.ApplicationStatus, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationStatusHistory_Reason` | `ReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationStatusHistory_To` | `ToStatusCode -> cfg.ApplicationStatus` | Every value must exist in cfg.ApplicationStatus, so no row can point to something that does not exist. |
| CHECK | `CK_ApplicationStatusHistory_Actor` | `([ActorType]='SYSTEM' OR [ActorType]='SERVICE' OR [ActorType]='STAFF' OR [ActorType]='CANDIDATE')` | Restricts ActorType to: CANDIDATE, SERVICE, STAFF, SYSTEM. |

### app.ContactVerification

A one-time-code check of a changed contact e-mail or mobile number. Only a hash of the value is kept; codes are never stored.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ContactVerificationId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `CandidateId` | bigint | N | FK -> idn.Candidate.CandidateId |  | Candidate this row belongs to. (Links to idn.Candidate.) |
| 4 | `ApplicationId` | bigint | Y | FK -> app.Application.ApplicationId |  | Application being edited when the check started, if any. (Links to app.Application.) |
| 5 | `ChannelCode` | varchar(10) | N |  |  | EMAIL or SMS. |
| 6 | `ValueHash` | binary | N |  |  | SHA-256 hash of the e-mail or mobile number being verified. The value itself is not stored here. |
| 7 | `OtpProviderRef` | varchar(100) | Y |  |  | Reference to the one-time-code challenge at the provider. The code itself is never stored. |
| 8 | `ExpiresAt` | datetimeoffset(3) | N |  |  | UTC time the issued code stops being accepted. |
| 9 | `ResendAvailableAt` | datetimeoffset(3) | N |  |  | Earliest UTC time a new code can be requested (resend cooldown). |
| 10 | `ResendCount` | tinyint | N |  | ((0)) | Number of times the code was resent. |
| 11 | `AttemptCount` | tinyint | N |  | ((0)) | Number of confirmation attempts made. |
| 12 | `VerifiedAt` | datetimeoffset(3) | Y |  |  | UTC time the code was confirmed. |
| 13 | `ValidUntil` | datetimeoffset(3) | Y |  |  | UTC time by which the profile must be saved with the verified value; afterwards a new check is needed. |
| 14 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ContactVerification` | `ContactVerificationId` | Uniquely identifies each row (ContactVerificationId). |
| FOREIGN KEY | `FK_ContactVerification_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ContactVerification_Candidate` | `CandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ContactVerification_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_ContactVerification_Channel` | `([ChannelCode]='SMS' OR [ChannelCode]='EMAIL')` | Restricts ChannelCode to: EMAIL, SMS. |
| CHECK | `CK_ContactVerification_Verified` | `([VerifiedAt] IS NULL AND [ValidUntil] IS NULL OR [VerifiedAt] IS NOT NULL AND [ValidUntil] IS NOT NULL)` | Verification time and validity end are both set or both empty. |

### app.FormField

A field within a form section, with its type, visibility and validation rules.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `FormFieldId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `FormSectionId` | int | N | FK -> app.FormSection.FormSectionId |  | Links to app.FormSection. |
| 3 | `FieldCode` | varchar(80) | N |  |  | Code of the form field. |
| 4 | `DisplayLabel` | nvarchar(300) | N |  |  | Label shown to the candidate. |
| 5 | `TooltipText` | nvarchar(500) | Y |  |  | Help text shown beside the field. |
| 6 | `DataType` | varchar(20) | N |  |  | Field type, such as text, date, single select or file reference. Allowed values: BOOLEAN, DATE, DATE_TIME, DECIMAL, FILE_REFERENCE, INTEGER, MULTI_SELECT, SINGLE_SELECT, STRING, TEXT, URL. |
| 7 | `IsVisible` | bit | N |  | ((1)) | 1 when the field is shown by default. |
| 8 | `IsRequired` | bit | N |  | ((0)) | 1 when the field is required by default. |
| 9 | `IsReadOnly` | bit | N |  | ((0)) | 1 when the candidate cannot edit the value (for example data from ICP). |
| 10 | `ConstraintsJson` | json | Y |  |  | Validation rules such as length, range or pattern, as JSON. |
| 11 | `DisplayOrder` | smallint | N |  |  | Position within its parent when displayed. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_FormField` | `FormFieldId` | Uniquely identifies each row (FormFieldId). |
| FOREIGN KEY | `FK_FormField_Section` | `FormSectionId -> app.FormSection` | Every value must exist in app.FormSection, so no row can point to something that does not exist. |
| UNIQUE | `UQ_FormField` | `FormSectionId, FieldCode` | Field codes are unique within a section. |
| CHECK | `CK_FormField_DataType` | `([DataType]='URL' OR [DataType]='FILE_REFERENCE' OR [DataType]='MULTI_SELECT' OR [DataType]='SINGLE_SELECT' OR [DataType]='DATE_TIME' OR [DataType]='DATE' OR [DataType]='BOOLEAN' OR [DataType]='DECIMAL' OR [DataType]='INTEGER' OR [DataType]='TEXT' OR [DataType]='STRING')` | Restricts DataType to: BOOLEAN, DATE, DATE_TIME, DECIMAL, FILE_REFERENCE, INTEGER, MULTI_SELECT, SINGLE_SELECT, STRING, TEXT, URL. |

### app.FormFieldCondition

A rule making a field visible or required depending on another field's value.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `FormFieldConditionId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `FormFieldId` | int | N | FK -> app.FormField.FormFieldId |  | Links to app.FormField. |
| 3 | `ConditionKind` | varchar(15) | N |  |  | VISIBLE_WHEN or REQUIRED_WHEN. |
| 4 | `DependsOnFieldCode` | varchar(80) | N |  |  | Code of the field whose value drives the condition. |
| 5 | `Operator` | varchar(10) | N |  |  | Comparison operator, such as EQ, IN, GT or EMPTY. |
| 6 | `ValueJson` | json | Y |  |  | Value to compare with, as JSON. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_FormFieldCondition` | `FormFieldConditionId` | Uniquely identifies each row (FormFieldConditionId). |
| FOREIGN KEY | `FK_FormFieldCondition_Field` | `FormFieldId -> app.FormField` | Every value must exist in app.FormField, so no row can point to something that does not exist. |
| CHECK | `CK_FormFieldCondition_Kind` | `([ConditionKind]='REQUIRED_WHEN' OR [ConditionKind]='VISIBLE_WHEN')` | Restricts ConditionKind to: REQUIRED_WHEN, VISIBLE_WHEN. |
| CHECK | `CK_FormFieldCondition_Operator` | `([Operator]='EMPTY' OR [Operator]='NOT_EMPTY' OR [Operator]='LTE' OR [Operator]='LT' OR [Operator]='GTE' OR [Operator]='GT' OR [Operator]='NOT_IN' OR [Operator]='IN' OR [Operator]='NE' OR [Operator]='EQ')` | Restricts Operator to: EMPTY, EQ, GT, GTE, IN, LT, LTE, NE, NOT_EMPTY, NOT_IN. |

### app.FormFieldOption

A selectable option for a single-select or multi-select field.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `FormFieldId` | int | N | PK; FK -> app.FormField.FormFieldId |  | Links to app.FormField. |
| 2 | `OptionCode` | varchar(80) | N | PK |  | Stored value of the option. |
| 3 | `DisplayLabel` | nvarchar(300) | N |  |  | Text shown for the option. |
| 4 | `DisplayOrder` | smallint | N |  |  | Position within its parent when displayed. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_FormFieldOption` | `FormFieldId, OptionCode` | Uniquely identifies each row (FormFieldId, OptionCode). |
| FOREIGN KEY | `FK_FormFieldOption_Field` | `FormFieldId -> app.FormField` | Every value must exist in app.FormField, so no row can point to something that does not exist. |

### app.FormSchemaVersion

A versioned form definition for a programme. Applications pin the version they were started with.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `FormSchemaVersionId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ProgramId` | int | N | FK -> cfg.Program.ProgramId |  | Links to cfg.Program. |
| 3 | `VersionLabel` | varchar(30) | N |  |  | Human-readable label of this approved version. |
| 4 | `StatusCode` | varchar(15) | N |  | ('DRAFT') | DRAFT, APPROVED or RETIRED. |
| 5 | `EffectiveFrom` | date | N |  |  | First date this version applies. |
| 6 | `EffectiveTo` | date | Y |  |  | Last date this version applies. NULL means open ended. |
| 7 | `ApprovedBy` | nvarchar(200) | Y |  |  | Name of the person who approved this version. |
| 8 | `ApprovedAt` | datetimeoffset(3) | Y |  |  | UTC time of approval. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_FormSchemaVersion` | `FormSchemaVersionId` | Uniquely identifies each row (FormSchemaVersionId). |
| FOREIGN KEY | `FK_FormSchemaVersion_Program` | `ProgramId -> cfg.Program` | Every value must exist in cfg.Program, so no row can point to something that does not exist. |
| UNIQUE | `UQ_FormSchemaVersion` | `ProgramId, VersionLabel` | Version labels are unique per programme. |
| CHECK | `CK_FormSchemaVersion_Dates` | `([EffectiveTo] IS NULL OR [EffectiveTo]>=[EffectiveFrom])` | End date cannot be before the start date. |
| CHECK | `CK_FormSchemaVersion_Status` | `([StatusCode]='RETIRED' OR [StatusCode]='APPROVED' OR [StatusCode]='DRAFT')` | Restricts StatusCode to: APPROVED, DRAFT, RETIRED. |

### app.FormSection

A section (page) of a form schema version.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `FormSectionId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `FormSchemaVersionId` | int | N | FK -> app.FormSchemaVersion.FormSchemaVersionId |  | Links to app.FormSchemaVersion. |
| 3 | `SectionKey` | varchar(50) | N |  |  | Key of the application form section, from the fixed set of section keys. Allowed values: academic-information, application-information, board-license-information, english-proficiency, internship-information, personal-information, residency-entrance-exam, residency-information. |
| 4 | `Title` | nvarchar(200) | N |  |  | Section title shown to the candidate. |
| 5 | `DisplayOrder` | smallint | N |  |  | Position within its parent when displayed. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_FormSection` | `FormSectionId` | Uniquely identifies each row (FormSectionId). |
| FOREIGN KEY | `FK_FormSection_Version` | `FormSchemaVersionId -> app.FormSchemaVersion` | Every value must exist in app.FormSchemaVersion, so no row can point to something that does not exist. |
| UNIQUE | `UQ_FormSection` | `FormSchemaVersionId, SectionKey` | Section keys are unique within a form version. |
| CHECK | `CK_FormSection_Key` | `([SectionKey]='residency-entrance-exam' OR [SectionKey]='board-license-information' OR [SectionKey]='residency-information' OR [SectionKey]='internship-information' OR [SectionKey]='english-proficiency' OR [SectionKey]='academic-information' OR [SectionKey]='personal-information' OR [SectionKey]='application-information')` | Restricts SectionKey to: academic-information, application-information, board-license-information, english-proficiency, internship-information, personal-information, residency-entrance-exam, residency-information. |

### app.ReinstatementRequest

A candidate request to reinstate a withdrawn application, with the candidate's justification and the supervisor's decision.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ReinstatementRequestId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 4 | `Justification` | nvarchar(1000) | N |  |  | The candidate's mandatory justification (up to 1000 characters). |
| 5 | `StatusCode` | varchar(15) | N |  | ('SUBMITTED') | SUBMITTED, APPROVED or REJECTED. |
| 6 | `RequestedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the request was made. |
| 7 | `DecidedByStaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Supervisor who decided. (Links to idn.StaffUser.) |
| 8 | `DecidedAt` | datetimeoffset(3) | Y |  |  | UTC time the decision was made. |
| 9 | `DecisionReasonCodeId` | int | Y | FK -> cfg.ReasonCode.ReasonCodeId |  | Rejection reason from lookup REINSTATEMENT_REJECTION_REASON. Required when rejected. (Links to cfg.ReasonCode.) |
| 10 | `DecisionNote` | nvarchar(500) | Y |  |  | Supervisor's mandatory note, recorded with any decision. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ReinstatementRequest` | `ReinstatementRequestId` | Uniquely identifies each row (ReinstatementRequestId). |
| FOREIGN KEY | `FK_ReinstatementRequest_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ReinstatementRequest_DecidedBy` | `DecidedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ReinstatementRequest_DecisionReason` | `DecisionReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ReinstatementRequest_PublicId` | `PublicId` | API identifiers are unique. |
| UNIQUE | `UX_ReinstatementRequest_OnePending` | `ApplicationId WHERE ([StatusCode]='SUBMITTED')` | Only one open (submitted) reinstatement request per application. |
| CHECK | `CK_ReinstatementRequest_Decision` | `([StatusCode]='SUBMITTED' AND [DecidedAt] IS NULL AND [DecidedByStaffUserId] IS NULL AND [DecisionNote] IS NULL OR [StatusCode]<>'SUBMITTED' AND [DecidedAt] IS NOT NULL AND [DecidedByStaffUserId] IS NOT NULL AND [DecisionNote] IS NOT NULL)` | A submitted request has no decision details; a decided request must have decision time, decider and note. |
| CHECK | `CK_ReinstatementRequest_RejectReason` | `([StatusCode]<>'REJECTED' OR [DecisionReasonCodeId] IS NOT NULL)` | A rejection must have a rejection reason. |
| CHECK | `CK_ReinstatementRequest_Status` | `([StatusCode]='REJECTED' OR [StatusCode]='APPROVED' OR [StatusCode]='SUBMITTED')` | Restricts StatusCode to: APPROVED, REJECTED, SUBMITTED. |

### app.ScreenOutReinstatement

A supervisor's direct reinstatement of a screened-out application, with the justification and the statuses that were restored.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ScreenOutReinstatementId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 4 | `Justification` | nvarchar(500) | N |  |  | Supervisor's mandatory justification (3 to 500 characters). |
| 5 | `RestoredApplicationStatusCode` | varchar(40) | N | FK -> cfg.ApplicationStatus.StatusCode |  | Application status restored (the status before the screen-out). (Links to cfg.ApplicationStatus.) |
| 6 | `RestoredVerificationStatusCode` | varchar(40) | Y | FK -> cfg.VerificationStatus.StatusCode |  | Verification status restored, if any. (Links to cfg.VerificationStatus.) |
| 7 | `RestoredPortfolioStatusCode` | varchar(40) | Y | FK -> cfg.PortfolioStatus.StatusCode |  | Portfolio status restored, if any. (Links to cfg.PortfolioStatus.) |
| 8 | `ReinstatedByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Supervisor who reinstated the application. (Links to idn.StaffUser.) |
| 9 | `ReinstatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of the reinstatement. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScreenOutReinstatement` | `ScreenOutReinstatementId` | Uniquely identifies each row (ScreenOutReinstatementId). |
| FOREIGN KEY | `FK_ScreenOutReinstatement_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScreenOutReinstatement_ApplicationStatus` | `RestoredApplicationStatusCode -> cfg.ApplicationStatus` | Every value must exist in cfg.ApplicationStatus, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScreenOutReinstatement_PortfolioStatus` | `RestoredPortfolioStatusCode -> cfg.PortfolioStatus` | Every value must exist in cfg.PortfolioStatus, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScreenOutReinstatement_Staff` | `ReinstatedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScreenOutReinstatement_VerificationStatus` | `RestoredVerificationStatusCode -> cfg.VerificationStatus` | Every value must exist in cfg.VerificationStatus, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ScreenOutReinstatement_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_ScreenOutReinstatement_Justification` | `(len([Justification])>=(3))` | The justification has at least 3 characters. |
| CHECK | `CK_ScreenOutReinstatement_Restored` | `([RestoredApplicationStatusCode]<>'SCREENED_OUT')` | The restored application status cannot be Screened out. |

### app.SiteExclusion

Records a site removed from a candidate's preferences after it was selected, with the candidate's free-text reason.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `SiteExclusionId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ApplicationPreferenceSiteId` | bigint | N | FK -> app.ApplicationPreferenceSite.ApplicationPreferenceSiteId |  | Links to app.ApplicationPreferenceSite. |
| 3 | `ReasonCodeId` | int | Y | FK -> cfg.ReasonCode.ReasonCodeId |  | Reserved for a future reason list; the BRD asks for free text only. (Links to cfg.ReasonCode.) |
| 4 | `ReasonText` | nvarchar(500) | N |  |  | The candidate's mandatory reason for the exclusion (up to 500 characters); one reason covers all sites excluded together. |
| 5 | `ExcludedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the site was excluded. |
| 6 | `ExcludedByCandidateId` | bigint | N | FK -> idn.Candidate.CandidateId |  | Candidate who removed the site. (Links to idn.Candidate.) |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_SiteExclusion` | `SiteExclusionId` | Uniquely identifies each row (SiteExclusionId). |
| FOREIGN KEY | `FK_SiteExclusion_Candidate` | `ExcludedByCandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_SiteExclusion_Reason` | `ReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_SiteExclusion_Site` | `ApplicationPreferenceSiteId -> app.ApplicationPreferenceSite` | Every value must exist in app.ApplicationPreferenceSite, so no row can point to something that does not exist. |
| UNIQUE | `UQ_SiteExclusion_Site` | `ApplicationPreferenceSiteId` | A site choice can be excluded only once. |

### app.WithdrawalRequest

A candidate request to withdraw an application, confirmed through a one-time password held by an external provider.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `WithdrawalRequestId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 4 | `ReasonCodeId` | int | N | FK -> cfg.ReasonCode.ReasonCodeId |  | Withdrawal reason from lookup WITHDRAWAL_REASON. (Links to cfg.ReasonCode.) |
| 5 | `OtherReasonText` | nvarchar(500) | Y |  |  | Free-text reason, required when the reason is OTHER (at least 3 letters). |
| 6 | `StatusCode` | varchar(25) | N |  | ('PENDING_CONFIRMATION') | PENDING_CONFIRMATION, CONFIRMED, CANCELLED or EXPIRED. |
| 7 | `OtpProviderRef` | varchar(100) | Y |  |  | Reference to the one-time-password challenge at the provider. The code itself is never stored. |
| 8 | `OtpAttemptCount` | tinyint | N |  | ((0)) | Number of confirmation attempts made. |
| 9 | `OtpLastSentAt` | datetimeoffset(3) | Y |  |  | UTC time the last one-time code was sent. |
| 10 | `OtpResendCount` | tinyint | N |  | ((0)) | Number of times the code was resent. |
| 11 | `ResendAvailableAt` | datetimeoffset(3) | Y |  |  | Earliest UTC time a new code can be requested (resend cooldown). |
| 12 | `RequestedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the request was made. |
| 13 | `ExpiresAt` | datetimeoffset(3) | N |  |  | UTC time the confirmation window ends. |
| 14 | `ConfirmedAt` | datetimeoffset(3) | Y |  |  | UTC time the candidate confirmed. Set only when confirmed. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_WithdrawalRequest` | `WithdrawalRequestId` | Uniquely identifies each row (WithdrawalRequestId). |
| FOREIGN KEY | `FK_WithdrawalRequest_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_WithdrawalRequest_Reason` | `ReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| UNIQUE | `UQ_WithdrawalRequest_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_WithdrawalRequest_Confirmed` | `([StatusCode]='CONFIRMED' AND [ConfirmedAt] IS NOT NULL OR [StatusCode]<>'CONFIRMED' AND [ConfirmedAt] IS NULL)` | Confirmation time is set only when the request is confirmed. |
| CHECK | `CK_WithdrawalRequest_Status` | `([StatusCode]='CANCELLED' OR [StatusCode]='EXPIRED' OR [StatusCode]='CONFIRMED' OR [StatusCode]='PENDING_CONFIRMATION')` | Restricts StatusCode to: CANCELLED, CONFIRMED, EXPIRED, PENDING_CONFIRMATION. |

## doc - Documents

Documents: type, metadata, versions, integrity hash, malware-scan status and storage status of uploaded files. File content itself goes through Rhapsody to the enterprise content store (FileNet).

### doc.Attachment

A file slot owned by an application (or the CASPER import), such as a form upload or portfolio evidence.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `AttachmentId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationId` | bigint | Y | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 4 | `Purpose` | varchar(30) | N |  |  | What the file is for: APPLICATION_FORM, PORTFOLIO_EVIDENCE, PAYMENT_RECEIPT or CASPER_IMPORT. |
| 5 | `DocumentTypeId` | int | Y | FK -> cfg.DocumentType.DocumentTypeId |  | Type of document, which sets the allowed file types and size. NULL for CASPER imports. (Links to cfg.DocumentType.) |
| 6 | `SpecialtyId` | int | Y | FK -> cfg.Specialty.SpecialtyId |  | Specialty a per-specialty document belongs to, such as a recommendation letter for a preference. (Links to cfg.Specialty.) |
| 7 | `SectionKey` | varchar(50) | Y |  |  | Form section the file belongs to, when applicable. |
| 8 | `FieldCode` | varchar(80) | Y |  |  | Form field the file belongs to, when applicable. |
| 9 | `ApplicationPreferenceSiteId` | bigint | Y | FK -> app.ApplicationPreferenceSite.ApplicationPreferenceSiteId |  | Links to app.ApplicationPreferenceSite. |
| 10 | `CurrentVersionNo` | int | N |  | ((1)) | Number of the current version. |
| 11 | `IsDeleted` | bit | N |  | ((0)) | 1 when the attachment was removed. Versions are kept. |
| 12 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 13 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Attachment` | `AttachmentId` | Uniquely identifies each row (AttachmentId). |
| FOREIGN KEY | `FK_Attachment_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Attachment_DocumentType` | `DocumentTypeId -> cfg.DocumentType` | Every value must exist in cfg.DocumentType, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Attachment_PreferenceSite` | `ApplicationPreferenceSiteId -> app.ApplicationPreferenceSite` | Every value must exist in app.ApplicationPreferenceSite, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Attachment_Specialty` | `SpecialtyId -> cfg.Specialty` | Every value must exist in cfg.Specialty, so no row can point to something that does not exist. |
| UNIQUE | `UQ_Attachment_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_Attachment_Owner` | `([Purpose]='CASPER_IMPORT' OR [ApplicationId] IS NOT NULL)` | A file must belong to an application unless it is a CASPER import. |
| CHECK | `CK_Attachment_Purpose` | `([Purpose]='PAYMENT_RECEIPT' OR [Purpose]='CASPER_IMPORT' OR [Purpose]='PORTFOLIO_EVIDENCE' OR [Purpose]='APPLICATION_FORM')` | Restricts Purpose to: APPLICATION_FORM, CASPER_IMPORT, PAYMENT_RECEIPT, PORTFOLIO_EVIDENCE. |

### doc.AttachmentVersion

An immutable version of an attachment: the content store reference, hash, size and malware-scan result.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `AttachmentId` | bigint | N | PK; FK -> doc.Attachment.AttachmentId |  | Links to doc.Attachment. |
| 2 | `VersionNo` | int | N | PK |  | Version number of the file, starting at 1. |
| 3 | `FileNetDocumentRef` | nvarchar(200) | Y |  |  | Reference to the file in FileNet, set once Rhapsody confirms storage. The file content is not in this database. |
| 4 | `FileName` | nvarchar(260) | N |  |  | Original file name. |
| 5 | `MediaType` | varchar(150) | N |  |  | MIME type, such as application/pdf. |
| 6 | `SizeBytes` | bigint | N |  |  | File size in bytes. |
| 7 | `Sha256` | binary | Y |  |  | SHA-256 hash of the content for integrity checks. |
| 8 | `MalwareScanStatus` | varchar(15) | N |  | ('PENDING') | PENDING, CLEAN, INFECTED or FAILED. |
| 9 | `StorageStatusCode` | varchar(15) | N |  | ('PENDING') | Where the file is in the Rhapsody-to-FileNet flow: PENDING, STORED, FAILED or PURGED. |
| 10 | `RhapsodyCorrelationRef` | varchar(100) | Y |  |  | Correlation id of the hand-off to Rhapsody. |
| 11 | `StoredAt` | datetimeoffset(3) | Y |  |  | UTC time FileNet storage was confirmed. |
| 12 | `PurgedAt` | datetimeoffset(3) | Y |  |  | UTC time the file was removed by the document-orphan-cleanup job (rules still open). |
| 13 | `UploadedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of upload. |
| 14 | `UploadedByCandidateId` | bigint | Y | FK -> idn.Candidate.CandidateId |  | Candidate who uploaded the file, if uploaded by a candidate. (Links to idn.Candidate.) |
| 15 | `UploadedByStaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Staff user who uploaded the file, if uploaded by staff. (Links to idn.StaffUser.) |
| 16 | `ReplacementReasonCodeId` | int | Y | FK -> cfg.ReasonCode.ReasonCodeId |  | Reason code for replacing the file. (Links to cfg.ReasonCode.) |
| 17 | `ReplacementNote` | nvarchar(500) | Y |  |  | Note explaining why staff replaced the file. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_AttachmentVersion` | `AttachmentId, VersionNo` | Uniquely identifies each row (AttachmentId, VersionNo). |
| FOREIGN KEY | `FK_AttachmentVersion_Attachment` | `AttachmentId -> doc.Attachment` | Every value must exist in doc.Attachment, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_AttachmentVersion_Candidate` | `UploadedByCandidateId -> idn.Candidate` | Every value must exist in idn.Candidate, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_AttachmentVersion_Reason` | `ReplacementReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_AttachmentVersion_Staff` | `UploadedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| CHECK | `CK_AttachmentVersion_Scan` | `([MalwareScanStatus]='FAILED' OR [MalwareScanStatus]='INFECTED' OR [MalwareScanStatus]='CLEAN' OR [MalwareScanStatus]='PENDING')` | Restricts MalwareScanStatus to: CLEAN, FAILED, INFECTED, PENDING. |
| CHECK | `CK_AttachmentVersion_Size` | `([SizeBytes]>=(0))` | File size cannot be negative. |
| CHECK | `CK_AttachmentVersion_Storage` | `([StorageStatusCode]='PURGED' OR [StorageStatusCode]='FAILED' OR [StorageStatusCode]='STORED' OR [StorageStatusCode]='PENDING')` | Restricts StorageStatusCode to: FAILED, PENDING, PURGED, STORED. |
| CHECK | `CK_AttachmentVersion_Stored` | `([StorageStatusCode]<>'STORED' OR [FileNetDocumentRef] IS NOT NULL)` | A version marked STORED must have its FileNet reference. |
| CHECK | `CK_AttachmentVersion_Uploader` | `([UploadedByCandidateId] IS NULL OR [UploadedByStaffUserId] IS NULL)` | A file version is uploaded by a candidate or by staff, not both. |

## pay - Payments

Payments: fee schedule, server-side provider routing, payment sessions, the immutable provider binding, normalised gateway events and reconciliation. No card data is stored.

### pay.FeeSchedule

The fee charged per programme cycle and fee type, effective-dated. Amounts need business approval.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `FeeScheduleId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ProgramCycleId` | int | N | FK -> cfg.ProgramCycle.ProgramCycleId |  | Links to cfg.ProgramCycle. |
| 3 | `FeeType` | varchar(30) | N |  |  | Type of fee, such as the application fee. |
| 4 | `Amount` | decimal(12,2) | N |  |  | Monetary amount in the stated currency. |
| 5 | `CurrencyCode` | char(3) | N |  | ('AED') | Currency of the amount. Only AED is allowed. |
| 6 | `EffectiveFrom` | date | N |  |  | First date this version applies. |
| 7 | `EffectiveTo` | date | Y |  |  | Last date this version applies. NULL means open ended. |
| 8 | `ApprovedBy` | nvarchar(200) | Y |  |  | Name of the person who approved this version. |
| 9 | `ApprovedAt` | datetimeoffset(3) | Y |  |  | UTC time of approval. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_FeeSchedule` | `FeeScheduleId` | Uniquely identifies each row (FeeScheduleId). |
| FOREIGN KEY | `FK_FeeSchedule_ProgramCycle` | `ProgramCycleId -> cfg.ProgramCycle` | Every value must exist in cfg.ProgramCycle, so no row can point to something that does not exist. |
| UNIQUE | `UQ_FeeSchedule` | `ProgramCycleId, FeeType, EffectiveFrom` | One fee per programme cycle, fee type and start date. |
| CHECK | `CK_FeeSchedule_Amount` | `([Amount]>(0))` | Fee must be greater than zero. |
| CHECK | `CK_FeeSchedule_Currency` | `([CurrencyCode]='AED')` | Fees are in AED only. |
| CHECK | `CK_FeeSchedule_Dates` | `([EffectiveTo] IS NULL OR [EffectiveTo]>=[EffectiveFrom])` | End date cannot be before the start date. |

### pay.PaymentGatewayEvent

A normalised, de-duplicated event received from a payment gateway.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PaymentGatewayEventId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ProviderCode` | varchar(30) | N | FK -> cfg.PaymentProvider.ProviderCode |  | Payment provider code (E_PAY or NETWORK_INTERNATIONAL). (Links to cfg.PaymentProvider.) |
| 3 | `ProviderEventId` | varchar(100) | N |  |  | Event id from the provider. With the provider code it is unique, so replays are ignored. |
| 4 | `PaymentSessionId` | bigint | N | FK -> pay.PaymentSession.PaymentSessionId |  | Links to pay.PaymentSession. |
| 5 | `ProviderTransactionId` | varchar(100) | Y |  |  | Transaction id from the provider. |
| 6 | `StatusCode` | varchar(15) | N |  |  | Payment status reported by the provider. Allowed values: CANCELLED, FAILED, PAID. |
| 7 | `Amount` | decimal(12,2) | N |  |  | Monetary amount in the stated currency. |
| 8 | `CurrencyCode` | char(3) | N |  |  | Currency of the amount. Only AED is allowed. |
| 9 | `OccurredAt` | datetimeoffset(3) | N |  |  | UTC time the event happened. |
| 10 | `ReceiptId` | varchar(100) | Y |  |  | Receipt reference issued by the payment provider. |
| 11 | `ReceivedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the event arrived. |
| 12 | `ProcessingOutcome` | varchar(25) | N |  |  | How it was handled: APPLIED, DUPLICATE_IGNORED or MISMATCH_REJECTED. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PaymentGatewayEvent` | `PaymentGatewayEventId` | Uniquely identifies each row (PaymentGatewayEventId). |
| FOREIGN KEY | `FK_PaymentGatewayEvent_Provider` | `ProviderCode -> cfg.PaymentProvider` | Every value must exist in cfg.PaymentProvider, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PaymentGatewayEvent_Session` | `PaymentSessionId -> pay.PaymentSession` | Every value must exist in pay.PaymentSession, so no row can point to something that does not exist. |
| UNIQUE | `UQ_PaymentGatewayEvent` | `ProviderCode, ProviderEventId` | A provider event is processed once; replays are detected. |
| CHECK | `CK_PaymentGatewayEvent_Amount` | `([Amount]>(0))` | Event amount must be greater than zero. |
| CHECK | `CK_PaymentGatewayEvent_Currency` | `([CurrencyCode]='AED')` | Events are in AED only. |
| CHECK | `CK_PaymentGatewayEvent_Outcome` | `([ProcessingOutcome]='MISMATCH_REJECTED' OR [ProcessingOutcome]='DUPLICATE_IGNORED' OR [ProcessingOutcome]='APPLIED')` | Restricts ProcessingOutcome to: APPLIED, DUPLICATE_IGNORED, MISMATCH_REJECTED. |
| CHECK | `CK_PaymentGatewayEvent_Status` | `([StatusCode]='CANCELLED' OR [StatusCode]='FAILED' OR [StatusCode]='PAID')` | Restricts StatusCode to: CANCELLED, FAILED, PAID. |

### pay.PaymentProviderBinding

The provider and routing version a payment session is permanently bound to. Cannot be changed once written.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PaymentSessionId` | bigint | N | PK; FK -> pay.PaymentSession.PaymentSessionId |  | Links to pay.PaymentSession. |
| 2 | `ProviderCode` | varchar(30) | N | FK -> cfg.PaymentProvider.ProviderCode |  | Payment provider code (E_PAY or NETWORK_INTERNATIONAL). (Links to cfg.PaymentProvider.) |
| 3 | `PaymentRoutingConfigId` | int | N | FK -> pay.PaymentRoutingConfiguration.PaymentRoutingConfigId |  | Routing configuration version used when the session was bound. (Links to pay.PaymentRoutingConfiguration.) |
| 4 | `ProviderSessionReference` | varchar(200) | N |  |  | Provider's id for the checkout session. |
| 5 | `CheckoutUrl` | nvarchar(2000) | Y |  |  | URL the candidate is sent to for payment. |
| 6 | `CheckoutExpiresAt` | datetimeoffset(3) | Y |  |  | UTC time the checkout link expires. |
| 7 | `BoundAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the provider was bound to the session. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PaymentProviderBinding` | `PaymentSessionId` | Uniquely identifies each row (PaymentSessionId). |
| FOREIGN KEY | `FK_PaymentProviderBinding_Provider` | `ProviderCode -> cfg.PaymentProvider` | Every value must exist in cfg.PaymentProvider, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PaymentProviderBinding_Routing` | `PaymentRoutingConfigId -> pay.PaymentRoutingConfiguration` | Every value must exist in pay.PaymentRoutingConfiguration, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PaymentProviderBinding_Session` | `PaymentSessionId -> pay.PaymentSession` | Every value must exist in pay.PaymentSession, so no row can point to something that does not exist. |
| UNIQUE | `UQ_PaymentProviderBinding_Provider` | `ProviderCode, ProviderSessionReference` | A provider session reference is used by one binding only. |
| TRIGGER | `TR_PaymentProviderBinding_Immutable` |  | Trigger: blocks changes so a session never switches provider. |

### pay.PaymentReconciliation

Resolution of an unknown or disputed payment against the original provider.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PaymentReconciliationId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PaymentSessionId` | bigint | N | FK -> pay.PaymentSession.PaymentSessionId |  | Links to pay.PaymentSession. |
| 3 | `ReconciledAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of reconciliation. |
| 4 | `OutcomeCode` | varchar(20) | N |  |  | Result, such as confirmed paid, confirmed failed, still unknown or duplicate charge. Allowed values: CONFIRMED_CANCELLED, CONFIRMED_FAILED, CONFIRMED_PAID, DUPLICATE_CHARGE, STILL_UNKNOWN. |
| 5 | `Note` | nvarchar(500) | Y |  |  | Optional free-text note. |
| 6 | `ReconciledByStaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Staff user who reconciled the payment. (Links to idn.StaffUser.) |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PaymentReconciliation` | `PaymentReconciliationId` | Uniquely identifies each row (PaymentReconciliationId). |
| FOREIGN KEY | `FK_PaymentReconciliation_Session` | `PaymentSessionId -> pay.PaymentSession` | Every value must exist in pay.PaymentSession, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PaymentReconciliation_Staff` | `ReconciledByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| CHECK | `CK_PaymentReconciliation_Outcome` | `([OutcomeCode]='DUPLICATE_CHARGE' OR [OutcomeCode]='STILL_UNKNOWN' OR [OutcomeCode]='CONFIRMED_CANCELLED' OR [OutcomeCode]='CONFIRMED_FAILED' OR [OutcomeCode]='CONFIRMED_PAID')` | Restricts OutcomeCode to: CONFIRMED_CANCELLED, CONFIRMED_FAILED, CONFIRMED_PAID, DUPLICATE_CHARGE, STILL_UNKNOWN. |

### pay.PaymentRoutingConfiguration

A versioned server-side setting that decides which provider new payment sessions use.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PaymentRoutingConfigId` | int | N | PK |  | Routing configuration version used when the session was bound. |
| 2 | `ConfigurationVersion` | varchar(30) | N |  |  | Unique version label of the routing setting. |
| 3 | `ActiveProviderCode` | varchar(30) | N | FK -> cfg.PaymentProvider.ProviderCode |  | Provider currently used for new payment sessions. (Links to cfg.PaymentProvider.) |
| 4 | `EffectiveAt` | datetimeoffset(3) | N |  |  | UTC time this routing takes effect. |
| 5 | `CreatedBy` | nvarchar(100) | Y |  |  | Who created the configuration. |
| 6 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PaymentRoutingConfiguration` | `PaymentRoutingConfigId` | Uniquely identifies each row (PaymentRoutingConfigId). |
| FOREIGN KEY | `FK_PaymentRoutingConfiguration_Provider` | `ActiveProviderCode -> cfg.PaymentProvider` | Every value must exist in cfg.PaymentProvider, so no row can point to something that does not exist. |
| UNIQUE | `UQ_PaymentRoutingConfiguration_Version` | `ConfigurationVersion` | Routing version labels are unique. |

### pay.PaymentSession

One payment attempt for an application fee, with amount snapshot, status and idempotency key.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PaymentSessionId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 4 | `FeeScheduleId` | int | N | FK -> pay.FeeSchedule.FeeScheduleId |  | Links to pay.FeeSchedule. |
| 5 | `Amount` | decimal(12,2) | N |  |  | Amount charged, copied from the fee schedule when the session started. |
| 6 | `CurrencyCode` | char(3) | N |  | ('AED') | Currency of the amount. Only AED is allowed. |
| 7 | `StatusCode` | varchar(40) | N | FK -> cfg.PaymentStatus.StatusCode | ('PENDING') | Current status of the record. (Links to cfg.PaymentStatus.) |
| 8 | `IdempotencyKey` | varchar(128) | N |  |  | Client-supplied key that makes a retried request safe. |
| 9 | `ReceiptId` | varchar(100) | Y |  |  | Receipt reference issued by the payment provider. |
| 10 | `PaidAt` | datetimeoffset(3) | Y |  |  | UTC time payment was confirmed. Required when status is PAID. |
| 11 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 12 | `UpdatedAt` | datetimeoffset(3) | Y |  |  | UTC time the row was last changed. |
| 13 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PaymentSession` | `PaymentSessionId` | Uniquely identifies each row (PaymentSessionId). |
| FOREIGN KEY | `FK_PaymentSession_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PaymentSession_FeeSchedule` | `FeeScheduleId -> pay.FeeSchedule` | Every value must exist in pay.FeeSchedule, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PaymentSession_Status` | `StatusCode -> cfg.PaymentStatus` | Every value must exist in cfg.PaymentStatus, so no row can point to something that does not exist. |
| UNIQUE | `UQ_PaymentSession_Idempotency` | `ApplicationId, IdempotencyKey` | A client key creates only one session per application. |
| UNIQUE | `UQ_PaymentSession_PublicId` | `PublicId` | API identifiers are unique. |
| UNIQUE | `UX_PaymentSession_OneOpen` | `ApplicationId, FeeScheduleId WHERE ([StatusCode]<>'PAID' AND [StatusCode]<>'FAILED' AND [StatusCode]<>'CANCELLED')` | Only one open (not paid, failed or cancelled) session per application and fee. |
| UNIQUE | `UX_PaymentSession_OnePaid` | `ApplicationId, FeeScheduleId WHERE ([StatusCode]='PAID')` | Only one paid session per application and fee, which prevents double payment. |
| CHECK | `CK_PaymentSession_Amount` | `([Amount]>(0))` | Amount must be greater than zero. |
| CHECK | `CK_PaymentSession_Currency` | `([CurrencyCode]='AED')` | Payments are in AED only. |
| CHECK | `CK_PaymentSession_Paid` | `([StatusCode]<>'PAID' OR [PaidAt] IS NOT NULL)` | A paid session must have a payment time. |

### View pay.vw_FinancePayment

Finance view (US-1.3.13): only the payment list columns - application number, English full name, registered e-mail, program, fee type, bill status, bill amount and payment date - plus the admission cycle used for filtering. Grant finance roles on this view, not on the base tables.

| # | Column | Type | Null |
|--:|---|---|:-:|
| 1 | `ApplicationNumber` | char | N |
| 2 | `EnglishFullName` | nvarchar | N |
| 3 | `Email` | nvarchar | Y |
| 4 | `ProgramName` | nvarchar | N |
| 5 | `FeeType` | varchar | N |
| 6 | `BillStatus` | varchar | N |
| 7 | `BillAmount` | decimal | N |
| 8 | `PaymentDate` | datetimeoffset | Y |
| 9 | `CycleCode` | varchar | N |

## ver - Verification

Verification: the officer review of a submitted application, assignment, correction requests, clarification, notes and screen-out recommendations. Verification has its own status, separate from portfolio and application status.

### ver.ClarificationRequest

A question from a verification officer to a supervisor and the supervisor response.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ClarificationRequestId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `VerificationCaseId` | bigint | N | FK -> ver.VerificationCase.VerificationCaseId |  | Links to ver.VerificationCase. |
| 3 | `RequestedByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user who made the request. (Links to idn.StaffUser.) |
| 4 | `QuestionText` | nvarchar(2000) | N |  |  | Question the officer asked. |
| 5 | `RequestedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the request was made. |
| 6 | `ResponseText` | nvarchar(2000) | Y |  |  | Supervisor's answer. |
| 7 | `RespondedAt` | datetimeoffset(3) | Y |  |  | UTC time of the answer. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ClarificationRequest` | `ClarificationRequestId` | Uniquely identifies each row (ClarificationRequestId). |
| FOREIGN KEY | `FK_ClarificationRequest_Case` | `VerificationCaseId -> ver.VerificationCase` | Every value must exist in ver.VerificationCase, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ClarificationRequest_Staff` | `RequestedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |

### ver.CorrectionFlag

A single field flagged for correction by an officer, with a comment.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CorrectionFlagId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `VerificationCaseId` | bigint | N | FK -> ver.VerificationCase.VerificationCaseId |  | Links to ver.VerificationCase. |
| 3 | `CorrectionRequestId` | bigint | Y | FK -> ver.CorrectionRequest.CorrectionRequestId |  | Links to ver.CorrectionRequest. |
| 4 | `SectionKey` | varchar(50) | N |  |  | Key of the application form section, from the fixed set of section keys. |
| 5 | `FieldPointer` | varchar(300) | N |  |  | Path to the flagged field inside the application data. |
| 6 | `ReasonCodeId` | int | N | FK -> cfg.ReasonCode.ReasonCodeId |  | Links to cfg.ReasonCode. |
| 7 | `Comment` | nvarchar(1000) | Y |  |  | What the candidate needs to correct. |
| 8 | `FlaggedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the field was flagged. |
| 9 | `ResolvedAt` | datetimeoffset(3) | Y |  |  | UTC time the item was resolved. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_CorrectionFlag` | `CorrectionFlagId` | Uniquely identifies each row (CorrectionFlagId). |
| FOREIGN KEY | `FK_CorrectionFlag_Case` | `VerificationCaseId -> ver.VerificationCase` | Every value must exist in ver.VerificationCase, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CorrectionFlag_Reason` | `ReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CorrectionFlag_Request` | `CorrectionRequestId -> ver.CorrectionRequest` | Every value must exist in ver.CorrectionRequest, so no row can point to something that does not exist. |

### ver.CorrectionRequest

A request returning an application to the candidate for correction, with a due date.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CorrectionRequestId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `VerificationCaseId` | bigint | N | FK -> ver.VerificationCase.VerificationCaseId |  | Links to ver.VerificationCase. |
| 4 | `RequestedByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user who made the request. (Links to idn.StaffUser.) |
| 5 | `RequestedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the request was made. |
| 6 | `DueAt` | datetimeoffset(3) | Y |  |  | UTC time by which the candidate must resubmit (correction grace period, in working days). |
| 7 | `TimeZoneId` | varchar(64) | N |  | ('Asia/Dubai') | IANA time zone (default Asia/Dubai) in which the due date was set. |
| 8 | `ResolvedAt` | datetimeoffset(3) | Y |  |  | UTC time the item was resolved. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_CorrectionRequest` | `CorrectionRequestId` | Uniquely identifies each row (CorrectionRequestId). |
| FOREIGN KEY | `FK_CorrectionRequest_Case` | `VerificationCaseId -> ver.VerificationCase` | Every value must exist in ver.VerificationCase, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CorrectionRequest_Staff` | `RequestedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| UNIQUE | `UQ_CorrectionRequest_PublicId` | `PublicId` | API identifiers are unique. |

### ver.ScreenOutRecommendation

An officer's recommendation to screen out an application and the supervisor's decision. The decider must be a different person.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ScreenOutRecommendationId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `VerificationCaseId` | bigint | N | FK -> ver.VerificationCase.VerificationCaseId |  | Links to ver.VerificationCase. |
| 3 | `RecommendedByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Officer who made the recommendation. (Links to idn.StaffUser.) |
| 4 | `ReasonCodeId` | int | N | FK -> cfg.ReasonCode.ReasonCodeId |  | Officer's screen-out reason from lookup SCREEN_OUT_REASON. Kept even if the supervisor endorses with another reason. (Links to cfg.ReasonCode.) |
| 5 | `Justification` | nvarchar(500) | Y |  |  | Officer's optional note (up to 500 characters); whether it is mandatory is still open. |
| 6 | `RecommendedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of the recommendation. |
| 7 | `DecidedByStaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Staff user who made the decision. (Links to idn.StaffUser.) |
| 8 | `DecisionCode` | varchar(20) | Y |  |  | Supervisor decision: ENDORSE_SCREEN_OUT or REJECT_SCREEN_OUT. NULL while pending. |
| 9 | `DecisionNote` | nvarchar(500) | Y |  |  | Supervisor's note; mandatory when rejecting. |
| 10 | `EndorsedReasonCodeId` | int | Y | FK -> cfg.ReasonCode.ReasonCodeId |  | Screen-out reason chosen by the supervisor on endorsement, when it replaces the officer's reason. (Links to cfg.ReasonCode.) |
| 11 | `DecidedAt` | datetimeoffset(3) | Y |  |  | UTC time the decision was made. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScreenOutRecommendation` | `ScreenOutRecommendationId` | Uniquely identifies each row (ScreenOutRecommendationId). |
| FOREIGN KEY | `FK_ScreenOutRecommendation_Case` | `VerificationCaseId -> ver.VerificationCase` | Every value must exist in ver.VerificationCase, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScreenOutRecommendation_Decider` | `DecidedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScreenOutRecommendation_EndorsedReason` | `EndorsedReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScreenOutRecommendation_Reason` | `ReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScreenOutRecommendation_Recommender` | `RecommendedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| CHECK | `CK_ScreenOutRecommendation_Consistent` | `([DecisionCode] IS NULL AND [DecidedAt] IS NULL AND [DecidedByStaffUserId] IS NULL OR [DecisionCode] IS NOT NULL AND [DecidedAt] IS NOT NULL AND [DecidedByStaffUserId] IS NOT NULL)` | Decision, decision time and decider are all set or all empty. |
| CHECK | `CK_ScreenOutRecommendation_Decider` | `([DecidedByStaffUserId] IS NULL OR [DecidedByStaffUserId]<>[RecommendedByStaffUserId])` | The decider cannot be the person who recommended. |
| CHECK | `CK_ScreenOutRecommendation_Decision` | `([DecisionCode] IS NULL OR ([DecisionCode]='REJECT_SCREEN_OUT' OR [DecisionCode]='ENDORSE_SCREEN_OUT'))` | The decision is empty while pending, otherwise ENDORSE_SCREEN_OUT or REJECT_SCREEN_OUT. |
| CHECK | `CK_ScreenOutRecommendation_EndorsedReason` | `([EndorsedReasonCodeId] IS NULL OR [DecisionCode]='ENDORSE_SCREEN_OUT')` | A replacement reason is allowed only on endorsement. |
| CHECK | `CK_ScreenOutRecommendation_RejectNote` | `([DecisionCode] IS NULL OR [DecisionCode]<>'REJECT_SCREEN_OUT' OR [DecisionNote] IS NOT NULL)` | Rejecting a recommendation requires a note. |

### ver.VerificationAssignment

Records which officer owns a verification case, including past owners.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `VerificationAssignmentId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `VerificationCaseId` | bigint | N | FK -> ver.VerificationCase.VerificationCaseId |  | Links to ver.VerificationCase. |
| 3 | `WorkPoolId` | int | N | FK -> cfg.WorkPool.WorkPoolId |  | Work pool the case was taken from. (Links to cfg.WorkPool.) |
| 4 | `StaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user this row refers to. (Links to idn.StaffUser.) |
| 5 | `AssignedByStaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Staff user who made the assignment. (Links to idn.StaffUser.) |
| 6 | `AssignedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of assignment. |
| 7 | `RetrievedAt` | datetimeoffset(3) | Y |  |  | UTC time the officer retrieved the case from the pool. NULL when assigned by a supervisor. |
| 8 | `DueAt` | datetimeoffset(3) | Y |  |  | UTC time the review is due; after it the case returns to the pool automatically. |
| 9 | `EndedAt` | datetimeoffset(3) | Y |  |  | UTC time the assignment ended. |
| 10 | `EndReasonCode` | varchar(20) | Y |  |  | Why the assignment ended: COMPLETED, REASSIGNED, RETURNED_TO_POOL, AUTO_RETURNED, SENT_TO_CANDIDATE or SENT_TO_SUPERVISOR. |
| 11 | `Justification` | nvarchar(200) | Y |  |  | Supervisor's reason for a reassignment or return to pool. |
| 12 | `IsCurrent` | bit | N |  | ((1)) | 1 for the current row; older rows stay for history. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_VerificationAssignment` | `VerificationAssignmentId` | Uniquely identifies each row (VerificationAssignmentId). |
| FOREIGN KEY | `FK_VerificationAssignment_AssignedBy` | `AssignedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_VerificationAssignment_Case` | `VerificationCaseId -> ver.VerificationCase` | Every value must exist in ver.VerificationCase, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_VerificationAssignment_Staff` | `StaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_VerificationAssignment_WorkPool` | `WorkPoolId -> cfg.WorkPool` | Every value must exist in cfg.WorkPool, so no row can point to something that does not exist. |
| UNIQUE | `UX_VerificationAssignment_Current` | `VerificationCaseId WHERE ([IsCurrent]=(1))` | Only one current officer per case. |
| CHECK | `CK_VerificationAssignment_Ended` | `([IsCurrent]=(1) AND [EndedAt] IS NULL AND [EndReasonCode] IS NULL OR [IsCurrent]=(0) AND [EndedAt] IS NOT NULL AND [EndReasonCode] IS NOT NULL)` | A current assignment has no end; an ended assignment has an end time and reason. |
| CHECK | `CK_VerificationAssignment_EndReason` | `([EndReasonCode] IS NULL OR ([EndReasonCode]='SENT_TO_SUPERVISOR' OR [EndReasonCode]='SENT_TO_CANDIDATE' OR [EndReasonCode]='AUTO_RETURNED' OR [EndReasonCode]='RETURNED_TO_POOL' OR [EndReasonCode]='REASSIGNED' OR [EndReasonCode]='COMPLETED'))` | End reason is empty or one of COMPLETED, REASSIGNED, RETURNED_TO_POOL, AUTO_RETURNED, SENT_TO_CANDIDATE, SENT_TO_SUPERVISOR. |

### ver.VerificationCase

The verification review of one submitted application, with its own status.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `VerificationCaseId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 4 | `StatusCode` | varchar(40) | N | FK -> cfg.VerificationStatus.StatusCode |  | Verification status. Independent of the application and portfolio statuses. (Links to cfg.VerificationStatus.) |
| 5 | `OpenedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the case was opened. |
| 6 | `CompletedAt` | datetimeoffset(3) | Y |  |  | UTC time the work finished. |
| 7 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_VerificationCase` | `VerificationCaseId` | Uniquely identifies each row (VerificationCaseId). |
| FOREIGN KEY | `FK_VerificationCase_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_VerificationCase_Status` | `StatusCode -> cfg.VerificationStatus` | Every value must exist in cfg.VerificationStatus, so no row can point to something that does not exist. |
| UNIQUE | `UQ_VerificationCase_Application` | `ApplicationId` | One verification case per application. |
| UNIQUE | `UQ_VerificationCase_PublicId` | `PublicId` | API identifiers are unique. |

### ver.VerificationEvent

Timeline of what happened on a verification case.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `VerificationEventId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `VerificationCaseId` | bigint | N | FK -> ver.VerificationCase.VerificationCaseId |  | Links to ver.VerificationCase. |
| 3 | `EventType` | varchar(50) | N |  |  | Kind of event on the case timeline. |
| 4 | `FromStatusCode` | varchar(40) | Y |  |  | Status before the change. |
| 5 | `ToStatusCode` | varchar(40) | Y |  |  | Status after the change. |
| 6 | `StaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Staff user this row refers to. (Links to idn.StaffUser.) |
| 7 | `OccurredAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the event happened. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_VerificationEvent` | `VerificationEventId` | Uniquely identifies each row (VerificationEventId). |
| FOREIGN KEY | `FK_VerificationEvent_Case` | `VerificationCaseId -> ver.VerificationCase` | Every value must exist in ver.VerificationCase, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_VerificationEvent_Staff` | `StaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |

### ver.VerificationNote

Internal officer notes on a verification case. Not visible to candidates.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `VerificationNoteId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `VerificationCaseId` | bigint | N | FK -> ver.VerificationCase.VerificationCaseId |  | Links to ver.VerificationCase. |
| 3 | `StaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user this row refers to. (Links to idn.StaffUser.) |
| 4 | `NoteText` | nvarchar(2000) | N |  |  | Content of the internal note. |
| 5 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_VerificationNote` | `VerificationNoteId` | Uniquely identifies each row (VerificationNoteId). |
| FOREIGN KEY | `FK_VerificationNote_Case` | `VerificationCaseId -> ver.VerificationCase` | Every value must exist in ver.VerificationCase, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_VerificationNote_Staff` | `StaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |

## pfo - Portfolio scoring

Portfolio scoring: the versioned rubric, the candidate's one-time portfolio submission, referee rounds and scores, conflicts of interest, discrepancy handling, score history and appeals.

### pfo.Appeal

A candidate appeal against the portfolio score. One per application.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `AppealId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 4 | `SubmittedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the candidate filed the appeal. |
| 5 | `StatusCode` | varchar(30) | N |  | ('SUBMITTED') | Appeal state, such as SUBMITTED, ELIGIBLE, INELIGIBLE, SECOND_EVALUATION or CLOSED. |
| 6 | `DecisionNote` | nvarchar(1000) | Y |  |  | Free-text note recorded with the decision. |
| 7 | `DecidedAt` | datetimeoffset(3) | Y |  |  | UTC time the decision was made. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Appeal` | `AppealId` | Uniquely identifies each row (AppealId). |
| FOREIGN KEY | `FK_Appeal_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| UNIQUE | `UQ_Appeal_Application` | `ApplicationId` | One appeal per application. |
| UNIQUE | `UQ_Appeal_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_Appeal_Status` | `([StatusCode]='CLOSED' OR [StatusCode]='SECOND_EVALUATION' OR [StatusCode]='INELIGIBLE' OR [StatusCode]='ELIGIBLE' OR [StatusCode]='SUBMITTED')` | Restricts StatusCode to: CLOSED, ELIGIBLE, INELIGIBLE, SECOND_EVALUATION, SUBMITTED. |

### pfo.AppealQuestion

A portfolio question a candidate disputes in an appeal, with a comment.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `AppealId` | bigint | N | PK; FK -> pfo.Appeal.AppealId |  | Links to pfo.Appeal. |
| 2 | `PortfolioQuestionId` | int | N | PK; FK -> pfo.PortfolioQuestion.PortfolioQuestionId |  | Links to pfo.PortfolioQuestion. |
| 3 | `CandidateComment` | nvarchar(200) | Y |  |  | The candidate's response for the flagged question (up to 200 characters). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_AppealQuestion` | `AppealId, PortfolioQuestionId` | Uniquely identifies each row (AppealId, PortfolioQuestionId). |
| FOREIGN KEY | `FK_AppealQuestion_Appeal` | `AppealId -> pfo.Appeal` | Every value must exist in pfo.Appeal, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_AppealQuestion_Question` | `PortfolioQuestionId -> pfo.PortfolioQuestion` | Every value must exist in pfo.PortfolioQuestion, so no row can point to something that does not exist. |

### pfo.ConflictOfInterest

A referee's declaration of conflict of interest on a portfolio, with the mandatory reason. The referee can never be assigned that portfolio again.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ConflictOfInterestId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioId` | bigint | N | FK -> pfo.Portfolio.PortfolioId |  | Links to pfo.Portfolio. |
| 3 | `RefereeStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user acting as referee. (Links to idn.StaffUser.) |
| 4 | `DeclaredAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the referee declared the conflict. |
| 5 | `Reason` | nvarchar(500) | N |  |  | The referee's mandatory reason (up to 500 characters). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ConflictOfInterest` | `ConflictOfInterestId` | Uniquely identifies each row (ConflictOfInterestId). |
| FOREIGN KEY | `FK_ConflictOfInterest_Portfolio` | `PortfolioId -> pfo.Portfolio` | Every value must exist in pfo.Portfolio, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ConflictOfInterest_Referee` | `RefereeStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ConflictOfInterest` | `PortfolioId, RefereeStaffUserId` | A referee can declare a conflict once per portfolio. |

### pfo.Portfolio

The candidate's one-time portfolio submission, tied to a rubric version.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 4 | `RubricVersionId` | int | N | FK -> pfo.RubricVersion.RubricVersionId |  | Links to pfo.RubricVersion. |
| 5 | `StatusCode` | varchar(40) | N | FK -> cfg.PortfolioStatus.StatusCode |  | Current status of the record. (Links to cfg.PortfolioStatus.) |
| 6 | `SubmittedAt` | datetimeoffset(3) | Y |  |  | UTC time the candidate submitted. After this the answers are locked. |
| 7 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 8 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_Portfolio` | `PortfolioId` | Uniquely identifies each row (PortfolioId). |
| FOREIGN KEY | `FK_Portfolio_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Portfolio_Rubric` | `RubricVersionId -> pfo.RubricVersion` | Every value must exist in pfo.RubricVersion, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_Portfolio_Status` | `StatusCode -> cfg.PortfolioStatus` | Every value must exist in cfg.PortfolioStatus, so no row can point to something that does not exist. |
| UNIQUE | `UQ_Portfolio_Application` | `ApplicationId` | One portfolio per application. |
| UNIQUE | `UQ_Portfolio_PublicId` | `PublicId` | API identifiers are unique. |

### pfo.PortfolioAnswer

A candidate's answer to one rubric question. Immutable after submission.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioAnswerId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioId` | bigint | N | FK -> pfo.Portfolio.PortfolioId |  | Links to pfo.Portfolio. |
| 3 | `PortfolioQuestionId` | int | N | FK -> pfo.PortfolioQuestion.PortfolioQuestionId |  | Links to pfo.PortfolioQuestion. |
| 4 | `Answer` | char(3) | N |  |  | YES or NO answer to the question. |
| 5 | `DetailsJson` | json | Y |  |  | Extra details the question asks for, as JSON. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioAnswer` | `PortfolioAnswerId` | Uniquely identifies each row (PortfolioAnswerId). |
| FOREIGN KEY | `FK_PortfolioAnswer_Portfolio` | `PortfolioId -> pfo.Portfolio` | Every value must exist in pfo.Portfolio, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PortfolioAnswer_Question` | `PortfolioQuestionId -> pfo.PortfolioQuestion` | Every value must exist in pfo.PortfolioQuestion, so no row can point to something that does not exist. |
| UNIQUE | `UQ_PortfolioAnswer` | `PortfolioId, PortfolioQuestionId` | One answer per question per portfolio. |
| UNIQUE | `UQ_PortfolioAnswer_Question` | `PortfolioAnswerId, PortfolioQuestionId` | Supports a composite foreign key that checks the question matches. |
| CHECK | `CK_PortfolioAnswer_Answer` | `([Answer]='NO' OR [Answer]='YES')` | Restricts Answer to: NO, YES. |
| TRIGGER | `TR_PortfolioAnswer_Immutable` |  | Trigger: blocks changes to answers after the portfolio is submitted. |

### pfo.PortfolioAnswerEvidence

Links a portfolio answer to its supporting attachment.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioAnswerId` | bigint | N | PK; FK -> pfo.PortfolioAnswer.PortfolioAnswerId |  | Links to pfo.PortfolioAnswer. |
| 2 | `AttachmentId` | bigint | N | PK; FK -> doc.Attachment.AttachmentId |  | Links to doc.Attachment. |
| 3 | `SortOrder` | int | N |  | ((0)) | Position used when listing values. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioAnswerEvidence` | `PortfolioAnswerId, AttachmentId` | Uniquely identifies each row (PortfolioAnswerId, AttachmentId). |
| FOREIGN KEY | `FK_PortfolioAnswerEvidence_Answer` | `PortfolioAnswerId -> pfo.PortfolioAnswer` | Every value must exist in pfo.PortfolioAnswer, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PortfolioAnswerEvidence_Attachment` | `AttachmentId -> doc.Attachment` | Every value must exist in doc.Attachment, so no row can point to something that does not exist. |

### pfo.PortfolioDiscrepancy

Marks that Round 1 and Round 2 disagree and a third referee is needed.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioDiscrepancyId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioId` | bigint | N | FK -> pfo.Portfolio.PortfolioId |  | Links to pfo.Portfolio. |
| 3 | `DetectedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the difference was detected. |
| 4 | `ResolvedAt` | datetimeoffset(3) | Y |  |  | UTC time the item was resolved. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioDiscrepancy` | `PortfolioDiscrepancyId` | Uniquely identifies each row (PortfolioDiscrepancyId). |
| FOREIGN KEY | `FK_PortfolioDiscrepancy_Portfolio` | `PortfolioId -> pfo.Portfolio` | Every value must exist in pfo.Portfolio, so no row can point to something that does not exist. |
| UNIQUE | `UQ_PortfolioDiscrepancy` | `PortfolioId` | One discrepancy record per portfolio. |

### pfo.PortfolioDiscrepancyDetail

The individual questions on which Round 1 and Round 2 scores differ.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioDiscrepancyId` | bigint | N | PK; FK -> pfo.PortfolioDiscrepancy.PortfolioDiscrepancyId |  | Links to pfo.PortfolioDiscrepancy. |
| 2 | `PortfolioQuestionId` | int | N | PK; FK -> pfo.PortfolioQuestion.PortfolioQuestionId |  | Links to pfo.PortfolioQuestion. |
| 3 | `Round1ScoreItemId` | bigint | N | FK -> pfo.ScoreItem.ScoreItemId |  | Round 1 score item involved in the difference. (Links to pfo.ScoreItem.) |
| 4 | `Round2ScoreItemId` | bigint | N | FK -> pfo.ScoreItem.ScoreItemId |  | Round 2 score item involved in the difference. (Links to pfo.ScoreItem.) |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioDiscrepancyDetail` | `PortfolioDiscrepancyId, PortfolioQuestionId` | Uniquely identifies each row (PortfolioDiscrepancyId, PortfolioQuestionId). |
| FOREIGN KEY | `FK_PortfolioDiscrepancyDetail_Discrepancy` | `PortfolioDiscrepancyId -> pfo.PortfolioDiscrepancy` | Every value must exist in pfo.PortfolioDiscrepancy, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PortfolioDiscrepancyDetail_Question` | `PortfolioQuestionId -> pfo.PortfolioQuestion` | Every value must exist in pfo.PortfolioQuestion, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PortfolioDiscrepancyDetail_R1` | `Round1ScoreItemId -> pfo.ScoreItem` | Every value must exist in pfo.ScoreItem, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PortfolioDiscrepancyDetail_R2` | `Round2ScoreItemId -> pfo.ScoreItem` | Every value must exist in pfo.ScoreItem, so no row can point to something that does not exist. |

### pfo.PortfolioQuestion

A question in a rubric version, with its scoring type and maximum score.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioQuestionId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque question id used by the API, for example in appeal responses. |
| 3 | `RubricVersionId` | int | N | FK -> pfo.RubricVersion.RubricVersionId |  | Links to pfo.RubricVersion. |
| 4 | `QuestionCode` | varchar(50) | N |  |  | Question code, unique within the rubric version. |
| 5 | `SortOrder` | int | N |  |  | Position used when listing values. |
| 6 | `QuestionText` | nvarchar(1000) | N |  |  | Question text shown to the candidate. |
| 7 | `ScoringType` | varchar(20) | N |  |  | ALL_OR_NOTHING or POINTS_SYSTEM. |
| 8 | `DetailsSchemaJson` | json | Y |  |  | Definition of the extra details the question collects. |
| 9 | `EvidenceSchemaJson` | json | Y |  |  | Definition of the evidence the question accepts. |
| 10 | `MaxScore` | decimal(6,2) | Y |  |  | Highest score the question can earn. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioQuestion` | `PortfolioQuestionId` | Uniquely identifies each row (PortfolioQuestionId). |
| FOREIGN KEY | `FK_PortfolioQuestion_Rubric` | `RubricVersionId -> pfo.RubricVersion` | Every value must exist in pfo.RubricVersion, so no row can point to something that does not exist. |
| UNIQUE | `UQ_PortfolioQuestion` | `RubricVersionId, QuestionCode` | Question codes are unique within a rubric. |
| UNIQUE | `UQ_PortfolioQuestion_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_PortfolioQuestion_ScoringType` | `([ScoringType]='POINTS_SYSTEM' OR [ScoringType]='ALL_OR_NOTHING')` | Restricts ScoringType to: ALL_OR_NOTHING, POINTS_SYSTEM. |

### pfo.PortfolioRound

An evaluation round (Round 1, 2, 3 or second evaluation) for a portfolio.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioRoundId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioId` | bigint | N | FK -> pfo.Portfolio.PortfolioId |  | Links to pfo.Portfolio. |
| 3 | `RoundCode` | varchar(20) | N |  |  | ROUND_1, ROUND_2, ROUND_3 (only on discrepancy) or SECOND_EVALUATION (only on appeal). |
| 4 | `StatusCode` | varchar(40) | N |  | ('PENDING') | PENDING, IN_PROGRESS, COMPLETE or ON_HOLD. |
| 5 | `StartedAt` | datetimeoffset(3) | Y |  |  | UTC time the work started. |
| 6 | `CompletedAt` | datetimeoffset(3) | Y |  |  | UTC time the work finished. |
| 7 | `TotalScore` | decimal(7,2) | Y |  |  | Total score given in this round. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioRound` | `PortfolioRoundId` | Uniquely identifies each row (PortfolioRoundId). |
| FOREIGN KEY | `FK_PortfolioRound_Portfolio` | `PortfolioId -> pfo.Portfolio` | Every value must exist in pfo.Portfolio, so no row can point to something that does not exist. |
| UNIQUE | `UQ_PortfolioRound` | `PortfolioId, RoundCode` | Each round occurs once per portfolio. |
| CHECK | `CK_PortfolioRound_Code` | `([RoundCode]='SECOND_EVALUATION' OR [RoundCode]='ROUND_3' OR [RoundCode]='ROUND_2' OR [RoundCode]='ROUND_1')` | Restricts RoundCode to: ROUND_1, ROUND_2, ROUND_3, SECOND_EVALUATION. |
| CHECK | `CK_PortfolioRound_Status` | `([StatusCode]='ON_HOLD' OR [StatusCode]='COMPLETE' OR [StatusCode]='IN_PROGRESS' OR [StatusCode]='PENDING')` | Restricts StatusCode to: COMPLETE, IN_PROGRESS, ON_HOLD, PENDING. |

### pfo.PortfolioScoreHistory

Every computed portfolio score. The latest row marked final is the effective score.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioScoreHistoryId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioId` | bigint | N | FK -> pfo.Portfolio.PortfolioId |  | Links to pfo.Portfolio. |
| 3 | `SourceRoundCode` | varchar(20) | N |  |  | Round the score came from. Allowed values: ROUND_1, ROUND_2, ROUND_3, SECOND_EVALUATION. |
| 4 | `Score` | decimal(7,2) | N |  |  | Computed portfolio score. |
| 5 | `IsFinal` | bit | N |  | ((0)) | 1 when this is a final score. The latest final row is the effective score. |
| 6 | `RecordedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the score was recorded. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioScoreHistory` | `PortfolioScoreHistoryId` | Uniquely identifies each row (PortfolioScoreHistoryId). |
| FOREIGN KEY | `FK_PortfolioScoreHistory_Portfolio` | `PortfolioId -> pfo.Portfolio` | Every value must exist in pfo.Portfolio, so no row can point to something that does not exist. |
| CHECK | `CK_PortfolioScoreHistory_Round` | `([SourceRoundCode]='SECOND_EVALUATION' OR [SourceRoundCode]='ROUND_3' OR [SourceRoundCode]='ROUND_2' OR [SourceRoundCode]='ROUND_1')` | Restricts SourceRoundCode to: ROUND_1, ROUND_2, ROUND_3, SECOND_EVALUATION. |

### pfo.PortfolioStatusHistory

Every change of a portfolio's status, used to restore the previous status when an on-hold portfolio is reinstated.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `PortfolioStatusHistoryId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioId` | bigint | N | FK -> pfo.Portfolio.PortfolioId |  | Portfolio whose status changed. (Links to pfo.Portfolio.) |
| 3 | `FromStatusCode` | varchar(40) | Y | FK -> cfg.PortfolioStatus.StatusCode |  | Status before the change. (Links to cfg.PortfolioStatus.) |
| 4 | `ToStatusCode` | varchar(40) | N | FK -> cfg.PortfolioStatus.StatusCode |  | Status after the change. (Links to cfg.PortfolioStatus.) |
| 5 | `ChangedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the change happened. |
| 6 | `ChangedByStaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Staff user who caused the change. NULL for system changes. (Links to idn.StaffUser.) |
| 7 | `Reason` | varchar(40) | Y |  |  | Short code for why the status changed, such as WITHDRAWN, SCREENED_OUT, ARCHIVED, REINSTATED, DISCREPANCY, APPEAL or OVERDUE. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_PortfolioStatusHistory` | `PortfolioStatusHistoryId` | Uniquely identifies each row (PortfolioStatusHistoryId). |
| FOREIGN KEY | `FK_PortfolioStatusHistory_From` | `FromStatusCode -> cfg.PortfolioStatus` | Every value must exist in cfg.PortfolioStatus, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PortfolioStatusHistory_Portfolio` | `PortfolioId -> pfo.Portfolio` | Every value must exist in pfo.Portfolio, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PortfolioStatusHistory_Staff` | `ChangedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_PortfolioStatusHistory_To` | `ToStatusCode -> cfg.PortfolioStatus` | Every value must exist in cfg.PortfolioStatus, so no row can point to something that does not exist. |

### pfo.QuestionClassification

Scoring classifications and points available for a question.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `QuestionClassificationId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioQuestionId` | int | N | FK -> pfo.PortfolioQuestion.PortfolioQuestionId |  | Links to pfo.PortfolioQuestion. |
| 3 | `ClassificationCode` | varchar(50) | N |  |  | Classification option a referee can pick. |
| 4 | `DisplayLabel` | nvarchar(200) | N |  |  | Text label shown to the user. |
| 5 | `Points` | decimal(6,2) | N |  |  | Points the classification earns. |
| 6 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |
| 7 | `SortOrder` | smallint | N |  | ((0)) | Position used when listing values. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_QuestionClassification` | `QuestionClassificationId` | Uniquely identifies each row (QuestionClassificationId). |
| FOREIGN KEY | `FK_QuestionClassification_Question` | `PortfolioQuestionId -> pfo.PortfolioQuestion` | Every value must exist in pfo.PortfolioQuestion, so no row can point to something that does not exist. |
| UNIQUE | `UQ_QuestionClassification` | `PortfolioQuestionId, ClassificationCode` | A classification is defined once per question. |
| CHECK | `CK_QuestionClassification_Points` | `([Points]>=(0))` | Points cannot be negative. |

### pfo.QuestionRejectionReason

Reasons a referee may use to reject an answer to a question.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `QuestionRejectionReasonId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioQuestionId` | int | N | FK -> pfo.PortfolioQuestion.PortfolioQuestionId |  | Links to pfo.PortfolioQuestion. |
| 3 | `ReasonCode` | varchar(50) | N |  |  | Rejection reason code. |
| 4 | `DisplayLabel` | nvarchar(200) | N |  |  | Text label shown to the user. |
| 5 | `CandidateComment` | nvarchar(500) | Y |  |  | Comment written by the candidate. |
| 6 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |
| 7 | `SortOrder` | smallint | N |  | ((0)) | Position used when listing values. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_QuestionRejectionReason` | `QuestionRejectionReasonId` | Uniquely identifies each row (QuestionRejectionReasonId). |
| FOREIGN KEY | `FK_QuestionRejectionReason_Question` | `PortfolioQuestionId -> pfo.PortfolioQuestion` | Every value must exist in pfo.PortfolioQuestion, so no row can point to something that does not exist. |
| UNIQUE | `UQ_QuestionRejectionReason` | `PortfolioQuestionId, ReasonCode` | A rejection reason is defined once per question. |

### pfo.RoundAssignment

Assigns a referee to a round. One referee per portfolio, and none after a conflict of interest.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `RoundAssignmentId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioRoundId` | bigint | N | FK -> pfo.PortfolioRound.PortfolioRoundId |  | Links to pfo.PortfolioRound. |
| 3 | `RefereeStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user acting as referee. (Links to idn.StaffUser.) |
| 4 | `AssignedByStaffUserId` | int | Y | FK -> idn.StaffUser.StaffUserId |  | Staff user who made the assignment. (Links to idn.StaffUser.) |
| 5 | `AssignedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of assignment. |
| 6 | `RetrievedAt` | datetimeoffset(3) | Y |  |  | UTC time the referee retrieved the portfolio from the pool. NULL when assigned by the senior referee. |
| 7 | `DueAt` | datetimeoffset(3) | Y |  |  | UTC time scoring is due; after it the portfolio returns to the pool automatically. |
| 8 | `EndedAt` | datetimeoffset(3) | Y |  |  | UTC time the assignment ended. |
| 9 | `EndReasonCode` | varchar(20) | Y |  |  | Why the assignment ended: SUBMITTED, REASSIGNED, AUTO_RETURNED, COI_RETURNED or ON_HOLD. |
| 10 | `IsCurrent` | bit | N |  | ((1)) | 1 for the current referee on the round. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_RoundAssignment` | `RoundAssignmentId` | Uniquely identifies each row (RoundAssignmentId). |
| FOREIGN KEY | `FK_RoundAssignment_AssignedBy` | `AssignedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_RoundAssignment_Referee` | `RefereeStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_RoundAssignment_Round` | `PortfolioRoundId -> pfo.PortfolioRound` | Every value must exist in pfo.PortfolioRound, so no row can point to something that does not exist. |
| UNIQUE | `UX_RoundAssignment_Current` | `PortfolioRoundId WHERE ([IsCurrent]=(1))` | Only one current referee per round. |
| CHECK | `CK_RoundAssignment_Ended` | `([IsCurrent]=(1) AND [EndedAt] IS NULL AND [EndReasonCode] IS NULL OR [IsCurrent]=(0) AND [EndedAt] IS NOT NULL AND [EndReasonCode] IS NOT NULL)` | A current assignment has no end; an ended assignment has an end time and reason. |
| CHECK | `CK_RoundAssignment_EndReason` | `([EndReasonCode] IS NULL OR ([EndReasonCode]='ON_HOLD' OR [EndReasonCode]='COI_RETURNED' OR [EndReasonCode]='AUTO_RETURNED' OR [EndReasonCode]='REASSIGNED' OR [EndReasonCode]='SUBMITTED'))` | End reason is empty or one of SUBMITTED, REASSIGNED, AUTO_RETURNED, COI_RETURNED, ON_HOLD. |
| TRIGGER | `TR_RoundAssignment_Rules` |  | Trigger: one referee per portfolio and no assignment after a declared conflict. |

### pfo.RoundScoreOverride

A senior referee's override of a completed round total, with the previous and new total and the mandatory justification.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `RoundScoreOverrideId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `PortfolioRoundId` | bigint | N | FK -> pfo.PortfolioRound.PortfolioRoundId |  | Round whose total was overridden. (Links to pfo.PortfolioRound.) |
| 4 | `PreviousTotalScore` | decimal(7,2) | N |  |  | Round total before the override. |
| 5 | `NewTotalScore` | decimal(7,2) | N |  |  | Round total set by the senior referee; not more than the question set total. |
| 6 | `Justification` | nvarchar(200) | N |  |  | Mandatory justification (up to 200 characters). |
| 7 | `OverriddenByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Senior referee who made the override. (Links to idn.StaffUser.) |
| 8 | `OverriddenAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of the override. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_RoundScoreOverride` | `RoundScoreOverrideId` | Uniquely identifies each row (RoundScoreOverrideId). |
| FOREIGN KEY | `FK_RoundScoreOverride_Round` | `PortfolioRoundId -> pfo.PortfolioRound` | Every value must exist in pfo.PortfolioRound, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_RoundScoreOverride_Staff` | `OverriddenByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| UNIQUE | `UQ_RoundScoreOverride_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_RoundScoreOverride_Score` | `([NewTotalScore]>=(0) AND [PreviousTotalScore]>=(0))` | Scores cannot be negative. |

### pfo.RubricVersion

A versioned scoring rubric for a programme cycle. Only one version may be active.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `RubricVersionId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ProgramCycleId` | int | N | FK -> cfg.ProgramCycle.ProgramCycleId |  | Links to cfg.ProgramCycle. |
| 3 | `VersionNo` | int | N |  |  | Version counter, starting at 1 and increasing with each change. |
| 4 | `EffectiveFrom` | datetimeoffset(3) | N |  |  | First date this version applies. |
| 5 | `IsActive` | bit | N |  | ((0)) | 1 for the active rubric of the program cycle. Only one may be active. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_RubricVersion` | `RubricVersionId` | Uniquely identifies each row (RubricVersionId). |
| FOREIGN KEY | `FK_RubricVersion_ProgramCycle` | `ProgramCycleId -> cfg.ProgramCycle` | Every value must exist in cfg.ProgramCycle, so no row can point to something that does not exist. |
| UNIQUE | `UQ_RubricVersion` | `ProgramCycleId, VersionNo` | Version numbers are unique per programme cycle. |
| UNIQUE | `UX_RubricVersion_Active` | `ProgramCycleId WHERE ([IsActive]=(1))` | Only one active rubric per programme cycle. |

### pfo.ScoreItem

A referee's decision and score for one answer in one round.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ScoreItemId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PortfolioRoundId` | bigint | N | FK -> pfo.PortfolioRound.PortfolioRoundId |  | Links to pfo.PortfolioRound. |
| 3 | `PortfolioAnswerId` | bigint | N | FK -> pfo.PortfolioAnswer.PortfolioAnswerId |  | Links to pfo.PortfolioAnswer. |
| 4 | `Decision` | varchar(10) | N |  |  | ACCEPT or REJECT. |
| 5 | `QuestionClassificationId` | int | Y | FK -> pfo.QuestionClassification.QuestionClassificationId |  | Links to pfo.QuestionClassification. |
| 6 | `Score` | decimal(6,2) | N |  |  | Points awarded. Zero when rejected. |
| 7 | `Comment` | nvarchar(1000) | Y |  |  | Referee comment. |
| 8 | `ScoredAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the item was scored. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScoreItem` | `ScoreItemId` | Uniquely identifies each row (ScoreItemId). |
| FOREIGN KEY | `FK_ScoreItem_Answer` | `PortfolioAnswerId -> pfo.PortfolioAnswer` | Every value must exist in pfo.PortfolioAnswer, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScoreItem_Classification` | `QuestionClassificationId -> pfo.QuestionClassification` | Every value must exist in pfo.QuestionClassification, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScoreItem_Round` | `PortfolioRoundId -> pfo.PortfolioRound` | Every value must exist in pfo.PortfolioRound, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ScoreItem` | `PortfolioRoundId, PortfolioAnswerId` | One score per answer per round. |
| CHECK | `CK_ScoreItem_Decision` | `([Decision]='REJECT' OR [Decision]='ACCEPT')` | Restricts Decision to: ACCEPT, REJECT. |
| CHECK | `CK_ScoreItem_Reject` | `([Decision]<>'REJECT' OR [Score]=(0))` | A rejected item must score zero. |
| CHECK | `CK_ScoreItem_Score` | `([Score]>=(0))` | Score cannot be negative. |

### pfo.ScoreItemRejectionReason

The rejection reasons attached to a rejected score item.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ScoreItemId` | bigint | N | PK; FK -> pfo.ScoreItem.ScoreItemId |  | Links to pfo.ScoreItem. |
| 2 | `QuestionRejectionReasonId` | int | N | PK; FK -> pfo.QuestionRejectionReason.QuestionRejectionReasonId |  | Links to pfo.QuestionRejectionReason. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScoreItemRejectionReason` | `ScoreItemId, QuestionRejectionReasonId` | Uniquely identifies each row (ScoreItemId, QuestionRejectionReasonId). |
| FOREIGN KEY | `FK_ScoreItemRejectionReason_Item` | `ScoreItemId -> pfo.ScoreItem` | Every value must exist in pfo.ScoreItem, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScoreItemRejectionReason_Reason` | `QuestionRejectionReasonId -> pfo.QuestionRejectionReason` | Every value must exist in pfo.QuestionRejectionReason, so no row can point to something that does not exist. |

### View pfo.vw_RefereePortfolio

Anonymised portfolio view for referees: answers and evidence, with no candidate identity or contact data.

| # | Column | Type | Null |
|--:|---|---|:-:|
| 1 | `PortfolioPublicId` | uniqueidentifier | N |
| 2 | `RefereeStaffUserId` | int | N |
| 3 | `RoundCode` | varchar | N |
| 4 | `RoundStatus` | varchar | N |
| 5 | `QuestionCode` | varchar | N |
| 6 | `QuestionText` | nvarchar | N |
| 7 | `Answer` | char | N |
| 8 | `DetailsJson` | json | Y |

## scr - Screening and announcement

Screening and announcement: score components and weights, CASPER imports, candidate-visible score announcements and bulk screen-out.

### scr.ApplicationScoreComponent

One scored component (GPA, exam, portfolio, CASPER) for an application, with the weight version used.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationScoreComponentId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 3 | `ComponentCode` | varchar(30) | N |  |  | Which component: GPA, exam, portfolio or CASPER. |
| 4 | `RawValue` | decimal(9,4) | Y |  |  | Unweighted input value. |
| 5 | `WeightedScore` | decimal(7,2) | N |  |  | Score after applying the weight. |
| 6 | `WeightSetId` | int | Y | FK -> cfg.ScoringWeightSet.ScoringWeightSetId |  | Scoring weight set version used for the calculation. (Links to cfg.ScoringWeightSet.) |
| 7 | `CalculatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of calculation. |
| 8 | `IsCurrent` | bit | N |  | ((1)) | 1 for the current row; older rows stay for history. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationScoreComponent` | `ApplicationScoreComponentId` | Uniquely identifies each row (ApplicationScoreComponentId). |
| FOREIGN KEY | `FK_ApplicationScoreComponent_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationScoreComponent_WeightSet` | `WeightSetId -> cfg.ScoringWeightSet` | Every value must exist in cfg.ScoringWeightSet, so no row can point to something that does not exist. |
| UNIQUE | `UX_ApplicationScoreComponent_Current` | `ApplicationId, ComponentCode WHERE ([IsCurrent]=(1))` | One current row per component per application. |

### scr.ApplicationScreening

Current summary of an application's scores and announcement status.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ApplicationId` | bigint | N | PK; FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 2 | `WeightSetId` | int | Y | FK -> cfg.ScoringWeightSet.ScoringWeightSetId |  | Scoring weight set version used for the calculation. (Links to cfg.ScoringWeightSet.) |
| 3 | `GpaScore` | decimal(7,2) | Y |  |  | Weighted GPA score. |
| 4 | `EntranceExamScore` | decimal(7,2) | Y |  |  | Weighted entrance-exam score. |
| 5 | `PortfolioScore` | decimal(7,2) | Y |  |  | Weighted portfolio score. |
| 6 | `CasperScore` | decimal(7,2) | Y |  |  | Weighted CASPER score. Does not gate the initial announcement. |
| 7 | `ShortlistingScore` | decimal(7,2) | Y |  |  | Total score used for shortlisting. |
| 8 | `CasperAttendanceCode` | varchar(10) | N |  | ('NA') | CASPER attendance: NA until results are known, then ATTENDED or ABSENT. |
| 9 | `AnnouncementStatusCode` | varchar(40) | N | FK -> cfg.AnnouncementStatus.StatusCode |  | Links to cfg.AnnouncementStatus. |
| 10 | `CalculatedAt` | datetimeoffset(3) | Y |  |  | UTC time of the last calculation. |
| 11 | `RowVersion` | timestamp | N |  |  | Concurrency token maintained by SQL Server, used to detect conflicting updates. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ApplicationScreening` | `ApplicationId` | Uniquely identifies each row (ApplicationId). |
| FOREIGN KEY | `FK_ApplicationScreening_Announcement` | `AnnouncementStatusCode -> cfg.AnnouncementStatus` | Every value must exist in cfg.AnnouncementStatus, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationScreening_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ApplicationScreening_WeightSet` | `WeightSetId -> cfg.ScoringWeightSet` | Every value must exist in cfg.ScoringWeightSet, so no row can point to something that does not exist. |
| CHECK | `CK_ApplicationScreening_CasperAttendance` | `([CasperAttendanceCode]='ABSENT' OR [CasperAttendanceCode]='ATTENDED' OR [CasperAttendanceCode]='NA')` | Restricts CasperAttendanceCode to: ABSENT, ATTENDED, NA. |

### scr.BulkScreenOut

A bulk screen-out action with its selection criteria.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `BulkScreenOutId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `AdmissionCycleId` | int | N | FK -> cfg.AdmissionCycle.CycleId |  | Links to cfg.AdmissionCycle. |
| 4 | `ReasonCodeId` | int | N | FK -> cfg.ReasonCode.ReasonCodeId |  | Links to cfg.ReasonCode. |
| 5 | `CriteriaJson` | json | Y |  |  | Selection criteria used for the action. |
| 6 | `ExecutedByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user who executed the action. (Links to idn.StaffUser.) |
| 7 | `ExecutedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the action ran. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_BulkScreenOut` | `BulkScreenOutId` | Uniquely identifies each row (BulkScreenOutId). |
| FOREIGN KEY | `FK_BulkScreenOut_Cycle` | `AdmissionCycleId -> cfg.AdmissionCycle` | Every value must exist in cfg.AdmissionCycle, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_BulkScreenOut_Reason` | `ReasonCodeId -> cfg.ReasonCode` | Every value must exist in cfg.ReasonCode, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_BulkScreenOut_Staff` | `ExecutedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| UNIQUE | `UQ_BulkScreenOut_PublicId` | `PublicId` | API identifiers are unique. |

### scr.BulkScreenOutItem

The outcome of a bulk screen-out for one application.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `BulkScreenOutId` | bigint | N | PK; FK -> scr.BulkScreenOut.BulkScreenOutId |  | Links to scr.BulkScreenOut. |
| 2 | `ApplicationId` | bigint | N | PK; FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_BulkScreenOutItem` | `BulkScreenOutId, ApplicationId` | Uniquely identifies each row (BulkScreenOutId, ApplicationId). |
| FOREIGN KEY | `FK_BulkScreenOutItem_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_BulkScreenOutItem_Bulk` | `BulkScreenOutId -> scr.BulkScreenOut` | Every value must exist in scr.BulkScreenOut, so no row can point to something that does not exist. |

### scr.CasperImport

One versioned CASPER result upload for an admission cycle, with row counts.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CasperImportId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `AdmissionCycleId` | int | N | FK -> cfg.AdmissionCycle.CycleId |  | Links to cfg.AdmissionCycle. |
| 4 | `UploadVersion` | int | N |  |  | Version number of the upload within the cycle. |
| 5 | `AttachmentId` | bigint | Y | FK -> doc.Attachment.AttachmentId |  | Links to doc.Attachment. |
| 6 | `UploadedByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user who uploaded the file, if uploaded by staff. (Links to idn.StaffUser.) |
| 7 | `UploadedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time of upload. |
| 8 | `RowsReceived` | int | N |  | ((0)) | Rows in the file. |
| 9 | `RowsApplied` | int | N |  | ((0)) | Rows applied to applications. |
| 10 | `RowsRejected` | int | N |  | ((0)) | Rows rejected. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_CasperImport` | `CasperImportId` | Uniquely identifies each row (CasperImportId). |
| FOREIGN KEY | `FK_CasperImport_Attachment` | `AttachmentId -> doc.Attachment` | Every value must exist in doc.Attachment, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CasperImport_Cycle` | `AdmissionCycleId -> cfg.AdmissionCycle` | Every value must exist in cfg.AdmissionCycle, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CasperImport_Staff` | `UploadedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| UNIQUE | `UQ_CasperImport_PublicId` | `PublicId` | API identifiers are unique. |
| UNIQUE | `UQ_CasperImport_Version` | `AdmissionCycleId, UploadVersion` | Upload versions are unique per cycle. |

### scr.CasperImportRow

A raw CASPER row as received, with how it was processed.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CasperImportRowId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `CasperImportId` | bigint | N | FK -> scr.CasperImport.CasperImportId |  | Links to scr.CasperImport. |
| 3 | `RowNumber` | int | N |  |  | Row position in the file. |
| 4 | `RawRowJson` | json | N |  |  | The row exactly as received. |
| 5 | `ApplicationNumberRaw` | nvarchar(50) | Y |  |  | The Application ID cell read as text, exactly as received. |
| 6 | `ApplicationNumber` | char(11) | Y |  |  | The digits of the received Application ID when they form a valid application number; used to match the application. |
| 7 | `OutcomeCode` | varchar(20) | N |  |  | APPLIED, REJECTED or EXCEPTION. |
| 8 | `ExceptionReason` | nvarchar(500) | Y |  |  | Why the row was not applied. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_CasperImportRow` | `CasperImportRowId` | Uniquely identifies each row (CasperImportRowId). |
| FOREIGN KEY | `FK_CasperImportRow_Import` | `CasperImportId -> scr.CasperImport` | Every value must exist in scr.CasperImport, so no row can point to something that does not exist. |
| UNIQUE | `UQ_CasperImportRow` | `CasperImportId, RowNumber` | A row number occurs once per import. |
| CHECK | `CK_CasperImportRow_Outcome` | `([OutcomeCode]='EXCEPTION' OR [OutcomeCode]='REJECTED' OR [OutcomeCode]='APPLIED')` | Restricts OutcomeCode to: APPLIED, EXCEPTION, REJECTED. |

### scr.CasperResult

The CASPER result applied to an application. Only one is current.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `CasperResultId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `ApplicationId` | bigint | N | FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 3 | `CasperImportRowId` | bigint | N | FK -> scr.CasperImportRow.CasperImportRowId |  | Links to scr.CasperImportRow. |
| 4 | `Score` | decimal(7,2) | N |  |  | Weighted CASPER score. |
| 5 | `IsCurrent` | bit | N |  | ((1)) | 1 for the current row; older rows stay for history. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_CasperResult` | `CasperResultId` | Uniquely identifies each row (CasperResultId). |
| FOREIGN KEY | `FK_CasperResult_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_CasperResult_Row` | `CasperImportRowId -> scr.CasperImportRow` | Every value must exist in scr.CasperImportRow, so no row can point to something that does not exist. |
| UNIQUE | `UX_CasperResult_Current` | `ApplicationId WHERE ([IsCurrent]=(1))` | One current CASPER result per application. |

### scr.ScoreAnnouncement

An initial or re-announcement of scores, with the appeal window.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ScoreAnnouncementId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `AdmissionCycleId` | int | N | FK -> cfg.AdmissionCycle.CycleId |  | Links to cfg.AdmissionCycle. |
| 4 | `AnnouncementType` | varchar(20) | N |  |  | INITIAL or REANNOUNCEMENT. |
| 5 | `IdempotencyKey` | varchar(128) | N |  |  | Key that prevents the same announcement being run twice. Unique. |
| 6 | `AnnouncedByStaffUserId` | int | N | FK -> idn.StaffUser.StaffUserId |  | Staff user who published the announcement. (Links to idn.StaffUser.) |
| 7 | `AnnouncedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the scores were announced. |
| 8 | `AppealWindowEndsAt` | datetimeoffset(3) | Y |  |  | UTC time the appeal window closes. The window starts at the announcement. |
| 9 | `TimeZoneId` | varchar(64) | N |  | ('Asia/Dubai') | IANA time zone (default Asia/Dubai) in which the appeal window is defined. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScoreAnnouncement` | `ScoreAnnouncementId` | Uniquely identifies each row (ScoreAnnouncementId). |
| FOREIGN KEY | `FK_ScoreAnnouncement_Cycle` | `AdmissionCycleId -> cfg.AdmissionCycle` | Every value must exist in cfg.AdmissionCycle, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScoreAnnouncement_Staff` | `AnnouncedByStaffUserId -> idn.StaffUser` | Every value must exist in idn.StaffUser, so no row can point to something that does not exist. |
| UNIQUE | `UQ_ScoreAnnouncement_Idempotency` | `IdempotencyKey` | The same announcement cannot run twice. |
| UNIQUE | `UQ_ScoreAnnouncement_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_ScoreAnnouncement_Type` | `([AnnouncementType]='REANNOUNCEMENT' OR [AnnouncementType]='INITIAL')` | Restricts AnnouncementType to: INITIAL, REANNOUNCEMENT. |

### scr.ScoreAnnouncementItem

The score snapshot published to one candidate in an announcement. Candidates see only this.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `ScoreAnnouncementId` | bigint | N | PK; FK -> scr.ScoreAnnouncement.ScoreAnnouncementId |  | Links to scr.ScoreAnnouncement. |
| 2 | `ApplicationId` | bigint | N | PK; FK -> app.Application.ApplicationId |  | Application this row belongs to. (Links to app.Application.) |
| 3 | `PublishedScore` | decimal(7,2) | N |  |  | Score shown to the candidate. |
| 4 | `PublishedComponentsJson` | json | Y |  |  | Component breakdown shown to the candidate. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScoreAnnouncementItem` | `ScoreAnnouncementId, ApplicationId` | Uniquely identifies each row (ScoreAnnouncementId, ApplicationId). |
| FOREIGN KEY | `FK_ScoreAnnouncementItem_Announcement` | `ScoreAnnouncementId -> scr.ScoreAnnouncement` | Every value must exist in scr.ScoreAnnouncement, so no row can point to something that does not exist. |
| FOREIGN KEY | `FK_ScoreAnnouncementItem_Application` | `ApplicationId -> app.Application` | Every value must exist in app.Application, so no row can point to something that does not exist. |

### View scr.vw_CandidateAnnouncedScore

Candidate-facing view: only scores that have been announced. Unannounced scores are never exposed.

| # | Column | Type | Null |
|--:|---|---|:-:|
| 1 | `ApplicationId` | uniqueidentifier | N |
| 2 | `CandidateId` | bigint | N |
| 3 | `AnnouncementType` | varchar | N |
| 4 | `AnnouncedAt` | datetimeoffset | N |
| 5 | `PublishedScore` | decimal | N |
| 6 | `PublishedComponentsJson` | json | Y |
| 7 | `AppealWindowEndsAt` | datetimeoffset | Y |

## ops - Operations (audit, outbox, jobs)

Operations: append-only audit trail (who, what, when, active role and client - never data values), idempotency keys, transactional event outbox, notification templates and queue, and scheduled-job history.

### ops.AuditEvent

Append-only audit trail of actions: who acted, in which role and through which client, on what, when and with what outcome. Updates and deletes are blocked. Never holds data values or sensitive payloads.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `AuditEventId` | bigint | N | PK |  | Audit event written for this change. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `OccurredAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the event happened. |
| 4 | `ActorType` | varchar(20) | N |  |  | Kind of actor: candidate, staff, service or system. Allowed values: CANDIDATE, SERVICE, STAFF, SYSTEM. |
| 5 | `ActorCandidateId` | bigint | Y |  |  | Candidate who acted, when the actor is a candidate. |
| 6 | `ActorStaffUserId` | int | Y |  |  | Staff user who acted, when the actor is staff. |
| 7 | `ActorServiceName` | varchar(100) | Y |  |  | Name of the service that acted, when the actor is a service. |
| 8 | `ActiveRoleCode` | varchar(40) | Y |  |  | Role the staff actor was acting in. |
| 9 | `IntegrationClientId` | int | Y |  |  | Integration client that made the call ('user X via client Y'). Deliberately not a foreign key. |
| 10 | `ActionCode` | varchar(100) | N |  |  | Action performed, for example application.submit. |
| 11 | `ResourceType` | varchar(60) | N |  |  | Type of record acted on. |
| 12 | `ResourceId` | varchar(64) | N |  |  | Id of the record acted on, as text. |
| 13 | `ApplicationId` | bigint | Y |  |  | Application concerned. Deliberately not a foreign key so audit survives deletion. |
| 14 | `FromStatus` | varchar(40) | Y |  |  | Status before the action. |
| 15 | `ToStatus` | varchar(40) | Y |  |  | Status after the action. |
| 16 | `ReasonCode` | varchar(60) | Y |  |  | Reason code given for the action. |
| 17 | `Outcome` | varchar(20) | N |  | ('SUCCESS') | SUCCESS, DENIED or FAILED. |
| 18 | `RequestId` | varchar(64) | Y |  |  | Request id from the API call. |
| 19 | `CorrelationId` | varchar(64) | Y |  |  | Id that ties together all records produced by one business request. |
| 20 | `DetailJson` | json | Y |  |  | Extra non-sensitive metadata as JSON. Never field values. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_AuditEvent` | `AuditEventId` | Uniquely identifies each row (AuditEventId). |
| UNIQUE | `UQ_AuditEvent_PublicId` | `PublicId` | API identifiers are unique. |
| CHECK | `CK_AuditEvent_ActorType` | `([ActorType]='SYSTEM' OR [ActorType]='SERVICE' OR [ActorType]='STAFF' OR [ActorType]='CANDIDATE')` | Restricts ActorType to: CANDIDATE, SERVICE, STAFF, SYSTEM. |
| CHECK | `CK_AuditEvent_Outcome` | `([Outcome]='FAILED' OR [Outcome]='DENIED' OR [Outcome]='SUCCESS')` | Restricts Outcome to: DENIED, FAILED, SUCCESS. |
| TRIGGER | `TR_AuditEvent_Immutable` |  | Trigger: blocks updates and deletes so the audit trail is append-only. |

### ops.DomainEventOutbox

Transactional outbox of domain events to publish to other systems.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `EventId` | uniqueidentifier | N | PK | (newsequentialid()) | Unique event id used by consumers to remove duplicates. |
| 2 | `EventType` | varchar(100) | N |  |  | Name of the event, such as application.submitted. |
| 3 | `SchemaVersion` | smallint | N |  |  | Version of the event payload. |
| 4 | `AggregateType` | varchar(60) | N |  |  | Type of record the event is about. |
| 5 | `AggregateId` | varchar(64) | N |  |  | Id of the record the event is about. |
| 6 | `Producer` | varchar(100) | N |  |  | Service that raised the event. |
| 7 | `CorrelationId` | varchar(64) | Y |  |  | Id that ties together all records produced by one business request. |
| 8 | `PayloadJson` | json | N |  |  | Message content as JSON. |
| 9 | `OccurredAt` | datetimeoffset(3) | N |  |  | UTC time the event happened. |
| 10 | `RecordedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time written to the outbox. |
| 11 | `PublishedAt` | datetimeoffset(3) | Y |  |  | UTC time published. NULL while waiting. |
| 12 | `PublishAttempts` | int | N |  | ((0)) | Number of publishing attempts. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_DomainEventOutbox` | `EventId` | Uniquely identifies each row (EventId). |

### ops.IdempotencyKey

Stores request fingerprints and responses so repeated requests with the same key replay safely.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `IdempotencyKeyId` | bigint | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `KeyScope` | varchar(200) | N |  |  | Operation and caller the key applies to. |
| 3 | `KeyValue` | varchar(128) | N |  |  | Key from the Idempotency-Key header, at least 16 characters. |
| 4 | `RequestHash` | binary | N |  |  | Hash of the original request, to detect the same key with a different request. |
| 5 | `ResponseStatus` | smallint | Y |  |  | HTTP status of the stored response. |
| 6 | `ResponseBodyJson` | json | Y |  |  | Stored response body to replay. |
| 7 | `ResourceId` | varchar(64) | Y |  |  | Id of the resource the first request created. |
| 8 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |
| 9 | `ExpiresAt` | datetimeoffset(3) | N |  |  | UTC time after which the record is no longer valid. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_IdempotencyKey` | `IdempotencyKeyId` | Uniquely identifies each row (IdempotencyKeyId). |
| UNIQUE | `UQ_IdempotencyKey` | `KeyScope, KeyValue` | A key is unique within its scope. |
| CHECK | `CK_IdempotencyKey_Length` | `(len([KeyValue])>=(16))` | Idempotency keys must be at least 16 characters. |

### ops.NotificationOutbox

Queue of notifications to send, de-duplicated and retried.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `NotificationId` | bigint | N | PK |  | Public notification id. |
| 2 | `PublicId` | uniqueidentifier | N |  | (newsequentialid()) | Opaque identifier exposed through the API. Internal numeric keys are never exposed. |
| 3 | `RecipientCandidateId` | bigint | Y |  |  | Candidate recipient. |
| 4 | `RecipientStaffUserId` | int | Y |  |  | Staff recipient. |
| 5 | `ApplicationId` | bigint | Y |  |  | Application this row belongs to. |
| 6 | `TemplateCode` | varchar(80) | N |  |  | Template used. |
| 7 | `Channel` | varchar(10) | N |  |  | EMAIL, SMS or IN_APP. |
| 8 | `PayloadJson` | json | Y |  |  | Message content as JSON. |
| 9 | `DedupeKey` | varchar(200) | Y |  |  | Key that prevents sending the same notification twice. Unique when present. |
| 10 | `StatusCode` | varchar(15) | N |  | ('PENDING') | PENDING, SENT, FAILED or DEAD. |
| 11 | `AttemptCount` | int | N |  | ((0)) | Delivery attempts made. |
| 12 | `NextAttemptAt` | datetimeoffset(3) | Y |  |  | UTC time of the next attempt. |
| 13 | `SentAt` | datetimeoffset(3) | Y |  |  | UTC time delivered. |
| 14 | `ProviderMessageRef` | varchar(200) | Y |  |  | Message id from the delivery provider. |
| 15 | `LastError` | nvarchar(500) | Y |  |  | Last delivery error. |
| 16 | `CreatedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the row was created. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_NotificationOutbox` | `NotificationId` | Uniquely identifies each row (NotificationId). |
| UNIQUE | `UQ_NotificationOutbox_PublicId` | `PublicId` | API identifiers are unique. |
| UNIQUE | `UX_NotificationOutbox_Dedupe` | `DedupeKey WHERE ([DedupeKey] IS NOT NULL)` | A de-duplication key can be used only once. |
| CHECK | `CK_NotificationOutbox_Channel` | `([Channel]='IN_APP' OR [Channel]='SMS' OR [Channel]='EMAIL')` | Restricts Channel to: EMAIL, IN_APP, SMS. |
| CHECK | `CK_NotificationOutbox_Recipient` | `([RecipientCandidateId] IS NOT NULL OR [RecipientStaffUserId] IS NOT NULL)` | A notification needs a candidate or staff recipient. |
| CHECK | `CK_NotificationOutbox_Status` | `([StatusCode]='DEAD' OR [StatusCode]='FAILED' OR [StatusCode]='SENT' OR [StatusCode]='PENDING')` | Restricts StatusCode to: DEAD, FAILED, PENDING, SENT. |

### ops.NotificationTemplate

Versioned notification text per template, channel and language.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `NotificationTemplateId` | int | N | PK |  | Surrogate primary key, generated by the database. |
| 2 | `TemplateCode` | varchar(80) | N |  |  | Template name. |
| 3 | `Channel` | varchar(10) | N |  |  | EMAIL, SMS or IN_APP. |
| 4 | `LanguageCode` | varchar(35) | N |  |  | Language tag, such as en or ar. |
| 5 | `VersionNo` | int | N |  |  | Version counter, starting at 1 and increasing with each change. |
| 6 | `Subject` | nvarchar(300) | Y |  |  | Subject line. |
| 7 | `Body` | nvarchar(max) | N |  |  | Message body with placeholders. |
| 8 | `IsActive` | bit | N |  | ((1)) | 1 when available for use; 0 when retired (history is kept). |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_NotificationTemplate` | `NotificationTemplateId` | Uniquely identifies each row (NotificationTemplateId). |
| UNIQUE | `UQ_NotificationTemplate` | `TemplateCode, Channel, LanguageCode, VersionNo` | One template per code, channel, language and version. |
| CHECK | `CK_NotificationTemplate_Channel` | `([Channel]='IN_APP' OR [Channel]='SMS' OR [Channel]='EMAIL')` | Restricts Channel to: EMAIL, IN_APP, SMS. |

### ops.ScheduledJobRun

History of scheduled jobs run in-process by the API's background service, with their results.

| # | Column | Type | Null | Key | Default | Description |
|--:|---|---|:-:|---|---|---|
| 1 | `JobRunId` | bigint | N | PK |  | Public job run id. |
| 2 | `JobCode` | varchar(60) | N |  |  | Name of the job: application-maintenance, verification-maintenance or document-orphan-cleanup. |
| 3 | `StartedAt` | datetimeoffset(3) | N |  | (sysutcdatetime()) | UTC time the work started. |
| 4 | `CompletedAt` | datetimeoffset(3) | Y |  |  | UTC time the work finished. |
| 5 | `StatusCode` | varchar(15) | N |  | ('RUNNING') | RUNNING, SUCCEEDED, PARTIAL or FAILED. |
| 6 | `ProcessedCount` | int | N |  | ((0)) | Items processed. |
| 7 | `FailedCount` | int | N |  | ((0)) | Items that failed. |
| 8 | `ErrorSummaryJson` | json | Y |  |  | Summary of errors as JSON. |
| 9 | `CalendarVersion` | varchar(20) | Y |  |  | Working calendar version used. |

**Constraints and rules**

| Type | Name | Definition | What it enforces |
|---|---|---|---|
| PRIMARY KEY | `PK_ScheduledJobRun` | `JobRunId` | Uniquely identifies each row (JobRunId). |
| CHECK | `CK_ScheduledJobRun_Status` | `([StatusCode]='FAILED' OR [StatusCode]='PARTIAL' OR [StatusCode]='SUCCEEDED' OR [StatusCode]='RUNNING')` | Restricts StatusCode to: FAILED, PARTIAL, RUNNING, SUCCEEDED. |


---

Generated from the SQL scripts in `Physical/` on 2026-11-11 by a script-parsing generator, because no database was available to run `Tools/Generate-DataDictionary.ps1` against. Do not edit by hand: change `Tools/descriptions.json` or the SQL scripts and regenerate (preferably with `Tools/Generate-DataDictionary.ps1` against a deployed database).
