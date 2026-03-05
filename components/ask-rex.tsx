"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Sparkles,
  Loader2,
  User,
  Volume2,
  VolumeX,
  RefreshCw
} from "lucide-react"

const SUGGESTED_PROMPTS = [
  { icon: Search, label: "Search contracts", prompt: "Search for contracts related to infrastructure" },
  { icon: FileText, label: "Find correspondence", prompt: "Find correspondence from Ministry of Finance" },
  { icon: FileBarChart, label: "Get statistics", prompt: "Show me statistics for contracts this month" },
]

// Helper to extract text from message parts
function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function AskRex() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/rex" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

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

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in your browser.")
      return
    }

    const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition || 
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
    if (!SpeechRecognition) return
    
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput("")
    sendMessage({ text: userInput })
  }

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const handleClearChat = () => {
    setMessages([])
  }

  if (!isOpen) {
    return (
      <div className="fixed top-20 right-6 z-[100]">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2 border border-emerald-400/30">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">Ask Rex</span>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-2 border-emerald-300/50 text-white"
            size="icon"
          >
            <Bot className="h-6 w-6" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "fixed z-[100] bg-card border-2 border-emerald-200 rounded-xl shadow-2xl flex flex-col transition-all duration-300",
        isExpanded
          ? "bottom-4 right-4 left-4 top-4 md:left-auto md:w-[600px] md:top-4"
          : "top-20 right-6 w-[400px] h-[550px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-200 bg-gradient-to-r from-emerald-500 to-green-600 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-300 border-2 border-emerald-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Ask Rex</h3>
            <p className="text-xs text-emerald-100">AI Assistant • {isLoading ? "Thinking..." : "Online"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={handleClearChat}
            title="Clear chat"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#6ee7b7 #f1f5f9'
        }}
      >
        <div className="space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div className="rounded-lg px-3 py-2 text-sm bg-muted text-foreground">
                  <p>Hello! I&apos;m Rex, your AI assistant for the SGC Portal. I can help you:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Search correspondence and contracts</li>
                    <li>• Generate reports and statistics</li>
                    <li>• Answer questions about the portal</li>
                    <li>• Guide you through processes</li>
                  </ul>
                  <p className="mt-2">How can I assist you today?</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => {
            const messageText = getMessageText(message)
            return (
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
                      : "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
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
                    <p className="whitespace-pre-wrap">{messageText}</p>
                  </div>

                  {/* Tool calls display */}
                  {message.parts?.map((part, index) => {
                    if (part.type === "tool-invocation") {
                      const toolPart = part as { type: "tool-invocation"; toolInvocation: { toolName: string; state: string; result?: unknown } }
                      return (
                        <div key={index} className="w-full">
                          {toolPart.toolInvocation.state === "output-available" && toolPart.toolInvocation.result && (
                            <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
                              <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                                <FileText className="h-4 w-4" />
                                <span>
                                  {toolPart.toolInvocation.toolName === "searchCorrespondence" && "Correspondence Search Results"}
                                  {toolPart.toolInvocation.toolName === "searchContracts" && "Contract Search Results"}
                                  {toolPart.toolInvocation.toolName === "getStatistics" && "Statistics"}
                                  {toolPart.toolInvocation.toolName === "generateReport" && "Report Generated"}
                                  {toolPart.toolInvocation.toolName === "getHelp" && "Help & Guidance"}
                                </span>
                              </div>
                              {toolPart.toolInvocation.toolName === "searchCorrespondence" && (
                                <div className="space-y-2">
                                  {((toolPart.toolInvocation.result as { results: Array<{ ref: string; subject: string; mda: string; status: string }> }).results || []).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border">
                                      <FileText className="h-4 w-4 text-emerald-600" />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.subject}</p>
                                        <p className="text-xs text-muted-foreground">{item.ref} • {item.mda}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs">{item.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {toolPart.toolInvocation.toolName === "searchContracts" && (
                                <div className="space-y-2">
                                  {((toolPart.toolInvocation.result as { results: Array<{ ref: string; subject: string; nature: string; mda: string; status: string; value: number }> }).results || []).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border">
                                      <FileText className="h-4 w-4 text-emerald-600" />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.subject}</p>
                                        <p className="text-xs text-muted-foreground">{item.ref} • ${item.value?.toLocaleString()}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs">{item.nature}</Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {toolPart.toolInvocation.toolName === "getStatistics" && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {(toolPart.toolInvocation.result as { correspondence?: { total: number; pending: number; approved: number } }).correspondence && (
                                    <>
                                      <div className="p-2 bg-white rounded border">
                                        <p className="text-muted-foreground">Total Correspondence</p>
                                        <p className="font-bold text-lg">{(toolPart.toolInvocation.result as { correspondence: { total: number } }).correspondence.total}</p>
                                      </div>
                                      <div className="p-2 bg-white rounded border">
                                        <p className="text-muted-foreground">Pending</p>
                                        <p className="font-bold text-lg">{(toolPart.toolInvocation.result as { correspondence: { pending: number } }).correspondence.pending}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                              {toolPart.toolInvocation.toolName === "generateReport" && (
                                <div className="space-y-3">
                                  {/* Summary stats */}
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="p-2 bg-white rounded border text-center">
                                      <p className="text-muted-foreground">Total</p>
                                      <p className="font-bold text-lg text-emerald-600">
                                        {(toolPart.toolInvocation.result as { summary?: { totalContracts?: number } })?.summary?.totalContracts || 0}
                                      </p>
                                    </div>
                                    <div className="p-2 bg-white rounded border text-center">
                                      <p className="text-muted-foreground">Approved</p>
                                      <p className="font-bold text-lg text-green-600">
                                        {(toolPart.toolInvocation.result as { summary?: { byStatus?: { approved?: number } } })?.summary?.byStatus?.approved || 0}
                                      </p>
                                    </div>
                                    <div className="p-2 bg-white rounded border text-center">
                                      <p className="text-muted-foreground">Pending</p>
                                      <p className="font-bold text-lg text-amber-600">
                                        {(toolPart.toolInvocation.result as { summary?: { byStatus?: { pending?: number } } })?.summary?.byStatus?.pending || 0}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Contracts Table */}
                                  {(toolPart.toolInvocation.result as { contracts?: Array<{ dateReceived: string; originatingMDA: string; subject: string; natureOfContract: string; category: string; contractNumber: string; contractType: string; status: string }> })?.contracts && (
                                    <div className="overflow-x-auto">
                                      <p className="text-xs font-medium text-emerald-700 mb-2">Contracts Submitted This Week:</p>
                                      <table className="w-full text-xs border-collapse">
                                        <thead>
                                          <tr className="bg-emerald-100 text-emerald-800">
                                            <th className="border border-emerald-200 px-2 py-1 text-left">Date Received</th>
                                            <th className="border border-emerald-200 px-2 py-1 text-left">Originating MDA</th>
                                            <th className="border border-emerald-200 px-2 py-1 text-left">Subject</th>
                                            <th className="border border-emerald-200 px-2 py-1 text-left">Nature</th>
                                            <th className="border border-emerald-200 px-2 py-1 text-left">Category</th>
                                            <th className="border border-emerald-200 px-2 py-1 text-left">Contract #</th>
                                            <th className="border border-emerald-200 px-2 py-1 text-left">Type</th>
                                            <th className="border border-emerald-200 px-2 py-1 text-left">Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {((toolPart.toolInvocation.result as { contracts: Array<{ dateReceived: string; originatingMDA: string; subject: string; natureOfContract: string; category: string; contractNumber: string; contractType: string; status: string }> }).contracts || []).map((contract, i) => (
                                            <tr key={i} className="bg-white hover:bg-emerald-50">
                                              <td className="border border-emerald-200 px-2 py-1">{contract.dateReceived}</td>
                                              <td className="border border-emerald-200 px-2 py-1 max-w-[100px] truncate" title={contract.originatingMDA}>{contract.originatingMDA}</td>
                                              <td className="border border-emerald-200 px-2 py-1 max-w-[120px] truncate" title={contract.subject}>{contract.subject}</td>
                                              <td className="border border-emerald-200 px-2 py-1">{contract.natureOfContract}</td>
                                              <td className="border border-emerald-200 px-2 py-1 max-w-[100px] truncate" title={contract.category}>{contract.category}</td>
                                              <td className="border border-emerald-200 px-2 py-1 font-mono">{contract.contractNumber}</td>
                                              <td className="border border-emerald-200 px-2 py-1">{contract.contractType}</td>
                                              <td className="border border-emerald-200 px-2 py-1">
                                                <Badge variant="outline" className={cn(
                                                  "text-[10px]",
                                                  contract.status === "Approved" && "border-green-300 bg-green-50 text-green-700",
                                                  contract.status === "Pending" && "border-amber-300 bg-amber-50 text-amber-700",
                                                  contract.status === "Under Review" && "border-blue-300 bg-blue-50 text-blue-700",
                                                  contract.status === "Pending Review" && "border-amber-300 bg-amber-50 text-amber-700"
                                                )}>
                                                  {contract.status}
                                                </Badge>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {toolPart.toolInvocation.state === "input-available" && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Searching...</span>
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  })}

                  {/* Actions for assistant messages */}
                  {message.role === "assistant" && messageText && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => speakResponse(messageText)}
                      >
                        {isSpeaking ? (
                          <VolumeX className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span className="text-sm text-muted-foreground">Rex is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Suggested actions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-8 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
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
      <div className="p-4 border-t border-emerald-100">
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
            className="flex-1 border-emerald-200 focus-visible:ring-emerald-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Rex is powered by AI and can search, analyze, and assist with SGC Portal tasks
        </p>
      </div>
    </div>
  )
}
