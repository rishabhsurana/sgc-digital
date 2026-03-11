"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  History,
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Calendar,
  File,
  FileImage,
  FileSpreadsheet,
  Paperclip,
  ExternalLink
} from "lucide-react"

// Sample correspondence history data
const CORRESPONDENCE_HISTORY = [
  { 
    id: 1, 
    dateReceived: "2026-03-05",
    ref: "COR-2026-0234", 
    subject: "Request for Legal Opinion on Property Acquisition",
    ministry: "Ministry of Finance",
    submitter: "John Smith",
    submitterEmail: "john.smith@finance.gov.bb",
    submitterPhone: "(246) 555-0101",
    status: "Under Review",
    documents: [
      { name: "Legal_Opinion_Request.pdf", type: "pdf", size: "1.2 MB", uploadedAt: "2026-03-05 09:15" },
      { name: "Property_Deed_Copy.pdf", type: "pdf", size: "2.4 MB", uploadedAt: "2026-03-05 09:15" },
      { name: "Valuation_Report.pdf", type: "pdf", size: "856 KB", uploadedAt: "2026-03-05 09:20" },
    ]
  },
  { 
    id: 2, 
    dateReceived: "2026-03-04",
    ref: "COR-2026-0233", 
    subject: "Crown Proceedings Act Matter - Case #45892",
    ministry: "Ministry of Health",
    submitter: "Mary Johnson",
    submitterEmail: "mary.johnson@health.gov.bb",
    submitterPhone: "(246) 555-0102",
    status: "Pending",
    documents: [
      { name: "Case_Summary.docx", type: "doc", size: "458 KB", uploadedAt: "2026-03-04 11:30" },
      { name: "Supporting_Evidence.pdf", type: "pdf", size: "3.1 MB", uploadedAt: "2026-03-04 11:35" },
      { name: "Medical_Records.pdf", type: "pdf", size: "5.2 MB", uploadedAt: "2026-03-04 11:40" },
      { name: "Witness_Statements.pdf", type: "pdf", size: "1.8 MB", uploadedAt: "2026-03-04 11:45" },
    ]
  },
  { 
    id: 3, 
    dateReceived: "2026-03-04",
    ref: "COR-2026-0232", 
    subject: "Constitutional Amendment Review",
    ministry: "Cabinet Office",
    submitter: "Robert Williams",
    submitterEmail: "robert.williams@cabinet.gov.bb",
    submitterPhone: "(246) 555-0103",
    status: "Completed",
    documents: [
      { name: "Draft_Amendment.pdf", type: "pdf", size: "2.1 MB", uploadedAt: "2026-03-04 08:00" },
      { name: "Legal_Analysis.docx", type: "doc", size: "890 KB", uploadedAt: "2026-03-04 08:05" },
    ]
  },
  { 
    id: 4, 
    dateReceived: "2026-03-03",
    ref: "COR-2026-0231", 
    subject: "Land Compensation Claim - Lot 456",
    ministry: "Ministry of Housing",
    submitter: "Patricia Davis",
    submitterEmail: "patricia.davis@housing.gov.bb",
    submitterPhone: "(246) 555-0104",
    status: "Under Review",
    documents: [
      { name: "Compensation_Claim_Form.pdf", type: "pdf", size: "456 KB", uploadedAt: "2026-03-03 14:20" },
      { name: "Land_Survey.pdf", type: "pdf", size: "8.9 MB", uploadedAt: "2026-03-03 14:25" },
      { name: "Property_Photos.zip", type: "zip", size: "15.2 MB", uploadedAt: "2026-03-03 14:30" },
      { name: "Valuation_Certificate.pdf", type: "pdf", size: "234 KB", uploadedAt: "2026-03-03 14:35" },
      { name: "Ownership_Proof.pdf", type: "pdf", size: "1.1 MB", uploadedAt: "2026-03-03 14:40" },
    ]
  },
  { 
    id: 5, 
    dateReceived: "2026-03-02",
    ref: "COR-2026-0230", 
    subject: "Trade Agreement Review - CARICOM Partnership",
    ministry: "Ministry of Foreign Affairs",
    submitter: "James Wilson",
    submitterEmail: "james.wilson@foreignaffairs.gov.bb",
    submitterPhone: "(246) 555-0105",
    status: "Pending",
    documents: [
      { name: "Draft_Agreement.pdf", type: "pdf", size: "4.5 MB", uploadedAt: "2026-03-02 10:00" },
      { name: "Terms_Analysis.xlsx", type: "excel", size: "1.2 MB", uploadedAt: "2026-03-02 10:05" },
    ]
  },
  { 
    id: 6, 
    dateReceived: "2026-03-01",
    ref: "COR-2026-0229", 
    subject: "Employment Contract Template Review",
    ministry: "Ministry of Labour",
    submitter: "Elizabeth Brown",
    submitterEmail: "elizabeth.brown@labour.gov.bb",
    submitterPhone: "(246) 555-0106",
    status: "Completed",
    documents: [
      { name: "Contract_Template.docx", type: "doc", size: "345 KB", uploadedAt: "2026-03-01 09:00" },
      { name: "Legal_Requirements.pdf", type: "pdf", size: "678 KB", uploadedAt: "2026-03-01 09:05" },
    ]
  },
  { 
    id: 7, 
    dateReceived: "2026-02-28",
    ref: "COR-2026-0228", 
    subject: "Judicial Review Application - Planning Decision",
    ministry: "Ministry of Planning",
    submitter: "Michael Taylor",
    submitterEmail: "michael.taylor@planning.gov.bb",
    submitterPhone: "(246) 555-0107",
    status: "Under Review",
    documents: [
      { name: "Review_Application.pdf", type: "pdf", size: "2.3 MB", uploadedAt: "2026-02-28 15:00" },
      { name: "Planning_Decision.pdf", type: "pdf", size: "1.5 MB", uploadedAt: "2026-02-28 15:05" },
      { name: "Appeal_Grounds.docx", type: "doc", size: "567 KB", uploadedAt: "2026-02-28 15:10" },
    ]
  },
  { 
    id: 8, 
    dateReceived: "2026-02-27",
    ref: "COR-2026-0227", 
    subject: "Regulatory Framework for Digital Services",
    ministry: "Ministry of ICT",
    submitter: "Sarah Anderson",
    submitterEmail: "sarah.anderson@ict.gov.bb",
    submitterPhone: "(246) 555-0108",
    status: "Pending",
    documents: [
      { name: "Draft_Framework_v2.docx", type: "doc", size: "1.8 MB", uploadedAt: "2026-02-27 11:00" },
      { name: "Stakeholder_Comments.pdf", type: "pdf", size: "3.4 MB", uploadedAt: "2026-02-27 11:10" },
      { name: "Impact_Assessment.xlsx", type: "excel", size: "890 KB", uploadedAt: "2026-02-27 11:15" },
    ]
  },
]

