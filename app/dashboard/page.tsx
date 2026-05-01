"use client"

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import {
  Search,
  FileText,
  FileSignature,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  Plus,
  Filter,
  Calendar,
  Building2,
  ArrowRight,
  RefreshCw,
  LogOut,
  LayoutDashboard,
  Pencil,
  Trash2,
} from "lucide-react"
import { AskRex } from "@/components/ask-rex"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { logout } from "@/lib/actions/auth-actions"
import { RequireAuthGuard } from "@/components/require-auth-guard"
import { getUser } from "@/lib/auth"
import {
  deleteDraftByType,
  fetchAllDrafts,
  fetchDashboardSubmissions,
  type DashboardDraft,
  type DashboardSubmissionItem,
} from "@/lib/dashboard-api"
import type { Submission } from "@/lib/dashboard-types"
import { STATUS_CONFIG } from "@/lib/dashboard-types"
import { DashboardSubmissionDetailDialog } from "@/components/dashboard-submission-detail-dialog"
import { ContractRegisterTable } from "@/components/dashboard/contract-register-table"
import { CorrespondenceRegisterTable } from "@/components/dashboard/correspondence-register-table"

function mapApiItemToSubmission(item: DashboardSubmissionItem): Submission {
  return {
    id: item.id,
    transactionNumber: item.transaction_number || "—",
    type: item.type,
    title: item.title,
    submittedDate: item.submitted_date || "—",
    lastUpdated: item.last_updated,
    status: item.ui_status,
    ministry: item.ministry || undefined,
    stage: item.stage,
    history: (item.stage_history || []).map((h) => ({ date: h.date, stage: h.stage })),
    sgcDocuments: undefined,
  }
}

function formatMinistryDisplay(value?: string): string {
  const normalized = (value || "").trim()
  if (!normalized) return ""
  if (!normalized.includes(" ")) return normalized.toUpperCase()
  return normalized
}

// Strips legacy number prefixes like "1: ", "3A: " from stage strings stored in DB
function normalizeContractStage(stage: string): string {
  return stage.replace(/^\d+[A-Za-z]*:\s*/, "")
}

const PROGRESS_STEPS: Record<"correspondence" | "contract", string[]> = {
  correspondence: ["Submitted", "Under Review", "In Progress", "Completed"],
  contract: [
    "Contract Received",       // 0
    "Contract Assigned",       // 1
    "Drafting & Review",       // 2
    // "Reviewed & Approved",  // dynamic — shown via CONTRACT_STAGE_TO_STEP mapping (→ step 3)
    // "Reviewed & Rejected",  // dynamic — shown via isRejected flag
    // "Returned to MDA for Additional Info", // dynamic — shown via isClarification flag
    "Contract Execution",      // 3
    "Adjudicated",             // 4
    "Delivered / Completed",   // 5
  ],
}

const STATUS_TO_STEP: Record<string, number> = {
  pending: 0,
  "in-review": 1,
  clarification: 2,
  approved: 2,
  completed: 3,
  rejected: -1,
}

// Maps contract stage names (clean, no number prefix) to progress step index (0-based, 6 steps)
const CONTRACT_STAGE_TO_STEP: Record<string, number> = {
  "Contract Received": 0,
  "Contract Assigned": 1,
  "Drafting & Review": 2,
  // Dynamic branch stages — map to nearest logical position in the 6-step spine:
  "Reviewed & Approved": 3,              // approved → Contract Execution is next
  "Reviewed & Rejected": -1,             // rejected branch
  "Returned to MDA for Additional Info": 2, // back in Drafting & Review
  "Contract Execution": 3,
  "Adjudicated": 4,
  "Delivered / Completed": 5,
  // Legacy stage labels derived from status (before BPM sends a stage)
  "Submitted": 0,
  "Under review": 2,
  "Returned for clarification": 2,
  "Approved": 3,
  "Completed": 5,
  "Rejected": -1,
  // Status code fallbacks
  "pending": 0,
  "in-review": 2,
  "clarification": 2,
  "approved": 3,
  "completed": 5,
  "rejected": -1,
}

