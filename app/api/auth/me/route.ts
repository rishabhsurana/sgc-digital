import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth-service'

export async function GET(req: NextRequest) {
  try {
    const user = await authService.getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
