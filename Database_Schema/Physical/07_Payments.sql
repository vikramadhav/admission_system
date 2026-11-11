/*==============================================================================
  07_Payments.sql : fees, provider routing, payment sessions, gateway events
  Provider-neutral model: E-Pay and Network International sit behind one adapter
  port. The provider and routing-configuration version are bound to a session when
  it is created and never change afterwards. Card data is never stored.
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

CREATE TABLE pay.FeeSchedule (
    FeeScheduleId       int           IDENTITY(1,1) NOT NULL,
    ProgramCycleId      int           NOT NULL,
    FeeType             varchar(30)   NOT NULL,           -- e.g. APPLICATION_FEE; authoritative values require finance approval
    Amount              decimal(12,2) NOT NULL,
    CurrencyCode        char(3)       NOT NULL CONSTRAINT DF_FeeSchedule_Currency DEFAULT ('AED'),
    EffectiveFrom       date          NOT NULL,
    EffectiveTo         date          NULL,
    ApprovedBy          nvarchar(200) NULL,
    ApprovedAt          datetimeoffset(3) NULL,
    CONSTRAINT PK_FeeSchedule PRIMARY KEY (FeeScheduleId),
    CONSTRAINT UQ_FeeSchedule UNIQUE (ProgramCycleId, FeeType, EffectiveFrom),
    CONSTRAINT FK_FeeSchedule_ProgramCycle FOREIGN KEY (ProgramCycleId) REFERENCES cfg.ProgramCycle (ProgramCycleId),
    CONSTRAINT CK_FeeSchedule_Amount CHECK (Amount > 0),
    CONSTRAINT CK_FeeSchedule_Currency CHECK (CurrencyCode = 'AED'),
    CONSTRAINT CK_FeeSchedule_Dates CHECK (EffectiveTo IS NULL OR EffectiveTo >= EffectiveFrom)
);

-- Server-side routing policy. Candidates cannot choose or see the provider.
CREATE TABLE pay.PaymentRoutingConfiguration (
    PaymentRoutingConfigId int        IDENTITY(1,1) NOT NULL,
    ConfigurationVersion varchar(30)  NOT NULL,
    ActiveProviderCode  varchar(30)   NOT NULL,
    EffectiveAt         datetimeoffset(3) NOT NULL,
    CreatedBy           nvarchar(100) NULL,
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_PaymentRoutingConfiguration_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_PaymentRoutingConfiguration PRIMARY KEY (PaymentRoutingConfigId),
    CONSTRAINT UQ_PaymentRoutingConfiguration_Version UNIQUE (ConfigurationVersion),
    CONSTRAINT FK_PaymentRoutingConfiguration_Provider FOREIGN KEY (ActiveProviderCode) REFERENCES cfg.PaymentProvider (ProviderCode)
);
GO

CREATE TABLE pay.PaymentSession (
    PaymentSessionId    bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_PaymentSession_PublicId DEFAULT (NEWSEQUENTIALID()),
    ApplicationId       bigint        NOT NULL,
    FeeScheduleId       int           NOT NULL,
    Amount              decimal(12,2) NOT NULL,           -- snapshot of the fee at session creation
    CurrencyCode        char(3)       NOT NULL CONSTRAINT DF_PaymentSession_Currency DEFAULT ('AED'),
    StatusCode          varchar(40)   NOT NULL CONSTRAINT DF_PaymentSession_Status DEFAULT ('PENDING'),
    IdempotencyKey      varchar(128)  NOT NULL,
    ReceiptId           varchar(100)  NULL,
    PaidAt              datetimeoffset(3) NULL,
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_PaymentSession_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt           datetimeoffset(3) NULL,
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_PaymentSession PRIMARY KEY (PaymentSessionId),
    CONSTRAINT UQ_PaymentSession_PublicId UNIQUE (PublicId),
    CONSTRAINT UQ_PaymentSession_Idempotency UNIQUE (ApplicationId, IdempotencyKey),
    CONSTRAINT FK_PaymentSession_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_PaymentSession_FeeSchedule FOREIGN KEY (FeeScheduleId) REFERENCES pay.FeeSchedule (FeeScheduleId),
    CONSTRAINT FK_PaymentSession_Status FOREIGN KEY (StatusCode) REFERENCES cfg.PaymentStatus (StatusCode),
    CONSTRAINT CK_PaymentSession_Amount CHECK (Amount > 0),
    CONSTRAINT CK_PaymentSession_Currency CHECK (CurrencyCode = 'AED'),
    CONSTRAINT CK_PaymentSession_Paid CHECK (StatusCode <> 'PAID' OR PaidAt IS NOT NULL)
);
-- A fee can be paid once; a retry returns the existing open session instead of creating another.
CREATE UNIQUE INDEX UX_PaymentSession_OnePaid ON pay.PaymentSession (ApplicationId, FeeScheduleId) WHERE StatusCode = 'PAID';
-- Filtered-index predicates cannot use OR/IN, so "open" is expressed as not-in-a-terminal-state with AND.
CREATE UNIQUE INDEX UX_PaymentSession_OneOpen ON pay.PaymentSession (ApplicationId, FeeScheduleId)
    WHERE StatusCode <> 'PAID' AND StatusCode <> 'FAILED' AND StatusCode <> 'CANCELLED';
CREATE INDEX IX_PaymentSession_Status ON pay.PaymentSession (StatusCode, CreatedAt);
GO

-- Internal-only, immutable binding used for reconciliation after a provider switch.
CREATE TABLE pay.PaymentProviderBinding (
    PaymentSessionId    bigint        NOT NULL,
    ProviderCode        varchar(30)   NOT NULL,
    PaymentRoutingConfigId int        NOT NULL,
    ProviderSessionReference varchar(200) NOT NULL,
    CheckoutUrl         nvarchar(2000) NULL,
    CheckoutExpiresAt   datetimeoffset(3) NULL,
    BoundAt             datetimeoffset(3) NOT NULL CONSTRAINT DF_PaymentProviderBinding_BoundAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_PaymentProviderBinding PRIMARY KEY (PaymentSessionId),
    CONSTRAINT UQ_PaymentProviderBinding_Provider UNIQUE (ProviderCode, ProviderSessionReference),
    CONSTRAINT FK_PaymentProviderBinding_Session FOREIGN KEY (PaymentSessionId) REFERENCES pay.PaymentSession (PaymentSessionId),
    CONSTRAINT FK_PaymentProviderBinding_Provider FOREIGN KEY (ProviderCode) REFERENCES cfg.PaymentProvider (ProviderCode),
    CONSTRAINT FK_PaymentProviderBinding_Routing FOREIGN KEY (PaymentRoutingConfigId) REFERENCES pay.PaymentRoutingConfiguration (PaymentRoutingConfigId)
);
GO
CREATE TRIGGER pay.TR_PaymentProviderBinding_Immutable ON pay.PaymentProviderBinding AFTER UPDATE, DELETE AS
BEGIN
    SET NOCOUNT ON;
    THROW 51001, 'pay.PaymentProviderBinding is immutable once created.', 1;
END;
GO

-- Normalised event produced by a provider adapter after callback verification.
CREATE TABLE pay.PaymentGatewayEvent (
    PaymentGatewayEventId bigint      IDENTITY(1,1) NOT NULL,
    ProviderCode        varchar(30)   NOT NULL,
    ProviderEventId     varchar(100)  NOT NULL,
    PaymentSessionId    bigint        NOT NULL,
    ProviderTransactionId varchar(100) NULL,              -- reference only, never a payment credential
    StatusCode          varchar(15)   NOT NULL,
    Amount              decimal(12,2) NOT NULL,
    CurrencyCode        char(3)       NOT NULL,
    OccurredAt          datetimeoffset(3) NOT NULL,
    ReceiptId           varchar(100)  NULL,
    ReceivedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_PaymentGatewayEvent_ReceivedAt DEFAULT (SYSUTCDATETIME()),
    ProcessingOutcome   varchar(25)   NOT NULL,
    CONSTRAINT PK_PaymentGatewayEvent PRIMARY KEY (PaymentGatewayEventId),
    CONSTRAINT UQ_PaymentGatewayEvent UNIQUE (ProviderCode, ProviderEventId),                      -- de-duplicates provider retries
    CONSTRAINT FK_PaymentGatewayEvent_Provider FOREIGN KEY (ProviderCode) REFERENCES cfg.PaymentProvider (ProviderCode),
    CONSTRAINT FK_PaymentGatewayEvent_Session FOREIGN KEY (PaymentSessionId) REFERENCES pay.PaymentSession (PaymentSessionId),
    CONSTRAINT CK_PaymentGatewayEvent_Status CHECK (StatusCode IN ('PAID','FAILED','CANCELLED')),
    CONSTRAINT CK_PaymentGatewayEvent_Amount CHECK (Amount > 0),
    CONSTRAINT CK_PaymentGatewayEvent_Currency CHECK (CurrencyCode = 'AED'),
    CONSTRAINT CK_PaymentGatewayEvent_Outcome CHECK (ProcessingOutcome IN ('APPLIED','DUPLICATE_IGNORED','MISMATCH_REJECTED'))
);
CREATE INDEX IX_PaymentGatewayEvent_Session ON pay.PaymentGatewayEvent (PaymentSessionId, OccurredAt);

-- Resolution of UNKNOWN / timed-out payments against the ORIGINAL provider; never auto-failed over to another gateway.
CREATE TABLE pay.PaymentReconciliation (
    PaymentReconciliationId bigint    IDENTITY(1,1) NOT NULL,
    PaymentSessionId    bigint        NOT NULL,
    ReconciledAt        datetimeoffset(3) NOT NULL CONSTRAINT DF_PaymentReconciliation_ReconciledAt DEFAULT (SYSUTCDATETIME()),
    OutcomeCode         varchar(20)   NOT NULL,
    Note                nvarchar(500) NULL,
    ReconciledByStaffUserId int       NULL,               -- null when performed by the reconciliation job
    CONSTRAINT PK_PaymentReconciliation PRIMARY KEY (PaymentReconciliationId),
    CONSTRAINT FK_PaymentReconciliation_Session FOREIGN KEY (PaymentSessionId) REFERENCES pay.PaymentSession (PaymentSessionId),
    CONSTRAINT FK_PaymentReconciliation_Staff FOREIGN KEY (ReconciledByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT CK_PaymentReconciliation_Outcome CHECK (OutcomeCode IN ('CONFIRMED_PAID','CONFIRMED_FAILED','CONFIRMED_CANCELLED','STILL_UNKNOWN','DUPLICATE_CHARGE'))
);
CREATE INDEX IX_PaymentReconciliation_Session ON pay.PaymentReconciliation (PaymentSessionId, ReconciledAt);
GO
