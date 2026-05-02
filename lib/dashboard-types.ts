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
  rawStatus: string
  ministry?: string
  stage: string
  history: { date: string; stage: string; note?: string }[]
  sgcDocuments?: SGCDocument[]
  clarificationTrail?: ClarificationMessage[]
}

export const CONTRACT_STATUS_DISPLAY: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  INTAKE: { label: "New / Intake Validation", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  ASSIGNED: { label: "Assigned to Officer", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Eye },
  DRAFTING: { label: "Drafting", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Eye },
  SUP_REVIEW: { label: "With DSG/Supervisor Review", color: "bg-violet-100 text-violet-800 border-violet-200", icon: Eye },
  RETURNED_CORR: { label: "Returned for Correction", color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertCircle },
  SENT_MDA: { label: "Sent to Ministry", color: "bg-amber-100 text-amber-800 border-amber-200", icon: Eye },
  RETURNED_MDA: { label: "Returned from Ministry", color: "bg-teal-100 text-teal-800 border-teal-200", icon: Eye },
  FINAL_SIG: { label: "Finalization / Signature", color: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: Eye },
  EXEC_ADJ: { label: "Execution / Adjudication", color: "bg-pink-100 text-pink-800 border-pink-200", icon: Eye },
  ADJ_COMP: { label: "Adjudicated/Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
  CLOSED: { label: "Closed", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
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