const STATUS_CONFIG: Record<string, string> = {
  "Pending": "bg-amber-100 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
  "Completed": "bg-green-100 text-green-700 border-green-200",
  "Rejected": "bg-red-100 text-red-700 border-red-200",
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="h-4 w-4 text-red-500" />
    case "doc": return <File className="h-4 w-4 text-blue-500" />
    case "excel": return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    case "image": return <FileImage className="h-4 w-4 text-purple-500" />
    default: return <Paperclip className="h-4 w-4 text-gray-500" />
  }
}

export default function CorrespondenceHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<typeof CORRESPONDENCE_HISTORY[0] | null>(null)

  const filteredData = CORRESPONDENCE_HISTORY.filter(item => {
    const matchesSearch = 
      item.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg">
              <History className="h-6 w-6" />
            </div>
            Correspondence History
          </h1>
          <p className="mt-2 text-muted-foreground">
            View all submitted correspondence with documents and submitter details.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, subject, ministry, or submitter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-muted/50 border-primary/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground">{CORRESPONDENCE_HISTORY.length}</p>
              </div>
              <History className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">Pending</p>
                <p className="text-2xl font-bold text-amber-900">{CORRESPONDENCE_HISTORY.filter(i => i.status === 'Pending').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Under Review</p>
                <p className="text-2xl font-bold text-blue-900">{CORRESPONDENCE_HISTORY.filter(i => i.status === 'Under Review').length}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-900">{CORRESPONDENCE_HISTORY.filter(i => i.status === 'Completed').length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-primary/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Reference #</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Ministry/MDA</TableHead>
                  <TableHead className="font-semibold">Submitter</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Documents</TableHead>
                  <TableHead className="font-semibold w-[80px]">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{item.dateReceived}</TableCell>
                    <TableCell className="font-mono text-sm font-medium text-primary">{item.ref}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={item.subject}>{item.subject}</TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={item.ministry}>{item.ministry}</TableCell>
                    <TableCell className="text-sm">{item.submitter}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[item.status]} variant="secondary">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        <Paperclip className="mr-1 h-3 w-3" />
                        {item.documents.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelectedItem(item)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {CORRESPONDENCE_HISTORY.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog with Tabs */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-cyan-600" />
              Correspondence Details
            </DialogTitle>
            <DialogDescription>
              Reference: {selectedItem?.ref}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">
                  Documents ({selectedItem.documents.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="flex-1 overflow-auto mt-4">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Date Received</p>
                      <p className="font-medium">{selectedItem.dateReceived}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Reference Number</p>
                      <p className="font-mono font-medium text-primary">{selectedItem.ref}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Subject</p>
                      <p className="font-medium">{selectedItem.subject}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Ministry/MDA</p>
                      <p className="font-medium">{selectedItem.ministry}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Status</p>
                      <Badge className={STATUS_CONFIG[selectedItem.status]}>
                        {selectedItem.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Submitter Info */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Submitter Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedItem.submitter}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                        <p className="font-medium text-primary">{selectedItem.submitterEmail}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedItem.submitterPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="flex-1 overflow-auto mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedItem.documents.length} document(s) uploaded by the applicant
                  </p>
                  {selectedItem.documents.map((doc, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.size} - Uploaded {doc.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
