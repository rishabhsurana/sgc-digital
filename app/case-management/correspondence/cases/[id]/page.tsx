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
import {
  CORRESPONDENCE_TYPES,
  REGISTRY_CASE_STATUS,
  REGISTRY_FILE_TYPES,
  SECURITY_PROFILES,
  URGENCY_LEVELS,
  ORIGINATING_ENTITY_TYPES,
  INTERNAL_RECIPIENTS,
  SUBMISSION_CHANNELS,
  DISPATCH_MODES,
  REGISTRY_DOCUMENT_TYPES,
  NOTE_TYPES,
  LEGAL_OFFICERS,
  ORIGINATING_MDAS,
  REGISTRY_FILE_ASSOCIATION_STATUS,
  getRecommendedFileTypes,
  getSecurityProfileForCorrespondenceType
} from "@/lib/constants/taxonomy"
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

// Use legal officers from taxonomy with mapped IDs
const LEGAL_OFFICERS_LIST = LEGAL_OFFICERS.map((officer, idx) => ({
  id: `lo${idx + 1}`,
  name: officer.label,
  code: officer.code,
  role: officer.role
}))

// Combine taxonomy legal officers with any additional mock officers
const ALL_LEGAL_OFFICERS = [
  ...LEGAL_OFFICERS_LIST,
  // Additional officers if needed
]

// Mock current user (for role-based access)
const CURRENT_USER = {
  id: "sg1",
  name: "Sir Richard Cheltenham, KC",
  role: "sg", // 'sg' | 'dsg' | 'legal_officer' | 'registry_clerk'
  permissions: ["assign", "approve", "edit_dates", "view_all"]
}

// MOCK DATA - Simulating a case in PENDING_REVIEW status (not yet assigned)
// Using taxonomy codes from Registry_Module_Classification_Taxonomy_Metadata_v2
const getMockCaseData = (id: string) => ({
  id,
  // Core Identifiers (per TAB: Property ID regTrackingNo)
  trackingNumber: `REG-2026-COR-2026-00${id.padStart(3, '0')}`,
  caseType: "Registry Correspondence", // regCaseType - constant
  
  // Workflow Status (per TAB: CL_RegistryCaseStatus)
  status: "PENDING_REVIEW", // regCaseStatus: NEW, PENDING_REVIEW, ASSIGNED, PENDING_EXTERNAL, ON_HOLD, CLOSED, CANCELLED
  workflowStage: "REVIEW",
  
  // Classification (per TAB: CL_CorrespondenceType)
  correspondenceType: "ADVISORY", // Code from taxonomy
  correspondenceTypeLabel: CORRESPONDENCE_TYPES.find(t => t.code === "ADVISORY")?.label || "Advisory",
  
  // Priority & Security (per TAB: regUrgencyFlag, regConfidentialFlag, regSecurityProfile)
  priority: "Normal", // CL_UrgencyLevel
  isConfidential: false, // regConfidentialFlag
  isUrgent: false, // regUrgencyFlag
  securityProfile: "STANDARD", // CL_SecurityProfile: STANDARD, CONFIDENTIAL, CABINET
  
  // Subject (per TAB: regSubjectMatter)
  subjectMatter: "Request for Legal Opinion on Proposed Amendment to the Companies Act regarding beneficial ownership disclosure requirements",
  
  // Key Dates (per TAB: regDateReceived, regBringUpDate, regDispatchDate, regClosureDate)
  dateReceived: "2026-03-14", // regDateReceived
  dueDate: "2026-03-28",
  bringUpDate: "2026-03-21", // regBringUpDate
  targetCompletionDate: "2026-03-26",
  dispatchDate: null, // regDispatchDate
  closureDate: null, // regClosureDate
  
  // SLA Tracking
  slaDays: 14,
  daysElapsed: 2,
  daysRemaining: 12,
  slaStatus: "on_track", // on_track, at_risk, overdue
  
  // Originator / Contact (per TAB: regOriginatingEntity, regOriginatingEntityType, regEntityId)
  originatingEntity: "Ministry of International Business", // regOriginatingEntity
  originatingEntityType: "MDA", // CL_OriginatingEntityType: MDA, COURT, ATTORNEY, PUBLIC, OTHER
  entityId: "MIB-2026-REG-001", // regEntityId - from portal registration
  submissionChannel: "Portal", // regSubmissionChannel: Portal, Email, Paper
  
  // Contact Details (External submitter)
  contactName: "Ms. Patricia Holder",
  contactJobTitle: "Permanent Secretary",
  contactPhone: "+1 (246) 535-1200",
  contactEmail: "pholder@mib.gov.bb",
  contactAddress: "Warrens Office Complex, Warrens, St. Michael",
  externalReferenceNo: "MIB/LGL/2026/045",
  
  // Correspondence Details (per TAB: regToWhom, From Whom)
  fromWhom: "Permanent Secretary, Ministry of International Business",
  toWhom: "SG", // CL_InternalRecipient: SG, DSG, SECRETARY, OTHER
  toWhomLabel: INTERNAL_RECIPIENTS.find(r => r.code === "SG")?.label || "Solicitor General",
  
  // File References
  fileReferenceNo: "SG/ADV/2026/123",
  volume: "1",
  folioMinuteNo: "15",
  
  // Registry File Association (per TAB: regFileTypes, regExistingFileRefs, regRegistryFileAssocStatus)
  fileTypes: ["LOCAL", "ADVISORY"], // CL_RegistryFileType codes
  existingFileRefs: ["SG/ADV/2024/089", "SG/ADV/2023/156"], // regExistingFileRefs
  registryFileAssocStatus: "IN_PROGRESS", // CL_RegistryFileAssocStatus
  
  // Assignment (null until assigned by SG/DSG via Daily Mail review)
  assignedOfficerId: null, // regAssignedOfficer
  assignedOfficerName: null,
  dateAssigned: null,
  
  // SG/DSG Directive (per TAB: regDirectiveSummary)
  sgDirective: null, // regDirectiveSummary
  sgDirectiveDate: null,
  // Dispatch Details (per TAB: regDispatchMethod, regDispatchTo)
  dispatchMethod: null, // CL_DispatchMethod: EMAIL, POST, COURIER, PORTAL
  dispatchTo: null, // regDispatchTo
  
  // External Liaisons
  liaiseAgencies: [],
})

