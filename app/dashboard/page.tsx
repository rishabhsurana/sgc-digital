"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  FileText, 
  FileSignature, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  Plus,
  Filter,
  Calendar,
  Building2,
  ArrowRight,
  RefreshCw,
  User,
  LogOut,
  Settings,
  Upload,
  Paperclip,
  X,
  FileIcon,
  Send,
  LayoutDashboard
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AskRex } from "@/components/ask-rex"
import Link from "next/link"

// User info interface
interface UserInfo {
  fullName: string
  email: string
  submitterType: string
  organization?: string
  entityNumber: string
}

// Submitter type labels
const SUBMITTER_TYPE_LABELS: Record<string, string> = {
  ministry: "Ministry / Government Agency",
  court: "Court",
  statutory: "Statutory Body",
  public: "Member of the Public",
  attorney: "Attorney-at-Law",
  other: "Other"
}

type SubmissionStatus = "pending" | "in-review" | "clarification" | "approved" | "completed" | "rejected"

interface SGCDocument {
  id: string
  name: string
  type: string
  size: string
  uploadedDate: string
  uploadedBy: string
}

interface Submission {
  id: string
  transactionNumber: string
  type: "correspondence" | "contract"
  title: string
  submittedDate: string
  lastUpdated: string
  status: SubmissionStatus
  ministry?: string
  stage: string
  history: { date: string; stage: string; note?: string }[]
  sgcDocuments?: SGCDocument[]
}

// Mock data for demonstration
const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "1",
    transactionNumber: "COR-M4KL2X",
    type: "correspondence",
    title: "Legal Advisory Request - Land Acquisition",
    submittedDate: "2026-02-28",
    lastUpdated: "2026-03-02",
    status: "in-review",
    stage: "SGC Legal Review",
    history: [
      { date: "2026-02-28", stage: "Submitted", note: "Initial submission received" },
      { date: "2026-02-28", stage: "Registry Intake", note: "Verified and assigned" },
      { date: "2026-03-01", stage: "SGC Legal Review", note: "Under review by legal officer" }
    ],
    sgcDocuments: [
      { id: "doc1", name: "Initial Review Notes.pdf", type: "PDF", size: "245 KB", uploadedDate: "2026-03-01", uploadedBy: "SGC Legal Officer" }
    ]
  },
  {
    id: "2",
    transactionNumber: "CON-N5PQ3Y",
    type: "contract",
    title: "IT Services Contract - Ministry of Finance",
    submittedDate: "2026-02-25",
    lastUpdated: "2026-03-01",
    status: "clarification",
    ministry: "Ministry of Finance",
    stage: "Returned for Clarification",
    history: [
      { date: "2026-02-25", stage: "Submitted", note: "Initial submission received" },
      { date: "2026-02-26", stage: "Intake Validation", note: "Documents verified" },
      { date: "2026-02-28", stage: "Legal Review", note: "Initial review completed" },
      { date: "2026-03-01", stage: "Returned for Clarification", note: "Missing performance bond documentation" }
    ],
    sgcDocuments: [
      { id: "doc2", name: "Clarification Request Letter.pdf", type: "PDF", size: "156 KB", uploadedDate: "2026-03-01", uploadedBy: "SGC Registry" },
      { id: "doc3", name: "Required Documents Checklist.docx", type: "DOCX", size: "45 KB", uploadedDate: "2026-03-01", uploadedBy: "SGC Legal Officer" }
    ]
  },
  {
    id: "3",
    transactionNumber: "COR-J2HK9Z",
    type: "correspondence",
    title: "Cabinet Paper Review - Housing Policy",
    submittedDate: "2026-02-20",
    lastUpdated: "2026-02-27",
    status: "completed",
    stage: "Completed",
    history: [
      { date: "2026-02-20", stage: "Submitted", note: "Initial submission received" },
      { date: "2026-02-21", stage: "Registry Intake", note: "Verified and assigned" },
      { date: "2026-02-23", stage: "Legal Review", note: "Review completed" },
      { date: "2026-02-25", stage: "SG Approval", note: "Approved by Solicitor General" },
      { date: "2026-02-27", stage: "Completed", note: "Response document available" }
    ],
    sgcDocuments: [
      { id: "doc4", name: "Legal Opinion - Housing Policy.pdf", type: "PDF", size: "520 KB", uploadedDate: "2026-02-27", uploadedBy: "Solicitor General" },
      { id: "doc5", name: "Cabinet Paper Approval.pdf", type: "PDF", size: "180 KB", uploadedDate: "2026-02-27", uploadedBy: "SGC Registry" }
    ]
  },
  {
    id: "4",
    transactionNumber: "CON-R8TV4W",
    type: "contract",
    title: "Construction Works - School Renovation",
    submittedDate: "2026-02-15",
    lastUpdated: "2026-02-28",
    status: "approved",
    ministry: "Ministry of Education",
    stage: "Contract Finalization",
    history: [
      { date: "2026-02-15", stage: "Submitted", note: "Initial submission received" },
      { date: "2026-02-16", stage: "Intake Validation", note: "Documents verified" },
      { date: "2026-02-20", stage: "Legal Review", note: "Review completed" },
      { date: "2026-02-25", stage: "SG Approval", note: "Approved" },
      { date: "2026-02-28", stage: "Contract Finalization", note: "Final contract being prepared" }
    ]
  },
  {
    id: "5",
    transactionNumber: "COR-L6MN8V",
    type: "correspondence",
    title: "General Enquiry - Property Registration",
    submittedDate: "2026-03-01",
    lastUpdated: "2026-03-01",
    status: "pending",
    stage: "Registry Intake",
    history: [
      { date: "2026-03-01", stage: "Submitted", note: "Initial submission received" },
      { date: "2026-03-01", stage: "Registry Intake", note: "Awaiting verification" }
    ]
  }
]

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  "in-review": { label: "In Review", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Eye },
  clarification: { label: "Action Required", color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertCircle },
  approved: { label: "Approved", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle }
}

