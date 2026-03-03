"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  BarChart3,
  FileText,
  FileSignature,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  ArrowRight,
  Activity
} from "lucide-react"

const QUICK_STATS = [
  {
    title: "Pending Correspondence",
    value: 47,
    change: "+5 today",
    icon: FileText,
    color: "blue",
    href: "/management/correspondence-register?status=pending"
  },
  {
    title: "Pending Contracts",
    value: 23,
    change: "+2 today",
    icon: FileSignature,
    color: "purple",
    href: "/management/contracts-register?status=pending"
  },
  {
    title: "Completed This Week",
    value: 89,
    change: "+12% vs last week",
    icon: CheckCircle,
    color: "green",
    href: "/management/reports"
  },
  {
    title: "Active Users",
    value: 156,
    change: "Online now: 34",
    icon: Users,
    color: "orange",
    href: "/management/users"
  }
]

const RECENT_ACTIVITY = [
  { id: 1, type: "correspondence", ref: "COR-2026-0234", action: "Submitted", time: "5 min ago", ministry: "Ministry of Health" },
  { id: 2, type: "contract", ref: "CON-2026-0089", action: "Approved", time: "12 min ago", ministry: "Ministry of Works" },
  { id: 3, type: "correspondence", ref: "COR-2026-0233", action: "Under Review", time: "25 min ago", ministry: "Ministry of Finance" },
  { id: 4, type: "contract", ref: "CON-2026-0088", action: "Submitted", time: "1 hour ago", ministry: "Ministry of Education" },
  { id: 5, type: "correspondence", ref: "COR-2026-0232", action: "Completed", time: "2 hours ago", ministry: "Ministry of Agriculture" },
]

const PENDING_ACTIONS = [
  { id: 1, type: "contract", ref: "CON-2026-0087", title: "IT Equipment Procurement", ministry: "Ministry of ICT", priority: "high", daysWaiting: 3 },
  { id: 2, type: "correspondence", ref: "COR-2026-0231", title: "Legal Advisory Request", ministry: "Ministry of Health", priority: "medium", daysWaiting: 2 },
  { id: 3, type: "contract", ref: "CON-2026-0086", title: "Building Renovation Works", ministry: "Ministry of Works", priority: "high", daysWaiting: 5 },
  { id: 4, type: "correspondence", ref: "COR-2026-0230", title: "Compensation Claim Review", ministry: "Attorney General", priority: "low", daysWaiting: 1 },
]

export default function ManagementDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Management Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of SGC Digital operations and pending actions.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {QUICK_STATS.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer border-${stat.color}-200 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium text-${stat.color}-700`}>{stat.title}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-900 mt-1`}>{stat.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${stat.color}-500/20`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Pending Actions
              </CardTitle>
              <CardDescription>Items requiring review or approval</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/management/correspondence-register?status=pending">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PENDING_ACTIONS.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.type === 'contract' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.type === 'contract' ? <FileSignature className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.ref} - {item.ministry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.daysWaiting}d</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest submissions and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/management/reports">
                View Reports
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${activity.type === 'contract' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {activity.type === 'contract' ? <FileSignature className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.ref}</p>
                      <p className="text-xs text-muted-foreground">{activity.ministry}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      activity.action === 'Completed' || activity.action === 'Approved' ? 'default' :
                      activity.action === 'Under Review' ? 'secondary' : 'outline'
                    } className={
                      activity.action === 'Completed' || activity.action === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : ''
                    }>
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

      {/* Quick Links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/management/correspondence-register">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Correspondence Register</p>
                <p className="text-sm text-muted-foreground">View and manage all correspondence</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/management/contracts-register">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 hover:border-purple-300">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <FileSignature className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Contracts Register</p>
                <p className="text-sm text-muted-foreground">View and manage all contracts</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/management/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-orange-200 hover:border-orange-300">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Reports & Analytics</p>
                <p className="text-sm text-muted-foreground">View insights and statistics</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
