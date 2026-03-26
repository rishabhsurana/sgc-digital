// =============================================
// SGC Digital - Mock Data for Demo Mode
// This data mirrors the MS SQL Server schema
// Replace with actual database calls in production
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
  DashboardSummary,
  RenewalStatus,
  ContractRenewal,
  ContractExpiringForRenewal,
  EntityRegistrationHistory
} from './types'

// =============================================
// Lookup Data
// =============================================

export const USER_ROLES: UserRole[] = [
  { roleId: 1, roleCode: 'PUBLIC_USER', roleName: 'Public User', description: 'General public user', isActive: true },
  { roleId: 2, roleCode: 'ATTORNEY', roleName: 'Attorney', description: 'Legal attorney', isActive: true },
  { roleId: 3, roleCode: 'COMPANY', roleName: 'Company Representative', description: 'Company or organization representative', isActive: true },
  { roleId: 4, roleCode: 'MDA_USER', roleName: 'MDA User', description: 'Ministry/Department/Agency user', isActive: true },
  { roleId: 5, roleCode: 'STAFF', roleName: 'Staff', description: 'SGC Staff member', isActive: true },
  { roleId: 6, roleCode: 'SUPERVISOR', roleName: 'Supervisor', description: 'SGC Supervisor', isActive: true },
  { roleId: 7, roleCode: 'ADMIN', roleName: 'Administrator', description: 'System administrator', isActive: true },
  { roleId: 8, roleCode: 'SUPER_ADMIN', roleName: 'Super Administrator', description: 'Full system access', isActive: true },
]

export const ENTITY_TYPES: EntityType[] = [
  { entityTypeId: 1, entityTypeCode: 'MINISTRY', entityTypeName: 'Ministry', description: 'Government Ministry', requiresApproval: false, isActive: true },
  { entityTypeId: 2, entityTypeCode: 'COURT', entityTypeName: 'Court', description: 'Judicial Court', requiresApproval: false, isActive: true },
  { entityTypeId: 3, entityTypeCode: 'STATUTORY_BODY', entityTypeName: 'Statutory Body', description: 'Statutory Corporation or Body', requiresApproval: false, isActive: true },
  { entityTypeId: 4, entityTypeCode: 'PUBLIC', entityTypeName: 'Public', description: 'General Public', requiresApproval: false, isActive: true },
  { entityTypeId: 5, entityTypeCode: 'ATTORNEY', entityTypeName: 'Attorney', description: 'Legal Attorney/Law Firm', requiresApproval: true, isActive: true },
  { entityTypeId: 6, entityTypeCode: 'COMPANY', entityTypeName: 'Company', description: 'Private Company or Organization', requiresApproval: true, isActive: true },
]

export const DEPARTMENTS: Department[] = [
  { departmentId: 1, departmentCode: 'SGC', departmentName: "Solicitor General's Chambers", ministry: 'Office of the Attorney General', isActive: true },
  { departmentId: 2, departmentCode: 'AG', departmentName: "Attorney General's Office", ministry: 'Office of the Attorney General', isActive: true },
  { departmentId: 3, departmentCode: 'MOF', departmentName: 'Ministry of Finance', ministry: 'Ministry of Finance', isActive: true },
  { departmentId: 4, departmentCode: 'MOH', departmentName: 'Ministry of Health', ministry: 'Ministry of Health', isActive: true },
  { departmentId: 5, departmentCode: 'MOE', departmentName: 'Ministry of Education', ministry: 'Ministry of Education', isActive: true },
  { departmentId: 6, departmentCode: 'MHTE', departmentName: 'Ministry of Housing, Lands and Environment', ministry: 'Ministry of Housing', isActive: true },
  { departmentId: 7, departmentCode: 'MIT', departmentName: 'Ministry of International Trade', ministry: 'Ministry of International Trade', isActive: true },
  { departmentId: 8, departmentCode: 'MPS', departmentName: 'Ministry of Public Service', ministry: 'Ministry of Public Service', isActive: true },
]

export const REQUEST_STATUSES: RequestStatus[] = [
  { statusId: 1, statusCode: 'PENDING', statusName: 'Pending', description: 'Awaiting review', isActive: true },
  { statusId: 2, statusCode: 'APPROVED', statusName: 'Approved', description: 'Request approved', isActive: true },
  { statusId: 3, statusCode: 'REJECTED', statusName: 'Rejected', description: 'Request rejected', isActive: true },
  { statusId: 4, statusCode: 'SUSPENDED', statusName: 'Suspended', description: 'Account suspended', isActive: true },
  { statusId: 5, statusCode: 'ACTIVE', statusName: 'Active', description: 'Active and operational', isActive: true },
  { statusId: 6, statusCode: 'INACTIVE', statusName: 'Inactive', description: 'Inactive or disabled', isActive: true },
]

