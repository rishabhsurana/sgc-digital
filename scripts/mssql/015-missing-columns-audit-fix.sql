-- =====================================================
-- SGC Digital - Missing Columns Audit Fix
-- Script: 015-missing-columns-audit-fix.sql
-- Created: March 2024
-- Purpose: Add missing columns identified in application audit
-- =====================================================

-- =====================================================
-- 1. CORRESPONDENCE REGISTER - MISSING COLUMNS
-- =====================================================

-- Add ContactUnit column (form field exists but no DB column)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'ContactUnit')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD ContactUnit NVARCHAR(200);
    PRINT 'Added ContactUnit column to CorrespondenceRegister';
END

-- Add MinistryFileReference column (form field exists but no DB column)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'MinistryFileReference')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD MinistryFileReference NVARCHAR(100);
    PRINT 'Added MinistryFileReference column to CorrespondenceRegister';
END

-- Add UrgentReason column (form field exists for urgent justification)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'UrgentReason')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD UrgentReason NVARCHAR(500);
    PRINT 'Added UrgentReason column to CorrespondenceRegister';
END

-- =====================================================
-- 2. ENTITIES TABLE - MISSING COLUMNS FOR ATTORNEYS/COURTS
-- =====================================================

-- Add CourtName column (for Court entity types)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Entities') AND name = 'CourtName')
BEGIN
    ALTER TABLE Entities ADD CourtName NVARCHAR(200);
    PRINT 'Added CourtName column to Entities';
END

-- Add LawFirmName column (for Attorney entity types)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Entities') AND name = 'LawFirmName')
BEGIN
    ALTER TABLE Entities ADD LawFirmName NVARCHAR(200);
    PRINT 'Added LawFirmName column to Entities';
END

-- Add BarNumber column (for Attorney entity types)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Entities') AND name = 'BarNumber')
BEGIN
    ALTER TABLE Entities ADD BarNumber NVARCHAR(50);
    PRINT 'Added BarNumber column to Entities';
END

-- =====================================================
-- 3. CONTRACTS REGISTER - MISSING FINANCIAL/LEGAL FIELDS
-- =====================================================

-- Add AuthorizedSignatoryId
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'AuthorizedSignatoryId')
BEGIN
    ALTER TABLE ContractsRegister ADD AuthorizedSignatoryId UNIQUEIDENTIFIER;
    PRINT 'Added AuthorizedSignatoryId column to ContractsRegister';
END

-- Add LiquidatedDamagesRate (rate per day for delays)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'LiquidatedDamagesRate')
BEGIN
    ALTER TABLE ContractsRegister ADD LiquidatedDamagesRate DECIMAL(18, 2);
    PRINT 'Added LiquidatedDamagesRate column to ContractsRegister';
END

-- Add RetentionPercentage
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'RetentionPercentage')
BEGIN
    ALTER TABLE ContractsRegister ADD RetentionPercentage DECIMAL(5, 2);
    PRINT 'Added RetentionPercentage column to ContractsRegister';
END

-- Add AdvancePaymentPercentage
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'AdvancePaymentPercentage')
BEGIN
    ALTER TABLE ContractsRegister ADD AdvancePaymentPercentage DECIMAL(5, 2);
    PRINT 'Added AdvancePaymentPercentage column to ContractsRegister';
END

-- Add ContingencyAmount
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'ContingencyAmount')
BEGIN
    ALTER TABLE ContractsRegister ADD ContingencyAmount DECIMAL(18, 2);
    PRINT 'Added ContingencyAmount column to ContractsRegister';
END

-- Add WarrantyPeriodMonths
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'WarrantyPeriodMonths')
BEGIN
    ALTER TABLE ContractsRegister ADD WarrantyPeriodMonths INT;
    PRINT 'Added WarrantyPeriodMonths column to ContractsRegister';
END

-- Add DefectsLiabilityPeriodMonths
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'DefectsLiabilityPeriodMonths')
BEGIN
    ALTER TABLE ContractsRegister ADD DefectsLiabilityPeriodMonths INT;
    PRINT 'Added DefectsLiabilityPeriodMonths column to ContractsRegister';
