-- =============================================
-- SGC Digital - Comprehensive Entity & Reporting Schema
-- MS SQL Server Schema
-- Due Diligence: Complete Application Coverage
-- =============================================

-- =============================================
-- PART 1: ENTITY/ORGANIZATION MASTER TABLE
-- This is the MAIN entity table that users belong to
-- Multiple users can belong to ONE entity
-- =============================================

CREATE TABLE dbo.Entities (
    EntityId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EntityNumber NVARCHAR(50) NOT NULL UNIQUE, -- e.g., MDA-MOF-001, COM-2024-001, PUB-2024-001
    
    -- Entity Type
    EntityTypeId INT NOT NULL REFERENCES dbo.LookupEntityTypes(EntityTypeId),
    
    -- Basic Information
    OrganizationName NVARCHAR(200) NOT NULL, -- Company name, Ministry name, or "N/A" for individuals
    DisplayName NVARCHAR(200) NOT NULL, -- Name to display in UI
    
    -- Registration Details (for companies)
    RegistrationNumber NVARCHAR(100) NULL, -- Business registration number
    TaxId NVARCHAR(100) NULL, -- Tax identification number
    TradingName NVARCHAR(200) NULL,
    CompanyType NVARCHAR(100) NULL, -- Limited, Partnership, Sole Proprietor, etc.
    IncorporationDate DATE NULL,
    
    -- For Government Entities (MDA, Court, Statutory Body)
    DepartmentId INT NULL REFERENCES dbo.LookupDepartments(DepartmentId),
    Ministry NVARCHAR(200) NULL,
    
    -- For Attorneys
    BarNumber NVARCHAR(50) NULL,
    LawFirm NVARCHAR(200) NULL,
    
    -- For Courts
    CourtName NVARCHAR(200) NULL,
    CourtType NVARCHAR(100) NULL,
    
    -- Primary Contact (Entity Admin)
    PrimaryContactFirstName NVARCHAR(100) NOT NULL,
    PrimaryContactLastName NVARCHAR(100) NOT NULL,
    PrimaryContactEmail NVARCHAR(255) NOT NULL,
    PrimaryContactPhone NVARCHAR(50) NULL,
    PrimaryContactPosition NVARCHAR(100) NULL,
    
    -- Address
    AddressLine1 NVARCHAR(200) NULL,
    AddressLine2 NVARCHAR(200) NULL,
    City NVARCHAR(100) NULL DEFAULT 'Bridgetown',
    Parish NVARCHAR(100) NULL,
    Country NVARCHAR(100) NOT NULL DEFAULT 'Barbados',
    PostalCode NVARCHAR(20) NULL,
    
    -- Status
    StatusId INT NOT NULL REFERENCES dbo.LookupRequestStatus(StatusId),
    
    -- Verification
    IsVerified BIT NOT NULL DEFAULT 0,
    VerifiedAt DATETIME2 NULL,
    VerifiedBy UNIQUEIDENTIFIER NULL,
    VerificationNotes NVARCHAR(MAX) NULL,
    
    -- Documents Verification
    DocumentsSubmitted BIT NOT NULL DEFAULT 0,
    DocumentsVerified BIT NOT NULL DEFAULT 0,
    DocumentsVerifiedAt DATETIME2 NULL,
    DocumentsVerifiedBy UNIQUEIDENTIFIER NULL,
    
    -- Can have multiple users?
    AllowsMultipleUsers BIT NOT NULL DEFAULT 0,
    MaxAuthorizedUsers INT NULL DEFAULT 5,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL
);

-- =============================================
-- PART 2: LINK USERS TO ENTITIES
-- Many users can belong to one entity
-- =============================================

-- Add EntityId to UserProfiles if not exists
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UserProfiles' AND COLUMN_NAME = 'EntityId')
BEGIN
    ALTER TABLE dbo.UserProfiles ADD EntityId UNIQUEIDENTIFIER NULL;
    ALTER TABLE dbo.UserProfiles ADD CONSTRAINT FK_UserProfiles_EntityId FOREIGN KEY (EntityId) REFERENCES dbo.Entities(EntityId);
END
GO

