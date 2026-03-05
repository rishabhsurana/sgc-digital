import { NextResponse } from 'next/server'

export const maxDuration = 30

// Simulated database - in production, this would connect to your actual database
const database = {
  correspondence: [
    { dateReceived: '2026-03-02', originatingMDA: 'Ministry of Finance', subject: 'Budget Allocation Request FY2026', referenceNumber: 'COR-2026-0156', category: 'Financial Matters', correspondenceType: 'Internal', status: 'Pending', dateCompleted: null, assignedTo: 'John Smith' },
    { dateReceived: '2026-03-02', originatingMDA: 'Ministry of Education', subject: 'Staff Training Program Approval', referenceNumber: 'COR-2026-0157', category: 'Human Resources', correspondenceType: 'Internal', status: 'Approved', dateCompleted: '2026-03-04', assignedTo: 'Mary Johnson' },
    { dateReceived: '2026-03-03', originatingMDA: 'Ministry of Health', subject: 'Emergency Medical Supplies Request', referenceNumber: 'COR-2026-0158', category: 'Procurement', correspondenceType: 'Urgent', status: 'Under Review', dateCompleted: null, assignedTo: 'David Williams' },
    { dateReceived: '2026-03-03', originatingMDA: 'Ministry of Works', subject: 'Infrastructure Assessment Report Q1', referenceNumber: 'COR-2026-0159', category: 'Reports', correspondenceType: 'Internal', status: 'Approved', dateCompleted: '2026-03-05', assignedTo: 'Sarah Brown' },
    { dateReceived: '2026-03-04', originatingMDA: 'Attorney General Office', subject: 'Legal Opinion on Contract Amendment', referenceNumber: 'COR-2026-0160', category: 'Legal', correspondenceType: 'Internal', status: 'Pending', dateCompleted: null, assignedTo: 'Michael Davis' },
    { dateReceived: '2026-03-05', originatingMDA: 'Ministry of Tourism', subject: 'Tourism Development Initiative Proposal', referenceNumber: 'COR-2026-0161', category: 'Policy', correspondenceType: 'External', status: 'Under Review', dateCompleted: null, assignedTo: 'Jennifer Wilson' },
    { dateReceived: '2026-02-28', originatingMDA: 'Ministry of Agriculture', subject: 'Farming Subsidy Program Review', referenceNumber: 'COR-2026-0150', category: 'Policy', correspondenceType: 'Internal', status: 'Approved', dateCompleted: '2026-03-02', assignedTo: 'Robert Taylor' },
    { dateReceived: '2026-02-27', originatingMDA: 'Ministry of ICT', subject: 'Digital Transformation Strategy', referenceNumber: 'COR-2026-0149', category: 'Policy', correspondenceType: 'Internal', status: 'Approved', dateCompleted: '2026-03-01', assignedTo: 'Emily Anderson' },
  ],
  contracts: [
    { dateReceived: '2026-03-02', originatingMDA: 'Ministry of Health', subject: 'Medical Equipment Supply', natureOfContract: 'Goods', category: 'Procurement of Goods & Services', contractNumber: 'CON-2026-0089', contractType: 'New', status: 'Approved', contractValue: 2500000, contractor: 'MedSupply Ltd' },
    { dateReceived: '2026-03-03', originatingMDA: 'Ministry of Education', subject: 'School Renovation Project Phase 2', natureOfContract: 'Works', category: 'Construction / Public Works', contractNumber: 'CON-2026-0088', contractType: 'Supplemental', status: 'Pending Review', contractValue: 15000000, contractor: 'BuildRight Construction' },
    { dateReceived: '2026-03-03', originatingMDA: 'Ministry of ICT', subject: 'IT Infrastructure Upgrade', natureOfContract: 'Goods', category: 'Procurement of Goods & Services', contractNumber: 'CON-2026-0087', contractType: 'New', status: 'Under Review', contractValue: 8500000, contractor: 'TechSolutions Inc' },
    { dateReceived: '2026-03-04', originatingMDA: 'Ministry of Works', subject: 'Road Rehabilitation - Highway 1', natureOfContract: 'Works', category: 'Construction / Public Works', contractNumber: 'CON-2026-0086', contractType: 'New', status: 'Pending', contractValue: 45000000, contractor: 'National Roads Corp' },
    { dateReceived: '2026-03-05', originatingMDA: 'Ministry of Finance', subject: 'Financial Advisory Services', natureOfContract: 'Consultancy/Services', category: 'Consultancy / Professional Services', contractNumber: 'CON-2026-0085', contractType: 'Renewal', status: 'Approved', contractValue: 750000, contractor: 'Advisory Partners' },
    { dateReceived: '2026-02-28', originatingMDA: 'Ministry of Agriculture', subject: 'Irrigation System Installation', natureOfContract: 'Works', category: 'Construction / Public Works', contractNumber: 'CON-2026-0084', contractType: 'New', status: 'Approved', contractValue: 12000000, contractor: 'AgroWorks Ltd' },
    { dateReceived: '2026-02-26', originatingMDA: 'Ministry of Tourism', subject: 'Tourism Marketing Campaign', natureOfContract: 'Consultancy/Services', category: 'Consultancy / Professional Services', contractNumber: 'CON-2026-0083', contractType: 'New', status: 'Approved', contractValue: 3500000, contractor: 'Global Marketing Co' },
  ],
  mdas: [
    'Ministry of Finance', 'Ministry of Education', 'Ministry of Health', 'Ministry of Works',
    'Ministry of ICT', 'Ministry of Agriculture', 'Ministry of Tourism', 'Attorney General Office',
    'Ministry of Defense', 'Ministry of Foreign Affairs', 'Ministry of Trade', 'Ministry of Energy'
  ]
}

