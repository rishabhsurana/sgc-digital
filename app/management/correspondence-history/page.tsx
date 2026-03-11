"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import {
  History,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Calendar
} from "lucide-react"

// Sample transaction history data for correspondence
const CORRESPONDENCE_HISTORY = [
  { 
    id: 1, 
    ref: "COR-2026-0234", 
    subject: "Request for Legal Opinion on Property Acquisition",
    ministry: "Ministry of Finance",
    action: "Status Changed",
    previousValue: "Pending",
    newValue: "Under Review",
    performedBy: "Sarah Johnson",
    performedAt: "2026-03-05 14:32",
    notes: "Assigned to legal review team"
  },
  { 
    id: 2, 
    ref: "COR-2026-0233", 
    subject: "Crown Proceedings Act Matter - Case #45892",
    ministry: "Ministry of Health",
    action: "Document Added",
    previousValue: "-",
    newValue: "Supporting_Evidence.pdf",
    performedBy: "Michael Brown",
    performedAt: "2026-03-05 11:15",
    notes: "Additional documentation received"
  },
  { 
    id: 3, 
    ref: "COR-2026-0232", 
    subject: "Constitutional Amendment Review",
    ministry: "Cabinet Office",
    action: "Status Changed",
    previousValue: "Under Review",
    newValue: "Completed",
    performedBy: "Admin User",
    performedAt: "2026-03-04 16:45",
    notes: "Review completed and approved"
  },
  { 
    id: 4, 
    ref: "COR-2026-0231", 
    subject: "Land Compensation Claim - Lot 456",
    ministry: "Ministry of Housing",
    action: "Priority Changed",
    previousValue: "Low",
    newValue: "High",
    performedBy: "Jennifer Taylor",
    performedAt: "2026-03-04 09:20",
    notes: "Urgent deadline approaching"
  },
  { 
    id: 5, 
    ref: "COR-2026-0230", 
    subject: "Trade Agreement Review",
    ministry: "Ministry of Foreign Affairs",
    action: "Assigned To",
    previousValue: "Unassigned",
    newValue: "Legal Team A",
    performedBy: "System",
    performedAt: "2026-03-03 15:00",
    notes: "Auto-assigned based on category"
  },
  { 
    id: 6, 
    ref: "COR-2026-0229", 
    subject: "Employment Contract Template Review",
    ministry: "Ministry of Labour",
    action: "Comment Added",
    previousValue: "-",
    newValue: "Requires minor amendments",
    performedBy: "David Williams",
    performedAt: "2026-03-03 10:30",
    notes: "Internal review comment"
  },
  { 
    id: 7, 
    ref: "COR-2026-0228", 
    subject: "Judicial Review Application - Planning Decision",
    ministry: "Ministry of Planning",
    action: "Status Changed",
    previousValue: "New",
    newValue: "Pending",
    performedBy: "System",
    performedAt: "2026-03-02 08:00",
    notes: "Initial processing complete"
  },
  { 
    id: 8, 
    ref: "COR-2026-0227", 
    subject: "Regulatory Framework for Digital Services",
    ministry: "Ministry of ICT",
    action: "Document Added",
    previousValue: "-",
    newValue: "Draft_Framework_v2.docx",
    performedBy: "Lisa Anderson",
    performedAt: "2026-03-01 14:22",
    notes: "Updated draft submitted"
  },
  { 
    id: 9, 
    ref: "COR-2026-0234", 
    subject: "Request for Legal Opinion on Property Acquisition",
    ministry: "Ministry of Finance",
    action: "Created",
    previousValue: "-",
    newValue: "New Correspondence",
    performedBy: "John Smith",
    performedAt: "2026-03-01 09:15",
    notes: "Initial submission"
  },
  { 
    id: 10, 
    ref: "COR-2026-0226", 
    subject: "MOU Review - International Partnership",
    ministry: "Ministry of Tourism",
    action: "Status Changed",
    previousValue: "Pending",
    newValue: "Rejected",
    performedBy: "Admin User",
    performedAt: "2026-02-28 16:00",
    notes: "Incomplete documentation"
  },
]