export const CORRESPONDENCE_TYPES: CorrespondenceType[] = [
  { correspondenceTypeId: 1, typeCode: 'LEGAL_OPINION', typeName: 'Legal Opinion Request', description: 'Request for legal opinion or advice', requiredDocuments: null, estimatedDays: 14, isActive: true },
  { correspondenceTypeId: 2, typeCode: 'CONTRACT_REVIEW', typeName: 'Contract Review', description: 'Review of contract terms and conditions', requiredDocuments: null, estimatedDays: 7, isActive: true },
  { correspondenceTypeId: 3, typeCode: 'LITIGATION', typeName: 'Litigation Matter', description: 'Litigation or dispute resolution matter', requiredDocuments: null, estimatedDays: 30, isActive: true },
  { correspondenceTypeId: 4, typeCode: 'LEGISLATION', typeName: 'Legislation Drafting', description: 'Drafting or review of legislation', requiredDocuments: null, estimatedDays: 21, isActive: true },
  { correspondenceTypeId: 5, typeCode: 'LEGAL_ADVICE', typeName: 'Legal Advice', description: 'General legal advice request', requiredDocuments: null, estimatedDays: 10, isActive: true },
  { correspondenceTypeId: 6, typeCode: 'GENERAL_INQUIRY', typeName: 'General Inquiry', description: 'General information request', requiredDocuments: null, estimatedDays: 5, isActive: true },
  { correspondenceTypeId: 7, typeCode: 'POLICY_REVIEW', typeName: 'Policy Review', description: 'Review of government policy', requiredDocuments: null, estimatedDays: 14, isActive: true },
  { correspondenceTypeId: 8, typeCode: 'INTERNATIONAL', typeName: 'International Agreement', description: 'International treaty or agreement matter', requiredDocuments: null, estimatedDays: 30, isActive: true },
  { correspondenceTypeId: 9, typeCode: 'REGULATORY', typeName: 'Regulatory Matter', description: 'Regulatory compliance matter', requiredDocuments: null, estimatedDays: 14, isActive: true },
  { correspondenceTypeId: 10, typeCode: 'OTHER', typeName: 'Other', description: 'Other correspondence type', requiredDocuments: null, estimatedDays: 10, isActive: true },
]

export const CONTRACT_TYPES: ContractType[] = [
  { contractTypeId: 1, typeCode: 'GOODS', typeName: 'Goods Supply', description: 'Supply of goods and materials', requiredDocuments: null, estimatedDays: 7, isActive: true },
  { contractTypeId: 2, typeCode: 'SERVICES', typeName: 'Services', description: 'Professional or general services', requiredDocuments: null, estimatedDays: 10, isActive: true },
  { contractTypeId: 3, typeCode: 'CONSTRUCTION', typeName: 'Construction', description: 'Construction and infrastructure works', requiredDocuments: null, estimatedDays: 21, isActive: true },
  { contractTypeId: 4, typeCode: 'CONSULTANCY', typeName: 'Consultancy', description: 'Consulting and advisory services', requiredDocuments: null, estimatedDays: 14, isActive: true },
  { contractTypeId: 5, typeCode: 'MAINTENANCE', typeName: 'Maintenance', description: 'Maintenance and support services', requiredDocuments: null, estimatedDays: 7, isActive: true },
  { contractTypeId: 6, typeCode: 'LEASE', typeName: 'Lease/Rental', description: 'Lease or rental agreements', requiredDocuments: null, estimatedDays: 14, isActive: true },
  { contractTypeId: 7, typeCode: 'PARTNERSHIP', typeName: 'Partnership', description: 'Partnership agreements', requiredDocuments: null, estimatedDays: 21, isActive: true },
  { contractTypeId: 8, typeCode: 'MOU', typeName: 'Memorandum of Understanding', description: 'Non-binding agreements', requiredDocuments: null, estimatedDays: 10, isActive: true },
  { contractTypeId: 9, typeCode: 'GRANT', typeName: 'Grant Agreement', description: 'Grant funding agreements', requiredDocuments: null, estimatedDays: 14, isActive: true },
  { contractTypeId: 10, typeCode: 'LOAN', typeName: 'Loan Agreement', description: 'Loan and financing agreements', requiredDocuments: null, estimatedDays: 21, isActive: true },
  { contractTypeId: 11, typeCode: 'INSURANCE', typeName: 'Insurance', description: 'Insurance contracts', requiredDocuments: null, estimatedDays: 7, isActive: true },
  { contractTypeId: 12, typeCode: 'EMPLOYMENT', typeName: 'Employment', description: 'Employment contracts', requiredDocuments: null, estimatedDays: 5, isActive: true },
  { contractTypeId: 13, typeCode: 'OTHER', typeName: 'Other', description: 'Other contract types', requiredDocuments: null, estimatedDays: 14, isActive: true },
]

export const CONTRACT_NATURES: ContractNature[] = [
  { contractNatureId: 1, natureCode: 'DOMESTIC', natureName: 'Domestic', description: 'Contract with local/domestic party', isActive: true },
  { contractNatureId: 2, natureCode: 'INTERNATIONAL', natureName: 'International', description: 'Contract with international party', isActive: true },
  { contractNatureId: 3, natureCode: 'GOVERNMENT', natureName: 'Government-to-Government', description: 'Agreement between government entities', isActive: true },
  { contractNatureId: 4, natureCode: 'PUBLIC_PRIVATE', natureName: 'Public-Private Partnership', description: 'PPP arrangement', isActive: true },
  { contractNatureId: 5, natureCode: 'INTERMINISTERIAL', natureName: 'Inter-Ministerial', description: 'Agreement between government ministries', isActive: true },
]

export const PRIORITY_LEVELS: PriorityLevel[] = [
  { priorityId: 1, priorityCode: 'LOW', priorityName: 'Low', description: 'Low priority - standard processing', slaDays: 30, displayOrder: 1, isActive: true },
  { priorityId: 2, priorityCode: 'MEDIUM', priorityName: 'Medium', description: 'Medium priority - normal processing', slaDays: 14, displayOrder: 2, isActive: true },
  { priorityId: 3, priorityCode: 'HIGH', priorityName: 'High', description: 'High priority - expedited processing', slaDays: 7, displayOrder: 3, isActive: true },
  { priorityId: 4, priorityCode: 'URGENT', priorityName: 'Urgent', description: 'Urgent - immediate attention required', slaDays: 3, displayOrder: 4, isActive: true },
  { priorityId: 5, priorityCode: 'CRITICAL', priorityName: 'Critical', description: 'Critical - highest priority', slaDays: 1, displayOrder: 5, isActive: true },
]

