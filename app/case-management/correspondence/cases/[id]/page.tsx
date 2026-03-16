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
  X,
  ChevronRight,
  ExternalLink,
  Users,
  Briefcase,
  Archive,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Timer,
  FileCheck
} from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

// Controlled vocabularies per Configuration Workbook
const CORRESPONDENCE_TYPES = [
  "General", "Litigation", "Compensation", "Public Trustee", "Advisory", "International Law", "Cabinet / Confidential"
]

const SUBMISSION_CHANNELS = ["Portal", "Email", "Paper Mail", "Fax/Other"]

const SUBMITTER_TYPES = [
  "Ministry/Department", "Statutory Body", "Member of the Public", "Private Sector", "Regional/International Body"
]

const PRIORITY_LEVELS = [
  { value: "urgent", label: "Urgent" },
  { value: "routine", label: "Routine" }
]

const FILE_TYPES = [
  "Advisory File", "Litigation File", "Compensation File", "Public Trustee File", 
  "International Law File", "Foreign / Ministry File", "General Correspondence File"
]

const LEGAL_OFFICERS = [
  { id: "ST-001", name: "Sarah Thompson", email: "s.thompson@sgc.gov.bb" },
  { id: "JW-002", name: "James Williams", email: "j.williams@sgc.gov.bb" },
  { id: "MP-003", name: "Maria Patterson", email: "m.patterson@sgc.gov.bb" },
  { id: "RJ-004", name: "Robert Johnson", email: "r.johnson@sgc.gov.bb" },
  { id: "AC-005", name: "Angela Clarke", email: "a.clarke@sgc.gov.bb" }
]

// Mock current user - In real app, this comes from auth context
const CURRENT_USER = {
  id: "SG-001",
  name: "Hon. Solicitor General",
  role: "SG", // SG, DSG, LEGAL_OFFICER, REGISTRY_CLERK
  email: "sg@sgc.gov.bb"
}

// Mock case data - starts as PENDING_REVIEW (not yet assigned by SG)
const getInitialCaseData = (caseId: string) => ({
  // Core Identification
  id: caseId,
  trackingNumber: "COR-2026-00140",
  
  // Key Dates (displayed prominently at top)
  dateReceived: "2026-03-10T11:20:00",
  dueDate: "2026-03-24",
  dateOfDirective: null as string | null,
  bringUpDate: null as string | null,
  dispatchDate: null as string | null,
  closureDate: null as string | null,
  
  // SLA
  slaStatus: "on_track" as "on_track" | "at_risk" | "overdue",
  daysRemaining: 14,
  
  // Case Status - starts as PENDING_REVIEW until SG assigns
  caseStatus: "PENDING_REVIEW",
  
  // Assignment (null until SG assigns)
  assignedOfficerId: null as string | null,
  assignedOfficerName: null as string | null,
  sgDirective: null as string | null,
  
  // Correspondence Information (Tab 1)
  fromWhom: "Ministry of Finance",
  toWhom: "Solicitor General",
  subject: "Request for legal opinion regarding proposed amendments to the Public Procurement Act",
  fileReferenceNo: "REG/ADV/2026/140",
  volume: "Vol. 1",
  folioMinuteNo: "F-001",
  
  // Case Classification (Tab 2)
  correspondenceType: "Advisory",
  priority: "routine",
  submissionChannel: "Portal",
  externalReferenceNo: "MOF/LEG/2026/015",
  
  // Originator/Contact Information
  originatingEntity: "Ministry of Finance",
  submitterType: "Ministry/Department",
  contactName: "John Smith",
  contactJobTitle: "Legal Counsel",
  contactAddress: "Treasury Building, Bridge Street, Bridgetown",
  contactPhone: "+1 246 555-0123",
  contactEmail: "john.smith@mof.gov.bb",
  
  // File Association
  fileTypes: ["Advisory File", "Foreign / Ministry File"],
  existingFileRefs: ["REG/ADV/2025/089", "REG/MIN/2024/112"],
  registryFileAssocStatus: "Complete",
  
  // Flags
  confidentialFlag: false,
  urgencyFlag: false,
  securityProfile: "Registry-Standard",
  
  // Liaison tracking
  liaiseAgencies: [] as Array<{
    id: string
    agencyName: string
    contactName: string
    emailAddress: string
    dateSubmitted: string
    dateFeedbackReceived: string | null
    status: string
  }>
})

