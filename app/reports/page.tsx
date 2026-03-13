"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  FileText,
  FileSignature,
  Calendar,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Users,
  DollarSign,
  Activity
} from "lucide-react"
import { AskRex } from "@/components/ask-rex"

// Sample data for demonstration
const SUMMARY_STATS = {
  totalSubmissions: 1247,
  submissionsChange: 12.5,
  pendingReview: 89,
  pendingChange: -8.2,
  avgProcessingDays: 4.2,
  processingChange: -15.3,
  completionRate: 94.2,
  completionChange: 2.1
}

const CORRESPONDENCE_BY_TYPE = [
  { type: "General", count: 342, percentage: 32, color: "bg-blue-500" },
  { type: "Litigation", count: 287, percentage: 27, color: "bg-purple-500" },
  { type: "Advisory", count: 198, percentage: 18, color: "bg-green-500" },
  { type: "Compensation", count: 124, percentage: 11, color: "bg-orange-500" },
  { type: "Cabinet/Confidential", count: 89, percentage: 8, color: "bg-red-500" },
  { type: "Other", count: 42, percentage: 4, color: "bg-gray-500" }
]

const CONTRACTS_BY_NATURE = [
  { type: "Goods", count: 156, value: 45200000, color: "bg-blue-500" },
  { type: "Consultancy/Services", count: 234, value: 89500000, color: "bg-purple-500" },
  { type: "Works", count: 78, value: 234800000, color: "bg-orange-500" }
]

const TOP_MINISTRIES = [
  { name: "Ministry of Health", submissions: 187, percentage: 82 },
  { name: "Ministry of Education", submissions: 156, percentage: 68 },
  { name: "Ministry of Works", submissions: 143, percentage: 62 },
  { name: "Ministry of Finance", submissions: 121, percentage: 53 },
  { name: "Ministry of Agriculture", submissions: 98, percentage: 43 }
]

const MONTHLY_TRENDS = [
  { month: "Jul", correspondence: 145, contracts: 42 },
  { month: "Aug", correspondence: 162, contracts: 51 },
  { month: "Sep", correspondence: 178, contracts: 48 },
  { month: "Oct", correspondence: 195, contracts: 56 },
  { month: "Nov", correspondence: 189, contracts: 63 },
  { month: "Dec", correspondence: 167, contracts: 45 },
  { month: "Jan", correspondence: 201, contracts: 58 },
  { month: "Feb", correspondence: 210, contracts: 65 }
]

