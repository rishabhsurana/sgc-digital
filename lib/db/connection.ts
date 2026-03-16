/**
 * Database Connection Layer
 * 
 * This module provides a database abstraction layer that:
 * - Uses mock data in development/v0 preview (when MSSQL is not available)
 * - Uses actual MSSQL connection in production/on-premise deployment
 * 
 * To enable MSSQL:
 * 1. Install mssql package: npm install mssql @types/mssql
 * 2. Set USE_MSSQL=true in environment
 * 3. Configure MSSQL_* environment variables
 */

// Check if we should use real MSSQL connection
const USE_MSSQL = process.env.USE_MSSQL === 'true'

// Mock result interface matching mssql
export interface IResult<T> {
  recordsets: T[][]
  recordset: T[]
  output: Record<string, unknown>
  rowsAffected: number[]
}

export interface IRecordSet<T> extends Array<T> {
  columns: Record<string, unknown>
}

/**
 * Mock query function for development
 */
export async function query<T = unknown>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<IResult<T>> {
  if (USE_MSSQL) {
    // Dynamic import to avoid build errors when mssql is not installed
    const { query: mssqlQuery } = await import('./mssql-connection')
    return mssqlQuery<T>(queryText, params)
  }

  // Return empty result for mock mode
  console.log('[DB Mock] Query:', queryText.substring(0, 100), params)
  return {
    recordsets: [[]],
    recordset: [],
    output: {},
    rowsAffected: [0],
  }
}

/**
 * Execute a stored procedure
 */
export async function executeProcedure<T = unknown>(
  procedureName: string,
  params?: Record<string, unknown>
): Promise<IResult<T>> {
  if (USE_MSSQL) {
    const { executeProcedure: mssqlExecute } = await import('./mssql-connection')
    return mssqlExecute<T>(procedureName, params)
  }

  console.log('[DB Mock] Procedure:', procedureName, params)
  return {
    recordsets: [[]],
    recordset: [],
    output: {},
    rowsAffected: [0],
  }
}

/**
 * Get database connection status
 */
export async function getConnectionStatus(): Promise<{ connected: boolean; mode: string }> {
  return {
    connected: true,
    mode: USE_MSSQL ? 'mssql' : 'mock',
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  if (USE_MSSQL) {
    const { closeConnection: mssqlClose } = await import('./mssql-connection')
    await mssqlClose()
  }
}

/**
 * Transaction wrapper
 */
export async function withTransaction<T>(
  callback: (tx: { query: typeof query }) => Promise<T>
): Promise<T> {
  // In mock mode, just execute the callback
  if (!USE_MSSQL) {
    return callback({ query })
  }

  const { withTransaction: mssqlWithTransaction } = await import('./mssql-connection')
  return mssqlWithTransaction(callback)
}