export const CASE_STATUSES: CaseStatus[] = [
  { caseStatusId: 1, statusCode: 'DRAFT', statusName: 'Draft', description: 'Application saved as draft', statusCategory: 'open', displayOrder: 1, isActive: true },
  { caseStatusId: 2, statusCode: 'SUBMITTED', statusName: 'Submitted', description: 'Application submitted', statusCategory: 'open', displayOrder: 2, isActive: true },
  { caseStatusId: 3, statusCode: 'UNDER_REVIEW', statusName: 'Under Review', description: 'Application under review', statusCategory: 'in_progress', displayOrder: 3, isActive: true },
  { caseStatusId: 4, statusCode: 'PENDING_INFO', statusName: 'Pending Information', description: 'Awaiting additional information', statusCategory: 'in_progress', displayOrder: 4, isActive: true },
  { caseStatusId: 5, statusCode: 'IN_PROGRESS', statusName: 'In Progress', description: 'Work in progress', statusCategory: 'in_progress', displayOrder: 5, isActive: true },
  { caseStatusId: 6, statusCode: 'PENDING_APPROVAL', statusName: 'Pending Approval', description: 'Awaiting approval', statusCategory: 'in_progress', displayOrder: 6, isActive: true },
  { caseStatusId: 7, statusCode: 'APPROVED', statusName: 'Approved', description: 'Application approved', statusCategory: 'closed', displayOrder: 7, isActive: true },
  { caseStatusId: 8, statusCode: 'REJECTED', statusName: 'Rejected', description: 'Application rejected', statusCategory: 'closed', displayOrder: 8, isActive: true },
  { caseStatusId: 9, statusCode: 'COMPLETED', statusName: 'Completed', description: 'Work completed', statusCategory: 'closed', displayOrder: 9, isActive: true },
  { caseStatusId: 10, statusCode: 'CLOSED', statusName: 'Closed', description: 'Case closed', statusCategory: 'closed', displayOrder: 10, isActive: true },
  { caseStatusId: 11, statusCode: 'ARCHIVED', statusName: 'Archived', description: 'Case archived', statusCategory: 'closed', displayOrder: 11, isActive: true },
]

export const CURRENCIES: Currency[] = [
  { currencyId: 1, currencyCode: 'BBD', currencyName: 'Barbados Dollar', symbol: '$', isActive: true },
  { currencyId: 2, currencyCode: 'USD', currencyName: 'US Dollar', symbol: '$', isActive: true },
  { currencyId: 3, currencyCode: 'EUR', currencyName: 'Euro', symbol: '€', isActive: true },
  { currencyId: 4, currencyCode: 'GBP', currencyName: 'British Pound', symbol: '£', isActive: true },
  { currencyId: 5, currencyCode: 'CAD', currencyName: 'Canadian Dollar', symbol: '$', isActive: true },
  { currencyId: 6, currencyCode: 'XCD', currencyName: 'Eastern Caribbean Dollar', symbol: '$', isActive: true },
]

// =============================================
// Sample User Data
// =============================================

export const MOCK_USERS: UserProfile[] = [
  {
    userId: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@sgc.gov.bb',
    firstName: 'John',
    lastName: 'Administrator',
    phone: '246-555-0001',
    entityTypeId: 1,
    entityNumber: 'SGC-ADMIN-001',
    organizationName: "Solicitor General's Chambers",
    departmentId: 1,
    position: 'System Administrator',
    roleId: 8,
    statusId: 5,
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    entityTypeName: 'Ministry',
    departmentName: "Solicitor General's Chambers",
    roleName: 'Super Administrator',
    statusName: 'Active'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440002',
    email: 'supervisor@sgc.gov.bb',
    firstName: 'Jane',
    lastName: 'Supervisor',
    phone: '246-555-0002',
    entityTypeId: 1,
    entityNumber: 'SGC-SUP-001',
    organizationName: "Solicitor General's Chambers",
    departmentId: 1,
    position: 'Senior Legal Officer',
    roleId: 6,
    statusId: 5,
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    entityTypeName: 'Ministry',
    departmentName: "Solicitor General's Chambers",
    roleName: 'Supervisor',
    statusName: 'Active'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440003',
    email: 'staff@sgc.gov.bb',
    firstName: 'Michael',
    lastName: 'Staff',
    phone: '246-555-0003',
    entityTypeId: 1,
    entityNumber: 'SGC-STF-001',
    organizationName: "Solicitor General's Chambers",
    departmentId: 1,
    position: 'Legal Officer',
    roleId: 5,
    statusId: 5,
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    entityTypeName: 'Ministry',
    departmentName: "Solicitor General's Chambers",
    roleName: 'Staff',
    statusName: 'Active'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440004',
    email: 'mda.user@mof.gov.bb',
    firstName: 'Sarah',
    lastName: 'Finance',
    phone: '246-555-0004',
    entityTypeId: 1,
    entityNumber: 'MDA-MOF-001',
    organizationName: 'Ministry of Finance',
    departmentId: 3,
    position: 'Finance Officer',
    roleId: 4,
    statusId: 5,
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    entityTypeName: 'Ministry',
    departmentName: 'Ministry of Finance',
    roleName: 'MDA User',
    statusName: 'Active'
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440005',
    email: 'public.user@email.com',
    firstName: 'Robert',
    lastName: 'Public',
    phone: '246-555-0005',
    entityTypeId: 4,
    entityNumber: 'PUB-2024-001',
    organizationName: null,
    departmentId: null,
    position: null,
    roleId: 1,
    statusId: 5,
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    entityTypeName: 'Public',
    departmentName: undefined,
    roleName: 'Public User',
    statusName: 'Active'
  },
  // Manager user for testing unified auth
  {
    userId: '550e8400-e29b-41d4-a716-446655440006',
    email: 'manager@sgc.gov.bb',
    firstName: 'Patricia',
    lastName: 'Manager',
    phone: '246-555-0006',
    entityTypeId: 1,
    entityNumber: 'SGC-MGR-001',
    organizationName: "Solicitor General's Chambers",
    departmentId: 1,
    position: 'Legal Manager',
    roleId: 7,
    statusId: 5,
    emailVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
    entityTypeName: 'Ministry',
    departmentName: "Solicitor General's Chambers",
    roleName: 'Administrator',
    statusName: 'Active'
  },
]