// Helper function to filter data by time period
function filterByPeriod(data: Array<{ dateReceived: string }>, period: string) {
  const now = new Date('2026-03-05') // Current date in the app
  let startDate: Date

  switch (period) {
    case 'today':
      startDate = new Date(now)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
    case 'this week':
    case 'this-week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
    case 'this month':
    case 'this-month':
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
    case 'this year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      return data
  }

  return data.filter(item => new Date(item.dateReceived) >= startDate)
}

// Helper to filter by MDA
function filterByMDA(data: Array<{ originatingMDA: string }>, mda: string) {
  if (!mda || mda === 'all') return data
  return data.filter(item => item.originatingMDA.toLowerCase().includes(mda.toLowerCase()))
}

// Helper to filter by status
function filterByStatus(data: Array<{ status: string }>, status: string) {
  if (!status || status === 'all') return data
  return data.filter(item => item.status.toLowerCase().includes(status.toLowerCase()))
}

// Parse the user's query to understand what they want
function parseQuery(message: string): {
  reportType: 'contracts' | 'correspondence' | 'statistics' | 'search' | 'general' | 'mda' | 'combined';
  period?: string;
  mda?: string;
  status?: string;
  searchTerm?: string;
  fields?: string[];
} {
  const lower = message.toLowerCase()
  
  // Detect report type
  let reportType: 'contracts' | 'correspondence' | 'statistics' | 'search' | 'general' | 'mda' | 'combined' = 'general'
  
  if (lower.includes('correspondence') && lower.includes('contract')) {
    reportType = 'combined'
  } else if (lower.includes('correspondence') || lower.includes('letter') || lower.includes('memo')) {
    reportType = 'correspondence'
  } else if (lower.includes('contract') || lower.includes('procurement') || lower.includes('tender')) {
    reportType = 'contracts'
  } else if (lower.includes('statistic') || lower.includes('analytics') || lower.includes('dashboard') || lower.includes('overview') || lower.includes('summary')) {
    reportType = 'statistics'
  } else if (lower.includes('mda') || lower.includes('ministr') || lower.includes('department') || lower.includes('agency')) {
    reportType = 'mda'
  } else if (lower.includes('search') || lower.includes('find') || lower.includes('look for') || lower.includes('locate')) {
    reportType = 'search'
  } else if (lower.includes('report') || lower.includes('list') || lower.includes('show')) {
    // Default to contracts if just asking for a report
    reportType = 'contracts'
  }
  
  // Detect time period
  let period: string | undefined
  if (lower.includes('today')) period = 'today'
  else if (lower.includes('this week') || lower.includes('week')) period = 'week'
  else if (lower.includes('this month') || lower.includes('month')) period = 'month'
  else if (lower.includes('this year') || lower.includes('year')) period = 'year'
  
  // Detect MDA
  let mda: string | undefined
  for (const mdaName of database.mdas) {
    if (lower.includes(mdaName.toLowerCase())) {
      mda = mdaName
      break
    }
  }
  
  // Detect status
  let status: string | undefined
  if (lower.includes('pending')) status = 'pending'
  else if (lower.includes('approved')) status = 'approved'
  else if (lower.includes('under review') || lower.includes('review')) status = 'under review'
  else if (lower.includes('rejected')) status = 'rejected'
  
  // Detect fields requested
  const fields: string[] = []
  if (lower.includes('date received') || lower.includes('date')) fields.push('dateReceived')
  if (lower.includes('originating mda') || lower.includes('mda')) fields.push('originatingMDA')
  if (lower.includes('subject')) fields.push('subject')
  if (lower.includes('nature')) fields.push('natureOfContract')
  if (lower.includes('category')) fields.push('category')
  if (lower.includes('contract #') || lower.includes('contract number') || lower.includes('reference')) fields.push('contractNumber')
  if (lower.includes('type')) fields.push('contractType')
  if (lower.includes('status') || lower.includes('stage')) fields.push('status')
  if (lower.includes('value') || lower.includes('amount')) fields.push('contractValue')
  if (lower.includes('contractor') || lower.includes('vendor')) fields.push('contractor')
  
  return { reportType, period, mda, status, fields: fields.length > 0 ? fields : undefined }
}

