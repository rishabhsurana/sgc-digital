"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  User,
  Building2,
  Mail,
  Phone,
  Shield,
  Users,
  UserPlus,
  Calendar,
  Hash,
  Briefcase,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Pencil,
  X,
  Check,
} from "lucide-react"
import { RequireAuthGuard } from "@/components/require-auth-guard"
import { AskRex } from "@/components/ask-rex"
import { getUser } from "@/lib/auth"
import { apiGet, apiPost, apiRequest } from "@/lib/api-client"
import { Label } from "@/components/ui/label"

/* ─── Types ─────────────────────────────────────────────── */

interface EntityData {
  id: string
  entity_number: string
  entity_name: string
  entity_type: string
  is_active: boolean
  mda?: { id: number; name: string; code: string; type: string | null } | null
}

interface ProfileData {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  submitter_type: string
  organization: string | null
  department: string | null
  status: string
  entity_number: string
  entity_id: string | null
  mda_id: number | null
  can_submit_contracts: boolean
  last_login: string | null
  created_at: string
  entity?: EntityData | null
  mda?: { id: number; name: string; code: string; type: string | null } | null
}

interface EntityUser {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: string
  submitter_type: string
  department: string | null
  status: string
  last_login: string | null
  created_at: string
}

/* ─── Helpers ────────────────────────────────────────────── */

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return "—"
  const d = new Date(raw)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
  if (status === "inactive")
    return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>
  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{formatLabel(status)}</Badge>
}

/* ─── Inline Edit Field ──────────────────────────────────── */

interface InlineEditFieldProps {
  icon: React.ElementType
  label: string
  value: string | null | undefined
  displayValue?: React.ReactNode
  fieldKey: "email" | "phone" | "organization"
  onSave: (field: "email" | "phone" | "organization", value: string) => Promise<string | null>
  placeholder?: string
  type?: string
}

function InlineEditField({
  icon: Icon,
  label,
  value,
  displayValue,
  fieldKey,
  onSave,
  placeholder,
  type = "text",
}: InlineEditFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? "")
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState("")

  const handleEdit = () => {
    setDraft(value ?? "")
    setFieldError("")
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setFieldError("")
  }

  const handleSave = async () => {
    setSaving(true)
    setFieldError("")
    const err = await onSave(fieldKey, draft)
    setSaving(false)
    if (err) {
      setFieldError(err)
    } else {
      setEditing(false)
    }
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        {editing ? (
          <div className="mt-1 space-y-1.5">
            <Input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave()
                if (e.key === "Escape") handleCancel()
              }}
            />
            {fieldError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {fieldError}
              </p>
            )}
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                <span className="ml-1">Save</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-3 w-3" />
                <span className="ml-1">Cancel</span>
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="cursor-pointer mt-0.5 flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 -mx-2 text-left hover:bg-blue-50 transition-colors group"
            title={`Edit ${label}`}
          >
            <p className="text-sm font-medium text-slate-800 break-all">
              {displayValue ?? value ?? <span className="text-slate-400">Not provided</span>}
            </p>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Static Detail Row ──────────────────────────────────── */

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800 break-all">{value}</p>
      </div>
    </div>
  )
}

/* ─── Add User Dialog ────────────────────────────────────── */

interface AddUserDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const MIN_PASSWORD_LENGTH = 8

