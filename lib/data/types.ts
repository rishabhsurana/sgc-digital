// =============================================
// SGC Digital - Data Types
// These types match the MS SQL Server schema
// =============================================

// Lookup Types
export interface UserRole {
  roleId: number
  roleCode: string
  roleName: string
  description: string | null
  isActive: boolean
}

export interface EntityType {
  entityTypeId: number
  entityTypeCode: string
  entityTypeName: string
  description: string | null
  requiresApproval: boolean
  isActive: boolean
}

export interface Department {
  departmentId: number
  departmentCode: string
  departmentName: string
  ministry: string | null
  isActive: boolean
}

export interface RequestStatus {
  statusId: number
  statusCode: string
  statusName: string
  description: string | null
  isActive: boolean
}

export interface CorrespondenceType {
  correspondenceTypeId: number
  typeCode: string
  typeName: string
  description: string | null
  requiredDocuments: string | null
  estimatedDays: number | null
  isActive: boolean
}

export interface ContractType {
  contractTypeId: number
  typeCode: string
  typeName: string
  description: string | null
  requiredDocuments: string | null
  estimatedDays: number | null
  isActive: boolean
}

export interface ContractNature {
  contractNatureId: number
  natureCode: string
  natureName: string
  description: string | null
  isActive: boolean
}

export interface PriorityLevel {
  priorityId: number
  priorityCode: string
  priorityName: string
  description: string | null
  slaDays: number | null
  displayOrder: number
  isActive: boolean
}

export interface CaseStatus {
  caseStatusId: number
  statusCode: string
  statusName: string
  description: string | null
  statusCategory: 'open' | 'in_progress' | 'closed'
  displayOrder: number
  isActive: boolean
}

export interface Currency {
  currencyId: number
  currencyCode: string
  currencyName: string
  symbol: string | null
  isActive: boolean
}

// User Types
export interface UserProfile {
  userId: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  entityTypeId: number
  entityNumber: string
  organizationName: string | null
  departmentId: number | null
  position: string | null
  roleId: number
  statusId: number
  emailVerified: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  // Joined fields
  entityTypeName?: string
  departmentName?: string
  roleName?: string
  statusName?: string
}

export interface StaffRegistrationRequest {
  requestId: string
  requestNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  departmentId: number
  position: string
  employeeId: string | null
  supervisorName: string | null
  supervisorEmail: string | null
  requestedRoleId: number
  justification: string | null
  statusId: number
  reviewedBy: string | null
  reviewedAt: Date | null
  reviewNotes: string | null
  approvedUserId: string | null
  createdAt: Date
  updatedAt: Date
  // Joined fields
  departmentName?: string
  requestedRoleName?: string
  statusName?: string
  reviewedByName?: string
}

