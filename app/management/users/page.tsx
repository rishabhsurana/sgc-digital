"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Filter
} from "lucide-react"
import { MINISTRIES_DEPARTMENTS_AGENCIES } from "@/lib/constants"

// Mock user data
const MOCK_USERS = [
  {
    id: "USR-001",
    name: "John Smith",
    email: "john.smith@finance.gov.bb",
    role: "submitter",
    organization: "Ministry of Finance, Economic Affairs, and Investment",
    status: "active",
    registeredDate: "2024-01-15",
    lastLogin: "2024-03-01"
  },
  {
    id: "USR-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@health.gov.bb",
    role: "submitter",
    organization: "Ministry of Health and Wellness",
    status: "active",
    registeredDate: "2024-01-20",
    lastLogin: "2024-02-28"
  },
  {
    id: "USR-003",
    name: "Michael Brown",
    email: "michael.brown@education.gov.bb",
    role: "submitter",
    organization: "Ministry of Education, Technological and Vocational Training",
    status: "pending",
    registeredDate: "2024-02-25",
    lastLogin: null
  },
  {
    id: "USR-004",
    name: "Emily Davis",
    email: "emily.davis@transport.gov.bb",
    role: "submitter",
    organization: "Ministry of Transport, Works and Water Resources",
    status: "active",
    registeredDate: "2024-02-01",
    lastLogin: "2024-02-27"
  },
  {
    id: "USR-005",
    name: "James Wilson",
    email: "james.wilson@legal.gov.bb",
    role: "admin",
    organization: "Solicitor General's Chambers",
    status: "active",
    registeredDate: "2024-01-01",
    lastLogin: "2024-03-01"
  },
  {
    id: "USR-006",
    name: "Patricia Taylor",
    email: "patricia.taylor@customs.gov.bb",
    role: "submitter",
    organization: "Customs and Excise Department",
    status: "inactive",
    registeredDate: "2023-11-10",
    lastLogin: "2024-01-15"
  }
]

const ROLES = [
  { value: "submitter", label: "Submitter" },
  { value: "reviewer", label: "Reviewer" },
  { value: "admin", label: "Administrator" }
]

const STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800" }
]

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [users] = useState(MOCK_USERS)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.organization.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUSES.find(s => s.value === status)
    return (
      <Badge variant="outline" className={statusConfig?.color}>
        {statusConfig?.label}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case "reviewer":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3 mr-1" />
            Reviewer
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Submitter
          </Badge>
        )
    }
  }

  // Stats
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === "active").length
  const pendingUsers = users.filter(u => u.status === "pending").length
  const adminUsers = users.filter(u => u.role === "admin").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage portal users and access permissions</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
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
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="email@example.gov.bb" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select MDA" />
                  </SelectTrigger>
                  <SelectContent>
                    {MINISTRIES_DEPARTMENTS_AGENCIES.map((mda) => (
                      <SelectItem key={mda.value} value={mda.value}>
                        {mda.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddUserOpen(false)}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <ShieldAlert className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingUsers}</p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
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
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
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
                  <SelectItem key={status.value} value={status.value}>
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
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
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
                        <span className="truncate max-w-[200px]">{user.organization}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.registeredDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          {user.status === "pending" && (
                            <DropdownMenuItem className="text-green-600">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approve User
                            </DropdownMenuItem>
                          )}
                          {user.status === "active" && (
                            <DropdownMenuItem className="text-yellow-600">
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          {user.status === "inactive" && (
                            <DropdownMenuItem className="text-green-600">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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
    </div>
  )
}
