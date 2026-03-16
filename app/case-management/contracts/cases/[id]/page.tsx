"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { 
  FileSignature, 
  Clock, 
  ArrowLeft,
  Building2,
  User,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  History,
  CheckCircle,
  AlertTriangle,
  Send,
  Download,
  Upload,
  Pencil,
  MoreHorizontal,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  Hash,
  Briefcase,
  Scale,
  Flag,
  ClipboardCheck,
  ExternalLink,
  Gavel,
  Save,
  X,
  UserPlus,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Trash2
} from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils/date-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ========== CONTROLLED VOCABULARIES (from Configuration Workbook TAB 12) ==========
const CONTRACT_TYPES = [
  { value: "New", label: "New Contract" },
  { value: "Supplemental", label: "Supplemental (Amendment/Addendum)" },
  { value: "Renewal", label: "Renewal" },
]

const NATURE_OF_CONTRACT = [
  { value: "Goods", label: "Goods" },
  { value: "Consultancy", label: "Consultancy / Services" },
  { value: "Works", label: "Works" },
]

const CONTRACT_CATEGORIES = [
  { value: "CAT_PROC", label: "Procurement of Goods & Services" },
  { value: "CAT_CONS", label: "Consultancy / Professional Services" },
  { value: "CAT_EMP", label: "Employment / Personnel" },
  { value: "CAT_CONST", label: "Construction / Public Works" },
  { value: "CAT_LEASE", label: "Lease / Property" },
  { value: "CAT_MOU", label: "Inter-Agency / MOU" },
  { value: "CAT_OTHER", label: "Other (exception - justification required)" },
]

const CONTRACT_INSTRUMENT_TYPES = [
  { value: "CLEAN", label: "Cleaning Services" },
  { value: "CONS_CO", label: "Consultancy - Company" },
  { value: "CONS_IND", label: "Consultant/Independent Contractor" },
  { value: "GDS", label: "Goods" },
  { value: "IC", label: "Individual Consultant" },
  { value: "IC_IDB", label: "Individual Consultant (IDB-funded)" },
  { value: "OTHER", label: "Other" },
  { value: "SVC", label: "Services" },
  { value: "UNI", label: "Uniforms" },
  { value: "WKS", label: "Works" },
]

const PROCUREMENT_METHODS = [
  { value: "Open Tender", label: "Open Tender" },
  { value: "Limited Tender", label: "Limited Tender" },
  { value: "Single Source", label: "Single Source" },
  { value: "Direct Purchase", label: "Direct Purchase" },
  { value: "Other", label: "Other" },
]

const FUNDING_SOURCES = [
  { value: "Government Budget - Recurrent", label: "Government Budget - Recurrent" },
  { value: "Government Budget - Capital", label: "Government Budget - Capital" },
  { value: "IDB", label: "Inter-American Development Bank (IDB)" },
  { value: "World Bank", label: "World Bank" },
  { value: "CDB", label: "Caribbean Development Bank (CDB)" },
  { value: "EU", label: "European Union" },
  { value: "Other", label: "Other" },
]

const URGENCY_LEVELS = [
  { value: "Normal", label: "Normal" },
  { value: "Urgent", label: "Urgent" },
  { value: "Critical", label: "Critical" },
]

const MANDATORY_DOCS_STATUS = [
  { value: "Complete", label: "Complete" },
  { value: "Incomplete", label: "Incomplete" },
  { value: "Waived", label: "Waived" },
]

const REGISTRY_FILE_ASSOC_STATUS = [
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Linked", label: "Linked" },
  { value: "No File Found", label: "No File Found" },
]

const RETURN_REASONS = [
  { value: "Missing Documents", label: "Missing Documents" },
  { value: "Clarification Required", label: "Clarification Required" },
  { value: "Incorrect Template", label: "Incorrect Template" },
  { value: "Policy Approval Missing", label: "Policy Approval Missing" },
  { value: "Other", label: "Other" },
]

const LEGAL_OFFICERS = [
  { value: "LO001", label: "John Smith", email: "j.smith@sgc.gov.bb" },
  { value: "LO002", label: "Sarah Williams", email: "s.williams@sgc.gov.bb" },
  { value: "LO003", label: "Michael Brown", email: "m.brown@sgc.gov.bb" },
  { value: "LO004", label: "Jessica Taylor", email: "j.taylor@sgc.gov.bb" },
  { value: "LO005", label: "David Clarke", email: "d.clarke@sgc.gov.bb" },
]

const CONTRACTING_PARTY_SCOPE = [
  { value: "Local", label: "Local" },
  { value: "Regional", label: "Regional (CARICOM)" },
  { value: "International", label: "International" },
]

