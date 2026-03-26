-- =============================================
-- SGC Digital - Correction Response Tracking
-- MS SQL Server Schema
-- =============================================
-- This script adds tables for tracking:
-- 1. Data changes made during corrections
-- 2. Correction response drafts
-- 3. Document replacements
-- 4. Field-level version history
-- =============================================

-- =============================================
-- 1. CORRECTION DATA CHANGES - Contracts
-- Tracks every field change made during correction
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.ContractCorrectionDataChanges') AND type = 'U')
CREATE TABLE dbo.ContractCorrectionDataChanges (
    ChangeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrectionRequestId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractCorrectionRequests(CorrectionRequestId),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    
    -- Field identification
    FieldName NVARCHAR(100) NOT NULL, -- e.g., 'ContractValue', 'CounterpartyName'
    FieldSection NVARCHAR(100) NULL, -- e.g., 'Financial', 'Contractor Details'
    FieldLabel NVARCHAR(200) NULL, -- Human-readable label
    
    -- Values
    OldValue NVARCHAR(MAX) NULL, -- Value before correction
    NewValue NVARCHAR(MAX) NULL, -- Value after correction
    OldValueType NVARCHAR(50) NULL, -- 'string', 'number', 'date', 'boolean', 'json'
    
    -- Was this field flagged as an issue?
    WasIssueFlagged BIT NOT NULL DEFAULT 0,
    IssueDescription NVARCHAR(500) NULL,
    
    -- Metadata
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Verification by reviewer
    IsVerified BIT NULL,
    VerifiedAt DATETIME2 NULL,
    VerifiedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    VerificationNotes NVARCHAR(MAX) NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Index for quick lookup
CREATE INDEX IX_ContractCorrectionDataChanges_CorrectionRequest ON dbo.ContractCorrectionDataChanges(CorrectionRequestId);
CREATE INDEX IX_ContractCorrectionDataChanges_Contract ON dbo.ContractCorrectionDataChanges(ContractId);
CREATE INDEX IX_ContractCorrectionDataChanges_Field ON dbo.ContractCorrectionDataChanges(FieldName);

-- =============================================
-- 2. CORRECTION DATA CHANGES - Correspondence
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.CorrespondenceCorrectionDataChanges') AND type = 'U')
CREATE TABLE dbo.CorrespondenceCorrectionDataChanges (
    ChangeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrectionRequestId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceCorrectionRequests(CorrectionRequestId),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    
    FieldName NVARCHAR(100) NOT NULL,
    FieldSection NVARCHAR(100) NULL,
    FieldLabel NVARCHAR(200) NULL,
    
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    OldValueType NVARCHAR(50) NULL,
    
    WasIssueFlagged BIT NOT NULL DEFAULT 0,
    IssueDescription NVARCHAR(500) NULL,
    
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    IsVerified BIT NULL,
    VerifiedAt DATETIME2 NULL,
    VerifiedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    VerificationNotes NVARCHAR(MAX) NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_CorrespondenceCorrectionDataChanges_CorrectionRequest ON dbo.CorrespondenceCorrectionDataChanges(CorrectionRequestId);
CREATE INDEX IX_CorrespondenceCorrectionDataChanges_Correspondence ON dbo.CorrespondenceCorrectionDataChanges(CorrespondenceId);

-- =============================================
-- 3. CORRECTION RESPONSE DRAFTS - Contracts
-- Auto-save correction responses
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.ContractCorrectionResponseDrafts') AND type = 'U')
CREATE TABLE dbo.ContractCorrectionResponseDrafts (
    DraftId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrectionRequestId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractCorrectionRequests(CorrectionRequestId),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Stores all form data as JSON
    FormDataJson NVARCHAR(MAX) NOT NULL,
    
    -- Track which fields have been changed
    ChangedFieldsJson NVARCHAR(MAX) NULL, -- JSON array of field names
    
    -- Response comments
    ResponseComments NVARCHAR(MAX) NULL,
    
    -- Progress tracking
    IssuesAddressedCount INT NOT NULL DEFAULT 0,
    TotalIssuesCount INT NOT NULL DEFAULT 0,
    ProgressPercentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastAutoSaveAt DATETIME2 NULL,
    
    -- Expiry (drafts expire after deadline + grace period)
    ExpiresAt DATETIME2 NOT NULL
);

CREATE UNIQUE INDEX IX_ContractCorrectionResponseDrafts_Active ON dbo.ContractCorrectionResponseDrafts(CorrectionRequestId, UserId) 
WHERE ExpiresAt > GETUTCDATE();

-- =============================================
-- 4. CORRECTION RESPONSE DRAFTS - Correspondence
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.CorrespondenceCorrectionResponseDrafts') AND type = 'U')
CREATE TABLE dbo.CorrespondenceCorrectionResponseDrafts (
    DraftId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrectionRequestId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceCorrectionRequests(CorrectionRequestId),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    FormDataJson NVARCHAR(MAX) NOT NULL,
    ChangedFieldsJson NVARCHAR(MAX) NULL,
    ResponseComments NVARCHAR(MAX) NULL,
    
    IssuesAddressedCount INT NOT NULL DEFAULT 0,
    TotalIssuesCount INT NOT NULL DEFAULT 0,
    ProgressPercentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastAutoSaveAt DATETIME2 NULL,
    ExpiresAt DATETIME2 NOT NULL
);

-- =============================================
-- 5. CORRECTION DOCUMENTS
-- Documents uploaded as part of correction response
-- (Enhancing existing table if exists, or create new)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.CorrectionDocuments') AND type = 'U')
CREATE TABLE dbo.CorrectionDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Link to correction request (one of these will be set)
    ContractCorrectionRequestId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractCorrectionRequests(CorrectionRequestId),
    CorrespondenceCorrectionRequestId UNIQUEIDENTIFIER NULL REFERENCES dbo.CorrespondenceCorrectionRequests(CorrectionRequestId),
    
    -- Document being replaced (if applicable)
    ReplacesDocumentId UNIQUEIDENTIFIER NULL, -- Original document being replaced
    RequiredDocumentTypeId INT NULL, -- If this is a required document type
    
    -- File details
    FileName NVARCHAR(255) NOT NULL,
    FileExtension NVARCHAR(20) NOT NULL,
    FileSizeBytes BIGINT NOT NULL,
    MimeType NVARCHAR(100) NOT NULL,
    FilePath NVARCHAR(500) NOT NULL, -- Storage path
    BlobUrl NVARCHAR(1000) NULL, -- Vercel Blob URL if applicable
    
    -- Categorization
    DocumentCategory NVARCHAR(100) NULL, -- 'required', 'additional', 'supporting'
    Description NVARCHAR(500) NULL,
    
    -- Upload details
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Verification
    IsVerified BIT NULL,
    VerifiedAt DATETIME2 NULL,
    VerifiedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    VerificationNotes NVARCHAR(MAX) NULL,
    
    -- Soft delete
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME2 NULL,
    DeletedBy UNIQUEIDENTIFIER NULL
);

CREATE INDEX IX_CorrectionDocuments_ContractCorrection ON dbo.CorrectionDocuments(ContractCorrectionRequestId);
CREATE INDEX IX_CorrectionDocuments_CorrespondenceCorrection ON dbo.CorrectionDocuments(CorrespondenceCorrectionRequestId);

-- =============================================
-- 6. FIELD VERSION HISTORY
-- Complete history of all field changes across corrections
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.ContractFieldVersionHistory') AND type = 'U')
CREATE TABLE dbo.ContractFieldVersionHistory (
    VersionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    
    FieldName NVARCHAR(100) NOT NULL,
    
    -- Version tracking
    VersionNumber INT NOT NULL,
    PreviousVersionId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractFieldVersionHistory(VersionId),
    
    -- Values
    FieldValue NVARCHAR(MAX) NULL,
    
    -- Change context
    ChangeType NVARCHAR(50) NOT NULL, -- 'INITIAL', 'CORRECTION', 'AMENDMENT', 'ADMIN_UPDATE'
    CorrectionRequestId UNIQUEIDENTIFIER NULL, -- If change was due to correction
    CorrectionCycleNumber INT NULL,
    
    -- Metadata
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    ChangeReason NVARCHAR(500) NULL,
    
    -- Is this the current version?
    IsCurrent BIT NOT NULL DEFAULT 1
);

CREATE INDEX IX_ContractFieldVersionHistory_Contract ON dbo.ContractFieldVersionHistory(ContractId);
CREATE INDEX IX_ContractFieldVersionHistory_Field ON dbo.ContractFieldVersionHistory(ContractId, FieldName);
CREATE INDEX IX_ContractFieldVersionHistory_Current ON dbo.ContractFieldVersionHistory(ContractId, FieldName, IsCurrent) WHERE IsCurrent = 1;

-- =============================================
-- 7. ADD COLUMNS TO MAIN TABLES FOR CORRECTION TRACKING
-- =============================================

-- Add correction-related columns to ContractsRegister
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.ContractsRegister') AND name = 'HasPendingCorrections')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD HasPendingCorrections BIT NOT NULL DEFAULT 0;
    ALTER TABLE dbo.ContractsRegister ADD LastCorrectionRequestedAt DATETIME2 NULL;
    ALTER TABLE dbo.ContractsRegister ADD LastCorrectionSubmittedAt DATETIME2 NULL;
    ALTER TABLE dbo.ContractsRegister ADD CorrectionDeadline DATETIME2 NULL;
    ALTER TABLE dbo.ContractsRegister ADD TotalFieldsChanged INT NOT NULL DEFAULT 0;
END

-- Add correction-related columns to CorrespondenceRegister
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.CorrespondenceRegister') AND name = 'HasPendingCorrections')
BEGIN
    ALTER TABLE dbo.CorrespondenceRegister ADD HasPendingCorrections BIT NOT NULL DEFAULT 0;
    ALTER TABLE dbo.CorrespondenceRegister ADD LastCorrectionRequestedAt DATETIME2 NULL;
    ALTER TABLE dbo.CorrespondenceRegister ADD LastCorrectionSubmittedAt DATETIME2 NULL;
    ALTER TABLE dbo.CorrespondenceRegister ADD CorrectionDeadline DATETIME2 NULL;
    ALTER TABLE dbo.CorrespondenceRegister ADD TotalFieldsChanged INT NOT NULL DEFAULT 0;
END

-- =============================================
-- 8. STORED PROCEDURE: Submit Contract Corrections
-- =============================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.sp_SubmitContractCorrections') AND type = 'P')
    DROP PROCEDURE dbo.sp_SubmitContractCorrections;
GO

CREATE PROCEDURE dbo.sp_SubmitContractCorrections
    @CorrectionRequestId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @FormDataJson NVARCHAR(MAX),
    @ChangedFieldsJson NVARCHAR(MAX),
    @ResponseComments NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ContractId UNIQUEIDENTIFIER;
    DECLARE @CorrectionCycleNumber INT;
    DECLARE @CurrentStageId INT;
    
    -- Get correction request details
    SELECT 
        @ContractId = ContractId,
        @CorrectionCycleNumber = CorrectionCycleNumber
    FROM dbo.ContractCorrectionRequests
    WHERE CorrectionRequestId = @CorrectionRequestId;
    
    IF @ContractId IS NULL
    BEGIN
        RAISERROR('Correction request not found', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 1. Update the correction request status
        UPDATE dbo.ContractCorrectionRequests
        SET 
            Status = 'SUBMITTED',
            ResponseSubmittedAt = GETUTCDATE(),
            ApplicantComments = @ResponseComments,
            UpdatedAt = GETUTCDATE()
        WHERE CorrectionRequestId = @CorrectionRequestId;
        
        -- 2. Parse and store individual field changes
        -- (In production, this would parse the JSON and insert records)
        -- For now, we store the count
        DECLARE @FieldCount INT = (SELECT COUNT(*) FROM OPENJSON(@ChangedFieldsJson));
        
        -- 3. Update the main contract record flags
        UPDATE dbo.ContractsRegister
        SET 
            HasPendingCorrections = 0,
            LastCorrectionSubmittedAt = GETUTCDATE(),
            TotalFieldsChanged = TotalFieldsChanged + @FieldCount,
            UpdatedAt = GETUTCDATE(),
            UpdatedBy = @UserId
        WHERE ContractId = @ContractId;
        
        -- 4. Add status history entry
        INSERT INTO dbo.ContractStatusHistory (
            ContractId,
            OldStatusId,
            NewStatusId,
            ChangedBy,
            Comments,
            IsCorrection,
            CorrectionCycleNumber,
            ChangedAt
        )
        SELECT 
            @ContractId,
            CaseStatusId,
            (SELECT CaseStatusId FROM dbo.LookupCaseStatus WHERE StatusCode = 'CORRECTIONS_SUBMITTED'),
            @UserId,
            'Corrections submitted by applicant',
            1,
            @CorrectionCycleNumber,
            GETUTCDATE()
        FROM dbo.ContractsRegister
        WHERE ContractId = @ContractId;
        
        -- 5. Update contract status
        UPDATE dbo.ContractsRegister
        SET 
            CaseStatusId = (SELECT CaseStatusId FROM dbo.LookupCaseStatus WHERE StatusCode = 'CORRECTIONS_SUBMITTED')
        WHERE ContractId = @ContractId;
        
        -- 6. Delete any response drafts
        DELETE FROM dbo.ContractCorrectionResponseDrafts
        WHERE CorrectionRequestId = @CorrectionRequestId;
        
        -- 7. Create notification for reviewer
        INSERT INTO dbo.Notifications (
            UserId,
            NotificationType,
            Title,
            Message,
            RelatedEntityType,
            RelatedEntityId,
            ActionUrl,
            CreatedAt
        )
        SELECT 
            RequestedBy,
            'CORRECTIONS_SUBMITTED',
            'Corrections Submitted',
            'Applicant has submitted corrections for review',
            'CONTRACT',
            @ContractId,
            '/case-management/contracts/cases/' + CAST(@ContractId AS NVARCHAR(50)),
            GETUTCDATE()
        FROM dbo.ContractCorrectionRequests
        WHERE CorrectionRequestId = @CorrectionRequestId;
        
        COMMIT TRANSACTION;
        
        -- Return success
        SELECT 
            1 AS Success,
            @ContractId AS ContractId,
            'Corrections submitted successfully' AS Message;
            
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =============================================
-- 9. VIEW: Pending Corrections for Applicants
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'dbo.vw_ApplicantPendingCorrections'))
    DROP VIEW dbo.vw_ApplicantPendingCorrections;
