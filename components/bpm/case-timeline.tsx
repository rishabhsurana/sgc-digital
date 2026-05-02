"use client"

import { 
  ArrowRight,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertTriangle,
  User,
  UserPlus,
  Clock,
  Send,
  Download,
  Upload,
  Edit,
  XCircle,
  PlayCircle,
  PauseCircle,
  Flag
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineEvent {
  id: string
  type: "status_change" | "comment" | "document" | "task" | "assignment" | "clarification" | "approval" | "rejection" | "system"
  title: string
  description?: string
  user: string
  timestamp: string
  metadata?: Record<string, string>
}

interface CaseTimelineProps {
  events: TimelineEvent[]
  maxItems?: number
  showLoadMore?: boolean
  onLoadMore?: () => void
}

const eventConfig: Record<string, { icon: typeof Clock; color: string; bgColor: string }> = {
  status_change: { icon: ArrowRight, color: "text-blue-600", bgColor: "bg-blue-100" },
  comment: { icon: MessageSquare, color: "text-amber-600", bgColor: "bg-amber-100" },
  document: { icon: FileText, color: "text-green-600", bgColor: "bg-green-100" },
  task: { icon: CheckCircle, color: "text-purple-600", bgColor: "bg-purple-100" },
  assignment: { icon: UserPlus, color: "text-teal-600", bgColor: "bg-teal-100" },
  clarification: { icon: Send, color: "text-orange-600", bgColor: "bg-orange-100" },
  approval: { icon: CheckCircle, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  rejection: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  system: { icon: Clock, color: "text-slate-600", bgColor: "bg-slate-100" },
}

export function CaseTimeline({ 
  events, 
  maxItems,
  showLoadMore = false,
  onLoadMore 
}: CaseTimelineProps) {
  const displayedEvents = maxItems ? events.slice(0, maxItems) : events

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
      
      <div className="space-y-6">
        {displayedEvents.map((event) => {
          const config = eventConfig[event.type] || eventConfig.system
          const Icon = config.icon

          return (
            <div key={event.id} className="relative pl-10">
              {/* Event icon */}
              <div
                className={cn(
                  "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center",
                  config.bgColor
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>

              {/* Event content */}
              <div>
                <p className="font-medium text-sm">{event.title}</p>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {event.user}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showLoadMore && maxItems && events.length > maxItems && (
        <button
          onClick={onLoadMore}
          className="cursor-pointer mt-4 ml-10 text-sm text-blue-600 hover:underline"
        >
          Load more ({events.length - maxItems} more events)
        </button>
      )}
    </div>
  )
}

// Compact inline timeline for cards
export function CaseTimelineInline({ 
  events,
  maxItems = 3
}: { 
  events: TimelineEvent[]
  maxItems?: number
}) {
  const displayedEvents = events.slice(0, maxItems)

  return (
    <div className="space-y-2">
      {displayedEvents.map((event) => {
        const config = eventConfig[event.type] || eventConfig.system
        const Icon = config.icon

        return (
          <div key={event.id} className="flex items-start gap-2">
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                config.bgColor
              )}
            >
              <Icon className={cn("h-3 w-3", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate">{event.title}</p>
              <p className="text-xs text-muted-foreground">{formatTimestamp(event.timestamp)}</p>
            </div>
          </div>
        )
      })}
      {events.length > maxItems && (
        <p className="text-xs text-muted-foreground ml-7">
          +{events.length - maxItems} more
        </p>
      )}
    </div>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}
