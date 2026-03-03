"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  ChevronLeft,
  Home,
  LogOut
} from "lucide-react"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/management",
    icon: LayoutDashboard,
  },
  {
    title: "Correspondence Register",
    href: "/management/correspondence-register",
    icon: FileText,
  },
  {
    title: "Contracts Register",
    href: "/management/contracts-register",
    icon: FileSignature,
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

function SidebarContent({ pathname }: { pathname: string }) {
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
              (item.href !== "/management" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-primary/10 p-4 space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Main Site
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-primary/10 bg-card">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent pathname={pathname} />
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
          {children}
        </main>
      </div>
    </div>
  )
}
