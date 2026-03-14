import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { verifyPassword, createSession, setSessionCookie, logActivity } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, password } = validation.data
    const pool = await getConnection()

    // Find user by email
    const result = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase())
      .query(`
        SELECT id, email, password_hash, name, role, status, mda_id
        FROM Users
        WHERE email = @email
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = result.recordset[0]

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active. Please contact administrator.' },
        { status: 403 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Get IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Create session
    const session = await createSession(user.id, ipAddress, userAgent)

    // Set session cookie
    await setSessionCookie(session.token)

    // Log login activity
    await logActivity(user.id, 'LOGIN', 'user', user.id, 'User logged in', ipAddress)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mda_id: user.mda_id,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
