import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin, logActivity } from '@/lib/auth'
import { z } from 'zod'

// GET /api/contracts/[id] - Get contract by ID
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
    const pool = await getConnection()

    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`
        SELECT 
          c.*,
          m.name as mda_name,
          u1.name as assigned_to_name,
          u2.name as created_by_name,
          u3.name as approved_by_name
        FROM Contracts c
        LEFT JOIN MDAs m ON c.mda_id = m.id
        LEFT JOIN Users u1 ON c.assigned_to = u1.id
        LEFT JOIN Users u2 ON c.created_by = u2.id
        LEFT JOIN Users u3 ON c.approved_by = u3.id
        WHERE c.id = @id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Get associated documents
    const documents = await pool.request()
      .input('entity_id', sql.NVarChar, id)
      .query(`
        SELECT id, file_name, original_name, file_size, mime_type, document_type, created_at
        FROM Documents
        WHERE entity_type = 'contract' AND entity_id = @entity_id
        ORDER BY created_at DESC
      `)

    return NextResponse.json({
      ...result.recordset[0],
      documents: documents.recordset,
    })
  } catch (error) {
    console.error('Get contract error:', error)
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 })
  }
}

// PATCH /api/contracts/[id] - Update contract
const updateContractSchema = z.object({
  title: z.string().min(5).max(500).optional(),
  description: z.string().nullable().optional(),
  mda_id: z.string().uuid().optional(),
  contractor_name: z.string().min(2).optional(),
  contractor_email: z.string().email().nullable().optional(),
  contractor_phone: z.string().nullable().optional(),
  contract_value: z.number().positive().optional(),
  currency: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['draft', 'review', 'pending_approval', 'approved', 'active', 'completed', 'terminated']).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
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
    const body = await request.json()
    const validation = updateContractSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const pool = await getConnection()

    // Check if contract exists
    const existing = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`SELECT id, status FROM Contracts WHERE id = @id`)

    if (existing.recordset.length === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Build update query
    const updates: string[] = []
    const request_db = pool.request().input('id', sql.NVarChar, id)

    if (data.title !== undefined) {
      updates.push('title = @title')
      request_db.input('title', sql.NVarChar, data.title)
    }
    if (data.description !== undefined) {
      updates.push('description = @description')
      request_db.input('description', sql.NVarChar, data.description)
    }
    if (data.mda_id !== undefined) {
      updates.push('mda_id = @mda_id')
      request_db.input('mda_id', sql.NVarChar, data.mda_id)
    }
    if (data.contractor_name !== undefined) {
      updates.push('contractor_name = @contractor_name')
      request_db.input('contractor_name', sql.NVarChar, data.contractor_name)
    }
    if (data.contractor_email !== undefined) {
      updates.push('contractor_email = @contractor_email')
      request_db.input('contractor_email', sql.NVarChar, data.contractor_email)
    }
    if (data.contractor_phone !== undefined) {
      updates.push('contractor_phone = @contractor_phone')
      request_db.input('contractor_phone', sql.NVarChar, data.contractor_phone)
    }
    if (data.contract_value !== undefined) {
      updates.push('contract_value = @contract_value')
      request_db.input('contract_value', sql.Decimal(18, 2), data.contract_value)
    }
    if (data.currency !== undefined) {
      updates.push('currency = @currency')
      request_db.input('currency', sql.NVarChar, data.currency)
    }
    if (data.start_date !== undefined) {
      updates.push('start_date = @start_date')
      request_db.input('start_date', sql.Date, new Date(data.start_date))
    }
    if (data.end_date !== undefined) {
      updates.push('end_date = @end_date')
      request_db.input('end_date', sql.Date, new Date(data.end_date))
    }
    if (data.assigned_to !== undefined) {
      updates.push('assigned_to = @assigned_to')
      request_db.input('assigned_to', sql.NVarChar, data.assigned_to)
    }
    if (data.notes !== undefined) {
      updates.push('notes = @notes')
      request_db.input('notes', sql.NVarChar, data.notes)
    }

    // Status changes (with approval tracking)
    if (data.status !== undefined) {
      updates.push('status = @status')
      request_db.input('status', sql.NVarChar, data.status)

      if (data.status === 'approved') {
        updates.push('approved_by = @approved_by')
        updates.push('approved_at = GETUTCDATE()')
        request_db.input('approved_by', sql.NVarChar, user.id)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await request_db.query(`UPDATE Contracts SET ${updates.join(', ')} WHERE id = @id`)

    await logActivity(user.id, 'UPDATE_CONTRACT', 'contract', id, `Updated contract`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update contract error:', error)
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 })
  }
}

// DELETE /api/contracts/[id] - Delete contract (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const pool = await getConnection()

    // Delete associated documents first
    await pool.request()
      .input('entity_id', sql.NVarChar, id)
      .query(`DELETE FROM Documents WHERE entity_type = 'contract' AND entity_id = @entity_id`)

    // Delete contract
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`DELETE FROM Contracts WHERE id = @id`)

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    await logActivity(user.id, 'DELETE_CONTRACT', 'contract', id, 'Deleted contract')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete contract error:', error)
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 })
  }
}
