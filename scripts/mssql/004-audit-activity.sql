-- =============================================
-- SGC Digital - Audit, Activity & Monitoring Tables
-- MS SQL Server Schema
-- =============================================

-- =============================================
-- Audit Log (all system actions)
-- =============================================

CREATE TABLE dbo.AuditLog (
    AuditId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Who
    UserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    UserEmail NVARCHAR(255) NULL,
    UserName NVARCHAR(200) NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    
    -- What
    ActionType NVARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    EntityType NVARCHAR(100) NOT NULL, -- User, Correspondence, Contract, etc.
    EntityId NVARCHAR(100) NULL,
    EntityReference NVARCHAR(100) NULL, -- Reference number if applicable
    
    -- Details
    ActionDescription NVARCHAR(500) NOT NULL,
    OldValues NVARCHAR(MAX) NULL, -- JSON of previous values
    NewValues NVARCHAR(MAX) NULL, -- JSON of new values
    
    -- Result
    IsSuccessful BIT NOT NULL DEFAULT 1,
    ErrorMessage NVARCHAR(MAX) NULL,
    
    -- When
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Activity Monitor (real-time activity tracking)
-- =============================================

CREATE TABLE dbo.ActivityLog (
    ActivityId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- User
    UserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    UserName NVARCHAR(200) NULL,
    UserRole NVARCHAR(50) NULL,
    
    -- Activity
    ActivityType NVARCHAR(100) NOT NULL, -- login, submission, status_change, assignment, etc.
    ActivityDescription NVARCHAR(500) NOT NULL,
    
    -- Related Entity
    EntityType NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    EntityReference NVARCHAR(100) NULL,
    
    -- Metadata
    Metadata NVARCHAR(MAX) NULL, -- JSON for additional context
    
    -- When
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- System Statistics (for dashboard/monitoring)
-- =============================================

-- Daily Statistics Snapshot
CREATE TABLE dbo.DailyStatistics (
    StatId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StatDate DATE NOT NULL,
    
    -- Correspondence Stats
    TotalCorrespondence INT NOT NULL DEFAULT 0,
    NewCorrespondence INT NOT NULL DEFAULT 0,
    CompletedCorrespondence INT NOT NULL DEFAULT 0,
    PendingCorrespondence INT NOT NULL DEFAULT 0,
    
    -- Contract Stats
    TotalContracts INT NOT NULL DEFAULT 0,
    NewContracts INT NOT NULL DEFAULT 0,
    CompletedContracts INT NOT NULL DEFAULT 0,
    PendingContracts INT NOT NULL DEFAULT 0,
    TotalContractValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    
    -- User Stats
    TotalUsers INT NOT NULL DEFAULT 0,
    ActiveUsers INT NOT NULL DEFAULT 0,
    NewRegistrations INT NOT NULL DEFAULT 0,
    
    -- Staff Stats
    TotalStaff INT NOT NULL DEFAULT 0,
    PendingStaffRequests INT NOT NULL DEFAULT 0,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_DailyStatistics_Date UNIQUE (StatDate)
);

-- Status Overview (current state snapshot)
CREATE TABLE dbo.StatusOverview (
    OverviewId INT IDENTITY(1,1) PRIMARY KEY,
    Category NVARCHAR(100) NOT NULL, -- 'correspondence', 'contracts', 'users', 'system'
    MetricName NVARCHAR(100) NOT NULL,
    MetricValue NVARCHAR(500) NOT NULL,
    MetricType NVARCHAR(50) NOT NULL, -- 'count', 'percentage', 'currency', 'text'
    DisplayOrder INT NOT NULL DEFAULT 0,
    LastUpdated DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_StatusOverview_Metric UNIQUE (Category, MetricName)
);

-- =============================================
-- Notifications
-- =============================================

CREATE TABLE dbo.Notifications (
    NotificationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Recipient
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Notification Content
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    NotificationType NVARCHAR(50) NOT NULL, -- 'info', 'warning', 'success', 'error', 'assignment'
    
    -- Related Entity
    EntityType NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    ActionUrl NVARCHAR(500) NULL,
    
    -- Status
    IsRead BIT NOT NULL DEFAULT 0,
    ReadAt DATETIME2 NULL,
    
    -- Email Notification
    EmailSent BIT NOT NULL DEFAULT 0,
    EmailSentAt DATETIME2 NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Email Queue (for sending notifications)
-- =============================================

CREATE TABLE dbo.EmailQueue (
    EmailId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Recipient
    ToEmail NVARCHAR(255) NOT NULL,
    ToName NVARCHAR(200) NULL,
    CcEmails NVARCHAR(MAX) NULL, -- Comma-separated
    BccEmails NVARCHAR(MAX) NULL,
    
    -- Content
    Subject NVARCHAR(500) NOT NULL,
    BodyHtml NVARCHAR(MAX) NOT NULL,
    BodyText NVARCHAR(MAX) NULL,
    
    -- Template
    TemplateName NVARCHAR(100) NULL,
    TemplateData NVARCHAR(MAX) NULL, -- JSON
    
    -- Status
    Status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, failed
    AttemptCount INT NOT NULL DEFAULT 0,
    LastAttemptAt DATETIME2 NULL,
    SentAt DATETIME2 NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    
    -- Priority
    Priority INT NOT NULL DEFAULT 5, -- 1=highest, 10=lowest
    
    -- Scheduling
    ScheduledFor DATETIME2 NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IX_AuditLog_UserId ON dbo.AuditLog(UserId);
CREATE INDEX IX_AuditLog_EntityType ON dbo.AuditLog(EntityType);
CREATE INDEX IX_AuditLog_CreatedAt ON dbo.AuditLog(CreatedAt);
CREATE INDEX IX_AuditLog_ActionType ON dbo.AuditLog(ActionType);

CREATE INDEX IX_ActivityLog_UserId ON dbo.ActivityLog(UserId);
CREATE INDEX IX_ActivityLog_ActivityType ON dbo.ActivityLog(ActivityType);
CREATE INDEX IX_ActivityLog_CreatedAt ON dbo.ActivityLog(CreatedAt);

CREATE INDEX IX_DailyStatistics_StatDate ON dbo.DailyStatistics(StatDate);

CREATE INDEX IX_Notifications_UserId ON dbo.Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON dbo.Notifications(IsRead);
CREATE INDEX IX_Notifications_CreatedAt ON dbo.Notifications(CreatedAt);

CREATE INDEX IX_EmailQueue_Status ON dbo.EmailQueue(Status);
CREATE INDEX IX_EmailQueue_ScheduledFor ON dbo.EmailQueue(ScheduledFor);
CREATE INDEX IX_EmailQueue_CreatedAt ON dbo.EmailQueue(CreatedAt);

-- =============================================
-- Stored Procedures for Statistics
-- =============================================

GO

-- Update Daily Statistics
CREATE OR ALTER PROCEDURE dbo.usp_UpdateDailyStatistics
    @StatDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @StatDate IS NULL
        SET @StatDate = CAST(GETUTCDATE() AS DATE);
    
    -- Get status IDs for filtering
    DECLARE @CompletedStatusId INT = (SELECT CaseStatusId FROM dbo.LookupCaseStatus WHERE StatusCode = 'COMPLETED');
    DECLARE @PendingStatusId INT = (SELECT CaseStatusId FROM dbo.LookupCaseStatus WHERE StatusCode = 'PENDING');
    DECLARE @ActiveStatusId INT = (SELECT StatusId FROM dbo.LookupRequestStatus WHERE StatusCode = 'ACTIVE');
    
    MERGE dbo.DailyStatistics AS target
    USING (
        SELECT 
            @StatDate AS StatDate,
            (SELECT COUNT(*) FROM dbo.CorrespondenceRegister) AS TotalCorrespondence,
            (SELECT COUNT(*) FROM dbo.CorrespondenceRegister WHERE CAST(SubmittedAt AS DATE) = @StatDate) AS NewCorrespondence,
            (SELECT COUNT(*) FROM dbo.CorrespondenceRegister WHERE CaseStatusId = @CompletedStatusId) AS CompletedCorrespondence,
            (SELECT COUNT(*) FROM dbo.CorrespondenceRegister WHERE CaseStatusId NOT IN (SELECT CaseStatusId FROM dbo.LookupCaseStatus WHERE StatusCategory = 'closed')) AS PendingCorrespondence,
            (SELECT COUNT(*) FROM dbo.ContractsRegister) AS TotalContracts,
            (SELECT COUNT(*) FROM dbo.ContractsRegister WHERE CAST(SubmittedAt AS DATE) = @StatDate) AS NewContracts,
            (SELECT COUNT(*) FROM dbo.ContractsRegister WHERE CaseStatusId = @CompletedStatusId) AS CompletedContracts,
            (SELECT COUNT(*) FROM dbo.ContractsRegister WHERE CaseStatusId NOT IN (SELECT CaseStatusId FROM dbo.LookupCaseStatus WHERE StatusCategory = 'closed')) AS PendingContracts,
            (SELECT ISNULL(SUM(ContractValue), 0) FROM dbo.ContractsRegister) AS TotalContractValue,
            (SELECT COUNT(*) FROM dbo.UserProfiles) AS TotalUsers,
            (SELECT COUNT(*) FROM dbo.UserProfiles WHERE StatusId = @ActiveStatusId) AS ActiveUsers,
            (SELECT COUNT(*) FROM dbo.UserProfiles WHERE CAST(CreatedAt AS DATE) = @StatDate) AS NewRegistrations,
            (SELECT COUNT(*) FROM dbo.UserProfiles WHERE RoleId IN (SELECT RoleId FROM dbo.LookupUserRoles WHERE RoleCode IN ('STAFF', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'))) AS TotalStaff,
            (SELECT COUNT(*) FROM dbo.StaffRegistrationRequests WHERE StatusId = @PendingStatusId) AS PendingStaffRequests
    ) AS source
    ON target.StatDate = source.StatDate
    WHEN MATCHED THEN
        UPDATE SET
            TotalCorrespondence = source.TotalCorrespondence,
            NewCorrespondence = source.NewCorrespondence,
            CompletedCorrespondence = source.CompletedCorrespondence,
            PendingCorrespondence = source.PendingCorrespondence,
            TotalContracts = source.TotalContracts,
            NewContracts = source.NewContracts,
            CompletedContracts = source.CompletedContracts,
            PendingContracts = source.PendingContracts,
            TotalContractValue = source.TotalContractValue,
            TotalUsers = source.TotalUsers,
            ActiveUsers = source.ActiveUsers,
            NewRegistrations = source.NewRegistrations,
            TotalStaff = source.TotalStaff,
            PendingStaffRequests = source.PendingStaffRequests,
            CreatedAt = GETUTCDATE()
    WHEN NOT MATCHED THEN
        INSERT (StatDate, TotalCorrespondence, NewCorrespondence, CompletedCorrespondence, PendingCorrespondence,
                TotalContracts, NewContracts, CompletedContracts, PendingContracts, TotalContractValue,
                TotalUsers, ActiveUsers, NewRegistrations, TotalStaff, PendingStaffRequests)
        VALUES (source.StatDate, source.TotalCorrespondence, source.NewCorrespondence, source.CompletedCorrespondence, source.PendingCorrespondence,
                source.TotalContracts, source.NewContracts, source.CompletedContracts, source.PendingContracts, source.TotalContractValue,
                source.TotalUsers, source.ActiveUsers, source.NewRegistrations, source.TotalStaff, source.PendingStaffRequests);
END;
GO