GO

CREATE VIEW dbo.vw_ApplicantPendingCorrections AS
SELECT 
    'CONTRACT' AS SubmissionType,
    ccr.CorrectionRequestId,
    c.ContractId AS SubmissionId,
    c.ReferenceNumber AS TransactionNumber,
    c.ContractTitle AS Title,
    ccr.CorrectionCycleNumber,
    lcr.ReasonName AS PrimaryReason,
    ccr.CorrectionInstructions AS Instructions,
    ccr.DeadlineDate,
    DATEDIFF(DAY, GETUTCDATE(), ccr.DeadlineDate) AS DaysRemaining,
    ccr.Status,
    ccr.RequestedAt,
    up.FullName AS RequestedByName,
    c.RequestingUserId AS ApplicantUserId,
    e.EntityId AS ApplicantEntityId
FROM dbo.ContractCorrectionRequests ccr
JOIN dbo.ContractsRegister c ON ccr.ContractId = c.ContractId
JOIN dbo.LookupCorrectionReasons lcr ON ccr.PrimaryCorrectionReasonId = lcr.CorrectionReasonId
JOIN dbo.UserProfiles up ON ccr.RequestedBy = up.UserId
LEFT JOIN dbo.Entities e ON c.RequestingUserId = e.PrimaryContactUserId
WHERE ccr.Status = 'PENDING'