// Submission Detail Dialog with tabs
function SubmissionDetailDialog({ 
  submission, 
  status 
}: { 
  submission: Submission
  status: { label: string; color: string; icon: typeof Clock }
}) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [responseMessage, setResponseMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitResponse = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setUploadedFiles([])
    setResponseMessage("")
    alert("Response submitted successfully! The SGC will be notified.")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">
            {submission.transactionNumber}
          </span>
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
        </DialogTitle>
        <DialogDescription>{submission.title}</DialogDescription>
      </DialogHeader>
      
      <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents" className="relative">
            SGC Documents
            {submission.sgcDocuments && submission.sgcDocuments.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                {submission.sgcDocuments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="respond">Respond</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{submission.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="font-medium">{submission.submittedDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{submission.lastUpdated}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Current Stage</p>
              <p className="text-sm text-muted-foreground">{submission.stage}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-foreground mb-3">History</p>
              <div className="space-y-3">
                {submission.history.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-2 w-2 rounded-full ${
                        index === submission.history.length - 1 ? "bg-primary" : "bg-muted-foreground/30"
                      }`} />
                      {index < submission.history.length - 1 && (
                        <div className="w-px flex-1 bg-muted-foreground/20" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-medium text-foreground">{event.stage}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                      {event.note && (
                        <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* SGC Documents Tab */}
        <TabsContent value="documents" className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Documents from SGC</p>
              <p className="text-xs text-muted-foreground">
                {submission.sgcDocuments?.length || 0} document(s) available
              </p>
            </div>
            
            {submission.sgcDocuments && submission.sgcDocuments.length > 0 ? (
              <div className="space-y-2">
                {submission.sgcDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.uploadedDate}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Uploaded by: {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" variant="default">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg bg-muted/20">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No documents available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Documents from the SGC will appear here when available
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Respond Tab */}
        <TabsContent value="respond" className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Use this section to respond to the SGC or upload additional documents. 
                Your response will be sent directly to the SGC for review.
              </p>
            </div>
            
            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="response-message">Response Message (Optional)</Label>
              <Textarea
                id="response-message"
                placeholder="Enter any comments or explanations for the SGC..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
              />
            </div>
            
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload Documents</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB each)
                </p>
              </div>
            </div>
            
            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Files to Upload ({uploadedFiles.length})</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <Button 
              className="w-full" 
              onClick={handleSubmitResponse}
              disabled={isSubmitting || (uploadedFiles.length === 0 && !responseMessage.trim())}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Response to SGC
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const status = STATUS_CONFIG[submission.status]
  const StatusIcon = status.icon
  
  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              submission.type === "correspondence" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
            }`}>
              {submission.type === "correspondence" ? (
                <FileText className="h-5 w-5" />
              ) : (
                <FileSignature className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-muted-foreground">
                  {submission.transactionNumber}
                </span>
                <Badge variant="outline" className={`text-xs ${status.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <h3 className="font-medium text-foreground truncate">{submission.title}</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {submission.submittedDate}
                </span>
                {submission.ministry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {submission.ministry}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {submission.status === "clarification" && (
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <MessageSquare className="h-4 w-4 mr-1" />
                Respond
              </Button>
            )}
            {submission.status === "completed" && (
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <SubmissionDetailDialog submission={submission} status={status} />
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  // Load user info from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("sgc_user")
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser))
    }
  }, [])
  
  const filteredSubmissions = MOCK_SUBMISSIONS.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter
    const matchesType = typeFilter === "all" || submission.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const activeSubmissions = filteredSubmissions.filter(s => 
    ["pending", "in-review", "clarification", "approved"].includes(s.status)
  )
  const completedSubmissions = filteredSubmissions.filter(s => 
    ["completed", "rejected"].includes(s.status)
  )
  const actionRequired = filteredSubmissions.filter(s => s.status === "clarification")

  // Stats
  const stats = {
    total: MOCK_SUBMISSIONS.length,
    active: MOCK_SUBMISSIONS.filter(s => !["completed", "rejected"].includes(s.status)).length,
    actionRequired: MOCK_SUBMISSIONS.filter(s => s.status === "clarification").length,
    completed: MOCK_SUBMISSIONS.filter(s => s.status === "completed").length
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <AskRex position="content" />
      
      <main className="flex-1 py-8 lg:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* User Welcome Banner */}
          {userInfo && (
            <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Welcome, {userInfo.fullName}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{userInfo.email}</span>
                        <span className="text-muted-foreground/50">|</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {SUBMITTER_TYPE_LABELS[userInfo.submitterType] || userInfo.submitterType}
                        </Badge>
                      </div>
                      {userInfo.organization && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{userInfo.organization}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4 hidden sm:block">
                      <p className="text-xs text-muted-foreground">Entity Number</p>
                      <p className="font-mono text-sm font-semibold text-primary">{userInfo.entityNumber}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        sessionStorage.removeItem("sgc_user")
                        window.location.href = "/"
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hero Banner */}
          <div className="rounded-xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <LayoutDashboard className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">My Submissions</h1>
                  <p className="mt-1 text-white/80">Track and manage your correspondence and contract submissions.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link href="/correspondence">
                    <FileText className="mr-2 h-4 w-4" />
                    New Correspondence
                  </Link>
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                  <Link href="/contracts">
                    <FileSignature className="mr-2 h-4 w-4" />
                    New Contract
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Submissions</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-slate-300 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Active</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.active}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-300 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-sky-100 to-cyan-200 border border-cyan-300 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-700 font-medium">Action Required</p>
                    <p className="text-2xl font-bold text-cyan-900">{stats.actionRequired}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-cyan-300 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-cyan-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Completed</p>
                    <p className="text-2xl font-bold text-emerald-900">{stats.completed}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-300 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or transaction number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="correspondence">Correspondence</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="clarification">Action Required</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Required Banner */}
          {actionRequired.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-800">
                      {actionRequired.length} submission{actionRequired.length > 1 ? "s" : ""} require{actionRequired.length === 1 ? "s" : ""} your attention
                    </p>
                    <p className="text-sm text-orange-700">
                      Please respond to clarification requests to continue processing.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 border-orange-300 text-orange-700 hover:bg-orange-100">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submissions Tabs */}
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedSubmissions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {activeSubmissions.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-1">No active submissions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                        ? "No submissions match your filters."
                        : "You don't have any active submissions yet."}
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button asChild>
                        <Link href="/correspondence">
                          <Plus className="mr-2 h-4 w-4" />
                          New Submission
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeSubmissions.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedSubmissions.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-1">No completed submissions</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed submissions will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {completedSubmissions.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
