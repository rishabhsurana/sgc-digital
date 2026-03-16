"use client"

import { 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Building2,
  Calendar,
  FileText,
  FileSignature,
  Mail,
  MoreHorizontal,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export interface CaseCardProps {
  id: string
  title: string
  type: "correspondence" | "contract"
  category: string
  status: string
  stage: string
  organization: string
  assignedTo?: string
  dueDate: string
  slaStatus: "on_track" | "at_risk" | "breached"
  daysRemaining: number
  urgency?: "normal" | "urgent" | "critical"
  confidential?: boolean
  onClick?: () => void
}

const statusColors: Record<string, string> = {
  // Correspondence statuses
  NEW: "bg-blue-100 text-blue-700",
  PENDING_REVIEW: "bg-purple-100 text-purple-700",
  ASSIGNED: "bg-teal-100 text-teal-700",
  PENDING_EXTERNAL: "bg-amber-100 text-amber-700",
  ON_HOLD: "bg-slate-100 text-slate-700",
  CLOSED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  // Contract statuses
  INTAKE: "bg-blue-100 text-blue-700",
  DRAFTING: "bg-indigo-100 text-indigo-700",
  SUP_REVIEW: "bg-purple-100 text-purple-700",
  SENT_MDA: "bg-amber-100 text-amber-700",
  RETURNED_MDA: "bg-orange-100 text-orange-700",
  FINAL_SIG: "bg-teal-100 text-teal-700",
  EXEC_ADJ: "bg-cyan-100 text-cyan-700",
  ADJ_COMP: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
}

const slaConfig = {
  on_track: { label: "On Track", color: "text-green-600", icon: CheckCircle },
  at_risk: { label: "At Risk", color: "text-amber-600", icon: AlertTriangle },
  breached: { label: "Breached", color: "text-red-600", icon: AlertTriangle },
}

const urgencyConfig = {
  normal: { label: "Normal", color: "bg-slate-100 text-slate-700" },
  urgent: { label: "Urgent", color: "bg-amber-100 text-amber-700" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
}

export function CaseCard({
  id,
  title,
  type,
  category,
  status,
  stage,
  organization,
  assignedTo,
  dueDate,
  slaStatus,
  daysRemaining,
  urgency = "normal",
  confidential = false,
  onClick
}: CaseCardProps) {
  const sla = slaConfig[slaStatus]
  const SlaIcon = sla.icon
  const statusColor = statusColors[status] || "bg-slate-100 text-slate-700"
  const urgencyStyle = urgencyConfig[urgency]
  const basePath = type === "correspondence" 
    ? "/case-management/correspondence/cases" 
    : "/case-management/contracts/cases"

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
              type === "correspondence" ? "bg-blue-100" : "bg-emerald-100"
            }`}>
              {type === "correspondence" ? (
                <Mail className={`h-5 w-5 ${type === "correspondence" ? "text-blue-600" : "text-emerald-600"}`} />
              ) : (
                <FileSignature className="h-5 w-5 text-emerald-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  href={`${basePath}/${id}`}
                  className="font-mono text-sm text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {id}
                </Link>
                <Badge variant="outline" className="text-xs">{category}</Badge>
                {confidential && (
                  <Badge className="bg-slate-800 text-white text-xs">Confidential</Badge>
                )}
                {urgency !== "normal" && (
                  <Badge className={`text-xs ${urgencyStyle.color}`}>{urgencyStyle.label}</Badge>
                )}
              </div>
              <p className="font-medium mt-1 truncate" title={title}>{title}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate max-w-24">{organization}</span>
                </div>
                {assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-24">{assignedTo}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={statusColor}>{status.replace(/_/g, " ")}</Badge>
            <div className={`flex items-center gap-1 text-sm ${sla.color}`}>
              <SlaIcon className="h-4 w-4" />
              <span className="font-medium">
                {daysRemaining > 0 
                  ? `${daysRemaining}d` 
                  : daysRemaining === 0 
                    ? "Today" 
                    : `${Math.abs(daysRemaining)}d late`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for lists
export function CaseCardCompact({
  id,
  title,
  type,
  status,
  organization,
  dueDate,
  slaStatus,
  daysRemaining
}: Omit<CaseCardProps, "category" | "stage" | "urgency" | "confidential" | "onClick">) {
  const sla = slaConfig[slaStatus]
  const SlaIcon = sla.icon
  const statusColor = statusColors[status] || "bg-slate-100 text-slate-700"
  const basePath = type === "correspondence" 
    ? "/case-management/correspondence/cases" 
    : "/case-management/contracts/cases"

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
          type === "correspondence" ? "bg-blue-100" : "bg-emerald-100"
        }`}>
          {type === "correspondence" ? (
            <Mail className="h-4 w-4 text-blue-600" />
          ) : (
            <FileSignature className="h-4 w-4 text-emerald-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link 
              href={`${basePath}/${id}`}
              className="font-mono text-sm text-blue-600 hover:underline"
            >
              {id}
            </Link>
            <Badge className={`text-xs ${statusColor}`}>{status.replace(/_/g, " ")}</Badge>
          </div>
          <p className="text-sm truncate" title={title}>{title}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-sm ${sla.color}`}>
        <SlaIcon className="h-4 w-4" />
        <span className="font-medium">
          {daysRemaining > 0 
            ? `${daysRemaining}d` 
            : daysRemaining === 0 
              ? "Today" 
              : `${Math.abs(daysRemaining)}d late`}
        </span>
      </div>
    </div>
  )
}