function AddUserDialog({ open, onClose, onSuccess }: AddUserDialogProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setFullName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setConfirmPassword("")
    setDepartment("")
    setError("")
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail) {
      setError("Full name and email are required.")
      return
    }
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password is required and must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password.trim().length === 0) {
      setError("Password cannot be blank or whitespace only.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setSubmitting(true)
    setError("")
    const res = await apiPost("/api/profile/add-user", {
      full_name: trimmedName,
      email: trimmedEmail.toLowerCase(),
      phone: phone.trim() || null,
      password,
      role: "secondary",
      department: department.trim() || null,
    })
    setSubmitting(false)
    if (!res.success) {
      setError(res.error || "Failed to add user.")
      return
    }
    reset()
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Add User to Entity
          </DialogTitle>
          <DialogDescription>
            The new user will be linked to your entity and can log in with the provided credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="add-fullname">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="add-fullname"
              placeholder="e.g. Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-email">Email Address <span className="text-red-500">*</span></Label>
            <Input
              id="add-email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-phone">Phone Number</Label>
            <Input
              id="add-phone"
              placeholder="+1 246 XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="add-password"
              type="password"
              placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-slate-400">
              Share this password with the user securely. They can change it after first login.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-password-confirm">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="add-password-confirm"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-dept">Department</Label>
            <Input
              id="add-dept"
              placeholder="e.g. Legal"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              New users are added as <span className="font-medium text-slate-500">Secondary</span> users.
              Primary entity users must be provisioned by SGC management.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */

function ProfilePageInner() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [entityUsers, setEntityUsers] = useState<EntityUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const localUser = getUser()

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    const [profileRes, usersRes] = await Promise.all([
      apiGet<ProfileData>("/api/profile"),
      apiGet<EntityUser[]>("/api/profile/entity-users"),
    ])
    if (!profileRes.success || !profileRes.data) {
      setError(profileRes.error || "Failed to load profile.")
    } else {
      setProfile(profileRes.data)
    }
    if (usersRes.success && Array.isArray(usersRes.data)) {
      setEntityUsers(usersRes.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleFieldSave = async (
    field: "email" | "phone" | "organization",
    value: string
  ): Promise<string | null> => {
    const res = await apiRequest<ProfileData>("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ [field]: value || null }),
    })
    if (!res.success) {
      return res.error || "Failed to save."
    }
    if (res.data) {
      setProfile(res.data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    return null
  }

  const entityName =
    profile?.entity?.entity_name ||
    profile?.mda?.name ||
    profile?.organization ||
    localUser?.organization ||
    "My Entity"

  const entityNumber =
    profile?.entity?.entity_number ||
    profile?.entity_number ||
    localUser?.entity_number ||
    "—"

  const primaryUser =
    entityUsers.find((u) => u.role.toLowerCase() === "primary") ??
    entityUsers[0] ??
    null

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading profile…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void load()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const displayProfile = profile || (localUser as unknown as ProfileData)

  const canManageEntityUsers =
    (displayProfile?.role || "").toLowerCase() === "primary"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Hero Banner */}
      <div data-testid="profile-hero" className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 px-4 py-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white" />
          <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Entity icon */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm ring-4 ring-white/30">
              <Building2 className="h-10 w-10" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-blue-100 uppercase tracking-widest mb-1">
                Entity Profile
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {entityName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-blue-100">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  {entityNumber}
                </span>
                {primaryUser?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {primaryUser.email}
                  </span>
                )}
                {primaryUser?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {primaryUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save success toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm text-white shadow-lg">
          <CheckCircle className="h-4 w-4" />
          Profile updated successfully
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Tabs defaultValue="details">
          <TabsList className="mb-6 bg-white shadow-sm border border-slate-200 rounded-xl p-1">
            <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Building2 className="mr-2 h-4 w-4" />
              Entity Details
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" />
              Entity Users
              {entityUsers.length > 0 && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  {entityUsers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Entity Details ── */}
          <TabsContent value="details">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Entity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  <div>
                    <InlineEditField
                      icon={Mail}
                      label="Email Address"
                      value={displayProfile?.email}
                      fieldKey="email"
                      onSave={handleFieldSave}
                      placeholder="email@example.com"
                      type="email"
                    />

                    <InlineEditField
                      icon={Phone}
                      label="Phone Number"
                      value={displayProfile?.phone}
                      displayValue={displayProfile?.phone ?? <span className="text-slate-400">Not provided</span>}
                      fieldKey="phone"
                      onSave={handleFieldSave}
                      placeholder="+1 246 XXX XXXX"
                    />

                    <InlineEditField
                      icon={Building2}
                      label="Ministry / Organization"
                      value={displayProfile?.organization}
                      displayValue={displayProfile?.organization ?? <span className="text-slate-400">Not provided</span>}
                      fieldKey="organization"
                      onSave={handleFieldSave}
                      placeholder="e.g. Ministry of Finance"
                    />

                    {(displayProfile as ProfileData)?.department && (
                      <DetailRow
                        icon={Briefcase}
                        label="Department"
                        value={(displayProfile as ProfileData).department!}
                      />
                    )}
                    <DetailRow
                      icon={Calendar}
                      label="Member Since"
                      value={formatDate(profile?.created_at)}
                    />
                    {(displayProfile as ProfileData)?.last_login && (
                      <DetailRow
                        icon={Clock}
                        label="Last Login"
                        value={formatDate((displayProfile as ProfileData).last_login)}
                      />
                    )}
                  </div>

                  <div>
                    {profile?.entity ? (
                      <>
                        <DetailRow icon={Building2} label="Entity Name" value={profile.entity.entity_name} />
                        <DetailRow
                          icon={Hash}
                          label="Entity Number"
                          value={<span className="text-sm">{profile.entity.entity_number}</span>}
                        />
                        <DetailRow
                          icon={Briefcase}
                          label="Entity Type"
                          value={profile.entity.entity_type.toUpperCase()}
                        />
                        <DetailRow
                          icon={CheckCircle}
                          label="Entity Status"
                          value={
                            profile.entity.is_active ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>
                            )
                          }
                        />
                        {profile.entity.mda && (
                          <>
                            <DetailRow
                              icon={Building2}
                              label="Associated MDA"
                              value={profile.entity.mda.name}
                            />
                            <DetailRow
                              icon={Hash}
                              label="MDA Code"
                              value={<span className="text-sm">{profile.entity.mda.code}</span>}
                            />
                            {profile.entity.mda.type && (
                              <DetailRow
                                icon={Briefcase}
                                label="MDA Type"
                                value={profile.entity.mda.type}
                              />
                            )}
                          </>
                        )}
                      </>
                    ) : profile?.mda ? (
                      <>
                        <DetailRow icon={Building2} label="MDA Name" value={profile.mda.name} />
                        <DetailRow
                          icon={Hash}
                          label="MDA Code"
                          value={<span className="text-sm">{profile.mda.code}</span>}
                        />
                        {profile.mda.type && (
                          <DetailRow icon={Briefcase} label="MDA Type" value={profile.mda.type} />
                        )}
                        <DetailRow
                          icon={Hash}
                          label="Entity Number"
                          value={<span className="text-sm">{entityNumber}</span>}
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Entity Users ── */}
          <TabsContent value="users">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-blue-600" />
                  Users in This Entity
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {entityUsers.length}
                  </span>
                </CardTitle>
                {canManageEntityUsers && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {entityUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead className="font-semibold text-slate-600">Name</TableHead>
                          <TableHead className="font-semibold text-slate-600">Email</TableHead>
                          <TableHead className="font-semibold text-slate-600">Role</TableHead>
                          <TableHead className="font-semibold text-slate-600">Department</TableHead>
                          <TableHead className="font-semibold text-slate-600">Status</TableHead>
                          <TableHead className="font-semibold text-slate-600">Last Login</TableHead>
                          <TableHead className="font-semibold text-slate-600">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entityUsers.map((u) => (
                          <TableRow key={u.id} className="hover:bg-slate-50/70">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                  {u.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                </div>
                                {u.full_name}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600">{u.email}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                {formatLabel(u.role)}
                              </span>
                            </TableCell>
                            <TableCell className="text-slate-500">
                              {u.department || <span className="text-slate-300">—</span>}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={u.status} />
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {formatDate(u.last_login)}
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {formatDate(u.created_at)}
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
      </div>

      {canManageEntityUsers && (
        <AddUserDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSuccess={() => {
            setAddDialogOpen(false)
            void load()
          }}
        />
      )}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <RequireAuthGuard returnPath="/profile">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <ProfilePageInner />
        </main>
        <Footer />
        <AskRex />
      </div>
    </RequireAuthGuard>
  )
}