// Mock case data with COMPLETE properties per configuration workbook
const initialCaseData = {
  // Core Identification
  contractTransactionNo: "CON-2026-00089",
  caseType: "CON_NEW",
  contractType: "New",
  
  // Classification
  natureOfContract: "Consultancy",
  contractCategory: "CAT_CONS",
  contractCategoryOtherJustification: "",
  contractInstrumentType: "CONS_CO",
  contractSubType: "",
  contractTitle: "IT Infrastructure Support Services Agreement",
  
  // Originating Ministry/MDA
  originatingMinistry: "Ministry of Finance",
  originatingMDA: "Information Technology Division",
  
  // Counterparty Information
  counterpartyName: "Caribbean Tech Solutions Ltd.",
  counterpartyTradingName: "CTS",
  counterpartyRegistrationNo: "BB-12345-2020",
  counterpartyTaxId: "TIN-987654321",
  counterpartyContactPerson: "Michael Brown",
  counterpartyContactEmail: "m.brown@ctsbb.com",
  counterpartyContactPhone: "+1 246 555 0123",
  counterpartyAddress: "123 Business Park, Warrens, St. Michael, Barbados",
  contractingPartyScope: "Local",
  
  // Authorized Signatory
  authorizedSignatory: "Hon. John Doe, Minister of Finance",
  
  // Financial Details
  contractValue: 450000.00,
  currency: "BBD",
  
  // Contract Dates
  effectiveDate: "2026-04-01",
  expiryDate: "2029-03-31",
  renewalOption: true,
  renewalTerms: "1 year extension option",
  recommendedCompletionDate: "2026-03-25",
  
  // Procurement
  procurementMethod: "Open Tender",
  tenderReference: "MOF/PROC/2026/001",
  cpoApprovalReference: "",
  fundingSource: "Government Budget - Recurrent",
  
  // Submission Details
  submissionChannel: "Portal",
  dateSubmitted: "2026-03-10",
  externalReferenceNo: "MOF/IT/2026/001",
  
  // Document Checklist Status
  mandatoryDocsChecklistStatus: "Complete",
  
  // Assignment & Processing
  assignedLegalOfficerId: "LO001",
  assignedLegalOfficer: "John Smith",
  assignedLegalOfficerEmail: "j.smith@sgc.gov.bb",
  supervisor: "Sarah Williams (DSG)",
  
  // Contract Status & Stage
  contractStatus: "DRAFTING",
  contractStage: "DRAFT",
  
  // Urgency & Flags
  urgencyLevel: "Normal",
  urgencyFlag: false,
  confidentialFlag: false,
  
  // Approval/Review Properties
  approvalDecision: null,
  approvalComments: "",
  dateSubmittedForApproval: null,
  dateApprovedOrReturned: null,
  approvedBy: null,
  
  // External Loop / Ministry Interaction
  dateSentToMinistry: null,
  dateReturnedFromMinistry: null,
  additionalInfoRequestedFlag: false,
  returnToMDAReason: "",
  returnToMDANotes: "",
  dateAdditionalInfoRequested: null,
  dateAdditionalInfoReceived: null,
  
  // Adjudication Handling
  dateSentToLegalAssistant: null,
  dateReturnedFromRegistryStamp: null,
  outToAdjudicationFlag: false,
  dateAdjudicated: null,
  adjudicationNotes: "",
  
  // Parent/Prior Contract (for Supplemental/Renewal)
  parentContractTransactionNo: "",
  priorContractTransactionNo: "",
  
  // Registry File Association
  registryFileAssocStatus: "Linked",
  existingFileRefs: ["REG/CON/2025/045"],
  
  // SLA
  slaTargetDays: 30,
  slaDaysRemaining: 15,
  slaStatus: "on_track",
  dueDate: "2026-03-25",
  
  // Submitter Details
  submitterName: "James Clarke",
  submitterJobTitle: "Procurement Officer",
  submitterOrganization: "Ministry of Finance",
  submitterEmail: "j.clarke@mof.gov.bb",
  submitterTelephone: "+1 246 555 0456",
}

const workflowStages = [
  { id: "INTAKE", name: "Intake", status: "completed", completedDate: "2026-03-10" },
  { id: "ASSIGN", name: "Assignment", status: "completed", completedDate: "2026-03-11" },
  { id: "FILE_ASSOC", name: "File Association", status: "completed", completedDate: "2026-03-11", parallel: true },
  { id: "DRAFT", name: "Drafting", status: "current" },
  { id: "SUP_REVIEW", name: "Supervisor Review", status: "pending" },
  { id: "MIN_REVIEW", name: "Ministry Review", status: "pending" },
  { id: "SIGN", name: "Signature", status: "pending" },
  { id: "ADJ", name: "Adjudication", status: "pending" },
  { id: "DISPATCH", name: "Dispatch", status: "pending" },
]

