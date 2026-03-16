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
  Upload,
  Eye,
  Save,
  X,
  ChevronRight,
  ExternalLink,
  Users,
  Briefcase,
  Archive,
  RefreshCw
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
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

// Controlled vocabularies per Configuration Workbook
const CORRESPONDENCE_TYPES = [
  "General",
  "Litigation",
  "Compensation",
  "Public Trustee",
  "Advisory",
  "International Law",
  "Cabinet / Confidential"
]

const SUBMISSION_CHANNELS = [
  "Portal",
  "Email",
  "Paper Mail",
  "Fax/Other"
]

const SUBMITTER_TYPES = [
  "Ministry/Department",
  "Statutory Body",
  "Member of the Public",
  "Private Sector",
  "Regional/International Body"
]

const PRIORITY_LEVELS = [
  { value: "urgent", label: "Urgent" },
  { value: "routine", label: "Routine" }
]

const FILE_TYPES = [
  "Advisory File",
  "Litigation File",
  "Compensation File",
  "Public Trustee File",
  "International Law File",
  "Foreign / Ministry File",
  "General Correspondence File"
]

const SECURITY_PROFILES = [
  "Registry-Standard",
  "Cabinet-Confidential",
  "Restricted"
]

const FILE_STATUSES = [
  "Pending",
  "In Progress",
  "Complete",
  "Not Required"
]

