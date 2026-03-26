// =============================================
// SGC Digital - Data Service Layer
// This abstraction allows switching between mock data and real database
// Set USE_MOCK_DATA to false and implement database calls for production
// =============================================

import type {
  UserRole,
  EntityType,
  Department,
  RequestStatus,
  CorrespondenceType,
  ContractType,
  ContractNature,
  PriorityLevel,
  CaseStatus,
  Currency,
  UserProfile,
  StaffRegistrationRequest,
  Correspondence,
  Contract,
  ActivityLog,
  TransactionHistoryItem,
  DashboardSummary
} from './types'

import {
  USER_ROLES,
  ENTITY_TYPES,
  DEPARTMENTS,
  REQUEST_STATUSES,
  CORRESPONDENCE_TYPES,
  CONTRACT_TYPES,
  CONTRACT_NATURES,
  PRIORITY_LEVELS,
  CASE_STATUSES,
  CURRENCIES,
  MOCK_USERS,
  MOCK_STAFF_REQUESTS,
  MOCK_CORRESPONDENCE,
  MOCK_CONTRACTS,
  MOCK_ACTIVITY_LOG,
  getDashboardSummary,
  getTransactionHistory
} from './mock-data'

// =============================================
// Configuration
// =============================================

// Set to false in production to use real MS SQL Server database
const USE_MOCK_DATA = true

// =============================================
// Lookup Data Services
// =============================================

export async function getUserRoles(): Promise<UserRole[]> {
  if (USE_MOCK_DATA) {
    return USER_ROLES
  }
  // TODO: Implement database query
  // const response = await fetch('/api/lookup/user-roles')
  // return response.json()
  return USER_ROLES
}

export async function getEntityTypes(): Promise<EntityType[]> {
  if (USE_MOCK_DATA) {
    return ENTITY_TYPES
  }
  return ENTITY_TYPES
}

export async function getDepartments(): Promise<Department[]> {
  if (USE_MOCK_DATA) {
    return DEPARTMENTS
  }
  return DEPARTMENTS
}

export async function getRequestStatuses(): Promise<RequestStatus[]> {
  if (USE_MOCK_DATA) {
    return REQUEST_STATUSES
  }
  return REQUEST_STATUSES
}

export async function getCorrespondenceTypes(): Promise<CorrespondenceType[]> {
  if (USE_MOCK_DATA) {
    return CORRESPONDENCE_TYPES
  }
  return CORRESPONDENCE_TYPES
}

export async function getContractTypes(): Promise<ContractType[]> {
  if (USE_MOCK_DATA) {
    return CONTRACT_TYPES
  }
  return CONTRACT_TYPES
}

export async function getContractNatures(): Promise<ContractNature[]> {
  if (USE_MOCK_DATA) {
    return CONTRACT_NATURES
  }
  return CONTRACT_NATURES
}

export async function getPriorityLevels(): Promise<PriorityLevel[]> {
  if (USE_MOCK_DATA) {
    return PRIORITY_LEVELS
  }
  return PRIORITY_LEVELS
}

export async function getCaseStatuses(): Promise<CaseStatus[]> {
  if (USE_MOCK_DATA) {
    return CASE_STATUSES
  }
  return CASE_STATUSES
}

export async function getCurrencies(): Promise<Currency[]> {
  if (USE_MOCK_DATA) {
    return CURRENCIES
  }
  return CURRENCIES
}

// =============================================
// User Services
// =============================================

