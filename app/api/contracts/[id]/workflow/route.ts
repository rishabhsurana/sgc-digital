import { NextRequest, NextResponse } from 'next/server'
import { contractsService } from '@/lib/services/contracts-service'
import { withStaffAuth, withRoles, AuthContext } from '@/lib/middleware/auth-middleware'

// POST /api/contracts/[id]/workflow - Execute workflow action
export const POST = withStaffAuth(async (
  req: NextRequest,
  ctx: AuthContext
) => {
  try {
    const id = req.url.split('/contracts/')[1]?.split('/')[0]
    
    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { action, ...data } = body

    let result

    switch (action) {
      case 'intake':
        // Contracts Intake Officer processes intake
        result = await contractsService.processIntake(id, ctx.user.id, {
          validated: data.validated,
          intakeNotes: data.intakeNotes,
          natureOfContract: data.natureOfContract,
          contractCategory: data.contractCategory,
          instrumentType: data.instrumentType
        })
        break

      case 'assign':
        // DSG/Supervisor assigns to Legal Officer
        result = await contractsService.assignToOfficer({
          contractId: id,
          assignedOfficerId: data.assignedOfficerId,
          assignedById: ctx.user.id,
          notes: data.notes
        })
        break

      case 'submit_draft':
        // Legal Officer submits draft for review
        result = await contractsService.submitDraft({
          contractId: id,
          officerId: ctx.user.id,
          draftDocumentId: data.draftDocumentId,
          draftNotes: data.draftNotes
        })
        break

      case 'supervisor_approval':
        // Supervisor approves or returns draft
        result = await contractsService.supervisorApproval(
          id,
          ctx.user.id,
          data.approved,
          data.comments
        )
        break

      case 'ministry_review':
        // Process ministry review response
        result = await contractsService.processMinistryReview({
          contractId: id,
          officerId: ctx.user.id,
          action: data.reviewAction,
          comments: data.comments
        })
        break

      case 'record_signature':
        // Record signature
        result = await contractsService.recordSignature({
          contractId: id,
          signerId: ctx.user.id,
          signatureType: data.signatureType,
          signatureDocumentId: data.signatureDocumentId,
          signedDate: new Date(data.signedDate)
        })
        break

      case 'complete_adjudication':
        // Complete adjudication
        result = await contractsService.completeAdjudication({
          contractId: id,
          officerId: ctx.user.id,
          adjudicationDate: new Date(data.adjudicationDate),
          adjudicationReference: data.adjudicationReference,
          stampDutyPaid: data.stampDutyPaid,
          notes: data.notes
        })
        break

      case 'dispatch_close':
        // Dispatch and close
        result = await contractsService.dispatchAndClose(id, ctx.user.id, {
          dispatchMethod: data.dispatchMethod,
          dispatchNotes: data.dispatchNotes,
          copiesDispatched: data.copiesDispatched
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
      contract: result 
    })
  } catch (error: any) {
    console.error('Workflow action error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to execute workflow action' },
      { status: 500 }
    )
  }
})
