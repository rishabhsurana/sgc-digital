"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  BarChart3,
  FileText,
  FileSignature,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowRight,
  Activity,
  Building2,
  Settings,
  History,
  Clock,
  FolderOpen
} from "lucide-react"

// Navigation cards for the landing page
const NAVIGATION_CARDS = [
  {
    title: "Registers",
    description: "Access and manage correspondence and contracts registers",
    icon: FolderOpen,
    color: "emerald",
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
    color: "blue",
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
    title: "Reports & Analytics",
    description: "Generate reports and view analytics dashboards",
    icon: BarChart3,
    color: "amber",
    bgGradient: "from-amber-50 to-amber-100/50",
    borderColor: "border-amber-200 hover:border-amber-300",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    href: "/management/reports"
  },
  {
    title: "User Management",
    description: "Manage user accounts, roles, and permissions",
    icon: Users,
    color: "violet",
    bgGradient: "from-violet-50 to-violet-100/50",
    borderColor: "border-violet-200 hover:border-violet-300",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    href: "/management/users"
  },
  {
    title: "MDA Management",
    description: "Manage ministries, departments, and agencies",
    icon: Building2,
    color: "rose",
    bgGradient: "from-rose-50 to-rose-100/50",
    borderColor: "border-rose-200 hover:border-rose-300",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    href: "/management/mda"
  },
  {
    title: "Settings",
    description: "Configure system preferences and options",
    icon: Settings,
    color: "slate",
    bgGradient: "from-slate-50 to-slate-100/50",
    borderColor: "border-slate-200 hover:border-slate-300",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    href: "/management/settings"
  },
]

const QUICK_STATS = [
  {
    title: "Pending Correspondence",
    value: 47,
    change: "+5 today",
    icon: FileText,
    bgColor: "bg-blue-500",
    href: "/management/correspondence-register?status=pending"
  },
  {
    title: "Pending Contracts",
    value: 23,
    change: "+2 today",
    icon: FileSignature,
    bgColor: "bg-violet-500",
    href: "/management/contracts-register?status=pending"
  },
  {
    title: "Completed This Week",
    value: 89,
    change: "+12% vs last week",
    icon: CheckCircle,
    bgColor: "bg-emerald-500",
    href: "/management/reports"
  },
  {
    title: "Active Users",
    value: 156,
    change: "Online now: 34",
    icon: Users,
    bgColor: "bg-amber-500",
    href: "/management/users"
  }
]

const RECENT_ACTIVITY = [
  { id: 1, type: "correspondence", ref: "COR-2026-0234", action: "Submitted", time: "5 min ago", ministry: "Ministry of Health" },
  { id: 2, type: "contract", ref: "CON-2026-0089", action: "Approved", time: "12 min ago", ministry: "Ministry of Works" },
  { id: 3, type: "correspondence", ref: "COR-2026-0233", action: "Under Review", time: "25 min ago", ministry: "Ministry of Finance" },
  { id: 4, type: "contract", ref: "CON-2026-0088", action: "Submitted", time: "1 hour ago", ministry: "Ministry of Education" },
]

const PENDING_ACTIONS = [
  { id: 1, type: "contract", ref: "CON-2026-0087", title: "IT Equipment Procurement", ministry: "Ministry of ICT", priority: "high", daysWaiting: 3 },
  { id: 2, type: "correspondence", ref: "COR-2026-0231", title: "Legal Advisory Request", ministry: "Ministry of Health", priority: "medium", daysWaiting: 2 },
  { id: 3, type: "contract", ref: "CON-2026-0086", title: "Building Renovation Works", ministry: "Ministry of Works", priority: "high", daysWaiting: 5 },
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

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_STATS.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer border-primary/10 hover:border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} text-white shadow-sm`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Navigation Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Navigation</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <CardDescription className="text-xs">{card.description}</CardDescription>
                  </div>
                </div>
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
                      Open {card.title}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity and Pending Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Pending Actions
              </CardTitle>
              <CardDescription className="text-xs">Items requiring review or approval</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/management/correspondence-register?status=pending">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {PENDING_ACTIONS.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.type === 'contract' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.type === 'contract' ? <FileSignature className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.ref}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.daysWaiting}d</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs">Latest submissions and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/management/reports">
                View Reports
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${activity.type === 'contract' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                      {activity.type === 'contract' ? <FileSignature className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.ref}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{activity.ministry}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      activity.action === 'Completed' || activity.action === 'Approved' ? 'default' :
                      activity.action === 'Under Review' ? 'secondary' : 'outline'
                    } className={`text-xs ${
                      activity.action === 'Completed' || activity.action === 'Approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''
                    }`}>
                      {activity.action}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
