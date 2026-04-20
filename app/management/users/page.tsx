"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Mail,
  Building2,
  Calendar,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Users,
  Filter,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  X
} from "lucide-react"
import { apiPut } from "@/lib/api-client"
import type { StaffRegistrationRequest } from "@/lib/data/types"
import {
  createManagementUserApi,
  createPortalUserApi,
  deletePortalUserApi,
  fetchAllPortalUsers,
  fetchManagementUsers,
  fetchMdasForSelect,
  fetchStaffRequestOptions,
  fetchStaffRequestsRaw,
  mapPortalRow,
  updateManagementUserApi,
  updatePortalUserApi,
  updatePortalUserStatusApi,
  type ManagementUserApiRow,
  type PortalUserRow,
  type StaffRequestOptions,
  type MdaOption,
} from "@/lib/user-management-api"
import { sameUuid } from "@/lib/utils/uuid"
import { toast } from "sonner"

const PORTAL_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800" },
  { value: "suspended", label: "Suspended", color: "bg-red-100 text-red-800" },
]

const PORTAL_ROLE_OPTIONS = [
  { value: "submitter", label: "Submitter" },
  { value: "reviewer", label: "Reviewer" },
  { value: "user", label: "User" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
]

const SUBMITTER_TYPES = [
  { value: "public", label: "Public" },
  { value: "ministry", label: "Ministry" },
  { value: "mda_staff", label: "MDA Staff" },
  { value: "statutory_body", label: "Statutory body" },
  { value: "attorney", label: "Attorney" },
  { value: "other", label: "Other" },
]

const MANAGEMENT_ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
]

const MANAGEMENT_ROLE_RANK: Record<string, number> = {
  manager: 1,
  admin: 2,
  super_admin: 3,
}

function managementRoleRank(role: string | null | undefined): number {
  if (!role) return 0
  return MANAGEMENT_ROLE_RANK[role.toLowerCase()] ?? 0
}

const MIN_PASSWORD_LENGTH = 8

const STAFF_REQUEST_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

function mapStaffRequestFromApi(
  row: Record<string, unknown>,
  options: StaffRequestOptions | null
): StaffRegistrationRequest {
  const departmentId = Number(row.department_id)
  const requestedRoleId = Number(row.requested_role_id)
  const statusId = Number(row.status_id)
  const dept = options?.departments.find((d) => d.department_id === departmentId)
  const role = options?.roles.find((r) => r.role_id === requestedRoleId)
  return {
    requestId: String(row.request_id ?? ""),
    requestNumber: String(row.request_number ?? ""),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    phone: row.phone != null ? String(row.phone) : null,
    departmentId,
    position: String(row.position ?? ""),
    employeeId: row.employee_id != null ? String(row.employee_id) : null,
    supervisorName: row.supervisor_name != null ? String(row.supervisor_name) : null,
    supervisorEmail: row.supervisor_email != null ? String(row.supervisor_email) : null,
    requestedRoleId,
    justification: row.justification != null ? String(row.justification) : null,
    statusId,
    reviewedBy: row.reviewed_by != null ? String(row.reviewed_by) : null,
    reviewedAt: row.reviewed_at ? new Date(String(row.reviewed_at)) : null,
    reviewNotes: row.review_notes != null ? String(row.review_notes) : null,
    approvedUserId: row.approved_user_id != null ? String(row.approved_user_id) : null,
    createdAt: new Date(String(row.created_at ?? "")),
    updatedAt: new Date(String(row.updated_at ?? row.created_at ?? "")),
    departmentName: dept?.department_name,
    requestedRoleName: role?.role_name,
    statusName:
      statusId === 1 ? "Pending" : statusId === 2 ? "Approved" : statusId === 3 ? "Rejected" : "Unknown",
  }
}

function currentManagementJwtRole(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("sgc_user")
    if (!raw) return null
    const u = JSON.parse(raw) as { role?: string }
    return u.role ? String(u.role) : null
  } catch {
    return null
  }
}

function currentManagementJwtUserId(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("sgc_user")
    if (!raw) return null
    const u = JSON.parse(raw) as { id?: string }
    return u.id ? String(u.id) : null
  } catch {
    return null
  }
}