// Mock documents using CL_RegistryDocumentType codes
const getMockDocuments = () => [
  { id: "doc1", name: "Request_Letter_MIB.pdf", typeCode: "INCOMING", type: "Incoming Correspondence", size: "245 KB", uploadedBy: "Registry", uploadedAt: "2026-03-14T09:30:00", version: 1 },
  { id: "doc2", name: "Companies_Act_Amendment_Draft.pdf", typeCode: "SUPPORTING", type: "Supporting Documents", size: "1.2 MB", uploadedBy: "Registry", uploadedAt: "2026-03-14T09:32:00", version: 1 },
  { id: "doc3", name: "Beneficial_Ownership_Guidelines.pdf", typeCode: "SUPPORTING", type: "Supporting Documents", size: "890 KB", uploadedBy: "Registry", uploadedAt: "2026-03-14T09:35:00", version: 1 },
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
                  <span>{caseData.correspondenceTypeLabel}</span>
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
        
        {/* Details Tab - Redesigned with sophisticated layout */}
        <TabsContent value="details" className="mt-6">
          {/* Subject Matter Hero - Full width at top */}
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-600 text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject Matter</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={caseData.priority === "Urgent" || caseData.priority === "Critical" ? "destructive" : "secondary"} className="text-xs">
                      {caseData.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800">
                      {caseData.correspondenceTypeLabel || caseData.correspondenceType}
                    </Badge>
                    {caseData.isConfidential && <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Confidential</Badge>}
                    {caseData.isUrgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                  </div>
                </div>
              </div>
              {canEditDates() && (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setShowEditClassificationDialog(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-lg font-medium leading-relaxed text-foreground">{caseData.subjectMatter}</p>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">From:</span>
                <span className="text-sm font-medium">{caseData.fromWhom}</span>
              </div>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">To:</span>
                <span className="text-sm font-medium">{caseData.toWhomLabel || caseData.toWhom}</span>
              </div>
            </div>
          </div>

          {/* Reference Numbers - Prominent horizontal strip */}
          <div className="mb-6 p-4 rounded-xl border bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Reference Numbers</span>
              </div>
              {canEditDates() && (
                <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-foreground" onClick={() => setShowEditReferencesDialog(true)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Tracking Number</p>
                <p className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{caseData.trackingNumber}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">File Reference</p>
                <p className="font-mono text-sm font-medium">{caseData.fileReferenceNo}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">External Ref</p>
                <p className="text-sm font-medium">{caseData.externalReferenceNo || <span className="text-muted-foreground">-</span>}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Volume / Folio</p>
                <p className="text-sm font-medium">{caseData.volume} / {caseData.folioMinuteNo}</p>
              </div>
            </div>
          </div>

          {/* Two column layout for Originator and File Association */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Originator / Contact - Takes 3 columns */}
            <div className="lg:col-span-3 rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Originator / Contact</span>
                </div>
                {canEditDates() && (
                  <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-foreground" onClick={() => setShowEditContactDialog(true)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4 mb-5 pb-5 border-b">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg">
                    {caseData.contactName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{caseData.contactName}</p>
                    <p className="text-sm text-muted-foreground">{caseData.contactJobTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-normal">{caseData.originatingEntityType || 'Ministry/Department'}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Originating Entity</p>
                      <p className="font-medium">{caseData.originatingEntity}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Phone</p>
                        <p className="font-medium">{caseData.contactPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">{caseData.contactEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Address</p>
                      <p className="font-medium">{caseData.contactAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* File Association - Takes 2 columns */}
            <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                    <FolderOpen className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">File Association</span>
                </div>
                {canEditDates() && (
                  <Button variant="ghost" size="sm" className="h-7 text-muted-foreground hover:text-foreground" onClick={() => setShowEditFileAssocDialog(true)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Registry Status</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <span className={`w-2 h-2 rounded-full ${
                      caseData.registryFileAssocStatus === "Complete" || caseData.registryFileAssocStatus === "COMPLETE" 
                        ? "bg-green-500" 
                        : caseData.registryFileAssocStatus === "IN_PROGRESS" 
                        ? "bg-blue-500" 
                        : "bg-amber-500"
                    }`} />
                    <span className="text-sm font-medium">
                      {REGISTRY_FILE_ASSOCIATION_STATUS.find(s => s.code === caseData.registryFileAssocStatus)?.label || caseData.registryFileAssocStatus}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">File Types</p>
                  <div className="flex flex-wrap gap-2">
                    {caseData.fileTypes.map(ft => {
                      const fileType = REGISTRY_FILE_TYPES.find(t => t.code === ft)
                      return (
                        <div key={ft} className="px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                          <span className="text-xs font-medium text-violet-700 dark:text-violet-300">{fileType?.label || ft}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {caseData.existingFileRefs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Linked Files</p>
                    <div className="space-y-2">
                      {caseData.existingFileRefs.map(ref => (
                        <div key={ref} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-dashed">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono">{ref}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
      
      {/* Assign Officer Dialog - Uses regAssignedOfficer from Active Directory */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to Legal Officer</DialogTitle>
            <DialogDescription>Assign this case to a legal officer with your directive (regDirectiveSummary).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Officer <span className="text-destructive">*</span></Label>
              <Select value={assignForm.officerId} onValueChange={(v) => setAssignForm(prev => ({ ...prev, officerId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an officer" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_LEGAL_OFFICERS.map(officer => (
                    <SelectItem key={officer.id} value={officer.id}>
                      <div className="flex flex-col">
                        <span>{officer.name}</span>
                        {officer.role && <span className="text-xs text-muted-foreground">{officer.role}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Officer responsible for actioning the case</p>
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
      
      {/* Edit Classification Dialog - Using CL_CorrespondenceType and CL_UrgencyLevel from taxonomy */}
      <Dialog open={showEditClassificationDialog} onOpenChange={setShowEditClassificationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Classification</DialogTitle>
            <DialogDescription>Update correspondence type and priority settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Correspondence Type <span className="text-destructive">*</span></Label>
              <Select value={classificationForm.correspondenceType} onValueChange={(v) => setClassificationForm(prev => ({ ...prev, correspondenceType: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correspondence type" />
                </SelectTrigger>
                <SelectContent>
                  {CORRESPONDENCE_TYPES.map(type => (
                    <SelectItem key={type.code} value={type.code}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Primary classification facet. Drives routing and security defaults.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <Select value={classificationForm.priority} onValueChange={(v) => setClassificationForm(prev => ({ ...prev, priority: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map(level => (
                    <SelectItem key={level.code} value={level.code}>
                      <span>{level.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Security Profile</Label>
              <Select 
                value={classificationForm.isConfidential ? "CONFIDENTIAL" : "STANDARD"} 
                onValueChange={(v) => setClassificationForm(prev => ({ ...prev, isConfidential: v === "CONFIDENTIAL" || v === "CABINET" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select security profile" />
                </SelectTrigger>
                <SelectContent>
                  {SECURITY_PROFILES.map(profile => (
                    <SelectItem key={profile.code} value={profile.code}>
                      <div className="flex flex-col">
                        <span>{profile.label}</span>
                        <span className="text-xs text-muted-foreground">{profile.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Controls ACLs/groups on the case and all linked documents.</p>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="space-y-0.5">
                <Label>Urgent Flag</Label>
                <p className="text-xs text-muted-foreground">If Yes, bypass batching and route immediately for review</p>
              </div>
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
