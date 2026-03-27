import { headers } from "next/headers"
import { getSession } from "@/lib/actions/auth-actions"
import { ManagementLayoutClient, type AdminSession } from "./management-layout-client"

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  
  // Always check session - let client handle redirects for better UX
  console.log('[v0] Management layout - checking session, pathname:', pathname)
  const session = await getSession()
  console.log('[v0] Management layout - session result:', session ? session.email : 'null')
  
  // Build admin session if authenticated
  const adminSession: AdminSession | null = session ? {
    userId: session.userId,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    roleName: session.roleName,
    departmentName: session.departmentName,
  } : null

  return (
    <ManagementLayoutClient adminSession={adminSession}>
      {children}
    </ManagementLayoutClient>
  )
}
