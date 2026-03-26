-- =============================================
-- SGC Digital - Renewal & Supplemental Validation Schema
-- MS SQL Server
-- Handles: Entity ownership validation, prepopulation, renewal limits
-- =============================================

-- =============================================
-- 1. LOOKUP TABLES FOR VALIDATION RULES
-- =============================================

-- Contract Renewal/Supplemental Limits by Category
CREATE TABLE dbo.LookupContractRenewalLimits (
    LimitId INT IDENTITY(1,1) PRIMARY KEY,
    ContractNatureId INT NOT NULL REFERENCES dbo.LookupContractNature(ContractNatureId),
    ContractCategoryId INT NULL REFERENCES dbo.LookupContractCategories(CategoryId),
    MaxRenewals INT NOT NULL DEFAULT 3,
    MaxSupplementals INT NOT NULL DEFAULT 5,
    MaxRenewalValueIncreasePercent DECIMAL(5,2) NULL DEFAULT 15.00, -- Max 15% increase per renewal
    MaxSupplementalValueIncreasePercent DECIMAL(5,2) NULL DEFAULT 25.00, -- Max 25% for supplementals
    MaxTotalContractDurationMonths INT NULL DEFAULT 60, -- Max 5 years total including renewals
    RequiresCabinetApprovalAfterRenewals INT NULL DEFAULT 2, -- After 2 renewals, needs Cabinet
    Notes NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Validation Error Codes
CREATE TABLE dbo.LookupValidationErrorCodes (
    ErrorCodeId INT IDENTITY(1,1) PRIMARY KEY,
    ErrorCode NVARCHAR(50) NOT NULL UNIQUE,
    ErrorMessage NVARCHAR(500) NOT NULL,
    ErrorCategory NVARCHAR(50) NOT NULL, -- 'OWNERSHIP', 'STATUS', 'LIMIT', 'EXPIRY', 'PENDING'
    Severity NVARCHAR(20) NOT NULL DEFAULT 'ERROR', -- 'ERROR', 'WARNING', 'INFO'
    SuggestedAction NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 2. ADD ENTITY OWNERSHIP TO CONTRACTS
-- =============================================

-- Add columns to ContractsRegister if they don't exist
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'OwnerEntityId')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD OwnerEntityId UNIQUEIDENTIFIER NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'OwnerEntityNumber')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD OwnerEntityNumber NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'MaxRenewals')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD MaxRenewals INT NOT NULL DEFAULT 3;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'RenewalCount')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD RenewalCount INT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'SupplementalCount')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD SupplementalCount INT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'HasPendingRenewal')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD HasPendingRenewal BIT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'HasPendingSupplemental')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD HasPendingSupplemental BIT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'LastRenewalDate')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD LastRenewalDate DATE NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'ParentContractId')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD ParentContractId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractsRegister(ContractId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'IsRenewal')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD IsRenewal BIT NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'IsSupplemental')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD IsSupplemental BIT NOT NULL DEFAULT 0;
END
GO

-- =============================================
-- 3. CONTRACT VALIDATION LOG
-- =============================================

