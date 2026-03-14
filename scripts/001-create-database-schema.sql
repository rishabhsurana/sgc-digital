-- SGC Digital Database Schema
-- SQL Server / MSSQL
-- Run this script to create the database and all required tables

-- Create Database (run separately if needed)
-- CREATE DATABASE SGCDigital;
-- GO
-- USE SGCDigital;
-- GO

-- =============================================
-- Table: MDAs (Ministries, Departments, Agencies)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MDAs' AND xtype='U')
CREATE TABLE MDAs (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    code NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    contact_email NVARCHAR(255) NULL,
    contact_phone NVARCHAR(50) NULL,
    address NVARCHAR(MAX) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
GO

-- =============================================
-- Table: Users
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
CREATE TABLE Users (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'manager', 'user')),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    mda_id NVARCHAR(36) NULL,
    phone NVARCHAR(50) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    last_login DATETIME2 NULL,
    CONSTRAINT FK_Users_MDA FOREIGN KEY (mda_id) REFERENCES MDAs(id)
);
GO

-- Create index for email lookups
CREATE INDEX IX_Users_Email ON Users(email);
GO

-- =============================================
-- Table: Sessions
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Sessions' AND xtype='U')
CREATE TABLE Sessions (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    user_id NVARCHAR(36) NOT NULL,
    token NVARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ip_address NVARCHAR(50) NULL,
    user_agent NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Sessions_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
GO

-- Create index for token lookups
CREATE INDEX IX_Sessions_Token ON Sessions(token);
CREATE INDEX IX_Sessions_Expiry ON Sessions(expires_at);
GO

-- =============================================
-- Table: Contracts
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Contracts' AND xtype='U')
CREATE TABLE Contracts (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    reference_number NVARCHAR(50) NOT NULL UNIQUE,
    title NVARCHAR(500) NOT NULL,
    description NVARCHAR(MAX) NULL,
    mda_id NVARCHAR(36) NOT NULL,
    contractor_name NVARCHAR(255) NOT NULL,
    contractor_email NVARCHAR(255) NULL,
    contractor_phone NVARCHAR(50) NULL,
    contract_value DECIMAL(18, 2) NOT NULL,
    currency NVARCHAR(3) NOT NULL DEFAULT 'BBD',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'pending_approval', 'approved', 'active', 'completed', 'terminated')),
    assigned_to NVARCHAR(36) NULL,
    created_by NVARCHAR(36) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    approved_by NVARCHAR(36) NULL,
    approved_at DATETIME2 NULL,
    notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Contracts_MDA FOREIGN KEY (mda_id) REFERENCES MDAs(id),
    CONSTRAINT FK_Contracts_AssignedTo FOREIGN KEY (assigned_to) REFERENCES Users(id),
    CONSTRAINT FK_Contracts_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id),
    CONSTRAINT FK_Contracts_ApprovedBy FOREIGN KEY (approved_by) REFERENCES Users(id)
);
GO

-- Create indexes for common queries
CREATE INDEX IX_Contracts_Status ON Contracts(status);
CREATE INDEX IX_Contracts_MDA ON Contracts(mda_id);
CREATE INDEX IX_Contracts_RefNumber ON Contracts(reference_number);
GO

-- =============================================
-- Table: Correspondence
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Correspondence' AND xtype='U')
CREATE TABLE Correspondence (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    reference_number NVARCHAR(50) NOT NULL UNIQUE,
    subject NVARCHAR(500) NOT NULL,
    description NVARCHAR(MAX) NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('incoming', 'outgoing')),
    sender_name NVARCHAR(255) NOT NULL,
    sender_organization NVARCHAR(255) NULL,
    sender_email NVARCHAR(255) NULL,
    recipient_mda_id NVARCHAR(36) NOT NULL,
    date_received DATE NOT NULL,
    date_due DATE NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_progress', 'pending_review', 'completed', 'archived')),
    priority NVARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to NVARCHAR(36) NULL,
    created_by NVARCHAR(36) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    completed_at DATETIME2 NULL,
    notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Correspondence_MDA FOREIGN KEY (recipient_mda_id) REFERENCES MDAs(id),
    CONSTRAINT FK_Correspondence_AssignedTo FOREIGN KEY (assigned_to) REFERENCES Users(id),
    CONSTRAINT FK_Correspondence_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id)
);
GO

