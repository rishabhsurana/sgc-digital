import { NextRequest, NextResponse } from 'next/server'
import { correspondenceService } from '@/lib/services/correspondence-service'
import { withAuth, withStaffAuth, AuthContext } from '@/lib/middleware/auth-middleware'

// GET /api/correspondence - List correspondence (with filters)
export const GET = withAuth(async (req: NextRequest, ctx: AuthContext) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const stage = searchParams.get('stage') || undefined
    const typeId = searchParams.get('type') || undefined
    const urgency = searchParams.get('urgency') || undefined
    const organizationId = searchParams.get('organizationId') || undefined
    const assignedTo = searchParams.get('assignedTo') || undefined
    const dailyMail = searchParams.get('dailyMail') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let correspondence

    if (ctx.user.userType === 'staff') {
      // Staff user - can see all or filter by assignment/daily mail
      if (dailyMail) {
        // Daily Mail Dashboard for SG/DSG
        correspondence = await correspondenceService.getDailyMailDashboard({ status, urgency, typeId })
      } else if (assignedTo) {
        correspondence = await correspondenceService.getWorkQueue(assignedTo, { stage, status, urgency })
      } else {
        correspondence = await correspondenceService.getWorkQueue(ctx.user.id, { stage, status, urgency })
      }
    } else {
      // Public user - can only see their own or their organization's correspondence
      const CorrespondenceRepository = (await import('@/lib/db/repositories/correspondence-repository')).CorrespondenceRepository
      const repo = new CorrespondenceRepository()
      correspondence = await repo.findByFilters({
        submitterId: ctx.user.id,
        organizationId: ctx.user.organizationId || organizationId,
        status,
        page,
        limit
      })
    }

    return NextResponse.json({ correspondence })
  } catch (error) {
    console.error('Get correspondence error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch correspondence' },
      { status: 500 }
    )
  }
})

// POST /api/correspondence - Create new correspondence (public portal submission)
export const POST = withAuth(async (req: NextRequest, ctx: AuthContext) => {
  try {
    if (ctx.user.userType !== 'public') {
      return NextResponse.json(
        { error: 'Only public users can submit correspondence' },
        { status: 403 }
      )
    }

    const body = await req.json()
    
    const { correspondence, bpmCase } = await correspondenceService.submitCorrespondence({
      ...body,
      submitterId: ctx.user.id,
      organizationId: body.organizationId || ctx.user.organizationId
    })

    return NextResponse.json({ 
      success: true,
      correspondence,
      bpmCase,
      referenceNumber: correspondence.reference_number
    }, { status: 201 })
  } catch (error) {
    console.error('Create correspondence error:', error)
    return NextResponse.json(
      { error: 'Failed to create correspondence' },
      { status: 500 }
    )
  }
})
