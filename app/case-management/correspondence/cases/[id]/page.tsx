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
  ArrowRight,
  Hash,
  Phone,
  MapPin,
  Shield,
  FolderOpen,
  Upload
} from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils/date-utils"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"

// Mock case data with COMPLETE properties per configuration workbook (TAB 3)
const mockCase = {
  // Core Identification
  trackingNumber: "COR-2026-00140",
  caseType: "Correspondence",
  
  // Classification
  correspondenceType: "Advisory",
  
  // Submission Details
  submissionChannel: "Portal",
  dateReceived: "2026-03-10T11:20:00",
  
  // Originating Entity
  originatingEntity: "Ministry of Finance",
  externalSubmitterType: "Ministry/Department",
  
  // External Contact Details
  externalContactName: "John Smith",
  externalContactJobTitle: "Legal Counsel",
  externalContactAddress: null, // Only for Public submitters
  externalContactTelephone: "+1 246 555-0123",
  externalContactEmail: "john.smith@mof.gov.bb",
  externalReferenceNo: "MOF/LEG/2026/015",
  entityId: "MOF-001",
  
  // Subject Matter
  subjectMatter: "Request for legal opinion regarding proposed amendments to the Public Procurement Act. The Ministry seeks guidance on constitutional implications and compliance with international trade agreements including CARICOM obligations.",
  
  // File Types & References
  fileTypes: ["Advisory File", "Foreign / Ministry File"],
  existingFileRefs: ["REG/ADV/2025/089", "REG/MIN/2024/112"],
  
  // Flags
  confidentialFlag: false,
  urgencyFlag: false,
  
  // Assignment
  assignedOfficer: "Sarah Thompson",
  assignedOfficerId: "ST-001",
  assignedOfficerEmail: "s.thompson@sgc.gov.bb",
  
  // Case Status
  caseStatus: "ASSIGNED",
  caseStatusLabel: "Assigned",
  
  // Registry File Association
  registryFileAssocStatus: "Complete",
  
  // SLA Details
  dueDate: "2026-03-24",
  slaStatus: "on_track",
  daysRemaining: 8,
  
  // SG/DSG Review Details
  reviewedBy: "Director General Solicitor",
  reviewDate: "2026-03-11T09:30:00",
  directive: "Please review with particular attention to CARICOM trade obligations. Coordinate with Ministry of Foreign Affairs if required.",
  priority: "normal",
  
  // Security Profile
  securityProfile: "Registry-Standard",
  
  // Bring Up Date (for follow-up)
  bringUpDate: null,
  
  // Dispatch Details (when completed)
  dispatchDate: null,
  closureDate: null
}

const workflowStages = [
  { id: "INTAKE", name: "Intake", status: "completed", completedDate: "2026-03-10" },
  { id: "REVIEW", name: "SG/DSG Review", status: "completed", completedDate: "2026-03-11" },
  { id: "FILE_ASSOC", name: "File Association", status: "completed", completedDate: "2026-03-11", parallel: true },
  { id: "PROCESS", name: "Processing", status: "current" },
  { id: "APPROVAL", name: "Approval", status: "pending" },
  { id: "DISPATCH", name: "Dispatch", status: "pending" },
  { id: "CLOSE", name: "Closed", status: "pending" },
]

const documents = [
  { id: "1", name: "Amendment Proposal Draft.pdf", documentClass: "Incoming Correspondence", size: "2.4 MB", uploadedBy: "John Smith (MOF)", uploadedAt: "2026-03-10", category: "submission" },
  { id: "2", name: "Current Act Annotated.pdf", documentClass: "Supporting Documents", size: "1.8 MB", uploadedBy: "John Smith (MOF)", uploadedAt: "2026-03-10", category: "submission" },
  { id: "3", name: "CARICOM Trade Agreement Excerpt.pdf", documentClass: "Supporting Documents", size: "890 KB", uploadedBy: "Sarah Thompson", uploadedAt: "2026-03-12", category: "reference" },
  { id: "4", name: "Registry Cover Sheet.pdf", documentClass: "Registry Cover Sheet", size: "45 KB", uploadedBy: "System", uploadedAt: "2026-03-10", category: "system" },
]

const activities = [
  { id: "1", type: "intake", description: "Case created via portal submission", user: "System", timestamp: "2026-03-10T11:20:00", details: "Tracking number assigned: COR-2026-00140" },
  { id: "2", type: "intake_validation", description: "Intake validation completed", user: "Registry Clerk", timestamp: "2026-03-10T14:30:00", details: "All mandatory fields captured" },
  { id: "3", type: "file_assoc", description: "File association completed", user: "Registry File Officer", timestamp: "2026-03-11T10:15:00", details: "Linked to existing files: REG/ADV/2025/089, REG/MIN/2024/112" },
  { id: "4", type: "review", description: "SG/DSG review completed", user: "Director General Solicitor", timestamp: "2026-03-11T09:30:00", details: "Assigned to Sarah Thompson with directive" },
  { id: "5", type: "assignment", description: "Case assigned to Legal Officer", user: "Director General Solicitor", timestamp: "2026-03-11T09:30:00", details: "Assigned to Sarah Thompson" },
  { id: "6", type: "document", description: "Document uploaded", user: "Sarah Thompson", timestamp: "2026-03-12T14:45:00", details: "CARICOM Trade Agreement Excerpt.pdf" },
  { id: "7", type: "comment", description: "Internal note added", user: "Sarah Thompson", timestamp: "2026-03-12T14:15:00", details: "Reviewed submission documents. Will need to consult CARICOM obligations." },
]