-- Create indexes for common queries
CREATE INDEX IX_Correspondence_Status ON Correspondence(status);
CREATE INDEX IX_Correspondence_MDA ON Correspondence(recipient_mda_id);
CREATE INDEX IX_Correspondence_RefNumber ON Correspondence(reference_number);
CREATE INDEX IX_Correspondence_Priority ON Correspondence(priority);
GO

-- =============================================
-- Table: Documents
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Documents' AND xtype='U')
CREATE TABLE Documents (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    entity_type NVARCHAR(20) NOT NULL CHECK (entity_type IN ('contract', 'correspondence')),
    entity_id NVARCHAR(36) NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    original_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type NVARCHAR(100) NOT NULL,
    document_type NVARCHAR(20) NOT NULL DEFAULT 'attachment' CHECK (document_type IN ('contract', 'correspondence', 'attachment', 'other')),
    uploaded_by NVARCHAR(36) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    description NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Documents_UploadedBy FOREIGN KEY (uploaded_by) REFERENCES Users(id)
);
GO

-- Create indexes for document lookups
CREATE INDEX IX_Documents_Entity ON Documents(entity_type, entity_id);
GO

-- =============================================
-- Table: ActivityLog
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityLog' AND xtype='U')
CREATE TABLE ActivityLog (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    user_id NVARCHAR(36) NOT NULL,
    action NVARCHAR(100) NOT NULL,
    entity_type NVARCHAR(50) NOT NULL,
    entity_id NVARCHAR(36) NULL,
    details NVARCHAR(MAX) NULL,
    ip_address NVARCHAR(50) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_ActivityLog_User FOREIGN KEY (user_id) REFERENCES Users(id)
);
GO

-- Create index for activity lookups
CREATE INDEX IX_ActivityLog_User ON ActivityLog(user_id);
CREATE INDEX IX_ActivityLog_Entity ON ActivityLog(entity_type, entity_id);
CREATE INDEX IX_ActivityLog_Date ON ActivityLog(created_at DESC);
GO

-- =============================================
-- Trigger: Update timestamp on Users
-- =============================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Users_UpdateTimestamp')
    DROP TRIGGER TR_Users_UpdateTimestamp;
GO

CREATE TRIGGER TR_Users_UpdateTimestamp
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET updated_at = GETUTCDATE()
    FROM Users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- =============================================
-- Trigger: Update timestamp on Contracts
-- =============================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Contracts_UpdateTimestamp')
    DROP TRIGGER TR_Contracts_UpdateTimestamp;
GO

CREATE TRIGGER TR_Contracts_UpdateTimestamp
ON Contracts
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Contracts
    SET updated_at = GETUTCDATE()
    FROM Contracts c
    INNER JOIN inserted i ON c.id = i.id;
END;
GO

-- =============================================
-- Trigger: Update timestamp on Correspondence
-- =============================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Correspondence_UpdateTimestamp')
    DROP TRIGGER TR_Correspondence_UpdateTimestamp;
GO

CREATE TRIGGER TR_Correspondence_UpdateTimestamp
ON Correspondence
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Correspondence
    SET updated_at = GETUTCDATE()
    FROM Correspondence c
    INNER JOIN inserted i ON c.id = i.id;
END;
GO

-- =============================================
-- Trigger: Update timestamp on MDAs
-- =============================================
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_MDAs_UpdateTimestamp')
    DROP TRIGGER TR_MDAs_UpdateTimestamp;
GO

CREATE TRIGGER TR_MDAs_UpdateTimestamp
ON MDAs
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE MDAs
    SET updated_at = GETUTCDATE()
    FROM MDAs m
    INNER JOIN inserted i ON m.id = i.id;
END;
GO

PRINT 'Database schema created successfully!';
GO
