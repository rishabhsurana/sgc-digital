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
  FileSignature,
  DollarSign,
  Calendar,
  FileText
} from "lucide-react"

// Sample transaction history data for contracts
const CONTRACTS_HISTORY = [
  { 
    id: 1, 
    ref: "CON-2026-0089", 
    subject: "Medical Equipment Supply",
    originatingMDA: "Ministry of Health",
    action: "Status Changed",
    previousValue: "Under Review",
    newValue: "Approved",
    performedBy: "Sarah Johnson",
    performedAt: "2026-03-05 14:32",
    notes: "Contract approved by Solicitor General"
  },
  { 
    id: 2, 
    ref: "CON-2026-0088", 
    subject: "School Renovation Project Phase 2",
    originatingMDA: "Ministry of Education",
    action: "Value Amended",
    previousValue: "$8,500,000",
    newValue: "$8,900,000",
    performedBy: "Michael Brown",
    performedAt: "2026-03-05 11:15",
    notes: "Value increased due to scope change"
  },
  { 
    id: 3, 
    ref: "CON-2026-0087", 
    subject: "IT Infrastructure Upgrade",
    originatingMDA: "Ministry of ICT",
    action: "Document Added",
    previousValue: "-",
    newValue: "Technical_Specifications.pdf",
    performedBy: "Admin User",
    performedAt: "2026-03-04 16:45",
    notes: "Supporting documentation uploaded"
  },
  { 
    id: 4, 
    ref: "CON-2026-0086", 
    subject: "Road Rehabilitation - Highway 1",
    originatingMDA: "Ministry of Works",
    action: "Assigned To",
    previousValue: "Unassigned",
    newValue: "Contracts Review Team",
    performedBy: "Jennifer Taylor",
    performedAt: "2026-03-04 09:20",
    notes: "Assigned for detailed review"
  },
  { 
    id: 5, 
    ref: "CON-2026-0085", 
    subject: "Financial Advisory Services",
    originatingMDA: "Ministry of Finance",
    action: "Status Changed",
    previousValue: "Pending",
    newValue: "Approved",
    performedBy: "System",
    performedAt: "2026-03-03 15:00",
    notes: "Renewal contract auto-approved"
  },
  { 
    id: 6, 
    ref: "CON-2026-0084", 
    subject: "Agricultural Equipment",
    originatingMDA: "Ministry of Agriculture",
    action: "Comment Added",
    previousValue: "-",
    newValue: "Procurement compliant",
    performedBy: "David Williams",
    performedAt: "2026-03-03 10:30",
    notes: "Legal compliance verified"
  },
  { 
    id: 7, 
    ref: "CON-2026-0083", 
    subject: "Tourism Marketing Campaign",
    originatingMDA: "Ministry of Tourism",
    action: "Status Changed",
    previousValue: "New",
    newValue: "Under Review",
    performedBy: "System",
    performedAt: "2026-03-02 08:00",
    notes: "Moved to review queue"
  },
  { 
    id: 8, 
    ref: "CON-2026-0082", 
    subject: "Water Treatment Plant Upgrade",
    originatingMDA: "Barbados Water Authority",
    action: "Duration Extended",
    previousValue: "12 months",
    newValue: "18 months",
    performedBy: "Lisa Anderson",
    performedAt: "2026-03-01 14:22",
    notes: "Extension approved due to project scope"
  },
  { 
    id: 9, 
    ref: "CON-2026-0089", 
    subject: "Medical Equipment Supply",
    originatingMDA: "Ministry of Health",
    action: "Created",
    previousValue: "-",
    newValue: "New Contract",
    performedBy: "John Smith",
    performedAt: "2026-02-28 09:15",
    notes: "Initial contract submission"
  },
  { 
    id: 10, 
    ref: "CON-2026-0080", 
    subject: "Staff Uniforms Supply",
    originatingMDA: "Ministry of Home Affairs",
    action: "Status Changed",
    previousValue: "Under Review",
    newValue: "Rejected",
    performedBy: "Admin User",
    performedAt: "2026-02-27 16:00",
    notes: "Non-compliant with procurement regulations"
  },
  { 
    id: 11, 
    ref: "CON-2026-0081", 
    subject: "Legal Research Database",
    originatingMDA: "Attorney General's Office",
    action: "Contractor Changed",
    previousValue: "Westlaw Caribbean",
    newValue: "LexisNexis Caribbean",
    performedBy: "James Martin",
    performedAt: "2026-02-26 11:30",
    notes: "Vendor selection finalized"
  },
  { 
    id: 12, 
    ref: "CON-2026-0079", 
    subject: "Fleet Management Services",
    originatingMDA: "Ministry of Transport",
    action: "Value Amended",
    previousValue: "$1,200,000",
    newValue: "$1,450,000",
    performedBy: "Patricia Garcia",
    performedAt: "2026-02-25 15:45",
    notes: "Additional vehicles included"
  },
]