const maxMonthlyValue = Math.max(...MONTHLY_TRENDS.flatMap(m => [m.correspondence, m.contracts]))

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-30")
  const [ministry, setMinistry] = useState("all")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AskRex position="content" />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  Reports & Analytics
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Comprehensive insights into SGC Digital submissions and processing metrics.
                </p>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  Filters:
                </div>
                <div className="flex flex-wrap gap-4 flex-1">
                  <div className="space-y-1 min-w-[180px]">
                    <Label htmlFor="dateRange" className="text-xs">Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger id="dateRange" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-7">Last 7 Days</SelectItem>
                        <SelectItem value="last-30">Last 30 Days</SelectItem>
                        <SelectItem value="last-90">Last 90 Days</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                        <SelectItem value="all-time">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 min-w-[200px]">
                    <Label htmlFor="ministry" className="text-xs">Ministry/MDA</Label>
                    <Select value={ministry} onValueChange={setMinistry}>
                      <SelectTrigger id="ministry" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ministries</SelectItem>
                        <SelectItem value="MOH">Ministry of Health</SelectItem>
                        <SelectItem value="MOE">Ministry of Education</SelectItem>
                        <SelectItem value="MOF">Ministry of Finance</SelectItem>
                        <SelectItem value="MWUI">Ministry of Works</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-xs">From</Label>
                    <Input type="date" id="startDate" className="h-9 w-[140px]" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-xs">To</Label>
                    <Input type="date" id="endDate" className="h-9 w-[140px]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Submissions</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{SUMMARY_STATS.totalSubmissions.toLocaleString()}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">+{SUMMARY_STATS.submissionsChange}%</span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Pending Review</p>
                    <p className="text-3xl font-bold text-amber-900 mt-1">{SUMMARY_STATS.pendingReview}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{SUMMARY_STATS.pendingChange}%</span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Avg. Processing Time</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{SUMMARY_STATS.avgProcessingDays} <span className="text-lg font-normal">days</span></p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{SUMMARY_STATS.processingChange}%</span>
                  <span className="text-muted-foreground">faster</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Completion Rate</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">{SUMMARY_STATS.completionRate}%</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">+{SUMMARY_STATS.completionChange}%</span>
                  <span className="text-muted-foreground">improvement</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Different Report Views */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                <PieChart className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="correspondence" className="data-[state=active]:bg-background">
                <FileText className="h-4 w-4 mr-2" />
                Correspondence
              </TabsTrigger>
              <TabsTrigger value="contracts" className="data-[state=active]:bg-background">
                <FileSignature className="h-4 w-4 mr-2" />
                Contracts
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-background">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Monthly Trends Chart */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Monthly Submission Trends
                    </CardTitle>
                    <CardDescription>Correspondence vs Contracts over 8 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Simple Bar Chart */}
                      <div className="flex items-end justify-between h-48 gap-2">
                        {MONTHLY_TRENDS.map((month) => (
                          <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex gap-1 items-end h-40">
                              <div 
                                className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                                style={{ height: `${(month.correspondence / maxMonthlyValue) * 100}%` }}
                                title={`Correspondence: ${month.correspondence}`}
                              />
                              <div 
                                className="flex-1 bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                                style={{ height: `${(month.contracts / maxMonthlyValue) * 100}%` }}
                                title={`Contracts: ${month.contracts}`}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{month.month}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-6 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-blue-500" />
                          <span className="text-sm text-muted-foreground">Correspondence</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded bg-purple-500" />
                          <span className="text-sm text-muted-foreground">Contracts</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Ministries */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Top Submitting Ministries
                    </CardTitle>
                    <CardDescription>By number of submissions this period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {TOP_MINISTRIES.map((ministry, index) => (
                        <div key={ministry.name} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {index + 1}
                              </span>
                              <span className="font-medium text-foreground">{ministry.name}</span>
                            </div>
                            <span className="text-muted-foreground">{ministry.submissions}</span>
                          </div>
                          <Progress value={ministry.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Correspondence Tab */}
            <TabsContent value="correspondence" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Correspondence by Type
                    </CardTitle>
                    <CardDescription>Distribution of correspondence categories</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {CORRESPONDENCE_BY_TYPE.map((item) => (
                        <div key={item.type} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded ${item.color}`} />
                              <span className="font-medium text-foreground">{item.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{item.count}</Badge>
                              <span className="text-muted-foreground text-xs w-10 text-right">{item.percentage}%</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full transition-all`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Processing Status
                    </CardTitle>
                    <CardDescription>Current correspondence status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 p-4 text-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-900">847</p>
                        <p className="text-sm text-green-700">Completed</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 text-center">
                        <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-amber-900">156</p>
                        <p className="text-sm text-amber-700">In Progress</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">62</p>
                        <p className="text-sm text-blue-700">Pending Review</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-900">17</p>
                        <p className="text-sm text-red-700">Requires Action</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <FileSignature className="h-5 w-5 text-purple-600" />
                      Contracts by Nature
                    </CardTitle>
                    <CardDescription>Volume and value by contract type</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {CONTRACTS_BY_NATURE.map((item) => (
                        <div key={item.type} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-4 w-4 rounded ${item.color}`} />
                              <span className="font-semibold text-foreground">{item.type}</span>
                            </div>
                            <Badge variant="outline">{item.count} contracts</Badge>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Total Value</span>
                              <span className="font-bold text-foreground">
                                BBD ${(item.value / 1000000).toFixed(1)}M
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Avg. Contract</span>
                              <span>BBD ${((item.value / item.count) / 1000).toFixed(0)}K</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      Contract Value Summary
                    </CardTitle>
                    <CardDescription>Financial overview of contracts processed</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 border border-primary/20 p-6 mb-6">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Contract Value</p>
                      <p className="text-4xl font-bold text-primary">BBD $369.5M</p>
                      <p className="text-sm text-muted-foreground mt-2">468 contracts processed</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-foreground">$789K</p>
                        <p className="text-xs text-muted-foreground">Average Value</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-foreground">$45.2M</p>
                        <p className="text-xs text-muted-foreground">Largest Contract</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Year-over-Year Comparison
                    </CardTitle>
                    <CardDescription>Submission volume comparison with previous year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4">
                          <p className="text-sm font-medium text-green-700">Current Year</p>
                          <p className="text-3xl font-bold text-green-900 mt-1">1,247</p>
                          <p className="text-xs text-green-600 mt-1">submissions YTD</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 border p-4">
                          <p className="text-sm font-medium text-muted-foreground">Previous Year</p>
                          <p className="text-3xl font-bold text-foreground mt-1">1,108</p>
                          <p className="text-xs text-muted-foreground mt-1">same period</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                        <ArrowUpRight className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">12.5% Growth</p>
                          <p className="text-sm text-green-700">139 more submissions than same period last year</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      User Activity
                    </CardTitle>
                    <CardDescription>Portal engagement metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Active Users</span>
                          <span className="font-semibold">324</span>
                        </div>
                        <Progress value={81} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">New Registrations</span>
                          <span className="font-semibold">47</span>
                        </div>
                        <Progress value={47} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Return Users</span>
                          <span className="font-semibold">89%</span>
                        </div>
                        <Progress value={89} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Mobile Usage</span>
                          <span className="font-semibold">34%</span>
                        </div>
                        <Progress value={34} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
