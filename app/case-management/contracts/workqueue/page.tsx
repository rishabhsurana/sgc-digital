"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  FileSignature, 
  Clock, 
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Eye,
  Play,
  MoreHorizontal,
  Calendar,
  Building2,
  User,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Checkbox } from "@/components/ui/checkbox"

// Mock data
const workQueueItems = [
  {
    id: "CON-2026-00089",
    title: "IT Services Agreement - Ministry of Finance",
    organization: "Ministry of Finance",
    contractType: "Services",
    value: 450000,
    status: "drafting",
    statusLabel: "Drafting",
    stage: "DRAFT",
    priority: "high",
    dueDate: "2026-03-20",
    daysRemaining: 4,
    assignedTo: "John Smith",
    submittedDate: "2026-03-10",
    slaStatus: "on_track"
  },
  {
    id: "CON-2026-00088",
    title: "Road Maintenance Contract",
    organization: "Ministry of Transport",
    contractType: "Works",
    value: 2100000,
    status: "sent_mda",
    statusLabel: "With Ministry",
    stage: "MIN_REVIEW",
    priority: "normal",
    dueDate: "2026-03-25",
    daysRemaining: 9,
    assignedTo: "Jane Doe",
    submittedDate: "2026-03-08",
    slaStatus: "on_track"
  },
  {
    id: "CON-2026-00087",
    title: "Medical Supplies - QEH",
    organization: "Ministry of Health",
    contractType: "Goods",
    value: 890000,
    status: "sup_review",
    statusLabel: "Supervisor Review",
    stage: "DRAFT",
    priority: "urgent",
    dueDate: "2026-03-18",
    daysRemaining: 2,
    assignedTo: "John Smith",
    submittedDate: "2026-03-05",
    slaStatus: "at_risk"
  },
  {
    id: "CON-2026-00086",
    title: "Consultancy - Tourism Authority",
    organization: "Barbados Tourism Authority",
    contractType: "Consultancy",
    value: 125000,
    status: "final_sig",
    statusLabel: "Final Signature",
    stage: "SIGN",
    priority: "normal",
    dueDate: "2026-03-22",
    daysRemaining: 6,
    assignedTo: "Sarah Lee",
    submittedDate: "2026-03-01",
    slaStatus: "on_track"
  },
  {
    id: "CON-2026-00085",
    title: "Security Services Contract",
    organization: "Ministry of Home Affairs",
    contractType: "Services",
    value: 320000,
    status: "exec_adj",
    statusLabel: "Adjudication",
    stage: "ADJ",
    priority: "normal",
    dueDate: "2026-03-15",
    daysRemaining: -1,
    assignedTo: "Mark Wilson",
    submittedDate: "2026-02-20",
    slaStatus: "overdue"
  },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    intake: "bg-blue-100 text-blue-800",
    assigned: "bg-purple-100 text-purple-800",
    drafting: "bg-amber-100 text-amber-800",
    sup_review: "bg-indigo-100 text-indigo-800",
    sent_mda: "bg-cyan-100 text-cyan-800",
    returned_mda: "bg-orange-100 text-orange-800",
    final_sig: "bg-pink-100 text-pink-800",
    exec_adj: "bg-orange-100 text-orange-800",
    adj_comp: "bg-teal-100 text-teal-800",
    closed: "bg-green-100 text-green-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

const getSlaStatusColor = (slaStatus: string) => {
  if (slaStatus === "overdue") return "text-red-600 bg-red-50"
  if (slaStatus === "at_risk") return "text-amber-600 bg-amber-50"
  return "text-green-600 bg-green-50"
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BBD',
    minimumFractionDigits: 0
  }).format(value)
}

export default function ContractsWorkQueuePage() {
  const searchParams = useSearchParams()
  const basket = searchParams.get('basket') || 'all'
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const basketLabels: Record<string, string> = {
    all: "All Cases",
    intake: "New Intake",
    drafting: "Drafting",
    awaiting_approval: "Awaiting Approval",
    with_ministry: "With Ministry",
    adjudication: "Adjudication",
    ready_close: "Ready to Close"
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === workQueueItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(workQueueItems.map(item => item.id))
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-slate-800 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Work Queue</h1>
              <p className="mt-1 text-white/80">{basketLabels[basket]} - Cases requiring your attention</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-white/20 text-white text-sm py-1 px-3">
              {workQueueItems.length} Cases
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by reference, title, or organization..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="drafting">Drafting</SelectItem>
                  <SelectItem value="sup_review">Supervisor Review</SelectItem>
                  <SelectItem value="sent_mda">With Ministry</SelectItem>
                  <SelectItem value="final_sig">Final Signature</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Queue Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedItems.length === workQueueItems.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3">
                    Reference
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Contract Details</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 -ml-3">
                    Due Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workQueueItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox 
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelectItem(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{item.id}</span>
                      {item.priority === "urgent" && (
                        <Badge className="bg-red-500 text-white text-xs">Urgent</Badge>
                      )}
                      {item.priority === "high" && (
                        <Badge className="bg-amber-500 text-white text-xs">High</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.contractType}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item.organization}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-green-600">{formatCurrency(item.value)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>{item.statusLabel}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{new Date(item.dueDate).toLocaleDateString()}</p>
                        <p className={`text-xs ${item.daysRemaining < 0 ? 'text-red-600' : item.daysRemaining <= 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {item.daysRemaining < 0 
                            ? `${Math.abs(item.daysRemaining)} days overdue` 
                            : `${item.daysRemaining} days remaining`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSlaStatusColor(item.slaStatus)}>
                      {item.slaStatus === "overdue" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {item.slaStatus.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/case-management/contracts/cases/${item.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Process Case
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Reassign
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="mr-2 h-4 w-4" />
                            Extend SLA
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg shadow-lg p-4 flex items-center gap-4">
          <span className="text-sm">{selectedItems.length} selected</span>
          <Button size="sm" variant="secondary">Bulk Assign</Button>
          <Button size="sm" variant="secondary">Export</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])}>Clear</Button>
        </div>
      )}
    </div>
  )
}
