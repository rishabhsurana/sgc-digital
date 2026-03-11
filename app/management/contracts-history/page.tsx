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
  FileSignature,
  DollarSign
} from "lucide-react"

// Sample contracts history data
const CONTRACTS_HISTORY = [
  { 
    id: 1, 
    dateReceived: "2026-03-05",
    ref: "CON-2026-0089", 
    subject: "Medical Equipment Supply",
    ministry: "Ministry of Health",
    submitter: "Dr. Sarah Johnson",
    submitterEmail: "sarah.johnson@health.gov.bb",
    submitterPhone: "(246) 555-0201",
    submitterPosition: "Chief Procurement Officer",
    contractValue: "$2,500,000",
    contractType: "New",
    status: "Approved",
    documents: [
      { name: "Contract_Agreement.pdf", type: "pdf", size: "2.4 MB", uploadedAt: "2026-03-05 09:00" },
      { name: "Technical_Specifications.pdf", type: "pdf", size: "5.1 MB", uploadedAt: "2026-03-05 09:05" },
      { name: "Vendor_Proposal.pdf", type: "pdf", size: "3.8 MB", uploadedAt: "2026-03-05 09:10" },
      { name: "Budget_Breakdown.xlsx", type: "excel", size: "456 KB", uploadedAt: "2026-03-05 09:15" },
    ]
  },
  { 
    id: 2, 
    dateReceived: "2026-03-04",
    ref: "CON-2026-0088", 
    subject: "School Renovation Project Phase 2",
    ministry: "Ministry of Education",
    submitter: "Michael Brown",
    submitterEmail: "michael.brown@education.gov.bb",
    submitterPhone: "(246) 555-0202",
    submitterPosition: "Project Manager",
    contractValue: "$8,900,000",
    contractType: "Supplemental",
    status: "Under Review",
    documents: [
      { name: "Renovation_Plans.pdf", type: "pdf", size: "15.2 MB", uploadedAt: "2026-03-04 10:00" },
      { name: "Cost_Estimate.xlsx", type: "excel", size: "1.2 MB", uploadedAt: "2026-03-04 10:05" },
      { name: "Contractor_Bid.pdf", type: "pdf", size: "2.8 MB", uploadedAt: "2026-03-04 10:10" },
      { name: "Site_Photos.zip", type: "zip", size: "45.6 MB", uploadedAt: "2026-03-04 10:20" },
      { name: "Previous_Phase_Report.pdf", type: "pdf", size: "4.3 MB", uploadedAt: "2026-03-04 10:25" },
    ]
  },
  { 
    id: 3, 
    dateReceived: "2026-03-03",
    ref: "CON-2026-0087", 
    subject: "IT Infrastructure Upgrade",
    ministry: "Ministry of ICT",
    submitter: "James Wilson",
    submitterEmail: "james.wilson@ict.gov.bb",
    submitterPhone: "(246) 555-0203",
    submitterPosition: "IT Director",
    contractValue: "$1,850,000",
    contractType: "New",
    status: "Under Review",
    documents: [
      { name: "Technical_Requirements.pdf", type: "pdf", size: "3.2 MB", uploadedAt: "2026-03-03 14:00" },
      { name: "Network_Diagram.pdf", type: "pdf", size: "1.8 MB", uploadedAt: "2026-03-03 14:05" },
      { name: "Vendor_Comparison.xlsx", type: "excel", size: "890 KB", uploadedAt: "2026-03-03 14:10" },
    ]
  },
  { 
    id: 4, 
    dateReceived: "2026-03-02",
    ref: "CON-2026-0086", 
    subject: "Road Rehabilitation - Highway 1",
    ministry: "Ministry of Works",
    submitter: "Robert Davis",
    submitterEmail: "robert.davis@works.gov.bb",
    submitterPhone: "(246) 555-0204",
    submitterPosition: "Chief Engineer",
    contractValue: "$15,750,000",
    contractType: "New",
    status: "Pending",
    documents: [
      { name: "Engineering_Plans.pdf", type: "pdf", size: "28.4 MB", uploadedAt: "2026-03-02 11:00" },
      { name: "Environmental_Assessment.pdf", type: "pdf", size: "8.9 MB", uploadedAt: "2026-03-02 11:10" },
      { name: "Traffic_Study.pdf", type: "pdf", size: "5.6 MB", uploadedAt: "2026-03-02 11:15" },
      { name: "Cost_Analysis.xlsx", type: "excel", size: "2.1 MB", uploadedAt: "2026-03-02 11:20" },
      { name: "Contractor_Credentials.pdf", type: "pdf", size: "3.4 MB", uploadedAt: "2026-03-02 11:25" },
      { name: "Project_Timeline.pdf", type: "pdf", size: "1.2 MB", uploadedAt: "2026-03-02 11:30" },
    ]
  },
  { 
    id: 5, 
    dateReceived: "2026-03-01",
    ref: "CON-2026-0085", 
    subject: "Financial Advisory Services",
    ministry: "Ministry of Finance",
    submitter: "Elizabeth Taylor",
    submitterEmail: "elizabeth.taylor@finance.gov.bb",
    submitterPhone: "(246) 555-0205",
    submitterPosition: "Financial Controller",
    contractValue: "$450,000",
    contractType: "Renewal",
    status: "Approved",
    documents: [
      { name: "Service_Agreement.pdf", type: "pdf", size: "1.5 MB", uploadedAt: "2026-03-01 09:00" },
      { name: "Performance_Report.pdf", type: "pdf", size: "2.3 MB", uploadedAt: "2026-03-01 09:05" },
    ]
  },
  { 
    id: 6, 
    dateReceived: "2026-02-28",
    ref: "CON-2026-0084", 
    subject: "Agricultural Equipment Purchase",
    ministry: "Ministry of Agriculture",
    submitter: "Patricia Anderson",
    submitterEmail: "patricia.anderson@agriculture.gov.bb",
    submitterPhone: "(246) 555-0206",
    submitterPosition: "Procurement Manager",
    contractValue: "$3,200,000",
    contractType: "New",
    status: "Approved",
    documents: [
      { name: "Equipment_List.pdf", type: "pdf", size: "1.8 MB", uploadedAt: "2026-02-28 10:00" },
      { name: "Supplier_Quote.pdf", type: "pdf", size: "956 KB", uploadedAt: "2026-02-28 10:05" },
      { name: "Justification_Memo.docx", type: "doc", size: "345 KB", uploadedAt: "2026-02-28 10:10" },
    ]
  },
  { 
    id: 7, 
    dateReceived: "2026-02-27",
    ref: "CON-2026-0083", 
    subject: "Tourism Marketing Campaign",
    ministry: "Ministry of Tourism",
    submitter: "David Williams",
    submitterEmail: "david.williams@tourism.gov.bb",
    submitterPhone: "(246) 555-0207",
    submitterPosition: "Marketing Director",
    contractValue: "$1,100,000",
    contractType: "New",
    status: "Under Review",
    documents: [
      { name: "Campaign_Proposal.pdf", type: "pdf", size: "4.5 MB", uploadedAt: "2026-02-27 15:00" },
      { name: "Media_Plan.xlsx", type: "excel", size: "1.1 MB", uploadedAt: "2026-02-27 15:05" },
      { name: "Creative_Samples.pdf", type: "pdf", size: "12.3 MB", uploadedAt: "2026-02-27 15:10" },
    ]
  },
  { 
    id: 8, 
    dateReceived: "2026-02-26",
    ref: "CON-2026-0082", 
    subject: "Water Treatment Plant Upgrade",
    ministry: "Barbados Water Authority",
    submitter: "Jennifer Martin",
    submitterEmail: "jennifer.martin@bwa.gov.bb",
    submitterPhone: "(246) 555-0208",
    submitterPosition: "Operations Manager",
    contractValue: "$12,500,000",
    contractType: "New",
    status: "Pending",
    documents: [
      { name: "Technical_Specs.pdf", type: "pdf", size: "8.9 MB", uploadedAt: "2026-02-26 11:00" },
      { name: "Environmental_Impact.pdf", type: "pdf", size: "6.7 MB", uploadedAt: "2026-02-26 11:10" },
      { name: "Contractor_Proposal.pdf", type: "pdf", size: "4.2 MB", uploadedAt: "2026-02-26 11:15" },
      { name: "Budget_Allocation.xlsx", type: "excel", size: "1.5 MB", uploadedAt: "2026-02-26 11:20" },
    ]
  },
]

