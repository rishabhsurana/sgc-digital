-- ================================================================
-- SGC DIGITAL - MANAGEMENT PORTAL DATABASE GAPS FIX
-- Script: 019-management-portal-gaps.sql
-- Purpose: Add missing tables for complete management portal functionality
-- ================================================================

-- ================================================================
-- 1. STAFF WORKLOAD ASSIGNMENT TABLE
-- Tracks current workload and case assignments per staff member
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'StaffWorkloadAssignments') AND type = 'U')
CREATE TABLE StaffWorkloadAssignments (
    AssignmentId INT IDENTITY(1,1) PRIMARY KEY,
    StaffUserId UNIQUEIDENTIFIER NOT NULL,
    CaseType NVARCHAR(20) NOT NULL CHECK (CaseType IN ('CONTRACT', 'CORRESPONDENCE')),
    CaseId INT NOT NULL,
    TransactionNumber NVARCHAR(50) NOT NULL,
    AssignedAt DATETIME2 DEFAULT GETDATE(),
    AssignedBy UNIQUEIDENTIFIER NULL,
    DueDate DATETIME2 NULL,
    Priority INT DEFAULT 3,
    Status NVARCHAR(20) DEFAULT 'ACTIVE' CHECK (Status IN ('ACTIVE', 'COMPLETED', 'REASSIGNED', 'ESCALATED')),
    CompletedAt DATETIME2 NULL,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- ================================================================
-- 2. STAFF CAPACITY & AVAILABILITY TABLE
-- For workload balancing and auto-assignment
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'StaffCapacity') AND type = 'U')
CREATE TABLE StaffCapacity (
    CapacityId INT IDENTITY(1,1) PRIMARY KEY,
    StaffUserId UNIQUEIDENTIFIER NOT NULL UNIQUE,
    MaxConcurrentCases INT DEFAULT 20,
    CurrentCaseCount INT DEFAULT 0,
    ContractSpecialization BIT DEFAULT 0,
    CorrespondenceSpecialization BIT DEFAULT 0,
    IsAvailable BIT DEFAULT 1,
    OutOfOfficeStart DATETIME2 NULL,
    OutOfOfficeEnd DATETIME2 NULL,
    AutoAssignEnabled BIT DEFAULT 1,
    LastAssignedAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- ================================================================
-- 3. MDA CONFIGURATION TABLE (Extended)
-- MDA-specific settings and authorizations
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MDAConfiguration') AND type = 'U')
CREATE TABLE MDAConfiguration (
    ConfigId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentId INT NOT NULL,
    CanSubmitContracts BIT DEFAULT 1,
    CanSubmitCorrespondence BIT DEFAULT 1,
    RequiresSGApproval BIT DEFAULT 0,
    DefaultPriority INT DEFAULT 3,
    MaxConcurrentSubmissions INT NULL,
    PrimaryContactUserId UNIQUEIDENTIFIER NULL,
    SecondaryContactUserId UNIQUEIDENTIFIER NULL,
    BillingAccountCode NVARCHAR(50) NULL,
    Notes NVARCHAR(500) NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- ================================================================
-- 4. SYSTEM ANNOUNCEMENTS TABLE
-- For displaying announcements on the portal
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SystemAnnouncements') AND type = 'U')
CREATE TABLE SystemAnnouncements (
    AnnouncementId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    AnnouncementType NVARCHAR(20) DEFAULT 'INFO' CHECK (AnnouncementType IN ('INFO', 'WARNING', 'URGENT', 'MAINTENANCE')),
    TargetAudience NVARCHAR(20) DEFAULT 'ALL' CHECK (TargetAudience IN ('ALL', 'PUBLIC', 'STAFF', 'MDA')),
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NULL,
    IsDismissible BIT DEFAULT 1,
    DisplayOrder INT DEFAULT 0,
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- ================================================================
-- 5. STAFF PERFORMANCE METRICS TABLE
-- For management reporting on staff performance
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'StaffPerformanceMetrics') AND type = 'U')
CREATE TABLE StaffPerformanceMetrics (
    MetricId INT IDENTITY(1,1) PRIMARY KEY,
    StaffUserId UNIQUEIDENTIFIER NOT NULL,
    MetricDate DATE NOT NULL,
    CasesAssigned INT DEFAULT 0,
    CasesCompleted INT DEFAULT 0,
    CasesEscalated INT DEFAULT 0,
    CasesReturned INT DEFAULT 0,
    AvgProcessingTimeHours DECIMAL(10,2) NULL,
    SLAComplianceRate DECIMAL(5,2) NULL,
    CustomerSatisfactionScore DECIMAL(3,2) NULL,
    ContractCasesProcessed INT DEFAULT 0,
    CorrespondenceCasesProcessed INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(StaffUserId, MetricDate)
);
GO

-- ================================================================
-- 6. CASE REASSIGNMENT HISTORY TABLE
-- Track when cases are reassigned between staff
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CaseReassignmentHistory') AND type = 'U')
CREATE TABLE CaseReassignmentHistory (
    ReassignmentId INT IDENTITY(1,1) PRIMARY KEY,
    CaseType NVARCHAR(20) NOT NULL CHECK (CaseType IN ('CONTRACT', 'CORRESPONDENCE')),
    CaseId INT NOT NULL,
    TransactionNumber NVARCHAR(50) NOT NULL,
    FromUserId UNIQUEIDENTIFIER NULL,
    ToUserId UNIQUEIDENTIFIER NOT NULL,
    ReassignedBy UNIQUEIDENTIFIER NOT NULL,
    Reason NVARCHAR(200) NULL,
    ReassignmentType NVARCHAR(20) DEFAULT 'MANUAL' CHECK (ReassignmentType IN ('MANUAL', 'AUTO', 'ESCALATION', 'OUT_OF_OFFICE')),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- ================================================================
-- 7. WORKFLOW STAGE CONFIGURATION TABLE
-- Configurable workflow stages per case type
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'WorkflowStageConfiguration') AND type = 'U')
CREATE TABLE WorkflowStageConfiguration (
    ConfigId INT IDENTITY(1,1) PRIMARY KEY,
    CaseType NVARCHAR(20) NOT NULL CHECK (CaseType IN ('CONTRACT', 'CORRESPONDENCE')),
    StageCode NVARCHAR(50) NOT NULL,
    StageName NVARCHAR(100) NOT NULL,
    StageOrder INT NOT NULL,
    DefaultSLADays INT DEFAULT 5,
    RequiresApproval BIT DEFAULT 0,
    ApproverRoleId INT NULL,
    AllowSkip BIT DEFAULT 0,
    AutoAdvanceOnComplete BIT DEFAULT 1,
    NotifyOnEntry BIT DEFAULT 1,
    NotifyOnExit BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(CaseType, StageCode)
);
GO

