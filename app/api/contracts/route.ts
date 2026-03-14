import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, logActivity } from '@/lib/auth'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// Generate contract reference number
function generateContractRef(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `SGC-CON-${year}-${random}`
}

// GET /api/contracts - List contracts with filtering and pagination
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
    const mda_id = searchParams.get('mda_id')
    const assigned_to = searchParams.get('assigned_to')
    const search = searchParams.get('search')
    const start_date_from = searchParams.get('start_date_from')
    const start_date_to = searchParams.get('start_date_to')

    const pool = await getConnection()
    const offset = (page - 1) * pageSize

    // Build query dynamically
    let whereClause = 'WHERE 1=1'
    const queryParams: { name: string; type: unknown; value: unknown }[] = []

    if (status) {
      whereClause += ' AND c.status = @status'
      queryParams.push({ name: 'status', type: sql.NVarChar, value: status })
    }
    if (mda_id) {
      whereClause += ' AND c.mda_id = @mda_id'
      queryParams.push({ name: 'mda_id', type: sql.NVarChar, value: mda_id })
    }
    if (assigned_to) {
      whereClause += ' AND c.assigned_to = @assigned_to'
      queryParams.push({ name: 'assigned_to', type: sql.NVarChar, value: assigned_to })
    }
    if (search) {
      whereClause += ' AND (c.title LIKE @search OR c.reference_number LIKE @search OR c.contractor_name LIKE @search)'
      queryParams.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` })
    }
    if (start_date_from) {
      whereClause += ' AND c.start_date >= @start_date_from'
      queryParams.push({ name: 'start_date_from', type: sql.Date, value: new Date(start_date_from) })
    }
    if (start_date_to) {
      whereClause += ' AND c.start_date <= @start_date_to'
      queryParams.push({ name: 'start_date_to', type: sql.Date, value: new Date(start_date_to) })
    }

    // Get total count
    let countRequest = pool.request()
    queryParams.forEach(p => countRequest.input(p.name, p.type as sql.ISqlType, p.value))
    const countResult = await countRequest.query(`SELECT COUNT(*) as total FROM Contracts c ${whereClause}`)
    const total = countResult.recordset[0].total

    // Get paginated results with joins
    let dataRequest = pool.request()
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
    queryParams.forEach(p => dataRequest.input(p.name, p.type as sql.ISqlType, p.value))

    const result = await dataRequest.query(`
      SELECT 
        c.*,
        m.name as mda_name,
        u1.name as assigned_to_name,
        u2.name as created_by_name,
        u3.name as approved_by_name,
        (SELECT COUNT(*) FROM Documents WHERE entity_type = 'contract' AND entity_id = c.id) as document_count
      FROM Contracts c
      LEFT JOIN MDAs m ON c.mda_id = m.id
      LEFT JOIN Users u1 ON c.assigned_to = u1.id
      LEFT JOIN Users u2 ON c.created_by = u2.id
      LEFT JOIN Users u3 ON c.approved_by = u3.id
      ${whereClause}
      ORDER BY c.created_at DESC
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
    console.error('Get contracts error:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}

// POST /api/contracts - Create new contract
const createContractSchema = z.object({
  title: z.string().min(5).max(500),
  description: z.string().optional(),
  mda_id: z.string().uuid(),
  contractor_name: z.string().min(2),
  contractor_email: z.string().email().optional(),
  contractor_phone: z.string().optional(),
  contract_value: z.number().positive(),
  currency: z.string().default('BBD'),
  start_date: z.string(),
  end_date: z.string(),
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
    const validation = createContractSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const pool = await getConnection()
    const contractId = uuidv4()
    const referenceNumber = generateContractRef()

    await pool.request()
      .input('id', sql.NVarChar, contractId)
      .input('reference_number', sql.NVarChar, referenceNumber)
      .input('title', sql.NVarChar, data.title)
      .input('description', sql.NVarChar, data.description || null)
      .input('mda_id', sql.NVarChar, data.mda_id)
      .input('contractor_name', sql.NVarChar, data.contractor_name)
      .input('contractor_email', sql.NVarChar, data.contractor_email || null)
      .input('contractor_phone', sql.NVarChar, data.contractor_phone || null)
      .input('contract_value', sql.Decimal(18, 2), data.contract_value)
      .input('currency', sql.NVarChar, data.currency)
      .input('start_date', sql.Date, new Date(data.start_date))
      .input('end_date', sql.Date, new Date(data.end_date))
      .input('assigned_to', sql.NVarChar, data.assigned_to || null)
      .input('created_by', sql.NVarChar, user.id)
      .input('notes', sql.NVarChar, data.notes || null)
      .query(`
        INSERT INTO Contracts (
          id, reference_number, title, description, mda_id, contractor_name,
          contractor_email, contractor_phone, contract_value, currency,
          start_date, end_date, status, assigned_to, created_by, notes
        )
        VALUES (
          @id, @reference_number, @title, @description, @mda_id, @contractor_name,
          @contractor_email, @contractor_phone, @contract_value, @currency,
          @start_date, @end_date, 'draft', @assigned_to, @created_by, @notes
        )
      `)

    await logActivity(user.id, 'CREATE_CONTRACT', 'contract', contractId, `Created contract: ${referenceNumber}`)

    return NextResponse.json({ 
      success: true, 
      id: contractId, 
      reference_number: referenceNumber 
    }, { status: 201 })
  } catch (error) {
    console.error('Create contract error:', error)
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 })
  }
}
