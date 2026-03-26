-- =============================================
-- SGC Digital - COMPLETE Contracts Register Fields
-- MS SQL Server Schema
-- 
-- This script ensures ALL fields from the contracts form
-- are properly represented in the database
-- =============================================

-- =============================================
-- PART 1: ADD ALL MISSING DATE/VALUE FIELDS TO CONTRACTS REGISTER
-- =============================================

-- Check and add missing columns that may not exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'ContractStartDate')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD ContractStartDate DATE NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'ContractEndDate')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD ContractEndDate DATE NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'ContractDuration')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD ContractDuration NVARCHAR(100) NULL; -- e.g., "2 years, 3 months"
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'RenewalTermDescription')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD RenewalTermDescription NVARCHAR(200) NULL;
END

-- =============================================
-- PART 2: CONTRACT COUNTERPARTIES / PARTIES TABLE
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.ContractCounterparties') AND type = 'U')
BEGIN
    CREATE TABLE dbo.ContractCounterparties (
        CounterpartyId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ContractId UNIQUEIDENTIFIER NOT NULL,
        
        -- Party Role
        PartyRole NVARCHAR(50) NOT NULL DEFAULT 'CONTRACTOR', -- 'CONTRACTOR', 'JOINT_VENTURE_PARTNER', 'SUBCONTRACTOR', 'GUARANTOR'
        IsPrimaryParty BIT NOT NULL DEFAULT 1,
        
        -- Party Type
        ContractorTypeId INT NULL,
        
        -- Party Details
        PartyName NVARCHAR(300) NOT NULL,
        TradingName NVARCHAR(300) NULL,
        
        -- Address
        AddressLine1 NVARCHAR(200) NULL,
        AddressLine2 NVARCHAR(200) NULL,
        City NVARCHAR(100) NULL,
        StateProvince NVARCHAR(100) NULL,
        PostalCode NVARCHAR(20) NULL,
        CountryId INT NULL,
        
        -- Contact Information
        ContactPerson NVARCHAR(200) NULL,
        ContactEmail NVARCHAR(255) NULL,
        ContactPhone NVARCHAR(50) NULL,
        ContactFax NVARCHAR(50) NULL,
        
        -- Registration Details
        CompanyRegistrationNumber NVARCHAR(100) NULL,
        TaxIdentificationNumber NVARCHAR(100) NULL,
        VATNumber NVARCHAR(100) NULL,
        
        -- Bank Details (for payments)
        BankName NVARCHAR(200) NULL,
        BankAccountNumber NVARCHAR(100) NULL,
        BankRoutingNumber NVARCHAR(100) NULL,
        BankSwiftCode NVARCHAR(50) NULL,
        
        -- Share/Percentage (for joint ventures)
        SharePercentage DECIMAL(5,2) NULL,
        
        -- Audit
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CreatedBy UNIQUEIDENTIFIER NULL,
        
        CONSTRAINT FK_ContractCounterparties_Contract FOREIGN KEY (ContractId) 
            REFERENCES dbo.ContractsRegister(ContractId) ON DELETE CASCADE,
        CONSTRAINT FK_ContractCounterparties_ContractorType FOREIGN KEY (ContractorTypeId) 
            REFERENCES dbo.LookupContractorTypes(ContractorTypeId),
        CONSTRAINT FK_ContractCounterparties_Country FOREIGN KEY (CountryId) 
            REFERENCES dbo.LookupCountries(CountryId)
    );
    
    CREATE INDEX IX_ContractCounterparties_ContractId ON dbo.ContractCounterparties(ContractId);
    CREATE INDEX IX_ContractCounterparties_PartyName ON dbo.ContractCounterparties(PartyName);
END