// Generate the appropriate response
function generateReport(query: ReturnType<typeof parseQuery>) {
  switch (query.reportType) {
    case 'contracts': {
      let data = [...database.contracts]
      if (query.period) data = filterByPeriod(data, query.period)
      if (query.mda) data = filterByMDA(data, query.mda)
      if (query.status) data = filterByStatus(data, query.status)
      
      const summary = {
        totalContracts: data.length,
        byStatus: {
          approved: data.filter(c => c.status === 'Approved').length,
          pending: data.filter(c => c.status === 'Pending' || c.status === 'Pending Review').length,
          underReview: data.filter(c => c.status === 'Under Review').length,
        },
        byNature: {
          Goods: data.filter(c => c.natureOfContract === 'Goods').length,
          Works: data.filter(c => c.natureOfContract === 'Works').length,
          'Consultancy/Services': data.filter(c => c.natureOfContract === 'Consultancy/Services').length,
        },
        totalValue: data.reduce((sum, c) => sum + c.contractValue, 0)
      }
      
      return {
        tool: 'generateContractsReport',
        result: {
          reportGenerated: true,
          reportType: 'custom',
          category: 'contracts',
          period: query.period || 'all',
          generatedAt: new Date().toISOString(),
          contracts: data,
          correspondence: null,
          summary,
          filters: { period: query.period, mda: query.mda, status: query.status }
        }
      }
    }
    
    case 'correspondence': {
      let data = [...database.correspondence]
      if (query.period) data = filterByPeriod(data, query.period)
      if (query.mda) data = filterByMDA(data, query.mda)
      if (query.status) data = filterByStatus(data, query.status)
      
      const summary = {
        totalCorrespondence: data.length,
        byStatus: {
          approved: data.filter(c => c.status === 'Approved').length,
          pending: data.filter(c => c.status === 'Pending').length,
          underReview: data.filter(c => c.status === 'Under Review').length,
        },
        byType: {
          Internal: data.filter(c => c.correspondenceType === 'Internal').length,
          External: data.filter(c => c.correspondenceType === 'External').length,
          Urgent: data.filter(c => c.correspondenceType === 'Urgent').length,
        }
      }
      
      return {
        tool: 'generateCorrespondenceReport',
        result: {
          reportGenerated: true,
          reportType: 'custom',
          category: 'correspondence',
          period: query.period || 'all',
          generatedAt: new Date().toISOString(),
          contracts: null,
          correspondence: data,
          summary,
          filters: { period: query.period, mda: query.mda, status: query.status }
        }
      }
    }
    
    case 'combined': {
      let contracts = [...database.contracts]
      let correspondence = [...database.correspondence]
      
      if (query.period) {
        contracts = filterByPeriod(contracts, query.period)
        correspondence = filterByPeriod(correspondence, query.period)
      }
      if (query.mda) {
        contracts = filterByMDA(contracts, query.mda)
        correspondence = filterByMDA(correspondence, query.mda)
      }
      
      return {
        tool: 'generateCombinedReport',
        result: {
          reportGenerated: true,
          reportType: 'combined',
          period: query.period || 'all',
          generatedAt: new Date().toISOString(),
          contracts,
          correspondence,
          summary: {
            totalContracts: contracts.length,
            totalCorrespondence: correspondence.length,
            totalValue: contracts.reduce((sum, c) => sum + c.contractValue, 0)
          }
        }
      }
    }
    
    case 'statistics': {
      const contracts = database.contracts
      const correspondence = database.correspondence
      
      return {
        tool: 'getStatistics',
        result: {
          correspondence: {
            total: correspondence.length,
            pending: correspondence.filter(c => c.status === 'Pending').length,
            approved: correspondence.filter(c => c.status === 'Approved').length,
            underReview: correspondence.filter(c => c.status === 'Under Review').length,
          },
          contracts: {
            total: contracts.length,
            pending: contracts.filter(c => c.status === 'Pending' || c.status === 'Pending Review').length,
            approved: contracts.filter(c => c.status === 'Approved').length,
            underReview: contracts.filter(c => c.status === 'Under Review').length,
            totalValue: contracts.reduce((sum, c) => sum + c.contractValue, 0),
          },
          mdaCount: database.mdas.length
        }
      }
    }
    
    case 'mda': {
      return {
        tool: 'getMDAList',
        result: {
          mdas: database.mdas,
          total: database.mdas.length,
          contractsByMDA: database.mdas.map(mda => ({
            name: mda,
            contracts: database.contracts.filter(c => c.originatingMDA === mda).length,
            correspondence: database.correspondence.filter(c => c.originatingMDA === mda).length,
          }))
        }
      }
    }
    
    default:
      return null
  }
}