UNION ALL

SELECT 
    'CORRESPONDENCE' AS SubmissionType,
    ccr.CorrectionRequestId,
    cor.CorrespondenceId AS SubmissionId,
    cor.ReferenceNumber AS TransactionNumber,
    cor.Subject AS Title,
    ccr.CorrectionCycleNumber,
    lcr.ReasonName AS PrimaryReason,
    ccr.CorrectionInstructions AS Instructions,
    ccr.DeadlineDate,
    DATEDIFF(DAY, GETUTCDATE(), ccr.DeadlineDate) AS DaysRemaining,
    ccr.Status,
    ccr.RequestedAt,
    up.FullName AS RequestedByName,
    cor.RequestingUserId AS ApplicantUserId,
    e.EntityId AS ApplicantEntityId
FROM dbo.CorrespondenceCorrectionRequests ccr
JOIN dbo.CorrespondenceRegister cor ON ccr.CorrespondenceId = cor.CorrespondenceId
JOIN dbo.LookupCorrectionReasons lcr ON ccr.PrimaryCorrectionReasonId = lcr.CorrectionReasonId
JOIN dbo.UserProfiles up ON ccr.RequestedBy = up.UserId
LEFT JOIN dbo.Entities e ON cor.RequestingUserId = e.PrimaryContactUserId
WHERE ccr.Status = 'PENDING';
GO

