-- =============================================
-- SGC Digital - Core Database Schema
-- Microsoft SQL Server
-- Version: 1.0
-- =============================================

-- =============================================
-- 1. ORGANIZATIONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='organizations' AND xtype='U')
CREATE TABLE organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    code NVARCHAR(50) NOT NULL UNIQUE,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('ministry', 'department', 'agency', 'statutory_body', 'external')),
    parent_org_id UNIQUEIDENTIFIER NULL REFERENCES organizations(id),
    address NVARCHAR(MAX) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_organizations_code ON organizations(code);
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_parent ON organizations(parent_org_id);

-- =============================================
-- 2. STAFF DEPARTMENTS (Internal SGC)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='staff_departments' AND xtype='U')
CREATE TABLE staff_departments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(20) NOT NULL UNIQUE,
    description NVARCHAR(MAX) NULL,
    head_user_id UNIQUEIDENTIFIER NULL, -- FK added after staff_users created
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 3. STAFF ROLES (Internal SGC)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='staff_roles' AND xtype='U')
CREATE TABLE staff_roles (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(MAX) NULL,
    level INT NOT NULL DEFAULT 1, -- Hierarchy: 1=clerk, 2=officer, 3=senior, 4=dsg, 5=sg
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 4. STAFF PERMISSIONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='staff_permissions' AND xtype='U')
CREATE TABLE staff_permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    code NVARCHAR(100) NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL,
    module NVARCHAR(50) NOT NULL, -- 'correspondence', 'contracts', 'reports', 'admin'
    description NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 5. STAFF ROLE PERMISSIONS (Junction)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='staff_role_permissions' AND xtype='U')
CREATE TABLE staff_role_permissions (
    role_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_roles(id),
    permission_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_permissions(id),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (role_id, permission_id)
);

-- =============================================
-- 6. STAFF USERS (Internal SGC Management)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='staff_users' AND xtype='U')
CREATE TABLE staff_users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    employee_id NVARCHAR(50) NULL UNIQUE,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    title NVARCHAR(100) NULL,
    department_id UNIQUEIDENTIFIER NULL REFERENCES staff_departments(id),
    role_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_roles(id),
    phone NVARCHAR(50) NULL,
    signature_image_path NVARCHAR(500) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    can_approve BIT NOT NULL DEFAULT 0,
    approval_limit DECIMAL(15,2) NULL, -- Contract value approval limit
    last_login_at DATETIME2 NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_staff_users_email ON staff_users(email);
CREATE INDEX idx_staff_users_department ON staff_users(department_id);
CREATE INDEX idx_staff_users_role ON staff_users(role_id);
CREATE INDEX idx_staff_users_active ON staff_users(is_active);

-- Add FK for department head
ALTER TABLE staff_departments ADD CONSTRAINT FK_staff_departments_head 
    FOREIGN KEY (head_user_id) REFERENCES staff_users(id);

-- =============================================
-- 7. PUBLIC USERS (External - MDA Staff & Public)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='public_users' AND xtype='U')
CREATE TABLE public_users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    user_type NVARCHAR(20) NOT NULL CHECK (user_type IN ('individual', 'mda_staff')),
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    title NVARCHAR(100) NULL,
    phone NVARCHAR(50) NULL,
    address NVARCHAR(MAX) NULL,
    primary_organization_id UNIQUEIDENTIFIER NULL REFERENCES organizations(id),
    is_active BIT NOT NULL DEFAULT 1,
    is_verified BIT NOT NULL DEFAULT 0,
    verification_token NVARCHAR(255) NULL,
    verification_expires DATETIME2 NULL,
    password_reset_token NVARCHAR(255) NULL,
    password_reset_expires DATETIME2 NULL,
    last_login_at DATETIME2 NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_public_users_email ON public_users(email);
CREATE INDEX idx_public_users_type ON public_users(user_type);
CREATE INDEX idx_public_users_org ON public_users(primary_organization_id);

-- =============================================
-- 8. PUBLIC USER ORGANIZATIONS (Many-to-Many)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='public_user_organizations' AND xtype='U')
CREATE TABLE public_user_organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL REFERENCES public_users(id),
    organization_id UNIQUEIDENTIFIER NOT NULL REFERENCES organizations(id),
    is_primary BIT NOT NULL DEFAULT 0,
    can_submit_correspondence BIT NOT NULL DEFAULT 1,
    can_submit_contracts BIT NOT NULL DEFAULT 0,
    authorized_by NVARCHAR(255) NULL,
    authorized_at DATETIME2 NULL,
    expires_at DATETIME2 NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_public_user_org UNIQUE (user_id, organization_id)
);

CREATE INDEX idx_public_user_orgs_user ON public_user_organizations(user_id);
CREATE INDEX idx_public_user_orgs_org ON public_user_organizations(organization_id);

-- =============================================
-- 9. USER SESSIONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_sessions' AND xtype='U')
CREATE TABLE user_sessions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    user_type NVARCHAR(20) NOT NULL CHECK (user_type IN ('staff', 'public')),
    token_hash NVARCHAR(255) NOT NULL,
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(MAX) NULL,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_user ON user_sessions(user_id, user_type);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- =============================================
-- 10. LOOKUP VALUES (Reference Data)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='lookup_values' AND xtype='U')
CREATE TABLE lookup_values (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    category NVARCHAR(100) NOT NULL,
    code NVARCHAR(50) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    metadata NVARCHAR(MAX) NULL, -- JSON for additional properties
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_lookup_category_code UNIQUE (category, code)
);

CREATE INDEX idx_lookup_category ON lookup_values(category);

-- =============================================
-- 11. HOLIDAYS (For SLA Calculation)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='holidays' AND xtype='U')
CREATE TABLE holidays (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    date DATE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    year INT NOT NULL,
    is_recurring BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_year ON holidays(year);

-- =============================================
-- 12. SYSTEM SETTINGS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_settings' AND xtype='U')
CREATE TABLE system_settings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [key] NVARCHAR(100) NOT NULL UNIQUE,
    value NVARCHAR(MAX) NULL,
    data_type NVARCHAR(20) NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    category NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX) NULL,
    updated_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_settings_category ON system_settings(category);
GO
