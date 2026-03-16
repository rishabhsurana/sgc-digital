"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Mail, 
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
  Users,
  Newspaper
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
  { name: "Dashboard", href: "/case-management/correspondence", icon: LayoutDashboard },
  { name: "Daily Mail", href: "/case-management/correspondence/daily-mail", icon: Newspaper },
  { name: "Work Queue", href: "/case-management/correspondence/workqueue", icon: Inbox },
  { name: "Kanban Board", href: "/case-management/correspondence/kanban", icon: Kanban },
  { name: "All Cases", href: "/case-management/correspondence/cases", icon: Mail },
  { name: "Reports", href: "/case-management/correspondence/reports", icon: BarChart3 },
]

const inBaskets = [
  { name: "New Intake", href: "/case-management/correspondence/workqueue?basket=intake", count: 8, color: "bg-blue-500" },
  { name: "Pending Review", href: "/case-management/correspondence/workqueue?basket=pending_review", count: 15, color: "bg-purple-500" },
  { name: "In Progress", href: "/case-management/correspondence/workqueue?basket=in_progress", count: 22, color: "bg-amber-500" },
  { name: "Pending External", href: "/case-management/correspondence/workqueue?basket=pending_external", count: 6, color: "bg-cyan-500" },
  { name: "Ready Dispatch", href: "/case-management/correspondence/workqueue?basket=ready_dispatch", count: 4, color: "bg-green-500" },
]

const correspondenceTypes = [
  { name: "General", count: 18, color: "bg-slate-400" },
  { name: "Litigation", count: 12, color: "bg-red-400" },
  { name: "Compensation", count: 8, color: "bg-orange-400" },
  { name: "Advisory", count: 15, color: "bg-blue-400" },
  { name: "Cabinet", count: 3, color: "bg-purple-400" },
]

export default function CorrespondenceCaseManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white">
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
            <Link href="/case-management/correspondence" className="flex items-center gap-3">
              <Image
                src="/images/sgc-digital-logo.png"
                alt="SGC Digital"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold">Correspondence Case Management</h1>
                <p className="text-xs text-white/70">Solicitor General&apos;s Chambers</p>
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
                    5
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium">URGENT: New correspondence</span>
                  <span className="text-xs text-muted-foreground">COR-2026-00156 requires immediate attention</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium">Daily Mail ready for review</span>
                  <span className="text-xs text-muted-foreground">8 new items in today's batch</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-emerald-600">
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
                  <span className="hidden sm:inline">SG Secretary</span>
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
                      ? "bg-emerald-50 text-emerald-700" 
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

            {/* By Type */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                By Type
              </div>
              {correspondenceTypes.map((type) => (
                <Link
                  key={type.name}
                  href={`/case-management/correspondence/cases?type=${type.name.toLowerCase()}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2 w-2 rounded-full", type.color)} />
                    {type.name}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {type.count}
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
                <div className="text-lg font-bold text-emerald-600">12</div>
                <div className="text-xs text-muted-foreground">Assigned</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-green-600">5</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-amber-600">3</div>
                <div className="text-xs text-muted-foreground">Due Soon</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-lg font-bold text-red-600">2</div>
                <div className="text-xs text-muted-foreground">Urgent</div>
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