// Generate natural language response
function generateResponseText(message: string, query: ReturnType<typeof parseQuery>, toolResult: { tool: string; result: unknown } | null): string {
  const lower = message.toLowerCase()
  
  // Greetings
  if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "Hello! I'm Rex, your AI assistant for the SGC Portal. I can help you with:\n\n• Generating reports on contracts or correspondence\n• Searching for specific documents\n• Viewing statistics and analytics\n• Information about MDAs\n\nJust ask me anything! For example: 'Show me all pending contracts' or 'Generate a correspondence report for this week'"
  }
  
  // Thanks
  if (lower.includes('thank')) {
    return "You're welcome! Let me know if there's anything else I can help you with."
  }
  
  // Help
  if (lower.includes('help') || lower.includes('what can you do')) {
    return "I can help you with many things:\n\n• **Reports**: 'Generate a contracts report for this week'\n• **Correspondence**: 'Show me all pending correspondence from Ministry of Finance'\n• **Contracts**: 'List all approved contracts this month'\n• **Statistics**: 'Show me the dashboard statistics'\n• **Search**: 'Find contracts related to infrastructure'\n• **MDAs**: 'Show me all MDAs and their activity'\n\nYou can combine filters like: 'Show me pending contracts from Ministry of Health this week'"
  }
  
  if (toolResult) {
    const result = toolResult.result as Record<string, unknown>
    const filters = result.filters as { period?: string; mda?: string; status?: string } | undefined
    
    switch (toolResult.tool) {
      case 'generateContractsReport': {
        const summary = result.summary as { totalContracts: number; totalValue: number }
        let response = `I've generated a contracts report`
        if (filters?.period) response += ` for ${filters.period}`
        if (filters?.mda) response += ` from ${filters.mda}`
        if (filters?.status) response += ` with status: ${filters.status}`
        response += `. Found ${summary.totalContracts} contracts with a total value of $${summary.totalValue.toLocaleString()}.`
        return response
      }
      
      case 'generateCorrespondenceReport': {
        const summary = result.summary as { totalCorrespondence: number }
        let response = `I've generated a correspondence report`
        if (filters?.period) response += ` for ${filters.period}`
        if (filters?.mda) response += ` from ${filters.mda}`
        if (filters?.status) response += ` with status: ${filters.status}`
        response += `. Found ${summary.totalCorrespondence} correspondence items.`
        return response
      }
      
      case 'generateCombinedReport': {
        const summary = result.summary as { totalContracts: number; totalCorrespondence: number }
        return `I've generated a combined report showing ${summary.totalContracts} contracts and ${summary.totalCorrespondence} correspondence items.`
      }
      
      case 'getStatistics': {
        const contracts = (result as { contracts: { total: number } }).contracts
        const correspondence = (result as { correspondence: { total: number } }).correspondence
        return `Here are the current SGC Portal statistics: ${contracts.total} total contracts and ${correspondence.total} total correspondence items.`
      }
      
      case 'getMDAList': {
        const mdaResult = result as { total: number }
        return `There are ${mdaResult.total} Ministries, Departments, and Agencies (MDAs) registered in the system.`
      }
    }
  }
  
  // Default response with guidance
  return "I understand you're looking for information. Could you please be more specific? For example:\n\n• 'Generate a contracts report for this week'\n• 'Show me pending correspondence from Ministry of Finance'\n• 'What are the current statistics?'\n• 'List all approved contracts this month'"
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    // Parse the user's query
    const query = parseQuery(message)
    
    // Generate report/data if applicable
    const toolResult = generateReport(query)
    
    // Generate natural language response
    const responseText = generateResponseText(message, query, toolResult)
    
    return NextResponse.json({
      response: responseText,
      toolResult: toolResult
    })
  } catch (error) {
    console.error('Rex API error:', error)
    return NextResponse.json({ 
      response: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
      toolResult: null
    }, { status: 500 })
  }
}
