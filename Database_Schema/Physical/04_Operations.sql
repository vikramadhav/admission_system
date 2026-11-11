/*==============================================================================
  04_Operations.sql : cross-cutting services
    audit trail, idempotency, domain-event outbox, notifications, job runs
  Tables here carry no foreign keys to business tables on purpose: audit and
  outbox rows must outlive, and never block, the records they describe.
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

-- Who did what, when, in which role and through which client. It never holds data values: old/new values of
-- candidate data go to idn.CandidateChangeHistory (D-06).
CREATE TABLE ops.AuditEvent (
    AuditEventId        bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_AuditEvent_PublicId DEFAULT (NEWSEQUENTIALID()),
    OccurredAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_AuditEvent_OccurredAt DEFAULT (SYSUTCDATETIME()),
    ActorType           varchar(20)   NOT NULL,
    ActorCandidateId    bigint        NULL,
    ActorStaffUserId    int           NULL,
    ActorServiceName    varchar(100)  NULL,
    ActiveRoleCode      varchar(40)   NULL,               -- staff role the actor was acting in (standard s.15); no FK on purpose
    IntegrationClientId int           NULL,               -- "user X via client Y": the integration client that made the call; no FK on purpose
    ActionCode          varchar(100)  NOT NULL,           -- e.g. application.submit, verification.return-for-correction
    ResourceType        varchar(60)   NOT NULL,
    ResourceId          varchar(64)   NOT NULL,           -- opaque public id or numeric key rendered as text
    ApplicationId       bigint        NULL,               -- denormalised for per-application timelines; intentionally not a foreign key
    FromStatus          varchar(40)   NULL,
    ToStatus            varchar(40)   NULL,
    ReasonCode          varchar(60)   NULL,
    Outcome             varchar(20)   NOT NULL CONSTRAINT DF_AuditEvent_Outcome DEFAULT ('SUCCESS'),
    RequestId           varchar(64)   NULL,
    CorrelationId       varchar(64)   NULL,
    DetailJson          json          NULL,               -- safe metadata only: never field values, applicant payloads, documents, credentials or tokens
    CONSTRAINT PK_AuditEvent PRIMARY KEY (AuditEventId),
    CONSTRAINT UQ_AuditEvent_PublicId UNIQUE (PublicId),
    CONSTRAINT CK_AuditEvent_ActorType CHECK (ActorType IN ('CANDIDATE','STAFF','SERVICE','SYSTEM')),
    CONSTRAINT CK_AuditEvent_Outcome CHECK (Outcome IN ('SUCCESS','DENIED','FAILED'))
);
CREATE INDEX IX_AuditEvent_Application ON ops.AuditEvent (ApplicationId, OccurredAt) WHERE ApplicationId IS NOT NULL;
CREATE INDEX IX_AuditEvent_Resource ON ops.AuditEvent (ResourceType, ResourceId, OccurredAt);
CREATE INDEX IX_AuditEvent_Staff ON ops.AuditEvent (ActorStaffUserId, OccurredAt) WHERE ActorStaffUserId IS NOT NULL;
GO

-- Audit rows are append-only.
CREATE TRIGGER ops.TR_AuditEvent_Immutable ON ops.AuditEvent AFTER UPDATE, DELETE AS
BEGIN
    SET NOCOUNT ON;
    THROW 51000, 'ops.AuditEvent is append-only; updates and deletes are not permitted.', 1;
END;
GO

CREATE TABLE ops.IdempotencyKey (
    IdempotencyKeyId    bigint        IDENTITY(1,1) NOT NULL,
    KeyScope            varchar(200)  NOT NULL,           -- operation + actor/resource scope
    KeyValue            varchar(128)  NOT NULL,           -- Idempotency-Key header (16..128 chars)
    RequestHash         binary(32)    NOT NULL,           -- same key + different hash => 409 IDEMPOTENCY_KEY_REUSED
    ResponseStatus      smallint      NULL,
    ResponseBodyJson    json          NULL,
    ResourceId          varchar(64)   NULL,
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_IdempotencyKey_CreatedAt DEFAULT (SYSUTCDATETIME()),
    ExpiresAt           datetimeoffset(3) NOT NULL,
    CONSTRAINT PK_IdempotencyKey PRIMARY KEY (IdempotencyKeyId),
    CONSTRAINT UQ_IdempotencyKey UNIQUE (KeyScope, KeyValue),
    CONSTRAINT CK_IdempotencyKey_Length CHECK (LEN(KeyValue) >= 16)
);
CREATE INDEX IX_IdempotencyKey_Expires ON ops.IdempotencyKey (ExpiresAt);
GO

-- Transactional outbox for the versioned domain events (ApplicationSubmitted.v1, ScoresAnnounced.v1, ...).
CREATE TABLE ops.DomainEventOutbox (
    EventId             uniqueidentifier NOT NULL CONSTRAINT DF_DomainEventOutbox_EventId DEFAULT (NEWSEQUENTIALID()),
    EventType           varchar(100)  NOT NULL,           -- e.g. ApplicationSubmitted
    SchemaVersion       smallint      NOT NULL,
    AggregateType       varchar(60)   NOT NULL,
    AggregateId         varchar(64)   NOT NULL,
    Producer            varchar(100)  NOT NULL,
    CorrelationId       varchar(64)   NULL,
    PayloadJson         json          NOT NULL,           -- secure resource references only; no names, documents, academic values or tokens
    OccurredAt          datetimeoffset(3) NOT NULL,
    RecordedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_DomainEventOutbox_RecordedAt DEFAULT (SYSUTCDATETIME()),
    PublishedAt         datetimeoffset(3) NULL,
    PublishAttempts     int           NOT NULL CONSTRAINT DF_DomainEventOutbox_Attempts DEFAULT (0),
    CONSTRAINT PK_DomainEventOutbox PRIMARY KEY (EventId)
);
CREATE INDEX IX_DomainEventOutbox_Unpublished ON ops.DomainEventOutbox (RecordedAt) WHERE PublishedAt IS NULL;
GO

CREATE TABLE ops.NotificationTemplate (
    NotificationTemplateId int        IDENTITY(1,1) NOT NULL,
    TemplateCode        varchar(80)   NOT NULL,
    Channel             varchar(10)   NOT NULL,
    LanguageCode        varchar(35)   NOT NULL,
    VersionNo           int           NOT NULL,
    Subject             nvarchar(300) NULL,
    Body                nvarchar(max) NOT NULL,
    IsActive            bit           NOT NULL CONSTRAINT DF_NotificationTemplate_IsActive DEFAULT (1),
    CONSTRAINT PK_NotificationTemplate PRIMARY KEY (NotificationTemplateId),
    CONSTRAINT UQ_NotificationTemplate UNIQUE (TemplateCode, Channel, LanguageCode, VersionNo),
    CONSTRAINT CK_NotificationTemplate_Channel CHECK (Channel IN ('EMAIL','SMS','IN_APP'))
);

CREATE TABLE ops.NotificationOutbox (
    NotificationId      bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_NotificationOutbox_PublicId DEFAULT (NEWSEQUENTIALID()),
    RecipientCandidateId bigint       NULL,
    RecipientStaffUserId int          NULL,
    ApplicationId       bigint        NULL,
    TemplateCode        varchar(80)   NOT NULL,
    Channel             varchar(10)   NOT NULL,
    PayloadJson         json          NULL,
    DedupeKey           varchar(200)  NULL,               -- e.g. draft-reminder:{applicationId}:{n}; prevents duplicate reminders / archive notices
    StatusCode          varchar(15)   NOT NULL CONSTRAINT DF_NotificationOutbox_Status DEFAULT ('PENDING'),
    AttemptCount        int           NOT NULL CONSTRAINT DF_NotificationOutbox_Attempts DEFAULT (0),
    NextAttemptAt       datetimeoffset(3) NULL,
    SentAt              datetimeoffset(3) NULL,
    ProviderMessageRef  varchar(200)  NULL,
    LastError           nvarchar(500) NULL,
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_NotificationOutbox_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_NotificationOutbox PRIMARY KEY (NotificationId),
    CONSTRAINT UQ_NotificationOutbox_PublicId UNIQUE (PublicId),
    CONSTRAINT CK_NotificationOutbox_Channel CHECK (Channel IN ('EMAIL','SMS','IN_APP')),
    CONSTRAINT CK_NotificationOutbox_Status CHECK (StatusCode IN ('PENDING','SENT','FAILED','DEAD')),
    CONSTRAINT CK_NotificationOutbox_Recipient CHECK (RecipientCandidateId IS NOT NULL OR RecipientStaffUserId IS NOT NULL)
);
CREATE UNIQUE INDEX UX_NotificationOutbox_Dedupe ON ops.NotificationOutbox (DedupeKey) WHERE DedupeKey IS NOT NULL;
CREATE INDEX IX_NotificationOutbox_Pending ON ops.NotificationOutbox (NextAttemptAt) WHERE StatusCode <> 'SENT' AND StatusCode <> 'DEAD';
GO

-- Jobs run in-process as a BackgroundService driven by this scheduled-work history (D-18); there are no HTTP job triggers.
CREATE TABLE ops.ScheduledJobRun (
    JobRunId            bigint        IDENTITY(1,1) NOT NULL,
    JobCode             varchar(60)   NOT NULL,           -- application-maintenance, verification-maintenance, document-orphan-cleanup (placeholder, OQ-07)
    StartedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_ScheduledJobRun_StartedAt DEFAULT (SYSUTCDATETIME()),
    CompletedAt         datetimeoffset(3) NULL,
    StatusCode          varchar(15)   NOT NULL CONSTRAINT DF_ScheduledJobRun_Status DEFAULT ('RUNNING'),
    ProcessedCount      int           NOT NULL CONSTRAINT DF_ScheduledJobRun_Processed DEFAULT (0),
    FailedCount         int           NOT NULL CONSTRAINT DF_ScheduledJobRun_Failed DEFAULT (0),
    ErrorSummaryJson    json          NULL,               -- [{code,count}] as returned by JobResult
    CalendarVersion     varchar(20)   NULL,
    CONSTRAINT PK_ScheduledJobRun PRIMARY KEY (JobRunId),
    CONSTRAINT CK_ScheduledJobRun_Status CHECK (StatusCode IN ('RUNNING','SUCCEEDED','PARTIAL','FAILED'))
);
CREATE INDEX IX_ScheduledJobRun_Job ON ops.ScheduledJobRun (JobCode, StartedAt DESC);
GO
