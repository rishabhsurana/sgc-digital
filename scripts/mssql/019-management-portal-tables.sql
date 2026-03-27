-- =============================================
-- SGC Digital - Management Portal Database Tables
-- Script: 019-management-portal-tables.sql
-- Purpose: All tables required for Management Portal features
-- Version: 1.0
-- Date: March 2026
-- =============================================

-- This script adds database tables specifically for the Management Portal:
-- 1. /management/landing - Landing page (no additional tables needed)
-- 2. /management/login - Staff login (uses existing UserProfiles, UserSessions)
-- 3. /management/register - Staff registration requests
-- 4. /management/users - User management
-- 5. /management/mda - MDA management
-- 6. /management/contracts-register - Contracts register view
-- 7. /management/contracts-history - Contracts history view
-- 8. /management/correspondence-register - Correspondence register view  
-- 9. /management/correspondence-history - Correspondence history view
-- 10. /management/reports - Reports & analytics
-- 11. /management/activity - Activity monitoring
-- 12. /management/settings - System settings
-- 13. /management/status - Status overview
-- 14. /management/registers - Combined registers view

-- =============================================
-- MODULE A: MDA MANAGEMENT TABLES
-- =============================================

-- MDAs (Ministries, Departments, Agencies) Master Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MDAs') AND type in (N'U'))
CREATE TABLE MDAs (
    MDAId INT IDENTITY(1,1) PRIMARY KEY,
    MDACode NVARCHAR(20) NOT NULL UNIQUE,
    MDAName NVARCHAR(200) NOT NULL,
    MDAType NVARCHAR(50) NOT NULL CHECK (MDAType IN ('Ministry', 'Department', 'Agency', 'Statutory Body', 'State Enterprise')),
    ParentMDAId INT NULL REFERENCES MDAs(MDAId),
    MinisterName NVARCHAR(100) NULL,
    PermanentSecretaryName NVARCHAR(100) NULL,
    Address NVARCHAR(500) NULL,
    Phone NVARCHAR(50) NULL,
    Email NVARCHAR(100) NULL,
    Website NVARCHAR(200) NULL,
    StatusId INT NOT NULL DEFAULT 5, -- Active
    CanSubmitCorrespondence BIT NOT NULL DEFAULT 1,
    CanSubmitContracts BIT NOT NULL DEFAULT 1,
    RequiresSGApproval BIT NOT NULL DEFAULT 0,
    DefaultPriorityId INT NULL,
    MaxContractValueWithoutCabinet DECIMAL(18,2) NULL DEFAULT 250000,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(50) NULL,
    UpdatedBy NVARCHAR(50) NULL
);