const STATUS_CONFIG: Record<string, string> = {
  "Pending": "bg-amber-100 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
  "Approved": "bg-green-100 text-green-700 border-green-200",
  "Rejected": "bg-red-100 text-red-700 border-red-200",
}

const CONTRACT_TYPE_CONFIG: Record<string, string> = {
  "New": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Renewal": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Supplemental": "bg-purple-100 text-purple-700 border-purple-200",
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

export default function ContractsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<typeof CONTRACTS_HISTORY[0] | null>(null)

  const filteredData = CONTRACTS_HISTORY.filter(item => {
    const matchesSearch = 
      item.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitter.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesType = typeFilter === "all" || item.contractType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <History className="h-6 w-6" />
            </div>
            Contracts History
          </h1>
          <p className="mt-2 text-muted-foreground">
            View all submitted contracts with documents and submitter details.
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
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Contract Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Renewal">Renewal</SelectItem>
                  <SelectItem value="Supplemental">Supplemental</SelectItem>
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
                <p className="text-xs font-medium text-muted-foreground">Total Contracts</p>
                <p className="text-2xl font-bold text-foreground">{CONTRACTS_HISTORY.length}</p>
              </div>
              <FileSignature className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">Pending</p>
                <p className="text-2xl font-bold text-amber-900">{CONTRACTS_HISTORY.filter(i => i.status === 'Pending').length}</p>
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
                <p className="text-2xl font-bold text-blue-900">{CONTRACTS_HISTORY.filter(i => i.status === 'Under Review').length}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-900">{CONTRACTS_HISTORY.filter(i => i.status === 'Approved').length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
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
                  <TableHead className="font-semibold">Contract #</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Ministry/MDA</TableHead>
                  <TableHead className="font-semibold">Submitter</TableHead>
                  <TableHead className="font-semibold">Value</TableHead>
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
                    <TableCell className="max-w-[200px] truncate" title={item.subject}>{item.subject}</TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={item.ministry}>{item.ministry}</TableCell>
                    <TableCell className="text-sm">{item.submitter}</TableCell>
                    <TableCell className="text-sm font-medium">{item.contractValue}</TableCell>
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
              Showing {filteredData.length} of {CONTRACTS_HISTORY.length} entries
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
              <FileSignature className="h-5 w-5 text-orange-600" />
              Contract Details
            </DialogTitle>
            <DialogDescription>
              Contract Reference: {selectedItem?.ref}
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
                      <p className="text-xs font-medium text-muted-foreground">Contract Number</p>
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
                      <p className="text-xs font-medium text-muted-foreground">Contract Value</p>
                      <p className="font-bold text-lg text-green-600">{selectedItem.contractValue}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Contract Type</p>
                      <Badge className={CONTRACT_TYPE_CONFIG[selectedItem.contractType]}>
                        {selectedItem.contractType}
                      </Badge>
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
                        <p className="text-xs font-medium text-muted-foreground">Position</p>
                        <p className="font-medium">{selectedItem.submitterPosition}</p>
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
