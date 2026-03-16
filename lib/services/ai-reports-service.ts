import { query, getConnection } from '@/lib/db/connection'
import sql from 'mssql'

export interface AIQueryRequest {
  naturalLanguageQuery: string
  userId: string
  context?: {
    module?: 'correspondence' | 'contracts' | 'all'
    dateRange?: { start: string; end: string }
    organization?: string
  }
}

export interface AIQueryResult {
  id: string
  query: string
  generatedSql: string
  results: Record<string, unknown>[]
  resultCount: number
  executionTimeMs: number
  tokensUsed: number
}

export interface ReportDefinition {
  id: string
  name: string
  description: string
  reportType: 'correspondence' | 'contracts' | 'combined' | 'custom'
  queryConfig: {
    filters: Record<string, unknown>
    groupBy?: string[]
    dateRange?: { start: string; end: string }
    aggregations?: string[]
  }
  visualizationType: 'table' | 'bar_chart' | 'pie_chart' | 'line_chart' | 'summary'
  isPublic: boolean
  createdById: string
}

// Pre-built report queries
const REPORT_TEMPLATES = {
  correspondence_by_status: `
    SELECT 
      status,
      COUNT(*) as count,
      AVG(DATEDIFF(day, date_received, COALESCE(date_closed, GETDATE()))) as avg_days
    FROM correspondence
    WHERE deleted_at IS NULL
    GROUP BY status
  `,
  correspondence_by_type: `
    SELECT 
      ct.name as type_name,
      COUNT(*) as count,
      SUM(CASE WHEN c.status = 'CLOSED' THEN 1 ELSE 0 END) as closed_count
    FROM correspondence c
    JOIN correspondence_types ct ON c.type_id = ct.id
    WHERE c.deleted_at IS NULL
    GROUP BY ct.name
  `,
  correspondence_by_organization: `
    SELECT 
      o.name as organization,
      COUNT(*) as total_count,
      SUM(CASE WHEN c.urgency = 'urgent' OR c.urgency = 'critical' THEN 1 ELSE 0 END) as urgent_count
    FROM correspondence c
    JOIN organizations o ON c.organization_id = o.id
    WHERE c.deleted_at IS NULL
    GROUP BY o.name
    ORDER BY total_count DESC
  `,
  correspondence_sla_performance: `
    SELECT 
      CASE 
        WHEN due_date >= GETDATE() THEN 'On Track'
        WHEN DATEDIFF(day, GETDATE(), due_date) BETWEEN -3 AND 0 THEN 'At Risk'
        ELSE 'Breached'
      END as sla_status,
      COUNT(*) as count
    FROM correspondence
    WHERE deleted_at IS NULL AND status NOT IN ('CLOSED', 'CANCELLED')
    GROUP BY 
      CASE 
        WHEN due_date >= GETDATE() THEN 'On Track'
        WHEN DATEDIFF(day, GETDATE(), due_date) BETWEEN -3 AND 0 THEN 'At Risk'
        ELSE 'Breached'
      END
  `,
  contracts_by_status: `
    SELECT 
      status,
      COUNT(*) as count,
      SUM(contract_value) as total_value
    FROM contracts
    WHERE deleted_at IS NULL
    GROUP BY status
  `,
  contracts_by_type: `
    SELECT 
      ct.name as type_name,
      COUNT(*) as count,
      SUM(c.contract_value) as total_value,
      AVG(c.contract_value) as avg_value
    FROM contracts c
    JOIN contract_types ct ON c.type_id = ct.id
    WHERE c.deleted_at IS NULL
    GROUP BY ct.name
  `,
  contracts_by_organization: `
    SELECT 
      o.name as organization,
      COUNT(*) as total_count,
      SUM(c.contract_value) as total_value
    FROM contracts c
    JOIN organizations o ON c.organization_id = o.id
    WHERE c.deleted_at IS NULL
    GROUP BY o.name
    ORDER BY total_value DESC
  `,
  contracts_monthly_trend: `
    SELECT 
      FORMAT(submitted_at, 'yyyy-MM') as month,
      COUNT(*) as submissions,
      SUM(contract_value) as total_value
    FROM contracts
    WHERE deleted_at IS NULL
      AND submitted_at >= DATEADD(month, -12, GETDATE())
    GROUP BY FORMAT(submitted_at, 'yyyy-MM')
    ORDER BY month
  `,
  officer_workload: `
    SELECT 
      su.first_name + ' ' + su.last_name as officer_name,
      COUNT(DISTINCT cor.id) as correspondence_count,
      COUNT(DISTINCT con.id) as contracts_count
    FROM staff_users su
    LEFT JOIN correspondence cor ON cor.assigned_officer_id = su.id AND cor.status NOT IN ('CLOSED', 'CANCELLED')
    LEFT JOIN contracts con ON con.assigned_officer_id = su.id AND con.status NOT IN ('CLOSED', 'REJECTED')
    WHERE su.is_active = 1
    GROUP BY su.first_name, su.last_name
    ORDER BY (COUNT(DISTINCT cor.id) + COUNT(DISTINCT con.id)) DESC
  `,
  daily_intake_summary: `
    SELECT 
      CAST(date_received as DATE) as intake_date,
      COUNT(*) as correspondence_count,
      SUM(CASE WHEN urgency IN ('urgent', 'critical') THEN 1 ELSE 0 END) as urgent_count
    FROM correspondence
    WHERE deleted_at IS NULL
      AND date_received >= DATEADD(day, -30, GETDATE())
    GROUP BY CAST(date_received as DATE)
    ORDER BY intake_date DESC
  `
}

