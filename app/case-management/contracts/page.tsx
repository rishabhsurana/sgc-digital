"use client"

import React from "react"
import Link from "next/link"
import { 
  FileSignature, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  BarChart3,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data for dashboard
const stats = [
  { 
    title: "Total Active Cases", 
    value: "47", 
    change: "+5 this week",
    trend: "up",
    icon: FileSignature,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  { 
    title: "Pending My Action", 
    value: "12", 
    change: "3 urgent",
    trend: "neutral",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  { 
    title: "Completed This Month", 
    value: "23", 
    change: "+15% vs last month",
    trend: "up",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  { 
    title: "Overdue/At Risk", 
    value: "3", 
    change: "2 critical",
    trend: "down",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
]

const recentCases = [
  {
    id: "CON-2026-00089",
    title: "IT Services Agreement - Ministry of Finance",
    status: "drafting",
    statusLabel: "Drafting",
    priority: "high",
    dueDate: "Mar 20, 2026",
    organization: "Ministry of Finance",
    value: "$450,000"
  },
  {
    id: "CON-2026-00088",
    title: "Road Maintenance Contract - Ministry of Transport",
    status: "sent_mda",
    statusLabel: "With Ministry",
    priority: "normal",
    dueDate: "Mar 25, 2026",
    organization: "Ministry of Transport",
    value: "$2,100,000"
  },
  {
    id: "CON-2026-00087",
    title: "Medical Supplies - Queen Elizabeth Hospital",
    status: "sup_review",
    statusLabel: "Supervisor Review",
    priority: "urgent",
    dueDate: "Mar 18, 2026",
    organization: "Ministry of Health",
    value: "$890,000"
  },
  {
    id: "CON-2026-00086",
    title: "Consultancy Services - Tourism Authority",
    status: "final_sig",
    statusLabel: "Final Signature",
    priority: "normal",
    dueDate: "Mar 22, 2026",
    organization: "Barbados Tourism Authority",
    value: "$125,000"
  },
]

const workflowStages = [
  { name: "Intake", count: 5, color: "bg-blue-500" },
  { name: "Assign", count: 3, color: "bg-purple-500" },
  { name: "Drafting", count: 12, color: "bg-amber-500" },
  { name: "Min Review", count: 8, color: "bg-cyan-500" },
  { name: "Signature", count: 4, color: "bg-indigo-500" },
  { name: "Adjudication", count: 2, color: "bg-orange-500" },
  { name: "Dispatch", count: 4, color: "bg-green-500" },
]

const slaMetrics = [
  { name: "On Track", percentage: 72, color: "bg-green-500" },
  { name: "At Risk", percentage: 18, color: "bg-amber-500" },
  { name: "Overdue", percentage: 10, color: "bg-red-500" },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    intake: "bg-blue-100 text-blue-800",
    assigned: "bg-purple-100 text-purple-800",
    drafting: "bg-amber-100 text-amber-800",
    sup_review: "bg-indigo-100 text-indigo-800",
    sent_mda: "bg-cyan-100 text-cyan-800",
    final_sig: "bg-pink-100 text-pink-800",
    exec_adj: "bg-orange-100 text-orange-800",
    closed: "bg-green-100 text-green-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

const getPriorityBadge = (priority: string) => {
  if (priority === "urgent") {
    return <Badge className="bg-red-500 text-white">Urgent</Badge>
  }
  if (priority === "high") {
    return <Badge className="bg-amber-500 text-white">High</Badge>
  }
  return null
}

export default function ContractsDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-slate-800 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <FileSignature className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Contracts Dashboard</h1>
              <p className="mt-1 text-white/80">Overview of contract processing and case management</p>
            </div>
          </div>
          <div className="flex gap-2">
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
        {/* Workflow Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Workflow Pipeline
            </CardTitle>
            <CardDescription>Cases distributed across workflow stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowStages.map((stage) => (
                <div key={stage.name} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{stage.name}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div 
                        className={`h-full ${stage.color} flex items-center justify-end pr-2`}
                        style={{ width: `${(stage.count / 47) * 100}%`, minWidth: stage.count > 0 ? '40px' : '0' }}
                      >
                        <span className="text-xs font-medium text-white">{stage.count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SLA Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              SLA Performance
            </CardTitle>
            <CardDescription>Current case compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {slaMetrics.map((metric) => (
                <div key={metric.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-sm font-bold">{metric.percentage}%</span>
                  </div>
                  <Progress value={metric.percentage} className={metric.color} />
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>3 cases require immediate attention</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Your most recent contract cases</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/case-management/contracts/cases">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <FileSignature className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{case_.id}</span>
                      {getPriorityBadge(case_.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{case_.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{case_.organization}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs font-medium text-green-600">{case_.value}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <Badge className={getStatusColor(case_.status)}>{case_.statusLabel}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Due: {case_.dueDate}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/case-management/contracts/cases/${case_.id}`}>
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
