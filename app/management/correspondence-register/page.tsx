"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Eye, 
  MoreHorizontal, 
  RefreshCw, 
  Download,
  FileText,
  Mail,
  Calendar,
  Building2,
  User,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
  CheckCircle,
  X,
} from "lucide-react"
import { apiDownloadFile, apiGet } from "@/lib/api-client"
import { ManagementPaginationBar } from "@/components/management/management-pagination-bar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample correspondence data
const CORRESPONDENCE_DATA = [
  { id: 1, ref: "COR-2026-0234", type: "General", subject: "Request for Legal Opinion on Property Acquisition", ministry: "Ministry of Finance", submitter: "John Smith", date: "2026-03-01", status: "pending", priority: "high" },
  { id: 2, ref: "COR-2026-0233", type: "Litigation", subject: "Crown Proceedings Act Matter - Case #45892", ministry: "Ministry of Health", submitter: "Sarah Johnson", date: "2026-03-01", status: "under-review", priority: "high" },
  { id: 3, ref: "COR-2026-0232", type: "Advisory", subject: "Constitutional Amendment Review", ministry: "Cabinet Office", submitter: "Michael Brown", date: "2026-02-28", status: "completed", priority: "medium" },
  { id: 4, ref: "COR-2026-0231", type: "Compensation", subject: "Land Compensation Claim - Lot 456", ministry: "Ministry of Housing", submitter: "Emily Davis", date: "2026-02-28", status: "pending", priority: "medium" },
  { id: 5, ref: "COR-2026-0230", type: "Cabinet/Confidential", subject: "Trade Agreement Review", ministry: "Ministry of Foreign Affairs", submitter: "Robert Wilson", date: "2026-02-27", status: "under-review", priority: "high" },
  { id: 6, ref: "COR-2026-0229", type: "General", subject: "Employment Contract Template Review", ministry: "Ministry of Labour", submitter: "Jennifer Taylor", date: "2026-02-27", status: "completed", priority: "low" },
  { id: 7, ref: "COR-2026-0228", type: "Litigation", subject: "Judicial Review Application - Planning Decision", ministry: "Ministry of Planning", submitter: "David Martinez", date: "2026-02-26", status: "pending", priority: "high" },
  { id: 8, ref: "COR-2026-0227", type: "Advisory", subject: "Regulatory Framework for Digital Services", ministry: "Ministry of ICT", submitter: "Lisa Anderson", date: "2026-02-26", status: "completed", priority: "medium" },
  { id: 9, ref: "COR-2026-0226", type: "General", subject: "MOU Review - International Partnership", ministry: "Ministry of Tourism", submitter: "James Thomas", date: "2026-02-25", status: "under-review", priority: "medium" },
  { id: 10, ref: "COR-2026-0225", type: "Compensation", subject: "Vehicle Accident Claim Assessment", ministry: "Ministry of Transport", submitter: "Patricia White", date: "2026-02-25", status: "rejected", priority: "low" },
]

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  "under-review": { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
}

