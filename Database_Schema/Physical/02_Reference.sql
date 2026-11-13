/*==============================================================================
  02_Reference.sql : lookups, program/specialty/site catalog, configuration
  Conventions
    - Lookup tables use natural varchar codes that equal the API enum values.
    - Catalog tables expose PublicId (uniqueidentifier) as the opaque API id.
    - Effective-dated configuration is versioned; rows are never updated in place
      once referenced by a transaction.
    - Times are datetimeoffset(3) stored in UTC (D-07). Deadlines defined in local
      terms also keep the IANA time zone (TimeZoneId) used to set them.
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

/*------------------------------ status lookups ------------------------------*/
CREATE TABLE cfg.ApplicationStatus (
    StatusCode          varchar(40)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    SortOrder           smallint      NOT NULL,
    IsTerminal          bit           NOT NULL CONSTRAINT DF_ApplicationStatus_IsTerminal DEFAULT (0),
    CONSTRAINT PK_ApplicationStatus PRIMARY KEY (StatusCode)
);
CREATE TABLE cfg.VerificationStatus (
    StatusCode          varchar(40)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    SortOrder           smallint      NOT NULL,
    IsTerminal          bit           NOT NULL CONSTRAINT DF_VerificationStatus_IsTerminal DEFAULT (0),
    CONSTRAINT PK_VerificationStatus PRIMARY KEY (StatusCode)
);
CREATE TABLE cfg.PortfolioStatus (
    StatusCode          varchar(40)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    SortOrder           smallint      NOT NULL,
    IsTerminal          bit           NOT NULL CONSTRAINT DF_PortfolioStatus_IsTerminal DEFAULT (0),
    CONSTRAINT PK_PortfolioStatus PRIMARY KEY (StatusCode)
);
CREATE TABLE cfg.PortfolioRoundStatus (
    StatusCode          varchar(40)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    SortOrder           smallint      NOT NULL,
    CONSTRAINT PK_PortfolioRoundStatus PRIMARY KEY (StatusCode)
);
CREATE TABLE cfg.AnnouncementStatus (
    StatusCode          varchar(40)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    SortOrder           smallint      NOT NULL,
    CONSTRAINT PK_AnnouncementStatus PRIMARY KEY (StatusCode)
);
CREATE TABLE cfg.PaymentStatus (
    StatusCode          varchar(40)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    SortOrder           smallint      NOT NULL,
    IsTerminal          bit           NOT NULL CONSTRAINT DF_PaymentStatus_IsTerminal DEFAULT (0),
    CONSTRAINT PK_PaymentStatus PRIMARY KEY (StatusCode)
);
CREATE TABLE cfg.PaymentProvider (
    ProviderCode        varchar(30)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    IsEnabled           bit           NOT NULL CONSTRAINT DF_PaymentProvider_IsEnabled DEFAULT (1),
    CONSTRAINT PK_PaymentProvider PRIMARY KEY (ProviderCode)
);
GO

/*------------------------------ program catalog -----------------------------*/
CREATE TABLE cfg.ProgramCategory (
    CategoryCode        varchar(30)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    CONSTRAINT PK_ProgramCategory PRIMARY KEY (CategoryCode)
);
CREATE TABLE cfg.Discipline (
    DisciplineCode      varchar(30)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    CONSTRAINT PK_Discipline PRIMARY KEY (DisciplineCode)
);

CREATE TABLE cfg.AdmissionCycle (
    CycleId             int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_AdmissionCycle_PublicId DEFAULT (NEWSEQUENTIALID()),
    CycleCode           varchar(20)   NOT NULL,           -- e.g. 2026/2027
    StartDate           date          NOT NULL,           -- its year is the prefix of every application number of the cycle (D-19)
    EndDate             date          NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_AdmissionCycle_IsActive DEFAULT (1),
    CONSTRAINT PK_AdmissionCycle PRIMARY KEY (CycleId),
    CONSTRAINT UQ_AdmissionCycle_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_AdmissionCycle_CycleCode UNIQUE (CycleCode),
    CONSTRAINT CK_AdmissionCycle_Dates CHECK (EndDate >= StartDate)
);

