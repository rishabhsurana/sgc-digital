"use client"

import { useState } from "react"
import { 
  Mail, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  FileText,
  MessageSquare,
  ExternalLink
} from "lucide-react"
import { formatDate } from "@/lib/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Mock data
const correspondenceItems = [
  {
    id: "COR-2026-00140",
    subject: "Legal Opinion - Public Procurement Act Amendment",
    type: "Advisory",
    status: "ASSIGNED",
    stage: "PROCESS",
    originatingEntity: "Ministry of Finance",
    assignedOfficer: "Sarah Thompson",
    dateReceived: "2026-03-10",
    dueDate: "2026-03-24",
    urgency: "normal",
    slaStatus: "on_track",
    daysRemaining: 8
  },
  {
    id: "COR-2026-00139",
    subject: "Litigation Support - Crown vs. XYZ Corporation",
    type: "Litigation",
    status: "PENDING_EXTERNAL",
    stage: "PROCESS",
    originatingEntity: "High Court",
    assignedOfficer: "Michael Brown",
    dateReceived: "2026-03-08",
    dueDate: "2026-03-18",
    urgency: "urgent",
    slaStatus: "at_risk",
    daysRemaining: 2
  },
  {
    id: "COR-2026-00138",
    subject: "Compensation Claim Review - Industrial Accident",
    type: "Compensation",
    status: "ASSIGNED",
    stage: "PROCESS",
    originatingEntity: "Ministry of Labour",
    assignedOfficer: "Amanda Clarke",
    dateReceived: "2026-03-05",
    dueDate: "2026-03-19",
    urgency: "normal",
    slaStatus: "on_track",
    daysRemaining: 3
  },
  {
    id: "COR-2026-00137",
    subject: "Treaty Interpretation - CARICOM Agreement",
    type: "International Law",
    status: "ASSIGNED",
    stage: "APPROVAL",
    originatingEntity: "Ministry of Foreign Affairs",
    assignedOfficer: "Robert Wilson",
    dateReceived: "2026-03-01",
    dueDate: "2026-03-15",
    urgency: "urgent",
    slaStatus: "breached",
    daysRemaining: -1
  },
  {
    id: "COR-2026-00136",
    subject: "Public Trustee Estate Administration",
    type: "Public Trustee",
    status: "ASSIGNED",
    stage: "DISPATCH",
    originatingEntity: "Public Trustee Office",
    assignedOfficer: "Jennifer Davis",
    dateReceived: "2026-02-28",
    dueDate: "2026-03-14",
    urgency: "normal",
    slaStatus: "on_track",
    daysRemaining: 0
  },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-100 text-blue-700" },
  PENDING_REVIEW: { label: "Pending Review", color: "bg-purple-100 text-purple-700" },
  ASSIGNED: { label: "Assigned", color: "bg-teal-100 text-teal-700" },
  PENDING_EXTERNAL: { label: "Pending External", color: "bg-amber-100 text-amber-700" },
  ON_HOLD: { label: "On Hold", color: "bg-slate-100 text-slate-700" },
  CLOSED: { label: "Closed", color: "bg-green-100 text-green-700" },
}

const stageConfig: Record<string, { label: string; color: string }> = {
  INTAKE: { label: "Intake", color: "bg-slate-100 text-slate-700" },
  REVIEW: { label: "Review", color: "bg-purple-100 text-purple-700" },
  PROCESS: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  APPROVAL: { label: "Approval", color: "bg-amber-100 text-amber-700" },
  DISPATCH: { label: "Dispatch", color: "bg-teal-100 text-teal-700" },
  CLOSE: { label: "Closed", color: "bg-green-100 text-green-700" },
}

const slaConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  on_track: { label: "On Track", color: "text-green-600", icon: CheckCircle },
  at_risk: { label: "At Risk", color: "text-amber-600", icon: AlertTriangle },
  breached: { label: "Breached", color: "text-red-600", icon: AlertTriangle },
}

export default function CorrespondenceWorkqueuePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterStage, setFilterStage] = useState("all")
  const [filterOfficer, setFilterOfficer] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const getTabItems = (tab: string) => {
    switch (tab) {
      case "my_cases":
        return correspondenceItems.filter(item => item.assignedOfficer === "Sarah Thompson")
      case "pending_external":
        return correspondenceItems.filter(item => item.status === "PENDING_EXTERNAL")
      case "at_risk":
        return correspondenceItems.filter(item => item.slaStatus === "at_risk" || item.slaStatus === "breached")
      default:
        return correspondenceItems
    }
  }

  const filteredItems = getTabItems(activeTab).filter(item => {
    const matchesSearch = item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originatingEntity.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesStage = filterStage === "all" || item.stage === filterStage
    const matchesOfficer = filterOfficer === "all" || item.assignedOfficer === filterOfficer
    return matchesSearch && matchesStatus && matchesStage && matchesOfficer
  })

  const myCasesCount = correspondenceItems.filter(item => item.assignedOfficer === "Sarah Thompson").length
  const pendingExternalCount = correspondenceItems.filter(item => item.status === "PENDING_EXTERNAL").length
  const atRiskCount = correspondenceItems.filter(item => item.slaStatus === "at_risk" || item.slaStatus === "breached").length

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Correspondence Workqueue</h1>
              <p className="mt-1 text-white/80">Manage and process assigned correspondence matters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All Cases ({correspondenceItems.length})
          </TabsTrigger>
          <TabsTrigger value="my_cases">
            My Cases ({myCasesCount})
          </TabsTrigger>
          <TabsTrigger value="pending_external">
            Pending External ({pendingExternalCount})
          </TabsTrigger>
          <TabsTrigger value="at_risk" className="text-red-600">
            At Risk ({atRiskCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference, subject, or entity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="PENDING_EXTERNAL">Pending External</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="PROCESS">Processing</SelectItem>
                    <SelectItem value="APPROVAL">Approval</SelectItem>
                    <SelectItem value="DISPATCH">Dispatch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cases Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const status = statusConfig[item.status]
                    const stage = stageConfig[item.stage]
                    const sla = slaConfig[item.slaStatus]
                    const SlaIcon = sla.icon
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Link 
                            href={`/case-management/correspondence/cases/${item.id}`}
                            className="font-mono text-sm text-blue-600 hover:underline"
                          >
                            {item.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{item.subject}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {item.originatingEntity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={stage.color}>{stage.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.assignedOfficer}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(item.dueDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${sla.color}`}>
                            <SlaIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {item.daysRemaining > 0 ? `${item.daysRemaining}d` : item.daysRemaining === 0 ? "Today" : `${Math.abs(item.daysRemaining)}d late`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/case-management/correspondence/cases/${item.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Case
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Comment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Request Clarification
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
