import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin, hashPassword, logActivity, deleteAllUserSessions } from '@/lib/auth'
import { z } from 'zod'

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Users can only view their own profile unless admin
    if (user.id !== id && !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pool = await getConnection()
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`
        SELECT u.id, u.email, u.name, u.role, u.status, u.mda_id, u.phone,
               u.created_at, u.updated_at, u.last_login,
               m.name as mda_name
        FROM Users u
        LEFT JOIN MDAs m ON u.mda_id = m.id
        WHERE u.id = @id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PATCH /api/users/[id] - Update user
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['super_admin', 'admin', 'manager', 'user']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  mda_id: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  password: z.string().min(8).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Users can only update their own profile (limited fields) unless admin
    if (user.id !== id && !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validation = updateUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const pool = await getConnection()

    // Check if user exists
    const existing = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`SELECT id, status FROM Users WHERE id = @id`)

    if (existing.recordset.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update query dynamically
    const updates: string[] = []
    const request_db = pool.request().input('id', sql.NVarChar, id)

    if (data.name !== undefined) {
      updates.push('name = @name')
      request_db.input('name', sql.NVarChar, data.name)
    }
    if (data.phone !== undefined) {
      updates.push('phone = @phone')
      request_db.input('phone', sql.NVarChar, data.phone)
    }

    // Only admins can update these fields
    if (isAdmin(user)) {
      if (data.role !== undefined) {
        updates.push('role = @role')
        request_db.input('role', sql.NVarChar, data.role)
      }
      if (data.status !== undefined) {
        updates.push('status = @status')
        request_db.input('status', sql.NVarChar, data.status)
        
        // If deactivating user, invalidate their sessions
        if (data.status === 'inactive') {
          await deleteAllUserSessions(id)
        }
      }
      if (data.mda_id !== undefined) {
        updates.push('mda_id = @mda_id')
        request_db.input('mda_id', sql.NVarChar, data.mda_id)
      }
    }

    // Handle password change
    if (data.password) {
      const passwordHash = await hashPassword(data.password)
      updates.push('password_hash = @password_hash')
      request_db.input('password_hash', sql.NVarChar, passwordHash)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await request_db.query(`UPDATE Users SET ${updates.join(', ')} WHERE id = @id`)

    await logActivity(user.id, 'UPDATE_USER', 'user', id, `Updated user profile`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (user.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const pool = await getConnection()

    // Delete user sessions first
    await deleteAllUserSessions(id)

    // Delete user
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`DELETE FROM Users WHERE id = @id`)

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await logActivity(user.id, 'DELETE_USER', 'user', id, `Deleted user`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
