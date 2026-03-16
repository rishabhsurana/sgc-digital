-- =============================================
-- SGC Digital - Seed Data
-- Microsoft SQL Server
-- Version: 1.0
-- =============================================

-- =============================================
-- 1. STAFF ROLES
-- =============================================
INSERT INTO staff_roles (id, name, code, description, level) VALUES
(NEWID(), 'Registry Clerk', 'registry_clerk', 'Intake and dispatch of correspondence and contracts', 1),
(NEWID(), 'Registry Senior Clerk', 'registry_senior_clerk', 'Senior registry operations and file management', 2),
(NEWID(), 'Contracts Intake Officer', 'contracts_intake', 'Contracts intake validation and processing', 1),
(NEWID(), 'Legal Officer', 'legal_officer', 'Legal review and drafting', 2),
(NEWID(), 'Senior Legal Officer', 'senior_legal_officer', 'Senior legal review and supervision', 3),
(NEWID(), 'Legal Assistant', 'legal_assistant', 'Administrative support for legal officers', 1),
(NEWID(), 'Deputy Solicitor General', 'dsg', 'Deputy head - reviews and approvals', 4),
(NEWID(), 'Solicitor General', 'sg', 'Head of SGC - final approvals', 5),
(NEWID(), 'SG Secretary', 'sg_secretary', 'Administrative support for SG', 2),
(NEWID(), 'System Administrator', 'admin', 'System configuration and user management', 5);

-- =============================================
-- 2. STAFF DEPARTMENTS
-- =============================================
INSERT INTO staff_departments (id, name, code, description) VALUES
(NEWID(), 'Registry', 'REGISTRY', 'Document intake, filing, and dispatch'),
(NEWID(), 'Contracts Division', 'CONTRACTS', 'Government contract review and drafting'),
(NEWID(), 'Legal Advisory', 'ADVISORY', 'Legal opinions and advice'),
(NEWID(), 'Litigation', 'LITIGATION', 'Court matters and disputes'),
(NEWID(), 'International Law', 'INTL_LAW', 'International treaties and agreements'),
(NEWID(), 'Office of the SG', 'SG_OFFICE', 'Solicitor General office'),
(NEWID(), 'Administration', 'ADMIN', 'Administrative support');

-- =============================================
-- 3. STAFF PERMISSIONS
-- =============================================
-- Correspondence permissions
INSERT INTO staff_permissions (id, code, name, module, description) VALUES
(NEWID(), 'correspondence.view', 'View Correspondence', 'correspondence', 'View correspondence submissions'),
(NEWID(), 'correspondence.create', 'Create Correspondence', 'correspondence', 'Create correspondence cases'),
(NEWID(), 'correspondence.assign', 'Assign Correspondence', 'correspondence', 'Assign correspondence to officers'),
(NEWID(), 'correspondence.process', 'Process Correspondence', 'correspondence', 'Process and respond to correspondence'),
(NEWID(), 'correspondence.approve', 'Approve Correspondence', 'correspondence', 'Approve outgoing correspondence'),
(NEWID(), 'correspondence.dispatch', 'Dispatch Correspondence', 'correspondence', 'Dispatch completed correspondence'),
(NEWID(), 'correspondence.close', 'Close Correspondence', 'correspondence', 'Close correspondence cases'),

-- Contracts permissions
(NEWID(), 'contracts.view', 'View Contracts', 'contracts', 'View contract submissions'),
(NEWID(), 'contracts.create', 'Create Contracts', 'contracts', 'Create contract cases'),
(NEWID(), 'contracts.assign', 'Assign Contracts', 'contracts', 'Assign contracts to officers'),
(NEWID(), 'contracts.draft', 'Draft Contracts', 'contracts', 'Draft and edit contracts'),
(NEWID(), 'contracts.review', 'Review Contracts', 'contracts', 'Legal review of contracts'),
(NEWID(), 'contracts.approve', 'Approve Contracts', 'contracts', 'Approve contracts'),
(NEWID(), 'contracts.sign', 'Sign Contracts', 'contracts', 'Digital signature authority'),
(NEWID(), 'contracts.adjudicate', 'Adjudicate Contracts', 'contracts', 'Handle contract adjudication'),
(NEWID(), 'contracts.close', 'Close Contracts', 'contracts', 'Close contract cases'),

