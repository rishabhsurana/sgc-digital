import type { LucideIcon } from "lucide-react"
import { Clock, Eye, AlertCircle, CheckCircle } from "lucide-react"

export type SubmissionStatus =
  | "pending"
  | "in-review"
  | "clarification"
  | "approved"
  | "completed"
  | "rejected"

export interface SGCDocument {
  id: string
  name: string
  type: string
  size: string
  uploadedDate: string
  uploadedBy: string
}

export interface ClarificationDocument {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
}

export interface ClarificationMessage {
  id: number | string
  sender: "sgc" | "applicant"
  message: string
  timestamp: string
  title?: string
  documents?: ClarificationDocument[]
  is_validated?: boolean | null
}

export interface Submission {
  id: string
  transactionNumber: string
  type: "correspondence" | "contract"
  title: string
  submittedDate: string
  lastUpdated: string
  status: SubmissionStatus
  ministry?: string
  stage: string
  history: { date: string; stage: string; note?: string }[]
  sgcDocuments?: SGCDocument[]
  clarificationTrail?: ClarificationMessage[]
}

export const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; color: string; icon: LucideIcon }
> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  "in-review": { label: "In Review", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Eye },
  clarification: {
    label: "Action Required",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
}

export type StatusDisplayConfig = (typeof STATUS_CONFIG)[SubmissionStatus]

/** Safe lookup when API returns an unexpected ui_status — avoids Dashboard render crashes */
export function getStatusDisplayConfig(status: string): StatusDisplayConfig {
  if (status in STATUS_CONFIG)
    return STATUS_CONFIG[status as SubmissionStatus]

  const label =
    typeof status === "string" && status.trim()
      ? status
          .replace(/-/g, " ")
          .split(/[\s_]+/)
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ")
      : "Unknown"

  return {
    label,
    color: "bg-slate-100 text-slate-700 border-slate-200 border",
    icon: AlertCircle,
  }
}