-- Authorized Users per Entity (for invite/approval flow)
CREATE TABLE dbo.EntityAuthorizedUsers (
    AuthorizedUserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Link to Entity
    EntityId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.Entities(EntityId),
    
    -- Authorized Person Info
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NULL,
    Position NVARCHAR(100) NULL,
    
    -- Permissions
    CanSubmitCorrespondence BIT NOT NULL DEFAULT 1,
    CanSubmitContracts BIT NOT NULL DEFAULT 1,
    CanViewAllSubmissions BIT NOT NULL DEFAULT 1,
    CanEditSubmissions BIT NOT NULL DEFAULT 0,
    CanManageUsers BIT NOT NULL DEFAULT 0, -- Entity admin
    CanReceiveNotifications BIT NOT NULL DEFAULT 1,
    
    -- Invitation Status
    InvitedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    InvitedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    InvitationToken NVARCHAR(255) NULL,
    InvitationExpiry DATETIME2 NULL,
    InvitationAcceptedAt DATETIME2 NULL,
    
    -- Status
    StatusId INT NOT NULL REFERENCES dbo.LookupRequestStatus(StatusId),
    
    -- If they register, link to their user profile
    LinkedUserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_EntityAuthorizedUsers_Email UNIQUE (EntityId, Email)
);

-- =============================================
-- PART 3: ENTITY DOCUMENTS (Supporting documents for verification)
-- =============================================

CREATE TABLE dbo.EntityDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EntityId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.Entities(EntityId),
    
    DocumentType NVARCHAR(100) NOT NULL, -- 'REGISTRATION_CERT', 'TAX_CERT', 'BAR_CERT', 'ID_PROOF', 'LETTER_OF_AUTHORIZATION'
    DocumentName NVARCHAR(255) NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(100) NOT NULL,
    FileSize BIGINT NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    
    -- Verification
    IsVerified BIT NOT NULL DEFAULT 0,
    VerifiedAt DATETIME2 NULL,
    VerifiedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    VerificationNotes NVARCHAR(MAX) NULL,
    
    -- Expiry (for certificates)
    ExpiryDate DATE NULL,
    
    -- Audit
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- PART 4: COMPREHENSIVE REPORTING TABLES
-- =============================================

