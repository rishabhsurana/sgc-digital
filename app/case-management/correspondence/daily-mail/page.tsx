"use client"

import { useState } from "react"
import { 
  Mail, 
  AlertTriangle, 
  Clock, 
  User, 
  Building2, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Filter,
  Search,
  Eye,
  UserPlus,
  Flag,
  Shield,
  FileText
} from "lucide-react"
import { formatDate, formatDateLong } from "@/lib/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Mock data for daily mail items
const dailyMailItems = [
  {
    id: "COR-2026-00145",
    subject: "Request for Legal Opinion on Land Acquisition",
    type: "Advisory",
    originatingEntity: "Ministry of Housing",
    dateReceived: "2026-03-16",
    urgency: "urgent",
    confidential: false,
    status: "PENDING_REVIEW",
    submitter: "John Smith",
    attachments: 3
  },
  {
    id: "COR-2026-00144",
    subject: "Cabinet Memo - Draft Legislation Review",
    type: "Cabinet/Confidential",
    originatingEntity: "Cabinet Office",
    dateReceived: "2026-03-16",
    urgency: "critical",
    confidential: true,
    status: "PENDING_REVIEW",
    submitter: "Cabinet Secretary",
    attachments: 5
  },
  {
    id: "COR-2026-00143",
    subject: "Compensation Claim - Traffic Accident",
    type: "Compensation",
    originatingEntity: "Ministry of Transport",
    dateReceived: "2026-03-15",
    urgency: "normal",
    confidential: false,
    status: "PENDING_REVIEW",
    submitter: "Mary Johnson",
    attachments: 8
  },
  {
    id: "COR-2026-00142",
    subject: "International Treaty Interpretation",
    type: "International Law",
    originatingEntity: "Ministry of Foreign Affairs",
    dateReceived: "2026-03-15",
    urgency: "urgent",
    confidential: false,
    status: "PENDING_REVIEW",
    submitter: "Ambassador Williams",
    attachments: 2
  },
  {
    id: "COR-2026-00141",
    subject: "Litigation Matter - Crown vs. ABC Ltd",
    type: "Litigation",
    originatingEntity: "High Court",
    dateReceived: "2026-03-14",
    urgency: "critical",
    confidential: false,
    status: "PENDING_REVIEW",
    submitter: "Court Registry",
    attachments: 12
  },
]

const legalOfficers = [
  { id: "1", name: "Sarah Thompson", specialization: "Advisory", caseload: 12 },
  { id: "2", name: "Michael Brown", specialization: "Litigation", caseload: 8 },
  { id: "3", name: "Jennifer Davis", specialization: "Contracts", caseload: 15 },
  { id: "4", name: "Robert Wilson", specialization: "International Law", caseload: 6 },
  { id: "5", name: "Amanda Clarke", specialization: "Compensation", caseload: 10 },
]

const urgencyConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  normal: { label: "Normal", color: "bg-slate-100 text-slate-700", icon: Clock },
  urgent: { label: "Urgent", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  critical: { label: "Critical", color: "bg-red-100 text-red-700", icon: AlertTriangle },
}

const typeConfig: Record<string, string> = {
  "General": "bg-blue-100 text-blue-700",
  "Advisory": "bg-purple-100 text-purple-700",
  "Litigation": "bg-red-100 text-red-700",
  "Compensation": "bg-amber-100 text-amber-700",
  "Cabinet/Confidential": "bg-slate-800 text-white",
  "International Law": "bg-teal-100 text-teal-700",
  "Public Trustee": "bg-green-100 text-green-700",
}

export default function DailyMailDashboardPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUrgency, setFilterUrgency] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [directive, setDirective] = useState("")

  const filteredItems = dailyMailItems.filter(item => {
    const matchesSearch = item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originatingEntity.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesUrgency = filterUrgency === "all" || item.urgency === filterUrgency
    const matchesType = filterType === "all" || item.type === filterType
    return matchesSearch && matchesUrgency && matchesType
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter(i => i !== id))
    }
  }

  const handleBulkAssign = () => {
    // API call to assign selected items
    console.log("Assigning items:", selectedItems, "to officer:", selectedOfficer, "with directive:", directive)
    setIsAssignDialogOpen(false)
    setSelectedItems([])
    setSelectedOfficer("")
    setDirective("")
  }

  const urgentCount = dailyMailItems.filter(i => i.urgency === "urgent").length
  const criticalCount = dailyMailItems.filter(i => i.urgency === "critical").length
  const confidentialCount = dailyMailItems.filter(i => i.confidential).length

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Daily Mail Dashboard</h1>
              <p className="mt-1 text-white/80">Review and assign incoming correspondence - {formatDateLong(new Date())}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-white/20 hover:bg-white/30 text-white"
              disabled={selectedItems.length === 0}
              onClick={() => setIsAssignDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Selected ({selectedItems.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{dailyMailItems.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-amber-600">{urgentCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Flag className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confidential</p>
                <p className="text-2xl font-bold text-slate-600">{confidentialCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
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
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Advisory">Advisory</SelectItem>
                <SelectItem value="Litigation">Litigation</SelectItem>
                <SelectItem value="Compensation">Compensation</SelectItem>
                <SelectItem value="Cabinet/Confidential">Cabinet/Confidential</SelectItem>
                <SelectItem value="International Law">International Law</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mail Items Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pending Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Originating Entity</TableHead>
                <TableHead>Date Received</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const urgency = urgencyConfig[item.urgency]
                return (
                  <TableRow key={item.id} className={item.confidential ? "bg-slate-50" : ""}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{item.id}</span>
                        {item.confidential && (
                          <Shield className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{item.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.attachments} attachment{item.attachments !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeConfig[item.type] || "bg-gray-100 text-gray-700"}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.originatingEntity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(item.dateReceived)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={urgency.color}>
                        <urgency.icon className="h-3 w-3 mr-1" />
                        {urgency.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <UserPlus className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Correspondence</DialogTitle>
                              <DialogDescription>
                                Assign {item.id} to a Legal Officer
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Select Legal Officer</Label>
                                <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose an officer..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {legalOfficers.map((officer) => (
                                      <SelectItem key={officer.id} value={officer.id}>
                                        <div className="flex items-center justify-between w-full">
                                          <span>{officer.name}</span>
                                          <span className="text-xs text-muted-foreground ml-2">
                                            ({officer.specialization} - {officer.caseload} cases)
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>SG/DSG Directive (Optional)</Label>
                                <Textarea 
                                  placeholder="Enter any specific instructions or directives..."
                                  value={directive}
                                  onChange={(e) => setDirective(e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedOfficer("")}>
                                Cancel
                              </Button>
                              <Button onClick={() => {
                                console.log("Assigning", item.id, "to", selectedOfficer)
                                setSelectedOfficer("")
                                setDirective("")
                              }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Assign
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Assign Correspondence</DialogTitle>
            <DialogDescription>
              Assign {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} to a Legal Officer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">Selected Items:</p>
              <div className="flex flex-wrap gap-1">
                {selectedItems.map(id => (
                  <Badge key={id} variant="secondary" className="font-mono text-xs">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Select Legal Officer</Label>
              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an officer..." />
                </SelectTrigger>
                <SelectContent>
                  {legalOfficers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{officer.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({officer.specialization} - {officer.caseload} cases)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>SG/DSG Directive (Optional)</Label>
              <Textarea 
                placeholder="Enter any specific instructions or directives..."
                value={directive}
                onChange={(e) => setDirective(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={!selectedOfficer}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Assign All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
