import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that use custom authentication (not Supabase auth)
const customAuthRoutes = [
  '/management',
  '/dashboard',
  '/correspondence',
  '/contracts'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this route uses custom auth
  const usesCustomAuth = customAuthRoutes.some(route => pathname.startsWith(route))
  
  if (usesCustomAuth) {
    // For custom auth routes, just pass through with pathname header
    const response = NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    })
    
    // Set pathname header for server components to read
    response.headers.set('x-pathname', pathname)
    
    return response
  }
  
  // For other routes, use Supabase session management
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
