import { BaseRepository, PaginatedResult, PaginationOptions, SortOptions } from './base-repository'
import type { 
  Contract, 
  ContractStatus, 
  ContractWorkflowStage,
  ProcurementMethod 
} from '@/lib/types/database'

export interface ContractFilters {
  status?: ContractStatus | ContractStatus[]
  workflow_stage?: ContractWorkflowStage | ContractWorkflowStage[]
  type_id?: string
  organization_id?: string
  assigned_officer_id?: string
  assigned_clerk_id?: string
  supervisor_id?: string
  submitter_id?: string
  procurement_method?: ProcurementMethod
  value_min?: number
  value_max?: number
  date_from?: Date
  date_to?: Date
  search?: string
}

export interface ContractWithDetails extends Contract {
  type_name?: string
  type_code?: string
  organization_name?: string
  submitter_name?: string
  assigned_officer_name?: string
  assigned_clerk_name?: string
  supervisor_name?: string
}

export class ContractsRepository extends BaseRepository<Contract> {
  protected tableName = 'contracts'
  protected primaryKey = 'id'

  /**
   * Find contract by reference number
   */
  async findByReferenceNumber(referenceNumber: string): Promise<Contract | null> {
    const result = await this.executeQuery<Contract>(
      `SELECT * FROM contracts WHERE reference_number = @referenceNumber AND deleted_at IS NULL`,
      { referenceNumber }
    )
    return result.recordset[0] || null
  }

  /**
   * Get contract with full details (joins)
   */
  async findByIdWithDetails(id: string): Promise<ContractWithDetails | null> {
    const result = await this.executeQuery<ContractWithDetails>(`
      SELECT 
        c.*,
        ct.name as type_name,
        ct.code as type_code,
        o.name as organization_name,
        CONCAT(pu.first_name, ' ', pu.last_name) as submitter_name,
        CONCAT(ao.first_name, ' ', ao.last_name) as assigned_officer_name,
        CONCAT(ac.first_name, ' ', ac.last_name) as assigned_clerk_name,
        CONCAT(sup.first_name, ' ', sup.last_name) as supervisor_name
      FROM contracts c
      LEFT JOIN contract_types ct ON c.type_id = ct.id
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN public_users pu ON c.submitter_id = pu.id
      LEFT JOIN staff_users ao ON c.assigned_officer_id = ao.id
      LEFT JOIN staff_users ac ON c.assigned_clerk_id = ac.id
      LEFT JOIN staff_users sup ON c.supervisor_id = sup.id
      WHERE c.id = @id AND c.deleted_at IS NULL
    `, { id })
    return result.recordset[0] || null
  }

