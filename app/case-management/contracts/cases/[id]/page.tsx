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
  ChevronRight
} from "lucide-react"
import { formatDate } from "@/lib/utils/date-utils"
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

// Mock case data
const caseData = {
  id: "CON-2026-00089",
  title: "IT Services Agreement - Ministry of Finance",
  description: "Provision of IT infrastructure support services including network maintenance, helpdesk support, and system administration for a period of 3 years.",
  organization: "Ministry of Finance",
  organizationCode: "MOF",
  contractType: "Services",
  contractCategory: "IT Services",
  instrumentType: "Service Level Agreement",
  value: 450000,
  currency: "BBD",
  startDate: "2026-04-01",
  endDate: "2029-03-31",
  procurementMethod: "Open Tender",
  fundingSource: "Government Budget",
  status: "drafting",
  statusLabel: "Drafting",
  stage: "DRAFT",
  priority: "high",
  submittedDate: "2026-03-10",
  dueDate: "2026-03-20",
  daysRemaining: 4,
  slaStatus: "on_track",
  contractor: {
    name: "Caribbean Tech Solutions Ltd.",
    tradingName: "CTS",
    registrationNumber: "12345-BB",
    contactPerson: "Michael Brown",
    email: "m.brown@ctsbb.com",
    phone: "+1 246 555 0123",
    address: "123 Business Park, Bridgetown, Barbados"
  },
  assignedOfficer: {
    name: "John Smith",
    role: "Legal Officer",
    department: "Contracts Division"
  },
  supervisor: {
    name: "Sarah Williams",
    role: "Senior Legal Officer"
  },
  submitter: {
    name: "James Clarke",
    role: "Procurement Officer",
    organization: "Ministry of Finance"
  }
}

const workflowStages = [
  { id: "INTAKE", name: "Intake", status: "completed", completedDate: "Mar 10, 2026" },
  { id: "ASSIGN", name: "Assignment", status: "completed", completedDate: "Mar 11, 2026" },
  { id: "DRAFT", name: "Drafting", status: "current" },
  { id: "MIN_REVIEW", name: "Ministry Review", status: "pending" },
  { id: "SIGN", name: "Signature", status: "pending" },
  { id: "ADJ", name: "Adjudication", status: "pending" },
  { id: "DISPATCH", name: "Dispatch", status: "pending" },
]

const documents = [
  { id: "1", name: "Original Contract Package.pdf", type: "Submission", uploadedBy: "James Clarke", uploadedDate: "Mar 10, 2026", size: "2.4 MB" },
  { id: "2", name: "Contractor Registration Certificate.pdf", type: "Supporting", uploadedBy: "James Clarke", uploadedDate: "Mar 10, 2026", size: "856 KB" },
  { id: "3", name: "Draft Contract v1.docx", type: "Draft", uploadedBy: "John Smith", uploadedDate: "Mar 14, 2026", size: "1.2 MB" },
  { id: "4", name: "Legal Review Notes.pdf", type: "Internal", uploadedBy: "John Smith", uploadedDate: "Mar 15, 2026", size: "345 KB" },
]

const activities = [
  { id: "1", type: "status_change", description: "Status changed to Drafting", user: "John Smith", date: "Mar 12, 2026 10:30 AM" },
  { id: "2", type: "document_upload", description: "Uploaded Draft Contract v1.docx", user: "John Smith", date: "Mar 14, 2026 2:15 PM" },
  { id: "3", type: "comment", description: "Added review notes regarding clause 5.2", user: "John Smith", date: "Mar 15, 2026 9:45 AM" },
  { id: "4", type: "assignment", description: "Case assigned to John Smith", user: "Sarah Williams", date: "Mar 11, 2026 3:00 PM" },
  { id: "5", type: "submission", description: "Contract submitted via portal", user: "James Clarke", date: "Mar 10, 2026 11:20 AM" },
]

const tasks = [
  { id: "1", title: "Complete contract draft", status: "in_progress", dueDate: "Mar 18, 2026", assignee: "John Smith" },
  { id: "2", title: "Submit for supervisor review", status: "pending", dueDate: "Mar 19, 2026", assignee: "John Smith" },
  { id: "3", title: "Obtain ministry feedback", status: "pending", dueDate: "Mar 25, 2026", assignee: "John Smith" },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BBD',
    minimumFractionDigits: 0
  }).format(value)
}

