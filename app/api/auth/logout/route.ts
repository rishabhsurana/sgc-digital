import { NextResponse } from 'next/server'
import { deleteSession, clearSessionCookie, getSessionToken, getCurrentUser, logActivity } from '@/lib/auth'

export async function POST() {
  try {
    const token = await getSessionToken()
    const user = await getCurrentUser()
    
    if (token) {
      await deleteSession(token)
    }
    
    await clearSessionCookie()

    // Log logout activity
    if (user) {
      await logActivity(user.id, 'LOGOUT', 'user', user.id, 'User logged out')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear the cookie even if there's an error
    await clearSessionCookie()
    return NextResponse.json({ success: true })
  }
}
