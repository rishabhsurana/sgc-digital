import { NextRequest, NextResponse } from 'next/server'
import { correspondenceService } from '@/lib/services/correspondence-service'
import { withStaffAuth, AuthContext } from '@/lib/middleware/auth-middleware'

// POST /api/correspondence/[id]/workflow - Execute workflow action
export const POST = withStaffAuth(async (
  req: NextRequest,
  ctx: AuthContext
) => {
  try {
    const id = req.url.split('/correspondence/')[1]?.split('/')[0]
    
    if (!id) {
      return NextResponse.json(
        { error: 'Correspondence ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { action, ...data } = body

    let result

    switch (action) {
      case 'intake':
        // Registry Intake Officer processes intake
        result = await correspondenceService.processIntake(id, ctx.user.id, {
          validated: data.validated,
          intakeNotes: data.intakeNotes,
          securityProfile: data.securityProfile
        })
        break

      case 'assign':
        // SG/DSG assigns to Legal Officer
        result = await correspondenceService.assignToOfficer({
          correspondenceId: id,
          assignedOfficerId: data.assignedOfficerId,
          assignedById: ctx.user.id,
          directiveSummary: data.directiveSummary,
          bringUpDate: data.bringUpDate ? new Date(data.bringUpDate) : undefined,
          notes: data.notes
        })
        break

      case 'submit_for_approval':
        // Legal Officer submits response for approval
        result = await correspondenceService.submitForApproval(id, ctx.user.id, {
          responseText: data.responseText,
          requiresApproval: data.requiresApproval,
          attachmentIds: data.attachmentIds
        })
        break

      case 'approve_response':
        // SG/DSG approves or returns response
        result = await correspondenceService.approveResponse(
          id,
          ctx.user.id,
          data.approved,
          data.comments
        )
        break

      case 'dispatch':
        // Registry dispatches correspondence
        result = await correspondenceService.dispatch(id, ctx.user.id, {
          dispatchMethod: data.dispatchMethod,
          trackingNumber: data.trackingNumber,
          dispatchNotes: data.dispatchNotes
        })
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ 
      success: true, 
      correspondence: result 
    })
  } catch (error: any) {
    console.error('Workflow action error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to execute workflow action' },
      { status: 500 }
    )
  }
})
