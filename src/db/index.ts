import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { PGlite } from '@electric-sql/pglite'
import pg from 'pg'
import * as schema from './schema'
import fs from 'fs'
import path from 'path'

// Global singleton for database connection in development & SSR
declare global {
  // eslint-disable-next-line no-var
  var __FRIDGE_DB_INSTANCE__: any
  // eslint-disable-next-line no-var
  var __FRIDGE_DB_INITIALIZED__: boolean | undefined
}

function createDatabaseClient() {
  const dbUrl = process.env.DATABASE_URL?.trim()
  const isPostgresUrl =
    dbUrl &&
    (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) &&
    !dbUrl.includes('username:password')

  if (isPostgresUrl) {
    try {
      const pool = new pg.Pool({ connectionString: dbUrl })
      return drizzlePg(pool, { schema })
    } catch (err) {
      console.warn('Could not connect to external PostgreSQL, falling back to embedded PGlite:', err)
    }
  }

  // Persistent storage directory for embedded PostgreSQL (PGlite)
  const dataDir = path.resolve(process.cwd(), '.data', 'pglite')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const pglite = new PGlite(dataDir)
  return drizzlePglite(pglite, { schema })
}

export const db = globalThis.__FRIDGE_DB_INSTANCE__ || createDatabaseClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__FRIDGE_DB_INSTANCE__ = db
}
