"use client"

import { useState } from "react"
import { 
  MoreHorizontal,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  GripVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface KanbanItem {
  id: string
  title: string
  type: "correspondence" | "contract"
  category: string
  organization: string
  assignedTo?: string
  dueDate: string
  slaStatus: "on_track" | "at_risk" | "breached"
  daysRemaining: number
  priority?: "low" | "normal" | "high" | "urgent"
}

export interface KanbanColumn {
  id: string
  title: string
  color: string
  items: KanbanItem[]
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  basePath: string
  onMoveItem?: (itemId: string, fromColumn: string, toColumn: string) => void
  onItemClick?: (item: KanbanItem) => void
}

const slaConfig = {
  on_track: { label: "On Track", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
  at_risk: { label: "At Risk", color: "text-amber-600", bgColor: "bg-amber-100", icon: AlertTriangle },
  breached: { label: "Breached", color: "text-red-600", bgColor: "bg-red-100", icon: AlertTriangle },
}

const priorityConfig = {
  low: { color: "bg-slate-100 text-slate-600" },
  normal: { color: "bg-blue-100 text-blue-600" },
  high: { color: "bg-amber-100 text-amber-600" },
  urgent: { color: "bg-red-100 text-red-600" },
}

export function KanbanBoard({ columns, basePath, onMoveItem, onItemClick }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          basePath={basePath}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  )
}

function KanbanColumnComponent({ 
  column, 
  basePath,
  onItemClick 
}: { 
  column: KanbanColumn
  basePath: string
  onItemClick?: (item: KanbanItem) => void
}) {
  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", column.color)} />
              <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {column.items.length}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Sort by Due Date</DropdownMenuItem>
                <DropdownMenuItem>Sort by Priority</DropdownMenuItem>
                <DropdownMenuItem>Sort by SLA Status</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-3 pr-4">
              {column.items.map((item) => (
                <KanbanCard 
                  key={item.id} 
                  item={item} 
                  basePath={basePath}
                  onClick={() => onItemClick?.(item)}
                />
              ))}
              {column.items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No items in this column
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function KanbanCard({ 
  item, 
  basePath,
  onClick 
}: { 
  item: KanbanItem
  basePath: string
  onClick?: () => void
}) {
  const sla = slaConfig[item.slaStatus]
  const SlaIcon = sla.icon
  const priority = item.priority ? priorityConfig[item.priority] : null

  return (
    <div 
      className="p-3 border rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link 
          href={`${basePath}/${item.id}`}
          className="font-mono text-xs text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {item.id}
        </Link>
        <div className="flex items-center gap-1">
          {priority && (
            <Badge className={cn("text-xs", priority.color)}>
              {item.priority}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{item.category}</Badge>
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium line-clamp-2 mb-3">{item.title}</p>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1 truncate">
          <User className="h-3 w-3" />
          <span className="truncate">{item.assignedTo || "Unassigned"}</span>
        </div>
        <div className={cn("flex items-center gap-1", sla.color)}>
          <SlaIcon className="h-3 w-3" />
          <span className="font-medium">
            {item.daysRemaining > 0 
              ? `${item.daysRemaining}d` 
              : item.daysRemaining === 0 
                ? "Today" 
                : `${Math.abs(item.daysRemaining)}d late`}
          </span>
        </div>
      </div>

      {/* Drag handle (shown on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

// Simple board view for smaller screens
export function KanbanBoardSimple({ 
  columns,
  basePath 
}: { 
  columns: KanbanColumn[]
  basePath: string
}) {
  const [activeColumn, setActiveColumn] = useState(columns[0]?.id)

  return (
    <div>
      {/* Column tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {columns.map((column) => (
          <Button
            key={column.id}
            variant={activeColumn === column.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveColumn(column.id)}
            className="whitespace-nowrap"
          >
            <div className={cn("w-2 h-2 rounded-full mr-2", column.color)} />
            {column.title}
            <Badge variant="secondary" className="ml-2 text-xs">
              {column.items.length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Active column items */}
      <div className="space-y-3">
        {columns
          .find((c) => c.id === activeColumn)
          ?.items.map((item) => (
            <KanbanCard key={item.id} item={item} basePath={basePath} />
          ))}
      </div>
    </div>
  )
}
