// Approved Management Users
// Only users in this list can access the Management interface

export interface AdminUser {
  email: string
  name: string
  role: "super_admin" | "admin" | "manager"
  department?: string
}

export const APPROVED_ADMIN_USERS: AdminUser[] = [
  {
    email: "admin@sgc.gov.bb",
    name: "System Administrator",
    role: "super_admin",
    department: "Solicitor General's Chambers"
  },
  {
    email: "manager@sgc.gov.bb",
    name: "Registry Manager",
    role: "admin",
    department: "Registry"
  },
  // Add your email here to get access
  {
    email: "user@example.com",
    name: "Management User",
    role: "admin",
    department: "Solicitor General's Chambers"
  }
]

export function isApprovedAdmin(email: string): AdminUser | undefined {
  return APPROVED_ADMIN_USERS.find(
    user => user.email.toLowerCase() === email.toLowerCase()
  )
}

export function getAdminRole(email: string): string | undefined {
  const user = isApprovedAdmin(email)
  return user?.role
}
