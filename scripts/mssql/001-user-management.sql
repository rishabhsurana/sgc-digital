-- =============================================
-- SGC Digital - User Management Tables
-- MS SQL Server Schema
-- =============================================

-- Lookup: User Roles
CREATE TABLE dbo.LookupUserRoles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleCode NVARCHAR(50) NOT NULL UNIQUE,
    RoleName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Entity Types (Ministry, Court, Public, Attorney, Company, etc.)
CREATE TABLE dbo.LookupEntityTypes (
    EntityTypeId INT IDENTITY(1,1) PRIMARY KEY,
    EntityTypeCode NVARCHAR(50) NOT NULL UNIQUE,
    EntityTypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    RequiresApproval BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Departments/MDAs
CREATE TABLE dbo.LookupDepartments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentCode NVARCHAR(50) NOT NULL UNIQUE,
    DepartmentName NVARCHAR(200) NOT NULL,
    Ministry NVARCHAR(200) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Lookup: Request/Registration Status
CREATE TABLE dbo.LookupRequestStatus (
    StatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Core User Tables
-- =============================================

-- User Profiles (main user table)
CREATE TABLE dbo.UserProfiles (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    PasswordSalt NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(50) NULL,
    
    -- Entity/Organization Info
    EntityTypeId INT NOT NULL REFERENCES dbo.LookupEntityTypes(EntityTypeId),
    EntityNumber NVARCHAR(50) NOT NULL UNIQUE, -- e.g., MDA-001, PUB-001, ATT-001
    OrganizationName NVARCHAR(200) NULL,
    DepartmentId INT NULL REFERENCES dbo.LookupDepartments(DepartmentId),
    Position NVARCHAR(100) NULL,
    
    -- Role and Status
    RoleId INT NOT NULL REFERENCES dbo.LookupUserRoles(RoleId),
    StatusId INT NOT NULL REFERENCES dbo.LookupRequestStatus(StatusId),
    
    -- Email Verification
    EmailVerified BIT NOT NULL DEFAULT 0,
    EmailVerificationToken NVARCHAR(255) NULL,
    EmailVerificationExpiry DATETIME2 NULL,
    
    -- Password Reset
    PasswordResetToken NVARCHAR(255) NULL,
    PasswordResetExpiry DATETIME2 NULL,
    
    -- Audit
    LastLoginAt DATETIME2 NULL,
    FailedLoginAttempts INT NOT NULL DEFAULT 0,
    LockedUntil DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL
);

-- Staff Registration Requests (for management portal access)
CREATE TABLE dbo.StaffRegistrationRequests (
    RequestId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RequestNumber NVARCHAR(50) NOT NULL UNIQUE, -- e.g., REQ-2024-001
    
    -- Personal Info
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NULL,
    
    -- Employment Info
    DepartmentId INT NOT NULL REFERENCES dbo.LookupDepartments(DepartmentId),
    Position NVARCHAR(100) NOT NULL,
    EmployeeId NVARCHAR(50) NULL,
    SupervisorName NVARCHAR(200) NULL,
    SupervisorEmail NVARCHAR(255) NULL,
    
    -- Request Details
    RequestedRoleId INT NOT NULL REFERENCES dbo.LookupUserRoles(RoleId),
    Justification NVARCHAR(MAX) NULL,
    
    -- Status
    StatusId INT NOT NULL REFERENCES dbo.LookupRequestStatus(StatusId),
    ReviewedBy UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    ReviewedAt DATETIME2 NULL,
    ReviewNotes NVARCHAR(MAX) NULL,
    
    -- If approved, link to created user
    ApprovedUserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Authorized Users (additional users for an entity/organization)
CREATE TABLE dbo.AuthorizedUsers (
    AuthorizedUserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PrimaryUserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Authorized Person Info
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NULL,
    Position NVARCHAR(100) NULL,
    
    -- Permissions
    CanSubmit BIT NOT NULL DEFAULT 1,
    CanView BIT NOT NULL DEFAULT 1,
    CanEdit BIT NOT NULL DEFAULT 0,
    
    -- Status
    StatusId INT NOT NULL REFERENCES dbo.LookupRequestStatus(StatusId),
    
    -- If they register, link to their user profile
    LinkedUserId UNIQUEIDENTIFIER NULL REFERENCES dbo.UserProfiles(UserId),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId)
);

-- User Sessions (for session management)
CREATE TABLE dbo.UserSessions (
    SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.UserProfiles(UserId),
    SessionToken NVARCHAR(255) NOT NULL UNIQUE,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastActivityAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IX_UserProfiles_Email ON dbo.UserProfiles(Email);
CREATE INDEX IX_UserProfiles_EntityNumber ON dbo.UserProfiles(EntityNumber);
CREATE INDEX IX_UserProfiles_StatusId ON dbo.UserProfiles(StatusId);
CREATE INDEX IX_UserProfiles_RoleId ON dbo.UserProfiles(RoleId);
CREATE INDEX IX_StaffRegistrationRequests_Email ON dbo.StaffRegistrationRequests(Email);
CREATE INDEX IX_StaffRegistrationRequests_StatusId ON dbo.StaffRegistrationRequests(StatusId);
CREATE INDEX IX_AuthorizedUsers_PrimaryUserId ON dbo.AuthorizedUsers(PrimaryUserId);
CREATE INDEX IX_AuthorizedUsers_Email ON dbo.AuthorizedUsers(Email);
CREATE INDEX IX_UserSessions_UserId ON dbo.UserSessions(UserId);
CREATE INDEX IX_UserSessions_SessionToken ON dbo.UserSessions(SessionToken);

-- =============================================
-- Seed Lookup Data
-- =============================================

-- User Roles
INSERT INTO dbo.LookupUserRoles (RoleCode, RoleName, Description) VALUES
('PUBLIC_USER', 'Public User', 'General public user'),
('ATTORNEY', 'Attorney', 'Legal attorney'),
('COMPANY', 'Company Representative', 'Company or organization representative'),
('MDA_USER', 'MDA User', 'Ministry/Department/Agency user'),
('STAFF', 'Staff', 'SGC Staff member'),
('SUPERVISOR', 'Supervisor', 'SGC Supervisor'),
('ADMIN', 'Administrator', 'System administrator'),
('SUPER_ADMIN', 'Super Administrator', 'Full system access');

-- Entity Types
INSERT INTO dbo.LookupEntityTypes (EntityTypeCode, EntityTypeName, Description, RequiresApproval) VALUES
('MINISTRY', 'Ministry', 'Government Ministry', 0),
('COURT', 'Court', 'Judicial Court', 0),
('STATUTORY_BODY', 'Statutory Body', 'Statutory Corporation or Body', 0),
('PUBLIC', 'Public', 'General Public', 0),
('ATTORNEY', 'Attorney', 'Legal Attorney/Law Firm', 1),
('COMPANY', 'Company', 'Private Company or Organization', 1);

-- Request Status
INSERT INTO dbo.LookupRequestStatus (StatusCode, StatusName, Description) VALUES
('PENDING', 'Pending', 'Awaiting review'),
('APPROVED', 'Approved', 'Request approved'),
('REJECTED', 'Rejected', 'Request rejected'),
('SUSPENDED', 'Suspended', 'Account suspended'),
('ACTIVE', 'Active', 'Active and operational'),
('INACTIVE', 'Inactive', 'Inactive or disabled');

-- Sample Departments
INSERT INTO dbo.LookupDepartments (DepartmentCode, DepartmentName, Ministry) VALUES
('SGC', 'Solicitor General''s Chambers', 'Office of the Attorney General'),
('AG', 'Attorney General''s Office', 'Office of the Attorney General'),
('MOF', 'Ministry of Finance', 'Ministry of Finance'),
('MOH', 'Ministry of Health', 'Ministry of Health'),
('MOE', 'Ministry of Education', 'Ministry of Education'),
('MHTE', 'Ministry of Housing, Lands and Environment', 'Ministry of Housing'),
('MIT', 'Ministry of International Trade', 'Ministry of International Trade'),
('MPS', 'Ministry of Public Service', 'Ministry of Public Service');
