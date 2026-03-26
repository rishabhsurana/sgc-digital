-- =============================================
-- SGC Digital - Contract Management Tables
-- MS SQL Server Schema
-- =============================================

-- Lookup: Contract Types
CREATE TABLE dbo.LookupContractTypes (
    ContractTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeCode NVARCHAR(50) NOT NULL UNIQUE,
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    RequiredDocuments NVARCHAR(MAX) NULL, -- JSON array of required document types
    EstimatedDays INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Contract Nature/Category
CREATE TABLE dbo.LookupContractNature (
    ContractNatureId INT IDENTITY(1,1) PRIMARY KEY,
    NatureCode NVARCHAR(50) NOT NULL UNIQUE,
    NatureName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Currency
CREATE TABLE dbo.LookupCurrencies (
    CurrencyId INT IDENTITY(1,1) PRIMARY KEY,
    CurrencyCode NVARCHAR(10) NOT NULL UNIQUE, -- e.g., BBD, USD, EUR
    CurrencyName NVARCHAR(100) NOT NULL,
    Symbol NVARCHAR(10) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Contracts Register
-- =============================================

CREATE TABLE dbo.ContractsRegister (
    ContractId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReferenceNumber NVARCHAR(50) NOT NULL UNIQUE, -- e.g., CON-2024-0001
    
    -- Requesting Entity
    RequestingUserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    RequestingDepartmentId INT NOT NULL REFERENCES dbo.LookupDepartments(DepartmentId),
    RequestingOfficerName NVARCHAR(200) NOT NULL,
    RequestingOfficerEmail NVARCHAR(255) NOT NULL,
    RequestingOfficerPhone NVARCHAR(50) NULL,
    
    -- Contract Details
    ContractTypeId INT NOT NULL REFERENCES dbo.LookupContractTypes(ContractTypeId),
    ContractNatureId INT NOT NULL REFERENCES dbo.LookupContractNature(ContractNatureId),
    ContractTitle NVARCHAR(500) NOT NULL,
    ContractDescription NVARCHAR(MAX) NOT NULL,
    
    -- Counterparty (Contractor/Vendor)
    CounterpartyName NVARCHAR(200) NOT NULL,
    CounterpartyAddress NVARCHAR(500) NULL,
    CounterpartyContact NVARCHAR(200) NULL,
    CounterpartyEmail NVARCHAR(255) NULL,
    CounterpartyPhone NVARCHAR(50) NULL,
    
    -- Financial Details
    ContractValue DECIMAL(18,2) NOT NULL,
    CurrencyId INT NOT NULL REFERENCES dbo.LookupCurrencies(CurrencyId),
    PaymentTerms NVARCHAR(MAX) NULL,
    
    -- Contract Period
    ProposedStartDate DATE NULL,
    ProposedEndDate DATE NULL,
    ContractDurationMonths INT NULL,
    
    -- Priority and Status
    PriorityId INT NOT NULL REFERENCES dbo.LookupPriorityLevels(PriorityId),
    CaseStatusId INT NOT NULL REFERENCES dbo.LookupCaseStatus(CaseStatusId),
    
    -- Assignment
    AssignedToUserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    AssignedAt DATETIME2 NULL,
    
    -- Review/Approval
    LegalReviewNotes NVARCHAR(MAX) NULL,
    RecommendedChanges NVARCHAR(MAX) NULL,
    ApprovalNotes NVARCHAR(MAX) NULL,
    
    -- Dates
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DueDate DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    
    -- Final Contract (after approval)
    FinalContractNumber NVARCHAR(100) NULL,
    ExecutedDate DATE NULL,
    ExpiryDate DATE NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    UpdatedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId)
);

-- Contract Status History
CREATE TABLE dbo.ContractStatusHistory (
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    
    FromStatusId INT NULL REFERENCES dbo.LookupCaseStatus(CaseStatusId),
    ToStatusId INT NOT NULL REFERENCES dbo.LookupCaseStatus(CaseStatusId),
    
    Comments NVARCHAR(MAX) NULL,
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Contract Comments/Notes
CREATE TABLE dbo.ContractComments (
    CommentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    
    CommentText NVARCHAR(MAX) NOT NULL,
    IsInternal BIT NOT NULL DEFAULT 1,
    
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Contract Documents/Attachments
CREATE TABLE dbo.ContractDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(100) NOT NULL,
    FileSize BIGINT NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    DocumentType NVARCHAR(100) NULL, -- e.g., 'draft_contract', 'signed_contract', 'supporting_document'
    Version INT NOT NULL DEFAULT 1,
    
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Contract Amendments
CREATE TABLE dbo.ContractAmendments (
    AmendmentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    AmendmentNumber INT NOT NULL,
    
    AmendmentDescription NVARCHAR(MAX) NOT NULL,
    AmendmentReason NVARCHAR(MAX) NULL,
    
    -- Value Changes
    PreviousValue DECIMAL(18,2) NULL,
    NewValue DECIMAL(18,2) NULL,
    
    -- Date Changes
    PreviousEndDate DATE NULL,
    NewEndDate DATE NULL,
    
    -- Status
    CaseStatusId INT NOT NULL REFERENCES dbo.LookupCaseStatus(CaseStatusId),
    ApprovedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    ApprovedAt DATETIME2 NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId)
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IX_ContractsRegister_ReferenceNumber ON dbo.ContractsRegister(ReferenceNumber);
CREATE INDEX IX_ContractsRegister_RequestingUserId ON dbo.ContractsRegister(RequestingUserId);
CREATE INDEX IX_ContractsRegister_RequestingDepartmentId ON dbo.ContractsRegister(RequestingDepartmentId);
CREATE INDEX IX_ContractsRegister_CaseStatusId ON dbo.ContractsRegister(CaseStatusId);
CREATE INDEX IX_ContractsRegister_AssignedToUserId ON dbo.ContractsRegister(AssignedToUserId);
CREATE INDEX IX_ContractsRegister_SubmittedAt ON dbo.ContractsRegister(SubmittedAt);
CREATE INDEX IX_ContractStatusHistory_ContractId ON dbo.ContractStatusHistory(ContractId);
CREATE INDEX IX_ContractComments_ContractId ON dbo.ContractComments(ContractId);
CREATE INDEX IX_ContractDocuments_ContractId ON dbo.ContractDocuments(ContractId);
CREATE INDEX IX_ContractAmendments_ContractId ON dbo.ContractAmendments(ContractId);

-- =============================================
-- Seed Lookup Data
-- =============================================

-- Contract Types
INSERT INTO dbo.LookupContractTypes (TypeCode, TypeName, Description, EstimatedDays) VALUES
('GOODS', 'Goods Supply', 'Supply of goods and materials', 7),
('SERVICES', 'Services', 'Professional or general services', 10),
('CONSTRUCTION', 'Construction', 'Construction and infrastructure works', 21),
('CONSULTANCY', 'Consultancy', 'Consulting and advisory services', 14),
('MAINTENANCE', 'Maintenance', 'Maintenance and support services', 7),
('LEASE', 'Lease/Rental', 'Lease or rental agreements', 14),
('PARTNERSHIP', 'Partnership', 'Partnership agreements', 21),
('MOU', 'Memorandum of Understanding', 'Non-binding agreements', 10),
('GRANT', 'Grant Agreement', 'Grant funding agreements', 14),
('LOAN', 'Loan Agreement', 'Loan and financing agreements', 21),
('INSURANCE', 'Insurance', 'Insurance contracts', 7),
('EMPLOYMENT', 'Employment', 'Employment contracts', 5),
('OTHER', 'Other', 'Other contract types', 14);

-- Contract Nature
INSERT INTO dbo.LookupContractNature (NatureCode, NatureName, Description) VALUES
('DOMESTIC', 'Domestic', 'Contract with local/domestic party'),
('INTERNATIONAL', 'International', 'Contract with international party'),
('GOVERNMENT', 'Government-to-Government', 'Agreement between government entities'),
('PUBLIC_PRIVATE', 'Public-Private Partnership', 'PPP arrangement'),
('INTERMINISTERIAL', 'Inter-Ministerial', 'Agreement between government ministries');

-- Currencies
INSERT INTO dbo.LookupCurrencies (CurrencyCode, CurrencyName, Symbol) VALUES
('BBD', 'Barbados Dollar', '$'),
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('CAD', 'Canadian Dollar', '$'),
('XCD', 'Eastern Caribbean Dollar', '$');
