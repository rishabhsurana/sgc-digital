-- =============================================
-- SGC Digital - BPM / Case Management Schema
-- Microsoft SQL Server
-- Version: 1.0
-- =============================================

-- =============================================
-- 1. BPM WORKFLOW DEFINITIONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_workflow_definitions' AND xtype='U')
CREATE TABLE bpm_workflow_definitions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(50) NOT NULL UNIQUE, -- 'CONTRACTS_WORKFLOW', 'CORRESPONDENCE_WORKFLOW'
    module NVARCHAR(30) NOT NULL CHECK (module IN ('contracts', 'correspondence')),
    description NVARCHAR(MAX) NULL,
    version INT NOT NULL DEFAULT 1,
    stages NVARCHAR(MAX) NOT NULL, -- JSON array of stage definitions
    transitions NVARCHAR(MAX) NOT NULL, -- JSON array of allowed transitions
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 2. BPM WORKFLOW STAGES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_workflow_stages' AND xtype='U')
CREATE TABLE bpm_workflow_stages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    workflow_id UNIQUEIDENTIFIER NOT NULL REFERENCES bpm_workflow_definitions(id),
    code NVARCHAR(50) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    sequence_order INT NOT NULL,
    is_parallel BIT NOT NULL DEFAULT 0, -- Can run in parallel with other stages
    allowed_roles NVARCHAR(MAX) NULL, -- JSON array of role codes
    sla_hours INT NULL,
    auto_assign BIT NOT NULL DEFAULT 0,
    auto_assign_rule NVARCHAR(MAX) NULL, -- JSON rules for auto-assignment
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_workflow_stage UNIQUE (workflow_id, code)
);

CREATE INDEX idx_bpm_stages_workflow ON bpm_workflow_stages(workflow_id);

