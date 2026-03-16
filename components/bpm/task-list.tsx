"use client"

import { useState } from "react"
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  PlayCircle,
  User,
  Calendar,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed" | "blocked"
  assignee?: string
  dueDate?: string
  completedAt?: string
  priority?: "low" | "normal" | "high"
}

interface TaskListProps {
  tasks: Task[]
  title?: string
  showAddButton?: boolean
  onAddTask?: () => void
  onToggleTask?: (taskId: string) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
}

const statusConfig: Record<Task["status"], { icon: typeof Circle; color: string; bgColor: string }> = {
  pending: { icon: Circle, color: "text-slate-500", bgColor: "bg-slate-100" },
  in_progress: { icon: PlayCircle, color: "text-blue-500", bgColor: "bg-blue-100" },
  completed: { icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-100" },
  blocked: { icon: Clock, color: "text-red-500", bgColor: "bg-red-100" },
}

const priorityConfig: Record<NonNullable<Task["priority"]>, string> = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-blue-100 text-blue-600",
  high: "bg-red-100 text-red-600",
}

export function TaskList({
  tasks,
  title = "Tasks",
  showAddButton = false,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask
}: TaskListProps) {
  const completedCount = tasks.filter(t => t.status === "completed").length
  const totalCount = tasks.length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{totalCount}
          </Badge>
        </div>
        {showAddButton && (
          <Button size="sm" variant="outline" onClick={onAddTask}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggleTask?.(task.id)}
              onEdit={() => onEditTask?.(task)}
              onDelete={() => onDeleteTask?.(task.id)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tasks yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TaskItem({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete 
}: { 
  task: Task
  onToggle?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  const config = statusConfig[task.status]
  const Icon = config.icon
  const isCompleted = task.status === "completed"

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
      isCompleted && "bg-muted/50"
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
          config.bgColor
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={cn(
              "font-medium text-sm",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {task.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.assignee}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.priority && (
            <Badge className={cn("text-xs", priorityConfig[task.priority])}>
              {task.priority}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

// Checklist variant (simpler, for quick tasks)
export function TaskChecklist({ 
  tasks, 
  onToggle 
}: { 
  tasks: { id: string; title: string; completed: boolean }[]
  onToggle?: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={() => onToggle?.(task.id)}
          />
          <span className={cn(
            "text-sm",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </span>
        </div>
      ))}
    </div>
  )
}
