"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Plus, Search, MoreHorizontal, Edit, Trash2, Users, FileText, FileSignature } from "lucide-react"
import {
  createManagementMda,
  deleteManagementMda,
  fetchManagementMdas,
  type ManagementMdaItem,
  updateManagementMda,
} from "@/lib/dashboard-api"
import { ManagementPaginationBar } from "@/components/management/management-pagination-bar"

export default function MDAManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [rows, setRows] = useState<ManagementMdaItem[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ManagementMdaItem | null>(null)
  const [formCode, setFormCode] = useState("")
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<"Ministry" | "Department" | "Agency">("Ministry")
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active")
  const [submitting, setSubmitting] = useState(false)

  const loadMdas = useCallback(async (targetPage: number, targetLimit?: number) => {
    setLoading(true)
    setError("")
    const res = await fetchManagementMdas({
      page: targetPage,
      limit: targetLimit ?? limit,
      search: searchQuery,
      status: statusFilter as "all" | "active" | "inactive",
      type: typeFilter as "all" | "Ministry" | "Department" | "Agency",
    })
    if (res.success && Array.isArray(res.data)) {
      setRows(res.data)
      setTotal(res.pagination?.total ?? res.data.length)
      setTotalPages(res.pagination?.totalPages ?? 1)
      setPage(res.pagination?.page ?? targetPage)
    } else {
      setRows([])
      setTotal(0)
      setTotalPages(1)
      setError(res.error || "Failed to load MDAs.")
    }
    setLoading(false)
  }, [limit, searchQuery, statusFilter, typeFilter])

  useEffect(() => {
    void loadMdas(page, limit)
  }, [page, limit, loadMdas])

  const totalMDAs = total
  const activeMDAs = useMemo(() => rows.filter((m) => m.status === "active").length, [rows])
  const ministries = useMemo(() => rows.filter((m) => m.type === "Ministry").length, [rows])
  const departments = useMemo(() => rows.filter((m) => m.type === "Department").length, [rows])

  const openCreate = () => {
    setEditing(null)
    setFormCode("")
    setFormName("")
    setFormType("Ministry")
    setFormStatus("active")
    setDialogOpen(true)
  }

  const openEdit = (item: ManagementMdaItem) => {
    setEditing(item)
    setFormCode(item.code)
    setFormName(item.name)
    setFormType(item.type)
    setFormStatus(item.status)
    setDialogOpen(true)
  }

  const submitForm = async () => {
    if (!formCode.trim() || !formName.trim()) {
      setError("Code and name are required.")
      return
    }
    setSubmitting(true)
    setError("")
    const payload = {
      code: formCode.trim(),
      name: formName.trim(),
      type: formType,
      status: formStatus,
    }
    const res = editing
      ? await updateManagementMda(editing.id, payload)
      : await createManagementMda(payload)
    setSubmitting(false)
    if (!res.success) {
      setError(res.error || "Failed to save MDA.")
      return
    }
    setDialogOpen(false)
    void loadMdas(page, limit)
  }

  const onDelete = async (item: ManagementMdaItem) => {
    const confirmed = window.confirm(`Delete ${item.name}?`)
    if (!confirmed) return
    setLoading(true)
    const res = await deleteManagementMda(item.id)
    if (!res.success) {
      setError(res.error || "Failed to delete MDA.")
      setLoading(false)
      return
    }
    const isLastItemOnPage = rows.length === 1 && page > 1
    const nextPage = isLastItemOnPage ? page - 1 : page
    setPage(nextPage)
    await loadMdas(nextPage, limit)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">MDA Management</h1>
          <p className="text-muted-foreground">Manage Ministries, Departments, and Agencies</p>
        </div>
        <Button className="bg-primary" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add MDA
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit MDA" : "Add New MDA"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update ministry, department, or agency details." : "Add a new Ministry, Department, or Agency to the system."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mdaCode">MDA Code</Label>
                <Input id="mdaCode" placeholder="e.g., MOF" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mdaName">MDA Name</Label>
                <Input id="mdaName" placeholder="e.g., Ministry of Finance" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mdaType">Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as "Ministry" | "Department" | "Agency")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ministry">Ministry</SelectItem>
                    <SelectItem value="Department">Department</SelectItem>
                    <SelectItem value="Agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mdaStatus">Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as "active" | "inactive")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => void submitForm()} disabled={submitting}>
                {submitting ? "Saving..." : editing ? "Save Changes" : "Add MDA"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total MDAs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMDAs}</div>
            <p className="text-xs text-muted-foreground">Registered organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active MDAs</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeMDAs}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ministries</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{ministries}</div>
            <p className="text-xs text-muted-foreground">Government ministries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{departments}</div>
            <p className="text-xs text-muted-foreground">Government departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>MDA Registry</CardTitle>
          <CardDescription>View and manage all registered Ministries, Departments, and Agencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => {
              setTypeFilter(v)
              setPage(1)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Ministry">Ministry</SelectItem>
                <SelectItem value="Department">Department</SelectItem>
                <SelectItem value="Agency">Agency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Code</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold text-center">Correspondence</TableHead>
                  <TableHead className="font-semibold text-center">Contracts</TableHead>
                  <TableHead className="font-semibold text-center">Users</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm font-medium">{item.code}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={item.name}>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.type === "Ministry" ? "border-blue-200 bg-blue-50 text-blue-700" :
                        item.type === "Department" ? "border-purple-200 bg-purple-50 text-purple-700" :
                        "border-orange-200 bg-orange-50 text-orange-700"
                      }>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        {item.correspondenceCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileSignature className="h-3 w-3 text-muted-foreground" />
                        {item.contractsCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {item.usersCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                        {item.status === "active" ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => openEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => void onDelete(item)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No MDAs found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <ManagementPaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            loading={loading}
            onPageChange={(nextPage) => setPage(nextPage)}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit)
              setPage(1)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
