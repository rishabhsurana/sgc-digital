-- =============================================
-- SGC Digital - Contracts Module Schema
-- Microsoft SQL Server
-- Version: 1.0
-- =============================================

-- =============================================
-- 1. CONTRACT TYPES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_types' AND xtype='U')
CREATE TABLE contract_types (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(MAX) NULL,
    sla_days INT NOT NULL DEFAULT 21,
    requires_legal_review BIT NOT NULL DEFAULT 1,
    requires_dgs_approval BIT NOT NULL DEFAULT 1,
    requires_sg_approval BIT NOT NULL DEFAULT 0,
    value_threshold_legal DECIMAL(15,2) NULL,
    value_threshold_dgs DECIMAL(15,2) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 2. CONTRACTS (Main Table)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contracts' AND xtype='U')
CREATE TABLE contracts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Reference Numbers
    reference_number NVARCHAR(50) NOT NULL UNIQUE, -- CON-YYYY-NNNNN
    transaction_number NVARCHAR(50) NULL, -- ContractTransactionNo
    ministry_contract_number NVARCHAR(100) NULL,
    
    -- Type & Classification
    type_id UNIQUEIDENTIFIER NOT NULL REFERENCES contract_types(id),
    nature_of_contract NVARCHAR(100) NULL, -- NatureOfContract
    contract_category NVARCHAR(50) NULL, -- ContractCategory
    instrument_type NVARCHAR(100) NULL, -- ContractInstrumentType
    title NVARCHAR(500) NOT NULL,
    description NVARCHAR(MAX) NULL,
    
    -- Status & Workflow
    status NVARCHAR(30) NOT NULL DEFAULT 'INTAKE' CHECK (status IN (
        'INTAKE', 'ASSIGNED', 'DRAFTING', 'SUP_REVIEW', 'SENT_MDA',
        'RETURNED_MDA', 'FINAL_SIG', 'EXEC_ADJ', 'ADJ_COMP', 
        'CLOSED', 'RETURNED_CORR', 'REJECTED'
    )),
    workflow_stage NVARCHAR(30) NOT NULL DEFAULT 'INTAKE' CHECK (workflow_stage IN (
        'INTAKE', 'ASSIGN', 'FILE_ASSOC', 'DRAFT', 'MIN_REVIEW', 
        'SIGN', 'ADJUDICATION', 'DISPATCH', 'CLOSEOUT'
    )),
    
    -- Submitter (MDA Staff)
    submitter_id UNIQUEIDENTIFIER NOT NULL REFERENCES public_users(id),
    organization_id UNIQUEIDENTIFIER NOT NULL REFERENCES organizations(id),
    
    -- Assignment (Staff Users)
    assigned_clerk_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id), -- Contracts Intake Officer
    assigned_officer_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id), -- Legal Officer
    supervisor_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id), -- DSG/Supervisor
    sg_reviewer_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    approved_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    
    -- Counterparty Details
    counterparty_name NVARCHAR(255) NOT NULL,
    counterparty_trading_name NVARCHAR(255) NULL,
    counterparty_registration NVARCHAR(100) NULL,
    counterparty_tax_id NVARCHAR(100) NULL,
    counterparty_address NVARCHAR(MAX) NULL,
    counterparty_contact_name NVARCHAR(255) NULL,
    counterparty_email NVARCHAR(255) NULL,
    counterparty_phone NVARCHAR(50) NULL,
    
    -- Financial Details
    contract_value DECIMAL(15,2) NOT NULL,
    currency NVARCHAR(3) NOT NULL DEFAULT 'BBD',
    funding_source NVARCHAR(255) NULL,
    budget_year INT NULL,
    
    -- Procurement
    procurement_method NVARCHAR(50) NULL CHECK (procurement_method IN (
        'open_tender', 'selective_tender', 'limited_tender', 
        'direct_procurement', 'framework_agreement'
    )),
    tender_reference NVARCHAR(100) NULL,
    
    -- Contract Dates
    start_date DATE NULL,
    end_date DATE NULL,
    effective_date DATE NULL,
    expiry_date DATE NULL,
    duration_months INT NULL,
    is_renewable BIT NOT NULL DEFAULT 0,
    renewal_terms NVARCHAR(MAX) NULL,
    
    -- Process Dates
    date_submitted DATETIME2 NULL,
    date_received DATETIME2 NULL,
    date_assigned DATETIME2 NULL,
    due_date DATE NULL,
    date_sent_mda DATETIME2 NULL,
    date_returned_mda DATETIME2 NULL,
    date_signed_sg DATETIME2 NULL,
    date_signed_ministry DATETIME2 NULL,
    date_adjudicated DATETIME2 NULL,
    date_dispatched DATETIME2 NULL,
    date_closed DATETIME2 NULL,
    
    -- File Association
    registry_file_refs NVARCHAR(MAX) NULL, -- JSON array
    file_assoc_status NVARCHAR(20) NULL CHECK (file_assoc_status IN ('pending', 'associated', 'new_file', 'not_required')),
    
    -- Rejection/Return
    rejection_reason NVARCHAR(MAX) NULL,
    return_reason NVARCHAR(MAX) NULL,
    
    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    deleted_at DATETIME2 NULL
);

