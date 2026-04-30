"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  fetchManagementMdas,
  fetchReportsStatusOverview,
  fetchReportsSummary,
  type ManagementMdaItem,
  type ReportsStatusOverviewPayload,
  type ReportsSummaryStats,
} from "@/lib/dashboard-api"
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

type Trend = "up" | "down"
type StatusItem = { status: string; count: number; percentage: number; color: string }

const CORR_STATUS_COLOR: Record<string, string> = {
  NEW: "bg-blue-500",
  PENDING_REVIEW: "bg-amber-500",
  ASSIGNED: "bg-purple-500",
  PENDING_EXTERNAL: "bg-orange-500",
  ON_HOLD: "bg-slate-500",
  CLOSED: "bg-green-500",
  CANCELLED: "bg-red-500",
  // Legacy fallback
  RETURNED_CORR: "bg-orange-500",
}

const CORR_STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  PENDING_REVIEW: "Pending SG/DSG Review",
  ASSIGNED: "Assigned / In Progress",
  PENDING_EXTERNAL: "Pending External",
  RETURNED_CORR: "Returned for Correction",
  ON_HOLD: "On Hold",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
}

const CONTRACT_STATUS_COLOR: Record<string, string> = {
  INTAKE: "bg-blue-500",
  ASSIGNED: "bg-purple-500",
  DRAFTING: "bg-indigo-500",
  SUP_REVIEW: "bg-violet-500",
  RETURNED_CORR: "bg-orange-500",
  SENT_MDA: "bg-amber-500",
  RETURNED_MDA: "bg-teal-500",
  FINAL_SIG: "bg-cyan-500",
  EXEC_ADJ: "bg-pink-500",
  ADJ_COMP: "bg-emerald-500",
  REJECTED: "bg-red-500",
  CLOSED: "bg-green-500",
}

const CONTRACT_STATUS_LABEL: Record<string, string> = {
  INTAKE: "New / Intake",
  ASSIGNED: "Assigned to Officer",
  DRAFTING: "Drafting",
  SUP_REVIEW: "With DSG/Supervisor Review",
  RETURNED_CORR: "Returned for Correction",
  SENT_MDA: "Sent to Ministry",
  RETURNED_MDA: "Returned from Ministry",
  FINAL_SIG: "Finalization / Signature",
  EXEC_ADJ: "Execution / Adjudication",
  ADJ_COMP: "Adjudicated/Completed",
  REJECTED: "Rejected",
  CLOSED: "Closed",
}

const LEGACY_STATUS_MAP: Record<string, string> = {
  // correspondence legacy
  SUBMITTED: "NEW",
  PENDING: "NEW",
  UNDER_REVIEW: "PENDING_REVIEW",
  RETURNED_FOR_CLARIFICATION: "PENDING_REVIEW",
  APPROVED: "CLOSED",
  COMPLETED: "CLOSED",
  REJECTED: "CANCELLED",
  // contracts legacy
  RESUBMITTED: "INTAKE",
  CLARIFICATION_SUBMITTED: "INTAKE",
}

function formatMetric(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—"
  return value.toLocaleString()
}

function formatChange(change?: number): { label: string; trend?: Trend } {
  if (typeof change !== "number" || Number.isNaN(change)) {
    return { label: "—" }
  }
  const trend: Trend = change >= 0 ? "up" : "down"
  const sign = change > 0 ? "+" : ""
  return { label: `${sign}${change}%`, trend }
}

function normalizeStatus(status: string): string {
  const raw = String(status || "").trim()
  if (!raw) return ""
  const normalized = raw.toUpperCase().replace(/[\s-]+/g, "_")
  return LEGACY_STATUS_MAP[normalized] ?? normalized
}

function buildStatusItems(
  rows: Array<{ status: string; count: string | number }>,
  labelMap: Record<string, string>,
  colorMap: Record<string, string>,
): StatusItem[] {
  const grouped = new Map<string, number>()
  for (const row of rows) {
    const key = normalizeStatus(String(row.status || ""))
    const count = Number(row.count || 0)
    grouped.set(key, (grouped.get(key) || 0) + (Number.isFinite(count) ? count : 0))
  }

  const total = [...grouped.values()].reduce((sum, count) => sum + count, 0)
  const entries = [...grouped.entries()].sort(([, a], [, b]) => b - a)

  return entries.map(([status, count]) => ({
    status: labelMap[status] || status.replace(/_/g, " "),
    count,
    percentage: total ? Math.round((count / total) * 100) : 0,
    color: colorMap[status] || "bg-slate-500",
  }))
}

export default function StatusOverviewPage() {
  const [summary, setSummary] = useState<ReportsSummaryStats | null>(null)
  const [statusOverview, setStatusOverview] = useState<ReportsStatusOverviewPayload | null>(null)
  const [mdaItems, setMdaItems] = useState<ManagementMdaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [summaryRes, statusRes, mdaRes] = await Promise.all([
          fetchReportsSummary({ dateRange: "all-time" }),
          fetchReportsStatusOverview({ dateRange: "all-time" }),
          fetchManagementMdas({ page: 1, limit: 100, status: "active" }),
        ])
        if (!active) return
        setSummary(summaryRes.data || null)
        setStatusOverview(statusRes.data || null)
        setMdaItems(mdaRes.data || [])
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Failed to load status overview.")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const pendingChange = formatChange(summary?.pendingChange)
    // Backend follow-up for full parity:
    // reports/summary should expose overdueItems, activeUsers(windowed), and completed/approved count metrics.
    return [
      {
        title: "Total Correspondence",
        value: formatMetric(summary?.totalCorrespondences),
        change: "—",
        trend: undefined,
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Contracts",
        value: formatMetric(summary?.totalContracts),
        change: "—",
        trend: undefined,
        icon: FileSignature,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        title: "Pending Review",
        value: formatMetric(summary?.pendingReview),
        change: pendingChange.label,
        trend: pendingChange.trend,
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      },
      {
        title: "Completed This Month",
        value: "—",
        change: "—",
        trend: undefined,
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Overdue Items",
        value: "—",
        change: "—",
        trend: undefined,
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      {
        title: "Active Users",
        value: "—",
        change: "—",
        trend: undefined,
        icon: Users,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
    ]
  }, [summary])

  const statusBreakdown = useMemo(
    () => ({
      correspondence: buildStatusItems(statusOverview?.correspondence || [], CORR_STATUS_LABEL, CORR_STATUS_COLOR),
      contracts: buildStatusItems(statusOverview?.contracts || [], CONTRACT_STATUS_LABEL, CONTRACT_STATUS_COLOR),
    }),
    [statusOverview]
  )

  const mdaStats = useMemo(
    () =>
      [...mdaItems]
        .sort(
          (a, b) =>
            b.correspondenceCount +
            b.contractsCount -
            (a.correspondenceCount + a.contractsCount)
        )
        .slice(0, 5)
        .map((mda) => ({
          name: mda.name,
          correspondence: mda.correspondenceCount,
          contracts: mda.contractsCount,
        })),
    [mdaItems]
  )

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-slate-800 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Status Overview</h1>
            <p className="mt-1 text-white/80">System statistics and performance metrics</p>
          </div>
        </div>
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
                {stat.trend ? (
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
                ) : (
                  <div className="text-xs font-medium text-muted-foreground">{stat.change}</div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
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
            {!loading && statusBreakdown.correspondence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No correspondence status data.</p>
            ) : null}
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
            {!loading && statusBreakdown.contracts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contract status data.</p>
            ) : null}
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
            {!loading && mdaStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No MDA volume data.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