// =============================================
// Sample Staff Registration Requests
// =============================================

export const MOCK_STAFF_REQUESTS: StaffRegistrationRequest[] = [
  {
    requestId: '650e8400-e29b-41d4-a716-446655440001',
    requestNumber: 'REQ-2024-001',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@sgc.gov.bb',
    phone: '246-555-1001',
    departmentId: 1,
    position: 'Legal Assistant',
    employeeId: 'EMP-12345',
    supervisorName: 'Jane Supervisor',
    supervisorEmail: 'supervisor@sgc.gov.bb',
    requestedRoleId: 5,
    justification: 'Need access to manage correspondence and contracts for the legal team.',
    statusId: 1,
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
    approvedUserId: null,
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    departmentName: "Solicitor General's Chambers",
    requestedRoleName: 'Staff',
    statusName: 'Pending'
  },
  {
    requestId: '650e8400-e29b-41d4-a716-446655440002',
    requestNumber: 'REQ-2024-002',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@mof.gov.bb',
    phone: '246-555-1002',
    departmentId: 3,
    position: 'Senior Accountant',
    employeeId: 'EMP-12346',
    supervisorName: 'Sarah Finance',
    supervisorEmail: 'sarah.finance@mof.gov.bb',
    requestedRoleId: 6,
    justification: 'Require supervisor access to review and approve contract submissions from our department.',
    statusId: 1,
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
    approvedUserId: null,
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-18'),
    departmentName: 'Ministry of Finance',
    requestedRoleName: 'Supervisor',
    statusName: 'Pending'
  },
]

// =============================================
// Sample Correspondence Data
// =============================================

export const MOCK_CORRESPONDENCE: Correspondence[] = [
  {
    correspondenceId: '750e8400-e29b-41d4-a716-446655440001',
    referenceNumber: 'COR-2024-0001',
    applicantUserId: '550e8400-e29b-41d4-a716-446655440004',
    applicantName: 'Sarah Finance',
    applicantOrganization: 'Ministry of Finance',
    applicantEmail: 'mda.user@mof.gov.bb',
    applicantPhone: '246-555-0004',
    correspondenceTypeId: 1,
    subject: 'Legal Opinion on Budget Allocation',
    description: 'Request for legal opinion regarding the allocation of funds for capital projects under the new fiscal policy.',
    priorityId: 3,
    caseStatusId: 5,
    assignedToUserId: '550e8400-e29b-41d4-a716-446655440003',
    assignedDepartmentId: 1,
    assignedAt: new Date('2024-03-02'),
    submittedAt: new Date('2024-03-01'),
    dueDate: new Date('2024-03-15'),
    completedAt: null,
    responseSummary: null,
    resolutionNotes: null,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-02'),
    createdBy: '550e8400-e29b-41d4-a716-446655440004',
    updatedBy: '550e8400-e29b-41d4-a716-446655440002',
    correspondenceTypeName: 'Legal Opinion Request',
    priorityName: 'High',
    statusName: 'In Progress',
    statusCategory: 'in_progress',
    assignedToName: 'Michael Staff',
    assignedDepartmentName: "Solicitor General's Chambers"
  },
  {
    correspondenceId: '750e8400-e29b-41d4-a716-446655440002',
    referenceNumber: 'COR-2024-0002',
    applicantUserId: '550e8400-e29b-41d4-a716-446655440005',
    applicantName: 'Robert Public',
    applicantOrganization: null,
    applicantEmail: 'public.user@email.com',
    applicantPhone: '246-555-0005',
    correspondenceTypeId: 6,
    subject: 'Information Request on Property Laws',
    description: 'Request for general information about property transfer laws and requirements in Barbados.',
    priorityId: 1,
    caseStatusId: 2,
    assignedToUserId: null,
    assignedDepartmentId: null,
    assignedAt: null,
    submittedAt: new Date('2024-03-20'),
    dueDate: new Date('2024-04-20'),
    completedAt: null,
    responseSummary: null,
    resolutionNotes: null,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
    createdBy: '550e8400-e29b-41d4-a716-446655440005',
    updatedBy: null,
    correspondenceTypeName: 'General Inquiry',
    priorityName: 'Low',
    statusName: 'Submitted',
    statusCategory: 'open',
    assignedToName: null,
    assignedDepartmentName: null
  },
]

// =============================================
// Sample Contracts Data
// =============================================

