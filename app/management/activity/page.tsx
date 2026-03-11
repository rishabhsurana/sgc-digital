"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileSignature,
  User,
  ArrowRight,
  RefreshCw,
} from "lucide-react"

const pendingActions = [
  {
    id: 1,
    type: "correspondence",
    reference: "COR-2026-0158",
    subject: "Emergency Medical Supplies Request",
    mda: "Ministry of Health",
    submittedBy: "Dr. Sarah Johnson",
    daysAgo: 2,
    priority: "high",
  },
  {
    id: 2,
    type: "contract",
    reference: "CON-2026-0087",
    subject: "IT Infrastructure Upgrade",
    mda: "Ministry of ICT",
    submittedBy: "Kevin Thompson",
    daysAgo: 3,
    priority: "medium",
  },
  {
    id: 3,
    type: "correspondence",
    reference: "COR-2026-0160",
    subject: "Legal Opinion on Contract Amendment",
    mda: "Attorney General Office",
    submittedBy: "Maria Sanchez",
    daysAgo: 1,
    priority: "high",
  },
  {
    id: 4,
    type: "contract",
    reference: "CON-2026-0086",
    subject: "Road Rehabilitation - Highway 1",
    mda: "Ministry of Works",
    submittedBy: "James Williams",
    daysAgo: 4,
    priority: "medium",
  },
  {
    id: 5,
    type: "correspondence",
    reference: "COR-2026-0156",
    subject: "Budget Allocation Request FY2026",
    mda: "Ministry of Finance",
    submittedBy: "Robert Chen",
    daysAgo: 5,
    priority: "low",
  },
]

const recentActivity = [
  {
    id: 1,
    action: "approved",
    type: "correspondence",
    reference: "COR-2026-0157",
    subject: "Staff Training Program Approval",
    performedBy: "Admin User",
    timestamp: "Today at 2:45 PM",
  },
  {
    id: 2,
    action: "submitted",
    type: "contract",
    reference: "CON-2026-0089",
    subject: "Medical Equipment Supply",
    performedBy: "Dr. Sarah Johnson",
    timestamp: "Today at 11:30 AM",
  },
  {
    id: 3,
    action: "approved",
    type: "contract",
    reference: "CON-2026-0085",
    subject: "Financial Advisory Services",
    performedBy: "Admin User",
    timestamp: "Yesterday at 4:15 PM",
  },
  {
    id: 4,
    action: "reviewed",
    type: "correspondence",
    reference: "COR-2026-0159",
    subject: "Infrastructure Assessment Report Q1",
    performedBy: "Registry Manager",
    timestamp: "Yesterday at 2:00 PM",
  },
  {
    id: 5,
    action: "submitted",
    type: "correspondence",
    reference: "COR-2026-0161",
    subject: "Tourism Development Initiative Proposal",
    performedBy: "Amanda Brooks",
    timestamp: "Yesterday at 10:45 AM",
  },
  {
    id: 6,
    action: "rejected",
    type: "contract",
    reference: "CON-2026-0082",
    subject: "Office Supplies Procurement",
    performedBy: "Admin User",
    timestamp: "Mar 3, 2026 at 3:30 PM",
  },
  {
    id: 7,
    action: "approved",
    type: "correspondence",
    reference: "COR-2026-0155",
    subject: "Annual Leave Request - Department",
    performedBy: "Registry Manager",
    timestamp: "Mar 3, 2026 at 11:00 AM",
  },
  {
    id: 8,
    action: "submitted",
    type: "contract",
    reference: "CON-2026-0088",
    subject: "School Renovation Project Phase 2",
    performedBy: "Michael Davis",
    timestamp: "Mar 2, 2026 at 2:15 PM",
  },
]

export default function ActivityMonitorPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Monitor</h1>
          <p className="text-muted-foreground mt-1">Track pending actions and recent system activity</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Pending Actions
                </CardTitle>
                <CardDescription>Items awaiting review or approval</CardDescription>
              </div>
              <Badge variant="secondary" className="text-amber-700 bg-amber-100">
                {pendingActions.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    item.type === "correspondence" ? "bg-blue-50" : "bg-emerald-50"
                  }`}>
                    {item.type === "correspondence" ? (
                      <FileText className="h-5 w-5 text-blue-600" />
                    ) : (
                      <FileSignature className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-primary">{item.reference}</span>
                      <Badge variant="outline" className={`text-xs ${
                        item.priority === "high" 
                          ? "border-red-300 bg-red-50 text-red-700"
                          : item.priority === "medium"
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-slate-300 bg-slate-50 text-slate-700"
                      }`}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="font-medium truncate">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">{item.mda}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.submittedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.daysAgo} {item.daysAgo === 1 ? "day" : "days"} ago
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0">
                    Review
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions performed in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${
                    activity.action === "approved" 
                      ? "bg-green-100"
                      : activity.action === "rejected"
                      ? "bg-red-100"
                      : activity.action === "submitted"
                      ? "bg-blue-100"
                      : "bg-amber-100"
                  }`}>
                    {activity.action === "approved" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {activity.action === "rejected" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {activity.action === "submitted" && (
                      activity.type === "correspondence" 
                        ? <FileText className="h-4 w-4 text-blue-600" />
                        : <FileSignature className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.action === "reviewed" && <Clock className="h-4 w-4 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs capitalize ${
                        activity.action === "approved" 
                          ? "border-green-300 bg-green-50 text-green-700"
                          : activity.action === "rejected"
                          ? "border-red-300 bg-red-50 text-red-700"
                          : activity.action === "submitted"
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-amber-300 bg-amber-50 text-amber-700"
                      }`}>
                        {activity.action}
                      </Badge>
                      <span className="font-mono text-xs text-primary">{activity.reference}</span>
                    </div>
                    <p className="text-sm font-medium truncate mt-1">{activity.subject}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>by {activity.performedBy}</span>
                      <span>•</span>
                      <span>{activity.timestamp}</span>
                    </div>
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
