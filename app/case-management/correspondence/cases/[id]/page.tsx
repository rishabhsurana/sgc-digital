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
  Download,
  Edit,
  Flag,
  UserPlus,
  XCircle,
  PlayCircle,
  PauseCircle,
  Hash,
  Phone,
  MapPin,
  Shield,
  FolderOpen,
  Upload,
  Eye,
  Save,
  ChevronRight,
  ExternalLink,
  Briefcase,
  Archive,
  AlertCircle,
  CheckCircle2,
  Timer,
  FileCheck,
  Plus,
  MoreHorizontal
} from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Controlled vocabularies per Configuration Workbook
const CORRESPONDENCE_TYPES = [
  "General", "Litigation", "Compensation", "Public Trustee", "Advisory", "International Law", "Cabinet / Confidential"
]

const PRIORITY_LEVELS = ["Normal", "Urgent", "Critical"]

const SUBMITTER_TYPES = [
  "Ministry/Department", "Statutory Body", "Member of the Public", "Private Sector", "Regional/International Body"
]

const FILE_TYPES = ["Litigation", "Crown Grants", "Compensation", "Advisory", "General"]

const LEGAL_OFFICERS = [
  { id: "lo1", name: "Sarah Thompson" },
  { id: "lo2", name: "Michael Brown" },
  { id: "lo3", name: "Jennifer Lee" },
  { id: "lo4", name: "David Williams" },
  { id: "lo5", name: "Amanda Chen" },
]

// Mock current user (for role-based access)
const CURRENT_USER = {
  id: "sg1",
  name: "Sir Richard Cheltenham, KC",
  role: "sg", // 'sg' | 'dsg' | 'legal_officer' | 'registry_clerk'
  permissions: ["assign", "approve", "edit_dates", "view_all"]
}

// MOCK DATA - Simulating a case in PENDING_REVIEW status (not yet assigned)
const getMockCaseData = (id: string) => ({
  id,
  trackingNumber: `REG-2026-${id.padStart(5, '0')}`,
  status: "PENDING_REVIEW", // NEW, PENDING_REVIEW, ASSIGNED, IN_PROGRESS, PENDING_EXTERNAL, ON_HOLD, CLOSED
  workflowStage: "REVIEW",
  
  // Classification
  correspondenceType: "Advisory",
  priority: "Normal",
  isConfidential: false,
  isUrgent: false,
  
  // Subject
  subjectMatter: "Request for Legal Opinion on Proposed Amendment to the Companies Act regarding beneficial ownership disclosure requirements",
  
  // Dates
  dateReceived: "2026-03-14",
  dueDate: "2026-03-28",
  bringUpDate: "2026-03-21",
  targetCompletionDate: "2026-03-26",
  closedDate: null,
  
  // SLA
  slaDays: 14,
  daysElapsed: 2,
  daysRemaining: 12,
  slaStatus: "on_track", // on_track, at_risk, overdue
  
  // Originator / Contact
  originatingEntity: "Ministry of International Business",
  submitterType: "Ministry/Department",
  submissionChannel: "Portal",
  contactName: "Ms. Patricia Holder",
  contactJobTitle: "Permanent Secretary",
  contactPhone: "+1 (246) 535-1200",
  contactEmail: "pholder@mib.gov.bb",
  contactAddress: "Warrens Office Complex, Warrens, St. Michael",
  externalReferenceNo: "MIB/LGL/2026/045",
  
  // Correspondence Details
  fromWhom: "Permanent Secretary, Ministry of International Business",
  toWhom: "Solicitor General",
  fileReferenceNo: "SG/ADV/2026/123",
  volume: "1",
  folioMinuteNo: "15",
  
  // Assignment (null until assigned by SG/DSG)
  assignedOfficerId: null,
  assignedOfficerName: null,
  dateAssigned: null,
  sgDirective: null,
  sgDirectiveDate: null,
  returnToRegistryDirective: null,
  
  // File Association
  fileTypes: ["Advisory"],
  existingFileRefs: [],
  registryFileAssocStatus: "Pending",
  
  // External Liaisons
  liaiseAgencies: [],
})

