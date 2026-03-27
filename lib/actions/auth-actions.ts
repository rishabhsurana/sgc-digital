'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  authenticateUser, 
  authenticateStaff, 
  getUserByEmail,
  createUser,
  createStaffRequest,
  logActivity
} from '@/lib/data/data-service'
import type { UserProfile } from '@/lib/data/types'

// =============================================
// Session Management
// =============================================

const SESSION_COOKIE_NAME = 'sgc_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface SessionData {
  userId: string
  email: string
  firstName: string
  lastName: string
  roleId: number
  roleName: string
  entityTypeId: number
  entityTypeName: string
  departmentId: number | null
  departmentName?: string
  organizationName?: string | null
  position?: string | null
  expiresAt: number
}

async function createSession(user: UserProfile): Promise<string> {
  const sessionData: SessionData = {
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roleId: user.roleId,
    roleName: user.roleName || '',
    entityTypeId: user.entityTypeId,
    entityTypeName: user.entityTypeName || '',
    departmentId: user.departmentId,
    departmentName: user.departmentName,
    organizationName: user.organizationName,
    position: user.position,
    expiresAt: Date.now() + SESSION_DURATION
  }
  
  // Encode session data as base64 (in production, use proper JWT or encrypted session)
  const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64')
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })
  
  // Set a client-readable cookie for UI state (staff check)
  // Staff roles: Staff (5), Supervisor (6), Admin (7), Super Admin (8)
  const isStaff = [5, 6, 7, 8].includes(user.roleId)
  cookieStore.set('sgc_is_staff', isStaff ? '1' : '0', {
    httpOnly: false, // Client can read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })
  
  return sessionToken
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const sessionData: SessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    )
    
    // Check if session has expired
    if (sessionData.expiresAt < Date.now()) {
      await clearSession()
      return null
    }
    
    return sessionData
  } catch {
    return null
  }
}

// Client-safe version that can be called from client components
export async function getSessionForClient(): Promise<Omit<SessionData, 'expiresAt'> | null> {
  const session = await getSession()
  if (!session) return null
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { expiresAt, ...clientSafeData } = session
  return clientSafeData
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete('sgc_is_staff')
}

// =============================================
// Public User Authentication
// =============================================

export interface LoginResult {
  success: boolean
  error?: string
  redirectTo?: string
  user?: {
    fullName: string
    email: string
    organization?: string
    submitterType?: string
  }
}

export async function loginUser(
  formData: FormData
): Promise<LoginResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }
  
  const result = await authenticateUser(email, password)
  
  if (!result.success || !result.user) {
    return { success: false, error: result.error || 'Authentication failed' }
  }
  
  await createSession(result.user)
  
  // Check if user is staff (Staff, Supervisor, Admin, Super Admin)
  const isStaffUser = [5, 6, 7, 8].includes(result.user.roleId)
  
  // Log the activity
  await logActivity({
    userId: result.user.userId,
    userName: `${result.user.firstName} ${result.user.lastName}`,
    userRole: result.user.roleName,
    activityType: 'login',
    activityDescription: isStaffUser 
      ? 'Staff user logged into Portal' 
      : 'User logged into Client Portal',
    entityType: 'User',
    entityId: result.user.userId
  })
  
  // Determine redirect based on user type
  let redirectTo = '/dashboard'
  
  // Staff users go to management portal by default when logging in via public portal
  if (isStaffUser) {
    redirectTo = '/management'
  } else if (result.user.entityTypeId === 5) {
    redirectTo = '/attorney/dashboard'
  } else if (result.user.entityTypeId === 6) {
    redirectTo = '/company/dashboard'
  }
  
  return { 
    success: true, 
    redirectTo,
    user: {
      fullName: `${result.user.firstName} ${result.user.lastName}`,
      email: result.user.email,
      organization: result.user.organizationName || result.user.departmentName,
      submitterType: result.user.entityTypeName
    }
  }
}

