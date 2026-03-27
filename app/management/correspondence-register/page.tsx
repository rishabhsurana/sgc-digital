"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Eye, 
  MoreHorizontal, 
  RefreshCw, 
  Download,
  FileText,
  Mail,
  Calendar,
  Building2,
  User,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
  X
} from "lucide-react"

// Sample correspondence data
const CORRESPONDENCE_DATA = [
  { id: 1, ref: "COR-2026-0234", type: "General", subject: "Request for Legal Opinion on Property Acquisition", ministry: "Ministry of Finance", submitter: "John Smith", date: "2026-03-01", status: "pending", priority: "high" },
  { id: 2, ref: "COR-2026-0233", type: "Litigation", subject: "Crown Proceedings Act Matter - Case #45892", ministry: "Ministry of Health", submitter: "Sarah Johnson", date: "2026-03-01", status: "under-review", priority: "high" },
  { id: 3, ref: "COR-2026-0232", type: "Advisory", subject: "Constitutional Amendment Review", ministry: "Cabinet Office", submitter: "Michael Brown", date: "2026-02-28", status: "completed", priority: "medium" },
  { id: 4, ref: "COR-2026-0231", type: "Compensation", subject: "Land Compensation Claim - Lot 456", ministry: "Ministry of Housing", submitter: "Emily Davis", date: "2026-02-28", status: "pending", priority: "medium" },
  { id: 5, ref: "COR-2026-0230", type: "Cabinet/Confidential", subject: "Trade Agreement Review", ministry: "Ministry of Foreign Affairs", submitter: "Robert Wilson", date: "2026-02-27", status: "under-review", priority: "high" },
  { id: 6, ref: "COR-2026-0229", type: "General", subject: "Employment Contract Template Review", ministry: "Ministry of Labour", submitter: "Jennifer Taylor", date: "2026-02-27", status: "completed", priority: "low" },
  { id: 7, ref: "COR-2026-0228", type: "Litigation", subject: "Judicial Review Application - Planning Decision", ministry: "Ministry of Planning", submitter: "David Martinez", date: "2026-02-26", status: "pending", priority: "high" },
  { id: 8, ref: "COR-2026-0227", type: "Advisory", subject: "Regulatory Framework for Digital Services", ministry: "Ministry of ICT", submitter: "Lisa Anderson", date: "2026-02-26", status: "completed", priority: "medium" },
  { id: 9, ref: "COR-2026-0226", type: "General", subject: "MOU Review - International Partnership", ministry: "Ministry of Tourism", submitter: "James Thomas", date: "2026-02-25", status: "under-review", priority: "medium" },
  { id: 10, ref: "COR-2026-0225", type: "Compensation", subject: "Vehicle Accident Claim Assessment", ministry: "Ministry of Transport", submitter: "Patricia White", date: "2026-02-25", status: "rejected", priority: "low" },
]

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  "under-review": { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
}

const PRIORITY_CONFIG = {
  high: { label: "High", color: "bg-red-100 text-red-700" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
}

export default function CorrespondenceRegisterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<typeof CORRESPONDENCE_DATA[0] | null>(null)

  const filteredData = CORRESPONDENCE_DATA.filter(item => {
    const searchLower = searchQuery.toLowerCase().trim()
    const matchesSearch = searchLower === '' ||
      item.ref.toLowerCase().includes(searchLower) ||
      item.subject.toLowerCase().includes(searchLower) ||
      item.ministry.toLowerCase().includes(searchLower) ||
      item.submitter.toLowerCase().includes(searchLower)
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesType = typeFilter === "all" || item.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })
  
  const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all'

  return (
    <div className="p-6 lg:p-8">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-800 p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Correspondence Register</h1>
              <p className="mt-1 text-white/80">View and manage all correspondence submissions.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, subject, ministry, or submitter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Litigation">Litigation</SelectItem>
                  <SelectItem value="Advisory">Advisory</SelectItem>
                  <SelectItem value="Compensation">Compensation</SelectItem>
                  <SelectItem value="Cabinet/Confidential">Cabinet/Confidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search Results Feedback */}
          {isFiltered && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredData.length}</span> of {CORRESPONDENCE_DATA.length} records
                </span>
                {searchQuery && (
                  <span className="text-muted-foreground">
                    for &quot;<span className="font-medium text-primary">{searchQuery}</span>&quot;
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">Pending</p>
                <p className="text-2xl font-bold text-amber-900">{CORRESPONDENCE_DATA.filter(i => i.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Under Review</p>
                <p className="text-2xl font-bold text-blue-900">{CORRESPONDENCE_DATA.filter(i => i.status === 'under-review').length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-900">{CORRESPONDENCE_DATA.filter(i => i.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{CORRESPONDENCE_DATA.filter(i => i.status === 'rejected').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
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
                  <TableHead className="font-semibold">Reference</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Ministry/MDA</TableHead>
                  <TableHead className="font-semibold">Submitter</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]
                  const priorityConfig = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm font-medium text-primary">{item.ref}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate" title={item.subject}>{item.subject}</TableCell>
                      <TableCell className="text-sm">{item.ministry}</TableCell>
                      <TableCell className="text-sm">{item.submitter}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.date}</TableCell>
                      <TableCell>
                        <Badge className={priorityConfig.color} variant="secondary">
                          {priorityConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color} variant="secondary">
                          <statusConfig.icon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedItem(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {CORRESPONDENCE_DATA.length} entries
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Correspondence Details
            </DialogTitle>
            <DialogDescription>
              Reference: {selectedItem?.ref}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedItem.type}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={STATUS_CONFIG[selectedItem.status as keyof typeof STATUS_CONFIG].color}>
                    {STATUS_CONFIG[selectedItem.status as keyof typeof STATUS_CONFIG].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ministry/MDA</Label>
                  <p className="font-medium">{selectedItem.ministry}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Submitter</Label>
                  <p className="font-medium">{selectedItem.submitter}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date Submitted</Label>
                  <p className="font-medium">{selectedItem.date}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Badge className={PRIORITY_CONFIG[selectedItem.priority as keyof typeof PRIORITY_CONFIG].color}>
                    {PRIORITY_CONFIG[selectedItem.priority as keyof typeof PRIORITY_CONFIG].label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-medium">{selectedItem.subject}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
