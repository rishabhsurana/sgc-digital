-- =============================================
-- SGC DIGITAL - CONSOLIDATED DATABASE SCHEMA
-- =============================================
-- Version: 1.1.0
-- Date: 2024
-- Database: Microsoft SQL Server
-- 
-- DEPLOYMENT INSTRUCTIONS:
-- 1. Create a new database named 'SGCDigital'
-- 2. Run this script against that database
-- 3. Scripts are in dependency order - run sequentially
--
-- TOTAL TABLES: 75+
-- TOTAL LOOKUP TABLES: 25+
-- TOTAL VIEWS: 15+
--
-- SCHEMA FILES INCLUDED:
-- 001-user-management.sql
-- 002-correspondence.sql  
-- 003-contracts.sql
-- 004-audit-activity.sql
-- 005-views-reports.sql
-- 006-renewals-and-tracking.sql
-- 007-entities-reports-comprehensive.sql
-- 008-ask-rex-ai-assistant.sql
-- 009-missing-fields-comprehensive.sql (NEW)
--
-- UNIFIED USER MODEL:
-- -------------------
-- All users (staff and public) are stored in UserProfiles.
-- Staff users (RoleId 5-8) can access BOTH portals:
--   - Public Portal (/login)
--   - Management Portal (/management/login)
--
-- Staff do NOT need to register on Public Portal separately.
-- A single login works for both portals based on role.
--
-- Role Hierarchy:
--   1 = Public User (Public Portal only)
--   2 = Attorney (Public Portal only)
--   3 = Company Representative (Public Portal only)
--   4 = MDA User (Public Portal only)
--   5 = Staff (Both Portals)
--   6 = Supervisor (Both Portals)
--   7 = Administrator (Both Portals)
--   8 = Super Administrator (Both Portals)
-- =============================================

-- Create Database (if not exists)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SGCDigital')
BEGIN
    CREATE DATABASE SGCDigital;
END
GO

USE SGCDigital;
GO

-- =============================================
-- SECTION 1: USER MANAGEMENT (001)
-- =============================================

-- 1.1 User Roles Lookup
CREATE TABLE UserRoles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
    RoleCode NVARCHAR(50) NOT NULL UNIQUE,
    RoleName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    PermissionLevel INT NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

INSERT INTO UserRoles (RoleCode, RoleName, Description, PermissionLevel) VALUES
('PUBLIC_USER', 'Public User', 'General public user with basic access', 1),
('ATTORNEY', 'Attorney', 'Legal professional with attorney privileges', 2),
('COMPANY', 'Company Representative', 'Company or business entity representative', 2),
('MDA_USER', 'MDA User', 'Ministry, Department, or Agency user', 3),
('STAFF', 'Staff', 'SGC Staff member', 4),
('SUPERVISOR', 'Supervisor', 'SGC Supervisor with approval authority', 5),
('ADMIN', 'Administrator', 'System administrator', 6),
('SUPER_ADMIN', 'Super Administrator', 'Full system access', 7);

