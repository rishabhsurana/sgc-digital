import { NextRequest, NextResponse } from 'next/server'
import { aiReportsService } from '@/lib/services/ai-reports-service'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth-middleware'

// GET /api/reports - Get dashboard stats and available reports
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(req.url)
      const type = searchParams.get('type')

      // Get dashboard statistics
      if (type === 'dashboard') {
        const stats = await aiReportsService.getDashboardStats()
        return NextResponse.json(stats)
      }

      // Get saved reports for user
      if (type === 'saved') {
        const reports = await aiReportsService.getSavedReports(req.user.id)
        return NextResponse.json(reports)
      }

      // Return available report templates
      return NextResponse.json({
        templates: [
          { key: 'correspondence_by_status', name: 'Correspondence by Status', module: 'correspondence' },
          { key: 'correspondence_by_type', name: 'Correspondence by Type', module: 'correspondence' },
          { key: 'correspondence_by_organization', name: 'Correspondence by Organization', module: 'correspondence' },
          { key: 'correspondence_sla_performance', name: 'SLA Performance', module: 'correspondence' },
          { key: 'contracts_by_status', name: 'Contracts by Status', module: 'contracts' },
          { key: 'contracts_by_type', name: 'Contracts by Type', module: 'contracts' },
          { key: 'contracts_by_organization', name: 'Contracts by Organization', module: 'contracts' },
          { key: 'contracts_monthly_trend', name: 'Monthly Contract Trends', module: 'contracts' },
          { key: 'officer_workload', name: 'Officer Workload', module: 'combined' },
          { key: 'daily_intake_summary', name: 'Daily Intake Summary', module: 'combined' },
        ]
      })
    } catch (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }
  })
}

// POST /api/reports - Execute a report or save a report definition
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json()
      const { action } = body

      if (action === 'execute') {
        const { reportKey, params } = body
        const result = await aiReportsService.executeReport(reportKey, params)
        return NextResponse.json(result)
      }

      if (action === 'save') {
        const { name, description, reportType, queryConfig, visualizationType, isPublic } = body
        const reportId = await aiReportsService.saveReportDefinition({
          name,
          description,
          reportType,
          queryConfig,
          visualizationType,
          isPublic: isPublic || false,
          createdById: req.user.id
        })
        return NextResponse.json({ id: reportId })
      }

      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    } catch (error) {
      console.error('Error processing report:', error)
      return NextResponse.json(
        { error: 'Failed to process report' },
        { status: 500 }
      )
    }
  })
}
