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
  Plus, 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
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
  Loader2
} from "lucide-react"
import { MINISTRIES_DEPARTMENTS_AGENCIES } from "@/lib/constants"
import { 
  getUsers, 
  getStaffRegistrationRequests, 
  approveStaffRequest, 
  rejectStaffRequest,
  updateUser,
  deleteUser,
  createUser,
  getUserRoles,
  getDepartments
} from "@/lib/data/data-service"
import type { UserProfile, StaffRegistrationRequest, UserRole, Department } from "@/lib/data/types"

const STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800", statusId: 5 },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800", statusId: 1 },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800", statusId: 6 },
  { value: "suspended", label: "Suspended", color: "bg-red-100 text-red-800", statusId: 4 }
]

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("users")
  
  // Data state
  const [users, setUsers] = useState<UserProfile[]>([])
  const [staffRequests, setStaffRequests] = useState<StaffRegistrationRequest[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Selected items
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
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
    departmentId: "",
    position: "",
    roleId: ""
  })

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersData, requestsData, rolesData, departmentsData] = await Promise.all([
        getUsers(),
        getStaffRegistrationRequests(),
        getUserRoles(),
        getDepartments()
      ])
      setUsers(usersData)
      setStaffRequests(requestsData)
      setRoles(rolesData)
      setDepartments(departmentsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesRole = roleFilter === "all" || user.roleId.toString() === roleFilter
    const matchesStatus = statusFilter === "all" || user.statusId.toString() === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // Filter pending requests
  const pendingRequests = staffRequests.filter(r => r.statusId === 1)

  const getStatusBadge = (statusId: number) => {
    const status = STATUSES.find(s => s.statusId === statusId)
    return (
      <Badge variant="outline" className={status?.color || "bg-gray-100"}>
        {status?.label || "Unknown"}
      </Badge>
    )
  }

  const getRoleBadge = (roleId: number) => {
    const role = roles.find(r => r.roleId === roleId)
    const roleName = role?.roleName || "Unknown"
    
    if (roleId === 8) { // Super Admin
      return (
        <Badge className="bg-red-100 text-red-800">
          <ShieldCheck className="h-3 w-3 mr-1" />
          {roleName}
        </Badge>
      )
    }
    if (roleId === 7) { // Admin
      return (
        <Badge className="bg-purple-100 text-purple-800">
          <ShieldCheck className="h-3 w-3 mr-1" />
          {roleName}
        </Badge>
      )
    }
    if (roleId === 6) { // Supervisor
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          {roleName}
        </Badge>
      )
    }
    if (roleId === 5) { // Staff
      return (
        <Badge className="bg-slate-100 text-slate-800">
          {roleName}
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        {roleName}
      </Badge>
    )
  }

  // Handle approve staff request
  const handleApproveRequest = async (request: StaffRegistrationRequest) => {
    setIsSubmitting(true)
    try {
      const result = await approveStaffRequest(request.requestId, "current-admin-id", "Approved via User Management")
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
      const result = await rejectStaffRequest(selectedRequest.requestId, "current-admin-id", rejectReason)
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

  // Handle update user status
  const handleUpdateUserStatus = async (userId: string, newStatusId: number) => {
    try {
      await updateUser(userId, { statusId: newStatusId })
      await loadData()
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    setIsSubmitting(true)
    try {
      const success = await deleteUser(selectedUser.userId)
      if (success) {
        await loadData()
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle create user
  const handleCreateUser = async () => {
    if (!newUserForm.firstName || !newUserForm.lastName || !newUserForm.email) return
    
    setIsSubmitting(true)
    try {
      await createUser({
        firstName: newUserForm.firstName,
        lastName: newUserForm.lastName,
        email: newUserForm.email,
        phone: newUserForm.phone || null,
        departmentId: newUserForm.departmentId ? parseInt(newUserForm.departmentId) : null,
        position: newUserForm.position || null,
        roleId: newUserForm.roleId ? parseInt(newUserForm.roleId) : 5,
        statusId: 5 // Active
      })
      await loadData()
      setIsAddUserOpen(false)
      setNewUserForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        departmentId: "",
        position: "",
        roleId: ""
      })
    } catch (error) {
      console.error("Error creating user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stats
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.statusId === 5).length
  const pendingRequestsCount = pendingRequests.length
  const adminUsers = users.filter(u => u.roleId === 7 || u.roleId === 8).length

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
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for the SGC Digital portal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={newUserForm.departmentId}
                    onValueChange={(value) => setNewUserForm(prev => ({ ...prev, departmentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.departmentId} value={dept.departmentId.toString()}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUserForm.roleId}
                    onValueChange={(value) => setNewUserForm(prev => ({ ...prev, roleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(r => r.roleId >= 5).map((role) => (
                        <SelectItem key={role.roleId} value={role.roleId.toString()}>
                          {role.roleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateUser} disabled={isSubmitting}>
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
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
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
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
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
                <p className="text-2xl font-bold">{adminUsers}</p>
                <p className="text-xs text-muted-foreground">Administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Users and Requests */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Staff Requests
            {pendingRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
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
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.roleId} value={role.roleId.toString()}>
                        {role.roleName}
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
                    {STATUSES.map((status) => (
                      <SelectItem key={status.statusId} value={status.statusId.toString()}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                              {user.firstName[0]}{user.lastName[0]}
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
                            <span className="truncate max-w-[200px]">{user.organizationName || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.roleId)}</TableCell>
                        <TableCell>{getStatusBadge(user.statusId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
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
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsEditUserOpen(true); }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              {user.statusId !== 5 && (
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => handleUpdateUserStatus(user.userId, 5)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {user.statusId === 5 && (
                                <DropdownMenuItem 
                                  className="text-yellow-600"
                                  onClick={() => handleUpdateUserStatus(user.userId, 6)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true); }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
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
              {staffRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No staff registration requests</p>
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
                      {staffRequests.map((request) => (
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
                              {new Date(request.createdAt).toLocaleDateString()}
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