CREATE TABLE cfg.Program (
    ProgramId           int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_Program_PublicId DEFAULT (NEWSEQUENTIALID()),
    ProgramCode         varchar(30)   NOT NULL,
    ProgramName         nvarchar(200) NOT NULL,
    CategoryCode        varchar(30)   NOT NULL,
    DisciplineCode      varchar(30)   NOT NULL,
    MaxPreferences      tinyint       NOT NULL,           -- 1 for internship / pharmacy residency, 2 for medical & dental residency and fellowship
    RulesInheritedFromProgramId int   NULL,               -- e.g. Certificate (Medical Laboratory) follows Internship (Dental) rules and weights
    IsActive            bit           NOT NULL CONSTRAINT DF_Program_IsActive DEFAULT (1),
    CONSTRAINT PK_Program PRIMARY KEY (ProgramId),
    CONSTRAINT UQ_Program_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_Program_ProgramCode UNIQUE (ProgramCode),
    CONSTRAINT FK_Program_Category FOREIGN KEY (CategoryCode)     REFERENCES cfg.ProgramCategory (CategoryCode),
        CONSTRAINT FK_Program_Discipline FOREIGN KEY (DisciplineCode) REFERENCES cfg.Discipline (DisciplineCode),
        CONSTRAINT FK_Program_RulesInheritedFrom FOREIGN KEY (RulesInheritedFromProgramId) REFERENCES cfg.Program (ProgramId),
    CONSTRAINT CK_Program_MaxPreferences CHECK (MaxPreferences BETWEEN 1 AND 2)
);

CREATE TABLE cfg.ProgramCycle (
    ProgramCycleId      int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_ProgramCycle_PublicId DEFAULT (NEWSEQUENTIALID()),
    ProgramId           int           NOT NULL,
    CycleId             int           NOT NULL,
    ApplicationOpensAt  datetimeoffset(3) NULL,
    ApplicationClosesAt datetimeoffset(3) NULL,           -- due-date values are contradictory in the BRD: configure, do not hard-code
    GracePeriodEndsAt   datetimeoffset(3) NULL,           -- grace-period deadline: preference edits stop, unsubmitted drafts are archived
    TimeZoneId          varchar(64)   NOT NULL CONSTRAINT DF_ProgramCycle_TimeZoneId DEFAULT ('Asia/Dubai'),   -- IANA zone the window and deadlines above are defined in (D-07)
    IsActive            bit           NOT NULL CONSTRAINT DF_ProgramCycle_IsActive DEFAULT (1),
    CONSTRAINT PK_ProgramCycle PRIMARY KEY (ProgramCycleId),
    CONSTRAINT UQ_ProgramCycle_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_ProgramCycle_ProgramCycle UNIQUE (ProgramId, CycleId),
    CONSTRAINT     FK_ProgramCycle_Program FOREIGN KEY (ProgramId) REFERENCES cfg.Program (ProgramId),
        CONSTRAINT FK_ProgramCycle_Cycle FOREIGN KEY (CycleId) REFERENCES cfg.AdmissionCycle (CycleId),
    CONSTRAINT CK_ProgramCycle_Window CHECK (ApplicationClosesAt IS NULL OR ApplicationOpensAt IS NULL OR ApplicationClosesAt > ApplicationOpensAt),
    CONSTRAINT CK_ProgramCycle_GracePeriod CHECK (GracePeriodEndsAt IS NULL OR ApplicationClosesAt IS NULL OR GracePeriodEndsAt >= ApplicationClosesAt)
);

CREATE TABLE cfg.Specialty (
    SpecialtyId         int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_Specialty_PublicId DEFAULT (NEWSEQUENTIALID()),
    SpecialtyCode       varchar(30)   NOT NULL,
    SpecialtyName       nvarchar(200) NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_Specialty_IsActive DEFAULT (1),
    CONSTRAINT PK_Specialty PRIMARY KEY (SpecialtyId),
    CONSTRAINT UQ_Specialty_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_Specialty_Code UNIQUE (SpecialtyCode)
);

CREATE TABLE cfg.ProgramSpecialty (
    ProgramSpecialtyId  int           IDENTITY(1,1) NOT NULL,
    ProgramId           int           NOT NULL,
    SpecialtyId         int           NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_ProgramSpecialty_IsActive DEFAULT (1),
    CONSTRAINT PK_ProgramSpecialty PRIMARY KEY (ProgramSpecialtyId),
    CONSTRAINT UQ_ProgramSpecialty UNIQUE (ProgramId, SpecialtyId),
    CONSTRAINT     FK_ProgramSpecialty_Program FOREIGN KEY (ProgramId) REFERENCES cfg.Program (ProgramId),
        CONSTRAINT FK_ProgramSpecialty_Specialty FOREIGN KEY (SpecialtyId) REFERENCES cfg.Specialty (SpecialtyId)
);

CREATE TABLE cfg.TrainingSite (
    SiteId              int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_TrainingSite_PublicId DEFAULT (NEWSEQUENTIALID()),
    SiteCode            varchar(30)   NOT NULL,
    SiteName            nvarchar(200) NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_TrainingSite_IsActive DEFAULT (1),
    CONSTRAINT PK_TrainingSite PRIMARY KEY (SiteId),
    CONSTRAINT UQ_TrainingSite_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_TrainingSite_Code UNIQUE (SiteCode)
);

