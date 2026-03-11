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
    bgGradient: "from-emerald-500 to-emerald-600",
    borderColor: "border-emerald-600 hover:border-emerald-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    textColor: "text-white",
    descColor: "text-emerald-100",
    links: [
      { title: "Correspondence Register", href: "/management/correspondence-register", icon: FileText },
      { title: "Contracts Register", href: "/management/contracts-register", icon: FileSignature },
    ]
  },
  {
    title: "Transaction History",
    description: "View historical records and audit trails",
    icon: History,
    bgGradient: "from-blue-500 to-blue-600",
    borderColor: "border-blue-600 hover:border-blue-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    textColor: "text-white",
    descColor: "text-blue-100",
    links: [
      { title: "Correspondence History", href: "/management/correspondence-history", icon: FileText },
      { title: "Contracts History", href: "/management/contracts-history", icon: FileSignature },
    ]
  },
  {
    title: "Status Overview",
    description: "View system statistics and performance metrics",
    icon: PieChart,
    bgGradient: "from-amber-500 to-amber-600",
    borderColor: "border-amber-600 hover:border-amber-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    textColor: "text-white",
    descColor: "text-amber-100",
    href: "/management/status"
  },
  {
    title: "Activity Monitor",
    description: "Track pending actions and recent system activity",
    icon: Activity,
    bgGradient: "from-rose-500 to-rose-600",
    borderColor: "border-rose-600 hover:border-rose-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    textColor: "text-white",
    descColor: "text-rose-100",
    href: "/management/activity"
  },
  {
    title: "Reports & Analytics",
    description: "Generate reports and view analytics dashboards",
    icon: BarChart3,
    bgGradient: "from-purple-500 to-purple-600",
    borderColor: "border-purple-600 hover:border-purple-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    textColor: "text-white",
    descColor: "text-purple-100",
    href: "/management/reports"
  },
  {
    title: "User Management",
    description: "Manage user accounts, roles, and permissions",
    icon: Users,
    bgGradient: "from-indigo-500 to-indigo-600",
    borderColor: "border-indigo-600 hover:border-indigo-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    textColor: "text-white",
    descColor: "text-indigo-100",
    href: "/management/users"
  },
  {
    title: "MDA Management",
    description: "Manage ministries, departments, and agencies",
    icon: Building2,
    bgGradient: "from-teal-500 to-teal-600",
    borderColor: "border-teal-600 hover:border-teal-400",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    textColor: "text-white",
    descColor: "text-teal-100",
    href: "/management/mda"
  },
  {
    title: "Settings",
    description: "Configure system preferences and options",
    icon: Settings,
    bgGradient: "from-slate-600 to-slate-700",
    borderColor: "border-slate-700 hover:border-slate-500",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    textColor: "text-white",
    descColor: "text-slate-200",
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
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} shadow-sm backdrop-blur-sm`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <div>
                  <CardTitle className={`text-lg ${card.textColor}`}>{card.title}</CardTitle>
                </div>
              </div>
              <CardDescription className={`text-sm mt-2 ${card.descColor}`}>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {card.links ? (
                <div className="space-y-2">
                  {card.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors border border-white/20 hover:border-white/40 cursor-pointer group backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <link.icon className="h-4 w-4 text-white" />
                          <span className="text-sm font-medium text-white">{link.title}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link href={card.href!}>
                  <Button className="w-full justify-between group bg-white/20 hover:bg-white/30 text-white border border-white/20">
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
