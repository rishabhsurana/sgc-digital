"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
import {
  FileSignature,
  Search,
  Download,
  RefreshCw,
  X,
  FileText,
} from "lucide-react"
import { ManagementPaginationBar } from "@/components/management/management-pagination-bar"
import {
  fetchUserContractRegister,
  fetchContractDetail,
  downloadDocumentAuthorized,
  type RegisterContractRow,
  type ContractRegisterFetchParams,
} from "@/lib/dashboard-api"
import Link from "next/link"

interface DocumentRow {
  document_id: string
  document_name: string
  document_type_label?: string
  file_size?: number
}

const CATEGORY_LABELS: Record<string, string> = {
  CAT_PROC: "Procurement",
  CAT_CONS: "Consultancy",
  CAT_CONST: "Construction",
  CAT_LEASE: "Lease",
  CAT_MOU: "MOU",
  CAT_EMP: "Employment",
  CAT_OTHER: "Other",
  CAT_INTER: "Inter-Agency / MOU",
}

function formatDate(val: string | null | undefined): string {
  if (!val) return "-"
  return String(val).slice(0, 10)
}

export function ContractRegisterTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [natureFilter, setNatureFilter] = useState("all")
  const [contractTypeFilter, setContractTypeFilter] = useState("all")
  const [rows, setRows] = useState<RegisterContractRow[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Download dialog state
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [downloadingContractId, setDownloadingContractId] = useState<string | null>(null)
  const [downloadDocuments, setDownloadDocuments] = useState<DocumentRow[]>([])
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null)

  const searchRef = useRef(searchQuery)
  searchRef.current = searchQuery

  const loadRegisters = useCallback(
    async (
      targetPage: number,
      pageLimit?: number,
      overrideStatus?: string,
      overrideNature?: string,
      overrideContractType?: string
    ) => {
      setLoading(true)
      try {
        const params: ContractRegisterFetchParams = {
          page: targetPage,
          limit: pageLimit ?? limit,
        }
        const s = searchRef.current.trim()
        if (s) params.search = s
        const st = overrideStatus ?? statusFilter
        const nature = overrideNature ?? natureFilter
        const cType = overrideContractType ?? contractTypeFilter
        if (st !== "all") params.status = st
        if (nature !== "all") params.nature_of_contract = nature
        if (cType !== "all") params.contract_type = cType

        const res = await fetchUserContractRegister(params)
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
    [limit, statusFilter, natureFilter, contractTypeFilter]
  )

  useEffect(() => {
    void loadRegisters(1, limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tableData = useMemo(
    () =>
      rows.map((item) => ({
        contractId: item.contract_id ?? "",
        transactionNumber: item.transaction_number ?? "-",
        title: item.contract_title ?? item.subject ?? "-",
        type: item.contract_type ?? "-",
        nature: item.nature_of_contract ?? "-",
        category: CATEGORY_LABELS[item.category ?? ""] ?? item.category ?? "-",
        contractNumber: item.contract_number ?? "-",
        dateOfIssue: formatDate(item.contract_start_date),
        dateOfExpiration: formatDate(item.contract_end_date),
      })),
    [rows]
  )

  const isFiltered =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    natureFilter !== "all" ||
    contractTypeFilter !== "all"

  const openDownloadDialog = async (contractId: string) => {
    if (!contractId) return
    setDownloadingContractId(contractId)
    setDownloadDocuments([])
    setDownloadLoading(true)
    setDownloadDialogOpen(true)
    try {
      const res = await fetchContractDetail(contractId)
      if (res.success && res.data) {
        setDownloadDocuments((res.data.documents as DocumentRow[]) ?? [])
      }
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleDownloadDoc = async (doc: DocumentRow) => {
    setDownloadingDocId(doc.document_id)
    try {
      await downloadDocumentAuthorized(doc.document_id, doc.document_name)
    } finally {
      setDownloadingDocId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
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
                    onClick={() => {
                      setSearchQuery("")
                      searchRef.current = ""
                    }}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={natureFilter}
                onValueChange={(v) => {
                  setNatureFilter(v)
                  setPage(1)
                  void loadRegisters(1, limit, undefined, v)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Natures</SelectItem>
                  <SelectItem value="Goods">Goods</SelectItem>
                  <SelectItem value="Works">Works</SelectItem>
                  <SelectItem value="Consultancy/Services">Consultancy/Services</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={contractTypeFilter}
                onValueChange={(v) => {
                  setContractTypeFilter(v)
                  setPage(1)
                  void loadRegisters(1, limit, undefined, undefined, v)
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Renewal">Renewal</SelectItem>
                  <SelectItem value="Supplemental">Supplemental</SelectItem>
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
                  Showing <span className="font-semibold text-foreground">{tableData.length}</span> of {total} records
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
                  void loadRegisters(1, limit, "all", "all", "all")
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
                  <TableHead className="font-semibold whitespace-nowrap">Transaction #</TableHead>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Type</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Nature</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Category</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Contract #</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Date of Issue</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">Date of Expiration</TableHead>
                  <TableHead className="font-semibold w-[90px] text-center">Download</TableHead>
                  <TableHead className="font-semibold w-[80px] text-center">Renew</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && tableData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                      Loading...
                    </TableCell>
                  </TableRow>
                )}
                {tableData.map((item) => (
                  <TableRow key={item.contractId || item.contractNumber} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm font-semibold text-primary whitespace-nowrap">
                      {item.transactionNumber}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm" title={item.title}>
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.type === "New" ? "border-green-200 bg-green-50 text-green-700 whitespace-nowrap" :
                        item.type === "Renewal" ? "border-blue-200 bg-blue-50 text-blue-700 whitespace-nowrap" :
                        "border-amber-200 bg-amber-50 text-amber-700 whitespace-nowrap"
                      }>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.nature === "Works" ? "border-orange-200 bg-orange-50 text-orange-700 whitespace-nowrap" :
                        item.nature === "Goods" ? "border-blue-200 bg-blue-50 text-blue-700 whitespace-nowrap" :
                        "border-purple-200 bg-purple-50 text-purple-700 whitespace-nowrap"
                      }>
                        {item.nature}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-[140px] truncate" title={item.category}>
                      {item.category}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium whitespace-nowrap">
                      {item.contractNumber}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{item.dateOfIssue}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{item.dateOfExpiration}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                        disabled={!item.contractId}
                        onClick={() => void openDownloadDialog(item.contractId)}
                        title="Download contract documents"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        asChild
                        title="Submit a renewal"
                      >
                        <Link href="/contracts">
                          <RefreshCw className="h-4 w-4" />
                          <span className="sr-only">Renew</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && tableData.length === 0 && (
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

      {/* Download Documents Dialog */}
      <Dialog open={downloadDialogOpen} onOpenChange={(open) => { if (!open) setDownloadingContractId(null); setDownloadDialogOpen(open) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              Contract Documents
            </DialogTitle>
            <DialogDescription>
              Download the documents attached to this contract.
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
              <p className="text-sm text-muted-foreground py-4">No documents available for this contract.</p>
            )}
            {!downloadLoading && downloadDocuments.map((doc) => (
              <div
                key={doc.document_id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.document_name}</p>
                    {doc.document_type_label && (
                      <p className="text-xs text-muted-foreground">{doc.document_type_label}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  disabled={downloadingDocId === doc.document_id}
                  onClick={() => void handleDownloadDoc(doc)}
                >
                  {downloadingDocId === doc.document_id ? (
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
