/**
 * MSSQL Connection Module
 * 
 * This file contains the actual MSSQL connection logic.
 * It is dynamically imported only when USE_MSSQL=true.
 * 
 * To use this in production:
 * 1. npm install mssql @types/mssql
 * 2. Set environment variables:
 *    - USE_MSSQL=true
 *    - MSSQL_SERVER=your-server
 *    - MSSQL_DATABASE=SGCDigital
 *    - MSSQL_USER=your-user
 *    - MSSQL_PASSWORD=your-password
 *    - MSSQL_PORT=1433
 *    - MSSQL_ENCRYPT=true (for Azure SQL)
 *    - MSSQL_TRUST_CERT=false
 */

import type { IResult } from './connection'

// Type definitions for mssql (to avoid import errors when package is not installed)
interface SqlConfig {
  server: string
  database: string
  user: string
  password: string
  port: number
  options: {
    encrypt: boolean
    trustServerCertificate: boolean
    enableArithAbort: boolean
  }
  pool: {
    max: number
    min: number
    idleTimeoutMillis: number
  }
}

// This will be dynamically required only when MSSQL is enabled
let sql: typeof import('mssql') | null = null
let pool: import('mssql').ConnectionPool | null = null

const sqlConfig: SqlConfig = {
  server: process.env.MSSQL_SERVER || 'localhost',
  database: process.env.MSSQL_DATABASE || 'SGCDigital',
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || '',
  port: parseInt(process.env.MSSQL_PORT || '1433', 10),
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.MSSQL_TRUST_CERT !== 'false',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

async function loadMssql() {
  if (!sql) {
    sql = await import('mssql')
  }
  return sql
}

export async function getConnection() {
  const mssql = await loadMssql()

  if (pool && pool.connected) {
    return pool
  }

  try {
    pool = await mssql.connect(sqlConfig)
    console.log('[DB] Connected to SQL Server')
    return pool
  } catch (error) {
    console.error('[DB] Connection failed:', error)
    throw error
  }
}

export async function query<T = unknown>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<IResult<T>> {
  const conn = await getConnection()
  const request = conn.request()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value)
    })
  }

  const result = await request.query<T>(queryText)
  return result as IResult<T>
}

export async function executeProcedure<T = unknown>(
  procedureName: string,
  params?: Record<string, unknown>
): Promise<IResult<T>> {
  const conn = await getConnection()
  const request = conn.request()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value)
    })
  }

  const result = await request.execute<T>(procedureName)
  return result as unknown as IResult<T>
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
    console.log('[DB] Connection closed')
  }
}

export async function withTransaction<T>(
  callback: (tx: { query: typeof query }) => Promise<T>
): Promise<T> {
  const mssql = await loadMssql()
  const conn = await getConnection()
  const transaction = new mssql.Transaction(conn)

  await transaction.begin()

  try {
    const txQuery = async <R = unknown>(
      queryText: string,
      params?: Record<string, unknown>
    ): Promise<IResult<R>> => {
      const request = new mssql.Request(transaction)

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          request.input(key, value)
        })
      }

      const result = await request.query<R>(queryText)
      return result as IResult<R>
    }

    const result = await callback({ query: txQuery })
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