END

-- Add InsuranceRequirements
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'InsuranceRequirements')
BEGIN
    ALTER TABLE ContractsRegister ADD InsuranceRequirements NVARCHAR(1000);
    PRINT 'Added InsuranceRequirements column to ContractsRegister';
END

-- Add GoverningLaw
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'GoverningLaw')
BEGIN
    ALTER TABLE ContractsRegister ADD GoverningLaw NVARCHAR(100) DEFAULT 'Laws of Barbados';
    PRINT 'Added GoverningLaw column to ContractsRegister';
END

-- Add DisputeResolutionMethod
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'DisputeResolutionMethod')
BEGIN
    ALTER TABLE ContractsRegister ADD DisputeResolutionMethod NVARCHAR(100);
    PRINT 'Added DisputeResolutionMethod column to ContractsRegister';
END

-- =====================================================
-- 4. LOOKUP TABLE FOR DISPUTE RESOLUTION METHODS
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'LookupDisputeResolutionMethods')
BEGIN
    CREATE TABLE LookupDisputeResolutionMethods (
        MethodId INT IDENTITY(1,1) PRIMARY KEY,
        MethodCode NVARCHAR(50) NOT NULL UNIQUE,
        MethodName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        IsActive BIT NOT NULL DEFAULT 1,
        SortOrder INT DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
    
    -- Seed data
    INSERT INTO LookupDisputeResolutionMethods (MethodCode, MethodName, Description, SortOrder)
    VALUES
        ('ARBITRATION', 'Arbitration', 'Binding arbitration per agreed rules', 1),
        ('COURT', 'Courts of Barbados', 'Legal proceedings in Barbados courts', 2),
        ('MEDIATION', 'Mediation', 'Non-binding mediation followed by arbitration', 3),
        ('NEGOTIATION', 'Negotiation', 'Good faith negotiation between parties', 4),
        ('EXPERT', 'Expert Determination', 'Technical disputes determined by expert', 5);
    
    PRINT 'Created LookupDisputeResolutionMethods table';
END

-- =====================================================
-- 5. LOOKUP TABLE FOR AUTHORIZED SIGNATORIES
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'LookupAuthorizedSignatories')
BEGIN
    CREATE TABLE LookupAuthorizedSignatories (
        SignatoryId INT IDENTITY(1,1) PRIMARY KEY,
        SignatoryCode NVARCHAR(50) NOT NULL UNIQUE,
        SignatoryName NVARCHAR(200) NOT NULL,
        Position NVARCHAR(200) NOT NULL,
        DepartmentId INT,
        SignatureAuthority NVARCHAR(100), -- E.g., 'Unlimited', 'Up to $500,000', etc.
        IsActive BIT NOT NULL DEFAULT 1,
        EffectiveFrom DATE NOT NULL DEFAULT GETDATE(),
        EffectiveTo DATE,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
    
    -- Seed sample signatories
    INSERT INTO LookupAuthorizedSignatories (SignatoryCode, SignatoryName, Position, SignatureAuthority)
    VALUES
        ('SG', 'Solicitor General', 'Solicitor General', 'Unlimited'),
        ('DSG', 'Deputy Solicitor General', 'Deputy Solicitor General', 'Up to $5,000,000'),
        ('CHIEF_PA', 'Chief Parliamentary Counsel', 'Chief Parliamentary Counsel', 'Up to $1,000,000'),
        ('SENIOR_CA', 'Senior Crown Counsel', 'Senior Crown Counsel', 'Up to $500,000');
    
    PRINT 'Created LookupAuthorizedSignatories table';
END

-- =====================================================
-- 6. ADD EMAIL NOTIFICATION TRACKING COLUMNS
-- =====================================================

-- Track when notification was sent for each record
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'SubmissionNotificationSentAt')
BEGIN
    ALTER TABLE ContractsRegister ADD SubmissionNotificationSentAt DATETIME2;
    PRINT 'Added SubmissionNotificationSentAt column to ContractsRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'LastStatusChangeNotificationSentAt')