CREATE TABLE cfg.SpecialtySite (
    SpecialtySiteId     int           IDENTITY(1,1) NOT NULL,
    ProgramSpecialtyId  int           NOT NULL,
    SiteId              int           NOT NULL,
    Capacity            int           NULL,               -- site capacity is TBC in the BRD
    IsActive            bit           NOT NULL CONSTRAINT DF_SpecialtySite_IsActive DEFAULT (1),
    CONSTRAINT PK_SpecialtySite PRIMARY KEY (SpecialtySiteId),
    CONSTRAINT UQ_SpecialtySite UNIQUE (ProgramSpecialtyId, SiteId),
    CONSTRAINT UQ_SpecialtySite_WithSpecialty UNIQUE (SpecialtySiteId, ProgramSpecialtyId),  -- target of composite FKs that keep a candidate's site inside the chosen specialty
    CONSTRAINT FK_SpecialtySite_ProgramSpecialty FOREIGN KEY (ProgramSpecialtyId)     REFERENCES cfg.ProgramSpecialty (ProgramSpecialtyId),
        CONSTRAINT FK_SpecialtySite_Site FOREIGN KEY (SiteId) REFERENCES cfg.TrainingSite (SiteId),
    CONSTRAINT CK_SpecialtySite_Capacity CHECK (Capacity IS NULL OR Capacity >= 0)
);
GO

/*---------------------- academic reference data (US-1.3.4) ------------------*/
CREATE TABLE cfg.Country (
    CountryId           int           IDENTITY(1,1) NOT NULL,
    Iso2Code            char(2)       NOT NULL,
    CountryName         nvarchar(150) NOT NULL,
    IsUae               bit           NOT NULL CONSTRAINT DF_Country_IsUae DEFAULT (0),   -- drives the GPA input path (UAE vs ECE)
    IsActive            bit           NOT NULL CONSTRAINT DF_Country_IsActive DEFAULT (1),
    CONSTRAINT PK_Country PRIMARY KEY (CountryId),
    CONSTRAINT UQ_Country_Iso2 UNIQUE (Iso2Code)
);
CREATE TABLE cfg.University (
    UniversityId        int           IDENTITY(1,1) NOT NULL,
    CountryId           int           NOT NULL,
    UniversityName      nvarchar(300) NOT NULL,
    IsOther             bit           NOT NULL CONSTRAINT DF_University_IsOther DEFAULT (0),  -- the "Other" entry requires free text
    IsActive            bit           NOT NULL CONSTRAINT DF_University_IsActive DEFAULT (1),
    CONSTRAINT PK_University PRIMARY KEY (UniversityId),
    CONSTRAINT UQ_University UNIQUE (CountryId, UniversityName),
    CONSTRAINT FK_University_Country FOREIGN KEY (CountryId) REFERENCES cfg.Country (CountryId)
);
CREATE TABLE cfg.Degree (
    DegreeId            int           IDENTITY(1,1) NOT NULL,
    DegreeName          nvarchar(200) NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_Degree_IsActive DEFAULT (1),
    CONSTRAINT PK_Degree PRIMARY KEY (DegreeId),
    CONSTRAINT UQ_Degree_Name UNIQUE (DegreeName)
);
CREATE TABLE cfg.ProgramDegree (
    ProgramId           int           NOT NULL,
    DegreeId            int           NOT NULL,
    CONSTRAINT PK_ProgramDegree PRIMARY KEY (ProgramId, DegreeId),
    CONSTRAINT     FK_ProgramDegree_Program FOREIGN KEY (ProgramId) REFERENCES cfg.Program (ProgramId),
        CONSTRAINT FK_ProgramDegree_Degree FOREIGN KEY (DegreeId) REFERENCES cfg.Degree (DegreeId)
);
GO

