/**
 * Database utility for accessing D1 with Drizzle ORM
 *
 * Uses direct Cloudflare D1 bindings via event.context.cloudflare.env
 */
import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'
import * as schema from '../database/schema'

/**
 * Get a Drizzle database instance for the current request
 *
 * @example
 * ```ts
 * export default defineEventHandler((event) => {
 *   const db = useDatabase(event)
 *   const users = await db.select().from(schema.user).all()
 * })
 * ```
 */
export function useDatabase(event?: H3Event) {
    const d1 = useD1(event)
    return drizzle(d1, { schema })
}

/**
 * Get the raw D1 database instance
 * Use this for direct D1 API access when needed
 *
 * @example
 * ```ts
 * const db = useD1(event)
 * const result = await db.prepare('SELECT * FROM user').all()
 * ```
 */
export function useD1(event?: H3Event): D1Database {
    const env = useCloudflareEnv(event)
    if (!env.DB) {
        throw new Error('D1 database binding (DB) not found. Check your wrangler.jsonc configuration.')
    }
    return env.DB
}