// AI Query Schema Context - provides table structure for OpenAI
const SCHEMA_CONTEXT = `
You are a SQL query generator for a government legal services case management system.
The database contains the following relevant tables:

CORRESPONDENCE TABLE:
- id (UUID), reference_number, subject, description
- type_id (FK to correspondence_types), status, urgency (normal/urgent/critical)
- organization_id (FK to organizations), submitter_id (FK to public_users)
- assigned_officer_id (FK to staff_users), date_received, due_date, date_closed
- confidential (boolean)

CORRESPONDENCE_TYPES TABLE:
- id, name, code, description, sla_days

CONTRACTS TABLE:
- id (UUID), reference_number, title, description
- type_id (FK to contract_types), status, contract_value, currency
- organization_id, submitter_id, assigned_officer_id
- start_date, end_date, submitted_at, approved_at
- procurement_method (open_tender/selective_tender/limited_tender/direct_procurement)

CONTRACT_TYPES TABLE:
- id, name, code, description, sla_days

ORGANIZATIONS TABLE:
- id, name, code, type (ministry/department/agency/statutory_body/external)

STAFF_USERS TABLE:
- id, first_name, last_name, email, department_id, role_id

Valid correspondence statuses: NEW, PENDING_REVIEW, ASSIGNED, PENDING_EXTERNAL, ON_HOLD, CLOSED, CANCELLED
Valid contract statuses: INTAKE, ASSIGNED, DRAFTING, SUP_REVIEW, SENT_MDA, RETURNED_MDA, FINAL_SIG, EXEC_ADJ, ADJ_COMP, CLOSED, REJECTED

Generate safe, read-only SELECT queries only. Never generate UPDATE, DELETE, or INSERT statements.
Always include WHERE deleted_at IS NULL for soft-deleted records.
`

export class AIReportsService {
  
  // Execute a pre-built report
  async executeReport(reportKey: keyof typeof REPORT_TEMPLATES, params?: Record<string, unknown>): Promise<{
    data: Record<string, unknown>[]
    executionTimeMs: number
  }> {
    const startTime = Date.now()
    let sqlQuery = REPORT_TEMPLATES[reportKey]
    
    // Apply date range filter if provided
    if (params?.startDate && params?.endDate) {
      sqlQuery = sqlQuery.replace(
        'WHERE deleted_at IS NULL',
        `WHERE deleted_at IS NULL AND date_received BETWEEN '${params.startDate}' AND '${params.endDate}'`
      )
    }
    
    const pool = await getConnection()
    const result = await pool.request().query(sqlQuery)
    
    return {
      data: result.recordset,
      executionTimeMs: Date.now() - startTime
    }
  }