-- Log all validation attempts for audit
CREATE TABLE dbo.ContractValidationLog (
    LogId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- What was being validated
    ContractNumber NVARCHAR(100) NOT NULL,
    ValidationPurpose NVARCHAR(50) NOT NULL, -- 'RENEWAL', 'SUPPLEMENTAL'
    
    -- Who requested validation
    RequestingUserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    RequestingEntityId UNIQUEIDENTIFIER NULL,
    RequestingEntityNumber NVARCHAR(50) NULL,
    
    -- Validation result
    WasSuccessful BIT NOT NULL,
    ErrorCodes NVARCHAR(MAX) NULL, -- JSON array of error codes
    WarningCodes NVARCHAR(MAX) NULL, -- JSON array of warning codes
    
    -- Contract found (if any)
    FoundContractId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractsRegister(ContractId),
    FoundOwnerEntityId UNIQUEIDENTIFIER NULL,
    
    -- Failure reason category
    FailureCategory NVARCHAR(50) NULL, -- 'NOT_FOUND', 'WRONG_ENTITY', 'WRONG_STATUS', 'LIMIT_EXCEEDED', 'EXPIRED'
    
    -- Audit
    IPAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 4. VALIDATION STORED PROCEDURE
-- =============================================

CREATE OR ALTER PROCEDURE dbo.sp_ValidateContractForRenewalSupplemental
    @ContractNumber NVARCHAR(100),
    @RequestingEntityId UNIQUEIDENTIFIER,
    @ValidationPurpose NVARCHAR(50), -- 'RENEWAL' or 'SUPPLEMENTAL'
    @RequestingUserId UNIQUEIDENTIFIER,
    @IPAddress NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ContractId UNIQUEIDENTIFIER;
    DECLARE @OwnerEntityId UNIQUEIDENTIFIER;
    DECLARE @Status NVARCHAR(50);
    DECLARE @ExpiryDate DATE;
    DECLARE @RenewalCount INT;
    DECLARE @SupplementalCount INT;
    DECLARE @MaxRenewals INT;
    DECLARE @HasPendingRenewal BIT;
    DECLARE @HasPendingSupplemental BIT;
    DECLARE @DaysUntilExpiry INT;
    DECLARE @ErrorCodes TABLE (ErrorCode NVARCHAR(50));
    DECLARE @WarningCodes TABLE (WarningCode NVARCHAR(50));
    DECLARE @IsValid BIT = 1;
    DECLARE @FailureCategory NVARCHAR(50) = NULL;
    
    -- Find the contract
    SELECT 
        @ContractId = c.ContractId,
        @OwnerEntityId = c.OwnerEntityId,
        @Status = cs.StatusCode,
        @ExpiryDate = COALESCE(c.ExpiryDate, c.ProposedEndDate),
        @RenewalCount = ISNULL(c.RenewalCount, 0),
        @SupplementalCount = ISNULL(c.SupplementalCount, 0),
        @MaxRenewals = ISNULL(c.MaxRenewals, 3),
        @HasPendingRenewal = ISNULL(c.HasPendingRenewal, 0),
        @HasPendingSupplemental = ISNULL(c.HasPendingSupplemental, 0)
    FROM dbo.ContractsRegister c
    INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId
    WHERE c.ReferenceNumber = @ContractNumber
       OR c.FinalContractNumber = @ContractNumber
       OR CAST(c.ContractId AS NVARCHAR(50)) = @ContractNumber;
    
    -- VALIDATION 1: Contract exists
    IF @ContractId IS NULL
    BEGIN
        INSERT INTO @ErrorCodes VALUES ('CONTRACT_NOT_FOUND');
        SET @IsValid = 0;
        SET @FailureCategory = 'NOT_FOUND';
    END
    ELSE
    BEGIN
        -- VALIDATION 2: Entity ownership
        IF @OwnerEntityId IS NULL OR @OwnerEntityId <> @RequestingEntityId
        BEGIN
            INSERT INTO @ErrorCodes VALUES ('ENTITY_NOT_OWNER');
            SET @IsValid = 0;
            SET @FailureCategory = 'WRONG_ENTITY';
        END
        
        -- VALIDATION 3: Status allows renewal/supplemental
        IF @Status NOT IN ('ACTIVE', 'EXECUTED', 'APPROVED', 'EXPIRING_SOON')
        BEGIN
            INSERT INTO @ErrorCodes VALUES ('INVALID_STATUS');
            SET @IsValid = 0;
            SET @FailureCategory = 'WRONG_STATUS';
        END
        
        -- VALIDATION 4: Check expiry for renewals
        IF @ValidationPurpose = 'RENEWAL'
        BEGIN
            SET @DaysUntilExpiry = DATEDIFF(DAY, GETUTCDATE(), @ExpiryDate);
            
            IF @DaysUntilExpiry < -30
            BEGIN
                INSERT INTO @ErrorCodes VALUES ('EXPIRED_OVER_30_DAYS');
                SET @IsValid = 0;
                SET @FailureCategory = 'EXPIRED';
            END
            ELSE IF @DaysUntilExpiry < 0
            BEGIN
                INSERT INTO @WarningCodes VALUES ('ALREADY_EXPIRED');
            END
            ELSE IF @DaysUntilExpiry <= 30
            BEGIN
                INSERT INTO @WarningCodes VALUES ('EXPIRING_WITHIN_30_DAYS');
            END
            
            -- VALIDATION 5: Max renewals not exceeded
            IF @RenewalCount >= @MaxRenewals
            BEGIN
                INSERT INTO @ErrorCodes VALUES ('MAX_RENEWALS_EXCEEDED');
                SET @IsValid = 0;
                SET @FailureCategory = 'LIMIT_EXCEEDED';
            END
            
            -- VALIDATION 6: No pending renewal
            IF @HasPendingRenewal = 1
            BEGIN
                INSERT INTO @ErrorCodes VALUES ('PENDING_RENEWAL_EXISTS');
                SET @IsValid = 0;
                SET @FailureCategory = 'PENDING';
            END
        END
        
        -- VALIDATION for supplementals
        IF @ValidationPurpose = 'SUPPLEMENTAL'
        BEGIN
            IF @HasPendingSupplemental = 1
            BEGIN
                INSERT INTO @WarningCodes VALUES ('PENDING_SUPPLEMENTAL_EXISTS');
            END
        END
    END
    
    -- Log the validation attempt
    INSERT INTO dbo.ContractValidationLog (
        ContractNumber, ValidationPurpose, RequestingUserId, RequestingEntityId,
        WasSuccessful, ErrorCodes, WarningCodes,
        FoundContractId, FoundOwnerEntityId, FailureCategory,
        IPAddress, UserAgent
    )
    VALUES (
        @ContractNumber, @ValidationPurpose, @RequestingUserId, @RequestingEntityId,
        @IsValid,
        (SELECT STRING_AGG(ErrorCode, ',') FROM @ErrorCodes),
        (SELECT STRING_AGG(WarningCode, ',') FROM @WarningCodes),
        @ContractId, @OwnerEntityId, @FailureCategory,
        @IPAddress, @UserAgent
    );
    
    -- Return results
    SELECT 
        @IsValid AS IsValid,
        @ContractId AS ContractId,
        @FailureCategory AS FailureCategory,
        (SELECT ErrorCode FROM @ErrorCodes FOR JSON PATH) AS Errors,
        (SELECT WarningCode FROM @WarningCodes FOR JSON PATH) AS Warnings;
    
    -- If valid, return contract data for prepopulation
    IF @IsValid = 1
    BEGIN
        SELECT 
            c.ContractId,
            c.ReferenceNumber,
            c.ContractTitle,
            c.ContractDescription,
            c.ScopeOfWork,
            
            -- Ministry/Department
            d.DepartmentName AS Department,
            d.Ministry,
            
            -- Contractor
            c.CounterpartyName AS ContractorName,
            c.CounterpartyAddress AS ContractorAddress,
            c.CounterpartyEmail AS ContractorEmail,
            c.CounterpartyPhone AS ContractorPhone,
            c.CompanyRegistrationNumber,
            c.TaxIdentificationNumber,
            
            -- Contract Details
            cn.NatureCode AS ContractNature,
            cc.CategoryCode AS ContractCategory,
            ci.InstrumentCode AS ContractInstrument,
            cur.CurrencyCode AS ContractCurrency,
            c.ContractValue,
            fs.SourceCode AS FundingSource,
            pm.MethodCode AS ProcurementMethod,
            c.ContractStartDate,
            c.ContractEndDate,
            c.ContractDurationMonths AS Duration,
            
            -- Renewal tracking
            c.RenewalCount,
            c.SupplementalCount,
            c.MaxRenewals,
            c.ExpiryDate,
            DATEDIFF(DAY, GETUTCDATE(), c.ExpiryDate) AS DaysUntilExpiry,
            
            -- Entity
            c.OwnerEntityId,
            c.OwnerEntityNumber
            
        FROM dbo.ContractsRegister c
        LEFT JOIN dbo.LookupDepartments d ON c.RequestingDepartmentId = d.DepartmentId
        LEFT JOIN dbo.LookupContractNature cn ON c.ContractNatureId = cn.ContractNatureId
        LEFT JOIN dbo.LookupContractCategories cc ON c.ContractCategoryId = cc.CategoryId
        LEFT JOIN dbo.LookupContractInstruments ci ON c.ContractInstrumentId = ci.InstrumentId
        LEFT JOIN dbo.LookupCurrencies cur ON c.CurrencyId = cur.CurrencyId
        LEFT JOIN dbo.LookupFundingSources fs ON c.FundingSourceId = fs.FundingSourceId
        LEFT JOIN dbo.LookupProcurementMethods pm ON c.ProcurementMethodId = pm.ProcurementMethodId
        WHERE c.ContractId = @ContractId;
    END
END
GO

-- =============================================
-- 5. INDEXES
-- =============================================

CREATE INDEX IX_ContractsRegister_OwnerEntityId ON dbo.ContractsRegister(OwnerEntityId);
CREATE INDEX IX_ContractsRegister_ParentContractId ON dbo.ContractsRegister(ParentContractId);
CREATE INDEX IX_ContractsRegister_IsRenewal ON dbo.ContractsRegister(IsRenewal);
CREATE INDEX IX_ContractsRegister_IsSupplemental ON dbo.ContractsRegister(IsSupplemental);
CREATE INDEX IX_ContractValidationLog_ContractNumber ON dbo.ContractValidationLog(ContractNumber);
CREATE INDEX IX_ContractValidationLog_RequestingUserId ON dbo.ContractValidationLog(RequestingUserId);
CREATE INDEX IX_ContractValidationLog_CreatedAt ON dbo.ContractValidationLog(CreatedAt);

-- =============================================
-- 6. SEED DATA
-- =============================================

-- Renewal limits by nature
INSERT INTO dbo.LookupContractRenewalLimits 
(ContractNatureId, MaxRenewals, MaxSupplementals, MaxRenewalValueIncreasePercent, MaxSupplementalValueIncreasePercent, MaxTotalContractDurationMonths, RequiresCabinetApprovalAfterRenewals, Notes) 
VALUES
(1, 3, 5, 15.00, 25.00, 60, 2, 'Goods contracts - standard limits'),
(2, 2, 3, 10.00, 20.00, 48, 1, 'Consultancy contracts - stricter limits'),
(3, 2, 4, 15.00, 30.00, 72, 1, 'Works contracts - longer total duration allowed');

-- Validation error codes
INSERT INTO dbo.LookupValidationErrorCodes 
(ErrorCode, ErrorMessage, ErrorCategory, Severity, SuggestedAction)
VALUES
('CONTRACT_NOT_FOUND', 'The contract number was not found in the system.', 'NOT_FOUND', 'ERROR', 'Verify the contract number and try again. Contact SGC if you believe this is an error.'),
('ENTITY_NOT_OWNER', 'This contract does not belong to your organization.', 'OWNERSHIP', 'ERROR', 'Only the original contracting entity can submit renewal/supplemental requests.'),
('INVALID_STATUS', 'The contract status does not allow this action.', 'STATUS', 'ERROR', 'Only Active, Executed, or Approved contracts can be renewed or supplemented.'),
('MAX_RENEWALS_EXCEEDED', 'The maximum number of renewals has been reached.', 'LIMIT', 'ERROR', 'A new procurement process must be initiated instead.'),
('PENDING_RENEWAL_EXISTS', 'There is already a pending renewal request for this contract.', 'PENDING', 'ERROR', 'Check your dashboard for the existing renewal request.'),
('EXPIRED_OVER_30_DAYS', 'The contract expired more than 30 days ago.', 'EXPIRY', 'ERROR', 'A new contract must be created instead of a renewal.'),
('ALREADY_EXPIRED', 'The contract has already expired.', 'EXPIRY', 'WARNING', 'Renewal is still possible but requires expedited processing.'),
('EXPIRING_WITHIN_30_DAYS', 'The contract expires within 30 days.', 'EXPIRY', 'WARNING', 'Immediate action recommended to avoid service disruption.'),
('PENDING_SUPPLEMENTAL_EXISTS', 'There is already a pending supplemental request for this contract.', 'PENDING', 'WARNING', 'Please verify this is not a duplicate submission.');

GO

-- =============================================
-- 7. VIEW FOR VALIDATION AUDIT
-- =============================================

CREATE OR ALTER VIEW dbo.vw_ContractValidationAudit
AS
SELECT 
    cvl.LogId,
    cvl.ContractNumber,
    cvl.ValidationPurpose,
    cvl.WasSuccessful,
    cvl.FailureCategory,
    cvl.ErrorCodes,
    cvl.WarningCodes,
    
    -- Requesting user
    CONCAT(u.FirstName, ' ', u.LastName) AS RequestingUserName,
    u.Email AS RequestingUserEmail,
    cvl.RequestingEntityNumber,
    
    -- Found contract
    c.ContractTitle AS FoundContractTitle,
    c.OwnerEntityNumber AS FoundOwnerEntityNumber,
    
    cvl.IPAddress,
    cvl.CreatedAt

FROM dbo.ContractValidationLog cvl
LEFT JOIN dbo.UserProfiles u ON cvl.RequestingUserId = u.UserId
LEFT JOIN dbo.ContractsRegister c ON cvl.FoundContractId = c.ContractId;
GO
