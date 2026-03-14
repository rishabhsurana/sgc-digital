import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin, logActivity } from '@/lib/auth'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// GET /api/mdas - List all MDAs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const search = searchParams.get('search')

    const pool = await getConnection()
    
    let whereClause = includeInactive ? 'WHERE 1=1' : 'WHERE is_active = 1'
    const queryRequest = pool.request()

    if (search) {
      whereClause += ' AND (name LIKE @search OR code LIKE @search)'
      queryRequest.input('search', sql.NVarChar, `%${search}%`)
    }

    const result = await queryRequest.query(`
      SELECT id, code, name, description, contact_email, contact_phone, address, is_active, created_at
      FROM MDAs
      ${whereClause}
      ORDER BY name ASC
    `)

    return NextResponse.json({ data: result.recordset })
  } catch (error) {
    console.error('Get MDAs error:', error)
    return NextResponse.json({ error: 'Failed to fetch MDAs' }, { status: 500 })
  }
}

// POST /api/mdas - Create new MDA (admin only)
const createMDASchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createMDASchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const pool = await getConnection()

    // Check if code exists
    const existing = await pool.request()
      .input('code', sql.NVarChar, data.code.toLowerCase())
      .query(`SELECT id FROM MDAs WHERE code = @code`)

    if (existing.recordset.length > 0) {
      return NextResponse.json({ error: 'MDA code already exists' }, { status: 409 })
    }

    const mdaId = uuidv4()

    await pool.request()
      .input('id', sql.NVarChar, mdaId)
      .input('code', sql.NVarChar, data.code.toLowerCase())
      .input('name', sql.NVarChar, data.name)
      .input('description', sql.NVarChar, data.description || null)
      .input('contact_email', sql.NVarChar, data.contact_email || null)
      .input('contact_phone', sql.NVarChar, data.contact_phone || null)
      .input('address', sql.NVarChar, data.address || null)
      .input('is_active', sql.Bit, data.is_active !== false)
      .query(`
        INSERT INTO MDAs (id, code, name, description, contact_email, contact_phone, address, is_active)
        VALUES (@id, @code, @name, @description, @contact_email, @contact_phone, @address, @is_active)
      `)

    await logActivity(user.id, 'CREATE_MDA', 'mda', mdaId, `Created MDA: ${data.name}`)

    return NextResponse.json({ success: true, id: mdaId }, { status: 201 })
  } catch (error) {
    console.error('Create MDA error:', error)
    return NextResponse.json({ error: 'Failed to create MDA' }, { status: 500 })
  }
}
