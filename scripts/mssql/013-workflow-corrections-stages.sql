-- =============================================
-- SGC Digital - Workflow, Corrections & Stage Duration Tracking
-- MS SQL Server Schema
-- =============================================
-- This script adds comprehensive tracking for:
-- 1. Status updates with detailed history
-- 2. Return for corrections workflow
-- 3. Stage duration tracking
-- 4. Correction cycles and responses
-- =============================================

-- =============================================
-- 1. LOOKUP TABLE: Correction Reasons
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.LookupCorrectionReasons') AND type = 'U')
CREATE TABLE dbo.LookupCorrectionReasons (
    CorrectionReasonId INT IDENTITY(1,1) PRIMARY KEY,
    ReasonCode NVARCHAR(50) NOT NULL UNIQUE,
    ReasonName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    AppliesTo NVARCHAR(50) NOT NULL DEFAULT 'ALL', -- 'CONTRACTS', 'CORRESPONDENCE', 'ALL'
    DefaultDeadlineDays INT NOT NULL DEFAULT 7, -- Days given to submit corrections
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Seed correction reasons
INSERT INTO dbo.LookupCorrectionReasons (ReasonCode, ReasonName, Description, AppliesTo, DefaultDeadlineDays, SortOrder) VALUES
('MISSING_DOCS', 'Missing Documents', 'Required documents are missing or incomplete', 'ALL', 7, 1),
('INVALID_DOCS', 'Invalid Documents', 'Documents provided are invalid, expired, or unreadable', 'ALL', 7, 2),
('INCOMPLETE_INFO', 'Incomplete Information', 'Form fields are incomplete or missing required information', 'ALL', 5, 3),
('INCORRECT_INFO', 'Incorrect Information', 'Information provided contains errors or inconsistencies', 'ALL', 5, 4),
('FORMATTING_ISSUES', 'Formatting Issues', 'Documents or information do not meet formatting requirements', 'ALL', 3, 5),
('SIGNATURE_REQUIRED', 'Signature Required', 'Missing required signatures or authorizations', 'ALL', 5, 6),
('VALUE_DISCREPANCY', 'Value Discrepancy', 'Contract values do not match supporting documents', 'CONTRACTS', 5, 7),
('SCOPE_UNCLEAR', 'Scope Unclear', 'Scope of work or deliverables needs clarification', 'CONTRACTS', 7, 8),
('LEGAL_ISSUES', 'Legal Issues', 'Legal concerns that need to be addressed', 'ALL', 10, 9),
('COMPLIANCE_ISSUES', 'Compliance Issues', 'Does not meet regulatory or policy requirements', 'ALL', 10, 10),
('PROCUREMENT_ISSUES', 'Procurement Issues', 'Procurement process documentation incomplete', 'CONTRACTS', 7, 11),
('COURT_INFO_NEEDED', 'Court Information Needed', 'Additional court case information required', 'CORRESPONDENCE', 5, 12),
('OTHER', 'Other', 'Other reasons requiring correction', 'ALL', 7, 99);

-- =============================================
-- 2. LOOKUP TABLE: Workflow Stages
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.LookupWorkflowStages') AND type = 'U')
CREATE TABLE dbo.LookupWorkflowStages (
    StageId INT IDENTITY(1,1) PRIMARY KEY,
    StageCode NVARCHAR(50) NOT NULL UNIQUE,
    StageName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    AppliesTo NVARCHAR(50) NOT NULL DEFAULT 'ALL', -- 'CONTRACTS', 'CORRESPONDENCE', 'ALL'
    StageOrder INT NOT NULL, -- Order in workflow
    ExpectedDurationDays INT NULL, -- Expected time to complete this stage
    SLADays INT NULL, -- SLA deadline for this stage
    AllowsCorrections BIT NOT NULL DEFAULT 0, -- Can corrections be requested at this stage?
    IsTerminal BIT NOT NULL DEFAULT 0, -- Is this a final stage?
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Seed workflow stages
INSERT INTO dbo.LookupWorkflowStages (StageCode, StageName, Description, AppliesTo, StageOrder, ExpectedDurationDays, SLADays, AllowsCorrections, IsTerminal) VALUES
-- Submission stages
('DRAFT', 'Draft', 'Application being prepared', 'ALL', 0, NULL, NULL, 0, 0),
('SUBMITTED', 'Submitted', 'Application submitted, awaiting initial review', 'ALL', 1, 1, 2, 0, 0),

-- Initial Review stages
('INITIAL_REVIEW', 'Initial Review', 'Initial document and completeness check', 'ALL', 2, 2, 3, 1, 0),
('AWAITING_CORRECTIONS', 'Awaiting Corrections', 'Returned to applicant for corrections', 'ALL', 3, NULL, NULL, 0, 0),
('CORRECTIONS_SUBMITTED', 'Corrections Submitted', 'Corrections submitted, awaiting re-review', 'ALL', 4, 1, 2, 0, 0),

-- Processing stages - Correspondence
('LEGAL_RESEARCH', 'Legal Research', 'Legal research being conducted', 'CORRESPONDENCE', 5, 5, 10, 0, 0),
('DRAFTING_RESPONSE', 'Drafting Response', 'Response being drafted', 'CORRESPONDENCE', 6, 3, 5, 0, 0),
('INTERNAL_REVIEW', 'Internal Review', 'Under internal review', 'ALL', 7, 2, 3, 1, 0),

-- Processing stages - Contracts
('LEGAL_REVIEW', 'Legal Review', 'Contract under legal review', 'CONTRACTS', 5, 5, 10, 1, 0),
('NEGOTIATION', 'Negotiation', 'Contract terms being negotiated', 'CONTRACTS', 6, 5, 15, 0, 0),
('FINAL_REVIEW', 'Final Review', 'Final review before approval', 'CONTRACTS', 7, 2, 3, 1, 0),

-- Approval stages
('PENDING_APPROVAL', 'Pending Approval', 'Awaiting final approval', 'ALL', 8, 2, 3, 0, 0),
('APPROVED', 'Approved', 'Application/Contract approved', 'ALL', 9, 1, 1, 0, 0),

-- Completion stages
('EXECUTION', 'Execution', 'Contract being executed/signed', 'CONTRACTS', 10, 3, 5, 0, 0),
('COMPLETED', 'Completed', 'Process completed successfully', 'ALL', 11, 0, 0, 0, 1),
('REJECTED', 'Rejected', 'Application rejected', 'ALL', 99, 0, 0, 0, 1),
('WITHDRAWN', 'Withdrawn', 'Withdrawn by applicant', 'ALL', 98, 0, 0, 0, 1),
('EXPIRED', 'Expired', 'Corrections deadline expired', 'ALL', 97, 0, 0, 0, 1);

-- =============================================
-- 3. ENHANCED CONTRACT STATUS HISTORY
-- =============================================
-- Add new columns to existing ContractStatusHistory if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.ContractStatusHistory') AND name = 'StageId')
BEGIN
    ALTER TABLE dbo.ContractStatusHistory ADD StageId INT NULL;
    ALTER TABLE dbo.ContractStatusHistory ADD PreviousStageId INT NULL;
    ALTER TABLE dbo.ContractStatusHistory ADD StageDurationMinutes INT NULL; -- Time spent in previous stage
    ALTER TABLE dbo.ContractStatusHistory ADD StageDurationBusinessDays DECIMAL(5,2) NULL;
    ALTER TABLE dbo.ContractStatusHistory ADD WasOverdue BIT NULL DEFAULT 0;
    ALTER TABLE dbo.ContractStatusHistory ADD DaysOverdue INT NULL DEFAULT 0;
    ALTER TABLE dbo.ContractStatusHistory ADD IsCorrection BIT NOT NULL DEFAULT 0;
    ALTER TABLE dbo.ContractStatusHistory ADD CorrectionCycleNumber INT NULL; -- Which correction cycle (1st, 2nd, etc.)
END

-- =============================================
-- 4. ENHANCED CORRESPONDENCE STATUS HISTORY
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.CorrespondenceStatusHistory') AND name = 'StageId')
BEGIN
    ALTER TABLE dbo.CorrespondenceStatusHistory ADD StageId INT NULL;
    ALTER TABLE dbo.CorrespondenceStatusHistory ADD PreviousStageId INT NULL;
    ALTER TABLE dbo.CorrespondenceStatusHistory ADD StageDurationMinutes INT NULL;
    ALTER TABLE dbo.CorrespondenceStatusHistory ADD StageDurationBusinessDays DECIMAL(5,2) NULL;
    ALTER TABLE dbo.CorrespondenceStatusHistory ADD WasOverdue BIT NULL DEFAULT 0;
    ALTER TABLE dbo.CorrespondenceStatusHistory ADD DaysOverdue INT NULL DEFAULT 0;
    ALTER TABLE dbo.CorrespondenceStatusHistory ADD IsCorrection BIT NOT NULL DEFAULT 0;
    ALTER TABLE dbo.CorrespondenceStatusHistory ADD CorrectionCycleNumber INT NULL;
END

-- =============================================
-- 5. CONTRACT CORRECTION REQUESTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.ContractCorrectionRequests') AND type = 'U')
CREATE TABLE dbo.ContractCorrectionRequests (
    CorrectionRequestId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    
    -- Correction Cycle
    CorrectionCycleNumber INT NOT NULL DEFAULT 1, -- 1st correction, 2nd correction, etc.
    
    -- Reasons for correction (can have multiple)
    PrimaryCorrectionReasonId INT NOT NULL REFERENCES dbo.LookupCorrectionReasons(CorrectionReasonId),
    AdditionalReasonIds NVARCHAR(MAX) NULL, -- JSON array of additional reason IDs
    
    -- Detailed instructions
    CorrectionInstructions NVARCHAR(MAX) NOT NULL, -- What needs to be corrected
    SpecificIssues NVARCHAR(MAX) NULL, -- JSON array of specific issues
    AffectedDocuments NVARCHAR(MAX) NULL, -- JSON array of document IDs that need correction
    AffectedSections NVARCHAR(MAX) NULL, -- JSON array of form sections that need correction
    
    -- Deadlines
    RequestedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DeadlineDate DATETIME2 NOT NULL, -- When corrections must be submitted by
    ExtendedDeadlineDate DATETIME2 NULL, -- If deadline was extended
    ExtensionReason NVARCHAR(500) NULL,
    
    -- Status
    Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SUBMITTED, ACCEPTED, REJECTED, EXPIRED
    
    -- Response from applicant
    ResponseSubmittedAt DATETIME2 NULL,
    ApplicantComments NVARCHAR(MAX) NULL, -- Comments from applicant about corrections made
    
    -- Review of corrections
    ReviewedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    ReviewedAt DATETIME2 NULL,
    ReviewComments NVARCHAR(MAX) NULL,
    WereCorrectionsAccepted BIT NULL, -- Did corrections meet requirements?
    RejectionReason NVARCHAR(MAX) NULL, -- If corrections were rejected
    
    -- Request details
    RequestedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 6. CORRESPONDENCE CORRECTION REQUESTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.CorrespondenceCorrectionRequests') AND type = 'U')
CREATE TABLE dbo.CorrespondenceCorrectionRequests (
    CorrectionRequestId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    
    CorrectionCycleNumber INT NOT NULL DEFAULT 1,
    
    PrimaryCorrectionReasonId INT NOT NULL REFERENCES dbo.LookupCorrectionReasons(CorrectionReasonId),
    AdditionalReasonIds NVARCHAR(MAX) NULL,
    
    CorrectionInstructions NVARCHAR(MAX) NOT NULL,
    SpecificIssues NVARCHAR(MAX) NULL,
    AffectedDocuments NVARCHAR(MAX) NULL,
    AffectedSections NVARCHAR(MAX) NULL,
    
    RequestedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DeadlineDate DATETIME2 NOT NULL,
    ExtendedDeadlineDate DATETIME2 NULL,
    ExtensionReason NVARCHAR(500) NULL,
    
    Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    
    ResponseSubmittedAt DATETIME2 NULL,
    ApplicantComments NVARCHAR(MAX) NULL,
    
    ReviewedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    ReviewedAt DATETIME2 NULL,
    ReviewComments NVARCHAR(MAX) NULL,
    WereCorrectionsAccepted BIT NULL,
    RejectionReason NVARCHAR(MAX) NULL,
    
    RequestedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 7. CORRECTION DOCUMENTS (Documents submitted as corrections)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.CorrectionDocuments') AND type = 'U')
CREATE TABLE dbo.CorrectionDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Link to either contract or correspondence correction request
    ContractCorrectionRequestId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractCorrectionRequests(CorrectionRequestId),
    CorrespondenceCorrectionRequestId UNIQUEIDENTIFIER NULL REFERENCES dbo.CorrespondenceCorrectionRequests(CorrectionRequestId),
    
    -- Document being replaced (if applicable)
    ReplacesDocumentId UNIQUEIDENTIFIER NULL, -- ID of original document being replaced
    
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(100) NOT NULL,
    FileSize BIGINT NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    DocumentType NVARCHAR(100) NULL,
    Description NVARCHAR(500) NULL,
    
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT CHK_CorrectionDoc_OneParent CHECK (
        (ContractCorrectionRequestId IS NOT NULL AND CorrespondenceCorrectionRequestId IS NULL) OR
        (ContractCorrectionRequestId IS NULL AND CorrespondenceCorrectionRequestId IS NOT NULL)
    )
);

-- =============================================
-- 8. STAGE DURATION TRACKING
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.ContractStageDurations') AND type = 'U')
CREATE TABLE dbo.ContractStageDurations (
    StageDurationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    
    StageId INT NOT NULL REFERENCES dbo.LookupWorkflowStages(StageId),
    
    -- Timing
    EnteredAt DATETIME2 NOT NULL,
    ExitedAt DATETIME2 NULL, -- NULL if still in this stage
    
    -- Duration calculations
    DurationMinutes INT NULL, -- Calculated when exited
    DurationBusinessDays DECIMAL(5,2) NULL,
    
    -- SLA tracking
    SLADeadline DATETIME2 NULL,
    WasOverdue BIT NOT NULL DEFAULT 0,
    MinutesOverdue INT NULL,
    DaysOverdue INT NULL,
    
    -- Assignment during this stage
    AssignedTo UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- How the stage ended
    ExitReason NVARCHAR(100) NULL, -- 'COMPLETED', 'ESCALATED', 'RETURNED_FOR_CORRECTIONS', 'REASSIGNED'
    ExitedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.CorrespondenceStageDurations') AND type = 'U')
CREATE TABLE dbo.CorrespondenceStageDurations (
    StageDurationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    
    StageId INT NOT NULL REFERENCES dbo.LookupWorkflowStages(StageId),
    
    EnteredAt DATETIME2 NOT NULL,
    ExitedAt DATETIME2 NULL,
    
    DurationMinutes INT NULL,
    DurationBusinessDays DECIMAL(5,2) NULL,
    
    SLADeadline DATETIME2 NULL,
    WasOverdue BIT NOT NULL DEFAULT 0,
    MinutesOverdue INT NULL,
    DaysOverdue INT NULL,
    
    AssignedTo UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    ExitReason NVARCHAR(100) NULL,
    ExitedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 9. ADD CORRECTION TRACKING FIELDS TO MAIN TABLES
-- =============================================

-- Add fields to ContractsRegister
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.ContractsRegister') AND name = 'CurrentStageId')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD CurrentStageId INT NULL;
    ALTER TABLE dbo.ContractsRegister ADD StageEnteredAt DATETIME2 NULL;
    ALTER TABLE dbo.ContractsRegister ADD TotalCorrectionCycles INT NOT NULL DEFAULT 0;
    ALTER TABLE dbo.ContractsRegister ADD IsAwaitingCorrections BIT NOT NULL DEFAULT 0;
    ALTER TABLE dbo.ContractsRegister ADD CorrectionDeadline DATETIME2 NULL;
    ALTER TABLE dbo.ContractsRegister ADD LastCorrectionRequestId UNIQUEIDENTIFIER NULL;
    ALTER TABLE dbo.ContractsRegister ADD TotalProcessingDays INT NULL;
    ALTER TABLE dbo.ContractsRegister ADD TotalBusinessDays DECIMAL(5,2) NULL;
END

-- Add fields to CorrespondenceRegister  
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.CorrespondenceRegister') AND name = 'CurrentStageId')
BEGIN
    ALTER TABLE dbo.CorrespondenceRegister ADD CurrentStageId INT NULL;
    ALTER TABLE dbo.CorrespondenceRegister ADD StageEnteredAt DATETIME2 NULL;
    ALTER TABLE dbo.CorrespondenceRegister ADD TotalCorrectionCycles INT NOT NULL DEFAULT 0;
    ALTER TABLE dbo.CorrespondenceRegister ADD IsAwaitingCorrections BIT NOT NULL DEFAULT 0;
    ALTER TABLE dbo.CorrespondenceRegister ADD CorrectionDeadline DATETIME2 NULL;
    ALTER TABLE dbo.CorrespondenceRegister ADD LastCorrectionRequestId UNIQUEIDENTIFIER NULL;
    ALTER TABLE dbo.CorrespondenceRegister ADD TotalProcessingDays INT NULL;
    ALTER TABLE dbo.CorrespondenceRegister ADD TotalBusinessDays DECIMAL(5,2) NULL;
END

-- =============================================
-- 10. INDEXES
-- =============================================
CREATE INDEX IX_ContractCorrectionRequests_ContractId ON dbo.ContractCorrectionRequests(ContractId);
CREATE INDEX IX_ContractCorrectionRequests_Status ON dbo.ContractCorrectionRequests(Status);
CREATE INDEX IX_ContractCorrectionRequests_DeadlineDate ON dbo.ContractCorrectionRequests(DeadlineDate);

CREATE INDEX IX_CorrespondenceCorrectionRequests_CorrespondenceId ON dbo.CorrespondenceCorrectionRequests(CorrespondenceId);
CREATE INDEX IX_CorrespondenceCorrectionRequests_Status ON dbo.CorrespondenceCorrectionRequests(Status);
CREATE INDEX IX_CorrespondenceCorrectionRequests_DeadlineDate ON dbo.CorrespondenceCorrectionRequests(DeadlineDate);

CREATE INDEX IX_ContractStageDurations_ContractId ON dbo.ContractStageDurations(ContractId);
CREATE INDEX IX_ContractStageDurations_StageId ON dbo.ContractStageDurations(StageId);
CREATE INDEX IX_ContractStageDurations_WasOverdue ON dbo.ContractStageDurations(WasOverdue);

CREATE INDEX IX_CorrespondenceStageDurations_CorrespondenceId ON dbo.CorrespondenceStageDurations(CorrespondenceId);
CREATE INDEX IX_CorrespondenceStageDurations_StageId ON dbo.CorrespondenceStageDurations(StageId);

CREATE INDEX IX_CorrectionDocuments_ContractCorrectionRequestId ON dbo.CorrectionDocuments(ContractCorrectionRequestId);
CREATE INDEX IX_CorrectionDocuments_CorrespondenceCorrectionRequestId ON dbo.CorrectionDocuments(CorrespondenceCorrectionRequestId);

-- =============================================
-- 11. VIEWS FOR REPORTING
-- =============================================

-- View: Current stage status for all contracts
CREATE OR ALTER VIEW dbo.vw_ContractCurrentStage AS
SELECT 
    c.ContractId,
    c.ReferenceNumber,
    c.ContractTitle,
    c.CurrentStageId,
    ws.StageCode,
    ws.StageName,
    c.StageEnteredAt,
    DATEDIFF(MINUTE, c.StageEnteredAt, GETUTCDATE()) as MinutesInCurrentStage,
    CAST(DATEDIFF(MINUTE, c.StageEnteredAt, GETUTCDATE()) / 60.0 / 24.0 AS DECIMAL(5,2)) as DaysInCurrentStage,
    ws.SLADays,
    CASE 
        WHEN ws.SLADays IS NOT NULL AND DATEDIFF(DAY, c.StageEnteredAt, GETUTCDATE()) > ws.SLADays THEN 1 
        ELSE 0 
    END as IsOverdue,
    c.IsAwaitingCorrections,
    c.CorrectionDeadline,
    c.TotalCorrectionCycles,
    c.TotalProcessingDays
FROM dbo.ContractsRegister c
LEFT JOIN dbo.LookupWorkflowStages ws ON c.CurrentStageId = ws.StageId;

-- View: Current stage status for all correspondence
CREATE OR ALTER VIEW dbo.vw_CorrespondenceCurrentStage AS
SELECT 
    c.CorrespondenceId,
    c.ReferenceNumber,
    c.Subject,
    c.CurrentStageId,
    ws.StageCode,
    ws.StageName,
    c.StageEnteredAt,
    DATEDIFF(MINUTE, c.StageEnteredAt, GETUTCDATE()) as MinutesInCurrentStage,
    CAST(DATEDIFF(MINUTE, c.StageEnteredAt, GETUTCDATE()) / 60.0 / 24.0 AS DECIMAL(5,2)) as DaysInCurrentStage,
    ws.SLADays,
    CASE 
        WHEN ws.SLADays IS NOT NULL AND DATEDIFF(DAY, c.StageEnteredAt, GETUTCDATE()) > ws.SLADays THEN 1 
        ELSE 0 
    END as IsOverdue,
    c.IsAwaitingCorrections,
    c.CorrectionDeadline,
    c.TotalCorrectionCycles,
    c.TotalProcessingDays
FROM dbo.CorrespondenceRegister c
LEFT JOIN dbo.LookupWorkflowStages ws ON c.CurrentStageId = ws.StageId;

-- View: Pending corrections (combined)
CREATE OR ALTER VIEW dbo.vw_PendingCorrections AS
SELECT 
    'CONTRACT' as Type,
    c.ContractId as RecordId,
    c.ReferenceNumber,
    c.ContractTitle as Title,
    cr.CorrectionRequestId,
    cr.CorrectionCycleNumber,
    lr.ReasonName as PrimaryReason,
    cr.CorrectionInstructions,
    cr.DeadlineDate,
    DATEDIFF(DAY, GETUTCDATE(), cr.DeadlineDate) as DaysUntilDeadline,
    CASE WHEN cr.DeadlineDate < GETUTCDATE() THEN 1 ELSE 0 END as IsOverdue,
    cr.Status,
    cr.RequestedAt,
    u.FirstName + ' ' + u.LastName as RequestedBy
FROM dbo.ContractCorrectionRequests cr
JOIN dbo.ContractsRegister c ON cr.ContractId = c.ContractId
JOIN dbo.LookupCorrectionReasons lr ON cr.PrimaryCorrectionReasonId = lr.CorrectionReasonId
JOIN dbo.UserProfiles u ON cr.RequestedBy = u.UserId
WHERE cr.Status = 'PENDING'

UNION ALL

SELECT 
    'CORRESPONDENCE' as Type,
    c.CorrespondenceId as RecordId,
    c.ReferenceNumber,
    c.Subject as Title,
    cr.CorrectionRequestId,
    cr.CorrectionCycleNumber,
    lr.ReasonName as PrimaryReason,
    cr.CorrectionInstructions,
    cr.DeadlineDate,
    DATEDIFF(DAY, GETUTCDATE(), cr.DeadlineDate) as DaysUntilDeadline,
    CASE WHEN cr.DeadlineDate < GETUTCDATE() THEN 1 ELSE 0 END as IsOverdue,
    cr.Status,
    cr.RequestedAt,
    u.FirstName + ' ' + u.LastName as RequestedBy
FROM dbo.CorrespondenceCorrectionRequests cr
JOIN dbo.CorrespondenceRegister c ON cr.CorrespondenceId = c.CorrespondenceId
JOIN dbo.LookupCorrectionReasons lr ON cr.PrimaryCorrectionReasonId = lr.CorrectionReasonId
JOIN dbo.UserProfiles u ON cr.RequestedBy = u.UserId
WHERE cr.Status = 'PENDING';

-- View: Stage duration analytics
CREATE OR ALTER VIEW dbo.vw_StageDurationAnalytics AS
SELECT 
    'CONTRACT' as RecordType,
    ws.StageCode,
    ws.StageName,
    COUNT(*) as TotalRecords,
    AVG(sd.DurationMinutes) as AvgDurationMinutes,
    AVG(sd.DurationBusinessDays) as AvgDurationBusinessDays,
    MIN(sd.DurationMinutes) as MinDurationMinutes,
    MAX(sd.DurationMinutes) as MaxDurationMinutes,
    SUM(CASE WHEN sd.WasOverdue = 1 THEN 1 ELSE 0 END) as OverdueCount,
    CAST(SUM(CASE WHEN sd.WasOverdue = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as OverduePercentage
FROM dbo.ContractStageDurations sd
JOIN dbo.LookupWorkflowStages ws ON sd.StageId = ws.StageId
WHERE sd.ExitedAt IS NOT NULL
GROUP BY ws.StageCode, ws.StageName

UNION ALL

SELECT 
    'CORRESPONDENCE' as RecordType,
    ws.StageCode,
    ws.StageName,
    COUNT(*) as TotalRecords,
    AVG(sd.DurationMinutes) as AvgDurationMinutes,
    AVG(sd.DurationBusinessDays) as AvgDurationBusinessDays,
    MIN(sd.DurationMinutes) as MinDurationMinutes,
    MAX(sd.DurationMinutes) as MaxDurationMinutes,
    SUM(CASE WHEN sd.WasOverdue = 1 THEN 1 ELSE 0 END) as OverdueCount,
    CAST(SUM(CASE WHEN sd.WasOverdue = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as OverduePercentage
FROM dbo.CorrespondenceStageDurations sd
JOIN dbo.LookupWorkflowStages ws ON sd.StageId = ws.StageId
WHERE sd.ExitedAt IS NOT NULL
GROUP BY ws.StageCode, ws.StageName;

-- =============================================
-- 12. STORED PROCEDURE: Request Corrections
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_RequestContractCorrections
    @ContractId UNIQUEIDENTIFIER,
    @RequestedBy UNIQUEIDENTIFIER,
    @PrimaryCorrectionReasonId INT,
    @AdditionalReasonIds NVARCHAR(MAX) = NULL,
    @CorrectionInstructions NVARCHAR(MAX),
    @SpecificIssues NVARCHAR(MAX) = NULL,
    @AffectedDocuments NVARCHAR(MAX) = NULL,
    @AffectedSections NVARCHAR(MAX) = NULL,
    @DeadlineDays INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CorrectionRequestId UNIQUEIDENTIFIER = NEWID();
    DECLARE @CorrectionCycle INT;
    DECLARE @DeadlineDate DATETIME2;
    DECLARE @DefaultDays INT;
    
    -- Get current correction cycle
    SELECT @CorrectionCycle = ISNULL(TotalCorrectionCycles, 0) + 1
    FROM dbo.ContractsRegister WHERE ContractId = @ContractId;
    
    -- Get default deadline days if not specified
    IF @DeadlineDays IS NULL
        SELECT @DefaultDays = DefaultDeadlineDays FROM dbo.LookupCorrectionReasons WHERE CorrectionReasonId = @PrimaryCorrectionReasonId;
    ELSE
        SET @DefaultDays = @DeadlineDays;
    
    SET @DeadlineDate = DATEADD(DAY, @DefaultDays, GETUTCDATE());
    
    -- Insert correction request
    INSERT INTO dbo.ContractCorrectionRequests (
        CorrectionRequestId, ContractId, CorrectionCycleNumber,
        PrimaryCorrectionReasonId, AdditionalReasonIds,
        CorrectionInstructions, SpecificIssues, AffectedDocuments, AffectedSections,
        DeadlineDate, Status, RequestedBy
    ) VALUES (
        @CorrectionRequestId, @ContractId, @CorrectionCycle,
        @PrimaryCorrectionReasonId, @AdditionalReasonIds,
        @CorrectionInstructions, @SpecificIssues, @AffectedDocuments, @AffectedSections,
        @DeadlineDate, 'PENDING', @RequestedBy
    );
    
    -- Update contract status
    UPDATE dbo.ContractsRegister
    SET 
        TotalCorrectionCycles = @CorrectionCycle,
        IsAwaitingCorrections = 1,
        CorrectionDeadline = @DeadlineDate,
        LastCorrectionRequestId = @CorrectionRequestId,
        CurrentStageId = (SELECT StageId FROM dbo.LookupWorkflowStages WHERE StageCode = 'AWAITING_CORRECTIONS'),
        StageEnteredAt = GETUTCDATE(),
        UpdatedAt = GETUTCDATE()
    WHERE ContractId = @ContractId;
    
    SELECT @CorrectionRequestId as CorrectionRequestId, @DeadlineDate as DeadlineDate;
END;

-- =============================================
-- 13. STORED PROCEDURE: Submit Corrections
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_SubmitContractCorrections
    @CorrectionRequestId UNIQUEIDENTIFIER,
    @ApplicantComments NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ContractId UNIQUEIDENTIFIER;
    
    -- Get contract ID
    SELECT @ContractId = ContractId FROM dbo.ContractCorrectionRequests WHERE CorrectionRequestId = @CorrectionRequestId;
    
    -- Update correction request
    UPDATE dbo.ContractCorrectionRequests
    SET 
        Status = 'SUBMITTED',
        ResponseSubmittedAt = GETUTCDATE(),
        ApplicantComments = @ApplicantComments,
        UpdatedAt = GETUTCDATE()
    WHERE CorrectionRequestId = @CorrectionRequestId;
    
    -- Update contract status
    UPDATE dbo.ContractsRegister
    SET 
        IsAwaitingCorrections = 0,
        CorrectionDeadline = NULL,
        CurrentStageId = (SELECT StageId FROM dbo.LookupWorkflowStages WHERE StageCode = 'CORRECTIONS_SUBMITTED'),
        StageEnteredAt = GETUTCDATE(),
        UpdatedAt = GETUTCDATE()
    WHERE ContractId = @ContractId;
END;

-- =============================================
-- 14. STORED PROCEDURE: Change Stage with Duration Tracking
-- =============================================
CREATE OR ALTER PROCEDURE dbo.sp_ChangeContractStage
    @ContractId UNIQUEIDENTIFIER,
    @NewStageCode NVARCHAR(50),
    @ChangedBy UNIQUEIDENTIFIER,
    @Comments NVARCHAR(MAX) = NULL,
    @ExitReason NVARCHAR(100) = 'COMPLETED'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentStageId INT;
    DECLARE @NewStageId INT;
    DECLARE @StageEnteredAt DATETIME2;
    DECLARE @DurationMinutes INT;
    
    -- Get current stage info
    SELECT @CurrentStageId = CurrentStageId, @StageEnteredAt = StageEnteredAt
    FROM dbo.ContractsRegister WHERE ContractId = @ContractId;
    
    -- Get new stage ID
    SELECT @NewStageId = StageId FROM dbo.LookupWorkflowStages WHERE StageCode = @NewStageCode;
    
    -- Calculate duration
    SET @DurationMinutes = DATEDIFF(MINUTE, @StageEnteredAt, GETUTCDATE());
    
    -- Record stage exit in duration tracking
    IF @CurrentStageId IS NOT NULL
    BEGIN
        UPDATE dbo.ContractStageDurations
        SET 
            ExitedAt = GETUTCDATE(),
            DurationMinutes = @DurationMinutes,
            DurationBusinessDays = CAST(@DurationMinutes / 60.0 / 8.0 AS DECIMAL(5,2)), -- Assuming 8-hour workday
            ExitReason = @ExitReason,
            ExitedBy = @ChangedBy
        WHERE ContractId = @ContractId AND StageId = @CurrentStageId AND ExitedAt IS NULL;
    END
    
    -- Insert new stage duration record
    INSERT INTO dbo.ContractStageDurations (ContractId, StageId, EnteredAt, AssignedTo)
    SELECT @ContractId, @NewStageId, GETUTCDATE(), AssignedToUserId
    FROM dbo.ContractsRegister WHERE ContractId = @ContractId;
    
    -- Update contract
    UPDATE dbo.ContractsRegister
    SET 
        CurrentStageId = @NewStageId,
        StageEnteredAt = GETUTCDATE(),
        UpdatedAt = GETUTCDATE()
    WHERE ContractId = @ContractId;
    
    -- Insert status history
    INSERT INTO dbo.ContractStatusHistory (
        ContractId, FromStatusId, ToStatusId, StageId, PreviousStageId,
        StageDurationMinutes, Comments, ChangedBy
    ) VALUES (
        @ContractId, 
        (SELECT CaseStatusId FROM dbo.ContractsRegister WHERE ContractId = @ContractId),
        (SELECT CaseStatusId FROM dbo.ContractsRegister WHERE ContractId = @ContractId),
        @NewStageId, @CurrentStageId, @DurationMinutes, @Comments, @ChangedBy
    );
END;
GO