-- =============================================
-- PART 3: CONTRACT MILESTONES / PAYMENT SCHEDULE
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.ContractMilestones') AND type = 'U')
BEGIN
    CREATE TABLE dbo.ContractMilestones (
        MilestoneId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ContractId UNIQUEIDENTIFIER NOT NULL,
        
        -- Milestone Details
        MilestoneNumber INT NOT NULL,
        MilestoneName NVARCHAR(200) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        
        -- Schedule
        PlannedStartDate DATE NULL,
        PlannedEndDate DATE NULL,
        ActualStartDate DATE NULL,
        ActualEndDate DATE NULL,
        
        -- Deliverables
        Deliverables NVARCHAR(MAX) NULL,
        AcceptanceCriteria NVARCHAR(MAX) NULL,
        
        -- Payment
        PaymentAmount DECIMAL(18,2) NULL,
        PaymentPercentage DECIMAL(5,2) NULL,
        PaymentDueDate DATE NULL,
        PaymentPaidDate DATE NULL,
        PaymentReference NVARCHAR(100) NULL,
        
        -- Status
        Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, DELAYED, CANCELLED
        CompletionPercentage INT NULL DEFAULT 0,
        
        -- Sign-off
        SignedOffBy UNIQUEIDENTIFIER NULL,
        SignedOffAt DATETIME2 NULL,
        SignOffNotes NVARCHAR(MAX) NULL,
        
        -- Audit
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_ContractMilestones_Contract FOREIGN KEY (ContractId) 
            REFERENCES dbo.ContractsRegister(ContractId) ON DELETE CASCADE,
        CONSTRAINT FK_ContractMilestones_SignedOffBy FOREIGN KEY (SignedOffBy) 
            REFERENCES dbo.UserProfiles(UserId)
    );
    
    CREATE INDEX IX_ContractMilestones_ContractId ON dbo.ContractMilestones(ContractId);
    CREATE INDEX IX_ContractMilestones_Status ON dbo.ContractMilestones(Status);
END

-- =============================================
-- PART 4: CONTRACT VALUE BREAKDOWN
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.ContractValueBreakdown') AND type = 'U')
BEGIN
    CREATE TABLE dbo.ContractValueBreakdown (
        BreakdownId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ContractId UNIQUEIDENTIFIER NOT NULL,
        
        -- Item Details
        ItemNumber INT NOT NULL,
        ItemDescription NVARCHAR(500) NOT NULL,
        ItemCategory NVARCHAR(100) NULL, -- e.g., 'Labour', 'Materials', 'Equipment', 'Overhead'
        
        -- Quantity and Rate
        Quantity DECIMAL(18,4) NULL,
        UnitOfMeasure NVARCHAR(50) NULL,
        UnitRate DECIMAL(18,2) NULL,
        
        -- Value
        Amount DECIMAL(18,2) NOT NULL,
        CurrencyId INT NULL,
        
        -- Tax
        TaxRate DECIMAL(5,2) NULL,
        TaxAmount DECIMAL(18,2) NULL,
        
        -- Notes
        Notes NVARCHAR(MAX) NULL,
        
        -- Audit
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_ContractValueBreakdown_Contract FOREIGN KEY (ContractId) 
            REFERENCES dbo.ContractsRegister(ContractId) ON DELETE CASCADE,
        CONSTRAINT FK_ContractValueBreakdown_Currency FOREIGN KEY (CurrencyId) 
            REFERENCES dbo.LookupCurrencies(CurrencyId)
    );
    
    CREATE INDEX IX_ContractValueBreakdown_ContractId ON dbo.ContractValueBreakdown(ContractId);
END

-- =============================================
-- PART 5: CONTRACT GUARANTEES / BONDS
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.ContractGuarantees') AND type = 'U')
BEGIN
    CREATE TABLE dbo.ContractGuarantees (
        GuaranteeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ContractId UNIQUEIDENTIFIER NOT NULL,
        
        -- Guarantee Type
        GuaranteeType NVARCHAR(50) NOT NULL, -- 'PERFORMANCE_BOND', 'BID_BOND', 'ADVANCE_PAYMENT', 'RETENTION', 'WARRANTY'
        
        -- Guarantee Details
        GuaranteeNumber NVARCHAR(100) NULL,
        IssuingInstitution NVARCHAR(200) NULL,
        
        -- Value
        GuaranteeAmount DECIMAL(18,2) NOT NULL,
        GuaranteePercentage DECIMAL(5,2) NULL,
        CurrencyId INT NULL,
        
        -- Validity
        IssueDate DATE NULL,
        ExpiryDate DATE NULL,
        
        -- Status
        Status NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, CLAIMED, EXPIRED
        ReleasedDate DATE NULL,
        ReleasedBy UNIQUEIDENTIFIER NULL,
        
        -- Document Reference
        DocumentId UNIQUEIDENTIFIER NULL,
        
        -- Notes
        Notes NVARCHAR(MAX) NULL,
        
        -- Audit
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_ContractGuarantees_Contract FOREIGN KEY (ContractId) 
            REFERENCES dbo.ContractsRegister(ContractId) ON DELETE CASCADE,
        CONSTRAINT FK_ContractGuarantees_Currency FOREIGN KEY (CurrencyId) 
            REFERENCES dbo.LookupCurrencies(CurrencyId),
        CONSTRAINT FK_ContractGuarantees_ReleasedBy FOREIGN KEY (ReleasedBy) 
            REFERENCES dbo.UserProfiles(UserId),
        CONSTRAINT FK_ContractGuarantees_Document FOREIGN KEY (DocumentId) 
            REFERENCES dbo.ContractDocuments(DocumentId)
    );
    
    CREATE INDEX IX_ContractGuarantees_ContractId ON dbo.ContractGuarantees(ContractId);
    CREATE INDEX IX_ContractGuarantees_ExpiryDate ON dbo.ContractGuarantees(ExpiryDate);