BEGIN
    ALTER TABLE ContractsRegister ADD LastStatusChangeNotificationSentAt DATETIME2;
    PRINT 'Added LastStatusChangeNotificationSentAt column to ContractsRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'SubmissionNotificationSentAt')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD SubmissionNotificationSentAt DATETIME2;
    PRINT 'Added SubmissionNotificationSentAt column to CorrespondenceRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'LastStatusChangeNotificationSentAt')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD LastStatusChangeNotificationSentAt DATETIME2;
    PRINT 'Added LastStatusChangeNotificationSentAt column to CorrespondenceRegister';
END

-- =====================================================
-- 7. ADD SLA TRACKING COLUMNS
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'SLADueDate')
BEGIN
    ALTER TABLE ContractsRegister ADD SLADueDate DATE;
    PRINT 'Added SLADueDate column to ContractsRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'SLAWarningDate')
BEGIN
    ALTER TABLE ContractsRegister ADD SLAWarningDate DATE;
    PRINT 'Added SLAWarningDate column to ContractsRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'IsOverdue')
BEGIN
    ALTER TABLE ContractsRegister ADD IsOverdue BIT DEFAULT 0;
    PRINT 'Added IsOverdue column to ContractsRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContractsRegister') AND name = 'EscalationLevel')
BEGIN
    ALTER TABLE ContractsRegister ADD EscalationLevel INT DEFAULT 0;
    PRINT 'Added EscalationLevel column to ContractsRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'SLADueDate')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD SLADueDate DATE;
    PRINT 'Added SLADueDate column to CorrespondenceRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'SLAWarningDate')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD SLAWarningDate DATE;
    PRINT 'Added SLAWarningDate column to CorrespondenceRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'IsOverdue')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD IsOverdue BIT DEFAULT 0;
    PRINT 'Added IsOverdue column to CorrespondenceRegister';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CorrespondenceRegister') AND name = 'EscalationLevel')
BEGIN
    ALTER TABLE CorrespondenceRegister ADD EscalationLevel INT DEFAULT 0;
    PRINT 'Added EscalationLevel column to CorrespondenceRegister';
END

-- =====================================================
-- 8. CREATE PASSWORD RESET TOKENS TABLE
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PasswordResetTokens')
BEGIN
    CREATE TABLE PasswordResetTokens (
        TokenId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        Token NVARCHAR(255) NOT NULL UNIQUE,
        ExpiresAt DATETIME2 NOT NULL,
        UsedAt DATETIME2,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        IPAddress NVARCHAR(45),
        UserAgent NVARCHAR(500)
    );
    
    CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens(Token);
    CREATE INDEX IX_PasswordResetTokens_UserId ON PasswordResetTokens(UserId);
    CREATE INDEX IX_PasswordResetTokens_ExpiresAt ON PasswordResetTokens(ExpiresAt);
    
    PRINT 'Created PasswordResetTokens table';
END

-- =====================================================
-- 9. CREATE SESSION TRACKING TABLE
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserSessions')
BEGIN
    CREATE TABLE UserSessions (
        SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NOT NULL,
        SessionToken NVARCHAR(255) NOT NULL UNIQUE,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        ExpiresAt DATETIME2 NOT NULL,
        LastActivityAt DATETIME2 DEFAULT GETDATE(),
        IPAddress NVARCHAR(45),
        UserAgent NVARCHAR(500),
        DeviceType NVARCHAR(50),
        IsActive BIT DEFAULT 1,
        InvalidatedAt DATETIME2,
        InvalidatedReason NVARCHAR(100)
    );
    
    CREATE INDEX IX_UserSessions_UserId ON UserSessions(UserId);
    CREATE INDEX IX_UserSessions_SessionToken ON UserSessions(SessionToken);
    CREATE INDEX IX_UserSessions_IsActive ON UserSessions(IsActive);
    
    PRINT 'Created UserSessions table';
END

