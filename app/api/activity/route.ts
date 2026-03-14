import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin } from '@/lib/auth'

// GET /api/activity - Get activity logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const userId = searchParams.get('user_id')
    const entityType = searchParams.get('entity_type')
    const action = searchParams.get('action')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    const pool = await getConnection()
    const offset = (page - 1) * pageSize

    // Build query dynamically
    let whereClause = 'WHERE 1=1'
    const queryParams: { name: string; type: unknown; value: unknown }[] = []

    if (userId) {
      whereClause += ' AND a.user_id = @user_id'
      queryParams.push({ name: 'user_id', type: sql.NVarChar, value: userId })
    }
    if (entityType) {
      whereClause += ' AND a.entity_type = @entity_type'
      queryParams.push({ name: 'entity_type', type: sql.NVarChar, value: entityType })
    }
    if (action) {
      whereClause += ' AND a.action LIKE @action'
      queryParams.push({ name: 'action', type: sql.NVarChar, value: `%${action}%` })
    }
    if (dateFrom) {
      whereClause += ' AND a.created_at >= @date_from'
      queryParams.push({ name: 'date_from', type: sql.DateTime2, value: new Date(dateFrom) })
    }
    if (dateTo) {
      whereClause += ' AND a.created_at <= @date_to'
      queryParams.push({ name: 'date_to', type: sql.DateTime2, value: new Date(dateTo) })
    }

    // Get total count
    let countRequest = pool.request()
    queryParams.forEach(p => countRequest.input(p.name, p.type as sql.ISqlType, p.value))
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total FROM ActivityLog a ${whereClause}
    `)
    const total = countResult.recordset[0].total

    // Get paginated results
    let dataRequest = pool.request()
      .input('offset', sql.Int, offset)
      .input('pageSize', sql.Int, pageSize)
    queryParams.forEach(p => dataRequest.input(p.name, p.type as sql.ISqlType, p.value))

    const result = await dataRequest.query(`
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email
      FROM ActivityLog a
      LEFT JOIN Users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
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
    console.error('Get activity error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}
