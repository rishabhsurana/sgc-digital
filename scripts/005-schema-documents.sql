-- =============================================
-- SGC Digital - Documents & Communications Schema
-- Microsoft SQL Server
-- Version: 1.0
-- =============================================

-- =============================================
-- 1. DOCUMENTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='documents' AND xtype='U')
CREATE TABLE documents (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- File info
    filename NVARCHAR(255) NOT NULL,
    original_filename NVARCHAR(255) NOT NULL,
    storage_path NVARCHAR(500) NOT NULL,
    storage_provider NVARCHAR(30) NOT NULL DEFAULT 'local' CHECK (storage_provider IN ('local', 'azure_blob', 's3', 'vercel_blob')),
    mime_type NVARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    checksum NVARCHAR(64) NULL, -- SHA-256
    
    -- Classification
    document_type NVARCHAR(50) NOT NULL CHECK (document_type IN (
        'submission', 'supporting_document', 'contract_draft', 'signed_contract',
        'legal_opinion', 'correspondence', 'response', 'amendment', 
        'template', 'internal_memo', 'other'
    )),
    
    -- Security
    is_confidential BIT NOT NULL DEFAULT 0,
    security_classification NVARCHAR(30) NULL,
    
    -- Virus scanning
    virus_scanned BIT NOT NULL DEFAULT 0,
    virus_scan_date DATETIME2 NULL,
    virus_clean BIT NULL,
    
    -- Metadata
    description NVARCHAR(MAX) NULL,
    version INT NOT NULL DEFAULT 1,
    parent_document_id UNIQUEIDENTIFIER NULL REFERENCES documents(id),
    
    -- Audit
    uploaded_by_id UNIQUEIDENTIFIER NOT NULL,
    uploaded_by_type NVARCHAR(20) NOT NULL CHECK (uploaded_by_type IN ('staff', 'public')),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded ON documents(uploaded_by_id, uploaded_by_type);

-- =============================================
-- 2. CORRESPONDENCE DOCUMENTS (Junction)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='correspondence_documents' AND xtype='U')
CREATE TABLE correspondence_documents (
    correspondence_id UNIQUEIDENTIFIER NOT NULL REFERENCES correspondence(id),
    document_id UNIQUEIDENTIFIER NOT NULL REFERENCES documents(id),
    document_category NVARCHAR(30) NOT NULL CHECK (document_category IN (
        'submission', 'response', 'attachment', 'internal'
    )),
    added_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    added_by_id UNIQUEIDENTIFIER NOT NULL,
    added_by_type NVARCHAR(20) NOT NULL CHECK (added_by_type IN ('staff', 'public')),
    PRIMARY KEY (correspondence_id, document_id)
);

-- =============================================
-- 3. CONTRACT DOCUMENTS (Junction)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_documents' AND xtype='U')
CREATE TABLE contract_documents (
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
    document_id UNIQUEIDENTIFIER NOT NULL REFERENCES documents(id),
    document_category NVARCHAR(30) NOT NULL CHECK (document_category IN (
        'submission', 'draft', 'final', 'signed', 'amendment', 'supporting', 'internal'
    )),
    added_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    added_by_id UNIQUEIDENTIFIER NOT NULL,
    added_by_type NVARCHAR(20) NOT NULL CHECK (added_by_type IN ('staff', 'public')),
    PRIMARY KEY (contract_id, document_id)
);

-- =============================================
-- 4. COMMENTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='comments' AND xtype='U')
CREATE TABLE comments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    entity_type NVARCHAR(30) NOT NULL CHECK (entity_type IN ('correspondence', 'contract', 'case', 'task')),
    entity_id UNIQUEIDENTIFIER NOT NULL,
    parent_comment_id UNIQUEIDENTIFIER NULL REFERENCES comments(id),
    
    content NVARCHAR(MAX) NOT NULL,
    is_internal BIT NOT NULL DEFAULT 1, -- Not visible to public
    
    -- Mentions
    mentioned_user_ids NVARCHAR(MAX) NULL, -- JSON array
    
    -- Author
    author_id UNIQUEIDENTIFIER NOT NULL,
    author_type NVARCHAR(20) NOT NULL CHECK (author_type IN ('staff', 'public')),
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_author ON comments(author_id, author_type);

-- =============================================
-- 5. NOTIFICATIONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notifications' AND xtype='U')
CREATE TABLE notifications (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Recipient
    user_id UNIQUEIDENTIFIER NOT NULL,
    user_type NVARCHAR(20) NOT NULL CHECK (user_type IN ('staff', 'public')),
    
    -- Content
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    notification_type NVARCHAR(30) NOT NULL CHECK (notification_type IN (
        'info', 'warning', 'action_required', 'success', 'error'
    )),
    
    -- Link
    entity_type NVARCHAR(30) NULL,
    entity_id UNIQUEIDENTIFIER NULL,
    action_url NVARCHAR(500) NULL,
    
    -- Status
    is_read BIT NOT NULL DEFAULT 0,
    read_at DATETIME2 NULL,
    
    -- Delivery
    email_sent BIT NOT NULL DEFAULT 0,
    email_sent_at DATETIME2 NULL,
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, user_type, is_read) WHERE is_read = 0;

-- =============================================
-- 6. EMAIL LOGS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='email_logs' AND xtype='U')
CREATE TABLE email_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Recipient
    recipient_email NVARCHAR(255) NOT NULL,
    recipient_user_id UNIQUEIDENTIFIER NULL,
    recipient_user_type NVARCHAR(20) NULL,
    
    -- Content
    subject NVARCHAR(500) NOT NULL,
    body NVARCHAR(MAX) NOT NULL,
    template_name NVARCHAR(100) NULL,
    
    -- Context
    entity_type NVARCHAR(30) NULL,
    entity_id UNIQUEIDENTIFIER NULL,
    
    -- Status
    status NVARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'sent', 'failed', 'bounced'
    )),
    sent_at DATETIME2 NULL,
    error_message NVARCHAR(MAX) NULL,
    
    -- Metadata
    metadata NVARCHAR(MAX) NULL, -- JSON
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_entity ON email_logs(entity_type, entity_id);
GO
