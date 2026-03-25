"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
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
import { AskRex } from "@/components/ask-rex"

interface AdminSession {
  email: string
  name: string
  role: string
  department?: string
  loginTime: string
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

function SidebarContent({ pathname, adminSession, onSignOut }: { pathname: string; adminSession: AdminSession | null; onSignOut: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-primary/10 px-4">
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

      {/* Admin Info */}
      {adminSession && (
        <div className="border-t border-primary/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{adminSession.name}</p>
              <p className="text-xs text-muted-foreground truncate">{adminSession.email}</p>
            </div>
          </div>
          <Badge variant="outline" className="w-full justify-center text-xs capitalize mb-3">
            {adminSession.role.replace("_", " ")}
          </Badge>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-primary/10 p-4 space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Main Site
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Pages that don't require authentication
  const publicPages = ["/management/login", "/management/register", "/management/landing"]
  const isPublicPage = publicPages.includes(pathname)

  // Check for admin session on mount
  useEffect(() => {
    // Skip auth check for public pages (login, register)
    if (isPublicPage) {
      setIsLoading(false)
      return
    }

    const storedAdmin = sessionStorage.getItem("sgc_admin")
    if (storedAdmin) {
      setAdminSession(JSON.parse(storedAdmin))
      setIsLoading(false)
    } else {
      // Redirect to management landing page
      router.push("/management/landing")
    }
  }, [pathname, router, isPublicPage])

  const handleSignOut = () => {
    sessionStorage.removeItem("sgc_admin")
    router.push("/management/login")
  }

  // Show loading state
  if (isLoading && !isPublicPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Render public pages (login, register) without sidebar
  if (isPublicPage) {
    return <>{children}</>
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
      <div className="flex flex-1 flex-col lg:pl-64">
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
        <main className="flex-1">
          {/* Breadcrumbs */}
          <div className="border-b border-primary/10 bg-card px-6 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
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
          
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Ask Rex AI Assistant */}
      <AskRex />
    </div>
  )
}
