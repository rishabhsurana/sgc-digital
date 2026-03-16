"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FileSignature, 
  Inbox,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronDown,
  Menu,
  X,
  Kanban,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/case-management/contracts", icon: LayoutDashboard },
  { name: "Work Queue", href: "/case-management/contracts/workqueue", icon: Inbox },
  { name: "Kanban Board", href: "/case-management/contracts/kanban", icon: Kanban },
  { name: "All Cases", href: "/case-management/contracts/cases", icon: FileSignature },
  { name: "Reports", href: "/case-management/contracts/reports", icon: BarChart3 },
]

const inBaskets = [
  { name: "New Intake", href: "/case-management/contracts/workqueue?basket=intake", count: 5, color: "bg-blue-500" },
  { name: "Drafting", href: "/case-management/contracts/workqueue?basket=drafting", count: 12, color: "bg-amber-500" },
  { name: "Awaiting Approval", href: "/case-management/contracts/workqueue?basket=awaiting_approval", count: 3, color: "bg-purple-500" },
  { name: "With Ministry", href: "/case-management/contracts/workqueue?basket=with_ministry", count: 8, color: "bg-cyan-500" },
  { name: "Adjudication", href: "/case-management/contracts/workqueue?basket=adjudication", count: 2, color: "bg-orange-500" },
  { name: "Ready to Close", href: "/case-management/contracts/workqueue?basket=ready_close", count: 4, color: "bg-green-500" },
]

export default function ContractsCaseManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/case-management/contracts" className="flex items-center gap-3">
              <Image
                src="/images/sgc-digital-logo.png"
                alt="SGC Digital"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold">SGC Digital - Case Management</h1>
                <p className="text-xs text-white/70">Contracts Module</p>
              </div>
            </Link>
          </div>

          {/* Right: Notifications and User */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium">New contract assigned</span>
                  <span className="text-xs text-muted-foreground">CON-2026-00045 requires your review</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium">SLA Warning</span>
                  <span className="text-xs text-muted-foreground">CON-2026-00032 due in 24 hours</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-blue-600">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline">Legal Officer</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-14 left-0 bottom-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Main Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Navigation
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}

            {/* In-Baskets */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                In-Baskets
              </div>
              {inBaskets.map((basket) => (
                <Link
                  key={basket.name}
                  href={basket.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2 w-2 rounded-full", basket.color)} />
                    {basket.name}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {basket.count}
                  </Badge>
                </Link>
              ))}
            </div>
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t bg-muted/30">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              My Stats Today
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-blue-600">8</div>
                <div className="text-xs text-muted-foreground">Assigned</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-green-600">3</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-amber-600">2</div>
                <div className="text-xs text-muted-foreground">Due Soon</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-red-600">1</div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-14">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
