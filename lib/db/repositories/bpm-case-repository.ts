import { BaseRepository, PaginatedResult, PaginationOptions, SortOptions } from './base-repository'
import type { 
  BPMCase, 
  BPMTask, 
  BPMActivity,
  CaseStatus, 
  Priority,
  SLAStatus,
  TaskStatus
} from '@/lib/types/database'

export interface CaseFilters {
  entity_type?: 'correspondence' | 'contract'
  case_status?: CaseStatus | CaseStatus[]
  current_stage_code?: string | string[]
  current_owner_id?: string
  current_in_basket?: string
  priority?: Priority | Priority[]
  sla_status?: SLAStatus | SLAStatus[]
  date_from?: Date
  date_to?: Date
  search?: string
}

export interface CaseWithDetails extends BPMCase {
  owner_name?: string
  stage_name?: string
  entity_reference?: string
  entity_subject?: string
  organization_name?: string
}

export class BPMCaseRepository extends BaseRepository<BPMCase> {
  protected tableName = 'bpm_cases'
  protected primaryKey = 'id'

  /**
   * Find case by case number
   */
  async findByCaseNumber(caseNumber: string): Promise<BPMCase | null> {
    const result = await this.executeQuery<BPMCase>(
      `SELECT * FROM bpm_cases WHERE case_number = @caseNumber`,
      { caseNumber }
    )
    return result.recordset[0] || null
  }

  /**
   * Find case by entity
   */
  async findByEntity(entityType: 'correspondence' | 'contract', entityId: string): Promise<BPMCase | null> {
    const result = await this.executeQuery<BPMCase>(
      `SELECT * FROM bpm_cases WHERE entity_type = @entityType AND entity_id = @entityId`,
      { entityType, entityId }
    )
    return result.recordset[0] || null
  }

  /**
   * Get case with full details
   */
  async findByIdWithDetails(id: string): Promise<CaseWithDetails | null> {
    const result = await this.executeQuery<CaseWithDetails>(`
      SELECT 
        bc.*,
        CONCAT(su.first_name, ' ', su.last_name) as owner_name,
        ws.name as stage_name,
        CASE 
          WHEN bc.entity_type = 'correspondence' THEN cor.reference_number
          WHEN bc.entity_type = 'contract' THEN con.reference_number
        END as entity_reference,
        CASE 
          WHEN bc.entity_type = 'correspondence' THEN cor.subject
          WHEN bc.entity_type = 'contract' THEN con.title
        END as entity_subject,
        CASE 
          WHEN bc.entity_type = 'correspondence' THEN corg.name
          WHEN bc.entity_type = 'contract' THEN conorg.name
        END as organization_name
      FROM bpm_cases bc
      LEFT JOIN staff_users su ON bc.current_owner_id = su.id
      LEFT JOIN bpm_workflow_stages ws ON bc.current_stage_id = ws.id
      LEFT JOIN correspondence cor ON bc.entity_type = 'correspondence' AND bc.entity_id = cor.id
      LEFT JOIN contracts con ON bc.entity_type = 'contract' AND bc.entity_id = con.id
      LEFT JOIN organizations corg ON cor.organization_id = corg.id
      LEFT JOIN organizations conorg ON con.organization_id = conorg.id
      WHERE bc.id = @id
    `, { id })
    return result.recordset[0] || null
  }

  /**
   * Search and filter cases with pagination
   */
  async search(
    filters: CaseFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<PaginatedResult<CaseWithDetails>> {
    const conditions: string[] = ['1=1']
    const params: Record<string, unknown> = {}

    if (filters.entity_type) {
      conditions.push('bc.entity_type = @entity_type')
      params.entity_type = filters.entity_type
    }

    if (filters.case_status) {
      if (Array.isArray(filters.case_status)) {
        conditions.push(`bc.case_status IN (${filters.case_status.map((_, i) => `@status${i}`).join(', ')})`)
        filters.case_status.forEach((s, i) => params[`status${i}`] = s)
      } else {
        conditions.push('bc.case_status = @case_status')
        params.case_status = filters.case_status
      }
    }

    if (filters.current_stage_code) {
      if (Array.isArray(filters.current_stage_code)) {
        conditions.push(`bc.current_stage_code IN (${filters.current_stage_code.map((_, i) => `@stage${i}`).join(', ')})`)
        filters.current_stage_code.forEach((s, i) => params[`stage${i}`] = s)
      } else {
        conditions.push('bc.current_stage_code = @current_stage_code')
        params.current_stage_code = filters.current_stage_code
      }
    }

    if (filters.current_owner_id) {
      conditions.push('bc.current_owner_id = @current_owner_id')
      params.current_owner_id = filters.current_owner_id
    }

    if (filters.current_in_basket) {
      conditions.push('bc.current_in_basket = @current_in_basket')
      params.current_in_basket = filters.current_in_basket
    }

    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        conditions.push(`bc.priority IN (${filters.priority.map((_, i) => `@priority${i}`).join(', ')})`)
        filters.priority.forEach((p, i) => params[`priority${i}`] = p)
      } else {
        conditions.push('bc.priority = @priority')
        params.priority = filters.priority
      }
    }