-- =============================================
-- 3. BPM CASES (Unified Case Management)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_cases' AND xtype='U')
CREATE TABLE bpm_cases (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Reference
    case_number NVARCHAR(50) NOT NULL UNIQUE, -- BPM-YYYY-NNNNN
    
    -- Link to source entity
    entity_type NVARCHAR(30) NOT NULL CHECK (entity_type IN ('correspondence', 'contract')),
    entity_id UNIQUEIDENTIFIER NOT NULL,
    
    -- Workflow
    workflow_id UNIQUEIDENTIFIER NOT NULL REFERENCES bpm_workflow_definitions(id),
    current_stage_id UNIQUEIDENTIFIER NULL REFERENCES bpm_workflow_stages(id),
    current_stage_code NVARCHAR(50) NULL,
    
    -- Status
    case_status NVARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (case_status IN (
        'OPEN', 'IN_PROGRESS', 'ON_HOLD', 'PENDING_EXTERNAL', 
        'ESCALATED', 'COMPLETED', 'CANCELLED'
    )),
    
    -- Priority & SLA
    priority NVARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    sla_due_date DATETIME2 NULL,
    sla_status NVARCHAR(20) NULL CHECK (sla_status IN ('on_track', 'at_risk', 'breached')),
    
    -- Assignment
    current_owner_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    current_in_basket NVARCHAR(100) NULL, -- Current work queue
    
    -- Dates
    opened_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    first_response_at DATETIME2 NULL,
    completed_at DATETIME2 NULL,
    
    -- Metadata
    tags NVARCHAR(MAX) NULL, -- JSON array
    custom_fields NVARCHAR(MAX) NULL, -- JSON object
    
    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_bpm_cases_entity ON bpm_cases(entity_type, entity_id);
CREATE INDEX idx_bpm_cases_status ON bpm_cases(case_status);
CREATE INDEX idx_bpm_cases_stage ON bpm_cases(current_stage_code);
CREATE INDEX idx_bpm_cases_owner ON bpm_cases(current_owner_id);
CREATE INDEX idx_bpm_cases_basket ON bpm_cases(current_in_basket);
CREATE INDEX idx_bpm_cases_sla ON bpm_cases(sla_due_date, sla_status);
CREATE INDEX idx_bpm_cases_priority ON bpm_cases(priority);

-- =============================================
-- 4. BPM CASE WORKFLOW HISTORY
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_case_workflow_history' AND xtype='U')
CREATE TABLE bpm_case_workflow_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    case_id UNIQUEIDENTIFIER NOT NULL REFERENCES bpm_cases(id),
    
    -- Stage transition
    from_stage_code NVARCHAR(50) NULL,
    to_stage_code NVARCHAR(50) NOT NULL,
    from_status NVARCHAR(30) NULL,
    to_status NVARCHAR(30) NULL,
    
    -- Actor
    performed_by_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    action_type NVARCHAR(50) NOT NULL, -- 'stage_transition', 'assignment', 'status_change', 'escalation'
    
    -- Details
    notes NVARCHAR(MAX) NULL,
    metadata NVARCHAR(MAX) NULL, -- JSON
    
    -- Timing
    time_in_previous_stage_minutes INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_bpm_history_case ON bpm_case_workflow_history(case_id);
CREATE INDEX idx_bpm_history_date ON bpm_case_workflow_history(created_at);

-- =============================================
-- 5. BPM TASKS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_tasks' AND xtype='U')
CREATE TABLE bpm_tasks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    case_id UNIQUEIDENTIFIER NOT NULL REFERENCES bpm_cases(id),
    
    -- Task details
    task_type NVARCHAR(50) NOT NULL, -- 'review', 'approve', 'draft', 'clarification', 'dispatch'
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    instructions NVARCHAR(MAX) NULL,
    
    -- Assignment
    assigned_to_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    assigned_role_code NVARCHAR(50) NULL, -- If not assigned to specific user
    assigned_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    in_basket NVARCHAR(100) NULL, -- Work queue
    
    -- Status
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'cancelled', 'reassigned'
    )),
    
    -- Priority & SLA
    priority NVARCHAR(20) NOT NULL DEFAULT 'normal',
    due_date DATETIME2 NULL,
    
    -- Completion
    completed_by_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    completed_at DATETIME2 NULL,
    outcome NVARCHAR(50) NULL, -- 'approved', 'rejected', 'returned', etc.
    outcome_notes NVARCHAR(MAX) NULL,
    
    -- Audit
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_bpm_tasks_case ON bpm_tasks(case_id);
CREATE INDEX idx_bpm_tasks_assigned ON bpm_tasks(assigned_to_id);
CREATE INDEX idx_bpm_tasks_basket ON bpm_tasks(in_basket);
CREATE INDEX idx_bpm_tasks_status ON bpm_tasks(status);
CREATE INDEX idx_bpm_tasks_due ON bpm_tasks(due_date);

-- =============================================
-- 6. BPM ACTIVITIES (Timeline)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_activities' AND xtype='U')
CREATE TABLE bpm_activities (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    case_id UNIQUEIDENTIFIER NOT NULL REFERENCES bpm_cases(id),
    
    -- Activity details
    activity_type NVARCHAR(50) NOT NULL, -- 'note', 'email', 'call', 'meeting', 'document', 'status_change', 'assignment'
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    
    -- Actor
    performed_by_id UNIQUEIDENTIFIER NOT NULL,
    performed_by_type NVARCHAR(20) NOT NULL CHECK (performed_by_type IN ('staff', 'public', 'system')),
    
    -- Visibility
    is_internal BIT NOT NULL DEFAULT 1, -- Not visible to public users
    is_system_generated BIT NOT NULL DEFAULT 0,
    
    -- Metadata
    metadata NVARCHAR(MAX) NULL, -- JSON for additional data
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_bpm_activities_case ON bpm_activities(case_id);
CREATE INDEX idx_bpm_activities_type ON bpm_activities(activity_type);
CREATE INDEX idx_bpm_activities_date ON bpm_activities(created_at);

-- =============================================
-- 7. BPM SLA EVENTS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_sla_events' AND xtype='U')
CREATE TABLE bpm_sla_events (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    case_id UNIQUEIDENTIFIER NOT NULL REFERENCES bpm_cases(id),
    
    -- SLA details
    sla_type NVARCHAR(50) NOT NULL, -- 'case_resolution', 'first_response', 'stage_completion'
    stage_code NVARCHAR(50) NULL,
    
    -- Target & Actual
    target_date DATETIME2 NOT NULL,
    actual_date DATETIME2 NULL,
    
    -- Status
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'met', 'breached', 'paused', 'cancelled'
    )),
    
    -- Breach handling
    breach_notified BIT NOT NULL DEFAULT 0,
    breach_notified_at DATETIME2 NULL,
    escalated BIT NOT NULL DEFAULT 0,
    escalated_at DATETIME2 NULL,
    escalated_to_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    
    -- Metadata
    pause_reason NVARCHAR(MAX) NULL,
    total_paused_minutes INT NOT NULL DEFAULT 0,
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_bpm_sla_case ON bpm_sla_events(case_id);
CREATE INDEX idx_bpm_sla_status ON bpm_sla_events(status);
CREATE INDEX idx_bpm_sla_target ON bpm_sla_events(target_date);

