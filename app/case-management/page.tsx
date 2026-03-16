"use client"

import { 
  Mail, 
  FileSignature, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock summary data
const summaryStats = {
  correspondence: {
    total: 1247,
    pending: 89,
    atRisk: 12,
    closedThisWeek: 34
  },
  contracts: {
    total: 423,
    pending: 45,
    atRisk: 5,
    approvedThisWeek: 12
  }
}

const recentActivity = [
  { id: "COR-2026-00145", type: "correspondence", action: "Assigned", time: "10 minutes ago", user: "Director General Solicitor" },
  { id: "CON-2026-00089", type: "contract", action: "Approved", time: "25 minutes ago", user: "Solicitor General" },
  { id: "COR-2026-00144", type: "correspondence", action: "Submitted", time: "1 hour ago", user: "Ministry of Finance" },
  { id: "CON-2026-00088", type: "contract", action: "Sent to MDA", time: "2 hours ago", user: "Sarah Thompson" },
  { id: "COR-2026-00143", type: "correspondence", action: "Closed", time: "3 hours ago", user: "Michael Brown" },
]

const urgentItems = [
  { id: "COR-2026-00137", type: "correspondence", subject: "Treaty Interpretation - CARICOM Agreement", daysOverdue: 1 },
  { id: "CON-2026-00085", type: "contract", subject: "Ministry of Health Equipment Procurement", daysOverdue: 2 },
  { id: "COR-2026-00139", type: "correspondence", subject: "Litigation Support - Crown vs. XYZ Corporation", dueIn: 2 },
]

export default function CaseManagementPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">SGC Digital - Case Management</h1>
              <p className="mt-1 text-white/80">BPM workflow management for Correspondence and Contracts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correspondence Module */}
        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Correspondence</CardTitle>
                <CardDescription>Registry and correspondence case management</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{summaryStats.correspondence.total}</p>
                <p className="text-xs text-blue-600">Total Cases</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-900">{summaryStats.correspondence.pending}</p>
                <p className="text-xs text-amber-600">Pending</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-900">{summaryStats.correspondence.atRisk}</p>
                <p className="text-xs text-red-600">At Risk</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">{summaryStats.correspondence.closedThisWeek}</p>
                <p className="text-xs text-green-600">Closed This Week</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href="/case-management/correspondence">
                  Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/case-management/correspondence/daily-mail">
                  Daily Mail
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contracts Module */}
        <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileSignature className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Contracts</CardTitle>
                <CardDescription>Contract vetting and case management</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-900">{summaryStats.contracts.total}</p>
                <p className="text-xs text-emerald-600">Total Cases</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-900">{summaryStats.contracts.pending}</p>
                <p className="text-xs text-amber-600">Pending</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-900">{summaryStats.contracts.atRisk}</p>
                <p className="text-xs text-red-600">At Risk</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">{summaryStats.contracts.approvedThisWeek}</p>
                <p className="text-xs text-green-600">Approved This Week</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/case-management/contracts">
                  Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/case-management/contracts/workqueue">
                  Workqueue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Items Requiring Attention
              </CardTitle>
              <Badge variant="destructive">{urgentItems.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded flex items-center justify-center ${
                      item.type === "correspondence" ? "bg-blue-100" : "bg-emerald-100"
                    }`}>
                      {item.type === "correspondence" ? (
                        <Mail className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileSignature className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{item.id}</p>
                      <p className="text-sm font-medium truncate max-w-48">{item.subject}</p>
                    </div>
                  </div>
                  <Badge className={item.daysOverdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                    {item.daysOverdue ? `${item.daysOverdue}d overdue` : `Due in ${item.dueIn}d`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === "correspondence" ? "bg-blue-100" : "bg-emerald-100"
                  }`}>
                    {activity.type === "correspondence" ? (
                      <Mail className="h-4 w-4 text-blue-600" />
                    ) : (
                      <FileSignature className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-mono text-blue-600">{activity.id}</span>
                      <span className="text-muted-foreground"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} - {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/case-management/correspondence/daily-mail">
                <Mail className="h-4 w-4 mr-2" />
                Daily Mail Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/case-management/correspondence/workqueue">
                <Clock className="h-4 w-4 mr-2" />
                My Correspondence Queue
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/case-management/contracts/workqueue">
                <FileSignature className="h-4 w-4 mr-2" />
                My Contracts Queue
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports & Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