    if (filters.sla_status) {
      if (Array.isArray(filters.sla_status)) {
        conditions.push(`bc.sla_status IN (${filters.sla_status.map((_, i) => `@sla${i}`).join(', ')})`)
        filters.sla_status.forEach((s, i) => params[`sla${i}`] = s)
      } else {
        conditions.push('bc.sla_status = @sla_status')
        params.sla_status = filters.sla_status
      }
    }

    if (filters.date_from) {
      conditions.push('bc.opened_at >= @date_from')
      params.date_from = filters.date_from
    }

    if (filters.date_to) {
      conditions.push('bc.opened_at <= @date_to')
      params.date_to = filters.date_to
    }

    if (filters.search) {
      conditions.push(`(bc.case_number LIKE @search 
        OR (bc.entity_type = 'correspondence' AND EXISTS (
          SELECT 1 FROM correspondence c WHERE c.id = bc.entity_id AND (c.reference_number LIKE @search OR c.subject LIKE @search)
        ))
        OR (bc.entity_type = 'contract' AND EXISTS (
          SELECT 1 FROM contracts c WHERE c.id = bc.entity_id AND (c.reference_number LIKE @search OR c.title LIKE @search)
        ))
      )`)
      params.search = `%${filters.search}%`
    }

    const whereClause = conditions.join(' AND ')
    const page = pagination?.page || 1
    const pageSize = pagination?.pageSize || 20
    const offset = (page - 1) * pageSize
    const sortField = sort?.field || 'bc.created_at'
    const sortDirection = sort?.direction || 'DESC'

    // Get total count
    const countResult = await this.executeQuery<{ count: number }>(`
      SELECT COUNT(*) as count FROM bpm_cases bc WHERE ${whereClause}
    `, params)
    const totalCount = countResult.recordset[0]?.count || 0