-- =============================================
-- 10. VIEW: Correction Data Change Summary
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'dbo.vw_CorrectionChangeSummary'))
    DROP VIEW dbo.vw_CorrectionChangeSummary;
GO

CREATE VIEW dbo.vw_CorrectionChangeSummary AS
SELECT 
    'CONTRACT' AS SubmissionType,
    ccdc.CorrectionRequestId,
    ccr.ContractId AS SubmissionId,
    c.ReferenceNumber AS TransactionNumber,
    ccr.CorrectionCycleNumber,
    COUNT(*) AS TotalFieldsChanged,
    SUM(CASE WHEN ccdc.WasIssueFlagged = 1 THEN 1 ELSE 0 END) AS IssueFlagsAddressed,
    SUM(CASE WHEN ccdc.IsVerified = 1 THEN 1 ELSE 0 END) AS VerifiedChanges,
    SUM(CASE WHEN ccdc.IsVerified = 0 THEN 1 ELSE 0 END) AS UnverifiedChanges,
    MIN(ccdc.ChangedAt) AS FirstChangeAt,
    MAX(ccdc.ChangedAt) AS LastChangeAt
FROM dbo.ContractCorrectionDataChanges ccdc
JOIN dbo.ContractCorrectionRequests ccr ON ccdc.CorrectionRequestId = ccr.CorrectionRequestId
JOIN dbo.ContractsRegister c ON ccr.ContractId = c.ContractId
GROUP BY ccdc.CorrectionRequestId, ccr.ContractId, c.ReferenceNumber, ccr.CorrectionCycleNumber