export async function getUsers(): Promise<UserProfile[]> {
  if (USE_MOCK_DATA) {
    return MOCK_USERS
  }
  return MOCK_USERS
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  if (USE_MOCK_DATA) {
    return MOCK_USERS.find(u => u.userId === userId) || null
  }
  return MOCK_USERS.find(u => u.userId === userId) || null
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  if (USE_MOCK_DATA) {
    return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
  }
  return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
  if (USE_MOCK_DATA) {
    const newUser: UserProfile = {
      userId: crypto.randomUUID(),
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || null,
      entityTypeId: userData.entityTypeId || 4,
      entityNumber: userData.entityNumber || `USR-${Date.now()}`,
      organizationName: userData.organizationName || null,
      departmentId: userData.departmentId || null,
      position: userData.position || null,
      roleId: userData.roleId || 1,
      statusId: userData.statusId || 5,
      emailVerified: false,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    MOCK_USERS.push(newUser)
    return newUser
  }
  // TODO: Implement database insert
  throw new Error('Database not implemented')
}

export async function updateUser(userId: string, userData: Partial<UserProfile>): Promise<UserProfile | null> {
  if (USE_MOCK_DATA) {
    const index = MOCK_USERS.findIndex(u => u.userId === userId)
    if (index === -1) return null
    MOCK_USERS[index] = { ...MOCK_USERS[index], ...userData, updatedAt: new Date() }
    return MOCK_USERS[index]
  }
  return null
}

export async function deleteUser(userId: string): Promise<boolean> {
  if (USE_MOCK_DATA) {
    const index = MOCK_USERS.findIndex(u => u.userId === userId)
    if (index === -1) return false
    MOCK_USERS.splice(index, 1)
    return true
  }
  return false
}

// =============================================
// Staff Registration Request Services
// =============================================

export async function getStaffRegistrationRequests(): Promise<StaffRegistrationRequest[]> {
  if (USE_MOCK_DATA) {
    return MOCK_STAFF_REQUESTS
  }
  return MOCK_STAFF_REQUESTS
}

export async function getStaffRequestById(requestId: string): Promise<StaffRegistrationRequest | null> {
  if (USE_MOCK_DATA) {
    return MOCK_STAFF_REQUESTS.find(r => r.requestId === requestId) || null
  }
  return null
}

export async function createStaffRequest(requestData: Partial<StaffRegistrationRequest>): Promise<StaffRegistrationRequest> {
  if (USE_MOCK_DATA) {
    const requestNumber = `REQ-${new Date().getFullYear()}-${String(MOCK_STAFF_REQUESTS.length + 1).padStart(3, '0')}`
    const newRequest: StaffRegistrationRequest = {
      requestId: crypto.randomUUID(),
      requestNumber,
      firstName: requestData.firstName || '',
      lastName: requestData.lastName || '',
      email: requestData.email || '',
      phone: requestData.phone || null,
      departmentId: requestData.departmentId || 1,
      position: requestData.position || '',
      employeeId: requestData.employeeId || null,
      supervisorName: requestData.supervisorName || null,
      supervisorEmail: requestData.supervisorEmail || null,
      requestedRoleId: requestData.requestedRoleId || 5,
      justification: requestData.justification || null,
      statusId: 1, // Pending
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      approvedUserId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      departmentName: DEPARTMENTS.find(d => d.departmentId === requestData.departmentId)?.departmentName,
      requestedRoleName: USER_ROLES.find(r => r.roleId === requestData.requestedRoleId)?.roleName,
      statusName: 'Pending'
    }
    MOCK_STAFF_REQUESTS.push(newRequest)
    return newRequest
  }
  throw new Error('Database not implemented')
}

export async function approveStaffRequest(
  requestId: string, 
  reviewedBy: string, 
  reviewNotes?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (USE_MOCK_DATA) {
    const request = MOCK_STAFF_REQUESTS.find(r => r.requestId === requestId)
    if (!request) {
      return { success: false, error: 'Request not found' }
    }
    
    // Create user from request
    const newUser = await createUser({
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      entityTypeId: 1, // Ministry/Government
      entityNumber: `SGC-${Date.now().toString(36).toUpperCase()}`,
      organizationName: request.departmentName,
      departmentId: request.departmentId,
      position: request.position,
      roleId: request.requestedRoleId,
      statusId: 5 // Active
    })
    
    // Update request
    request.statusId = 2 // Approved
    request.statusName = 'Approved'
    request.reviewedBy = reviewedBy
    request.reviewedAt = new Date()
    request.reviewNotes = reviewNotes || null
    request.approvedUserId = newUser.userId
    request.updatedAt = new Date()
    
    return { success: true, user: newUser }
  }
  return { success: false, error: 'Database not implemented' }
}

export async function rejectStaffRequest(
  requestId: string, 
  reviewedBy: string, 
  reviewNotes: string
): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK_DATA) {
    const request = MOCK_STAFF_REQUESTS.find(r => r.requestId === requestId)
    if (!request) {
      return { success: false, error: 'Request not found' }
    }
    
    request.statusId = 3 // Rejected
    request.statusName = 'Rejected'
    request.reviewedBy = reviewedBy
    request.reviewedAt = new Date()
    request.reviewNotes = reviewNotes
    request.updatedAt = new Date()
    
    return { success: true }
  }
  return { success: false, error: 'Database not implemented' }
}

// =============================================
// Correspondence Services
// =============================================

