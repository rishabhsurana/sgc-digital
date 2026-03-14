import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { getCurrentUser, isAdmin } from '@/lib/auth'

// GET /api/reports - Generate reports
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'summary'
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const mdaId = searchParams.get('mda_id')

    const pool = await getConnection()

    // Build date filter
    let dateFilter = ''
    const dateParams: { from?: Date; to?: Date } = {}
    if (dateFrom) {
      dateParams.from = new Date(dateFrom)
    }
    if (dateTo) {
      dateParams.to = new Date(dateTo)
    }

    switch (reportType) {
      case 'contracts_by_mda': {
        let query = `
          SELECT 
            m.name as mda_name,
            COUNT(*) as total_contracts,
            SUM(c.contract_value) as total_value,
            SUM(CASE WHEN c.status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN c.status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN c.status = 'pending_approval' THEN 1 ELSE 0 END) as pending
          FROM Contracts c
          INNER JOIN MDAs m ON c.mda_id = m.id
          WHERE 1=1
        `
        const request_db = pool.request()

        if (dateParams.from) {
          query += ' AND c.created_at >= @date_from'
          request_db.input('date_from', sql.DateTime2, dateParams.from)
        }
        if (dateParams.to) {
          query += ' AND c.created_at <= @date_to'
          request_db.input('date_to', sql.DateTime2, dateParams.to)
        }
        if (mdaId) {
          query += ' AND c.mda_id = @mda_id'
          request_db.input('mda_id', sql.NVarChar, mdaId)
        }

        query += ' GROUP BY m.name ORDER BY total_value DESC'

        const result = await request_db.query(query)
        return NextResponse.json({ data: result.recordset })
      }

      case 'correspondence_by_status': {
        let query = `
          SELECT 
            co.status,
            COUNT(*) as count,
            SUM(CASE WHEN co.priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
            SUM(CASE WHEN co.priority = 'high' THEN 1 ELSE 0 END) as high,
            AVG(DATEDIFF(day, co.date_received, COALESCE(co.completed_at, GETDATE()))) as avg_days_to_complete
          FROM Correspondence co
          WHERE 1=1
        `
        const request_db = pool.request()

        if (dateParams.from) {
          query += ' AND co.date_received >= @date_from'
          request_db.input('date_from', sql.DateTime2, dateParams.from)
        }
        if (dateParams.to) {
          query += ' AND co.date_received <= @date_to'
          request_db.input('date_to', sql.DateTime2, dateParams.to)
        }
        if (mdaId) {
          query += ' AND co.recipient_mda_id = @mda_id'
          request_db.input('mda_id', sql.NVarChar, mdaId)
        }

        query += ' GROUP BY co.status'

        const result = await request_db.query(query)
        return NextResponse.json({ data: result.recordset })
      }

      case 'contracts_timeline': {
        let query = `
          SELECT 
            YEAR(c.created_at) as year,
            MONTH(c.created_at) as month,
            COUNT(*) as contracts_created,
            SUM(c.contract_value) as total_value
          FROM Contracts c
          WHERE 1=1
        `
        const request_db = pool.request()

        if (dateParams.from) {
          query += ' AND c.created_at >= @date_from'
          request_db.input('date_from', sql.DateTime2, dateParams.from)
        }
        if (dateParams.to) {
          query += ' AND c.created_at <= @date_to'
          request_db.input('date_to', sql.DateTime2, dateParams.to)
        }

        query += ' GROUP BY YEAR(c.created_at), MONTH(c.created_at) ORDER BY year, month'

        const result = await request_db.query(query)
        return NextResponse.json({ data: result.recordset })
      }

      case 'user_activity': {
        let query = `
          SELECT 
            u.name as user_name,
            u.email,
            u.role,
            COUNT(DISTINCT CASE WHEN a.entity_type = 'contract' THEN a.entity_id END) as contracts_touched,
            COUNT(DISTINCT CASE WHEN a.entity_type = 'correspondence' THEN a.entity_id END) as correspondence_touched,
            COUNT(*) as total_actions,
            MAX(a.created_at) as last_activity
          FROM Users u
          LEFT JOIN ActivityLog a ON u.id = a.user_id
          WHERE 1=1
        `
        const request_db = pool.request()

        if (dateParams.from) {
          query += ' AND a.created_at >= @date_from'
          request_db.input('date_from', sql.DateTime2, dateParams.from)
        }
        if (dateParams.to) {
          query += ' AND a.created_at <= @date_to'
          request_db.input('date_to', sql.DateTime2, dateParams.to)
        }

        query += ' GROUP BY u.name, u.email, u.role ORDER BY total_actions DESC'

        const result = await request_db.query(query)
        return NextResponse.json({ data: result.recordset })
      }

      case 'summary':
      default: {
        // Overall summary statistics
        const summary = await pool.request().query(`
          SELECT 
            (SELECT COUNT(*) FROM Contracts) as total_contracts,
            (SELECT COUNT(*) FROM Contracts WHERE status = 'active') as active_contracts,
            (SELECT SUM(contract_value) FROM Contracts) as total_contract_value,
            (SELECT COUNT(*) FROM Correspondence) as total_correspondence,
            (SELECT COUNT(*) FROM Correspondence WHERE status NOT IN ('completed', 'archived')) as open_correspondence,
            (SELECT COUNT(*) FROM Users WHERE status = 'active') as active_users,
            (SELECT COUNT(*) FROM MDAs WHERE is_active = 1) as active_mdas
        `)

        return NextResponse.json({ data: summary.recordset[0] })
      }
    }
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