END

-- =============================================
-- PART 6: CONTRACT SIGNATORIES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.ContractSignatories') AND type = 'U')
BEGIN
    CREATE TABLE dbo.ContractSignatories (
        SignatoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ContractId UNIQUEIDENTIFIER NOT NULL,
        
        -- Signatory Details
        SignatoryType NVARCHAR(50) NOT NULL, -- 'GOVERNMENT', 'CONTRACTOR', 'WITNESS'
        SignatoryName NVARCHAR(200) NOT NULL,
        SignatoryTitle NVARCHAR(200) NULL,
        SignatoryOrganization NVARCHAR(300) NULL,
        
        -- Contact
        SignatoryEmail NVARCHAR(255) NULL,
        SignatoryPhone NVARCHAR(50) NULL,
        
        -- Signature Details
        SignatureRequired BIT NOT NULL DEFAULT 1,
        SignedDate DATE NULL,
        SignedLocation NVARCHAR(200) NULL,
        
        -- Status
        Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SIGNED, DECLINED
        
        -- Audit
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_ContractSignatories_Contract FOREIGN KEY (ContractId) 
            REFERENCES dbo.ContractsRegister(ContractId) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_ContractSignatories_ContractId ON dbo.ContractSignatories(ContractId);
END

-- =============================================
-- PART 7: CONTRACT TERMS AND CONDITIONS
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.ContractTerms') AND type = 'U')
BEGIN
    CREATE TABLE dbo.ContractTerms (
        TermId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ContractId UNIQUEIDENTIFIER NOT NULL,
        
        -- Term Details
        TermType NVARCHAR(100) NOT NULL, -- 'PAYMENT', 'DELIVERY', 'WARRANTY', 'PENALTY', 'TERMINATION', 'VARIATION', 'DISPUTE', 'INSURANCE', 'CONFIDENTIALITY', 'INTELLECTUAL_PROPERTY'
        TermTitle NVARCHAR(300) NOT NULL,
        TermDescription NVARCHAR(MAX) NOT NULL,
        
        -- Reference
        ClauseNumber NVARCHAR(50) NULL,
        
        -- Status
        IsStandard BIT NOT NULL DEFAULT 1, -- Standard term or negotiated
        IsModified BIT NOT NULL DEFAULT 0,
        ModificationNotes NVARCHAR(MAX) NULL,
        
        -- Audit
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_ContractTerms_Contract FOREIGN KEY (ContractId) 
            REFERENCES dbo.ContractsRegister(ContractId) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_ContractTerms_ContractId ON dbo.ContractTerms(ContractId);
END

-- =============================================
-- PART 8: ADD MORE MISSING COLUMNS TO CONTRACTS REGISTER
-- =============================================

-- Contract Amount breakdown fields
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'ContractValueExclTax')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        ContractValueExclTax DECIMAL(18,2) NULL,
        TaxAmount DECIMAL(18,2) NULL,
        ContractValueInclTax DECIMAL(18,2) NULL;
END

-- Contingency
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'ContingencyAmount')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        ContingencyAmount DECIMAL(18,2) NULL,
        ContingencyPercentage DECIMAL(5,2) NULL;
END

-- Retention
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'RetentionPercentage')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        RetentionPercentage DECIMAL(5,2) NULL,
        RetentionAmount DECIMAL(18,2) NULL,
        RetentionReleaseConditions NVARCHAR(MAX) NULL;
END

-- Advance Payment
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'AdvancePaymentPercentage')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        AdvancePaymentPercentage DECIMAL(5,2) NULL,
        AdvancePaymentAmount DECIMAL(18,2) NULL,
        AdvancePaymentConditions NVARCHAR(MAX) NULL;
END

-- Warranty Period
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'WarrantyPeriodMonths')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        WarrantyPeriodMonths INT NULL,
        WarrantyTerms NVARCHAR(MAX) NULL;
END

