"use client"

import { useState, useRef, useEffect } from "react"
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

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  toolResult?: {
    tool: string
    result: unknown
  }
}

const SUGGESTED_PROMPTS = [
  { icon: Search, label: "Search contracts", prompt: "Search for contracts related to infrastructure" },
  { icon: FileText, label: "Find correspondence", prompt: "Find correspondence from Ministry of Finance" },
  { icon: FileBarChart, label: "Weekly report", prompt: "Generate a report on contracts submitted this week" },
]

export function AskRex() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    
    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: userInput
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/rex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
      })
      
      const data = await response.json()
      
      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: data.response,
        toolResult: data.toolResult
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again."
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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
            <p className="text-xs text-emerald-100">AI Assistant {isLoading ? "• Thinking..." : "• Online"}</p>
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
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Tool result display */}
                {message.toolResult && (
                  <div className="w-full mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                      <FileText className="h-4 w-4" />
                      <span>
                        {message.toolResult.tool === "searchCorrespondence" && "Correspondence Search Results"}
                        {message.toolResult.tool === "searchContracts" && "Contract Search Results"}
                        {message.toolResult.tool === "getStatistics" && "Statistics"}
                        {message.toolResult.tool === "generateReport" && "Report Generated"}
                        {message.toolResult.tool === "getHelp" && "Help & Guidance"}
                      </span>
                    </div>
                    
                    {/* Correspondence search results */}
                    {message.toolResult.tool === "searchCorrespondence" && (
                      <div className="space-y-2">
                        {((message.toolResult.result as { results: Array<{ ref: string; subject: string; mda: string; status: string }> }).results || []).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.subject}</p>
                              <p className="text-xs text-muted-foreground">{item.ref} - {item.mda}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{item.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Contract search results */}
                    {message.toolResult.tool === "searchContracts" && (
                      <div className="space-y-2">
                        {((message.toolResult.result as { results: Array<{ ref: string; subject: string; nature: string; mda: string; status: string; value: number }> }).results || []).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.subject}</p>
                              <p className="text-xs text-muted-foreground">{item.ref} - ${item.value?.toLocaleString()}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{item.nature}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Statistics */}
                    {message.toolResult.tool === "getStatistics" && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {(message.toolResult.result as { correspondence?: { total: number; pending: number } }).correspondence && (
                          <>
                            <div className="p-2 bg-white rounded border">
                              <p className="text-muted-foreground">Total Correspondence</p>
                              <p className="font-bold text-lg">{(message.toolResult.result as { correspondence: { total: number } }).correspondence.total}</p>
                            </div>
                            <div className="p-2 bg-white rounded border">
                              <p className="text-muted-foreground">Pending</p>
                              <p className="font-bold text-lg">{(message.toolResult.result as { correspondence: { pending: number } }).correspondence.pending}</p>
                            </div>
                          </>
                        )}
                        {(message.toolResult.result as { contracts?: { total: number; totalValue: number } }).contracts && (
                          <>
                            <div className="p-2 bg-white rounded border">
                              <p className="text-muted-foreground">Total Contracts</p>
                              <p className="font-bold text-lg">{(message.toolResult.result as { contracts: { total: number } }).contracts.total}</p>
                            </div>
                            <div className="p-2 bg-white rounded border">
                              <p className="text-muted-foreground">Total Value</p>
                              <p className="font-bold text-lg">${((message.toolResult.result as { contracts: { totalValue: number } }).contracts.totalValue / 1000000).toFixed(1)}M</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Report */}
                    {message.toolResult.tool === "generateReport" && (
                      <div className="space-y-3">
                        {/* Summary stats */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-white rounded border text-center">
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold text-lg text-emerald-600">
                              {(message.toolResult.result as { summary?: { totalContracts?: number } })?.summary?.totalContracts || 0}
                            </p>
                          </div>
                          <div className="p-2 bg-white rounded border text-center">
                            <p className="text-muted-foreground">Approved</p>
                            <p className="font-bold text-lg text-green-600">
                              {(message.toolResult.result as { summary?: { byStatus?: { approved?: number } } })?.summary?.byStatus?.approved || 0}
                            </p>
                          </div>
                          <div className="p-2 bg-white rounded border text-center">
                            <p className="text-muted-foreground">Pending</p>
                            <p className="font-bold text-lg text-amber-600">
                              {(message.toolResult.result as { summary?: { byStatus?: { pending?: number } } })?.summary?.byStatus?.pending || 0}
                            </p>
                          </div>
                        </div>
                        
                        {/* Contracts Table */}
                        {(message.toolResult.result as { contracts?: Array<{ dateReceived: string; originatingMDA: string; subject: string; natureOfContract: string; category: string; contractNumber: string; contractType: string; status: string }> })?.contracts && (
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
                                {((message.toolResult.result as { contracts: Array<{ dateReceived: string; originatingMDA: string; subject: string; natureOfContract: string; category: string; contractNumber: string; contractType: string; status: string }> }).contracts || []).map((contract, i) => (
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

                {/* Speaker button for assistant messages */}
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => speakResponse(message.content)}
                  >
                    {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg px-3 py-2 text-sm bg-muted text-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Rex is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((item, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs h-7 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                onClick={() => handleSuggestionClick(item.prompt)}
              >
                <item.icon className="h-3 w-3 mr-1 text-emerald-600" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-emerald-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 shrink-0",
              isListening && "text-red-500 bg-red-50"
            )}
            onClick={handleVoiceInput}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
      </div>
    </div>
  )
}