/*---------------------------- reason codes ----------------------------------*/
CREATE TABLE cfg.ReasonCategory (
    CategoryCode        varchar(40)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    CONSTRAINT PK_ReasonCategory PRIMARY KEY (CategoryCode)
);
CREATE TABLE cfg.ReasonCode (
    ReasonCodeId        int           IDENTITY(1,1) NOT NULL,
    CategoryCode        varchar(40)   NOT NULL,
    ReasonCode          varchar(60)   NOT NULL,
    DisplayName         nvarchar(200) NOT NULL,
    CandidateMessage    nvarchar(500) NULL,               -- candidate-safe wording; null = never shown to the candidate
    SortOrder           smallint      NOT NULL CONSTRAINT DF_ReasonCode_SortOrder DEFAULT (0),   -- order in the drop-down (lookup sortOrder)
    IsActive            bit           NOT NULL CONSTRAINT DF_ReasonCode_IsActive DEFAULT (1),
    CONSTRAINT PK_ReasonCode PRIMARY KEY (ReasonCodeId),
    CONSTRAINT UQ_ReasonCode UNIQUE (CategoryCode, ReasonCode),
    CONSTRAINT FK_ReasonCode_Category FOREIGN KEY (CategoryCode) REFERENCES cfg.ReasonCategory (CategoryCode)
);
GO

/*------------------------ document types (US-1.3.x, US-2.3.1) ---------------*/
-- Catalogue of the documents a candidate or staff member can upload (personal photo, passport copy, CV,
-- personal statement, recommendation letter, ECE report, portfolio evidence ...). The upload rules live here,
-- so the per-slot checks are configuration rather than code.
CREATE TABLE cfg.DocumentType (
    DocumentTypeId      int           IDENTITY(1,1) NOT NULL,
    DocumentTypeCode    varchar(60)   NOT NULL,
    Name                nvarchar(200) NOT NULL,
    AllowedMediaTypes   varchar(400)  NOT NULL,           -- comma-separated media types, e.g. application/pdf,image/jpeg,image/png
    MaxSizeBytes        bigint        NOT NULL,           -- 2 MB (2097152) unless the BRD states otherwise for the slot
    IsActive            bit           NOT NULL CONSTRAINT DF_DocumentType_IsActive DEFAULT (1),
    SortOrder           smallint      NOT NULL CONSTRAINT DF_DocumentType_SortOrder DEFAULT (0),
    CONSTRAINT PK_DocumentType PRIMARY KEY (DocumentTypeId),
    CONSTRAINT UQ_DocumentType_Code UNIQUE (DocumentTypeCode),
    CONSTRAINT CK_DocumentType_MaxSize CHECK (MaxSizeBytes > 0)
);
GO

/*------------------------------ work pools ----------------------------------*/
CREATE TABLE cfg.WorkPool (
    WorkPoolId          int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_WorkPool_PublicId DEFAULT (NEWSEQUENTIALID()),
    PoolType            varchar(30)   NOT NULL,
    ProgramCycleId      int           NOT NULL,
    ProgramSpecialtyId  int           NULL,               -- null = all specialties of the program
    DisplayName         nvarchar(200) NOT NULL,
    RetrievalCap        int           NULL,               -- per-user retrieval cap, configurable (US-2.2.1 / US-3.2.1)
    IsActive            bit           NOT NULL CONSTRAINT DF_WorkPool_IsActive DEFAULT (1),
    CONSTRAINT PK_WorkPool PRIMARY KEY (WorkPoolId),
    CONSTRAINT UQ_WorkPool_PublicId UNIQUE (PublicId),
    CONSTRAINT     FK_WorkPool_ProgramCycle FOREIGN KEY (ProgramCycleId) REFERENCES cfg.ProgramCycle (ProgramCycleId),
        CONSTRAINT FK_WorkPool_ProgramSpecialty FOREIGN KEY (ProgramSpecialtyId) REFERENCES cfg.ProgramSpecialty (ProgramSpecialtyId),
    CONSTRAINT CK_WorkPool_Type CHECK (PoolType IN ('VERIFICATION','PORTFOLIO_ROUND_1','PORTFOLIO_ROUND_2','THIRD_REFEREE','SECOND_EVALUATION')),
    CONSTRAINT CK_WorkPool_Cap CHECK (RetrievalCap IS NULL OR RetrievalCap > 0)
);
GO

/*------------------------ calendar and system parameters --------------------*/
CREATE TABLE cfg.WorkingCalendarDay (
    CalendarDate        date          NOT NULL,
    IsWorkingDay        bit           NOT NULL,
    Description         nvarchar(200) NULL,
    CalendarVersion     varchar(20)   NOT NULL,
    CONSTRAINT PK_WorkingCalendarDay PRIMARY KEY (CalendarDate)
);
CREATE TABLE cfg.SystemParameter (
    ParameterCode       varchar(80)   NOT NULL,           -- e.g. DRAFT_REMINDER_DAYS, DRAFT_ARCHIVE_DAYS, APPEAL_WINDOW_DAYS, REVIEW_DUE_WORKING_DAYS
    ParameterValue      nvarchar(400) NOT NULL,
    ValueType           varchar(20)   NOT NULL,
    Description         nvarchar(400) NULL,
    UpdatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_SystemParameter_UpdatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedBy           nvarchar(100) NULL,
    CONSTRAINT PK_SystemParameter PRIMARY KEY (ParameterCode),
    CONSTRAINT CK_SystemParameter_Type CHECK (ValueType IN ('INT','DECIMAL','STRING','BOOL','DATE'))
);
GO

