"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  FileSignature,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
} from "lucide-react"

const stats = [
  {
    title: "Total Correspondence",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Total Contracts",
    value: "856",
    change: "+8%",
    trend: "up",
    icon: FileSignature,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Pending Review",
    value: "43",
    change: "-5%",
    trend: "down",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Approved This Month",
    value: "189",
    change: "+23%",
    trend: "up",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Overdue Items",
    value: "7",
    change: "-2",
    trend: "down",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Active Users",
    value: "34",
    change: "+3",
    trend: "up",
    icon: Users,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
]

const statusBreakdown = {
  correspondence: [
    { status: "Approved", count: 876, percentage: 70, color: "bg-green-500" },
    { status: "Pending", count: 248, percentage: 20, color: "bg-amber-500" },
    { status: "Under Review", count: 99, percentage: 8, color: "bg-blue-500" },
    { status: "Rejected", count: 24, percentage: 2, color: "bg-red-500" },
  ],
  contracts: [
    { status: "Approved", count: 612, percentage: 72, color: "bg-green-500" },
    { status: "Pending", count: 145, percentage: 17, color: "bg-amber-500" },
    { status: "Under Review", count: 77, percentage: 9, color: "bg-blue-500" },
    { status: "Rejected", count: 22, percentage: 2, color: "bg-red-500" },
  ],
}

const mdaStats = [
  { name: "Ministry of Finance", correspondence: 156, contracts: 89 },
  { name: "Ministry of Health", correspondence: 134, contracts: 67 },
  { name: "Ministry of Education", correspondence: 121, contracts: 54 },
  { name: "Ministry of Works", correspondence: 98, contracts: 112 },
  { name: "Ministry of Tourism", correspondence: 87, contracts: 45 },
]

export default function StatusOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Status Overview</h1>
        <p className="text-muted-foreground mt-1">System statistics and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Correspondence Status
            </CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusBreakdown.correspondence.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.status}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className={`h-2 ${item.color}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-emerald-600" />
              Contracts Status
            </CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusBreakdown.contracts.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.status}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className={`h-2 ${item.color}`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* MDA Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            Top MDAs by Volume
          </CardTitle>
          <CardDescription>Ministries with highest submission counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mdaStats.map((mda, index) => (
              <div key={mda.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{mda.name}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{mda.correspondence} correspondence</span>
                    <span>{mda.contracts} contracts</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{mda.correspondence + mda.contracts}</p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
