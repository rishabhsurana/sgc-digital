"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Eye,
  MoreHorizontal,
  RefreshCw,
  FileText,
  Download,
  FileSignature,
  CheckCircle,
  Clock,
  XCircle,
  X,
} from "lucide-react"
import { ManagementPaginationBar } from "@/components/management/management-pagination-bar"
import {
  fetchUserCorrespondenceRegister,
  fetchCorrespondenceDetail,
  downloadDocumentAuthorized,
  type RegisterCorrespondenceRow,
  type RegisterFetchParams,
} from "@/lib/dashboard-api"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  "pending-review": { label: "Pending SG/DSG Review", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Eye },
  assigned: { label: "Assigned / In Progress", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Eye },
  "pending-external": { label: "Pending External", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
  "returned-corr": { label: "Returned for Correction", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
  "on-hold": { label: "On Hold", color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock },
  closed: { label: "Closed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  // Legacy
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  "under-review": { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "bg-red-100 text-red-700" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
}

const COLUMNS = [
  { id: "reference_number", label: "Transaction Number" },
  { id: "correspondence_type", label: "Type" },
  { id: "subject", label: "Subject" },
  { id: "ministry_file_reference", label: "Min. File Ref. #" },
  { id: "date_received", label: "Date" },
  { id: "priority_level", label: "Priority" },
  { id: "current_status_code", label: "Status" },
] as const

interface CorrespondenceDocumentRow {
  id: string
  file_name: string
  document_type_label?: string
}

export function CorrespondenceRegisterTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [rows, setRows] = useState<RegisterCorrespondenceRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [limit, setLimit] = useState(20)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [downloadDocuments, setDownloadDocuments] = useState<CorrespondenceDocumentRow[]>([])
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null)
  const searchRef = useRef(searchQuery)
  searchRef.current = searchQuery

  const loadRegisters = useCallback(
    async (targetPage: number, pageLimit?: number, overrideStatus?: string) => {
      setLoading(true)
      try {
        const params: RegisterFetchParams = {
          page: targetPage,
          limit: pageLimit ?? limit,
        }
        const s = searchRef.current.trim()
        if (s) params.search = s
        const st = overrideStatus !== undefined ? overrideStatus : statusFilter
        if (st !== "all") params.status = st

        const res = await fetchUserCorrespondenceRegister(params)
        if (res.success && Array.isArray(res.data)) {
          const pagination = (res as any).pagination ?? {}
          setRows(res.data)
          setTotal(pagination.total ?? res.data.length)
          setTotalPages(pagination.totalPages ?? 1)
        } else {
          setRows([])
          setTotal(0)
          setTotalPages(1)
        }
      } finally {
        setLoading(false)
      }
    },
    [limit, statusFilter]
  )

  useEffect(() => {
    void loadRegisters(1, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredData = useMemo(
    () =>
      rows.map((item) => ({
        id: item.register_id,
        correspondenceId: item.correspondence_id ?? "",
        ref: item.reference_number ?? "-",
        type: item.correspondence_type ?? "-",
        subject: item.subject ?? "-",
        minFileRef: item.ministry_file_reference ?? "-",
        ministry: item.originating_mda ?? "-",
        submitter: item.submitter_name ?? "-",
        date: item.date_received ? String(item.date_received).slice(0, 10) : "-",
        status: String(item.current_status_code ?? "pending").toLowerCase().replace(/_/g, "-"),
        priority: String(item.priority_level ?? "medium").toLowerCase(),
      })),
    [rows]
  )

  const isFiltered = searchQuery.trim() !== "" || statusFilter !== "all"

  const openDownloadDialog = async (correspondenceId: string) => {
    if (!correspondenceId) return
    setDownloadDocuments([])
    setDownloadLoading(true)
    setDownloadDialogOpen(true)
    try {
      const res = await fetchCorrespondenceDetail(correspondenceId)
      if (res.success && res.data) {
        setDownloadDocuments((res.data.documents as CorrespondenceDocumentRow[]) ?? [])
      }
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleDownloadDoc = async (doc: CorrespondenceDocumentRow) => {
    setDownloadingDocId(doc.id)
    try {
      await downloadDocumentAuthorized(doc.id, doc.file_name)
    } finally {
      setDownloadingDocId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, subject, ministry, or submitter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1)
                      void loadRegisters(1, limit)
                    }
                  }}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      searchRef.current = ""
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v)
                  setPage(1)
                  void loadRegisters(1, limit, v)
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => void loadRegisters(page, limit)}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isFiltered && (
            <div className="mt-4 pt-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredData.length}</span> of {total} records
                </span>
                {searchQuery && (
                  <span className="text-muted-foreground">
                    for &quot;<span className="font-medium text-primary">{searchQuery}</span>&quot;
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  searchRef.current = ""
                  setStatusFilter("all")
                  setPage(1)
                  void loadRegisters(1, limit, "all")
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

      {/* Table */}
      <Card className="border-primary/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {COLUMNS.map((column) => (
                    <TableHead key={column.id} className="font-semibold">
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold w-[90px] text-center">Download</TableHead>
                  <TableHead className="font-semibold w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                      Loading...
                    </TableCell>
                  </TableRow>
                )}
                {filteredData.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending
                  const priorityConfig = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.medium
                  const StatusIcon = statusConfig.icon
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm font-medium text-primary">{item.ref}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate" title={item.subject}>{item.subject}</TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {item.minFileRef}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.date}</TableCell>
                      <TableCell>
                        <Badge className={priorityConfig.color} variant="secondary">
                          {priorityConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color} variant="secondary">
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                          disabled={!item.correspondenceId}
                          onClick={() => void openDownloadDialog(item.correspondenceId)}
                          title="Download correspondence documents"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedItem(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!loading && filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No correspondence found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <ManagementPaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            loading={loading}
            onPageChange={(p) => {
              setPage(p)
              void loadRegisters(p, limit)
            }}
            onLimitChange={(n) => {
              setLimit(n)
              setPage(1)
              void loadRegisters(1, n)
            }}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Correspondence Details
            </DialogTitle>
            <DialogDescription>
              Reference: {selectedItem?.ref}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedItem.type}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={(STATUS_CONFIG[selectedItem.status] ?? STATUS_CONFIG.pending).color}>
                    {(STATUS_CONFIG[selectedItem.status] ?? STATUS_CONFIG.pending).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ministry/MDA</Label>
                  <p className="font-medium">{selectedItem.ministry}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Submitter</Label>
                  <p className="font-medium">{selectedItem.submitter}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date Submitted</Label>
                  <p className="font-medium">{selectedItem.date}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Badge className={(PRIORITY_CONFIG[selectedItem.priority] ?? PRIORITY_CONFIG.medium).color}>
                    {(PRIORITY_CONFIG[selectedItem.priority] ?? PRIORITY_CONFIG.medium).label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-medium">{selectedItem.subject}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              Correspondence Documents
            </DialogTitle>
            <DialogDescription>
              Download the documents attached to this correspondence.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {downloadLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading documents…
              </div>
            )}
            {!downloadLoading && downloadDocuments.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No documents available for this correspondence.</p>
            )}
            {!downloadLoading && downloadDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    {doc.document_type_label && (
                      <p className="text-xs text-muted-foreground">{doc.document_type_label}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  disabled={downloadingDocId === doc.id}
                  onClick={() => void handleDownloadDoc(doc)}
                >
                  {downloadingDocId === doc.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  <span className="ml-1">Download</span>
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