function formatDateSafe(value: Date | string | null | undefined, fallback = "—"): string {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString()
}

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("portal")
  const [staffSearchQuery, setStaffSearchQuery] = useState("")
  const [staffStatusFilter, setStaffStatusFilter] = useState("pending")

  const [portalUsers, setPortalUsers] = useState<PortalUserRow[]>([])
  const [managementUsers, setManagementUsers] = useState<ManagementUserApiRow[]>([])
  const [staffRequests, setStaffRequests] = useState<StaffRegistrationRequest[]>([])
  const [mdas, setMdas] = useState<MdaOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Dialog state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddMgmtUserOpen, setIsAddMgmtUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isEditMgmtUserOpen, setIsEditMgmtUserOpen] = useState(false)
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Selected items
  const [selectedUser, setSelectedUser] = useState<PortalUserRow | null>(null)
  const [selectedMgmtUser, setSelectedMgmtUser] = useState<ManagementUserApiRow | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<StaffRegistrationRequest | null>(null)
  
  // Form state
  const [rejectReason, setRejectReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    submitterType: "public",
    mdaId: "",
    department: "",
    position: "",
    role: "submitter",
  })

  const [newMgmtUserForm, setNewMgmtUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager",
    department: "",
  })

  const [editPortalForm, setEditPortalForm] = useState({
    role: "submitter",
    status: "active",
    department: "",
    phone: "",
  })

  const [editMgmtForm, setEditMgmtForm] = useState({
    role: "manager",
    department: "",
    isActive: true,
  })

  // After creating a user, if the backend generated a throw-away password
  // we surface it once here so the admin can hand it off securely.
  const [createdCredential, setCreatedCredential] = useState<{
    email: string
    password: string
    label: string
  } | null>(null)

  // Tracks pre-flight validation errors surfaced inside the create dialogs.
  const [createUserError, setCreateUserError] = useState<string | null>(null)
  const [createMgmtUserError, setCreateMgmtUserError] = useState<string | null>(null)

  // Caller's role on the management portal. Used to hide affordances that
  // the backend won't accept (e.g. a plain `manager` cannot create/modify
  // management users post the role-hierarchy fix).
  const callerManagementRole = currentManagementJwtRole()
  const callerManagementId = currentManagementJwtUserId()
  const canManageAccounts = managementRoleRank(callerManagementRole) >= managementRoleRank("admin")

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [portalRows, options, staffRaw, mgmtRows, mdaList] = await Promise.all([
        fetchAllPortalUsers(),
        fetchStaffRequestOptions(),
        fetchStaffRequestsRaw(),
        fetchManagementUsers(),
        fetchMdasForSelect(),
      ])
      setPortalUsers(portalRows.map(mapPortalRow))
      const opt = options
      setStaffRequests(
        staffRaw.map((row) => mapStaffRequestFromApi(row as Record<string, unknown>, opt))
      )
      setManagementUsers(mgmtRows)
      setMdas(mdaList)
    } catch (error) {
      console.error("Error loading data:", error)
      setLoadError(error instanceof Error ? error.message : "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const submitterTypeLabel = (value: string) =>
    SUBMITTER_TYPES.find((t) => t.value === value)?.label || value || "—"

  const filteredPortalUsers = portalUsers.filter((user) => {
    const searchLower = searchQuery.toLowerCase().trim()
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const matchesSearch =
      searchLower === '' ||
      fullName.includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.organizationLabel.toLowerCase().includes(searchLower)
    const matchesRole = roleFilter === "all" || user.submitterType === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const isFiltered =
    searchQuery.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all'

  // Filter pending requests
  const pendingRequests = staffRequests.filter(r => r.statusId === 1)
  const requestStatusValue = (statusId: number) =>
    statusId === 1 ? "pending" : statusId === 2 ? "approved" : statusId === 3 ? "rejected" : "other"

  const filteredStaffRequests = staffRequests
    .filter((request) => {
      const q = staffSearchQuery.trim().toLowerCase()
      const matchesSearch =
        q === "" ||
        request.requestNumber.toLowerCase().includes(q) ||
        `${request.firstName} ${request.lastName}`.toLowerCase().includes(q) ||
        request.email.toLowerCase().includes(q) ||
        String(request.departmentName || "").toLowerCase().includes(q) ||
        String(request.requestedRoleName || "").toLowerCase().includes(q)
      const matchesStatus =
        staffStatusFilter === "all" || staffStatusFilter === requestStatusValue(request.statusId)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const priority: Record<number, number> = { 1: 0, 2: 1, 3: 2 }
      const statusDiff = (priority[a.statusId] ?? 9) - (priority[b.statusId] ?? 9)
      if (statusDiff !== 0) return statusDiff
      return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
    })

  const getPortalStatusBadge = (status: string) => {
    const s = PORTAL_STATUSES.find((x) => x.value === status)
    return (
      <Badge variant="outline" className={s?.color || "bg-gray-100"}>
        {s?.label || status || "Unknown"}
      </Badge>
    )
  }

  const getPortalRoleBadge = (role: string, submitterType?: string) => {
    const r = String(role || "").toLowerCase()
    if (r === "super_admin" || r === "admin") {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          <ShieldCheck className="h-3 w-3 mr-1" />
          {role}
        </Badge>
      )
    }
    if (r === "manager" || r === "reviewer") {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          {role}
        </Badge>
      )
    }
    if (r === "submitter") {
      return <Badge className="bg-slate-100 text-slate-800">{submitterTypeLabel(String(submitterType || ""))}</Badge>
    }
    return <Badge variant="outline">{role || "—"}</Badge>
  }

  const getManagementRoleBadge = (role: string) => {
    const r = String(role || "").toLowerCase()
    if (r === "super_admin") {
      return (
        <Badge className="bg-red-100 text-red-800">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      )
    }
    if (r === "admin") {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-100 text-blue-800">
        <Shield className="h-3 w-3 mr-1" />
        Manager
      </Badge>
    )
  }

  // Handle approve staff request
  const handleApproveRequest = async (request: StaffRegistrationRequest) => {
    setIsSubmitting(true)
    try {
      const result = await apiPut(`/api/staff-requests/${request.requestId}/approve`, {
        reviewNotes: "Approved via User Management",
      })
      if (result.success) {
        await loadData() // Refresh data
        setIsViewRequestOpen(false)
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error("Error approving request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reject staff request
  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectReason.trim()) return
    
    setIsSubmitting(true)
    try {
      const result = await apiPut(`/api/staff-requests/${selectedRequest.requestId}/reject`, {
        reviewNotes: rejectReason,
      })
      if (result.success) {
        await loadData()
        setIsRejectDialogOpen(false)
        setIsViewRequestOpen(false)
        setSelectedRequest(null)
        setRejectReason("")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await updatePortalUserStatusApi(userId, newStatus)
      if (res.success) await loadData()
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    // Defense in depth: the UI already hides the "Delete" menu item for
    // non-admin callers, but refuse to fire the request at all if the caller
    // doesn't have account-management privileges. The backend will reject it
    // too, but this avoids a misleading "Deleting…" spinner.
    if (!canManageAccounts) {
      toast.error("You do not have permission to delete users.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await deletePortalUserApi(selectedUser.id)
      if (res.success) {
        await loadData()
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        toast.success("User deleted.")
      } else {
        toast.error(res.error || "Failed to delete user.")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete user.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreatePortalUser = async () => {
    setCreateUserError(null)

    const firstName = newUserForm.firstName.trim()
    const lastName = newUserForm.lastName.trim()
    const email = newUserForm.email.trim().toLowerCase()
    const password = newUserForm.password

    if (!firstName || !lastName || !email) {
      setCreateUserError("First name, last name, and email are required.")
      return
    }
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!EMAIL_RE.test(email)) {
      setCreateUserError("Please enter a valid email address.")
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setCreateUserError(
        `Password is required and must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      )
      return
    }
    if (password.trim().length === 0) {
      setCreateUserError("Password cannot be blank or whitespace only.")
      return
    }

    setIsSubmitting(true)
    try {
      const mdaId = newUserForm.mdaId ? parseInt(newUserForm.mdaId, 10) : null
      const res = await createPortalUserApi({
        firstName,
        lastName,
        email,
        password,
        phone: newUserForm.phone.trim() || undefined,
        role: newUserForm.role,
        submitter_type: newUserForm.submitterType,
        department: newUserForm.department.trim() || undefined,
        mda_id: mdaId || undefined,
        organizationId: mdaId || undefined,
      })
      if (res.success) {
        await loadData()
        setIsAddUserOpen(false)
        setNewUserForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          submitterType: "public",
          mdaId: "",
          department: "",
          position: "",
          role: "submitter",
        })
      } else {
        setCreateUserError(res.error || "Failed to create user.")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setCreateUserError(error instanceof Error ? error.message : "Failed to create user.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditPortalUser = (user: PortalUserRow) => {
    setSelectedUser(user)
    setEditPortalForm({
      role: user.role,
      status: user.status,
      department: user.department || "",
      phone: user.phone || "",
    })
    setIsEditUserOpen(true)
  }

  const handleSavePortalUser = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      const full_name = `${selectedUser.firstName} ${selectedUser.lastName}`.trim()
      const res = await updatePortalUserApi(selectedUser.id, {
        full_name,
        role: editPortalForm.role,
        status: editPortalForm.status,
        department: editPortalForm.department.trim() || null,
        phone: editPortalForm.phone.trim() || null,
      })
      if (res.success) {
        await loadData()
        setIsEditUserOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Error saving user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateManagementUser = async () => {
    setCreateMgmtUserError(null)

    const name = newMgmtUserForm.name.trim()
    const email = newMgmtUserForm.email.trim().toLowerCase()
    const password = newMgmtUserForm.password

    if (!name || !email) {
      setCreateMgmtUserError("Name and email are required.")
      return
    }
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!EMAIL_RE.test(email)) {
      setCreateMgmtUserError("Please enter a valid email address.")
      return
    }
    // The admin can either supply their own password for the new account, or
    // leave it blank and let the backend generate a strong one we show below.
    if (password.length > 0) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        setCreateMgmtUserError(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters, or leave blank to auto-generate one.`,
        )
        return
      }
      if (password.trim().length === 0) {
        setCreateMgmtUserError(
          "Password cannot be blank or whitespace only. Leave the field empty to auto-generate one.",
        )
        return
      }
    }

    setIsSubmitting(true)
    try {
      const res = await createManagementUserApi({
        email,
        name,
        password: password.length > 0 ? password : undefined,
        role: newMgmtUserForm.role,
        department: newMgmtUserForm.department.trim() || null,
      })
      if (res.success) {
        await loadData()
        setIsAddMgmtUserOpen(false)
        const generated = res.data?.temporary_password
        if (generated) {
          // Only shown once — render the reveal dialog with a copy button.
          setCreatedCredential({
            email,
            password: generated,
            label: "Management user",
          })
        } else {
          // Admin supplied the password themselves, so there's nothing to
          // reveal. Confirm the account was created so the UI doesn't go
          // silent (the dialog just closes).
          toast.success(`Management user ${email} created.`)
        }
        setNewMgmtUserForm({
          name: "",
          email: "",
          password: "",
          role: "manager",
          department: "",
        })
      } else {
        setCreateMgmtUserError(res.error || "Failed to create management user.")
      }
    } catch (error) {
      console.error("Error creating management user:", error)
      setCreateMgmtUserError(
        error instanceof Error ? error.message : "Failed to create management user.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditMgmtUser = (user: ManagementUserApiRow) => {
    setSelectedMgmtUser(user)
    setEditMgmtForm({
      role: user.role,
      department: user.department || "",
      isActive: user.is_active,
    })
    setIsEditMgmtUserOpen(true)
  }

  const handleSaveMgmtUser = async () => {
    if (!selectedMgmtUser) return
    setIsSubmitting(true)
    try {
      const res = await updateManagementUserApi(selectedMgmtUser.id, {
        role: editMgmtForm.role,
        department: editMgmtForm.department.trim() || null,
        is_active: editMgmtForm.isActive,
      })
      if (res.success) {
        await loadData()
        setIsEditMgmtUserOpen(false)
        setSelectedMgmtUser(null)
      }
    } catch (error) {
      console.error("Error saving management user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPortalUsers = portalUsers.length
  const activePortalUsers = portalUsers.filter((u) => u.status === "active").length
  const pendingRequestsCount = pendingRequests.length
  const totalManagementUsers = managementUsers.filter((u) => u.is_active).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 text-white mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
              <p className="mt-1 text-white/80">Manage portal users, access permissions, and staff registration requests</p>
            </div>
          </div>
          <Dialog
            open={isAddUserOpen}
            onOpenChange={(open) => {
              setIsAddUserOpen(open)
              if (!open) setCreateUserError(null)
            }}
          >
            {canManageAccounts && (
              <DialogTrigger asChild>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for the SGC Digital portal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 overflow-y-auto pr-1">
                {createUserError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {createUserError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="First name"
                      value={newUserForm.firstName}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Last name"
                      value={newUserForm.lastName}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@example.gov.bb"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portal-password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="portal-password"
                    type="password"
                    placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Share this password with the user over a secure channel. They can change it after
                    first login.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 246 XXX XXXX"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitter-type">Submitter type</Label>
                  <Select
                    value={newUserForm.submitterType}
                    onValueChange={(value) => setNewUserForm((prev) => ({ ...prev, submitterType: value }))}
                  >
                    <SelectTrigger id="submitter-type">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBMITTER_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(newUserForm.submitterType === "ministry" || newUserForm.submitterType === "mda_staff") && (
                  <div className="space-y-2">
                    <Label htmlFor="mda">MDA / Ministry</Label>
                    <Select
                      value={newUserForm.mdaId}
                      onValueChange={(value) => setNewUserForm((prev) => ({ ...prev, mdaId: value }))}
                    >
                      <SelectTrigger id="mda">
                        <SelectValue placeholder="Select MDA" />
                      </SelectTrigger>
                      <SelectContent>
                        {mdas.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="department-txt">Department (optional)</Label>
                  <Input
                    id="department-txt"
                    placeholder="Unit or department name"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position (Optional)</Label>
                  <Input 
                    id="position" 
                    placeholder="Job title"
                    value={newUserForm.position}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Portal role</Label>
                  <Select 
                    value={newUserForm.role}
                    onValueChange={(value) => setNewUserForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {PORTAL_ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-2 border-t shrink-0">
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePortalUser} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPortalUsers}</p>
                <p className="text-xs text-muted-foreground">Portal users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePortalUsers}</p>
                <p className="text-xs text-muted-foreground">Active portal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={pendingRequestsCount > 0 ? "border-yellow-300 bg-yellow-50/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <ClipboardList className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequestsCount}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalManagementUsers}</p>
                <p className="text-xs text-muted-foreground">Management admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Users and Requests */}
      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Portal users
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Management / Admin
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Staff requests
            {pendingRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Portal users tab */}
        <TabsContent value="portal" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or organization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Submitter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Submitter Types</SelectItem>
                    {SUBMITTER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {PORTAL_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search Results Feedback */}
              {isFiltered && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Showing <span className="font-semibold text-foreground">{filteredPortalUsers.length}</span> of {portalUsers.length} users
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
                      setSearchQuery('')
                      setRoleFilter('all')
                      setStatusFilter('all')
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

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {filteredPortalUsers.length} user{filteredPortalUsers.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPortalUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                              {(user.firstName[0] || "?").toUpperCase()}
                              {(user.lastName[0] || "").toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{user.organizationLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getPortalRoleBadge(user.role, user.submitterType)}</TableCell>
                        <TableCell>{getPortalStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateSafe(user.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDateSafe(user.lastLoginAt, "Never")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {/* <DropdownMenuItem onClick={() => openEditPortalUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem> */}
                              {user.status !== "active" && (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={() => handleUpdateUserStatus(user.id, "active")}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {user.status === "active" && (
                                <DropdownMenuItem
                                  className="text-yellow-600"
                                  onClick={() => handleUpdateUserStatus(user.id, "inactive")}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                              {canManageAccounts && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Management &amp; admin accounts</CardTitle>
                <CardDescription>
                  Users who sign in at <span className="font-medium">/management/login</span> (separate from portal
                  accounts).
                </CardDescription>
              </div>
              {canManageAccounts && (
                <Button onClick={() => setIsAddMgmtUserOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add management user
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {managementUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No management users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {managementUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                          <TableCell>{getManagementRoleBadge(u.role)}</TableCell>
                          <TableCell>{u.department || "—"}</TableCell>
                          <TableCell>
                            {u.is_active ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateSafe(u.created_at ?? (u as { createdAt?: string | null }).createdAt)}
                          </TableCell>
                          <TableCell>
                            {canManageAccounts &&
                              managementRoleRank(u.role) <= managementRoleRank(callerManagementRole) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditMgmtUser(u)}
                                  aria-label={`Edit ${u.name}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Registration Requests</CardTitle>
              <CardDescription>
                Review and approve staff access requests to the Management Portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by request #, applicant, email, department, or role..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {staffSearchQuery && (
                    <button
                      onClick={() => setStaffSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={staffStatusFilter} onValueChange={setStaffStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STAFF_REQUEST_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredStaffRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No staff registration requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request #</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Requested Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaffRequests.map((request) => (
                        <TableRow key={request.requestId} className={request.statusId === 1 ? "bg-yellow-50/50" : ""}>
                          <TableCell className="font-mono text-sm">{request.requestNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.firstName} {request.lastName}</p>
                              <p className="text-xs text-muted-foreground">{request.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{request.departmentName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.requestedRoleName}</Badge>
                          </TableCell>
                          <TableCell>
                            {request.statusId === 1 && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            {request.statusId === 2 && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                            {request.statusId === 3 && (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDateSafe(request.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setSelectedRequest(request); setIsViewRequestOpen(true); }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.statusId === 1 && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApproveRequest(request)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => { setSelectedRequest(request); setIsRejectDialogOpen(true); }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isAddMgmtUserOpen}
        onOpenChange={(open) => {
          setIsAddMgmtUserOpen(open)
          if (!open) setCreateMgmtUserError(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add management user</DialogTitle>
            <DialogDescription>
              Creates an account for the management portal. Sign-in uses the same email and password at{" "}
              <span className="font-medium">/management/login</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {createMgmtUserError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {createMgmtUserError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="mgmt-name">Full name</Label>
              <Input
                id="mgmt-name"
                value={newMgmtUserForm.name}
                onChange={(e) => setNewMgmtUserForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mgmt-email">Email</Label>
              <Input
                id="mgmt-email"
                type="email"
                value={newMgmtUserForm.email}
                onChange={(e) => setNewMgmtUserForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mgmt-password">Password</Label>
              <Input
                id="mgmt-password"
                type="password"
                placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters (or leave blank to auto-generate)`}
                value={newMgmtUserForm.password}
                onChange={(e) => setNewMgmtUserForm((p) => ({ ...p, password: e.target.value }))}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank and we&apos;ll generate a strong one-time password that&apos;s displayed
                after the user is created — share it securely and ask them to change it.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newMgmtUserForm.role}
                onValueChange={(value) => setNewMgmtUserForm((p) => ({ ...p, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANAGEMENT_ROLE_OPTIONS.filter(
                    (r) => managementRoleRank(r.value) <= managementRoleRank(callerManagementRole),
                  ).map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mgmt-dept">Department (optional)</Label>
              <Input
                id="mgmt-dept"
                value={newMgmtUserForm.department}
                onChange={(e) => setNewMgmtUserForm((p) => ({ ...p, department: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMgmtUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateManagementUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditUserOpen}
        onOpenChange={(open) => {
          setIsEditUserOpen(open)
          if (!open) setSelectedUser(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit portal user</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName} · ${selectedUser.email}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editPortalForm.role}
                  onValueChange={(value) => setEditPortalForm((p) => ({ ...p, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTAL_ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                    {selectedUser &&
                    !PORTAL_ROLE_OPTIONS.some((r) => r.value === selectedUser.role) ? (
                      <SelectItem value={selectedUser.role}>{selectedUser.role}</SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editPortalForm.status}
                  onValueChange={(value) => setEditPortalForm((p) => ({ ...p, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTAL_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editPortalForm.phone}
                  onChange={(e) => setEditPortalForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dept">Department</Label>
                <Input
                  id="edit-dept"
                  value={editPortalForm.department}
                  onChange={(e) => setEditPortalForm((p) => ({ ...p, department: e.target.value }))}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePortalUser} disabled={isSubmitting || !selectedUser}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditMgmtUserOpen}
        onOpenChange={(open) => {
          setIsEditMgmtUserOpen(open)
          if (!open) setSelectedMgmtUser(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit management user</DialogTitle>
            <DialogDescription>
              {selectedMgmtUser ? `${selectedMgmtUser.name} · ${selectedMgmtUser.email}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedMgmtUser ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editMgmtForm.role}
                  onValueChange={(value) => setEditMgmtForm((p) => ({ ...p, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGEMENT_ROLE_OPTIONS.filter(
                      (r) => managementRoleRank(r.value) <= managementRoleRank(callerManagementRole),
                    ).map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mgmt-dept">Department</Label>
                <Input
                  id="edit-mgmt-dept"
                  value={editMgmtForm.department}
                  onChange={(e) => setEditMgmtForm((p) => ({ ...p, department: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-mgmt-active"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={editMgmtForm.isActive}
                  disabled={!!selectedMgmtUser && sameUuid(selectedMgmtUser.id, callerManagementId)}
                  onChange={(e) => setEditMgmtForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <Label htmlFor="edit-mgmt-active" className="font-normal cursor-pointer">
                  Account active
                </Label>
              </div>
              {selectedMgmtUser && sameUuid(selectedMgmtUser.id, callerManagementId) && (
                <p className="text-xs text-muted-foreground">
                  You can&apos;t deactivate or demote your own account. Ask another admin to do so.
                </p>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMgmtUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMgmtUser} disabled={isSubmitting || !selectedMgmtUser}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={isViewRequestOpen} onOpenChange={setIsViewRequestOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Staff Registration Request</DialogTitle>
            <DialogDescription>
              Request #{selectedRequest?.requestNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Name</Label>
                  <p className="font-medium">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <p className="font-medium">{selectedRequest.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Position</Label>
                  <p className="font-medium">{selectedRequest.position || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Department</Label>
                  <p className="font-medium">{selectedRequest.departmentName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Requested Role</Label>
                  <p className="font-medium">{selectedRequest.requestedRoleName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Supervisor</Label>
                  <p className="font-medium">{selectedRequest.supervisorName || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Supervisor Email</Label>
                  <p className="font-medium">{selectedRequest.supervisorEmail || "N/A"}</p>
                </div>
              </div>
              {selectedRequest.justification && (
                <div>
                  <Label className="text-muted-foreground text-xs">Justification</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRequest.justification}</p>
                </div>
              )}
              {selectedRequest.reviewNotes && (
                <div>
                  <Label className="text-muted-foreground text-xs">Review Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRequest.reviewNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.statusId === 1 && (
              <>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setIsRejectDialogOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveRequest(selectedRequest)}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            {selectedRequest?.statusId !== 1 && (
              <Button variant="outline" onClick={() => setIsViewRequestOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Staff Registration Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this request. The applicant will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleRejectRequest}
              disabled={!rejectReason.trim() || isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* One-time credential reveal: shown after creating a user when the
          backend generates a throw-away password for us. */}
      <Dialog
        open={!!createdCredential}
        onOpenChange={(open) => {
          if (!open) setCreatedCredential(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>One-time password</DialogTitle>
            <DialogDescription>
              {createdCredential?.label} created. This is the only time this password will be shown —
              copy it now and share it with the user through a secure channel.
            </DialogDescription>
          </DialogHeader>
          {createdCredential && (
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="mt-1 font-mono text-sm">{createdCredential.email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Temporary password</Label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm break-all">
                    {createdCredential.password}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        void navigator.clipboard.writeText(createdCredential.password)
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Ask the user to sign in at <span className="font-medium">/management/login</span> and
                change their password immediately.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCreatedCredential(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