-- MDA Contacts (authorized contacts per MDA)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MDAContacts') AND type in (N'U'))
CREATE TABLE MDAContacts (
    ContactId INT IDENTITY(1,1) PRIMARY KEY,
    MDAId INT NOT NULL REFERENCES MDAs(MDAId),
    UserId NVARCHAR(50) NOT NULL,
    ContactRole NVARCHAR(50) NOT NULL CHECK (ContactRole IN ('Primary', 'Alternate', 'Contracts', 'Correspondence', 'Legal')),
    IsPrimary BIT NOT NULL DEFAULT 0,
    CanSubmit BIT NOT NULL DEFAULT 1,
    CanApprove BIT NOT NULL DEFAULT 0,
    StartDate DATE NOT NULL DEFAULT GETDATE(),
    EndDate DATE NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- MDA Statistics (pre-aggregated for performance)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MDAStatistics') AND type in (N'U'))
CREATE TABLE MDAStatistics (
    StatId INT IDENTITY(1,1) PRIMARY KEY,
    MDAId INT NOT NULL REFERENCES MDAs(MDAId),
    StatDate DATE NOT NULL,
    TotalCorrespondenceSubmitted INT NOT NULL DEFAULT 0,
    TotalCorrespondenceApproved INT NOT NULL DEFAULT 0,
    TotalCorrespondencePending INT NOT NULL DEFAULT 0,
    TotalCorrespondenceRejected INT NOT NULL DEFAULT 0,
    TotalContractsSubmitted INT NOT NULL DEFAULT 0,
    TotalContractsApproved INT NOT NULL DEFAULT 0,
    TotalContractsPending INT NOT NULL DEFAULT 0,
    TotalContractsRejected INT NOT NULL DEFAULT 0,
    TotalContractValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    ActiveUsersCount INT NOT NULL DEFAULT 0,
    AvgProcessingDays DECIMAL(5,2) NULL,
    SLAComplianceRate DECIMAL(5,2) NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UNIQUE(MDAId, StatDate)
);

-- =============================================
-- MODULE B: SYSTEM SETTINGS & CONFIGURATION
-- =============================================

-- System Settings (key-value pairs for system configuration)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SystemSettings') AND type in (N'U'))
CREATE TABLE SystemSettings (
    SettingId INT IDENTITY(1,1) PRIMARY KEY,
    SettingCategory NVARCHAR(50) NOT NULL,
    SettingKey NVARCHAR(100) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX) NULL,
    SettingType NVARCHAR(20) NOT NULL DEFAULT 'string' CHECK (SettingType IN ('string', 'number', 'boolean', 'json', 'datetime')),
    Description NVARCHAR(500) NULL,
    IsEditable BIT NOT NULL DEFAULT 1,
    LastModifiedBy NVARCHAR(50) NULL,
    LastModifiedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Insert default system settings
INSERT INTO SystemSettings (SettingCategory, SettingKey, SettingValue, SettingType, Description) VALUES
-- General Settings
('general', 'organization_name', 'Solicitor General''s Chambers', 'string', 'Organization name'),
('general', 'organization_abbr', 'SGC', 'string', 'Organization abbreviation'),
('general', 'organization_address', 'Marine House, Hastings, Christ Church, Barbados', 'string', 'Organization address'),
('general', 'organization_phone', '+1 (246) 431-7700', 'string', 'Organization phone'),
('general', 'organization_email', 'info@sgc.gov.bb', 'string', 'Organization email'),
('general', 'timezone', 'America/Barbados', 'string', 'System timezone'),
-- SLA Settings
('sla', 'correspondence_default_sla_days', '5', 'number', 'Default SLA for correspondence (days)'),
('sla', 'contracts_default_sla_days', '10', 'number', 'Default SLA for contracts (days)'),
('sla', 'correction_response_days', '5', 'number', 'Days to respond to correction requests'),
('sla', 'sla_warning_threshold_percent', '80', 'number', 'SLA warning threshold (% of time elapsed)'),
-- Security Settings
('security', 'session_timeout_minutes', '30', 'number', 'Session timeout in minutes'),
('security', 'max_login_attempts', '5', 'number', 'Max failed login attempts before lockout'),
('security', 'lockout_duration_minutes', '30', 'number', 'Account lockout duration'),
('security', 'password_min_length', '8', 'number', 'Minimum password length'),
('security', 'require_2fa', 'false', 'boolean', 'Require two-factor authentication'),
-- Notification Settings
('notifications', 'email_notifications_enabled', 'true', 'boolean', 'Enable email notifications'),
('notifications', 'sms_notifications_enabled', 'false', 'boolean', 'Enable SMS notifications'),
('notifications', 'send_submission_confirmation', 'true', 'boolean', 'Send confirmation on submission'),
('notifications', 'send_status_updates', 'true', 'boolean', 'Send status update notifications'),
('notifications', 'send_sla_warnings', 'true', 'boolean', 'Send SLA warning notifications'),
-- System Settings
('system', 'maintenance_mode', 'false', 'boolean', 'System maintenance mode'),
('system', 'allow_public_registration', 'true', 'boolean', 'Allow public user registration'),
('system', 'allow_staff_registration_requests', 'true', 'boolean', 'Allow staff registration requests'),
('system', 'max_file_upload_size_mb', '25', 'number', 'Maximum file upload size (MB)'),
('system', 'allowed_file_types', 'pdf,doc,docx,xls,xlsx,jpg,png', 'string', 'Allowed file extensions');

-- System Announcements
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SystemAnnouncements') AND type in (N'U'))
CREATE TABLE SystemAnnouncements (
    AnnouncementId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    AnnouncementType NVARCHAR(20) NOT NULL CHECK (AnnouncementType IN ('info', 'warning', 'critical', 'maintenance', 'feature')),
    TargetAudience NVARCHAR(20) NOT NULL CHECK (TargetAudience IN ('all', 'public', 'staff', 'admin')),
    StartDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    EndDate DATETIME2 NULL,
    IsPinned BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- MODULE C: USER NOTIFICATION PREFERENCES
-- =============================================

-- User Notification Preferences (per user settings)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'UserNotificationPreferences') AND type in (N'U'))
CREATE TABLE UserNotificationPreferences (
    PreferenceId INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    NotificationTypeCode NVARCHAR(50) NOT NULL,
    EmailEnabled BIT NOT NULL DEFAULT 1,
    SMSEnabled BIT NOT NULL DEFAULT 0,
    InAppEnabled BIT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UNIQUE(UserId, NotificationTypeCode)
);

