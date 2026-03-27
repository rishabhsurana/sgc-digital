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
// Persistent In-Memory Storage (survives serverless hot starts)
// =============================================

// Use globalThis to persist across hot reloads in development and between requests
declare global {
  // eslint-disable-next-line no-var
  var __sgc_registered_users: Map<string, UserProfile> | undefined
  // eslint-disable-next-line no-var
  var __sgc_users_initialized: boolean | undefined
}

// Initialize the persistent user storage
function getRegisteredUsersStore(): Map<string, UserProfile> {
  if (!globalThis.__sgc_registered_users) {
    globalThis.__sgc_registered_users = new Map<string, UserProfile>()
  }
  return globalThis.__sgc_registered_users
}

// Combine mock users with registered users
function getAllUsers(): UserProfile[] {
  // Sync any registered users from globalThis to MOCK_USERS (in case of warm container)
  const registeredUsers = Array.from(getRegisteredUsersStore().values())
  for (const user of registeredUsers) {
    const existingIndex = MOCK_USERS.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase())
    if (existingIndex === -1) {
      MOCK_USERS.push(user)
    }
  }
  return MOCK_USERS
}

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
    return getAllUsers()
  }
  return getAllUsers()
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  if (USE_MOCK_DATA) {
    // Check registered users first
    const registeredUser = getRegisteredUsersStore().get(userId)
    if (registeredUser) return registeredUser
    // Then check mock users
    return MOCK_USERS.find(u => u.userId === userId) || null
  }
  return MOCK_USERS.find(u => u.userId === userId) || null
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  if (USE_MOCK_DATA) {
    const allUsers = getAllUsers()
    console.log('[v0] getUserByEmail searching for:', email.toLowerCase())
    console.log('[v0] Available emails:', allUsers.map(u => u.email.toLowerCase()))
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
    console.log('[v0] Found user:', found ? found.email : 'null')
    return found
  }
  return getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
  if (USE_MOCK_DATA) {
    const userId = crypto.randomUUID()
    const newUser: UserProfile = {
      userId,
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
      updatedAt: new Date(),
      // Add role and entity type names for display
      roleName: USER_ROLES.find(r => r.roleId === (userData.roleId || 1))?.roleName || 'Public User',
      entityTypeName: ENTITY_TYPES.find(e => e.entityTypeId === (userData.entityTypeId || 4))?.entityTypeName || 'Public',
      departmentName: userData.departmentId ? DEPARTMENTS.find(d => d.departmentId === userData.departmentId)?.departmentName : undefined
    }
    // Store in both globalThis Map AND directly in MOCK_USERS array for persistence
    getRegisteredUsersStore().set(userId, newUser)
    // Also push directly to MOCK_USERS array (persists within module instance)
    const existingIndex = MOCK_USERS.findIndex(u => u.email.toLowerCase() === newUser.email.toLowerCase())
    if (existingIndex === -1) {
      MOCK_USERS.push(newUser)
    }
    console.log('[v0] User created and stored:', newUser.email, 'MOCK_USERS length:', MOCK_USERS.length)
    return newUser
  }
  // TODO: Implement database insert
  throw new Error('Database not implemented')
}

export async function updateUser(userId: string, userData: Partial<UserProfile>): Promise<UserProfile | null> {
  if (USE_MOCK_DATA) {
    // Check registered users first
    const registeredUser = getRegisteredUsersStore().get(userId)
    if (registeredUser) {
      const updatedUser = { ...registeredUser, ...userData, updatedAt: new Date() }
      getRegisteredUsersStore().set(userId, updatedUser)
      return updatedUser
    }
    // Then check mock users
    const index = MOCK_USERS.findIndex(u => u.userId === userId)
    if (index === -1) return null
    MOCK_USERS[index] = { ...MOCK_USERS[index], ...userData, updatedAt: new Date() }
    return MOCK_USERS[index]
  }
  return null
}