-- Reports permissions
(NEWID(), 'reports.view', 'View Reports', 'reports', 'View system reports'),
(NEWID(), 'reports.create', 'Create Reports', 'reports', 'Create custom reports'),
(NEWID(), 'reports.export', 'Export Reports', 'reports', 'Export reports to file'),
(NEWID(), 'reports.ai_query', 'AI Query', 'reports', 'Use AI natural language queries'),

-- Admin permissions
(NEWID(), 'admin.users', 'Manage Users', 'admin', 'Create and manage staff users'),
(NEWID(), 'admin.roles', 'Manage Roles', 'admin', 'Configure roles and permissions'),
(NEWID(), 'admin.settings', 'System Settings', 'admin', 'Configure system settings'),
(NEWID(), 'admin.audit', 'View Audit Logs', 'admin', 'View system audit logs');

-- =============================================
-- 4. CORRESPONDENCE TYPES
-- =============================================
INSERT INTO correspondence_types (id, name, code, description, sla_days, requires_sg_review, requires_dsg_review, is_confidential) VALUES
(NEWID(), 'General Correspondence', 'GENERAL', 'General legal correspondence and inquiries', 14, 0, 1, 0),
(NEWID(), 'Litigation Matter', 'LITIGATION', 'Court cases and legal disputes', 21, 0, 1, 0),
(NEWID(), 'Compensation Claim', 'COMPENSATION', 'Claims against the Crown', 21, 0, 1, 0),
(NEWID(), 'Public Trustee Matter', 'PUBLIC_TRUSTEE', 'Estates and trusts matters', 14, 0, 1, 0),
(NEWID(), 'Legal Advisory', 'ADVISORY', 'Legal opinions and advice requests', 14, 0, 1, 0),
(NEWID(), 'International Law', 'INTL_LAW', 'Treaties, extradition, international matters', 21, 1, 1, 0),
(NEWID(), 'Cabinet/Confidential', 'CABINET', 'Cabinet submissions and confidential matters', 7, 1, 0, 1);

-- =============================================
-- 5. CONTRACT TYPES
-- =============================================
INSERT INTO contract_types (id, name, code, description, sla_days, requires_legal_review, requires_dgs_approval, requires_sg_approval) VALUES
(NEWID(), 'Goods', 'GOODS', 'Procurement of goods and supplies', 14, 1, 1, 0),
(NEWID(), 'Services', 'SERVICES', 'Professional and other services', 21, 1, 1, 0),
(NEWID(), 'Works', 'WORKS', 'Construction and infrastructure projects', 28, 1, 1, 1),
(NEWID(), 'Consultancy', 'CONSULTANCY', 'Consulting and advisory services', 21, 1, 1, 0),
(NEWID(), 'Lease Agreement', 'LEASE', 'Property and equipment leases', 21, 1, 1, 0),
(NEWID(), 'Memorandum of Understanding', 'MOU', 'Inter-agency and international MOUs', 14, 1, 1, 1),
(NEWID(), 'Grant Agreement', 'GRANT', 'Grant funding agreements', 21, 1, 1, 1),
(NEWID(), 'Loan Agreement', 'LOAN', 'Government loan agreements', 28, 1, 1, 1);

-- =============================================
-- 6. ORGANIZATIONS (Sample MDAs)
-- =============================================
INSERT INTO organizations (id, name, code, type) VALUES
(NEWID(), 'Ministry of Finance, Economic Affairs and Investment', 'MOF', 'ministry'),
(NEWID(), 'Ministry of Health and Wellness', 'MOH', 'ministry'),
(NEWID(), 'Ministry of Education, Technological and Vocational Training', 'MOE', 'ministry'),
(NEWID(), 'Ministry of Home Affairs and Information', 'MOHAI', 'ministry'),
(NEWID(), 'Ministry of Foreign Affairs and Foreign Trade', 'MFAFT', 'ministry'),
(NEWID(), 'Ministry of Transport, Works and Water Resources', 'MTW', 'ministry'),
(NEWID(), 'Ministry of Agriculture, Food and Nutritional Security', 'MOA', 'ministry'),
(NEWID(), 'Ministry of Tourism and International Transport', 'MOT', 'ministry'),
(NEWID(), 'Ministry of Housing, Lands and Rural Development', 'MOHLRD', 'ministry'),
(NEWID(), 'Ministry of Labour, Social Security and the Third Sector', 'MOL', 'ministry'),
(NEWID(), 'Ministry of Maritime Affairs and the Blue Economy', 'MMABE', 'ministry'),
(NEWID(), 'Ministry of Environment and National Beautification', 'MOENV', 'ministry'),
(NEWID(), 'Ministry of Youth, Sports and Community Empowerment', 'MOYSW', 'ministry'),
(NEWID(), 'Ministry of Creative Economy, Culture and Sports', 'MOCECS', 'ministry'),
(NEWID(), 'Ministry of Small Business, Entrepreneurship and Commerce', 'MOSBEC', 'ministry'),
(NEWID(), 'Office of the Prime Minister', 'OPM', 'department'),
(NEWID(), 'Barbados Revenue Authority', 'BRA', 'statutory_body'),
(NEWID(), 'National Insurance Department', 'NIS', 'department'),
(NEWID(), 'Queen Elizabeth Hospital', 'QEH', 'statutory_body'),
(NEWID(), 'University of the West Indies', 'UWI', 'statutory_body');

