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
  Gavel
} from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils/date-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock case data with COMPLETE properties per configuration workbook
const caseData = {
  // Core Identification
  contractTransactionNo: "CON-2026-00089",
  caseType: "CON_NEW",
  contractType: "New Contract",
  
  // Classification
  natureOfContract: "Consultancy / Services",
  contractCategory: "Consultancy / Professional Services",
  contractInstrumentType: "Consultancy - Company",
  contractSubType: null, // Only if InstrumentType = OTHER
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
  recommendedCompletionDate: "2026-03-25",
  
  // Procurement
  procurementMethod: "Open Tender",
  cpoApprovalReference: null, // Only if Single Source
  fundingSource: "Government Budget - Recurrent",
  
  // Submission Details
  submissionChannel: "Portal",
  dateSubmitted: "2026-03-10T11:20:00",
  externalReferenceNo: "MOF/IT/2026/001",
  
  // Document Checklist Status
  mandatoryDocsChecklistStatus: "Complete",
  
  // Assignment & Processing
  assignedLegalOfficer: "John Smith",
  assignedLegalOfficerEmail: "j.smith@sgc.gov.bb",
  supervisor: "Sarah Williams (DSG)",
  
  // Contract Status & Stage
  contractStatus: "DRAFTING",
  contractStatusLabel: "Drafting",
  contractStage: "DRAFT",
  
  // Approval/Review Properties
  approvalDecision: null,
  approvalComments: null,
  dateSubmittedForApproval: null,
  dateApprovedOrReturned: null,
  approvedBy: null,
  
  // External Loop / Ministry Interaction
  dateSentToMinistry: null,
  dateReturnedFromMinistry: null,
  additionalInfoRequestedFlag: false,
  returnToMDAReason: null,
  dateAdditionalInfoRequested: null,
  dateAdditionalInfoReceived: null,
  
  // Adjudication Handling
  dateSentToLegalAssistant: null,
  dateReturnedFromRegistryStamp: null,
  outToAdjudicationFlag: false,
  dateAdjudicated: null,
  adjudicationNotes: null,
  
  // Parent/Prior Contract (for Supplemental/Renewal)
  parentContractTransactionNo: null,
  priorContractTransactionNo: null,
  
  // Registry File Association
  registryFileAssocStatus: "Complete",
  existingFileRefs: ["REG/CON/2025/045"],
  
  // SLA & Priority
  urgencyFlag: false,
  confidentialFlag: false,
  priority: "high",
  slaStatus: "on_track",
  daysRemaining: 4,
  dueDate: "2026-03-20",
  
  // Submitter Details
  submitter: {
    name: "James Clarke",
    jobTitle: "Procurement Officer",
    organization: "Ministry of Finance",
    email: "j.clarke@mof.gov.bb",
    telephone: "+1 246 555 0456"
  }
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

const documents = [
  { id: "1", name: "Award Package - Contract Application.pdf", documentType: "Contract Application", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "2.4 MB", folder: "Award Package / Intake" },
  { id: "2", name: "Letter of Award.pdf", documentType: "FORM_LOA", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "456 KB", folder: "Award Package / Intake" },
  { id: "3", name: "Certificate of Good Standing.pdf", documentType: "DUE_GS", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "234 KB", folder: "Award Package / Intake" },
  { id: "4", name: "Company Incorporation Documents.pdf", documentType: "DUE_INCORP", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "1.1 MB", folder: "Award Package / Intake" },
  { id: "5", name: "Proposal Submission.pdf", documentType: "PROC_PROP", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "3.2 MB", folder: "Award Package / Intake" },
  { id: "6", name: "Terms of Reference.pdf", documentType: "PROC_TOR", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "567 KB", folder: "Award Package / Intake" },
  { id: "7", name: "Payment Schedule.pdf", documentType: "FORM_PAY_SCHED", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "123 KB", folder: "Award Package / Intake" },
  { id: "8", name: "Schedule of Deliverables.pdf", documentType: "FORM_SCHED_DELIV", uploadedBy: "James Clarke", uploadedDate: "2026-03-10", size: "89 KB", folder: "Award Package / Intake" },
  { id: "9", name: "Draft Contract v1.docx", documentType: "Draft Contract", uploadedBy: "John Smith", uploadedDate: "2026-03-14", size: "1.2 MB", folder: "Draft Contracts" },
  { id: "10", name: "Legal Review Notes.pdf", documentType: "Internal Notes", uploadedBy: "John Smith", uploadedDate: "2026-03-15", size: "345 KB", folder: "Draft Contracts" },
]

const activities = [
  { id: "1", type: "status_change", description: "Status changed to Drafting", user: "John Smith", timestamp: "2026-03-12T10:30:00" },
  { id: "2", type: "document_upload", description: "Uploaded Draft Contract v1.docx", user: "John Smith", timestamp: "2026-03-14T14:15:00" },
  { id: "3", type: "comment", description: "Added review notes regarding clause 5.2", user: "John Smith", timestamp: "2026-03-15T09:45:00" },
  { id: "4", type: "file_assoc", description: "Registry file association completed - linked REG/CON/2025/045", user: "Mary Johnson (Registry)", timestamp: "2026-03-11T16:20:00" },
  { id: "5", type: "assignment", description: "Case assigned to John Smith by Sarah Williams (DSG)", user: "Sarah Williams", timestamp: "2026-03-11T15:00:00" },
  { id: "6", type: "intake", description: "Intake validation completed - all mandatory documents received", user: "Registry Intake", timestamp: "2026-03-10T14:30:00" },
  { id: "7", type: "submission", description: "Contract submitted via portal", user: "James Clarke (MOF)", timestamp: "2026-03-10T11:20:00" },
]

const tasks = [
  { id: "1", title: "Complete contract draft", status: "in_progress", dueDate: "2026-03-18", assignee: "John Smith" },
  { id: "2", title: "Submit for supervisor review", status: "pending", dueDate: "2026-03-19", assignee: "John Smith" },
  { id: "3", title: "Obtain ministry feedback", status: "pending", dueDate: "2026-03-25", assignee: "John Smith" },
]

const formatCurrency = (value: number, currency: string = "BBD") => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(value)
}