const ACTION_CONFIG: Record<string, { color: string; icon: typeof CheckCircle }> = {
  "Status Changed": { color: "bg-blue-100 text-blue-700 border-blue-200", icon: RefreshCw },
  "Document Added": { color: "bg-green-100 text-green-700 border-green-200", icon: FileText },
  "Value Amended": { color: "bg-amber-100 text-amber-700 border-amber-200", icon: DollarSign },
  "Assigned To": { color: "bg-purple-100 text-purple-700 border-purple-200", icon: ArrowDownRight },
  "Comment Added": { color: "bg-gray-100 text-gray-700 border-gray-200", icon: FileText },
  "Created": { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  "Duration Extended": { color: "bg-cyan-100 text-cyan-700 border-cyan-200", icon: Calendar },
  "Contractor Changed": { color: "bg-orange-100 text-orange-700 border-orange-200", icon: ArrowUpRight },
}

export default function ContractsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<typeof CONTRACTS_HISTORY[0] | null>(null)

  const filteredData = CONTRACTS_HISTORY.filter(item => {
    const matchesSearch = 
      item.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originatingMDA.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <History className="h-6 w-6" />
            </div>
            Contracts Transaction History
          </h1>
          <p className="mt-2 text-muted-foreground">
            View audit trail and transaction history for all contracts.
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
                  placeholder="Search by reference, subject, MDA, or user..."
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
                  <SelectItem value="Value Amended">Value Amended</SelectItem>
                  <SelectItem value="Document Added">Document Added</SelectItem>
                  <SelectItem value="Assigned To">Assigned To</SelectItem>
                  <SelectItem value="Duration Extended">Duration Extended</SelectItem>
                  <SelectItem value="Contractor Changed">Contractor Changed</SelectItem>
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
      <div className="grid gap-4 sm:grid-cols-5 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-700">Status Changes</p>
                <p className="text-2xl font-bold text-blue-900">{CONTRACTS_HISTORY.filter(i => i.action === 'Status Changed').length}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">Value Changes</p>
                <p className="text-2xl font-bold text-amber-900">{CONTRACTS_HISTORY.filter(i => i.action === 'Value Amended').length}</p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Documents Added</p>
                <p className="text-2xl font-bold text-green-900">{CONTRACTS_HISTORY.filter(i => i.action === 'Document Added').length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50 border-cyan-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-cyan-700">Extensions</p>
                <p className="text-2xl font-bold text-cyan-900">{CONTRACTS_HISTORY.filter(i => i.action === 'Duration Extended').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-700">New Contracts</p>
                <p className="text-2xl font-bold text-emerald-900">{CONTRACTS_HISTORY.filter(i => i.action === 'Created').length}</p>
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
                  <TableHead className="font-semibold">Contract #</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Originating MDA</TableHead>
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
                      <TableCell className="text-sm max-w-[150px] truncate" title={item.originatingMDA}>{item.originatingMDA}</TableCell>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-orange-600" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Contract Reference: {selectedItem?.ref}
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
                  <Label className="text-xs text-muted-foreground">Originating MDA</Label>
                  <p className="font-medium">{selectedItem.originatingMDA}</p>
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
