/*==============================================================================
  05_Application.sql : versioned form schema, application aggregate, candidate lifecycle
  Section values are stored as native json; the field definitions that validate
  them live in relational tables so each submitted application is pinned to the
  immutable form-schema version it was completed against.
  Personal information is held per candidate in idn.CandidatePersonalProfile
  (D-10); each submitted application keeps a snapshot of it (D-15). The
  per-application section JSON no longer holds personal-information fields.
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

/*------------------- versioned, program-configured form schema --------------*/
CREATE TABLE app.FormSchemaVersion (
    FormSchemaVersionId int           IDENTITY(1,1) NOT NULL,
    ProgramId           int           NOT NULL,
    VersionLabel        varchar(30)   NOT NULL,
    StatusCode          varchar(15)   NOT NULL CONSTRAINT DF_FormSchemaVersion_Status DEFAULT ('DRAFT'),
    EffectiveFrom       date          NOT NULL,
    EffectiveTo         date          NULL,
    ApprovedBy          nvarchar(200) NULL,
    ApprovedAt          datetimeoffset(3) NULL,
    CONSTRAINT PK_FormSchemaVersion PRIMARY KEY (FormSchemaVersionId),
    CONSTRAINT UQ_FormSchemaVersion UNIQUE (ProgramId, VersionLabel),
    CONSTRAINT FK_FormSchemaVersion_Program FOREIGN KEY (ProgramId) REFERENCES cfg.Program (ProgramId),
    CONSTRAINT CK_FormSchemaVersion_Status CHECK (StatusCode IN ('DRAFT','APPROVED','RETIRED')),
    CONSTRAINT CK_FormSchemaVersion_Dates CHECK (EffectiveTo IS NULL OR EffectiveTo >= EffectiveFrom)
);

CREATE TABLE app.FormSection (
    FormSectionId       int           IDENTITY(1,1) NOT NULL,
    FormSchemaVersionId int           NOT NULL,
    SectionKey          varchar(50)   NOT NULL,
    Title               nvarchar(200) NOT NULL,
    DisplayOrder        smallint      NOT NULL,
    CONSTRAINT PK_FormSection PRIMARY KEY (FormSectionId),
    CONSTRAINT UQ_FormSection UNIQUE (FormSchemaVersionId, SectionKey),
    CONSTRAINT FK_FormSection_Version FOREIGN KEY (FormSchemaVersionId) REFERENCES app.FormSchemaVersion (FormSchemaVersionId),
    CONSTRAINT CK_FormSection_Key CHECK (SectionKey IN ('application-information','personal-information','academic-information','english-proficiency',
                                                       'internship-information','residency-information','board-license-information','residency-entrance-exam'))
);

CREATE TABLE app.FormField (
    FormFieldId         int           IDENTITY(1,1) NOT NULL,
    FormSectionId       int           NOT NULL,
    FieldCode           varchar(80)   NOT NULL,
    DisplayLabel        nvarchar(300) NOT NULL,
    TooltipText         nvarchar(500) NULL,
    DataType            varchar(20)   NOT NULL,
    IsVisible           bit           NOT NULL CONSTRAINT DF_FormField_IsVisible DEFAULT (1),
    IsRequired          bit           NOT NULL CONSTRAINT DF_FormField_IsRequired DEFAULT (0),
    IsReadOnly          bit           NOT NULL CONSTRAINT DF_FormField_IsReadOnly DEFAULT (0),
    ConstraintsJson     json          NULL,               -- minLength, maxLength, minimum, maximum, pattern, allowedFileTypes, maxFileSizeBytes (2 MB default for attachments)
    DisplayOrder        smallint      NOT NULL,
    CONSTRAINT PK_FormField PRIMARY KEY (FormFieldId),
    CONSTRAINT UQ_FormField UNIQUE (FormSectionId, FieldCode),
    CONSTRAINT FK_FormField_Section FOREIGN KEY (FormSectionId) REFERENCES app.FormSection (FormSectionId),
    CONSTRAINT CK_FormField_DataType CHECK (DataType IN ('STRING','TEXT','INTEGER','DECIMAL','BOOLEAN','DATE','DATE_TIME','SINGLE_SELECT','MULTI_SELECT','FILE_REFERENCE','URL'))
);

