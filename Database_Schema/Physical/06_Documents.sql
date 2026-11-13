/*==============================================================================
  06_Documents.sql : attachment metadata and immutable versions
  Binary content is stored in FileNet; only the reference, hash and scan result
  are kept here. A replacement (officer or senior referee) adds a new version and
  never overwrites a previous one.
  Upload flow: the API records the version as PENDING, sends the file through
  Rhapsody to FileNet, and marks it STORED with the FileNet reference when
  Rhapsody confirms (FAILED otherwise). Whether this happens on upload or at
  submission is still open (OQ-07).
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

CREATE TABLE doc.Attachment (
    AttachmentId        bigint        IDENTITY(1,1) NOT NULL,
    PublicId            uniqueidentifier NOT NULL CONSTRAINT DF_Attachment_PublicId DEFAULT (NEWSEQUENTIALID()),   -- the API attachmentId / evidenceId
    ApplicationId       bigint        NULL,
    Purpose             varchar(30)   NOT NULL,
    DocumentTypeId      int           NULL,               -- what the document is (CV, passport copy, personal statement ...); null for CASPER imports
    SpecialtyId         int           NULL,               -- specialty a per-specialty document belongs to (e.g. recommendation letter per preference)
    SectionKey          varchar(50)   NULL,               -- form section for APPLICATION_FORM attachments
    FieldCode           varchar(80)   NULL,               -- FILE_REFERENCE field the file satisfies
    ApplicationPreferenceSiteId bigint NULL,              -- personal statement slot: one per specialty-site combination
    CurrentVersionNo    int           NOT NULL CONSTRAINT DF_Attachment_CurrentVersionNo DEFAULT (1),
    IsDeleted           bit           NOT NULL CONSTRAINT DF_Attachment_IsDeleted DEFAULT (0),    -- candidate delete before submission
    CreatedAt           datetimeoffset(3) NOT NULL CONSTRAINT DF_Attachment_CreatedAt DEFAULT (SYSUTCDATETIME()),
    RowVersion          rowversion    NOT NULL,
    CONSTRAINT PK_Attachment PRIMARY KEY (AttachmentId),
    CONSTRAINT UQ_Attachment_PublicId UNIQUE (PublicId),
    CONSTRAINT FK_Attachment_Application FOREIGN KEY (ApplicationId) REFERENCES app.Application (ApplicationId),
    CONSTRAINT FK_Attachment_PreferenceSite FOREIGN KEY (ApplicationPreferenceSiteId) REFERENCES app.ApplicationPreferenceSite (ApplicationPreferenceSiteId),
    CONSTRAINT FK_Attachment_DocumentType FOREIGN KEY (DocumentTypeId) REFERENCES cfg.DocumentType (DocumentTypeId),
    CONSTRAINT FK_Attachment_Specialty FOREIGN KEY (SpecialtyId) REFERENCES cfg.Specialty (SpecialtyId),
    CONSTRAINT CK_Attachment_Purpose CHECK (Purpose IN ('APPLICATION_FORM','PORTFOLIO_EVIDENCE','CASPER_IMPORT','PAYMENT_RECEIPT')),
    CONSTRAINT CK_Attachment_Owner CHECK (Purpose = 'CASPER_IMPORT' OR ApplicationId IS NOT NULL)
);
CREATE INDEX IX_Attachment_Application ON doc.Attachment (ApplicationId, Purpose) INCLUDE (SectionKey, FieldCode, CurrentVersionNo, IsDeleted);

CREATE TABLE doc.AttachmentVersion (
    AttachmentId        bigint        NOT NULL,
    VersionNo           int           NOT NULL,
    FileNetDocumentRef  nvarchar(200) NULL,               -- set once Rhapsody confirms the file is stored in FileNet
    FileName            nvarchar(260) NOT NULL,
    MediaType           varchar(150)  NOT NULL,
    SizeBytes           bigint        NOT NULL,
    Sha256              binary(32)    NULL,
    MalwareScanStatus   varchar(15)   NOT NULL CONSTRAINT DF_AttachmentVersion_Scan DEFAULT ('PENDING'),
    StorageStatusCode   varchar(15)   NOT NULL CONSTRAINT DF_AttachmentVersion_Storage DEFAULT ('PENDING'),
    RhapsodyCorrelationRef varchar(100) NULL,             -- correlation id of the Rhapsody hand-off
    StoredAt            datetimeoffset(3) NULL,
    PurgedAt            datetimeoffset(3) NULL,           -- removed from FileNet by the document-orphan-cleanup job (rules open, OQ-07)
    UploadedAt          datetimeoffset(3) NOT NULL CONSTRAINT DF_AttachmentVersion_UploadedAt DEFAULT (SYSUTCDATETIME()),
    UploadedByCandidateId bigint      NULL,
    UploadedByStaffUserId int         NULL,
    ReplacementReasonCodeId int       NULL,               -- set when staff replace an attachment (US-2.3.6, US-3.2.3)
    ReplacementNote     nvarchar(500) NULL,
    CONSTRAINT PK_AttachmentVersion PRIMARY KEY (AttachmentId, VersionNo),
    CONSTRAINT FK_AttachmentVersion_Attachment FOREIGN KEY (AttachmentId) REFERENCES doc.Attachment (AttachmentId),
    CONSTRAINT FK_AttachmentVersion_Candidate FOREIGN KEY (UploadedByCandidateId) REFERENCES idn.Candidate (CandidateId),
    CONSTRAINT FK_AttachmentVersion_Staff FOREIGN KEY (UploadedByStaffUserId) REFERENCES idn.StaffUser (StaffUserId),
    CONSTRAINT FK_AttachmentVersion_Reason FOREIGN KEY (ReplacementReasonCodeId) REFERENCES cfg.ReasonCode (ReasonCodeId),
    CONSTRAINT CK_AttachmentVersion_Size CHECK (SizeBytes >= 0),
    CONSTRAINT CK_AttachmentVersion_Scan CHECK (MalwareScanStatus IN ('PENDING','CLEAN','INFECTED','FAILED')),
    CONSTRAINT CK_AttachmentVersion_Storage CHECK (StorageStatusCode IN ('PENDING','STORED','FAILED','PURGED')),
    CONSTRAINT CK_AttachmentVersion_Stored CHECK (StorageStatusCode <> 'STORED' OR FileNetDocumentRef IS NOT NULL),
    CONSTRAINT CK_AttachmentVersion_Uploader CHECK (UploadedByCandidateId IS NULL OR UploadedByStaffUserId IS NULL)
);
-- Work list of the placeholder job document-orphan-cleanup (OQ-07): versions not (yet) safely stored, or to purge.
CREATE INDEX IX_AttachmentVersion_Storage ON doc.AttachmentVersion (StorageStatusCode, UploadedAt)
    WHERE StorageStatusCode <> 'STORED' AND StorageStatusCode <> 'PURGED';
GO
