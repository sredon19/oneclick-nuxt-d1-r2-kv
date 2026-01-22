/**
 * Hyperdrive utility for accessing PostgreSQL/MySQL via Cloudflare Hyperdrive
 *
 * Hyperdrive provides connection pooling for external databases
 * Uses direct Cloudflare bindings via event.context.cloudflare.env
 */
import type { H3Event } from 'h3'

/**
 * Get the Hyperdrive connection
 *
 * Hyperdrive accelerates connections to your existing PostgreSQL or MySQL databases
 * by maintaining a connection pool at the edge.
 *
 * @example
 * ```ts
 * export default defineEventHandler((event) => {
 *   const hyperdrive = useHyperdrive(event)
 *   const connectionString = hyperdrive.connectionString
 *   // Use with your preferred PostgreSQL/MySQL client
 * })
 * ```
 */
export function useHyperdrive(event?: H3Event): Hyperdrive {
    const env = useCloudflareEnv(event)
    if (!env.HYPERDRIVE) {
        throw new Error(
            'Hyperdrive binding not found. Make sure HYPERDRIVE is configured in wrangler.jsonc'
        )
    }
    return env.HYPERDRIVE
}

/**
 * Get the Hyperdrive connection string
 *
 * Use this connection string with your database client (pg, mysql2, etc.)
 *
 * @example
 * ```ts
 * import postgres from 'postgres'
 *
 * export default defineEventHandler((event) => {
 *   const connectionString = getHyperdriveConnectionString(event)
 *   const sql = postgres(connectionString)
 *   const users = await sql`SELECT * FROM users`
 * })
 * ```
 */
export function getHyperdriveConnectionString(event?: H3Event): string {
    const hyperdrive = useHyperdrive(event)
    return hyperdrive.connectionString
}
