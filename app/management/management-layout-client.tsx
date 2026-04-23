"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  BookOpen,
  FileText,
  FileSignature,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  User,
  History,
  PieChart,
  Activity,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AskRex } from "@/components/ask-rex"
import { clearAuth, getToken, getUser, isManagementUser } from "@/lib/auth"

export interface AdminSession {
  userId: string
  email: string
  firstName: string
  lastName: string
  roleName: string
  departmentName?: string
}

// Breadcrumb configuration
const breadcrumbConfig: Record<string, { label: string; parent?: string }> = {
  "/management": { label: "Dashboard" },
  "/management/registers": { label: "Registers", parent: "/management" },
  "/management/correspondence-register": { label: "Correspondence Register", parent: "/management/registers" },
  "/management/contracts-register": { label: "Contracts Register", parent: "/management/registers" },
  "/management/correspondence-history": { label: "Correspondence History", parent: "/management" },
  "/management/contracts-history": { label: "Contracts History", parent: "/management" },
  "/management/status": { label: "Status Overview", parent: "/management" },
  "/management/activity": { label: "Activity Monitor", parent: "/management" },
  "/management/reports": { label: "Reports & Analytics", parent: "/management" },
  "/management/users": { label: "User Management", parent: "/management" },
  "/management/mda": { label: "MDA Management", parent: "/management" },
  "/management/settings": { label: "Settings", parent: "/management" },
}

function getBreadcrumbs(pathname: string) {
  const breadcrumbs: { href: string; label: string; isCurrentPage: boolean }[] = []
  let currentPath = pathname
  
  while (currentPath && breadcrumbConfig[currentPath]) {
    const config = breadcrumbConfig[currentPath]
    breadcrumbs.unshift({
      href: currentPath,
      label: config.label,
      isCurrentPage: currentPath === pathname
    })
    currentPath = config.parent || ""
  }
  
  return breadcrumbs
}

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/management",
    icon: LayoutDashboard,
  },
  {
    title: "Registers",
    href: "/management/registers",
    icon: BookOpen,
  },
  {
    title: "Correspondence Register",
    href: "/management/correspondence-register",
    icon: FileText,
    indent: true,
  },
  {
    title: "Contracts Register",
    href: "/management/contracts-register",
    icon: FileSignature,
    indent: true,
  },
  {
    title: "Transaction History",
    href: "#",
    icon: History,
  },
  {
    title: "Correspondence History",
    href: "/management/correspondence-history",
    icon: FileText,
    indent: true,
  },
  {
    title: "Contracts History",
    href: "/management/contracts-history",
    icon: FileSignature,
    indent: true,
  },
  {
    title: "Status Overview",
    href: "/management/status",
    icon: PieChart,
  },
  {
    title: "Activity Monitor",
    href: "/management/activity",
    icon: Activity,
  },
  {
    title: "Reports & Analytics",
    href: "/management/reports",
    icon: BarChart3,
  },
  {
    title: "User Management",
    href: "/management/users",
    icon: Users,
  },
  {
    title: "MDA Management",
    href: "/management/mda",
    icon: Building2,
  },
  {
    title: "Settings",
    href: "/management/settings",
    icon: Settings,
  },
]

function SidebarContent({ 
  pathname, 
  adminSession, 
  onSignOut 
}: { 
  pathname: string
  adminSession: AdminSession | null
  onSignOut: () => void 
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-20 items-center border-b border-primary/10 px-4 py-1">
        <Link href="/management" className="flex items-center gap-3">
          <Image
            src="/images/barbados-coat-of-arms.png"
            alt="Government of Barbados"
            width={36}
            height={36}
          />
          <div>
            <p className="text-sm font-bold text-primary">SGC Digital</p>
            <p className="text-[10px] text-muted-foreground">Management Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/management" && item.href !== "/management/registers" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  item.indent && "ml-4 text-xs"
                )}
              >
                <item.icon className={cn("h-4 w-4", item.indent && "h-3.5 w-3.5")} />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-primary/10 p-4 space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
          <Link href="/management/landing">
            <Home className="mr-2 h-4 w-4" />
            Management Home
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-blue-600 hover:text-blue-700" asChild>
          <Link href="/">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            SGC Public Portal
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Public pages that don't require authentication
const publicPages = ["/management/login", "/management/register", "/management/landing"]

export function ManagementLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // undefined = checking auth, null = unauthenticated, object = authenticated
  const [adminSession, setAdminSession] = useState<AdminSession | null | undefined>(undefined)
  
  const isPublicPage = publicPages.includes(pathname)

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    const isManagement = isManagementUser(user)

    if (token && user && isManagement) {
      const [firstName = user.full_name, ...rest] = user.full_name.split(" ")
      setAdminSession({
        userId: user.id,
        email: user.email,
        firstName,
        lastName: rest.join(" "),
        roleName: user.role,
        departmentName: user.department || undefined,
      })
    } else {
      setAdminSession(null)
      if (!isPublicPage) {
        router.push("/management/login")
      }
    }
  }, [pathname, isPublicPage, router])

  const handleSignOut = () => {
    clearAuth()
    router.push("/management/login")
  }

  // Render public pages (login, register) without sidebar
  if (isPublicPage) {
    return <>{children}</>
  }

  // Show loading state while checking auth
  if (adminSession === undefined || adminSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-primary/10 bg-card">
        <SidebarContent pathname={pathname} adminSession={adminSession} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent pathname={pathname} adminSession={adminSession} onSignOut={handleSignOut} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-primary/10 bg-card px-4 lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center gap-2">
            <Image
              src="/images/barbados-coat-of-arms.png"
              alt="Government of Barbados"
              width={28}
              height={28}
            />
            <span className="font-semibold text-primary">SGC Management</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 flex-1">
          {/* Breadcrumbs */}
          <div className="border-b border-primary/10 bg-card px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1 overflow-x-auto">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/management/landing" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Home className="h-3.5 w-3.5" />
                      Home
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </BreadcrumbSeparator>
                  {getBreadcrumbs(pathname).map((crumb, index, arr) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {crumb.isCurrentPage ? (
                          <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-primary">
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < arr.length - 1 && (
                        <BreadcrumbSeparator>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </BreadcrumbSeparator>
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              </div>

              {adminSession && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0 flex items-center gap-2 rounded-full border-slate-200 hover:border-primary/50 hover:bg-primary/5 px-4">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {adminSession.firstName.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[160px] truncate font-medium text-slate-700">
                        {adminSession.firstName} {adminSession.lastName}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <div className="px-3 py-2 mb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold">
                          {adminSession.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{adminSession.firstName} {adminSession.lastName}</p>
                          <p className="text-xs text-slate-500">{adminSession.email}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {adminSession.roleName.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/management/landing" className="flex items-center gap-2 py-2">
                        <Home className="h-4 w-4 text-slate-400" />
                        Management Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/" className="flex items-center gap-2 py-2">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                          <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        SGC Public Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 rounded-lg cursor-pointer py-2">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          <div className="min-w-0 p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Ask Rex AI Assistant */}
      <AskRex />
    </div>
  )
}
