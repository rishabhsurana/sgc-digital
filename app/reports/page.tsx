"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  Activity,
} from "lucide-react"
import { AskRex } from "@/components/ask-rex"
import { apiDownloadFile } from "@/lib/api-client"
import {
  fetchReportsContractsByNature,
  fetchReportsCorrespondenceByType,
  fetchReportsMonthlyTrends,
  fetchReportsStatusOverview,
  fetchReportsSummary,
  type ReportsContractsNaturePayload,
  type ReportsCorrespondenceType,
  type ReportsMonthlyTrend,
  type ReportsStatusOverviewPayload,
  type ReportsSummaryStats,
} from "@/lib/dashboard-api"

const COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-cyan-500",
  "bg-gray-500",
]

const EMPTY_SUMMARY: ReportsSummaryStats = {
  totalSubmissions: 0,
  submissionsChange: 0,
  pendingReview: 0,
  pendingChange: 0,
  avgProcessingDays: 0,
  processingChange: 0,
  completionRate: 0,
  completionChange: 0,
  totalCorrespondences: 0,
  totalContracts: 0,
}

const EMPTY_CONTRACTS: ReportsContractsNaturePayload = {
  rows: [],
  totalValue: 0,
  totalCount: 0,
  averageValue: 0,
  largestValue: 0,
}

const EMPTY_STATUS: ReportsStatusOverviewPayload = {
  correspondence: [],
  contracts: [],
  summary: {
    pending: 0,
    inProgress: 0,
    completed: 0,
    requiresAction: 0,
    approved: 0,
    rejected: 0,
  },
}

const REFRESH_INTERVAL_MS = 60_000

function formatCurrency(n: number): string {
  return `BBD $${n.toLocaleString("en-BB", { maximumFractionDigits: 2 })}`
}

function formatChange(v: number): string {
  const rounded = Number(v.toFixed(1))
  return `${rounded > 0 ? "+" : ""}${rounded}%`
}

