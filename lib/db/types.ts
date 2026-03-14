// Database entity types for SGC Digital

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'user'
export type UserStatus = 'active' | 'inactive' | 'pending'
export type ContractStatus = 'draft' | 'review' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'terminated'
export type CorrespondenceStatus = 'received' | 'in_progress' | 'pending_review' | 'completed' | 'archived'
export type CorrespondenceType = 'incoming' | 'outgoing'
export type DocumentType = 'contract' | 'correspondence' | 'attachment' | 'other'

// Users Table
export interface DbUser {
  id: string
  email: string
  password_hash: string
  name: string
  role: UserRole
  status: UserStatus
  mda_id: string | null
  phone: string | null
  created_at: Date
  updated_at: Date
  last_login: Date | null
}

// Sessions Table
export interface DbSession {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
  ip_address: string | null
  user_agent: string | null
}

// MDAs (Ministries, Departments, Agencies) Table
export interface DbMDA {
  id: string
  code: string
  name: string
  description: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// Contracts Table
export interface DbContract {
  id: string
  reference_number: string
  title: string
  description: string | null
  mda_id: string
  contractor_name: string
  contractor_email: string | null
  contractor_phone: string | null
  contract_value: number
  currency: string
  start_date: Date
  end_date: Date
  status: ContractStatus
  assigned_to: string | null
  created_by: string
  created_at: Date
  updated_at: Date
  approved_by: string | null
  approved_at: Date | null
  notes: string | null
}

// Correspondence Table
export interface DbCorrespondence {
  id: string
  reference_number: string
  subject: string
  description: string | null
  type: CorrespondenceType
  sender_name: string
  sender_organization: string | null
  sender_email: string | null
  recipient_mda_id: string
  date_received: Date
  date_due: Date | null
  status: CorrespondenceStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string | null
  created_by: string
  created_at: Date
  updated_at: Date
  completed_at: Date | null
  notes: string | null
}

// Documents Table (for file metadata)
export interface DbDocument {
  id: string
  entity_type: 'contract' | 'correspondence'
  entity_id: string
  file_name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  document_type: DocumentType
  uploaded_by: string
  created_at: Date
  description: string | null
}

// Activity Log Table
export interface DbActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: string | null
  ip_address: string | null
  created_at: Date
}

// API Response types
export interface UserWithoutPassword extends Omit<DbUser, 'password_hash'> {
  mda_name?: string
}

export interface ContractWithDetails extends DbContract {
  mda_name: string
  assigned_to_name?: string
  created_by_name?: string
  approved_by_name?: string
  document_count?: number
}

export interface CorrespondenceWithDetails extends DbCorrespondence {
  recipient_mda_name: string
  assigned_to_name?: string
  created_by_name?: string
  document_count?: number
}

// Pagination
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter types
export interface ContractFilters {
  status?: ContractStatus
  mda_id?: string
  assigned_to?: string
  search?: string
  start_date_from?: Date
  start_date_to?: Date
}

export interface CorrespondenceFilters {
  status?: CorrespondenceStatus
  type?: CorrespondenceType
  mda_id?: string
  assigned_to?: string
  priority?: string
  search?: string
  date_from?: Date
  date_to?: Date
}
