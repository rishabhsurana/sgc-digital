import { getConnection } from '@/lib/db/connection'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { PublicUser, StaffUser, StaffRole } from '@/lib/types/database'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sgc-digital-secret-key-change-in-production')
const TOKEN_EXPIRY = '24h'
const REFRESH_TOKEN_EXPIRY = '7d'

export interface AuthenticatedUser {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: 'public' | 'staff'
  role?: StaffRole
  organizationId?: string
  permissions?: string[]
}

export interface LoginResult {
  success: boolean
  user?: AuthenticatedUser
  accessToken?: string
  refreshToken?: string
  error?: string
}

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'individual' | 'mda_staff'
  phone?: string
  title?: string
  organizationId?: string
}

export class AuthService {
  /**
   * Register a new public user
   */
  async registerPublicUser(input: RegisterInput): Promise<LoginResult> {
    const pool = await getConnection()

    // Check if email already exists
    const existing = await pool.request()
      .input('email', input.email.toLowerCase())
      .query('SELECT id FROM public_users WHERE email = @email')

    if (existing.recordset.length > 0) {
      return { success: false, error: 'Email already registered' }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 12)

    // Create user
    const result = await pool.request()
      .input('email', input.email.toLowerCase())
      .input('password_hash', passwordHash)
      .input('user_type', input.userType)
      .input('first_name', input.firstName)
      .input('last_name', input.lastName)
      .input('phone', input.phone || null)
      .input('title', input.title || null)
      .input('primary_organization_id', input.organizationId || null)
      .query(`
        INSERT INTO public_users (
          email, password_hash, user_type, first_name, last_name, 
          phone, title, primary_organization_id, is_active, is_verified, created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @email, @password_hash, @user_type, @first_name, @last_name,
          @phone, @title, @primary_organization_id, 1, 0, GETDATE(), GETDATE()
        )
      `)

    const user = result.recordset[0]

    // If MDA staff, create organization link
    if (input.userType === 'mda_staff' && input.organizationId) {
      await pool.request()
        .input('user_id', user.id)
        .input('organization_id', input.organizationId)
        .query(`
          INSERT INTO public_user_organizations (
            user_id, organization_id, is_primary, can_submit_correspondence, 
            can_submit_contracts, is_active, created_at
          )
          VALUES (
            @user_id, @organization_id, 1, 1, 1, 1, GETDATE()
          )
        `)
    }

    // Generate tokens
    const authUser = this.mapPublicUser(user)
    const accessToken = await this.generateAccessToken(authUser)
    const refreshToken = await this.generateRefreshToken(authUser)

    return {
      success: true,
      user: authUser,
      accessToken,
      refreshToken
    }
  }

  /**
   * Login for public users
   */
  async loginPublicUser(email: string, password: string): Promise<LoginResult> {
    const pool = await getConnection()

    const result = await pool.request()
      .input('email', email.toLowerCase())
      .query(`
        SELECT pu.*, o.name as organization_name
        FROM public_users pu
        LEFT JOIN organizations o ON pu.primary_organization_id = o.id
        WHERE pu.email = @email AND pu.is_active = 1
      `)

    if (result.recordset.length === 0) {
      return { success: false, error: 'Invalid email or password' }
    }

    const user = result.recordset[0]

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      // Increment failed login attempts
      await pool.request()
        .input('id', user.id)
        .query(`
          UPDATE public_users 
          SET failed_login_attempts = ISNULL(failed_login_attempts, 0) + 1,
              locked_until = CASE 
                WHEN ISNULL(failed_login_attempts, 0) >= 4 THEN DATEADD(MINUTE, 30, GETDATE())
                ELSE locked_until 
              END
          WHERE id = @id
        `)

      return { success: false, error: 'Invalid email or password' }
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { success: false, error: 'Account is temporarily locked. Please try again later.' }
    }

    // Update last login and reset failed attempts
    await pool.request()
      .input('id', user.id)
      .query(`
        UPDATE public_users 
        SET last_login_at = GETDATE(), 
            failed_login_attempts = 0,
            locked_until = NULL
        WHERE id = @id
      `)

    // Generate tokens
    const authUser = this.mapPublicUser(user)
    const accessToken = await this.generateAccessToken(authUser)
    const refreshToken = await this.generateRefreshToken(authUser)