  /**
   * Search and filter contracts with pagination
   */
  async search(
    filters: ContractFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<PaginatedResult<ContractWithDetails>> {
    const conditions: string[] = ['c.deleted_at IS NULL']
    const params: Record<string, unknown> = {}

    // Build filter conditions
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`c.status IN (${filters.status.map((_, i) => `@status${i}`).join(', ')})`)
        filters.status.forEach((s, i) => params[`status${i}`] = s)
      } else {
        conditions.push('c.status = @status')
        params.status = filters.status
      }
    }

    if (filters.workflow_stage) {
      if (Array.isArray(filters.workflow_stage)) {
        conditions.push(`c.workflow_stage IN (${filters.workflow_stage.map((_, i) => `@stage${i}`).join(', ')})`)
        filters.workflow_stage.forEach((s, i) => params[`stage${i}`] = s)
      } else {
        conditions.push('c.workflow_stage = @workflow_stage')
        params.workflow_stage = filters.workflow_stage
      }
    }

    if (filters.type_id) {
      conditions.push('c.type_id = @type_id')
      params.type_id = filters.type_id
    }

    if (filters.organization_id) {
      conditions.push('c.organization_id = @organization_id')
      params.organization_id = filters.organization_id
    }

    if (filters.assigned_officer_id) {
      conditions.push('c.assigned_officer_id = @assigned_officer_id')
      params.assigned_officer_id = filters.assigned_officer_id
    }

    if (filters.assigned_clerk_id) {
      conditions.push('c.assigned_clerk_id = @assigned_clerk_id')
      params.assigned_clerk_id = filters.assigned_clerk_id
    }

    if (filters.supervisor_id) {
      conditions.push('c.supervisor_id = @supervisor_id')
      params.supervisor_id = filters.supervisor_id
    }

    if (filters.submitter_id) {
      conditions.push('c.submitter_id = @submitter_id')
      params.submitter_id = filters.submitter_id
    }

    if (filters.procurement_method) {
      conditions.push('c.procurement_method = @procurement_method')
      params.procurement_method = filters.procurement_method
    }

    if (filters.value_min !== undefined) {
      conditions.push('c.contract_value >= @value_min')
      params.value_min = filters.value_min
    }

    if (filters.value_max !== undefined) {
      conditions.push('c.contract_value <= @value_max')
      params.value_max = filters.value_max
    }

    if (filters.date_from) {
      conditions.push('c.date_submitted >= @date_from')
      params.date_from = filters.date_from
    }

    if (filters.date_to) {
      conditions.push('c.date_submitted <= @date_to')
      params.date_to = filters.date_to
    }

    if (filters.search) {
      conditions.push('(c.reference_number LIKE @search OR c.title LIKE @search OR c.counterparty_name LIKE @search)')
      params.search = `%${filters.search}%`
    }

    const whereClause = conditions.join(' AND ')
    const page = pagination?.page || 1
    const pageSize = pagination?.pageSize || 20
    const offset = (page - 1) * pageSize
    const sortField = sort?.field || 'c.created_at'
    const sortDirection = sort?.direction || 'DESC'

    // Get total count
    const countResult = await this.executeQuery<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM contracts c
      WHERE ${whereClause}
    `, params)
    const totalCount = countResult.recordset[0]?.count || 0

    // Get paginated data with details
    const dataResult = await this.executeQuery<ContractWithDetails>(`
      SELECT 
        c.*,
        ct.name as type_name,
        ct.code as type_code,
        o.name as organization_name,
        CONCAT(pu.first_name, ' ', pu.last_name) as submitter_name,
        CONCAT(ao.first_name, ' ', ao.last_name) as assigned_officer_name,
        CONCAT(ac.first_name, ' ', ac.last_name) as assigned_clerk_name,
        CONCAT(sup.first_name, ' ', sup.last_name) as supervisor_name
      FROM contracts c
      LEFT JOIN contract_types ct ON c.type_id = ct.id
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN public_users pu ON c.submitter_id = pu.id
      LEFT JOIN staff_users ao ON c.assigned_officer_id = ao.id
      LEFT JOIN staff_users ac ON c.assigned_clerk_id = ac.id
      LEFT JOIN staff_users sup ON c.supervisor_id = sup.id
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `, { ...params, offset, pageSize })

    const totalPages = Math.ceil(totalCount / pageSize)

    return {
      data: dataResult.recordset,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  }

  /**
   * Get counts by status for dashboard
   */
  async getStatusCounts(filters?: Pick<ContractFilters, 'organization_id' | 'assigned_officer_id'>): Promise<Record<string, number>> {
    const conditions: string[] = ['deleted_at IS NULL']
    const params: Record<string, unknown> = {}

    if (filters?.organization_id) {
      conditions.push('organization_id = @organization_id')
      params.organization_id = filters.organization_id
    }

    if (filters?.assigned_officer_id) {
      conditions.push('assigned_officer_id = @assigned_officer_id')
      params.assigned_officer_id = filters.assigned_officer_id
    }

    const result = await this.executeQuery<{ status: string; count: number }>(`
      SELECT status, COUNT(*) as count
      FROM contracts
      WHERE ${conditions.join(' AND ')}
      GROUP BY status
    `, params)

    return result.recordset.reduce((acc, row) => {
      acc[row.status] = row.count
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Get contracts by workflow stage for in-basket
   */
  async getByInBasket(
    inBasket: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<ContractWithDetails>> {
    const stageMapping: Record<string, ContractStatus[]> = {
      'contracts_intake': ['INTAKE'],
      'contracts_drafting': ['DRAFTING'],
      'contracts_awaiting_approval': ['SUP_REVIEW'],
      'contracts_with_ministry': ['SENT_MDA', 'RETURNED_MDA'],
      'contracts_adjudication': ['EXEC_ADJ'],
      'contracts_ready_close': ['ADJ_COMP'],
    }

    const statuses = stageMapping[inBasket] || []
    return this.search({ status: statuses }, pagination)
  }

  /**
   * Get total contract value by status
   */
  async getValueByStatus(): Promise<Record<string, number>> {
    const result = await this.executeQuery<{ status: string; total_value: number }>(`
      SELECT status, SUM(contract_value) as total_value
      FROM contracts
      WHERE deleted_at IS NULL
      GROUP BY status
    `)

    return result.recordset.reduce((acc, row) => {
      acc[row.status] = row.total_value
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Update workflow stage and status
   */
  async updateWorkflowState(
    id: string,
    stage: ContractWorkflowStage,
    status: ContractStatus,
    additionalData?: Partial<Contract>
  ): Promise<Contract> {
    return this.update(id, {
      workflow_stage: stage,
      status,
      ...additionalData,
    })
  }

  /**
   * Assign officer to contract
   */
  async assignOfficer(
    id: string,
    officerId: string,
    supervisorId?: string
  ): Promise<Contract> {
    return this.update(id, {
      assigned_officer_id: officerId,
      supervisor_id: supervisorId,
      date_assigned: new Date(),
      status: 'ASSIGNED' as ContractStatus,
      workflow_stage: 'DRAFT' as ContractWorkflowStage,
    })
  }

  /**
   * Send contract to ministry for review
   */
  async sendToMinistry(id: string): Promise<Contract> {
    return this.update(id, {
      status: 'SENT_MDA' as ContractStatus,
      workflow_stage: 'MIN_REVIEW' as ContractWorkflowStage,
      date_sent_mda: new Date(),
    })
  }

  /**
   * Record ministry return
   */
  async recordMinistryReturn(id: string): Promise<Contract> {
    return this.update(id, {
      status: 'RETURNED_MDA' as ContractStatus,
      date_returned_mda: new Date(),
    })
  }

  /**
   * Generate next reference number
   */
  async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    
    const result = await this.executeQuery<{ max_num: number }>(`
      SELECT ISNULL(MAX(CAST(SUBSTRING(reference_number, 10, 5) as INT)), 0) + 1 as max_num
      FROM contracts
      WHERE reference_number LIKE @pattern
    `, { pattern: `CON-${year}-%` })

    const nextNum = result.recordset[0]?.max_num || 1
    return `CON-${year}-${nextNum.toString().padStart(5, '0')}`
  }
}

// Export singleton instance
export const contractsRepository = new ContractsRepository()