/*------------------ scoring configuration (approval-gated) ------------------*/
CREATE TABLE cfg.GpaConversionSet (
    GpaConversionSetId  int           IDENTITY(1,1) NOT NULL,
    VersionLabel        varchar(30)   NOT NULL,
    EffectiveFrom       date          NOT NULL,
    EffectiveTo         date          NULL,
    ApprovedBy          nvarchar(200) NULL,
    ApprovedAt          datetimeoffset(3) NULL,
    CONSTRAINT PK_GpaConversionSet PRIMARY KEY (GpaConversionSetId),
    CONSTRAINT UQ_GpaConversionSet_Version UNIQUE (VersionLabel),
    CONSTRAINT CK_GpaConversionSet_Dates CHECK (EffectiveTo IS NULL OR EffectiveTo >= EffectiveFrom)
);
CREATE TABLE cfg.GpaConversionBand (
    GpaConversionBandId int           IDENTITY(1,1) NOT NULL,
    GpaConversionSetId  int           NOT NULL,
    ScaleMin            decimal(4,2)  NOT NULL,           -- GPA on the scale of 4
    ScaleMax            decimal(4,2)  NOT NULL,
    PercentMin          decimal(5,2)  NOT NULL,           -- percentage mapped to ScaleMin
    PercentMax          decimal(5,2)  NOT NULL,           -- percentage mapped to ScaleMax (linear interpolation inside the band)
    CONSTRAINT PK_GpaConversionBand PRIMARY KEY (GpaConversionBandId),
    CONSTRAINT UQ_GpaConversionBand UNIQUE (GpaConversionSetId, ScaleMin),
    CONSTRAINT FK_GpaConversionBand_Set FOREIGN KEY (GpaConversionSetId) REFERENCES cfg.GpaConversionSet (GpaConversionSetId),
    CONSTRAINT CK_GpaConversionBand_Scale CHECK (ScaleMin >= 0 AND ScaleMax <= 4 AND ScaleMax >= ScaleMin),
    CONSTRAINT CK_GpaConversionBand_Percent CHECK (PercentMin >= 0 AND PercentMax <= 100 AND PercentMax >= PercentMin)
);

CREATE TABLE cfg.ScoringWeightSet (
    ScoringWeightSetId  int           IDENTITY(1,1) NOT NULL,
    ProgramId           int           NOT NULL,
    VersionLabel        varchar(30)   NOT NULL,           -- formula version stamped on every computed score
    EffectiveFrom       date          NOT NULL,
    EffectiveTo         date          NULL,
    GpaConversionSetId  int           NULL,
    ApprovedBy          nvarchar(200) NULL,
    ApprovedAt          datetimeoffset(3) NULL,
    CONSTRAINT PK_ScoringWeightSet PRIMARY KEY (ScoringWeightSetId),
    CONSTRAINT UQ_ScoringWeightSet UNIQUE (ProgramId, VersionLabel),
    CONSTRAINT     FK_ScoringWeightSet_Program FOREIGN KEY (ProgramId) REFERENCES cfg.Program (ProgramId),
        CONSTRAINT FK_ScoringWeightSet_GpaSet FOREIGN KEY (GpaConversionSetId) REFERENCES cfg.GpaConversionSet (GpaConversionSetId),
    CONSTRAINT CK_ScoringWeightSet_Dates CHECK (EffectiveTo IS NULL OR EffectiveTo >= EffectiveFrom)
);
CREATE TABLE cfg.ScoringWeightItem (
    ScoringWeightSetId  int           NOT NULL,
    ComponentCode       varchar(30)   NOT NULL,           -- GPA, PORTFOLIO, ENTRANCE_EXAM, CASPER, ENGLISH (open list: formulas are not approved yet)
    MaxPoints           decimal(7,2)  NOT NULL,           -- the program weight Y in "X.XX / Y"
    CONSTRAINT PK_ScoringWeightItem PRIMARY KEY (ScoringWeightSetId, ComponentCode),
    CONSTRAINT FK_ScoringWeightItem_Set FOREIGN KEY (ScoringWeightSetId) REFERENCES cfg.ScoringWeightSet (ScoringWeightSetId),
    CONSTRAINT CK_ScoringWeightItem_Points CHECK (MaxPoints >= 0)
);
GO