-- =============================================
-- MODULE D: REPORTS & ANALYTICS
-- =============================================

-- Saved Report Configurations
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SavedReports') AND type in (N'U'))
CREATE TABLE SavedReports (
    ReportId INT IDENTITY(1,1) PRIMARY KEY,
    ReportName NVARCHAR(100) NOT NULL,
    ReportType NVARCHAR(50) NOT NULL CHECK (ReportType IN ('correspondence', 'contracts', 'users', 'mda', 'sla', 'custom')),
    Description NVARCHAR(500) NULL,
    FilterCriteria NVARCHAR(MAX) NULL, -- JSON
    ColumnSelection NVARCHAR(MAX) NULL, -- JSON
    SortOrder NVARCHAR(MAX) NULL, -- JSON
    CreatedBy NVARCHAR(50) NOT NULL,
    IsPublic BIT NOT NULL DEFAULT 0,
    IsDefault BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    LastRunAt DATETIME2 NULL
);

-- Report Execution Log
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ReportExecutionLog') AND type in (N'U'))
CREATE TABLE ReportExecutionLog (
    ExecutionId INT IDENTITY(1,1) PRIMARY KEY,
    ReportId INT NULL REFERENCES SavedReports(ReportId),
    ReportType NVARCHAR(50) NOT NULL,
    ExecutedBy NVARCHAR(50) NOT NULL,
    ExecutedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FilterCriteria NVARCHAR(MAX) NULL,
    RecordsReturned INT NULL,
    ExportFormat NVARCHAR(20) NULL CHECK (ExportFormat IN ('view', 'pdf', 'excel', 'csv')),
    ExecutionTimeMs INT NULL
);