-- =============================================
-- 7. LOOKUP VALUES
-- =============================================
-- Urgency levels
INSERT INTO lookup_values (category, code, name, sort_order) VALUES
('urgency', 'normal', 'Normal', 1),
('urgency', 'urgent', 'Urgent', 2),
('urgency', 'critical', 'Critical', 3);

-- Procurement methods
INSERT INTO lookup_values (category, code, name, sort_order) VALUES
('procurement_method', 'open_tender', 'Open Tender', 1),
('procurement_method', 'selective_tender', 'Selective Tender', 2),
('procurement_method', 'limited_tender', 'Limited Tender', 3),
('procurement_method', 'direct_procurement', 'Direct Procurement', 4),
('procurement_method', 'framework_agreement', 'Framework Agreement', 5);

-- Currencies
INSERT INTO lookup_values (category, code, name, sort_order) VALUES
('currency', 'BBD', 'Barbados Dollar (BBD)', 1),
('currency', 'USD', 'US Dollar (USD)', 2),
('currency', 'EUR', 'Euro (EUR)', 3),
('currency', 'GBP', 'British Pound (GBP)', 4);

-- Security classifications
INSERT INTO lookup_values (category, code, name, sort_order) VALUES
('security', 'standard', 'Standard', 1),
('security', 'restricted', 'Restricted', 2),
('security', 'confidential', 'Confidential', 3),
('security', 'cabinet', 'Cabinet', 4);

-- =============================================
-- 8. BPM WORKFLOW DEFINITIONS
-- =============================================
INSERT INTO bpm_workflow_definitions (id, name, code, module, description, stages, transitions) VALUES
(NEWID(), 'Contracts Workflow', 'CONTRACTS_WORKFLOW', 'contracts', 
'Standard workflow for government contract processing',
'[
  {"code": "INTAKE", "name": "Intake", "sequence": 1},
  {"code": "ASSIGN", "name": "Assignment", "sequence": 2},
  {"code": "FILE_ASSOC", "name": "File Association", "sequence": 2, "isParallel": true},
  {"code": "DRAFT", "name": "Drafting", "sequence": 3},
  {"code": "MIN_REVIEW", "name": "Ministry Review", "sequence": 4},
  {"code": "SIGN", "name": "Signature", "sequence": 5},
  {"code": "ADJUDICATION", "name": "Adjudication", "sequence": 6},
  {"code": "DISPATCH", "name": "Dispatch", "sequence": 7},
  {"code": "CLOSEOUT", "name": "Closeout", "sequence": 8}
]',
'[
  {"from": "INTAKE", "to": "ASSIGN"},
  {"from": "ASSIGN", "to": "DRAFT"},
  {"from": "ASSIGN", "to": "FILE_ASSOC"},
  {"from": "DRAFT", "to": "MIN_REVIEW"},
  {"from": "MIN_REVIEW", "to": "DRAFT"},
  {"from": "MIN_REVIEW", "to": "SIGN"},
  {"from": "SIGN", "to": "ADJUDICATION"},
  {"from": "ADJUDICATION", "to": "DISPATCH"},
  {"from": "DISPATCH", "to": "CLOSEOUT"}
]'),