CREATE TABLE app.FormFieldOption (
    FormFieldId         int           NOT NULL,
    OptionCode          varchar(80)   NOT NULL,
    DisplayLabel        nvarchar(300) NOT NULL,
    DisplayOrder        smallint      NOT NULL,
    CONSTRAINT PK_FormFieldOption PRIMARY KEY (FormFieldId, OptionCode),
    CONSTRAINT FK_FormFieldOption_Field FOREIGN KEY (FormFieldId) REFERENCES app.FormField (FormFieldId)
);

-- All conditions of the same kind on a field must match (AND) for the field to be visible / required.
CREATE TABLE app.FormFieldCondition (
    FormFieldConditionId int          IDENTITY(1,1) NOT NULL,
    FormFieldId         int           NOT NULL,
    ConditionKind       varchar(15)   NOT NULL,
    DependsOnFieldCode  varchar(80)   NOT NULL,
    Operator            varchar(10)   NOT NULL,
    ValueJson           json          NULL,
    CONSTRAINT PK_FormFieldCondition PRIMARY KEY (FormFieldConditionId),
    CONSTRAINT FK_FormFieldCondition_Field FOREIGN KEY (FormFieldId) REFERENCES app.FormField (FormFieldId),
    CONSTRAINT CK_FormFieldCondition_Kind CHECK (ConditionKind IN ('VISIBLE_WHEN','REQUIRED_WHEN')),
    CONSTRAINT CK_FormFieldCondition_Operator CHECK (Operator IN ('EQ','NE','IN','NOT_IN','GT','GTE','LT','LTE','NOT_EMPTY','EMPTY'))
);
CREATE INDEX IX_FormFieldCondition_Field ON app.FormFieldCondition (FormFieldId);
GO

/*------------------------------ application ---------------------------------*/
-- D-19: one counter per admission cycle for the application number <cycle start year><7-digit counter>.
-- Allocation is a single atomic statement inside the create-application transaction:
--   UPDATE app.ApplicationNumberCounter SET LastValue = LastValue + 1
--   OUTPUT inserted.CycleStartYear, inserted.LastValue WHERE AdmissionCycleId = @cycleId;
-- The row lock taken by the UPDATE serialises concurrent creators, which protects the invariant that two
-- applications never receive the same number (and that numbers are never reused) within a cycle.
CREATE TABLE app.ApplicationNumberCounter (
    AdmissionCycleId    int           NOT NULL,
    CycleStartYear      smallint      NOT NULL,           -- year of cfg.AdmissionCycle.StartDate
    LastValue           int           NOT NULL CONSTRAINT DF_ApplicationNumberCounter_LastValue DEFAULT (0),
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_ApplicationNumberCounter PRIMARY KEY (AdmissionCycleId),
    CONSTRAINT UQ_ApplicationNumberCounter_Year UNIQUE (CycleStartYear),
    CONSTRAINT FK_ApplicationNumberCounter_Cycle FOREIGN KEY (AdmissionCycleId) REFERENCES cfg.AdmissionCycle (CycleId),
    CONSTRAINT CK_ApplicationNumberCounter_Year CHECK (CycleStartYear BETWEEN 1000 AND 9999),
    CONSTRAINT CK_ApplicationNumberCounter_Value CHECK (LastValue BETWEEN 0 AND 9999999)
);

