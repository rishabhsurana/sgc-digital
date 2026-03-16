-- =============================================
-- SGC Digital - Audit & Reporting Schema
-- Microsoft SQL Server
-- Version: 1.0
-- =============================================

-- =============================================
-- 1. AUDIT LOGS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='audit_logs' AND xtype='U')
CREATE TABLE audit_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Actor
    user_id UNIQUEIDENTIFIER NULL,
    user_type NVARCHAR(20) NULL CHECK (user_type IN ('staff', 'public', 'system')),
    user_email NVARCHAR(255) NULL,
    
    -- Action
    action NVARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', 'login', 'logout', 'approve', 'reject'
    action_category NVARCHAR(30) NOT NULL, -- 'data', 'auth', 'workflow', 'admin'
    
    -- Target
    entity_type NVARCHAR(100) NOT NULL,
    entity_id UNIQUEIDENTIFIER NULL,
    entity_ref NVARCHAR(100) NULL, -- Human-readable reference
    
    -- Changes
    old_values NVARCHAR(MAX) NULL, -- JSON
    new_values NVARCHAR(MAX) NULL, -- JSON
    
    -- Context
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(MAX) NULL,
    session_id UNIQUEIDENTIFIER NULL,
    
    -- Metadata
    metadata NVARCHAR(MAX) NULL, -- JSON
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, user_type);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_date ON audit_logs(created_at);

-- Partition by date for performance (optional - implement based on SQL Server version)
-- Consider partitioning audit_logs by created_at for large datasets

-- =============================================
-- 2. REPORT DEFINITIONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='report_definitions' AND xtype='U')
CREATE TABLE report_definitions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Basic info
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    report_type NVARCHAR(30) NOT NULL CHECK (report_type IN (
        'correspondence', 'contracts', 'combined', 'performance', 'custom'
    )),
    
    -- Configuration
    query_config NVARCHAR(MAX) NOT NULL, -- JSON: filters, columns, groupings
    visualization_type NVARCHAR(30) NOT NULL CHECK (visualization_type IN (
        'table', 'bar_chart', 'pie_chart', 'line_chart', 'summary', 'dashboard'
    )),
    
    -- Access
    is_public BIT NOT NULL DEFAULT 0, -- Available to all staff
    allowed_roles NVARCHAR(MAX) NULL, -- JSON array of role codes
    
    -- Scheduling
    is_scheduled BIT NOT NULL DEFAULT 0,
    schedule_cron NVARCHAR(100) NULL,
    schedule_recipients NVARCHAR(MAX) NULL, -- JSON array of emails
    last_scheduled_run DATETIME2 NULL,
    
    -- Audit
    created_by_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_reports_type ON report_definitions(report_type);
CREATE INDEX idx_reports_created_by ON report_definitions(created_by_id);

-- =============================================
-- 3. REPORT EXECUTIONS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='report_executions' AND xtype='U')
CREATE TABLE report_executions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    report_id UNIQUEIDENTIFIER NOT NULL REFERENCES report_definitions(id),
    
    -- Execution details
    executed_by_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    parameters NVARCHAR(MAX) NULL, -- JSON runtime parameters
    
    -- Results
    result_summary NVARCHAR(MAX) NULL, -- JSON summary metrics
    row_count INT NULL,
    execution_time_ms INT NULL,
    
    -- Export
    export_format NVARCHAR(20) NULL CHECK (export_format IN ('view', 'csv', 'excel', 'pdf')),
    export_file_path NVARCHAR(500) NULL,
    
    -- Status
    status NVARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN (
        'running', 'completed', 'failed'
    )),
    error_message NVARCHAR(MAX) NULL,
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    completed_at DATETIME2 NULL
);

CREATE INDEX idx_report_exec_report ON report_executions(report_id);
CREATE INDEX idx_report_exec_user ON report_executions(executed_by_id);
CREATE INDEX idx_report_exec_date ON report_executions(created_at);

-- =============================================
-- 4. AI QUERY LOGS (For OpenAI Natural Language Queries)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ai_query_logs' AND xtype='U')
CREATE TABLE ai_query_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- User
    user_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    
    -- Query
    natural_language_query NVARCHAR(MAX) NOT NULL,
    generated_sql NVARCHAR(MAX) NULL,
    
    -- Execution
    was_executed BIT NOT NULL DEFAULT 0,
    result_count INT NULL,
    
    -- AI metrics
    model_used NVARCHAR(100) NULL,
    tokens_used INT NULL,
    response_time_ms INT NULL,
    
    -- Feedback
    user_rating INT NULL CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback NVARCHAR(MAX) NULL,
    
    -- Safety
    was_blocked BIT NOT NULL DEFAULT 0,
    block_reason NVARCHAR(255) NULL,
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_ai_query_user ON ai_query_logs(user_id);
CREATE INDEX idx_ai_query_date ON ai_query_logs(created_at);

-- =============================================
-- 5. DASHBOARD WIDGETS
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='dashboard_widgets' AND xtype='U')
CREATE TABLE dashboard_widgets (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Basic info
    name NVARCHAR(100) NOT NULL,
    widget_type NVARCHAR(30) NOT NULL CHECK (widget_type IN (
        'counter', 'chart', 'list', 'table', 'timeline', 'gauge'
    )),
    
    -- Configuration
    query_config NVARCHAR(MAX) NOT NULL, -- JSON
    visualization_config NVARCHAR(MAX) NULL, -- JSON
    refresh_interval_seconds INT NULL,
    
    -- Access
    module NVARCHAR(30) NOT NULL CHECK (module IN ('contracts', 'correspondence', 'shared')),
    allowed_roles NVARCHAR(MAX) NULL, -- JSON
    
    -- Layout
    default_width INT NOT NULL DEFAULT 1, -- Grid units
    default_height INT NOT NULL DEFAULT 1,
    
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- 6. USER DASHBOARD PREFERENCES
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_dashboard_preferences' AND xtype='U')
CREATE TABLE user_dashboard_preferences (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL REFERENCES staff_users(id),
    
    -- Layout
    dashboard_type NVARCHAR(30) NOT NULL CHECK (dashboard_type IN ('contracts', 'correspondence', 'main')),
    layout_config NVARCHAR(MAX) NOT NULL, -- JSON: widget positions and sizes
    
    -- Preferences
    default_filters NVARCHAR(MAX) NULL, -- JSON
    theme_overrides NVARCHAR(MAX) NULL, -- JSON
    
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT UQ_user_dashboard UNIQUE (user_id, dashboard_type)
);
GO
