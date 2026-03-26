import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser, logActivity } from '@/lib/data/data-service'

// Map submitter type to entity type ID
const ENTITY_TYPE_MAP: Record<string, number> = {
  ministry: 1,
  court: 2,
  statutory: 3,
  public: 4,
  attorney: 5,
  company: 6,
  other: 4 // Default to public
}

// Map submitter type to role ID
const ROLE_MAP: Record<string, number> = {
  ministry: 4,    // MDA User
  court: 4,       // MDA User
  statutory: 4,   // MDA User
  public: 1,      // Public User
  attorney: 2,    // Attorney
  company: 3,     // Company
  other: 1        // Public User
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      entityNumber,
      submitterType,
      displayName,
      email,
      phone,
      password,
      firstName,
      lastName,
      companyName,
      selectedMDA,
      courtName,
      lawFirmName,
      barNumber,
    } = data
    
    // Validation
    if (!email || !password || !submitterType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, password, and entity type are required' 
      }, { status: 400 })
    }
    
    // Password validation
    if (password.length < 8) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 })
    }
    
    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      const isStaff = [5, 6, 7, 8].includes(existingUser.roleId)
      return NextResponse.json({ 
        success: false, 
        exists: true,
        isStaff,
        error: isStaff 
          ? 'This email is already registered as a staff member. Please sign in with your existing credentials to access both portals.'
          : 'An account with this email already exists. Please sign in instead.'
      })
    }
    
    // Determine organization name based on submitter type
    let organizationName: string | null = null
    if (submitterType === 'company') {
      organizationName = companyName
    } else if (submitterType === 'ministry' || submitterType === 'statutory') {
      organizationName = selectedMDA
    } else if (submitterType === 'court') {
      organizationName = courtName
    } else if (submitterType === 'attorney') {
      organizationName = lawFirmName
    }
    
    // Determine position/additional info
    let position: string | null = null
    if (submitterType === 'attorney' && barNumber) {
      position = `Bar #: ${barNumber}`
    }
    
    // Determine status - some types require approval
    const requiresApproval = ['attorney', 'company'].includes(submitterType)
    const statusId = requiresApproval ? 1 : 5 // Pending or Active
    
    // Create user
    const newUser = await createUser({
      email,
      firstName: firstName || displayName?.split(' ')[0] || '',
      lastName: lastName || displayName?.split(' ').slice(1).join(' ') || '',
      phone: phone || null,
      entityTypeId: ENTITY_TYPE_MAP[submitterType] || 4,
      entityNumber,
      organizationName,
      departmentId: null,
      position,
      roleId: ROLE_MAP[submitterType] || 1,
      statusId
    })
    
    // Log the activity
    await logActivity({
      userId: newUser.userId,
      userName: `${newUser.firstName} ${newUser.lastName}`,
      userRole: newUser.roleName || 'New User',
      activityType: 'registration',
      activityDescription: `New ${submitterType} user registered`,
      entityType: 'User',
      entityId: newUser.userId,
      entityReference: entityNumber
    })
    
    return NextResponse.json({
      success: true,
      userId: newUser.userId,
      entityNumber,
      requiresApproval,
      message: requiresApproval 
        ? 'Registration submitted successfully. Your account is pending approval.'
        : 'Registration successful. You can now sign in.'
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Registration failed. Please try again.' 
    }, { status: 500 })
  }
}