export default function ContractCaseDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("details")
  const [newComment, setNewComment] = useState("")

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

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/case-management/contracts/workqueue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{caseData.contractTransactionNo}</h1>
            <Badge className="bg-amber-100 text-amber-800">{caseData.contractStatusLabel}</Badge>
            {caseData.priority === "high" && (
              <Badge className="bg-amber-500 text-white">High Priority</Badge>
            )}
            {caseData.urgencyFlag && (
              <Badge className="bg-red-500 text-white">Urgent</Badge>
            )}
            {caseData.confidentialFlag && (
              <Badge className="bg-purple-500 text-white">Confidential</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{caseData.contractTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Case Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> Edit Case</DropdownMenuItem>
              <DropdownMenuItem><Upload className="h-4 w-4 mr-2" /> Upload Document</DropdownMenuItem>
              <DropdownMenuItem><Send className="h-4 w-4 mr-2" /> Submit for Review</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><ExternalLink className="h-4 w-4 mr-2" /> Send to Ministry</DropdownMenuItem>
              <DropdownMenuItem><Gavel className="h-4 w-4 mr-2" /> Send for Adjudication</DropdownMenuItem>
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
                  {stage.completedDate && (
                    <span className="text-xs text-muted-foreground">{formatDate(stage.completedDate)}</span>
                  )}
                </div>
                {index < workflowStages.filter(s => !s.parallel).length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${stage.status === "completed" ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* SLA Info */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={getSlaColor(caseData.slaStatus)}>
                <Clock className="h-3 w-3 mr-1" />
                {caseData.daysRemaining} days remaining
              </Badge>
              <span className="text-sm text-muted-foreground">Due: {formatDate(caseData.dueDate)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Stage: <span className="font-medium">{caseData.contractStage}</span>
            </span>
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
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        {/* DETAILS TAB - Complete Case Properties */}
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
                  <p className="text-sm text-muted-foreground">Contract Transaction No.</p>
                  <p className="font-medium">{caseData.contractTransactionNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Case Type</p>
                  <p className="font-medium">{caseData.contractType}</p>
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
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Contract Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nature of Contract</p>
                  <p className="font-medium">{caseData.natureOfContract}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Category</p>
                  <p className="font-medium">{caseData.contractCategory}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Instrument Type</p>
                  <p className="font-medium">{caseData.contractInstrumentType}</p>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground">Contract Title / Subject Matter</p>
                  <p className="font-medium">{caseData.contractTitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Originating Ministry/MDA */}
          <Card>
            <CardHeader>
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
              <div>
                <p className="text-sm text-muted-foreground mb-2">Submitter Details</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-4 border-l-2 border-emerald-200">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">{caseData.submitter.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Job Title</p>
                    <p className="text-sm font-medium">{caseData.submitter.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{caseData.submitter.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telephone</p>
                    <p className="text-sm font-medium">{caseData.submitter.telephone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Details
              </CardTitle>
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
              </div>
              {caseData.cpoApprovalReference && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">CPO Approval Reference (Single Source)</p>
                  <p className="font-medium">{caseData.cpoApprovalReference}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Contract Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date Submitted</p>
                  <p className="font-medium">{formatDate(caseData.dateSubmitted)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Effective Date</p>
                  <p className="font-medium">{formatDate(caseData.effectiveDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">{caseData.expiryDate ? formatDate(caseData.expiryDate) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renewal Option</p>
                  <p className="font-medium">{caseData.renewalOption ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recommended Completion Date</p>
                  <p className="font-medium">{caseData.recommendedCompletionDate ? formatDate(caseData.recommendedCompletionDate) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SLA Due Date</p>
                  <p className="font-medium">{formatDate(caseData.dueDate)}</p>
                </div>
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
                  <p className="text-sm text-muted-foreground">Assigned Legal Officer</p>
                  <p className="font-medium">{caseData.assignedLegalOfficer}</p>
                  <p className="text-xs text-muted-foreground">{caseData.assignedLegalOfficerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supervisor</p>
                  <p className="font-medium">{caseData.supervisor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract Status</p>
                  <Badge className="bg-amber-100 text-amber-800">{caseData.contractStatusLabel}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mandatory Docs Checklist</p>
                  <Badge className={caseData.mandatoryDocsChecklistStatus === "Complete" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                    {caseData.mandatoryDocsChecklistStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registry File Association</p>
                  <Badge className={caseData.registryFileAssocStatus === "Complete" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                    {caseData.registryFileAssocStatus}
                  </Badge>
                </div>
                {caseData.existingFileRefs && caseData.existingFileRefs.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Linked File References</p>
                    <p className="font-medium">{caseData.existingFileRefs.join(", ")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ministry Interaction (if applicable) */}
          {(caseData.dateSentToMinistry || caseData.additionalInfoRequestedFlag) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Ministry Interaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date Sent to Ministry</p>
                    <p className="font-medium">{caseData.dateSentToMinistry ? formatDate(caseData.dateSentToMinistry) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Returned from Ministry</p>
                    <p className="font-medium">{caseData.dateReturnedFromMinistry ? formatDate(caseData.dateReturnedFromMinistry) : "Pending"}</p>
                  </div>
                  {caseData.additionalInfoRequestedFlag && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Return to MDA Reason</p>
                        <p className="font-medium">{caseData.returnToMDAReason || "N/A"}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Adjudication (if applicable) */}
          {caseData.outToAdjudicationFlag && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  Adjudication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date Sent to Legal Assistant</p>
                    <p className="font-medium">{caseData.dateSentToLegalAssistant ? formatDate(caseData.dateSentToLegalAssistant) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Adjudicated</p>
                    <p className="font-medium">{caseData.dateAdjudicated ? formatDate(caseData.dateAdjudicated) : "Pending"}</p>
                  </div>
                  {caseData.adjudicationNotes && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Adjudication Notes</p>
                      <p className="font-medium">{caseData.adjudicationNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PARTIES TAB */}
        <TabsContent value="parties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Counterparty / Contractor Information</CardTitle>
              <CardDescription>Details of the contracting party</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Legal Name</p>
                    <p className="font-medium text-lg">{caseData.counterpartyName}</p>
                  </div>
                  {caseData.counterpartyTradingName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Trading Name / DBA</p>
                      <p className="font-medium">{caseData.counterpartyTradingName}</p>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Registration No.</p>
                      <p className="font-medium">{caseData.counterpartyRegistrationNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tax ID</p>
                      <p className="font-medium">{caseData.counterpartyTaxId}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contracting Party Scope</p>
                    <Badge variant="outline">{caseData.contractingPartyScope}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{caseData.counterpartyContactPerson}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{caseData.counterpartyContactEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{caseData.counterpartyContactPhone}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <p>{caseData.counterpartyAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Authorized Signatory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{caseData.authorizedSignatory || "Not specified"}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Documents</CardTitle>
                <CardDescription>All documents associated with this contract case</CardDescription>
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
                    <TableHead>Document Type</TableHead>
                    <TableHead>Folder</TableHead>
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
                        <Badge variant="outline">{doc.documentType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.folder}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{formatDate(doc.uploadedDate)}</TableCell>
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
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "submission" ? "bg-emerald-100 text-emerald-600" :
                        activity.type === "assignment" ? "bg-blue-100 text-blue-600" :
                        activity.type === "status_change" ? "bg-amber-100 text-amber-600" :
                        activity.type === "document_upload" ? "bg-purple-100 text-purple-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {activity.type === "submission" ? <Send className="h-4 w-4" /> :
                         activity.type === "assignment" ? <User className="h-4 w-4" /> :
                         activity.type === "status_change" ? <Flag className="h-4 w-4" /> :
                         activity.type === "document_upload" ? <FileText className="h-4 w-4" /> :
                         <History className="h-4 w-4" />}
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-px h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
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
                    <Badge variant={task.status === "in_progress" ? "default" : "outline"}>
                      {task.status === "in_progress" ? "In Progress" : "Pending"}
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
            <CardContent className="space-y-4">
              <div className="space-y-4">
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