-- Insert default workflow stages for Contracts
INSERT INTO WorkflowStageConfiguration (CaseType, StageCode, StageName, StageOrder, DefaultSLADays, RequiresApproval, NotifyOnEntry) VALUES
('CONTRACT', 'SUBMITTED', 'Submitted', 1, 0, 0, 1),
('CONTRACT', 'INTAKE_REVIEW', 'Intake Review', 2, 2, 0, 1),
('CONTRACT', 'LEGAL_REVIEW', 'Legal Review', 3, 5, 0, 1),
('CONTRACT', 'SG_REVIEW', 'SG Review', 4, 3, 1, 1),
('CONTRACT', 'DSG_REVIEW', 'DSG Review', 5, 3, 1, 1),
('CONTRACT', 'DRAFTING', 'Contract Drafting', 6, 10, 0, 1),
('CONTRACT', 'INTERNAL_REVIEW', 'Internal Review', 7, 3, 0, 1),
('CONTRACT', 'FINAL_APPROVAL', 'Final Approval', 8, 2, 1, 1),
('CONTRACT', 'EXECUTION', 'Execution', 9, 5, 0, 1),
('CONTRACT', 'COMPLETED', 'Completed', 10, 0, 0, 1),
('CONTRACT', 'RETURNED', 'Returned for Clarification', 99, 5, 0, 1);

