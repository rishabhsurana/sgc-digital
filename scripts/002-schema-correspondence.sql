-- =============================================
-- SGC Digital - Correspondence Module Schema
-- Microsoft SQL Server
-- Version: 1.0
-- =============================================

-- =============================================
-- 1. CORRESPONDENCE TYPES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='correspondence_types' AND xtype='U')
CREATE TABLE correspondence_types (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(MAX) NULL,
    sla_days INT NOT NULL DEFAULT 14,
    requires_sg_review BIT NOT NULL DEFAULT 0,
    requires_dsg_review BIT NOT NULL DEFAULT 1,
    is_confidential BIT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 2. CORRESPONDENCE (Main Table)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='correspondence' AND xtype='U')
CREATE TABLE correspondence (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Reference Numbers
    reference_number NVARCHAR(50) NOT NULL UNIQUE, -- REG-YYYY-NNNNN
    tracking_number NVARCHAR(50) NULL, -- External tracking
    
    -- Type & Classification
    type_id UNIQUEIDENTIFIER NOT NULL REFERENCES correspondence_types(id),
    subject NVARCHAR(500) NOT NULL,
    description NVARCHAR(MAX) NULL,
    
    -- Urgency & Security
    urgency_level NVARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (urgency_level IN ('normal', 'urgent', 'critical')),
    is_confidential BIT NOT NULL DEFAULT 0,
    security_profile NVARCHAR(50) NULL, -- 'cabinet', 'restricted', 'standard'
    
    -- Status & Workflow
    status NVARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (status IN (
        'NEW', 'PENDING_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 
        'PENDING_EXTERNAL', 'ON_HOLD', 'CLOSED', 'CANCELLED'
    )),
    workflow_stage NVARCHAR(30) NOT NULL DEFAULT 'INTAKE' CHECK (workflow_stage IN (
        'INTAKE', 'SG_DSG_REVIEW', 'FILE_ASSOC', 'PROCESSING', 
        'APPROVAL', 'DISPATCH', 'CLOSED'
    )),
    
    -- Submitter (Public User)
    submitter_id UNIQUEIDENTIFIER NOT NULL REFERENCES public_users(id),
    submitter_type NVARCHAR(20) NOT NULL CHECK (submitter_type IN ('individual', 'mda_staff')),
    organization_id UNIQUEIDENTIFIER NULL REFERENCES organizations(id),
    
    -- Assignment (Staff Users)
    assigned_clerk_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    assigned_officer_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    reviewed_by_sg BIT NOT NULL DEFAULT 0,
    reviewed_by_dsg BIT NOT NULL DEFAULT 0,
    sg_directive NVARCHAR(MAX) NULL,
    dsg_directive NVARCHAR(MAX) NULL,
    
    -- Dates
    date_submitted DATETIME2 NULL,
    date_received DATETIME2 NULL,
    date_assigned DATETIME2 NULL,
    due_date DATE NULL,
    bring_up_date DATE NULL,
    date_dispatched DATETIME2 NULL,
    date_closed DATETIME2 NULL,
    
    -- File Association
    registry_file_refs NVARCHAR(MAX) NULL, -- JSON array of file references
    file_assoc_status NVARCHAR(20) NULL CHECK (file_assoc_status IN ('pending', 'associated', 'new_file', 'not_required')),
    
    -- Closure
    closure_reason NVARCHAR(MAX) NULL,
    
    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

CREATE INDEX idx_correspondence_ref ON correspondence(reference_number);
CREATE INDEX idx_correspondence_status ON correspondence(status);
CREATE INDEX idx_correspondence_stage ON correspondence(workflow_stage);
CREATE INDEX idx_correspondence_submitter ON correspondence(submitter_id);
CREATE INDEX idx_correspondence_org ON correspondence(organization_id);
CREATE INDEX idx_correspondence_assigned ON correspondence(assigned_officer_id);
CREATE INDEX idx_correspondence_type ON correspondence(type_id);
CREATE INDEX idx_correspondence_due ON correspondence(due_date);
CREATE INDEX idx_correspondence_urgent ON correspondence(urgency_level);

-- =============================================
-- 3. CORRESPONDENCE PARTIES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='correspondence_parties' AND xtype='U')
CREATE TABLE correspondence_parties (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    correspondence_id UNIQUEIDENTIFIER NOT NULL REFERENCES correspondence(id),
    party_type NVARCHAR(30) NOT NULL CHECK (party_type IN ('claimant', 'defendant', 'third_party', 'cc', 'interested_party')),
    name NVARCHAR(255) NOT NULL,
    organization NVARCHAR(255) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    address NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_corr_parties_corr ON correspondence_parties(correspondence_id);

-- =============================================
-- 4. CORRESPONDENCE STATUS HISTORY
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='correspondence_status_history' AND xtype='U')
CREATE TABLE correspondence_status_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    correspondence_id UNIQUEIDENTIFIER NOT NULL REFERENCES correspondence(id),
    from_status NVARCHAR(30) NULL,
    to_status NVARCHAR(30) NOT NULL,
    from_stage NVARCHAR(30) NULL,
    to_stage NVARCHAR(30) NULL,
    changed_by_id UNIQUEIDENTIFIER NOT NULL,
    changed_by_type NVARCHAR(20) NOT NULL CHECK (changed_by_type IN ('staff', 'public', 'system')),
    reason NVARCHAR(MAX) NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_corr_history_corr ON correspondence_status_history(correspondence_id);