const initialDocuments = [
  { id: "1", name: "Award Package - Contract Application.pdf", documentType: "Contract Application", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "2.4 MB", folder: "01 Intake Package" },
  { id: "2", name: "Letter of Award.pdf", documentType: "FORM_LOA", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "456 KB", folder: "01 Intake Package" },
  { id: "3", name: "Certificate of Good Standing.pdf", documentType: "DUE_GS", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "234 KB", folder: "01 Intake Package" },
  { id: "4", name: "Terms of Reference.pdf", documentType: "PROC_TOR", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "567 KB", folder: "01 Intake Package" },
  { id: "5", name: "Draft Contract v1.docx", documentType: "FORM_DRAFT", uploadedBy: "John Smith", uploadedDate: "2026-03-14", size: "1.2 MB", folder: "02 Drafting" },
]

const initialActivities = [
  { id: "1", type: "status_change", description: "Status changed to Drafting", user: "John Smith", timestamp: "2026-03-12T10:30:00" },
  { id: "2", type: "document_upload", description: "Uploaded Draft Contract v1.docx", user: "John Smith", timestamp: "2026-03-14T14:15:00" },
  { id: "3", type: "file_assoc", description: "Registry file association completed - linked REG/CON/2025/045", user: "Mary Johnson (Registry)", timestamp: "2026-03-11T16:20:00" },
  { id: "4", type: "assignment", description: "Case assigned to John Smith by Sarah Williams (DSG)", user: "Sarah Williams", timestamp: "2026-03-11T15:00:00" },
  { id: "5", type: "intake", description: "Intake validation completed - all mandatory documents received", user: "Registry Intake", timestamp: "2026-03-10T14:30:00" },
  { id: "6", type: "submission", description: "Contract submitted via portal", user: "James Clarke (MOF)", timestamp: "2026-03-10T11:20:00" },
]

const initialTasks = [
  { id: "1", title: "Complete contract draft", status: "in_progress", dueDate: "2026-03-18", assignee: "John Smith" },
  { id: "2", title: "Submit for supervisor review", status: "pending", dueDate: "2026-03-19", assignee: "John Smith" },
  { id: "3", title: "Registry file association", status: "completed", dueDate: "2026-03-12", assignee: "Mary Johnson" },
]

const initialComments = [
  { id: "1", author: "John Smith", role: "Legal Officer", content: "Started drafting based on standard consultancy template. Will need to review IDB compliance clauses.", timestamp: "2026-03-12T10:00:00" },
  { id: "2", author: "Sarah Williams", role: "DSG", content: "Please ensure payment schedule aligns with deliverables timeline.", timestamp: "2026-03-13T09:30:00" },
]