export const MOCK_CONTRACTS: Contract[] = [
  {
    contractId: '850e8400-e29b-41d4-a716-446655440001',
    referenceNumber: 'CON-2024-0001',
    requestingUserId: '550e8400-e29b-41d4-a716-446655440004',
    requestingDepartmentId: 3,
    requestingOfficerName: 'Sarah Finance',
    requestingOfficerEmail: 'mda.user@mof.gov.bb',
    requestingOfficerPhone: '246-555-0004',
    contractTypeId: 4,
    contractNatureId: 2,
    contractTitle: 'Financial Advisory Services Contract',
    contractDescription: 'Engagement of international financial advisory firm for debt restructuring consultation.',
    counterpartyName: 'Global Finance Advisors Ltd',
    counterpartyAddress: '123 Financial District, New York, NY 10001',
    counterpartyContact: 'John Smith',
    counterpartyEmail: 'jsmith@globalfinance.com',
    counterpartyPhone: '+1-212-555-0100',
    contractValue: 500000.00,
    currencyId: 2,
    paymentTerms: 'Monthly installments over 12 months',
    proposedStartDate: new Date('2024-04-01'),
    proposedEndDate: new Date('2025-03-31'),
    contractDurationMonths: 12,
    priorityId: 4,
    caseStatusId: 6,
    assignedToUserId: '550e8400-e29b-41d4-a716-446655440002',
    assignedAt: new Date('2024-03-10'),
    legalReviewNotes: 'Contract terms reviewed. Recommended changes to liability clauses.',
    recommendedChanges: 'Section 5.2 - Liability cap should be increased to 150% of contract value.',
    approvalNotes: null,
    submittedAt: new Date('2024-03-08'),
    dueDate: new Date('2024-03-25'),
    completedAt: null,
    finalContractNumber: null,
    executedDate: null,
    expiryDate: null,
    createdAt: new Date('2024-03-08'),
    updatedAt: new Date('2024-03-15'),
    createdBy: '550e8400-e29b-41d4-a716-446655440004',
    updatedBy: '550e8400-e29b-41d4-a716-446655440002',
    contractTypeName: 'Consultancy',
    contractNatureName: 'International',
    requestingDepartmentName: 'Ministry of Finance',
    priorityName: 'Urgent',
    statusName: 'Pending Approval',
    statusCategory: 'in_progress',
    assignedToName: 'Jane Supervisor',
    currencyCode: 'USD',
    currencySymbol: '$'
  },
  {
    contractId: '850e8400-e29b-41d4-a716-446655440002',
    referenceNumber: 'CON-2024-0002',
    requestingUserId: '550e8400-e29b-41d4-a716-446655440004',
    requestingDepartmentId: 4,
    requestingOfficerName: 'Dr. Maria Health',
    requestingOfficerEmail: 'maria.health@moh.gov.bb',
    requestingOfficerPhone: '246-555-0010',
    contractTypeId: 1,
    contractNatureId: 1,
    contractTitle: 'Medical Equipment Supply Contract',
    contractDescription: 'Supply of medical diagnostic equipment for Queen Elizabeth Hospital.',
    counterpartyName: 'Caribbean Medical Supplies Inc',
    counterpartyAddress: '45 Industrial Park, Bridgetown, Barbados',
    counterpartyContact: 'James Clarke',
    counterpartyEmail: 'jclarke@caribmed.bb',
    counterpartyPhone: '246-555-0200',
    contractValue: 1250000.00,
    currencyId: 1,
    paymentTerms: '30% upfront, 70% on delivery',
    proposedStartDate: new Date('2024-05-01'),
    proposedEndDate: new Date('2024-08-31'),
    contractDurationMonths: 4,
    priorityId: 3,
    caseStatusId: 3,
    assignedToUserId: '550e8400-e29b-41d4-a716-446655440003',
    assignedAt: new Date('2024-03-22'),
    legalReviewNotes: null,
    recommendedChanges: null,
    approvalNotes: null,
    submittedAt: new Date('2024-03-20'),
    dueDate: new Date('2024-04-10'),
    completedAt: null,
    finalContractNumber: null,
    executedDate: null,
    expiryDate: null,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-22'),
    createdBy: '550e8400-e29b-41d4-a716-446655440004',
    updatedBy: '550e8400-e29b-41d4-a716-446655440002',
    contractTypeName: 'Goods Supply',
    contractNatureName: 'Domestic',
    requestingDepartmentName: 'Ministry of Health',
    priorityName: 'High',
    statusName: 'Under Review',
    statusCategory: 'in_progress',
    assignedToName: 'Michael Staff',
    currencyCode: 'BBD',
    currencySymbol: '$'
  },
]

// =============================================
// Sample Activity Log
// =============================================

export const MOCK_ACTIVITY_LOG: ActivityLog[] = [
  {
    activityId: '950e8400-e29b-41d4-a716-446655440001',
    userId: '550e8400-e29b-41d4-a716-446655440004',
    userName: 'Sarah Finance',
    userRole: 'MDA User',
    activityType: 'submission',
    activityDescription: 'Submitted new correspondence request',
    entityType: 'Correspondence',
    entityId: '750e8400-e29b-41d4-a716-446655440001',
    entityReference: 'COR-2024-0001',
    metadata: null,
    createdAt: new Date('2024-03-01T10:30:00')
  },
  {
    activityId: '950e8400-e29b-41d4-a716-446655440002',
    userId: '550e8400-e29b-41d4-a716-446655440002',
    userName: 'Jane Supervisor',
    userRole: 'Supervisor',
    activityType: 'assignment',
    activityDescription: 'Assigned correspondence to Michael Staff',
    entityType: 'Correspondence',
    entityId: '750e8400-e29b-41d4-a716-446655440001',
    entityReference: 'COR-2024-0001',
    metadata: JSON.stringify({ assignedTo: 'Michael Staff' }),
    createdAt: new Date('2024-03-02T09:15:00')
  },
  {
    activityId: '950e8400-e29b-41d4-a716-446655440003',
    userId: '550e8400-e29b-41d4-a716-446655440003',
    userName: 'Michael Staff',
    userRole: 'Staff',
    activityType: 'status_change',
    activityDescription: 'Changed status from Submitted to In Progress',
    entityType: 'Correspondence',
    entityId: '750e8400-e29b-41d4-a716-446655440001',
    entityReference: 'COR-2024-0001',
    metadata: JSON.stringify({ fromStatus: 'Submitted', toStatus: 'In Progress' }),
    createdAt: new Date('2024-03-02T14:00:00')
  },
  {
    activityId: '950e8400-e29b-41d4-a716-446655440004',
    userId: '550e8400-e29b-41d4-a716-446655440004',
    userName: 'Sarah Finance',
    userRole: 'MDA User',
    activityType: 'submission',
    activityDescription: 'Submitted new contract request',
    entityType: 'Contract',
    entityId: '850e8400-e29b-41d4-a716-446655440001',
    entityReference: 'CON-2024-0001',
    metadata: null,
    createdAt: new Date('2024-03-08T11:00:00')
  },
  {
    activityId: '950e8400-e29b-41d4-a716-446655440005',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    userName: 'John Administrator',
    userRole: 'Super Administrator',
    activityType: 'login',
    activityDescription: 'User logged into the system',
    entityType: 'User',
    entityId: '550e8400-e29b-41d4-a716-446655440001',
    entityReference: null,
    metadata: null,
    createdAt: new Date('2024-03-21T08:00:00')
  },
]