export async function getCorrespondence(): Promise<Correspondence[]> {
  if (USE_MOCK_DATA) {
    return MOCK_CORRESPONDENCE
  }
  return MOCK_CORRESPONDENCE
}

export async function getCorrespondenceById(correspondenceId: string): Promise<Correspondence | null> {
  if (USE_MOCK_DATA) {
    return MOCK_CORRESPONDENCE.find(c => c.correspondenceId === correspondenceId) || null
  }
  return null
}

export async function createCorrespondence(data: Partial<Correspondence>): Promise<Correspondence> {
  if (USE_MOCK_DATA) {
    const referenceNumber = `COR-${new Date().getFullYear()}-${String(MOCK_CORRESPONDENCE.length + 1).padStart(4, '0')}`
    const newCorrespondence: Correspondence = {
      correspondenceId: crypto.randomUUID(),
      referenceNumber,
      applicantUserId: data.applicantUserId || '',
      applicantName: data.applicantName || '',
      applicantOrganization: data.applicantOrganization || null,
      applicantEmail: data.applicantEmail || '',
      applicantPhone: data.applicantPhone || null,
      correspondenceTypeId: data.correspondenceTypeId || 1,
      subject: data.subject || '',
      description: data.description || '',
      priorityId: data.priorityId || 2,
      caseStatusId: 2, // Submitted
      assignedToUserId: null,
      assignedDepartmentId: null,
      assignedAt: null,
      submittedAt: new Date(),
      dueDate: data.dueDate || null,
      completedAt: null,
      responseSummary: null,
      resolutionNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy || data.applicantUserId || '',
      updatedBy: null,
      correspondenceTypeName: CORRESPONDENCE_TYPES.find(t => t.correspondenceTypeId === data.correspondenceTypeId)?.typeName,
      priorityName: PRIORITY_LEVELS.find(p => p.priorityId === data.priorityId)?.priorityName,
      statusName: 'Submitted',
      statusCategory: 'open'
    }
    MOCK_CORRESPONDENCE.push(newCorrespondence)
    return newCorrespondence
  }
  throw new Error('Database not implemented')
}

export async function updateCorrespondenceStatus(
  correspondenceId: string, 
  newStatusId: number, 
  updatedBy: string,
  comments?: string
): Promise<boolean> {
  if (USE_MOCK_DATA) {
    const correspondence = MOCK_CORRESPONDENCE.find(c => c.correspondenceId === correspondenceId)
    if (!correspondence) return false
    
    correspondence.caseStatusId = newStatusId
    correspondence.statusName = CASE_STATUSES.find(s => s.caseStatusId === newStatusId)?.statusName
    correspondence.statusCategory = CASE_STATUSES.find(s => s.caseStatusId === newStatusId)?.statusCategory
    correspondence.updatedBy = updatedBy
    correspondence.updatedAt = new Date()
    
    if (newStatusId === 9) { // Completed
      correspondence.completedAt = new Date()
    }
    
    return true
  }
  return false
}

// =============================================
// Contract Services
// =============================================

export async function getContracts(): Promise<Contract[]> {
  if (USE_MOCK_DATA) {
    return MOCK_CONTRACTS
  }
  return MOCK_CONTRACTS
}

export async function getContractById(contractId: string): Promise<Contract | null> {
  if (USE_MOCK_DATA) {
    return MOCK_CONTRACTS.find(c => c.contractId === contractId) || null
  }
  return null
}

