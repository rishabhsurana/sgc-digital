import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, logActivity } from '@/lib/auth'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Generate correspondence reference number
function generateCorrespondenceRef(type: 'incoming' | 'outgoing'): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const prefix = type === 'incoming' ? 'IN' : 'OUT'
  return `SGC-COR-${prefix}-${year}-${random}`
}

// GET /api/correspondence - List correspondence with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const mda_id = searchParams.get('mda_id')
    const assigned_to = searchParams.get('assigned_to')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    const pool = await getConnection()
    const offset = (page - 1) * pageSize

    // Build query dynamically
    let whereClause = 'WHERE 1=1'
    const queryParams: { name: string; type: unknown; value: unknown }[] = []

    if (status) {
      whereClause += ' AND co.status = @status'
      queryParams.push({ name: 'status', type: sql.NVarChar, value: status })
    }
    if (type) {
      whereClause += ' AND co.type = @type'
      queryParams.push({ name: 'type', type: sql.NVarChar, value: type })
    }
    if (mda_id) {
      whereClause += ' AND co.recipient_mda_id = @mda_id'
      queryParams.push({ name: 'mda_id', type: sql.NVarChar, value: mda_id })
    }
    if (assigned_to) {
      whereClause += ' AND co.assigned_to = @assigned_to'
      queryParams.push({ name: 'assigned_to', type: sql.NVarChar, value: assigned_to })
    }
    if (priority) {
      whereClause += ' AND co.priority = @priority'
      queryParams.push({ name: 'priority', type: sql.NVarChar, value: priority })
    }
    if (search) {
      whereClause += ' AND (co.subject LIKE @search OR co.reference_number LIKE @search OR co.sender_name LIKE @search)'
      queryParams.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` })
    }
    if (date_from) {
      whereClause += ' AND co.date_received >= @date_from'
      queryParams.push({ name: 'date_from', type: sql.Date, value: new Date(date_from) })
    }
    if (date_to) {
      whereClause += ' AND co.date_received <= @date_to'
      queryParams.push({ name: 'date_to', type: sql.Date, value: new Date(date_to) })
    }

    // Get total count
    let countRequest = pool.request()
    queryParams.forEach(p => countRequest.input(p.name, p.type as sql.ISqlType, p.value))
    const countResult = await countRequest.query(`SELECT COUNT(*) as total FROM Correspondence co ${whereClause}`)
    const total = countResult.recordset[0].total

    // Get paginated results with joins
    let dataRequest = pool.request()
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
    queryParams.forEach(p => dataRequest.input(p.name, p.type as sql.ISqlType, p.value))

    const result = await dataRequest.query(`
      SELECT 
        co.*,
        m.name as recipient_mda_name,
        u1.name as assigned_to_name,
        u2.name as created_by_name,
        (SELECT COUNT(*) FROM Documents WHERE entity_type = 'correspondence' AND entity_id = co.id) as document_count
      FROM Correspondence co
      LEFT JOIN MDAs m ON co.recipient_mda_id = m.id
      LEFT JOIN Users u1 ON co.assigned_to = u1.id
      LEFT JOIN Users u2 ON co.created_by = u2.id
      ${whereClause}
      ORDER BY 
        CASE co.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        co.date_received DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `)

    return NextResponse.json({
      data: result.recordset,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get correspondence error:', error)
    return NextResponse.json({ error: 'Failed to fetch correspondence' }, { status: 500 })
  }
}

// POST /api/correspondence - Create new correspondence
const createCorrespondenceSchema = z.object({
  subject: z.string().min(5).max(500),
  description: z.string().optional(),
  type: z.enum(['incoming', 'outgoing']),
  sender_name: z.string().min(2),
  sender_organization: z.string().optional(),
  sender_email: z.string().email().optional(),
  recipient_mda_id: z.string().uuid(),
  date_received: z.string(),
  date_due: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createCorrespondenceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const pool = await getConnection()
    const correspondenceId = uuidv4()
    const referenceNumber = generateCorrespondenceRef(data.type)

    await pool.request()
      .input('id', sql.NVarChar, correspondenceId)
      .input('reference_number', sql.NVarChar, referenceNumber)
      .input('subject', sql.NVarChar, data.subject)
      .input('description', sql.NVarChar, data.description || null)
      .input('type', sql.NVarChar, data.type)
      .input('sender_name', sql.NVarChar, data.sender_name)
      .input('sender_organization', sql.NVarChar, data.sender_organization || null)
      .input('sender_email', sql.NVarChar, data.sender_email || null)
      .input('recipient_mda_id', sql.NVarChar, data.recipient_mda_id)
      .input('date_received', sql.Date, new Date(data.date_received))
      .input('date_due', sql.Date, data.date_due ? new Date(data.date_due) : null)
      .input('priority', sql.NVarChar, data.priority)
      .input('assigned_to', sql.NVarChar, data.assigned_to || null)
      .input('created_by', sql.NVarChar, user.id)
      .input('notes', sql.NVarChar, data.notes || null)
      .query(`
        INSERT INTO Correspondence (
          id, reference_number, subject, description, type, sender_name,
          sender_organization, sender_email, recipient_mda_id, date_received,
          date_due, status, priority, assigned_to, created_by, notes
        )
        VALUES (
          @id, @reference_number, @subject, @description, @type, @sender_name,
          @sender_organization, @sender_email, @recipient_mda_id, @date_received,
          @date_due, 'received', @priority, @assigned_to, @created_by, @notes
        )
      `)

    await logActivity(user.id, 'CREATE_CORRESPONDENCE', 'correspondence', correspondenceId, `Created correspondence: ${referenceNumber}`)

    return NextResponse.json({ 
      success: true, 
      id: correspondenceId, 
      reference_number: referenceNumber 
    }, { status: 201 })
  } catch (error) {
    console.error('Create correspondence error:', error)
    return NextResponse.json({ error: 'Failed to create correspondence' }, { status: 500 })
  }
}