CREATE INDEX idx_corr_history_date ON correspondence_status_history(created_at);

-- =============================================
-- 5. CORRESPONDENCE REVIEWS (SG/DSG)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='correspondence_reviews' AND xtype='U')
CREATE TABLE correspondence_reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    correspondence_id UNIQUEIDENTIFIER NOT NULL REFERENCES correspondence(id),
    review_type NVARCHAR(30) NOT NULL CHECK (review_type IN ('sg_review', 'dsg_review', 'daily_mail')),
    reviewer_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    directive NVARCHAR(MAX) NULL,
    assigned_officer_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    priority_flag BIT NOT NULL DEFAULT 0,
    reviewed_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_corr_reviews_corr ON correspondence_reviews(correspondence_id);
CREATE INDEX idx_corr_reviews_reviewer ON correspondence_reviews(reviewer_id);

-- =============================================
-- 6. CORRESPONDENCE RESPONSES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='correspondence_responses' AND xtype='U')
CREATE TABLE correspondence_responses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    correspondence_id UNIQUEIDENTIFIER NOT NULL REFERENCES correspondence(id),
    response_type NVARCHAR(30) NOT NULL CHECK (response_type IN ('draft', 'final', 'outgoing', 'incoming')),
    subject NVARCHAR(500) NULL,
    content NVARCHAR(MAX) NULL,
    prepared_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    approved_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    requires_approval BIT NOT NULL DEFAULT 0,
    approval_status NVARCHAR(20) NULL CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_at DATETIME2 NULL,
    dispatched_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_corr_responses_corr ON correspondence_responses(correspondence_id);

-- =============================================
-- 7. CLARIFICATION REQUESTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='clarification_requests' AND xtype='U')
CREATE TABLE clarification_requests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    entity_type NVARCHAR(20) NOT NULL CHECK (entity_type IN ('correspondence', 'contract')),
    entity_id UNIQUEIDENTIFIER NOT NULL,
    question NVARCHAR(MAX) NOT NULL,
    response NVARCHAR(MAX) NULL,
    requested_by_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    responded_by_id UNIQUEIDENTIFIER NULL REFERENCES public_users(id),
    due_date DATE NULL,
    requested_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    responded_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_clarification_entity ON clarification_requests(entity_type, entity_id);
GO
