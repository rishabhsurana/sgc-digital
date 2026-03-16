"use client"

import React from "react"
import Link from "next/link"
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  BarChart3,
  AlertCircle,
  Newspaper,
  FileText
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data for dashboard
const stats = [
  { 
    title: "Total Active Cases", 
    value: "56", 
    change: "+8 this week",
    trend: "up",
    icon: Mail,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  { 
    title: "Pending My Action", 
    value: "15", 
    change: "5 urgent",
    trend: "neutral",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  { 
    title: "Completed This Month", 
    value: "34", 
    change: "+22% vs last month",
    trend: "up",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  { 
    title: "Overdue/At Risk", 
    value: "4", 
    change: "2 critical",
    trend: "down",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
]

const dailyMailItems = [
  {
    id: "COR-2026-00156",
    subject: "Legal Opinion Request - Land Acquisition",
    type: "Advisory",
    urgency: "urgent",
    sender: "Ministry of Housing",
    receivedDate: "Mar 16, 2026 9:30 AM"
  },
  {
    id: "COR-2026-00155",
    subject: "Litigation Matter - Crown vs. Thompson",
    type: "Litigation",
    urgency: "normal",
    sender: "Office of the DPP",
    receivedDate: "Mar 16, 2026 9:15 AM"
  },
  {
    id: "COR-2026-00154",
    subject: "Compensation Claim Review",
    type: "Compensation",
    urgency: "normal",
    sender: "Ministry of Finance",
    receivedDate: "Mar 16, 2026 8:45 AM"
  },
]

const recentCases = [
  {
    id: "COR-2026-00150",
    subject: "International Treaty Review - CARICOM",
    status: "assigned",
    statusLabel: "Assigned",
    type: "International Law",
    urgency: "high",
    dueDate: "Mar 20, 2026",
    organization: "Ministry of Foreign Affairs"
  },
  {
    id: "COR-2026-00149",
    subject: "Public Trustee Matter - Estate of Williams",
    status: "in_progress",
    statusLabel: "In Progress",
    type: "Public Trustee",
    urgency: "normal",
    dueDate: "Mar 25, 2026",
    organization: "Public Trustee Office"
  },
  {
    id: "COR-2026-00148",
    subject: "Cabinet Submission - Legislation Review",
    status: "pending_approval",
    statusLabel: "Pending Approval",
    type: "Cabinet",
    urgency: "urgent",
    dueDate: "Mar 18, 2026",
    organization: "Cabinet Office"
  },
]

const workflowStages = [
  { name: "Intake", count: 8, color: "bg-blue-500" },
  { name: "Review", count: 15, color: "bg-purple-500" },
  { name: "Processing", count: 22, color: "bg-amber-500" },
  { name: "Approval", count: 5, color: "bg-indigo-500" },
  { name: "Dispatch", count: 4, color: "bg-green-500" },
]

const typeDistribution = [
  { name: "General", count: 18, percentage: 32 },
  { name: "Litigation", count: 12, percentage: 21 },
  { name: "Advisory", count: 15, percentage: 27 },
  { name: "Compensation", count: 8, percentage: 14 },
  { name: "Other", count: 3, percentage: 6 },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    pending_review: "bg-purple-100 text-purple-800",
    assigned: "bg-indigo-100 text-indigo-800",
    in_progress: "bg-amber-100 text-amber-800",
    pending_approval: "bg-pink-100 text-pink-800",
    ready_dispatch: "bg-teal-100 text-teal-800",
    closed: "bg-green-100 text-green-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

const getUrgencyBadge = (urgency: string) => {
  if (urgency === "urgent") {
    return <Badge className="bg-red-500 text-white">Urgent</Badge>
  }
  if (urgency === "high") {
    return <Badge className="bg-amber-500 text-white">High</Badge>
  }
  return null
}

export default function CorrespondenceDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-800 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Correspondence Dashboard</h1>
              <p className="mt-1 text-white/80">Overview of correspondence processing and case management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white" asChild>
              <Link href="/case-management/correspondence/daily-mail">
                <Newspaper className="mr-2 h-4 w-4" />
                Daily Mail
              </Link>
            </Button>
            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daily Mail Preview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-emerald-600" />
                Today's Daily Mail
              </CardTitle>
              <CardDescription>New correspondence awaiting SG/DSG review</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/case-management/correspondence/daily-mail">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyMailItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.urgency === 'urgent' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                      <Mail className={`h-5 w-5 ${item.urgency === 'urgent' ? 'text-red-600' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                        {item.urgency === "urgent" && (
                          <Badge className="bg-red-500 text-white text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="font-medium line-clamp-1">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">{item.sender} • {item.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{item.receivedDate}</p>
                    <Button variant="ghost" size="sm" className="mt-1">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              By Type
            </CardTitle>
            <CardDescription>Active cases by correspondence type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeDistribution.map((type) => (
                <div key={type.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{type.name}</span>
                    <span className="text-sm text-muted-foreground">{type.count}</span>
                  </div>
                  <Progress value={type.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Workflow Pipeline
          </CardTitle>
          <CardDescription>Cases distributed across workflow stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {workflowStages.map((stage, index) => (
              <div key={stage.name} className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full ${stage.color} flex items-center justify-center text-white text-xl font-bold mb-2`}>
                  {stage.count}
                </div>
                <p className="text-sm font-medium">{stage.name}</p>
                {index < workflowStages.length - 1 && (
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Your most recent correspondence cases</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/case-management/correspondence/cases">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCases.map((case_) => (
              <div 
                key={case_.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{case_.id}</span>
                      {getUrgencyBadge(case_.urgency)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{case_.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{case_.type}</Badge>
                      <span className="text-xs text-muted-foreground">{case_.organization}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <Badge className={getStatusColor(case_.status)}>{case_.statusLabel}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Due: {case_.dueDate}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/case-management/correspondence/cases/${case_.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
