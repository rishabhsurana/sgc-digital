import { NextRequest, NextResponse } from 'next/server'
import { contractsService } from '@/lib/services/contracts-service'
import { withAuth, withStaffAuth, AuthContext } from '@/lib/middleware/auth-middleware'

// GET /api/contracts - List contracts (with filters)
export const GET = withAuth(async (req: NextRequest, ctx: AuthContext) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const stage = searchParams.get('stage') || undefined
    const contractType = searchParams.get('type') || undefined
    const organizationId = searchParams.get('organizationId') || undefined
    const assignedTo = searchParams.get('assignedTo') || undefined
    const inBasket = searchParams.get('inBasket') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let contracts

    if (ctx.user.userType === 'staff') {
      // Staff user - can see all or filter by in-basket
      if (inBasket) {
        contracts = await contractsService.getInBasket(inBasket)
      } else if (assignedTo) {
        contracts = await contractsService.getWorkQueue(assignedTo, { status, stage, contractType })
      } else {
        contracts = await contractsService.getWorkQueue(ctx.user.id, { status, stage, contractType })
      }
    } else {
      // Public user - can only see their own or their organization's contracts
      const ContractsRepository = (await import('@/lib/db/repositories/contracts-repository')).ContractsRepository
      const repo = new ContractsRepository()
      contracts = await repo.findByFilters({
        submitterId: ctx.user.id,
        organizationId: ctx.user.organizationId || organizationId,
        status,
        page,
        limit
      })
    }

    return NextResponse.json({ contracts })
  } catch (error) {
    console.error('Get contracts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
})

// POST /api/contracts - Create new contract (public portal submission)
export const POST = withAuth(async (req: NextRequest, ctx: AuthContext) => {
  try {
    if (ctx.user.userType !== 'public') {
      return NextResponse.json(
        { error: 'Only public users can submit contracts' },
        { status: 403 }
      )
    }

    const body = await req.json()
    
    const { contract, bpmCase } = await contractsService.submitContract({
      ...body,
      submitterId: ctx.user.id,
      organizationId: body.organizationId || ctx.user.organizationId
    })

    return NextResponse.json({ 
      success: true,
      contract,
      bpmCase,
      referenceNumber: contract.reference_number
    }, { status: 201 })
  } catch (error) {
    console.error('Create contract error:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
})
