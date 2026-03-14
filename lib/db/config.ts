import sql from 'mssql'

// MSSQL Database Configuration
const config: sql.config = {
  server: process.env.MSSQL_SERVER || 'localhost',
  database: process.env.MSSQL_DATABASE || 'SGCDigital',
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || '',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true', // Set to true for Azure
    trustServerCertificate: process.env.MSSQL_TRUST_CERT !== 'false', // Set to false for production
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

// Global connection pool
let pool: sql.ConnectionPool | null = null

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (pool) {
    return pool
  }

  try {
    pool = await sql.connect(config)
    console.log('Connected to MSSQL database')
    return pool
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
    console.log('Database connection closed')
  }
}

export { sql }
