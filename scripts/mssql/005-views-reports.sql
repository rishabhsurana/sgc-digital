-- =============================================
-- SGC Digital - Views for Reports and Dashboards
-- MS SQL Server Schema
-- =============================================

-- =============================================
-- Correspondence Register View (for listing/reports)
-- =============================================

CREATE OR ALTER VIEW dbo.vw_CorrespondenceRegister
AS
SELECT 
    c.CorrespondenceId,
    c.ReferenceNumber,
    c.Subject,
    c.Description,
    c.SubmittedAt,
    c.DueDate,
    c.CompletedAt,
    
    -- Type
    ct.TypeCode AS CorrespondenceTypeCode,
    ct.TypeName AS CorrespondenceTypeName,
    
    -- Priority
    p.PriorityCode,
    p.PriorityName,
    
    -- Status
    cs.StatusCode,
    cs.StatusName,
    cs.StatusCategory,
    
    -- Applicant
    c.ApplicantUserId,
    c.ApplicantName,
    c.ApplicantOrganization,
    c.ApplicantEmail,
    
    -- Assignment
    c.AssignedToUserId,
    CONCAT(au.FirstName, ' ', au.LastName) AS AssignedToName,
    d.DepartmentName AS AssignedDepartment,
    
    -- Audit
    c.CreatedAt,
    c.UpdatedAt,
    CONCAT(cu.FirstName, ' ', cu.LastName) AS CreatedByName
    
FROM dbo.CorrespondenceRegister c
INNER JOIN dbo.LookupCorrespondenceTypes ct ON c.CorrespondenceTypeId = ct.CorrespondenceTypeId
INNER JOIN dbo.LookupPriorityLevels p ON c.PriorityId = p.PriorityId
INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId
LEFT JOIN dbo.UserProfiles au ON c.AssignedToUserId = au.UserId
LEFT JOIN dbo.LookupDepartments d ON c.AssignedDepartmentId = d.DepartmentId
LEFT JOIN dbo.UserProfiles cu ON c.CreatedBy = cu.UserId;
GO

-- =============================================
-- Contracts Register View (for listing/reports)
-- =============================================

CREATE OR ALTER VIEW dbo.vw_ContractsRegister
AS
SELECT 
    cr.ContractId,
    cr.ReferenceNumber,
    cr.ContractTitle,
    cr.ContractDescription,
    cr.SubmittedAt,
    cr.DueDate,
    cr.CompletedAt,
    
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
    cr.RequestingUserId,
    cr.RequestingOfficerName,
    cr.RequestingOfficerEmail,
    rd.DepartmentName AS RequestingDepartment,
    
    -- Counterparty
    cr.CounterpartyName,
    cr.CounterpartyEmail,
    
    -- Financial
    cr.ContractValue,
    cur.CurrencyCode,
    cur.Symbol AS CurrencySymbol,
    
    -- Contract Period
    cr.ProposedStartDate,
    cr.ProposedEndDate,
    cr.ContractDurationMonths,
    
    -- Assignment
    cr.AssignedToUserId,
    CONCAT(au.FirstName, ' ', au.LastName) AS AssignedToName,
    
    -- Final Contract
    cr.FinalContractNumber,
    cr.ExecutedDate,
    cr.ExpiryDate,
    
    -- Audit
    cr.CreatedAt,
    cr.UpdatedAt,
    CONCAT(cu.FirstName, ' ', cu.LastName) AS CreatedByName
    
FROM dbo.ContractsRegister cr
INNER JOIN dbo.LookupContractTypes ct ON cr.ContractTypeId = ct.ContractTypeId
INNER JOIN dbo.LookupContractNature cn ON cr.ContractNatureId = cn.ContractNatureId
INNER JOIN dbo.LookupPriorityLevels p ON cr.PriorityId = p.PriorityId
INNER JOIN dbo.LookupCaseStatus cs ON cr.CaseStatusId = cs.CaseStatusId
INNER JOIN dbo.LookupCurrencies cur ON cr.CurrencyId = cur.CurrencyId
INNER JOIN dbo.LookupDepartments rd ON cr.RequestingDepartmentId = rd.DepartmentId
LEFT JOIN dbo.UserProfiles au ON cr.AssignedToUserId = au.UserId
LEFT JOIN dbo.UserProfiles cu ON cr.CreatedBy = cu.UserId;
GO