const ACTION_CONFIG: Record<string, { color: string; icon: typeof CheckCircle }> = {
  "Status Changed": { color: "bg-blue-100 text-blue-700 border-blue-200", icon: RefreshCw },
  "Document Added": { color: "bg-green-100 text-green-700 border-green-200", icon: FileText },
  "Priority Changed": { color: "bg-amber-100 text-amber-700 border-amber-200", icon: ArrowUpRight },
  "Assigned To": { color: "bg-purple-100 text-purple-700 border-purple-200", icon: ArrowDownRight },
  "Comment Added": { color: "bg-gray-100 text-gray-700 border-gray-200", icon: FileText },
  "Created": { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
}

export default function CorrespondenceHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<typeof CORRESPONDENCE_HISTORY[0] | null>(null)

  const filteredData = CORRESPONDENCE_HISTORY.filter(item => {
    const matchesSearch = 
      item.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.performedBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = actionFilter === "all" || item.action === actionFilter
    return matchesSearch && matchesAction
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg">
              <History className="h-6 w-6" />
            </div>
            Correspondence Transaction History
          </h1>
          <p className="mt-2 text-muted-foreground">
            View audit trail and transaction history for all correspondence.
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
      <Card className="mb-6 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, subject, ministry, or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="Status Changed">Status Changed</SelectItem>
                  <SelectItem value="Document Added">Document Added</SelectItem>
                  <SelectItem value="Priority Changed">Priority Changed</SelectItem>
                  <SelectItem value="Assigned To">Assigned To</SelectItem>
                  <SelectItem value="Comment Added">Comment Added</SelectItem>
                  <SelectItem value="Created">Created</SelectItem>
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
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Status Changes</p>
                <p className="text-2xl font-bold text-blue-900">{CORRESPONDENCE_HISTORY.filter(i => i.action === 'Status Changed').length}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Documents Added</p>
                <p className="text-2xl font-bold text-green-900">{CORRESPONDENCE_HISTORY.filter(i => i.action === 'Document Added').length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700">Assignments</p>
                <p className="text-2xl font-bold text-purple-900">{CORRESPONDENCE_HISTORY.filter(i => i.action === 'Assigned To').length}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700">New Items</p>
                <p className="text-2xl font-bold text-emerald-900">{CORRESPONDENCE_HISTORY.filter(i => i.action === 'Created').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
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
                  <TableHead className="font-semibold">Date/Time</TableHead>
                  <TableHead className="font-semibold">Reference</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Ministry/MDA</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                  <TableHead className="font-semibold">Previous Value</TableHead>
                  <TableHead className="font-semibold">New Value</TableHead>
                  <TableHead className="font-semibold">Performed By</TableHead>
                  <TableHead className="font-semibold w-[50px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => {
                  const actionConfig = ACTION_CONFIG[item.action] || { color: "bg-gray-100 text-gray-700", icon: Clock }
                  const ActionIcon = actionConfig.icon
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{item.performedAt}</TableCell>
                      <TableCell className="font-mono text-sm font-medium text-primary">{item.ref}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.subject}>{item.subject}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate" title={item.ministry}>{item.ministry}</TableCell>
                      <TableCell>
                        <Badge className={actionConfig.color} variant="secondary">
                          <ActionIcon className="mr-1 h-3 w-3" />
                          {item.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">{item.previousValue}</TableCell>
                      <TableCell className="text-sm font-medium max-w-[120px] truncate">{item.newValue}</TableCell>
                      <TableCell className="text-sm">{item.performedBy}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedItem(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-cyan-600" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Reference: {selectedItem?.ref}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Action Type</Label>
                  <Badge className={ACTION_CONFIG[selectedItem.action]?.color || "bg-gray-100"}>
                    {selectedItem.action}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date/Time</Label>
                  <p className="font-medium">{selectedItem.performedAt}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ministry/MDA</Label>
                  <p className="font-medium">{selectedItem.ministry}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Performed By</Label>
                  <p className="font-medium">{selectedItem.performedBy}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Previous Value</Label>
                  <p className="font-medium text-muted-foreground">{selectedItem.previousValue}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">New Value</Label>
                  <p className="font-medium text-primary">{selectedItem.newValue}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-medium">{selectedItem.subject}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <p className="font-medium">{selectedItem.notes}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
