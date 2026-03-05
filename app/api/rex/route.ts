import { z } from 'zod'

export const maxDuration = 30

// Tool definitions with their execute functions
const toolDefinitions = {
  searchCorrespondence: {
    description: 'Search for correspondence records',
    execute: async (params: { query: string; filterType?: string }) => {
      return {
        results: [
          { ref: 'COR-2026-0156', subject: 'Budget Allocation Request', mda: 'Ministry of Finance', status: 'pending', dateReceived: '2026-03-02' },
          { ref: 'COR-2026-0148', subject: 'Staff Training Program', mda: 'Ministry of Education', status: 'approved', dateReceived: '2026-03-01' },
          { ref: 'COR-2026-0142', subject: 'Infrastructure Assessment Report', mda: 'Ministry of Works', status: 'under-review', dateReceived: '2026-02-28' },
        ],
        totalFound: 3,
        searchQuery: params.query,
      }
    },
  },
  
  searchContracts: {
    execute: async (params: { query: string; nature?: string }) => {
      return {
        results: [
          { ref: 'CON-2026-0089', subject: 'Medical Equipment Supply', nature: 'Goods', mda: 'Ministry of Health', status: 'approved', value: 2500000 },
          { ref: 'CON-2026-0086', subject: 'Road Rehabilitation - Highway 1', nature: 'Works', mda: 'Ministry of Works', status: 'pending', value: 45000000 },
          { ref: 'CON-2026-0085', subject: 'Financial Advisory Services', nature: 'Consultancy/Services', mda: 'Ministry of Finance', status: 'approved', value: 750000 },
        ],
        totalFound: 3,
        searchQuery: params.query,
      }
    },
  },
  
  getStatistics: {
    execute: async (params: { type: string; period?: string }) => {
      return {
        correspondence: {
          total: 156,
          pending: 23,
          approved: 98,
          rejected: 12,
          underReview: 23,
          avgProcessingDays: 4.2,
        },
        contracts: {
          total: 89,
          pending: 15,
          approved: 52,
          totalValue: 125000000,
          byNature: { Goods: 34, Works: 28, 'Consultancy/Services': 27 },
        },
        period: params.period || 'all-time',
      }
    },
  },
  
  generateReport: {
    execute: async (params: { reportType: string; category: string; period?: string }) => {
      const contractsThisWeek = [
        {
          dateReceived: '2026-03-02',
          originatingMDA: 'Ministry of Health',
          subject: 'Medical Equipment Supply',
          natureOfContract: 'Goods',
          category: 'Procurement of Goods & Services',
          contractNumber: 'CON-2026-0089',
          contractType: 'New',
          status: 'Approved'
        },
        {
          dateReceived: '2026-03-03',
          originatingMDA: 'Ministry of Education',
          subject: 'School Renovation Project Phase 2',
          natureOfContract: 'Works',
          category: 'Construction / Public Works',
          contractNumber: 'CON-2026-0088',
          contractType: 'Supplemental',
          status: 'Pending Review'
        },
        {
          dateReceived: '2026-03-03',
          originatingMDA: 'Ministry of ICT',
          subject: 'IT Infrastructure Upgrade',
          natureOfContract: 'Goods',
          category: 'Procurement of Goods & Services',
          contractNumber: 'CON-2026-0087',
          contractType: 'New',
          status: 'Under Review'
        },
        {
          dateReceived: '2026-03-04',
          originatingMDA: 'Ministry of Works',
          subject: 'Road Rehabilitation - Highway 1',
          natureOfContract: 'Works',
          category: 'Construction / Public Works',
          contractNumber: 'CON-2026-0086',
          contractType: 'New',
          status: 'Pending'
        },
        {
          dateReceived: '2026-03-05',
          originatingMDA: 'Ministry of Finance',
          subject: 'Financial Advisory Services',
          natureOfContract: 'Consultancy/Services',
          category: 'Consultancy / Professional Services',
          contractNumber: 'CON-2026-0085',
          contractType: 'Renewal',
          status: 'Approved'
        },
      ]

      return {
        reportGenerated: true,
        reportType: params.reportType,
        category: params.category,
        period: params.period || 'this-week',
        generatedAt: new Date().toISOString(),
        contracts: contractsThisWeek,
        summary: {
          totalContracts: contractsThisWeek.length,
          byStatus: { approved: 2, pending: 2, underReview: 1 },
          byNature: { Goods: 2, Works: 2, 'Consultancy/Services': 1 }
        },
        message: `Report for this week generated. Found ${contractsThisWeek.length} contracts.`
      }
    },
  },
  
  getHelp: {
    execute: async (params: { topic: string }) => {
      const helpTopics: Record<string, string> = {
        'correspondence': 'To submit correspondence, navigate to the Correspondence Register and use the submission form.',
        'contracts': 'Contract submissions require details about nature, category, contractor, and value.',
        'reports': 'Access Reports & Analytics from the sidebar to generate custom reports.',
        'default': 'I can help with correspondence tracking, contract management, reports, and navigation.',
      }
      return {
        topic: params.topic,
        guidance: helpTopics[params.topic.toLowerCase()] || helpTopics['default'],
      }
    },
  },
}