-- Defects Liability Period
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'DefectsLiabilityPeriodMonths')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD DefectsLiabilityPeriodMonths INT NULL;
END

-- Liquidated Damages
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'LiquidatedDamagesRate')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        LiquidatedDamagesRate DECIMAL(18,2) NULL,
        LiquidatedDamagesMax DECIMAL(18,2) NULL,
        LiquidatedDamagesTerms NVARCHAR(MAX) NULL;
END

-- Insurance Requirements
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'InsuranceRequired')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        InsuranceRequired BIT NOT NULL DEFAULT 0,
        InsuranceTypes NVARCHAR(500) NULL,
        MinimumInsuranceCoverage DECIMAL(18,2) NULL;
END

-- Price Variation
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'PriceVariationAllowed')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        PriceVariationAllowed BIT NOT NULL DEFAULT 0,
        PriceVariationFormula NVARCHAR(MAX) NULL,
        PriceVariationCap DECIMAL(5,2) NULL;
END

-- Contract Execution Details
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ContractsRegister') AND name = 'ExecutionLocation')
BEGIN
    ALTER TABLE dbo.ContractsRegister ADD 
        ExecutionLocation NVARCHAR(200) NULL,
        GoverningLaw NVARCHAR(100) NULL DEFAULT 'Laws of Barbados',
        DisputeResolutionMethod NVARCHAR(100) NULL;
END

-- =============================================
-- PART 9: CREATE COMPREHENSIVE VIEW
-- =============================================

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ContractsRegisterFull')
    DROP VIEW dbo.vw_ContractsRegisterFull;
GO

CREATE VIEW dbo.vw_ContractsRegisterFull AS
SELECT 
    c.ContractId,
    c.ReferenceNumber,
    
    -- Requesting Entity
    c.RequestingUserId,
    c.RequestingDepartmentId,
    d.DepartmentName AS RequestingDepartmentName,
    d.Ministry AS RequestingMinistry,
    c.RequestingOfficerName,
    c.RequestingOfficerEmail,
    c.RequestingOfficerPhone,
    c.MinistryFileReference,
    
    -- Contract Classification
    c.ContractTypeId,
    ct.TypeName AS ContractTypeName,
    c.ContractNatureId,
    cn.NatureName AS ContractNatureName,
    c.ContractCategoryId,
    cc.CategoryName AS ContractCategoryName,
    c.ContractInstrumentId,
    ci.InstrumentName AS ContractInstrumentName,
    c.ContractInstrumentOther,
    c.CategoryOtherJustification,
    
    -- Renewal/Supplemental
    c.IsRenewal,
    c.IsSupplemental,
    c.ParentContractId,
    c.ParentContractNumber,
    
    -- Contract Details
    c.ContractTitle,
    c.ContractDescription,
    c.ScopeOfWork,
    c.KeyDeliverables,
    
    -- Counterparty (Primary)
    c.CounterpartyName,
    c.CounterpartyAddress,
    c.CounterpartyContact,
    c.CounterpartyEmail,
    c.CounterpartyPhone,
    c.ContractorTypeId,
    ctr.TypeName AS ContractorTypeName,
    c.ContractorCity,
    c.ContractorCountryId,
    cntry.CountryName AS ContractorCountryName,
    c.CompanyRegistrationNumber,
    c.TaxIdentificationNumber,
    
    -- Financial
    c.ContractValue,
    c.ContractValueExclTax,
    c.TaxAmount,
    c.ContractValueInclTax,
    c.CurrencyId,
    cur.CurrencyCode,
    cur.Symbol AS CurrencySymbol,
    c.PaymentTerms,
    c.FundingSourceId,
    fs.SourceName AS FundingSourceName,
    c.ContingencyAmount,
    c.ContingencyPercentage,
    c.RetentionPercentage,
    c.RetentionAmount,
    c.AdvancePaymentPercentage,
    c.AdvancePaymentAmount,
    
    -- Procurement
    c.ProcurementMethodId,
    pm.MethodName AS ProcurementMethodName,
    c.IsSingleSource,
    c.SingleSourceJustification,
    c.AwardDate,
    
    -- Dates
    c.ContractStartDate,
    c.ContractEndDate,
    c.ContractDuration,
    c.ProposedStartDate,
    c.ProposedEndDate,
    c.ContractDurationMonths,
    c.RenewalTermMonths,
    c.RenewalTermDescription,
    c.ExecutedDate,
    c.ExpiryDate,
    c.WarrantyPeriodMonths,
    c.DefectsLiabilityPeriodMonths,
    
    -- Status
    c.PriorityId,
    pl.PriorityName,
    c.CaseStatusId,
    cs.StatusName AS CaseStatusName,
    cs.StatusCategory,
    
    -- Assignment
    c.AssignedToUserId,
    au.FirstName + ' ' + au.LastName AS AssignedToName,
    c.AssignedAt,
    
    -- Contract Registration
    c.FinalContractNumber,
    c.GoverningLaw,
    c.ExecutionLocation,
    c.DisputeResolutionMethod,
    
    -- Insurance
    c.InsuranceRequired,
    c.InsuranceTypes,
    c.MinimumInsuranceCoverage,
    
    -- Liquidated Damages
    c.LiquidatedDamagesRate,
    c.LiquidatedDamagesMax,
    
    -- Price Variation
    c.PriceVariationAllowed,
    c.PriceVariationCap,
    
    -- Review/Approval
    c.LegalReviewNotes,
    c.RecommendedChanges,
    c.ApprovalNotes,
    c.MissingDocumentReason,
    
    -- Dates
    c.SubmittedAt,
    c.DueDate,
    c.CompletedAt,
    c.CreatedAt,
    c.UpdatedAt,
    
    -- Calculated Fields
    DATEDIFF(DAY, c.SubmittedAt, GETUTCDATE()) AS DaysOpen,
    CASE WHEN c.DueDate < GETUTCDATE() AND c.CompletedAt IS NULL THEN 1 ELSE 0 END AS IsOverdue,
    
    -- Counts (subqueries)
    (SELECT COUNT(*) FROM dbo.ContractDocuments WHERE ContractId = c.ContractId) AS DocumentCount,
    (SELECT COUNT(*) FROM dbo.ContractCounterparties WHERE ContractId = c.ContractId) AS CounterpartyCount,
    (SELECT COUNT(*) FROM dbo.ContractMilestones WHERE ContractId = c.ContractId) AS MilestoneCount,
    (SELECT COUNT(*) FROM dbo.ContractGuarantees WHERE ContractId = c.ContractId) AS GuaranteeCount

