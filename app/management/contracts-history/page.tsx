"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  History,
  Search,
  Download,
  Eye,
  RefreshCw,
  FileText,
  Calendar,
  File,
  FileImage,
  FileSpreadsheet,
  Paperclip,
  FileSignature,
  DollarSign,
  X,
} from "lucide-react"
import { apiDownloadFile, apiGet } from "@/lib/api-client"
import { downloadDocumentAuthorized, formatBytes } from "@/lib/dashboard-api"
import { ManagementPaginationBar } from "@/components/management/management-pagination-bar"

type HistoryRow = {
  id: string
  dateReceived: string
  ref: string
  subject: string
  ministry: string
  submitter: string
  submitterEmail: string
  submitterPhone: string
  submitterPosition: string
  contract_type: string
  contractType: string
  contractValue: string
  status: string
  statusLabel: string
  document_count: number
}

type HistoryDoc = {
  id: string
  name: string
  type: string
  sizeBytes: number
  mime_type: string
  uploadedAt: string
  document_type_label?: string
}

type DetailData = {
  id: string
  dateReceived: string
  ref: string
  subject: string
  ministry: string
  department?: string
  contract_type: string
  contractType: string
  contractValue: string
  contractor_name?: string
  submitter: string
  submitterEmail: string
  submitterPhone: string
  submitterPosition: string
  status: string
  statusLabel: string
  contract_nature?: string
  contract_category?: string
  documents: HistoryDoc[]
}

const STATUS_CONFIG: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
  Approved: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
}

const CONTRACT_TYPE_CONFIG: Record<string, string> = {
  New: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Renewal: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Supplemental: "bg-purple-100 text-purple-700 border-purple-200",
}

const CONTRACT_HISTORY_COLUMNS = [
  { id: "date_received", label: "Date" },
  { id: "contract_number", label: "Contract #" },
  { id: "subject", label: "Subject" },
  { id: "ministry", label: "Ministry/MDA" },
  { id: "submitter", label: "Submitter" },
  { id: "contract_value", label: "Value" },
  { id: "status", label: "Status" },
  { id: "document_count", label: "Documents" },
] as const

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-500" />
    case "doc":
      return <File className="h-4 w-4 text-blue-500" />
    case "excel":
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    case "image":
      return <FileImage className="h-4 w-4 text-purple-500" />
    default:
      return <Paperclip className="h-4 w-4 text-gray-500" />
  }
}

function formatMinistryDisplay(value: string): string {
  const normalized = (value || "").trim()
  if (!normalized) return "—"
  // Show shortforms like "mof" in uppercase.
  if (!normalized.includes(" ")) return normalized.toUpperCase()
  return normalized
}