// =============================================
// Dashboard Summary (computed from mock data)
// =============================================

export function getDashboardSummary(): DashboardSummary {
  const openStatuses = CASE_STATUSES.filter(s => s.statusCategory === 'open').map(s => s.caseStatusId)
  const inProgressStatuses = CASE_STATUSES.filter(s => s.statusCategory === 'in_progress').map(s => s.caseStatusId)
  const closedStatuses = CASE_STATUSES.filter(s => s.statusCategory === 'closed').map(s => s.caseStatusId)
  
  return {
    totalCorrespondence: MOCK_CORRESPONDENCE.length,
    openCorrespondence: MOCK_CORRESPONDENCE.filter(c => openStatuses.includes(c.caseStatusId)).length,
    inProgressCorrespondence: MOCK_CORRESPONDENCE.filter(c => inProgressStatuses.includes(c.caseStatusId)).length,
    closedCorrespondence: MOCK_CORRESPONDENCE.filter(c => closedStatuses.includes(c.caseStatusId)).length,
    totalContracts: MOCK_CONTRACTS.length,
    openContracts: MOCK_CONTRACTS.filter(c => openStatuses.includes(c.caseStatusId)).length,
    inProgressContracts: MOCK_CONTRACTS.filter(c => inProgressStatuses.includes(c.caseStatusId)).length,
    closedContracts: MOCK_CONTRACTS.filter(c => closedStatuses.includes(c.caseStatusId)).length,
    totalContractValue: MOCK_CONTRACTS.reduce((sum, c) => sum + c.contractValue, 0),
    totalUsers: MOCK_USERS.length,
    activeUsers: MOCK_USERS.filter(u => u.statusId === 5).length,
    pendingStaffRequests: MOCK_STAFF_REQUESTS.filter(r => r.statusId === 1).length
  }
}

// =============================================
// Transaction History (combined view)
// =============================================

export function getTransactionHistory(): TransactionHistoryItem[] {
  const correspondenceItems: TransactionHistoryItem[] = MOCK_CORRESPONDENCE.map(c => ({
    transactionType: 'Correspondence' as const,
    transactionId: c.correspondenceId,
    referenceNumber: c.referenceNumber,
    title: c.subject,
    category: c.correspondenceTypeName || '',
    priority: c.priorityName || '',
    status: c.statusName || '',
    statusCategory: c.statusCategory || '',
    requestorName: c.applicantName,
    organization: c.applicantOrganization,
    assignedTo: c.assignedToName || null,
    contractValue: null,
    currency: null,
    submittedAt: c.submittedAt,
    dueDate: c.dueDate,
    completedAt: c.completedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  }))
  
  const contractItems: TransactionHistoryItem[] = MOCK_CONTRACTS.map(c => ({
    transactionType: 'Contract' as const,
    transactionId: c.contractId,
    referenceNumber: c.referenceNumber,
    title: c.contractTitle,
    category: c.contractTypeName || '',
    priority: c.priorityName || '',
    status: c.statusName || '',
    statusCategory: c.statusCategory || '',
    requestorName: c.requestingOfficerName,
    organization: c.requestingDepartmentName || null,
    assignedTo: c.assignedToName || null,
    contractValue: c.contractValue,
    currency: c.currencyCode || null,
    submittedAt: c.submittedAt,
    dueDate: c.dueDate,
    completedAt: c.completedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  }))
  
  return [...correspondenceItems, ...contractItems].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )
}

// =============================================
// Renewal Status Lookup
// =============================================

export const RENEWAL_STATUSES: RenewalStatus[] = [
  { renewalStatusId: 1, statusCode: 'DRAFT', statusName: 'Draft', description: 'Renewal request saved as draft', displayOrder: 1, isActive: true },
  { renewalStatusId: 2, statusCode: 'PENDING_VALIDATION', statusName: 'Pending Validation', description: 'Awaiting validation that this is a legitimate renewal', displayOrder: 2, isActive: true },
  { renewalStatusId: 3, statusCode: 'VALIDATED', statusName: 'Validated', description: 'Confirmed as valid renewal request', displayOrder: 3, isActive: true },
  { renewalStatusId: 4, statusCode: 'UNDER_REVIEW', statusName: 'Under Review', description: 'Renewal under legal review', displayOrder: 4, isActive: true },
  { renewalStatusId: 5, statusCode: 'PENDING_INFO', statusName: 'Pending Information', description: 'Awaiting additional information', displayOrder: 5, isActive: true },
  { renewalStatusId: 6, statusCode: 'PENDING_APPROVAL', statusName: 'Pending Approval', description: 'Awaiting approval', displayOrder: 6, isActive: true },
  { renewalStatusId: 7, statusCode: 'APPROVED', statusName: 'Approved', description: 'Renewal approved', displayOrder: 7, isActive: true },
  { renewalStatusId: 8, statusCode: 'REJECTED', statusName: 'Rejected', description: 'Renewal rejected', displayOrder: 8, isActive: true },
  { renewalStatusId: 9, statusCode: 'EXECUTED', statusName: 'Executed', description: 'Renewal executed and new contract created', displayOrder: 9, isActive: true },
  { renewalStatusId: 10, statusCode: 'CANCELLED', statusName: 'Cancelled', description: 'Renewal request cancelled', displayOrder: 10, isActive: true },
]