export default function ContractCaseDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("details")
  const [newComment, setNewComment] = useState("")

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
            <h1 className="text-2xl font-bold">{caseData.id}</h1>
            <Badge className="bg-amber-100 text-amber-800">{caseData.statusLabel}</Badge>
            {caseData.priority === "high" && (
              <Badge className="bg-amber-500 text-white">High Priority</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{caseData.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Actions
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Case Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-amber-600">
                <Clock className="mr-2 h-4 w-4" />
                Request SLA Extension
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Workflow Stepper */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {workflowStages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className={`
                    flex h-10 w-10 items-center justify-center rounded-full border-2 
                    ${stage.status === "completed" ? "bg-green-500 border-green-500 text-white" : 
                      stage.status === "current" ? "bg-blue-500 border-blue-500 text-white" : 
                      "bg-muted border-muted-foreground/30 text-muted-foreground"}
                  `}>
                    {stage.status === "completed" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${stage.status === "current" ? "text-blue-600" : "text-muted-foreground"}`}>
                    {stage.name}
                  </span>
                  {stage.completedDate && (
                    <span className="text-xs text-muted-foreground">{stage.completedDate}</span>
                  )}
                </div>
                {index < workflowStages.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${stage.status === "completed" ? "bg-green-500" : "bg-muted"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="communications">Comms</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-blue-600" />
                    Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Contract Type</label>
                      <p className="font-medium">{caseData.contractType}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Category</label>
                      <p className="font-medium">{caseData.contractCategory}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Instrument Type</label>
                      <p className="font-medium">{caseData.instrumentType}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Procurement Method</label>
                      <p className="font-medium">{caseData.procurementMethod}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Contract Value</label>
                      <p className="font-medium text-green-600">{formatCurrency(caseData.value)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Funding Source</label>
                      <p className="font-medium">{caseData.fundingSource}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Start Date</label>
                      <p className="font-medium">{formatDate(caseData.startDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">End Date</label>
                      <p className="font-medium">{formatDate(caseData.endDate)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <p className="mt-1">{caseData.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Contractor Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Company Name</label>
                      <p className="font-medium">{caseData.contractor.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Trading Name</label>
                      <p className="font-medium">{caseData.contractor.tradingName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Registration Number</label>
                      <p className="font-medium">{caseData.contractor.registrationNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Contact Person</label>
                      <p className="font-medium">{caseData.contractor.contactPerson}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium">{caseData.contractor.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="font-medium">{caseData.contractor.phone}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Address</label>
                    <p className="font-medium">{caseData.contractor.address}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Documents</CardTitle>
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} • {doc.uploadedBy} • {doc.uploadedDate} • {doc.size}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${task.status === "in_progress" ? "bg-blue-500" : "bg-muted"}`} />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Due: {task.dueDate} • {task.assignee}
                            </p>
                          </div>
                        </div>
                        <Badge variant={task.status === "in_progress" ? "default" : "secondary"}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <History className="h-4 w-4 text-blue-600" />
                          </div>
                          {index < activities.length - 1 && (
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-muted" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">{activity.user} • {activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Communications Tab */}
            <TabsContent value="communications">
              <Card>
                <CardHeader>
                  <CardTitle>Communications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">John Smith</span>
                        <span className="text-xs text-muted-foreground">Mar 15, 2026 9:45 AM</span>
                      </div>
                      <p className="text-sm">Added review notes regarding clause 5.2 - need to clarify termination provisions with Ministry.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SLA Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                SLA Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${caseData.daysRemaining < 3 ? "text-amber-600" : "text-green-600"}`}>
                  {caseData.daysRemaining}
                </div>
                <p className="text-sm text-muted-foreground">days remaining</p>
                <p className="text-sm mt-2">Due: {formatDate(caseData.dueDate)}</p>
                <Badge className="mt-2 bg-green-100 text-green-800">On Track</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase">Assigned Officer</label>
                <p className="font-medium">{caseData.assignedOfficer.name}</p>
                <p className="text-sm text-muted-foreground">{caseData.assignedOfficer.role}</p>
              </div>
              <Separator />
              <div>
                <label className="text-xs text-muted-foreground uppercase">Supervisor</label>
                <p className="font-medium">{caseData.supervisor.name}</p>
                <p className="text-sm text-muted-foreground">{caseData.supervisor.role}</p>
              </div>
              <Separator />
              <div>
                <label className="text-xs text-muted-foreground uppercase">Submitter</label>
                <p className="font-medium">{caseData.submitter.name}</p>
                <p className="text-sm text-muted-foreground">{caseData.submitter.role}</p>
                <p className="text-sm text-muted-foreground">{caseData.submitter.organization}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Draft
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send to Ministry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
