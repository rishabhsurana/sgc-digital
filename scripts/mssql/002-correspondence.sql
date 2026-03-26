-- =============================================
-- SGC Digital - Correspondence Management Tables
-- MS SQL Server Schema
-- =============================================

-- Lookup: Correspondence Types
CREATE TABLE dbo.LookupCorrespondenceTypes (
    CorrespondenceTypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeCode NVARCHAR(50) NOT NULL UNIQUE,
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    RequiredDocuments NVARCHAR(MAX) NULL, -- JSON array of required document types
    EstimatedDays INT NULL, -- Estimated processing days
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Priority Levels
CREATE TABLE dbo.LookupPriorityLevels (
    PriorityId INT IDENTITY(1,1) PRIMARY KEY,
    PriorityCode NVARCHAR(50) NOT NULL UNIQUE,
    PriorityName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    SLADays INT NULL, -- Service Level Agreement days
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Case/Application Status
CREATE TABLE dbo.LookupCaseStatus (
    CaseStatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    StatusCategory NVARCHAR(50) NULL, -- 'open', 'in_progress', 'closed'
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Correspondence Register
-- =============================================

CREATE TABLE dbo.CorrespondenceRegister (
    CorrespondenceId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReferenceNumber NVARCHAR(50) NOT NULL UNIQUE, -- e.g., COR-2024-0001
    
    -- Applicant Info
    ApplicantUserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    ApplicantName NVARCHAR(200) NOT NULL,
    ApplicantOrganization NVARCHAR(200) NULL,
    ApplicantEmail NVARCHAR(255) NOT NULL,
    ApplicantPhone NVARCHAR(50) NULL,
    
    -- Correspondence Details
    CorrespondenceTypeId INT NOT NULL REFERENCES dbo.LookupCorrespondenceTypes(CorrespondenceTypeId),
    Subject NVARCHAR(500) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    
    -- Priority and Status
    PriorityId INT NOT NULL REFERENCES dbo.LookupPriorityLevels(PriorityId),
    CaseStatusId INT NOT NULL REFERENCES dbo.LookupCaseStatus(CaseStatusId),
    
    -- Assignment
    AssignedToUserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    AssignedDepartmentId INT NULL REFERENCES dbo.LookupDepartments(DepartmentId),
    AssignedAt DATETIME2 NULL,
    
    -- Dates
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DueDate DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    
    -- Response
    ResponseSummary NVARCHAR(MAX) NULL,
    ResolutionNotes NVARCHAR(MAX) NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    UpdatedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId)
);

-- Correspondence Status History
CREATE TABLE dbo.CorrespondenceStatusHistory (
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    
    FromStatusId INT NULL REFERENCES dbo.LookupCaseStatus(CaseStatusId),
    ToStatusId INT NOT NULL REFERENCES dbo.LookupCaseStatus(CaseStatusId),
    
    Comments NVARCHAR(MAX) NULL,
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Correspondence Comments/Notes
CREATE TABLE dbo.CorrespondenceComments (
    CommentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    
    CommentText NVARCHAR(MAX) NOT NULL,
    IsInternal BIT NOT NULL DEFAULT 1, -- Internal staff notes vs external communication
    
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Correspondence Documents/Attachments
CREATE TABLE dbo.CorrespondenceDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.CorrespondenceRegister(CorrespondenceId),
    
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(100) NOT NULL,
    FileSize BIGINT NOT NULL,
    FilePath NVARCHAR(500) NOT NULL, -- Storage path
    DocumentType NVARCHAR(100) NULL, -- e.g., 'supporting_document', 'response', 'legal_opinion'
    
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IX_CorrespondenceRegister_ReferenceNumber ON dbo.CorrespondenceRegister(ReferenceNumber);
CREATE INDEX IX_CorrespondenceRegister_ApplicantUserId ON dbo.CorrespondenceRegister(ApplicantUserId);
CREATE INDEX IX_CorrespondenceRegister_CaseStatusId ON dbo.CorrespondenceRegister(CaseStatusId);
CREATE INDEX IX_CorrespondenceRegister_AssignedToUserId ON dbo.CorrespondenceRegister(AssignedToUserId);
CREATE INDEX IX_CorrespondenceRegister_SubmittedAt ON dbo.CorrespondenceRegister(SubmittedAt);
CREATE INDEX IX_CorrespondenceStatusHistory_CorrespondenceId ON dbo.CorrespondenceStatusHistory(CorrespondenceId);
CREATE INDEX IX_CorrespondenceComments_CorrespondenceId ON dbo.CorrespondenceComments(CorrespondenceId);
CREATE INDEX IX_CorrespondenceDocuments_CorrespondenceId ON dbo.CorrespondenceDocuments(CorrespondenceId);

-- =============================================
-- Seed Lookup Data
-- =============================================

-- Correspondence Types
INSERT INTO dbo.LookupCorrespondenceTypes (TypeCode, TypeName, Description, EstimatedDays) VALUES
('LEGAL_OPINION', 'Legal Opinion Request', 'Request for legal opinion or advice', 14),
('CONTRACT_REVIEW', 'Contract Review', 'Review of contract terms and conditions', 7),
('LITIGATION', 'Litigation Matter', 'Litigation or dispute resolution matter', 30),
('LEGISLATION', 'Legislation Drafting', 'Drafting or review of legislation', 21),
('LEGAL_ADVICE', 'Legal Advice', 'General legal advice request', 10),
('GENERAL_INQUIRY', 'General Inquiry', 'General information request', 5),
('POLICY_REVIEW', 'Policy Review', 'Review of government policy', 14),
('INTERNATIONAL', 'International Agreement', 'International treaty or agreement matter', 30),
('REGULATORY', 'Regulatory Matter', 'Regulatory compliance matter', 14),
('OTHER', 'Other', 'Other correspondence type', 10);

-- Priority Levels
INSERT INTO dbo.LookupPriorityLevels (PriorityCode, PriorityName, Description, SLADays, DisplayOrder) VALUES
('LOW', 'Low', 'Low priority - standard processing', 30, 1),
('MEDIUM', 'Medium', 'Medium priority - normal processing', 14, 2),
('HIGH', 'High', 'High priority - expedited processing', 7, 3),
('URGENT', 'Urgent', 'Urgent - immediate attention required', 3, 4),
('CRITICAL', 'Critical', 'Critical - highest priority', 1, 5);

-- Case Status
INSERT INTO dbo.LookupCaseStatus (StatusCode, StatusName, Description, StatusCategory, DisplayOrder) VALUES
('DRAFT', 'Draft', 'Application saved as draft', 'open', 1),
('SUBMITTED', 'Submitted', 'Application submitted', 'open', 2),
('UNDER_REVIEW', 'Under Review', 'Application under review', 'in_progress', 3),
('PENDING_INFO', 'Pending Information', 'Awaiting additional information', 'in_progress', 4),
('IN_PROGRESS', 'In Progress', 'Work in progress', 'in_progress', 5),
('PENDING_APPROVAL', 'Pending Approval', 'Awaiting approval', 'in_progress', 6),
('APPROVED', 'Approved', 'Application approved', 'closed', 7),
('REJECTED', 'Rejected', 'Application rejected', 'closed', 8),
('COMPLETED', 'Completed', 'Work completed', 'closed', 9),
('CLOSED', 'Closed', 'Case closed', 'closed', 10),
('ARCHIVED', 'Archived', 'Case archived', 'closed', 11);
