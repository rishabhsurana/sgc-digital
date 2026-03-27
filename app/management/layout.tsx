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
  const session = await getSession()
  
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