(NEWID(), 'Correspondence Workflow', 'CORRESPONDENCE_WORKFLOW', 'correspondence',
'Standard workflow for correspondence processing',
'[
  {"code": "INTAKE", "name": "Intake", "sequence": 1},
  {"code": "SG_DSG_REVIEW", "name": "SG/DSG Review", "sequence": 2},
  {"code": "FILE_ASSOC", "name": "File Association", "sequence": 2, "isParallel": true},
  {"code": "PROCESSING", "name": "Processing", "sequence": 3},
  {"code": "APPROVAL", "name": "Approval", "sequence": 4},
  {"code": "DISPATCH", "name": "Dispatch", "sequence": 5},
  {"code": "CLOSED", "name": "Closed", "sequence": 6}
]',
'[
  {"from": "INTAKE", "to": "SG_DSG_REVIEW"},
  {"from": "SG_DSG_REVIEW", "to": "PROCESSING"},
  {"from": "SG_DSG_REVIEW", "to": "FILE_ASSOC"},
  {"from": "PROCESSING", "to": "APPROVAL"},
  {"from": "PROCESSING", "to": "DISPATCH"},
  {"from": "APPROVAL", "to": "DISPATCH"},
  {"from": "APPROVAL", "to": "PROCESSING"},
  {"from": "DISPATCH", "to": "CLOSED"}
]');

-- =============================================
-- 9. BPM IN-BASKETS
-- =============================================
-- Contracts in-baskets
INSERT INTO bpm_in_baskets (code, name, description, module, sort_order) VALUES
('contracts_intake', 'New Contract Intake', 'Contracts awaiting intake validation', 'contracts', 1),
('contracts_drafting', 'Contracts - Drafting', 'Contracts being drafted by legal officers', 'contracts', 2),
('contracts_awaiting_approval', 'Contracts - Awaiting Approval', 'Contracts pending supervisor/DSG approval', 'contracts', 3),
('contracts_with_ministry', 'Contracts - With Ministry', 'Contracts sent to ministry for review', 'contracts', 4),
('contracts_adjudication', 'Contracts - Adjudication', 'Contracts pending Supreme Court adjudication', 'contracts', 5),
('contracts_ready_close', 'Contracts - Ready to Close', 'Contracts ready for dispatch and closure', 'contracts', 6);

-- Correspondence in-baskets
INSERT INTO bpm_in_baskets (code, name, description, module, sort_order) VALUES
('corr_intake', 'New Correspondence', 'Correspondence awaiting initial review', 'correspondence', 1),
('corr_daily_mail', 'Daily Mail Dashboard', 'Correspondence for SG/DSG review and assignment', 'correspondence', 2),
('corr_in_progress', 'In Progress', 'Correspondence being processed by assigned officer', 'correspondence', 3),
('corr_pending_external', 'Pending External', 'Correspondence awaiting external input', 'correspondence', 4),
('corr_ready_dispatch', 'Ready for Dispatch', 'Correspondence ready for dispatch', 'correspondence', 5);

-- =============================================
-- 10. SYSTEM SETTINGS
-- =============================================
INSERT INTO system_settings ([key], value, data_type, category, description) VALUES
('sla_correspondence_default', '14', 'number', 'sla', 'Default SLA days for correspondence'),
('sla_contracts_default', '21', 'number', 'sla', 'Default SLA days for contracts'),
('sla_warning_threshold', '0.75', 'number', 'sla', 'SLA warning threshold (percentage)'),
('email_notifications_enabled', 'true', 'boolean', 'email', 'Enable email notifications'),
('reference_number_prefix_correspondence', 'REG', 'string', 'general', 'Prefix for correspondence reference numbers'),
('reference_number_prefix_contracts', 'CON', 'string', 'general', 'Prefix for contract reference numbers'),
('max_file_upload_size_mb', '25', 'number', 'general', 'Maximum file upload size in MB'),
('allowed_file_types', '["pdf","doc","docx","xls","xlsx","png","jpg","jpeg"]', 'json', 'general', 'Allowed file upload types'),
('session_timeout_minutes', '480', 'number', 'security', 'User session timeout in minutes'),
('max_failed_login_attempts', '5', 'number', 'security', 'Maximum failed login attempts before lockout'),
('lockout_duration_minutes', '30', 'number', 'security', 'Account lockout duration in minutes');
GO