const getWorkflowStages = (status: string) => {
  const stages = [
    { id: "INTAKE", name: "Intake", status: "completed" },
    { id: "REVIEW", name: "SG/DSG Review", status: status === "PENDING_REVIEW" ? "current" : "completed" },
    { id: "FILE_ASSOC", name: "File Association", status: "completed", parallel: true },
    { id: "PROCESS", name: "Processing", status: status === "ASSIGNED" || status === "IN_PROGRESS" ? "current" : status === "PENDING_REVIEW" ? "pending" : "completed" },
    { id: "APPROVAL", name: "Approval", status: ["READY_DISPATCH", "CLOSED"].includes(status) ? "completed" : "pending" },
    { id: "DISPATCH", name: "Dispatch", status: status === "CLOSED" ? "completed" : "pending" },
    { id: "CLOSE", name: "Closed", status: status === "CLOSED" ? "completed" : "pending" },
  ]
  return stages
}

const documents = [
  { id: "1", name: "Amendment Proposal Draft.pdf", type: "Incoming Correspondence", size: "2.4 MB", uploadedBy: "John Smith (MOF)", uploadedAt: "2026-03-10" },
  { id: "2", name: "Current Act Annotated.pdf", type: "Supporting Documents", size: "1.8 MB", uploadedBy: "John Smith (MOF)", uploadedAt: "2026-03-10" },
  { id: "3", name: "Registry Cover Sheet.pdf", type: "Registry Cover Sheet", size: "45 KB", uploadedBy: "System", uploadedAt: "2026-03-10" },
]