export async function createContract(data: Partial<Contract>): Promise<Contract> {
  if (USE_MOCK_DATA) {
    const referenceNumber = `CON-${new Date().getFullYear()}-${String(MOCK_CONTRACTS.length + 1).padStart(4, '0')}`
    const newContract: Contract = {
      contractId: crypto.randomUUID(),
      referenceNumber,
      requestingUserId: data.requestingUserId || '',
      requestingDepartmentId: data.requestingDepartmentId || 1,
      requestingOfficerName: data.requestingOfficerName || '',
      requestingOfficerEmail: data.requestingOfficerEmail || '',
      requestingOfficerPhone: data.requestingOfficerPhone || null,
      contractTypeId: data.contractTypeId || 1,
      contractNatureId: data.contractNatureId || 1,
      contractTitle: data.contractTitle || '',
      contractDescription: data.contractDescription || '',
      counterpartyName: data.counterpartyName || '',
      counterpartyAddress: data.counterpartyAddress || null,
      counterpartyContact: data.counterpartyContact || null,
      counterpartyEmail: data.counterpartyEmail || null,
      counterpartyPhone: data.counterpartyPhone || null,
      contractValue: data.contractValue || 0,
      currencyId: data.currencyId || 1,
      paymentTerms: data.paymentTerms || null,
      proposedStartDate: data.proposedStartDate || null,
      proposedEndDate: data.proposedEndDate || null,
      contractDurationMonths: data.contractDurationMonths || null,
      priorityId: data.priorityId || 2,
      caseStatusId: 2, // Submitted
      assignedToUserId: null,
      assignedAt: null,
      legalReviewNotes: null,
      recommendedChanges: null,
      approvalNotes: null,
      submittedAt: new Date(),
      dueDate: data.dueDate || null,
      completedAt: null,
      finalContractNumber: null,
      executedDate: null,
      expiryDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy || data.requestingUserId || '',
      updatedBy: null,
      contractTypeName: CONTRACT_TYPES.find(t => t.contractTypeId === data.contractTypeId)?.typeName,
      contractNatureName: CONTRACT_NATURES.find(n => n.contractNatureId === data.contractNatureId)?.natureName,
      requestingDepartmentName: DEPARTMENTS.find(d => d.departmentId === data.requestingDepartmentId)?.departmentName,
      priorityName: PRIORITY_LEVELS.find(p => p.priorityId === data.priorityId)?.priorityName,
      statusName: 'Submitted',
      statusCategory: 'open',
      currencyCode: CURRENCIES.find(c => c.currencyId === data.currencyId)?.currencyCode,
      currencySymbol: CURRENCIES.find(c => c.currencyId === data.currencyId)?.symbol || undefined
    }
    MOCK_CONTRACTS.push(newContract)
    return newContract
  }
  throw new Error('Database not implemented')
}

// =============================================
// Activity & Dashboard Services
// =============================================

export async function getActivityLog(limit?: number): Promise<ActivityLog[]> {
  if (USE_MOCK_DATA) {
    const sorted = [...MOCK_ACTIVITY_LOG].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return limit ? sorted.slice(0, limit) : sorted
  }
  return MOCK_ACTIVITY_LOG
}

export async function logActivity(activity: Partial<ActivityLog>): Promise<ActivityLog> {
  if (USE_MOCK_DATA) {
    const newActivity: ActivityLog = {
      activityId: crypto.randomUUID(),
      userId: activity.userId || null,
      userName: activity.userName || null,
      userRole: activity.userRole || null,
      activityType: activity.activityType || 'unknown',
      activityDescription: activity.activityDescription || '',
      entityType: activity.entityType || null,
      entityId: activity.entityId || null,
      entityReference: activity.entityReference || null,
      metadata: activity.metadata || null,
      createdAt: new Date()
    }
    MOCK_ACTIVITY_LOG.unshift(newActivity)
    return newActivity
  }
  throw new Error('Database not implemented')
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  if (USE_MOCK_DATA) {
    return getDashboardSummary()
  }
  return getDashboardSummary()
}

export async function fetchTransactionHistory(): Promise<TransactionHistoryItem[]> {
  if (USE_MOCK_DATA) {
    return getTransactionHistory()
  }
  return getTransactionHistory()
}

// =============================================
// Authentication Services
// =============================================

export async function authenticateUser(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (USE_MOCK_DATA) {
    // Demo mode - accept specific passwords for demo users
    const user = await getUserByEmail(email)
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }
    
    // In demo mode, accept 'password123' for all users
    // In production, this would verify against hashed password in database
    if (password !== 'password123') {
      return { success: false, error: 'Invalid email or password' }
    }
    
    // Check if user is active
    if (user.statusId !== 5) {
      return { success: false, error: 'Account is not active. Please contact support.' }
    }
    
    // Update last login
    user.lastLoginAt = new Date()
    
    return { success: true, user }
  }
  
  // TODO: Implement real authentication with password hashing
  return { success: false, error: 'Database not implemented' }
}

export async function authenticateStaff(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const result = await authenticateUser(email, password)
  
  if (!result.success || !result.user) {
    return result
  }
  
  // Check if user has staff role (Staff, Supervisor, Admin, Super Admin)
  const staffRoleIds = [5, 6, 7, 8]
  if (!staffRoleIds.includes(result.user.roleId)) {
    return { success: false, error: 'You do not have permission to access the Management Portal' }
  }
  
  return result
}
