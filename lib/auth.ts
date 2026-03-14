import { cookies } from 'next/headers'
import { getConnection, sql } from './db/config'
import { DbUser, DbSession, UserWithoutPassword } from './db/types'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const SESSION_COOKIE_NAME = 'sgc_session'
const SESSION_EXPIRY_DAYS = 7

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate a secure session token
export function generateSessionToken(): string {
  return uuidv4() + '-' + uuidv4()
}

// Create a new session for user
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<DbSession> {
  const pool = await getConnection()
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)
  const sessionId = uuidv4()

  await pool.request()
    .input('id', sql.NVarChar, sessionId)
    .input('user_id', sql.NVarChar, userId)
    .input('token', sql.NVarChar, token)
    .input('expires_at', sql.DateTime2, expiresAt)
    .input('ip_address', sql.NVarChar, ipAddress || null)
    .input('user_agent', sql.NVarChar, userAgent || null)
    .query(`
      INSERT INTO Sessions (id, user_id, token, expires_at, ip_address, user_agent)
      VALUES (@id, @user_id, @token, @expires_at, @ip_address, @user_agent)
    `)

  // Update user's last login
  await pool.request()
    .input('user_id', sql.NVarChar, userId)
    .query(`UPDATE Users SET last_login = GETUTCDATE() WHERE id = @user_id`)

  return {
    id: sessionId,
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: new Date(),
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
  }
}

// Validate session token and return user
export async function validateSession(token: string): Promise<UserWithoutPassword | null> {
  const pool = await getConnection()

  const result = await pool.request()
    .input('token', sql.NVarChar, token)
    .query(`
      SELECT u.id, u.email, u.name, u.role, u.status, u.mda_id, u.phone,
             u.created_at, u.updated_at, u.last_login,
             m.name as mda_name
      FROM Sessions s
      INNER JOIN Users u ON s.user_id = u.id
      LEFT JOIN MDAs m ON u.mda_id = m.id
      WHERE s.token = @token AND s.expires_at > GETUTCDATE() AND u.status = 'active'
    `)

  if (result.recordset.length === 0) {
    return null
  }

  return result.recordset[0] as UserWithoutPassword
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
  const pool = await getConnection()
  await pool.request()
    .input('token', sql.NVarChar, token)
    .query(`DELETE FROM Sessions WHERE token = @token`)
}

// Delete all sessions for a user
export async function deleteAllUserSessions(userId: string): Promise<void> {
  const pool = await getConnection()
  await pool.request()
    .input('user_id', sql.NVarChar, userId)
    .query(`DELETE FROM Sessions WHERE user_id = @user_id`)
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<number> {
  const pool = await getConnection()
  const result = await pool.request()
    .query(`DELETE FROM Sessions WHERE expires_at < GETUTCDATE()`)
  return result.rowsAffected[0]
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<UserWithoutPassword | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    return null
  }

  return validateSession(sessionCookie.value)
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

// Clear session cookie
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Get session token from cookie
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  return sessionCookie?.value || null
}

// Check if user has required role
export function hasRole(user: UserWithoutPassword, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role)
}

// Check if user is admin (super_admin, admin, or manager)
export function isAdmin(user: UserWithoutPassword): boolean {
  return ['super_admin', 'admin', 'manager'].includes(user.role)
}

// Log activity
export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string,
  ipAddress?: string
): Promise<void> {
  const pool = await getConnection()
  await pool.request()
    .input('id', sql.NVarChar, uuidv4())
    .input('user_id', sql.NVarChar, userId)
    .input('action', sql.NVarChar, action)
    .input('entity_type', sql.NVarChar, entityType)
    .input('entity_id', sql.NVarChar, entityId || null)
    .input('details', sql.NVarChar, details || null)
    .input('ip_address', sql.NVarChar, ipAddress || null)
    .query(`
      INSERT INTO ActivityLog (id, user_id, action, entity_type, entity_id, details, ip_address)
      VALUES (@id, @user_id, @action, @entity_type, @entity_id, @details, @ip_address)
    `)
}