CREATE TABLE app.Application (
    ApplicationId       bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_Application_PublicId DEFAULT (NEWSEQUENTIALID()),
    ApplicationNumber   char(11)      NOT NULL,           -- D-19: <cycle start year><7-digit counter>, e.g. 20270000001; the "Application ID" shown to people and the CASPER key
    CandidateId         bigint        NOT NULL,
    ProgramCycleId      int           NOT NULL,
    FormSchemaVersionId int           NOT NULL,
    StatusCode          varchar(40)   NOT NULL CONSTRAINT DF_Application_Status DEFAULT ('DRAFT'),
    VersionNo           int           NOT NULL CONSTRAINT DF_Application_VersionNo DEFAULT (1),   -- API ETag / If-Match value
    TermsVersion        varchar(20)   NULL,
    TermsAcceptedAt     datetimeoffset(3) NULL,
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_Application_CreatedAt DEFAULT (SYSUTCDATETIME()),
    LastSavedAt         datetimeoffset(3) NULL,
    SubmittedAt         datetimeoffset(3) NULL,
    ArchivedAt          datetimeoffset(3) NULL,
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_Application PRIMARY KEY (ApplicationId),
    CONSTRAINT UQ_Application_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_Application_Number UNIQUE (ApplicationNumber),
    CONSTRAINT FK_Application_Candidate FOREIGN KEY (CandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT FK_Application_ProgramCycle FOREIGN KEY (ProgramCycleId) REFERENCES cfg.ProgramCycle (ProgramCycleId),
    CONSTRAINT FK_Application_FormSchemaVersion FOREIGN KEY (FormSchemaVersionId) REFERENCES app.FormSchemaVersion (FormSchemaVersionId),
    CONSTRAINT FK_Application_Status FOREIGN KEY (StatusCode) REFERENCES cfg.ApplicationStatus (StatusCode),
    CONSTRAINT CK_Application_Number CHECK (ApplicationNumber LIKE '[1-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    CONSTRAINT CK_Application_VersionNo CHECK (VersionNo >= 1),
    -- Only drafts and discarded/expired drafts (ARCHIVED) may lack a submission time. A draft cannot be withdrawn (US-1.2.1).
    CONSTRAINT CK_Application_Submitted CHECK (StatusCode IN ('DRAFT','ARCHIVED') OR SubmittedAt IS NOT NULL)
);
-- Default rule: one live application per candidate and program cycle (confirm with the product owner).
CREATE UNIQUE INDEX UX_Application_LivePerCandidateProgramCycle
    ON app.Application (CandidateId, ProgramCycleId)
    WHERE StatusCode <> 'WITHDRAWN' AND StatusCode <> 'ARCHIVED';
CREATE INDEX IX_Application_Candidate ON app.Application (CandidateId, StatusCode) INCLUDE (ProgramCycleId, CreatedAt, SubmittedAt);
CREATE INDEX IX_Application_Status ON app.Application (StatusCode, SubmittedAt) INCLUDE (ProgramCycleId);
CREATE INDEX IX_Application_DraftMaintenance ON app.Application (LastSavedAt) WHERE StatusCode = 'DRAFT';
GO

-- D-15: copy of the candidate's personal information as submitted. Later profile edits or ICP refreshes never change it.
CREATE TABLE app.ApplicationPersonalSnapshot (
    ApplicationId       bigint        NOT NULL,
    SnapshotJson        json          NOT NULL,           -- PII; idn.CandidatePersonalProfile fields at submission
    ProfileRowVersion   binary(8)     NOT NULL,           -- profile RowVersion the snapshot was taken from
    TakenAt             datetimeoffset(3) NOT NULL CONSTRAINT DF_ApplicationPersonalSnapshot_TakenAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_ApplicationPersonalSnapshot PRIMARY KEY (ApplicationId),
    CONSTRAINT FK_ApplicationPersonalSnapshot_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId)
);
GO

CREATE TABLE app.ApplicationPreference (
    ApplicationPreferenceId bigint    IDENTITY(1,1) NOT NULL,
    ApplicationId       bigint        NOT NULL,
    PreferenceOrder     tinyint       NOT NULL,           -- 1 is the reference specialty; 2 is optional
    ProgramSpecialtyId  int           NOT NULL,
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_ApplicationPreference_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_ApplicationPreference PRIMARY KEY (ApplicationPreferenceId),
    CONSTRAINT UQ_ApplicationPreference_Order UNIQUE (ApplicationId, PreferenceOrder),
    CONSTRAINT UQ_ApplicationPreference_Specialty UNIQUE (ApplicationId, ProgramSpecialtyId),      -- both preferences cannot be the same specialty
    CONSTRAINT UQ_ApplicationPreference_WithSpecialty UNIQUE (ApplicationPreferenceId, ProgramSpecialtyId),
    CONSTRAINT FK_ApplicationPreference_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_ApplicationPreference_ProgramSpecialty FOREIGN KEY (ProgramSpecialtyId) REFERENCES cfg.ProgramSpecialty (ProgramSpecialtyId),
    CONSTRAINT CK_ApplicationPreference_Order CHECK (PreferenceOrder BETWEEN 1 AND 2)
);

CREATE TABLE app.ApplicationPreferenceSite (
    ApplicationPreferenceSiteId bigint IDENTITY(1,1) NOT NULL,
    ApplicationPreferenceId bigint    NOT NULL,
    ProgramSpecialtyId  int           NOT NULL,
    SpecialtySiteId     int           NOT NULL,
    SiteOrder           tinyint       NOT NULL,
    CONSTRAINT PK_ApplicationPreferenceSite PRIMARY KEY (ApplicationPreferenceSiteId),
    CONSTRAINT UQ_ApplicationPreferenceSite_Site UNIQUE (ApplicationPreferenceId, SpecialtySiteId),   -- a site cannot be chosen twice for one specialty
    CONSTRAINT UQ_ApplicationPreferenceSite_Order UNIQUE (ApplicationPreferenceId, SiteOrder),
    -- Composite keys guarantee the chosen site belongs to the same specialty as the preference.
    CONSTRAINT FK_ApplicationPreferenceSite_Preference FOREIGN KEY (ApplicationPreferenceId, ProgramSpecialtyId)
        REFERENCES app.ApplicationPreference (ApplicationPreferenceId, ProgramSpecialtyId),
    CONSTRAINT FK_ApplicationPreferenceSite_SpecialtySite FOREIGN KEY (SpecialtySiteId, ProgramSpecialtyId)
        REFERENCES cfg.SpecialtySite (SpecialtySiteId, ProgramSpecialtyId),
    CONSTRAINT CK_ApplicationPreferenceSite_Order CHECK (SiteOrder >= 1)
);

-- US-1.2.8: a site excluded after selection. The BRD asks for one mandatory free-text "Excluding Reason" for the
-- whole action (no list); it is repeated on each excluded site. ReasonCodeId is kept for a future list only.
CREATE TABLE app.SiteExclusion (
    SiteExclusionId     bigint        IDENTITY(1,1) NOT NULL,
    ApplicationPreferenceSiteId bigint NOT NULL,
    ReasonCodeId        int           NULL,
    ReasonText          nvarchar(500) NOT NULL,
    ExcludedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_SiteExclusion_ExcludedAt DEFAULT (SYSUTCDATETIME()),
    ExcludedByCandidateId bigint      NOT NULL,
    CONSTRAINT PK_SiteExclusion PRIMARY KEY (SiteExclusionId),
    CONSTRAINT UQ_SiteExclusion_Site UNIQUE (ApplicationPreferenceSiteId),
    CONSTRAINT FK_SiteExclusion_Site FOREIGN KEY (ApplicationPreferenceSiteId) REFERENCES app.ApplicationPreferenceSite (ApplicationPreferenceSiteId),
    CONSTRAINT FK_SiteExclusion_Reason FOREIGN KEY (ReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId),
    CONSTRAINT FK_SiteExclusion_Candidate FOREIGN KEY (ExcludedByCandidateId) REFERENCES idn.Candidate (CandidateId)
);
GO

/*---------------------------- section content -------------------------------*/
CREATE TABLE app.ApplicationSection (
    ApplicationSectionId bigint       IDENTITY(1,1) NOT NULL,
    ApplicationId       bigint        NOT NULL,
    SectionKey          varchar(50)   NOT NULL,
    FormSchemaVersionId int           NOT NULL,           -- schema version used to render and validate these values
    ValuesJson          json          NOT NULL,           -- { fieldCode: value }; personal-information fields live in idn.CandidatePersonalProfile (D-10)
    VersionNo           int           NOT NULL CONSTRAINT DF_ApplicationSection_VersionNo DEFAULT (1),
    IsComplete          bit           NOT NULL CONSTRAINT DF_ApplicationSection_IsComplete DEFAULT (0),
    UpdatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_ApplicationSection_UpdatedAt DEFAULT (SYSUTCDATETIME()),
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_ApplicationSection PRIMARY KEY (ApplicationSectionId),
    CONSTRAINT UQ_ApplicationSection UNIQUE (ApplicationId, SectionKey),
    CONSTRAINT FK_ApplicationSection_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_ApplicationSection_FormSchemaVersion FOREIGN KEY (FormSchemaVersionId) REFERENCES app.FormSchemaVersion (FormSchemaVersionId),
    CONSTRAINT CK_ApplicationSection_Key CHECK (SectionKey IN ('application-information','personal-information','academic-information','english-proficiency',
                                                              'internship-information','residency-information','board-license-information','residency-entrance-exam'))
);

-- Previous values of a section so officers can see what a candidate changed during correction.
CREATE TABLE app.ApplicationSectionHistory (
    ApplicationSectionId bigint       NOT NULL,
    VersionNo           int           NOT NULL,
    ValuesJson          json          NOT NULL,
    ChangeKind          varchar(20)   NOT NULL,
    ChangedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_ApplicationSectionHistory_ChangedAt DEFAULT (SYSUTCDATETIME()),
    ChangedByCandidateId bigint       NULL,
    ChangedByStaffUserId int          NULL,
    CONSTRAINT PK_ApplicationSectionHistory PRIMARY KEY (ApplicationSectionId, VersionNo),
    CONSTRAINT FK_ApplicationSectionHistory_Section FOREIGN KEY (ApplicationSectionId) REFERENCES app.ApplicationSection (ApplicationSectionId),
    CONSTRAINT CK_ApplicationSectionHistory_Kind CHECK (ChangeKind IN ('DRAFT_SAVE','CORRECTION','ICP_REFRESH','SYSTEM'))
);
GO

/*------------------------- lifecycle and requests ---------------------------*/
CREATE TABLE app.ApplicationStatusHistory (
    ApplicationStatusHistoryId bigint IDENTITY(1,1) NOT NULL,
    ApplicationId       bigint        NOT NULL,
    FromStatusCode      varchar(40)   NULL,
    ToStatusCode        varchar(40)   NOT NULL,
    ReasonCodeId        int           NULL,
    Note                nvarchar(500) NULL,
    ActorType           varchar(20)   NOT NULL,
    ActorCandidateId    bigint        NULL,
    ActorStaffUserId    int           NULL,
    ChangedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_ApplicationStatusHistory_ChangedAt DEFAULT (SYSUTCDATETIME()),
    AuditEventId        bigint        NULL,
    CONSTRAINT PK_ApplicationStatusHistory PRIMARY KEY (ApplicationStatusHistoryId),
    CONSTRAINT FK_ApplicationStatusHistory_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT     FK_ApplicationStatusHistory_From FOREIGN KEY (FromStatusCode) REFERENCES cfg.ApplicationStatus (StatusCode),
        CONSTRAINT FK_ApplicationStatusHistory_To FOREIGN KEY (ToStatusCode) REFERENCES cfg.ApplicationStatus (StatusCode),
        CONSTRAINT FK_ApplicationStatusHistory_Reason FOREIGN KEY (ReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId),
    CONSTRAINT CK_ApplicationStatusHistory_Actor CHECK (ActorType IN ('CANDIDATE','STAFF','SERVICE','SYSTEM'))
);
CREATE INDEX IX_ApplicationStatusHistory_Application ON app.ApplicationStatusHistory (ApplicationId, ChangedAt);

-- US-1.2.4: withdrawal requires a reason and OTP confirmation (the OTP itself is held by the OTP provider and never stored).
-- ReasonCodeId comes from lookup WITHDRAWAL_REASON. OtherReasonText is required when the reason is OTHER (at least 3 letters,
-- placeholder words rejected); the API enforces it because a CHECK cannot read the reason code.
CREATE TABLE app.WithdrawalRequest (
    WithdrawalRequestId bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_WithdrawalRequest_PublicId DEFAULT (NEWSEQUENTIALID()),
    ApplicationId       bigint        NOT NULL,
    ReasonCodeId        int           NOT NULL,
    OtherReasonText     nvarchar(500) NULL,
    StatusCode          varchar(25)   NOT NULL CONSTRAINT DF_WithdrawalRequest_Status DEFAULT ('PENDING_CONFIRMATION'),
    OtpProviderRef      varchar(100)  NULL,
    OtpAttemptCount     tinyint       NOT NULL CONSTRAINT DF_WithdrawalRequest_OtpAttempts DEFAULT (0),
    OtpLastSentAt       datetimeoffset(3) NULL,
    OtpResendCount      tinyint       NOT NULL CONSTRAINT DF_WithdrawalRequest_OtpResends DEFAULT (0),
    ResendAvailableAt   datetimeoffset(3) NULL,           -- end of the resend cooldown (AC6)
    RequestedAt         datetimeoffset(3) NOT NULL CONSTRAINT DF_WithdrawalRequest_RequestedAt DEFAULT (SYSUTCDATETIME()),
    ExpiresAt           datetimeoffset(3) NOT NULL,
    ConfirmedAt         datetimeoffset(3) NULL,
    CONSTRAINT PK_WithdrawalRequest PRIMARY KEY (WithdrawalRequestId),
    CONSTRAINT UQ_WithdrawalRequest_PublicId UNIQUE (PublicId),
    CONSTRAINT FK_WithdrawalRequest_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_WithdrawalRequest_Reason FOREIGN KEY (ReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId),
    CONSTRAINT CK_WithdrawalRequest_Status CHECK (StatusCode IN ('PENDING_CONFIRMATION','CONFIRMED','EXPIRED','CANCELLED')),
    CONSTRAINT CK_WithdrawalRequest_Confirmed CHECK ((StatusCode = 'CONFIRMED' AND ConfirmedAt IS NOT NULL) OR (StatusCode <> 'CONFIRMED' AND ConfirmedAt IS NULL))
);
CREATE INDEX IX_WithdrawalRequest_Application ON app.WithdrawalRequest (ApplicationId, RequestedAt DESC);

-- US-1.2.5 / US-2.5.1 / US-2.5.2: candidate request to reinstate a WITHDRAWN application; the supervisor decides.
-- The candidate gives a justification only. Approval restores the statuses from before the withdrawal
-- (app.ApplicationStatusHistory, ver.VerificationEvent, pfo.PortfolioStatusHistory).
CREATE TABLE app.ReinstatementRequest (
    ReinstatementRequestId bigint     IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_ReinstatementRequest_PublicId DEFAULT (NEWSEQUENTIALID()),
    ApplicationId       bigint        NOT NULL,
    Justification       nvarchar(1000) NOT NULL,
    StatusCode          varchar(15)   NOT NULL CONSTRAINT DF_ReinstatementRequest_Status DEFAULT ('SUBMITTED'),
    RequestedAt         datetimeoffset(3) NOT NULL CONSTRAINT DF_ReinstatementRequest_RequestedAt DEFAULT (SYSUTCDATETIME()),
    DecidedByStaffUserId int          NULL,
    DecidedAt           datetimeoffset(3) NULL,
    DecisionReasonCodeId int          NULL,               -- lookup REINSTATEMENT_REJECTION_REASON; required on rejection (list still open, OQ-04)
    DecisionNote        nvarchar(500) NULL,               -- mandatory supervisor note on any decision
    CONSTRAINT PK_ReinstatementRequest PRIMARY KEY (ReinstatementRequestId),
    CONSTRAINT UQ_ReinstatementRequest_PublicId UNIQUE (PublicId),
    CONSTRAINT FK_ReinstatementRequest_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_ReinstatementRequest_DecidedBy FOREIGN KEY (DecidedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT FK_ReinstatementRequest_DecisionReason FOREIGN KEY (DecisionReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId),
    CONSTRAINT CK_ReinstatementRequest_Status CHECK (StatusCode IN ('SUBMITTED','APPROVED','REJECTED')),
    CONSTRAINT CK_ReinstatementRequest_Decision CHECK ((StatusCode = 'SUBMITTED' AND DecidedAt IS NULL AND DecidedByStaffUserId IS NULL AND DecisionNote IS NULL)
                                                    OR (StatusCode <> 'SUBMITTED' AND DecidedAt IS NOT NULL AND DecidedByStaffUserId IS NOT NULL AND DecisionNote IS NOT NULL)),
    CONSTRAINT CK_ReinstatementRequest_RejectReason CHECK (StatusCode <> 'REJECTED' OR DecisionReasonCodeId IS NOT NULL)
);
CREATE UNIQUE INDEX UX_ReinstatementRequest_OnePending ON app.ReinstatementRequest (ApplicationId) WHERE StatusCode = 'SUBMITTED';
CREATE INDEX IX_ReinstatementRequest_Queue ON app.ReinstatementRequest (StatusCode, RequestedAt);

-- STP-2.5 rules 5-6: exceptional direct reinstatement of a SCREENED_OUT application by a supervisor (no candidate request).
-- It restores the statuses held before the screen-out; there is no REINSTATED status.
CREATE TABLE app.ScreenOutReinstatement (
    ScreenOutReinstatementId bigint   IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_ScreenOutReinstatement_PublicId DEFAULT (NEWSEQUENTIALID()),
    ApplicationId       bigint        NOT NULL,
    Justification       nvarchar(500) NOT NULL,
    RestoredApplicationStatusCode varchar(40) NOT NULL,
    RestoredVerificationStatusCode varchar(40) NULL,
    RestoredPortfolioStatusCode varchar(40) NULL,
    ReinstatedByStaffUserId int       NOT NULL,
    ReinstatedAt        datetimeoffset(3) NOT NULL CONSTRAINT DF_ScreenOutReinstatement_ReinstatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_ScreenOutReinstatement PRIMARY KEY (ScreenOutReinstatementId),
    CONSTRAINT UQ_ScreenOutReinstatement_PublicId UNIQUE (PublicId),
    CONSTRAINT FK_ScreenOutReinstatement_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_ScreenOutReinstatement_ApplicationStatus FOREIGN KEY (RestoredApplicationStatusCode) REFERENCES cfg.ApplicationStatus (StatusCode),
    CONSTRAINT FK_ScreenOutReinstatement_VerificationStatus FOREIGN KEY (RestoredVerificationStatusCode) REFERENCES cfg.VerificationStatus (StatusCode),
    CONSTRAINT FK_ScreenOutReinstatement_PortfolioStatus FOREIGN KEY (RestoredPortfolioStatusCode) REFERENCES cfg.PortfolioStatus (StatusCode),
    CONSTRAINT FK_ScreenOutReinstatement_Staff FOREIGN KEY (ReinstatedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT CK_ScreenOutReinstatement_Justification CHECK (LEN(Justification) >= 3),
    CONSTRAINT CK_ScreenOutReinstatement_Restored CHECK (RestoredApplicationStatusCode <> 'SCREENED_OUT')
);
CREATE INDEX IX_ScreenOutReinstatement_Application ON app.ScreenOutReinstatement (ApplicationId, ReinstatedAt);
GO

-- US-1.3.3 AC11: OTP check of a changed contact e-mail or mobile. Only a hash of the value is kept; OTP codes are never
-- stored (the OTP provider holds them; if a code ever had to be kept here it would be a hash only).
CREATE TABLE app.ContactVerification (
    ContactVerificationId bigint      IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_ContactVerification_PublicId DEFAULT (NEWSEQUENTIALID()),   -- the API verificationId
    CandidateId         bigint        NOT NULL,
    ApplicationId       bigint        NULL,               -- application being edited when the check started, if any
    ChannelCode         varchar(10)   NOT NULL,
    ValueHash           binary(32)    NOT NULL,           -- SHA-256 of the normalised e-mail or mobile being verified; never the raw value
    OtpProviderRef      varchar(100)  NULL,
    ExpiresAt           datetimeoffset(3) NOT NULL,       -- the issued code stops being accepted
    ResendAvailableAt   datetimeoffset(3) NOT NULL,       -- end of the resend cooldown
    ResendCount         tinyint       NOT NULL CONSTRAINT DF_ContactVerification_ResendCount DEFAULT (0),
    AttemptCount        tinyint       NOT NULL CONSTRAINT DF_ContactVerification_AttemptCount DEFAULT (0),
    VerifiedAt          datetimeoffset(3) NULL,
    ValidUntil          datetimeoffset(3) NULL,           -- the profile must be saved with the verified value before this time
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_ContactVerification_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_ContactVerification PRIMARY KEY (ContactVerificationId),
    CONSTRAINT UQ_ContactVerification_PublicId UNIQUE (PublicId),
    CONSTRAINT FK_ContactVerification_Candidate FOREIGN KEY (CandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT FK_ContactVerification_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT CK_ContactVerification_Channel CHECK (ChannelCode IN ('EMAIL','SMS')),
    CONSTRAINT CK_ContactVerification_Verified CHECK ((VerifiedAt IS NULL AND ValidUntil IS NULL) OR (VerifiedAt IS NOT NULL AND ValidUntil IS NOT NULL))
);
CREATE INDEX IX_ContactVerification_Candidate ON app.ContactVerification (CandidateId, ChannelCode, CreatedAt DESC);
GO