-- =====================================================
-- 10. CREATE AUDIT LOG TABLE (if not exists)
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE AuditLog (
        AuditId BIGINT IDENTITY(1,1) PRIMARY KEY,
        Timestamp DATETIME2 DEFAULT GETDATE(),
        UserId UNIQUEIDENTIFIER,
        UserEmail NVARCHAR(255),
        Action NVARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, etc.
        EntityType NVARCHAR(100), -- Contract, Correspondence, User, etc.
        EntityId NVARCHAR(100),
        OldValues NVARCHAR(MAX), -- JSON
        NewValues NVARCHAR(MAX), -- JSON
        IPAddress NVARCHAR(45),
        UserAgent NVARCHAR(500),
        SessionId UNIQUEIDENTIFIER,
        AdditionalInfo NVARCHAR(MAX) -- JSON for any extra context
    );
    
    CREATE INDEX IX_AuditLog_Timestamp ON AuditLog(Timestamp DESC);
    CREATE INDEX IX_AuditLog_UserId ON AuditLog(UserId);
    CREATE INDEX IX_AuditLog_EntityType ON AuditLog(EntityType);
    CREATE INDEX IX_AuditLog_EntityId ON AuditLog(EntityId);
    CREATE INDEX IX_AuditLog_Action ON AuditLog(Action);
    
    PRINT 'Created AuditLog table';
END

-- =====================================================
-- 11. STORED PROCEDURE: Calculate SLA Due Date
-- =====================================================

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_CalculateSLADates')
    DROP PROCEDURE sp_CalculateSLADates;
GO

CREATE PROCEDURE sp_CalculateSLADates
    @RecordType NVARCHAR(20), -- 'CONTRACT' or 'CORRESPONDENCE'
    @RecordId UNIQUEIDENTIFIER,
    @PriorityId INT,
    @SubmittedDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SLADays INT;
    DECLARE @WarningDays INT;
    DECLARE @DueDate DATE;
    DECLARE @WarningDate DATE;
    
    -- SLA days based on priority
    SET @SLADays = CASE @PriorityId
        WHEN 1 THEN 21  -- Low priority: 21 days
        WHEN 2 THEN 14  -- Normal: 14 days
        WHEN 3 THEN 7   -- High: 7 days
        WHEN 4 THEN 3   -- Urgent: 3 days
        WHEN 5 THEN 1   -- Critical: 1 day
        ELSE 14         -- Default: 14 days
    END;
    
    -- Warning threshold (50% of SLA time)
    SET @WarningDays = CEILING(@SLADays * 0.5);
    
    -- Calculate dates
    SET @DueDate = DATEADD(DAY, @SLADays, @SubmittedDate);
    SET @WarningDate = DATEADD(DAY, @WarningDays, @SubmittedDate);
    
    -- Update the appropriate table
    IF @RecordType = 'CONTRACT'
    BEGIN
        UPDATE ContractsRegister
        SET SLADueDate = @DueDate,
            SLAWarningDate = @WarningDate,
            IsOverdue = CASE WHEN GETDATE() > @DueDate THEN 1 ELSE 0 END
        WHERE ContractId = @RecordId;
    END
    ELSE IF @RecordType = 'CORRESPONDENCE'
    BEGIN
        UPDATE CorrespondenceRegister
        SET SLADueDate = @DueDate,
            SLAWarningDate = @WarningDate,
            IsOverdue = CASE WHEN GETDATE() > @DueDate THEN 1 ELSE 0 END
        WHERE CorrespondenceId = @RecordId;
    END
    
    SELECT @DueDate AS DueDate, @WarningDate AS WarningDate, @SLADays AS SLADays;
END;
GO

PRINT 'Created sp_CalculateSLADates stored procedure';

-- =====================================================
-- 12. STORED PROCEDURE: Update Overdue Status
-- =====================================================

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_UpdateOverdueStatus')
    DROP PROCEDURE sp_UpdateOverdueStatus;
GO