// =============================================
// Sample Contract Renewals
// =============================================

export const MOCK_CONTRACT_RENEWALS: ContractRenewal[] = [
  {
    renewalId: '850e8400-e29b-41d4-a716-446655440001',
    renewalReferenceNumber: 'REN-2024-0001',
    originalContractId: '800e8400-e29b-41d4-a716-446655440001',
    previousRenewalId: null,
    renewalSequence: 1,
    isValidRenewal: true,
    validationNotes: 'Verified against original contract CON-2024-0001',
    validatedBy: '550e8400-e29b-41d4-a716-446655440002',
    validatedAt: new Date('2024-03-12'),
    renewalReason: 'Contract expiring, services still required for ongoing operations',
    renewalJustification: 'The maintenance services provided have been satisfactory and are essential for continued operations.',
    originalContractNumber: 'CON-2024-0001',
    originalContractTitle: 'IT Infrastructure Maintenance Agreement',
    originalStartDate: new Date('2023-04-01'),
    originalEndDate: new Date('2024-03-31'),
    originalValue: 150000,
    proposedStartDate: new Date('2024-04-01'),
    proposedEndDate: new Date('2025-03-31'),
    proposedValue: 165000,
    currencyId: 1,
    proposedDurationMonths: 12,
    valueChange: 15000,
    valueChangePercent: 10,
    termsChanged: true,
    termsChangeDescription: 'Updated SLA terms and added new service categories',
    counterpartyName: 'TechCorp Solutions Ltd.',
    counterpartyChanged: false,
    requestingUserId: '550e8400-e29b-41d4-a716-446655440004',
    requestingDepartmentId: 3,
    requestingOfficerName: 'Sarah Finance',
    requestingOfficerEmail: 'mda.user@mof.gov.bb',
    renewalStatusId: 4,
    priorityId: 3,
    assignedToUserId: '550e8400-e29b-41d4-a716-446655440003',
    assignedAt: new Date('2024-03-12'),
    legalReviewNotes: 'Reviewing updated SLA terms',
    approvalNotes: null,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    submittedAt: new Date('2024-03-10'),
    dueDate: new Date('2024-03-25'),
    completedAt: null,
    newContractId: null,
    newContractNumber: null,
    executedDate: null,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-12'),
    createdBy: '550e8400-e29b-41d4-a716-446655440004',
    updatedBy: '550e8400-e29b-41d4-a716-446655440002',
    renewalStatusName: 'Under Review',
    priorityName: 'High',
    requestingDepartmentName: 'Ministry of Finance',
    assignedToName: 'Michael Staff',
    currencyCode: 'BBD',
    currencySymbol: '$'
  },
  {
    renewalId: '850e8400-e29b-41d4-a716-446655440002',
    renewalReferenceNumber: 'REN-2024-0002',
    originalContractId: '800e8400-e29b-41d4-a716-446655440002',
    previousRenewalId: null,
    renewalSequence: 1,
    isValidRenewal: false,
    validationNotes: null,
    validatedBy: null,
    validatedAt: null,
    renewalReason: 'Annual renewal of cleaning services contract',
    renewalJustification: 'Satisfactory service delivery throughout the current contract period.',
    originalContractNumber: 'CON-2023-0045',
    originalContractTitle: 'Building Cleaning Services',
    originalStartDate: new Date('2023-06-01'),
    originalEndDate: new Date('2024-05-31'),
    originalValue: 85000,
    proposedStartDate: new Date('2024-06-01'),
    proposedEndDate: new Date('2025-05-31'),
    proposedValue: 88000,
    currencyId: 1,
    proposedDurationMonths: 12,
    valueChange: 3000,
    valueChangePercent: 3.5,
    termsChanged: false,
    termsChangeDescription: null,
    counterpartyName: 'CleanPro Services Inc.',
    counterpartyChanged: false,
    requestingUserId: '550e8400-e29b-41d4-a716-446655440004',
    requestingDepartmentId: 3,
    requestingOfficerName: 'Sarah Finance',
    requestingOfficerEmail: 'mda.user@mof.gov.bb',
    renewalStatusId: 2,
    priorityId: 2,
    assignedToUserId: null,
    assignedAt: null,
    legalReviewNotes: null,
    approvalNotes: null,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    submittedAt: new Date('2024-03-18'),
    dueDate: new Date('2024-04-15'),
    completedAt: null,
    newContractId: null,
    newContractNumber: null,
    executedDate: null,
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-18'),
    createdBy: '550e8400-e29b-41d4-a716-446655440004',
    updatedBy: null,
    renewalStatusName: 'Pending Validation',
    priorityName: 'Medium',
    requestingDepartmentName: 'Ministry of Finance',
    assignedToName: null,
    currencyCode: 'BBD',
    currencySymbol: '$'
  }
]

// =============================================
// Contracts Expiring Soon (for renewal candidates)
// =============================================