// Mock documents
const getMockDocuments = () => [
  { id: "doc1", name: "Request_Letter_MIB.pdf", type: "Incoming Correspondence", size: "245 KB", uploadedBy: "Registry", uploadedAt: "2026-03-14T09:30:00", version: 1 },
  { id: "doc2", name: "Companies_Act_Amendment_Draft.pdf", type: "Supporting Document", size: "1.2 MB", uploadedBy: "Registry", uploadedAt: "2026-03-14T09:32:00", version: 1 },
  { id: "doc3", name: "Beneficial_Ownership_Guidelines.pdf", type: "Reference", size: "890 KB", uploadedBy: "Registry", uploadedAt: "2026-03-14T09:35:00", version: 1 },
]

// Mock activities
const getMockActivities = () => [
  { id: "a1", type: "intake", description: "Case received and logged by Registry", user: "Jane Roberts", timestamp: "2026-03-14T09:30:00" },
  { id: "a2", type: "document", description: "3 documents uploaded", user: "Jane Roberts", timestamp: "2026-03-14T09:35:00" },
  { id: "a3", type: "status", description: "Case submitted for SG/DSG review", user: "System", timestamp: "2026-03-14T10:00:00" },
]

// Mock tasks
const getMockTasks = () => [
  { id: "t1", title: "Review incoming correspondence", assignee: "SG/DSG", dueDate: "2026-03-15", status: "pending", priority: "high" },
  { id: "t2", title: "Assign to Legal Officer", assignee: "SG/DSG", dueDate: "2026-03-15", status: "pending", priority: "high" },
]

// Mock comments
const getMockComments = () => [
  { id: "c1", user: "Jane Roberts", role: "Registry Clerk", content: "All required documents received from MIB. Case ready for SG review.", timestamp: "2026-03-14T09:40:00" },
]