-- Insert default workflow stages for Correspondence
INSERT INTO WorkflowStageConfiguration (CaseType, StageCode, StageName, StageOrder, DefaultSLADays, RequiresApproval, NotifyOnEntry) VALUES
('CORRESPONDENCE', 'SUBMITTED', 'Submitted', 1, 0, 0, 1),
('CORRESPONDENCE', 'INTAKE_REVIEW', 'Intake Review', 2, 1, 0, 1),
('CORRESPONDENCE', 'ASSIGNED', 'Assigned to Officer', 3, 1, 0, 1),
('CORRESPONDENCE', 'IN_PROGRESS', 'In Progress', 4, 5, 0, 0),
('CORRESPONDENCE', 'SUPERVISOR_REVIEW', 'Supervisor Review', 5, 2, 1, 1),
('CORRESPONDENCE', 'RESPONSE_READY', 'Response Ready', 6, 1, 0, 1),
('CORRESPONDENCE', 'COMPLETED', 'Completed', 7, 0, 0, 1),
('CORRESPONDENCE', 'RETURNED', 'Returned for Clarification', 99, 3, 0, 1);
GO

-- ================================================================
-- 8. APPROVAL QUEUE TABLE
-- Items pending approval by SG/DSG/Supervisors
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ApprovalQueue') AND type = 'U')
CREATE TABLE ApprovalQueue (
    ApprovalId INT IDENTITY(1,1) PRIMARY KEY,
    CaseType NVARCHAR(20) NOT NULL CHECK (CaseType IN ('CONTRACT', 'CORRESPONDENCE', 'REGISTRATION')),
    CaseId INT NOT NULL,
    TransactionNumber NVARCHAR(50) NULL,
    ApprovalType NVARCHAR(50) NOT NULL,
    RequestedBy UNIQUEIDENTIFIER NOT NULL,
    RequestedAt DATETIME2 DEFAULT GETDATE(),
    RequiredApproverRoleId INT NULL,
    AssignedApproverId UNIQUEIDENTIFIER NULL,
    Priority INT DEFAULT 3,
    DueDate DATETIME2 NULL,
    Status NVARCHAR(20) DEFAULT 'PENDING' CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'WITHDRAWN')),
    Decision NVARCHAR(20) NULL,
    DecisionBy UNIQUEIDENTIFIER NULL,
    DecisionAt DATETIME2 NULL,
    DecisionComments NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- ================================================================
-- 9. DAILY STATISTICS TABLE
-- Pre-aggregated daily statistics for dashboard performance
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'DailyStatistics') AND type = 'U')
CREATE TABLE DailyStatistics (
    StatId INT IDENTITY(1,1) PRIMARY KEY,
    StatDate DATE NOT NULL,
    -- Contracts
    ContractsSubmitted INT DEFAULT 0,
    ContractsCompleted INT DEFAULT 0,
    ContractsInProgress INT DEFAULT 0,
    ContractsOverdue INT DEFAULT 0,
    ContractsTotalValue DECIMAL(18,2) DEFAULT 0,
    AvgContractProcessingDays DECIMAL(10,2) NULL,
    -- Correspondence
    CorrespondenceSubmitted INT DEFAULT 0,
    CorrespondenceCompleted INT DEFAULT 0,
    CorrespondenceInProgress INT DEFAULT 0,
    CorrespondenceOverdue INT DEFAULT 0,
    AvgCorrespondenceProcessingDays DECIMAL(10,2) NULL,
    -- Users
    NewRegistrations INT DEFAULT 0,
    ActiveUsers INT DEFAULT 0,
    -- SLA
    SLAComplianceRate DECIMAL(5,2) NULL,
    EscalationsCount INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(StatDate)
);
GO