export const MOCK_CONTRACTS_EXPIRING: ContractExpiringForRenewal[] = [
  {
    contractId: '800e8400-e29b-41d4-a716-446655440003',
    referenceNumber: 'CON-2024-0003',
    contractTitle: 'Security Services Agreement',
    counterpartyName: 'SecureGuard Ltd.',
    contractValue: 120000,
    currencyCode: 'BBD',
    expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    daysUntilExpiry: 25,
    expiryStatus: 'CRITICAL',
    requestingDepartment: 'Ministry of Finance',
    contractStatus: 'Completed',
    hasPendingRenewal: false
  },
  {
    contractId: '800e8400-e29b-41d4-a716-446655440004',
    referenceNumber: 'CON-2024-0004',
    contractTitle: 'Office Supplies Framework Agreement',
    counterpartyName: 'OfficeMax Barbados',
    contractValue: 45000,
    currencyCode: 'BBD',
    expiryDate: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000), // 55 days from now
    daysUntilExpiry: 55,
    expiryStatus: 'WARNING',
    requestingDepartment: 'Ministry of Education',
    contractStatus: 'Completed',
    hasPendingRenewal: false
  },
  {
    contractId: '800e8400-e29b-41d4-a716-446655440005',
    referenceNumber: 'CON-2024-0005',
    contractTitle: 'Software Licensing Agreement',
    counterpartyName: 'Microsoft Caribbean',
    contractValue: 250000,
    currencyCode: 'USD',
    expiryDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
    daysUntilExpiry: 75,
    expiryStatus: 'UPCOMING',
    requestingDepartment: "Solicitor General's Chambers",
    contractStatus: 'Completed',
    hasPendingRenewal: true
  }
]

// =============================================
// Entity Registration History
// =============================================

export const MOCK_ENTITY_REGISTRATIONS: EntityRegistrationHistory[] = [
  {
    historyId: '950e8400-e29b-41d4-a716-446655440001',
    entityNumber: 'MDA-MOF-001',
    entityTypeId: 1,
    organizationName: 'Ministry of Finance',
    registrationNumber: null,
    taxId: null,
    contactFirstName: 'Sarah',
    contactLastName: 'Finance',
    contactEmail: 'mda.user@mof.gov.bb',
    contactPhone: '246-555-0004',
    contactPosition: 'Finance Officer',
    addressLine1: 'Government Headquarters',
    addressLine2: 'Bay Street',
    city: 'Bridgetown',
    parish: 'St. Michael',
    country: 'Barbados',
    postalCode: 'BB11000',
    departmentId: 3,
    ministry: 'Ministry of Finance',
    barNumber: null,
    lawFirm: null,
    companyType: null,
    incorporationDate: null,
    registrationStatusId: 5,
    emailVerified: true,
    emailVerifiedAt: new Date('2024-02-15'),
    documentsVerified: true,
    documentsVerifiedAt: new Date('2024-02-16'),
    documentsVerifiedBy: '550e8400-e29b-41d4-a716-446655440001',
    actionType: 'REGISTRATION',
    changeDescription: 'Initial registration for Ministry of Finance',
    userId: '550e8400-e29b-41d4-a716-446655440004',
    createdAt: new Date('2024-02-15'),
    createdBy: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    entityTypeName: 'Ministry',
    departmentName: 'Ministry of Finance',
    statusName: 'Active'
  },
  {
    historyId: '950e8400-e29b-41d4-a716-446655440002',
    entityNumber: 'PUB-2024-001',
    entityTypeId: 4,
    organizationName: 'N/A',
    registrationNumber: null,
    taxId: null,
    contactFirstName: 'Robert',
    contactLastName: 'Public',
    contactEmail: 'public.user@email.com',
    contactPhone: '246-555-0005',
    contactPosition: null,
    addressLine1: '123 Main Street',
    addressLine2: null,
    city: 'Bridgetown',
    parish: 'St. Michael',
    country: 'Barbados',
    postalCode: 'BB11001',
    departmentId: null,
    ministry: null,
    barNumber: null,
    lawFirm: null,
    companyType: null,
    incorporationDate: null,
    registrationStatusId: 5,
    emailVerified: true,
    emailVerifiedAt: new Date('2024-03-01'),
    documentsVerified: false,
    documentsVerifiedAt: null,
    documentsVerifiedBy: null,
    actionType: 'REGISTRATION',
    changeDescription: 'Public user self-registration',
    userId: '550e8400-e29b-41d4-a716-446655440005',
    createdAt: new Date('2024-03-01'),
    createdBy: null,
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0',
    entityTypeName: 'Public',
    departmentName: undefined,
    statusName: 'Active'
  }
]

// =============================================
// Helper function to validate renewals
// =============================================

export function validateRenewal(originalContractId: string, renewalData: Partial<ContractRenewal>): { 
  isValid: boolean 
  errors: string[] 
} {
  const errors: string[] = []
  
  // Find original contract
  const originalContract = MOCK_CONTRACTS.find(c => c.contractId === originalContractId)
  if (!originalContract) {
    errors.push('Original contract not found')
    return { isValid: false, errors }
  }
  
  // Check if contract is eligible for renewal (must be completed or about to expire)
  if (originalContract.statusCategory !== 'closed' && originalContract.caseStatusId !== 9) {
    errors.push('Original contract must be completed before renewal')
  }
  
  // Check if there's already a pending renewal
  const existingRenewal = MOCK_CONTRACT_RENEWALS.find(
    r => r.originalContractId === originalContractId && 
    ![8, 10].includes(r.renewalStatusId) // Not rejected or cancelled
  )
  if (existingRenewal) {
    errors.push('A renewal request already exists for this contract')
  }
  
  // Validate proposed dates
  if (renewalData.proposedStartDate && originalContract.expiryDate) {
    const proposedStart = new Date(renewalData.proposedStartDate)
    const originalExpiry = new Date(originalContract.expiryDate)
    
    if (proposedStart < originalExpiry) {
      errors.push('Proposed start date cannot be before original contract expiry')
    }
  }
  
  // Validate value change (flag significant increases)
  if (renewalData.proposedValue && originalContract.contractValue) {
    const changePercent = ((renewalData.proposedValue - originalContract.contractValue) / originalContract.contractValue) * 100
    if (changePercent > 25) {
      errors.push('Value increase exceeds 25% - requires additional justification')
    }
  }
  
  return { isValid: errors.length === 0, errors }
}
