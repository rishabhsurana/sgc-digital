"use client"

import { CheckCircle, Circle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WorkflowStage {
  code: string
  label: string
  description?: string
  completed: boolean
  current: boolean
  skipped?: boolean
}

interface WorkflowStepperProps {
  stages: WorkflowStage[]
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  showDescription?: boolean
}

export function WorkflowStepper({ 
  stages, 
  orientation = "horizontal",
  size = "md",
  showDescription = false
}: WorkflowStepperProps) {
  const sizeConfig = {
    sm: { circle: "w-6 h-6", icon: "h-3 w-3", text: "text-xs", line: "w-8 h-0.5" },
    md: { circle: "w-10 h-10", icon: "h-5 w-5", text: "text-sm", line: "w-16 h-1" },
    lg: { circle: "w-12 h-12", icon: "h-6 w-6", text: "text-base", line: "w-24 h-1" },
  }

  const config = sizeConfig[size]

  if (orientation === "vertical") {
    return (
      <div className="flex flex-col">
        {stages.map((stage, index) => (
          <div key={stage.code} className="flex">
            <div className="flex flex-col items-center mr-4">
              <div
                className={cn(
                  config.circle,
                  "rounded-full flex items-center justify-center transition-all",
                  stage.completed
                    ? "bg-green-500 text-white"
                    : stage.current
                      ? "bg-blue-500 text-white ring-4 ring-blue-200"
                      : stage.skipped
                        ? "bg-slate-300 text-slate-500"
                        : "bg-slate-200 text-slate-500"
                )}
              >
                {stage.completed ? (
                  <CheckCircle className={config.icon} />
                ) : (
                  <span className={cn(config.text, "font-medium")}>{index + 1}</span>
                )}
              </div>
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-8 my-1",
                    stage.completed ? "bg-green-500" : "bg-slate-200"
                  )}
                />
              )}
            </div>
            <div className="pb-8">
              <p
                className={cn(
                  config.text,
                  "font-medium",
                  stage.current && "text-blue-600",
                  stage.skipped && "text-slate-400 line-through"
                )}
              >
                {stage.label}
              </p>
              {showDescription && stage.description && (
                <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full">
      {stages.map((stage, index) => (
        <div key={stage.code} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                config.circle,
                "rounded-full flex items-center justify-center transition-all",
                stage.completed
                  ? "bg-green-500 text-white"
                  : stage.current
                    ? "bg-blue-500 text-white ring-4 ring-blue-200"
                    : stage.skipped
                      ? "bg-slate-300 text-slate-500"
                      : "bg-slate-200 text-slate-500"
              )}
            >
              {stage.completed ? (
                <CheckCircle className={config.icon} />
              ) : (
                <span className={cn(config.text, "font-medium")}>{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                config.text,
                "mt-2 text-center whitespace-nowrap",
                stage.current && "font-semibold text-blue-600",
                stage.skipped && "text-slate-400 line-through",
                !stage.current && !stage.skipped && "text-muted-foreground"
              )}
            >
              {stage.label}
            </span>
            {showDescription && stage.description && (
              <span className="text-xs text-muted-foreground mt-1 text-center max-w-20">
                {stage.description}
              </span>
            )}
          </div>
          {index < stages.length - 1 && (
            <div
              className={cn(
                config.line,
                "mx-2 sm:mx-4",
                stage.completed ? "bg-green-500" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Mini workflow indicator for cards
export function WorkflowIndicator({ 
  stages, 
  currentStageCode 
}: { 
  stages: { code: string; label: string }[]
  currentStageCode: string 
}) {
  const currentIndex = stages.findIndex(s => s.code === currentStageCode)
  
  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, index) => (
        <div
          key={stage.code}
          className={cn(
            "w-2 h-2 rounded-full",
            index < currentIndex
              ? "bg-green-500"
              : index === currentIndex
                ? "bg-blue-500"
                : "bg-slate-200"
          )}
          title={stage.label}
        />
      ))}
    </div>
  )
}