export default function CorrespondenceCaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string
  
  const [caseData, setCaseData] = useState(getInitialCaseData(caseId))
  const [activities, setActivities] = useState([
    { id: "1", type: "intake", description: "Case created via portal submission", user: "System", timestamp: "2026-03-10T11:20:00" },
    { id: "2", type: "validation", description: "Intake validation completed", user: "Registry Clerk", timestamp: "2026-03-10T14:30:00" },
    { id: "3", type: "file_assoc", description: "File association completed", user: "Registry File Officer", timestamp: "2026-03-11T10:15:00" },
  ])
  
  // Dialog states
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showEditDatesDialog, setShowEditDatesDialog] = useState(false)
  const [showEditClassificationDialog, setShowEditClassificationDialog] = useState(false)
  const [showEditContactDialog, setShowEditContactDialog] = useState(false)
  const [showLiaisonDialog, setShowLiaisonDialog] = useState(false)
  const [showSubmitOutgoingDialog, setShowSubmitOutgoingDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  
  // Form states for dialogs
  const [assignForm, setAssignForm] = useState({ officerId: "", directive: "", dueDate: caseData.dueDate })
  const [datesForm, setDatesForm] = useState({ 
    dueDate: caseData.dueDate, 
    bringUpDate: caseData.bringUpDate || "" 
  })
  const [classificationForm, setClassificationForm] = useState({
    correspondenceType: caseData.correspondenceType,
    priority: caseData.priority,
    confidentialFlag: caseData.confidentialFlag,
    urgencyFlag: caseData.urgencyFlag
  })
  const [contactForm, setContactForm] = useState({
    contactName: caseData.contactName,
    contactJobTitle: caseData.contactJobTitle,
    contactPhone: caseData.contactPhone,
    contactEmail: caseData.contactEmail,
    contactAddress: caseData.contactAddress
  })
  const [liaisonForm, setLiaisonForm] = useState({ agencyName: "", contactName: "", emailAddress: "" })
  
  // Check if current user can see this case
  const canViewCase = () => {
    if (CURRENT_USER.role === "SG" || CURRENT_USER.role === "DSG") return true
    if (caseData.assignedOfficerId === CURRENT_USER.id) return true
    return false
  }
  
  // Check permissions based on role and case status
  const canAssign = () => (CURRENT_USER.role === "SG" || CURRENT_USER.role === "DSG") && caseData.caseStatus === "PENDING_REVIEW"
  const canEditDates = () => CURRENT_USER.role === "SG" || CURRENT_USER.role === "DSG" || caseData.assignedOfficerId === CURRENT_USER.id
  const canProcess = () => caseData.assignedOfficerId === CURRENT_USER.id && caseData.caseStatus === "ASSIGNED"
  const canSubmitOutgoing = () => caseData.assignedOfficerId === CURRENT_USER.id && ["ASSIGNED", "IN_PROGRESS"].includes(caseData.caseStatus)
  const canApprove = () => (CURRENT_USER.role === "SG" || CURRENT_USER.role === "DSG") && caseData.caseStatus === "PENDING_APPROVAL"
  
  // Action handlers
  const handleAssignOfficer = () => {
    const officer = LEGAL_OFFICERS.find(o => o.id === assignForm.officerId)
    if (!officer) return
    
    setCaseData(prev => ({
      ...prev,
      caseStatus: "ASSIGNED",
      assignedOfficerId: officer.id,
      assignedOfficerName: officer.name,
      sgDirective: assignForm.directive,
      dateOfDirective: new Date().toISOString(),
      dueDate: assignForm.dueDate
    }))
    
    setActivities(prev => [{
      id: String(prev.length + 1),
      type: "assignment",
      description: `Case assigned to ${officer.name}`,
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
    
    setShowAssignDialog(false)
    setAssignForm({ officerId: "", directive: "", dueDate: caseData.dueDate })
  }
  
  const handleUpdateDates = () => {
    setCaseData(prev => ({
      ...prev,
      dueDate: datesForm.dueDate,
      bringUpDate: datesForm.bringUpDate || null
    }))
    
    setActivities(prev => [{
      id: String(prev.length + 1),
      type: "update",
      description: "Dates updated",
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
    
    setShowEditDatesDialog(false)
  }
  
  const handleUpdateClassification = () => {
    setCaseData(prev => ({
      ...prev,
      correspondenceType: classificationForm.correspondenceType,
      priority: classificationForm.priority,
      confidentialFlag: classificationForm.confidentialFlag,
      urgencyFlag: classificationForm.urgencyFlag
    }))
    
    setActivities(prev => [{
      id: String(prev.length + 1),
      type: "update",
      description: "Classification updated",
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
    
    setShowEditClassificationDialog(false)
  }
  
  const handleUpdateContact = () => {
    setCaseData(prev => ({
      ...prev,
      contactName: contactForm.contactName,
      contactJobTitle: contactForm.contactJobTitle,
      contactPhone: contactForm.contactPhone,
      contactEmail: contactForm.contactEmail,
      contactAddress: contactForm.contactAddress
    }))
    
    setShowEditContactDialog(false)
  }
  
  const handleAddLiaison = () => {
    const newLiaison = {
      id: String(caseData.liaiseAgencies.length + 1),
      agencyName: liaisonForm.agencyName,
      contactName: liaisonForm.contactName,
      emailAddress: liaisonForm.emailAddress,
      dateSubmitted: new Date().toISOString().split('T')[0],
      dateFeedbackReceived: null,
      status: "Pending"
    }
    
    setCaseData(prev => ({
      ...prev,
      liaiseAgencies: [...prev.liaiseAgencies, newLiaison],
      caseStatus: "IN_PROGRESS"
    }))
    
    setActivities(prev => [{
      id: String(prev.length + 1),
      type: "liaison",
      description: `External liaison initiated with ${liaisonForm.agencyName}`,
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
    
    setShowLiaisonDialog(false)
    setLiaisonForm({ agencyName: "", contactName: "", emailAddress: "" })
  }
  
  const handleSubmitForApproval = () => {
    setCaseData(prev => ({
      ...prev,
      caseStatus: "PENDING_APPROVAL"
    }))
    
    setActivities(prev => [{
      id: String(prev.length + 1),
      type: "submit",
      description: "Case submitted for SG/DSG approval",
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
  }
  
  const handleApprove = () => {
    setCaseData(prev => ({
      ...prev,
      caseStatus: "READY_DISPATCH"
    }))
    
    setActivities(prev => [{
      id: String(prev.length + 1),
      type: "approval",
      description: "Outgoing correspondence approved",
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
  }
  
  const handleDispatch = () => {
    setCaseData(prev => ({
      ...prev,
      caseStatus: "CLOSED",
      dispatchDate: new Date().toISOString(),
      closureDate: new Date().toISOString()
    }))
    
    setActivities(prev => [{
      id: String(prev.length + 1),
      type: "dispatch",
      description: "Correspondence dispatched and case closed",
      user: CURRENT_USER.name,
      timestamp: new Date().toISOString()
    }, ...prev])
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      "PENDING_REVIEW": { variant: "secondary", label: "Pending SG Review" },
      "ASSIGNED": { variant: "default", label: "Assigned" },
      "IN_PROGRESS": { variant: "default", label: "In Progress" },
      "PENDING_EXTERNAL": { variant: "outline", label: "Pending External" },
      "ON_HOLD": { variant: "secondary", label: "On Hold" },
      "PENDING_APPROVAL": { variant: "outline", label: "Pending Approval" },
      "READY_DISPATCH": { variant: "default", label: "Ready for Dispatch" },
      "CLOSED": { variant: "secondary", label: "Closed" }
    }
    const config = configs[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }
  
  const getSlaIndicator = () => {
    if (caseData.slaStatus === "overdue") {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Overdue</Badge>
    }
    if (caseData.slaStatus === "at_risk") {
      return <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600"><Clock className="h-3 w-3" /> At Risk</Badge>
    }
    return <Badge variant="outline" className="gap-1 border-green-500 text-green-600"><CheckCircle className="h-3 w-3" /> On Track</Badge>
  }
  
  const workflowStages = getWorkflowStages(caseData.caseStatus)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-white/70">
            <Link href="/case-management" className="hover:text-white transition-colors">
              SGC Digital - Case Management
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/case-management/correspondence" className="hover:text-white transition-colors">
              Correspondence
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/case-management/correspondence/workqueue" className="hover:text-white transition-colors">
              Workqueue
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">{caseData.trackingNumber}</span>
          </nav>
          
          <div className="mt-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Mail className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{caseData.trackingNumber}</h1>
                  {getStatusBadge(caseData.caseStatus)}
                  {caseData.urgencyFlag && <Badge variant="destructive">Urgent</Badge>}
                  {caseData.confidentialFlag && <Badge variant="outline" className="border-amber-400 text-amber-200"><Shield className="h-3 w-3 mr-1" /> Confidential</Badge>}
                </div>
                <p className="mt-1 text-white/80 line-clamp-2 max-w-2xl">{caseData.subject}</p>
              </div>
            </div>
            
            {/* Action Buttons - Context Sensitive */}
            <div className="flex flex-wrap gap-2">
              {canAssign() && (
                <Button onClick={() => setShowAssignDialog(true)} className="bg-white text-blue-900 hover:bg-white/90">
                  <UserPlus className="h-4 w-4 mr-2" /> Assign to Officer
                </Button>
              )}
              {canProcess() && (
                <>
                  <Button onClick={() => setShowLiaisonDialog(true)} variant="secondary">
                    <ExternalLink className="h-4 w-4 mr-2" /> Liaise with Agency
                  </Button>
                  <Button onClick={handleSubmitForApproval} className="bg-white text-blue-900 hover:bg-white/90">
                    <Send className="h-4 w-4 mr-2" /> Submit for Approval
                  </Button>
                </>
              )}
              {canApprove() && (
                <>
                  <Button onClick={handleApprove} className="bg-white text-blue-900 hover:bg-white/90">
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button onClick={() => setShowReturnDialog(true)} variant="secondary">
                    <XCircle className="h-4 w-4 mr-2" /> Return
                  </Button>
                </>
              )}
              {caseData.caseStatus === "READY_DISPATCH" && (CURRENT_USER.role === "SG" || CURRENT_USER.role === "DSG" || CURRENT_USER.role === "REGISTRY_CLERK") && (
                <Button onClick={handleDispatch} className="bg-white text-blue-900 hover:bg-white/90">
                  <Send className="h-4 w-4 mr-2" /> Dispatch & Close
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Key Dates & SLA Bar - Most Important Info at Top */}
        <Card className="mb-6 border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 flex-1">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Date Received</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(caseData.dateReceived)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Due Date</p>
                  <p className="font-semibold flex items-center gap-1 text-blue-600">
                    <Timer className="h-4 w-4" />
                    {formatDate(caseData.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Days Remaining</p>
                  <p className={`font-semibold ${caseData.daysRemaining <= 3 ? 'text-red-600' : caseData.daysRemaining <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
                    {caseData.daysRemaining} days
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">SLA Status</p>
                  {getSlaIndicator()}
                </div>
                {caseData.dateOfDirective && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Directive Date</p>
                    <p className="font-semibold">{formatDate(caseData.dateOfDirective)}</p>
                  </div>
                )}
                {caseData.bringUpDate && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Bring-Up Date</p>
                    <p className="font-semibold">{formatDate(caseData.bringUpDate)}</p>
                  </div>
                )}
              </div>
              {canEditDates() && (
                <Button variant="outline" size="sm" onClick={() => setShowEditDatesDialog(true)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit Dates
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Workflow Progress */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {workflowStages.map((stage, index) => (
                <div key={stage.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors
                      ${stage.status === 'completed' ? 'bg-green-600 border-green-600 text-white' : 
                        stage.status === 'current' ? 'bg-blue-600 border-blue-600 text-white' : 
                        'bg-muted border-muted-foreground/30 text-muted-foreground'}
                    `}>
                      {stage.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : 
                       stage.status === 'current' ? <PlayCircle className="h-5 w-5" /> : 
                       <span className="text-sm">{index + 1}</span>}
                    </div>
                    <span className={`mt-2 text-xs text-center max-w-[80px] ${stage.status === 'current' ? 'font-semibold text-blue-600' : 'text-muted-foreground'}`}>
                      {stage.name}
                    </span>
                  </div>
                  {index < workflowStages.length - 1 && (
                    <div className={`h-0.5 w-8 md:w-16 mx-1 ${stage.status === 'completed' ? 'bg-green-600' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment & Directive - Only show if assigned */}
            {caseData.assignedOfficerId ? (
              <Card className="border-l-4 border-l-green-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" /> Assignment & SG Directive
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Assigned Officer</p>
                      <p className="font-semibold text-green-700">{caseData.assignedOfficerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Assigned Date</p>
                      <p className="font-medium">{caseData.dateOfDirective ? formatDate(caseData.dateOfDirective) : '-'}</p>
                    </div>
                  </div>
                  {caseData.sgDirective && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">SG Directive</p>
                      <p className="text-sm text-blue-900">{caseData.sgDirective}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-l-4 border-l-amber-500 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800">Pending SG/DSG Review</p>
                      <p className="text-sm text-amber-600">This case is awaiting assignment by the Solicitor General or Deputy Solicitor General.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Correspondence Details */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Correspondence Details
                </CardTitle>
                {canEditDates() && (
                  <Button variant="ghost" size="sm" onClick={() => setShowEditClassificationDialog(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">From</p>
                    <p className="font-medium">{caseData.fromWhom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">To</p>
                    <p className="font-medium">{caseData.toWhom}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Subject</p>
                    <p className="font-medium">{caseData.subject}</p>
                  </div>
                  <Separator className="md:col-span-2" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Correspondence Type</p>
                    <Badge variant="outline">{caseData.correspondenceType}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Priority</p>
                    <Badge variant={caseData.priority === "urgent" ? "destructive" : "secondary"}>
                      {caseData.priority === "urgent" ? "Urgent" : "Routine"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Submission Channel</p>
                    <p className="font-medium">{caseData.submissionChannel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">External Reference No.</p>
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
            
            {/* Originator / Contact Information */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Originator / Contact Information
                </CardTitle>
                {canEditDates() && (
                  <Button variant="ghost" size="sm" onClick={() => setShowEditContactDialog(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Originating Entity</p>
                    <p className="font-medium">{caseData.originatingEntity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Submitter Type</p>
                    <p className="font-medium">{caseData.submitterType}</p>
                  </div>
                  <Separator className="md:col-span-2" />
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
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="font-medium">{caseData.contactAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* External Liaisons - Only show if officer is working on case */}
            {caseData.assignedOfficerId && (
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> External Liaisons
                  </CardTitle>
                  {canProcess() && (
                    <Button variant="outline" size="sm" onClick={() => setShowLiaisonDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-1" /> Add Liaison
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
                        {caseData.liaiseAgencies.map(liaison => (
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
            
            {/* Documents */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Documents
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" /> Upload
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
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
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{doc.name}</span>
                            <span className="text-xs text-muted-foreground">({doc.size})</span>
                          </div>
                        </TableCell>
                        <TableCell>{doc.type}</TableCell>
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
          </div>
          
          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* File Association */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" /> File Association
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
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
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Linked Files</p>
                  <div className="space-y-1">
                    {caseData.existingFileRefs.map(ref => (
                      <p key={ref} className="text-sm font-mono bg-muted px-2 py-1 rounded">{ref}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Activity Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4" /> Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`
                          flex h-8 w-8 items-center justify-center rounded-full
                          ${activity.type === 'assignment' ? 'bg-green-100 text-green-600' :
                            activity.type === 'intake' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'liaison' ? 'bg-purple-100 text-purple-600' :
                            'bg-muted text-muted-foreground'}
                        `}>
                          {activity.type === 'assignment' ? <UserPlus className="h-4 w-4" /> :
                           activity.type === 'intake' ? <Mail className="h-4 w-4" /> :
                           activity.type === 'liaison' ? <ExternalLink className="h-4 w-4" /> :
                           <FileCheck className="h-4 w-4" />}
                        </div>
                        {index < activities.length - 1 && <div className="w-0.5 h-full bg-muted mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.user} - {formatDateTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
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
              <p className="text-xs text-muted-foreground">Set a reminder date for follow-up</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDatesDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateDates}>Save Changes</Button>
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
                  {PRIORITY_LEVELS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Confidential</Label>
              <Switch 
                checked={classificationForm.confidentialFlag} 
                onCheckedChange={(v) => setClassificationForm(prev => ({ ...prev, confidentialFlag: v }))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Urgent</Label>
              <Switch 
                checked={classificationForm.urgencyFlag} 
                onCheckedChange={(v) => setClassificationForm(prev => ({ ...prev, urgencyFlag: v }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditClassificationDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateClassification}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Contact Dialog */}
      <Dialog open={showEditContactDialog} onOpenChange={setShowEditContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input 
                value={contactForm.contactName} 
                onChange={(e) => setContactForm(prev => ({ ...prev, contactName: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input 
                value={contactForm.contactJobTitle} 
                onChange={(e) => setContactForm(prev => ({ ...prev, contactJobTitle: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={contactForm.contactPhone} 
                onChange={(e) => setContactForm(prev => ({ ...prev, contactPhone: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={contactForm.contactEmail} 
                onChange={(e) => setContactForm(prev => ({ ...prev, contactEmail: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea 
                value={contactForm.contactAddress} 
                onChange={(e) => setContactForm(prev => ({ ...prev, contactAddress: e.target.value }))} 
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditContactDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateContact}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Liaison Dialog */}
      <Dialog open={showLiaisonDialog} onOpenChange={setShowLiaisonDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Liaise with External Agency</DialogTitle>
            <DialogDescription>Initiate correspondence with an external agency for input.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Agency / Ministry Name *</Label>
              <Input 
                placeholder="e.g., Ministry of Foreign Affairs"
                value={liaisonForm.agencyName} 
                onChange={(e) => setLiaisonForm(prev => ({ ...prev, agencyName: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Name *</Label>
              <Input 
                placeholder="Contact person name"
                value={liaisonForm.contactName} 
                onChange={(e) => setLiaisonForm(prev => ({ ...prev, contactName: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input 
                type="email"
                placeholder="email@agency.gov.bb"
                value={liaisonForm.emailAddress} 
                onChange={(e) => setLiaisonForm(prev => ({ ...prev, emailAddress: e.target.value }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLiaisonDialog(false)}>Cancel</Button>
            <Button onClick={handleAddLiaison} disabled={!liaisonForm.agencyName || !liaisonForm.contactName || !liaisonForm.emailAddress}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
