import { NextRequest, NextResponse } from 'next/server'
import { contractsService } from '@/lib/services/contracts-service'
import { withAuth, AuthContext } from '@/lib/middleware/auth-middleware'

// GET /api/contracts/[id] - Get contract details
export const GET = withAuth(async (
  req: NextRequest, 
  ctx: AuthContext
) => {
  try {
    const id = req.url.split('/contracts/')[1]?.split('/')[0]?.split('?')[0]
    
    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    const data = await contractsService.getContractWithDetails(id)

    // Check access permissions
    if (ctx.user.userType === 'public') {
      // Public users can only view their own or their organization's contracts
      const canAccess = 
        data.contract.submitter_id === ctx.user.id ||
        data.contract.organization_id === ctx.user.organizationId

      if (!canAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Get contract error:', error)
    if (error.message === 'Contract not found') {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    )
  }
})

// PATCH /api/contracts/[id] - Update contract
export const PATCH = withAuth(async (
  req: NextRequest, 
  ctx: AuthContext
) => {
  try {
    const id = req.url.split('/contracts/')[1]?.split('/')[0]?.split('?')[0]
    
    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { ContractsRepository } = await import('@/lib/db/repositories/contracts-repository')
    const repo = new ContractsRepository()

    await repo.update(id, {
      ...body,
      updated_at: new Date()
    })

    const updated = await contractsService.getContractWithDetails(id)

    return NextResponse.json({ 
      success: true, 
      contract: updated.contract 
    })
  } catch (error) {
    console.error('Update contract error:', error)
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    )
  }
})