export async function deleteUser(userId: string): Promise<boolean> {
  if (USE_MOCK_DATA) {
    // Check registered users first
    if (getRegisteredUsersStore().has(userId)) {
      getRegisteredUsersStore().delete(userId)
      return true
    }
    // Then check mock users
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
    
    console.log('[v0] authenticateUser called with email:', email)
    console.log('[v0] User found:', user ? `${user.firstName} ${user.lastName} (roleId: ${user.roleId}, statusId: ${user.statusId})` : 'null')
    console.log('[v0] Total users (mock + registered):', getAllUsers().length, '| Registered users:', getRegisteredUsersStore().size)
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }
    
    // In demo mode, accept 'SGC@Demo2024!' for all users
    // In production, this would verify against hashed password in database
    const expectedPassword = 'SGC@Demo2024!'
    console.log('[v0] Password check - received length:', password?.length, '| expected length:', expectedPassword.length)
    console.log('[v0] Password match:', password === expectedPassword)
    if (password !== expectedPassword) {
      console.log('[v0] Password mismatch - authentication failed')
      return { success: false, error: 'Invalid email or password' }
    }
    console.log('[v0] Password matched - authentication successful')
    
    // Check if user is active
    if (user.statusId !== 5) {
      return { success: false, error: 'Account is not active. Please contact support.' }
    }
    
    // Update last login - check if it's a registered user
    user.lastLoginAt = new Date()
    if (getRegisteredUsersStore().has(user.userId)) {
      getRegisteredUsersStore().set(user.userId, user)
    }
    
    return { success: true, user }
  }
  
  // TODO: Implement real authentication with password hashing
  return { success: false, error: 'Database not implemented' }
}

export async function authenticateStaff(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  console.log('[v0] authenticateStaff called for:', email)
  const result = await authenticateUser(email, password)
  
  if (!result.success || !result.user) {
    console.log('[v0] authenticateStaff - base auth failed:', result.error)
    return result
  }
  
  // Check if user has staff role (Staff, Supervisor, Admin, Super Admin)
  const staffRoleIds = [5, 6, 7, 8]
  console.log('[v0] authenticateStaff - checking roleId:', result.user.roleId, 'allowed:', staffRoleIds)
  if (!staffRoleIds.includes(result.user.roleId)) {
    console.log('[v0] authenticateStaff - role check FAILED')
    return { success: false, error: 'You do not have permission to access the Management Portal' }
  }
  
  console.log('[v0] authenticateStaff - SUCCESS, returning user')
  return result
}

// =============================================
// CONTRACT RENEWAL FUNCTIONS
// =============================================

import { 
  MOCK_CONTRACT_RENEWALS, 
  MOCK_CONTRACTS_EXPIRING, 
  MOCK_ENTITY_REGISTRATIONS,
  RENEWAL_STATUSES,
  validateRenewal 
} from './mock-data'
import type { 
  ContractRenewal, 
  ContractExpiringForRenewal, 
  EntityRegistrationHistory,
  RenewalStatus
} from './types'

export async function getRenewalStatuses(): Promise<RenewalStatus[]> {
  if (USE_MOCK_DATA) {
    return RENEWAL_STATUSES
  }
  // TODO: Fetch from database
  return []
}

export async function getContractRenewals(filters?: {
  status?: string
  departmentId?: number
  assignedToUserId?: string
}): Promise<ContractRenewal[]> {
  if (USE_MOCK_DATA) {
    let renewals = [...MOCK_CONTRACT_RENEWALS]
    
    if (filters?.status) {
      const status = RENEWAL_STATUSES.find(s => s.statusCode === filters.status)
      if (status) {
        renewals = renewals.filter(r => r.renewalStatusId === status.renewalStatusId)
      }
    }
    
    if (filters?.departmentId) {
      renewals = renewals.filter(r => r.requestingDepartmentId === filters.departmentId)
    }
    
    if (filters?.assignedToUserId) {
      renewals = renewals.filter(r => r.assignedToUserId === filters.assignedToUserId)
    }
    
    return renewals
  }
  // TODO: Fetch from database
  return []
}

export async function getContractRenewalById(renewalId: string): Promise<ContractRenewal | null> {
  if (USE_MOCK_DATA) {
    return MOCK_CONTRACT_RENEWALS.find(r => r.renewalId === renewalId) || null
  }
  // TODO: Fetch from database
  return null
}

export async function createContractRenewal(
  renewalData: Partial<ContractRenewal>,
  createdBy: string
): Promise<{ success: boolean; renewal?: ContractRenewal; error?: string }> {
  if (USE_MOCK_DATA) {
    // Validate the renewal
    const validation = validateRenewal(renewalData.originalContractId!, renewalData)
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join('. ') }
    }
    
    const newRenewal: ContractRenewal = {
      renewalId: crypto.randomUUID(),
      renewalReferenceNumber: `REN-${new Date().getFullYear()}-${String(MOCK_CONTRACT_RENEWALS.length + 1).padStart(4, '0')}`,
      renewalSequence: 1,
      isValidRenewal: false,
      validationNotes: null,
      validatedBy: null,
      validatedAt: null,
      renewalStatusId: 2, // Pending Validation
      renewalStatusName: 'Pending Validation',
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: null,
      ...renewalData
    } as ContractRenewal
    
    MOCK_CONTRACT_RENEWALS.push(newRenewal)
    return { success: true, renewal: newRenewal }
  }
  // TODO: Insert into database
  return { success: false, error: 'Database not implemented' }
}