export default function ContractsHistoryPage() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<HistoryRow[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<DetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const [limit, setLimit] = useState(20)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, typeFilter])

  const loadList = useCallback(async () => {
    setLoading(true)
    setListError(null)
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (debouncedSearch) q.set("search", debouncedSearch)
    if (statusFilter !== "all") q.set("status", statusFilter)
    if (typeFilter !== "all") q.set("contract_type", typeFilter)

    const res = await apiGet<HistoryRow[]>(`/api/management/history/contracts?${q.toString()}`)
    const ext = res as {
      pagination?: typeof pagination
      summary?: typeof summary
    }
    if (res.success && Array.isArray(res.data)) {
      setRows(res.data)
      if (ext.pagination) setPagination(ext.pagination)
      if (ext.summary) setSummary(ext.summary)
    } else {
      setRows([])
      setListError(res.error || res.message || "Failed to load history.")
    }
    setLoading(false)
  }, [page, limit, debouncedSearch, statusFilter, typeFilter])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)
    void (async () => {
      const res = await apiGet<DetailData>(`/api/management/history/contracts/${selectedId}`)
      if (cancelled) return
      if (res.success && res.data && typeof res.data === "object") {
        setDetail(res.data as DetailData)
      } else {
        setDetail(null)
        setDetailError(res.error || res.message || "Could not load details.")
      }
      setDetailLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const isFiltered = searchInput.trim() !== "" || statusFilter !== "all" || typeFilter !== "all"

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const q = new URLSearchParams()
      if (debouncedSearch) q.set("search", debouncedSearch)
      if (statusFilter !== "all") q.set("status", statusFilter)
      if (typeFilter !== "all") q.set("contract_type", typeFilter)
      q.set("columns", CONTRACT_HISTORY_COLUMNS.map((c) => c.id).join(","))
      await apiDownloadFile(
        `/api/management/history/contracts/export?${q.toString()}`,
        `contracts-history-${new Date().toISOString().slice(0, 10)}.xlsx`
      )
    } catch (error) {
      console.error("Failed to export contracts history:", error)
      window.alert("Failed to export contracts history. Please try again.")
    } finally {
      setExporting(false)
    }
  }, [debouncedSearch, statusFilter, typeFilter])

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-800 p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <History className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Contracts History</h1>
              <p className="mt-1 text-white/80">
                View all submitted contracts with documents and submitter details.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/40 bg-transparent text-white hover:bg-white/20 hover:text-white"
              onClick={() => void loadList()}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={() => void handleExport()}
              disabled={exporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, subject, ministry, or submitter..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="renewal">Renewal</SelectItem>
                  <SelectItem value="supplemental">Supplemental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {listError ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {listError}
            </p>
          ) : null}

          {isFiltered && (
            <div className="mt-4 pt-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">
                {pagination.total} record{pagination.total === 1 ? "" : "s"} match your filters
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("")
                  setStatusFilter("all")
                  setTypeFilter("all")
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-muted/50 border-primary/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "—" : summary.total.toLocaleString()}
                </p>
              </div>
              <FileSignature className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">Pending</p>
                <p className="text-2xl font-bold text-amber-900">
                  {loading ? "—" : summary.pending}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Under Review</p>
                <p className="text-2xl font-bold text-blue-900">
                  {loading ? "—" : summary.underReview}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {loading ? "—" : summary.approved}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {CONTRACT_HISTORY_COLUMNS.map((column) => (
                    <TableHead key={column.id} className="font-semibold">
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold w-[80px]">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : null}
                {!loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                      No contracts found.
                    </TableCell>
                  </TableRow>
                ) : null}
                {rows.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {item.dateReceived || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium text-primary">{item.ref}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.subject}>
                      {item.subject}
                    </TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={item.ministry}>
                      {formatMinistryDisplay(item.ministry)}
                    </TableCell>
                    <TableCell className="text-sm">{item.submitter || "—"}</TableCell>
                    <TableCell className="text-sm font-medium">{item.contractValue}</TableCell>
                    <TableCell>
                      <Badge
                        className={STATUS_CONFIG[item.statusLabel] ?? "bg-muted"}
                        variant="secondary"
                      >
                        {item.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        <Paperclip className="mr-1 h-3 w-3" />
                        {item.document_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ManagementPaginationBar
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={limit}
            loading={loading}
            onPageChange={setPage}
            onLimitChange={(n) => {
              setLimit(n)
              setPage(1)
            }}
          />
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null)
            setDetail(null)
            setDetailError(null)
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-orange-600" />
              Contract Details
            </DialogTitle>
            <DialogDescription>
              {detail ? `Contract Reference: ${detail.ref}` : "Loading…"}
            </DialogDescription>
          </DialogHeader>

          {detailError ? (
            <p className="text-sm text-destructive">{detailError}</p>
          ) : null}

          {detailLoading && !detail ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading details…</p>
          ) : null}

          {detail && (
            <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents ({detail.documents?.length ?? 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-auto mt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Date Received</p>
                      <p className="font-medium">{detail.dateReceived || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Contract Number</p>
                      <p className="font-mono font-medium text-primary">{detail.ref}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Subject</p>
                      <p className="font-medium">{detail.subject}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Ministry/MDA</p>
                      <p className="font-medium">{formatMinistryDisplay(detail.ministry)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Contract Value</p>
                      <p className="font-bold text-lg text-green-600">{detail.contractValue}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Contract Type</p>
                      <Badge className={CONTRACT_TYPE_CONFIG[detail.contractType] ?? "bg-muted"}>
                        {detail.contractType}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Status</p>
                      <Badge className={STATUS_CONFIG[detail.statusLabel] ?? "bg-muted"}>
                        {detail.statusLabel}
                      </Badge>
                    </div>
                    {detail.contractor_name ? (
                      <div className="space-y-1 col-span-2">
                        <p className="text-xs font-medium text-muted-foreground">Contractor</p>
                        <p className="font-medium">{detail.contractor_name}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Submitter Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Name</p>
                        <p className="font-medium">{detail.submitter || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Department</p>
                        <p className="font-medium">{detail.submitterPosition || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                        <p className="font-medium text-primary">{detail.submitterEmail || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Phone</p>
                        <p className="font-medium">{detail.submitterPhone || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="flex-1 overflow-auto mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    {(detail.documents?.length ?? 0)} document(s) on file
                  </p>
                  {(detail.documents ?? []).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(doc.type)}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(Number(doc.sizeBytes) || 0)} ·{" "}
                            {doc.uploadedAt
                              ? new Date(doc.uploadedAt).toLocaleString()
                              : "—"}
                            {doc.document_type_label ? ` · ${doc.document_type_label}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => void downloadDocumentAuthorized(doc.id, doc.name)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