function errorToText(value: unknown): string {
  if (typeof value === "string") return value
  if (value instanceof Error) return value.message
  if (value && typeof value === "object") {
    const maybeMessage = (value as { message?: unknown }).message
    if (typeof maybeMessage === "string") return maybeMessage
    try {
      return JSON.stringify(value)
    } catch {
      return "Request failed."
    }
  }
  return "Request failed."
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<
    "last-7" | "last-30" | "last-90" | "last-year" | "all-time"
  >("last-30")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [summary, setSummary] = useState<ReportsSummaryStats>(EMPTY_SUMMARY)
  const [corrByType, setCorrByType] = useState<ReportsCorrespondenceType[]>([])
  const [contractsByNature, setContractsByNature] = useState<ReportsContractsNaturePayload>(EMPTY_CONTRACTS)
  const [statusOverview, setStatusOverview] = useState<ReportsStatusOverviewPayload>(EMPTY_STATUS)
  const [monthlyTrends, setMonthlyTrends] = useState<ReportsMonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      dateRange,
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    [dateRange, fromDate, toDate]
  )

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [summaryRes, corrTypeRes, contractsNatureRes, statusRes, trendsRes] = await Promise.all([
      fetchReportsSummary(filters),
      fetchReportsCorrespondenceByType(filters),
      fetchReportsContractsByNature(filters),
      fetchReportsStatusOverview(filters),
      fetchReportsMonthlyTrends(filters),
    ])

    const failed = [summaryRes, corrTypeRes, contractsNatureRes, statusRes, trendsRes].find((r) => !r.success)
    if (failed) {
      setError(errorToText(failed.error || failed.message || "Failed to load reports."))
    }

    if (summaryRes.success && summaryRes.data) setSummary({ ...EMPTY_SUMMARY, ...summaryRes.data })
    if (corrTypeRes.success && corrTypeRes.data) setCorrByType(corrTypeRes.data)
    if (contractsNatureRes.success && contractsNatureRes.data) setContractsByNature(contractsNatureRes.data)
    if (statusRes.success && statusRes.data) setStatusOverview(statusRes.data)
    if (trendsRes.success && trendsRes.data) setMonthlyTrends(trendsRes.data)
    setLoading(false)
  }, [filters])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  useEffect(() => {
    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return
      void loadAll()
    }
    const id = window.setInterval(tick, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [loadAll])

  const maxMonthlyValue = Math.max(1, ...monthlyTrends.flatMap((m) => [m.correspondence, m.contracts]))

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const q = new URLSearchParams()
      q.set("date_range", dateRange)
      if (fromDate) q.set("from", fromDate)
      if (toDate) q.set("to", toDate)
      await apiDownloadFile(
        `/api/reports/export?${q.toString()}`,
        `reports-${new Date().toISOString().slice(0, 10)}.xlsx`
      )
    } catch (err) {
      setError(errorToText(err))
    } finally {
      setExporting(false)
    }
  }, [dateRange, fromDate, toDate])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AskRex />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 lg:px-8">
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
                  Insights for your organization’s submissions and processing metrics (updates automatically every
                  minute and when filters change).
                </p>
              </div>
              <Button
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
                onClick={() => void handleExport()}
                disabled={exporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? "Exporting..." : "Export Report"}
              </Button>
            </div>
          </div>

          <Card className="mb-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  Filters:
                </div>
                <div className="flex flex-wrap gap-4 flex-1">
                  <div className="space-y-1 min-w-[180px]">
                    <Label htmlFor="dateRange" className="text-xs">
                      Date Range
                    </Label>
                    <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
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
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-xs">
                      From
                    </Label>
                    <Input
                      type="date"
                      id="startDate"
                      className="h-9 w-[140px]"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="endDate" className="text-xs">
                      To
                    </Label>
                    <Input
                      type="date"
                      id="endDate"
                      className="h-9 w-[140px]"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" size="sm" onClick={() => void loadAll()} disabled={loading}>
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
              {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Submissions</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {loading ? "—" : summary.totalSubmissions.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{formatChange(summary.submissionsChange)}</span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Pending Review</p>
                    <p className="text-3xl font-bold text-amber-900 mt-1">
                      {loading ? "—" : summary.pendingReview}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{formatChange(summary.pendingChange)}</span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Avg. Processing Time</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">
                      {loading ? "—" : summary.avgProcessingDays}{" "}
                      <span className="text-lg font-normal">days</span>
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowDownRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{formatChange(summary.processingChange)}</span>
                  <span className="text-muted-foreground">faster</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Completion Rate</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {loading ? "—" : `${summary.completionRate}%`}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600 font-medium">{formatChange(summary.completionChange)}</span>
                  <span className="text-muted-foreground">improvement</span>
                </div>
              </CardContent>
            </Card>
          </div>

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

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Monthly Submission Trends
                  </CardTitle>
                  <CardDescription>Correspondence vs Contracts by month for your organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between h-48 gap-2 overflow-x-auto pb-1">
                      {(monthlyTrends.length
                        ? monthlyTrends
                        : [{ ym: "", month: loading ? "…" : "-", correspondence: 0, contracts: 0 }]
                      ).map((month) => (
                        <div key={`${month.ym}-${month.month}`} className="flex-1 min-w-[2rem] flex flex-col items-center gap-1">
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
            </TabsContent>

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
                      {corrByType.map((item, idx) => (
                        <div key={item.type} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded ${COLORS[idx % COLORS.length]}`} />
                              <span className="font-medium text-foreground">{item.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{item.count}</Badge>
                              <span className="text-muted-foreground text-xs w-10 text-right">{item.percentage}%</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full ${COLORS[idx % COLORS.length]} rounded-full transition-all`}
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
                        <p className="text-2xl font-bold text-green-900">{statusOverview.summary.completed}</p>
                        <p className="text-sm text-green-700">Completed</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 text-center">
                        <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-amber-900">{statusOverview.summary.inProgress}</p>
                        <p className="text-sm text-amber-700">In Progress</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{statusOverview.summary.pending}</p>
                        <p className="text-sm text-blue-700">Pending Review</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-900">{statusOverview.summary.requiresAction}</p>
                        <p className="text-sm text-red-700">Requires Action</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
                      {contractsByNature.rows.map((item, idx) => (
                        <div key={item.type} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-4 w-4 rounded ${COLORS[idx % COLORS.length]}`} />
                              <span className="font-semibold text-foreground">{item.type}</span>
                            </div>
                            <Badge variant="outline">{item.count} contracts</Badge>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Total Value</span>
                              <span className="font-bold text-foreground">{formatCurrency(item.value)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Avg. Contract</span>
                              <span>{formatCurrency(item.avgValue)}</span>
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
                      <p className="text-4xl font-bold text-primary">
                        {formatCurrency(contractsByNature.totalValue)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {contractsByNature.totalCount} contracts processed
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(contractsByNature.averageValue)}
                        </p>
                        <p className="text-xs text-muted-foreground">Average Value</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(contractsByNature.largestValue)}
                        </p>
                        <p className="text-xs text-muted-foreground">Largest Contract</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Period Comparison
                    </CardTitle>
                    <CardDescription>Current filtered period vs the equivalent prior window</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4">
                          <p className="text-sm font-medium text-green-700">Current Period</p>
                          <p className="text-3xl font-bold text-green-900 mt-1">
                            {summary.totalSubmissions.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 mt-1">submissions</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 border p-4">
                          <p className="text-sm font-medium text-muted-foreground">Previous Period</p>
                          <p className="text-3xl font-bold text-foreground mt-1">
                            {Math.max(0, Math.round(summary.totalSubmissions / (1 + summary.submissionsChange / 100)))}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">equivalent window</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                        <ArrowUpRight className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">{formatChange(summary.submissionsChange)} change</p>
                          <p className="text-sm text-green-700">Based on your selected date filters.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Operational Snapshot
                    </CardTitle>
                    <CardDescription>Quick health metrics for your organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="font-semibold">{summary.completionRate}%</span>
                        </div>
                        <Progress value={Math.max(0, Math.min(100, summary.completionRate))} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Pending Share</span>
                          <span className="font-semibold">
                            {summary.totalSubmissions
                              ? ((summary.pendingReview / summary.totalSubmissions) * 100).toFixed(1)
                              : "0.0"}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            summary.totalSubmissions
                              ? Math.min(100, (summary.pendingReview / summary.totalSubmissions) * 100)
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Processing Days</span>
                          <span className="font-semibold">{summary.avgProcessingDays}</span>
                        </div>
                        <Progress
                          value={Math.min(100, Math.max(0, 100 - summary.avgProcessingDays * 10))}
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Needs Action</span>
                          <span className="font-semibold">{statusOverview.summary.requiresAction}</span>
                        </div>
                        <Progress
                          value={
                            summary.totalSubmissions
                              ? Math.min(
                                  100,
                                  (statusOverview.summary.requiresAction / summary.totalSubmissions) * 100
                                )
                              : 0
                          }
                          className="h-2"
                        />
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
