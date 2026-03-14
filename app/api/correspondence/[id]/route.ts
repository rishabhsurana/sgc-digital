import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin, logActivity } from '@/lib/auth'
import { z } from 'zod'

// GET /api/correspondence/[id] - Get correspondence by ID
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
          co.*,
          m.name as recipient_mda_name,
          u1.name as assigned_to_name,
          u2.name as created_by_name
        FROM Correspondence co
        LEFT JOIN MDAs m ON co.recipient_mda_id = m.id
        LEFT JOIN Users u1 ON co.assigned_to = u1.id
        LEFT JOIN Users u2 ON co.created_by = u2.id
        WHERE co.id = @id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Correspondence not found' }, { status: 404 })
    }

    // Get associated documents
    const documents = await pool.request()
      .input('entity_id', sql.NVarChar, id)
      .query(`
        SELECT id, file_name, original_name, file_size, mime_type, document_type, created_at
        FROM Documents
        WHERE entity_type = 'correspondence' AND entity_id = @entity_id
        ORDER BY created_at DESC
      `)

    return NextResponse.json({
      ...result.recordset[0],
      documents: documents.recordset,
    })
  } catch (error) {
    console.error('Get correspondence error:', error)
    return NextResponse.json({ error: 'Failed to fetch correspondence' }, { status: 500 })
  }
}

// PATCH /api/correspondence/[id] - Update correspondence
const updateCorrespondenceSchema = z.object({
  subject: z.string().min(5).max(500).optional(),
  description: z.string().nullable().optional(),
  type: z.enum(['incoming', 'outgoing']).optional(),
  sender_name: z.string().min(2).optional(),
  sender_organization: z.string().nullable().optional(),
  sender_email: z.string().email().nullable().optional(),
  recipient_mda_id: z.string().uuid().optional(),
  date_received: z.string().optional(),
  date_due: z.string().nullable().optional(),
  status: z.enum(['received', 'in_progress', 'pending_review', 'completed', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
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
    const validation = updateCorrespondenceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const pool = await getConnection()

    // Check if correspondence exists
    const existing = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`SELECT id, status FROM Correspondence WHERE id = @id`)

    if (existing.recordset.length === 0) {
      return NextResponse.json({ error: 'Correspondence not found' }, { status: 404 })
    }

    // Build update query
    const updates: string[] = []
    const request_db = pool.request().input('id', sql.NVarChar, id)

    if (data.subject !== undefined) {
      updates.push('subject = @subject')
      request_db.input('subject', sql.NVarChar, data.subject)
    }
    if (data.description !== undefined) {
      updates.push('description = @description')
      request_db.input('description', sql.NVarChar, data.description)
    }
    if (data.type !== undefined) {
      updates.push('type = @type')
      request_db.input('type', sql.NVarChar, data.type)
    }
    if (data.sender_name !== undefined) {
      updates.push('sender_name = @sender_name')
      request_db.input('sender_name', sql.NVarChar, data.sender_name)
    }
    if (data.sender_organization !== undefined) {
      updates.push('sender_organization = @sender_organization')
      request_db.input('sender_organization', sql.NVarChar, data.sender_organization)
    }
    if (data.sender_email !== undefined) {
      updates.push('sender_email = @sender_email')
      request_db.input('sender_email', sql.NVarChar, data.sender_email)
    }
    if (data.recipient_mda_id !== undefined) {
      updates.push('recipient_mda_id = @recipient_mda_id')
      request_db.input('recipient_mda_id', sql.NVarChar, data.recipient_mda_id)
    }
    if (data.date_received !== undefined) {
      updates.push('date_received = @date_received')
      request_db.input('date_received', sql.Date, new Date(data.date_received))
    }
    if (data.date_due !== undefined) {
      updates.push('date_due = @date_due')
      request_db.input('date_due', sql.Date, data.date_due ? new Date(data.date_due) : null)
    }
    if (data.priority !== undefined) {
      updates.push('priority = @priority')
      request_db.input('priority', sql.NVarChar, data.priority)
    }
    if (data.assigned_to !== undefined) {
      updates.push('assigned_to = @assigned_to')
      request_db.input('assigned_to', sql.NVarChar, data.assigned_to)
    }
    if (data.notes !== undefined) {
      updates.push('notes = @notes')
      request_db.input('notes', sql.NVarChar, data.notes)
    }

    // Status changes (with completion tracking)
    if (data.status !== undefined) {
      updates.push('status = @status')
      request_db.input('status', sql.NVarChar, data.status)

      if (data.status === 'completed') {
        updates.push('completed_at = GETUTCDATE()')
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    await request_db.query(`UPDATE Correspondence SET ${updates.join(', ')} WHERE id = @id`)

    await logActivity(user.id, 'UPDATE_CORRESPONDENCE', 'correspondence', id, 'Updated correspondence')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update correspondence error:', error)
    return NextResponse.json({ error: 'Failed to update correspondence' }, { status: 500 })
  }
}

// DELETE /api/correspondence/[id] - Delete correspondence (admin only)
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
      .query(`DELETE FROM Documents WHERE entity_type = 'correspondence' AND entity_id = @entity_id`)

    // Delete correspondence
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .query(`DELETE FROM Correspondence WHERE id = @id`)

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Correspondence not found' }, { status: 404 })
    }

    await logActivity(user.id, 'DELETE_CORRESPONDENCE', 'correspondence', id, 'Deleted correspondence')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete correspondence error:', error)
    return NextResponse.json({ error: 'Failed to delete correspondence' }, { status: 500 })
  }
}
