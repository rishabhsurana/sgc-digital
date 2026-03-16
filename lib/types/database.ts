// =============================================
// SGC Digital - Database Types
// =============================================

// =============================================
// Core Types
// =============================================

export interface Organization {
  id: string
  name: string
  code: string
  type: 'ministry' | 'department' | 'agency' | 'statutory_body' | 'external'
  parent_org_id: string | null
  address: string | null
  email: string | null
  phone: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface StaffDepartment {
  id: string
  name: string
  code: string
  description: string | null
  head_user_id: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface StaffRole {
  id: string
  name: string
  code: string
  description: string | null
  level: number
  is_active: boolean
  created_at: Date
}

export interface StaffPermission {
  id: string
  code: string
  name: string
  module: string
  description: string | null
  created_at: Date
}

export interface StaffUser {
  id: string
  email: string
  password_hash: string
  employee_id: string | null
  first_name: string
  last_name: string
  title: string | null
  department_id: string | null
  role_id: string
  phone: string | null
  signature_image_path: string | null
  is_active: boolean
  can_approve: boolean
  approval_limit: number | null
  last_login_at: Date | null
  failed_login_attempts: number
  locked_until: Date | null
  created_at: Date
  updated_at: Date
}

export interface PublicUser {
  id: string
  email: string
  password_hash: string
  user_type: 'individual' | 'mda_staff'
  first_name: string
  last_name: string
  title: string | null
  phone: string | null
  address: string | null
  primary_organization_id: string | null
  is_active: boolean
  is_verified: boolean
  verification_token: string | null
  verification_expires: Date | null
  password_reset_token: string | null
  password_reset_expires: Date | null
  last_login_at: Date | null
  failed_login_attempts: number
  locked_until: Date | null
  created_at: Date
  updated_at: Date
}

export interface PublicUserOrganization {
  id: string
  user_id: string
  organization_id: string
  is_primary: boolean
  can_submit_correspondence: boolean
  can_submit_contracts: boolean
  authorized_by: string | null
  authorized_at: Date | null
  expires_at: Date | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// =============================================
// Correspondence Types
// =============================================

export type CorrespondenceStatus = 
  | 'NEW' 
  | 'PENDING_REVIEW' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'PENDING_EXTERNAL' 
  | 'ON_HOLD' 
  | 'CLOSED' 
  | 'CANCELLED'

export type CorrespondenceWorkflowStage = 
  | 'INTAKE' 
  | 'SG_DSG_REVIEW' 
  | 'FILE_ASSOC' 
  | 'PROCESSING' 
  | 'APPROVAL' 
  | 'DISPATCH' 
  | 'CLOSED'

export type UrgencyLevel = 'normal' | 'urgent' | 'critical'

export interface CorrespondenceType {
  id: string
  name: string
  code: string
  description: string | null
  sla_days: number
  requires_sg_review: boolean
  requires_dsg_review: boolean
  is_confidential: boolean
  is_active: boolean
  sort_order: number
  created_at: Date
}

export interface Correspondence {
  id: string
  reference_number: string
  tracking_number: string | null
  type_id: string
  subject: string
  description: string | null
  urgency_level: UrgencyLevel
  is_confidential: boolean
  security_profile: string | null
  status: CorrespondenceStatus
  workflow_stage: CorrespondenceWorkflowStage
  submitter_id: string
  submitter_type: 'individual' | 'mda_staff'
  organization_id: string | null
  assigned_clerk_id: string | null
  assigned_officer_id: string | null
  reviewed_by_sg: boolean
  reviewed_by_dsg: boolean
  sg_directive: string | null
  dsg_directive: string | null
  date_submitted: Date | null
  date_received: Date | null
  date_assigned: Date | null
  due_date: Date | null
  bring_up_date: Date | null
  date_dispatched: Date | null
  date_closed: Date | null
  registry_file_refs: string | null
  file_assoc_status: 'pending' | 'associated' | 'new_file' | 'not_required' | null
  closure_reason: string | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

// =============================================
// Contract Types
// =============================================

export type ContractStatus = 
  | 'INTAKE' 
  | 'ASSIGNED' 
  | 'DRAFTING' 
  | 'SUP_REVIEW' 
  | 'SENT_MDA' 
  | 'RETURNED_MDA' 
  | 'FINAL_SIG' 
  | 'EXEC_ADJ' 
  | 'ADJ_COMP' 
  | 'CLOSED' 
  | 'RETURNED_CORR' 
  | 'REJECTED'

export type ContractWorkflowStage = 
  | 'INTAKE' 
  | 'ASSIGN' 
  | 'FILE_ASSOC' 
  | 'DRAFT' 
  | 'MIN_REVIEW' 
  | 'SIGN' 
  | 'ADJUDICATION' 
  | 'DISPATCH' 
  | 'CLOSEOUT'

export type ProcurementMethod = 
  | 'open_tender' 
  | 'selective_tender' 
  | 'limited_tender' 
  | 'direct_procurement' 
  | 'framework_agreement'

export interface ContractType {
  id: string
  name: string
  code: string
  description: string | null
  sla_days: number
  requires_legal_review: boolean
  requires_dgs_approval: boolean
  requires_sg_approval: boolean
  value_threshold_legal: number | null
  value_threshold_dgs: number | null
  is_active: boolean
  sort_order: number
  created_at: Date
}

export interface Contract {
  id: string
  reference_number: string
  transaction_number: string | null
  ministry_contract_number: string | null
  type_id: string
  nature_of_contract: string | null
  contract_category: string | null
  instrument_type: string | null
  title: string
  description: string | null
  status: ContractStatus
  workflow_stage: ContractWorkflowStage
  submitter_id: string
  organization_id: string
  assigned_clerk_id: string | null
  assigned_officer_id: string | null
  supervisor_id: string | null
  sg_reviewer_id: string | null
  approved_by_id: string | null
  counterparty_name: string
  counterparty_trading_name: string | null
  counterparty_registration: string | null
  counterparty_tax_id: string | null
  counterparty_address: string | null
  counterparty_contact_name: string | null
  counterparty_email: string | null
  counterparty_phone: string | null
  contract_value: number
  currency: string
  funding_source: string | null
  budget_year: number | null
  procurement_method: ProcurementMethod | null
  tender_reference: string | null
  start_date: Date | null
  end_date: Date | null
  effective_date: Date | null
  expiry_date: Date | null
  duration_months: number | null
  is_renewable: boolean
  renewal_terms: string | null
  date_submitted: Date | null
  date_received: Date | null
  date_assigned: Date | null
  due_date: Date | null
  date_sent_mda: Date | null
  date_returned_mda: Date | null
  date_signed_sg: Date | null
  date_signed_ministry: Date | null
  date_adjudicated: Date | null
  date_dispatched: Date | null
  date_closed: Date | null
  registry_file_refs: string | null
  file_assoc_status: 'pending' | 'associated' | 'new_file' | 'not_required' | null
  rejection_reason: string | null
  return_reason: string | null
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

// =============================================
// BPM Types
// =============================================

export type CaseStatus = 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'ON_HOLD' 
  | 'PENDING_EXTERNAL' 
  | 'ESCALATED' 
  | 'COMPLETED' 
  | 'CANCELLED'

export type SLAStatus = 'on_track' | 'at_risk' | 'breached'

export type Priority = 'low' | 'normal' | 'high' | 'critical'

export interface BPMCase {
  id: string
  case_number: string
  entity_type: 'correspondence' | 'contract'
  entity_id: string
  workflow_id: string
  current_stage_id: string | null
  current_stage_code: string | null
  case_status: CaseStatus
  priority: Priority
  sla_due_date: Date | null
  sla_status: SLAStatus | null
  current_owner_id: string | null
  current_in_basket: string | null
  opened_at: Date
  first_response_at: Date | null
  completed_at: Date | null
  tags: string | null
  custom_fields: string | null
  created_at: Date
  updated_at: Date
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'reassigned'

export interface BPMTask {
  id: string
  case_id: string
  task_type: string
  title: string
  description: string | null
  instructions: string | null
  assigned_to_id: string | null
  assigned_role_code: string | null
  assigned_by_id: string | null
  in_basket: string | null
  status: TaskStatus
  priority: Priority
  due_date: Date | null
  completed_by_id: string | null
  completed_at: Date | null
  outcome: string | null
  outcome_notes: string | null
  created_at: Date
  updated_at: Date
}

export interface BPMActivity {
  id: string
  case_id: string
  activity_type: string
  title: string
  description: string | null
  performed_by_id: string
  performed_by_type: 'staff' | 'public' | 'system'
  is_internal: boolean
  is_system_generated: boolean
  metadata: string | null
  created_at: Date
}

// =============================================
// Document Types
// =============================================

export type DocumentType = 
  | 'submission' 
  | 'supporting_document' 
  | 'contract_draft' 
  | 'signed_contract'
  | 'legal_opinion' 
  | 'correspondence' 
  | 'response' 
  | 'amendment' 
  | 'template' 
  | 'internal_memo' 
  | 'other'

export interface Document {
  id: string
  filename: string
  original_filename: string
  storage_path: string
  storage_provider: 'local' | 'azure_blob' | 's3' | 'vercel_blob'
  mime_type: string
  file_size: number
  checksum: string | null
  document_type: DocumentType
  is_confidential: boolean
  security_classification: string | null
  virus_scanned: boolean
  virus_scan_date: Date | null
  virus_clean: boolean | null
  description: string | null
  version: number
  parent_document_id: string | null
  uploaded_by_id: string
  uploaded_by_type: 'staff' | 'public'
  created_at: Date
  deleted_at: Date | null
}

// =============================================
// Audit Types
// =============================================

export interface AuditLog {
  id: string
  user_id: string | null
  user_type: 'staff' | 'public' | 'system' | null
  user_email: string | null
  action: string
  action_category: 'data' | 'auth' | 'workflow' | 'admin'
  entity_type: string
  entity_id: string | null
  entity_ref: string | null
  old_values: string | null
  new_values: string | null
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  metadata: string | null
  created_at: Date
}
