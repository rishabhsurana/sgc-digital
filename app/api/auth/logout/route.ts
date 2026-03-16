import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth-service'
import { getUserFromRequest } from '@/lib/middleware/auth-middleware'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    
    if (user) {
      await authService.logout(user.id, user.userType)
    }

    // Clear cookies
    const cookieStore = await cookies()
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