-- ================================================================
-- 10. LOOKUP - REJECTION REASONS TABLE
-- Standard rejection reasons for workflow
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'LookupRejectionReasons') AND type = 'U')
CREATE TABLE LookupRejectionReasons (
    ReasonId INT IDENTITY(1,1) PRIMARY KEY,
    ReasonCode NVARCHAR(50) NOT NULL UNIQUE,
    ReasonName NVARCHAR(200) NOT NULL,
    ApplicableTo NVARCHAR(20) DEFAULT 'ALL' CHECK (ApplicableTo IN ('ALL', 'CONTRACT', 'CORRESPONDENCE', 'REGISTRATION')),
    RequiresComment BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    DisplayOrder INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

INSERT INTO LookupRejectionReasons (ReasonCode, ReasonName, ApplicableTo, RequiresComment, DisplayOrder) VALUES
('INCOMPLETE_DOCS', 'Incomplete documentation', 'ALL', 0, 1),
('INVALID_FORMAT', 'Invalid document format', 'ALL', 0, 2),
('MISSING_APPROVAL', 'Missing required approval', 'CONTRACT', 0, 3),
('INCORRECT_CLASSIFICATION', 'Incorrect classification', 'CONTRACT', 1, 4),
('UNAUTHORIZED_SUBMITTER', 'Unauthorized submitter', 'CONTRACT', 1, 5),
('DUPLICATE_SUBMISSION', 'Duplicate submission', 'ALL', 0, 6),
('OUTSIDE_SCOPE', 'Outside SGC scope', 'CORRESPONDENCE', 1, 7),
('INSUFFICIENT_DETAIL', 'Insufficient detail provided', 'ALL', 0, 8),
('CONTRACT_VALUE_MISMATCH', 'Contract value does not match documents', 'CONTRACT', 1, 9),
('EXPIRED_DOCUMENTS', 'Expired supporting documents', 'ALL', 0, 10),
('OTHER', 'Other (specify in comments)', 'ALL', 1, 99);
GO

-- ================================================================
-- 11. USER FAVORITES / BOOKMARKS TABLE
-- Allow staff to bookmark frequently accessed cases
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'UserFavorites') AND type = 'U')
CREATE TABLE UserFavorites (
    FavoriteId INT IDENTITY(1,1) PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    CaseType NVARCHAR(20) NOT NULL CHECK (CaseType IN ('CONTRACT', 'CORRESPONDENCE')),
    CaseId INT NOT NULL,
    TransactionNumber NVARCHAR(50) NOT NULL,
    DisplayName NVARCHAR(200) NULL,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(UserId, CaseType, CaseId)
);
GO

