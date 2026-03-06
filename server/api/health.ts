/**
 * Health Check API Route
 *
 * Verifies all Cloudflare bindings are accessible
 */

export default defineEventHandler(async (event) => {
    const auth = useAuth(event)
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const status = {
        timestamp: new Date().toISOString(),
        bindings: {
            database: false,
            kv: false,
            r2: false,
            hyperdrive: false,
        },
        errors: [] as string[],
    }

    // Check D1 Database
    try {
        const db = useD1(event)
        await db.prepare('SELECT 1').first()
        status.bindings.database = true
    }
    catch (error) {
        status.errors.push(`D1: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Check KV
    try {
        const kv = useKV(event)
        await kv.get('__health_check__')
        status.bindings.kv = true
    }
    catch (error) {
        status.errors.push(`KV: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Check R2
    try {
        const bucket = useR2(event)
        await bucket.list({ limit: 1 })
        status.bindings.r2 = true
    }
    catch (error) {
        status.errors.push(`R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Check Hyperdrive (optional)
    try {
        const hyperdrive = useHyperdrive(event)
        if (hyperdrive.connectionString) {
            status.bindings.hyperdrive = true
        }
    }
    catch {
        // Hyperdrive is optional, don't add to errors
    }

    return {
        success: status.errors.length === 0,
        data: status,
    }
})
