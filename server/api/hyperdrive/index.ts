/**
 * Example Hyperdrive API Route
 *
 * Demonstrates connecting to PostgreSQL via Cloudflare Hyperdrive
 * Note: Requires a configured Hyperdrive binding and external PostgreSQL database
 */

export default defineEventHandler(async (event) => {
    const auth = useAuth(event)
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const method = event.method

    // GET - Test Hyperdrive connection
    if (method === 'GET') {
        try {
            const hyperdrive = useHyperdrive(event)

            return {
                success: true,
                data: {
                    status: 'connected',
                    host: hyperdrive.host,
                    port: hyperdrive.port,
                    database: hyperdrive.database,
                },
                message: 'Hyperdrive is configured. Use the connection string with your PostgreSQL client.',
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Hyperdrive is not configured. Uncomment the hyperdrive section in wrangler.jsonc to enable.',
            }
        }
    }

    throw createError({
        statusCode: 405,
        message: 'Method not allowed',
    })
})
