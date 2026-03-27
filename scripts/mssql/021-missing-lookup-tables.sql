-- =============================================
-- SGC Digital - Missing Lookup Tables
-- Script: 021-missing-lookup-tables.sql
-- Purpose: Additional lookup tables for dropdowns/filters across the application
-- =============================================

USE SGC_Digital;
GO

-- =============================================
-- 1. LEGAL OFFICERS (Staff who can be assigned cases)
-- Used in: Case assignment dropdowns
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupLegalOfficers')
CREATE TABLE LookupLegalOfficers (
    OfficerId INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    OfficerCode NVARCHAR(20) NOT NULL UNIQUE,
    DisplayName NVARCHAR(150) NOT NULL,
    Title NVARCHAR(50) NULL, -- e.g., 'Legal Officer', 'Senior Legal Officer'
    Specializations NVARCHAR(500) NULL, -- e.g., 'Contracts,Litigation'
    CanHandleContracts BIT NOT NULL DEFAULT 1,
    CanHandleCorrespondence BIT NOT NULL DEFAULT 1,
    MaxCaseload INT NOT NULL DEFAULT 25,
    CurrentCaseload INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 100,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Insert sample legal officers
INSERT INTO LookupLegalOfficers (UserId, OfficerCode, DisplayName, Title, Specializations, MaxCaseload) VALUES
('LO001', 'LO-001', 'Jennifer Adams', 'Senior Legal Officer', 'Contracts,Procurement', 30),
('LO002', 'LO-002', 'Michael Thompson', 'Legal Officer', 'Contracts,Works', 25),
('LO003', 'LO-003', 'Sandra Williams', 'Legal Officer', 'Correspondence,Litigation', 25),
('LO004', 'LO-004', 'Richard Clarke', 'Senior Legal Officer', 'Litigation,Advisory', 30),
('LO005', 'LO-005', 'Patricia Johnson', 'Legal Officer', 'Consultancy,International', 25),
('DSG001', 'DSG-001', 'David Smith', 'Deputy Solicitor General', 'All', 15),
('SG001', 'SG-001', 'Angela Holder', 'Solicitor General', 'All', 10);
GO

-- =============================================
-- 2. COURTS LIST
-- Used in: Registration, Correspondence (litigation matters)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupCourts')
CREATE TABLE LookupCourts (
    CourtId INT IDENTITY(1,1) PRIMARY KEY,
    CourtCode NVARCHAR(20) NOT NULL UNIQUE,
    CourtName NVARCHAR(200) NOT NULL,
    CourtType NVARCHAR(50) NOT NULL, -- 'Superior', 'Magistrates', 'Tribunal', 'Regional'
    Address NVARCHAR(500) NULL,
    ContactEmail NVARCHAR(150) NULL,
    ContactPhone NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupCourts (CourtCode, CourtName, CourtType, SortOrder) VALUES
('SC', 'Supreme Court of Barbados', 'Superior', 1),
('HC', 'High Court', 'Superior', 2),
('CA', 'Court of Appeal', 'Superior', 3),
('CCJ', 'Caribbean Court of Justice', 'Regional', 4),
('MAG-BST', 'Magistrates Court - Bridgetown', 'Magistrates', 10),
('MAG-OIS', 'Magistrates Court - Oistins', 'Magistrates', 11),
('MAG-HOL', 'Magistrates Court - Holetown', 'Magistrates', 12),
('MAG-SPT', 'Magistrates Court - Speightstown', 'Magistrates', 13),
('FC', 'Family Court', 'Specialized', 20),
('TT', 'Traffic Court', 'Specialized', 21),
('CORONER', 'Coroner''s Court', 'Specialized', 22),
('EAT', 'Employment Appeal Tribunal', 'Tribunal', 30),
('TAX', 'Tax Appeal Tribunal', 'Tribunal', 31),
('FTC', 'Fair Trading Commission Tribunal', 'Tribunal', 32);
GO

-- =============================================
-- 3. STATUTORY BODIES
-- Used in: Registration (entity type = statutory)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupStatutoryBodies')
CREATE TABLE LookupStatutoryBodies (
    StatutoryBodyId INT IDENTITY(1,1) PRIMARY KEY,
    BodyCode NVARCHAR(20) NOT NULL UNIQUE,
    BodyName NVARCHAR(250) NOT NULL,
    EstablishingAct NVARCHAR(250) NULL,
    ParentMinistry NVARCHAR(150) NULL,
    ContactEmail NVARCHAR(150) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupStatutoryBodies (BodyCode, BodyName, ParentMinistry, SortOrder) VALUES
('BTA', 'Barbados Tourism Authority', 'Ministry of Tourism', 1),
('BRA', 'Barbados Revenue Authority', 'Ministry of Finance', 2),
('BWA', 'Barbados Water Authority', 'Ministry of Energy', 3),
('CBC', 'Central Bank of Barbados', 'Ministry of Finance', 4),
('FTC', 'Fair Trading Commission', 'Ministry of Commerce', 5),
('FSC', 'Financial Services Commission', 'Ministry of Finance', 6),
('NIS', 'National Insurance Board', 'Ministry of Labour', 7),
('NHC', 'National Housing Corporation', 'Ministry of Housing', 8),
('UWI', 'University of the West Indies - Cave Hill', 'Ministry of Education', 9),
('BCC', 'Barbados Community College', 'Ministry of Education', 10),
('QEH', 'Queen Elizabeth Hospital', 'Ministry of Health', 11),
('GAIA', 'Grantley Adams International Airport Inc.', 'Ministry of Transport', 12),
('BPI', 'Barbados Port Inc.', 'Ministry of Maritime Affairs', 13),
('BNB', 'Barbados National Bank', 'Ministry of Finance', 14),
('BIDC', 'Barbados Investment and Development Corporation', 'Ministry of Business', 15),
('SSA', 'Sanitation Service Authority', 'Ministry of Environment', 16),
('TCB', 'Town and Country Development Planning Office', 'Ministry of Housing', 17),
('SJPP', 'Samuel Jackman Prescod Polytechnic', 'Ministry of Education', 18),
('NCC', 'National Conservation Commission', 'Ministry of Environment', 19),
('RBPF', 'Royal Barbados Police Force', 'Ministry of Home Affairs', 20);
GO

-- =============================================
-- 4. PARISHES/DISTRICTS
-- Used in: Address fields throughout the application
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupParishes')
CREATE TABLE LookupParishes (
    ParishId INT IDENTITY(1,1) PRIMARY KEY,
    ParishCode NVARCHAR(10) NOT NULL UNIQUE,
    ParishName NVARCHAR(100) NOT NULL,
    ParishType NVARCHAR(20) NOT NULL DEFAULT 'Parish', -- 'Parish', 'City'
    IsDefault BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupParishes (ParishCode, ParishName, ParishType, SortOrder) VALUES
('SC', 'St. Michael', 'Parish', 1),
('CH', 'Christ Church', 'Parish', 2),
('JA', 'St. James', 'Parish', 3),
('PH', 'St. Philip', 'Parish', 4),
('GE', 'St. George', 'Parish', 5),
('JO', 'St. John', 'Parish', 6),
('TH', 'St. Thomas', 'Parish', 7),
('JE', 'St. Joseph', 'Parish', 8),
('AN', 'St. Andrew', 'Parish', 9),
('PE', 'St. Peter', 'Parish', 10),
('LU', 'St. Lucy', 'Parish', 11),
('BGT', 'Bridgetown', 'City', 12);
GO

-- =============================================
-- 5. RETURN TO MDA REASONS (Correction/Return reasons)
-- Used in: Case management when returning to MDA
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupReturnReasons')
CREATE TABLE LookupReturnReasons (
    ReasonId INT IDENTITY(1,1) PRIMARY KEY,
    ReasonCode NVARCHAR(30) NOT NULL UNIQUE,
    ReasonName NVARCHAR(150) NOT NULL,
    ReasonDescription NVARCHAR(500) NULL,
    AppliesTo NVARCHAR(50) NOT NULL DEFAULT 'Both', -- 'Contracts', 'Correspondence', 'Both'
    DefaultDeadlineDays INT NOT NULL DEFAULT 7,
    RequiresComment BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupReturnReasons (ReasonCode, ReasonName, ReasonDescription, AppliesTo, DefaultDeadlineDays) VALUES
('MISSING_DOCS', 'Missing Documents', 'Required documents are missing from the submission', 'Both', 7),
('CLARIFICATION', 'Clarification Required', 'Clarification is required from the Ministry/MDA', 'Both', 5),
('INCORRECT_TEMPLATE', 'Incorrect Template', 'Incorrect contract template or form was used', 'Contracts', 7),
('POLICY_APPROVAL', 'Policy Approval Missing', 'Policy, Cabinet, or CPO approval is missing', 'Contracts', 10),
('VALUE_DISCREPANCY', 'Value Discrepancy', 'Contract values do not match supporting documents', 'Contracts', 5),
('SCOPE_UNCLEAR', 'Scope Unclear', 'The scope of work or terms require clarification', 'Both', 7),
('SIGNATURE_MISSING', 'Signature Missing', 'Required signatures are missing', 'Both', 5),
('EXPIRED_DOCS', 'Expired Documents', 'Supporting documents have expired', 'Both', 7),
('INCOMPLETE_FORM', 'Incomplete Form', 'Form fields are incomplete or incorrect', 'Both', 5),
('LEGAL_CONCERNS', 'Legal Concerns', 'Legal issues require Ministry attention', 'Both', 10),
('PROCUREMENT_ISSUES', 'Procurement Issues', 'Procurement documentation is incomplete', 'Contracts', 7),
('OTHER', 'Other', 'Other reason (specify in comments)', 'Both', 7);
GO

-- =============================================
-- 6. INTAKE VALIDATION STATUS
-- Used in: Contract intake process
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupIntakeValidationStatus')
CREATE TABLE LookupIntakeValidationStatus (
    StatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(30) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    StatusDescription NVARCHAR(300) NULL,
    IsTerminal BIT NOT NULL DEFAULT 0,
    AllowsProgress BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupIntakeValidationStatus (StatusCode, StatusName, StatusDescription, AllowsProgress, IsTerminal, SortOrder) VALUES
('PENDING', 'Pending Validation', 'Awaiting intake validation review', 1, 0, 1),
('VALIDATED', 'Validated', 'Intake validated; mandatory documents satisfied', 1, 0, 2),
('MISSING_DOCS', 'Missing Documents', 'Mandatory documents missing; requires follow-up', 1, 0, 3),
('RETURNED_MDA', 'Returned to MDA', 'Returned to Ministry/MDA for additional information', 1, 0, 4),
('REJECTED', 'Rejected', 'Rejected at intake', 0, 1, 5);
GO

-- =============================================
-- 7. DOCUMENT CHECKLIST STATUS
-- Used in: Mandatory documents verification
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupDocumentChecklistStatus')
CREATE TABLE LookupDocumentChecklistStatus (
    StatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(30) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    StatusDescription NVARCHAR(300) NULL,
    CSSClass NVARCHAR(50) NULL,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupDocumentChecklistStatus (StatusCode, StatusName, StatusDescription, CSSClass, SortOrder) VALUES
('NOT_PROVIDED', 'Not Provided', 'Document has not been provided', 'text-red-600', 1),
('PROVIDED', 'Provided', 'Document has been provided', 'text-green-600', 2),
('UNDER_REVIEW', 'Under Review', 'Document is being reviewed', 'text-yellow-600', 3),
('APPROVED', 'Approved', 'Document has been approved', 'text-green-700', 4),
('REJECTED', 'Rejected', 'Document was rejected', 'text-red-700', 5),
('WAIVED', 'Waived', 'Document requirement waived by DSG/SG', 'text-blue-600', 6),
('N_A', 'Not Applicable', 'Document not required for this case', 'text-gray-500', 7);
GO

-- =============================================
-- 8. REGISTRY FILE ASSOCIATION STATUS
-- Used in: Linking to legacy registry files
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupRegistryFileStatus')
CREATE TABLE LookupRegistryFileStatus (
    StatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(30) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    StatusDescription NVARCHAR(300) NULL,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupRegistryFileStatus (StatusCode, StatusName, StatusDescription, SortOrder) VALUES
('NOT_STARTED', 'Not Started', 'Registry file association task not yet commenced', 1),
('IN_PROGRESS', 'In Progress', 'Searching/scanning legacy files', 2),
('LINKED', 'Linked', 'Legacy file(s) linked to case', 3),
('NO_FILE', 'No File Found', 'No prior file found / new matter', 4),
('COMPLETED', 'Completed', 'Task completed and verified', 5);
GO

-- =============================================
-- 9. SECURITY/CONFIDENTIALITY LEVELS
-- Used in: Document and case access control
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupSecurityLevels')
CREATE TABLE LookupSecurityLevels (
    LevelId INT IDENTITY(1,1) PRIMARY KEY,
    LevelCode NVARCHAR(20) NOT NULL UNIQUE,
    LevelName NVARCHAR(100) NOT NULL,
    LevelDescription NVARCHAR(300) NULL,
    AccessRestrictions NVARCHAR(500) NULL,
    RequiresApproval BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupSecurityLevels (LevelCode, LevelName, LevelDescription, AccessRestrictions, RequiresApproval, SortOrder) VALUES
('PUBLIC', 'Public', 'May be disclosed publicly', 'None', 0, 1),
('INTERNAL', 'Internal', 'Internal government use only; not public', 'Staff only', 0, 2),
('CONFIDENTIAL', 'Confidential', 'Confidential; restricted access', 'Assigned staff and supervisors', 0, 3),
('LEGAL_PRIV', 'Legal Privileged', 'Attorney-client / litigation privilege', 'Legal officers only', 1, 4),
('CABINET', 'Cabinet Level', 'Cabinet-level restricted', 'SG/DSG and designated staff', 1, 5);
GO

-- =============================================
-- 10. SUBMISSION CHANNELS
-- Used in: How submissions are received
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupSubmissionChannels')
CREATE TABLE LookupSubmissionChannels (
    ChannelId INT IDENTITY(1,1) PRIMARY KEY,
    ChannelCode NVARCHAR(20) NOT NULL UNIQUE,
    ChannelName NVARCHAR(100) NOT NULL,
    ChannelDescription NVARCHAR(300) NULL,
    RequiresScan BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupSubmissionChannels (ChannelCode, ChannelName, ChannelDescription, RequiresScan, SortOrder) VALUES
('PORTAL', 'Online Portal', 'Submitted via SGC Digital portal', 0, 1),
('EMAIL', 'Email', 'Submitted via email', 0, 2),
('PAPER', 'Paper/In-Person', 'Paper submission/scanned at intake', 1, 3),
('FAX', 'Fax', 'Received via fax', 1, 4),
('COURIER', 'Courier/Mail', 'Received via courier or postal mail', 1, 5);
GO

-- =============================================
-- 11. DISPATCH MODES
-- Used in: How outgoing correspondence/contracts are sent
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupDispatchModes')
CREATE TABLE LookupDispatchModes (
    ModeId INT IDENTITY(1,1) PRIMARY KEY,
    ModeCode NVARCHAR(20) NOT NULL UNIQUE,
    ModeName NVARCHAR(100) NOT NULL,
    ModeDescription NVARCHAR(300) NULL,
    RequiresTracking BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupDispatchModes (ModeCode, ModeName, ModeDescription, RequiresTracking, SortOrder) VALUES
('DIGITAL', 'Digital (Email/Portal)', 'Dispatched electronically via email or portal', 0, 1),
('PHYSICAL', 'Physical (Paper)', 'Dispatched as paper original/copy via courier or hand-delivery', 1, 2),
('BOTH', 'Both Digital & Physical', 'Dispatched both electronically and in paper form', 1, 3),
('REGISTERED', 'Registered Mail', 'Dispatched via registered post', 1, 4),
('HAND_DELIVERY', 'Hand Delivery', 'Hand-delivered with signed receipt', 1, 5);
GO

-- =============================================
-- 12. DOCUMENT STATUS (Document lifecycle)
-- Used in: Document management throughout the system
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupDocumentStatus')
CREATE TABLE LookupDocumentStatus (
    StatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(30) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    StatusDescription NVARCHAR(300) NULL,
    IsEditable BIT NOT NULL DEFAULT 1,
    IsTerminal BIT NOT NULL DEFAULT 0,
    CSSClass NVARCHAR(50) NULL,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupDocumentStatus (StatusCode, StatusName, StatusDescription, IsEditable, IsTerminal, CSSClass, SortOrder) VALUES
('DRAFT', 'Draft', 'Working draft document', 1, 0, 'bg-gray-100 text-gray-800', 1),
('FOR_REVIEW', 'For Review', 'Submitted for review/comment', 0, 0, 'bg-yellow-100 text-yellow-800', 2),
('REVIEWED', 'Reviewed', 'Review completed with comments', 0, 0, 'bg-blue-100 text-blue-800', 3),
('APPROVED', 'Approved', 'Approved by reviewer', 0, 0, 'bg-green-100 text-green-800', 4),
('FINAL', 'Final', 'Finalised but not yet signed', 0, 0, 'bg-indigo-100 text-indigo-800', 5),
('SIGNED', 'Signed/Executed', 'Signed by authorized signatories', 0, 0, 'bg-purple-100 text-purple-800', 6),
('ADJUDICATED', 'Adjudicated', 'Stamped by Supreme Court Registration Dept', 0, 0, 'bg-teal-100 text-teal-800', 7),
('SCANNED', 'Scanned Copy', 'Digital scan of a physical document', 0, 0, 'bg-gray-100 text-gray-800', 8),
('SUPERSEDED', 'Superseded', 'Replaced by a later version', 0, 1, 'bg-orange-100 text-orange-800', 9),
('CANCELLED', 'Cancelled/Void', 'Cancelled or declared void', 0, 1, 'bg-red-100 text-red-800', 10);
GO

-- =============================================
-- 13. APPROVAL DECISIONS
-- Used in: SG/DSG decision tracking
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupApprovalDecisions')
CREATE TABLE LookupApprovalDecisions (
    DecisionId INT IDENTITY(1,1) PRIMARY KEY,
    DecisionCode NVARCHAR(30) NOT NULL UNIQUE,
    DecisionName NVARCHAR(100) NOT NULL,
    DecisionDescription NVARCHAR(300) NULL,
    RequiresComment BIT NOT NULL DEFAULT 0,
    IsPositive BIT NOT NULL DEFAULT 0,
    NextAction NVARCHAR(100) NULL,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupApprovalDecisions (DecisionCode, DecisionName, DecisionDescription, RequiresComment, IsPositive, NextAction, SortOrder) VALUES
('APPROVED', 'Approved', 'Approved for next stage', 0, 1, 'Proceed to next workflow stage', 1),
('APPROVED_COND', 'Approved with Conditions', 'Approved subject to conditions', 1, 1, 'Proceed with noted conditions', 2),
('RETURNED_OFFICER', 'Returned for Correction', 'Returned to Legal Officer for corrections', 1, 0, 'Legal Officer to address comments', 3),
('RETURNED_MDA', 'Returned to MDA', 'Returned to Ministry/MDA for additional info', 1, 0, 'Await MDA response', 4),
('ESCALATED', 'Escalated', 'Escalated to SG for decision', 1, 0, 'Await SG decision', 5),
('DEFERRED', 'Deferred', 'Decision deferred pending additional info', 1, 0, 'Await additional information', 6),
('REJECTED', 'Rejected', 'Application rejected/terminated', 1, 0, 'Close case', 7);
GO

-- =============================================
-- 14. CONTRACTING PARTY SCOPE
-- Used in: Contract classification (local/regional/international)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupContractingPartyScope')
CREATE TABLE LookupContractingPartyScope (
    ScopeId INT IDENTITY(1,1) PRIMARY KEY,
    ScopeCode NVARCHAR(20) NOT NULL UNIQUE,
    ScopeName NVARCHAR(100) NOT NULL,
    ScopeDescription NVARCHAR(300) NULL,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupContractingPartyScope (ScopeCode, ScopeName, ScopeDescription, SortOrder) VALUES
('LOCAL', 'Local', 'All parties domiciled/registered in Barbados', 1),
('REGIONAL', 'Regional', 'At least one party from CARICOM/Caribbean region', 2),
('INTERNATIONAL', 'International', 'At least one party is international (outside region)', 3);
GO

-- =============================================
-- 15. COMPANY REGISTRATION TYPES
-- Used in: Entity registration
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupCompanyTypes')
CREATE TABLE LookupCompanyTypes (
    TypeId INT IDENTITY(1,1) PRIMARY KEY,
    TypeCode NVARCHAR(20) NOT NULL UNIQUE,
    TypeName NVARCHAR(100) NOT NULL,
    TypeDescription NVARCHAR(300) NULL,
    RequiresRegistrationNumber BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupCompanyTypes (TypeCode, TypeName, TypeDescription, RequiresRegistrationNumber, SortOrder) VALUES
('LTD', 'Limited Company', 'Private limited company', 1, 1),
('PLC', 'Public Limited Company', 'Public limited company', 1, 2),
('SOLE', 'Sole Trader', 'Sole proprietorship', 0, 3),
('PARTNERSHIP', 'Partnership', 'General or limited partnership', 1, 4),
('JV', 'Joint Venture', 'Joint venture entity', 0, 5),
('IBC', 'International Business Company', 'Offshore/international business company', 1, 6),
('LLC', 'Limited Liability Company', 'LLC structure', 1, 7),
('COOP', 'Cooperative', 'Cooperative society', 1, 8),
('NGO', 'Non-Profit/NGO', 'Non-profit organization', 1, 9),
('GOVT', 'Government Entity', 'Government-owned entity', 0, 10);
GO

-- =============================================
-- 16. TITLE/SALUTATION
-- Used in: Name fields for individuals
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LookupTitles')
CREATE TABLE LookupTitles (
    TitleId INT IDENTITY(1,1) PRIMARY KEY,
    TitleCode NVARCHAR(10) NOT NULL UNIQUE,
    TitleName NVARCHAR(50) NOT NULL,
    Gender NVARCHAR(10) NULL, -- 'M', 'F', NULL for neutral
    SortOrder INT NOT NULL DEFAULT 100
);
GO

INSERT INTO LookupTitles (TitleCode, TitleName, Gender, SortOrder) VALUES
('MR', 'Mr.', 'M', 1),
('MRS', 'Mrs.', 'F', 2),
('MS', 'Ms.', 'F', 3),
('MISS', 'Miss', 'F', 4),
('DR', 'Dr.', NULL, 5),
('PROF', 'Prof.', NULL, 6),
('HON', 'Hon.', NULL, 7),
('REV', 'Rev.', NULL, 8),
('SIR', 'Sir', 'M', 9),
('LADY', 'Lady', 'F', 10),
('QC', 'QC', NULL, 11);
GO

-- =============================================
-- VIEWS FOR COMMON LOOKUPS
-- =============================================

-- Active Legal Officers for assignment dropdown
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ActiveLegalOfficers')
    DROP VIEW vw_ActiveLegalOfficers;
GO

CREATE VIEW vw_ActiveLegalOfficers AS
SELECT 
    OfficerId,
    OfficerCode,
    DisplayName,
    Title,
    Specializations,
    MaxCaseload,
    CurrentCaseload,
    (MaxCaseload - CurrentCaseload) AS AvailableCapacity
FROM LookupLegalOfficers
WHERE IsActive = 1
    AND CurrentCaseload < MaxCaseload;
GO

-- All MDAs with parent ministry info
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_AllMDAs')
    DROP VIEW vw_AllMDAs;
GO

CREATE VIEW vw_AllMDAs AS
SELECT 
    'MINISTRY' AS EntityType,
    DepartmentId AS EntityId,
    DepartmentCode AS EntityCode,
    DepartmentName AS EntityName,
    Ministry AS ParentMinistry,
    IsActive,
    SortOrder
FROM LookupDepartments
WHERE Ministry IS NULL OR Ministry = DepartmentName

UNION ALL

SELECT 
    'DEPT_AGENCY' AS EntityType,
    DepartmentId AS EntityId,
    DepartmentCode AS EntityCode,
    DepartmentName AS EntityName,
    Ministry AS ParentMinistry,
    IsActive,
    SortOrder + 1000 AS SortOrder
FROM LookupDepartments
WHERE Ministry IS NOT NULL AND Ministry <> DepartmentName

UNION ALL

SELECT 
    'STATUTORY' AS EntityType,
    StatutoryBodyId AS EntityId,
    BodyCode AS EntityCode,
    BodyName AS EntityName,
    ParentMinistry,
    IsActive,
    SortOrder + 2000 AS SortOrder
FROM LookupStatutoryBodies;
GO

PRINT 'Missing Lookup Tables created successfully';
GO