const PRIORITY_CONFIG = {
  high: { label: "High", color: "bg-red-100 text-red-700" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
}

const CORRESPONDENCE_REGISTER_COLUMNS = [
  { id: "reference_number", label: "Transaction Number" },
  { id: "correspondence_type", label: "Type" },
  { id: "subject", label: "Subject" },
  { id: "originating_mda", label: "Ministry/MDA" },
  { id: "submitter_name", label: "Submitter" },
  { id: "date_received", label: "Date" },
  { id: "priority_level", label: "Priority" },
  { id: "current_status_code", label: "Status" },
] as const

export default function CorrespondenceRegisterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [limit, setLimit] = useState(20)
  const searchRef = useRef(searchQuery)
  searchRef.current = searchQuery

  const loadRegisters = useCallback(
    async (targetPage: number, pageLimit?: number, overrideStatus?: string) => {
      setLoading(true)
      const lim = pageLimit ?? limit
      const q = new URLSearchParams({ page: String(targetPage), limit: String(lim) })
      const s = searchRef.current.trim()
      if (s) q.set("search", s)
      const st = overrideStatus !== undefined ? overrideStatus : statusFilter
      if (st !== "all") q.set("status", st)

      const res = await apiGet<any>(`/api/registers/correspondence?${q.toString()}`)
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
      setLoading(false)
    },
    [limit, statusFilter]
  )

  useEffect(() => {
    void loadRegisters(1, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [])

  const filteredData = useMemo(
    () =>
      rows
        .filter((item) => typeFilter === "all" || (item.correspondence_type ?? "") === typeFilter)
        .map((item) => ({
          id: item.register_id,
          ref: item.reference_number,
          type: item.correspondence_type ?? "-",
          subject: item.subject ?? "-",
          ministry: item.originating_mda ?? "-",
          submitter: item.submitter_name ?? "-",
          date: item.date_received ? String(item.date_received).slice(0, 10) : "-",
          status: String(item.current_status_code ?? "pending").toLowerCase().replace(/_/g, "-"),
          priority: String(item.priority_level ?? "medium").toLowerCase(),
        })),
    [rows, typeFilter]
  )

  const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all'

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const q = new URLSearchParams()
      const s = searchRef.current.trim()
      if (s) q.set("search", s)
      if (statusFilter !== "all") q.set("status", statusFilter)
      q.set("columns", CORRESPONDENCE_REGISTER_COLUMNS.map((c) => c.id).join(","))
      await apiDownloadFile(
        `/api/registers/correspondence/export?${q.toString()}`,
        `correspondence-register-${new Date().toISOString().slice(0, 10)}.xlsx`
      )
    } catch (error) {
      console.error("Failed to export correspondence register:", error)
      window.alert("Failed to export correspondence register. Please try again.")
    } finally {
      setExporting(false)
    }
  }, [statusFilter])

  return (
    <div className="p-6 lg:p-8">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-800 p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Correspondence Register</h1>
              <p className="mt-1 text-white/80">View and manage all correspondence submissions.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/40 bg-transparent text-white hover:bg-white/20 hover:text-white"
              onClick={() => void loadRegisters(page, limit)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
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

      {/* Filters */}
      <Card className="mb-6 border-primary/20">
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
                    onClick={() => setSearchQuery('')}
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Litigation">Litigation</SelectItem>
                  <SelectItem value="Advisory">Advisory</SelectItem>
                  <SelectItem value="Compensation">Compensation</SelectItem>
                  <SelectItem value="Cabinet/Confidential">Cabinet/Confidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search Results Feedback */}
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
                  setTypeFilter("all")
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

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">Pending</p>
                <p className="text-2xl font-bold text-amber-900">{rows.filter(i => String(i.current_status_code ?? '').toLowerCase() === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Under Review</p>
                <p className="text-2xl font-bold text-blue-900">{rows.filter(i => String(i.current_status_code ?? '').toLowerCase() === 'under_review').length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-900">{rows.filter(i => String(i.current_status_code ?? '').toLowerCase() === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{rows.filter(i => String(i.current_status_code ?? '').toLowerCase() === 'rejected').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-primary/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {CORRESPONDENCE_REGISTER_COLUMNS.map((column) => (
                    <TableHead key={column.id} className="font-semibold">
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]
                  const priorityConfig = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm font-medium text-primary">{item.ref}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate" title={item.subject}>{item.subject}</TableCell>
                      <TableCell className="text-sm">{item.ministry}</TableCell>
                      <TableCell className="text-sm">{item.submitter}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.date}</TableCell>
                      <TableCell>
                        <Badge className={priorityConfig.color} variant="secondary">
                          {priorityConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig?.color} variant="secondary">
                          <statusConfig.icon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
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
                            {/* <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem> */}
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
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
                  <Badge className={STATUS_CONFIG[selectedItem.status as keyof typeof STATUS_CONFIG].color}>
                    {STATUS_CONFIG[selectedItem.status as keyof typeof STATUS_CONFIG].label}
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
                  <Badge className={PRIORITY_CONFIG[selectedItem.priority as keyof typeof PRIORITY_CONFIG].color}>
                    {PRIORITY_CONFIG[selectedItem.priority as keyof typeof PRIORITY_CONFIG].label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-medium">{selectedItem.subject}</p>
              </div>
              <div className="flex gap-2 pt-4">
                {/* <Button className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button> */}
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