-- =============================================
-- 8. BPM ESCALATIONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_escalations' AND xtype='U')
CREATE TABLE bpm_escalations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    case_id UNIQUEIDENTIFIER NOT NULL REFERENCES bpm_cases(id),
    
    -- Escalation details
    escalation_type NVARCHAR(50) NOT NULL, -- 'sla_breach', 'manual', 'priority_change', 'complexity'
    reason NVARCHAR(MAX) NOT NULL,
    
    -- From/To
    escalated_from_id UNIQUEIDENTIFIER NULL REFERENCES staff_users(id),
    escalated_to_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    escalated_to_role NVARCHAR(50) NULL,
    
    -- Status
    status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'acknowledged', 'resolved', 'cancelled'
    )),
    
    -- Resolution
    acknowledged_at DATETIME2 NULL,
    resolved_at DATETIME2 NULL,
    resolution_notes NVARCHAR(MAX) NULL,
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_bpm_escalations_case ON bpm_escalations(case_id);
CREATE INDEX idx_bpm_escalations_to ON bpm_escalations(escalated_to_id);
CREATE INDEX idx_bpm_escalations_status ON bpm_escalations(status);

-- =============================================
-- 9. BPM IN-BASKETS (Work Queues)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_in_baskets' AND xtype='U')
CREATE TABLE bpm_in_baskets (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    code NVARCHAR(100) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    module NVARCHAR(30) NOT NULL CHECK (module IN ('contracts', 'correspondence', 'shared')),
    
    -- Access control
    allowed_roles NVARCHAR(MAX) NULL, -- JSON array of role codes
    allowed_users NVARCHAR(MAX) NULL, -- JSON array of user IDs
    
    -- Configuration
    sort_order INT NOT NULL DEFAULT 0,
    default_sort_field NVARCHAR(50) NULL,
    default_sort_direction NVARCHAR(4) NULL DEFAULT 'DESC',
    
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 10. BPM ASSIGNMENT RULES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bpm_assignment_rules' AND xtype='U')
CREATE TABLE bpm_assignment_rules (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    module NVARCHAR(30) NOT NULL CHECK (module IN ('contracts', 'correspondence')),
    stage_code NVARCHAR(50) NULL,
    
    -- Rule definition
    rule_type NVARCHAR(30) NOT NULL CHECK (rule_type IN (
        'round_robin', 'workload_balance', 'skill_based', 'value_based', 'manual'
    )),
    conditions NVARCHAR(MAX) NULL, -- JSON conditions
    
    -- Assignment target
    target_role_code NVARCHAR(50) NULL,
    target_user_ids NVARCHAR(MAX) NULL, -- JSON array
    target_in_basket NVARCHAR(100) NULL,
    
    priority INT NOT NULL DEFAULT 0, -- Higher = checked first
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_bpm_rules_module ON bpm_assignment_rules(module);
CREATE INDEX idx_bpm_rules_stage ON bpm_assignment_rules(stage_code);
GO