export async function loginStaff(
  formData: FormData
): Promise<LoginResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' }
  }
  
  const result = await authenticateStaff(email, password)
  
  if (!result.success || !result.user) {
    return { success: false, error: result.error || 'Authentication failed' }
  }
  
  await createSession(result.user)
  
  // Log the activity
  await logActivity({
    userId: result.user.userId,
    userName: `${result.user.firstName} ${result.user.lastName}`,
    userRole: result.user.roleName,
    activityType: 'login',
    activityDescription: 'Staff logged into Management Portal',
    entityType: 'User',
    entityId: result.user.userId
  })
  
  return { success: true, redirectTo: '/management' }
}

export async function logout(): Promise<void> {
  const session = await getSession()
  
  if (session) {
    await logActivity({
      userId: session.userId,
      userName: `${session.firstName} ${session.lastName}`,
      userRole: session.roleName,
      activityType: 'logout',
      activityDescription: 'User logged out',
      entityType: 'User',
      entityId: session.userId
    })
  }
  
  await clearSession()
  redirect('/')
}

// =============================================
// User Registration
// =============================================

export interface RegistrationResult {
  success: boolean
  error?: string
  userId?: string
  entityNumber?: string
}

export async function registerPublicUser(
  formData: FormData
): Promise<RegistrationResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phone = formData.get('phone') as string
  
  // Validation
  if (!email || !password || !firstName || !lastName) {
    return { success: false, error: 'All required fields must be filled' }
  }
  
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }
  
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' }
  }
  
  // Check if email already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' }
  }
  
  try {
    const user = await createUser({
      email,
      firstName,
      lastName,
      phone: phone || null,
      entityTypeId: 4, // Public
      roleId: 1, // Public User
      statusId: 5 // Active
    })
    
    await logActivity({
      userId: user.userId,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: 'Public User',
      activityType: 'registration',
      activityDescription: 'New public user registered',
      entityType: 'User',
      entityId: user.userId
    })
    
    return { 
      success: true, 
      userId: user.userId,
      entityNumber: user.entityNumber 
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

export async function registerMDAUser(
  formData: FormData
): Promise<RegistrationResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phone = formData.get('phone') as string
  const departmentId = parseInt(formData.get('departmentId') as string)
  const position = formData.get('position') as string
  
  // Validation
  if (!email || !password || !firstName || !lastName || !departmentId || !position) {
    return { success: false, error: 'All required fields must be filled' }
  }
  
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }
  
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' }
  }
  
  // Check if email already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' }
  }
  
  try {
    const user = await createUser({
      email,
      firstName,
      lastName,
      phone: phone || null,
      entityTypeId: 1, // Ministry
      departmentId,
      position,
      roleId: 4, // MDA User
      statusId: 5 // Active
    })
    
    await logActivity({
      userId: user.userId,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: 'MDA User',
      activityType: 'registration',
      activityDescription: 'New MDA user registered',
      entityType: 'User',
      entityId: user.userId
    })
    
    return { 
      success: true, 
      userId: user.userId,
      entityNumber: user.entityNumber 
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

export async function registerAttorney(
  formData: FormData
): Promise<RegistrationResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phone = formData.get('phone') as string
  const organizationName = formData.get('organizationName') as string
  const barNumber = formData.get('barNumber') as string
  
  // Validation
  if (!email || !password || !firstName || !lastName || !organizationName || !barNumber) {
    return { success: false, error: 'All required fields must be filled' }
  }
  
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }
  
  // Check if email already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' }
  }
  
  try {
    // Attorneys require approval, so set status to pending
    const user = await createUser({
      email,
      firstName,
      lastName,
      phone: phone || null,
      entityTypeId: 5, // Attorney
      organizationName,
      position: `Bar #: ${barNumber}`,
      roleId: 2, // Attorney
      statusId: 1 // Pending approval
    })
    
    await logActivity({
      userId: user.userId,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: 'Attorney',
      activityType: 'registration',
      activityDescription: 'New attorney registration (pending approval)',
      entityType: 'User',
      entityId: user.userId
    })
    
    return { 
      success: true, 
      userId: user.userId,
      entityNumber: user.entityNumber 
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

export async function registerCompany(
  formData: FormData
): Promise<RegistrationResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const phone = formData.get('phone') as string
  const organizationName = formData.get('organizationName') as string
  const registrationNumber = formData.get('registrationNumber') as string
  const position = formData.get('position') as string
  
  // Validation
  if (!email || !password || !firstName || !lastName || !organizationName || !registrationNumber) {
    return { success: false, error: 'All required fields must be filled' }
  }
  
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }
  
  // Check if email already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' }
  }
  
  try {
    // Companies require approval, so set status to pending
    const user = await createUser({
      email,
      firstName,
      lastName,
      phone: phone || null,
      entityTypeId: 6, // Company
      organizationName,
      position: position || `Reg #: ${registrationNumber}`,
      roleId: 3, // Company
      statusId: 1 // Pending approval
    })
    
    await logActivity({
      userId: user.userId,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: 'Company',
      activityType: 'registration',
      activityDescription: 'New company registration (pending approval)',
      entityType: 'User',
      entityId: user.userId
    })
    
    return { 
      success: true, 
      userId: user.userId,
      entityNumber: user.entityNumber 
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

// =============================================
// Staff Registration Request
// =============================================

export interface StaffRequestResult {
  success: boolean
  error?: string
  requestNumber?: string
}

export async function submitStaffRegistrationRequest(
  formData: FormData
): Promise<StaffRequestResult> {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const departmentId = parseInt(formData.get('departmentId') as string)
  const position = formData.get('position') as string
  const employeeId = formData.get('employeeId') as string
  const supervisorName = formData.get('supervisorName') as string
  const supervisorEmail = formData.get('supervisorEmail') as string
  const requestedRoleId = parseInt(formData.get('requestedRoleId') as string) || 5
  const justification = formData.get('justification') as string
  
  // Validation
  if (!firstName || !lastName || !email || !departmentId || !position) {
    return { success: false, error: 'All required fields must be filled' }
  }
  
  // Check if email already exists as a user
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' }
  }
  
  try {
    const request = await createStaffRequest({
      firstName,
      lastName,
      email,
      phone: phone || null,
      departmentId,
      position,
      employeeId: employeeId || null,
      supervisorName: supervisorName || null,
      supervisorEmail: supervisorEmail || null,
      requestedRoleId,
      justification: justification || null
    })
    
    await logActivity({
      userName: `${firstName} ${lastName}`,
      activityType: 'staff_request',
      activityDescription: 'New staff registration request submitted',
      entityType: 'StaffRegistrationRequest',
      entityId: request.requestId,
      entityReference: request.requestNumber
    })
    
    return { 
      success: true, 
      requestNumber: request.requestNumber 
    }
  } catch (error) {
    console.error('Staff request error:', error)
    return { success: false, error: 'Request submission failed. Please try again.' }
  }
}

// =============================================
// Protected Route Helpers
// =============================================

export async function requireAuth(allowedRoles?: number[]): Promise<SessionData> {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  if (allowedRoles && !allowedRoles.includes(session.roleId)) {
    redirect('/unauthorized')
  }
  
  return session
}

export async function requireStaffAuth(): Promise<SessionData> {
  // Staff roles: Staff (5), Supervisor (6), Admin (7), Super Admin (8)
  return requireAuth([5, 6, 7, 8])
}

export async function requireAdminAuth(): Promise<SessionData> {
  // Admin roles: Admin (7), Super Admin (8)
  return requireAuth([7, 8])
}

export async function requireSuperAdminAuth(): Promise<SessionData> {
  // Only Super Admin (8)
  return requireAuth([8])
}
