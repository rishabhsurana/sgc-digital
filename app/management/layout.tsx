import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getSession } from "@/lib/actions/auth-actions"
import { ManagementLayoutClient, type AdminSession } from "./management-layout-client"

// Pages that don't require authentication
const publicPages = ["/management/login", "/management/register", "/management/landing"]

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""
  
  // Extract pathname from referer or use a simpler approach
  const isPublicPage = publicPages.some(page => pathname.includes(page))
  
  // For public pages, render without auth check
  if (isPublicPage) {
    return <>{children}</>
  }
  
  // Check session for protected pages
  const session = await getSession()
  
  // If no session, we'll let the client handle the redirect
  // (since pathname detection on server is tricky without middleware)
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
