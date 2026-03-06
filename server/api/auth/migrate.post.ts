import { getMigrations } from 'better-auth/db/migration'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../../database/schema'

export default defineEventHandler(async (event) => {
    const env = useCloudflareEnv(event)

    if (!process.dev) {
        const migrationToken = getHeader(event, 'x-migration-token')
        if (!env.BETTER_AUTH_SECRET || migrationToken !== env.BETTER_AUTH_SECRET) {
            throw createError({ statusCode: 403, message: 'Forbidden' })
        }
    }

    const db = drizzle(env.DB, { schema })

    const authConfig = {
        database: drizzleAdapter(db, { provider: 'sqlite' as const }),
    }

    const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(authConfig)

    if (toBeCreated.length === 0 && toBeAdded.length === 0) {
        return { success: true, message: 'No migrations needed' }
    }

    await runMigrations()

    return {
        success: true,
        message: 'Migrations completed',
        created: toBeCreated.map((t) => t.table),
        added: toBeAdded.map((t) => t.table),
    }
})
