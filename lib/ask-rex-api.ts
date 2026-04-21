import { apiGet, apiPost, type ApiResponse, handleUnauthorizedResponse } from './api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export type PortalContext = 'public' | 'management';

export interface AskRexSession {
  session_id: string;
  portal_context: string;
  current_page: string | null;
  session_started_at: string;
}

export interface AskRexMessageRow {
  message_id: string;
  session_id: string;
  message_role: 'user' | 'assistant' | string;
  message_content: string;
  message_type: string;
  tokens_used: number | null;
  processing_time_ms: number | null;
  created_at: string;
}

export interface AskRexSessionHistory {
  session: AskRexSession & {
    total_messages: number;
    total_user_messages: number;
    total_assistant_messages: number;
    is_active: boolean;
  };
  messages: AskRexMessageRow[];
}

export function createSession(
  portalContext?: PortalContext,
  currentPage?: string | null
): Promise<ApiResponse<AskRexSession>> {
  return apiPost<AskRexSession>('/api/ask-rex/sessions', {
    portal_context: portalContext,
    current_page: currentPage,
  });
}

export function getSessionHistory(
  sessionId: string
): Promise<ApiResponse<AskRexSessionHistory>> {
  return apiGet<AskRexSessionHistory>(`/api/ask-rex/sessions/${sessionId}/messages`);
}

export function submitFeedback(messageId: string, feedback: 'positive' | 'negative') {
  return apiPost(`/api/ask-rex/messages/${messageId}/feedback`, { feedback });
}

export function endSession(sessionId: string) {
  return apiPost(`/api/ask-rex/sessions/${sessionId}/end`, {});
}

export type AskRexStreamEvent =
  | { type: 'user-message-saved'; data: { message_id: string } }
  | { type: 'text-delta'; data: { text: string } }
  | { type: 'tool-call'; data: { tool: string; input: unknown } }
  | { type: 'tool-result'; data: { tool: string; has_output: boolean } }
  | { type: 'tool-error'; data: { tool: string; error: string } }
  | {
      type: 'finish';
      data: {
        message_id: string;
        tokens_used: number | null;
        tools_invoked: string[];
        processing_time_ms: number;
      };
    }
  | { type: 'error'; data: { message: string } };

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sgc_token');
}

function parseSseBlock(raw: string): AskRexStreamEvent | null {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const trimmed = normalized.trim();
  if (!trimmed) return null;

  let eventName = '';
  let dataLine = '';

  for (const line of normalized.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      // trim() removes leading space after "data:" and trailing \r from CRLF proxies
      dataLine = line.slice(5).trimStart().trim();
    }
  }

  if (!dataLine) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(dataLine) as Record<string, unknown>;
  } catch {
    return { type: 'error', data: { message: 'Invalid response from Ask Rex.' } };
  }

  const data = parsed as Record<string, unknown>;

  switch (eventName) {
    case 'user-message-saved':
      return {
        type: 'user-message-saved',
        data: { message_id: String(data.message_id ?? '') },
      };
    case 'text-delta':
      return { type: 'text-delta', data: { text: String(data.text ?? '') } };
    case 'tool-call':
      return {
        type: 'tool-call',
        data: { tool: String(data.tool ?? ''), input: data.input },
      };
    case 'tool-result':
      return {
        type: 'tool-result',
        data: {
          tool: String(data.tool ?? ''),
          has_output: Boolean(data.has_output),
        },
      };
    case 'tool-error':
      return {
        type: 'tool-error',
        data: {
          tool: String(data.tool ?? ''),
          error: String(data.error ?? 'Tool error'),
        },
      };
    case 'finish':
      return {
        type: 'finish',
        data: {
          message_id: String(data.message_id ?? ''),
          tokens_used: typeof data.tokens_used === 'number' ? data.tokens_used : null,
          tools_invoked: Array.isArray(data.tools_invoked)
            ? (data.tools_invoked as unknown[]).map(String)
            : [],
          processing_time_ms: Number(data.processing_time_ms ?? 0),
        },
      };
    case 'error':
      return { type: 'error', data: { message: String(data.message ?? 'Unknown error') } };
    default:
      return null;
  }
}

function flushSseBuffer(buffer: string): { events: AskRexStreamEvent[]; rest: string } {
  const normalized = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const events: AskRexStreamEvent[] = [];
  let rest = normalized;

  for (;;) {
    const idx = rest.indexOf('\n\n');
    if (idx === -1) break;
    const raw = rest.slice(0, idx);
    rest = rest.slice(idx + 2);
    const ev = parseSseBlock(raw);
    if (ev) events.push(ev);
  }

  return { events, rest };
}

/**
 * Open an SSE stream for a message. Returns an async iterator of parsed events.
 * The fetch is made with the JWT Bearer token from localStorage.
 */
export async function* streamMessage(
  sessionId: string,
  content: string,
  currentPage?: string | null,
  signal?: AbortSignal
): AsyncGenerator<AskRexStreamEvent, void, void> {
  const token = getToken();

  const res = await fetch(`${API_BASE}/api/ask-rex/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      content,
      ...(currentPage != null && currentPage !== '' ? { current_page: currentPage } : {}),
    }),
    signal,
  });

  handleUnauthorizedResponse(res.status);

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      const j = JSON.parse(text) as { error?: string; message?: string };
      message = j.error || j.message || message;
    } catch {
      /* keep default */
    }
    yield { type: 'error', data: { message } };
    return;
  }

  if (!res.body) {
    yield { type: 'error', data: { message: 'No response body from Ask Rex.' } };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: true });
      const { events, rest } = flushSseBuffer(buffer);
      buffer = rest;
      for (const ev of events) {
        yield ev;
      }
      if (done) break;
    }
    buffer += decoder.decode();
    const { events: tailEvents } = flushSseBuffer(buffer);
    for (const ev of tailEvents) {
      yield ev;
    }
  } finally {
    reader.releaseLock();
  }
}
