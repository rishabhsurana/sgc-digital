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
  FileSignature,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  DollarSign,
  X
} from "lucide-react"
import { apiDownloadFile, apiGet } from "@/lib/api-client"
import { ManagementPaginationBar } from "@/components/management/management-pagination-bar"

// Contract Categories per requirements
const CONTRACT_CATEGORIES = {
  "Goods": ["Procurement of Goods & Services", "Lease / Property", "Inter-Agency / MOU"],
  "Consultancy/Services": ["Consultancy / Professional Services", "Procurement of Goods & Services", "Employment / Personnel", "Inter-Agency / MOU"],
  "Works": ["Construction / Public Works", "Procurement of Goods & Services", "Inter-Agency / MOU", "Other"]
}

// Contract Instrument Types per requirements
const CONTRACT_INSTRUMENTS = {
  "Goods": ["Goods", "Uniforms", "Other"],
  "Consultancy/Services": ["Cleaning Services", "Consultancy - Company", "Consultant/Independent Contractor", "Individual Consultant", "Individual Consultant (IDB-funded)", "Services", "Other"],
  "Works": ["Works", "Other"]
}

// Sample contracts data aligned with requirements - Output format columns:
// Date Received | Originating MDA | Subject | Nature of Contract | Category | Contract # | Status/Stage | Date Completed
const CONTRACTS_DATA = [
  { 
    id: 1, 
    ref: "CON-2026-0089", 
    subject: "Medical Equipment Supply", 
    nature: "Goods", 
    category: "Procurement of Goods & Services",
    contractType: "New",
    originatingMDA: "Ministry of Health", 
    contractor: "MedTech Solutions Ltd", 
    value: 2500000, 
    currency: "BBD", 
    dateReceived: "2026-02-28",
    dateCompleted: "2026-03-15",
    status: "approved", 
    submittedBy: "John Smith"
  },
  { 
    id: 2, 
    ref: "CON-2026-0088", 
    subject: "School Renovation Project Phase 2", 
    nature: "Works", 
    category: "Construction / Public Works",
    contractType: "Supplemental",
    originatingMDA: "Ministry of Education", 
    contractor: "BuildRight Construction", 
    value: 8900000, 
    currency: "BBD", 
    dateReceived: "2026-02-25",
    dateCompleted: null,
    status: "pending", 
    submittedBy: "Mary Johnson"
  },
  { 
    id: 3, 
    ref: "CON-2026-0087", 
    subject: "IT Infrastructure Upgrade", 
    nature: "Goods", 
    category: "Procurement of Goods & Services",
    contractType: "New",
    originatingMDA: "Ministry of ICT", 
    contractor: "TechServe Caribbean", 
    value: 1800000, 
    currency: "BBD", 
    dateReceived: "2026-02-20",
    dateCompleted: null,
    status: "under-review", 
    submittedBy: "David Williams"
  },
  { 
    id: 4, 
    ref: "CON-2026-0086", 
    subject: "Road Rehabilitation - Highway 1", 
    nature: "Works", 
    category: "Construction / Public Works",
    contractType: "New",
    originatingMDA: "Ministry of Works", 
    contractor: "Caribbean Roadways Inc", 
    value: 45000000, 
    currency: "BBD", 
    dateReceived: "2026-02-15",
    dateCompleted: null,
    status: "pending", 
    submittedBy: "Sarah Brown"
  },
  { 
    id: 5, 
    ref: "CON-2026-0085", 
    subject: "Financial Advisory Services", 
    nature: "Consultancy/Services", 
    category: "Consultancy / Professional Services",
    contractType: "Renewal",
    originatingMDA: "Ministry of Finance", 
    contractor: "PWC Barbados", 
    value: 750000, 
    currency: "BBD", 
    dateReceived: "2026-01-20",
    dateCompleted: "2026-02-28",
    status: "approved", 
    submittedBy: "Michael Davis"
  },
  { 
    id: 6, 
    ref: "CON-2026-0084", 
    subject: "Agricultural Equipment", 
    nature: "Goods", 
    category: "Procurement of Goods & Services",
    contractType: "New",
    originatingMDA: "Ministry of Agriculture", 
    contractor: "AgroSupply Ltd", 
    value: 3200000, 
    currency: "BBD", 
    dateReceived: "2026-02-10",
    dateCompleted: "2026-02-25",
    status: "approved", 
    submittedBy: "Lisa Thompson"
  },
  { 
    id: 7, 
    ref: "CON-2026-0083", 
    subject: "Tourism Marketing Campaign", 
    nature: "Consultancy/Services", 
    category: "Consultancy / Professional Services",
    contractType: "New",
    originatingMDA: "Ministry of Tourism", 
    contractor: "BrandCaribbean Agency", 
    value: 1200000, 
    currency: "BBD", 
    dateReceived: "2026-02-05",
    dateCompleted: null,
    status: "under-review", 
    submittedBy: "Robert Wilson"
  },
  { 
    id: 8, 
    ref: "CON-2026-0082", 
    subject: "Water Treatment Plant Upgrade", 
    nature: "Works", 
    category: "Construction / Public Works",
    contractType: "Supplemental",
    originatingMDA: "Barbados Water Authority", 
    contractor: "AquaTech Engineering", 
    value: 15000000, 
    currency: "BBD", 
    dateReceived: "2026-01-30",
    dateCompleted: null,
    status: "pending", 
    submittedBy: "Jennifer Lee"
  },
  { 
    id: 9, 
    ref: "CON-2026-0081", 
    subject: "Legal Research Database", 
    nature: "Consultancy/Services", 
    category: "Procurement of Goods & Services",
    contractType: "Renewal",
    originatingMDA: "Attorney General's Office", 
    contractor: "LexisNexis Caribbean", 
    value: 450000, 
    currency: "BBD", 
    dateReceived: "2026-01-10",
    dateCompleted: "2026-02-01",
    status: "approved", 
    submittedBy: "James Martin"
  },
  { 
    id: 10, 
    ref: "CON-2026-0080", 
    subject: "Staff Uniforms Supply", 
    nature: "Goods", 
    category: "Procurement of Goods & Services",
    contractType: "New",
    originatingMDA: "Ministry of Home Affairs", 
    contractor: "Office Plus Ltd", 
    value: 580000, 
    currency: "BBD", 
    dateReceived: "2026-01-05",
    dateCompleted: "2026-01-20",
    status: "rejected", 
    submittedBy: "Patricia Garcia"
  },
]

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  "under-review": { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
  approved: { label: "Approved", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
}

const PRIORITY_CONFIG = {
  high: { label: "High", color: "bg-red-100 text-red-700" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
}

const CONTRACT_REGISTER_COLUMNS = [
  { id: "date_received", label: "Date Received" },
  { id: "originating_mda", label: "Originating MDA" },
  { id: "subject", label: "Subject" },
  { id: "nature_of_contract", label: "Nature of Contract" },
  { id: "category", label: "Category" },
  { id: "contract_number", label: "Contract #" },
  { id: "contract_type", label: "Contract Type" },
  { id: "current_status_code", label: "Status/Stage" },
  { id: "date_completed", label: "Date Completed" },
] as const

export default function ContractsRegisterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [natureFilter, setNatureFilter] = useState("all")
  const [contractTypeFilter, setContractTypeFilter] = useState("all")
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

      const res = await apiGet<any>(`/api/registers/contracts?${q.toString()}`)
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
        .filter((item) => natureFilter === "all" || (item.nature_of_contract ?? "") === natureFilter)
        .filter((item) => contractTypeFilter === "all" || (item.contract_type ?? "") === contractTypeFilter)
        .map((item) => ({
          id: item.register_id,
          ref: item.contract_number,
          subject: item.subject ?? "-",
          nature: item.nature_of_contract ?? "-",
          category: item.category ?? "-",
          contractType: item.contract_type ?? "-",
          originatingMDA: item.originating_mda ?? "-",
          contractor: item.contractor_name ?? "-",
          value: Number(item.contract_value ?? 0),
          currency: item.contract_currency ?? "BBD",
          dateReceived: item.date_received ? String(item.date_received).slice(0, 10) : "-",
          dateCompleted: item.date_completed ? String(item.date_completed).slice(0, 10) : null,
          status: String(item.current_status_code ?? "pending").toLowerCase().replace(/_/g, "-"),
          submittedBy: item.submitted_by_name ?? "-",
        })),
    [rows, natureFilter, contractTypeFilter]
  )

  const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'all' || natureFilter !== 'all' || contractTypeFilter !== 'all'
  const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0)

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const q = new URLSearchParams()
      const s = searchRef.current.trim()
      if (s) q.set("search", s)
      if (statusFilter !== "all") q.set("status", statusFilter)
      if (natureFilter !== "all") q.set("nature_of_contract", natureFilter)
      if (contractTypeFilter !== "all") q.set("contract_type", contractTypeFilter)
      q.set("columns", CONTRACT_REGISTER_COLUMNS.map((c) => c.id).join(","))
      await apiDownloadFile(
        `/api/registers/contracts/export?${q.toString()}`,
        `contracts-register-${new Date().toISOString().slice(0, 10)}.xlsx`
      )
    } catch (error) {
      console.error("Failed to export contracts register:", error)
      window.alert("Failed to export contracts register. Please try again.")
    } finally {
      setExporting(false)
    }
  }, [statusFilter, natureFilter, contractTypeFilter])

  return (
    <div className="p-6 lg:p-8">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-slate-800 p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <FileSignature className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Contracts Register</h1>
              <p className="mt-1 text-white/80">View and manage all contract submissions.</p>
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
                  placeholder="Search by reference, title, ministry, or contractor..."
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={natureFilter} onValueChange={setNatureFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Natures</SelectItem>
                  <SelectItem value="Goods">Goods</SelectItem>
                  <SelectItem value="Works">Works</SelectItem>
                  <SelectItem value="Consultancy/Services">Consultancy/Services</SelectItem>
                </SelectContent>
              </Select>
              <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Renewal">Renewal</SelectItem>
                  <SelectItem value="Supplemental">Supplemental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search Results Feedback */}
          {isFiltered && (
            <div className="mt-4 pt-4 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredData.length}</span> of {total} contracts
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
                  setNatureFilter("all")
                  setContractTypeFilter("all")
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
      <div className="grid gap-4 sm:grid-cols-5 mb-6">
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
                <p className="text-xs font-medium text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-900">{rows.filter(i => String(i.current_status_code ?? '').toLowerCase() === 'approved').length}</p>
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
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700">Total Value</p>
                <p className="text-lg font-bold text-purple-900">${(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
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
                  {CONTRACT_REGISTER_COLUMNS.map((column) => (
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
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm">{item.dateReceived}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate" title={item.originatingMDA}>{item.originatingMDA}</TableCell>
                      <TableCell className="max-w-[180px] truncate" title={item.subject}>{item.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          item.nature === "Works" ? "border-orange-200 bg-orange-50 text-orange-700" :
                          item.nature === "Goods" ? "border-blue-200 bg-blue-50 text-blue-700" :
                          "border-purple-200 bg-purple-50 text-purple-700"
                        }>
                          {item.nature}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[140px] truncate" title={item.category}>{item.category}</TableCell>
                      <TableCell className="font-mono text-sm font-medium text-primary">{item.ref}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          item.contractType === "New" ? "border-green-200 bg-green-50 text-green-700" :
                          item.contractType === "Renewal" ? "border-blue-200 bg-blue-50 text-blue-700" :
                          "border-amber-200 bg-amber-50 text-amber-700"
                        }>
                          {item.contractType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color} variant="secondary">
                          <statusConfig.icon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.dateCompleted || "-"}</TableCell>
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
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
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
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No contracts found.
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
              <FileSignature className="h-5 w-5 text-purple-600" />
              Contract Details
            </DialogTitle>
            <DialogDescription>
              Reference: {selectedItem?.ref}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* Contract Classification */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-2">Contract Classification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nature of Contract</Label>
                    <Badge variant="outline" className={
                      selectedItem.nature === "Works" ? "border-orange-200 bg-orange-50 text-orange-700" :
                      selectedItem.nature === "Goods" ? "border-blue-200 bg-blue-50 text-blue-700" :
                      "border-purple-200 bg-purple-50 text-purple-700"
                    }>
                      {selectedItem.nature}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <p className="font-medium text-sm">{selectedItem.category}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contract Type</Label>
                    <Badge variant="outline" className={
                      selectedItem.contractType === "New" ? "border-green-200 bg-green-50 text-green-700" :
                      selectedItem.contractType === "Renewal" ? "border-blue-200 bg-blue-50 text-blue-700" :
                      "border-amber-200 bg-amber-50 text-amber-700"
                    }>
                      {selectedItem.contractType}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contract #</Label>
                    <p className="font-mono text-sm font-medium text-primary">{selectedItem.ref}</p>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-2">Contract Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Subject</Label>
                    <p className="font-medium">{selectedItem.subject}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Originating MDA</Label>
                    <p className="font-medium text-sm">{selectedItem.originatingMDA}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contractor</Label>
                    <p className="font-medium text-sm">{selectedItem.contractor}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contract Value</Label>
                    <p className="font-medium font-mono">{selectedItem.currency} ${selectedItem.value.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status/Stage</Label>
                    <Badge className={STATUS_CONFIG[selectedItem.status as keyof typeof STATUS_CONFIG].color}>
                      {STATUS_CONFIG[selectedItem.status as keyof typeof STATUS_CONFIG].label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 border-b pb-2">Key Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Date Received</Label>
                    <p className="font-medium text-sm">{selectedItem.dateReceived}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date Completed</Label>
                    <p className="font-medium text-sm">{selectedItem.dateCompleted || "Not completed"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Submitted By</Label>
                    <p className="font-medium text-sm">{selectedItem.submittedBy}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Contract
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Package
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