CREATE INDEX idx_contracts_ref ON contracts(reference_number);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_stage ON contracts(workflow_stage);
CREATE INDEX idx_contracts_submitter ON contracts(submitter_id);
CREATE INDEX idx_contracts_org ON contracts(organization_id);
CREATE INDEX idx_contracts_assigned ON contracts(assigned_officer_id);
CREATE INDEX idx_contracts_type ON contracts(type_id);
CREATE INDEX idx_contracts_due ON contracts(due_date);
CREATE INDEX idx_contracts_value ON contracts(contract_value);

-- =============================================
-- 3. CONTRACT PARTIES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_parties' AND xtype='U')
CREATE TABLE contract_parties (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
    party_type NVARCHAR(30) NOT NULL CHECK (party_type IN (
        'contractor', 'subcontractor', 'guarantor', 'witness', 'joint_venture_partner'
    )),
    party_category NVARCHAR(30) NOT NULL CHECK (party_category IN (
        'company', 'individual', 'government_entity', 'ngo'
    )),
    name NVARCHAR(255) NOT NULL,
    trading_name NVARCHAR(255) NULL,
    registration_number NVARCHAR(100) NULL,
    tax_id NVARCHAR(100) NULL,
    contact_person NVARCHAR(255) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    address NVARCHAR(MAX) NULL,
    country NVARCHAR(100) NULL,
    is_local BIT NOT NULL DEFAULT 1,
    bank_name NVARCHAR(255) NULL,
    bank_account NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_contract_parties_contract ON contract_parties(contract_id);

-- =============================================
-- 4. CONTRACT DELIVERABLES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_deliverables' AND xtype='U')
CREATE TABLE contract_deliverables (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
    deliverable_number INT NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    due_date DATE NULL,
    value DECIMAL(15,2) NULL,
    payment_percentage DECIMAL(5,2) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'delivered', 'accepted', 'rejected'
    )),
    delivered_at DATETIME2 NULL,
    accepted_at DATETIME2 NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_deliverables_contract ON contract_deliverables(contract_id);

-- =============================================
-- 5. CONTRACT STATUS HISTORY
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_status_history' AND xtype='U')
CREATE TABLE contract_status_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
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

CREATE INDEX idx_contract_history_contract ON contract_status_history(contract_id);
CREATE INDEX idx_contract_history_date ON contract_status_history(created_at);

-- =============================================
-- 6. CONTRACT REVIEWS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_reviews' AND xtype='U')
CREATE TABLE contract_reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
    review_type NVARCHAR(30) NOT NULL CHECK (review_type IN (
        'intake_validation', 'legal_review', 'supervisor_review', 
        'dgs_review', 'sg_review', 'compliance_check'
    )),
    reviewer_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'deferred'
    )),
    assigned_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    started_at DATETIME2 NULL,
    completed_at DATETIME2 NULL,
    due_date DATE NULL,
    recommendation NVARCHAR(30) NULL CHECK (recommendation IN (
        'approve', 'approve_with_conditions', 'request_clarification', 
        'reject', 'escalate', 'return_to_mda'
    )),
    conditions NVARCHAR(MAX) NULL,
    findings NVARCHAR(MAX) NULL,
    risk_level NVARCHAR(20) NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    legal_opinion NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_contract_reviews_contract ON contract_reviews(contract_id);
