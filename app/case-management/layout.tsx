"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  LayoutDashboard, 
  Mail, 
  FileSignature,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronDown,
  ArrowLeft
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
import { usePathname } from "next/navigation"

export default function CaseManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // If we're in a specific module (contracts or correspondence), don't wrap
  // The module layouts handle their own navigation
  if (pathname.startsWith('/case-management/contracts') || 
      pathname.startsWith('/case-management/correspondence')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white mr-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Back to Portal</span>
            </Link>
            <div className="h-6 w-px bg-white/20" />
            <Link href="/case-management" className="flex items-center gap-3">
              <Image
                src="/images/sgc-digital-logo.png"
                alt="SGC Digital"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold">SGC Digital - Case Management</h1>
                <p className="text-xs text-white/70">Solicitor General&apos;s Chambers</p>
              </div>
            </Link>
          </div>

          {/* Center: Module Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/case-management/correspondence">
              <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                <Mail className="h-4 w-4" />
                Correspondence
              </Button>
            </Link>
            <Link href="/case-management/contracts">
              <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                <FileSignature className="h-4 w-4" />
                Contracts
              </Button>
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
                    8
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium">New items in Daily Mail</span>
                  <span className="text-xs text-muted-foreground">8 correspondence items require assignment</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <span className="font-medium">Contract SLA Warning</span>
                  <span className="text-xs text-muted-foreground">CON-2026-00045 due in 24 hours</span>
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
                  <span className="hidden sm:inline">SGC Staff</span>
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

      {/* Main Content */}
      <main className="pt-14">
        {children}
      </main>
    </div>
  )
}
