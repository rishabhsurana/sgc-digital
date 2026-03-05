import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
} from 'ai'
import { z } from 'zod'

export const maxDuration = 30

// Define tools for Rex to use
const tools = {
  searchCorrespondence: tool({
    description: 'Search for correspondence records by reference number, subject, or originating MDA',
    inputSchema: z.object({
      query: z.string().describe('The search query - can be a reference number, subject keywords, or MDA name'),
      filterType: z.enum(['all', 'reference', 'subject', 'mda']).nullable().describe('Optional filter type'),
    }),
    execute: async ({ query, filterType }) => {
      // Simulated search results - in production, this would query the database
      return {
        results: [
          { ref: 'COR-2026-0156', subject: 'Budget Allocation Request', mda: 'Ministry of Finance', status: 'pending' },
          { ref: 'COR-2026-0148', subject: 'Staff Training Program', mda: 'Ministry of Education', status: 'approved' },
        ],
        totalFound: 2,
        searchQuery: query,
      }
    },
  }),
  
  searchContracts: tool({
    description: 'Search for contract records by contract number, subject, contractor name, or originating MDA',
    inputSchema: z.object({
      query: z.string().describe('The search query - can be a contract number, subject, contractor, or MDA'),
      nature: z.enum(['all', 'Goods', 'Works', 'Consultancy/Services']).nullable().describe('Filter by nature of contract'),
    }),
    execute: async ({ query, nature }) => {
      return {
        results: [
          { ref: 'CON-2026-0089', subject: 'Medical Equipment Supply', nature: 'Goods', mda: 'Ministry of Health', status: 'approved', value: 2500000 },
          { ref: 'CON-2026-0086', subject: 'Road Rehabilitation - Highway 1', nature: 'Works', mda: 'Ministry of Works', status: 'pending', value: 45000000 },
        ],
        totalFound: 2,
        searchQuery: query,
      }
    },
  }),
  
  getStatistics: tool({
    description: 'Get statistics and analytics about correspondence or contracts',
    inputSchema: z.object({
      type: z.enum(['correspondence', 'contracts', 'both']).describe('The type of statistics to retrieve'),
      period: z.enum(['today', 'week', 'month', 'year']).nullable().describe('Time period for the statistics'),
    }),
    execute: async ({ type, period }) => {
      if (type === 'correspondence' || type === 'both') {
        return {
          correspondence: {
            total: 156,
            pending: 23,
            approved: 98,
            rejected: 12,
            underReview: 23,
            avgProcessingDays: 4.2,
          },
          contracts: type === 'both' ? {
            total: 89,
            pending: 15,
            approved: 52,
            totalValue: 125000000,
            byNature: { Goods: 34, Works: 28, 'Consultancy/Services': 27 },
          } : undefined,
          period: period || 'all-time',
        }
      }
      return {
        contracts: {
          total: 89,
          pending: 15,
          approved: 52,
          totalValue: 125000000,
          byNature: { Goods: 34, Works: 28, 'Consultancy/Services': 27 },
        },
        period: period || 'all-time',
      }
    },
  }),
  
  generateReport: tool({
    description: 'Generate a report on correspondence or contracts activity',
    inputSchema: z.object({
      reportType: z.enum(['summary', 'detailed', 'pending-actions', 'overdue']).describe('Type of report to generate'),
      category: z.enum(['correspondence', 'contracts', 'all']).describe('Category to report on'),
    }),
    execute: async ({ reportType, category }) => {
      return {
        reportGenerated: true,
        reportType,
        category,
        summary: `${reportType} report for ${category} has been generated. There are 23 pending items requiring attention, 5 items are overdue by more than 7 days.`,
        downloadUrl: '/api/reports/download?type=' + reportType,
      }
    },
  }),
  
  getHelp: tool({
    description: 'Get help and guidance on using the SGC Portal management features',
    inputSchema: z.object({
      topic: z.string().describe('The topic the user needs help with'),
    }),
    execute: async ({ topic }) => {
      const helpTopics: Record<string, string> = {
        'correspondence': 'To submit correspondence, navigate to the Correspondence page and fill out the submission form. You can track status from the Dashboard.',
        'contracts': 'Contract submissions require details about nature, category, contractor, and value. Use the Contracts Register to view all contracts.',
        'reports': 'Access Reports & Analytics from the Management sidebar. You can generate custom reports filtered by date, status, or MDA.',
        'users': 'User Management allows you to add, edit, or deactivate users. Only approved administrators can access this feature.',
        'default': 'I can help you with correspondence tracking, contract management, generating reports, searching records, and navigating the portal.',
      }
      return {
        topic,
        guidance: helpTopics[topic.toLowerCase()] || helpTopics['default'],
      }
    },
  }),
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `You are Rex, an intelligent AI assistant for the SGC (Solicitor General's Chambers) Portal Management System. You help government administrators manage correspondence, contracts, and other official documents.

Your personality:
- Professional yet friendly and approachable
- Efficient and action-oriented
- Knowledgeable about government processes in Barbados
- Always ready to help find documents, generate reports, or explain procedures

Your capabilities:
- Search and retrieve correspondence and contract records
- Generate statistics and reports on document processing
- Provide guidance on using the portal features
- Help users navigate the management dashboard

When responding:
- Be concise but thorough
- Format data in a readable way when presenting search results
- Proactively suggest related actions the user might want to take
- If you're not sure about something, ask clarifying questions

Remember: You're helping government officials work more efficiently. Time and accuracy are important.`,
    messages: await convertToModelMessages(messages),
    tools,
    maxSteps: 5,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
