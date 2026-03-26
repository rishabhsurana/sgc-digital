-- =============================================
-- SGC Digital - Draft & Failed Submissions Schema
-- MS SQL Server Schema
-- 
-- This script adds tables for:
-- 1. Draft applications (auto-saved while user fills form)
-- 2. Failed submission tracking
-- 3. Resume/retry functionality
-- 4. Submission attempt history
-- =============================================

-- =============================================
-- PART 1: LOOKUP - SUBMISSION STATUS
-- =============================================

CREATE TABLE dbo.LookupSubmissionStatus (
    SubmissionStatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    AllowsRetry BIT NOT NULL DEFAULT 0,
    ShowInDashboard BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

INSERT INTO dbo.LookupSubmissionStatus (StatusCode, StatusName, Description, AllowsRetry, ShowInDashboard, DisplayOrder) VALUES
('DRAFT', 'Draft', 'Application saved as draft - user can continue editing', 1, 1, 1),
('IN_PROGRESS', 'In Progress', 'User is actively working on this application', 1, 1, 2),
('VALIDATION_FAILED', 'Validation Failed', 'Form validation failed - user needs to fix errors', 1, 1, 3),
('SUBMISSION_FAILED', 'Submission Failed', 'Technical error during submission - can retry', 1, 1, 4),
('PENDING_DOCUMENTS', 'Pending Documents', 'Awaiting document upload to complete submission', 1, 1, 5),
('SUBMITTED', 'Submitted', 'Successfully submitted - awaiting processing', 0, 0, 6),
('EXPIRED', 'Expired', 'Draft expired and can no longer be submitted', 0, 1, 7),
('ABANDONED', 'Abandoned', 'User abandoned this application', 0, 0, 8);

-- =============================================
-- PART 2: CONTRACT DRAFTS TABLE
-- =============================================

CREATE TABLE dbo.ContractDrafts (
    DraftId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- User who owns this draft
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Draft identification
    DraftName NVARCHAR(200) NULL, -- Optional user-given name
    TemporaryReference NVARCHAR(50) NOT NULL UNIQUE, -- e.g., DRAFT-CON-2024-ABC123
    
    -- Submission status
    SubmissionStatusId INT NOT NULL REFERENCES dbo.LookupSubmissionStatus(SubmissionStatusId),
    
    -- Form data stored as JSON (complete form state)
    FormData NVARCHAR(MAX) NOT NULL, -- JSON blob of all form fields
    
    -- Validation state
    ValidationErrors NVARCHAR(MAX) NULL, -- JSON array of validation errors
    LastValidatedAt DATETIME2 NULL,
    IsValid BIT NOT NULL DEFAULT 0,
    
    -- Form progress tracking
    CurrentStep INT NOT NULL DEFAULT 1,
    TotalSteps INT NOT NULL DEFAULT 5,
    CompletedSteps NVARCHAR(200) NULL, -- JSON array [1,2,3]
    ProgressPercentage INT NOT NULL DEFAULT 0,
    
    -- Submission attempts
    SubmissionAttempts INT NOT NULL DEFAULT 0,
    LastSubmissionAttemptAt DATETIME2 NULL,
    LastSubmissionError NVARCHAR(MAX) NULL, -- Error message from failed submission
    
    -- If submission succeeded, link to actual contract
    SubmittedContractId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractsRegister(ContractId),
    SubmittedAt DATETIME2 NULL,
    
    -- Expiry (drafts expire after X days)
    ExpiresAt DATETIME2 NOT NULL,
    
    -- Auto-save tracking
    LastAutoSaveAt DATETIME2 NULL,
    AutoSaveVersion INT NOT NULL DEFAULT 1,
    
    -- Device/session info (for multi-device support)
    LastEditedFromDevice NVARCHAR(200) NULL,
    LastEditedFromIP NVARCHAR(50) NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- PART 3: CORRESPONDENCE DRAFTS TABLE
-- =============================================

CREATE TABLE dbo.CorrespondenceDrafts (
    DraftId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- User who owns this draft
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Draft identification
    DraftName NVARCHAR(200) NULL,
    TemporaryReference NVARCHAR(50) NOT NULL UNIQUE, -- e.g., DRAFT-COR-2024-XYZ789
    
    -- Submission status
    SubmissionStatusId INT NOT NULL REFERENCES dbo.LookupSubmissionStatus(SubmissionStatusId),
    
    -- Form data stored as JSON
    FormData NVARCHAR(MAX) NOT NULL,
    
    -- Validation state
    ValidationErrors NVARCHAR(MAX) NULL,
    LastValidatedAt DATETIME2 NULL,
    IsValid BIT NOT NULL DEFAULT 0,
    
    -- Form progress tracking
    CurrentStep INT NOT NULL DEFAULT 1,
    TotalSteps INT NOT NULL DEFAULT 4,
    CompletedSteps NVARCHAR(200) NULL,
    ProgressPercentage INT NOT NULL DEFAULT 0,
    
    -- Submission attempts
    SubmissionAttempts INT NOT NULL DEFAULT 0,
    LastSubmissionAttemptAt DATETIME2 NULL,
    LastSubmissionError NVARCHAR(MAX) NULL,
    
    -- If submission succeeded
    SubmittedCorrespondenceId UNIQUEIDENTIFIER NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    SubmittedAt DATETIME2 NULL,
    
    -- Expiry
    ExpiresAt DATETIME2 NOT NULL,
    
    -- Auto-save tracking
    LastAutoSaveAt DATETIME2 NULL,
    AutoSaveVersion INT NOT NULL DEFAULT 1,
    
    -- Device/session info
    LastEditedFromDevice NVARCHAR(200) NULL,
    LastEditedFromIP NVARCHAR(50) NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- PART 4: DRAFT DOCUMENTS (UPLOADED BUT NOT YET SUBMITTED)
-- =============================================

CREATE TABLE dbo.DraftDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Link to either contract or correspondence draft
    ContractDraftId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractDrafts(DraftId),
    CorrespondenceDraftId UNIQUEIDENTIFIER NULL REFERENCES dbo.CorrespondenceDrafts(DraftId),
    
    -- Document details
    FileName NVARCHAR(255) NOT NULL,
    OriginalFileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(100) NOT NULL,
    FileSize BIGINT NOT NULL,
    FilePath NVARCHAR(500) NOT NULL, -- Temporary storage path
    DocumentTypeId INT NULL, -- From lookup tables
    DocumentTypeCode NVARCHAR(50) NULL, -- e.g., 'FORM_ACCEPT', 'PROC_TENDER'
    
    -- Status
    IsUploaded BIT NOT NULL DEFAULT 1,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- After submission, link to actual document
    SubmittedDocumentId UNIQUEIDENTIFIER NULL,
    
    -- Expiry (temp files expire with draft)
    ExpiresAt DATETIME2 NOT NULL,
    
    CONSTRAINT CHK_DraftDocuments_ParentType CHECK (
        (ContractDraftId IS NOT NULL AND CorrespondenceDraftId IS NULL) OR
        (ContractDraftId IS NULL AND CorrespondenceDraftId IS NOT NULL)
    )
);

-- =============================================
-- PART 5: SUBMISSION ATTEMPT HISTORY
-- =============================================

CREATE TABLE dbo.SubmissionAttempts (
    AttemptId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Link to draft
    ContractDraftId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractDrafts(DraftId),
    CorrespondenceDraftId UNIQUEIDENTIFIER NULL REFERENCES dbo.CorrespondenceDrafts(DraftId),
    
    -- Attempt details
    AttemptNumber INT NOT NULL,
    AttemptedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Result
    WasSuccessful BIT NOT NULL DEFAULT 0,
    
    -- If failed
    ErrorType NVARCHAR(100) NULL, -- 'VALIDATION', 'NETWORK', 'SERVER', 'TIMEOUT', 'DOCUMENT_UPLOAD'
    ErrorCode NVARCHAR(50) NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    ErrorDetails NVARCHAR(MAX) NULL, -- JSON with detailed error info
    
    -- If successful
    SubmittedContractId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractsRegister(ContractId),
    SubmittedCorrespondenceId UNIQUEIDENTIFIER NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    ReferenceNumberAssigned NVARCHAR(50) NULL,
    
    -- Request/response info (for debugging)
    RequestPayloadSize INT NULL,
    ResponseTimeMs INT NULL,
    
    -- Device/client info
    UserAgent NVARCHAR(500) NULL,
    IPAddress NVARCHAR(50) NULL,
    
    CONSTRAINT CHK_SubmissionAttempts_ParentType CHECK (
        (ContractDraftId IS NOT NULL AND CorrespondenceDraftId IS NULL) OR
        (ContractDraftId IS NULL AND CorrespondenceDraftId IS NOT NULL)
    )
);

-- =============================================
-- PART 6: FAILED SUBMISSION NOTIFICATIONS
-- =============================================

CREATE TABLE dbo.FailedSubmissionNotifications (
    NotificationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- User to notify
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Link to draft
    ContractDraftId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractDrafts(DraftId),
    CorrespondenceDraftId UNIQUEIDENTIFIER NULL REFERENCES dbo.CorrespondenceDrafts(DraftId),
    
    -- Notification content
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    
    -- Action links
    RetryUrl NVARCHAR(500) NOT NULL, -- Direct link to resume the draft
    
    -- Status
    IsRead BIT NOT NULL DEFAULT 0,
    ReadAt DATETIME2 NULL,
    IsDismissed BIT NOT NULL DEFAULT 0,
    DismissedAt DATETIME2 NULL,
    
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ExpiresAt DATETIME2 NOT NULL
);

-- =============================================
-- PART 7: ADD FIELDS TO EXISTING REGISTERS
-- =============================================

-- Add draft reference to ContractsRegister
ALTER TABLE dbo.ContractsRegister ADD
    SourceDraftId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractDrafts(DraftId),
    SubmissionAttemptId UNIQUEIDENTIFIER NULL; -- Which attempt succeeded

-- Add draft reference to CorrespondenceRegister  
ALTER TABLE dbo.CorrespondenceRegister ADD
    SourceDraftId UNIQUEIDENTIFIER NULL REFERENCES dbo.CorrespondenceDrafts(DraftId),
    SubmissionAttemptId UNIQUEIDENTIFIER NULL;

-- =============================================
-- PART 8: VIEWS FOR DASHBOARD
-- =============================================

-- View: User's Draft Applications (for dashboard)
CREATE VIEW dbo.vw_UserDraftApplications AS
SELECT 
    'CONTRACT' AS ApplicationType,
    cd.DraftId,
    cd.UserId,
    cd.DraftName,
    cd.TemporaryReference,
    cd.SubmissionStatusId,
    ss.StatusCode,
    ss.StatusName,
    ss.AllowsRetry,
    cd.CurrentStep,
    cd.TotalSteps,
    cd.ProgressPercentage,
    cd.SubmissionAttempts,
    cd.LastSubmissionAttemptAt,
    cd.LastSubmissionError,
    cd.ExpiresAt,
    cd.CreatedAt,
    cd.UpdatedAt,
    '/contracts?draft=' + CAST(cd.DraftId AS NVARCHAR(50)) AS ResumeUrl,
    CASE WHEN cd.ExpiresAt < GETUTCDATE() THEN 1 ELSE 0 END AS IsExpired
FROM dbo.ContractDrafts cd
JOIN dbo.LookupSubmissionStatus ss ON cd.SubmissionStatusId = ss.SubmissionStatusId
WHERE cd.SubmittedContractId IS NULL

UNION ALL

SELECT 
    'CORRESPONDENCE' AS ApplicationType,
    cd.DraftId,
    cd.UserId,
    cd.DraftName,
    cd.TemporaryReference,
    cd.SubmissionStatusId,
    ss.StatusCode,
    ss.StatusName,
    ss.AllowsRetry,
    cd.CurrentStep,
    cd.TotalSteps,
    cd.ProgressPercentage,
    cd.SubmissionAttempts,
    cd.LastSubmissionAttemptAt,
    cd.LastSubmissionError,
    cd.ExpiresAt,
    cd.CreatedAt,
    cd.UpdatedAt,
    '/correspondence?draft=' + CAST(cd.DraftId AS NVARCHAR(50)) AS ResumeUrl,
    CASE WHEN cd.ExpiresAt < GETUTCDATE() THEN 1 ELSE 0 END AS IsExpired
FROM dbo.CorrespondenceDrafts cd
JOIN dbo.LookupSubmissionStatus ss ON cd.SubmissionStatusId = ss.SubmissionStatusId
WHERE cd.SubmittedCorrespondenceId IS NULL;
GO

-- View: Failed Submissions requiring attention
CREATE VIEW dbo.vw_FailedSubmissions AS
SELECT 
    'CONTRACT' AS ApplicationType,
    cd.DraftId,
    cd.UserId,
    up.Email AS UserEmail,
    up.FirstName + ' ' + up.LastName AS UserName,
    cd.DraftName,
    cd.TemporaryReference,
    cd.SubmissionAttempts,
    cd.LastSubmissionAttemptAt,
    cd.LastSubmissionError,
    sa.ErrorType,
    sa.ErrorCode,
    cd.ExpiresAt,
    '/contracts?draft=' + CAST(cd.DraftId AS NVARCHAR(50)) AS RetryUrl
FROM dbo.ContractDrafts cd
JOIN dbo.UserProfiles up ON cd.UserId = up.UserId
LEFT JOIN dbo.SubmissionAttempts sa ON cd.DraftId = sa.ContractDraftId 
    AND sa.AttemptNumber = cd.SubmissionAttempts
WHERE cd.SubmissionStatusId IN (
    SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus 
    WHERE StatusCode IN ('SUBMISSION_FAILED', 'VALIDATION_FAILED')
)
AND cd.SubmittedContractId IS NULL
AND cd.ExpiresAt > GETUTCDATE()

UNION ALL

SELECT 
    'CORRESPONDENCE' AS ApplicationType,
    cd.DraftId,
    cd.UserId,
    up.Email AS UserEmail,
    up.FirstName + ' ' + up.LastName AS UserName,
    cd.DraftName,
    cd.TemporaryReference,
    cd.SubmissionAttempts,
    cd.LastSubmissionAttemptAt,
    cd.LastSubmissionError,
    sa.ErrorType,
    sa.ErrorCode,
    cd.ExpiresAt,
    '/correspondence?draft=' + CAST(cd.DraftId AS NVARCHAR(50)) AS RetryUrl
FROM dbo.CorrespondenceDrafts cd
JOIN dbo.UserProfiles up ON cd.UserId = up.UserId
LEFT JOIN dbo.SubmissionAttempts sa ON cd.DraftId = sa.CorrespondenceDraftId 
    AND sa.AttemptNumber = cd.SubmissionAttempts
WHERE cd.SubmissionStatusId IN (
    SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus 
    WHERE StatusCode IN ('SUBMISSION_FAILED', 'VALIDATION_FAILED')
)
AND cd.SubmittedCorrespondenceId IS NULL
AND cd.ExpiresAt > GETUTCDATE();
GO

-- =============================================
-- PART 9: STORED PROCEDURE - SAVE DRAFT
-- =============================================

CREATE PROCEDURE dbo.sp_SaveContractDraft
    @UserId UNIQUEIDENTIFIER,
    @DraftId UNIQUEIDENTIFIER = NULL OUTPUT,
    @FormData NVARCHAR(MAX),
    @CurrentStep INT = 1,
    @DraftName NVARCHAR(200) = NULL,
    @DeviceInfo NVARCHAR(200) = NULL,
    @IPAddress NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @StatusId INT;
    SELECT @StatusId = SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'DRAFT';
    
    IF @DraftId IS NULL
    BEGIN
        -- Create new draft
        SET @DraftId = NEWID();
        
        INSERT INTO dbo.ContractDrafts (
            DraftId, UserId, DraftName, TemporaryReference, SubmissionStatusId,
            FormData, CurrentStep, ExpiresAt, LastAutoSaveAt, 
            LastEditedFromDevice, LastEditedFromIP
        )
        VALUES (
            @DraftId, @UserId, @DraftName,
            'DRAFT-CON-' + FORMAT(GETUTCDATE(), 'yyyy') + '-' + UPPER(LEFT(REPLACE(CAST(NEWID() AS NVARCHAR(50)), '-', ''), 8)),
            @StatusId,
            @FormData, @CurrentStep,
            DATEADD(DAY, 30, GETUTCDATE()), -- Drafts expire in 30 days
            GETUTCDATE(), @DeviceInfo, @IPAddress
        );
    END
    ELSE
    BEGIN
        -- Update existing draft
        UPDATE dbo.ContractDrafts
        SET FormData = @FormData,
            CurrentStep = @CurrentStep,
            DraftName = COALESCE(@DraftName, DraftName),
            LastAutoSaveAt = GETUTCDATE(),
            AutoSaveVersion = AutoSaveVersion + 1,
            LastEditedFromDevice = @DeviceInfo,
            LastEditedFromIP = @IPAddress,
            UpdatedAt = GETUTCDATE()
        WHERE DraftId = @DraftId AND UserId = @UserId;
    END
    
    SELECT @DraftId AS DraftId;
END;
GO

-- =============================================
-- PART 10: STORED PROCEDURE - RECORD SUBMISSION ATTEMPT
-- =============================================

CREATE PROCEDURE dbo.sp_RecordSubmissionAttempt
    @ContractDraftId UNIQUEIDENTIFIER = NULL,
    @CorrespondenceDraftId UNIQUEIDENTIFIER = NULL,
    @WasSuccessful BIT,
    @ErrorType NVARCHAR(100) = NULL,
    @ErrorCode NVARCHAR(50) = NULL,
    @ErrorMessage NVARCHAR(MAX) = NULL,
    @SubmittedId UNIQUEIDENTIFIER = NULL,
    @ReferenceNumber NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @IPAddress NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @AttemptNumber INT;
    DECLARE @UserId UNIQUEIDENTIFIER;
    DECLARE @DraftName NVARCHAR(200);
    DECLARE @TempRef NVARCHAR(50);
    
    IF @ContractDraftId IS NOT NULL
    BEGIN
        SELECT @AttemptNumber = SubmissionAttempts + 1, @UserId = UserId, 
               @DraftName = DraftName, @TempRef = TemporaryReference
        FROM dbo.ContractDrafts WHERE DraftId = @ContractDraftId;
        
        -- Update draft
        UPDATE dbo.ContractDrafts
        SET SubmissionAttempts = @AttemptNumber,
            LastSubmissionAttemptAt = GETUTCDATE(),
            LastSubmissionError = CASE WHEN @WasSuccessful = 0 THEN @ErrorMessage ELSE NULL END,
            SubmissionStatusId = CASE 
                WHEN @WasSuccessful = 1 THEN (SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'SUBMITTED')
                WHEN @ErrorType = 'VALIDATION' THEN (SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'VALIDATION_FAILED')
                ELSE (SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'SUBMISSION_FAILED')
            END,
            SubmittedContractId = @SubmittedId,
            SubmittedAt = CASE WHEN @WasSuccessful = 1 THEN GETUTCDATE() ELSE NULL END,
            UpdatedAt = GETUTCDATE()
        WHERE DraftId = @ContractDraftId;
    END
    ELSE IF @CorrespondenceDraftId IS NOT NULL
    BEGIN
        SELECT @AttemptNumber = SubmissionAttempts + 1, @UserId = UserId,
               @DraftName = DraftName, @TempRef = TemporaryReference
        FROM dbo.CorrespondenceDrafts WHERE DraftId = @CorrespondenceDraftId;
        
        -- Update draft
        UPDATE dbo.CorrespondenceDrafts
        SET SubmissionAttempts = @AttemptNumber,
            LastSubmissionAttemptAt = GETUTCDATE(),
            LastSubmissionError = CASE WHEN @WasSuccessful = 0 THEN @ErrorMessage ELSE NULL END,
            SubmissionStatusId = CASE 
                WHEN @WasSuccessful = 1 THEN (SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'SUBMITTED')
                WHEN @ErrorType = 'VALIDATION' THEN (SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'VALIDATION_FAILED')
                ELSE (SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'SUBMISSION_FAILED')
            END,
            SubmittedCorrespondenceId = @SubmittedId,
            SubmittedAt = CASE WHEN @WasSuccessful = 1 THEN GETUTCDATE() ELSE NULL END,
            UpdatedAt = GETUTCDATE()
        WHERE DraftId = @CorrespondenceDraftId;
    END
    
    -- Record attempt
    INSERT INTO dbo.SubmissionAttempts (
        ContractDraftId, CorrespondenceDraftId, AttemptNumber, WasSuccessful,
        ErrorType, ErrorCode, ErrorMessage,
        SubmittedContractId, SubmittedCorrespondenceId, ReferenceNumberAssigned,
        UserAgent, IPAddress
    )
    VALUES (
        @ContractDraftId, @CorrespondenceDraftId, @AttemptNumber, @WasSuccessful,
        @ErrorType, @ErrorCode, @ErrorMessage,
        CASE WHEN @ContractDraftId IS NOT NULL THEN @SubmittedId ELSE NULL END,
        CASE WHEN @CorrespondenceDraftId IS NOT NULL THEN @SubmittedId ELSE NULL END,
        @ReferenceNumber,
        @UserAgent, @IPAddress
    );
    
    -- Create notification for failed submission
    IF @WasSuccessful = 0 AND @UserId IS NOT NULL
    BEGIN
        INSERT INTO dbo.FailedSubmissionNotifications (
            UserId, ContractDraftId, CorrespondenceDraftId,
            Title, Message, RetryUrl, ExpiresAt
        )
        VALUES (
            @UserId, @ContractDraftId, @CorrespondenceDraftId,
            'Submission Unsuccessful - Action Required',
            'We''re sorry, your application "' + COALESCE(@DraftName, @TempRef) + '" could not be submitted. ' +
            'Error: ' + COALESCE(@ErrorMessage, 'Unknown error') + '. ' +
            'Please click the link below to resume your application and try again.',
            CASE 
                WHEN @ContractDraftId IS NOT NULL THEN '/contracts?draft=' + CAST(@ContractDraftId AS NVARCHAR(50))
                ELSE '/correspondence?draft=' + CAST(@CorrespondenceDraftId AS NVARCHAR(50))
            END,
            DATEADD(DAY, 30, GETUTCDATE())
        );
    END
END;
GO

-- =============================================
-- PART 11: INDEXES
-- =============================================

CREATE INDEX IX_ContractDrafts_UserId ON dbo.ContractDrafts(UserId);
CREATE INDEX IX_ContractDrafts_SubmissionStatusId ON dbo.ContractDrafts(SubmissionStatusId);
CREATE INDEX IX_ContractDrafts_ExpiresAt ON dbo.ContractDrafts(ExpiresAt);

CREATE INDEX IX_CorrespondenceDrafts_UserId ON dbo.CorrespondenceDrafts(UserId);
CREATE INDEX IX_CorrespondenceDrafts_SubmissionStatusId ON dbo.CorrespondenceDrafts(SubmissionStatusId);
CREATE INDEX IX_CorrespondenceDrafts_ExpiresAt ON dbo.CorrespondenceDrafts(ExpiresAt);

CREATE INDEX IX_DraftDocuments_ContractDraftId ON dbo.DraftDocuments(ContractDraftId);
CREATE INDEX IX_DraftDocuments_CorrespondenceDraftId ON dbo.DraftDocuments(CorrespondenceDraftId);

CREATE INDEX IX_SubmissionAttempts_ContractDraftId ON dbo.SubmissionAttempts(ContractDraftId);
CREATE INDEX IX_SubmissionAttempts_CorrespondenceDraftId ON dbo.SubmissionAttempts(CorrespondenceDraftId);

CREATE INDEX IX_FailedSubmissionNotifications_UserId ON dbo.FailedSubmissionNotifications(UserId);
CREATE INDEX IX_FailedSubmissionNotifications_IsRead ON dbo.FailedSubmissionNotifications(IsRead);

-- =============================================
-- PART 12: SCHEDULED JOB - EXPIRE OLD DRAFTS
-- =============================================
-- Note: This would be run as a SQL Server Agent job daily

-- CREATE PROCEDURE dbo.sp_ExpireOldDrafts
-- AS
-- BEGIN
--     -- Mark expired drafts
--     UPDATE dbo.ContractDrafts
--     SET SubmissionStatusId = (SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'EXPIRED')
--     WHERE ExpiresAt < GETUTCDATE()
--     AND SubmissionStatusId NOT IN (
--         SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode IN ('SUBMITTED', 'EXPIRED')
--     );
--     
--     UPDATE dbo.CorrespondenceDrafts
--     SET SubmissionStatusId = (SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode = 'EXPIRED')
--     WHERE ExpiresAt < GETUTCDATE()
--     AND SubmissionStatusId NOT IN (
--         SELECT SubmissionStatusId FROM dbo.LookupSubmissionStatus WHERE StatusCode IN ('SUBMITTED', 'EXPIRED')
--     );
-- END;
