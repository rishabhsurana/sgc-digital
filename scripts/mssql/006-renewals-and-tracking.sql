-- =============================================
-- SGC Digital - Renewals, Validations, and Extended Tracking
-- MS SQL Server Schema
-- =============================================

-- =============================================
-- CONTRACT RENEWALS
-- =============================================

-- Renewal Status Lookup
CREATE TABLE dbo.LookupRenewalStatus (
    RenewalStatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Contract Renewals Register
CREATE TABLE dbo.ContractRenewals (
    RenewalId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RenewalReferenceNumber NVARCHAR(50) NOT NULL UNIQUE, -- e.g., REN-2024-0001
    
    -- Link to Original Contract
    OriginalContractId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractsRegister(ContractId),
    PreviousRenewalId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractRenewals(RenewalId), -- For chained renewals
    RenewalSequence INT NOT NULL DEFAULT 1, -- 1st renewal, 2nd renewal, etc.
    
    -- Validation - Confirm this is indeed a renewal
    IsValidRenewal BIT NOT NULL DEFAULT 0,
    ValidationNotes NVARCHAR(MAX) NULL,
    ValidatedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    ValidatedAt DATETIME2 NULL,
    
    -- Renewal Details
    RenewalReason NVARCHAR(MAX) NOT NULL,
    RenewalJustification NVARCHAR(MAX) NULL,
    
    -- Original Contract Summary (for reference)
    OriginalContractNumber NVARCHAR(100) NOT NULL,
    OriginalContractTitle NVARCHAR(500) NOT NULL,
    OriginalStartDate DATE NOT NULL,
    OriginalEndDate DATE NOT NULL,
    OriginalValue DECIMAL(18,2) NOT NULL,
    
    -- Proposed Renewal Terms
    ProposedStartDate DATE NOT NULL,
    ProposedEndDate DATE NOT NULL,
    ProposedValue DECIMAL(18,2) NOT NULL,
    CurrencyId INT NOT NULL REFERENCES dbo.LookupCurrencies(CurrencyId),
    ProposedDurationMonths INT NULL,
    
    -- Changes from Original
    ValueChange DECIMAL(18,2) NULL, -- Calculated: ProposedValue - OriginalValue
    ValueChangePercent DECIMAL(5,2) NULL, -- Percentage change
    TermsChanged BIT NOT NULL DEFAULT 0,
    TermsChangeDescription NVARCHAR(MAX) NULL,
    
    -- Counterparty (may be different from original)
    CounterpartyName NVARCHAR(200) NOT NULL,
    CounterpartyChanged BIT NOT NULL DEFAULT 0,
    
    -- Requesting Entity
    RequestingUserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    RequestingDepartmentId INT NOT NULL REFERENCES dbo.LookupDepartments(DepartmentId),
    RequestingOfficerName NVARCHAR(200) NOT NULL,
    RequestingOfficerEmail NVARCHAR(255) NOT NULL,
    
    -- Status and Priority
    RenewalStatusId INT NOT NULL REFERENCES dbo.LookupRenewalStatus(RenewalStatusId),
    PriorityId INT NOT NULL REFERENCES dbo.LookupPriorityLevels(PriorityId),
    
    -- Assignment
    AssignedToUserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    AssignedAt DATETIME2 NULL,
    
    -- Review and Approval
    LegalReviewNotes NVARCHAR(MAX) NULL,
    ApprovalNotes NVARCHAR(MAX) NULL,
    ApprovedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    ApprovedAt DATETIME2 NULL,
    RejectedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    RejectedAt DATETIME2 NULL,
    RejectionReason NVARCHAR(MAX) NULL,
    
    -- Dates
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    DueDate DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    
    -- Final Renewed Contract
    NewContractId UNIQUEIDENTIFIER NULL REFERENCES dbo.ContractsRegister(ContractId), -- Link to newly created contract
    NewContractNumber NVARCHAR(100) NULL,
    ExecutedDate DATE NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    UpdatedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId)
);

