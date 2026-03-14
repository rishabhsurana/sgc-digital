import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin, hashPassword, logActivity } from '@/lib/auth'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

// GET /api/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const mda_id = searchParams.get('mda_id')

    const pool = await getConnection()
    const offset = (page - 1) * pageSize

    // Build query dynamically
    let whereClause = 'WHERE 1=1'
    const queryParams: { name: string; type: typeof sql.NVarChar; value: string }[] = []

    if (status) {
      whereClause += ' AND u.status = @status'
      queryParams.push({ name: 'status', type: sql.NVarChar, value: status })
    }
    if (role) {
      whereClause += ' AND u.role = @role'
      queryParams.push({ name: 'role', type: sql.NVarChar, value: role })
    }
    if (mda_id) {
      whereClause += ' AND u.mda_id = @mda_id'
      queryParams.push({ name: 'mda_id', type: sql.NVarChar, value: mda_id })
    }
    if (search) {
      whereClause += ' AND (u.name LIKE @search OR u.email LIKE @search)'
      queryParams.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` })
    }

    // Get total count
    let countRequest = pool.request()
    queryParams.forEach(p => countRequest.input(p.name, p.type, p.value))
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total FROM Users u ${whereClause}
    `)
    const total = countResult.recordset[0].total

    // Get paginated results
    let dataRequest = pool.request()
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
    queryParams.forEach(p => dataRequest.input(p.name, p.type, p.value))

    const result = await dataRequest.query(`
      SELECT u.id, u.email, u.name, u.role, u.status, u.mda_id, u.phone,
             u.created_at, u.updated_at, u.last_login,
             m.name as mda_name
      FROM Users u
      LEFT JOIN MDAs m ON u.mda_id = m.id
      ${whereClause}
      ORDER BY u.created_at DESC
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
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/users - Create new user (admin only)
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['super_admin', 'admin', 'manager', 'user']),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  mda_id: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const pool = await getConnection()

    // Check if email exists
    const existing = await pool.request()
      .input('email', sql.NVarChar, data.email.toLowerCase())
      .query(`SELECT id FROM Users WHERE email = @email`)

    if (existing.recordset.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const userId = uuidv4()
    const passwordHash = await hashPassword(data.password)

    await pool.request()
      .input('id', sql.NVarChar, userId)
      .input('email', sql.NVarChar, data.email.toLowerCase())
      .input('password_hash', sql.NVarChar, passwordHash)
      .input('name', sql.NVarChar, data.name)
      .input('role', sql.NVarChar, data.role)
      .input('status', sql.NVarChar, data.status || 'active')
      .input('mda_id', sql.NVarChar, data.mda_id || null)
      .input('phone', sql.NVarChar, data.phone || null)
      .query(`
        INSERT INTO Users (id, email, password_hash, name, role, status, mda_id, phone)
        VALUES (@id, @email, @password_hash, @name, @role, @status, @mda_id, @phone)
      `)

    await logActivity(user.id, 'CREATE_USER', 'user', userId, `Created user: ${data.email}`)

    return NextResponse.json({ success: true, id: userId }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
