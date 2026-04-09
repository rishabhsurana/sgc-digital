import { query, sql, withTransaction } from '../connection'
import type { IResult } from 'mssql'
import { generateUUID } from '../../uuid'

export interface PaginationOptions {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface SortOptions {
  field: string
  direction: 'ASC' | 'DESC'
}

export abstract class BaseRepository<T> {
  protected abstract tableName: string
  protected abstract primaryKey: string

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    const result = await query<T>(
      `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = @id`,
      { id }
    )
    return result.recordset[0] || null
  }

  /**
   * Find all records
   */
  async findAll(options?: {
    pagination?: PaginationOptions
    sort?: SortOptions
    where?: string
    params?: Record<string, unknown>
  }): Promise<PaginatedResult<T>> {
    const page = options?.pagination?.page || 1
    const pageSize = options?.pagination?.pageSize || 20
    const offset = (page - 1) * pageSize
    const sortField = options?.sort?.field || this.primaryKey
    const sortDirection = options?.sort?.direction || 'DESC'
    const whereClause = options?.where || '1=1'
    const params = options?.params || {}

    // Get total count
    const countResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${whereClause}`,
      params
    )
    const totalCount = countResult.recordset[0]?.count || 0

    // Get paginated data
    const dataResult = await query<T>(
      `SELECT * FROM ${this.tableName} 
       WHERE ${whereClause}
       ORDER BY ${sortField} ${sortDirection}
       OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
      { ...params, offset, pageSize }
    )

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
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const id = this.generateId()
    const dataWithId = { ...data, id }
    
    const columns = Object.keys(dataWithId)
    const values = columns.map((col) => `@${col}`).join(', ')
    const columnNames = columns.join(', ')

    await query(
      `INSERT INTO ${this.tableName} (${columnNames}) VALUES (${values})`,
      dataWithId as Record<string, unknown>
    )

    const created = await this.findById(id)
    if (!created) {
      throw new Error(`Failed to create record in ${this.tableName}`)
    }
    return created
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const updateData = { ...data, updated_at: new Date() }
    delete (updateData as Record<string, unknown>).id
    delete (updateData as Record<string, unknown>).created_at

    const setClauses = Object.keys(updateData)
      .map((col) => `${col} = @${col}`)
      .join(', ')

    await query(
      `UPDATE ${this.tableName} SET ${setClauses} WHERE ${this.primaryKey} = @id`,
      { ...updateData, id } as Record<string, unknown>
    )

    const updated = await this.findById(id)
    if (!updated) {
      throw new Error(`Record not found in ${this.tableName}`)
    }
    return updated
  }

  /**
   * Soft delete a record
   */
  async softDelete(id: string): Promise<void> {
    await query(
      `UPDATE ${this.tableName} SET deleted_at = @deletedAt WHERE ${this.primaryKey} = @id`,
      { id, deletedAt: new Date() }
    )
  }

  /**
   * Hard delete a record
   */
  async delete(id: string): Promise<void> {
    await query(
      `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = @id`,
      { id }
    )
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    const result = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${this.primaryKey} = @id`,
      { id }
    )
    return (result.recordset[0]?.count || 0) > 0
  }

  /**
   * Execute a custom query
   */
  protected async executeQuery<R = T>(
    queryText: string,
    params?: Record<string, unknown>
  ): Promise<IResult<R>> {
    return query<R>(queryText, params)
  }

  /**
   * Execute within a transaction
   */
  protected async withTransaction<R>(
    callback: (transaction: sql.Transaction) => Promise<R>
  ): Promise<R> {
    return withTransaction(callback)
  }

  /**
   * Generate a new UUID
   */
  protected generateId(): string {
    return generateUUID()
  }
}