-- Renewal Status History
CREATE TABLE dbo.ContractRenewalStatusHistory (
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RenewalId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractRenewals(RenewalId),
    
    FromStatusId INT NULL REFERENCES dbo.LookupRenewalStatus(RenewalStatusId),
    ToStatusId INT NOT NULL REFERENCES dbo.LookupRenewalStatus(RenewalStatusId),
    
    Comments NVARCHAR(MAX) NULL,
    ChangedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Renewal Documents
CREATE TABLE dbo.ContractRenewalDocuments (
    DocumentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RenewalId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.ContractRenewals(RenewalId),
    
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(100) NOT NULL,
    FileSize BIGINT NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    DocumentType NVARCHAR(100) NULL, -- 'renewal_request', 'justification', 'approval_letter', etc.
    
    UploadedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- ENTITY REGISTRATION TRACKING
-- =============================================

-- Entity Registration History (tracks all entity registrations/updates)
CREATE TABLE dbo.EntityRegistrationHistory (
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Entity Information
    EntityNumber NVARCHAR(50) NOT NULL, -- e.g., MDA-001, PUB-001
    EntityTypeId INT NOT NULL REFERENCES dbo.LookupEntityTypes(EntityTypeId),
    
    -- Organization Details
    OrganizationName NVARCHAR(200) NOT NULL,
    RegistrationNumber NVARCHAR(100) NULL, -- Business registration number
    TaxId NVARCHAR(100) NULL,
    
    -- Primary Contact
    ContactFirstName NVARCHAR(100) NOT NULL,
    ContactLastName NVARCHAR(100) NOT NULL,
    ContactEmail NVARCHAR(255) NOT NULL,
    ContactPhone NVARCHAR(50) NULL,
    ContactPosition NVARCHAR(100) NULL,
    
    -- Address
    AddressLine1 NVARCHAR(200) NULL,
    AddressLine2 NVARCHAR(200) NULL,
    City NVARCHAR(100) NULL,
    Parish NVARCHAR(100) NULL,
    Country NVARCHAR(100) NULL DEFAULT 'Barbados',
    PostalCode NVARCHAR(20) NULL,
    
    -- For MDA/Government entities
    DepartmentId INT NULL REFERENCES dbo.LookupDepartments(DepartmentId),
    Ministry NVARCHAR(200) NULL,
    
    -- For Attorneys
    BarNumber NVARCHAR(50) NULL,
    LawFirm NVARCHAR(200) NULL,
    
    -- For Companies
    CompanyType NVARCHAR(100) NULL,
    IncorporationDate DATE NULL,
    
    -- Status
    RegistrationStatusId INT NOT NULL REFERENCES dbo.LookupRequestStatus(StatusId),
    
    -- Verification
    EmailVerified BIT NOT NULL DEFAULT 0,
    EmailVerifiedAt DATETIME2 NULL,
    DocumentsVerified BIT NOT NULL DEFAULT 0,
    DocumentsVerifiedAt DATETIME2 NULL,
    DocumentsVerifiedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Action Type
    ActionType NVARCHAR(50) NOT NULL, -- 'REGISTRATION', 'UPDATE', 'RENEWAL', 'DEACTIVATION'
    ChangeDescription NVARCHAR(MAX) NULL,
    
    -- Link to User Profile (if created)
    UserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId), -- NULL for self-registration
    IPAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL
);

-- =============================================
-- EMAIL VERIFICATION
-- =============================================

CREATE TABLE dbo.EmailVerificationTokens (
    TokenId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    UserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    Email NVARCHAR(255) NOT NULL,
    Token NVARCHAR(100) NOT NULL UNIQUE,
    TokenType NVARCHAR(50) NOT NULL, -- 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'INVITATION'
    
    ExpiresAt DATETIME2 NOT NULL,
    UsedAt DATETIME2 NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- SLA AND DEADLINE TRACKING
-- =============================================

CREATE TABLE dbo.SLATracking (
    SLAId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Reference to item being tracked
    ItemType NVARCHAR(50) NOT NULL, -- 'CORRESPONDENCE', 'CONTRACT', 'RENEWAL', 'STAFF_REQUEST'
    ItemId UNIQUEIDENTIFIER NOT NULL,
    ReferenceNumber NVARCHAR(50) NOT NULL,
    
    -- SLA Details
    SLADays INT NOT NULL,
    StartDate DATETIME2 NOT NULL,
    DueDate DATETIME2 NOT NULL,
    
    -- Status
    IsOverdue BIT NOT NULL DEFAULT 0,
    DaysOverdue INT NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CompletedAt DATETIME2 NULL,
    
    -- Escalation
    EscalationLevel INT NOT NULL DEFAULT 0, -- 0=none, 1=warning, 2=escalated, 3=critical
    LastEscalatedAt DATETIME2 NULL,
    EscalatedTo UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE TABLE dbo.Notifications (
    NotificationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Recipient
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Content
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    NotificationType NVARCHAR(50) NOT NULL, -- 'INFO', 'WARNING', 'ACTION_REQUIRED', 'APPROVAL', 'DEADLINE'
    
    -- Reference
    RelatedItemType NVARCHAR(50) NULL, -- 'CORRESPONDENCE', 'CONTRACT', 'RENEWAL', etc.
    RelatedItemId UNIQUEIDENTIFIER NULL,
    ActionUrl NVARCHAR(500) NULL,
    
    -- Status
    IsRead BIT NOT NULL DEFAULT 0,
    ReadAt DATETIME2 NULL,
    IsDismissed BIT NOT NULL DEFAULT 0,
    DismissedAt DATETIME2 NULL,
    
    -- Priority
    Priority NVARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- EMAIL QUEUE (for sending notifications)
-- =============================================

CREATE TABLE dbo.EmailQueue (
    EmailId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Recipients
    ToEmail NVARCHAR(255) NOT NULL,
    ToName NVARCHAR(200) NULL,
    CcEmails NVARCHAR(MAX) NULL, -- JSON array
    BccEmails NVARCHAR(MAX) NULL, -- JSON array
    
    -- Content
    Subject NVARCHAR(500) NOT NULL,
    BodyHtml NVARCHAR(MAX) NOT NULL,
    BodyText NVARCHAR(MAX) NULL,
    
    -- Template (optional)
    TemplateName NVARCHAR(100) NULL,
    TemplateData NVARCHAR(MAX) NULL, -- JSON
    
    -- Reference
    RelatedItemType NVARCHAR(50) NULL,
    RelatedItemId UNIQUEIDENTIFIER NULL,
    
    -- Status
    Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENDING', 'SENT', 'FAILED'
    SentAt DATETIME2 NULL,
    FailedAt DATETIME2 NULL,
    FailureReason NVARCHAR(MAX) NULL,
    RetryCount INT NOT NULL DEFAULT 0,
    MaxRetries INT NOT NULL DEFAULT 3,
    NextRetryAt DATETIME2 NULL,
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IX_ContractRenewals_OriginalContractId ON dbo.ContractRenewals(OriginalContractId);
CREATE INDEX IX_ContractRenewals_RenewalStatusId ON dbo.ContractRenewals(RenewalStatusId);
CREATE INDEX IX_ContractRenewals_RequestingUserId ON dbo.ContractRenewals(RequestingUserId);
CREATE INDEX IX_ContractRenewals_SubmittedAt ON dbo.ContractRenewals(SubmittedAt);
CREATE INDEX IX_ContractRenewalStatusHistory_RenewalId ON dbo.ContractRenewalStatusHistory(RenewalId);
CREATE INDEX IX_ContractRenewalDocuments_RenewalId ON dbo.ContractRenewalDocuments(RenewalId);

CREATE INDEX IX_EntityRegistrationHistory_EntityNumber ON dbo.EntityRegistrationHistory(EntityNumber);
CREATE INDEX IX_EntityRegistrationHistory_UserId ON dbo.EntityRegistrationHistory(UserId);
CREATE INDEX IX_EntityRegistrationHistory_CreatedAt ON dbo.EntityRegistrationHistory(CreatedAt);

CREATE INDEX IX_EmailVerificationTokens_Email ON dbo.EmailVerificationTokens(Email);
CREATE INDEX IX_EmailVerificationTokens_Token ON dbo.EmailVerificationTokens(Token);
CREATE INDEX IX_EmailVerificationTokens_ExpiresAt ON dbo.EmailVerificationTokens(ExpiresAt);

CREATE INDEX IX_SLATracking_ItemType_ItemId ON dbo.SLATracking(ItemType, ItemId);
CREATE INDEX IX_SLATracking_DueDate ON dbo.SLATracking(DueDate);
CREATE INDEX IX_SLATracking_IsOverdue ON dbo.SLATracking(IsOverdue);

CREATE INDEX IX_Notifications_UserId ON dbo.Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON dbo.Notifications(IsRead);
CREATE INDEX IX_Notifications_CreatedAt ON dbo.Notifications(CreatedAt);

CREATE INDEX IX_EmailQueue_Status ON dbo.EmailQueue(Status);
CREATE INDEX IX_EmailQueue_NextRetryAt ON dbo.EmailQueue(NextRetryAt);

-- =============================================
-- SEED LOOKUP DATA
-- =============================================

-- Renewal Status
INSERT INTO dbo.LookupRenewalStatus (StatusCode, StatusName, Description, DisplayOrder) VALUES
('DRAFT', 'Draft', 'Renewal request saved as draft', 1),
('PENDING_VALIDATION', 'Pending Validation', 'Awaiting validation that this is a legitimate renewal', 2),
('VALIDATED', 'Validated', 'Confirmed as valid renewal request', 3),
('UNDER_REVIEW', 'Under Review', 'Renewal under legal review', 4),
('PENDING_INFO', 'Pending Information', 'Awaiting additional information', 5),
('PENDING_APPROVAL', 'Pending Approval', 'Awaiting approval', 6),
('APPROVED', 'Approved', 'Renewal approved', 7),
('REJECTED', 'Rejected', 'Renewal rejected', 8),
('EXECUTED', 'Executed', 'Renewal executed and new contract created', 9),
('CANCELLED', 'Cancelled', 'Renewal request cancelled', 10);

GO

-- =============================================
-- VIEWS FOR RENEWALS
-- =============================================

CREATE OR ALTER VIEW dbo.vw_ContractRenewals
AS
SELECT 
    cr.RenewalId,
    cr.RenewalReferenceNumber,
    cr.RenewalSequence,
    cr.IsValidRenewal,
    cr.ValidationNotes,
    
    -- Original Contract
    cr.OriginalContractId,
    cr.OriginalContractNumber,
    cr.OriginalContractTitle,
    cr.OriginalStartDate,
    cr.OriginalEndDate,
    cr.OriginalValue,
    
    -- Proposed Terms
    cr.ProposedStartDate,
    cr.ProposedEndDate,
    cr.ProposedValue,
    cur.CurrencyCode,
    cur.Symbol AS CurrencySymbol,
    cr.ProposedDurationMonths,
    cr.ValueChange,
    cr.ValueChangePercent,
    cr.TermsChanged,
    
    -- Counterparty
    cr.CounterpartyName,
    cr.CounterpartyChanged,
    
    -- Requesting Party
    cr.RequestingOfficerName,
    rd.DepartmentName AS RequestingDepartment,
    
    -- Status and Priority
    rs.StatusCode AS RenewalStatusCode,
    rs.StatusName AS RenewalStatusName,
    p.PriorityCode,
    p.PriorityName,
    
    -- Assignment
    CONCAT(au.FirstName, ' ', au.LastName) AS AssignedToName,
    
    -- Dates
    cr.SubmittedAt,
    cr.DueDate,
    cr.CompletedAt,
    
    -- New Contract (if executed)
    cr.NewContractId,
    cr.NewContractNumber,
    cr.ExecutedDate,
    
    -- Audit
    cr.CreatedAt,
    cr.UpdatedAt,
    CONCAT(cu.FirstName, ' ', cu.LastName) AS CreatedByName

FROM dbo.ContractRenewals cr
INNER JOIN dbo.LookupRenewalStatus rs ON cr.RenewalStatusId = rs.RenewalStatusId
INNER JOIN dbo.LookupPriorityLevels p ON cr.PriorityId = p.PriorityId
INNER JOIN dbo.LookupCurrencies cur ON cr.CurrencyId = cur.CurrencyId
INNER JOIN dbo.LookupDepartments rd ON cr.RequestingDepartmentId = rd.DepartmentId
LEFT JOIN dbo.UserProfiles au ON cr.AssignedToUserId = au.UserId
LEFT JOIN dbo.UserProfiles cu ON cr.CreatedBy = cu.UserId;
GO

-- View for contracts expiring soon (renewal candidates)
CREATE OR ALTER VIEW dbo.vw_ContractsExpiringForRenewal
AS
SELECT 
    c.ContractId,
    c.ReferenceNumber,
    c.ContractTitle,
    c.CounterpartyName,
    c.ContractValue,
    cur.CurrencyCode,
    c.ExpiryDate,
    DATEDIFF(DAY, GETUTCDATE(), c.ExpiryDate) AS DaysUntilExpiry,
    CASE 
        WHEN DATEDIFF(DAY, GETUTCDATE(), c.ExpiryDate) <= 30 THEN 'CRITICAL'
        WHEN DATEDIFF(DAY, GETUTCDATE(), c.ExpiryDate) <= 60 THEN 'WARNING'
        WHEN DATEDIFF(DAY, GETUTCDATE(), c.ExpiryDate) <= 90 THEN 'UPCOMING'
        ELSE 'OK'
    END AS ExpiryStatus,
    rd.DepartmentName AS RequestingDepartment,
    cs.StatusName AS ContractStatus,
    -- Check if renewal already exists
    CASE WHEN EXISTS (
        SELECT 1 FROM dbo.ContractRenewals cr 
        WHERE cr.OriginalContractId = c.ContractId 
        AND cr.RenewalStatusId NOT IN (
            SELECT RenewalStatusId FROM dbo.LookupRenewalStatus WHERE StatusCode IN ('REJECTED', 'CANCELLED')
        )
    ) THEN 1 ELSE 0 END AS HasPendingRenewal

FROM dbo.ContractsRegister c
INNER JOIN dbo.LookupCurrencies cur ON c.CurrencyId = cur.CurrencyId
INNER JOIN dbo.LookupDepartments rd ON c.RequestingDepartmentId = rd.DepartmentId
INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId
WHERE c.ExpiryDate IS NOT NULL
  AND c.ExpiryDate > GETUTCDATE()
  AND c.ExpiryDate <= DATEADD(DAY, 90, GETUTCDATE())
  AND cs.StatusCode NOT IN ('REJECTED', 'CLOSED', 'ARCHIVED');
GO