// Intent detection patterns
const intentPatterns = [
  { pattern: /report|generate.*report|weekly.*report|contracts.*week/i, tool: 'generateReport', params: { reportType: 'weekly', category: 'contracts', period: 'this-week' } },
  { pattern: /search.*correspondence|find.*correspondence|correspondence.*search/i, tool: 'searchCorrespondence', params: { query: '', filterType: 'all' } },
  { pattern: /search.*contract|find.*contract|contract.*search/i, tool: 'searchContracts', params: { query: '', nature: 'all' } },
  { pattern: /statistics|stats|analytics|how many/i, tool: 'getStatistics', params: { type: 'both', period: 'month' } },
  { pattern: /help|how do i|how to|guide/i, tool: 'getHelp', params: { topic: 'default' } },
]

function detectIntent(message: string): { tool: string; params: Record<string, unknown> } | null {
  for (const { pattern, tool, params } of intentPatterns) {
    if (pattern.test(message)) {
      return { tool, params }
    }
  }
  return null
}

function generateResponse(message: string, toolResult?: { tool: string; result: unknown }): string {
  if (toolResult) {
    switch (toolResult.tool) {
      case 'generateReport':
        return `I've generated the contracts report for this week. The table below shows all ${(toolResult.result as { summary: { totalContracts: number } }).summary.totalContracts} contracts submitted, including Date Received, Originating MDA, Subject, Nature of Contract, Category, Contract #, Contract Type, and Status/Stage.`
      case 'searchCorrespondence':
        return `I found ${(toolResult.result as { totalFound: number }).totalFound} correspondence records matching your search. Here are the results:`
      case 'searchContracts':
        return `I found ${(toolResult.result as { totalFound: number }).totalFound} contracts matching your search. Here are the details:`
      case 'getStatistics':
        return `Here are the current statistics for the SGC Portal:`
      case 'getHelp':
        return (toolResult.result as { guidance: string }).guidance
      default:
        return 'Here are the results:'
    }
  }
  
  // Default responses for general queries
  const lowerMessage = message.toLowerCase()
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm Rex, your AI assistant for the SGC Portal. I can help you search for correspondence and contracts, generate reports, view statistics, and navigate the portal. How can I assist you today?"
  }
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Let me know if there's anything else I can help you with."
  }
  
  return "I can help you with searching correspondence, finding contracts, generating reports, and viewing statistics. Try asking me to 'Generate a report on contracts this week' or 'Show me the statistics'."
}

export async function POST(req: Request) {
  const { messages } = await req.json()
  
  // Get the last user message
  const lastMessage = messages[messages.length - 1]
  const userText = lastMessage?.parts?.find((p: { type: string }) => p.type === 'text')?.text || ''
  
  // Detect intent and execute tool if applicable
  const intent = detectIntent(userText)
  let toolResult: { tool: string; result: unknown } | undefined
  
  if (intent) {
    const toolDef = toolDefinitions[intent.tool as keyof typeof toolDefinitions]
    if (toolDef) {
      toolResult = {
        tool: intent.tool,
        result: await toolDef.execute(intent.params as never)
      }
    }
  }
  
  // Generate response
  const responseText = generateResponse(userText, toolResult)
  
  // Build the response with tool invocation if applicable
  const responseParts: Array<{ type: string; text?: string; toolInvocation?: { toolCallId: string; toolName: string; args: unknown; state: string; result: unknown } }> = []
  
  if (toolResult) {
    responseParts.push({
      type: 'tool-invocation',
      toolInvocation: {
        toolCallId: `call_${Date.now()}`,
        toolName: toolResult.tool,
        args: intent?.params || {},
        state: 'output-available',
        result: toolResult.result
      }
    })
  }
  
  responseParts.push({ type: 'text', text: responseText })
  
  // Return as a streaming response format compatible with useChat
  const responseMessage = {
    role: 'assistant',
    id: `msg_${Date.now()}`,
    parts: responseParts
  }
  
  // Create a proper SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send tool invocation first if present
      if (toolResult) {
        const toolChunk = {
          type: 'tool-invocation',
          toolInvocation: {
            toolCallId: `call_${Date.now()}`,
            toolName: toolResult.tool,
            args: intent?.params || {},
            state: 'output-available',
            result: toolResult.result
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolChunk)}\n\n`))
      }
      
      // Stream the text response character by character for a typing effect
      const words = responseText.split(' ')
      let currentText = ''
      
      words.forEach((word, index) => {
        currentText += (index > 0 ? ' ' : '') + word
        const chunk = {
          type: 'text-delta',
          delta: (index > 0 ? ' ' : '') + word
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      })
      
      // Send finish message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'finish', finishReason: 'stop' })}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