UNION ALL

SELECT 
    'CORRESPONDENCE' AS SubmissionType,
    ccdc.CorrectionRequestId,
    ccr.CorrespondenceId AS SubmissionId,
    cor.ReferenceNumber AS TransactionNumber,
    ccr.CorrectionCycleNumber,
    COUNT(*) AS TotalFieldsChanged,
    SUM(CASE WHEN ccdc.WasIssueFlagged = 1 THEN 1 ELSE 0 END) AS IssueFlagsAddressed,
    SUM(CASE WHEN ccdc.IsVerified = 1 THEN 1 ELSE 0 END) AS VerifiedChanges,
    SUM(CASE WHEN ccdc.IsVerified = 0 THEN 1 ELSE 0 END) AS UnverifiedChanges,
    MIN(ccdc.ChangedAt) AS FirstChangeAt,
    MAX(ccdc.ChangedAt) AS LastChangeAt
FROM dbo.CorrespondenceCorrectionDataChanges ccdc
JOIN dbo.CorrespondenceCorrectionRequests ccr ON ccdc.CorrectionRequestId = ccr.CorrectionRequestId
JOIN dbo.CorrespondenceRegister cor ON ccr.CorrespondenceId = cor.CorrespondenceId
GROUP BY ccdc.CorrectionRequestId, ccr.CorrespondenceId, cor.ReferenceNumber, ccr.CorrectionCycleNumber;
GO

PRINT 'Correction response tracking schema created successfully';