  // Get dashboard summary statistics
  async getDashboardStats(): Promise<{
    correspondence: {
      total: number
      pending: number
      atRisk: number
      closedThisMonth: number
    }
    contracts: {
      total: number
      pending: number
      totalValue: number
      approvedThisMonth: number
    }
  }> {
    const pool = await getConnection()
    
    const correspondenceStats = await pool.request().query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status NOT IN ('CLOSED', 'CANCELLED') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status NOT IN ('CLOSED', 'CANCELLED') AND due_date < GETDATE() THEN 1 ELSE 0 END) as at_risk,
        SUM(CASE WHEN status = 'CLOSED' AND date_closed >= DATEADD(month, -1, GETDATE()) THEN 1 ELSE 0 END) as closed_this_month
      FROM correspondence
      WHERE deleted_at IS NULL
    `)
    
    const contractStats = await pool.request().query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status NOT IN ('CLOSED', 'REJECTED') THEN 1 ELSE 0 END) as pending,
        SUM(contract_value) as total_value,
        SUM(CASE WHEN status = 'CLOSED' AND approved_at >= DATEADD(month, -1, GETDATE()) THEN 1 ELSE 0 END) as approved_this_month
      FROM contracts
      WHERE deleted_at IS NULL
    `)
    
    const corr = correspondenceStats.recordset[0]
    const cont = contractStats.recordset[0]
    
    return {
      correspondence: {
        total: corr.total || 0,
        pending: corr.pending || 0,
        atRisk: corr.at_risk || 0,
        closedThisMonth: corr.closed_this_month || 0
      },
      contracts: {
        total: cont.total || 0,
        pending: cont.pending || 0,
        totalValue: cont.total_value || 0,
        approvedThisMonth: cont.approved_this_month || 0
      }
    }
  }

  // Log AI query for analytics
  async logAIQuery(
    userId: string,
    naturalLanguageQuery: string,
    generatedSql: string,
    wasExecuted: boolean,
    resultCount: number,
    tokensUsed: number,
    responseTimeMs: number
  ): Promise<void> {
    const pool = await getConnection()
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, sql.TYPES.UniqueIdentifier)
      .input('user_id', sql.UniqueIdentifier, userId)
      .input('natural_language_query', sql.NVarChar(sql.MAX), naturalLanguageQuery)
      .input('generated_sql', sql.NVarChar(sql.MAX), generatedSql)
      .input('was_executed', sql.Bit, wasExecuted)
      .input('result_count', sql.Int, resultCount)
      .input('tokens_used', sql.Int, tokensUsed)
      .input('response_time_ms', sql.Int, responseTimeMs)
      .query(`
        INSERT INTO ai_query_logs (
          id, user_id, natural_language_query, generated_sql, 
          was_executed, result_count, tokens_used, response_time_ms, created_at
        )
        VALUES (
          NEWID(), @user_id, @natural_language_query, @generated_sql,
          @was_executed, @result_count, @tokens_used, @response_time_ms, GETDATE()
        )
      `)
  }

  // Save report definition
  async saveReportDefinition(report: Omit<ReportDefinition, 'id'>): Promise<string> {
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('name', sql.NVarChar(255), report.name)
      .input('description', sql.NVarChar(sql.MAX), report.description)
      .input('report_type', sql.VarChar(50), report.reportType)
      .input('query_config', sql.NVarChar(sql.MAX), JSON.stringify(report.queryConfig))
      .input('visualization_type', sql.VarChar(50), report.visualizationType)
      .input('is_public', sql.Bit, report.isPublic)
      .input('created_by_id', sql.UniqueIdentifier, report.createdById)
      .query(`
        INSERT INTO report_definitions (
          id, name, description, report_type, query_config,
          visualization_type, is_public, created_by_id, created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          NEWID(), @name, @description, @report_type, @query_config,
          @visualization_type, @is_public, @created_by_id, GETDATE()
        )
      `)
    
    return result.recordset[0].id
  }

  // Get saved reports for a user
  async getSavedReports(userId: string): Promise<ReportDefinition[]> {
    const pool = await getConnection()
    
    const result = await pool.request()
      .input('user_id', sql.UniqueIdentifier, userId)
      .query(`
        SELECT * FROM report_definitions
        WHERE created_by_id = @user_id OR is_public = 1
        ORDER BY created_at DESC
      `)
    
    return result.recordset.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      reportType: row.report_type,
      queryConfig: JSON.parse(row.query_config),
      visualizationType: row.visualization_type,
      isPublic: row.is_public,
      createdById: row.created_by_id
    }))
  }
}

export const aiReportsService = new AIReportsService()