-- Report Definitions (what reports are available)
CREATE TABLE dbo.ReportDefinitions (
    ReportId INT IDENTITY(1,1) PRIMARY KEY,
    ReportCode NVARCHAR(50) NOT NULL UNIQUE,
    ReportName NVARCHAR(200) NOT NULL,
    ReportDescription NVARCHAR(500) NULL,
    ReportCategory NVARCHAR(100) NOT NULL, -- 'CORRESPONDENCE', 'CONTRACTS', 'USERS', 'RENEWALS', 'PERFORMANCE', 'FINANCIAL'
    
    -- Access Control
    RequiredRoleLevel INT NOT NULL DEFAULT 5, -- Minimum role level to access (5=Staff, 6=Supervisor, 7=Admin)
    IsPublic BIT NOT NULL DEFAULT 0, -- Can external users see this?
    
    -- Report Configuration
    DefaultDateRange NVARCHAR(20) NULL DEFAULT 'LAST_30', -- 'TODAY', 'LAST_7', 'LAST_30', 'LAST_90', 'YTD', 'ALL'
    SupportsExport BIT NOT NULL DEFAULT 1,
    ExportFormats NVARCHAR(100) NULL DEFAULT 'PDF,EXCEL,CSV',
    
    -- SQL/View Reference
    DataSource NVARCHAR(200) NULL, -- View or stored procedure name
    
    -- Display Order
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Report Execution Log (audit trail of report generation)
CREATE TABLE dbo.ReportExecutionLog (
    ExecutionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReportId INT NOT NULL REFERENCES dbo.ReportDefinitions(ReportId),
    
    -- Who ran it
    ExecutedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    ExecutedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Parameters used
    DateRangeStart DATE NULL,
    DateRangeEnd DATE NULL,
    FilterDepartmentId INT NULL,
    FilterEntityTypeId INT NULL,
    FilterStatusId INT NULL,
    AdditionalFilters NVARCHAR(MAX) NULL, -- JSON
    
    -- Results
    RecordCount INT NULL,
    ExecutionTimeMs INT NULL,
    
    -- Export
    ExportFormat NVARCHAR(20) NULL,
    ExportFilePath NVARCHAR(500) NULL,
    
    -- Audit
    IPAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL
);

-- Scheduled Reports (for automatic report generation)
CREATE TABLE dbo.ScheduledReports (
    ScheduleId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReportId INT NOT NULL REFERENCES dbo.ReportDefinitions(ReportId),
    
    -- Schedule
    ScheduleName NVARCHAR(200) NOT NULL,
    Frequency NVARCHAR(50) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'
    DayOfWeek INT NULL, -- 0-6 for weekly
    DayOfMonth INT NULL, -- 1-31 for monthly
    TimeOfDay TIME NOT NULL DEFAULT '08:00:00',
    
    -- Parameters
    DateRangeType NVARCHAR(20) NOT NULL DEFAULT 'LAST_PERIOD', -- 'LAST_PERIOD', 'CUSTOM'
    FilterDepartmentId INT NULL,
    FilterEntityTypeId INT NULL,
    FilterStatusId INT NULL,
    AdditionalFilters NVARCHAR(MAX) NULL,
    
    -- Recipients
    EmailRecipients NVARCHAR(MAX) NOT NULL, -- JSON array of emails
    ExportFormat NVARCHAR(20) NOT NULL DEFAULT 'PDF',
    
    -- Status
    IsActive BIT NOT NULL DEFAULT 1,
    LastRunAt DATETIME2 NULL,
    LastRunStatus NVARCHAR(50) NULL,
    NextRunAt DATETIME2 NULL,
    
    -- Audit
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- PART 5: PERFORMANCE METRICS TABLES
-- =============================================

-- Daily Aggregated Metrics (for performance tracking)
CREATE TABLE dbo.DailyMetrics (
    MetricId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MetricDate DATE NOT NULL,
    
    -- Correspondence Metrics
    CorrespondenceSubmitted INT NOT NULL DEFAULT 0,
    CorrespondenceCompleted INT NOT NULL DEFAULT 0,
    CorrespondenceOverdue INT NOT NULL DEFAULT 0,
    CorrespondenceAvgDaysToComplete DECIMAL(10,2) NULL,
    
    -- Contract Metrics
    ContractsSubmitted INT NOT NULL DEFAULT 0,
    ContractsCompleted INT NOT NULL DEFAULT 0,
    ContractsOverdue INT NOT NULL DEFAULT 0,
    ContractsAvgDaysToComplete DECIMAL(10,2) NULL,
    ContractsTotalValue DECIMAL(18,2) NULL,
    
    -- Renewal Metrics
    RenewalsSubmitted INT NOT NULL DEFAULT 0,
    RenewalsCompleted INT NOT NULL DEFAULT 0,
    RenewalsApproved INT NOT NULL DEFAULT 0,
    RenewalsRejected INT NOT NULL DEFAULT 0,
    
    -- User Metrics
    NewRegistrations INT NOT NULL DEFAULT 0,
    ActiveUsers INT NOT NULL DEFAULT 0,
    StaffRequests INT NOT NULL DEFAULT 0,
    
    -- SLA Metrics
    SLAComplianceRate DECIMAL(5,2) NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_DailyMetrics_Date UNIQUE (MetricDate)
);

-- Department Performance Metrics
CREATE TABLE dbo.DepartmentMetrics (
    MetricId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    DepartmentId INT NOT NULL REFERENCES dbo.LookupDepartments(DepartmentId),
    MetricPeriod NVARCHAR(20) NOT NULL, -- 'MONTHLY', 'QUARTERLY', 'YEARLY'
    PeriodStart DATE NOT NULL,
    PeriodEnd DATE NOT NULL,
    
    -- Submissions
    TotalSubmissions INT NOT NULL DEFAULT 0,
    CorrespondenceCount INT NOT NULL DEFAULT 0,
    ContractsCount INT NOT NULL DEFAULT 0,
    
    -- Processing
    AvgProcessingDays DECIMAL(10,2) NULL,
    OnTimeCompletionRate DECIMAL(5,2) NULL,
    
    -- Contract Values
    TotalContractValue DECIMAL(18,2) NULL,
    AvgContractValue DECIMAL(18,2) NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_DepartmentMetrics_Period UNIQUE (DepartmentId, MetricPeriod, PeriodStart)
);

-- Staff Performance Metrics
CREATE TABLE dbo.StaffMetrics (
    MetricId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    MetricPeriod NVARCHAR(20) NOT NULL,
    PeriodStart DATE NOT NULL,
    PeriodEnd DATE NOT NULL,
    
    -- Workload
    CasesAssigned INT NOT NULL DEFAULT 0,
    CasesCompleted INT NOT NULL DEFAULT 0,
    CasesOverdue INT NOT NULL DEFAULT 0,
    
    -- Performance
    AvgDaysToComplete DECIMAL(10,2) NULL,
    OnTimeCompletionRate DECIMAL(5,2) NULL,
    
    -- Quality
    CasesReturned INT NOT NULL DEFAULT 0, -- Cases returned for more info
    CasesEscalated INT NOT NULL DEFAULT 0,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_StaffMetrics_Period UNIQUE (UserId, MetricPeriod, PeriodStart)
);

-- =============================================
-- PART 6: FINANCIAL REPORTS SUPPORT
-- =============================================

-- Contract Value Summary by Period
CREATE TABLE dbo.ContractValueSummary (
    SummaryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PeriodType NVARCHAR(20) NOT NULL, -- 'MONTHLY', 'QUARTERLY', 'YEARLY'
    PeriodStart DATE NOT NULL,
    PeriodEnd DATE NOT NULL,
    
    -- By Contract Type
    GoodsCount INT NOT NULL DEFAULT 0,
    GoodsValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    ServicesCount INT NOT NULL DEFAULT 0,
    ServicesValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    WorksCount INT NOT NULL DEFAULT 0,
    WorksValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    OtherCount INT NOT NULL DEFAULT 0,
    OtherValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    
    -- Totals
    TotalCount INT NOT NULL DEFAULT 0,
    TotalValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    
    -- Currency (assumed BBD for summary)
    CurrencyCode NVARCHAR(10) NOT NULL DEFAULT 'BBD',
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_ContractValueSummary_Period UNIQUE (PeriodType, PeriodStart)
);

-- =============================================
-- PART 7: INDEXES
-- =============================================

CREATE INDEX IX_Entities_EntityNumber ON dbo.Entities(EntityNumber);
CREATE INDEX IX_Entities_EntityTypeId ON dbo.Entities(EntityTypeId);
CREATE INDEX IX_Entities_StatusId ON dbo.Entities(StatusId);
CREATE INDEX IX_Entities_DepartmentId ON dbo.Entities(DepartmentId);
CREATE INDEX IX_Entities_PrimaryContactEmail ON dbo.Entities(PrimaryContactEmail);

CREATE INDEX IX_EntityAuthorizedUsers_EntityId ON dbo.EntityAuthorizedUsers(EntityId);
CREATE INDEX IX_EntityAuthorizedUsers_Email ON dbo.EntityAuthorizedUsers(Email);
CREATE INDEX IX_EntityAuthorizedUsers_LinkedUserId ON dbo.EntityAuthorizedUsers(LinkedUserId);
CREATE INDEX IX_EntityAuthorizedUsers_StatusId ON dbo.EntityAuthorizedUsers(StatusId);

CREATE INDEX IX_EntityDocuments_EntityId ON dbo.EntityDocuments(EntityId);
CREATE INDEX IX_EntityDocuments_DocumentType ON dbo.EntityDocuments(DocumentType);

CREATE INDEX IX_ReportExecutionLog_ReportId ON dbo.ReportExecutionLog(ReportId);
CREATE INDEX IX_ReportExecutionLog_ExecutedBy ON dbo.ReportExecutionLog(ExecutedBy);
CREATE INDEX IX_ReportExecutionLog_ExecutedAt ON dbo.ReportExecutionLog(ExecutedAt);

CREATE INDEX IX_DailyMetrics_MetricDate ON dbo.DailyMetrics(MetricDate);
CREATE INDEX IX_DepartmentMetrics_DepartmentId ON dbo.DepartmentMetrics(DepartmentId);
CREATE INDEX IX_StaffMetrics_UserId ON dbo.StaffMetrics(UserId);

-- =============================================
-- PART 8: SEED DATA FOR REPORTS
-- =============================================

INSERT INTO dbo.ReportDefinitions (ReportCode, ReportName, ReportDescription, ReportCategory, RequiredRoleLevel, DisplayOrder) VALUES
-- Correspondence Reports
('RPT_COR_SUMMARY', 'Correspondence Summary Report', 'Overview of all correspondence by type, status, and time period', 'CORRESPONDENCE', 5, 1),
('RPT_COR_BY_TYPE', 'Correspondence by Type', 'Breakdown of correspondence by type (Legal Opinion, Advisory, etc.)', 'CORRESPONDENCE', 5, 2),
('RPT_COR_BY_MINISTRY', 'Correspondence by Ministry/MDA', 'Correspondence submissions grouped by requesting ministry', 'CORRESPONDENCE', 5, 3),
('RPT_COR_OVERDUE', 'Overdue Correspondence', 'List of correspondence items past their due date', 'CORRESPONDENCE', 5, 4),
('RPT_COR_PROCESSING', 'Correspondence Processing Time', 'Average processing times by type and priority', 'CORRESPONDENCE', 6, 5),

-- Contract Reports
('RPT_CON_SUMMARY', 'Contract Summary Report', 'Overview of all contracts by type, nature, and status', 'CONTRACTS', 5, 10),
('RPT_CON_BY_TYPE', 'Contracts by Type', 'Breakdown of contracts by type (Goods, Services, Works)', 'CONTRACTS', 5, 11),
('RPT_CON_BY_MINISTRY', 'Contracts by Ministry/MDA', 'Contract submissions grouped by requesting ministry', 'CONTRACTS', 5, 12),
('RPT_CON_VALUE', 'Contract Value Report', 'Total contract values by period, type, and ministry', 'CONTRACTS', 6, 13),
('RPT_CON_EXPIRING', 'Contracts Expiring Soon', 'Contracts expiring within the next 90 days', 'CONTRACTS', 5, 14),

-- Renewal Reports
('RPT_REN_SUMMARY', 'Renewal Summary Report', 'Overview of all contract renewals', 'RENEWALS', 5, 20),
('RPT_REN_PENDING', 'Pending Renewals', 'Renewals awaiting validation or approval', 'RENEWALS', 5, 21),
('RPT_REN_VALIDATION', 'Renewal Validation Report', 'Status of renewal validations', 'RENEWALS', 6, 22),

-- User Reports
('RPT_USR_REGISTRATIONS', 'User Registrations Report', 'New user registrations by entity type and period', 'USERS', 6, 30),
('RPT_USR_BY_ENTITY', 'Users by Entity Type', 'User breakdown by entity type (MDA, Company, Public, etc.)', 'USERS', 6, 31),
('RPT_USR_STAFF_REQUESTS', 'Staff Registration Requests', 'Pending and processed staff registration requests', 'USERS', 7, 32),

-- Performance Reports
('RPT_PERF_OVERALL', 'Overall Performance Dashboard', 'Key performance indicators and metrics', 'PERFORMANCE', 6, 40),
('RPT_PERF_SLA', 'SLA Compliance Report', 'SLA compliance rates by type and department', 'PERFORMANCE', 6, 41),
('RPT_PERF_STAFF', 'Staff Performance Report', 'Individual staff processing metrics', 'PERFORMANCE', 7, 42),
('RPT_PERF_DEPT', 'Department Performance Report', 'Performance metrics by department', 'PERFORMANCE', 6, 43),

-- Financial Reports
('RPT_FIN_SUMMARY', 'Financial Summary', 'Total contract values and trends', 'FINANCIAL', 7, 50),
('RPT_FIN_BY_TYPE', 'Financial by Contract Type', 'Contract values broken down by type', 'FINANCIAL', 7, 51),
('RPT_FIN_QUARTERLY', 'Quarterly Financial Report', 'Quarterly contract value summary', 'FINANCIAL', 7, 52);

GO

-- =============================================
-- PART 9: COMPREHENSIVE VIEWS
-- =============================================

-- Entity View with Users Count
CREATE OR ALTER VIEW dbo.vw_Entities
AS
SELECT 
    e.EntityId,
    e.EntityNumber,
    e.OrganizationName,
    e.DisplayName,
    
    -- Entity Type
    et.EntityTypeCode,
    et.EntityTypeName,
    
    -- For Companies
    e.RegistrationNumber,
    e.TradingName,
    e.CompanyType,
    
    -- For Government
    d.DepartmentCode,
    d.DepartmentName,
    e.Ministry,
    
    -- For Attorneys
    e.BarNumber,
    e.LawFirm,
    
    -- Primary Contact
    CONCAT(e.PrimaryContactFirstName, ' ', e.PrimaryContactLastName) AS PrimaryContact,
    e.PrimaryContactEmail,
    e.PrimaryContactPhone,
    
    -- Address
    e.City,
    e.Parish,
    e.Country,
    
    -- Status
    rs.StatusCode,
    rs.StatusName,
    
    -- Verification
    e.IsVerified,
    e.VerifiedAt,
    e.DocumentsVerified,
    
    -- User Counts
    (SELECT COUNT(*) FROM dbo.UserProfiles u WHERE u.EntityId = e.EntityId) AS RegisteredUserCount,
    (SELECT COUNT(*) FROM dbo.EntityAuthorizedUsers au WHERE au.EntityId = e.EntityId AND au.StatusId = 5) AS AuthorizedUserCount,
    
    -- Submission Counts
    (SELECT COUNT(*) FROM dbo.CorrespondenceRegister c 
     INNER JOIN dbo.UserProfiles u ON c.ApplicantUserId = u.UserId 
     WHERE u.EntityId = e.EntityId) AS CorrespondenceCount,
    (SELECT COUNT(*) FROM dbo.ContractsRegister cr 
     INNER JOIN dbo.UserProfiles u ON cr.RequestingUserId = u.UserId 
     WHERE u.EntityId = e.EntityId) AS ContractsCount,
    
    -- Audit
    e.CreatedAt,
    e.UpdatedAt

FROM dbo.Entities e
INNER JOIN dbo.LookupEntityTypes et ON e.EntityTypeId = et.EntityTypeId
INNER JOIN dbo.LookupRequestStatus rs ON e.StatusId = rs.StatusId
LEFT JOIN dbo.LookupDepartments d ON e.DepartmentId = d.DepartmentId;
GO

-- Comprehensive Correspondence Report View
CREATE OR ALTER VIEW dbo.vw_CorrespondenceReport
AS
SELECT 
    c.CorrespondenceId,
    c.ReferenceNumber,
    c.Subject,
    c.SubmittedAt,
    c.DueDate,
    c.CompletedAt,
    
    -- Processing Time
    CASE 
        WHEN c.CompletedAt IS NOT NULL 
        THEN DATEDIFF(DAY, c.SubmittedAt, c.CompletedAt)
        ELSE NULL
    END AS ProcessingDays,
    
    -- SLA Status
    CASE 
        WHEN c.CompletedAt IS NOT NULL THEN 'Completed'
        WHEN c.DueDate IS NULL THEN 'No Due Date'
        WHEN GETUTCDATE() > c.DueDate THEN 'Overdue'
        WHEN DATEDIFF(DAY, GETUTCDATE(), c.DueDate) <= 2 THEN 'Due Soon'
        ELSE 'On Track'
    END AS SLAStatus,
    
    -- Days Overdue
    CASE 
        WHEN c.CompletedAt IS NULL AND c.DueDate IS NOT NULL AND GETUTCDATE() > c.DueDate 
        THEN DATEDIFF(DAY, c.DueDate, GETUTCDATE())
        ELSE NULL
    END AS DaysOverdue,
    
    -- Type
    ct.TypeCode AS CorrespondenceTypeCode,
    ct.TypeName AS CorrespondenceTypeName,
    
    -- Priority
    p.PriorityCode,
    p.PriorityName,
    p.SLADays,
    
    -- Status
    cs.StatusCode,
    cs.StatusName,
    cs.StatusCategory,
    
    -- Applicant
    c.ApplicantName,
    c.ApplicantOrganization,
    c.ApplicantEmail,
    u.EntityId AS ApplicantEntityId,
    e.EntityNumber AS ApplicantEntityNumber,
    et.EntityTypeName AS ApplicantEntityType,
    
    -- Assignment
    CONCAT(au.FirstName, ' ', au.LastName) AS AssignedToName,
    ad.DepartmentName AS AssignedDepartment,
    
    -- Time Periods (for grouping)
    YEAR(c.SubmittedAt) AS SubmittedYear,
    MONTH(c.SubmittedAt) AS SubmittedMonth,
    DATEPART(QUARTER, c.SubmittedAt) AS SubmittedQuarter,
    FORMAT(c.SubmittedAt, 'yyyy-MM') AS SubmittedYearMonth
    
FROM dbo.CorrespondenceRegister c
INNER JOIN dbo.LookupCorrespondenceTypes ct ON c.CorrespondenceTypeId = ct.CorrespondenceTypeId
INNER JOIN dbo.LookupPriorityLevels p ON c.PriorityId = p.PriorityId
INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId
INNER JOIN dbo.UserProfiles u ON c.ApplicantUserId = u.UserId
LEFT JOIN dbo.Entities e ON u.EntityId = e.EntityId
LEFT JOIN dbo.LookupEntityTypes et ON e.EntityTypeId = et.EntityTypeId
LEFT JOIN dbo.UserProfiles au ON c.AssignedToUserId = au.UserId
LEFT JOIN dbo.LookupDepartments ad ON c.AssignedDepartmentId = ad.DepartmentId;
GO

-- Comprehensive Contract Report View
CREATE OR ALTER VIEW dbo.vw_ContractReport
AS
SELECT 
    cr.ContractId,
    cr.ReferenceNumber,
    cr.ContractTitle,
    cr.SubmittedAt,
    cr.DueDate,
    cr.CompletedAt,
    
    -- Processing Time
    CASE 
        WHEN cr.CompletedAt IS NOT NULL 
        THEN DATEDIFF(DAY, cr.SubmittedAt, cr.CompletedAt)
        ELSE NULL
    END AS ProcessingDays,
    
    -- SLA Status
    CASE 
        WHEN cr.CompletedAt IS NOT NULL THEN 'Completed'
        WHEN cr.DueDate IS NULL THEN 'No Due Date'
        WHEN GETUTCDATE() > cr.DueDate THEN 'Overdue'
        WHEN DATEDIFF(DAY, GETUTCDATE(), cr.DueDate) <= 2 THEN 'Due Soon'
        ELSE 'On Track'
    END AS SLAStatus,
    
    -- Type and Nature
    ct.TypeCode AS ContractTypeCode,
    ct.TypeName AS ContractTypeName,
    cn.NatureCode AS ContractNatureCode,
    cn.NatureName AS ContractNatureName,
    
    -- Priority
    p.PriorityCode,
    p.PriorityName,
    
    -- Status
    cs.StatusCode,
    cs.StatusName,
    cs.StatusCategory,
    
    -- Requesting Party
    cr.RequestingOfficerName,
    rd.DepartmentCode AS RequestingDepartmentCode,
    rd.DepartmentName AS RequestingDepartmentName,
    rd.Ministry AS RequestingMinistry,
    u.EntityId AS RequestingEntityId,
    e.EntityNumber AS RequestingEntityNumber,
    
    -- Counterparty
    cr.CounterpartyName,
    
    -- Financial
    cr.ContractValue,
    cur.CurrencyCode,
    cur.Symbol AS CurrencySymbol,
    
    -- Contract Period
    cr.ProposedStartDate,
    cr.ProposedEndDate,
    cr.ContractDurationMonths,
    cr.ExecutedDate,
    cr.ExpiryDate,
    
    -- Days to Expiry
    CASE 
        WHEN cr.ExpiryDate IS NOT NULL 
        THEN DATEDIFF(DAY, GETUTCDATE(), cr.ExpiryDate)
        ELSE NULL
    END AS DaysToExpiry,
    
    -- Assignment
    CONCAT(au.FirstName, ' ', au.LastName) AS AssignedToName,
    
    -- Time Periods
    YEAR(cr.SubmittedAt) AS SubmittedYear,
    MONTH(cr.SubmittedAt) AS SubmittedMonth,
    DATEPART(QUARTER, cr.SubmittedAt) AS SubmittedQuarter,
    FORMAT(cr.SubmittedAt, 'yyyy-MM') AS SubmittedYearMonth
    
FROM dbo.ContractsRegister cr
INNER JOIN dbo.LookupContractTypes ct ON cr.ContractTypeId = ct.ContractTypeId
INNER JOIN dbo.LookupContractNature cn ON cr.ContractNatureId = cn.ContractNatureId
INNER JOIN dbo.LookupPriorityLevels p ON cr.PriorityId = p.PriorityId
INNER JOIN dbo.LookupCaseStatus cs ON cr.CaseStatusId = cs.CaseStatusId
INNER JOIN dbo.LookupCurrencies cur ON cr.CurrencyId = cur.CurrencyId
INNER JOIN dbo.LookupDepartments rd ON cr.RequestingDepartmentId = rd.DepartmentId
INNER JOIN dbo.UserProfiles u ON cr.RequestingUserId = u.UserId
LEFT JOIN dbo.Entities e ON u.EntityId = e.EntityId
LEFT JOIN dbo.UserProfiles au ON cr.AssignedToUserId = au.UserId;
GO

-- Financial Summary View
CREATE OR ALTER VIEW dbo.vw_FinancialSummary
AS
SELECT 
    FORMAT(cr.SubmittedAt, 'yyyy-MM') AS Period,
    YEAR(cr.SubmittedAt) AS Year,
    MONTH(cr.SubmittedAt) AS Month,
    DATEPART(QUARTER, cr.SubmittedAt) AS Quarter,
    
    -- By Type
    SUM(CASE WHEN ct.TypeCode = 'GOODS' THEN 1 ELSE 0 END) AS GoodsCount,
    SUM(CASE WHEN ct.TypeCode = 'GOODS' THEN cr.ContractValue ELSE 0 END) AS GoodsValue,
    SUM(CASE WHEN ct.TypeCode IN ('SERVICES', 'CONSULTANCY') THEN 1 ELSE 0 END) AS ServicesCount,
    SUM(CASE WHEN ct.TypeCode IN ('SERVICES', 'CONSULTANCY') THEN cr.ContractValue ELSE 0 END) AS ServicesValue,
    SUM(CASE WHEN ct.TypeCode = 'CONSTRUCTION' THEN 1 ELSE 0 END) AS WorksCount,
    SUM(CASE WHEN ct.TypeCode = 'CONSTRUCTION' THEN cr.ContractValue ELSE 0 END) AS WorksValue,
    
    -- Totals
    COUNT(*) AS TotalCount,
    SUM(cr.ContractValue) AS TotalValue,
    AVG(cr.ContractValue) AS AvgValue,
    MIN(cr.ContractValue) AS MinValue,
    MAX(cr.ContractValue) AS MaxValue

FROM dbo.ContractsRegister cr
INNER JOIN dbo.LookupContractTypes ct ON cr.ContractTypeId = ct.ContractTypeId
INNER JOIN dbo.LookupCaseStatus cs ON cr.CaseStatusId = cs.CaseStatusId
WHERE cs.StatusCode NOT IN ('DRAFT', 'REJECTED', 'CANCELLED')
GROUP BY FORMAT(cr.SubmittedAt, 'yyyy-MM'), YEAR(cr.SubmittedAt), MONTH(cr.SubmittedAt), DATEPART(QUARTER, cr.SubmittedAt);
GO

-- SLA Compliance View
CREATE OR ALTER VIEW dbo.vw_SLACompliance
AS
SELECT 
    'Correspondence' AS ItemType,
    COUNT(*) AS TotalItems,
    SUM(CASE WHEN cs.StatusCategory = 'closed' THEN 1 ELSE 0 END) AS CompletedItems,
    SUM(CASE WHEN c.DueDate IS NOT NULL AND c.CompletedAt IS NOT NULL AND c.CompletedAt <= c.DueDate THEN 1 ELSE 0 END) AS OnTimeCompletions,
    SUM(CASE WHEN c.DueDate IS NOT NULL AND c.CompletedAt IS NULL AND GETUTCDATE() > c.DueDate THEN 1 ELSE 0 END) AS CurrentlyOverdue,
    CAST(
        CASE 
            WHEN SUM(CASE WHEN c.DueDate IS NOT NULL AND cs.StatusCategory = 'closed' THEN 1 ELSE 0 END) = 0 THEN 0
            ELSE (SUM(CASE WHEN c.DueDate IS NOT NULL AND c.CompletedAt IS NOT NULL AND c.CompletedAt <= c.DueDate THEN 1 ELSE 0 END) * 100.0 / 
                  SUM(CASE WHEN c.DueDate IS NOT NULL AND cs.StatusCategory = 'closed' THEN 1 ELSE 0 END))
        END AS DECIMAL(5,2)
    ) AS ComplianceRate
FROM dbo.CorrespondenceRegister c
INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId

UNION ALL

SELECT 
    'Contracts' AS ItemType,
    COUNT(*) AS TotalItems,
    SUM(CASE WHEN cs.StatusCategory = 'closed' THEN 1 ELSE 0 END) AS CompletedItems,
    SUM(CASE WHEN cr.DueDate IS NOT NULL AND cr.CompletedAt IS NOT NULL AND cr.CompletedAt <= cr.DueDate THEN 1 ELSE 0 END) AS OnTimeCompletions,
    SUM(CASE WHEN cr.DueDate IS NOT NULL AND cr.CompletedAt IS NULL AND GETUTCDATE() > cr.DueDate THEN 1 ELSE 0 END) AS CurrentlyOverdue,
    CAST(
        CASE 
            WHEN SUM(CASE WHEN cr.DueDate IS NOT NULL AND cs.StatusCategory = 'closed' THEN 1 ELSE 0 END) = 0 THEN 0
            ELSE (SUM(CASE WHEN cr.DueDate IS NOT NULL AND cr.CompletedAt IS NOT NULL AND cr.CompletedAt <= cr.DueDate THEN 1 ELSE 0 END) * 100.0 / 
                  SUM(CASE WHEN cr.DueDate IS NOT NULL AND cs.StatusCategory = 'closed' THEN 1 ELSE 0 END))
        END AS DECIMAL(5,2)
    ) AS ComplianceRate
FROM dbo.ContractsRegister cr
INNER JOIN dbo.LookupCaseStatus cs ON cr.CaseStatusId = cs.CaseStatusId;
GO

-- User Registrations Report View
CREATE OR ALTER VIEW dbo.vw_UserRegistrations
AS
SELECT 
    u.UserId,
    u.Email,
    CONCAT(u.FirstName, ' ', u.LastName) AS FullName,
    u.EntityNumber,
    u.OrganizationName,
    
    -- Entity Type
    et.EntityTypeCode,
    et.EntityTypeName,
    
    -- Role
    r.RoleCode,
    r.RoleName,
    
    -- Status
    rs.StatusCode,
    rs.StatusName,
    
    -- Verification
    u.EmailVerified,
    
    -- Registration Date
    u.CreatedAt AS RegistrationDate,
    YEAR(u.CreatedAt) AS RegistrationYear,
    MONTH(u.CreatedAt) AS RegistrationMonth,
    FORMAT(u.CreatedAt, 'yyyy-MM') AS RegistrationYearMonth,
    
    -- Activity
    u.LastLoginAt,
    DATEDIFF(DAY, u.LastLoginAt, GETUTCDATE()) AS DaysSinceLastLogin,
    
    -- Submission Counts
    (SELECT COUNT(*) FROM dbo.CorrespondenceRegister c WHERE c.ApplicantUserId = u.UserId) AS CorrespondenceSubmitted,
    (SELECT COUNT(*) FROM dbo.ContractsRegister cr WHERE cr.RequestingUserId = u.UserId) AS ContractsSubmitted

FROM dbo.UserProfiles u
INNER JOIN dbo.LookupEntityTypes et ON u.EntityTypeId = et.EntityTypeId
INNER JOIN dbo.LookupUserRoles r ON u.RoleId = r.RoleId
INNER JOIN dbo.LookupRequestStatus rs ON u.StatusId = rs.StatusId;
GO