const tasks = [
  { id: "1", title: "Review submission documents", status: "completed", dueDate: "2026-03-12", assignee: "Sarah Thompson", completedDate: "2026-03-12" },
  { id: "2", title: "Draft legal opinion", status: "in_progress", dueDate: "2026-03-20", assignee: "Sarah Thompson" },
  { id: "3", title: "Submit for SG/DSG approval", status: "pending", dueDate: "2026-03-22", assignee: "Sarah Thompson" },
  { id: "4", title: "Finalize and dispatch response", status: "pending", dueDate: "2026-03-24", assignee: "Registry" },
]

const comments = [
  { id: "1", author: "Sarah Thompson", timestamp: "2026-03-12T14:15:00", content: "Reviewed submission documents. The proposed amendments have significant implications for CARICOM trade obligations. Will need to research precedents.", isInternal: true },
  { id: "2", author: "Director General Solicitor", timestamp: "2026-03-11T09:35:00", content: "Please prioritize this matter. Ministry has requested response by end of month.", isInternal: true },
]

export default function CorrespondenceCaseDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("details")
  const [newComment, setNewComment] = useState("")
  const [isInternalComment, setIsInternalComment] = useState(true)

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500"
      case "current": return "bg-blue-500"
      default: return "bg-gray-300"
    }
  }

  const getSlaColor = (status: string) => {
    switch (status) {
      case "on_track": return "text-emerald-600 bg-emerald-50"
      case "at_risk": return "text-amber-600 bg-amber-50"
      case "overdue": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getCorrespondenceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "General": "bg-gray-100 text-gray-800",
      "Litigation": "bg-red-100 text-red-800",
      "Compensation": "bg-amber-100 text-amber-800",
      "Public Trustee": "bg-purple-100 text-purple-800",
      "Advisory": "bg-blue-100 text-blue-800",
      "International Law": "bg-teal-100 text-teal-800",
      "Cabinet/Confidential": "bg-rose-100 text-rose-800"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/case-management/correspondence/workqueue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{mockCase.trackingNumber}</h1>
            <Badge className="bg-blue-100 text-blue-800">{mockCase.caseStatusLabel}</Badge>
            <Badge className={getCorrespondenceTypeColor(mockCase.correspondenceType)}>
              {mockCase.correspondenceType}
            </Badge>
            {mockCase.urgencyFlag && (
              <Badge className="bg-red-500 text-white">Urgent</Badge>
            )}
            {mockCase.confidentialFlag && (
              <Badge className="bg-purple-500 text-white">
                <Shield className="h-3 w-3 mr-1" />
                Confidential
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-1">{mockCase.subjectMatter.substring(0, 100)}...</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit Case</DropdownMenuItem>
              <DropdownMenuItem><Upload className="h-4 w-4 mr-2" /> Upload Document</DropdownMenuItem>
              <DropdownMenuItem><UserPlus className="h-4 w-4 mr-2" /> Reassign</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Send className="h-4 w-4 mr-2" /> Submit for Approval</DropdownMenuItem>
              <DropdownMenuItem><Flag className="h-4 w-4 mr-2" /> Mark Urgent</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><PauseCircle className="h-4 w-4 mr-2" /> Put On Hold</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600"><XCircle className="h-4 w-4 mr-2" /> Cancel Case</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {workflowStages.filter(s => !s.parallel).map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getStageStatusColor(stage.status)}`}>
                    {stage.status === "completed" ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-center max-w-[80px]">{stage.name}</span>
                  {stage.completedDate && (
                    <span className="text-xs text-muted-foreground">{formatDate(stage.completedDate)}</span>
                  )}
                </div>
                {index < workflowStages.filter(s => !s.parallel).length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${stage.status === "completed" ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          {/* SLA Info */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={getSlaColor(mockCase.slaStatus)}>
                <Clock className="h-3 w-3 mr-1" />
                {mockCase.daysRemaining} days remaining
              </Badge>
              <span className="text-sm text-muted-foreground">Due: {formatDate(mockCase.dueDate)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Stage: <span className="font-medium">{workflowStages.find(s => s.status === "current")?.name || "N/A"}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Case Details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="details" className="space-y-6">
          {/* Core Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Core Identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-medium">{mockCase.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Case Type</p>
                  <p className="font-medium">{mockCase.caseType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correspondence Type</p>
                  <Badge className={getCorrespondenceTypeColor(mockCase.correspondenceType)}>
                    {mockCase.correspondenceType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submission Channel</p>
                  <p className="font-medium">{mockCase.submissionChannel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Matter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Subject Matter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{mockCase.subjectMatter}</p>
            </CardContent>
          </Card>

          {/* Originating Entity & Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Originating Entity & Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Originating Entity</p>
                    <p className="font-medium text-lg">{mockCase.originatingEntity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">External Submitter Type</p>
                    <Badge variant="outline">{mockCase.externalSubmitterType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">External Reference No.</p>
                    <p className="font-medium">{mockCase.externalReferenceNo || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-3 pl-4 border-l-2 border-blue-200">
                  <p className="text-sm font-medium text-muted-foreground">Contact Details</p>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{mockCase.externalContactName}</p>
                  </div>
                  {mockCase.externalContactJobTitle && (
                    <div>
                      <p className="text-sm text-muted-foreground">Job Title</p>
                      <p className="font-medium">{mockCase.externalContactJobTitle}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{mockCase.externalContactEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{mockCase.externalContactTelephone}</p>
                  </div>
                  {mockCase.externalContactAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <p>{mockCase.externalContactAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Types & References */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                File Types & References
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">File Types</p>
                  <div className="flex flex-wrap gap-2">
                    {mockCase.fileTypes.map((type, index) => (
                      <Badge key={index} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Existing File References</p>
                  {mockCase.existingFileRefs && mockCase.existingFileRefs.length > 0 ? (
                    <div className="space-y-1">
                      {mockCase.existingFileRefs.map((ref, index) => (
                        <p key={index} className="font-mono text-sm">{ref}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No existing files linked</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registry File Association Status</p>
                  <Badge className={mockCase.registryFileAssocStatus === "Complete" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                    {mockCase.registryFileAssocStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date Received</p>
                  <p className="font-medium">{formatDate(mockCase.dateReceived)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SLA Due Date</p>
                  <p className="font-medium">{formatDate(mockCase.dueDate)}</p>
                </div>
                {mockCase.bringUpDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bring Up Date</p>
                    <p className="font-medium">{formatDate(mockCase.bringUpDate)}</p>
                  </div>
                )}
                {mockCase.dispatchDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dispatch Date</p>
                    <p className="font-medium">{formatDate(mockCase.dispatchDate)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Assignment & Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Officer</p>
                  <p className="font-medium">{mockCase.assignedOfficer}</p>
                  <p className="text-xs text-muted-foreground">{mockCase.assignedOfficerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reviewed By</p>
                  <p className="font-medium">{mockCase.reviewedBy}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(mockCase.reviewDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Case Status</p>
                  <Badge className="bg-blue-100 text-blue-800">{mockCase.caseStatusLabel}</Badge>
                </div>
              </div>
              {mockCase.directive && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">SG/DSG Directive:</p>
                  <p className="text-sm text-blue-700">{mockCase.directive}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flags & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Flags & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Confidential</p>
                  <Badge variant={mockCase.confidentialFlag ? "destructive" : "outline"}>
                    {mockCase.confidentialFlag ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                  <Badge variant={mockCase.urgencyFlag ? "destructive" : "outline"}>
                    {mockCase.urgencyFlag ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Security Profile</p>
                  <p className="font-medium">{mockCase.securityProfile}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge variant="outline" className="capitalize">{mockCase.priority}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Documents</CardTitle>
                <CardDescription>All documents associated with this correspondence</CardDescription>
              </div>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Document Class</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.documentClass}</Badge>
                      </TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
              <CardDescription>Complete history of case activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "intake" ? "bg-emerald-100 text-emerald-600" :
                        activity.type === "assignment" || activity.type === "review" ? "bg-blue-100 text-blue-600" :
                        activity.type === "document" ? "bg-purple-100 text-purple-600" :
                        activity.type === "file_assoc" ? "bg-teal-100 text-teal-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {activity.type === "intake" || activity.type === "intake_validation" ? <Mail className="h-4 w-4" /> :
                         activity.type === "assignment" ? <UserPlus className="h-4 w-4" /> :
                         activity.type === "review" ? <CheckCircle className="h-4 w-4" /> :
                         activity.type === "document" ? <FileText className="h-4 w-4" /> :
                         activity.type === "file_assoc" ? <FolderOpen className="h-4 w-4" /> :
                         activity.type === "comment" ? <MessageSquare className="h-4 w-4" /> :
                         <History className="h-4 w-4" />}
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-px h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.user} - {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks</CardTitle>
              <CardDescription>Active tasks for this case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        className="h-4 w-4"
                        readOnly
                      />
                      <div>
                        <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.assignee} - Due {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      task.status === "completed" ? "default" :
                      task.status === "in_progress" ? "default" : "outline"
                    } className={task.status === "completed" ? "bg-emerald-100 text-emerald-800" : ""}>
                      {task.status === "completed" ? "Completed" :
                       task.status === "in_progress" ? "In Progress" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMMENTS TAB */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Comments */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className={`p-4 rounded-lg ${comment.isInternal ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.author}</span>
                        {comment.isInternal && (
                          <Badge variant="outline" className="text-amber-700 border-amber-300">Internal</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDateTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="internal"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="internal" className="text-sm">Internal note (not visible to submitter)</Label>
                </div>
                <Textarea
                  placeholder="Add a comment or note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
