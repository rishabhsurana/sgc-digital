"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAskRex } from "@/hooks/use-ask-rex"
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
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react"

interface AskRexProps {
  position?: "header" | "content"
}

const SUGGESTED_PROMPTS = [
  { icon: Search, label: "Recent activity", prompt: "Show me my most recent submissions" },
  { icon: FileText, label: "Pending items", prompt: "How many of my contracts are pending review?" },
  { icon: FileBarChart, label: "Status report", prompt: "Give me a status summary of all my submissions" },
]

const TOOL_LABELS: Record<string, string> = {
  searchCorrespondences: "Searching correspondences…",
  searchContracts: "Searching contracts…",
  getSubmissionStats: "Calculating status counts…",
  lookupTransaction: "Looking up transaction…",
  getRecentSubmissions: "Fetching recent submissions…",
  searchDocuments: "Searching documents…",
  generateReport: "Generating report…",
  searchKnowledgeBase: "Searching knowledge base…",
}

export function AskRex({ position = "header" }: AskRexProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const {
    messages,
    sendMessage,
    isStreaming,
    currentTool,
    error,
    giveFeedback,
    resetConversation,
  } = useAskRex()

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector<HTMLDivElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    } else {
      bottomRef.current?.scrollIntoView({ block: "end" })
    }
  }, [messages, isStreaming, currentTool, error])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in your browser.")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isStreaming) return
    const content = input.trim()
    setInput("")
    await sendMessage(content)
  }

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  if (!isOpen) {
    const isSmall = position === "header"

    return (
      <div className={cn(
        "fixed right-4 z-[100]",
        isSmall ? "top-8" : "top-36"
      )}>
        <div className="relative group">
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
            onClick={() => setIsOpen(true)}
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
            title="New conversation"
            onClick={() => resetConversation()}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
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
      <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
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
                  "flex flex-col gap-2 max-w-[85%]",
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
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-pre:my-1">
                      {message.content ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : message.isStreaming ? (
                        <span className="text-muted-foreground">Thinking…</span>
                      ) : null}
                      {message.isStreaming && message.content && (
                        <span className="inline-block w-2 h-4 align-text-bottom bg-foreground/60 animate-pulse ml-0.5" />
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>

                {/* Tool-execution indicators */}
                {message.role === "assistant" && message.isStreaming && currentTool && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>{TOOL_LABELS[currentTool] ?? `Running ${currentTool}…`}</span>
                  </div>
                )}

                {/* Actions for completed assistant messages */}
                {message.role === "assistant" && !message.isStreaming && message.id !== "welcome" && (
                  <div className="flex items-center gap-1">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-6 w-6", message.feedback === "positive" && "text-green-600")}
                      onClick={() => giveFeedback(message.id, "positive")}
                      disabled={!message.serverMessageId || message.feedback !== undefined}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-6 w-6", message.feedback === "negative" && "text-red-600")}
                      onClick={() => giveFeedback(message.id, "negative")}
                      disabled={!message.serverMessageId || message.feedback !== undefined}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded p-2">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
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
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Rex searches your contracts, correspondences, and documents in real time
        </p>
      </div>
    </div>
  )
}
