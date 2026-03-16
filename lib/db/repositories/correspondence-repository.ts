import { BaseRepository, PaginatedResult, PaginationOptions, SortOptions } from './base-repository'
import { query } from '../connection'
import type { 
  Correspondence, 
  CorrespondenceStatus, 
  CorrespondenceWorkflowStage,
  UrgencyLevel 
} from '@/lib/types/database'

export interface CorrespondenceFilters {
  status?: CorrespondenceStatus | CorrespondenceStatus[]
  workflow_stage?: CorrespondenceWorkflowStage | CorrespondenceWorkflowStage[]
  type_id?: string
  organization_id?: string
  assigned_officer_id?: string
  assigned_clerk_id?: string
  submitter_id?: string
  urgency_level?: UrgencyLevel
  is_confidential?: boolean
  date_from?: Date
  date_to?: Date
  search?: string
}

export interface CorrespondenceWithDetails extends Correspondence {
  type_name?: string
  type_code?: string
  organization_name?: string
  submitter_name?: string
  assigned_officer_name?: string
  assigned_clerk_name?: string
}

export class CorrespondenceRepository extends BaseRepository<Correspondence> {
  protected tableName = 'correspondence'
  protected primaryKey = 'id'

  /**
   * Find correspondence by reference number
   */
  async findByReferenceNumber(referenceNumber: string): Promise<Correspondence | null> {
    const result = await this.executeQuery<Correspondence>(
      `SELECT * FROM correspondence WHERE reference_number = @referenceNumber AND deleted_at IS NULL`,
      { referenceNumber }
    )
    return result.recordset[0] || null
  }

  /**
   * Get correspondence with full details (joins)
   */
  async findByIdWithDetails(id: string): Promise<CorrespondenceWithDetails | null> {
    const result = await this.executeQuery<CorrespondenceWithDetails>(`
      SELECT 
        c.*,
        ct.name as type_name,
        ct.code as type_code,
        o.name as organization_name,
        CONCAT(pu.first_name, ' ', pu.last_name) as submitter_name,
        CONCAT(ao.first_name, ' ', ao.last_name) as assigned_officer_name,
        CONCAT(ac.first_name, ' ', ac.last_name) as assigned_clerk_name
      FROM correspondence c
      LEFT JOIN correspondence_types ct ON c.type_id = ct.id
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN public_users pu ON c.submitter_id = pu.id
      LEFT JOIN staff_users ao ON c.assigned_officer_id = ao.id
      LEFT JOIN staff_users ac ON c.assigned_clerk_id = ac.id
      WHERE c.id = @id AND c.deleted_at IS NULL
    `, { id })
    return result.recordset[0] || null
  }

  /**
   * Search and filter correspondence with pagination
   */
  async search(
    filters: CorrespondenceFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<PaginatedResult<CorrespondenceWithDetails>> {
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

    if (filters.submitter_id) {
      conditions.push('c.submitter_id = @submitter_id')
      params.submitter_id = filters.submitter_id
    }

    if (filters.urgency_level) {
      conditions.push('c.urgency_level = @urgency_level')
      params.urgency_level = filters.urgency_level
    }

    if (filters.is_confidential !== undefined) {
      conditions.push('c.is_confidential = @is_confidential')
      params.is_confidential = filters.is_confidential
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
      conditions.push('(c.reference_number LIKE @search OR c.subject LIKE @search)')
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
      FROM correspondence c
      WHERE ${whereClause}
    `, params)
    const totalCount = countResult.recordset[0]?.count || 0

    // Get paginated data with details
    const dataResult = await this.executeQuery<CorrespondenceWithDetails>(`
      SELECT 
        c.*,
        ct.name as type_name,
        ct.code as type_code,
        o.name as organization_name,
        CONCAT(pu.first_name, ' ', pu.last_name) as submitter_name,
        CONCAT(ao.first_name, ' ', ao.last_name) as assigned_officer_name,
        CONCAT(ac.first_name, ' ', ac.last_name) as assigned_clerk_name
      FROM correspondence c
      LEFT JOIN correspondence_types ct ON c.type_id = ct.id
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN public_users pu ON c.submitter_id = pu.id
      LEFT JOIN staff_users ao ON c.assigned_officer_id = ao.id
      LEFT JOIN staff_users ac ON c.assigned_clerk_id = ac.id
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
  async getStatusCounts(filters?: Pick<CorrespondenceFilters, 'organization_id' | 'assigned_officer_id'>): Promise<Record<string, number>> {
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
      FROM correspondence
      WHERE ${conditions.join(' AND ')}
      GROUP BY status
    `, params)

    return result.recordset.reduce((acc, row) => {
      acc[row.status] = row.count
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Get correspondence for Daily Mail Dashboard (SG/DSG review)
   */
  async getDailyMailItems(date?: Date): Promise<CorrespondenceWithDetails[]> {
    const targetDate = date || new Date()
    
    const result = await this.executeQuery<CorrespondenceWithDetails>(`
      SELECT 
        c.*,
        ct.name as type_name,
        ct.code as type_code,
        o.name as organization_name,
        CONCAT(pu.first_name, ' ', pu.last_name) as submitter_name
      FROM correspondence c
      LEFT JOIN correspondence_types ct ON c.type_id = ct.id
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN public_users pu ON c.submitter_id = pu.id
      WHERE c.workflow_stage = 'SG_DSG_REVIEW'
        AND c.status = 'PENDING_REVIEW'
        AND c.deleted_at IS NULL
        AND CAST(c.date_received as DATE) <= CAST(@targetDate as DATE)
      ORDER BY 
        CASE c.urgency_level 
          WHEN 'critical' THEN 1 
          WHEN 'urgent' THEN 2 
          ELSE 3 
        END,
        c.date_received ASC
    `, { targetDate })

    return result.recordset
  }

  /**
   * Update workflow stage and status
   */
  async updateWorkflowState(
    id: string,
    stage: CorrespondenceWorkflowStage,
    status: CorrespondenceStatus,
    additionalData?: Partial<Correspondence>
  ): Promise<Correspondence> {
    return this.update(id, {
      workflow_stage: stage,
      status,
      ...additionalData,
    })
  }

  /**
   * Assign officer to correspondence
   */
  async assignOfficer(
    id: string,
    officerId: string,
    directive?: string
  ): Promise<Correspondence> {
    return this.update(id, {
      assigned_officer_id: officerId,
      date_assigned: new Date(),
      status: 'ASSIGNED' as CorrespondenceStatus,
      workflow_stage: 'PROCESSING' as CorrespondenceWorkflowStage,
      dsg_directive: directive,
    })
  }

  /**
   * Generate next reference number
   */
  async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    
    const result = await this.executeQuery<{ max_num: number }>(`
      SELECT ISNULL(MAX(CAST(SUBSTRING(reference_number, 10, 5) as INT)), 0) + 1 as max_num
      FROM correspondence
      WHERE reference_number LIKE @pattern
    `, { pattern: `REG-${year}-%` })

    const nextNum = result.recordset[0]?.max_num || 1
    return `REG-${year}-${nextNum.toString().padStart(5, '0')}`
  }
}

// Export singleton instance
export const correspondenceRepository = new CorrespondenceRepository()
