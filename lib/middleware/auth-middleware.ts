import { NextRequest, NextResponse } from 'next/server'
import { authService, AuthenticatedUser } from '@/lib/services/auth-service'

export type AuthContext = {
  user: AuthenticatedUser
}

/**
 * Middleware to protect API routes - requires authentication
 */
export function withAuth(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await authService.verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    return handler(req, { user })
  }
}

/**
 * Middleware to require staff user
 */
export function withStaffAuth(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return withAuth(async (req, ctx) => {
    if (ctx.user.userType !== 'staff') {
      return NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }
    return handler(req, ctx)
  })
}

/**
 * Middleware to require specific permission
 */
export function withPermission(
  permission: string,
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return withStaffAuth(async (req, ctx) => {
    const hasPermission = await authService.hasPermission(ctx.user.id, permission)
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    return handler(req, ctx)
  })
}

/**
 * Middleware to require specific role level
 */
export function withRoleLevel(
  minLevel: number,
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return withStaffAuth(async (req, ctx) => {
    const userLevel = ctx.user.role?.level || 0
    if (userLevel < minLevel) {
      return NextResponse.json(
        { error: 'Insufficient role level' },
        { status: 403 }
      )
    }
    return handler(req, ctx)
  })
}

/**
 * Middleware to require specific roles
 */
export function withRoles(
  roles: string[],
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return withStaffAuth(async (req, ctx) => {
    const userRole = ctx.user.role?.code
    if (!userRole || !roles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Role not authorized' },
        { status: 403 }
      )
    }
    return handler(req, ctx)
  })
}

/**
 * Middleware for public user routes
 */
export function withPublicAuth(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return withAuth(async (req, ctx) => {
    if (ctx.user.userType !== 'public') {
      return NextResponse.json(
        { error: 'Public user access required' },
        { status: 403 }
      )
    }
    return handler(req, ctx)
  })
}

/**
 * Middleware to check organization access
 */
export function withOrgAccess(
  getOrgId: (req: NextRequest) => string | null,
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  return withPublicAuth(async (req, ctx) => {
    const orgId = getOrgId(req)
    if (orgId) {
      const hasAccess = await authService.canAccessOrganization(ctx.user.id, orgId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Organization access denied' },
          { status: 403 }
        )
      }
    }
    return handler(req, ctx)
  })
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Helper to extract user from request
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) return null

  return authService.verifyToken(token)
}
