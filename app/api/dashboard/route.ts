import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/config'
import { getCurrentUser } from '@/lib/auth'

// GET /api/dashboard - Get dashboard statistics
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pool = await getConnection()

    // Get contract statistics
    const contractStats = await pool.request().query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(contract_value) as total_value
      FROM Contracts
    `)

    // Get correspondence statistics
    const correspondenceStats = await pool.request().query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'pending_review' THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN priority = 'urgent' AND status NOT IN ('completed', 'archived') THEN 1 ELSE 0 END) as urgent
      FROM Correspondence
    `)

    // Get user statistics (admin only)
    let userStats = null
    if (['super_admin', 'admin', 'manager'].includes(user.role)) {
      const userResult = await pool.request().query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
        FROM Users
      `)
      userStats = userResult.recordset[0]
    }

    // Get recent contracts
    const recentContracts = await pool.request().query(`
      SELECT TOP 5
        c.id, c.reference_number, c.title, c.contractor_name, c.status, 
        c.contract_value, c.currency, c.created_at,
        m.name as mda_name
      FROM Contracts c
      LEFT JOIN MDAs m ON c.mda_id = m.id
      ORDER BY c.created_at DESC
    `)

    // Get recent correspondence
    const recentCorrespondence = await pool.request().query(`
      SELECT TOP 5
        co.id, co.reference_number, co.subject, co.sender_name, co.status, 
        co.priority, co.date_received,
        m.name as recipient_mda_name
      FROM Correspondence co
      LEFT JOIN MDAs m ON co.recipient_mda_id = m.id
      ORDER BY co.date_received DESC
    `)

    // Get contracts expiring soon (within 30 days)
    const expiringContracts = await pool.request().query(`
      SELECT TOP 5
        c.id, c.reference_number, c.title, c.contractor_name, c.end_date,
        DATEDIFF(day, GETDATE(), c.end_date) as days_remaining,
        m.name as mda_name
      FROM Contracts c
      LEFT JOIN MDAs m ON c.mda_id = m.id
      WHERE c.status = 'active' 
        AND c.end_date >= GETDATE() 
        AND c.end_date <= DATEADD(day, 30, GETDATE())
      ORDER BY c.end_date ASC
    `)

    // Get overdue correspondence
    const overdueCorrespondence = await pool.request().query(`
      SELECT TOP 5
        co.id, co.reference_number, co.subject, co.date_due, co.priority,
        DATEDIFF(day, co.date_due, GETDATE()) as days_overdue,
        m.name as recipient_mda_name
      FROM Correspondence co
      LEFT JOIN MDAs m ON co.recipient_mda_id = m.id
      WHERE co.date_due < GETDATE() 
        AND co.status NOT IN ('completed', 'archived')
      ORDER BY co.date_due ASC
    `)

    return NextResponse.json({
      contracts: {
        stats: contractStats.recordset[0],
        recent: recentContracts.recordset,
        expiring: expiringContracts.recordset,
      },
      correspondence: {
        stats: correspondenceStats.recordset[0],
        recent: recentCorrespondence.recordset,
        overdue: overdueCorrespondence.recordset,
      },
      users: userStats,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
