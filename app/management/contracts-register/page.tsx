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
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileSignature,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  DollarSign,
  Building2,
  Calendar
} from "lucide-react"

// Sample contracts data
const CONTRACTS_DATA = [
  { id: 1, ref: "CON-2026-0089", title: "Medical Equipment Supply", nature: "Goods", ministry: "Ministry of Health", contractor: "MedTech Solutions Ltd", value: 2500000, currency: "BBD", startDate: "2026-03-15", duration: "12 months", status: "approved", priority: "high" },
  { id: 2, ref: "CON-2026-0088", title: "School Renovation Project Phase 2", nature: "Works", ministry: "Ministry of Education", contractor: "BuildRight Construction", value: 8900000, currency: "BBD", startDate: "2026-04-01", duration: "24 months", status: "pending", priority: "high" },
  { id: 3, ref: "CON-2026-0087", title: "IT Infrastructure Upgrade", nature: "Goods", ministry: "Ministry of ICT", contractor: "TechServe Caribbean", value: 1800000, currency: "BBD", startDate: "2026-03-20", duration: "6 months", status: "under-review", priority: "medium" },
  { id: 4, ref: "CON-2026-0086", title: "Road Rehabilitation - Highway 1", nature: "Works", ministry: "Ministry of Works", contractor: "Caribbean Roadways Inc", value: 45000000, currency: "BBD", startDate: "2026-05-01", duration: "36 months", status: "pending", priority: "high" },
  { id: 5, ref: "CON-2026-0085", title: "Financial Advisory Services", nature: "Consultancy/Services", ministry: "Ministry of Finance", contractor: "PWC Barbados", value: 750000, currency: "BBD", startDate: "2026-03-01", duration: "12 months", status: "approved", priority: "medium" },
  { id: 6, ref: "CON-2026-0084", title: "Agricultural Equipment", nature: "Goods", ministry: "Ministry of Agriculture", contractor: "AgroSupply Ltd", value: 3200000, currency: "BBD", startDate: "2026-04-15", duration: "3 months", status: "approved", priority: "low" },
  { id: 7, ref: "CON-2026-0083", title: "Tourism Marketing Campaign", nature: "Consultancy/Services", ministry: "Ministry of Tourism", contractor: "BrandCaribbean Agency", value: 1200000, currency: "BBD", startDate: "2026-03-01", duration: "18 months", status: "under-review", priority: "medium" },
  { id: 8, ref: "CON-2026-0082", title: "Water Treatment Plant Upgrade", nature: "Works", ministry: "Barbados Water Authority", contractor: "AquaTech Engineering", value: 15000000, currency: "BBD", startDate: "2026-06-01", duration: "24 months", status: "pending", priority: "high" },
  { id: 9, ref: "CON-2026-0081", title: "Legal Research Database", nature: "Consultancy/Services", ministry: "Attorney General's Office", contractor: "LexisNexis Caribbean", value: 450000, currency: "BBD", startDate: "2026-02-15", duration: "36 months", status: "approved", priority: "low" },
  { id: 10, ref: "CON-2026-0080", title: "Office Furniture Supply", nature: "Goods", ministry: "Ministry of Home Affairs", contractor: "Office Plus Ltd", value: 580000, currency: "BBD", startDate: "2026-03-10", duration: "2 months", status: "rejected", priority: "low" },
]

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  "under-review": { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Eye },
  approved: { label: "Approved", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
}

const PRIORITY_CONFIG = {
  high: { label: "High", color: "bg-red-100 text-red-700" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
}

export default function ContractsRegisterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [natureFilter, setNatureFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<typeof CONTRACTS_DATA[0] | null>(null)

  const filteredData = CONTRACTS_DATA.filter(item => {
    const matchesSearch = 
      item.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contractor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesNature = natureFilter === "all" || item.nature === natureFilter
    return matchesSearch && matchesStatus && matchesNature
  })

  const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <FileSignature className="h-6 w-6" />
            </div>
            Contracts Register
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage all contract submissions.
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
                  placeholder="Search by reference, title, ministry, or contractor..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={natureFilter} onValueChange={setNatureFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Goods">Goods</SelectItem>
                  <SelectItem value="Works">Works</SelectItem>
                  <SelectItem value="Consultancy/Services">Consultancy/Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-5 mb-6">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700">Pending</p>
                <p className="text-2xl font-bold text-amber-900">{CONTRACTS_DATA.filter(i => i.status === 'pending').length}</p>
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
                <p className="text-2xl font-bold text-blue-900">{CONTRACTS_DATA.filter(i => i.status === 'under-review').length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-900">{CONTRACTS_DATA.filter(i => i.status === 'approved').length}</p>
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
                <p className="text-2xl font-bold text-red-900">{CONTRACTS_DATA.filter(i => i.status === 'rejected').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700">Total Value</p>
                <p className="text-lg font-bold text-purple-900">${(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
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
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Nature</TableHead>
                  <TableHead className="font-semibold">Ministry/MDA</TableHead>
                  <TableHead className="font-semibold">Contractor</TableHead>
                  <TableHead className="font-semibold text-right">Value (BBD)</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm font-medium text-primary">{item.ref}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.title}>{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          item.nature === "Works" ? "border-orange-200 bg-orange-50 text-orange-700" :
                          item.nature === "Goods" ? "border-blue-200 bg-blue-50 text-blue-700" :
                          "border-purple-200 bg-purple-50 text-purple-700"
                        }>
                          {item.nature}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.ministry}</TableCell>
                      <TableCell className="text-sm">{item.contractor}</TableCell>
                      <TableCell className="text-right font-mono text-sm">${item.value.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.duration}</TableCell>
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
                              Approve
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
              Showing {filteredData.length} of {CONTRACTS_DATA.length} entries
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
              <FileSignature className="h-5 w-5 text-purple-600" />
              Contract Details
            </DialogTitle>
            <DialogDescription>
              Reference: {selectedItem?.ref}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Contract Title</Label>
                  <p className="font-medium">{selectedItem.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={STATUS_CONFIG[selectedItem.status as keyof typeof STATUS_CONFIG].color}>
                    {STATUS_CONFIG[selectedItem.status as keyof typeof STATUS_CONFIG].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Nature of Contract</Label>
                  <p className="font-medium">{selectedItem.nature}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ministry/MDA</Label>
                  <p className="font-medium">{selectedItem.ministry}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Contractor</Label>
                  <p className="font-medium">{selectedItem.contractor}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Contract Value</Label>
                  <p className="font-medium font-mono">{selectedItem.currency} ${selectedItem.value.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Start Date</Label>
                  <p className="font-medium">{selectedItem.startDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <p className="font-medium">{selectedItem.duration}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Contract
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