CREATE INDEX idx_contract_reviews_reviewer ON contract_reviews(reviewer_id);
CREATE INDEX idx_contract_reviews_status ON contract_reviews(status);

-- =============================================
-- 7. CONTRACT ISSUES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_issues' AND xtype='U')
CREATE TABLE contract_issues (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
    review_id UNIQUEIDENTIFIER NULL REFERENCES contract_reviews(id),
    issue_type NVARCHAR(30) NOT NULL CHECK (issue_type IN (
        'legal', 'compliance', 'financial', 'technical', 'procedural'
    )),
    severity NVARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    clause_reference NVARCHAR(100) NULL,
    description NVARCHAR(MAX) NOT NULL,
    recommendation NVARCHAR(MAX) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'resolved', 'accepted_risk', 'deferred'
    )),
    raised_by_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    resolved_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    resolution_notes NVARCHAR(MAX) NULL,
    raised_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    resolved_at DATETIME2 NULL
);

CREATE INDEX idx_contract_issues_contract ON contract_issues(contract_id);
CREATE INDEX idx_contract_issues_status ON contract_issues(status);

-- =============================================
-- 8. CONTRACT AMENDMENTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_amendments' AND xtype='U')
CREATE TABLE contract_amendments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
    amendment_number INT NOT NULL,
    reference_number NVARCHAR(50) NOT NULL UNIQUE,
    amendment_type NVARCHAR(30) NOT NULL CHECK (amendment_type IN (
        'value_change', 'time_extension', 'scope_change', 
        'party_change', 'termination', 'other'
    )),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    justification NVARCHAR(MAX) NULL,
    original_value DECIMAL(15,2) NULL,
    value_change DECIMAL(15,2) NULL,
    new_total_value DECIMAL(15,2) NULL,
    original_end_date DATE NULL,
    new_end_date DATE NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'under_review', 'approved', 'rejected'
    )),
    submitted_by_id UNIQUEIDENTIFIER NULL REFERENCES public_users(id),
    reviewed_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    approved_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    submitted_at DATETIME2 NULL,
    approved_at DATETIME2 NULL,
    effective_date DATE NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_amendments_contract ON contract_amendments(contract_id);

-- =============================================
-- 9. CONTRACT APPROVALS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_approvals' AND xtype='U')
CREATE TABLE contract_approvals (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
    approval_stage NVARCHAR(30) NOT NULL CHECK (approval_stage IN (
        'intake', 'legal_officer', 'supervisor', 'dgs', 'sg', 'minister'
    )),
    approver_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'deferred', 'skipped'
    )),
    decision_date DATETIME2 NULL,
    conditions NVARCHAR(MAX) NULL,
    rejection_reason NVARCHAR(MAX) NULL,
    signature_reference NVARCHAR(255) NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_approvals_contract ON contract_approvals(contract_id);
CREATE INDEX idx_approvals_approver ON contract_approvals(approver_id);

-- =============================================
-- 10. CONTRACT CHECKLISTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_checklist_items' AND xtype='U')
CREATE TABLE contract_checklist_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_type_id UNIQUEIDENTIFIER NULL REFERENCES contract_types(id),
    checklist_category NVARCHAR(30) NOT NULL CHECK (checklist_category IN (
        'legal', 'compliance', 'financial', 'procedural'
    )),
    item_text NVARCHAR(500) NOT NULL,
    is_mandatory BIT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contract_checklist_responses' AND xtype='U')
CREATE TABLE contract_checklist_responses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    contract_id UNIQUEIDENTIFIER NOT NULL REFERENCES contracts(id),
    checklist_item_id UNIQUEIDENTIFIER NOT NULL REFERENCES contract_checklist_items(id),
    review_id UNIQUEIDENTIFIER NULL REFERENCES contract_reviews(id),
    response NVARCHAR(20) NOT NULL CHECK (response IN ('yes', 'no', 'na', 'pending')),
    notes NVARCHAR(MAX) NULL,
    checked_by_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    checked_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_checklist_responses_contract ON contract_checklist_responses(contract_id);
GO