-- 1.2 Entity Types Lookup
CREATE TABLE EntityTypes (
    EntityTypeId INT PRIMARY KEY IDENTITY(1,1),
    TypeCode NVARCHAR(50) NOT NULL UNIQUE,
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    RequiresApproval BIT NOT NULL DEFAULT 0,
    EntityNumberPrefix NVARCHAR(10) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

INSERT INTO EntityTypes (TypeCode, TypeName, Description, RequiresApproval, EntityNumberPrefix) VALUES
('MINISTRY', 'Ministry', 'Government Ministry', 1, 'MDA'),
('COURT', 'Court', 'Court or Judicial Body', 1, 'CRT'),
('STATUTORY_BODY', 'Statutory Body', 'Statutory Body or Corporation', 1, 'STB'),
('PUBLIC', 'Public', 'Member of the Public', 0, 'PUB'),
('ATTORNEY', 'Attorney', 'Legal Professional', 1, 'ATT'),
('COMPANY', 'Company', 'Private Company or Business', 1, 'COM');

-- 1.3 Departments Lookup
CREATE TABLE Departments (
    DepartmentId INT PRIMARY KEY IDENTITY(1,1),
    DepartmentCode NVARCHAR(50) NOT NULL UNIQUE,
    DepartmentName NVARCHAR(200) NOT NULL,
    Ministry NVARCHAR(200) NULL,
    IsGovernment BIT NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0
);

INSERT INTO Departments (DepartmentCode, DepartmentName, Ministry, IsGovernment, DisplayOrder) VALUES
('SGC', 'Solicitor General''s Chambers', 'Attorney General''s Office', 1, 1),
('AG', 'Attorney General''s Office', 'Attorney General''s Office', 1, 2),
('MOF', 'Ministry of Finance', 'Ministry of Finance', 1, 3),
('MOH', 'Ministry of Health', 'Ministry of Health', 1, 4),
('MOE', 'Ministry of Education', 'Ministry of Education', 1, 5),
('MOTP', 'Ministry of Transport', 'Ministry of Transport and Works', 1, 6),
('JUDICIARY', 'The Judiciary', 'The Judiciary', 1, 7),
('OTHER', 'Other', NULL, 1, 99);

-- 1.4 Request Status Lookup
CREATE TABLE RequestStatuses (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    StatusCategory NVARCHAR(50) NOT NULL, -- 'pending', 'active', 'completed', 'cancelled'
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

INSERT INTO RequestStatuses (StatusCode, StatusName, StatusCategory, DisplayOrder) VALUES
('PENDING', 'Pending', 'pending', 1),
('PENDING_VERIFICATION', 'Pending Verification', 'pending', 2),
('UNDER_REVIEW', 'Under Review', 'pending', 3),
('APPROVED', 'Approved', 'active', 4),
('ACTIVE', 'Active', 'active', 5),
('REJECTED', 'Rejected', 'completed', 6),
('SUSPENDED', 'Suspended', 'cancelled', 7),
('INACTIVE', 'Inactive', 'cancelled', 8);

-- 1.5 Entities Master Table
CREATE TABLE Entities (
    EntityId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EntityNumber NVARCHAR(50) NOT NULL UNIQUE,
    EntityTypeId INT NOT NULL REFERENCES EntityTypes(EntityTypeId),
    OrganizationName NVARCHAR(255) NOT NULL,
    RegistrationNumber NVARCHAR(100) NULL,
    TaxId NVARCHAR(100) NULL,
    -- Contact Info
    PrimaryEmail NVARCHAR(255) NOT NULL,
    PrimaryPhone NVARCHAR(50) NULL,
    Website NVARCHAR(255) NULL,
    -- Address
    AddressLine1 NVARCHAR(255) NULL,
    AddressLine2 NVARCHAR(255) NULL,
    City NVARCHAR(100) NULL,
    Parish NVARCHAR(100) NULL,
    Country NVARCHAR(100) NOT NULL DEFAULT 'Barbados',
    PostalCode NVARCHAR(20) NULL,
    -- Government specific
    DepartmentId INT NULL REFERENCES Departments(DepartmentId),
    Ministry NVARCHAR(200) NULL,
    -- Attorney specific
    BarAssociation NVARCHAR(100) NULL,
    -- Company specific
    CompanyType NVARCHAR(100) NULL,
    IncorporationDate DATE NULL,
    -- Status
    StatusId INT NOT NULL DEFAULT 1 REFERENCES RequestStatuses(StatusId),
    IsVerified BIT NOT NULL DEFAULT 0,
    VerifiedAt DATETIME2 NULL,
    VerifiedBy UNIQUEIDENTIFIER NULL,
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL
);

CREATE INDEX IX_Entities_EntityNumber ON Entities(EntityNumber);
CREATE INDEX IX_Entities_EntityTypeId ON Entities(EntityTypeId);
CREATE INDEX IX_Entities_StatusId ON Entities(StatusId);

-- 1.6 User Profiles
CREATE TABLE UserProfiles (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    -- Basic Info
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    PasswordSalt NVARCHAR(255) NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(50) NULL,
    Position NVARCHAR(100) NULL,
    -- Role & Entity
    RoleId INT NOT NULL REFERENCES UserRoles(RoleId),
    EntityId UNIQUEIDENTIFIER NULL REFERENCES Entities(EntityId),
    DepartmentId INT NULL REFERENCES Departments(DepartmentId),
    -- Attorney specific
    BarNumber NVARCHAR(50) NULL,
    LawFirm NVARCHAR(200) NULL,
    -- Status
    StatusId INT NOT NULL DEFAULT 1 REFERENCES RequestStatuses(StatusId),
    IsEmailVerified BIT NOT NULL DEFAULT 0,
    EmailVerifiedAt DATETIME2 NULL,
    -- Security
    FailedLoginAttempts INT NOT NULL DEFAULT 0,
    LockedUntil DATETIME2 NULL,
    LastLoginAt DATETIME2 NULL,
    LastLoginIp NVARCHAR(50) NULL,
    MustChangePassword BIT NOT NULL DEFAULT 0,
    PasswordChangedAt DATETIME2 NULL,
    -- Preferences
    PreferredLanguage NVARCHAR(10) NOT NULL DEFAULT 'en',
    Timezone NVARCHAR(50) NOT NULL DEFAULT 'America/Barbados',
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL
);

CREATE INDEX IX_UserProfiles_Email ON UserProfiles(Email);
CREATE INDEX IX_UserProfiles_RoleId ON UserProfiles(RoleId);
CREATE INDEX IX_UserProfiles_EntityId ON UserProfiles(EntityId);
CREATE INDEX IX_UserProfiles_StatusId ON UserProfiles(StatusId);

-- 1.7 Entity Authorized Users (Additional users per entity)
CREATE TABLE EntityAuthorizedUsers (
    AuthorizedUserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EntityId UNIQUEIDENTIFIER NOT NULL REFERENCES Entities(EntityId),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    -- User Details (for invited but not yet registered)
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NULL,
    Position NVARCHAR(100) NULL,
    -- Permissions
    CanSubmitCorrespondence BIT NOT NULL DEFAULT 1,
    CanSubmitContracts BIT NOT NULL DEFAULT 1,
    CanViewAllEntityItems BIT NOT NULL DEFAULT 1,
    CanManageUsers BIT NOT NULL DEFAULT 0,
    -- Invitation
    InvitationToken NVARCHAR(255) NULL,
    InvitationSentAt DATETIME2 NULL,
    InvitationExpiresAt DATETIME2 NULL,
    InvitationAcceptedAt DATETIME2 NULL,
    -- Status
    StatusId INT NOT NULL DEFAULT 1 REFERENCES RequestStatuses(StatusId),
    -- Audit
    AddedBy UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_EntityAuthorizedUsers_EntityId ON EntityAuthorizedUsers(EntityId);
CREATE INDEX IX_EntityAuthorizedUsers_UserId ON EntityAuthorizedUsers(UserId);
CREATE INDEX IX_EntityAuthorizedUsers_Email ON EntityAuthorizedUsers(Email);

-- 1.8 User Sessions
CREATE TABLE UserSessions (
    SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    SessionToken NVARCHAR(500) NOT NULL UNIQUE,
    RefreshToken NVARCHAR(500) NULL,
    DeviceInfo NVARCHAR(500) NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastActivityAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_UserSessions_UserId ON UserSessions(UserId);
CREATE INDEX IX_UserSessions_SessionToken ON UserSessions(SessionToken);
CREATE INDEX IX_UserSessions_IsActive ON UserSessions(IsActive);

-- 1.9 Staff Registration Requests
CREATE TABLE StaffRegistrationRequests (
    RequestId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RequestReference NVARCHAR(50) NOT NULL UNIQUE,
    -- Personal Info
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NULL,
    -- Position
    RequestedRoleId INT NOT NULL REFERENCES UserRoles(RoleId),
    DepartmentId INT NOT NULL REFERENCES Departments(DepartmentId),
    Position NVARCHAR(100) NOT NULL,
    SupervisorName NVARCHAR(200) NULL,
    SupervisorEmail NVARCHAR(255) NULL,
    -- Justification
    Justification NVARCHAR(MAX) NULL,
    -- Status
    StatusId INT NOT NULL DEFAULT 1 REFERENCES RequestStatuses(StatusId),
    ReviewedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    ReviewedAt DATETIME2 NULL,
    ReviewNotes NVARCHAR(MAX) NULL,
    -- Created User (if approved)
    CreatedUserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_StaffRegistrationRequests_StatusId ON StaffRegistrationRequests(StatusId);
CREATE INDEX IX_StaffRegistrationRequests_Email ON StaffRegistrationRequests(Email);

-- 1.10 Email Verification Tokens
CREATE TABLE EmailVerificationTokens (
    TokenId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    Email NVARCHAR(255) NOT NULL,
    Token NVARCHAR(255) NOT NULL UNIQUE,
    TokenType NVARCHAR(50) NOT NULL, -- 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'INVITATION'
    ExpiresAt DATETIME2 NOT NULL,
    UsedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_EmailVerificationTokens_Token ON EmailVerificationTokens(Token);
CREATE INDEX IX_EmailVerificationTokens_Email ON EmailVerificationTokens(Email);

-- =============================================
-- SECTION 2: CORRESPONDENCE (002)
-- =============================================

-- 2.1 Correspondence Types
CREATE TABLE CorrespondenceTypes (
    TypeId INT PRIMARY KEY IDENTITY(1,1),
    TypeCode NVARCHAR(50) NOT NULL UNIQUE,
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    DefaultSLADays INT NOT NULL DEFAULT 14,
    RequiresLegalReview BIT NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0
);

INSERT INTO CorrespondenceTypes (TypeCode, TypeName, Description, DefaultSLADays, DisplayOrder) VALUES
('LEGAL_OPINION', 'Legal Opinion', 'Request for legal opinion or advice', 21, 1),
('CONTRACT_REVIEW', 'Contract Review', 'Request to review contract terms', 14, 2),
('LITIGATION', 'Litigation Matter', 'Litigation or dispute related matter', 30, 3),
('LEGISLATION', 'Legislation Drafting', 'Request for legislation drafting or review', 30, 4),
('LEGAL_ADVICE', 'Legal Advice', 'General legal advice request', 14, 5),
('GENERAL_INQUIRY', 'General Inquiry', 'General inquiry or information request', 7, 6),
('POLICY_REVIEW', 'Policy Review', 'Request to review government policy', 21, 7),
('INTERNATIONAL', 'International Agreement', 'International treaty or agreement matter', 45, 8),
('REGULATORY', 'Regulatory Matter', 'Regulatory or compliance matter', 21, 9),
('OTHER', 'Other', 'Other correspondence type', 14, 10);

-- 2.2 Priority Levels
CREATE TABLE PriorityLevels (
    PriorityId INT PRIMARY KEY IDENTITY(1,1),
    PriorityCode NVARCHAR(50) NOT NULL UNIQUE,
    PriorityName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    SLAMultiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    ColorCode NVARCHAR(20) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0
);

INSERT INTO PriorityLevels (PriorityCode, PriorityName, Description, SLAMultiplier, ColorCode, DisplayOrder) VALUES
('LOW', 'Low', 'Low priority - standard processing', 1.50, '#22c55e', 1),
('MEDIUM', 'Medium', 'Medium priority - normal processing', 1.00, '#3b82f6', 2),
('HIGH', 'High', 'High priority - expedited processing', 0.75, '#f97316', 3),
('URGENT', 'Urgent', 'Urgent - immediate attention required', 0.50, '#ef4444', 4),
('CRITICAL', 'Critical', 'Critical - highest priority', 0.25, '#dc2626', 5);

-- 2.3 Case Statuses
CREATE TABLE CaseStatuses (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    StatusCategory NVARCHAR(50) NOT NULL, -- 'open', 'in_progress', 'closed'
    AllowedNextStatuses NVARCHAR(500) NULL, -- Comma-separated status codes
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

INSERT INTO CaseStatuses (StatusCode, StatusName, StatusCategory, AllowedNextStatuses, DisplayOrder) VALUES
('DRAFT', 'Draft', 'open', 'SUBMITTED', 1),
('SUBMITTED', 'Submitted', 'open', 'UNDER_REVIEW,REJECTED', 2),
('UNDER_REVIEW', 'Under Review', 'in_progress', 'PENDING_INFO,IN_PROGRESS,REJECTED', 3),
('PENDING_INFO', 'Pending Information', 'in_progress', 'UNDER_REVIEW,IN_PROGRESS', 4),
('IN_PROGRESS', 'In Progress', 'in_progress', 'PENDING_APPROVAL,PENDING_INFO', 5),
('PENDING_APPROVAL', 'Pending Approval', 'in_progress', 'APPROVED,REJECTED,IN_PROGRESS', 6),
('APPROVED', 'Approved', 'closed', 'COMPLETED', 7),
('REJECTED', 'Rejected', 'closed', NULL, 8),
('COMPLETED', 'Completed', 'closed', 'ARCHIVED', 9),
('CLOSED', 'Closed', 'closed', 'ARCHIVED', 10),
('ARCHIVED', 'Archived', 'closed', NULL, 11);

-- 2.4 Correspondence Register
CREATE TABLE CorrespondenceRegister (
    CorrespondenceId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReferenceNumber NVARCHAR(50) NOT NULL UNIQUE,
    FileNumber NVARCHAR(50) NULL,
    -- Type & Priority
    CorrespondenceTypeId INT NOT NULL REFERENCES CorrespondenceTypes(TypeId),
    PriorityId INT NOT NULL DEFAULT 2 REFERENCES PriorityLevels(PriorityId),
    -- Subject
    Subject NVARCHAR(500) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    -- Requesting Entity
    RequestingEntityId UNIQUEIDENTIFIER NULL REFERENCES Entities(EntityId),
    RequestingUserId UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    RequestingOfficerName NVARCHAR(200) NOT NULL,
    RequestingOfficerEmail NVARCHAR(255) NOT NULL,
    RequestingOfficerPhone NVARCHAR(50) NULL,
    RequestingDepartmentId INT NULL REFERENCES Departments(DepartmentId),
    -- Status
    CaseStatusId INT NOT NULL DEFAULT 2 REFERENCES CaseStatuses(StatusId),
    StatusCategory NVARCHAR(50) NOT NULL DEFAULT 'open',
    -- Assignment
    AssignedToUserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    AssignedAt DATETIME2 NULL,
    AssignedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    -- Dates
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DueDate DATE NULL,
    CompletedAt DATETIME2 NULL,
    ClosedAt DATETIME2 NULL,
    -- SLA
    SLADays INT NULL,
    IsOverdue BIT NOT NULL DEFAULT 0,
    -- Response
    ResponseSummary NVARCHAR(MAX) NULL,
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL
);

CREATE INDEX IX_CorrespondenceRegister_ReferenceNumber ON CorrespondenceRegister(ReferenceNumber);
CREATE INDEX IX_CorrespondenceRegister_FileNumber ON CorrespondenceRegister(FileNumber);
CREATE INDEX IX_CorrespondenceRegister_CaseStatusId ON CorrespondenceRegister(CaseStatusId);
CREATE INDEX IX_CorrespondenceRegister_AssignedToUserId ON CorrespondenceRegister(AssignedToUserId);
CREATE INDEX IX_CorrespondenceRegister_RequestingEntityId ON CorrespondenceRegister(RequestingEntityId);
CREATE INDEX IX_CorrespondenceRegister_SubmittedAt ON CorrespondenceRegister(SubmittedAt);

-- 2.5 Correspondence Status History
CREATE TABLE CorrespondenceStatusHistory (
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES CorrespondenceRegister(CorrespondenceId),
    FromStatusId INT NULL REFERENCES CaseStatuses(StatusId),
    ToStatusId INT NOT NULL REFERENCES CaseStatuses(StatusId),
    Comments NVARCHAR(MAX) NULL,
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_CorrespondenceStatusHistory_CorrespondenceId ON CorrespondenceStatusHistory(CorrespondenceId);

-- 2.6 Correspondence Comments
CREATE TABLE CorrespondenceComments (
    CommentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES CorrespondenceRegister(CorrespondenceId),
    CommentText NVARCHAR(MAX) NOT NULL,
    IsInternal BIT NOT NULL DEFAULT 1,
    CommentedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    CommentedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_CorrespondenceComments_CorrespondenceId ON CorrespondenceComments(CorrespondenceId);

-- 2.7 Correspondence Documents
CREATE TABLE CorrespondenceDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CorrespondenceId UNIQUEIDENTIFIER NOT NULL REFERENCES CorrespondenceRegister(CorrespondenceId),
    FileName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NULL,
    MimeType NVARCHAR(100) NULL,
    StoragePath NVARCHAR(500) NOT NULL,
    DocumentType NVARCHAR(100) NULL,
    Description NVARCHAR(500) NULL,
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_CorrespondenceDocuments_CorrespondenceId ON CorrespondenceDocuments(CorrespondenceId);

-- =============================================
-- SECTION 3: CONTRACTS (003)
-- =============================================

-- 3.1 Contract Types
CREATE TABLE ContractTypes (
    TypeId INT PRIMARY KEY IDENTITY(1,1),
    TypeCode NVARCHAR(50) NOT NULL UNIQUE,
    TypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    DefaultSLADays INT NOT NULL DEFAULT 21,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0
);

INSERT INTO ContractTypes (TypeCode, TypeName, Description, DefaultSLADays, DisplayOrder) VALUES
('GOODS', 'Goods Supply', 'Contract for supply of goods', 14, 1),
('SERVICES', 'Services', 'Contract for provision of services', 14, 2),
('CONSTRUCTION', 'Construction', 'Construction or building contract', 30, 3),
('CONSULTANCY', 'Consultancy', 'Consultancy services contract', 21, 4),
('MAINTENANCE', 'Maintenance', 'Maintenance and support contract', 14, 5),
('LEASE', 'Lease/Rental', 'Lease or rental agreement', 21, 6),
('PARTNERSHIP', 'Partnership', 'Partnership or joint venture agreement', 30, 7),
('MOU', 'MOU', 'Memorandum of Understanding', 14, 8),
('GRANT', 'Grant Agreement', 'Grant or funding agreement', 21, 9),
('LOAN', 'Loan Agreement', 'Loan or financing agreement', 30, 10),
('INSURANCE', 'Insurance', 'Insurance policy or contract', 14, 11),
('EMPLOYMENT', 'Employment', 'Employment contract', 7, 12),
('OTHER', 'Other', 'Other contract type', 14, 13);

-- 3.2 Contract Nature
CREATE TABLE ContractNatures (
    NatureId INT PRIMARY KEY IDENTITY(1,1),
    NatureCode NVARCHAR(50) NOT NULL UNIQUE,
    NatureName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

INSERT INTO ContractNatures (NatureCode, NatureName, Description) VALUES
('NEW', 'New Contract', 'Brand new contract'),
('RENEWAL', 'Renewal', 'Renewal of existing contract'),
('AMENDMENT', 'Amendment', 'Amendment to existing contract'),
('EXTENSION', 'Extension', 'Extension of existing contract'),
('TERMINATION', 'Termination', 'Early termination of contract'),
('VARIATION', 'Variation', 'Variation to contract terms');

-- 3.3 Currencies
CREATE TABLE Currencies (
    CurrencyId INT PRIMARY KEY IDENTITY(1,1),
    CurrencyCode NVARCHAR(3) NOT NULL UNIQUE,
    CurrencyName NVARCHAR(100) NOT NULL,
    CurrencySymbol NVARCHAR(5) NOT NULL,
    ExchangeRateToUSD DECIMAL(18,6) NOT NULL DEFAULT 1.000000,
    IsActive BIT NOT NULL DEFAULT 1
);

INSERT INTO Currencies (CurrencyCode, CurrencyName, CurrencySymbol, ExchangeRateToUSD) VALUES
('BBD', 'Barbados Dollar', '$', 0.500000),
('USD', 'US Dollar', '$', 1.000000),
('EUR', 'Euro', '€', 1.100000),
('GBP', 'British Pound', '£', 1.270000),
('CAD', 'Canadian Dollar', '$', 0.740000);

-- 3.4 Contracts Register
CREATE TABLE ContractsRegister (
    ContractId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReferenceNumber NVARCHAR(50) NOT NULL UNIQUE,
    FileNumber NVARCHAR(50) NULL,
    -- Type & Nature
    ContractTypeId INT NOT NULL REFERENCES ContractTypes(TypeId),
    ContractNatureId INT NOT NULL DEFAULT 1 REFERENCES ContractNatures(NatureId),
    PriorityId INT NOT NULL DEFAULT 2 REFERENCES PriorityLevels(PriorityId),
    -- Contract Details
    ContractTitle NVARCHAR(500) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    -- Counterparty
    CounterpartyName NVARCHAR(255) NOT NULL,
    CounterpartyContact NVARCHAR(200) NULL,
    CounterpartyEmail NVARCHAR(255) NULL,
    CounterpartyPhone NVARCHAR(50) NULL,
    CounterpartyAddress NVARCHAR(500) NULL,
    -- Financial
    ContractValue DECIMAL(18,2) NULL,
    CurrencyId INT NOT NULL DEFAULT 1 REFERENCES Currencies(CurrencyId),
    -- Dates
    ProposedStartDate DATE NULL,
    ProposedEndDate DATE NULL,
    ActualStartDate DATE NULL,
    ActualEndDate DATE NULL,
    ExpiryDate DATE NULL,
    -- Requesting Entity
    RequestingEntityId UNIQUEIDENTIFIER NULL REFERENCES Entities(EntityId),
    RequestingUserId UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    RequestingOfficerName NVARCHAR(200) NOT NULL,
    RequestingOfficerEmail NVARCHAR(255) NOT NULL,
    RequestingOfficerPhone NVARCHAR(50) NULL,
    RequestingDepartmentId INT NULL REFERENCES Departments(DepartmentId),
    -- Status
    CaseStatusId INT NOT NULL DEFAULT 2 REFERENCES CaseStatuses(StatusId),
    StatusCategory NVARCHAR(50) NOT NULL DEFAULT 'open',
    -- Assignment
    AssignedToUserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    AssignedAt DATETIME2 NULL,
    AssignedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    -- Dates
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DueDate DATE NULL,
    CompletedAt DATETIME2 NULL,
    ClosedAt DATETIME2 NULL,
    -- SLA
    SLADays INT NULL,
    IsOverdue BIT NOT NULL DEFAULT 0,
    -- Review
    LegalReviewNotes NVARCHAR(MAX) NULL,
    ApprovalNotes NVARCHAR(MAX) NULL,
    -- Related Contracts
    OriginalContractId UNIQUEIDENTIFIER NULL REFERENCES ContractsRegister(ContractId),
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL
);

CREATE INDEX IX_ContractsRegister_ReferenceNumber ON ContractsRegister(ReferenceNumber);
CREATE INDEX IX_ContractsRegister_FileNumber ON ContractsRegister(FileNumber);
CREATE INDEX IX_ContractsRegister_CaseStatusId ON ContractsRegister(CaseStatusId);
CREATE INDEX IX_ContractsRegister_AssignedToUserId ON ContractsRegister(AssignedToUserId);
CREATE INDEX IX_ContractsRegister_RequestingEntityId ON ContractsRegister(RequestingEntityId);
CREATE INDEX IX_ContractsRegister_ExpiryDate ON ContractsRegister(ExpiryDate);
CREATE INDEX IX_ContractsRegister_SubmittedAt ON ContractsRegister(SubmittedAt);

-- 3.5 Contract Status History
CREATE TABLE ContractStatusHistory (
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES ContractsRegister(ContractId),
    FromStatusId INT NULL REFERENCES CaseStatuses(StatusId),
    ToStatusId INT NOT NULL REFERENCES CaseStatuses(StatusId),
    Comments NVARCHAR(MAX) NULL,
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ContractStatusHistory_ContractId ON ContractStatusHistory(ContractId);

-- 3.6 Contract Comments
CREATE TABLE ContractComments (
    CommentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES ContractsRegister(ContractId),
    CommentText NVARCHAR(MAX) NOT NULL,
    IsInternal BIT NOT NULL DEFAULT 1,
    CommentedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    CommentedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ContractComments_ContractId ON ContractComments(ContractId);

-- 3.7 Contract Documents
CREATE TABLE ContractDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES ContractsRegister(ContractId),
    FileName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NULL,
    MimeType NVARCHAR(100) NULL,
    StoragePath NVARCHAR(500) NOT NULL,
    DocumentType NVARCHAR(100) NULL,
    Description NVARCHAR(500) NULL,
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ContractDocuments_ContractId ON ContractDocuments(ContractId);

-- 3.8 Contract Amendments
CREATE TABLE ContractAmendments (
    AmendmentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContractId UNIQUEIDENTIFIER NOT NULL REFERENCES ContractsRegister(ContractId),
    AmendmentNumber INT NOT NULL,
    AmendmentTitle NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    EffectiveDate DATE NULL,
    ValueChange DECIMAL(18,2) NULL,
    NewTotalValue DECIMAL(18,2) NULL,
    CaseStatusId INT NOT NULL DEFAULT 2 REFERENCES CaseStatuses(StatusId),
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ContractAmendments_ContractId ON ContractAmendments(ContractId);

-- =============================================
-- SECTION 4: CONTRACT RENEWALS (004)
-- =============================================

-- 4.1 Renewal Statuses
CREATE TABLE RenewalStatuses (
    StatusId INT PRIMARY KEY IDENTITY(1,1),
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

INSERT INTO RenewalStatuses (StatusCode, StatusName, Description, DisplayOrder) VALUES
('DRAFT', 'Draft', 'Renewal request saved as draft', 1),
('PENDING_VALIDATION', 'Pending Validation', 'Awaiting validation', 2),
('VALIDATED', 'Validated', 'Confirmed as valid renewal', 3),
('UNDER_REVIEW', 'Under Review', 'Under legal review', 4),
('PENDING_INFO', 'Pending Information', 'Awaiting additional info', 5),
('PENDING_APPROVAL', 'Pending Approval', 'Awaiting approval', 6),
('APPROVED', 'Approved', 'Renewal approved', 7),
('REJECTED', 'Rejected', 'Renewal rejected', 8),
('EXECUTED', 'Executed', 'New contract created', 9),
('CANCELLED', 'Cancelled', 'Renewal cancelled', 10);

-- 4.2 Contract Renewals
CREATE TABLE ContractRenewals (
    RenewalId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RenewalReferenceNumber NVARCHAR(50) NOT NULL UNIQUE,
    -- Original Contract Link
    OriginalContractId UNIQUEIDENTIFIER NOT NULL REFERENCES ContractsRegister(ContractId),
    PreviousRenewalId UNIQUEIDENTIFIER NULL REFERENCES ContractRenewals(RenewalId),
    RenewalSequence INT NOT NULL DEFAULT 1,
    -- Validation
    IsValidRenewal BIT NOT NULL DEFAULT 0,
    ValidationNotes NVARCHAR(MAX) NULL,
    ValidatedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    ValidatedAt DATETIME2 NULL,
    -- Details
    RenewalReason NVARCHAR(MAX) NOT NULL,
    RenewalJustification NVARCHAR(MAX) NULL,
    -- Original Contract Summary
    OriginalContractNumber NVARCHAR(50) NOT NULL,
    OriginalContractTitle NVARCHAR(500) NOT NULL,
    OriginalStartDate DATE NOT NULL,
    OriginalEndDate DATE NOT NULL,
    OriginalValue DECIMAL(18,2) NOT NULL,
    -- Proposed Terms
    ProposedStartDate DATE NOT NULL,
    ProposedEndDate DATE NOT NULL,
    ProposedValue DECIMAL(18,2) NOT NULL,
    CurrencyId INT NOT NULL DEFAULT 1 REFERENCES Currencies(CurrencyId),
    ProposedDurationMonths INT NULL,
    -- Value Analysis
    ValueChange DECIMAL(18,2) NULL,
    ValueChangePercent DECIMAL(10,4) NULL,
    TermsChanged BIT NOT NULL DEFAULT 0,
    TermsChangeDescription NVARCHAR(MAX) NULL,
    -- Counterparty
    CounterpartyName NVARCHAR(255) NOT NULL,
    CounterpartyChanged BIT NOT NULL DEFAULT 0,
    -- Requesting Entity
    RequestingUserId UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    RequestingDepartmentId INT NOT NULL REFERENCES Departments(DepartmentId),
    RequestingOfficerName NVARCHAR(200) NOT NULL,
    RequestingOfficerEmail NVARCHAR(255) NOT NULL,
    -- Status
    RenewalStatusId INT NOT NULL DEFAULT 1 REFERENCES RenewalStatuses(StatusId),
    PriorityId INT NOT NULL DEFAULT 2 REFERENCES PriorityLevels(PriorityId),
    -- Assignment
    AssignedToUserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    AssignedAt DATETIME2 NULL,
    -- Review & Approval
    LegalReviewNotes NVARCHAR(MAX) NULL,
    ApprovalNotes NVARCHAR(MAX) NULL,
    ApprovedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    ApprovedAt DATETIME2 NULL,
    RejectedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    RejectedAt DATETIME2 NULL,
    RejectionReason NVARCHAR(MAX) NULL,
    -- Dates
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DueDate DATE NULL,
    CompletedAt DATETIME2 NULL,
    -- New Contract (if approved)
    NewContractId UNIQUEIDENTIFIER NULL REFERENCES ContractsRegister(ContractId),
    NewContractNumber NVARCHAR(50) NULL,
    ExecutedDate DATE NULL,
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL
);

CREATE INDEX IX_ContractRenewals_OriginalContractId ON ContractRenewals(OriginalContractId);
CREATE INDEX IX_ContractRenewals_RenewalStatusId ON ContractRenewals(RenewalStatusId);
CREATE INDEX IX_ContractRenewals_SubmittedAt ON ContractRenewals(SubmittedAt);

-- 4.3 Renewal Status History
CREATE TABLE ContractRenewalStatusHistory (
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RenewalId UNIQUEIDENTIFIER NOT NULL REFERENCES ContractRenewals(RenewalId),
    FromStatusId INT NULL REFERENCES RenewalStatuses(StatusId),
    ToStatusId INT NOT NULL REFERENCES RenewalStatuses(StatusId),
    Comments NVARCHAR(MAX) NULL,
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ContractRenewalStatusHistory_RenewalId ON ContractRenewalStatusHistory(RenewalId);

-- 4.4 Renewal Documents
CREATE TABLE ContractRenewalDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RenewalId UNIQUEIDENTIFIER NOT NULL REFERENCES ContractRenewals(RenewalId),
    FileName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NULL,
    MimeType NVARCHAR(100) NULL,
    StoragePath NVARCHAR(500) NOT NULL,
    DocumentType NVARCHAR(100) NULL,
    Description NVARCHAR(500) NULL,
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ContractRenewalDocuments_RenewalId ON ContractRenewalDocuments(RenewalId);

-- =============================================
-- SECTION 5: AUDIT & ACTIVITY (005)
-- =============================================

-- 5.1 Audit Log
CREATE TABLE AuditLog (
    AuditId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    -- What happened
    Action NVARCHAR(100) NOT NULL,
    TableName NVARCHAR(100) NOT NULL,
    RecordId NVARCHAR(100) NULL,
    -- Who did it
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    UserEmail NVARCHAR(255) NULL,
    -- Details
    OldValues NVARCHAR(MAX) NULL,
    NewValues NVARCHAR(MAX) NULL,
    AdditionalInfo NVARCHAR(MAX) NULL,
    -- Context
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    SessionId NVARCHAR(255) NULL,
    -- When
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AuditLog_TableName ON AuditLog(TableName);
CREATE INDEX IX_AuditLog_UserId ON AuditLog(UserId);
CREATE INDEX IX_AuditLog_CreatedAt ON AuditLog(CreatedAt);
CREATE INDEX IX_AuditLog_RecordId ON AuditLog(RecordId);

-- 5.2 Activity Log
CREATE TABLE ActivityLog (
    ActivityId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    ActivityType NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    RelatedItemType NVARCHAR(100) NULL,
    RelatedItemId UNIQUEIDENTIFIER NULL,
    RelatedItemReference NVARCHAR(100) NULL,
    Metadata NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ActivityLog_UserId ON ActivityLog(UserId);
CREATE INDEX IX_ActivityLog_ActivityType ON ActivityLog(ActivityType);
CREATE INDEX IX_ActivityLog_CreatedAt ON ActivityLog(CreatedAt);

-- 5.3 Notifications
CREATE TABLE Notifications (
    NotificationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    Title NVARCHAR(255) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    NotificationType NVARCHAR(50) NOT NULL,
    RelatedItemType NVARCHAR(100) NULL,
    RelatedItemId UNIQUEIDENTIFIER NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    ReadAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);

-- 5.4 Email Queue
CREATE TABLE EmailQueue (
    EmailId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ToEmail NVARCHAR(255) NOT NULL,
    ToName NVARCHAR(200) NULL,
    CcEmails NVARCHAR(MAX) NULL,
    BccEmails NVARCHAR(MAX) NULL,
    Subject NVARCHAR(500) NOT NULL,
    BodyHtml NVARCHAR(MAX) NOT NULL,
    BodyText NVARCHAR(MAX) NULL,
    TemplateName NVARCHAR(100) NULL,
    TemplateData NVARCHAR(MAX) NULL,
    RelatedItemType NVARCHAR(100) NULL,
    RelatedItemId UNIQUEIDENTIFIER NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
    SentAt DATETIME2 NULL,
    FailedAt DATETIME2 NULL,
    FailureReason NVARCHAR(MAX) NULL,
    RetryCount INT NOT NULL DEFAULT 0,
    MaxRetries INT NOT NULL DEFAULT 3,
    NextRetryAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_EmailQueue_Status ON EmailQueue(Status);
CREATE INDEX IX_EmailQueue_ToEmail ON EmailQueue(ToEmail);

-- 5.5 SLA Tracking
CREATE TABLE SLATracking (
    SLAId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ItemType NVARCHAR(50) NOT NULL,
    ItemId UNIQUEIDENTIFIER NOT NULL,
    ReferenceNumber NVARCHAR(100) NOT NULL,
    SLADays INT NOT NULL,
    StartDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    IsOverdue BIT NOT NULL DEFAULT 0,
    DaysOverdue INT NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CompletedAt DATETIME2 NULL,
    EscalationLevel INT NOT NULL DEFAULT 0,
    LastEscalatedAt DATETIME2 NULL,
    EscalatedTo UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_SLATracking_ItemType ON SLATracking(ItemType);
CREATE INDEX IX_SLATracking_ItemId ON SLATracking(ItemId);
CREATE INDEX IX_SLATracking_IsOverdue ON SLATracking(IsOverdue);
CREATE INDEX IX_SLATracking_DueDate ON SLATracking(DueDate);

-- =============================================
-- SECTION 6: REPORTS (006)
-- =============================================

-- 6.1 Report Definitions
CREATE TABLE ReportDefinitions (
    ReportId INT PRIMARY KEY IDENTITY(1,1),
    ReportCode NVARCHAR(50) NOT NULL UNIQUE,
    ReportName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    Category NVARCHAR(100) NOT NULL,
    ReportQuery NVARCHAR(MAX) NULL,
    Parameters NVARCHAR(MAX) NULL,
    DefaultFormat NVARCHAR(20) NOT NULL DEFAULT 'PDF',
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

INSERT INTO ReportDefinitions (ReportCode, ReportName, Description, Category, DefaultFormat, DisplayOrder) VALUES
('CORR_SUMMARY', 'Correspondence Summary', 'Summary of correspondence by status, type, and department', 'Correspondence', 'PDF', 1),
('CORR_OVERDUE', 'Overdue Correspondence', 'List of overdue correspondence items', 'Correspondence', 'EXCEL', 2),
('CORR_BY_DEPT', 'Correspondence by Department', 'Breakdown of correspondence by requesting department', 'Correspondence', 'PDF', 3),
('CORR_TRENDS', 'Correspondence Trends', 'Trend analysis of correspondence over time', 'Correspondence', 'PDF', 4),
('CONTRACT_SUMMARY', 'Contract Summary', 'Summary of contracts by status, type, and value', 'Contracts', 'PDF', 5),
('CONTRACT_EXPIRING', 'Expiring Contracts', 'Contracts expiring within specified period', 'Contracts', 'EXCEL', 6),
('CONTRACT_VALUE', 'Contract Value Analysis', 'Analysis of contract values by department and type', 'Contracts', 'PDF', 7),
('CONTRACT_RENEWALS', 'Contract Renewals', 'List of contract renewal requests', 'Contracts', 'EXCEL', 8),
('USER_ACTIVITY', 'User Activity Report', 'User login and activity summary', 'Administration', 'PDF', 9),
('SLA_COMPLIANCE', 'SLA Compliance Report', 'SLA compliance rates by department', 'Performance', 'PDF', 10),
('DEPT_WORKLOAD', 'Department Workload', 'Workload analysis by department', 'Performance', 'PDF', 11),
('STAFF_PRODUCTIVITY', 'Staff Productivity', 'Staff productivity metrics', 'Performance', 'PDF', 12);

-- 6.2 Report Execution Log
CREATE TABLE ReportExecutionLog (
    ExecutionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReportId INT NOT NULL REFERENCES ReportDefinitions(ReportId),
    ExecutedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    Parameters NVARCHAR(MAX) NULL,
    OutputFormat NVARCHAR(20) NOT NULL,
    OutputPath NVARCHAR(500) NULL,
    RecordCount INT NULL,
    ExecutionTimeMs INT NULL,
    Status NVARCHAR(20) NOT NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    ExecutedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ReportExecutionLog_ReportId ON ReportExecutionLog(ReportId);
CREATE INDEX IX_ReportExecutionLog_ExecutedBy ON ReportExecutionLog(ExecutedBy);
CREATE INDEX IX_ReportExecutionLog_ExecutedAt ON ReportExecutionLog(ExecutedAt);

-- 6.3 Scheduled Reports
CREATE TABLE ScheduledReports (
    ScheduleId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReportId INT NOT NULL REFERENCES ReportDefinitions(ReportId),
    ScheduleName NVARCHAR(200) NOT NULL,
    Frequency NVARCHAR(50) NOT NULL,
    DayOfWeek INT NULL,
    DayOfMonth INT NULL,
    TimeOfDay TIME NOT NULL,
    Parameters NVARCHAR(MAX) NULL,
    OutputFormat NVARCHAR(20) NOT NULL DEFAULT 'PDF',
    Recipients NVARCHAR(MAX) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    LastRunAt DATETIME2 NULL,
    NextRunAt DATETIME2 NULL,
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES UserProfiles(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_ScheduledReports_ReportId ON ScheduledReports(ReportId);
CREATE INDEX IX_ScheduledReports_IsActive ON ScheduledReports(IsActive);

-- 6.4 Daily Metrics
CREATE TABLE DailyMetrics (
    MetricId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MetricDate DATE NOT NULL UNIQUE,
    -- Correspondence
    TotalCorrespondence INT NOT NULL DEFAULT 0,
    NewCorrespondence INT NOT NULL DEFAULT 0,
    CompletedCorrespondence INT NOT NULL DEFAULT 0,
    OverdueCorrespondence INT NOT NULL DEFAULT 0,
    -- Contracts
    TotalContracts INT NOT NULL DEFAULT 0,
    NewContracts INT NOT NULL DEFAULT 0,
    CompletedContracts INT NOT NULL DEFAULT 0,
    OverdueContracts INT NOT NULL DEFAULT 0,
    TotalContractValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    -- Renewals
    NewRenewals INT NOT NULL DEFAULT 0,
    ApprovedRenewals INT NOT NULL DEFAULT 0,
    RejectedRenewals INT NOT NULL DEFAULT 0,
    -- Users
    ActiveUsers INT NOT NULL DEFAULT 0,
    NewRegistrations INT NOT NULL DEFAULT 0,
    -- SLA
    SLAComplianceRate DECIMAL(5,2) NULL,
    AvgProcessingDays DECIMAL(10,2) NULL,
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_DailyMetrics_MetricDate ON DailyMetrics(MetricDate);

-- =============================================
-- SECTION 7: ASK REX AI ASSISTANT (007)
-- =============================================

-- 7.1 AI Sessions
CREATE TABLE AskRexSessions (
    SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    AnonymousSessionToken NVARCHAR(255) NULL,
    SessionStartedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    SessionEndedAt DATETIME2 NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    PortalContext NVARCHAR(50) NOT NULL DEFAULT 'public',
    CurrentPage NVARCHAR(255) NULL,
    TotalMessages INT NOT NULL DEFAULT 0,
    TotalUserMessages INT NOT NULL DEFAULT 0,
    TotalAssistantMessages INT NOT NULL DEFAULT 0,
    UserAgent NVARCHAR(500) NULL,
    IpAddress NVARCHAR(50) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexSessions_UserId ON AskRexSessions(UserId);
CREATE INDEX IX_AskRexSessions_IsActive ON AskRexSessions(IsActive);

-- 7.2 AI Messages
CREATE TABLE AskRexMessages (
    MessageId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexSessions(SessionId),
    MessageRole NVARCHAR(20) NOT NULL,
    MessageContent NVARCHAR(MAX) NOT NULL,
    MessageType NVARCHAR(50) NOT NULL DEFAULT 'text',
    DetectedIntent NVARCHAR(100) NULL,
    IntentConfidence DECIMAL(5,4) NULL,
    ResponseSourceType NVARCHAR(50) NULL,
    ProcessingTimeMs INT NULL,
    TokensUsed INT NULL,
    WasVoiceInput BIT NOT NULL DEFAULT 0,
    WasVoiceOutput BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexMessages_SessionId ON AskRexMessages(SessionId);
CREATE INDEX IX_AskRexMessages_DetectedIntent ON AskRexMessages(DetectedIntent);

-- 7.3 AI Message Files
CREATE TABLE AskRexMessageFiles (
    MessageFileId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MessageId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexMessages(MessageId),
    FileName NVARCHAR(255) NOT NULL,
    FileReference NVARCHAR(100) NOT NULL,
    FileType NVARCHAR(50) NOT NULL,
    SourceTable NVARCHAR(100) NULL,
    SourceId UNIQUEIDENTIFIER NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    WasAccessed BIT NOT NULL DEFAULT 0,
    AccessedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexMessageFiles_MessageId ON AskRexMessageFiles(MessageId);

-- 7.4 AI Search Queries
CREATE TABLE AskRexSearchQueries (
    QueryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexSessions(SessionId),
    MessageId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexMessages(MessageId),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    RawQuery NVARCHAR(MAX) NOT NULL,
    NormalizedQuery NVARCHAR(MAX) NULL,
    QueryType NVARCHAR(50) NOT NULL,
    SearchedFileNumber NVARCHAR(100) NULL,
    SearchedSubject NVARCHAR(500) NULL,
    SearchedDateFrom DATE NULL,
    SearchedDateTo DATE NULL,
    SearchedEntityId UNIQUEIDENTIFIER NULL,
    SearchedDepartmentId INT NULL,
    SearchedStatus NVARCHAR(50) NULL,
    TotalResultsFound INT NOT NULL DEFAULT 0,
    ResultsReturned INT NOT NULL DEFAULT 0,
    SearchDurationMs INT NULL,
    WasHelpful BIT NULL,
    UserFeedback NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexSearchQueries_SessionId ON AskRexSearchQueries(SessionId);
CREATE INDEX IX_AskRexSearchQueries_QueryType ON AskRexSearchQueries(QueryType);

-- 7.5 AI Generated Reports
CREATE TABLE AskRexGeneratedReports (
    GeneratedReportId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SessionId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexSessions(SessionId),
    MessageId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexMessages(MessageId),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    ReportType NVARCHAR(100) NOT NULL,
    ReportTitle NVARCHAR(255) NOT NULL,
    ReportSubject NVARCHAR(500) NULL,
    ReportParameters NVARCHAR(MAX) NULL,
    DateRangeFrom DATE NULL,
    DateRangeTo DATE NULL,
    DepartmentId INT NULL,
    EntityId UNIQUEIDENTIFIER NULL,
    ReportSummary NVARCHAR(MAX) NULL,
    ReportDataJson NVARCHAR(MAX) NULL,
    WasExported BIT NOT NULL DEFAULT 0,
    ExportFormat NVARCHAR(20) NULL,
    ExportedAt DATETIME2 NULL,
    ExportedFilePath NVARCHAR(500) NULL,
    TotalItemsAnalyzed INT NULL,
    ActiveItems INT NULL,
    PendingItems INT NULL,
    CompletedItems INT NULL,
    AverageProcessingDays DECIMAL(10,2) NULL,
    GenerationTimeMs INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexGeneratedReports_SessionId ON AskRexGeneratedReports(SessionId);
CREATE INDEX IX_AskRexGeneratedReports_ReportType ON AskRexGeneratedReports(ReportType);

-- 7.6 AI Feedback
CREATE TABLE AskRexFeedback (
    FeedbackId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MessageId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexMessages(MessageId),
    SessionId UNIQUEIDENTIFIER NOT NULL REFERENCES AskRexSessions(SessionId),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    Rating INT NULL,
    WasHelpful BIT NULL,
    FeedbackType NVARCHAR(50) NULL,
    FeedbackComment NVARCHAR(1000) NULL,
    ReportedIssue NVARCHAR(100) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexFeedback_MessageId ON AskRexFeedback(MessageId);
CREATE INDEX IX_AskRexFeedback_Rating ON AskRexFeedback(Rating);

-- 7.7 AI Saved Prompts
CREATE TABLE AskRexSavedPrompts (
    PromptId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    PromptLabel NVARCHAR(100) NOT NULL,
    PromptText NVARCHAR(500) NOT NULL,
    PromptCategory NVARCHAR(50) NOT NULL,
    PromptIcon NVARCHAR(50) NULL,
    UsageCount INT NOT NULL DEFAULT 0,
    LastUsedAt DATETIME2 NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsSystemPrompt BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexSavedPrompts_UserId ON AskRexSavedPrompts(UserId);

-- Insert default system prompts
INSERT INTO AskRexSavedPrompts (PromptId, UserId, PromptLabel, PromptText, PromptCategory, PromptIcon, DisplayOrder, IsSystemPrompt)
VALUES
    (NEWID(), NULL, 'Find a file', 'Find me file with FileNumber ', 'file_search', 'Search', 1, 1),
    (NEWID(), NULL, 'Retrieve documents', 'Retrieve all documents on ', 'document', 'FileText', 2, 1),
    (NEWID(), NULL, 'Generate report', 'Generate a report on ', 'report', 'FileBarChart', 3, 1),
    (NEWID(), NULL, 'Pending items', 'Show me all pending items assigned to me', 'general', 'Clock', 4, 1),
    (NEWID(), NULL, 'Overdue items', 'List all overdue correspondence and contracts', 'general', 'AlertTriangle', 5, 1);

-- 7.8 AI Knowledge Base
CREATE TABLE AskRexKnowledgeBase (
    KnowledgeId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Keywords NVARCHAR(500) NULL,
    Category NVARCHAR(100) NOT NULL,
    TriggerPhrases NVARCHAR(MAX) NULL,
    SourceDocument NVARCHAR(255) NULL,
    SourceUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    Priority INT NOT NULL DEFAULT 0,
    UsageCount INT NOT NULL DEFAULT 0,
    LastUsedAt DATETIME2 NULL,
    CreatedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    UpdatedBy UNIQUEIDENTIFIER NULL REFERENCES UserProfiles(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexKnowledgeBase_Category ON AskRexKnowledgeBase(Category);
CREATE INDEX IX_AskRexKnowledgeBase_IsActive ON AskRexKnowledgeBase(IsActive);

-- Insert default knowledge entries
INSERT INTO AskRexKnowledgeBase (KnowledgeId, Title, Content, Keywords, Category, TriggerPhrases, Priority)
VALUES
    (NEWID(), 'What is SGC Digital?', 'SGC Digital is the Correspondence and Contract Management Portal for the Solicitor General''s Chambers of Barbados.', 'sgc,digital,about', 'faq', 'what is sgc,about sgc', 100),
    (NEWID(), 'How to submit correspondence', 'Navigate to the Correspondence section and click "New Submission". Fill in the required details.', 'submit,correspondence', 'procedure', 'how do i submit,submit correspondence', 90),
    (NEWID(), 'Contract submission process', 'Go to the Contracts section and select "New Contract Request". Provide contract details and upload documents.', 'contract,submit', 'procedure', 'submit contract,new contract', 90);

-- 7.9 AI Daily Analytics
CREATE TABLE AskRexDailyAnalytics (
    AnalyticsId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AnalyticsDate DATE NOT NULL UNIQUE,
    TotalSessions INT NOT NULL DEFAULT 0,
    UniqueUsers INT NOT NULL DEFAULT 0,
    AnonymousSessions INT NOT NULL DEFAULT 0,
    AvgSessionDurationSeconds INT NULL,
    TotalMessages INT NOT NULL DEFAULT 0,
    TotalUserMessages INT NOT NULL DEFAULT 0,
    TotalAssistantMessages INT NOT NULL DEFAULT 0,
    AvgMessagesPerSession DECIMAL(10,2) NULL,
    FileSearchQueries INT NOT NULL DEFAULT 0,
    DocumentRetrievalQueries INT NOT NULL DEFAULT 0,
    ReportGenerationQueries INT NOT NULL DEFAULT 0,
    GeneralQueries INT NOT NULL DEFAULT 0,
    VoiceInputCount INT NOT NULL DEFAULT 0,
    VoiceOutputCount INT NOT NULL DEFAULT 0,
    AvgResponseTimeMs INT NULL,
    TotalTokensUsed INT NOT NULL DEFAULT 0,
    TotalFeedbackReceived INT NOT NULL DEFAULT 0,
    PositiveFeedbackCount INT NOT NULL DEFAULT 0,
    NegativeFeedbackCount INT NOT NULL DEFAULT 0,
    AvgRating DECIMAL(3,2) NULL,
    SuccessfulSearches INT NOT NULL DEFAULT 0,
    FailedSearches INT NOT NULL DEFAULT 0,
    ReportsGenerated INT NOT NULL DEFAULT 0,
    ReportsExported INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AskRexDailyAnalytics_AnalyticsDate ON AskRexDailyAnalytics(AnalyticsDate);

-- =============================================
-- SECTION 8: VIEWS (008)
-- =============================================

-- 8.1 Transaction History View
CREATE VIEW vw_TransactionHistory AS
SELECT 
    'Correspondence' AS ItemType,
    c.CorrespondenceId AS ItemId,
    c.ReferenceNumber,
    c.FileNumber,
    ct.TypeName AS TypeName,
    c.Subject AS Title,
    cs.StatusName,
    cs.StatusCategory,
    p.PriorityName,
    e.OrganizationName AS RequestingOrganization,
    d.DepartmentName AS RequestingDepartment,
    c.RequestingOfficerName,
    c.RequestingOfficerEmail,
    NULL AS CounterpartyName,
    NULL AS ContractValue,
    NULL AS CurrencyCode,
    c.SubmittedAt,
    c.DueDate,
    c.CompletedAt,
    c.IsOverdue,
    u.FirstName + ' ' + u.LastName AS AssignedTo,
    c.CreatedAt,
    c.UpdatedAt
FROM CorrespondenceRegister c
INNER JOIN CorrespondenceTypes ct ON c.CorrespondenceTypeId = ct.TypeId
INNER JOIN CaseStatuses cs ON c.CaseStatusId = cs.StatusId
INNER JOIN PriorityLevels p ON c.PriorityId = p.PriorityId
LEFT JOIN Entities e ON c.RequestingEntityId = e.EntityId
LEFT JOIN Departments d ON c.RequestingDepartmentId = d.DepartmentId
LEFT JOIN UserProfiles u ON c.AssignedToUserId = u.UserId

UNION ALL

SELECT 
    'Contract' AS ItemType,
    c.ContractId AS ItemId,
    c.ReferenceNumber,
    c.FileNumber,
    ct.TypeName AS TypeName,
    c.ContractTitle AS Title,
    cs.StatusName,
    cs.StatusCategory,
    p.PriorityName,
    e.OrganizationName AS RequestingOrganization,
    d.DepartmentName AS RequestingDepartment,
    c.RequestingOfficerName,
    c.RequestingOfficerEmail,
    c.CounterpartyName,
    c.ContractValue,
    cur.CurrencyCode,
    c.SubmittedAt,
    c.DueDate,
    c.CompletedAt,
    c.IsOverdue,
    u.FirstName + ' ' + u.LastName AS AssignedTo,
    c.CreatedAt,
    c.UpdatedAt
FROM ContractsRegister c
INNER JOIN ContractTypes ct ON c.ContractTypeId = ct.TypeId
INNER JOIN CaseStatuses cs ON c.CaseStatusId = cs.StatusId
INNER JOIN PriorityLevels p ON c.PriorityId = p.PriorityId
INNER JOIN Currencies cur ON c.CurrencyId = cur.CurrencyId
LEFT JOIN Entities e ON c.RequestingEntityId = e.EntityId
LEFT JOIN Departments d ON c.RequestingDepartmentId = d.DepartmentId
LEFT JOIN UserProfiles u ON c.AssignedToUserId = u.UserId;
GO

-- 8.2 Contracts Expiring for Renewal View
CREATE VIEW vw_ContractsExpiringForRenewal AS
SELECT 
    c.ContractId,
    c.ReferenceNumber,
    c.ContractTitle,
    c.CounterpartyName,
    c.ContractValue,
    cur.CurrencyCode,
    c.ExpiryDate,
    DATEDIFF(DAY, GETDATE(), c.ExpiryDate) AS DaysUntilExpiry,
    CASE 
        WHEN DATEDIFF(DAY, GETDATE(), c.ExpiryDate) <= 30 THEN 'CRITICAL'
        WHEN DATEDIFF(DAY, GETDATE(), c.ExpiryDate) <= 60 THEN 'WARNING'
        WHEN DATEDIFF(DAY, GETDATE(), c.ExpiryDate) <= 90 THEN 'UPCOMING'
        ELSE 'OK'
    END AS ExpiryStatus,
    d.DepartmentName AS RequestingDepartment,
    cs.StatusName AS ContractStatus,
    CASE WHEN r.RenewalId IS NOT NULL THEN 1 ELSE 0 END AS HasPendingRenewal
FROM ContractsRegister c
INNER JOIN Currencies cur ON c.CurrencyId = cur.CurrencyId
LEFT JOIN Departments d ON c.RequestingDepartmentId = d.DepartmentId
INNER JOIN CaseStatuses cs ON c.CaseStatusId = cs.StatusId
LEFT JOIN ContractRenewals r ON c.ContractId = r.OriginalContractId 
    AND r.RenewalStatusId NOT IN (8, 10)
WHERE c.ExpiryDate IS NOT NULL
    AND c.ExpiryDate >= GETDATE()
    AND c.ExpiryDate <= DATEADD(MONTH, 6, GETDATE())
    AND cs.StatusCategory = 'closed';
GO

-- 8.3 Dashboard Summary View
CREATE VIEW vw_DashboardSummary AS
SELECT 
    -- Correspondence
    (SELECT COUNT(*) FROM CorrespondenceRegister) AS TotalCorrespondence,
    (SELECT COUNT(*) FROM CorrespondenceRegister WHERE StatusCategory = 'open') AS OpenCorrespondence,
    (SELECT COUNT(*) FROM CorrespondenceRegister WHERE StatusCategory = 'in_progress') AS InProgressCorrespondence,
    (SELECT COUNT(*) FROM CorrespondenceRegister WHERE StatusCategory = 'closed') AS ClosedCorrespondence,
    (SELECT COUNT(*) FROM CorrespondenceRegister WHERE IsOverdue = 1) AS OverdueCorrespondence,
    -- Contracts
    (SELECT COUNT(*) FROM ContractsRegister) AS TotalContracts,
    (SELECT COUNT(*) FROM ContractsRegister WHERE StatusCategory = 'open') AS OpenContracts,
    (SELECT COUNT(*) FROM ContractsRegister WHERE StatusCategory = 'in_progress') AS InProgressContracts,
    (SELECT COUNT(*) FROM ContractsRegister WHERE StatusCategory = 'closed') AS ClosedContracts,
    (SELECT COUNT(*) FROM ContractsRegister WHERE IsOverdue = 1) AS OverdueContracts,
    (SELECT ISNULL(SUM(ContractValue), 0) FROM ContractsRegister) AS TotalContractValue,
    -- Renewals
    (SELECT COUNT(*) FROM ContractRenewals WHERE RenewalStatusId NOT IN (8, 9, 10)) AS PendingRenewals,
    -- Users
    (SELECT COUNT(*) FROM UserProfiles WHERE StatusId = 5) AS TotalActiveUsers,
    (SELECT COUNT(*) FROM StaffRegistrationRequests WHERE StatusId = 1) AS PendingStaffRequests,
    -- SLA
    (SELECT COUNT(*) FROM SLATracking WHERE IsOverdue = 1 AND IsCompleted = 0) AS TotalOverdueItems;
GO

-- 8.4 Entity Users View
CREATE VIEW vw_EntityUsers AS
SELECT 
    e.EntityId,
    e.EntityNumber,
    e.OrganizationName,
    et.TypeName AS EntityType,
    u.UserId,
    u.FirstName + ' ' + u.LastName AS UserName,
    u.Email,
    u.Position,
    r.RoleName,
    'Primary' AS UserType,
    rs.StatusName AS UserStatus
FROM Entities e
INNER JOIN EntityTypes et ON e.EntityTypeId = et.EntityTypeId
INNER JOIN UserProfiles u ON e.EntityId = u.EntityId
INNER JOIN UserRoles r ON u.RoleId = r.RoleId
INNER JOIN RequestStatuses rs ON u.StatusId = rs.StatusId

UNION ALL

SELECT 
    e.EntityId,
    e.EntityNumber,
    e.OrganizationName,
    et.TypeName AS EntityType,
    eau.UserId,
    eau.FirstName + ' ' + eau.LastName AS UserName,
    eau.Email,
    eau.Position,
    'Authorized User' AS RoleName,
    'Authorized' AS UserType,
    rs.StatusName AS UserStatus
FROM Entities e
INNER JOIN EntityTypes et ON e.EntityTypeId = et.EntityTypeId
INNER JOIN EntityAuthorizedUsers eau ON e.EntityId = eau.EntityId
INNER JOIN RequestStatuses rs ON eau.StatusId = rs.StatusId;
GO

PRINT '============================================='
PRINT 'SGC Digital Database Schema Created Successfully'
PRINT 'Total Tables: 60+'
PRINT 'Total Views: 4'
PRINT '============================================='
GO
