/*==============================================================================
  03_Identity.sql : candidates, personal profile, staff, roles, integration clients,
                    duplicate accounts, ICP refresh and candidate change history
  Credentials, passwords and OTP verification are owned by IDAM / UAE Pass and
  are never stored here. A user record is matched to IDAM by the IDAM immutable
  user identifier (IdamUserId) held on the record itself (standard s.15).
  Candidates and staff are separate records (D-04); a person who is both is linked
  by UUID (StaffUser.LinkedCandidatePublicId, D-14).
  Columns marked PII hold personal data and are candidates for masking/encryption.
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

-- Candidate number: 9-digit text from 000000001 (D-05, D-13). The sequence is the single source; it never cycles.
CREATE SEQUENCE idn.CandidateNumberSeq AS int START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 999999999 NO CYCLE CACHE 50;
GO

CREATE TABLE idn.Candidate (
    CandidateId         bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_Candidate_PublicId DEFAULT (NEWSEQUENTIALID()),
    CandidateNumber     char(9)       NOT NULL CONSTRAINT DF_Candidate_Number DEFAULT (RIGHT('000000000' + CONVERT(varchar(9), NEXT VALUE FOR idn.CandidateNumberSeq), 9)),   -- text, leading zeros kept
    IdamUserId          varchar(200)  NOT NULL,           -- IDAM immutable user identifier; the only match key at sign-in
    DisplayName         nvarchar(200) NOT NULL,           -- PII
    Email               nvarchar(320) NULL,               -- PII; IDAM-registered e-mail (BRD "Registered Email"), refreshed from IDAM at sign-in
    MobileNumber        varchar(25)   NULL,               -- PII; IDAM-registered mobile (BRD "Registered Mobile Number"), refreshed from IDAM at sign-in; stored as +<digits>
    PreferredCulture    varchar(10)   NULL,               -- ar-AE or en-AE
    PreferredTimeZoneId varchar(64)   NULL,               -- IANA zone used to display times; null = Asia/Dubai
    EmiratesIdNumber    varchar(20)   NULL,               -- PII; from IDAM, digits only; never logged or audited
    PassportNumber      varchar(20)   NULL,               -- PII; from IDAM, letters and digits, upper case; never logged or audited
    IcpPersonRef        varchar(100)  NULL,               -- reference into ICP
    IsActive            bit           NOT NULL CONSTRAINT DF_Candidate_IsActive DEFAULT (1),
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_Candidate_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt           datetimeoffset(3) NULL,
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_Candidate PRIMARY KEY (CandidateId),
    CONSTRAINT UQ_Candidate_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_Candidate_Number UNIQUE (CandidateNumber),
    CONSTRAINT UQ_Candidate_IdamUserId UNIQUE (IdamUserId),
    CONSTRAINT CK_Candidate_Number CHECK (CandidateNumber LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
    CONSTRAINT CK_Candidate_Culture CHECK (PreferredCulture IS NULL OR PreferredCulture IN ('ar-AE','en-AE'))
);
-- Duplicate detection (US-1.1.1 AC4-AC6) runs at sign-in on the normalised values (D-25: not hashed). The indexes are
-- deliberately NOT unique: a duplicate account must still be insertable so the pair can be recorded in
-- idn.DuplicateAccountPair and reported to the supervisor.
CREATE INDEX IX_Candidate_EmiratesIdNumber ON idn.Candidate (EmiratesIdNumber) WHERE EmiratesIdNumber IS NOT NULL;
CREATE INDEX IX_Candidate_PassportNumber ON idn.Candidate (PassportNumber) WHERE PassportNumber IS NOT NULL;
CREATE INDEX IX_Candidate_MobileNumber ON idn.Candidate (MobileNumber) WHERE MobileNumber IS NOT NULL;
GO

-- D-10: personal information (BRD US-1.3.3 data dictionary) is held once per candidate, not per application.
-- Each submitted application keeps its own copy in app.ApplicationPersonalSnapshot (D-15).
-- Columns are nullable because the profile is completed progressively; mandatory rules are checked on submission.
CREATE TABLE idn.CandidatePersonalProfile (
    CandidateId         bigint        NOT NULL,
    -- identity
    EnglishFirstName    nvarchar(100) NULL,               -- PII
    EnglishMiddleName   nvarchar(200) NULL,               -- PII; from ICP the second to fourth names, space separated
    EnglishLastName     nvarchar(100) NULL,               -- PII
    ArabicFirstName     nvarchar(100) NULL,               -- PII
    ArabicMiddleName    nvarchar(200) NULL,               -- PII
    ArabicLastName      nvarchar(100) NULL,               -- PII
    DateOfBirth         date          NULL,               -- PII
    GenderCode          varchar(10)   NULL,
    MaritalStatusCode   varchar(10)   NULL,
    NationalityCountryId int          NULL,               -- PII
    IsChildOfUaeNationalMother bit    NULL,               -- asked when nationality is not UAE
    HasMarsoom          bit           NULL,               -- asked when nationality is not UAE
    ResidenceCountryId  int           NULL,               -- PII
    UaeResidenceCityCode varchar(20)  NULL,               -- emirate, when the country of residence is the UAE
    BirthCountryId      int           NULL,               -- PII
    HasEmiratesId       bit           NULL,
    EmiratesIdNumber    varchar(20)   NULL,               -- PII
    EmiratesIdExpiryDate date         NULL,               -- PII
    VisaUnifiedNumber   varchar(20)   NULL,               -- PII
    VisaFileNumber      varchar(30)   NULL,               -- PII
    VisaPlaceOfIssueCode varchar(30)  NULL,
    VisaExpiryDate      date          NULL,               -- PII
    PassportNumber      varchar(20)   NULL,               -- PII
    PassportIssuingCountryId int      NULL,               -- PII
    PassportIssueCityCode varchar(20) NULL,               -- emirate, when the passport was issued in the UAE
    PassportIssueCityOther nvarchar(100) NULL,            -- free text, when issued outside the UAE
    PassportIssueDate   date          NULL,               -- PII
    PassportExpiryDate  date          NULL,               -- PII
    FamilyBookCityNumber varchar(20)  NULL,               -- PII; UAE nationals
    FamilyId            varchar(30)   NULL,               -- PII; UAE nationals (ICP khulasitQaidNo)
    PassportUnifiedNumber varchar(30) NULL,               -- PII; UAE nationals
    -- contact (OTP-verified when changed, see app.ContactVerification)
    ContactEmail        nvarchar(320) NULL,               -- PII; defaults to the IDAM-registered e-mail
    ContactMobileNumber varchar(25)   NULL,               -- PII; defaults to the IDAM-registered mobile
    -- next of kin
    NextOfKinFirstName  nvarchar(100) NULL,               -- PII
    NextOfKinMiddleName nvarchar(200) NULL,               -- PII
    NextOfKinSurname    nvarchar(100) NULL,               -- PII
    NextOfKinRelationshipCode varchar(30) NULL,
    NextOfKinPhone      varchar(25)   NULL,               -- PII
    NextOfKinEmail      nvarchar(320) NULL,               -- PII
    NextOfKinAreaOfResidence nvarchar(200) NULL,          -- PII
    -- ICP provenance
    IcpSourcedFieldsJson json         NULL,               -- field codes whose current value came from ICP (shown highlighted / read-only)
    IcpRetrievedAt      datetimeoffset(3) NULL,
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_CandidatePersonalProfile_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt           datetimeoffset(3) NULL,
    RowVersion          rowversion    NOT NULL,           -- copied into the submission snapshot; also detects a stale ICP preview
    CONSTRAINT PK_CandidatePersonalProfile PRIMARY KEY (CandidateId),
    CONSTRAINT FK_CandidatePersonalProfile_Candidate FOREIGN KEY (CandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT FK_CandidatePersonalProfile_Nationality FOREIGN KEY (NationalityCountryId) REFERENCES cfg.Country (CountryId),
    CONSTRAINT FK_CandidatePersonalProfile_Residence FOREIGN KEY (ResidenceCountryId) REFERENCES cfg.Country (CountryId),
    CONSTRAINT FK_CandidatePersonalProfile_BirthCountry FOREIGN KEY (BirthCountryId) REFERENCES cfg.Country (CountryId),
    CONSTRAINT FK_CandidatePersonalProfile_PassportCountry FOREIGN KEY (PassportIssuingCountryId) REFERENCES cfg.Country (CountryId),
    CONSTRAINT CK_CandidatePersonalProfile_Gender CHECK (GenderCode IS NULL OR GenderCode IN ('MALE','FEMALE')),
    CONSTRAINT CK_CandidatePersonalProfile_MaritalStatus CHECK (MaritalStatusCode IS NULL OR MaritalStatusCode IN ('SINGLE','MARRIED','DIVORCED','WIDOWED'))
);
GO

-- US-1.1.1 AC5-AC6: a sign-in whose mobile, Emirates ID or passport matches an existing candidate is recorded here
-- for the supervisor report. The matched values are never stored, only which attributes matched.
CREATE TABLE idn.DuplicateAccountPair (
    PairId              bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_DuplicateAccountPair_PublicId DEFAULT (NEWSEQUENTIALID()),
    OriginalCandidateId bigint        NOT NULL,
    DuplicateCandidateId bigint       NOT NULL,
    MatchedOnEmiratesId bit           NOT NULL CONSTRAINT DF_DuplicateAccountPair_EmiratesId DEFAULT (0),
    MatchedOnPassport   bit           NOT NULL CONSTRAINT DF_DuplicateAccountPair_Passport DEFAULT (0),
    MatchedOnMobile     bit           NOT NULL CONSTRAINT DF_DuplicateAccountPair_Mobile DEFAULT (0),
    DetectedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_DuplicateAccountPair_DetectedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_DuplicateAccountPair PRIMARY KEY (PairId),
    CONSTRAINT UQ_DuplicateAccountPair_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_DuplicateAccountPair UNIQUE (OriginalCandidateId, DuplicateCandidateId),
    CONSTRAINT FK_DuplicateAccountPair_Original FOREIGN KEY (OriginalCandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT FK_DuplicateAccountPair_Duplicate FOREIGN KEY (DuplicateCandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT CK_DuplicateAccountPair_Matched CHECK (MatchedOnEmiratesId = 1 OR MatchedOnPassport = 1 OR MatchedOnMobile = 1),
    CONSTRAINT CK_DuplicateAccountPair_Distinct CHECK (OriginalCandidateId <> DuplicateCandidateId)
);
CREATE INDEX IX_DuplicateAccountPair_DetectedAt ON idn.DuplicateAccountPair (DetectedAt DESC);
GO

CREATE TABLE idn.AccessRole (
    RoleCode            varchar(40)   NOT NULL,
    DisplayName         nvarchar(100) NOT NULL,
    IsStaffRole         bit           NOT NULL CONSTRAINT DF_AccessRole_IsStaffRole DEFAULT (1),
    CONSTRAINT PK_AccessRole PRIMARY KEY (RoleCode)
);

CREATE TABLE idn.StaffUser (
    StaffUserId         int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_StaffUser_PublicId DEFAULT (NEWSEQUENTIALID()),
    IdamUserId          varchar(200)  NULL,               -- IDAM immutable user identifier; null while pre-registered and not yet signed in
    DisplayName         nvarchar(200) NOT NULL,
    Email               nvarchar(320) NOT NULL,           -- PII
    ActiveRoleCode      varchar(40)   NULL,               -- role chosen in the role switcher (US-2.1.1 AC5); must be one of the user's current assignments
    LinkedCandidatePublicId uniqueidentifier NULL,        -- the same person's candidate record (D-14); stops staff acting on their own applications
    PreferredCulture    varchar(10)   NULL,               -- ar-AE or en-AE
    PreferredTimeZoneId varchar(64)   NULL,               -- IANA zone used to display times; null = Asia/Dubai
    IsActive            bit           NOT NULL CONSTRAINT DF_StaffUser_IsActive DEFAULT (1),
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_StaffUser_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt           datetimeoffset(3) NULL,
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_StaffUser PRIMARY KEY (StaffUserId),
    CONSTRAINT UQ_StaffUser_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_StaffUser_Email UNIQUE (Email),
    CONSTRAINT FK_StaffUser_ActiveRole FOREIGN KEY (ActiveRoleCode) REFERENCES idn.AccessRole (RoleCode),
    CONSTRAINT FK_StaffUser_LinkedCandidate FOREIGN KEY (LinkedCandidatePublicId) REFERENCES idn.Candidate (PublicId),
    CONSTRAINT CK_StaffUser_Culture CHECK (PreferredCulture IS NULL OR PreferredCulture IN ('ar-AE','en-AE'))
);
CREATE UNIQUE INDEX UX_StaffUser_IdamUserId ON idn.StaffUser (IdamUserId) WHERE IdamUserId IS NOT NULL;
CREATE UNIQUE INDEX UX_StaffUser_LinkedCandidate ON idn.StaffUser (LinkedCandidatePublicId) WHERE LinkedCandidatePublicId IS NOT NULL;

-- Role plus data scope. Null ProgramId / ProgramSpecialtyId means "all" (e.g. a supervisor across every pool).
CREATE TABLE idn.StaffRoleAssignment (
    StaffRoleAssignmentId int         IDENTITY(1,1) NOT NULL,
    StaffUserId         int           NOT NULL,
    RoleCode            varchar(40)   NOT NULL,
    ProgramId           int           NULL,
    ProgramSpecialtyId  int           NULL,
    ValidFrom           date          NOT NULL CONSTRAINT DF_StaffRoleAssignment_ValidFrom DEFAULT (CONVERT(date, SYSUTCDATETIME())),
    ValidTo             date          NULL,
    CONSTRAINT PK_StaffRoleAssignment PRIMARY KEY (StaffRoleAssignmentId),
    CONSTRAINT FK_StaffRoleAssignment_User FOREIGN KEY (StaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT FK_StaffRoleAssignment_AccessRole FOREIGN KEY (RoleCode) REFERENCES idn.AccessRole (RoleCode),
    CONSTRAINT FK_StaffRoleAssignment_Program FOREIGN KEY (ProgramId) REFERENCES cfg.Program (ProgramId),
    CONSTRAINT FK_StaffRoleAssignment_ProgramSpecialty FOREIGN KEY (ProgramSpecialtyId) REFERENCES cfg.ProgramSpecialty (ProgramSpecialtyId),
    CONSTRAINT CK_StaffRoleAssignment_Dates CHECK (ValidTo IS NULL OR ValidTo >= ValidFrom)
);
CREATE INDEX IX_StaffRoleAssignment_User ON idn.StaffRoleAssignment (StaffUserId, RoleCode) INCLUDE (ProgramId, ProgramSpecialtyId, ValidFrom, ValidTo);
GO

-- Which staff work which pools: source of the Target Officer / Target Referee lists and of referee eligibility.
CREATE TABLE idn.StaffWorkPool (
    StaffUserId         int           NOT NULL,
    WorkPoolId          int           NOT NULL,
    ValidFrom           date          NOT NULL CONSTRAINT DF_StaffWorkPool_ValidFrom DEFAULT (CONVERT(date, SYSUTCDATETIME())),
    ValidTo             date          NULL,
    CONSTRAINT PK_StaffWorkPool PRIMARY KEY (StaffUserId, WorkPoolId, ValidFrom),
    CONSTRAINT FK_StaffWorkPool_StaffUser FOREIGN KEY (StaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT FK_StaffWorkPool_WorkPool FOREIGN KEY (WorkPoolId) REFERENCES cfg.WorkPool (WorkPoolId),
    CONSTRAINT CK_StaffWorkPool_Dates CHECK (ValidTo IS NULL OR ValidTo >= ValidFrom)
);
CREATE INDEX IX_StaffWorkPool_Pool ON idn.StaffWorkPool (WorkPoolId) INCLUDE (StaffUserId, ValidFrom, ValidTo);
GO

-- Standard s.15: service-to-service callers (for example the payment middleware) authenticate with an IDAM client id.
CREATE TABLE idn.IntegrationClient (
    IntegrationClientId int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_IntegrationClient_PublicId DEFAULT (NEWSEQUENTIALID()),
    IdamClientId        varchar(200)  NOT NULL,
    Name                nvarchar(200) NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_IntegrationClient_IsActive DEFAULT (1),
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_IntegrationClient_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt           datetimeoffset(3) NULL,
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_IntegrationClient PRIMARY KEY (IntegrationClientId),
    CONSTRAINT UQ_IntegrationClient_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_IntegrationClient_IdamClientId UNIQUE (IdamClientId)
);

CREATE TABLE idn.IntegrationClientPermission (
    IntegrationClientId int           NOT NULL,
    PermissionCode      varchar(60)   NOT NULL,           -- e.g. payments.events-write
    CONSTRAINT PK_IntegrationClientPermission PRIMARY KEY (IntegrationClientId, PermissionCode),
    CONSTRAINT FK_IntegrationClientPermission_Client FOREIGN KEY (IntegrationClientId) REFERENCES idn.IntegrationClient (IntegrationClientId)
);
GO

-- US-2.5.3: supervisor previews refreshed ICP data, then applies selected fields from the same preview.
-- The preview token is single-use and bound to candidate, reason and supervisor; only its hash is stored.
CREATE TABLE idn.IcpRefreshRequest (
    IcpRefreshRequestId bigint        IDENTITY(1,1) NOT NULL,
    CandidateId         bigint        NOT NULL,
    RequestedByStaffUserId int        NOT NULL,
    RequestReasonCode   varchar(20)   NOT NULL,
    StatusCode          varchar(20)   NOT NULL CONSTRAINT DF_IcpRefreshRequest_Status DEFAULT ('PREVIEWED'),
    PreviewJson         json          NULL,               -- PII; ICP values of the ICP-sourced fields as previewed; null when nothing differed
    PreviewTokenHash    binary(32)    NULL,               -- SHA-256 of the preview token; null when nothing differed
    SourceRowVersion    binary(8)     NULL,               -- idn.CandidatePersonalProfile.RowVersion at preview; a different value at apply = stale preview
    ExpiresAt           datetimeoffset(3) NOT NULL,
    AppliedFieldCodesJson json        NULL,               -- field codes actually applied
    RequestedAt         datetimeoffset(3) NOT NULL CONSTRAINT DF_IcpRefreshRequest_RequestedAt DEFAULT (SYSUTCDATETIME()),
    AppliedAt           datetimeoffset(3) NULL,
    CONSTRAINT PK_IcpRefreshRequest PRIMARY KEY (IcpRefreshRequestId),
    CONSTRAINT FK_IcpRefreshRequest_Candidate FOREIGN KEY (CandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT FK_IcpRefreshRequest_Staff FOREIGN KEY (RequestedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT CK_IcpRefreshRequest_Reason CHECK (RequestReasonCode IN ('IDENTITY_EXPIRY','DETAILS_CHANGE')),
    CONSTRAINT CK_IcpRefreshRequest_Status CHECK (StatusCode IN ('PREVIEWED','APPLIED','CANCELLED','EXPIRED')),
    CONSTRAINT CK_IcpRefreshRequest_Applied CHECK ((StatusCode = 'APPLIED' AND AppliedAt IS NOT NULL) OR (StatusCode <> 'APPLIED' AND AppliedAt IS NULL))
);
CREATE INDEX IX_IcpRefreshRequest_Candidate ON idn.IcpRefreshRequest (CandidateId, RequestedAt DESC);
CREATE UNIQUE INDEX UX_IcpRefreshRequest_Token ON idn.IcpRefreshRequest (PreviewTokenHash) WHERE PreviewTokenHash IS NOT NULL;
GO

-- D-06: old and new values of candidate data changes (ICP refresh, candidate edits, staff corrections).
-- Kept apart from ops.AuditEvent, which never holds values.
CREATE TABLE idn.CandidateChangeHistory (
    ChangeId            bigint        IDENTITY(1,1) NOT NULL,
    CandidateId         bigint        NOT NULL,
    FieldCode           varchar(80)   NOT NULL,
    OldValue            nvarchar(500) NULL,               -- PII
    NewValue            nvarchar(500) NULL,               -- PII
    SourceCode          varchar(20)   NOT NULL,
    IcpRefreshRequestId bigint        NULL,
    ChangedByCandidateId bigint       NULL,
    ChangedByStaffUserId int          NULL,
    ChangedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_CandidateChangeHistory_ChangedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_CandidateChangeHistory PRIMARY KEY (ChangeId),
    CONSTRAINT FK_CandidateChangeHistory_Candidate FOREIGN KEY (CandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT FK_CandidateChangeHistory_IcpRefresh FOREIGN KEY (IcpRefreshRequestId) REFERENCES idn.IcpRefreshRequest (IcpRefreshRequestId),
    CONSTRAINT FK_CandidateChangeHistory_ChangedByCandidate FOREIGN KEY (ChangedByCandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT FK_CandidateChangeHistory_ChangedByStaff FOREIGN KEY (ChangedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT CK_CandidateChangeHistory_Source CHECK (SourceCode IN ('ICP_REFRESH','CANDIDATE_EDIT','STAFF_CORRECTION')),
    CONSTRAINT CK_CandidateChangeHistory_IcpRefresh CHECK (SourceCode <> 'ICP_REFRESH' OR IcpRefreshRequestId IS NOT NULL),
    CONSTRAINT CK_CandidateChangeHistory_Actor CHECK (ChangedByCandidateId IS NULL OR ChangedByStaffUserId IS NULL)
);
CREATE INDEX IX_CandidateChangeHistory_Candidate ON idn.CandidateChangeHistory (CandidateId, ChangedAt);
GO
