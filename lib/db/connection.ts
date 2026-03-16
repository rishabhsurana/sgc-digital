import sql from 'mssql'

// SQL Server connection configuration
const sqlConfig: sql.config = {
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

// Singleton connection pool
let pool: sql.ConnectionPool | null = null

/**
 * Get or create a connection pool to the SQL Server database
 */
export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool
  }

  try {
    pool = await sql.connect(sqlConfig)
    console.log('[DB] Connected to SQL Server')
    return pool
  } catch (error) {
    console.error('[DB] Connection failed:', error)
    throw error
  }
}

/**
 * Close the connection pool
 */
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
    console.log('[DB] Connection closed')
  }
}

/**
 * Execute a parameterized query
 */
export async function query<T = unknown>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<sql.IResult<T>> {
  const conn = await getConnection()
  const request = conn.request()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value)
    })
  }

  return request.query<T>(queryText)
}

/**
 * Execute a stored procedure
 */
export async function executeProcedure<T = unknown>(
  procedureName: string,
  params?: Record<string, unknown>
): Promise<sql.IProcedureResult<T>> {
  const conn = await getConnection()
  const request = conn.request()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value)
    })
  }

  return request.execute<T>(procedureName)
}

/**
 * Begin a transaction
 */
export async function beginTransaction(): Promise<sql.Transaction> {
  const conn = await getConnection()
  const transaction = new sql.Transaction(conn)
  await transaction.begin()
  return transaction
}

/**
 * Execute within a transaction
 */
export async function withTransaction<T>(
  callback: (transaction: sql.Transaction) => Promise<T>
): Promise<T> {
  const transaction = await beginTransaction()
  try {
    const result = await callback(transaction)
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

// SQL types for convenience
export { sql }
export type { IResult, IRecordSet } from 'mssql'