-- ================================================================
-- 12. SAVED FILTERS / SEARCHES TABLE
-- Allow users to save frequently used filters
-- ================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SavedFilters') AND type = 'U')
CREATE TABLE SavedFilters (
    FilterId INT IDENTITY(1,1) PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    FilterName NVARCHAR(100) NOT NULL,
    FilterType NVARCHAR(50) NOT NULL, -- 'WORKQUEUE', 'REGISTER', 'REPORT'
    AppliesTo NVARCHAR(50) NOT NULL, -- 'CONTRACT', 'CORRESPONDENCE', 'ALL'
    FilterCriteria NVARCHAR(MAX) NOT NULL, -- JSON of filter values
    IsDefault BIT DEFAULT 0,
    IsShared BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- ================================================================
-- VIEWS FOR MANAGEMENT PORTAL
-- ================================================================

-- View: Staff Dashboard Summary
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_StaffDashboardSummary')
    DROP VIEW vw_StaffDashboardSummary;
GO

CREATE VIEW vw_StaffDashboardSummary AS
SELECT 
    s.StaffUserId,
    s.MaxConcurrentCases,
    s.CurrentCaseCount,
    s.IsAvailable,
    CASE WHEN s.OutOfOfficeStart IS NOT NULL AND s.OutOfOfficeEnd IS NOT NULL 
         AND GETDATE() BETWEEN s.OutOfOfficeStart AND s.OutOfOfficeEnd 
         THEN 1 ELSE 0 END AS IsOutOfOffice,
    (SELECT COUNT(*) FROM StaffWorkloadAssignments WHERE StaffUserId = s.StaffUserId AND Status = 'ACTIVE') AS ActiveAssignments,
    (SELECT COUNT(*) FROM StaffWorkloadAssignments WHERE StaffUserId = s.StaffUserId AND Status = 'ACTIVE' AND DueDate < GETDATE()) AS OverdueAssignments,
    (SELECT COUNT(*) FROM ApprovalQueue WHERE AssignedApproverId = s.StaffUserId AND Status = 'PENDING') AS PendingApprovals
FROM StaffCapacity s;
GO

-- View: Pending Approvals Summary
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_PendingApprovalsSummary')
    DROP VIEW vw_PendingApprovalsSummary;
GO

CREATE VIEW vw_PendingApprovalsSummary AS
SELECT 
    CaseType,
    ApprovalType,
    COUNT(*) AS PendingCount,
    MIN(RequestedAt) AS OldestRequest,
    AVG(DATEDIFF(HOUR, RequestedAt, GETDATE())) AS AvgWaitHours
FROM ApprovalQueue
WHERE Status = 'PENDING'
GROUP BY CaseType, ApprovalType;
GO

-- View: Today's Statistics
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_TodayStatistics')
    DROP VIEW vw_TodayStatistics;
GO

CREATE VIEW vw_TodayStatistics AS
SELECT * FROM DailyStatistics WHERE StatDate = CAST(GETDATE() AS DATE);
GO

-- ================================================================
-- STORED PROCEDURES
-- ================================================================

-- Procedure: Assign Case to Staff
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AssignCaseToStaff')
    DROP PROCEDURE sp_AssignCaseToStaff;
GO

CREATE PROCEDURE sp_AssignCaseToStaff
    @CaseType NVARCHAR(20),
    @CaseId INT,
    @TransactionNumber NVARCHAR(50),
    @AssignToUserId UNIQUEIDENTIFIER,
    @AssignedBy UNIQUEIDENTIFIER,
    @DueDate DATETIME2 = NULL,
    @Priority INT = 3,
    @Notes NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if already assigned
    IF EXISTS (SELECT 1 FROM StaffWorkloadAssignments 
               WHERE CaseType = @CaseType AND CaseId = @CaseId AND Status = 'ACTIVE')
    BEGIN
        -- Update existing assignment (reassignment)
        DECLARE @OldUserId UNIQUEIDENTIFIER;
        SELECT @OldUserId = StaffUserId FROM StaffWorkloadAssignments 
        WHERE CaseType = @CaseType AND CaseId = @CaseId AND Status = 'ACTIVE';
        
        -- Mark old assignment as reassigned
        UPDATE StaffWorkloadAssignments 
        SET Status = 'REASSIGNED', UpdatedAt = GETDATE()
        WHERE CaseType = @CaseType AND CaseId = @CaseId AND Status = 'ACTIVE';
        
        -- Log reassignment
        INSERT INTO CaseReassignmentHistory (CaseType, CaseId, TransactionNumber, FromUserId, ToUserId, ReassignedBy, ReassignmentType)
        VALUES (@CaseType, @CaseId, @TransactionNumber, @OldUserId, @AssignToUserId, @AssignedBy, 'MANUAL');
        
        -- Update old user's case count
        UPDATE StaffCapacity SET CurrentCaseCount = CurrentCaseCount - 1, UpdatedAt = GETDATE()
        WHERE StaffUserId = @OldUserId AND CurrentCaseCount > 0;
    END
    
    -- Create new assignment
    INSERT INTO StaffWorkloadAssignments (StaffUserId, CaseType, CaseId, TransactionNumber, AssignedBy, DueDate, Priority, Notes)
    VALUES (@AssignToUserId, @CaseType, @CaseId, @TransactionNumber, @AssignedBy, @DueDate, @Priority, @Notes);
    
    -- Update new user's case count
    UPDATE StaffCapacity SET CurrentCaseCount = CurrentCaseCount + 1, LastAssignedAt = GETDATE(), UpdatedAt = GETDATE()
    WHERE StaffUserId = @AssignToUserId;
    
    SELECT 'SUCCESS' AS Result, SCOPE_IDENTITY() AS AssignmentId;
END;
GO

-- Procedure: Auto-Assign Case (Round Robin)
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AutoAssignCase')
    DROP PROCEDURE sp_AutoAssignCase;
GO

CREATE PROCEDURE sp_AutoAssignCase
    @CaseType NVARCHAR(20),
    @CaseId INT,
    @TransactionNumber NVARCHAR(50),
    @Priority INT = 3
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @AssignToUserId UNIQUEIDENTIFIER;
    
    -- Find available staff with lowest current workload
    SELECT TOP 1 @AssignToUserId = StaffUserId
    FROM StaffCapacity
    WHERE IsAvailable = 1 
      AND AutoAssignEnabled = 1
      AND CurrentCaseCount < MaxConcurrentCases
      AND (OutOfOfficeStart IS NULL OR OutOfOfficeEnd IS NULL OR GETDATE() NOT BETWEEN OutOfOfficeStart AND OutOfOfficeEnd)
      AND ((@CaseType = 'CONTRACT' AND ContractSpecialization = 1) OR
           (@CaseType = 'CORRESPONDENCE' AND CorrespondenceSpecialization = 1) OR
           (ContractSpecialization = 0 AND CorrespondenceSpecialization = 0))
    ORDER BY CurrentCaseCount ASC, LastAssignedAt ASC;
    
    IF @AssignToUserId IS NULL
    BEGIN
        SELECT 'NO_AVAILABLE_STAFF' AS Result, NULL AS AssignmentId;
        RETURN;
    END
    
    -- Use the assign procedure
    EXEC sp_AssignCaseToStaff @CaseType, @CaseId, @TransactionNumber, @AssignToUserId, @AssignToUserId, NULL, @Priority, 'Auto-assigned';
END;
GO

-- Procedure: Update Daily Statistics
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateDailyStatistics')
    DROP PROCEDURE sp_UpdateDailyStatistics;
GO

CREATE PROCEDURE sp_UpdateDailyStatistics
    @StatDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @StatDate IS NULL
        SET @StatDate = CAST(GETDATE() AS DATE);
    
    -- Delete existing record for the date
    DELETE FROM DailyStatistics WHERE StatDate = @StatDate;
    
    -- Insert new statistics
    INSERT INTO DailyStatistics (
        StatDate,
        ContractsSubmitted, ContractsCompleted, ContractsInProgress, ContractsOverdue, ContractsTotalValue,
        CorrespondenceSubmitted, CorrespondenceCompleted, CorrespondenceInProgress, CorrespondenceOverdue,
        NewRegistrations, ActiveUsers, SLAComplianceRate, EscalationsCount
    )
    SELECT 
        @StatDate,
        -- Contracts (using mock counts - replace with actual table queries)
        (SELECT COUNT(*) FROM ContractsRegister WHERE CAST(SubmittedAt AS DATE) = @StatDate),
        (SELECT COUNT(*) FROM ContractsRegister WHERE CAST(CompletedAt AS DATE) = @StatDate),
        (SELECT COUNT(*) FROM ContractsRegister WHERE StatusId IN (2,3,4,5,6,7)),
        (SELECT COUNT(*) FROM ContractsRegister WHERE SLADueDate < GETDATE() AND StatusId NOT IN (10,11)),
        (SELECT ISNULL(SUM(ContractValue), 0) FROM ContractsRegister WHERE CAST(SubmittedAt AS DATE) = @StatDate),
        -- Correspondence
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE CAST(SubmittedAt AS DATE) = @StatDate),
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE CAST(CompletedAt AS DATE) = @StatDate),
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE StatusId IN (2,3,4,5)),
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE SLADueDate < GETDATE() AND StatusId NOT IN (6,7)),
        -- Users
        (SELECT COUNT(*) FROM UserProfiles WHERE CAST(CreatedAt AS DATE) = @StatDate),
        (SELECT COUNT(*) FROM UserProfiles WHERE LastLoginAt >= DATEADD(DAY, -7, @StatDate)),
        -- SLA (simplified - actual calculation would be more complex)
        90.0,
        (SELECT COUNT(*) FROM CaseReassignmentHistory WHERE ReassignmentType = 'ESCALATION' AND CAST(CreatedAt AS DATE) = @StatDate);
    
    SELECT 'SUCCESS' AS Result;
END;
GO

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

CREATE INDEX IX_StaffWorkload_Staff_Status ON StaffWorkloadAssignments(StaffUserId, Status);
CREATE INDEX IX_StaffWorkload_Case ON StaffWorkloadAssignments(CaseType, CaseId);
CREATE INDEX IX_ApprovalQueue_Status ON ApprovalQueue(Status, AssignedApproverId);
CREATE INDEX IX_ApprovalQueue_CaseType ON ApprovalQueue(CaseType, CaseId);
CREATE INDEX IX_DailyStatistics_Date ON DailyStatistics(StatDate);
CREATE INDEX IX_CaseReassignment_Case ON CaseReassignmentHistory(CaseType, CaseId);
CREATE INDEX IX_UserFavorites_User ON UserFavorites(UserId);
GO

PRINT 'Management Portal Gaps Fix - Script 019 completed successfully';
GO