export default function CorrespondenceCaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string
  
  // State
  const [caseData, setCaseData] = useState(getMockCaseData(caseId))
  const [documents] = useState(getMockDocuments())
  const [activities, setActivities] = useState(getMockActivities())
  const [tasks, setTasks] = useState(getMockTasks())
  const [comments, setComments] = useState(getMockComments())
  const [activeTab, setActiveTab] = useState("details")
  const [newComment, setNewComment] = useState("")
  
  // Dialog states
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showEditDatesDialog, setShowEditDatesDialog] = useState(false)
  const [showEditClassificationDialog, setShowEditClassificationDialog] = useState(false)
  const [showEditContactDialog, setShowEditContactDialog] = useState(false)
  const [showEditReferencesDialog, setShowEditReferencesDialog] = useState(false)
  const [showEditFileAssocDialog, setShowEditFileAssocDialog] = useState(false)
  const [showLiaisonDialog, setShowLiaisonDialog] = useState(false)
  
  // Form states
  const [assignForm, setAssignForm] = useState({ officerId: "", dueDate: "", directive: "" })
  const [datesForm, setDatesForm] = useState({ 
    dueDate: caseData.dueDate, 
    bringUpDate: caseData.bringUpDate || "",
    targetCompletionDate: caseData.targetCompletionDate || ""
  })
  const [classificationForm, setClassificationForm] = useState({
    correspondenceType: caseData.correspondenceType,
    priority: caseData.priority,
    isConfidential: caseData.isConfidential,
    isUrgent: caseData.isUrgent
  })
  const [referencesForm, setReferencesForm] = useState({
    externalReferenceNo: caseData.externalReferenceNo || "",
    fileReferenceNo: caseData.fileReferenceNo,
    volume: caseData.volume,
    folioMinuteNo: caseData.folioMinuteNo
  })
  const [fileAssocForm, setFileAssocForm] = useState({
    registryFileAssocStatus: caseData.registryFileAssocStatus,
    fileTypes: caseData.fileTypes,
    existingFileRefs: caseData.existingFileRefs.join(", ")
  })
  
  // Role-based permissions
  const canAssign = () => CURRENT_USER.role === 'sg' || CURRENT_USER.role === 'dsg'
  const canEditDates = () => CURRENT_USER.role === 'sg' || CURRENT_USER.role === 'dsg'
  const canProcess = () => (CURRENT_USER.role === 'legal_officer' && caseData.assignedOfficerId === CURRENT_USER.id) || CURRENT_USER.role === 'sg' || CURRENT_USER.role === 'dsg'
  const canApprove = () => CURRENT_USER.role === 'sg' || CURRENT_USER.role === 'dsg'
  
  // Status helpers
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      "NEW": { variant: "outline", label: "New" },
      "PENDING_REVIEW": { variant: "secondary", label: "Pending SG/DSG Review" },
      "ASSIGNED": { variant: "default", label: "Assigned" },
      "IN_PROGRESS": { variant: "default", label: "In Progress" },
      "PENDING_EXTERNAL": { variant: "secondary", label: "Pending External" },
      "ON_HOLD": { variant: "outline", label: "On Hold" },
      "CLOSED": { variant: "secondary", label: "Closed" },
    }
    const config = statusConfig[status] || { variant: "outline", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }
  
  const getSlaStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600 bg-green-50 border-green-200'
      case 'at_risk': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-muted-foreground'
    }
  }
  
  // Handlers
  const handleAssignOfficer = () => {
    const officer = LEGAL_OFFICERS.find(o => o.id === assignForm.officerId)
    if (!officer) return
    
    setCaseData(prev => ({
      ...prev,
      status: "ASSIGNED",
      workflowStage: "PROCESS",
      assignedOfficerId: assignForm.officerId,
      assignedOfficerName: officer.name,
      dateAssigned: new Date().toISOString().split('T')[0],
      dueDate: assignForm.dueDate || prev.dueDate,
      sgDirective: assignForm.directive,
      sgDirectiveDate: new Date().toISOString().split('T')[0]
    }))
    
    setActivities(prev => [{
      id: `a${prev.length + 1}`,
      type: 'assignment',
      description: `Case assigned to ${officer.name} by ${CURRENT_USER.name}`,
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
    
    setTasks(prev => prev.map(t => 
      t.title.includes("Assign") ? { ...t, status: "completed" } : t
    ).concat([
      { id: `t${prev.length + 1}`, title: "Review case and provide response", assignee: officer.name, dueDate: assignForm.dueDate, status: "pending", priority: "normal" }
    ]))
    
    setShowAssignDialog(false)
    setAssignForm({ officerId: "", dueDate: "", directive: "" })
  }
  
  const handleSaveDates = () => {
    setCaseData(prev => ({
      ...prev,
      dueDate: datesForm.dueDate,
      bringUpDate: datesForm.bringUpDate,
      targetCompletionDate: datesForm.targetCompletionDate
    }))
    
    setActivities(prev => [{
      id: `a${prev.length + 1}`,
      type: 'update',
      description: `Dates updated by ${CURRENT_USER.name}`,
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
    
    setShowEditDatesDialog(false)
  }
  
  const handleSaveClassification = () => {
    setCaseData(prev => ({
      ...prev,
      ...classificationForm
    }))
    
    setActivities(prev => [{
      id: `a${prev.length + 1}`,
      type: 'update',
      description: `Classification updated by ${CURRENT_USER.name}`,
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
    
    setShowEditClassificationDialog(false)
  }
  
  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    setComments(prev => [{
      id: `c${prev.length + 1}`,
      user: CURRENT_USER.name,
      role: CURRENT_USER.role === 'sg' ? 'Solicitor General' : CURRENT_USER.role,
      content: newComment,
      timestamp: new Date().toISOString()
    }, ...prev])
    
    setNewComment("")
  }
  
  // Workflow stages for stepper
  const workflowStages = [
    { id: "INTAKE", label: "Intake" },
    { id: "REVIEW", label: "SG/DSG Review" },
    { id: "PROCESS", label: "Processing" },
    { id: "APPROVAL", label: "Approval" },
    { id: "DISPATCH", label: "Dispatch" },
    { id: "CLOSED", label: "Closed" },
  ]
  
  const currentStageIndex = workflowStages.findIndex(s => s.id === caseData.workflowStage)

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/case-management" className="hover:text-foreground transition-colors">
          SGC Digital - Case Management
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/case-management/correspondence" className="hover:text-foreground transition-colors">
          Correspondence
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/case-management/correspondence/workqueue" className="hover:text-foreground transition-colors">
          Workqueue
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{caseData.trackingNumber}</span>
      </nav>

      {/* Header Card with Key Info */}
      <Card className="border-l-4 border-l-blue-600">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left - Case Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/case-management/correspondence/workqueue">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{caseData.trackingNumber}</h1>
                    {getStatusBadge(caseData.status)}
                    {caseData.isUrgent && <Badge variant="destructive"><Flag className="h-3 w-3 mr-1" />Urgent</Badge>}
                    {caseData.isConfidential && <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Confidential</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-1 max-w-2xl">{caseData.subjectMatter}</p>
                </div>
              </div>
              
              {/* Quick Info Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{caseData.originatingEntity}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{caseData.correspondenceType}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Received: {formatDate(caseData.dateReceived)}</span>
                </div>
                {caseData.assignedOfficerName && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Assigned: {caseData.assignedOfficerName}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Right - SLA & Dates */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* SLA Status */}
              <div className={`rounded-lg border p-4 min-w-[160px] ${getSlaStatusColor(caseData.slaStatus)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">SLA Status</span>
                </div>
                <div className="text-2xl font-bold">{caseData.daysRemaining} days</div>
                <div className="text-xs">remaining of {caseData.slaDays}</div>
              </div>
              
              {/* Due Date */}
              <div className="rounded-lg border bg-muted/50 p-4 min-w-[160px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due Date</span>
                  </div>
                  {canEditDates() && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowEditDatesDialog(true)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="text-lg font-bold">{formatDate(caseData.dueDate)}</div>
                {caseData.bringUpDate && (
                  <div className="text-xs text-muted-foreground">Bring-up: {formatDate(caseData.bringUpDate)}</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Workflow Progress */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Workflow Progress</span>
            </div>
            <div className="flex items-center gap-2">
              {workflowStages.map((stage, index) => (
                <div key={stage.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
                    ${index < currentStageIndex ? 'bg-green-600 text-white' :
                      index === currentStageIndex ? 'bg-blue-600 text-white' :
                      'bg-muted text-muted-foreground'}
                  `}>
                    {index < currentStageIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:inline ${index === currentStageIndex ? 'font-medium' : 'text-muted-foreground'}`}>
                    {stage.label}
                  </span>
                  {index < workflowStages.length - 1 && (
                    <div className={`w-8 lg:w-16 h-0.5 mx-2 ${index < currentStageIndex ? 'bg-green-600' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Alert if pending assignment */}
          {caseData.status === "PENDING_REVIEW" && canAssign() && (
            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800">Action Required: Assign to Legal Officer</p>
                  <p className="text-sm text-amber-700">This case is awaiting your review and assignment to a legal officer.</p>
                </div>
                <Button onClick={() => setShowAssignDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Officer
                </Button>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
            {canAssign() && caseData.status === "PENDING_REVIEW" && (
              <Button onClick={() => setShowAssignDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign to Officer
              </Button>
            )}
            {canProcess() && caseData.status === "ASSIGNED" && (
              <>
                <Button variant="outline" onClick={() => setShowLiaisonDialog(true)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Liaise with Agency
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Response for Approval
                </Button>
              </>
            )}
            {canApprove() && caseData.status === "IN_PROGRESS" && (
              <>
                <Button variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  Return for Revision
                </Button>
                <Button>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Dispatch
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  More Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditClassificationDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Classification
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditDatesDialog(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Edit Dates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditContactDialog(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Contact Info
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Put On Hold
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Archive className="h-4 w-4 mr-2" />
                  Cancel Case
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="details">Case Details</TabsTrigger>
          <TabsTrigger value="directive">SG Directive</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correspondence Information */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Correspondence Information
                </CardTitle>
                {canEditDates() && (
                  <Button variant="ghost" size="sm" onClick={() => setShowEditClassificationDialog(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                    <p className="font-medium">{caseData.correspondenceType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Priority</p>
                    <Badge variant={caseData.priority === "Urgent" || caseData.priority === "Critical" ? "destructive" : "secondary"}>
                      {caseData.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">From Whom</p>
                    <p className="font-medium">{caseData.fromWhom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">To Whom</p>
                    <p className="font-medium">{caseData.toWhom}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Subject Matter</p>
                    <p className="font-medium">{caseData.subjectMatter}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Reference Numbers */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4" /> Reference Numbers
                </CardTitle>
                {canEditDates() && (
                  <Button variant="ghost" size="sm" onClick={() => setShowEditReferencesDialog(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Tracking Number</p>
                    <p className="font-medium font-mono">{caseData.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">External Reference</p>
                    <p className="font-medium">{caseData.externalReferenceNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">File Reference No.</p>
                    <p className="font-medium">{caseData.fileReferenceNo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Volume / Folio</p>
                    <p className="font-medium">{caseData.volume} / {caseData.folioMinuteNo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Originator / Contact */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Originator / Contact
                </CardTitle>
                {canEditDates() && (
                  <Button variant="ghost" size="sm" onClick={() => setShowEditContactDialog(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Originating Entity</p>
                    <p className="font-medium">{caseData.originatingEntity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Submitter Type</p>
                    <p className="font-medium">{caseData.submitterType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Contact Name</p>
                    <p className="font-medium">{caseData.contactName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Job Title</p>
                    <p className="font-medium">{caseData.contactJobTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="font-medium">{caseData.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="font-medium">{caseData.contactEmail}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="font-medium">{caseData.contactAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* File Association */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" /> File Association
                </CardTitle>
                {canEditDates() && (
                  <Button variant="ghost" size="sm" onClick={() => setShowEditFileAssocDialog(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Registry File Status</p>
                  <Badge variant={caseData.registryFileAssocStatus === "Complete" ? "default" : "secondary"}>
                    {caseData.registryFileAssocStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">File Types</p>
                  <div className="flex flex-wrap gap-1">
                    {caseData.fileTypes.map(ft => (
                      <Badge key={ft} variant="outline" className="text-xs">{ft}</Badge>
                    ))}
                  </div>
                </div>
                {caseData.existingFileRefs.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Linked Files</p>
                    <div className="space-y-1">
                      {caseData.existingFileRefs.map(ref => (
                        <p key={ref} className="text-sm font-mono bg-muted px-2 py-1 rounded">{ref}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* SG Directive Tab */}
        <TabsContent value="directive" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="h-4 w-4" /> SG Directive & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.assignedOfficerId ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Assigned Officer</p>
                      <p className="font-medium text-lg">{caseData.assignedOfficerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Date Assigned</p>
                      <p className="font-medium">{caseData.dateAssigned ? formatDate(caseData.dateAssigned) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Due Date</p>
                      <p className="font-medium">{formatDate(caseData.dueDate)}</p>
                    </div>
                  </div>
                  
                  {caseData.sgDirective && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">SG Directive</p>
                      <p className="whitespace-pre-wrap">{caseData.sgDirective}</p>
                      {caseData.sgDirectiveDate && (
                        <p className="text-xs text-muted-foreground mt-2">Issued: {formatDate(caseData.sgDirectiveDate)}</p>
                      )}
                    </div>
                  )}
                  
                  {caseData.returnToRegistryDirective && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800 uppercase tracking-wide mb-2">Return to Registry Directive</p>
                      <p className="whitespace-pre-wrap text-amber-900">{caseData.returnToRegistryDirective}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Assignment Yet</p>
                  <p className="text-sm">This case is pending SG/DSG review and assignment.</p>
                  {canAssign() && (
                    <Button className="mt-4" onClick={() => setShowAssignDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Officer
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* External Liaisons */}
          {caseData.assignedOfficerId && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" /> External Liaisons
                </CardTitle>
                {canProcess() && (
                  <Button variant="outline" size="sm" onClick={() => setShowLiaisonDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Liaison
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {caseData.liaiseAgencies.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agency</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Date Sent</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caseData.liaiseAgencies.map((liaison: any) => (
                        <TableRow key={liaison.id}>
                          <TableCell className="font-medium">{liaison.agencyName}</TableCell>
                          <TableCell>{liaison.contactName}</TableCell>
                          <TableCell>{formatDate(liaison.dateSubmitted)}</TableCell>
                          <TableCell>{liaison.dateFeedbackReceived ? formatDate(liaison.dateFeedbackReceived) : '-'}</TableCell>
                          <TableCell>
                            <Badge variant={liaison.status === "Complete" ? "default" : "secondary"}>
                              {liaison.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No external liaisons initiated</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documents
              </CardTitle>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" /> Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`
                        flex h-10 w-10 items-center justify-center rounded-full
                        ${activity.type === 'assignment' ? 'bg-green-100 text-green-600' :
                          activity.type === 'intake' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'document' ? 'bg-purple-100 text-purple-600' :
                          activity.type === 'status' ? 'bg-amber-100 text-amber-600' :
                          'bg-muted text-muted-foreground'}
                      `}>
                        {activity.type === 'assignment' ? <UserPlus className="h-5 w-5" /> :
                         activity.type === 'intake' ? <Mail className="h-5 w-5" /> :
                         activity.type === 'document' ? <FileText className="h-5 w-5" /> :
                         activity.type === 'status' ? <AlertCircle className="h-5 w-5" /> :
                         <FileCheck className="h-5 w-5" />}
                      </div>
                      {index < activities.length - 1 && <div className="w-0.5 flex-1 bg-muted mt-2" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.user} - {formatDateTime(activity.timestamp)}</p>
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
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Tasks
              </CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={task.status === "completed" ? "default" : "outline"}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {task.status !== "completed" && (
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Comments & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Comment */}
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>{CURRENT_USER.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea 
                    placeholder="Add a comment or note..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Comments List */}
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>{comment.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.user}</span>
                        <Badge variant="outline" className="text-xs">{comment.role}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDateTime(comment.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Assign Officer Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to Legal Officer</DialogTitle>
            <DialogDescription>Assign this case to a legal officer with your directive.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Officer *</Label>
              <Select value={assignForm.officerId} onValueChange={(v) => setAssignForm(prev => ({ ...prev, officerId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an officer" />
                </SelectTrigger>
                <SelectContent>
                  {LEGAL_OFFICERS.map(officer => (
                    <SelectItem key={officer.id} value={officer.id}>{officer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input 
                type="date" 
                value={assignForm.dueDate} 
                onChange={(e) => setAssignForm(prev => ({ ...prev, dueDate: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>SG Directive</Label>
              <Textarea 
                placeholder="Enter your directive for the assigned officer..."
                value={assignForm.directive}
                onChange={(e) => setAssignForm(prev => ({ ...prev, directive: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignOfficer} disabled={!assignForm.officerId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dates Dialog */}
      <Dialog open={showEditDatesDialog} onOpenChange={setShowEditDatesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Dates & Deadlines</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input 
                type="date" 
                value={datesForm.dueDate} 
                onChange={(e) => setDatesForm(prev => ({ ...prev, dueDate: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Bring-Up Date</Label>
              <Input 
                type="date" 
                value={datesForm.bringUpDate} 
                onChange={(e) => setDatesForm(prev => ({ ...prev, bringUpDate: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Target Completion Date</Label>
              <Input 
                type="date" 
                value={datesForm.targetCompletionDate} 
                onChange={(e) => setDatesForm(prev => ({ ...prev, targetCompletionDate: e.target.value }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDatesDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveDates}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Classification Dialog */}
      <Dialog open={showEditClassificationDialog} onOpenChange={setShowEditClassificationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Classification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Correspondence Type</Label>
              <Select value={classificationForm.correspondenceType} onValueChange={(v) => setClassificationForm(prev => ({ ...prev, correspondenceType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORRESPONDENCE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={classificationForm.priority} onValueChange={(v) => setClassificationForm(prev => ({ ...prev, priority: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Confidential</Label>
              <Switch 
                checked={classificationForm.isConfidential} 
                onCheckedChange={(v) => setClassificationForm(prev => ({ ...prev, isConfidential: v }))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Urgent</Label>
              <Switch 
                checked={classificationForm.isUrgent} 
                onCheckedChange={(v) => setClassificationForm(prev => ({ ...prev, isUrgent: v }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditClassificationDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveClassification}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Contact Dialog */}
      <Dialog open={showEditContactDialog} onOpenChange={setShowEditContactDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input defaultValue={caseData.contactName} />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input defaultValue={caseData.contactJobTitle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={caseData.contactPhone} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={caseData.contactEmail} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea defaultValue={caseData.contactAddress} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditContactDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowEditContactDialog(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Liaison Dialog */}
      <Dialog open={showLiaisonDialog} onOpenChange={setShowLiaisonDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add External Liaison</DialogTitle>
            <DialogDescription>Record communication with an external agency or stakeholder.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Agency Name *</Label>
              <Input placeholder="e.g., Attorney General's Office, Ministry of Finance" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input placeholder="Name of contact person" />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" placeholder="email@agency.gov.bb" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Purpose / Request</Label>
              <Textarea placeholder="Describe what information or action is being requested..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Expected Response Date</Label>
              <Input type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLiaisonDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowLiaisonDialog(false)}>Add Liaison</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit References Dialog */}
      <Dialog open={showEditReferencesDialog} onOpenChange={setShowEditReferencesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reference Numbers</DialogTitle>
            <DialogDescription>Update file reference information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>External Reference No.</Label>
              <Input 
                value={referencesForm.externalReferenceNo}
                onChange={(e) => setReferencesForm(prev => ({ ...prev, externalReferenceNo: e.target.value }))}
                placeholder="External reference number"
              />
            </div>
            <div className="space-y-2">
              <Label>File Reference No.</Label>
              <Input 
                value={referencesForm.fileReferenceNo}
                onChange={(e) => setReferencesForm(prev => ({ ...prev, fileReferenceNo: e.target.value }))}
                placeholder="SG/ADV/2026/123"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Volume</Label>
                <Input 
                  value={referencesForm.volume}
                  onChange={(e) => setReferencesForm(prev => ({ ...prev, volume: e.target.value }))}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Folio / Minute No.</Label>
                <Input 
                  value={referencesForm.folioMinuteNo}
                  onChange={(e) => setReferencesForm(prev => ({ ...prev, folioMinuteNo: e.target.value }))}
                  placeholder="15"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditReferencesDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setCaseData(prev => ({
                ...prev,
                externalReferenceNo: referencesForm.externalReferenceNo,
                fileReferenceNo: referencesForm.fileReferenceNo,
                volume: referencesForm.volume,
                folioMinuteNo: referencesForm.folioMinuteNo
              }))
              setShowEditReferencesDialog(false)
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit File Association Dialog */}
      <Dialog open={showEditFileAssocDialog} onOpenChange={setShowEditFileAssocDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Association</DialogTitle>
            <DialogDescription>Update registry file association details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Registry File Status</Label>
              <Select 
                value={fileAssocForm.registryFileAssocStatus}
                onValueChange={(value) => setFileAssocForm(prev => ({ ...prev, registryFileAssocStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Not Required">Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File Types</Label>
              <div className="flex flex-wrap gap-2">
                {["Advisory", "Litigation", "Compensation", "Public Trustee", "International Law", "Cabinet/Confidential"].map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={fileAssocForm.fileTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFileAssocForm(prev => ({ ...prev, fileTypes: [...prev.fileTypes, type] }))
                        } else {
                          setFileAssocForm(prev => ({ ...prev, fileTypes: prev.fileTypes.filter(t => t !== type) }))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Existing File References (comma-separated)</Label>
              <Input 
                value={fileAssocForm.existingFileRefs}
                onChange={(e) => setFileAssocForm(prev => ({ ...prev, existingFileRefs: e.target.value }))}
                placeholder="SG/ADV/2024/089, SG/ADV/2023/156"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFileAssocDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setCaseData(prev => ({
                ...prev,
                registryFileAssocStatus: fileAssocForm.registryFileAssocStatus,
                fileTypes: fileAssocForm.fileTypes,
                existingFileRefs: fileAssocForm.existingFileRefs.split(",").map(s => s.trim()).filter(Boolean)
              }))
              setShowEditFileAssocDialog(false)
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