FROM dbo.ContractsRegister c
LEFT JOIN dbo.LookupDepartments d ON c.RequestingDepartmentId = d.DepartmentId
LEFT JOIN dbo.LookupContractTypes ct ON c.ContractTypeId = ct.ContractTypeId
LEFT JOIN dbo.LookupContractNature cn ON c.ContractNatureId = cn.ContractNatureId
LEFT JOIN dbo.LookupContractCategories cc ON c.ContractCategoryId = cc.CategoryId
LEFT JOIN dbo.LookupContractInstruments ci ON c.ContractInstrumentId = ci.InstrumentId
LEFT JOIN dbo.LookupContractorTypes ctr ON c.ContractorTypeId = ctr.ContractorTypeId
LEFT JOIN dbo.LookupCountries cntry ON c.ContractorCountryId = cntry.CountryId
LEFT JOIN dbo.LookupCurrencies cur ON c.CurrencyId = cur.CurrencyId
LEFT JOIN dbo.LookupFundingSources fs ON c.FundingSourceId = fs.FundingSourceId
LEFT JOIN dbo.LookupProcurementMethods pm ON c.ProcurementMethodId = pm.ProcurementMethodId
LEFT JOIN dbo.LookupPriorityLevels pl ON c.PriorityId = pl.PriorityId
LEFT JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId
LEFT JOIN dbo.UserProfiles au ON c.AssignedToUserId = au.UserId;
GO

-- =============================================
-- PART 10: CREATE INDEXES FOR NEW COLUMNS
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ContractsRegister_ContractStartDate')
    CREATE INDEX IX_ContractsRegister_ContractStartDate ON dbo.ContractsRegister(ContractStartDate);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ContractsRegister_ContractEndDate')
    CREATE INDEX IX_ContractsRegister_ContractEndDate ON dbo.ContractsRegister(ContractEndDate);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ContractsRegister_ContractValue')
    CREATE INDEX IX_ContractsRegister_ContractValue ON dbo.ContractsRegister(ContractValue);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ContractsRegister_ExpiryDate')
    CREATE INDEX IX_ContractsRegister_ExpiryDate ON dbo.ContractsRegister(ExpiryDate);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ContractsRegister_CounterpartyName')
    CREATE INDEX IX_ContractsRegister_CounterpartyName ON dbo.ContractsRegister(CounterpartyName);

PRINT 'Contract fields update complete. All form fields are now represented in the database.';
GO
