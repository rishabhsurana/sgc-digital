import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/data/data-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    const user = await getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ exists: false })
    }
    
    // Check if user is staff (roleId 5-8: Staff, Supervisor, Admin, Super Admin)
    const isStaff = [5, 6, 7, 8].includes(user.roleId)
    
    return NextResponse.json({
      exists: true,
      isStaff,
      message: isStaff 
        ? 'This email is registered as a staff member. You can use your existing credentials to access both portals.'
        : 'An account with this email already exists.'
    })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
  }
}
