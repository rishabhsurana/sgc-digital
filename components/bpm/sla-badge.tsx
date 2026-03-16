"use client"

import { Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type SlaStatus = "on_track" | "at_risk" | "breached" | "completed"

interface SlaBadgeProps {
  status: SlaStatus
  daysRemaining?: number
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

const slaConfig: Record<SlaStatus, {
  label: string
  color: string
  bgColor: string
  icon: typeof Clock
}> = {
  on_track: {
    label: "On Track",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle
  },
  at_risk: {
    label: "At Risk",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: AlertTriangle
  },
  breached: {
    label: "Breached",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle
  },
  completed: {
    label: "Completed",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    icon: CheckCircle
  }
}

const sizeConfig = {
  sm: { icon: "h-3 w-3", text: "text-xs", padding: "px-1.5 py-0.5" },
  md: { icon: "h-4 w-4", text: "text-sm", padding: "px-2 py-1" },
  lg: { icon: "h-5 w-5", text: "text-base", padding: "px-3 py-1.5" }
}

export function SlaBadge({ 
  status, 
  daysRemaining, 
  showLabel = true,
  size = "md" 
}: SlaBadgeProps) {
  const config = slaConfig[status]
  const sizeStyles = sizeConfig[size]
  const Icon = config.icon

  const getDaysText = () => {
    if (daysRemaining === undefined) return null
    if (daysRemaining > 0) return `${daysRemaining}d`
    if (daysRemaining === 0) return "Today"
    return `${Math.abs(daysRemaining)}d late`
  }

  return (
    <Badge 
      className={cn(
        config.bgColor, 
        config.color, 
        sizeStyles.padding,
        "font-medium inline-flex items-center gap-1"
      )}
    >
      <Icon className={sizeStyles.icon} />
      {showLabel && <span className={sizeStyles.text}>{config.label}</span>}
      {daysRemaining !== undefined && (
        <span className={cn(sizeStyles.text, "font-bold")}>
          {getDaysText()}
        </span>
      )}
    </Badge>
  )
}

// Inline SLA indicator (icon + text only)
export function SlaIndicator({ 
  status, 
  daysRemaining 
}: { 
  status: SlaStatus
  daysRemaining: number 
}) {
  const config = slaConfig[status]
  const Icon = config.icon

  const getDaysText = () => {
    if (daysRemaining > 0) return `${daysRemaining} days remaining`
    if (daysRemaining === 0) return "Due today"
    return `${Math.abs(daysRemaining)} days overdue`
  }

  return (
    <div className={cn("flex items-center gap-1.5", config.color)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{getDaysText()}</span>
    </div>
  )
}

// SLA progress bar
export function SlaProgress({ 
  totalDays, 
  daysElapsed, 
  status 
}: { 
  totalDays: number
  daysElapsed: number
  status: SlaStatus 
}) {
  const progress = Math.min((daysElapsed / totalDays) * 100, 100)
  const config = slaConfig[status]

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{daysElapsed} days elapsed</span>
        <span>{totalDays} days total</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            status === "on_track" && "bg-green-500",
            status === "at_risk" && "bg-amber-500",
            status === "breached" && "bg-red-500",
            status === "completed" && "bg-slate-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Calculate SLA status based on days remaining and threshold
export function calculateSlaStatus(daysRemaining: number, atRiskThreshold: number = 3): SlaStatus {
  if (daysRemaining < 0) return "breached"
  if (daysRemaining <= atRiskThreshold) return "at_risk"
  return "on_track"
}