CREATE PROCEDURE sp_UpdateOverdueStatus
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update contracts overdue status
    UPDATE ContractsRegister
    SET IsOverdue = 1,
        EscalationLevel = CASE 
            WHEN DATEDIFF(DAY, SLADueDate, GETDATE()) > 14 THEN 3  -- Critical
            WHEN DATEDIFF(DAY, SLADueDate, GETDATE()) > 7 THEN 2   -- High
            WHEN DATEDIFF(DAY, SLADueDate, GETDATE()) > 0 THEN 1   -- Warning
            ELSE 0
        END
    WHERE SLADueDate IS NOT NULL 
      AND GETDATE() > SLADueDate
      AND CaseStatusId NOT IN (7, 8, 9, 10); -- Not completed, cancelled, rejected, archived
    
    -- Update correspondence overdue status
    UPDATE CorrespondenceRegister
    SET IsOverdue = 1,
        EscalationLevel = CASE 
            WHEN DATEDIFF(DAY, SLADueDate, GETDATE()) > 14 THEN 3  -- Critical
            WHEN DATEDIFF(DAY, SLADueDate, GETDATE()) > 7 THEN 2   -- High
            WHEN DATEDIFF(DAY, SLADueDate, GETDATE()) > 0 THEN 1   -- Warning
            ELSE 0
        END
    WHERE SLADueDate IS NOT NULL 
      AND GETDATE() > SLADueDate
      AND StatusId NOT IN (7, 8, 9, 10); -- Not completed, cancelled, rejected, archived
    
    -- Return counts
    SELECT 
        (SELECT COUNT(*) FROM ContractsRegister WHERE IsOverdue = 1) AS OverdueContracts,
        (SELECT COUNT(*) FROM CorrespondenceRegister WHERE IsOverdue = 1) AS OverdueCorrespondence;
END;
GO

PRINT 'Created sp_UpdateOverdueStatus stored procedure';

-- =====================================================
-- 13. STORED PROCEDURE: Log Audit Entry
-- =====================================================

IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_LogAuditEntry')
    DROP PROCEDURE sp_LogAuditEntry;
GO

CREATE PROCEDURE sp_LogAuditEntry
    @UserId UNIQUEIDENTIFIER = NULL,
    @UserEmail NVARCHAR(255) = NULL,
    @Action NVARCHAR(100),
    @EntityType NVARCHAR(100) = NULL,
    @EntityId NVARCHAR(100) = NULL,
    @OldValues NVARCHAR(MAX) = NULL,
    @NewValues NVARCHAR(MAX) = NULL,
    @IPAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @SessionId UNIQUEIDENTIFIER = NULL,
    @AdditionalInfo NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO AuditLog (
        UserId, UserEmail, Action, EntityType, EntityId,
        OldValues, NewValues, IPAddress, UserAgent, SessionId, AdditionalInfo
    )
    VALUES (
        @UserId, @UserEmail, @Action, @EntityType, @EntityId,
        @OldValues, @NewValues, @IPAddress, @UserAgent, @SessionId, @AdditionalInfo
    );
    
    SELECT SCOPE_IDENTITY() AS AuditId;
END;
GO

PRINT 'Created sp_LogAuditEntry stored procedure';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

PRINT '================================================';
PRINT 'Script 015 completed successfully';
PRINT 'Added columns for:';
PRINT '  - CorrespondenceRegister: ContactUnit, MinistryFileReference, UrgentReason';
PRINT '  - Entities: CourtName, LawFirmName, BarNumber';
PRINT '  - ContractsRegister: Financial/Legal fields';
PRINT '  - Email notification tracking columns';
PRINT '  - SLA tracking columns';
PRINT 'Created tables:';
PRINT '  - LookupDisputeResolutionMethods';
PRINT '  - LookupAuthorizedSignatories';
PRINT '  - PasswordResetTokens';
PRINT '  - UserSessions';
PRINT '  - AuditLog';
PRINT 'Created stored procedures:';
PRINT '  - sp_CalculateSLADates';
PRINT '  - sp_UpdateOverdueStatus';
PRINT '  - sp_LogAuditEntry';
PRINT '================================================';