export async function validateContractRenewal(
  renewalId: string,
  validatedBy: string,
  isValid: boolean,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK_DATA) {
    const renewal = MOCK_CONTRACT_RENEWALS.find(r => r.renewalId === renewalId)
    if (!renewal) {
      return { success: false, error: 'Renewal not found' }
    }
    
    renewal.isValidRenewal = isValid
    renewal.validationNotes = notes || null
    renewal.validatedBy = validatedBy
    renewal.validatedAt = new Date()
    renewal.renewalStatusId = isValid ? 3 : 8 // Validated or Rejected
    renewal.renewalStatusName = isValid ? 'Validated' : 'Rejected'
    renewal.updatedAt = new Date()
    renewal.updatedBy = validatedBy
    
    if (!isValid) {
      renewal.rejectedBy = validatedBy
      renewal.rejectedAt = new Date()
      renewal.rejectionReason = notes || 'Failed validation'
    }
    
    return { success: true }
  }
  // TODO: Update in database
  return { success: false, error: 'Database not implemented' }
}

export async function approveContractRenewal(
  renewalId: string,
  approvedBy: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK_DATA) {
    const renewal = MOCK_CONTRACT_RENEWALS.find(r => r.renewalId === renewalId)
    if (!renewal) {
      return { success: false, error: 'Renewal not found' }
    }
    
    renewal.renewalStatusId = 7 // Approved
    renewal.renewalStatusName = 'Approved'
    renewal.approvalNotes = notes || null
    renewal.approvedBy = approvedBy
    renewal.approvedAt = new Date()
    renewal.updatedAt = new Date()
    renewal.updatedBy = approvedBy
    
    return { success: true }
  }
  // TODO: Update in database
  return { success: false, error: 'Database not implemented' }
}

export async function rejectContractRenewal(
  renewalId: string,
  rejectedBy: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (USE_MOCK_DATA) {
    const renewal = MOCK_CONTRACT_RENEWALS.find(r => r.renewalId === renewalId)
    if (!renewal) {
      return { success: false, error: 'Renewal not found' }
    }
    
    renewal.renewalStatusId = 8 // Rejected
    renewal.renewalStatusName = 'Rejected'
    renewal.rejectedBy = rejectedBy
    renewal.rejectedAt = new Date()
    renewal.rejectionReason = reason
    renewal.updatedAt = new Date()
    renewal.updatedBy = rejectedBy
    
    return { success: true }
  }
  // TODO: Update in database
  return { success: false, error: 'Database not implemented' }
}

export async function getContractsExpiringForRenewal(): Promise<ContractExpiringForRenewal[]> {
  if (USE_MOCK_DATA) {
    return MOCK_CONTRACTS_EXPIRING
  }
  // TODO: Fetch from database view
  return []
}

// =============================================
// ENTITY REGISTRATION FUNCTIONS
// =============================================

export async function getEntityRegistrationHistory(
  entityNumber?: string,
  userId?: string
): Promise<EntityRegistrationHistory[]> {
  if (USE_MOCK_DATA) {
    let registrations = [...MOCK_ENTITY_REGISTRATIONS]
    
    if (entityNumber) {
      registrations = registrations.filter(r => r.entityNumber === entityNumber)
    }
    
    if (userId) {
      registrations = registrations.filter(r => r.userId === userId)
    }
    
    return registrations
  }
  // TODO: Fetch from database
  return []
}

export async function createEntityRegistration(
  registrationData: Partial<EntityRegistrationHistory>,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; registration?: EntityRegistrationHistory; error?: string }> {
  if (USE_MOCK_DATA) {
    const newRegistration: EntityRegistrationHistory = {
      historyId: crypto.randomUUID(),
      actionType: 'REGISTRATION',
      registrationStatusId: 1, // Pending
      emailVerified: false,
      emailVerifiedAt: null,
      documentsVerified: false,
      documentsVerifiedAt: null,
      documentsVerifiedBy: null,
      country: 'Barbados',
      createdAt: new Date(),
      createdBy: null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      statusName: 'Pending',
      ...registrationData
    } as EntityRegistrationHistory
    
    MOCK_ENTITY_REGISTRATIONS.push(newRegistration)
    return { success: true, registration: newRegistration }
  }
  // TODO: Insert into database
  return { success: false, error: 'Database not implemented' }
}
