import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin, logActivity } from '@/lib/auth'
import { z } from 'zod'

// GET /api/mdas/[id] - Get MDA by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pool = await getConnection()

    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`
        SELECT id, code, name, description, contact_email, contact_phone, address, is_active, created_at, updated_at
        FROM MDAs
        WHERE id = @id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'MDA not found' }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error('Get MDA error:', error)
    return NextResponse.json({ error: 'Failed to fetch MDA' }, { status: 500 })
  }
}

// PATCH /api/mdas/[id] - Update MDA (admin only)
const updateMDASchema = z.object({
  code: z.string().min(2).max(50).optional(),
  name: z.string().min(2).max(255).optional(),
  description: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = updateMDASchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const pool = await getConnection()

    // Check if MDA exists
    const existing = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`SELECT id FROM MDAs WHERE id = @id`)

    if (existing.recordset.length === 0) {
      return NextResponse.json({ error: 'MDA not found' }, { status: 404 })
    }

    // Build update query
    const updates: string[] = []
    const request_db = pool.request().input('id', sql.NVarChar, id)

    if (data.code !== undefined) {
      updates.push('code = @code')
      request_db.input('code', sql.NVarChar, data.code.toLowerCase())
    }
    if (data.name !== undefined) {
      updates.push('name = @name')
      request_db.input('name', sql.NVarChar, data.name)
    }
    if (data.description !== undefined) {
      updates.push('description = @description')
      request_db.input('description', sql.NVarChar, data.description)
    }
    if (data.contact_email !== undefined) {
      updates.push('contact_email = @contact_email')
      request_db.input('contact_email', sql.NVarChar, data.contact_email)
    }
    if (data.contact_phone !== undefined) {
      updates.push('contact_phone = @contact_phone')
      request_db.input('contact_phone', sql.NVarChar, data.contact_phone)
    }
    if (data.address !== undefined) {
      updates.push('address = @address')
      request_db.input('address', sql.NVarChar, data.address)
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = @is_active')
      request_db.input('is_active', sql.Bit, data.is_active)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await request_db.query(`UPDATE MDAs SET ${updates.join(', ')} WHERE id = @id`)

    await logActivity(user.id, 'UPDATE_MDA', 'mda', id, 'Updated MDA')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update MDA error:', error)
    return NextResponse.json({ error: 'Failed to update MDA' }, { status: 500 })
  }
}

// DELETE /api/mdas/[id] - Delete MDA (admin only)
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
    const pool = await getConnection()

    // Check if MDA has associated records
    const associations = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM Users WHERE mda_id = @id) as users_count,
          (SELECT COUNT(*) FROM Contracts WHERE mda_id = @id) as contracts_count,
          (SELECT COUNT(*) FROM Correspondence WHERE recipient_mda_id = @id) as correspondence_count
      `)

    const counts = associations.recordset[0]
    if (counts.users_count > 0 || counts.contracts_count > 0 || counts.correspondence_count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete MDA with associated records. Deactivate it instead.' },
        { status: 400 }
      )
    }

    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`DELETE FROM MDAs WHERE id = @id`)

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'MDA not found' }, { status: 404 })
    }

    await logActivity(user.id, 'DELETE_MDA', 'mda', id, 'Deleted MDA')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete MDA error:', error)
    return NextResponse.json({ error: 'Failed to delete MDA' }, { status: 500 })
  }
}