const CASE_STATUSES = [
  { value: "NEW", label: "New" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PENDING_EXTERNAL", label: "Pending External" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "READY_DISPATCH", label: "Ready for Dispatch" },
  { value: "CLOSED", label: "Closed" },
  { value: "CANCELLED", label: "Cancelled" }
]

const LEGAL_OFFICERS = [
  { id: "ST-001", name: "Sarah Thompson", email: "s.thompson@sgc.gov.bb" },
  { id: "JW-002", name: "James Williams", email: "j.williams@sgc.gov.bb" },
  { id: "MP-003", name: "Maria Patterson", email: "m.patterson@sgc.gov.bb" },
  { id: "RJ-004", name: "Robert Johnson", email: "r.johnson@sgc.gov.bb" },
  { id: "AC-005", name: "Angela Clarke", email: "a.clarke@sgc.gov.bb" }
]

const MDAS = [
  { id: "MOF", name: "Ministry of Finance" },
  { id: "MOH", name: "Ministry of Health" },
  { id: "MOE", name: "Ministry of Education" },
  { id: "PMO", name: "Prime Minister's Office" },
  { id: "AGC", name: "Attorney General's Chambers" },
  { id: "MOT", name: "Ministry of Transport" },
  { id: "MFA", name: "Ministry of Foreign Affairs" }
]

// Mock case data with COMPLETE properties per configuration workbook
const initialCaseData = {
  // Core Identification
  trackingNumber: "COR-2026-00140",
  caseType: "Correspondence",
  
  // Tab 1: Correspondence Information
  fromWhom: "Ministry of Finance",
  toWhom: "Solicitor General",
  subject: "Request for legal opinion regarding proposed amendments to the Public Procurement Act",
  fileReferenceNo: "REG/ADV/2026/140",
  volume: "Vol. 1",
  folioMinuteNo: "F-001",
  
  // Tab 2: Case Information
  correspondenceType: "Advisory",
  correspondenceFrom: "MDA",
  priority: "routine",
  recommendedDeadlineDate: "2026-03-24",
  mailingAddress: "Ministry of Finance, Treasury Building, Bridge Street, Bridgetown",
  contactName: "John Smith",
  contactJobTitle: "Legal Counsel",
  mobilePhone: "+1 246 555-0123",
  emailAddress: "john.smith@mof.gov.bb",
  correspondenceOrigination: "Portal",
  dateCorrespondenceReceived: "2026-03-10T11:20:00",
  externalReferenceNo: "MOF/LEG/2026/015",
  bringUpDate: null,
  officerAssigned: "Sarah Thompson",
  officerAssignedId: "ST-001",
  returnForCorrections: null,
  dateReturned: null,
  
  // Tab 3: SG Directive
  sgDirective: "Please review with particular attention to CARICOM trade obligations. Coordinate with Ministry of Foreign Affairs if required.",
  dateOfDirective: "2026-03-11T09:30:00",
  assignedTo: "Sarah Thompson",
  returnToRegistryDirective: null,
  
  // Tab 4: Senior Officers (for routing to multiple)
  seniorOfficersNotified: [],
  
  // Tab 5: Assigned Officer Processing - Liaise with Agencies
  liaiseAgencies: [
    {
      id: "1",
      agencyName: "Ministry of Foreign Affairs",
      emailAddress: "legal@mfa.gov.bb",
      contactName: "Patricia Moore",
      dateSubmitted: "2026-03-12",
      dateFeedbackReceived: null,
      status: "In Progress"
    }
  ],
  
  // File Types & References
  fileTypes: ["Advisory File", "Foreign / Ministry File"],
  existingFileRefs: ["REG/ADV/2025/089", "REG/MIN/2024/112"],
  
  // Flags
  confidentialFlag: false,
  urgencyFlag: false,
  
  // Case Status
  caseStatus: "ASSIGNED",
  caseStatusLabel: "Assigned",
  
  // Registry File Association
  registryFileAssocStatus: "Complete",
  
  // Security Profile
  securityProfile: "Registry-Standard",
  
  // SLA Details
  dueDate: "2026-03-24",
  slaStatus: "on_track",
  daysRemaining: 8,
  
  // Dates
  dispatchDate: null,
  closureDate: null,
  
  // Originating Entity Details
  originatingMdaId: "MOF",
  originatingMdaName: "Ministry of Finance"
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
  { id: "3", name: "CARICOM Trade Agreement Excerpt.pdf", documentClass: "Reference Material", size: "890 KB", uploadedBy: "Sarah Thompson", uploadedAt: "2026-03-12", category: "reference" },
  { id: "4", name: "Registry Cover Sheet.pdf", documentClass: "Registry Cover Sheet", size: "45 KB", uploadedBy: "System", uploadedAt: "2026-03-10", category: "system" },
]

const initialActivities = [
  { id: "1", type: "intake", description: "Case created via portal submission", user: "System", timestamp: "2026-03-10T11:20:00", details: "Tracking number assigned: COR-2026-00140" },
  { id: "2", type: "intake_validation", description: "Intake validation completed", user: "Registry Clerk", timestamp: "2026-03-10T14:30:00", details: "All mandatory fields captured" },
  { id: "3", type: "file_assoc", description: "File association completed", user: "Registry File Officer", timestamp: "2026-03-11T10:15:00", details: "Linked to existing files: REG/ADV/2025/089, REG/MIN/2024/112" },
  { id: "4", type: "review", description: "SG/DSG review completed", user: "Director General Solicitor", timestamp: "2026-03-11T09:30:00", details: "Assigned to Sarah Thompson with directive" },
  { id: "5", type: "assignment", description: "Case assigned to Legal Officer", user: "Director General Solicitor", timestamp: "2026-03-11T09:30:00", details: "Assigned to Sarah Thompson" },
  { id: "6", type: "liaison", description: "External liaison initiated", user: "Sarah Thompson", timestamp: "2026-03-12T10:00:00", details: "Contacted Ministry of Foreign Affairs" },
]

const tasks = [
  { id: "1", title: "Review submission documents", status: "completed", dueDate: "2026-03-12", assignee: "Sarah Thompson", completedDate: "2026-03-12" },
  { id: "2", title: "Coordinate with Ministry of Foreign Affairs", status: "in_progress", dueDate: "2026-03-18", assignee: "Sarah Thompson" },
  { id: "3", title: "Draft legal opinion", status: "pending", dueDate: "2026-03-20", assignee: "Sarah Thompson" },
  { id: "4", title: "Submit for SG/DSG approval", status: "pending", dueDate: "2026-03-22", assignee: "Sarah Thompson" },
  { id: "5", title: "Finalize and dispatch response", status: "pending", dueDate: "2026-03-24", assignee: "Registry" },
]

const initialComments = [
  { id: "1", author: "Sarah Thompson", timestamp: "2026-03-12T14:15:00", content: "Reviewed submission documents. The proposed amendments have significant implications for CARICOM trade obligations. Initiated contact with Ministry of Foreign Affairs for their input.", isInternal: true },
  { id: "2", author: "Director General Solicitor", timestamp: "2026-03-11T09:35:00", content: "Please prioritize this matter. Ministry has requested response by end of month.", isInternal: true },
]

export default function CorrespondenceCaseDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("details")
  const [caseData, setCaseData] = useState(initialCaseData)
  const [activities, setActivities] = useState(initialActivities)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isInternalComment, setIsInternalComment] = useState(true)
  
  // Edit dialog states
  const [editCorrespondenceInfoOpen, setEditCorrespondenceInfoOpen] = useState(false)
  const [editCaseInfoOpen, setEditCaseInfoOpen] = useState(false)
  const [editSgDirectiveOpen, setEditSgDirectiveOpen] = useState(false)
  const [editDatesOpen, setEditDatesOpen] = useState(false)
  const [editContactOpen, setEditContactOpen] = useState(false)
  const [editFileAssocOpen, setEditFileAssocOpen] = useState(false)
  const [editFlagsOpen, setEditFlagsOpen] = useState(false)
  
  // Action dialog states
  const [assignOfficerOpen, setAssignOfficerOpen] = useState(false)
  const [returnToRegistryOpen, setReturnToRegistryOpen] = useState(false)
  const [submitOutgoingOpen, setSubmitOutgoingOpen] = useState(false)
  const [liaiseAgencyOpen, setLiaiseAgencyOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  
  // Form states
  const [editForm, setEditForm] = useState<any>({})
  const [actionForm, setActionForm] = useState<any>({})

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500"
      case "current": return "bg-blue-500"
      default: return "bg-gray-300"
    }
  }

  const getSlaColor = (status: string) => {
    switch (status) {
      case "on_track": return "text-emerald-600 bg-emerald-50 border-emerald-200"
      case "at_risk": return "text-amber-600 bg-amber-50 border-amber-200"
      case "overdue": return "text-red-600 bg-red-50 border-red-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "NEW": return "secondary"
      case "PENDING_REVIEW": return "outline"
      case "ASSIGNED": return "default"
      case "IN_PROGRESS": return "default"
      case "PENDING_EXTERNAL": return "outline"
      case "ON_HOLD": return "secondary"
      case "READY_DISPATCH": return "default"
      case "CLOSED": return "secondary"
      case "CANCELLED": return "destructive"
      default: return "outline"
    }
  }

  const logActivity = (type: string, description: string, details: string) => {
    const newActivity = {
      id: String(activities.length + 1),
      type,
      description,
      user: "Current User", // Would come from auth
      timestamp: new Date().toISOString(),
      details
    }
    setActivities([newActivity, ...activities])
  }

  // Handle correspondence info edit
  const handleEditCorrespondenceInfo = () => {
    setEditForm({
      fromWhom: caseData.fromWhom,
      toWhom: caseData.toWhom,
      subject: caseData.subject,
      fileReferenceNo: caseData.fileReferenceNo,
      volume: caseData.volume,
      folioMinuteNo: caseData.folioMinuteNo
    })
    setEditCorrespondenceInfoOpen(true)
  }

  const saveCorrespondenceInfo = () => {
    setCaseData({ ...caseData, ...editForm })
    logActivity("edit", "Correspondence information updated", `Subject: ${editForm.subject}`)
    setEditCorrespondenceInfoOpen(false)
  }

  // Handle case info edit
  const handleEditCaseInfo = () => {
    setEditForm({
      correspondenceType: caseData.correspondenceType,
      correspondenceFrom: caseData.correspondenceFrom,
      correspondenceOrigination: caseData.correspondenceOrigination,
      priority: caseData.priority,
      externalReferenceNo: caseData.externalReferenceNo
    })
    setEditCaseInfoOpen(true)
  }

  const saveCaseInfo = () => {
    setCaseData({ ...caseData, ...editForm })
    logActivity("edit", "Case information updated", `Type: ${editForm.correspondenceType}, Priority: ${editForm.priority}`)
    setEditCaseInfoOpen(false)
  }

  // Handle SG directive edit
  const handleEditSgDirective = () => {
    setEditForm({
      sgDirective: caseData.sgDirective,
      assignedTo: caseData.assignedTo
    })
    setEditSgDirectiveOpen(true)
  }

  const saveSgDirective = () => {
    setCaseData({ 
      ...caseData, 
      sgDirective: editForm.sgDirective,
      assignedTo: editForm.assignedTo,
      dateOfDirective: new Date().toISOString()
    })
    logActivity("directive", "SG Directive updated", editForm.sgDirective)
    setEditSgDirectiveOpen(false)
  }

  // Handle dates edit
  const handleEditDates = () => {
    setEditForm({
      recommendedDeadlineDate: caseData.recommendedDeadlineDate,
      bringUpDate: caseData.bringUpDate || "",
      dueDate: caseData.dueDate
    })
    setEditDatesOpen(true)
  }

  const saveDates = () => {
    setCaseData({ ...caseData, ...editForm })
    logActivity("edit", "Dates updated", `Due Date: ${editForm.dueDate}`)
    setEditDatesOpen(false)
  }

  // Handle contact edit
  const handleEditContact = () => {
    setEditForm({
      contactName: caseData.contactName,
      contactJobTitle: caseData.contactJobTitle,
      mobilePhone: caseData.mobilePhone,
      emailAddress: caseData.emailAddress,
      mailingAddress: caseData.mailingAddress
    })
    setEditContactOpen(true)
  }

  const saveContact = () => {
    setCaseData({ ...caseData, ...editForm })
    logActivity("edit", "Contact information updated", `Contact: ${editForm.contactName}`)
    setEditContactOpen(false)
  }

  // Handle file association edit
  const handleEditFileAssoc = () => {
    setEditForm({
      fileTypes: [...caseData.fileTypes],
      existingFileRefs: [...caseData.existingFileRefs],
      registryFileAssocStatus: caseData.registryFileAssocStatus
    })
    setEditFileAssocOpen(true)
  }

  const saveFileAssoc = () => {
    setCaseData({ ...caseData, ...editForm })
    logActivity("edit", "File association updated", `Status: ${editForm.registryFileAssocStatus}`)
    setEditFileAssocOpen(false)
  }

  // Handle flags edit
  const handleEditFlags = () => {
    setEditForm({
      urgencyFlag: caseData.urgencyFlag,
      confidentialFlag: caseData.confidentialFlag,
      securityProfile: caseData.securityProfile
    })
    setEditFlagsOpen(true)
  }

  const saveFlags = () => {
    setCaseData({ ...caseData, ...editForm })
    logActivity("edit", "Flags updated", `Urgent: ${editForm.urgencyFlag}, Confidential: ${editForm.confidentialFlag}`)
    setEditFlagsOpen(false)
  }

  // Workflow Actions
  const handleAssignOfficer = () => {
    setActionForm({
      officerId: "",
      directive: ""
    })
    setAssignOfficerOpen(true)
  }

  const confirmAssignOfficer = () => {
    const officer = LEGAL_OFFICERS.find(o => o.id === actionForm.officerId)
    if (officer) {
      setCaseData({
        ...caseData,
        officerAssigned: officer.name,
        officerAssignedId: officer.id,
        assignedTo: officer.name,
        caseStatus: "ASSIGNED",
        caseStatusLabel: "Assigned"
      })
      logActivity("assignment", `Case assigned to ${officer.name}`, actionForm.directive || "No additional directive")
    }
    setAssignOfficerOpen(false)
  }

  const handleReturnToRegistry = () => {
    setActionForm({
      reason: "",
      returnDirective: ""
    })
    setReturnToRegistryOpen(true)
  }

  const confirmReturnToRegistry = () => {
    setCaseData({
      ...caseData,
      returnForCorrections: actionForm.returnDirective,
      dateReturned: new Date().toISOString(),
      returnToRegistryDirective: actionForm.returnDirective
    })
    logActivity("return", "Case returned to Registry", actionForm.returnDirective)
    setReturnToRegistryOpen(false)
  }

  const handleSubmitOutgoing = () => {
    setActionForm({
      recipientName: caseData.contactName,
      recipientEmail: caseData.emailAddress,
      message: "",
      attachDocument: null
    })
    setSubmitOutgoingOpen(true)
  }

  const confirmSubmitOutgoing = () => {
    setCaseData({
      ...caseData,
      caseStatus: "CLOSED",
      caseStatusLabel: "Closed",
      dispatchDate: new Date().toISOString(),
      closureDate: new Date().toISOString()
    })
    logActivity("dispatch", "Outgoing correspondence sent", `Sent to: ${actionForm.recipientEmail}`)
    setSubmitOutgoingOpen(false)
  }

  const handleLiaiseAgency = () => {
    setActionForm({
      agencyName: "",
      emailAddress: "",
      contactName: "",
      message: ""
    })
    setLiaiseAgencyOpen(true)
  }

  const confirmLiaiseAgency = () => {
    const newLiaison = {
      id: String(caseData.liaiseAgencies.length + 1),
      agencyName: actionForm.agencyName,
      emailAddress: actionForm.emailAddress,
      contactName: actionForm.contactName,
      dateSubmitted: new Date().toISOString().split('T')[0],
      dateFeedbackReceived: null,
      status: "In Progress"
    }
    setCaseData({
      ...caseData,
      liaiseAgencies: [...caseData.liaiseAgencies, newLiaison]
    })
    logActivity("liaison", `Liaison initiated with ${actionForm.agencyName}`, `Contact: ${actionForm.contactName}`)
    setLiaiseAgencyOpen(false)
  }

  const handleSubmitForApproval = () => {
    setCaseData({
      ...caseData,
      caseStatus: "PENDING_REVIEW",
      caseStatusLabel: "Pending Approval"
    })
    logActivity("workflow", "Submitted for SG/DSG approval", "Awaiting review")
  }

  const handleApprove = () => {
    setCaseData({
      ...caseData,
      caseStatus: "READY_DISPATCH",
      caseStatusLabel: "Ready for Dispatch"
    })
    logActivity("approval", "Approved by SG/DSG", "Ready for dispatch")
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment = {
      id: String(comments.length + 1),
      author: "Current User",
      timestamp: new Date().toISOString(),
      content: newComment,
      isInternal: isInternalComment
    }
    setComments([comment, ...comments])
    logActivity("comment", isInternalComment ? "Internal note added" : "Comment added", newComment.substring(0, 50) + "...")
    setNewComment("")
  }

  // Get available actions based on case status
  const getAvailableActions = () => {
    switch (caseData.caseStatus) {
      case "NEW":
        return [
          { label: "Submit to SG/DSG", action: () => setCaseData({...caseData, caseStatus: "PENDING_REVIEW", caseStatusLabel: "Pending Review"}), icon: Send },
          { label: "Return for Corrections", action: handleReturnToRegistry, icon: XCircle, variant: "outline" as const }
        ]
      case "PENDING_REVIEW":
        return [
          { label: "Assign to Officer", action: handleAssignOfficer, icon: UserPlus },
          { label: "Submit to Senior Officers", action: () => {}, icon: Users },
          { label: "Submit to SG Secretary", action: () => {}, icon: Briefcase },
          { label: "Return to Registry", action: handleReturnToRegistry, icon: RefreshCw, variant: "outline" as const }
        ]
      case "ASSIGNED":
      case "IN_PROGRESS":
        return [
          { label: "Liaise with Agency", action: handleLiaiseAgency, icon: ExternalLink },
          { label: "Submit for Approval", action: handleSubmitForApproval, icon: Send },
          { label: "Put on Hold", action: () => setCaseData({...caseData, caseStatus: "ON_HOLD", caseStatusLabel: "On Hold"}), icon: PauseCircle, variant: "outline" as const }
        ]
      case "PENDING_EXTERNAL":
        return [
          { label: "Mark Feedback Received", action: () => setCaseData({...caseData, caseStatus: "IN_PROGRESS", caseStatusLabel: "In Progress"}), icon: CheckCircle },
          { label: "Follow Up", action: handleLiaiseAgency, icon: RefreshCw }
        ]
      case "ON_HOLD":
        return [
          { label: "Resume Processing", action: () => setCaseData({...caseData, caseStatus: "IN_PROGRESS", caseStatusLabel: "In Progress"}), icon: PlayCircle }
        ]
      case "READY_DISPATCH":
        return [
          { label: "Submit Outgoing Correspondence", action: handleSubmitOutgoing, icon: Send },
          { label: "Return for Revision", action: () => setCaseData({...caseData, caseStatus: "IN_PROGRESS", caseStatusLabel: "In Progress"}), icon: RefreshCw, variant: "outline" as const }
        ]
      default:
        return []
    }
  }

  const availableActions = getAvailableActions()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/case-management/correspondence/workqueue">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold">{caseData.trackingNumber}</h1>
                    <Badge variant={getStatusBadgeVariant(caseData.caseStatus)} className="text-xs">
                      {caseData.caseStatusLabel}
                    </Badge>
                    {caseData.urgencyFlag && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                    {caseData.confidentialFlag && (
                      <Badge variant="secondary" className="text-xs"><Shield className="h-3 w-3 mr-1" />Confidential</Badge>
                    )}
                  </div>
                  <p className="text-sm text-white/80 mt-0.5">{caseData.correspondenceType} - {caseData.fromWhom}</p>
                </div>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border ${getSlaColor(caseData.slaStatus)}`}>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{caseData.daysRemaining} days remaining</span>
              </div>
              <p className="text-xs">Due: {formatDate(caseData.dueDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between overflow-x-auto">
            {workflowStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStageStatusColor(stage.status)} text-white text-xs font-medium`}>
                    {stage.status === "completed" ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center ${stage.status === "current" ? "font-semibold text-emerald-700" : "text-gray-500"}`}>
                    {stage.name}
                  </span>
                  {stage.completedDate && (
                    <span className="text-[10px] text-gray-400">{formatDate(stage.completedDate)}</span>
                  )}
                </div>
                {index < workflowStages.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {availableActions.length > 0 && (
        <div className="bg-emerald-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-emerald-700 mr-2">Actions:</span>
              {availableActions.map((action, index) => (
                <Button 
                  key={index} 
                  variant={action.variant || "default"} 
                  size="sm" 
                  onClick={action.action}
                  className={!action.variant ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  <action.icon className="h-4 w-4 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Case Details</TabsTrigger>
            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="liaison">Agency Liaison ({caseData.liaiseAgencies.length})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            <TabsTrigger value="history">Activity Log ({activities.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Tab 1: Correspondence Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">Tab 1: Correspondence Information</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleEditCorrespondenceInfo}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">From Whom</Label>
                      <p className="font-medium text-sm">{caseData.fromWhom}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">To Whom</Label>
                      <p className="font-medium text-sm">{caseData.toWhom}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Subject</Label>
                    <p className="font-medium text-sm">{caseData.subject}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">File Reference #</Label>
                      <p className="font-medium text-sm">{caseData.fileReferenceNo}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Volume</Label>
                      <p className="font-medium text-sm">{caseData.volume}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Folio/Minute #</Label>
                      <p className="font-medium text-sm">{caseData.folioMinuteNo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tab 2: Case Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">Tab 2: Case Information</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleEditCaseInfo}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Type of Correspondence</Label>
                      <p className="font-medium text-sm">{caseData.correspondenceType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Correspondence From</Label>
                      <p className="font-medium text-sm">{caseData.correspondenceFrom}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Badge variant={caseData.priority === "urgent" ? "destructive" : "secondary"}>
                        {caseData.priority === "urgent" ? "Urgent" : "Routine"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Origination</Label>
                      <p className="font-medium text-sm">{caseData.correspondenceOrigination}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Date Received</Label>
                      <p className="font-medium text-sm">{formatDate(caseData.dateCorrespondenceReceived)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">External Reference #</Label>
                      <p className="font-medium text-sm">{caseData.externalReferenceNo}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Officer Assigned</Label>
                    <p className="font-medium text-sm">{caseData.officerAssigned || "Not Assigned"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tab 3: SG Directive */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">Tab 3: SG Directive</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleEditSgDirective}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <Label className="text-xs text-muted-foreground">SG Directive</Label>
                    <p className="font-medium text-sm mt-1">{caseData.sgDirective || "No directive provided"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Date of Directive</Label>
                      <p className="font-medium text-sm">{caseData.dateOfDirective ? formatDateTime(caseData.dateOfDirective) : "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Assigned To</Label>
                      <p className="font-medium text-sm">{caseData.assignedTo || "Not Assigned"}</p>
                    </div>
                  </div>
                  {caseData.returnToRegistryDirective && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <Label className="text-xs text-red-600">Return to Registry Directive</Label>
                      <p className="font-medium text-sm mt-1 text-red-700">{caseData.returnToRegistryDirective}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dates & Deadlines */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">Dates & Deadlines</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleEditDates}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Date Received</Label>
                      <p className="font-medium text-sm">{formatDate(caseData.dateCorrespondenceReceived)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Recommended Deadline</Label>
                      <p className="font-medium text-sm">{formatDate(caseData.recommendedDeadlineDate)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Due Date</Label>
                      <p className="font-medium text-sm text-emerald-600">{formatDate(caseData.dueDate)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Bring Up Date</Label>
                      <p className="font-medium text-sm">{caseData.bringUpDate ? formatDate(caseData.bringUpDate) : "Not Set"}</p>
                    </div>
                  </div>
                  {caseData.dispatchDate && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Dispatch Date</Label>
                        <p className="font-medium text-sm">{formatDate(caseData.dispatchDate)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Closure Date</Label>
                        <p className="font-medium text-sm">{caseData.closureDate ? formatDate(caseData.closureDate) : "N/A"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">Contact Information</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleEditContact}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Contact Name</Label>
                      <p className="font-medium text-sm">{caseData.contactName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Job Title</Label>
                      <p className="font-medium text-sm">{caseData.contactJobTitle}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email Address</Label>
                      <p className="font-medium text-sm">{caseData.emailAddress}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Mobile Phone</Label>
                      <p className="font-medium text-sm">{caseData.mobilePhone}</p>
                    </div>
                  </div>
                  {caseData.mailingAddress && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Mailing Address</Label>
                      <p className="font-medium text-sm">{caseData.mailingAddress}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* File Association */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">File Association</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleEditFileAssoc}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">File Types</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {caseData.fileTypes.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Existing File References</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {caseData.existingFileRefs.map((ref, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{ref}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Association Status</Label>
                      <Badge variant={caseData.registryFileAssocStatus === "Complete" ? "default" : "secondary"}>
                        {caseData.registryFileAssocStatus}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Security Profile</Label>
                      <p className="font-medium text-sm">{caseData.securityProfile}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flags */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">Flags & Priority</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleEditFlags}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${caseData.urgencyFlag ? "bg-red-500" : "bg-gray-300"}`} />
                      <span className="text-sm">Urgent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${caseData.confidentialFlag ? "bg-purple-500" : "bg-gray-300"}`} />
                      <span className="text-sm">Confidential</span>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Security</Label>
                      <p className="font-medium text-sm">{caseData.securityProfile}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-1" /> Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Document Class</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
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
                        <TableCell><Badge variant="outline">{doc.documentClass}</Badge></TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agency Liaison Tab */}
          <TabsContent value="liaison">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Agency Liaison</CardTitle>
                  <CardDescription>Track communications with external government agencies</CardDescription>
                </div>
                <Button size="sm" onClick={handleLiaiseAgency}>
                  <ExternalLink className="h-4 w-4 mr-1" /> New Liaison
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agency Name</TableHead>
                      <TableHead>Contact Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Feedback Received</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caseData.liaiseAgencies.map((liaison) => (
                      <TableRow key={liaison.id}>
                        <TableCell className="font-medium">{liaison.agencyName}</TableCell>
                        <TableCell>{liaison.contactName}</TableCell>
                        <TableCell>{liaison.emailAddress}</TableCell>
                        <TableCell>{formatDate(liaison.dateSubmitted)}</TableCell>
                        <TableCell>{liaison.dateFeedbackReceived ? formatDate(liaison.dateFeedbackReceived) : "Pending"}</TableCell>
                        <TableCell>
                          <Badge variant={liaison.status === "Complete" ? "default" : "secondary"}>
                            {liaison.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Follow Up</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button size="sm">
                  <PlayCircle className="h-4 w-4 mr-1" /> Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={task.status === "completed"} />
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
                        task.status === "completed" ? "secondary" :
                        task.status === "in_progress" ? "default" : "outline"
                      }>
                        {task.status === "in_progress" ? "In Progress" : task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Comments & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Add a comment or note..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={isInternalComment} 
                        onCheckedChange={setIsInternalComment}
                        id="internal"
                      />
                      <Label htmlFor="internal" className="text-sm">Internal note (not visible to submitter)</Label>
                    </div>
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 mr-1" /> Add Comment
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className={`p-4 rounded-lg ${comment.isInternal ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{comment.author}</span>
                          {comment.isInternal && <Badge variant="outline" className="text-xs">Internal</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDateTime(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <History className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.description}</p>
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
        </Tabs>
      </div>

      {/* Edit Correspondence Information Dialog */}
      <Dialog open={editCorrespondenceInfoOpen} onOpenChange={setEditCorrespondenceInfoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Correspondence Information</DialogTitle>
            <DialogDescription>Update Tab 1 correspondence details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Whom</Label>
                <Input 
                  value={editForm.fromWhom || ""} 
                  onChange={(e) => setEditForm({...editForm, fromWhom: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>To Whom</Label>
                <Input 
                  value={editForm.toWhom || ""} 
                  onChange={(e) => setEditForm({...editForm, toWhom: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Textarea 
                value={editForm.subject || ""} 
                onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>File Reference #</Label>
                <Input 
                  value={editForm.fileReferenceNo || ""} 
                  onChange={(e) => setEditForm({...editForm, fileReferenceNo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Volume</Label>
                <Input 
                  value={editForm.volume || ""} 
                  onChange={(e) => setEditForm({...editForm, volume: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Folio/Minute #</Label>
                <Input 
                  value={editForm.folioMinuteNo || ""} 
                  onChange={(e) => setEditForm({...editForm, folioMinuteNo: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCorrespondenceInfoOpen(false)}>Cancel</Button>
            <Button onClick={saveCorrespondenceInfo} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Case Information Dialog */}
      <Dialog open={editCaseInfoOpen} onOpenChange={setEditCaseInfoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Case Information</DialogTitle>
            <DialogDescription>Update Tab 2 case details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type of Correspondence</Label>
                <Select value={editForm.correspondenceType} onValueChange={(v) => setEditForm({...editForm, correspondenceType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CORRESPONDENCE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Correspondence From</Label>
                <Select value={editForm.correspondenceFrom} onValueChange={(v) => setEditForm({...editForm, correspondenceFrom: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MDA">Ministry/Department/Agency</SelectItem>
                    <SelectItem value="Public">Member of the Public</SelectItem>
                    <SelectItem value="Private">Private Sector</SelectItem>
                    <SelectItem value="Regional">Regional/International Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editForm.priority} onValueChange={(v) => setEditForm({...editForm, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Correspondence Origination</Label>
                <Select value={editForm.correspondenceOrigination} onValueChange={(v) => setEditForm({...editForm, correspondenceOrigination: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUBMISSION_CHANNELS.map(ch => (
                      <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>External Reference #</Label>
              <Input 
                value={editForm.externalReferenceNo || ""} 
                onChange={(e) => setEditForm({...editForm, externalReferenceNo: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCaseInfoOpen(false)}>Cancel</Button>
            <Button onClick={saveCaseInfo} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit SG Directive Dialog */}
      <Dialog open={editSgDirectiveOpen} onOpenChange={setEditSgDirectiveOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SG Directive</DialogTitle>
            <DialogDescription>Update the SG directive and assignment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>SG Directive</Label>
              <Textarea 
                value={editForm.sgDirective || ""} 
                onChange={(e) => setEditForm({...editForm, sgDirective: e.target.value})}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={editForm.assignedTo} onValueChange={(v) => setEditForm({...editForm, assignedTo: v})}>
                <SelectTrigger><SelectValue placeholder="Select officer" /></SelectTrigger>
                <SelectContent>
                  {LEGAL_OFFICERS.map(officer => (
                    <SelectItem key={officer.id} value={officer.name}>{officer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSgDirectiveOpen(false)}>Cancel</Button>
            <Button onClick={saveSgDirective} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dates Dialog */}
      <Dialog open={editDatesOpen} onOpenChange={setEditDatesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dates & Deadlines</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recommended Deadline Date</Label>
              <Input 
                type="date"
                value={editForm.recommendedDeadlineDate || ""} 
                onChange={(e) => setEditForm({...editForm, recommendedDeadlineDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input 
                type="date"
                value={editForm.dueDate || ""} 
                onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Bring Up Date</Label>
              <Input 
                type="date"
                value={editForm.bringUpDate || ""} 
                onChange={(e) => setEditForm({...editForm, bringUpDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDatesOpen(false)}>Cancel</Button>
            <Button onClick={saveDates} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={editContactOpen} onOpenChange={setEditContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input 
                  value={editForm.contactName || ""} 
                  onChange={(e) => setEditForm({...editForm, contactName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input 
                  value={editForm.contactJobTitle || ""} 
                  onChange={(e) => setEditForm({...editForm, contactJobTitle: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email"
                  value={editForm.emailAddress || ""} 
                  onChange={(e) => setEditForm({...editForm, emailAddress: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Phone</Label>
                <Input 
                  value={editForm.mobilePhone || ""} 
                  onChange={(e) => setEditForm({...editForm, mobilePhone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mailing Address</Label>
              <Textarea 
                value={editForm.mailingAddress || ""} 
                onChange={(e) => setEditForm({...editForm, mailingAddress: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContactOpen(false)}>Cancel</Button>
            <Button onClick={saveContact} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Flags Dialog */}
      <Dialog open={editFlagsOpen} onOpenChange={setEditFlagsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flags & Priority</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Urgent</Label>
                <p className="text-sm text-muted-foreground">Mark as urgent priority</p>
              </div>
              <Switch 
                checked={editForm.urgencyFlag || false} 
                onCheckedChange={(v) => setEditForm({...editForm, urgencyFlag: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Confidential</Label>
                <p className="text-sm text-muted-foreground">Restrict access to authorized personnel</p>
              </div>
              <Switch 
                checked={editForm.confidentialFlag || false} 
                onCheckedChange={(v) => setEditForm({...editForm, confidentialFlag: v})}
              />
            </div>
            <div className="space-y-2">
              <Label>Security Profile</Label>
              <Select value={editForm.securityProfile} onValueChange={(v) => setEditForm({...editForm, securityProfile: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECURITY_PROFILES.map(profile => (
                    <SelectItem key={profile} value={profile}>{profile}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFlagsOpen(false)}>Cancel</Button>
            <Button onClick={saveFlags} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Officer Dialog */}
      <Dialog open={assignOfficerOpen} onOpenChange={setAssignOfficerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Officer</DialogTitle>
            <DialogDescription>Select an officer and provide directive</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Officer</Label>
              <Select value={actionForm.officerId} onValueChange={(v) => setActionForm({...actionForm, officerId: v})}>
                <SelectTrigger><SelectValue placeholder="Select officer" /></SelectTrigger>
                <SelectContent>
                  {LEGAL_OFFICERS.map(officer => (
                    <SelectItem key={officer.id} value={officer.id}>{officer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Directive (Optional)</Label>
              <Textarea 
                value={actionForm.directive || ""} 
                onChange={(e) => setActionForm({...actionForm, directive: e.target.value})}
                placeholder="Enter directive for the officer..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOfficerOpen(false)}>Cancel</Button>
            <Button onClick={confirmAssignOfficer} className="bg-emerald-600 hover:bg-emerald-700">Assign Officer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return to Registry Dialog */}
      <Dialog open={returnToRegistryOpen} onOpenChange={setReturnToRegistryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to Registry</DialogTitle>
            <DialogDescription>Provide reason for returning the case</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Return Directive</Label>
              <Textarea 
                value={actionForm.returnDirective || ""} 
                onChange={(e) => setActionForm({...actionForm, returnDirective: e.target.value})}
                placeholder="Enter reason for return..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnToRegistryOpen(false)}>Cancel</Button>
            <Button onClick={confirmReturnToRegistry} variant="destructive">Return Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Outgoing Correspondence Dialog */}
      <Dialog open={submitOutgoingOpen} onOpenChange={setSubmitOutgoingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Outgoing Correspondence</DialogTitle>
            <DialogDescription>Send response to the originator</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input 
                  value={actionForm.recipientName || ""} 
                  onChange={(e) => setActionForm({...actionForm, recipientName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input 
                  type="email"
                  value={actionForm.recipientEmail || ""} 
                  onChange={(e) => setActionForm({...actionForm, recipientEmail: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea 
                value={actionForm.message || ""} 
                onChange={(e) => setActionForm({...actionForm, message: e.target.value})}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Attach Response Document</Label>
              <Input type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOutgoingOpen(false)}>Cancel</Button>
            <Button onClick={confirmSubmitOutgoing} className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4 mr-1" /> Send & Close Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Liaise with Agency Dialog */}
      <Dialog open={liaiseAgencyOpen} onOpenChange={setLiaiseAgencyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liaise with Government Agency</DialogTitle>
            <DialogDescription>Initiate communication with external agency</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Agency Name</Label>
              <Select value={actionForm.agencyName} onValueChange={(v) => {
                const mda = MDAS.find(m => m.name === v)
                setActionForm({...actionForm, agencyName: v})
              }}>
                <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
                <SelectContent>
                  {MDAS.map(mda => (
                    <SelectItem key={mda.id} value={mda.name}>{mda.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input 
                  value={actionForm.contactName || ""} 
                  onChange={(e) => setActionForm({...actionForm, contactName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email"
                  value={actionForm.emailAddress || ""} 
                  onChange={(e) => setActionForm({...actionForm, emailAddress: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea 
                value={actionForm.message || ""} 
                onChange={(e) => setActionForm({...actionForm, message: e.target.value})}
                placeholder="Enter message to agency..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLiaiseAgencyOpen(false)}>Cancel</Button>
            <Button onClick={confirmLiaiseAgency} className="bg-emerald-600 hover:bg-emerald-700">
              <ExternalLink className="h-4 w-4 mr-1" /> Send to Agency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