-- =============================================
-- Transaction History View (combined correspondence and contracts)
-- =============================================

CREATE OR ALTER VIEW dbo.vw_TransactionHistory
AS
SELECT 
    'Correspondence' AS TransactionType,
    c.CorrespondenceId AS TransactionId,
    c.ReferenceNumber,
    c.Subject AS Title,
    ct.TypeName AS Category,
    p.PriorityName AS Priority,
    cs.StatusName AS Status,
    cs.StatusCategory,
    c.ApplicantName AS RequestorName,
    c.ApplicantOrganization AS Organization,
    CONCAT(au.FirstName, ' ', au.LastName) AS AssignedTo,
    NULL AS ContractValue,
    NULL AS Currency,
    c.SubmittedAt,
    c.DueDate,
    c.CompletedAt,
    c.CreatedAt,
    c.UpdatedAt
FROM dbo.CorrespondenceRegister c
INNER JOIN dbo.LookupCorrespondenceTypes ct ON c.CorrespondenceTypeId = ct.CorrespondenceTypeId
INNER JOIN dbo.LookupPriorityLevels p ON c.PriorityId = p.PriorityId
INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId
LEFT JOIN dbo.UserProfiles au ON c.AssignedToUserId = au.UserId

UNION ALL

SELECT 
    'Contract' AS TransactionType,
    cr.ContractId AS TransactionId,
    cr.ReferenceNumber,
    cr.ContractTitle AS Title,
    ct.TypeName AS Category,
    p.PriorityName AS Priority,
    cs.StatusName AS Status,
    cs.StatusCategory,
    cr.RequestingOfficerName AS RequestorName,
    rd.DepartmentName AS Organization,
    CONCAT(au.FirstName, ' ', au.LastName) AS AssignedTo,
    cr.ContractValue,
    cur.CurrencyCode AS Currency,
    cr.SubmittedAt,
    cr.DueDate,
    cr.CompletedAt,
    cr.CreatedAt,
    cr.UpdatedAt
FROM dbo.ContractsRegister cr
INNER JOIN dbo.LookupContractTypes ct ON cr.ContractTypeId = ct.ContractTypeId
INNER JOIN dbo.LookupPriorityLevels p ON cr.PriorityId = p.PriorityId
INNER JOIN dbo.LookupCaseStatus cs ON cr.CaseStatusId = cs.CaseStatusId
INNER JOIN dbo.LookupCurrencies cur ON cr.CurrencyId = cur.CurrencyId
INNER JOIN dbo.LookupDepartments rd ON cr.RequestingDepartmentId = rd.DepartmentId
LEFT JOIN dbo.UserProfiles au ON cr.AssignedToUserId = au.UserId;
GO

-- =============================================
-- User Management View
-- =============================================

CREATE OR ALTER VIEW dbo.vw_UserProfiles
AS
SELECT 
    u.UserId,
    u.Email,
    u.FirstName,
    u.LastName,
    CONCAT(u.FirstName, ' ', u.LastName) AS FullName,
    u.Phone,
    u.EntityNumber,
    u.OrganizationName,
    u.Position,
    
    -- Entity Type
    et.EntityTypeCode,
    et.EntityTypeName,
    
    -- Department
    d.DepartmentCode,
    d.DepartmentName,
    d.Ministry,
    
    -- Role
    r.RoleCode,
    r.RoleName,
    
    -- Status
    rs.StatusCode,
    rs.StatusName,
    
    -- Verification
    u.EmailVerified,
    
    -- Audit
    u.LastLoginAt,
    u.CreatedAt,
    u.UpdatedAt
    
FROM dbo.UserProfiles u
INNER JOIN dbo.LookupEntityTypes et ON u.EntityTypeId = et.EntityTypeId
INNER JOIN dbo.LookupUserRoles r ON u.RoleId = r.RoleId
INNER JOIN dbo.LookupRequestStatus rs ON u.StatusId = rs.StatusId
LEFT JOIN dbo.LookupDepartments d ON u.DepartmentId = d.DepartmentId;
GO

-- =============================================
-- Staff Registration Requests View
-- =============================================

