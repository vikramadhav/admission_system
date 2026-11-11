/*==============================================================================
  09_Portfolio.sql : rubric, one-time portfolio, referee rounds, scoring, appeals
  Referees reach candidate data only through the anonymised view in 11_Views.sql.
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

-- Rubric (versioned per program cycle)
CREATE TABLE pfo.RubricVersion (
    RubricVersionId     int           IDENTITY(1,1) NOT NULL,
    ProgramCycleId      int           NOT NULL,
    VersionNo           int           NOT NULL,
    EffectiveFrom       datetimeoffset(3) NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_RubricVersion_IsActive DEFAULT (0),
    CONSTRAINT PK_RubricVersion PRIMARY KEY (RubricVersionId),
    CONSTRAINT UQ_RubricVersion UNIQUE (ProgramCycleId, VersionNo),
    CONSTRAINT FK_RubricVersion_ProgramCycle FOREIGN KEY (ProgramCycleId) REFERENCES cfg.ProgramCycle (ProgramCycleId)
);
CREATE UNIQUE INDEX UX_RubricVersion_Active ON pfo.RubricVersion (ProgramCycleId) WHERE IsActive = 1;

CREATE TABLE pfo.PortfolioQuestion (
    PortfolioQuestionId int           IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_PortfolioQuestion_PublicId DEFAULT (NEWSEQUENTIALID()),   -- the API questionId (e.g. appeal responses)
    RubricVersionId     int           NOT NULL,
    QuestionCode        varchar(50)   NOT NULL,
    SortOrder           int           NOT NULL,
    QuestionText        nvarchar(1000) NOT NULL,
    ScoringType         varchar(20)   NOT NULL,
    DetailsSchemaJson   json          NULL,
    EvidenceSchemaJson  json          NULL,
    MaxScore            decimal(6,2)  NULL,
    CONSTRAINT PK_PortfolioQuestion PRIMARY KEY (PortfolioQuestionId),
    CONSTRAINT UQ_PortfolioQuestion_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_PortfolioQuestion UNIQUE (RubricVersionId, QuestionCode),
    CONSTRAINT FK_PortfolioQuestion_Rubric FOREIGN KEY (RubricVersionId) REFERENCES pfo.RubricVersion (RubricVersionId),
    CONSTRAINT CK_PortfolioQuestion_ScoringType CHECK (ScoringType IN ('ALL_OR_NOTHING','POINTS_SYSTEM'))
);

CREATE TABLE pfo.QuestionClassification (
    QuestionClassificationId int      IDENTITY(1,1) NOT NULL,
    PortfolioQuestionId int           NOT NULL,
    ClassificationCode  varchar(50)   NOT NULL,
    DisplayLabel        nvarchar(200) NOT NULL,
    Points              decimal(6,2)  NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_QuestionClassification_IsActive DEFAULT (1),
    SortOrder           smallint      NOT NULL CONSTRAINT DF_QuestionClassification_SortOrder DEFAULT (0),
    CONSTRAINT PK_QuestionClassification PRIMARY KEY (QuestionClassificationId),
    CONSTRAINT UQ_QuestionClassification UNIQUE (PortfolioQuestionId, ClassificationCode),
    CONSTRAINT FK_QuestionClassification_Question FOREIGN KEY (PortfolioQuestionId) REFERENCES pfo.PortfolioQuestion (PortfolioQuestionId),
    CONSTRAINT CK_QuestionClassification_Points CHECK (Points >= 0)
);

CREATE TABLE pfo.QuestionRejectionReason (
    QuestionRejectionReasonId int     IDENTITY(1,1) NOT NULL,
    PortfolioQuestionId int           NOT NULL,
    ReasonCode          varchar(50)   NOT NULL,
    DisplayLabel        nvarchar(200) NOT NULL,
    CandidateComment    nvarchar(500) NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_QuestionRejectionReason_IsActive DEFAULT (1),
    SortOrder           smallint      NOT NULL CONSTRAINT DF_QuestionRejectionReason_SortOrder DEFAULT (0),
    CONSTRAINT PK_QuestionRejectionReason PRIMARY KEY (QuestionRejectionReasonId),
    CONSTRAINT UQ_QuestionRejectionReason UNIQUE (PortfolioQuestionId, ReasonCode),
    CONSTRAINT FK_QuestionRejectionReason_Question FOREIGN KEY (PortfolioQuestionId) REFERENCES pfo.PortfolioQuestion (PortfolioQuestionId)
);
GO

-- Candidate side
CREATE TABLE pfo.Portfolio (
    PortfolioId         bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_Portfolio_PublicId DEFAULT (NEWSEQUENTIALID()),
    ApplicationId       bigint        NOT NULL,
    RubricVersionId     int           NOT NULL,
    StatusCode          varchar(40)   NOT NULL,
    SubmittedAt         datetimeoffset(3) NULL,           -- once set the portfolio is immutable
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_Portfolio_CreatedAt DEFAULT (SYSUTCDATETIME()),
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_Portfolio PRIMARY KEY (PortfolioId),
    CONSTRAINT UQ_Portfolio_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_Portfolio_Application UNIQUE (ApplicationId),
    CONSTRAINT FK_Portfolio_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_Portfolio_Rubric FOREIGN KEY (RubricVersionId) REFERENCES pfo.RubricVersion (RubricVersionId),
    CONSTRAINT FK_Portfolio_Status FOREIGN KEY (StatusCode) REFERENCES cfg.PortfolioStatus (StatusCode)
);
CREATE INDEX IX_Portfolio_Status ON pfo.Portfolio (StatusCode);

-- Every portfolio status change. ON_HOLD reverts to the previous status on reinstatement, which is read from here.
CREATE TABLE pfo.PortfolioStatusHistory (
    PortfolioStatusHistoryId bigint   IDENTITY(1,1) NOT NULL,
    PortfolioId         bigint        NOT NULL,
    FromStatusCode      varchar(40)   NULL,
    ToStatusCode        varchar(40)   NOT NULL,
    ChangedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_PortfolioStatusHistory_ChangedAt DEFAULT (SYSUTCDATETIME()),
    ChangedByStaffUserId int          NULL,               -- null for system transitions
    Reason              varchar(40)   NULL,               -- e.g. WITHDRAWN, SCREENED_OUT, ARCHIVED, REINSTATED, DISCREPANCY, APPEAL, OVERDUE
    CONSTRAINT PK_PortfolioStatusHistory PRIMARY KEY (PortfolioStatusHistoryId),
    CONSTRAINT FK_PortfolioStatusHistory_Portfolio FOREIGN KEY (PortfolioId) REFERENCES pfo.Portfolio (PortfolioId),
    CONSTRAINT FK_PortfolioStatusHistory_From FOREIGN KEY (FromStatusCode) REFERENCES cfg.PortfolioStatus (StatusCode),
    CONSTRAINT FK_PortfolioStatusHistory_To FOREIGN KEY (ToStatusCode) REFERENCES cfg.PortfolioStatus (StatusCode),
    CONSTRAINT FK_PortfolioStatusHistory_Staff FOREIGN KEY (ChangedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId)
);
CREATE INDEX IX_PortfolioStatusHistory_Portfolio ON pfo.PortfolioStatusHistory (PortfolioId, ChangedAt);

CREATE TABLE pfo.PortfolioAnswer (
    PortfolioAnswerId   bigint        IDENTITY(1,1) NOT NULL,
    PortfolioId         bigint        NOT NULL,
    PortfolioQuestionId int           NOT NULL,
    Answer              char(3)       NOT NULL,
    DetailsJson         json          NULL,
    CONSTRAINT PK_PortfolioAnswer PRIMARY KEY (PortfolioAnswerId),
    CONSTRAINT UQ_PortfolioAnswer UNIQUE (PortfolioId, PortfolioQuestionId),
    CONSTRAINT UQ_PortfolioAnswer_Question UNIQUE (PortfolioAnswerId, PortfolioQuestionId),
    CONSTRAINT FK_PortfolioAnswer_Portfolio FOREIGN KEY (PortfolioId) REFERENCES pfo.Portfolio (PortfolioId),
    CONSTRAINT FK_PortfolioAnswer_Question FOREIGN KEY (PortfolioQuestionId) REFERENCES pfo.PortfolioQuestion (PortfolioQuestionId),
    CONSTRAINT CK_PortfolioAnswer_Answer CHECK (Answer IN ('YES','NO'))
);

CREATE TABLE pfo.PortfolioAnswerEvidence (
    PortfolioAnswerId   bigint        NOT NULL,
    AttachmentId        bigint        NOT NULL,
    SortOrder           int           NOT NULL CONSTRAINT DF_PortfolioAnswerEvidence_Sort DEFAULT (0),
    CONSTRAINT PK_PortfolioAnswerEvidence PRIMARY KEY (PortfolioAnswerId, AttachmentId),
    CONSTRAINT FK_PortfolioAnswerEvidence_Answer FOREIGN KEY (PortfolioAnswerId) REFERENCES pfo.PortfolioAnswer (PortfolioAnswerId),
    CONSTRAINT FK_PortfolioAnswerEvidence_Attachment FOREIGN KEY (AttachmentId) REFERENCES doc.Attachment (AttachmentId)
);
GO

-- Immutability after submission
CREATE TRIGGER pfo.TR_PortfolioAnswer_Immutable ON pfo.PortfolioAnswer AFTER INSERT, UPDATE, DELETE AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM (SELECT PortfolioId FROM inserted UNION SELECT PortfolioId FROM deleted) x
        JOIN pfo.Portfolio p ON p.PortfolioId = x.PortfolioId
        WHERE p.SubmittedAt IS NOT NULL)
        THROW 51010, 'A submitted portfolio is immutable.', 1;
END;
GO

-- Rounds and assignments
CREATE TABLE pfo.PortfolioRound (
    PortfolioRoundId    bigint        IDENTITY(1,1) NOT NULL,
    PortfolioId         bigint        NOT NULL,
    RoundCode           varchar(20)   NOT NULL,
    StatusCode          varchar(40)   NOT NULL CONSTRAINT DF_PortfolioRound_Status DEFAULT ('PENDING'),
    StartedAt           datetimeoffset(3) NULL,
    CompletedAt         datetimeoffset(3) NULL,
    TotalScore          decimal(7,2)  NULL,
    CONSTRAINT PK_PortfolioRound PRIMARY KEY (PortfolioRoundId),
    CONSTRAINT UQ_PortfolioRound UNIQUE (PortfolioId, RoundCode),
    CONSTRAINT FK_PortfolioRound_Portfolio FOREIGN KEY (PortfolioId) REFERENCES pfo.Portfolio (PortfolioId),
    CONSTRAINT CK_PortfolioRound_Code CHECK (RoundCode IN ('ROUND_1','ROUND_2','ROUND_3','SECOND_EVALUATION')),
    CONSTRAINT CK_PortfolioRound_Status CHECK (StatusCode IN ('PENDING','IN_PROGRESS','COMPLETE','ON_HOLD'))
);

CREATE TABLE pfo.RoundAssignment (
    RoundAssignmentId   bigint        IDENTITY(1,1) NOT NULL,
    PortfolioRoundId    bigint        NOT NULL,
    RefereeStaffUserId  int           NOT NULL,
    AssignedByStaffUserId int         NULL,
    AssignedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_RoundAssignment_AssignedAt DEFAULT (SYSUTCDATETIME()),
    RetrievedAt         datetimeoffset(3) NULL,           -- set when the referee retrieved the portfolio from the pool
    DueAt               datetimeoffset(3) NULL,           -- past it the portfolio is auto-returned to the pool
    EndedAt             datetimeoffset(3) NULL,
    EndReasonCode       varchar(20)   NULL,
    IsCurrent           bit           NOT NULL CONSTRAINT DF_RoundAssignment_IsCurrent DEFAULT (1),
    CONSTRAINT PK_RoundAssignment PRIMARY KEY (RoundAssignmentId),
    CONSTRAINT FK_RoundAssignment_Round FOREIGN KEY (PortfolioRoundId) REFERENCES pfo.PortfolioRound (PortfolioRoundId),
    CONSTRAINT FK_RoundAssignment_Referee FOREIGN KEY (RefereeStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT FK_RoundAssignment_AssignedBy FOREIGN KEY (AssignedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT CK_RoundAssignment_EndReason CHECK (EndReasonCode IS NULL OR EndReasonCode IN ('SUBMITTED','REASSIGNED','AUTO_RETURNED','COI_RETURNED','ON_HOLD')),
    CONSTRAINT CK_RoundAssignment_Ended CHECK ((IsCurrent = 1 AND EndedAt IS NULL AND EndReasonCode IS NULL) OR (IsCurrent = 0 AND EndedAt IS NOT NULL AND EndReasonCode IS NOT NULL))
);
CREATE UNIQUE INDEX UX_RoundAssignment_Current ON pfo.RoundAssignment (PortfolioRoundId) WHERE IsCurrent = 1;
CREATE INDEX IX_RoundAssignment_Referee ON pfo.RoundAssignment (RefereeStaffUserId, IsCurrent);

CREATE TABLE pfo.ConflictOfInterest (
    ConflictOfInterestId bigint       IDENTITY(1,1) NOT NULL,
    PortfolioId         bigint        NOT NULL,
    RefereeStaffUserId  int           NOT NULL,
    DeclaredAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_ConflictOfInterest_DeclaredAt DEFAULT (SYSUTCDATETIME()),
    Reason              nvarchar(500) NOT NULL,           -- mandatory free text, max 500 (US-3.3.2)
    CONSTRAINT PK_ConflictOfInterest PRIMARY KEY (ConflictOfInterestId),
    CONSTRAINT UQ_ConflictOfInterest UNIQUE (PortfolioId, RefereeStaffUserId),
    CONSTRAINT FK_ConflictOfInterest_Portfolio FOREIGN KEY (PortfolioId) REFERENCES pfo.Portfolio (PortfolioId),
    CONSTRAINT FK_ConflictOfInterest_Referee FOREIGN KEY (RefereeStaffUserId) REFERENCES idn.StaffUser (StaffUserId)
);
GO

-- One referee per round; never reuse a referee across rounds of a portfolio; never reassign after COI.
CREATE TRIGGER pfo.TR_RoundAssignment_Rules ON pfo.RoundAssignment AFTER INSERT, UPDATE AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN pfo.PortfolioRound r ON r.PortfolioRoundId = i.PortfolioRoundId
        JOIN pfo.PortfolioRound r2 ON r2.PortfolioId = r.PortfolioId AND r2.PortfolioRoundId <> r.PortfolioRoundId
        JOIN pfo.RoundAssignment a ON a.PortfolioRoundId = r2.PortfolioRoundId AND a.RefereeStaffUserId = i.RefereeStaffUserId
        WHERE i.IsCurrent = 1)
        THROW 51011, 'A referee may evaluate only one round of a portfolio.', 1;
    IF EXISTS (
        SELECT 1 FROM inserted i
        JOIN pfo.PortfolioRound r ON r.PortfolioRoundId = i.PortfolioRoundId
        JOIN pfo.ConflictOfInterest c ON c.PortfolioId = r.PortfolioId AND c.RefereeStaffUserId = i.RefereeStaffUserId
        WHERE i.IsCurrent = 1)
        THROW 51012, 'Referee declared a conflict of interest for this portfolio.', 1;
END;
GO

-- Scoring
CREATE TABLE pfo.ScoreItem (
    ScoreItemId         bigint        IDENTITY(1,1) NOT NULL,
    PortfolioRoundId    bigint        NOT NULL,
    PortfolioAnswerId   bigint        NOT NULL,
    Decision            varchar(10)   NOT NULL,
    QuestionClassificationId int      NULL,
    Score               decimal(6,2)  NOT NULL,
    Comment             nvarchar(1000) NULL,
    ScoredAt            datetimeoffset(3) NOT NULL CONSTRAINT DF_ScoreItem_ScoredAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_ScoreItem PRIMARY KEY (ScoreItemId),
    CONSTRAINT UQ_ScoreItem UNIQUE (PortfolioRoundId, PortfolioAnswerId),
    CONSTRAINT FK_ScoreItem_Round FOREIGN KEY (PortfolioRoundId) REFERENCES pfo.PortfolioRound (PortfolioRoundId),
    CONSTRAINT FK_ScoreItem_Answer FOREIGN KEY (PortfolioAnswerId) REFERENCES pfo.PortfolioAnswer (PortfolioAnswerId),
    CONSTRAINT FK_ScoreItem_Classification FOREIGN KEY (QuestionClassificationId) REFERENCES pfo.QuestionClassification (QuestionClassificationId),
    CONSTRAINT CK_ScoreItem_Decision CHECK (Decision IN ('ACCEPT','REJECT')),
    CONSTRAINT CK_ScoreItem_Score CHECK (Score >= 0),
    CONSTRAINT CK_ScoreItem_Reject CHECK (Decision <> 'REJECT' OR Score = 0)
);

CREATE TABLE pfo.ScoreItemRejectionReason (
    ScoreItemId         bigint        NOT NULL,
    QuestionRejectionReasonId int     NOT NULL,
    CONSTRAINT PK_ScoreItemRejectionReason PRIMARY KEY (ScoreItemId, QuestionRejectionReasonId),
    CONSTRAINT FK_ScoreItemRejectionReason_Item FOREIGN KEY (ScoreItemId) REFERENCES pfo.ScoreItem (ScoreItemId),
    CONSTRAINT FK_ScoreItemRejectionReason_Reason FOREIGN KEY (QuestionRejectionReasonId) REFERENCES pfo.QuestionRejectionReason (QuestionRejectionReasonId)
);

-- US-3.2.2: senior-referee override of a completed round total, with a mandatory justification.
-- Whether an override sets the round total or individual question scores is still open (OQ-06); this models the round total.
CREATE TABLE pfo.RoundScoreOverride (
    RoundScoreOverrideId bigint       IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_RoundScoreOverride_PublicId DEFAULT (NEWSEQUENTIALID()),
    PortfolioRoundId    bigint        NOT NULL,
    PreviousTotalScore  decimal(7,2)  NOT NULL,
    NewTotalScore       decimal(7,2)  NOT NULL,
    Justification       nvarchar(200) NOT NULL,
    OverriddenByStaffUserId int       NOT NULL,
    OverriddenAt        datetimeoffset(3) NOT NULL CONSTRAINT DF_RoundScoreOverride_OverriddenAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_RoundScoreOverride PRIMARY KEY (RoundScoreOverrideId),
    CONSTRAINT UQ_RoundScoreOverride_PublicId UNIQUE (PublicId),
    CONSTRAINT FK_RoundScoreOverride_Round FOREIGN KEY (PortfolioRoundId) REFERENCES pfo.PortfolioRound (PortfolioRoundId),
    CONSTRAINT FK_RoundScoreOverride_Staff FOREIGN KEY (OverriddenByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT CK_RoundScoreOverride_Score CHECK (NewTotalScore >= 0 AND PreviousTotalScore >= 0)
);
CREATE INDEX IX_RoundScoreOverride_Round ON pfo.RoundScoreOverride (PortfolioRoundId, OverriddenAt);

CREATE TABLE pfo.PortfolioDiscrepancy (
    PortfolioDiscrepancyId bigint     IDENTITY(1,1) NOT NULL,
    PortfolioId         bigint        NOT NULL,
    DetectedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_PortfolioDiscrepancy_DetectedAt DEFAULT (SYSUTCDATETIME()),
    ResolvedAt          datetimeoffset(3) NULL,
    CONSTRAINT PK_PortfolioDiscrepancy PRIMARY KEY (PortfolioDiscrepancyId),
    CONSTRAINT UQ_PortfolioDiscrepancy UNIQUE (PortfolioId),
    CONSTRAINT FK_PortfolioDiscrepancy_Portfolio FOREIGN KEY (PortfolioId) REFERENCES pfo.Portfolio (PortfolioId)
);

CREATE TABLE pfo.PortfolioDiscrepancyDetail (
    PortfolioDiscrepancyId bigint     NOT NULL,
    PortfolioQuestionId int           NOT NULL,
    Round1ScoreItemId   bigint        NOT NULL,
    Round2ScoreItemId   bigint        NOT NULL,
    CONSTRAINT PK_PortfolioDiscrepancyDetail PRIMARY KEY (PortfolioDiscrepancyId, PortfolioQuestionId),
    CONSTRAINT FK_PortfolioDiscrepancyDetail_Discrepancy FOREIGN KEY (PortfolioDiscrepancyId) REFERENCES pfo.PortfolioDiscrepancy (PortfolioDiscrepancyId),
    CONSTRAINT FK_PortfolioDiscrepancyDetail_Question FOREIGN KEY (PortfolioQuestionId) REFERENCES pfo.PortfolioQuestion (PortfolioQuestionId),
    CONSTRAINT FK_PortfolioDiscrepancyDetail_R1 FOREIGN KEY (Round1ScoreItemId) REFERENCES pfo.ScoreItem (ScoreItemId),
    CONSTRAINT FK_PortfolioDiscrepancyDetail_R2 FOREIGN KEY (Round2ScoreItemId) REFERENCES pfo.ScoreItem (ScoreItemId)
);

CREATE TABLE pfo.PortfolioScoreHistory (
    PortfolioScoreHistoryId bigint    IDENTITY(1,1) NOT NULL,
    PortfolioId         bigint        NOT NULL,
    SourceRoundCode     varchar(20)   NOT NULL,
    Score               decimal(7,2)  NOT NULL,
    IsFinal             bit           NOT NULL CONSTRAINT DF_PortfolioScoreHistory_IsFinal DEFAULT (0),
    RecordedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_PortfolioScoreHistory_RecordedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_PortfolioScoreHistory PRIMARY KEY (PortfolioScoreHistoryId),
    CONSTRAINT FK_PortfolioScoreHistory_Portfolio FOREIGN KEY (PortfolioId) REFERENCES pfo.Portfolio (PortfolioId),
    CONSTRAINT CK_PortfolioScoreHistory_Round CHECK (SourceRoundCode IN ('ROUND_1','ROUND_2','ROUND_3','SECOND_EVALUATION'))
);
-- The latest final row is the effective score; a second evaluation supersedes earlier ones.
CREATE INDEX IX_PortfolioScoreHistory_Portfolio ON pfo.PortfolioScoreHistory (PortfolioId, RecordedAt) INCLUDE (Score, IsFinal);

-- Appeals
CREATE TABLE pfo.Appeal (
    AppealId            bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_Appeal_PublicId DEFAULT (NEWSEQUENTIALID()),
    ApplicationId       bigint        NOT NULL,
    SubmittedAt         datetimeoffset(3) NOT NULL CONSTRAINT DF_Appeal_SubmittedAt DEFAULT (SYSUTCDATETIME()),
    StatusCode          varchar(30)   NOT NULL CONSTRAINT DF_Appeal_Status DEFAULT ('SUBMITTED'),
    DecisionNote        nvarchar(1000) NULL,
    DecidedAt           datetimeoffset(3) NULL,
    CONSTRAINT PK_Appeal PRIMARY KEY (AppealId),
    CONSTRAINT UQ_Appeal_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_Appeal_Application UNIQUE (ApplicationId),                 -- one appeal per application
    CONSTRAINT FK_Appeal_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT CK_Appeal_Status CHECK (StatusCode IN ('SUBMITTED','ELIGIBLE','INELIGIBLE','SECOND_EVALUATION','CLOSED'))
);

CREATE TABLE pfo.AppealQuestion (
    AppealId            bigint        NOT NULL,
    PortfolioQuestionId int           NOT NULL,
    CandidateComment    nvarchar(200) NULL,               -- candidate response, max 200 (US-1.2.7)
    CONSTRAINT PK_AppealQuestion PRIMARY KEY (AppealId, PortfolioQuestionId),
    CONSTRAINT FK_AppealQuestion_Appeal FOREIGN KEY (AppealId) REFERENCES pfo.Appeal (AppealId),
    CONSTRAINT FK_AppealQuestion_Question FOREIGN KEY (PortfolioQuestionId) REFERENCES pfo.PortfolioQuestion (PortfolioQuestionId)
);
GO