function SubmissionCard({
  submission,
  onRefresh,
}: {
  submission: Submission
  onRefresh: () => void
}) {
  const status = STATUS_CONFIG[submission.status]
  const StatusIcon = status.icon
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogTab, setDialogTab] = React.useState<"details" | "documents" | "respond">("details")

  const openDialog = (tab: "details" | "documents" | "respond") => {
    setDialogTab(tab)
    setDialogOpen(true)
  }

  const handleAfterRespond = () => {
    setDialogOpen(false)
    onRefresh()
  }

  const steps = PROGRESS_STEPS[submission.type]
  // Normalize stage names so old DB records with numbered prefixes ("1: Contract Received")
  // map correctly to the new clean display labels ("Contract Received")
  const stageDateMap = new Map(
    (submission.history || []).map((h) => [normalizeContractStage(h.stage), h.date])
  )
  // Use the last stage history entry as the effective current stage (most up-to-date BPM stage).
  // Fall back to submission.stage (derived from DB status) if no history exists yet.
  const history = submission.history || []
  const rawStage = history.length > 0 ? history[history.length - 1].stage : submission.stage
  const effectiveStage = normalizeContractStage(rawStage)
  const currentStep =
    submission.type === "contract"
      ? (CONTRACT_STAGE_TO_STEP[effectiveStage] ?? CONTRACT_STAGE_TO_STEP[submission.status] ?? 0)
      : (STATUS_TO_STEP[submission.status] ?? 0)
  const isRejected = submission.status === "rejected" ||
    (submission.type === "contract" && effectiveStage === "Reviewed & Rejected")
  const isClarification = submission.status === "clarification" ||
    (submission.type === "contract" && effectiveStage === "Returned to MDA for Additional Info")

  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Row 1: Icon + Transaction number + Status badge + Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
              submission.type === "correspondence" ? "bg-primary/10 text-primary" : "bg-emerald-100 text-emerald-700"
            }`}>
              {submission.type === "correspondence"
                ? <FileText className="h-3.5 w-3.5" />
                : <FileSignature className="h-3.5 w-3.5" />}
            </div>
            <span className="font-mono text-sm font-semibold text-foreground shrink-0">
              {submission.transactionNumber}
            </span>
            <Badge variant="outline" className={`text-xs shrink-0 ${status.color}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isClarification && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => openDialog("respond")}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Respond
              </Button>
            )}
            {submission.status === "completed" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={() => openDialog("documents")}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => openDialog("details")}
            >
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
          </div>
        </div>

        {/* Row 2: Title */}
        <p className="text-sm font-medium text-foreground truncate leading-snug">
          {submission.title}
        </p>

        {/* Row 3: Horizontal progress tracker */}
        <div className="flex items-start pt-1">
          {steps.map((step, i) => {
            const stepCompleted = !isRejected && currentStep > i
            const stepActive = !isRejected && currentStep === i
            const isLast = i === steps.length - 1

            const dotClass = isRejected
              ? "border-gray-200 bg-white"
              : stepCompleted
              ? "border-primary bg-primary"
              : stepActive
              ? isClarification
                ? "border-orange-400 bg-orange-50"
                : "border-primary bg-white ring-2 ring-primary/20"
              : "border-gray-200 bg-white"

            const labelClass = isRejected
              ? "text-gray-300"
              : stepCompleted
              ? "text-primary"
              : stepActive
              ? isClarification
                ? "text-orange-600 font-semibold"
                : "text-primary font-semibold"
              : "text-muted-foreground"

            const lineClass = stepCompleted && !isRejected ? "bg-primary" : "bg-gray-200"

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${dotClass}`}>
                    {stepCompleted && <CheckCircle className="h-3 w-3 text-white" />}
                    {stepActive && !isClarification && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                    {stepActive && isClarification && (
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight text-center ${
                    step.length < 15
                      ? "whitespace-nowrap"
                      : `break-normal ${steps.length > 4 ? "max-w-[48px]" : "max-w-[56px]"}`
                  } ${labelClass}`}>
                    {step}
                  </span>
                  {stageDateMap.get(step) && (
                    <span className="text-[9px] leading-tight text-center text-muted-foreground/60 max-w-[56px]">
                      {stageDateMap.get(step)}
                    </span>
                  )}
                </div>
                {!isLast && (
                  <div className={`h-0.5 flex-1 mx-1 mt-2.5 ${lineClass}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Row 4: Date + Ministry */}
        <div className="flex items-center gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {submission.submittedDate}
          </span>
          {submission.ministry && (
            <span className="flex items-center gap-1 truncate">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{formatMinistryDisplay(submission.ministry)}</span>
            </span>
          )}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {dialogOpen ? (
          <DashboardSubmissionDetailDialog
            key={`${submission.id}-${dialogTab}`}
            submission={submission}
            status={status}
            defaultTab={dialogTab}
            onAfterRespond={handleAfterRespond}
          />
        ) : null}
      </Dialog>
    </Card>
  )
}

function DashboardPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabsRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<string>(searchParams.get("view") || "")
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all")
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    actionRequired: 0,
    completed: 0,
  })
  const [submissionsLoading, setSubmissionsLoading] = useState(true)
  const [submissionsError, setSubmissionsError] = useState<string | null>(null)
  const [userDrafts, setUserDrafts] = useState<DashboardDraft[]>([])
  const [draftsLoading, setDraftsLoading] = useState(true)
  const [draftsError, setDraftsError] = useState<string | null>(null)

  const loadSubmissions = useCallback(async () => {
    setSubmissionsLoading(true)
    setSubmissionsError(null)
    const res = await fetchDashboardSubmissions()
    if (!res.success || !res.data) {
      setSubmissions([])
      setStats({ total: 0, active: 0, actionRequired: 0, completed: 0 })
      setSubmissionsError(res.error || res.message || "Failed to load submissions")
    } else {
      setSubmissions(res.data.submissions.map(mapApiItemToSubmission))
      setStats(res.data.stats)
    }
    setSubmissionsLoading(false)
  }, [])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  useEffect(() => {
    const fetchDrafts = async () => {
      setDraftsLoading(true)
      setDraftsError(null)
      const result = await fetchAllDrafts()
      if (result.success && result.data) {
        setUserDrafts(result.data)
      } else {
        setUserDrafts([])
        setDraftsError(result.error || "Failed to load drafts")
      }
      setDraftsLoading(false)
    }
    fetchDrafts()
  }, [])
  
  // Sync state when URL params change (back/forward navigation)
  useEffect(() => {
    setView(searchParams.get("view") || "")
    setTypeFilter(searchParams.get("type") || "all")
    setStatusFilter(searchParams.get("status") || "all")
  }, [searchParams])

  const buildUrl = (type: string, status: string, v = "") => {
    const params = new URLSearchParams()
    if (type !== "all") params.set("type", type)
    if (status !== "all") params.set("status", status)
    if (v) params.set("view", v)
    const query = params.toString()
    return `/dashboard${query ? `?${query}` : ""}`
  }

  const handleCardClick = (type = "all", status = "all", v = "") => {
    setTypeFilter(type)
    setStatusFilter(status)
    setView(v)
    router.replace(buildUrl(type, status, v), { scroll: false })
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type)
    setView("")
    router.replace(buildUrl(type, statusFilter), { scroll: false })
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setView("")
    router.replace(buildUrl(typeFilter, status), { scroll: false })
  }

  // Handle delete draft
  const handleDeleteDraft = async (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
      const draft = userDrafts.find((d) => d.draftId === draftId)
      if (!draft) return
      const result = await deleteDraftByType(draft.draftType, draftId)
      if (result.success) {
        setUserDrafts(prev => prev.filter(d => d.draftId !== draftId))
      }
    }
  }
  
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter
    const matchesType = typeFilter === "all" || submission.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const actionRequired = filteredSubmissions.filter(s => s.status === "clarification")

  const contractsCompleted = submissions.filter(s => s.type === "contract").length
  const correspondenceCompleted = submissions.filter(s => s.type === "correspondence").length

  const authUser = getUser()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AskRex />
      
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* User Welcome Strip - Minimal */}
          {authUser && (
            <div className="mb-4 px-4 py-2 bg-gradient-to-r from-primary/10 via-blue-50 to-teal-50 border border-primary/20 rounded-lg flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Welcome back,</span>
                <span className="font-medium text-slate-900">{authUser.full_name}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">{authUser.organization || authUser.email}</span>
              </div>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm" className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700">
                  <LogOut className="h-3 w-3 mr-1" />
                  Sign Out
                </Button>
              </form>
            </div>
          )}

          {/* Hero Banner */}
          <div className="rounded-xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <LayoutDashboard className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">My Submissions</h1>
                  <p className="mt-1 text-white/80">Track and manage your correspondence and contract submissions.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link href="/correspondence">
                    <FileText className="mr-2 h-4 w-4" />
                    New Correspondence
                  </Link>
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                  <Link href="/contracts">
                    <FileSignature className="mr-2 h-4 w-4" />
                    New Contract
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {submissionsError && (
            <div
              className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-4"
              role="alert"
            >
              <span>{submissionsError}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => loadSubmissions()}>
                Retry
              </Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card
              className="bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-md cursor-pointer hover:ring-2 hover:ring-slate-400/60 transition-all"
              onClick={() => handleCardClick()}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Submissions</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-slate-300 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 shadow-md cursor-pointer hover:ring-2 hover:ring-orange-400/60 transition-all"
              onClick={() => handleCardClick("all", "clarification")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700 font-medium">Action Required</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.actionRequired}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-orange-300 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-orange-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 shadow-md cursor-pointer hover:ring-2 hover:ring-emerald-400/60 transition-all"
              onClick={() => handleCardClick("all", "all", "contract-register")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Contracts Completed</p>
                    <p className="text-2xl font-bold text-emerald-900">{contractsCompleted}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-300 flex items-center justify-center">
                    <FileSignature className="h-5 w-5 text-emerald-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 shadow-md cursor-pointer hover:ring-2 hover:ring-blue-400/60 transition-all"
              onClick={() => handleCardClick("all", "all", "correspondence-register")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Correspondence Completed</p>
                    <p className="text-2xl font-bold text-blue-900">{correspondenceCompleted}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-300 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {submissionsLoading && (
            <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading submissions…
            </p>
          )}

          {/* Saved Drafts Section */}
          {!draftsLoading && userDrafts.length > 0 && (
            <Card className="mb-8 border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-200 flex items-center justify-center">
                      <Pencil className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-amber-900">Saved Drafts</CardTitle>
                      <CardDescription className="text-amber-700">
                        Continue where you left off
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    {userDrafts.length} draft{userDrafts.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {draftsError ? (
                  <p className="text-sm text-destructive">{draftsError}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {userDrafts.map((draft) => (
                      <div
                        key={draft.draftId}
                        className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-white hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                            draft.draftType === 'contract'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {draft.draftType === 'contract'
                              ? <FileSignature className="h-4 w-4" />
                              : <FileText className="h-4 w-4" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{draft.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{draft.draftType}</span>
                              <span>•</span>
                              <span>{draft.progressPercentage}% complete</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                            asChild
                          >
                            <Link href={`/${draft.draftType === 'contract' ? 'contracts' : 'correspondence'}?draft=${draft.draftId}`}>
                              <ArrowRight className="h-4 w-4" />
                              <span className="sr-only">Continue</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteDraft(draft.draftId)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or transaction number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="correspondence">Correspondence</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="clarification">Action Required</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Required Banner */}
          {actionRequired.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-800">
                      {actionRequired.length} submission{actionRequired.length > 1 ? "s" : ""} require{actionRequired.length === 1 ? "s" : ""} your attention
                    </p>
                    <p className="text-sm text-orange-700">
                      Please respond to clarification requests to continue processing.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 border-orange-300 text-orange-700 hover:bg-orange-100">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submissions List / Register Tables */}
          <div ref={tabsRef}>
            {view === "contract-register" ? (
              <ContractRegisterTable />
            ) : view === "correspondence-register" ? (
              <CorrespondenceRegisterTable />
            ) : filteredSubmissions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-1">No submissions found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                      ? "No submissions match your filters."
                      : "You don't have any submissions yet."}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button asChild>
                      <Link href="/correspondence">
                        <Plus className="mr-2 h-4 w-4" />
                        New Submission
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onRefresh={loadSubmissions}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer compact />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <RequireAuthGuard returnPath="/dashboard">
        <DashboardPageInner />
      </RequireAuthGuard>
    </Suspense>
  )
}