CREATE OR ALTER VIEW dbo.vw_StaffRegistrationRequests
AS
SELECT 
    sr.RequestId,
    sr.RequestNumber,
    sr.FirstName,
    sr.LastName,
    CONCAT(sr.FirstName, ' ', sr.LastName) AS FullName,
    sr.Email,
    sr.Phone,
    sr.Position,
    sr.EmployeeId,
    sr.SupervisorName,
    sr.SupervisorEmail,
    sr.Justification,
    
    -- Department
    d.DepartmentCode,
    d.DepartmentName,
    d.Ministry,
    
    -- Requested Role
    r.RoleCode AS RequestedRoleCode,
    r.RoleName AS RequestedRoleName,
    
    -- Status
    rs.StatusCode,
    rs.StatusName,
    
    -- Review
    sr.ReviewedAt,
    sr.ReviewNotes,
    CONCAT(ru.FirstName, ' ', ru.LastName) AS ReviewedByName,
    
    -- Audit
    sr.CreatedAt,
    sr.UpdatedAt
    
FROM dbo.StaffRegistrationRequests sr
INNER JOIN dbo.LookupDepartments d ON sr.DepartmentId = d.DepartmentId
INNER JOIN dbo.LookupUserRoles r ON sr.RequestedRoleId = r.RoleId
INNER JOIN dbo.LookupRequestStatus rs ON sr.StatusId = rs.StatusId
LEFT JOIN dbo.UserProfiles ru ON sr.ReviewedBy = ru.UserId;
GO

-- =============================================
-- Dashboard Summary View
-- =============================================

CREATE OR ALTER VIEW dbo.vw_DashboardSummary
AS
SELECT 
    -- Correspondence Summary
    (SELECT COUNT(*) FROM dbo.CorrespondenceRegister) AS TotalCorrespondence,
    (SELECT COUNT(*) FROM dbo.CorrespondenceRegister c 
     INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId 
     WHERE cs.StatusCategory = 'open') AS OpenCorrespondence,
    (SELECT COUNT(*) FROM dbo.CorrespondenceRegister c 
     INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId 
     WHERE cs.StatusCategory = 'in_progress') AS InProgressCorrespondence,
    (SELECT COUNT(*) FROM dbo.CorrespondenceRegister c 
     INNER JOIN dbo.LookupCaseStatus cs ON c.CaseStatusId = cs.CaseStatusId 
     WHERE cs.StatusCategory = 'closed') AS ClosedCorrespondence,
    
    -- Contract Summary
    (SELECT COUNT(*) FROM dbo.ContractsRegister) AS TotalContracts,
    (SELECT COUNT(*) FROM dbo.ContractsRegister cr 
     INNER JOIN dbo.LookupCaseStatus cs ON cr.CaseStatusId = cs.CaseStatusId 
     WHERE cs.StatusCategory = 'open') AS OpenContracts,
    (SELECT COUNT(*) FROM dbo.ContractsRegister cr 
     INNER JOIN dbo.LookupCaseStatus cs ON cr.CaseStatusId = cs.CaseStatusId 
     WHERE cs.StatusCategory = 'in_progress') AS InProgressContracts,
    (SELECT COUNT(*) FROM dbo.ContractsRegister cr 
     INNER JOIN dbo.LookupCaseStatus cs ON cr.CaseStatusId = cs.CaseStatusId 
     WHERE cs.StatusCategory = 'closed') AS ClosedContracts,
    (SELECT ISNULL(SUM(ContractValue), 0) FROM dbo.ContractsRegister) AS TotalContractValue,
    
    -- User Summary
    (SELECT COUNT(*) FROM dbo.UserProfiles) AS TotalUsers,
    (SELECT COUNT(*) FROM dbo.UserProfiles u 
     INNER JOIN dbo.LookupRequestStatus rs ON u.StatusId = rs.StatusId 
     WHERE rs.StatusCode = 'ACTIVE') AS ActiveUsers,
    
    -- Pending Items
    (SELECT COUNT(*) FROM dbo.StaffRegistrationRequests sr 
     INNER JOIN dbo.LookupRequestStatus rs ON sr.StatusId = rs.StatusId 
     WHERE rs.StatusCode = 'PENDING') AS PendingStaffRequests;
GO
