"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { 
  Mail, 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  FileText,
  MessageSquare,
  History,
  Send,
  Paperclip,
  Download,
  Edit,
  MoreHorizontal,
  Flag,
  UserPlus,
  XCircle,
  PlayCircle,
  PauseCircle,
  ArrowRight
} from "lucide-react"
import { formatDate } from "@/lib/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

// Mock case data
const mockCase = {
  id: "COR-2026-00140",
  subject: "Legal Opinion - Public Procurement Act Amendment",
  description: "Request for legal opinion regarding proposed amendments to the Public Procurement Act. The Ministry seeks guidance on constitutional implications and compliance with international trade agreements.",
  type: "Advisory",
  status: "ASSIGNED",
  stage: "PROCESS",
  urgency: "normal",
  confidential: false,
  originatingEntity: "Ministry of Finance",
  contactPerson: "John Smith",
  contactEmail: "john.smith@mof.gov.bb",
  contactPhone: "+1 246 555-0123",
  submitter: "John Smith",
  assignedOfficer: "Sarah Thompson",
  assignedOfficerId: "1",
  supervisingOfficer: "Director General Solicitor",
  dateReceived: "2026-03-10",
  dateAssigned: "2026-03-11",
  dueDate: "2026-03-24",
  slaStatus: "on_track",
  daysRemaining: 8,
  directive: "Please review with particular attention to CARICOM trade obligations.",
  fileReference: "REG/ADV/2026/045"
}

const documents = [
  { id: "1", name: "Amendment Proposal Draft.pdf", type: "PDF", size: "2.4 MB", uploadedBy: "John Smith", uploadedAt: "2026-03-10", category: "submission" },
  { id: "2", name: "Current Act Annotated.pdf", type: "PDF", size: "1.8 MB", uploadedBy: "John Smith", uploadedAt: "2026-03-10", category: "submission" },
  { id: "3", name: "CARICOM Trade Agreement Excerpt.pdf", type: "PDF", size: "890 KB", uploadedBy: "Sarah Thompson", uploadedAt: "2026-03-12", category: "reference" },
]

const activities = [
  { id: "1", type: "status_change", description: "Status changed from PENDING_REVIEW to ASSIGNED", user: "Director General Solicitor", timestamp: "2026-03-11T09:30:00", details: "Assigned to Sarah Thompson" },
  { id: "2", type: "comment", description: "Added internal note", user: "Sarah Thompson", timestamp: "2026-03-12T14:15:00", details: "Reviewed submission documents. Will need to consult CARICOM obligations." },
  { id: "3", type: "document", description: "Uploaded document", user: "Sarah Thompson", timestamp: "2026-03-12T14:45:00", details: "CARICOM Trade Agreement Excerpt.pdf" },
  { id: "4", type: "task", description: "Task completed", user: "Sarah Thompson", timestamp: "2026-03-13T10:00:00", details: "Initial document review completed" },
]

const tasks = [
  { id: "1", title: "Review submission documents", status: "completed", assignee: "Sarah Thompson", dueDate: "2026-03-13", completedAt: "2026-03-13" },
  { id: "2", title: "Research CARICOM trade obligations", status: "in_progress", assignee: "Sarah Thompson", dueDate: "2026-03-17", completedAt: null },
  { id: "3", title: "Draft legal opinion", status: "pending", assignee: "Sarah Thompson", dueDate: "2026-03-20", completedAt: null },
  { id: "4", title: "Supervisor review", status: "pending", assignee: "Director General Solicitor", dueDate: "2026-03-22", completedAt: null },
]

const comments = [
  { id: "1", author: "Director General Solicitor", content: "Please review with particular attention to CARICOM trade obligations.", timestamp: "2026-03-11T09:30:00", isInternal: true },
  { id: "2", author: "Sarah Thompson", content: "Reviewed submission documents. The proposed amendments appear straightforward but will need to verify compatibility with existing trade agreements.", timestamp: "2026-03-12T14:15:00", isInternal: true },
]

const workflowStages = [
  { code: "INTAKE", label: "Intake", completed: true, current: false },
  { code: "REVIEW", label: "SG/DSG Review", completed: true, current: false },
  { code: "PROCESS", label: "Processing", completed: false, current: true },
  { code: "APPROVAL", label: "Approval", completed: false, current: false },
  { code: "DISPATCH", label: "Dispatch", completed: false, current: false },
  { code: "CLOSE", label: "Closed", completed: false, current: false },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-100 text-blue-700" },
  PENDING_REVIEW: { label: "Pending Review", color: "bg-purple-100 text-purple-700" },
  ASSIGNED: { label: "Assigned", color: "bg-teal-100 text-teal-700" },
  PENDING_EXTERNAL: { label: "Pending External", color: "bg-amber-100 text-amber-700" },
  ON_HOLD: { label: "On Hold", color: "bg-slate-100 text-slate-700" },
  CLOSED: { label: "Closed", color: "bg-green-100 text-green-700" },
}

const slaConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  on_track: { label: "On Track", color: "text-green-700", bgColor: "bg-green-100" },
  at_risk: { label: "At Risk", color: "text-amber-700", bgColor: "bg-amber-100" },
  breached: { label: "Breached", color: "text-red-700", bgColor: "bg-red-100" },
}

export default function CorrespondenceCaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string
  const [activeTab, setActiveTab] = useState("details")
  const [newComment, setNewComment] = useState("")
  const [isInternalComment, setIsInternalComment] = useState(true)

  const status = statusConfig[mockCase.status]
  const sla = slaConfig[mockCase.slaStatus]

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/case-management/correspondence/workqueue">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workqueue
          </Link>
        </Button>
      </div>

      {/* Case Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold font-mono">{mockCase.id}</h1>
                <Badge className="bg-white/20 text-white">{mockCase.type}</Badge>
                {mockCase.confidential && (
                  <Badge className="bg-red-500/80 text-white">Confidential</Badge>
                )}
              </div>
              <p className="text-lg text-white/90">{mockCase.subject}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {mockCase.originatingEntity}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {mockCase.assignedOfficer}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due: {formatDate(mockCase.dueDate)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Advance Stage
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Reassign
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Change Urgency
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Put On Hold
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Send className="h-4 w-4 mr-2" />
                  Request Clarification
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Case
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ArrowRight className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={`mt-1 ${status.color}`}>{status.label}</Badge>
              </div>
              <CheckCircle className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Stage</p>
                <p className="text-lg font-semibold mt-1">Processing</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Status</p>
                <Badge className={`mt-1 ${sla.bgColor} ${sla.color}`}>{sla.label}</Badge>
              </div>
              {mockCase.slaStatus === "on_track" ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-2xl font-bold mt-1">{mockCase.daysRemaining}</p>
              </div>
              <Calendar className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {workflowStages.map((stage, index) => (
              <div key={stage.code} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stage.completed 
                      ? "bg-green-500 text-white" 
                      : stage.current 
                        ? "bg-blue-500 text-white ring-4 ring-blue-200" 
                        : "bg-slate-200 text-slate-500"
                  }`}>
                    {stage.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${stage.current ? "font-semibold text-blue-600" : "text-muted-foreground"}`}>
                    {stage.label}
                  </span>
                </div>
                {index < workflowStages.length - 1 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 ${
                    stage.completed ? "bg-green-500" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Reference Number</Label>
                    <p className="font-mono">{mockCase.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">File Reference</Label>
                    <p className="font-mono">{mockCase.fileReference || "Not assigned"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p>{mockCase.type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Urgency</Label>
                    <p className="capitalize">{mockCase.urgency}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date Received</Label>
                    <p>{formatDate(mockCase.dateReceived)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date Assigned</Label>
                    <p>{formatDate(mockCase.dateAssigned)}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{mockCase.description}</p>
                </div>
                {mockCase.directive && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">SG/DSG Directive</Label>
                      <p className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                        {mockCase.directive}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parties & Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Originating Entity</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p>{mockCase.originatingEntity}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact Person</Label>
                  <div className="mt-1 space-y-1">
                    <p>{mockCase.contactPerson}</p>
                    <p className="text-sm text-muted-foreground">{mockCase.contactEmail}</p>
                    <p className="text-sm text-muted-foreground">{mockCase.contactPhone}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Assigned Legal Officer</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p>{mockCase.assignedOfficer}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Supervising Officer</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p>{mockCase.supervisingOfficer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Documents</CardTitle>
              <Button size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size} - Uploaded by {doc.uploadedBy} on {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{doc.category}</Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tasks</CardTitle>
              <Button size="sm">
                Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        task.status === "completed" 
                          ? "bg-green-100 text-green-600"
                          : task.status === "in_progress"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                      }`}>
                        {task.status === "completed" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : task.status === "in_progress" ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.assignee} - Due {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{task.status.replace("_", " ")}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments & Communications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment Input */}
              <div className="space-y-3">
                <Textarea 
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="internal" 
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="internal" className="text-sm">Internal only (not visible to submitter)</Label>
                  </div>
                  <Button size="sm" disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className={`p-4 rounded-lg ${comment.isInternal ? "bg-amber-50 border border-amber-200" : "bg-muted"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {comment.isInternal && (
                        <Badge variant="outline" className="text-amber-700 border-amber-300">Internal</Badge>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative pl-10">
                      <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "status_change" 
                          ? "bg-blue-100 text-blue-600"
                          : activity.type === "comment"
                            ? "bg-amber-100 text-amber-600"
                            : activity.type === "document"
                              ? "bg-green-100 text-green-600"
                              : "bg-purple-100 text-purple-600"
                      }`}>
                        {activity.type === "status_change" && <ArrowRight className="h-4 w-4" />}
                        {activity.type === "comment" && <MessageSquare className="h-4 w-4" />}
                        {activity.type === "document" && <FileText className="h-4 w-4" />}
                        {activity.type === "task" && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.user} - {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