const formatCurrency = (value: number, currency: string = "BBD") => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(value)
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    "INTAKE": "New / Intake Validation",
    "ASSIGNED": "Assigned to Officer",
    "DRAFTING": "Drafting",
    "SUP_REVIEW": "With DSG/Supervisor Review",
    "RETURNED_CORR": "Returned for Correction",
    "SENT_MDA": "Sent to Ministry",
    "RETURNED_MDA": "Returned from Ministry",
    "FINAL_SIG": "Finalization / Signature",
    "EXEC_ADJ": "Execution / Adjudication",
    "ADJ_COMP": "Adjudicated/Completed",
    "REJECTED": "Rejected",
    "CLOSED": "Closed",
  }
  return labels[status] || status
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "INTAKE": "bg-blue-100 text-blue-800",
    "ASSIGNED": "bg-purple-100 text-purple-800",
    "DRAFTING": "bg-amber-100 text-amber-800",
    "SUP_REVIEW": "bg-orange-100 text-orange-800",
    "RETURNED_CORR": "bg-red-100 text-red-800",
    "SENT_MDA": "bg-cyan-100 text-cyan-800",
    "RETURNED_MDA": "bg-teal-100 text-teal-800",
    "FINAL_SIG": "bg-indigo-100 text-indigo-800",
    "EXEC_ADJ": "bg-pink-100 text-pink-800",
    "ADJ_COMP": "bg-green-100 text-green-800",
    "REJECTED": "bg-red-100 text-red-800",
    "CLOSED": "bg-gray-100 text-gray-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export default function ContractCaseDetailPage() {
  const params = useParams()
  const [caseData, setCaseData] = useState(initialCaseData)
  const [documents, setDocuments] = useState(initialDocuments)
  const [activities, setActivities] = useState(initialActivities)
  const [tasks, setTasks] = useState(initialTasks)
  const [comments, setComments] = useState(initialComments)
  
  const [activeTab, setActiveTab] = useState("details")
  const [newComment, setNewComment] = useState("")
  
  // Edit states
  const [editClassificationOpen, setEditClassificationOpen] = useState(false)
  const [editDatesOpen, setEditDatesOpen] = useState(false)
  const [editPartiesOpen, setEditPartiesOpen] = useState(false)
  const [editFinancialsOpen, setEditFinancialsOpen] = useState(false)
  const [editAssignmentOpen, setEditAssignmentOpen] = useState(false)
  const [editFlagsOpen, setEditFlagsOpen] = useState(false)
  
  // Workflow action states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  
  // Form states for editing
  const [editForm, setEditForm] = useState(caseData)
  const [returnReason, setReturnReason] = useState("")
  const [returnNotes, setReturnNotes] = useState("")
  const [approvalComments, setApprovalComments] = useState("")
  const [selectedOfficer, setSelectedOfficer] = useState("")

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500"
      case "current": return "bg-blue-500 animate-pulse"
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
  
  // Save handlers
  const handleSaveClassification = () => {
    setCaseData({...caseData, ...editForm})
    setEditClassificationOpen(false)
    addActivity("Case classification updated")
  }
  
  const handleSaveDates = () => {
    setCaseData({...caseData, ...editForm})
    setEditDatesOpen(false)
    addActivity("Case dates/deadlines updated")
  }
  
  const handleSaveParties = () => {
    setCaseData({...caseData, ...editForm})
    setEditPartiesOpen(false)
    addActivity("Counterparty information updated")
  }
  
  const handleSaveFinancials = () => {
    setCaseData({...caseData, ...editForm})
    setEditFinancialsOpen(false)
    addActivity("Financial details updated")
  }
  
  const handleSaveFlags = () => {
    setCaseData({...caseData, ...editForm})
    setEditFlagsOpen(false)
    addActivity("Case flags updated")
  }
  
  // Workflow action handlers
  const handleAssignOfficer = () => {
    const officer = LEGAL_OFFICERS.find(o => o.value === selectedOfficer)
    if (officer) {
      setCaseData({
        ...caseData,
        assignedLegalOfficerId: officer.value,
        assignedLegalOfficer: officer.label,
        assignedLegalOfficerEmail: officer.email,
        contractStatus: "ASSIGNED",
      })
      addActivity(`Case assigned to ${officer.label}`)
      setAssignDialogOpen(false)
      setSelectedOfficer("")
    }
  }
  
  const handleSubmitForReview = () => {
    setCaseData({
      ...caseData,
      contractStatus: "SUP_REVIEW",
      contractStage: "SUP_REVIEW",
      dateSubmittedForApproval: new Date().toISOString().split('T')[0],
    })
    addActivity("Submitted for supervisor review")
  }
  
  const handleApprove = () => {
    setCaseData({
      ...caseData,
      contractStatus: "SENT_MDA",
      contractStage: "MIN_REVIEW",
      approvalDecision: "Approved",
      approvalComments: approvalComments,
      dateApprovedOrReturned: new Date().toISOString().split('T')[0],
      approvedBy: "Sarah Williams (DSG)",
    })
    addActivity("Approved by supervisor - ready to send to Ministry")
    setApproveDialogOpen(false)
    setApprovalComments("")
  }
  
  const handleReturnForCorrections = () => {
    setCaseData({
      ...caseData,
      contractStatus: "RETURNED_CORR",
      returnToMDAReason: returnReason,
      returnToMDANotes: returnNotes,
    })
    addActivity(`Returned for corrections: ${returnReason}`)
    setReturnDialogOpen(false)
    setReturnReason("")
    setReturnNotes("")
  }
  
  const handleSendToMinistry = () => {
    setCaseData({
      ...caseData,
      contractStatus: "SENT_MDA",
      dateSentToMinistry: new Date().toISOString().split('T')[0],
    })
    addActivity("Contract sent to Ministry for review")
  }
  
  const handleMarkReturnedFromMinistry = () => {
    setCaseData({
      ...caseData,
      contractStatus: "RETURNED_MDA",
      dateReturnedFromMinistry: new Date().toISOString().split('T')[0],
    })
    addActivity("Contract returned from Ministry")
  }
  
  const handleSendForAdjudication = () => {
    setCaseData({
      ...caseData,
      contractStatus: "EXEC_ADJ",
      contractStage: "ADJ",
      outToAdjudicationFlag: true,
      dateSentToLegalAssistant: new Date().toISOString().split('T')[0],
    })
    addActivity("Contract sent for adjudication at Supreme Court")
  }
  
  const handleMarkAdjudicated = () => {
    setCaseData({
      ...caseData,
      contractStatus: "ADJ_COMP",
      dateAdjudicated: new Date().toISOString().split('T')[0],
    })
    addActivity("Contract adjudicated - stamp received")
  }
  
  const handleCloseCase = () => {
    setCaseData({
      ...caseData,
      contractStatus: "CLOSED",
      contractStage: "DISPATCH",
    })
    addActivity("Case closed")
  }
  
  const addActivity = (description: string) => {
    const newActivity = {
      id: String(activities.length + 1),
      type: "action",
      description,
      user: "Current User",
      timestamp: new Date().toISOString(),
    }
    setActivities([newActivity, ...activities])
  }
  
  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: String(comments.length + 1),
        author: "Current User",
        role: "Legal Officer",
        content: newComment,
        timestamp: new Date().toISOString(),
      }
      setComments([...comments, comment])
      setNewComment("")
      addActivity("Added comment")
    }
  }

  // Render action buttons based on current status
  const renderActionButtons = () => {
    switch (caseData.contractStatus) {
      case "INTAKE":
        return (
          <>
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Officer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Legal Officer</DialogTitle>
                  <DialogDescription>Select a legal officer to handle this contract case.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>Legal Officer</Label>
                  <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select an officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGAL_OFFICERS.map(officer => (
                        <SelectItem key={officer.value} value={officer.value}>
                          {officer.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAssignOfficer} disabled={!selectedOfficer}>Assign</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return to MDA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Return to Ministry/MDA</DialogTitle>
                  <DialogDescription>Specify the reason for returning this application.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Reason</Label>
                    <Select value={returnReason} onValueChange={setReturnReason}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {RETURN_REASONS.map(reason => (
                          <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea className="mt-2" placeholder="Provide details..." value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleReturnForCorrections} disabled={!returnReason}>Return to MDA</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )
      
      case "ASSIGNED":
      case "DRAFTING":
      case "RETURNED_CORR":
        return (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitForReview}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Review
          </Button>
        )
      
      case "SUP_REVIEW":
        return (
          <>
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Contract</DialogTitle>
                  <DialogDescription>Add any comments before approving.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>Comments (Optional)</Label>
                  <Textarea className="mt-2" placeholder="Add approval comments..." value={approvalComments} onChange={(e) => setApprovalComments(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleApprove}>Approve</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return for Corrections
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Return for Corrections</DialogTitle>
                  <DialogDescription>Specify what needs to be corrected.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Reason</Label>
                    <Select value={returnReason} onValueChange={setReturnReason}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {RETURN_REASONS.map(reason => (
                          <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Details</Label>
                    <Textarea className="mt-2" placeholder="Provide details..." value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleReturnForCorrections} disabled={!returnReason}>Return</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )
      
      case "SENT_MDA":
        return (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleMarkReturnedFromMinistry}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Returned from Ministry
          </Button>
        )
      
      case "RETURNED_MDA":
        return (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setCaseData({...caseData, contractStatus: "FINAL_SIG", contractStage: "SIGN"})}>
            <FileSignature className="h-4 w-4 mr-2" />
            Proceed to Signature
          </Button>
        )
      
      case "FINAL_SIG":
        return (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSendForAdjudication}>
            <Gavel className="h-4 w-4 mr-2" />
            Send for Adjudication
          </Button>
        )
      
      case "EXEC_ADJ":
        return (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleMarkAdjudicated}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Adjudicated
          </Button>
        )
      
      case "ADJ_COMP":
        return (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCloseCase}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Dispatch & Close
          </Button>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/case-management" className="hover:text-foreground transition-colors">
          SGC Digital - Case Management
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/case-management/contracts" className="hover:text-foreground transition-colors">
          Contracts
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/case-management/contracts/workqueue" className="hover:text-foreground transition-colors">
          Workqueue
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{caseData.contractTransactionNo}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/case-management/contracts/workqueue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{caseData.contractTransactionNo}</h1>
            <Badge className={getStatusColor(caseData.contractStatus)}>{getStatusLabel(caseData.contractStatus)}</Badge>
            {caseData.urgencyLevel === "Urgent" && <Badge className="bg-amber-500 text-white">Urgent</Badge>}
            {caseData.urgencyLevel === "Critical" && <Badge className="bg-red-500 text-white">Critical</Badge>}
            {caseData.confidentialFlag && <Badge className="bg-purple-500 text-white">Confidential</Badge>}
          </div>
          <p className="text-muted-foreground mt-1">{caseData.contractTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {renderActionButtons()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Upload className="h-4 w-4 mr-2" /> Upload Document</DropdownMenuItem>
              <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> Export Case Summary</DropdownMenuItem>
              <DropdownMenuItem><FileText className="h-4 w-4 mr-2" /> Generate Cover Letter</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600"><ThumbsDown className="h-4 w-4 mr-2" /> Reject Application</DropdownMenuItem>
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
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getStageStatusColor(stage.status)}`}>
                    {stage.status === "completed" ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-center max-w-[80px]">{stage.name}</span>
                </div>
                {index < workflowStages.filter(s => !s.parallel).length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${stage.status === "completed" ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={getSlaColor(caseData.slaStatus)}>
                <Clock className="h-3 w-3 mr-1" />
                {caseData.slaDaysRemaining} days remaining
              </Badge>
              <span className="text-sm text-muted-foreground">Due: {formatDate(caseData.dueDate)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditForm(caseData); setEditDatesOpen(true); }}>
              <Pencil className="h-3 w-3 mr-1" />
              Edit Deadlines
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Case Details</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="details" className="space-y-6">
          {/* Core Identification */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Core Identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Transaction No.</p>
                  <p className="font-medium">{caseData.contractTransactionNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Type</p>
                  <p className="font-medium">{CONTRACT_TYPES.find(t => t.value === caseData.contractType)?.label || caseData.contractType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submission Channel</p>
                  <p className="font-medium">{caseData.submissionChannel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">External Reference No.</p>
                  <p className="font-medium">{caseData.externalReferenceNo || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Contract Classification
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setEditForm(caseData); setEditClassificationOpen(true); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nature of Contract</p>
                  <p className="font-medium">{NATURE_OF_CONTRACT.find(n => n.value === caseData.natureOfContract)?.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Category</p>
                  <p className="font-medium">{CONTRACT_CATEGORIES.find(c => c.value === caseData.contractCategory)?.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Instrument Type</p>
                  <p className="font-medium">{CONTRACT_INSTRUMENT_TYPES.find(t => t.value === caseData.contractInstrumentType)?.label}</p>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground">Contract Title</p>
                  <p className="font-medium">{caseData.contractTitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Details
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setEditForm(caseData); setEditFinancialsOpen(true); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Value</p>
                  <p className="font-medium text-lg">{formatCurrency(caseData.contractValue, caseData.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{caseData.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funding Source</p>
                  <p className="font-medium">{caseData.fundingSource}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Procurement Method</p>
                  <p className="font-medium">{caseData.procurementMethod}</p>
                </div>
                {caseData.tenderReference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tender Reference</p>
                    <p className="font-medium">{caseData.tenderReference}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Dates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Key Dates & Deadlines
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setEditForm(caseData); setEditDatesOpen(true); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date Submitted</p>
                  <p className="font-medium">{formatDate(caseData.dateSubmitted)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Completion</p>
                  <p className="font-medium">{formatDate(caseData.recommendedCompletionDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Effective Date</p>
                  <p className="font-medium">{formatDate(caseData.effectiveDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">{formatDate(caseData.expiryDate)}</p>
                </div>
                {caseData.renewalOption && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Renewal Option</p>
                    <p className="font-medium">{caseData.renewalTerms}</p>
                  </div>
                )}
                {caseData.dateSentToMinistry && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sent to Ministry</p>
                    <p className="font-medium">{formatDate(caseData.dateSentToMinistry)}</p>
                  </div>
                )}
                {caseData.dateReturnedFromMinistry && (
                  <div>
                    <p className="text-sm text-muted-foreground">Returned from Ministry</p>
                    <p className="font-medium">{formatDate(caseData.dateReturnedFromMinistry)}</p>
                  </div>
                )}
                {caseData.dateAdjudicated && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date Adjudicated</p>
                    <p className="font-medium">{formatDate(caseData.dateAdjudicated)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assignment
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => { setEditForm(caseData); setEditAssignmentOpen(true); }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Legal Officer</p>
                    <p className="font-medium">{caseData.assignedLegalOfficer}</p>
                    <p className="text-xs text-muted-foreground">{caseData.assignedLegalOfficerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supervisor</p>
                    <p className="font-medium">{caseData.supervisor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registry File Status</p>
                    <Badge variant={caseData.registryFileAssocStatus === "Linked" ? "default" : "secondary"}>
                      {caseData.registryFileAssocStatus}
                    </Badge>
                  </div>
                  {caseData.existingFileRefs.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Linked Files</p>
                      <p className="font-medium text-sm">{caseData.existingFileRefs.join(", ")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Flags & Priority
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => { setEditForm(caseData); setEditFlagsOpen(true); }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Urgency Level</p>
                    <Badge variant={caseData.urgencyLevel === "Urgent" ? "destructive" : caseData.urgencyLevel === "Critical" ? "destructive" : "secondary"}>
                      {caseData.urgencyLevel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidential</p>
                    <p className="font-medium">{caseData.confidentialFlag ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mandatory Docs Status</p>
                    <Badge variant={caseData.mandatoryDocsChecklistStatus === "Complete" ? "default" : "destructive"}>
                      {caseData.mandatoryDocsChecklistStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PARTIES TAB */}
        <TabsContent value="parties" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Originating Ministry / MDA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ministry</p>
                  <p className="font-medium">{caseData.originatingMinistry}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department / Agency</p>
                  <p className="font-medium">{caseData.originatingMDA}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground mb-3">Submitter Details</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-4 border-l-2 border-emerald-200">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{caseData.submitterName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Job Title</p>
                  <p className="text-sm font-medium">{caseData.submitterJobTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{caseData.submitterEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telephone</p>
                  <p className="text-sm font-medium">{caseData.submitterTelephone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Counterparty (Contractor/Vendor)
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setEditForm(caseData); setEditPartiesOpen(true); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="font-medium text-lg">{caseData.counterpartyName}</p>
                  {caseData.counterpartyTradingName && (
                    <p className="text-sm text-muted-foreground">Trading as: {caseData.counterpartyTradingName}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scope</p>
                  <Badge>{caseData.contractingPartyScope}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration No.</p>
                  <p className="font-medium">{caseData.counterpartyRegistrationNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tax ID</p>
                  <p className="font-medium">{caseData.counterpartyTaxId}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground mb-3">Contact Person</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-4 border-l-2 border-emerald-200">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{caseData.counterpartyContactPerson}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{caseData.counterpartyContactEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{caseData.counterpartyContactPhone}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">{caseData.counterpartyAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <Button><Upload className="h-4 w-4 mr-2" /> Upload Document</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Folder</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell><Badge variant="outline">{doc.documentType}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.folder}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{formatDate(doc.uploadedDate)}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
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
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 relative">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border-2 border-emerald-500 z-10">
                        <History className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.user} - {formatDateTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Task</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${task.status === "completed" ? "bg-green-500" : task.status === "in_progress" ? "bg-amber-500" : "bg-gray-300"}`} />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.assignee} - Due: {formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                    <Badge variant={task.status === "completed" ? "default" : task.status === "in_progress" ? "secondary" : "outline"}>
                      {task.status.replace("_", " ")}
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
              <CardTitle>Comments & Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6">
                <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}><Send className="h-4 w-4" /></Button>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-medium text-sm">
                      {comment.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{comment.author}</p>
                        <Badge variant="outline" className="text-xs">{comment.role}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDateTime(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialogs */}
      
      {/* Edit Classification Dialog */}
      <Dialog open={editClassificationOpen} onOpenChange={setEditClassificationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contract Classification</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Contract Type</Label>
              <Select value={editForm.contractType} onValueChange={(v) => setEditForm({...editForm, contractType: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nature of Contract</Label>
              <Select value={editForm.natureOfContract} onValueChange={(v) => setEditForm({...editForm, natureOfContract: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NATURE_OF_CONTRACT.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contract Category</Label>
              <Select value={editForm.contractCategory} onValueChange={(v) => setEditForm({...editForm, contractCategory: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTRACT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contract Instrument Type</Label>
              <Select value={editForm.contractInstrumentType} onValueChange={(v) => setEditForm({...editForm, contractInstrumentType: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTRACT_INSTRUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Contract Title</Label>
              <Input className="mt-1" value={editForm.contractTitle} onChange={(e) => setEditForm({...editForm, contractTitle: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditClassificationOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveClassification}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dates Dialog */}
      <Dialog open={editDatesOpen} onOpenChange={setEditDatesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Dates & Deadlines</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Target Completion Date</Label>
              <Input type="date" className="mt-1" value={editForm.recommendedCompletionDate} onChange={(e) => setEditForm({...editForm, recommendedCompletionDate: e.target.value})} />
            </div>
            <div>
              <Label>Due Date (SLA)</Label>
              <Input type="date" className="mt-1" value={editForm.dueDate} onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})} />
            </div>
            <div>
              <Label>Effective Date</Label>
              <Input type="date" className="mt-1" value={editForm.effectiveDate} onChange={(e) => setEditForm({...editForm, effectiveDate: e.target.value})} />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" className="mt-1" value={editForm.expiryDate} onChange={(e) => setEditForm({...editForm, expiryDate: e.target.value})} />
            </div>
            <div className="col-span-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={editForm.renewalOption} onCheckedChange={(v) => setEditForm({...editForm, renewalOption: v})} />
                <Label>Renewal Option</Label>
              </div>
              {editForm.renewalOption && (
                <Input placeholder="Renewal terms..." className="flex-1" value={editForm.renewalTerms} onChange={(e) => setEditForm({...editForm, renewalTerms: e.target.value})} />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDatesOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDates}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Financials Dialog */}
      <Dialog open={editFinancialsOpen} onOpenChange={setEditFinancialsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Financial Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Contract Value</Label>
              <Input type="number" className="mt-1" value={editForm.contractValue} onChange={(e) => setEditForm({...editForm, contractValue: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={editForm.currency} onValueChange={(v) => setEditForm({...editForm, currency: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BBD">BBD - Barbados Dollar</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Funding Source</Label>
              <Select value={editForm.fundingSource} onValueChange={(v) => setEditForm({...editForm, fundingSource: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FUNDING_SOURCES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Procurement Method</Label>
              <Select value={editForm.procurementMethod} onValueChange={(v) => setEditForm({...editForm, procurementMethod: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROCUREMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tender Reference</Label>
              <Input className="mt-1" value={editForm.tenderReference} onChange={(e) => setEditForm({...editForm, tenderReference: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFinancialsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFinancials}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Parties Dialog */}
      <Dialog open={editPartiesOpen} onOpenChange={setEditPartiesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Counterparty Information</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="col-span-2">
              <Label>Company Name</Label>
              <Input className="mt-1" value={editForm.counterpartyName} onChange={(e) => setEditForm({...editForm, counterpartyName: e.target.value})} />
            </div>
            <div>
              <Label>Trading Name</Label>
              <Input className="mt-1" value={editForm.counterpartyTradingName} onChange={(e) => setEditForm({...editForm, counterpartyTradingName: e.target.value})} />
            </div>
            <div>
              <Label>Contracting Party Scope</Label>
              <Select value={editForm.contractingPartyScope} onValueChange={(v) => setEditForm({...editForm, contractingPartyScope: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTRACTING_PARTY_SCOPE.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Registration No.</Label>
              <Input className="mt-1" value={editForm.counterpartyRegistrationNo} onChange={(e) => setEditForm({...editForm, counterpartyRegistrationNo: e.target.value})} />
            </div>
            <div>
              <Label>Tax ID</Label>
              <Input className="mt-1" value={editForm.counterpartyTaxId} onChange={(e) => setEditForm({...editForm, counterpartyTaxId: e.target.value})} />
            </div>
            <Separator className="col-span-2 my-2" />
            <div>
              <Label>Contact Person</Label>
              <Input className="mt-1" value={editForm.counterpartyContactPerson} onChange={(e) => setEditForm({...editForm, counterpartyContactPerson: e.target.value})} />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input className="mt-1" value={editForm.counterpartyContactEmail} onChange={(e) => setEditForm({...editForm, counterpartyContactEmail: e.target.value})} />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input className="mt-1" value={editForm.counterpartyContactPhone} onChange={(e) => setEditForm({...editForm, counterpartyContactPhone: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input className="mt-1" value={editForm.counterpartyAddress} onChange={(e) => setEditForm({...editForm, counterpartyAddress: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPartiesOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveParties}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Flags Dialog */}
      <Dialog open={editFlagsOpen} onOpenChange={setEditFlagsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flags & Priority</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Urgency Level</Label>
              <Select value={editForm.urgencyLevel} onValueChange={(v) => setEditForm({...editForm, urgencyLevel: v, urgencyFlag: v !== "Normal"})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editForm.confidentialFlag} onCheckedChange={(v) => setEditForm({...editForm, confidentialFlag: v})} />
              <Label>Confidential</Label>
            </div>
            <div>
              <Label>Mandatory Docs Status</Label>
              <Select value={editForm.mandatoryDocsChecklistStatus} onValueChange={(v) => setEditForm({...editForm, mandatoryDocsChecklistStatus: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MANDATORY_DOCS_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Registry File Association Status</Label>
              <Select value={editForm.registryFileAssocStatus} onValueChange={(v) => setEditForm({...editForm, registryFileAssocStatus: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGISTRY_FILE_ASSOC_STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFlagsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFlags}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
