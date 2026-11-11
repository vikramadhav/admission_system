/*==============================================================================
  10_Screening.sql : scores, CASPER import, announcements, bulk screen-out
  CASPER does not gate the initial announcement; it is merged later.
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

CREATE TABLE scr.ApplicationScreening (
    ApplicationId       bigint        NOT NULL,
    WeightSetId         int           NULL,
    GpaScore            decimal(7,2)  NULL,
    EntranceExamScore   decimal(7,2)  NULL,
    PortfolioScore      decimal(7,2)  NULL,
    CasperScore         decimal(7,2)  NULL,
    ShortlistingScore   decimal(7,2)  NULL,
    CasperAttendanceCode varchar(10)  NOT NULL CONSTRAINT DF_ApplicationScreening_CasperAttendance DEFAULT ('NA'),   -- NA until CASPER results are known
    AnnouncementStatusCode varchar(40) NOT NULL,
    CalculatedAt        datetimeoffset(3) NULL,
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_ApplicationScreening PRIMARY KEY (ApplicationId),
    CONSTRAINT FK_ApplicationScreening_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_ApplicationScreening_WeightSet FOREIGN KEY (WeightSetId)     REFERENCES cfg.ScoringWeightSet (ScoringWeightSetId),
        CONSTRAINT FK_ApplicationScreening_Announcement FOREIGN KEY (AnnouncementStatusCode) REFERENCES cfg.AnnouncementStatus (StatusCode),
    CONSTRAINT CK_ApplicationScreening_CasperAttendance CHECK (CasperAttendanceCode IN ('NA','ATTENDED','ABSENT'))
);

CREATE TABLE scr.ApplicationScoreComponent (
    ApplicationScoreComponentId bigint IDENTITY(1,1) NOT NULL,
    ApplicationId       bigint        NOT NULL,
    ComponentCode       varchar(30)   NOT NULL,
    RawValue            decimal(9,4)  NULL,
    WeightedScore       decimal(7,2)  NOT NULL,
    WeightSetId         int           NULL,
    CalculatedAt        datetimeoffset(3) NOT NULL CONSTRAINT DF_ApplicationScoreComponent_At DEFAULT (SYSUTCDATETIME()),
    IsCurrent           bit           NOT NULL CONSTRAINT DF_ApplicationScoreComponent_IsCurrent DEFAULT (1),
    CONSTRAINT PK_ApplicationScoreComponent PRIMARY KEY (ApplicationScoreComponentId),
    CONSTRAINT FK_ApplicationScoreComponent_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_ApplicationScoreComponent_WeightSet FOREIGN KEY (WeightSetId) REFERENCES cfg.ScoringWeightSet (ScoringWeightSetId)
);
CREATE UNIQUE INDEX UX_ApplicationScoreComponent_Current ON scr.ApplicationScoreComponent (ApplicationId, ComponentCode) WHERE IsCurrent = 1;

-- CASPER
CREATE TABLE scr.CasperImport (
    CasperImportId      bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_CasperImport_PublicId DEFAULT (NEWSEQUENTIALID()),
    AdmissionCycleId    int           NOT NULL,
    UploadVersion       int           NOT NULL,
    AttachmentId        bigint        NULL,
    UploadedByStaffUserId int         NOT NULL,
    UploadedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_CasperImport_UploadedAt DEFAULT (SYSUTCDATETIME()),
    RowsReceived        int           NOT NULL CONSTRAINT DF_CasperImport_Rows DEFAULT (0),
    RowsApplied         int           NOT NULL CONSTRAINT DF_CasperImport_Applied DEFAULT (0),
    RowsRejected        int           NOT NULL CONSTRAINT DF_CasperImport_Rejected DEFAULT (0),
    CONSTRAINT PK_CasperImport PRIMARY KEY (CasperImportId),
    CONSTRAINT UQ_CasperImport_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_CasperImport_Version UNIQUE (AdmissionCycleId, UploadVersion),
    CONSTRAINT FK_CasperImport_Cycle FOREIGN KEY (AdmissionCycleId) REFERENCES cfg.AdmissionCycle (CycleId),
    CONSTRAINT FK_CasperImport_Attachment FOREIGN KEY (AttachmentId) REFERENCES doc.Attachment (AttachmentId),
    CONSTRAINT FK_CasperImport_Staff FOREIGN KEY (UploadedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId)
);

CREATE TABLE scr.CasperImportRow (
    CasperImportRowId   bigint        IDENTITY(1,1) NOT NULL,
    CasperImportId      bigint        NOT NULL,
    RowNumber           int           NOT NULL,
    RawRowJson          json          NOT NULL,           -- as received
    ApplicationNumberRaw nvarchar(50) NULL,               -- Application ID cell read as text, exactly as received
    ApplicationNumber   char(11)      NULL,               -- digits of the raw value when they form a valid application number (D-19); the match key
    OutcomeCode         varchar(20)   NOT NULL,
    ExceptionReason     nvarchar(500) NULL,
    CONSTRAINT PK_CasperImportRow PRIMARY KEY (CasperImportRowId),
    CONSTRAINT UQ_CasperImportRow UNIQUE (CasperImportId, RowNumber),
    CONSTRAINT FK_CasperImportRow_Import FOREIGN KEY (CasperImportId) REFERENCES scr.CasperImport (CasperImportId),
    CONSTRAINT CK_CasperImportRow_Outcome CHECK (OutcomeCode IN ('APPLIED','REJECTED','EXCEPTION'))
);

CREATE INDEX IX_CasperImportRow_ApplicationNumber ON scr.CasperImportRow (ApplicationNumber) WHERE ApplicationNumber IS NOT NULL;

CREATE TABLE scr.CasperResult (
    CasperResultId      bigint        IDENTITY(1,1) NOT NULL,
    ApplicationId       bigint        NOT NULL,
    CasperImportRowId   bigint        NOT NULL,
    Score               decimal(7,2)  NOT NULL,
    IsCurrent           bit           NOT NULL CONSTRAINT DF_CasperResult_IsCurrent DEFAULT (1),
    CONSTRAINT PK_CasperResult PRIMARY KEY (CasperResultId),
    CONSTRAINT FK_CasperResult_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_CasperResult_Row FOREIGN KEY (CasperImportRowId) REFERENCES scr.CasperImportRow (CasperImportRowId)
);
CREATE UNIQUE INDEX UX_CasperResult_Current ON scr.CasperResult (ApplicationId) WHERE IsCurrent = 1;

-- Announcements
CREATE TABLE scr.ScoreAnnouncement (
    ScoreAnnouncementId bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_ScoreAnnouncement_PublicId DEFAULT (NEWSEQUENTIALID()),
    AdmissionCycleId    int           NOT NULL,
    AnnouncementType    varchar(20)   NOT NULL,
    IdempotencyKey      varchar(128)  NOT NULL,
    AnnouncedByStaffUserId int        NOT NULL,
    AnnouncedAt         datetimeoffset(3) NOT NULL CONSTRAINT DF_ScoreAnnouncement_AnnouncedAt DEFAULT (SYSUTCDATETIME()),
    AppealWindowEndsAt  datetimeoffset(3) NULL,           -- window starts at announcement
    TimeZoneId          varchar(64)   NOT NULL CONSTRAINT DF_ScoreAnnouncement_TimeZoneId DEFAULT ('Asia/Dubai'),   -- IANA zone the appeal window is defined in (D-07)
    CONSTRAINT PK_ScoreAnnouncement PRIMARY KEY (ScoreAnnouncementId),
    CONSTRAINT UQ_ScoreAnnouncement_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_ScoreAnnouncement_Idempotency UNIQUE (IdempotencyKey),
    CONSTRAINT FK_ScoreAnnouncement_Cycle FOREIGN KEY (AdmissionCycleId) REFERENCES cfg.AdmissionCycle (CycleId),
    CONSTRAINT FK_ScoreAnnouncement_Staff FOREIGN KEY (AnnouncedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT CK_ScoreAnnouncement_Type CHECK (AnnouncementType IN ('INITIAL','REANNOUNCEMENT'))
);

CREATE TABLE scr.ScoreAnnouncementItem (
    ScoreAnnouncementId bigint        NOT NULL,
    ApplicationId       bigint        NOT NULL,
    PublishedScore      decimal(7,2)  NOT NULL,           -- snapshot of what the candidate saw
    PublishedComponentsJson json      NULL,
    CONSTRAINT PK_ScoreAnnouncementItem PRIMARY KEY (ScoreAnnouncementId, ApplicationId),
    CONSTRAINT FK_ScoreAnnouncementItem_Announcement FOREIGN KEY (ScoreAnnouncementId) REFERENCES scr.ScoreAnnouncement (ScoreAnnouncementId),
    CONSTRAINT FK_ScoreAnnouncementItem_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId)
);
CREATE INDEX IX_ScoreAnnouncementItem_Application ON scr.ScoreAnnouncementItem (ApplicationId);

-- Bulk screen-out
CREATE TABLE scr.BulkScreenOut (
    BulkScreenOutId     bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_BulkScreenOut_PublicId DEFAULT (NEWSEQUENTIALID()),
    AdmissionCycleId    int           NOT NULL,
    ReasonCodeId        int           NOT NULL,
    CriteriaJson        json          NULL,
    ExecutedByStaffUserId int         NOT NULL,
    ExecutedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_BulkScreenOut_ExecutedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_BulkScreenOut PRIMARY KEY (BulkScreenOutId),
    CONSTRAINT UQ_BulkScreenOut_PublicId UNIQUE (PublicId),
    CONSTRAINT     FK_BulkScreenOut_Cycle FOREIGN KEY (AdmissionCycleId) REFERENCES cfg.AdmissionCycle (CycleId),
        CONSTRAINT FK_BulkScreenOut_Reason FOREIGN KEY (ReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId),
    CONSTRAINT FK_BulkScreenOut_Staff FOREIGN KEY (ExecutedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId)
);

CREATE TABLE scr.BulkScreenOutItem (
    BulkScreenOutId     bigint        NOT NULL,
    ApplicationId       bigint        NOT NULL,
    CONSTRAINT PK_BulkScreenOutItem PRIMARY KEY (BulkScreenOutId, ApplicationId),
    CONSTRAINT FK_BulkScreenOutItem_Bulk FOREIGN KEY (BulkScreenOutId) REFERENCES scr.BulkScreenOut (BulkScreenOutId),
    CONSTRAINT FK_BulkScreenOutItem_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId)
);
GO