    // Get paginated data with details
    const dataResult = await this.executeQuery<CaseWithDetails>(`
      SELECT 
        bc.*,
        CONCAT(su.first_name, ' ', su.last_name) as owner_name,
        ws.name as stage_name,
        CASE 
          WHEN bc.entity_type = 'correspondence' THEN cor.reference_number
          WHEN bc.entity_type = 'contract' THEN con.reference_number
        END as entity_reference,
        CASE 
          WHEN bc.entity_type = 'correspondence' THEN cor.subject
          WHEN bc.entity_type = 'contract' THEN con.title
        END as entity_subject,
        CASE 
          WHEN bc.entity_type = 'correspondence' THEN corg.name
          WHEN bc.entity_type = 'contract' THEN conorg.name
        END as organization_name
      FROM bpm_cases bc
      LEFT JOIN staff_users su ON bc.current_owner_id = su.id
      LEFT JOIN bpm_workflow_stages ws ON bc.current_stage_id = ws.id
      LEFT JOIN correspondence cor ON bc.entity_type = 'correspondence' AND bc.entity_id = cor.id
      LEFT JOIN contracts con ON bc.entity_type = 'contract' AND bc.entity_id = con.id
      LEFT JOIN organizations corg ON cor.organization_id = corg.id
      LEFT JOIN organizations conorg ON con.organization_id = conorg.id
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
   * Get cases by in-basket (work queue)
   */
  async getByInBasket(
    inBasket: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<CaseWithDetails>> {
    return this.search({ current_in_basket: inBasket }, pagination, { field: 'bc.sla_due_date', direction: 'ASC' })
  }

  /**
   * Get case counts by in-basket
   */
  async getInBasketCounts(entityType?: 'correspondence' | 'contract'): Promise<Record<string, number>> {
    const conditions: string[] = ["case_status NOT IN ('COMPLETED', 'CANCELLED')"]
    const params: Record<string, unknown> = {}

    if (entityType) {
      conditions.push('entity_type = @entityType')
      params.entityType = entityType
    }

    const result = await this.executeQuery<{ in_basket: string; count: number }>(`
      SELECT current_in_basket as in_basket, COUNT(*) as count
      FROM bpm_cases
      WHERE ${conditions.join(' AND ')} AND current_in_basket IS NOT NULL
      GROUP BY current_in_basket
    `, params)

    return result.recordset.reduce((acc, row) => {
      acc[row.in_basket] = row.count
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Get SLA metrics
   */
  async getSLAMetrics(entityType?: 'correspondence' | 'contract'): Promise<{
    on_track: number
    at_risk: number
    breached: number
    total_open: number
  }> {
    const conditions: string[] = ["case_status NOT IN ('COMPLETED', 'CANCELLED')"]
    const params: Record<string, unknown> = {}

    if (entityType) {
      conditions.push('entity_type = @entityType')
      params.entityType = entityType
    }

    const result = await this.executeQuery<{ sla_status: string; count: number }>(`
      SELECT sla_status, COUNT(*) as count
      FROM bpm_cases
      WHERE ${conditions.join(' AND ')}
      GROUP BY sla_status
    `, params)

    const metrics = { on_track: 0, at_risk: 0, breached: 0, total_open: 0 }
    result.recordset.forEach(row => {
      if (row.sla_status === 'on_track') metrics.on_track = row.count
      else if (row.sla_status === 'at_risk') metrics.at_risk = row.count
      else if (row.sla_status === 'breached') metrics.breached = row.count
      metrics.total_open += row.count
    })

    return metrics
  }

  /**
   * Update case stage
   */
  async updateStage(
    id: string,
    stageCode: string,
    stageId: string,
    inBasket?: string,
    ownerId?: string
  ): Promise<BPMCase> {
    return this.update(id, {
      current_stage_code: stageCode,
      current_stage_id: stageId,
      current_in_basket: inBasket,
      current_owner_id: ownerId,
      case_status: 'IN_PROGRESS' as CaseStatus,
    })
  }

  /**
   * Assign case to owner
   */
  async assignOwner(id: string, ownerId: string, inBasket?: string): Promise<BPMCase> {
    const updateData: Partial<BPMCase> = {
      current_owner_id: ownerId,
      case_status: 'IN_PROGRESS' as CaseStatus,
    }
    if (!this.findById(id).then(c => c?.first_response_at)) {
      updateData.first_response_at = new Date()
    }
    if (inBasket) {
      updateData.current_in_basket = inBasket
    }
    return this.update(id, updateData)
  }

  /**
   * Complete case
   */
  async completeCase(id: string): Promise<BPMCase> {
    return this.update(id, {
      case_status: 'COMPLETED' as CaseStatus,
      completed_at: new Date(),
    })
  }

  async createCase(data: any): Promise<BPMCase> {
    const referenceNumber = data.referenceNumber || await this.generateCaseNumber()
    return this.create({
      entity_type: data.caseType,
      entity_id: data.entityId,
      case_number: referenceNumber,
      current_stage_code: data.currentStage,
      case_status: 'IN_PROGRESS' as CaseStatus,
      priority: data.priority,
      opened_at: new Date(),
    } as any)
  }

  async findByEntityId(entityType: string, entityId: string): Promise<BPMCase | null> {
    return this.findByEntity(entityType as 'correspondence' | 'contract', entityId)
  }

  async addActivity(data: any): Promise<void> {
    await bpmActivityRepository.addActivity(
      data.caseId, data.activityType, data.description || data.activityType, 
      data.performedById, data.performedByType, { metadata: data.metadata }
    )
  }

  async createTask(data: any): Promise<void> {
    await bpmTaskRepository.create({
      case_id: data.caseId,
      task_type: data.taskType,
      title: data.title,
      description: data.description,
      assigned_to_role: data.assignedToRole,
      assigned_to_id: data.assignedToId,
      priority: data.priority,
      due_date: data.dueDate,
      status: 'pending' as TaskStatus
    } as any)
  }

  async findTaskByType(caseId: string, taskType: string): Promise<BPMTask | null> {
    const tasks = await bpmTaskRepository.findByCaseId(caseId)
    return tasks.find(t => t.task_type === taskType && t.status !== 'completed') || null
  }

  async completeTask(taskId: string, completedById: string): Promise<void> {
    await bpmTaskRepository.completeTask(taskId, completedById, 'Completed')
  }

  async getActivities(caseId: string): Promise<BPMActivity[]> {
    return bpmActivityRepository.findByCaseId(caseId)
  }

  async getTasks(caseId: string): Promise<BPMTask[]> {
    return bpmTaskRepository.findByCaseId(caseId)
  }

  async getWorkflowHistory(caseId: string): Promise<any[]> {
    return []
  }

  /**
   * Generate next case number
   */
  async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear()
    
    const result = await this.executeQuery<{ max_num: number }>(`
      SELECT ISNULL(MAX(CAST(SUBSTRING(case_number, 10, 5) as INT)), 0) + 1 as max_num
      FROM bpm_cases
      WHERE case_number LIKE @pattern
    `, { pattern: `BPM-${year}-%` })

    const nextNum = result.recordset[0]?.max_num || 1
    return `BPM-${year}-${nextNum.toString().padStart(5, '0')}`
  }
}

// BPM Tasks Repository
export class BPMTaskRepository extends BaseRepository<BPMTask> {
  protected tableName = 'bpm_tasks'
  protected primaryKey = 'id'

  async findByCaseId(caseId: string): Promise<BPMTask[]> {
    const result = await this.executeQuery<BPMTask>(
      `SELECT * FROM bpm_tasks WHERE case_id = @caseId ORDER BY created_at DESC`,
      { caseId }
    )
    return result.recordset
  }

  async findPendingByUserId(userId: string): Promise<BPMTask[]> {
    const result = await this.executeQuery<BPMTask>(
      `SELECT * FROM bpm_tasks WHERE assigned_to_id = @userId AND status IN ('pending', 'in_progress') ORDER BY due_date ASC`,
      { userId }
    )
    return result.recordset
  }

  async findByInBasket(inBasket: string): Promise<BPMTask[]> {
    const result = await this.executeQuery<BPMTask>(
      `SELECT * FROM bpm_tasks WHERE in_basket = @inBasket AND status = 'pending' ORDER BY due_date ASC`,
      { inBasket }
    )
    return result.recordset
  }

  async completeTask(id: string, completedById: string, outcome: string, notes?: string): Promise<BPMTask> {
    return this.update(id, {
      status: 'completed' as TaskStatus,
      completed_by_id: completedById,
      completed_at: new Date(),
      outcome,
      outcome_notes: notes,
    })
  }
}

// BPM Activities Repository
export class BPMActivityRepository extends BaseRepository<BPMActivity> {
  protected tableName = 'bpm_activities'
  protected primaryKey = 'id'

  async findByCaseId(caseId: string, includeInternal: boolean = true): Promise<BPMActivity[]> {
    const conditions = ['case_id = @caseId']
    if (!includeInternal) {
      conditions.push('is_internal = 0')
    }

    const result = await this.executeQuery<BPMActivity>(
      `SELECT * FROM bpm_activities WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      { caseId }
    )
    return result.recordset
  }

  async addActivity(
    caseId: string,
    activityType: string,
    title: string,
    performedById: string,
    performedByType: 'staff' | 'public' | 'system',
    options?: {
      description?: string
      isInternal?: boolean
      metadata?: Record<string, unknown>
    }
  ): Promise<BPMActivity> {
    return this.create({
      case_id: caseId,
      activity_type: activityType,
      title,
      description: options?.description,
      performed_by_id: performedById,
      performed_by_type: performedByType,
      is_internal: options?.isInternal ?? true,
      is_system_generated: performedByType === 'system',
      metadata: options?.metadata ? JSON.stringify(options.metadata) : null,
    } as Partial<BPMActivity>)
  }
}

// Export singleton instances
export const bpmCaseRepository = new BPMCaseRepository()
export const bpmTaskRepository = new BPMTaskRepository()
export const bpmActivityRepository = new BPMActivityRepository()