-- Daily Statistics Snapshot (for dashboard performance)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'DailyStatisticsSnapshot') AND type in (N'U'))
CREATE TABLE DailyStatisticsSnapshot (
    SnapshotId INT IDENTITY(1,1) PRIMARY KEY,
    SnapshotDate DATE NOT NULL UNIQUE,
    -- Correspondence Stats
    TotalCorrespondence INT NOT NULL DEFAULT 0,
    CorrespondenceSubmittedToday INT NOT NULL DEFAULT 0,
    CorrespondencePendingReview INT NOT NULL DEFAULT 0,
    CorrespondenceApprovedToday INT NOT NULL DEFAULT 0,
    CorrespondenceRejectedToday INT NOT NULL DEFAULT 0,
    CorrespondenceOverdue INT NOT NULL DEFAULT 0,
    -- Contract Stats
    TotalContracts INT NOT NULL DEFAULT 0,
    ContractsSubmittedToday INT NOT NULL DEFAULT 0,
    ContractsPendingReview INT NOT NULL DEFAULT 0,
    ContractsApprovedToday INT NOT NULL DEFAULT 0,
    ContractsRejectedToday INT NOT NULL DEFAULT 0,
    ContractsOverdue INT NOT NULL DEFAULT 0,
    TotalContractValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    -- User Stats
    TotalUsers INT NOT NULL DEFAULT 0,
    ActiveUsersToday INT NOT NULL DEFAULT 0,
    NewRegistrationsToday INT NOT NULL DEFAULT 0,
    PendingStaffRequests INT NOT NULL DEFAULT 0,
    -- Performance Stats
    AvgCorrespondenceProcessingDays DECIMAL(5,2) NULL,
    AvgContractProcessingDays DECIMAL(5,2) NULL,
    SLAComplianceRate DECIMAL(5,2) NULL,
    -- Timestamps
    GeneratedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- MODULE E: ACTIVITY MONITORING
-- =============================================

-- Pending Actions Queue (items requiring attention)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'PendingActionsQueue') AND type in (N'U'))
CREATE TABLE PendingActionsQueue (
    ActionId INT IDENTITY(1,1) PRIMARY KEY,
    ActionType NVARCHAR(50) NOT NULL CHECK (ActionType IN ('review', 'approve', 'respond', 'correct', 'register_approval', 'escalation')),
    CaseType NVARCHAR(20) NOT NULL CHECK (CaseType IN ('correspondence', 'contract', 'user', 'staff_request')),
    CaseId NVARCHAR(50) NOT NULL,
    ReferenceNumber NVARCHAR(50) NULL,
    Subject NVARCHAR(500) NULL,
    MDAId INT NULL REFERENCES MDAs(MDAId),
    SubmittedBy NVARCHAR(100) NULL,
    AssignedTo NVARCHAR(50) NULL,
    PriorityLevel NVARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (PriorityLevel IN ('low', 'medium', 'high', 'urgent')),
    DueDate DATETIME2 NULL,
    DaysInQueue INT NOT NULL DEFAULT 0,
    IsOverdue BIT NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (Status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME2 NULL,
    CompletedBy NVARCHAR(50) NULL
);

-- =============================================
-- MODULE F: REJECTION REASONS LOOKUP
-- =============================================

-- Standard Rejection Reasons
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'LookupRejectionReasons') AND type in (N'U'))
CREATE TABLE LookupRejectionReasons (
    ReasonId INT IDENTITY(1,1) PRIMARY KEY,
    ReasonCode NVARCHAR(50) NOT NULL UNIQUE,
    ReasonName NVARCHAR(200) NOT NULL,
    ReasonCategory NVARCHAR(50) NOT NULL CHECK (ReasonCategory IN ('documentation', 'compliance', 'process', 'content', 'other')),
    AppliesToCorrespondence BIT NOT NULL DEFAULT 1,
    AppliesToContracts BIT NOT NULL DEFAULT 1,
    RequiresComment BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

-- Insert standard rejection reasons
INSERT INTO LookupRejectionReasons (ReasonCode, ReasonName, ReasonCategory, RequiresComment, DisplayOrder) VALUES
('INCOMPLETE_DOCS', 'Incomplete documentation', 'documentation', 0, 1),
('INVALID_FORMAT', 'Invalid document format', 'documentation', 0, 2),
('MISSING_SIGNATURES', 'Missing required signatures', 'documentation', 0, 3),
('EXPIRED_DOCUMENTS', 'Expired supporting documents', 'documentation', 0, 4),
('MISSING_APPROVAL', 'Missing required approval', 'compliance', 0, 5),
('UNAUTHORIZED_SUBMITTER', 'Unauthorized submitter', 'compliance', 1, 6),
('INCORRECT_CLASSIFICATION', 'Incorrect classification', 'content', 0, 7),
('INSUFFICIENT_DETAIL', 'Insufficient detail provided', 'content', 1, 8),
('DUPLICATE_SUBMISSION', 'Duplicate submission', 'process', 0, 9),
('CONTRACT_VALUE_MISMATCH', 'Contract value does not match documents', 'content', 1, 10),
('OUTSIDE_SCOPE', 'Outside SGC scope', 'process', 1, 11),
('OTHER', 'Other (specify in comments)', 'other', 1, 99);

-- =============================================
-- MODULE G: STAFF REGISTRATION ENHANCEMENTS
-- =============================================

-- Staff Registration Request Status History
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'StaffRequestStatusHistory') AND type in (N'U'))
CREATE TABLE StaffRequestStatusHistory (
    HistoryId INT IDENTITY(1,1) PRIMARY KEY,
    RequestId INT NOT NULL,
    PreviousStatus NVARCHAR(30) NULL,
    NewStatus NVARCHAR(30) NOT NULL,
    ChangedBy NVARCHAR(50) NOT NULL,
    ChangeReason NVARCHAR(500) NULL,
    ChangedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- VIEWS FOR MANAGEMENT PORTAL
-- =============================================

-- View: MDA Summary with Statistics
GO
CREATE OR ALTER VIEW vw_MDASummary AS
SELECT 
    m.MDAId,
    m.MDACode,
    m.MDAName,
    m.MDAType,
    m.StatusId,
    CASE m.StatusId 
        WHEN 5 THEN 'Active'
        WHEN 6 THEN 'Inactive'
        ELSE 'Unknown'
    END AS StatusName,
    m.CanSubmitCorrespondence,
    m.CanSubmitContracts,
    m.RequiresSGApproval,
    COALESCE(s.TotalCorrespondenceSubmitted, 0) AS TotalCorrespondence,
    COALESCE(s.TotalContractsSubmitted, 0) AS TotalContracts,
    COALESCE(s.ActiveUsersCount, 0) AS ActiveUsers,
    COALESCE(s.TotalContractValue, 0) AS TotalContractValue,
    m.CreatedAt
FROM MDAs m
LEFT JOIN MDAStatistics s ON m.MDAId = s.MDAId 
    AND s.StatDate = CAST(GETDATE() AS DATE);
GO

-- View: Pending Actions Summary (for Activity Monitor)
GO
CREATE OR ALTER VIEW vw_PendingActionsSummary AS
SELECT 
    ActionType,
    CaseType,
    PriorityLevel,
    COUNT(*) AS ActionCount,
    SUM(CASE WHEN IsOverdue = 1 THEN 1 ELSE 0 END) AS OverdueCount,
    AVG(DaysInQueue) AS AvgDaysInQueue
FROM PendingActionsQueue
WHERE Status = 'pending'
GROUP BY ActionType, CaseType, PriorityLevel;
GO

-- View: Today's Statistics (for Status Overview)
GO
CREATE OR ALTER VIEW vw_TodayStatistics AS
SELECT TOP 1
    SnapshotDate,
    TotalCorrespondence,
    CorrespondenceSubmittedToday,
    CorrespondencePendingReview,
    CorrespondenceOverdue,
    TotalContracts,
    ContractsSubmittedToday,
    ContractsPendingReview,
    ContractsOverdue,
    TotalContractValue,
    TotalUsers,
    ActiveUsersToday,
    PendingStaffRequests,
    SLAComplianceRate,
    GeneratedAt
FROM DailyStatisticsSnapshot
ORDER BY SnapshotDate DESC;
GO

-- View: Recent Activity Feed
GO
CREATE OR ALTER VIEW vw_RecentActivityFeed AS
SELECT TOP 100
    a.ActivityLogId,
    a.ActionType,
    a.ActionDescription,
    a.EntityType,
    a.EntityId,
    a.UserId,
    u.FirstName + ' ' + u.LastName AS UserName,
    a.IPAddress,
    a.CreatedAt
FROM ActivityLog a
LEFT JOIN UserProfiles u ON a.UserId = u.UserId
ORDER BY a.CreatedAt DESC;
GO

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Procedure: Update Daily Statistics Snapshot
GO
CREATE OR ALTER PROCEDURE sp_UpdateDailyStatistics
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    
    -- Delete existing snapshot for today (will be refreshed)
    DELETE FROM DailyStatisticsSnapshot WHERE SnapshotDate = @Today;
    
    -- Insert new snapshot
    INSERT INTO DailyStatisticsSnapshot (
        SnapshotDate,
        TotalCorrespondence,
        CorrespondenceSubmittedToday,
        CorrespondencePendingReview,
        CorrespondenceApprovedToday,
        CorrespondenceRejectedToday,
        CorrespondenceOverdue,
        TotalContracts,
        ContractsSubmittedToday,
        ContractsPendingReview,
        ContractsApprovedToday,
        ContractsRejectedToday,
        ContractsOverdue,
        TotalContractValue,
        TotalUsers,
        ActiveUsersToday,
        NewRegistrationsToday,
        PendingStaffRequests,
        SLAComplianceRate
    )
    SELECT
        @Today,
        -- Correspondence stats (from CorrespondenceRegister)
        (SELECT COUNT(*) FROM CorrespondenceRegister),
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE CAST(SubmissionDate AS DATE) = @Today),
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE StatusId IN (1, 2, 3)), -- Pending statuses
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE StatusId = 8 AND CAST(CompletedDate AS DATE) = @Today),
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE StatusId = 9 AND CAST(CompletedDate AS DATE) = @Today),
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE IsOverdue = 1),
        -- Contract stats (from ContractsRegister)
        (SELECT COUNT(*) FROM ContractsRegister),
        (SELECT COUNT(*) FROM ContractsRegister WHERE CAST(SubmissionDate AS DATE) = @Today),
        (SELECT COUNT(*) FROM ContractsRegister WHERE StatusId IN (1, 2, 3)), -- Pending statuses
        (SELECT COUNT(*) FROM ContractsRegister WHERE StatusId = 8 AND CAST(DateCompleted AS DATE) = @Today),
        (SELECT COUNT(*) FROM ContractsRegister WHERE StatusId = 9 AND CAST(DateCompleted AS DATE) = @Today),
        (SELECT COUNT(*) FROM ContractsRegister WHERE IsOverdue = 1),
        (SELECT COALESCE(SUM(ContractValue), 0) FROM ContractsRegister),
        -- User stats
        (SELECT COUNT(*) FROM UserProfiles WHERE StatusId = 5),
        (SELECT COUNT(*) FROM UserProfiles WHERE CAST(LastLoginAt AS DATE) = @Today),
        (SELECT COUNT(*) FROM UserProfiles WHERE CAST(CreatedAt AS DATE) = @Today),
        (SELECT COUNT(*) FROM StaffRegistrationRequests WHERE RequestStatus = 'PENDING'),
        -- SLA compliance (simplified calculation)
        (SELECT 
            CASE 
                WHEN COUNT(*) = 0 THEN 100.00
                ELSE CAST(SUM(CASE WHEN IsOverdue = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2))
            END
        FROM (
            SELECT IsOverdue FROM CorrespondenceRegister WHERE StatusId NOT IN (8, 9)
            UNION ALL
            SELECT IsOverdue FROM ContractsRegister WHERE StatusId NOT IN (8, 9)
        ) AS OpenCases);
