/*==============================================================================
  08_Verification.sql : application verification, corrections, screen-out
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

CREATE TABLE ver.VerificationCase (
    VerificationCaseId  bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_VerificationCase_PublicId DEFAULT (NEWSEQUENTIALID()),
    ApplicationId       bigint        NOT NULL,
    StatusCode          varchar(40)   NOT NULL,
    OpenedAt            datetimeoffset(3) NOT NULL CONSTRAINT DF_VerificationCase_OpenedAt DEFAULT (SYSUTCDATETIME()),
    CompletedAt         datetimeoffset(3) NULL,
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_VerificationCase PRIMARY KEY (VerificationCaseId),
    CONSTRAINT UQ_VerificationCase_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_VerificationCase_Application UNIQUE (ApplicationId),
    CONSTRAINT FK_VerificationCase_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_VerificationCase_Status FOREIGN KEY (StatusCode) REFERENCES cfg.VerificationStatus (StatusCode)
);
CREATE INDEX IX_VerificationCase_Status ON ver.VerificationCase (StatusCode, OpenedAt);

-- Officer ownership history. Dashboards (US-2.1.x) and overdue handling (US-2.2.x) read RetrievedAt / DueAt / EndReasonCode.
CREATE TABLE ver.VerificationAssignment (
    VerificationAssignmentId bigint   IDENTITY(1,1) NOT NULL,
    VerificationCaseId  bigint        NOT NULL,
    WorkPoolId          int           NOT NULL,           -- pool the case was taken from
    StaffUserId         int           NOT NULL,
    AssignedByStaffUserId int         NULL,               -- supervisor for a reassignment; null when the officer retrieved it
    AssignedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_VerificationAssignment_AssignedAt DEFAULT (SYSUTCDATETIME()),
    RetrievedAt         datetimeoffset(3) NULL,           -- set when the officer retrieved the case from the pool
    DueAt               datetimeoffset(3) NULL,           -- working-day due time; past it the case is auto-returned to the pool
    EndedAt             datetimeoffset(3) NULL,
    EndReasonCode       varchar(20)   NULL,
    Justification       nvarchar(200) NULL,               -- supervisor reason for a reassignment or return to pool
    IsCurrent           bit           NOT NULL CONSTRAINT DF_VerificationAssignment_IsCurrent DEFAULT (1),
    CONSTRAINT PK_VerificationAssignment PRIMARY KEY (VerificationAssignmentId),
    CONSTRAINT FK_VerificationAssignment_Case FOREIGN KEY (VerificationCaseId) REFERENCES ver.VerificationCase (VerificationCaseId),
    CONSTRAINT FK_VerificationAssignment_WorkPool FOREIGN KEY (WorkPoolId) REFERENCES cfg.WorkPool (WorkPoolId),
    CONSTRAINT FK_VerificationAssignment_Staff FOREIGN KEY (StaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT FK_VerificationAssignment_AssignedBy FOREIGN KEY (AssignedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT CK_VerificationAssignment_EndReason CHECK (EndReasonCode IS NULL OR EndReasonCode IN ('COMPLETED','REASSIGNED','RETURNED_TO_POOL','AUTO_RETURNED','SENT_TO_CANDIDATE','SENT_TO_SUPERVISOR')),
    CONSTRAINT CK_VerificationAssignment_Ended CHECK ((IsCurrent = 1 AND EndedAt IS NULL AND EndReasonCode IS NULL) OR (IsCurrent = 0 AND EndedAt IS NOT NULL AND EndReasonCode IS NOT NULL))
);
CREATE UNIQUE INDEX UX_VerificationAssignment_Current ON ver.VerificationAssignment (VerificationCaseId) WHERE IsCurrent = 1;
CREATE INDEX IX_VerificationAssignment_Staff ON ver.VerificationAssignment (StaffUserId, IsCurrent) INCLUDE (DueAt, RetrievedAt);

CREATE TABLE ver.CorrectionRequest (
    CorrectionRequestId bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_CorrectionRequest_PublicId DEFAULT (NEWSEQUENTIALID()),
    VerificationCaseId  bigint        NOT NULL,
    RequestedByStaffUserId int        NOT NULL,
    RequestedAt         datetimeoffset(3) NOT NULL CONSTRAINT DF_CorrectionRequest_RequestedAt DEFAULT (SYSUTCDATETIME()),
    DueAt               datetimeoffset(3) NULL,           -- correction grace deadline, counted in local working days
    TimeZoneId          varchar(64)   NOT NULL CONSTRAINT DF_CorrectionRequest_TimeZoneId DEFAULT ('Asia/Dubai'),   -- IANA zone DueAt was set in (D-07)
    ResolvedAt          datetimeoffset(3) NULL,
    CONSTRAINT PK_CorrectionRequest PRIMARY KEY (CorrectionRequestId),
    CONSTRAINT UQ_CorrectionRequest_PublicId UNIQUE (PublicId),
    CONSTRAINT FK_CorrectionRequest_Case FOREIGN KEY (VerificationCaseId) REFERENCES ver.VerificationCase (VerificationCaseId),
    CONSTRAINT FK_CorrectionRequest_Staff FOREIGN KEY (RequestedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId)
);

CREATE TABLE ver.CorrectionFlag (
    CorrectionFlagId    bigint        IDENTITY(1,1) NOT NULL,
    VerificationCaseId  bigint        NOT NULL,
    CorrectionRequestId bigint        NULL,               -- null until the case is returned to the candidate
    SectionKey          varchar(50)   NOT NULL,
    FieldPointer        varchar(300)  NOT NULL,           -- JSON pointer into the section values
    ReasonCodeId        int           NOT NULL,
    Comment             nvarchar(1000) NULL,
    FlaggedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_CorrectionFlag_FlaggedAt DEFAULT (SYSUTCDATETIME()),
    ResolvedAt          datetimeoffset(3) NULL,
    CONSTRAINT PK_CorrectionFlag PRIMARY KEY (CorrectionFlagId),
    CONSTRAINT FK_CorrectionFlag_Case FOREIGN KEY (VerificationCaseId) REFERENCES ver.VerificationCase (VerificationCaseId),
    CONSTRAINT FK_CorrectionFlag_Request FOREIGN KEY (CorrectionRequestId) REFERENCES ver.CorrectionRequest (CorrectionRequestId),
    CONSTRAINT FK_CorrectionFlag_Reason FOREIGN KEY (ReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId)
);
CREATE INDEX IX_CorrectionFlag_Case ON ver.CorrectionFlag (VerificationCaseId, CorrectionRequestId);

CREATE TABLE ver.VerificationNote (
    VerificationNoteId  bigint        IDENTITY(1,1) NOT NULL,
    VerificationCaseId  bigint        NOT NULL,
    StaffUserId         int           NOT NULL,
    NoteText            nvarchar(2000) NOT NULL,
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_VerificationNote_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_VerificationNote PRIMARY KEY (VerificationNoteId),
    CONSTRAINT FK_VerificationNote_Case FOREIGN KEY (VerificationCaseId) REFERENCES ver.VerificationCase (VerificationCaseId),
    CONSTRAINT FK_VerificationNote_Staff FOREIGN KEY (StaffUserId) REFERENCES idn.StaffUser (StaffUserId)
);

CREATE TABLE ver.ClarificationRequest (
    ClarificationRequestId bigint     IDENTITY(1,1) NOT NULL,
    VerificationCaseId  bigint        NOT NULL,
    RequestedByStaffUserId int        NOT NULL,
    QuestionText        nvarchar(2000) NOT NULL,
    RequestedAt         datetimeoffset(3) NOT NULL CONSTRAINT DF_ClarificationRequest_RequestedAt DEFAULT (SYSUTCDATETIME()),
    ResponseText        nvarchar(2000) NULL,
    RespondedAt         datetimeoffset(3) NULL,
    CONSTRAINT PK_ClarificationRequest PRIMARY KEY (ClarificationRequestId),
    CONSTRAINT FK_ClarificationRequest_Case FOREIGN KEY (VerificationCaseId) REFERENCES ver.VerificationCase (VerificationCaseId),
    CONSTRAINT FK_ClarificationRequest_Staff FOREIGN KEY (RequestedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId)
);

-- US-2.4.1 / US-2.4.3: officer recommendation and supervisor decision.
CREATE TABLE ver.ScreenOutRecommendation (
    ScreenOutRecommendationId bigint  IDENTITY(1,1) NOT NULL,
    VerificationCaseId  bigint        NOT NULL,
    RecommendedByStaffUserId int      NOT NULL,
    ReasonCodeId        int           NOT NULL,           -- officer's reason (lookup SCREEN_OUT_REASON); kept even if the supervisor changes it
    Justification       nvarchar(500) NULL,               -- officer note; optional for now (mandatory or not is open, OQ-05)
    RecommendedAt       datetimeoffset(3) NOT NULL CONSTRAINT DF_ScreenOutRecommendation_RecommendedAt DEFAULT (SYSUTCDATETIME()),
    DecidedByStaffUserId int          NULL,
    DecisionCode        varchar(20)   NULL,
    DecisionNote        nvarchar(500) NULL,               -- supervisor note; mandatory when rejecting
    EndorsedReasonCodeId int          NULL,               -- reason chosen by the supervisor on endorsement when it differs from the officer's (US-2.4.3 AC2)
    DecidedAt           datetimeoffset(3) NULL,
    CONSTRAINT PK_ScreenOutRecommendation PRIMARY KEY (ScreenOutRecommendationId),
    CONSTRAINT FK_ScreenOutRecommendation_Case FOREIGN KEY (VerificationCaseId) REFERENCES ver.VerificationCase (VerificationCaseId),
    CONSTRAINT FK_ScreenOutRecommendation_Recommender FOREIGN KEY (RecommendedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT FK_ScreenOutRecommendation_Decider FOREIGN KEY (DecidedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT FK_ScreenOutRecommendation_Reason FOREIGN KEY (ReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId),
    CONSTRAINT FK_ScreenOutRecommendation_EndorsedReason FOREIGN KEY (EndorsedReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId),
    CONSTRAINT CK_ScreenOutRecommendation_Decision CHECK (DecisionCode IS NULL OR DecisionCode IN ('ENDORSE_SCREEN_OUT','REJECT_SCREEN_OUT')),
    CONSTRAINT CK_ScreenOutRecommendation_RejectNote CHECK (DecisionCode IS NULL OR DecisionCode <> 'REJECT_SCREEN_OUT' OR DecisionNote IS NOT NULL),
    CONSTRAINT CK_ScreenOutRecommendation_EndorsedReason CHECK (EndorsedReasonCodeId IS NULL OR DecisionCode = 'ENDORSE_SCREEN_OUT'),
    CONSTRAINT CK_ScreenOutRecommendation_Decider CHECK (DecidedByStaffUserId IS NULL OR DecidedByStaffUserId <> RecommendedByStaffUserId),
    CONSTRAINT CK_ScreenOutRecommendation_Consistent CHECK ((DecisionCode IS NULL AND DecidedAt IS NULL AND DecidedByStaffUserId IS NULL) OR (DecisionCode IS NOT NULL AND DecidedAt IS NOT NULL AND DecidedByStaffUserId IS NOT NULL))
);

CREATE TABLE ver.VerificationEvent (
    VerificationEventId bigint        IDENTITY(1,1) NOT NULL,
    VerificationCaseId  bigint        NOT NULL,
    EventType           varchar(50)   NOT NULL,
    FromStatusCode      varchar(40)   NULL,
    ToStatusCode        varchar(40)   NULL,
    StaffUserId         int           NULL,
    OccurredAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_VerificationEvent_OccurredAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_VerificationEvent PRIMARY KEY (VerificationEventId),
    CONSTRAINT FK_VerificationEvent_Case FOREIGN KEY (VerificationCaseId) REFERENCES ver.VerificationCase (VerificationCaseId),
    CONSTRAINT FK_VerificationEvent_Staff FOREIGN KEY (StaffUserId) REFERENCES idn.StaffUser (StaffUserId)
);
CREATE INDEX IX_VerificationEvent_Case ON ver.VerificationEvent (VerificationCaseId, OccurredAt);
GO
