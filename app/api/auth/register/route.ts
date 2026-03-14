import { NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db/config'
import { hashPassword, createSession, setSessionCookie, logActivity } from '@/lib/auth'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mda_id: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, password, name, mda_id, phone } = validation.data
    const pool = await getConnection()

    // Check if email already exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase())
      .query(`SELECT id FROM Users WHERE email = @email`)

    if (existingUser.recordset.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Validate MDA if provided
    if (mda_id) {
      const mdaExists = await pool.request()
        .input('mda_id', sql.NVarChar, mda_id)
        .query(`SELECT id FROM MDAs WHERE id = @mda_id AND is_active = 1`)

      if (mdaExists.recordset.length === 0) {
        return NextResponse.json(
          { error: 'Invalid MDA selected' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    const userId = uuidv4()

    // Create user (status is 'pending' by default, admin must activate)
    await pool.request()
      .input('id', sql.NVarChar, userId)
      .input('email', sql.NVarChar, email.toLowerCase())
      .input('password_hash', sql.NVarChar, passwordHash)
      .input('name', sql.NVarChar, name)
      .input('mda_id', sql.NVarChar, mda_id || null)
      .input('phone', sql.NVarChar, phone || null)
      .query(`
        INSERT INTO Users (id, email, password_hash, name, role, status, mda_id, phone)
        VALUES (@id, @email, @password_hash, @name, 'user', 'pending', @mda_id, @phone)
      `)

    // Log registration activity
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    await logActivity(userId, 'REGISTER', 'user', userId, 'New user registration', ipAddress)

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Your account is pending approval by an administrator.',
      user: {
        id: userId,
        email: email.toLowerCase(),
        name,
        status: 'pending',
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
