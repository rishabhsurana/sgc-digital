"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BarChart3,
  FileText,
  FileSignature,
  Users,
  ArrowRight,
  Building2,
  Settings,
  History,
  FolderOpen,
  Activity,
  PieChart,
} from "lucide-react"

const NAVIGATION_CARDS = [
  {
    title: "Registers",
    description: "Access and manage correspondence and contracts registers",
    icon: FolderOpen,
    bgGradient: "from-emerald-50 to-emerald-100/50",
    borderColor: "border-emerald-200 hover:border-emerald-300",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    links: [
      { title: "Correspondence Register", href: "/management/correspondence-register", icon: FileText },
      { title: "Contracts Register", href: "/management/contracts-register", icon: FileSignature },
    ]
  },
  {
    title: "Transaction History",
    description: "View historical records and audit trails",
    icon: History,
    bgGradient: "from-blue-50 to-blue-100/50",
    borderColor: "border-blue-200 hover:border-blue-300",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    links: [
      { title: "Correspondence History", href: "/management/correspondence-history", icon: FileText },
      { title: "Contracts History", href: "/management/contracts-history", icon: FileSignature },
    ]
  },
  {
    title: "Status Overview",
    description: "View system statistics and performance metrics",
    icon: PieChart,
    bgGradient: "from-amber-50 to-amber-100/50",
    borderColor: "border-amber-200 hover:border-amber-300",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    href: "/management/status"
  },
  {
    title: "Activity Monitor",
    description: "Track pending actions and recent system activity",
    icon: Activity,
    bgGradient: "from-rose-50 to-rose-100/50",
    borderColor: "border-rose-200 hover:border-rose-300",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    href: "/management/activity"
  },
  {
    title: "Reports & Analytics",
    description: "Generate reports and view analytics dashboards",
    icon: BarChart3,
    bgGradient: "from-purple-50 to-purple-100/50",
    borderColor: "border-purple-200 hover:border-purple-300",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    href: "/management/reports"
  },
  {
    title: "User Management",
    description: "Manage user accounts, roles, and permissions",
    icon: Users,
    bgGradient: "from-indigo-50 to-indigo-100/50",
    borderColor: "border-indigo-200 hover:border-indigo-300",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    href: "/management/users"
  },
  {
    title: "MDA Management",
    description: "Manage ministries, departments, and agencies",
    icon: Building2,
    bgGradient: "from-teal-50 to-teal-100/50",
    borderColor: "border-teal-200 hover:border-teal-300",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    href: "/management/mda"
  },
  {
    title: "Settings",
    description: "Configure system preferences and options",
    icon: Settings,
    bgGradient: "from-slate-50 to-slate-100/50",
    borderColor: "border-slate-200 hover:border-slate-300",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    href: "/management/settings"
  },
]

export default function ManagementDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Management Portal</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to the SGC Digital Management Portal. Select an option below to get started.
        </p>
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {NAVIGATION_CARDS.map((card) => (
          <Card 
            key={card.title} 
            className={`hover:shadow-lg transition-all ${card.borderColor} bg-gradient-to-br ${card.bgGradient}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} shadow-sm`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-sm mt-2">{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {card.links ? (
                <div className="space-y-2">
                  {card.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/70 hover:bg-white transition-colors border border-transparent hover:border-primary/10 cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <link.icon className={`h-4 w-4 ${card.iconColor}`} />
                          <span className="text-sm font-medium">{link.title}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link href={card.href!}>
                  <Button variant="secondary" className="w-full justify-between group">
                    Open
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