    return {
      success: true,
      user: authUser,
      accessToken,
      refreshToken
    }
  }

  /**
   * Login for staff users (management portal)
   */
  async loginStaffUser(email: string, password: string): Promise<LoginResult> {
    const pool = await getConnection()

    const result = await pool.request()
      .input('email', email.toLowerCase())
      .query(`
        SELECT su.*, sr.name as role_name, sr.code as role_code, sr.level as role_level,
               sd.name as department_name, sd.code as department_code
        FROM staff_users su
        JOIN staff_roles sr ON su.role_id = sr.id
        LEFT JOIN staff_departments sd ON su.department_id = sd.id
        WHERE su.email = @email AND su.is_active = 1
      `)

    if (result.recordset.length === 0) {
      return { success: false, error: 'Invalid email or password' }
    }

    const user = result.recordset[0]

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      await pool.request()
        .input('id', user.id)
        .query(`
          UPDATE staff_users 
          SET failed_login_attempts = ISNULL(failed_login_attempts, 0) + 1,
              locked_until = CASE 
                WHEN ISNULL(failed_login_attempts, 0) >= 4 THEN DATEADD(MINUTE, 30, GETDATE())
                ELSE locked_until 
              END
          WHERE id = @id
        `)

      return { success: false, error: 'Invalid email or password' }
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { success: false, error: 'Account is temporarily locked. Please try again later.' }
    }

    // Get user permissions
    const permissionsResult = await pool.request()
      .input('role_id', user.role_id)
      .query(`
        SELECT sp.code
        FROM staff_role_permissions srp
        JOIN staff_permissions sp ON srp.permission_id = sp.id
        WHERE srp.role_id = @role_id
      `)

    const permissions = permissionsResult.recordset.map(p => p.code)

    // Update last login
    await pool.request()
      .input('id', user.id)
      .query(`
        UPDATE staff_users 
        SET last_login_at = GETDATE(), 
            failed_login_attempts = 0,
            locked_until = NULL
        WHERE id = @id
      `)

    // Log audit
    await this.logAudit(user.id, 'login', 'staff_users', user.id)

    // Generate tokens
    const authUser = this.mapStaffUser(user, permissions)
    const accessToken = await this.generateAccessToken(authUser)
    const refreshToken = await this.generateRefreshToken(authUser)

    return {
      success: true,
      user: authUser,
      accessToken,
      refreshToken
    }
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload.user as AuthenticatedUser
    } catch {
      return null
    }
  }

  /**
   * Get current user from cookies
   */
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) return null

    return this.verifyToken(token)
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
    const user = await this.verifyToken(refreshToken)
    if (!user) return null

    const accessToken = await this.generateAccessToken(user)
    return { accessToken }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const pool = await getConnection()

    const result = await pool.request()
      .input('user_id', userId)
      .input('permission', permission)
      .query(`
        SELECT 1
        FROM staff_users su
        JOIN staff_role_permissions srp ON su.role_id = srp.role_id
        JOIN staff_permissions sp ON srp.permission_id = sp.id
        WHERE su.id = @user_id AND sp.code = @permission
      `)

    return result.recordset.length > 0
  }

  /**
   * Check if public user can access organization
   */
  async canAccessOrganization(userId: string, organizationId: string): Promise<boolean> {
    const pool = await getConnection()

    const result = await pool.request()
      .input('user_id', userId)
      .input('organization_id', organizationId)
      .query(`
        SELECT 1
        FROM public_user_organizations
        WHERE user_id = @user_id 
          AND organization_id = @organization_id
          AND is_active = 1
          AND (expires_at IS NULL OR expires_at > GETDATE())
      `)

    return result.recordset.length > 0
  }

  /**
   * Logout - invalidate session
   */
  async logout(userId: string, userType: 'public' | 'staff'): Promise<void> {
    if (userType === 'staff') {
      await this.logAudit(userId, 'logout', 'staff_users', userId)
    }

    const cookieStore = await cookies()
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
  }

  /**
   * Change password
   */
  async changePassword(userId: string, userType: 'public' | 'staff', currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const pool = await getConnection()
    const table = userType === 'public' ? 'public_users' : 'staff_users'

    const result = await pool.request()
      .input('id', userId)
      .query(`SELECT password_hash FROM ${table} WHERE id = @id`)

    if (result.recordset.length === 0) {
      return { success: false, error: 'User not found' }
    }

    const validPassword = await bcrypt.compare(currentPassword, result.recordset[0].password_hash)
    if (!validPassword) {
      return { success: false, error: 'Current password is incorrect' }
    }

    const newHash = await bcrypt.hash(newPassword, 12)

    await pool.request()
      .input('id', userId)
      .input('password_hash', newHash)
      .query(`UPDATE ${table} SET password_hash = @password_hash, updated_at = GETDATE() WHERE id = @id`)

    if (userType === 'staff') {
      await this.logAudit(userId, 'password_change', table, userId)
    }

    return { success: true }
  }

  /**
   * Generate access token
   */
  private async generateAccessToken(user: AuthenticatedUser): Promise<string> {
    return new SignJWT({ user })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(JWT_SECRET)
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(user: AuthenticatedUser): Promise<string> {
    return new SignJWT({ user })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .sign(JWT_SECRET)
  }

  /**
   * Map public user to AuthenticatedUser
   */
  private mapPublicUser(user: any): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: 'public',
      organizationId: user.primary_organization_id
    }
  }

  /**
   * Map staff user to AuthenticatedUser
   */
  private mapStaffUser(user: any, permissions: string[]): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: 'staff',
      role: {
        id: user.role_id,
        name: user.role_name,
        code: user.role_code,
        level: user.role_level
      } as StaffRole,
      permissions
    }
  }

  /**
   * Log audit event
   */
  private async logAudit(userId: string, action: string, entityType: string, entityId: string): Promise<void> {
    const pool = await getConnection()

    await pool.request()
      .input('user_id', userId)
      .input('action', action)
      .input('entity_type', entityType)
      .input('entity_id', entityId)
      .query(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, created_at)
        VALUES (@user_id, @action, @entity_type, @entity_id, GETDATE())
      `)
  }
}

export const authService = new AuthService()
