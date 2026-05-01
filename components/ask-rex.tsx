"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Minimize2,
  Maximize2,
  FileText,
  Search,
  FileBarChart,
  Loader2,
  User,
  Volume2,
  VolumeX,
  Lightbulb
} from "lucide-react"

interface AskRexProps {
  position?: "header" | "content"
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "file-result" | "report" | "search-result"
  files?: { name: string; ref: string; type: string }[]
}

const SUGGESTED_PROMPTS = [
  { icon: Search, label: "Find a file", prompt: "Find me file with FileNumber " },
  { icon: FileText, label: "Retrieve documents", prompt: "Retrieve all documents on " },
  { icon: FileBarChart, label: "Generate report", prompt: "Generate a report on " },
]

export function AskRex({ position = "header" }: AskRexProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Rex, your AI assistant. I can help you find files, retrieve documents, and generate reports. How can I assist you today?",
      timestamp: new Date(),
      type: "text"
    }
  ])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const iconContainerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null)
  const hasDraggedRef = useRef(false)
  const isDraggingRef = useRef(false)
  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load saved icon position from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ask-rex-position")
      if (saved) {
        const pos = JSON.parse(saved)
        if (
          typeof pos.x === "number" &&
          typeof pos.y === "number" &&
          pos.x >= 0 &&
          pos.y >= 0 &&
          pos.x < window.innerWidth &&
          pos.y < window.innerHeight
        ) {
          setIconPos(pos)
        }
      }
    } catch {
      // ignore invalid data
    }
  }, [])

  // Persist icon position to localStorage
  useEffect(() => {
    if (iconPos) {
      localStorage.setItem("ask-rex-position", JSON.stringify(iconPos))
    }
  }, [iconPos])

  const handleIconPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const container = iconContainerRef.current
    if (!container) return

    container.setPointerCapture(e.pointerId)
    const rect = container.getBoundingClientRect()
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: rect.left,
      elemY: rect.top,
    }
    hasDraggedRef.current = false
  }

  const handleIconPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return

    const dx = e.clientX - dragStartRef.current.mouseX
    const dy = e.clientY - dragStartRef.current.mouseY

    // Only start dragging after a small threshold to distinguish from clicks
    if (!hasDraggedRef.current && Math.abs(dx) + Math.abs(dy) < 5) return
    hasDraggedRef.current = true

    const container = iconContainerRef.current
    let newX = dragStartRef.current.elemX + dx
    let newY = dragStartRef.current.elemY + dy

    // Clamp to viewport bounds
    if (container) {
      const w = container.offsetWidth
      const h = container.offsetHeight
      newX = Math.max(0, Math.min(window.innerWidth - w, newX))
      newY = Math.max(0, Math.min(window.innerHeight - h, newY))
    }

    setIconPos({ x: newX, y: newY })
  }

  const handleIconPointerUp = () => {
    const wasDragged = hasDraggedRef.current
    dragStartRef.current = null
    hasDraggedRef.current = false

    if (wasDragged) {
      // Prevent the subsequent click event from opening the chat
      isDraggingRef.current = true
      requestAnimationFrame(() => {
        isDraggingRef.current = false
      })
    }
  }

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in your browser.")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  const speakResponse = (text: string) => {
    if (!("speechSynthesis" in window)) return
    
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const simulateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const lowerMessage = userMessage.toLowerCase()

    // File search simulation
    if (lowerMessage.includes("find") && lowerMessage.includes("file")) {
      const fileMatch = userMessage.match(/[A-Z0-9]{4,}/i)
      const fileNumber = fileMatch ? fileMatch[0].toUpperCase() : "X5556"
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `I found the file you requested. Here are the details for File Number ${fileNumber}:`,
        timestamp: new Date(),
        type: "file-result",
        files: [
          { name: `Contract Agreement - ${fileNumber}`, ref: fileNumber, type: "Contract" },
        ]
      }
    }

    // Document retrieval simulation
    if (lowerMessage.includes("retrieve") && lowerMessage.includes("document")) {
      const subject = userMessage.replace(/retrieve all documents on|retrieve documents on|retrieve/gi, "").trim() || "contracts"
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `I found several documents related to "${subject}" across the repository:`,
        timestamp: new Date(),
        type: "search-result",
        files: [
          { name: `${subject} - Policy Document 2024`, ref: "DOC-2024-001", type: "Policy" },
          { name: `${subject} - Guidelines Update`, ref: "DOC-2024-015", type: "Guidelines" },
          { name: `${subject} - Annual Review`, ref: "DOC-2023-089", type: "Report" },
        ]
      }
    }

    // Report generation simulation
    if (lowerMessage.includes("generate") && lowerMessage.includes("report")) {
      const subject = userMessage.replace(/generate a report on|generate report on|generate report/gi, "").trim() || "correspondence"
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've generated a summary report on "${subject}":\n\n**Executive Summary**\nBased on analysis of 47 documents in the repository, here are the key findings:\n\n• Total active items: 23\n• Pending review: 12\n• Completed this month: 8\n• Average processing time: 5.2 days\n\n**Key Insights**\nThe data shows a 15% improvement in processing efficiency compared to the previous quarter. Most items are being resolved within the standard SLA.\n\nWould you like me to export this as a detailed PDF report?`,
        timestamp: new Date(),
        type: "report"
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `I understand you're asking about "${userMessage}". I can help you with:\n\n• **Finding files** - Just say "Find me file with FileNumber [number]"\n• **Retrieving documents** - Say "Retrieve all documents on [subject]"\n• **Generating reports** - Say "Generate a report on [subject]"\n\nHow would you like me to assist you?`,
      timestamp: new Date(),
      type: "text"
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      type: "text"
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await simulateAIResponse(userMessage.content)
      setMessages(prev => [...prev, response])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        type: "text"
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  if (!isOpen) {
    const isSmall = position === "header"
    
    return (
      <div
        ref={iconContainerRef}
        className={cn(
          "fixed z-[100] cursor-grab active:cursor-grabbing select-none",
          !iconPos && (isSmall ? "right-4 bottom-8" : "right-4 top-36")
        )}
        style={iconPos ? { left: iconPos.x, top: iconPos.y } : undefined}
        onPointerDown={handleIconPointerDown}
        onPointerMove={handleIconPointerMove}
        onPointerUp={handleIconPointerUp}
      >
        <div className="relative group" style={{ touchAction: "none" }}>
          {/* Wire/cord hanging from top */}
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 bg-gradient-to-b from-slate-600 to-slate-400 rounded-full",
            isSmall ? "-top-6 w-0.5 h-6" : "-top-8 w-1 h-8"
          )} />
          
          {/* Bulb socket/cap */}
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 bg-slate-700 rounded-t-lg border-2 border-slate-500",
            isSmall ? "-top-1.5 w-5 h-2.5" : "-top-2 w-8 h-4"
          )} />
          
          {/* Main bulb button */}
          <Button
            onClick={() => { if (!isDraggingRef.current) setIsOpen(true) }}
            className={cn(
              "rounded-full shadow-2xl bg-gradient-to-br from-slate-300 to-slate-100 hover:from-yellow-200 hover:to-yellow-400 border-slate-400 hover:border-yellow-500 hover:shadow-[0_0_60px_20px_rgba(250,204,21,0.6)] transition-all duration-300 flex items-center justify-center group-hover:scale-105",
              isSmall ? "h-20 w-20 border-2" : "h-32 w-32 border-4"
            )}
            size="icon"
          >
            <Lightbulb className={cn(
              "text-slate-400 group-hover:text-yellow-600 transition-colors duration-300 group-hover:drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]",
              isSmall ? "h-10 w-10" : "h-16 w-16"
            )} />
          </Button>
          
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-full bg-yellow-400/0 group-hover:bg-yellow-400/20 blur-xl transition-all duration-300 pointer-events-none" />
          
          {/* Ask Rex label */}
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 font-bold rounded-full shadow-lg",
            isSmall ? "-bottom-3 text-xs px-3 py-1" : "-bottom-4 text-base px-5 py-2"
          )}>
            <span className="text-emerald-400">Ask</span> <span className="text-blue-400">Rex</span>
          </div>
          
          {/* Notification dot */}
          <div className={cn(
            "absolute rounded-full bg-red-500 animate-ping",
            isSmall ? "top-0 -right-0.5 h-3 w-3" : "top-0 -right-1 h-4 w-4"
          )} />
          <div className={cn(
            "absolute rounded-full bg-red-500",
            isSmall ? "top-0 -right-0.5 h-3 w-3" : "top-0 -right-1 h-4 w-4"
          )} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "fixed z-[100] bg-card border-2 border-primary/30 rounded-xl shadow-2xl flex flex-col transition-all duration-300",
        isExpanded
          ? "bottom-4 right-4 left-4 top-4 md:left-auto md:w-[600px] md:top-4"
          : "bottom-6 right-6 w-[400px] h-[550px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Ask Rex</h3>
            <p className="text-xs text-muted-foreground">AI Assistant • Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "flex flex-col gap-2 max-w-[80%]",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* File Results */}
                {message.files && message.files.length > 0 && (
                  <div className="w-full space-y-2">
                    {message.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-primary/10 hover:bg-muted transition-colors cursor-pointer"
                      >
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">Ref: {file.ref}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">{file.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions for assistant messages */}
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => speakResponse(message.content)}
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Rex is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Suggested actions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleSuggestionClick(suggestion.prompt)}
              >
                <suggestion.icon className="mr-1.5 h-3 w-3" />
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-primary/10">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            type="button"
            variant={isListening ? "default" : "outline"}
            size="icon"
            className={cn("h-10 w-10 shrink-0", isListening && "bg-red-500 hover:bg-red-600")}
            onClick={handleVoiceInput}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Rex anything..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Rex can find files, retrieve documents, and generate reports
        </p>
      </div>
    </div>
  )
}
