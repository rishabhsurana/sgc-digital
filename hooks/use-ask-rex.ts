"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
  createSession,
  endSession,
  getSessionHistory,
  streamMessage,
  submitFeedback,
  type PortalContext,
} from "../lib/ask-rex-api"
import type { RexPresentDataBlock } from "../lib/rex-present-data"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
  toolsInvoked?: string[]
  /** Interactive blocks from the `presentData` tool (generative UI). */
  presentations?: RexPresentDataBlock[]
  feedback?: "positive" | "negative"
  serverMessageId?: string
}

const SESSION_STORAGE_KEY = "sgc_ask_rex_session"
const SESSION_MAX_AGE_MS = 30 * 60 * 1000 // 30 minutes

interface PersistedSession {
  session_id: string
  portal_context: string
  stored_at: number
}

function readPersistedSession(): PersistedSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedSession
    if (!parsed.session_id || !parsed.stored_at) return null
    if (Date.now() - parsed.stored_at > SESSION_MAX_AGE_MS) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writePersistedSession(session: PersistedSession) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function clearPersistedSession() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

function detectPortalContext(pathname: string | null): PortalContext {
  if (!pathname) return "public"
  return pathname.startsWith("/management") ? "management" : "public"
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm Rex, your AI assistant. I can search your contracts and correspondences, look up submissions by transaction number, generate reports, and more. What can I help with?",
  timestamp: new Date(),
}

export function useAskRex() {
  const pathname = usePathname()
  const portalContext = detectPortalContext(pathname)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentTool, setCurrentTool] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Ensure we have a session the first time something is sent. Resume if fresh.
  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (sessionId) return sessionId
    const persisted = readPersistedSession()
    if (persisted && persisted.portal_context === portalContext) {
      // Validate it still exists server-side by fetching history.
      const history = await getSessionHistory(persisted.session_id)
      if (history.success && history.data?.session?.is_active) {
        setSessionId(persisted.session_id)
        const restored: ChatMessage[] = [WELCOME_MESSAGE]
        for (const m of history.data.messages) {
          restored.push({
            id: m.message_id,
            role: m.message_role === "assistant" ? "assistant" : "user",
            content: m.message_content,
            timestamp: new Date(m.created_at),
            serverMessageId: m.message_id,
          })
        }
        setMessages(restored)
        return persisted.session_id
      }
      clearPersistedSession()
    }

    const resp = await createSession(portalContext, pathname ?? null)
    if (!resp.success || !resp.data) {
      setError(resp.error ?? "Failed to start Ask Rex session.")
      return null
    }
    setSessionId(resp.data.session_id)
    writePersistedSession({
      session_id: resp.data.session_id,
      portal_context: resp.data.portal_context,
      stored_at: Date.now(),
    })
    return resp.data.session_id
  }, [sessionId, portalContext, pathname])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return
      setError(null)

      const sid = await ensureSession()
      if (!sid) return

      const userId = `u-${Date.now()}`
      const assistantId = `a-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: content.trim(), timestamp: new Date() },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
          toolsInvoked: [],
          presentations: [],
        },
      ])
      setIsStreaming(true)
      setCurrentTool(null)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        for await (const event of streamMessage(
          sid,
          content.trim(),
          pathname ?? null,
          controller.signal
        )) {
          switch (event.type) {
            case "text-delta":
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + event.data.text }
                    : m
                )
              )
              break
            case "tool-call":
              setCurrentTool(event.data.tool)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        toolsInvoked: [...(m.toolsInvoked ?? []), event.data.tool],
                      }
                    : m
                )
              )
              break
            case "tool-result":
              setCurrentTool(null)
              if (event.data.block) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          presentations: [...(m.presentations ?? []), event.data.block!],
                        }
                      : m
                  )
                )
              }
              break
            case "finish":
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        isStreaming: false,
                        serverMessageId: event.data.message_id,
                      }
                    : m
                )
              )
              break
            case "error":
              setError(event.data.message)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        isStreaming: false,
                        content: m.content || `Sorry, I hit an error: ${event.data.message}`,
                      }
                    : m
                )
              )
              break
            default:
              break
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error.")
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  isStreaming: false,
                  content: m.content || "Sorry, the connection was interrupted.",
                }
              : m
          )
        )
      } finally {
        setIsStreaming(false)
        setCurrentTool(null)
        abortRef.current = null
      }
    },
    [ensureSession, isStreaming, pathname]
  )

  const giveFeedback = useCallback(
    async (messageId: string, feedback: "positive" | "negative") => {
      const target = messages.find((m) => m.id === messageId)
      const serverId = target?.serverMessageId
      if (!serverId) return
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
      )
      await submitFeedback(serverId, feedback)
    },
    [messages]
  )

  const resetConversation = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    if (sessionId) {
      await endSession(sessionId)
    }
    clearPersistedSession()
    setSessionId(null)
    setMessages([WELCOME_MESSAGE])
    setError(null)
  }, [sessionId])

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return {
    messages,
    sendMessage,
    isStreaming,
    currentTool,
    error,
    giveFeedback,
    resetConversation,
    portalContext,
  }
}