END;
GO

-- Procedure: Get System Setting Value
GO
CREATE OR ALTER PROCEDURE sp_GetSystemSetting
    @SettingKey NVARCHAR(100),
    @DefaultValue NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT COALESCE(SettingValue, @DefaultValue) AS SettingValue
    FROM SystemSettings
    WHERE SettingKey = @SettingKey;
END;
GO

-- Procedure: Update System Setting
GO
CREATE OR ALTER PROCEDURE sp_UpdateSystemSetting
    @SettingKey NVARCHAR(100),
    @SettingValue NVARCHAR(MAX),
    @ModifiedBy NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE SystemSettings
    SET SettingValue = @SettingValue,
        LastModifiedBy = @ModifiedBy,
        LastModifiedAt = GETDATE()
    WHERE SettingKey = @SettingKey
      AND IsEditable = 1;
    
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Setting not found or not editable', 16, 1);
    END
END;
GO

-- Procedure: Refresh MDA Statistics
GO
CREATE OR ALTER PROCEDURE sp_RefreshMDAStatistics
    @MDAId INT = NULL -- NULL refreshes all MDAs
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    
    -- Delete existing stats for today
    DELETE FROM MDAStatistics 
    WHERE StatDate = @Today 
      AND (@MDAId IS NULL OR MDAId = @MDAId);
    
    -- Insert refreshed stats
    INSERT INTO MDAStatistics (
        MDAId, StatDate,
        TotalCorrespondenceSubmitted, TotalCorrespondenceApproved, TotalCorrespondencePending, TotalCorrespondenceRejected,
        TotalContractsSubmitted, TotalContractsApproved, TotalContractsPending, TotalContractsRejected,
        TotalContractValue, ActiveUsersCount
    )
    SELECT 
        m.MDAId,
        @Today,
        COALESCE(corr.Submitted, 0),
        COALESCE(corr.Approved, 0),
        COALESCE(corr.Pending, 0),
        COALESCE(corr.Rejected, 0),
        COALESCE(cont.Submitted, 0),
        COALESCE(cont.Approved, 0),
        COALESCE(cont.Pending, 0),
        COALESCE(cont.Rejected, 0),
        COALESCE(cont.TotalValue, 0),
        COALESCE(usr.ActiveCount, 0)
    FROM MDAs m
    LEFT JOIN (
        SELECT DepartmentId,
            COUNT(*) AS Submitted,
            SUM(CASE WHEN StatusId = 8 THEN 1 ELSE 0 END) AS Approved,
            SUM(CASE WHEN StatusId IN (1,2,3) THEN 1 ELSE 0 END) AS Pending,
            SUM(CASE WHEN StatusId = 9 THEN 1 ELSE 0 END) AS Rejected
        FROM CorrespondenceRegister
        GROUP BY DepartmentId
    ) corr ON m.MDAId = corr.DepartmentId
    LEFT JOIN (
        SELECT OriginatingMDA,
            COUNT(*) AS Submitted,
            SUM(CASE WHEN StatusId = 8 THEN 1 ELSE 0 END) AS Approved,
            SUM(CASE WHEN StatusId IN (1,2,3) THEN 1 ELSE 0 END) AS Pending,
            SUM(CASE WHEN StatusId = 9 THEN 1 ELSE 0 END) AS Rejected,
            SUM(ContractValue) AS TotalValue
        FROM ContractsRegister
        GROUP BY OriginatingMDA
    ) cont ON m.MDACode = cont.OriginatingMDA
    LEFT JOIN (
        SELECT DepartmentId, COUNT(*) AS ActiveCount
        FROM UserProfiles
        WHERE StatusId = 5
        GROUP BY DepartmentId
    ) usr ON m.MDAId = usr.DepartmentId
    WHERE @MDAId IS NULL OR m.MDAId = @MDAId;
END;
GO

PRINT 'Management Portal tables created successfully!';
PRINT 'Tables: MDAs, MDAContacts, MDAStatistics, SystemSettings, SystemAnnouncements, UserNotificationPreferences, SavedReports, ReportExecutionLog, DailyStatisticsSnapshot, PendingActionsQueue, LookupRejectionReasons, StaffRequestStatusHistory';
PRINT 'Views: vw_MDASummary, vw_PendingActionsSummary, vw_TodayStatistics, vw_RecentActivityFeed';
PRINT 'Procedures: sp_UpdateDailyStatistics, sp_GetSystemSetting, sp_UpdateSystemSetting, sp_RefreshMDAStatistics';
