import { NextRequest, NextResponse } from 'next/server'
import { correspondenceService } from '@/lib/services/correspondence-service'
import { withAuth, AuthContext } from '@/lib/middleware/auth-middleware'

// GET /api/correspondence/[id] - Get correspondence details
export const GET = withAuth(async (
  req: NextRequest, 
  ctx: AuthContext
) => {
  try {
    const id = req.url.split('/correspondence/')[1]?.split('/')[0]?.split('?')[0]
    
    if (!id) {
      return NextResponse.json(
        { error: 'Correspondence ID is required' },
        { status: 400 }
      )
    }

    const data = await correspondenceService.getCorrespondenceWithDetails(id)

    // Check access permissions
    if (ctx.user.userType === 'public') {
      // Public users can only view their own or their organization's correspondence
      const canAccess = 
        data.correspondence.submitter_id === ctx.user.id ||
        data.correspondence.organization_id === ctx.user.organizationId

      if (!canAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Get correspondence error:', error)
    if (error.message === 'Correspondence not found') {
      return NextResponse.json(
        { error: 'Correspondence not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch correspondence' },
      { status: 500 }
    )
  }
})

// PATCH /api/correspondence/[id] - Update correspondence
export const PATCH = withAuth(async (
  req: NextRequest, 
  ctx: AuthContext
) => {
  try {
    const id = req.url.split('/correspondence/')[1]?.split('/')[0]?.split('?')[0]
    
    if (!id) {
      return NextResponse.json(
        { error: 'Correspondence ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { CorrespondenceRepository } = await import('@/lib/db/repositories/correspondence-repository')
    const repo = new CorrespondenceRepository()

    await repo.update(id, {
      ...body,
      updated_at: new Date()
    })

    const updated = await correspondenceService.getCorrespondenceWithDetails(id)

    return NextResponse.json({ 
      success: true, 
      correspondence: updated.correspondence 
    })
  } catch (error) {
    console.error('Update correspondence error:', error)
    return NextResponse.json(
      { error: 'Failed to update correspondence' },
      { status: 500 }
    )
  }
})
