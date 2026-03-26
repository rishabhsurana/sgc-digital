-- =============================================
-- SGC Digital - Missing Fields & Tables (Comprehensive Update)
-- MS SQL Server Schema
-- 
-- This script adds all missing fields identified from the application forms
-- =============================================

-- =============================================
-- PART 1: CONTRACT-RELATED MISSING TABLES
-- =============================================

-- Lookup: Contract Categories (by Nature)
CREATE TABLE dbo.LookupContractCategories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryCode NVARCHAR(50) NOT NULL UNIQUE,
    CategoryName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    -- Which natures this category applies to (comma-separated or separate junction table)
    ApplicableNatures NVARCHAR(200) NULL, -- e.g., 'goods,consultancy,works'
    RequiresJustification BIT NOT NULL DEFAULT 0, -- For 'Other' category
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Contract Instruments (by Nature)
CREATE TABLE dbo.LookupContractInstruments (
    InstrumentId INT IDENTITY(1,1) PRIMARY KEY,
    InstrumentCode NVARCHAR(50) NOT NULL UNIQUE,
    InstrumentName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    ApplicableNatures NVARCHAR(200) NULL, -- e.g., 'goods,consultancy,works'
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Contractor Types
CREATE TABLE dbo.LookupContractorTypes (
    ContractorTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeCode NVARCHAR(50) NOT NULL UNIQUE,
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Funding Sources
CREATE TABLE dbo.LookupFundingSources (
    FundingSourceId INT IDENTITY(1,1) PRIMARY KEY,
    SourceCode NVARCHAR(50) NOT NULL UNIQUE,
    SourceName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Procurement Methods
CREATE TABLE dbo.LookupProcurementMethods (
    ProcurementMethodId INT IDENTITY(1,1) PRIMARY KEY,
    MethodCode NVARCHAR(50) NOT NULL UNIQUE,
    MethodName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    RequiresSingleSourceApproval BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Countries
CREATE TABLE dbo.LookupCountries (
    CountryId INT IDENTITY(1,1) PRIMARY KEY,
    CountryCode NVARCHAR(10) NOT NULL UNIQUE, -- ISO code
    CountryName NVARCHAR(100) NOT NULL,
    IsCaribbean BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Document Types (for contracts)
CREATE TABLE dbo.LookupContractDocumentTypes (
    DocumentTypeId INT IDENTITY(1,1) PRIMARY KEY,
    DocumentTypeCode NVARCHAR(50) NOT NULL UNIQUE,
    DocumentTypeName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    ApplicableNatures NVARCHAR(200) NULL, -- Which contract natures require this
    IsRequired BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- PART 2: CORRESPONDENCE-RELATED MISSING TABLES
-- =============================================

-- Lookup: Submitter Types
CREATE TABLE dbo.LookupSubmitterTypes (
    SubmitterTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeCode NVARCHAR(50) NOT NULL UNIQUE,
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    RequiresOrganization BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Urgency Levels
CREATE TABLE dbo.LookupUrgencyLevels (
    UrgencyId INT IDENTITY(1,1) PRIMARY KEY,
    UrgencyCode NVARCHAR(50) NOT NULL UNIQUE,
    UrgencyName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    RequiresJustification BIT NOT NULL DEFAULT 0,
    SLAMultiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00, -- e.g., 0.5 for urgent
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Confidentiality Levels
CREATE TABLE dbo.LookupConfidentialityLevels (
    ConfidentialityId INT IDENTITY(1,1) PRIMARY KEY,
    ConfidentialityCode NVARCHAR(50) NOT NULL UNIQUE,
    ConfidentialityName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    AccessRestrictions NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Correspondence Document Types
CREATE TABLE dbo.LookupCorrespondenceDocumentTypes (
    DocumentTypeId INT IDENTITY(1,1) PRIMARY KEY,
    DocumentTypeCode NVARCHAR(50) NOT NULL UNIQUE,
    DocumentTypeName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- PART 3: ALTER CONTRACTS REGISTER - ADD MISSING COLUMNS
-- =============================================

ALTER TABLE dbo.ContractsRegister ADD
    -- Contract Classification (Nature/Category/Instrument)
    ContractCategoryId INT NULL,
    ContractInstrumentId INT NULL,
    ContractInstrumentOther NVARCHAR(200) NULL, -- If instrument is 'Other'
    CategoryOtherJustification NVARCHAR(MAX) NULL, -- If category is 'Other'
    
    -- Contract Type (New/Renewal/Supplemental)
    IsRenewal BIT NOT NULL DEFAULT 0,
    IsSupplemental BIT NOT NULL DEFAULT 0,
    ParentContractId UNIQUEIDENTIFIER NULL, -- For renewals/supplementals
    ParentContractNumber NVARCHAR(100) NULL,
    
    -- Ministry Reference
    MinistryFileReference NVARCHAR(100) NULL,
    
    -- Contractor Details (expanded)
    ContractorTypeId INT NULL,
    ContractorCity NVARCHAR(100) NULL,
    ContractorCountryId INT NULL,
    CompanyRegistrationNumber NVARCHAR(100) NULL,
    TaxIdentificationNumber NVARCHAR(100) NULL,
    
    -- Contract Scope (expanded)
    ScopeOfWork NVARCHAR(MAX) NULL,
    KeyDeliverables NVARCHAR(MAX) NULL,
    
    -- Financial (expanded)
    FundingSourceId INT NULL,
    ProcurementMethodId INT NULL,
    IsSingleSource BIT NOT NULL DEFAULT 0,
    SingleSourceJustification NVARCHAR(MAX) NULL,
    AwardDate DATE NULL,
    
    -- Duration
    RenewalTermMonths INT NULL,
    
    -- Document Exception
    MissingDocumentReason NVARCHAR(MAX) NULL;

-- Add foreign keys for new columns
ALTER TABLE dbo.ContractsRegister ADD
    CONSTRAINT FK_ContractsRegister_Category FOREIGN KEY (ContractCategoryId) 
        REFERENCES dbo.LookupContractCategories(CategoryId),
    CONSTRAINT FK_ContractsRegister_Instrument FOREIGN KEY (ContractInstrumentId) 
        REFERENCES dbo.LookupContractInstruments(InstrumentId),
    CONSTRAINT FK_ContractsRegister_ContractorType FOREIGN KEY (ContractorTypeId) 
        REFERENCES dbo.LookupContractorTypes(ContractorTypeId),
    CONSTRAINT FK_ContractsRegister_ContractorCountry FOREIGN KEY (ContractorCountryId) 
        REFERENCES dbo.LookupCountries(CountryId),
    CONSTRAINT FK_ContractsRegister_FundingSource FOREIGN KEY (FundingSourceId) 
        REFERENCES dbo.LookupFundingSources(FundingSourceId),
    CONSTRAINT FK_ContractsRegister_ProcurementMethod FOREIGN KEY (ProcurementMethodId) 
        REFERENCES dbo.LookupProcurementMethods(ProcurementMethodId),
    CONSTRAINT FK_ContractsRegister_ParentContract FOREIGN KEY (ParentContractId) 
        REFERENCES dbo.ContractsRegister(ContractId);

-- =============================================
-- PART 4: ALTER CORRESPONDENCE REGISTER - ADD MISSING COLUMNS
-- =============================================

ALTER TABLE dbo.CorrespondenceRegister ADD
    -- Submitter Type
    SubmitterTypeId INT NULL,
    
    -- Urgency and Confidentiality
    UrgencyId INT NULL,
    UrgentReason NVARCHAR(MAX) NULL,
    ConfidentialityId INT NULL,
    
    -- File References
    RegistryFileNumber NVARCHAR(100) NULL,
    CourtFileNumber NVARCHAR(100) NULL,
    MinistryFileReference NVARCHAR(100) NULL,
    
    -- Contact Unit/Section
    ContactUnit NVARCHAR(200) NULL,
    
    -- MDA Reference (for ministry/statutory submitters)
    RequestingDepartmentId INT NULL;

-- Add foreign keys for new columns
ALTER TABLE dbo.CorrespondenceRegister ADD
    CONSTRAINT FK_CorrespondenceRegister_SubmitterType FOREIGN KEY (SubmitterTypeId) 
        REFERENCES dbo.LookupSubmitterTypes(SubmitterTypeId),
    CONSTRAINT FK_CorrespondenceRegister_Urgency FOREIGN KEY (UrgencyId) 
        REFERENCES dbo.LookupUrgencyLevels(UrgencyId),
    CONSTRAINT FK_CorrespondenceRegister_Confidentiality FOREIGN KEY (ConfidentialityId) 
        REFERENCES dbo.LookupConfidentialityLevels(ConfidentialityId),
    CONSTRAINT FK_CorrespondenceRegister_Department FOREIGN KEY (RequestingDepartmentId) 
        REFERENCES dbo.LookupDepartments(DepartmentId);

-- =============================================
-- PART 5: ALTER CONTRACT DOCUMENTS - ADD DOCUMENT TYPE FK
-- =============================================

ALTER TABLE dbo.ContractDocuments ADD
    DocumentTypeId INT NULL;

ALTER TABLE dbo.ContractDocuments ADD
    CONSTRAINT FK_ContractDocuments_DocumentType FOREIGN KEY (DocumentTypeId) 
        REFERENCES dbo.LookupContractDocumentTypes(DocumentTypeId);

-- =============================================
-- PART 6: ALTER CORRESPONDENCE DOCUMENTS - ADD DOCUMENT TYPE FK
-- =============================================

ALTER TABLE dbo.CorrespondenceDocuments ADD
    DocumentTypeId INT NULL;

ALTER TABLE dbo.CorrespondenceDocuments ADD
    CONSTRAINT FK_CorrespondenceDocuments_DocumentType FOREIGN KEY (DocumentTypeId) 
        REFERENCES dbo.LookupCorrespondenceDocumentTypes(DocumentTypeId);

-- =============================================
-- PART 7: SEED DATA - CONTRACT CATEGORIES
-- =============================================

INSERT INTO dbo.LookupContractCategories (CategoryCode, CategoryName, ApplicableNatures, RequiresJustification, DisplayOrder) VALUES
('CAT_PROC', 'Procurement of Goods & Services', 'goods,consultancy,works', 0, 1),
('CAT_LEASE', 'Lease / Property (Equipment Lease)', 'goods', 0, 2),
('CAT_MOU', 'Inter-Agency / MOU', 'goods,consultancy,works', 0, 3),
('CAT_CONS', 'Consultancy / Professional Services', 'consultancy', 0, 4),
('CAT_EMP', 'Employment / Personnel', 'consultancy', 0, 5),
('CAT_CONST', 'Construction / Public Works', 'works', 0, 6),
('CAT_OTHER', 'Other (Requires justification)', 'goods,consultancy,works', 1, 99);

-- =============================================
-- PART 8: SEED DATA - CONTRACT INSTRUMENTS
-- =============================================

INSERT INTO dbo.LookupContractInstruments (InstrumentCode, InstrumentName, ApplicableNatures, DisplayOrder) VALUES
-- Goods instruments
('GDS', 'Goods', 'goods', 1),
('UNI', 'Uniforms', 'goods', 2),
-- Consultancy instruments
('CLEAN', 'Cleaning Services', 'consultancy', 10),
('CONS_CO', 'Consultancy - Company', 'consultancy', 11),
('CONS_IND', 'Consultant/Independent Contractor', 'consultancy', 12),
('CONS_INDV', 'Individual Consultant', 'consultancy', 13),
('CONS_IDB', 'Individual Consultant (IDB-funded)', 'consultancy', 14),
('SVC', 'Services', 'consultancy', 15),
-- Works instruments
('WORKS', 'Works', 'works', 20),
-- Other (all natures)
('OTHER', 'Other', 'goods,consultancy,works', 99);

-- =============================================
-- PART 9: SEED DATA - CONTRACTOR TYPES
-- =============================================

INSERT INTO dbo.LookupContractorTypes (TypeCode, TypeName, Description, DisplayOrder) VALUES
('COMPANY', 'Company / Corporation', 'Registered company or corporation', 1),
('INDIVIDUAL', 'Individual / Sole Trader', 'Individual person or sole proprietor', 2),
('JOINT_VENTURE', 'Joint Venture / Consortium', 'Joint venture or consortium of parties', 3),
('GOVERNMENT', 'Government Entity', 'Government ministry, department, or agency', 4),
('NGO', 'NGO / Non-Profit', 'Non-governmental or non-profit organization', 5);

-- =============================================
-- PART 10: SEED DATA - FUNDING SOURCES
-- =============================================

INSERT INTO dbo.LookupFundingSources (SourceCode, SourceName, Description, DisplayOrder) VALUES
('BUDGET_REC', 'Government Budget (Recurrent)', 'Funded from recurrent government budget', 1),
('BUDGET_CAP', 'Government Budget (Capital)', 'Funded from capital budget', 2),
('GRANT', 'Grant / Donor Funded', 'Funded by grant or donor organization', 3),
('LOAN', 'Loan Funded (IDB, CDB, etc.)', 'Funded by international development loans', 4),
('MIXED', 'Mixed / Multiple Sources', 'Multiple funding sources', 5),
('OTHER', 'Other', 'Other funding source', 99);

-- =============================================
-- PART 11: SEED DATA - PROCUREMENT METHODS
-- =============================================

INSERT INTO dbo.LookupProcurementMethods (MethodCode, MethodName, Description, RequiresSingleSourceApproval, DisplayOrder) VALUES
('OPEN_TENDER', 'Open Competitive Tender', 'Open public tender process', 0, 1),
('SELECTIVE_TENDER', 'Selective / Limited Tender', 'Limited invited tender', 0, 2),
('SINGLE_SOURCE', 'Single Source Procurement', 'Direct award to single supplier', 1, 3),
('FRAMEWORK', 'Framework Agreement', 'Existing framework agreement', 0, 4),
('DIRECT', 'Direct Procurement (Below Threshold)', 'Direct procurement under threshold', 0, 5),
('EMERGENCY', 'Emergency Procurement', 'Emergency procurement procedure', 0, 6);

-- =============================================
-- PART 12: SEED DATA - COUNTRIES
-- =============================================

INSERT INTO dbo.LookupCountries (CountryCode, CountryName, IsCaribbean, DisplayOrder) VALUES
('BB', 'Barbados', 1, 1),
('TT', 'Trinidad and Tobago', 1, 2),
('JM', 'Jamaica', 1, 3),
('GY', 'Guyana', 1, 4),
('LC', 'Saint Lucia', 1, 5),
('VC', 'Saint Vincent and the Grenadines', 1, 6),
('GD', 'Grenada', 1, 7),
('AG', 'Antigua and Barbuda', 1, 8),
('KN', 'Saint Kitts and Nevis', 1, 9),
('DM', 'Dominica', 1, 10),
('US', 'United States', 0, 20),
('GB', 'United Kingdom', 0, 21),
('CA', 'Canada', 0, 22),
('OT', 'Other', 0, 99);

-- =============================================
-- PART 13: SEED DATA - CONTRACT DOCUMENT TYPES
-- =============================================

INSERT INTO dbo.LookupContractDocumentTypes (DocumentTypeCode, DocumentTypeName, ApplicableNatures, IsRequired, DisplayOrder) VALUES
-- Forms
('FORM_ACCEPT', 'Acceptance of Award', 'goods,consultancy,works', 1, 1),
('FORM_LOA', 'Letter of Award', 'goods,consultancy,works', 1, 2),
('FORM_PAY_SCHED', 'Payment Schedule', 'goods,consultancy,works', 1, 3),
('FORM_SCHED_DELIV', 'Schedule of Deliverables', 'consultancy', 1, 4),
('FORM_DRAFT', 'Draft Contract', 'goods,consultancy,works', 0, 5),
('FORM_LOE', 'Letter of Engagement', 'consultancy', 0, 6),
-- Procurement
('PROC_SPECS', 'Specifications', 'goods', 1, 10),
('PROC_TENDER', 'Tender Documents', 'goods,consultancy,works', 1, 11),
('PROC_PROP', 'Proposal', 'consultancy', 1, 12),
('PROC_TOR', 'Terms of Reference', 'consultancy', 1, 13),
('PROC_BOQ', 'Bill of Quantities', 'works', 1, 14),
('PROC_DRAWINGS', 'Drawings/Plans', 'works', 1, 15),
('PROC_SSP_REQ', 'Single Source Request', 'goods,consultancy,works', 0, 16),
('PROC_SSP_APPR', 'Single Source Approval', 'goods,consultancy,works', 0, 17),
('PROC_CAB_PAPER', 'Cabinet Paper', 'consultancy,works', 0, 18),
('PROC_CAB_APPR', 'Cabinet Approval', 'consultancy,works', 0, 19),
-- Due Diligence
('DUE_BUS_REG', 'Business Registration', 'consultancy', 0, 30),
('DUE_GS', 'Certificate of Good Standing', 'consultancy', 0, 31),
('DUE_INCORP', 'Company Incorporation Documents', 'consultancy', 0, 32),
-- Financial
('FIN_BOND', 'Performance Bond', 'consultancy,works', 0, 40),
('FIN_SURETY', 'Proof of Surety', 'consultancy,works', 0, 41),
-- Other
('OTHER', 'Other Document', 'goods,consultancy,works', 0, 99);

-- =============================================
-- PART 14: SEED DATA - SUBMITTER TYPES
-- =============================================

INSERT INTO dbo.LookupSubmitterTypes (TypeCode, TypeName, RequiresOrganization, DisplayOrder) VALUES
('MINISTRY', 'Ministry / Government Agency (MDA)', 1, 1),
('COURT', 'Court', 1, 2),
('STATUTORY', 'Statutory Body', 1, 3),
('PUBLIC', 'Member of the Public', 0, 4),
('ATTORNEY', 'Attorney-at-Law', 0, 5),
('OTHER', 'Other', 0, 99);

-- =============================================
-- PART 15: SEED DATA - URGENCY LEVELS
-- =============================================

INSERT INTO dbo.LookupUrgencyLevels (UrgencyCode, UrgencyName, RequiresJustification, SLAMultiplier, DisplayOrder) VALUES
('STANDARD', 'Standard', 0, 1.00, 1),
('URGENT', 'Urgent', 1, 0.50, 2);

-- =============================================
-- PART 16: SEED DATA - CONFIDENTIALITY LEVELS
-- =============================================

INSERT INTO dbo.LookupConfidentialityLevels (ConfidentialityCode, ConfidentialityName, Description, AccessRestrictions, DisplayOrder) VALUES
('STANDARD', 'Standard', 'Standard access level', NULL, 1),
('CONFIDENTIAL', 'Confidential', 'Confidential - restricted access', 'Restricted to assigned staff only', 2),
('CABINET', 'Cabinet-Level-Restricted', 'Cabinet-level documents', 'Restricted to senior staff and administrators', 3);

-- =============================================
-- PART 17: SEED DATA - CORRESPONDENCE DOCUMENT TYPES
-- =============================================

INSERT INTO dbo.LookupCorrespondenceDocumentTypes (DocumentTypeCode, DocumentTypeName, DisplayOrder) VALUES
('CORRESPONDENCE', 'Correspondence Letter', 1),
('SUPPORTING', 'Supporting Document', 2),
('COURT_DOC', 'Court Document', 3),
('LEGAL_OPINION', 'Legal Opinion Request', 4),
('CABINET_PAPER', 'Cabinet Paper', 5),
('REFERENCE', 'Reference Material', 6),
('OTHER', 'Other', 99);

-- =============================================
-- PART 18: UPDATE CONTRACT NATURE WITH FORM VALUES
-- =============================================

-- Clear existing and add correct natures from form
DELETE FROM dbo.LookupContractNature;

INSERT INTO dbo.LookupContractNature (NatureCode, NatureName, Description) VALUES
('GOODS', 'Goods', 'Procurement of goods, supplies, and equipment'),
('CONSULTANCY', 'Consultancy / Services', 'Professional services, consulting, and service contracts'),
('WORKS', 'Works', 'Construction, infrastructure, and public works projects');

-- =============================================
-- PART 19: UPDATE CORRESPONDENCE TYPES WITH FORM VALUES
-- =============================================

-- Clear existing and add correct types from form
DELETE FROM dbo.LookupCorrespondenceTypes;

INSERT INTO dbo.LookupCorrespondenceTypes (TypeCode, TypeName, Description, EstimatedDays) VALUES
('GENERAL', 'General', 'General enquiries and correspondence to the SGC', 10),
('LITIGATION', 'Litigation', 'Court-related matters and litigation correspondence', 30),
('COMPENSATION', 'Compensation', 'Compensation claims and related matters', 21),
('PUBLIC_TRUSTEE', 'Public Trustee', 'Matters relating to the Public Trustee', 14),
('ADVISORY', 'Advisory', 'Requests for legal opinions and advice', 14),
('INTERNATIONAL_LAW', 'International Law', 'International law and treaty matters', 30),
('CABINET', 'Cabinet / Confidential', 'Cabinet-level documents requiring restricted access', 7);

-- =============================================
-- PART 20: CREATE INDEXES FOR NEW COLUMNS
-- =============================================

CREATE INDEX IX_ContractsRegister_CategoryId ON dbo.ContractsRegister(ContractCategoryId);
CREATE INDEX IX_ContractsRegister_InstrumentId ON dbo.ContractsRegister(ContractInstrumentId);
CREATE INDEX IX_ContractsRegister_FundingSourceId ON dbo.ContractsRegister(FundingSourceId);
CREATE INDEX IX_ContractsRegister_ProcurementMethodId ON dbo.ContractsRegister(ProcurementMethodId);
CREATE INDEX IX_ContractsRegister_ParentContractId ON dbo.ContractsRegister(ParentContractId);
CREATE INDEX IX_CorrespondenceRegister_SubmitterTypeId ON dbo.CorrespondenceRegister(SubmitterTypeId);
CREATE INDEX IX_CorrespondenceRegister_UrgencyId ON dbo.CorrespondenceRegister(UrgencyId);
CREATE INDEX IX_CorrespondenceRegister_ConfidentialityId ON dbo.CorrespondenceRegister(ConfidentialityId);

PRINT 'Schema update completed - All missing fields and lookup tables added successfully.';