export interface AuthorizedUser {
  authorizedUserId: string
  primaryUserId: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  position: string | null
  canSubmit: boolean
  canView: boolean
  canEdit: boolean
  statusId: number
  linkedUserId: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Correspondence Types
export interface Correspondence {
  correspondenceId: string
  referenceNumber: string
  applicantUserId: string
  applicantName: string
  applicantOrganization: string | null
  applicantEmail: string
  applicantPhone: string | null
  correspondenceTypeId: number
  subject: string
  description: string
  priorityId: number
  caseStatusId: number
  assignedToUserId: string | null
  assignedDepartmentId: number | null
  assignedAt: Date | null
  submittedAt: Date
  dueDate: Date | null
  completedAt: Date | null
  responseSummary: string | null
  resolutionNotes: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string | null
  // Joined fields
  correspondenceTypeName?: string
  priorityName?: string
  statusName?: string
  statusCategory?: string
  assignedToName?: string
  assignedDepartmentName?: string
}

export interface CorrespondenceStatusHistory {
  historyId: string
  correspondenceId: string
  fromStatusId: number | null
  toStatusId: number
  comments: string | null
  changedBy: string
  changedAt: Date
  // Joined fields
  fromStatusName?: string
  toStatusName?: string
  changedByName?: string
}

export interface CorrespondenceComment {
  commentId: string
  correspondenceId: string
  commentText: string
  isInternal: boolean
  createdBy: string
  createdAt: Date
  // Joined fields
  createdByName?: string
}

export interface CorrespondenceDocument {
  documentId: string
  correspondenceId: string
  fileName: string
  fileType: string
  fileSize: number
  filePath: string
  documentType: string | null
  uploadedBy: string
  uploadedAt: Date
  // Joined fields
  uploadedByName?: string
}

// Contract Types
export interface Contract {
  contractId: string
  referenceNumber: string
  requestingUserId: string
  requestingDepartmentId: number
  requestingOfficerName: string
  requestingOfficerEmail: string
  requestingOfficerPhone: string | null
  contractTypeId: number
  contractNatureId: number
  contractTitle: string
  contractDescription: string
  counterpartyName: string
  counterpartyAddress: string | null
  counterpartyContact: string | null
  counterpartyEmail: string | null
  counterpartyPhone: string | null
  contractValue: number
  currencyId: number
  paymentTerms: string | null
  proposedStartDate: Date | null
  proposedEndDate: Date | null
  contractDurationMonths: number | null
  priorityId: number
  caseStatusId: number
  assignedToUserId: string | null
  assignedAt: Date | null
  legalReviewNotes: string | null
  recommendedChanges: string | null
  approvalNotes: string | null
  submittedAt: Date
  dueDate: Date | null
  completedAt: Date | null
  finalContractNumber: string | null
  executedDate: Date | null
  expiryDate: Date | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string | null
  // Joined fields
  contractTypeName?: string
  contractNatureName?: string
  requestingDepartmentName?: string
  priorityName?: string
  statusName?: string
  statusCategory?: string
  assignedToName?: string
  currencyCode?: string
  currencySymbol?: string
}

// Activity and Audit Types
export interface AuditLog {
  auditId: string
  userId: string | null
  userEmail: string | null
  userName: string | null
  ipAddress: string | null
  userAgent: string | null
  actionType: string
  entityType: string
  entityId: string | null
  entityReference: string | null
  actionDescription: string
  oldValues: string | null
  newValues: string | null
  isSuccessful: boolean
  errorMessage: string | null
  createdAt: Date
}

export interface ActivityLog {
  activityId: string
  userId: string | null
  userName: string | null
  userRole: string | null
  activityType: string
  activityDescription: string
  entityType: string | null
  entityId: string | null
  entityReference: string | null
  metadata: string | null
  createdAt: Date
}

export interface DailyStatistics {
  statId: string
  statDate: Date
  totalCorrespondence: number
  newCorrespondence: number
  completedCorrespondence: number
  pendingCorrespondence: number
  totalContracts: number
  newContracts: number
  completedContracts: number
  pendingContracts: number
  totalContractValue: number
  totalUsers: number
  activeUsers: number
  newRegistrations: number
  totalStaff: number
  pendingStaffRequests: number
  createdAt: Date
}

export interface Notification {
  notificationId: string
  userId: string
  title: string
  message: string
  notificationType: 'info' | 'warning' | 'success' | 'error' | 'assignment'
  entityType: string | null
  entityId: string | null
  actionUrl: string | null
  isRead: boolean
  readAt: Date | null
  emailSent: boolean
  emailSentAt: Date | null
  createdAt: Date
}

// Transaction History (combined view)
export interface TransactionHistoryItem {
  transactionType: 'Correspondence' | 'Contract'
  transactionId: string
  referenceNumber: string
  title: string
  category: string
  priority: string
  status: string
  statusCategory: string
  requestorName: string
  organization: string | null
  assignedTo: string | null
  contractValue: number | null
  currency: string | null
  submittedAt: Date
  dueDate: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Dashboard Summary
export interface DashboardSummary {
  totalCorrespondence: number
  openCorrespondence: number
  inProgressCorrespondence: number
  closedCorrespondence: number
  totalContracts: number
  openContracts: number
  inProgressContracts: number
  closedContracts: number
  totalContractValue: number
  totalUsers: number
  activeUsers: number
  pendingStaffRequests: number
}
